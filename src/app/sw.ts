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
  const MAX_RETRIES = 3;

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      // The BackgroundSyncPlugin already handles replaying failed requests
      // from the "offline-mutations" queue. This named sync event serves as
      // an additional trigger — open the queue and replay manually.
      const cache = await caches.open("api-mutations");
      const requests = await cache.keys();

      for (const request of requests) {
        const cachedResponse = await cache.match(request);
        if (!cachedResponse) continue;

        const body = await cachedResponse.clone().text();
        const response = await fetch(request.url, {
          method: request.method,
          headers: request.headers,
          body,
        });

        if (response.ok) {
          await cache.delete(request);
        } else {
          throw new Error(`Replay failed: ${response.status}`);
        }
      }

      // Success — notify clients
      const clients = await self.clients.matchAll({ type: "window" });
      for (const client of clients) {
        client.postMessage({ type: "BACKGROUND_SYNC_COMPLETE", tag: "sync-homework" });
      }
      return;
    } catch (e) {
      if (attempt === MAX_RETRIES - 1) {
        // Final retry failed — notify user
        self.registration.showNotification("KlassHub", {
          body: "Sync fehlgeschlagen – bitte öffne die App erneut.",
          icon: "/icons/icon-192x192.png",
          data: { url: "/dashboard" },
        });
        throw e;
      }
      // Exponential backoff: 1s, 2s, 4s
      await new Promise((r) => setTimeout(r, 1000 * Math.pow(2, attempt)));
    }
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
