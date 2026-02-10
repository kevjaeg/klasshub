"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { RefreshCw, Loader2, Shield } from "lucide-react";
import { toast } from "sonner";
import { PLATFORMS } from "@/lib/platforms/registry";
import type { PlatformId } from "@/lib/platforms/types";
import { sendSyncNotifications, requestPermission } from "@/lib/notifications";

interface SyncDialogProps {
  childId: string;
  childName: string;
  platformId: PlatformId | null;
}

export function SyncDialog({ childId, childName, platformId }: SyncDialogProps) {
  const [open, setOpen] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  if (!platformId) {
    return null;
  }

  const platform = PLATFORMS[platformId];

  async function handleSync(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ childId, username, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Sync fehlgeschlagen");
        setLoading(false);
        return;
      }

      if (data.partialSuccess && data.errors?.length > 0) {
        const failed = data.errors.map((e: { category: string }) => e.category).join(", ");
        toast.warning(
          `Sync teilweise erfolgreich. Fehlgeschlagen: ${failed}. Versuche es erneut.`,
          { duration: 6000 }
        );
      } else {
        const parts: string[] = [];
        if (data.lessonsCount > 0) parts.push(`${data.lessonsCount} Stunden`);
        if (data.substitutionsCount > 0) parts.push(`${data.substitutionsCount} Vertretungen`);
        if (data.messagesCount > 0) parts.push(`${data.messagesCount} Nachrichten`);
        if (data.homeworkCount > 0) parts.push(`${data.homeworkCount} Hausaufgaben`);

        toast.success(
          parts.length > 0
            ? `Sync erfolgreich! ${parts.join(", ")} geladen.`
            : "Sync erfolgreich! Keine neuen Daten gefunden."
        );
      }

      if (data.warning) {
        toast.warning(data.warning, { duration: 5000 });
      }

      // Ask for notification permission after first successful sync
      if (typeof Notification !== "undefined" && Notification.permission === "default") {
        const permission = await requestPermission();
        if (permission === "granted") {
          toast.success("Push-Benachrichtigungen aktiviert!");
        }
      }

      // Send browser notification if there are new items
      sendSyncNotifications(
        {
          substitutions: data.oldSubstitutionsCount || 0,
          messages: data.oldMessagesCount || 0,
          homework: data.oldHomeworkCount || 0,
        },
        {
          substitutions: data.substitutionsCount || 0,
          messages: data.messagesCount || 0,
          homework: data.homeworkCount || 0,
        },
        childName
      );

      // Clear credentials from state immediately
      setUsername("");
      setPassword("");
      setOpen(false);
      router.refresh();
    } catch {
      toast.error("Verbindungsfehler. Bitte versuche es erneut.");
    }

    setLoading(false);
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button className="w-full">
          <RefreshCw className="mr-2 h-4 w-4" />
          Mit {platform.name} synchronisieren
        </Button>
      </SheetTrigger>
      <SheetContent side="bottom" className="rounded-t-xl">
        <SheetHeader>
          <SheetTitle>{platform.name} Sync – {childName}</SheetTitle>
          <SheetDescription>
            Gib deine {platform.name}-Zugangsdaten ein, um den Stundenplan zu laden.
          </SheetDescription>
        </SheetHeader>
        <form onSubmit={handleSync} className="mt-4 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="sync-username">Benutzername</Label>
            <Input
              id="sync-username"
              placeholder={`${platform.name}-Benutzername`}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              autoComplete="off"
              disabled={loading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="sync-password">Passwort</Label>
            <Input
              id="sync-password"
              type="password"
              placeholder={`${platform.name}-Passwort`}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="off"
              disabled={loading}
            />
          </div>

          <div className="flex items-start gap-2 rounded-lg bg-muted/50 p-3">
            <Shield className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
            <p className="text-xs text-muted-foreground">
              Dein Passwort wird <strong>nicht gespeichert</strong>. Es wird nur für
              diese eine Abfrage verwendet und sofort danach gelöscht.
            </p>
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Synchronisiere...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                Jetzt synchronisieren
              </>
            )}
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  );
}
