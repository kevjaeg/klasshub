"use client";

import { WifiOff } from "lucide-react";

export default function OfflinePage() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-6 px-4 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
        <WifiOff className="h-10 w-10 text-muted-foreground" />
      </div>
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold">Du bist offline</h1>
        <p className="text-muted-foreground">
          Keine Internetverbindung. Prüfe dein WLAN oder mobile Daten und
          versuche es erneut.
        </p>
      </div>
      <button
        onClick={() => window.location.reload()}
        className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90"
      >
        Erneut versuchen
      </button>
    </div>
  );
}
