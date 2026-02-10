"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { getNotificationSettings } from "@/lib/notifications";

const WATCHED_TABLES = ["homework", "messages", "substitutions", "lessons"] as const;

type RealtimePayload = {
  eventType: "INSERT" | "UPDATE" | "DELETE";
  table: string;
  new: Record<string, unknown>;
};

const TABLE_LABELS: Record<string, { setting: keyof ReturnType<typeof getNotificationSettings>; label: string; url: string }> = {
  messages: { setting: "messages", label: "Neue Nachricht", url: "/messages" },
  substitutions: { setting: "substitutions", label: "Neuer Vertretungsplan", url: "/dashboard" },
  homework: { setting: "homework", label: "Neue Hausaufgabe", url: "/homework" },
};

function notifyChange(payload: RealtimePayload) {
  if (payload.eventType !== "INSERT") return;
  if (!("Notification" in window) || Notification.permission !== "granted") return;
  if (document.visibilityState === "visible") return; // only notify when in background

  const config = TABLE_LABELS[payload.table];
  if (!config) return;

  const settings = getNotificationSettings();
  if (!settings[config.setting]) return;

  const body =
    payload.table === "messages"
      ? (payload.new.title as string) || ""
      : payload.table === "substitutions"
      ? `${payload.new.original_subject || "Fach"}: ${payload.new.type === "cancelled" ? "Entfällt" : "Vertretung"}`
      : (payload.new.subject as string) || "";

  if ("serviceWorker" in navigator && navigator.serviceWorker.controller) {
    navigator.serviceWorker.controller.postMessage({
      type: "SHOW_NOTIFICATION",
      title: `SchoolHub – ${config.label}`,
      options: {
        body,
        icon: "/icon-192.svg",
        badge: "/icon-192.svg",
        tag: `realtime-${payload.table}-${Date.now()}`,
        data: { url: config.url },
      },
    });
  }
}

/**
 * Subscribes to Supabase Realtime postgres_changes for the given child IDs.
 * On any INSERT/UPDATE/DELETE, triggers router.refresh() so server components
 * re-render with fresh data — no manual polling needed.
 * Also sends push notifications for new data when the app is in the background.
 */
export function useRealtimeRefresh(childIds: string[]) {
  const router = useRouter();

  useEffect(() => {
    if (childIds.length === 0) return;

    const supabase = createClient();
    const filter = `child_id=in.(${childIds.join(",")})`;

    const channel = supabase.channel("realtime-refresh");

    for (const table of WATCHED_TABLES) {
      channel.on(
        "postgres_changes" as never,
        { event: "*", schema: "public", table, filter },
        (payload: RealtimePayload) => {
          router.refresh();
          notifyChange({ ...payload, table });
        }
      );
    }

    channel.subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [childIds, router]);
}
