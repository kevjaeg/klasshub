"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, X } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const DISMISS_KEY = "schoolhub-install-dismissed";

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Don't show if already installed (standalone mode)
    if (window.matchMedia("(display-mode: standalone)").matches) return;

    // Don't show if user previously dismissed
    if (localStorage.getItem(DISMISS_KEY)) return;

    function handleBeforeInstall(e: Event) {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShow(true);
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);
    return () =>
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
  }, []);

  async function handleInstall() {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setShow(false);
    }
    setDeferredPrompt(null);
  }

  function handleDismiss() {
    setShow(false);
    setDeferredPrompt(null);
    localStorage.setItem(DISMISS_KEY, "1");
  }

  if (!show) return null;

  return (
    <div className="fixed bottom-16 left-0 right-0 z-50 mx-auto max-w-2xl px-4 pb-2">
      <div className="flex items-center gap-3 rounded-lg border bg-background p-3 shadow-lg">
        <Download className="h-5 w-5 shrink-0 text-primary" />
        <p className="flex-1 text-sm">
          SchoolHub als App installieren für schnelleren Zugriff.
        </p>
        <Button size="sm" onClick={handleInstall}>
          Installieren
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
