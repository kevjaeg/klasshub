"use client";

import { useState, useEffect, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { LogOut, Trash2, Shield, Palette, Sun, Moon, Monitor, Bell, BellOff } from "lucide-react";
import { toast } from "sonner";
import {
  getNotificationSettings,
  saveNotificationSettings,
  requestPermission,
  type NotificationSettings,
} from "@/lib/notifications";

const noop = () => () => {};

export default function SettingsPage() {
  const [deleting, setDeleting] = useState(false);
  const router = useRouter();
  const supabase = createClient();
  const { theme, setTheme } = useTheme();

  // Notification state
  const [notifPermission, setNotifPermission] = useState<NotificationPermission>("default");
  const [notifSettings, setNotifSettings] = useState<NotificationSettings>({
    substitutions: true,
    messages: true,
    homework: true,
  });
  const mounted = useSyncExternalStore(noop, () => true, () => false);

  useEffect(() => {
    const t = setTimeout(() => {
      if ("Notification" in window) {
        setNotifPermission(Notification.permission);
      }
      setNotifSettings(getNotificationSettings());
    }, 0);
    return () => clearTimeout(t);
  }, []);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  async function handleDeleteAccount() {
    if (!confirm("Bist du sicher? Alle deine Daten werden unwiderruflich gelöscht.")) {
      return;
    }
    if (!confirm("Wirklich? Diese Aktion kann NICHT rückgängig gemacht werden.")) {
      return;
    }

    setDeleting(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from("children").delete().eq("user_id", user.id);
    }

    await supabase.auth.signOut();
    toast.success("Dein Konto und alle Daten wurden gelöscht.");
    router.push("/");
    router.refresh();
  }

  async function handleEnableNotifications() {
    const result = await requestPermission();
    setNotifPermission(result);
    if (result === "granted") {
      toast.success("Benachrichtigungen aktiviert!");
    } else if (result === "denied") {
      toast.error("Benachrichtigungen wurden blockiert. Ändere dies in den Browser-Einstellungen.");
    }
  }

  function handleNotifToggle(key: keyof NotificationSettings) {
    const updated = { ...notifSettings, [key]: !notifSettings[key] };
    setNotifSettings(updated);
    saveNotificationSettings(updated);
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Einstellungen</h1>

      {/* Dark Mode Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Darstellung
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            {mounted && (
              <>
                <Button
                  variant={theme === "light" ? "default" : "outline"}
                  className="flex-1"
                  onClick={() => setTheme("light")}
                >
                  <Sun className="mr-2 h-4 w-4" />
                  Hell
                </Button>
                <Button
                  variant={theme === "dark" ? "default" : "outline"}
                  className="flex-1"
                  onClick={() => setTheme("dark")}
                >
                  <Moon className="mr-2 h-4 w-4" />
                  Dunkel
                </Button>
                <Button
                  variant={theme === "system" ? "default" : "outline"}
                  className="flex-1"
                  onClick={() => setTheme("system")}
                >
                  <Monitor className="mr-2 h-4 w-4" />
                  System
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Notification Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Benachrichtigungen
          </CardTitle>
          <CardDescription>
            {notifPermission === "granted" && "Benachrichtigungen sind aktiv."}
            {notifPermission === "denied" && "Benachrichtigungen wurden im Browser blockiert."}
            {notifPermission === "default" && "Benachrichtigungen sind noch nicht aktiviert."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {notifPermission !== "granted" ? (
            <Button
              className="w-full"
              onClick={handleEnableNotifications}
              disabled={notifPermission === "denied"}
            >
              {notifPermission === "denied" ? (
                <>
                  <BellOff className="mr-2 h-4 w-4" />
                  Im Browser blockiert
                </>
              ) : (
                <>
                  <Bell className="mr-2 h-4 w-4" />
                  Benachrichtigungen aktivieren
                </>
              )}
            </Button>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Nach dem Sync wirst du benachrichtigt bei:
              </p>
              {([
                { key: "substitutions" as const, label: "Vertretungen" },
                { key: "messages" as const, label: "Nachrichten" },
                { key: "homework" as const, label: "Hausaufgaben" },
              ]).map(({ key, label }) => (
                <label key={key} className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notifSettings[key]}
                    onChange={() => handleNotifToggle(key)}
                    className="h-4 w-4 rounded border-gray-300"
                  />
                  <span className="text-sm">{label}</span>
                </label>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Datenschutz
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <p>
            KlassHub speichert deine Daten DSGVO-konform in der EU.
            Passwörter für Schul-Plattformen werden <strong>nie</strong> gespeichert.
          </p>
          <p>
            Bei jedem Sync gibst du deine Zugangsdaten ein, sie werden nur
            für die Dauer der Abfrage verwendet und sofort verworfen.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Konto</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button variant="outline" className="w-full" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            Abmelden
          </Button>

          <Separator />

          <CardDescription>
            Wenn du dein Konto löschst, werden alle Daten (Kinder, Stundenpläne,
            Vertretungen) unwiderruflich gelöscht.
          </CardDescription>

          <Button
            variant="destructive"
            className="w-full"
            onClick={handleDeleteAccount}
            disabled={deleting}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Konto und alle Daten löschen
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
