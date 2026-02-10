"use client";

import { useEffect, useSyncExternalStore } from "react";

function subscribe(callback: () => void) {
  window.addEventListener("online", callback);
  window.addEventListener("offline", callback);
  return () => {
    window.removeEventListener("online", callback);
    window.removeEventListener("offline", callback);
  };
}

function getSnapshot() {
  return navigator.onLine;
}

function getServerSnapshot() {
  return true;
}

export function useOfflineStatus() {
  const isOnline = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  // When coming back online, notify user of queued mutations being replayed
  useEffect(() => {
    if (isOnline) {
      // Background sync will automatically replay queued requests
      // The SW BackgroundSyncPlugin handles this
    }
  }, [isOnline]);

  return { isOnline, isOffline: !isOnline };
}
