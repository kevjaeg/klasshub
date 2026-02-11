"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GraduationCap, Loader2, CheckCircle } from "lucide-react";
import { ForceLightMode } from "@/components/force-light-mode";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [dsgvoConsent, setDsgvoConsent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!dsgvoConsent) {
      setError("Bitte stimme der Datenschutzerklärung zu.");
      setLoading(false);
      return;
    }

    if (password.length < 8) {
      setError("Das Passwort muss mindestens 8 Zeichen lang sein.");
      setLoading(false);
      return;
    }

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: name,
        },
      },
    });

    if (error) {
      setError("Registrierung fehlgeschlagen. Bitte versuche es erneut.");
      setLoading(false);
      return;
    }

    // Sign out immediately so the middleware doesn't redirect to /dashboard
    // before the user can see the "confirm your email" message.
    await supabase.auth.signOut();

    setSuccess(true);
    setLoading(false);
  }

  if (success) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-muted/40 px-4">
        <ForceLightMode />
        <Card className="w-full max-w-sm">
          <CardHeader className="text-center">
            <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-xl bg-green-100">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <CardTitle className="text-xl">Fast geschafft!</CardTitle>
            <CardDescription>
              Wir haben dir eine Bestätigungs-E-Mail an <strong>{email}</strong> geschickt.
              Klicke auf den Link in der E-Mail, um dein Konto zu aktivieren.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/login">
              <Button variant="outline" className="w-full">
                Zurück zum Login
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-dvh items-center justify-center bg-muted/40 px-4">
      <ForceLightMode />
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-xl bg-primary">
            <GraduationCap className="h-6 w-6 text-primary-foreground" />
          </div>
          <CardTitle className="text-2xl">Konto erstellen</CardTitle>
          <CardDescription>
            Registriere dich kostenlos bei KlassHub.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleRegister} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Dein Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="Anna Müller"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                autoComplete="name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">E-Mail</Label>
              <Input
                id="email"
                type="email"
                placeholder="eltern@beispiel.de"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Passwort</Label>
              <Input
                id="password"
                type="password"
                placeholder="Mindestens 8 Zeichen"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                autoComplete="new-password"
              />
            </div>

            <div className="flex items-start gap-2">
              <input
                id="dsgvo"
                type="checkbox"
                checked={dsgvoConsent}
                onChange={(e) => setDsgvoConsent(e.target.checked)}
                className="mt-1 h-4 w-4 rounded border-input"
                required
              />
              <Label htmlFor="dsgvo" className="text-xs leading-relaxed text-muted-foreground">
                Ich stimme der{" "}
                <Link href="/datenschutz" className="text-primary underline-offset-4 hover:underline">
                  Datenschutzerklärung
                </Link>{" "}
                zu. Meine Daten werden DSGVO-konform in der EU gespeichert.
              </Label>
            </div>

            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Kostenlos registrieren"
              )}
            </Button>
          </form>

          <div className="mt-4 text-center text-sm text-muted-foreground">
            Bereits ein Konto?{" "}
            <Link href="/login" className="text-primary underline-offset-4 hover:underline">
              Anmelden
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
