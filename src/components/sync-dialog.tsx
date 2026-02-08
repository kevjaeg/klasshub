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

interface SyncDialogProps {
  childId: string;
  childName: string;
  hasWebUntis: boolean;
}

export function SyncDialog({ childId, childName, hasWebUntis }: SyncDialogProps) {
  const [open, setOpen] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

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

      toast.success(
        `Sync erfolgreich! ${data.lessonsCount} Stunden und ${data.substitutionsCount} Vertretungen geladen.`
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

  if (!hasWebUntis) {
    return null;
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button className="w-full">
          <RefreshCw className="mr-2 h-4 w-4" />
          Mit WebUntis synchronisieren
        </Button>
      </SheetTrigger>
      <SheetContent side="bottom" className="rounded-t-xl">
        <SheetHeader>
          <SheetTitle>WebUntis Sync – {childName}</SheetTitle>
          <SheetDescription>
            Gib die WebUntis-Zugangsdaten ein, um den Stundenplan zu laden.
          </SheetDescription>
        </SheetHeader>
        <form onSubmit={handleSync} className="mt-4 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="wu-username">Benutzername</Label>
            <Input
              id="wu-username"
              placeholder="WebUntis-Benutzername"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              autoComplete="off"
              disabled={loading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="wu-password">Passwort</Label>
            <Input
              id="wu-password"
              type="password"
              placeholder="WebUntis-Passwort"
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
