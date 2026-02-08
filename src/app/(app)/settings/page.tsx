"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { LogOut, Trash2, Shield } from "lucide-react";
import { toast } from "sonner";

export default function SettingsPage() {
  const [deleting, setDeleting] = useState(false);
  const router = useRouter();
  const supabase = createClient();

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

    // Delete all children (cascades to lessons + substitutions via DB)
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from("children").delete().eq("user_id", user.id);
    }

    // Sign out
    await supabase.auth.signOut();
    toast.success("Dein Konto und alle Daten wurden gelöscht.");
    router.push("/");
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Einstellungen</h1>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Datenschutz
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <p>
            SchoolHub speichert deine Daten DSGVO-konform in der EU.
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
