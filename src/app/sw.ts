import { defaultCache } from "@serwist/next/worker";
import type { PrecacheEntry, SerwistGlobalConfig } from "serwist";
import {
  Serwist,
  NetworkFirst,
  CacheFirst,
  StaleWhileRevalidate,
  BackgroundSyncPlugin,
  ExpirationPlugin,
} from "serwist";

declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

// Background Sync API types (not yet in lib.webworker)
interface SyncEvent extends ExtendableEvent {
  readonly tag: string;
}

interface SyncManager {
  register(tag: string): Promise<void>;
}

declare const self: ServiceWorkerGlobalScope & WorkerGlobalScope;

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: [
    // Supabase GET queries – StaleWhileRevalidate: show cache instantly, update in background
    {
      matcher: ({ url, request }) =>
        url.pathname.startsWith("/rest/v1/") && request.method === "GET",
      handler: new StaleWhileRevalidate({
        cacheName: "supabase-api",
        plugins: [
          new ExpirationPlugin({
            maxEntries: 64,
            maxAgeSeconds: 24 * 60 * 60, // 24 hours
          }),
        ],
      }),
    },
    // Supabase mutations (POST/PATCH/DELETE) – NetworkFirst, no caching needed
    {
      matcher: ({ url, request }) =>
        url.pathname.startsWith("/rest/v1/") && request.method !== "GET",
      handler: new NetworkFirst({
        cacheName: "supabase-mutations",
        networkTimeoutSeconds: 10,
      }),
    },
    // API mutations (homework toggle, etc.) – NetworkFirst with background sync for offline
    {
      matcher: ({ url, request }) =>
        url.pathname.startsWith("/api/") &&
        request.method === "POST" &&
        !url.pathname.startsWith("/api/sync"),
      handler: new NetworkFirst({
        cacheName: "api-mutations",
        plugins: [
          new BackgroundSyncPlugin("offline-mutations", {
            maxRetentionTime: 60 * 24, // retry for up to 24 hours (in minutes)
          }),
        ],
      }),
    },
    // Sync API – NetworkFirst, no background sync (requires fresh credentials)
    {
      matcher: ({ url }) => url.pathname.startsWith("/api/sync"),
      handler: new NetworkFirst({
        cacheName: "api-sync",
        networkTimeoutSeconds: 30,
      }),
    },
    // Static assets (fonts, icons) – CacheFirst with 30 days
    {
      matcher: ({ request, url }) =>
        request.destination === "font" ||
        request.destination === "image" ||
        url.pathname.match(/\.(woff2?|ttf|otf|ico|svg|png|jpg|webp)$/) !== null,
      handler: new CacheFirst({
        cacheName: "static-assets",
        plugins: [
          new ExpirationPlugin({
            maxEntries: 128,
            maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
          }),
        ],
      }),
    },
    // Page navigation – StaleWhileRevalidate: instant load, background update
    {
      matcher: ({ request }) => request.mode === "navigate",
      handler: new StaleWhileRevalidate({
        cacheName: "pages",
        plugins: [
          new ExpirationPlugin({
            maxEntries: 32,
            maxAgeSeconds: 24 * 60 * 60,
          }),
        ],
      }),
    },
    // Keep remaining default cache rules
    ...defaultCache,
  ],
  fallbacks: {
    entries: [
      {
        url: "/offline",
        matcher: ({ request }) => request.mode === "navigate",
      },
    ],
  },
});

serwist.addEventListeners();

// Background Sync: replay queued homework mutations when back online
self.addEventListener("sync", (event: SyncEvent) => {
  if (event.tag === "sync-homework") {
    event.waitUntil(replayPendingHomeworkChanges());
  }
});

async function replayPendingHomeworkChanges() {
  // The BackgroundSyncPlugin already handles replaying failed requests
  // from the "offline-mutations" queue. This named sync event serves as
  // an additional trigger for any client-registered sync requests.
  // Notify all clients that sync is happening
  const clients = await self.clients.matchAll({ type: "window" });
  for (const client of clients) {
    client.postMessage({ type: "BACKGROUND_SYNC_COMPLETE", tag: "sync-homework" });
  }
}

// Handle notification show requests from the client
self.addEventListener("message", (event) => {
  if (event.data?.type === "SHOW_NOTIFICATION") {
    const { title, options } = event.data;
    self.registration.showNotification(title, options);
  }
});

// Handle notification clicks – open the app on the relevant page
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const url = event.notification.data?.url || "/dashboard";

  event.waitUntil(
    self.clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        // Focus existing window if available
        for (const client of clientList) {
          if ("focus" in client) {
            client.focus();
            client.navigate(url);
            return;
          }
        }
        // Otherwise open new window
        return self.clients.openWindow(url);
      })
  );
});
