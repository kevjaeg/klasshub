"use client";

import { useRealtimeRefresh } from "@/hooks/use-realtime-refresh";
import { useNotificationScheduler } from "@/hooks/use-notification-scheduler";

export function RealtimeProvider({ childIds }: { childIds: string[] }) {
  useRealtimeRefresh(childIds);
  useNotificationScheduler(childIds);
  return null;
}
