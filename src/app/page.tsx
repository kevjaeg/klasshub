import Link from "next/link";
import { Button } from "@/components/ui/button";
import { GraduationCap, Shield, Smartphone, Zap, Clock, Users, ArrowRight } from "lucide-react";
import { ScreenshotCarousel } from "@/components/screenshot-carousel";

export default function LandingPage() {
  return (
    <div className="flex min-h-dvh flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto flex h-14 max-w-3xl items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <GraduationCap className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="text-lg font-semibold">SchoolHub</span>
          </div>
          <div className="flex gap-2">
            <Link href="/login">
              <Button variant="ghost" size="sm">Anmelden</Button>
            </Link>
            <Link href="/register">
              <Button size="sm">Registrieren</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <main className="flex-1">
        <section className="px-4 py-16 sm:py-20">
          <div className="mx-auto flex max-w-[800px] flex-col items-center gap-10 lg:flex-row lg:items-center lg:gap-12">
            {/* Text */}
            <div className="flex-1 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 rounded-full border bg-muted/50 px-3 py-1 text-xs text-muted-foreground">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-green-500" />
                Kostenlos in der Beta
              </div>
              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
                Alle Schul-Apps.{" "}
                <span className="text-primary">Ein Dashboard.</span>
              </h1>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Stundenplan, Vertretungen und Ausfälle deiner Kinder – zentral an einem Ort.
                Nie wieder zwischen fünf Apps wechseln.
              </p>
              <div className="flex flex-col gap-3 sm:flex-row sm:justify-center lg:justify-start">
                <Link href="/register">
                  <Button size="lg" className="w-full sm:w-auto gap-2">
                    Kostenlos starten
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
              <p className="text-xs text-muted-foreground">
                Keine Kreditkarte nötig. DSGVO-konform. Daten in der EU.
              </p>
            </div>
            {/* Screenshot Carousel */}
            <div className="w-full lg:w-auto">
              <ScreenshotCarousel />
            </div>
          </div>
        </section>

        {/* Problem / Solution */}
        <section className="border-t bg-muted/30 px-4 py-16">
          <div className="mx-auto max-w-2xl text-center space-y-4">
            <h2 className="text-2xl font-bold">Das Chaos hat ein Ende</h2>
            <p className="text-muted-foreground">
              WebUntis, Schulmanager, IServ, Moodle, Sdui – Eltern jonglieren
              mit bis zu 6 verschiedenen Apps pro Kind. Wer mehrere Kinder hat,
              verliert den Überblick. SchoolHub bringt alles zusammen.
            </p>
          </div>
        </section>

        {/* Features */}
        <section className="px-4 py-16">
          <div className="mx-auto max-w-2xl">
            <h2 className="mb-8 text-center text-2xl font-bold">Was SchoolHub kann</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="flex gap-3 rounded-xl border p-5">
                <Zap className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                <div>
                  <h3 className="font-semibold text-sm">Tagesübersicht</h3>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Sieh auf einen Blick, was heute und morgen ansteht. Ausfälle sofort erkennen.
                  </p>
                </div>
              </div>
              <div className="flex gap-3 rounded-xl border p-5">
                <Clock className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                <div>
                  <h3 className="font-semibold text-sm">Vertretungen live</h3>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Ausfälle rot, Vertretungen orange – farbcodiert und sofort erkennbar.
                  </p>
                </div>
              </div>
              <div className="flex gap-3 rounded-xl border p-5">
                <Users className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                <div>
                  <h3 className="font-semibold text-sm">Mehrere Kinder</h3>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Alle Kinder in einem Dashboard. Egal welche Schule, egal welche Klasse.
                  </p>
                </div>
              </div>
              <div className="flex gap-3 rounded-xl border p-5">
                <Shield className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                <div>
                  <h3 className="font-semibold text-sm">DSGVO von Tag 1</h3>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Passwörter werden nie gespeichert. Daten in der EU. Konto jederzeit löschbar.
                  </p>
                </div>
              </div>
              <div className="flex gap-3 rounded-xl border p-5 sm:col-span-2">
                <Smartphone className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                <div>
                  <h3 className="font-semibold text-sm">Installierbar wie eine App</h3>
                  <p className="mt-1 text-xs text-muted-foreground">
                    SchoolHub ist eine Progressive Web App. Installiere sie auf dem Homescreen
                    deines Handys – fühlt sich an wie eine native App, ohne App Store.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="border-t bg-muted/30 px-4 py-16">
          <div className="mx-auto max-w-lg text-center space-y-4">
            <h2 className="text-2xl font-bold">Bereit?</h2>
            <p className="text-muted-foreground">
              Erstelle dein Konto in 30 Sekunden. Füge dein Kind hinzu.
              Lade den Stundenplan – fertig.
            </p>
            <Link href="/register">
              <Button size="lg" className="gap-2">
                Jetzt kostenlos starten
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t px-4 py-6">
        <div className="mx-auto flex max-w-3xl flex-col items-center gap-3 sm:flex-row sm:justify-between">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <GraduationCap className="h-4 w-4" />
            SchoolHub
          </div>
          <div className="flex gap-4 text-sm text-muted-foreground">
            <Link href="/datenschutz" className="hover:text-foreground hover:underline">
              Datenschutz
            </Link>
            <Link href="/impressum" className="hover:text-foreground hover:underline">
              Impressum
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
