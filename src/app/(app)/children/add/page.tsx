"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

export default function AddChildPage() {
  const [name, setName] = useState("");
  const [schoolName, setSchoolName] = useState("");
  const [className, setClassName] = useState("");
  const [webuntisSchool, setWebuntisSchool] = useState("");
  const [webuntisServer, setWebuntisServer] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error("Du bist nicht angemeldet.");
      setLoading(false);
      return;
    }

    const { data, error } = await supabase.from("children").insert({
      user_id: user.id,
      name,
      school_name: schoolName,
      class_name: className || null,
      webuntis_school: webuntisSchool || null,
      webuntis_server: webuntisServer || null,
    }).select().single();

    if (error) {
      toast.error("Kind konnte nicht hinzugefügt werden.");
      setLoading(false);
      return;
    }

    toast.success(`${name} wurde hinzugefügt!`);
    // Navigate to child detail page so user can sync or load demo data
    router.push(`/children/${data.id}`);
    router.refresh();
  }

  return (
    <div className="space-y-4">
      <Link
        href="/children"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Zurück
      </Link>

      <Card>
        <CardHeader>
          <CardTitle>Kind hinzufügen</CardTitle>
          <CardDescription>
            Gib die Daten deines Kindes ein. Die WebUntis-Verbindung ist optional
            und kann später eingerichtet werden.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name des Kindes *</Label>
              <Input
                id="name"
                placeholder="z.B. Lena"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="school">Schule *</Label>
              <Input
                id="school"
                placeholder="z.B. Gymnasium Musterstadt"
                value={schoolName}
                onChange={(e) => setSchoolName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="class">Klasse</Label>
              <Input
                id="class"
                placeholder="z.B. 7b"
                value={className}
                onChange={(e) => setClassName(e.target.value)}
              />
            </div>

            <div className="rounded-lg border bg-muted/50 p-4 space-y-4">
              <div>
                <h3 className="text-sm font-medium">WebUntis-Verbindung</h3>
                <p className="text-xs text-muted-foreground">
                  Optional. Für den automatischen Stundenplan-Import.
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="webuntis-server">WebUntis Server</Label>
                <Input
                  id="webuntis-server"
                  placeholder="z.B. neilo.webuntis.com"
                  value={webuntisServer}
                  onChange={(e) => setWebuntisServer(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="webuntis-school">Schulkürzel</Label>
                <Input
                  id="webuntis-school"
                  placeholder="z.B. gym-musterstadt"
                  value={webuntisSchool}
                  onChange={(e) => setWebuntisSchool(e.target.value)}
                />
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Kind hinzufügen"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
