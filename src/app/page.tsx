import Link from "next/link";
import { Button } from "@/components/ui/button";
import { GraduationCap, Shield, Smartphone, Zap, Clock, Users, ArrowRight, Check, Quote } from "lucide-react";
import { ScreenshotCarousel } from "@/components/screenshot-carousel";
import { StickyCTABar } from "@/components/sticky-cta-bar";
import { TrackedLink } from "@/components/tracked-link";
import { ForceLightMode } from "@/components/force-light-mode";

export default function LandingPage() {
  return (
    <div className="flex min-h-dvh flex-col">
      <ForceLightMode />
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
                <TrackedLink href="/register" event="cta_click" props={{ location: "hero" }}>
                  <Button size="lg" className="w-full sm:w-auto gap-2 text-base">
                    Jetzt kostenlos starten
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </TrackedLink>
                <Link href="/demo">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto gap-2 text-base">
                    Demo ansehen
                  </Button>
                </Link>
              </div>
              <p className="text-xs text-muted-foreground">
                Einrichtung in unter 2 Minuten &middot; Keine Kreditkarte nötig
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

        {/* Supported Platforms */}
        <section className="px-4 py-16">
          <div className="mx-auto max-w-2xl space-y-8">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold">Unterstützte Plattformen</h2>
              <p className="text-muted-foreground">
                SchoolHub verbindet sich mit den gängigsten Schulplattformen.
              </p>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {[
                { name: "WebUntis", status: "live" as const, color: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400" },
                { name: "Schulmanager", status: "beta" as const, color: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" },
                { name: "IServ", status: "beta" as const, color: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400" },
                { name: "Moodle", status: "beta" as const, color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400" },
                { name: "Sdui", status: "beta" as const, color: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400" },
                { name: "DieSchulApp", status: "soon" as const, color: "bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-400" },
              ].map((platform) => (
                <div
                  key={platform.name}
                  className={`relative flex flex-col items-center gap-2 rounded-xl border p-5 text-center ${
                    platform.status === "soon" ? "opacity-60" : ""
                  }`}
                >
                  <div className={`flex h-10 w-10 items-center justify-center rounded-lg text-sm font-bold ${platform.color}`}>
                    {platform.name.slice(0, 2).toUpperCase()}
                  </div>
                  <span className="text-sm font-medium">{platform.name}</span>
                  {platform.status === "live" ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-medium text-green-700 dark:bg-green-900/30 dark:text-green-400">
                      <Check className="h-2.5 w-2.5" />
                      Verfügbar
                    </span>
                  ) : platform.status === "beta" ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                      <Check className="h-2.5 w-2.5" />
                      Beta
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                      Coming Soon
                    </span>
                  )}
                </div>
              ))}
            </div>
            <p className="text-sm text-muted-foreground">
              Deine Schule nutzt eine andere App?{" "}
              <a href="mailto:kontakt@schoolhub.app" className="text-primary hover:underline">
                Schreib uns
              </a>{" "}
              – wir bauen sie ein!
            </p>
          </div>
        </section>

        {/* Features */}
        <section className="border-t bg-muted/30 px-4 py-16">
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

        {/* Testimonials */}
        <section className="px-4 py-16">
          <div className="mx-auto max-w-2xl space-y-8">
            <h2 className="text-center text-2xl font-bold">Was Eltern sagen</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {[
                { quote: "Endlich kann ich alles auf einen Blick sehen statt in 4 Apps rumzuklicken.", name: "Sarah M.", detail: "Mutter von 2 Kindern" },
                { quote: "Die Vertretungsplan-Benachrichtigungen haben mir schon mehrmals den Morgen gerettet.", name: "Thomas K.", detail: "Vater, München" },
                { quote: "Hätte ich das vor einem Jahr gehabt... so viel Stress hätte ich mir sparen können.", name: "Lisa B.", detail: "Mutter von 3 Kindern" },
              ].map((t) => (
                <div key={t.name} className="rounded-xl border bg-background p-5 shadow-sm space-y-3">
                  <Quote className="h-5 w-5 text-primary/30" />
                  <p className="text-sm leading-relaxed">{t.quote}</p>
                  <div className="flex items-center gap-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                      {t.name[0]}
                    </div>
                    <div>
                      <p className="text-xs font-medium">{t.name}</p>
                      <p className="text-[10px] text-muted-foreground">{t.detail}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section className="border-t bg-muted/30 px-4 py-16">
          <div className="mx-auto max-w-2xl space-y-8">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold">Einfache Preise</h2>
              <p className="text-muted-foreground">
                Jetzt kostenlos starten. Später fair bezahlen.
              </p>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {/* Beta */}
              <div className="relative rounded-xl border-2 border-primary p-5 space-y-3 shadow-sm">
                <div className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-[10px] font-semibold text-primary uppercase tracking-wide">
                  Aktuell
                </div>
                <div>
                  <span className="text-3xl font-bold">0 &euro;</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  3 Monate komplett kostenlos. Alle Features, keine Limits.
                </p>
                <ul className="space-y-1.5 text-xs">
                  <li className="flex items-center gap-1.5"><Check className="h-3 w-3 text-primary shrink-0" />Alle Plattformen</li>
                  <li className="flex items-center gap-1.5"><Check className="h-3 w-3 text-primary shrink-0" />Unbegrenzt Kinder</li>
                  <li className="flex items-center gap-1.5"><Check className="h-3 w-3 text-primary shrink-0" />Push-Benachrichtigungen</li>
                  <li className="flex items-center gap-1.5"><Check className="h-3 w-3 text-primary shrink-0" />Offline-Modus</li>
                </ul>
                <TrackedLink href="/register" event="cta_click" props={{ location: "pricing_beta" }}>
                  <Button className="w-full" size="sm">
                    Kostenlos starten
                  </Button>
                </TrackedLink>
              </div>

              {/* Early Bird */}
              <div className="relative rounded-xl border p-5 space-y-3">
                <div className="inline-flex items-center gap-1 rounded-full bg-orange-100 px-2.5 py-0.5 text-[10px] font-semibold text-orange-700 uppercase tracking-wide">
                  Early Bird &ndash; 35% g&uuml;nstiger
                </div>
                <div>
                  <span className="text-3xl font-bold">39 &euro;</span>
                  <span className="text-sm text-muted-foreground"> / Jahr</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Nur <span className="font-medium text-foreground">3,25 &euro;/Monat</span>. Sicherst du dir jetzt, gilt der Preis f&uuml;r immer.
                </p>
                <div className="text-[10px] text-muted-foreground line-through">
                  Normalpreis: 59,88 &euro;/Jahr
                </div>
              </div>

              {/* Regular */}
              <div className="relative rounded-xl border p-5 space-y-3">
                <div className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-0.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">
                  Sp&auml;ter
                </div>
                <div>
                  <span className="text-3xl font-bold">4,99 &euro;</span>
                  <span className="text-sm text-muted-foreground"> / Monat</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Oder <span className="font-medium text-foreground">49 &euro;/Jahr</span> &ndash; 2 Monate geschenkt.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="border-t bg-primary px-4 py-16 text-primary-foreground">
          <div className="mx-auto max-w-lg text-center space-y-4">
            <h2 className="text-2xl font-bold">Bereit für weniger Stress?</h2>
            <TrackedLink href="/register" event="cta_click" props={{ location: "footer_cta" }}>
              <Button size="lg" variant="secondary" className="gap-2 text-base font-semibold">
                Jetzt Beta-Zugang sichern
                <ArrowRight className="h-4 w-4" />
              </Button>
            </TrackedLink>
            <p className="text-xs text-primary-foreground/60">
              Noch 47 Plätze verfügbar
            </p>
          </div>
        </section>
      </main>

      <StickyCTABar />

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
