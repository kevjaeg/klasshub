"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Bell, X } from "lucide-react";

const DISMISS_KEY = "klasshub-notification-dismissed";

export function NotificationPrompt() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!("Notification" in window)) return;
    if (Notification.permission !== "default") return;
    if (localStorage.getItem(DISMISS_KEY)) return;

    // Delay showing to avoid overwhelming user on first load
    const timer = setTimeout(() => setShow(true), 3000);
    return () => clearTimeout(timer);
  }, []);

  async function handleActivate() {
    const result = await Notification.requestPermission();
    if (result === "granted" || result === "denied") {
      setShow(false);
    }
  }

  function handleDismiss() {
    setShow(false);
    localStorage.setItem(DISMISS_KEY, "1");
  }

  if (!show) return null;

  return (
    <div className="fixed bottom-16 left-0 right-0 z-50 mx-auto max-w-2xl px-4 pb-2">
      <div className="flex items-center gap-3 rounded-lg border bg-background p-3 shadow-lg">
        <Bell className="h-5 w-5 shrink-0 text-primary" />
        <p className="flex-1 text-sm">
          Benachrichtigungen aktivieren für Vertretungen & Nachrichten?
        </p>
        <Button size="sm" onClick={handleActivate}>
          Aktivieren
        </Button>
        <button
          onClick={handleDismiss}
          className="shrink-0 text-muted-foreground hover:text-foreground"
          aria-label="Schließen"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
