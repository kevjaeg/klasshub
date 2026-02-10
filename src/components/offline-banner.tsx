"use client";

import { useOfflineStatus } from "@/hooks/use-offline-status";
import { useEffect, useState } from "react";
import { WifiOff, Wifi } from "lucide-react";

export function OfflineBanner() {
  const { isOnline, isOffline } = useOfflineStatus();
  const [lastOnlineAt, setLastOnlineAt] = useState<Date | null>(null);
  const [showReconnected, setShowReconnected] = useState(false);

  // Track when we go offline
  useEffect(() => {
    if (isOffline) {
      setLastOnlineAt(new Date());
      setShowReconnected(false);
    }
  }, [isOffline]);

  // Show brief "reconnected" message when coming back online
  useEffect(() => {
    if (isOnline && lastOnlineAt) {
      setShowReconnected(true);
      const timer = setTimeout(() => {
        setShowReconnected(false);
        setLastOnlineAt(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isOnline, lastOnlineAt]);

  if (isOnline && !showReconnected) {
    return null;
  }

  if (showReconnected) {
    return (
      <div className="sticky top-12 z-40 border-b bg-green-50 text-green-800 dark:bg-green-950/30 dark:text-green-400 px-4 py-2 text-center text-sm flex items-center justify-center gap-2 animate-in slide-in-from-top duration-300">
        <Wifi className="h-4 w-4" />
        <span>Wieder online – Änderungen werden synchronisiert</span>
      </div>
    );
  }

  const timeStr = lastOnlineAt
    ? lastOnlineAt.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" })
    : null;

  return (
    <div className="sticky top-12 z-40 border-b bg-amber-50 text-amber-800 dark:bg-amber-950/30 dark:text-amber-400 px-4 py-2 text-center text-sm flex items-center justify-center gap-2">
      <WifiOff className="h-4 w-4 shrink-0" />
      <span>
        Offline-Modus{timeStr ? ` – Daten von ${timeStr} Uhr` : ""}
        {" · "}Änderungen werden synchronisiert sobald du online bist
      </span>
    </div>
  );
}
