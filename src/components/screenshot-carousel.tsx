"use client";

import { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight, AlertCircle, Check, Shield, Lock, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

// ─── Mockup Slides ───────────────────────────────────────────────

function HomeworkMockup() {
  return (
    <div className="flex flex-col h-full bg-background text-foreground text-xs">
      {/* Status bar */}
      <div className="flex items-center justify-between px-3 py-1.5 text-[10px] text-muted-foreground">
        <span>9:41</span>
        <div className="flex gap-1">
          <div className="h-2 w-3 rounded-sm bg-muted-foreground/40" />
          <div className="h-2 w-2 rounded-full bg-muted-foreground/40" />
        </div>
      </div>
      {/* Header */}
      <div className="px-3 pb-2">
        <p className="font-bold text-sm">Hausaufgaben</p>
      </div>
      {/* Child tabs */}
      <div className="flex gap-1 px-3 pb-2">
        <span className="rounded-full bg-primary px-2.5 py-0.5 text-[10px] font-medium text-primary-foreground">Kevin</span>
        <span className="rounded-full bg-muted px-2.5 py-0.5 text-[10px] font-medium text-muted-foreground">Sabrina</span>
      </div>
      {/* Items */}
      <div className="flex-1 space-y-1.5 px-3 overflow-hidden">
        <p className="text-[10px] font-medium text-red-600">Ueberfaellig (1)</p>
        <div className="rounded-lg border border-red-200 bg-red-50 p-2">
          <div className="flex items-center gap-1.5">
            <div className="flex h-3.5 w-3.5 items-center justify-center rounded border border-muted-foreground/30" />
            <span className="font-medium">Mathe</span>
            <span className="rounded-full bg-red-100 px-1.5 py-0 text-[8px] font-medium text-red-700 flex items-center gap-0.5">
              <AlertCircle className="h-2 w-2" />
              Ueberfaellig
            </span>
          </div>
          <p className="text-[10px] text-muted-foreground mt-0.5 pl-5">S. 142 Nr. 3-7</p>
        </div>

        <p className="text-[10px] font-medium text-orange-600">Heute (2)</p>
        <div className="rounded-lg border border-orange-200 bg-orange-50 p-2">
          <div className="flex items-center gap-1.5">
            <div className="flex h-3.5 w-3.5 items-center justify-center rounded border border-muted-foreground/30" />
            <span className="font-medium">Deutsch</span>
            <span className="rounded-full bg-orange-100 px-1.5 py-0 text-[8px] font-medium text-orange-700">Heute faellig</span>
          </div>
          <p className="text-[10px] text-muted-foreground mt-0.5 pl-5">Aufsatz &ldquo;Mein Wochenende&rdquo;</p>
        </div>
        <div className="rounded-lg border border-orange-200 bg-orange-50 p-2">
          <div className="flex items-center gap-1.5">
            <div className="flex h-3.5 w-3.5 items-center justify-center rounded border border-muted-foreground/30" />
            <span className="font-medium">Englisch</span>
            <span className="rounded-full bg-orange-100 px-1.5 py-0 text-[8px] font-medium text-orange-700">Heute faellig</span>
          </div>
          <p className="text-[10px] text-muted-foreground mt-0.5 pl-5">Vokabeln Unit 5</p>
        </div>

        <p className="text-[10px] font-medium text-green-600">Erledigt (1)</p>
        <div className="rounded-lg border p-2 opacity-60">
          <div className="flex items-center gap-1.5">
            <div className="flex h-3.5 w-3.5 items-center justify-center rounded bg-primary border-primary">
              <Check className="h-2.5 w-2.5 text-primary-foreground" />
            </div>
            <span className="font-medium text-muted-foreground line-through">Biologie</span>
          </div>
          <p className="text-[10px] text-muted-foreground/60 mt-0.5 pl-5 line-through">Blatt Fotosynthese</p>
        </div>
      </div>
    </div>
  );
}

function MessagesMockup() {
  return (
    <div className="flex flex-col h-full bg-background text-foreground text-xs">
      <div className="flex items-center justify-between px-3 py-1.5 text-[10px] text-muted-foreground">
        <span>9:41</span>
        <div className="flex gap-1">
          <div className="h-2 w-3 rounded-sm bg-muted-foreground/40" />
          <div className="h-2 w-2 rounded-full bg-muted-foreground/40" />
        </div>
      </div>
      <div className="px-3 pb-2">
        <p className="font-bold text-sm">Nachrichten</p>
      </div>
      <div className="flex-1 space-y-1.5 px-3 overflow-hidden">
        {/* Unread expanded */}
        <div className="rounded-lg border border-primary/30 bg-primary/5 p-2.5">
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-xs">Wandertag am 14. Februar</span>
            <span className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
          </div>
          <div className="flex items-center gap-1 mt-0.5 text-[10px] text-muted-foreground">
            <span>Frau Mueller</span>
            <span>&middot;</span>
            <span>Heute</span>
          </div>
          <div className="mt-2 rounded-md bg-muted/50 p-2 text-[10px] text-muted-foreground leading-relaxed">
            <p>Liebe Eltern,</p>
            <p className="mt-1">am 14.02. findet unser Wandertag statt. Treffpunkt ist um 8:00 Uhr am Schulhof. Bitte geben Sie Ihrem Kind wetterfeste Kleidung und Verpflegung mit.</p>
            <p className="mt-1">Mit freundlichen Gruessen,<br/>K. Mueller</p>
          </div>
        </div>

        {/* Unread */}
        <div className="rounded-lg border border-primary/30 bg-primary/5 p-2.5">
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-xs">Elternabend Klasse 7b</span>
            <span className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
          </div>
          <div className="flex items-center gap-1 mt-0.5 text-[10px] text-muted-foreground">
            <span>Herr Schmidt</span>
            <span>&middot;</span>
            <span>Gestern</span>
          </div>
        </div>

        {/* Read */}
        <div className="rounded-lg border p-2.5">
          <span className="font-medium text-xs">Notenliste Halbjahr</span>
          <div className="flex items-center gap-1 mt-0.5 text-[10px] text-muted-foreground">
            <span>Sekretariat</span>
            <span>&middot;</span>
            <span>3. Feb</span>
          </div>
        </div>
        <div className="rounded-lg border p-2.5">
          <span className="font-medium text-xs">Schulaufuehrung Einladung</span>
          <div className="flex items-center gap-1 mt-0.5 text-[10px] text-muted-foreground">
            <span>Theater AG</span>
            <span>&middot;</span>
            <span>1. Feb</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function SyncMockup() {
  return (
    <div className="flex flex-col h-full bg-background text-foreground text-xs">
      <div className="flex items-center justify-between px-3 py-1.5 text-[10px] text-muted-foreground">
        <span>9:41</span>
        <div className="flex gap-1">
          <div className="h-2 w-3 rounded-sm bg-muted-foreground/40" />
          <div className="h-2 w-2 rounded-full bg-muted-foreground/40" />
        </div>
      </div>
      <div className="flex-1 flex flex-col items-center justify-center px-6 gap-4">
        {/* Lock icon */}
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
          <Lock className="h-7 w-7 text-primary" />
        </div>

        <div className="text-center space-y-1">
          <p className="font-bold text-sm">WebUntis Sync</p>
          <p className="text-[10px] text-muted-foreground">Kevin – Gymnasium Musterstadt</p>
        </div>

        {/* Form */}
        <div className="w-full space-y-2.5">
          <div>
            <p className="text-[10px] font-medium mb-0.5">Benutzername</p>
            <div className="rounded-md border bg-muted/30 px-2.5 py-1.5 text-[10px] text-muted-foreground">
              max.mustermann
            </div>
          </div>
          <div>
            <p className="text-[10px] font-medium mb-0.5">Passwort</p>
            <div className="rounded-md border bg-muted/30 px-2.5 py-1.5 text-[10px] text-muted-foreground">
              ••••••••••
            </div>
          </div>
        </div>

        {/* Trust badge */}
        <div className="flex items-start gap-2 rounded-lg bg-muted/50 p-2.5 w-full">
          <Shield className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
          <p className="text-[10px] text-muted-foreground leading-relaxed">
            Dein Passwort wird <strong>nicht gespeichert</strong>. Es wird nur fuer diese eine Abfrage verwendet.
          </p>
        </div>

        {/* Button */}
        <div className="w-full rounded-md bg-primary py-2 text-center text-[11px] font-medium text-primary-foreground">
          Jetzt synchronisieren
        </div>
      </div>
    </div>
  );
}

function PlatformsMockup() {
  const platforms = [
    { name: "WebUntis", short: "WE", color: "bg-orange-100 text-orange-800", status: "Verfuegbar" },
    { name: "Schulmanager", short: "SC", color: "bg-green-100 text-green-800", status: "Beta" },
    { name: "IServ", short: "IS", color: "bg-blue-100 text-blue-800", status: "Beta" },
    { name: "Moodle", short: "MO", color: "bg-yellow-100 text-yellow-800", status: "Beta" },
    { name: "Sdui", short: "SD", color: "bg-purple-100 text-purple-800", status: "Beta" },
    { name: "DieSchulApp", short: "DS", color: "bg-rose-100 text-rose-800", status: "Bald" },
  ];

  return (
    <div className="flex flex-col h-full bg-background text-foreground text-xs">
      <div className="flex items-center justify-between px-3 py-1.5 text-[10px] text-muted-foreground">
        <span>9:41</span>
        <div className="flex gap-1">
          <div className="h-2 w-3 rounded-sm bg-muted-foreground/40" />
          <div className="h-2 w-2 rounded-full bg-muted-foreground/40" />
        </div>
      </div>
      <div className="px-3 pb-1">
        <p className="font-bold text-sm">Plattform waehlen</p>
        <p className="text-[10px] text-muted-foreground">Welche App nutzt die Schule?</p>
      </div>
      <div className="flex-1 px-3 space-y-1.5 overflow-hidden">
        {platforms.map((p) => (
          <div
            key={p.name}
            className={`flex items-center gap-2.5 rounded-lg border p-2.5 ${
              p.status === "Bald" ? "opacity-50" : ""
            }`}
          >
            <div className={`flex h-8 w-8 items-center justify-center rounded-lg text-[10px] font-bold ${p.color}`}>
              {p.short}
            </div>
            <div className="flex-1">
              <p className="font-medium text-xs">{p.name}</p>
            </div>
            {p.status === "Verfuegbar" ? (
              <span className="rounded-full bg-green-100 px-1.5 py-0.5 text-[8px] font-medium text-green-700 flex items-center gap-0.5">
                <Check className="h-2 w-2" />
                {p.status}
              </span>
            ) : p.status === "Bald" ? (
              <span className="rounded-full bg-muted px-1.5 py-0.5 text-[8px] font-medium text-muted-foreground">
                {p.status}
              </span>
            ) : (
              <span className="rounded-full bg-blue-100 px-1.5 py-0.5 text-[8px] font-medium text-blue-700 flex items-center gap-0.5">
                <Check className="h-2 w-2" />
                {p.status}
              </span>
            )}
          </div>
        ))}
      </div>
      <div className="px-3 py-2 text-center">
        <p className="text-[10px] text-muted-foreground">
          <Sparkles className="inline h-2.5 w-2.5 mr-0.5" />
          Weitere Plattformen folgen...
        </p>
      </div>
    </div>
  );
}

// ─── Slide Config ────────────────────────────────────────────────

const SLIDES = [
  {
    label: "Hausaufgaben",
    headline: "Vergiss nie wieder Hausaufgaben",
    component: HomeworkMockup,
  },
  {
    label: "Nachrichten",
    headline: "Alle Infos an einem Ort",
    component: MessagesMockup,
  },
  {
    label: "Sicherheit",
    headline: "Deine Daten bleiben sicher",
    component: SyncMockup,
  },
  {
    label: "Plattformen",
    headline: "Funktioniert mit deiner Schule",
    component: PlatformsMockup,
  },
];

// ─── Carousel ────────────────────────────────────────────────────

export function ScreenshotCarousel() {
  const [current, setCurrent] = useState(0);

  const next = useCallback(() => {
    setCurrent((c) => (c === SLIDES.length - 1 ? 0 : c + 1));
  }, []);

  const prev = useCallback(() => {
    setCurrent((c) => (c === 0 ? SLIDES.length - 1 : c - 1));
  }, []);

  // Auto-advance every 5 seconds
  useEffect(() => {
    const timer = setInterval(next, 5000);
    return () => clearInterval(timer);
  }, [next]);

  const Slide = SLIDES[current].component;

  return (
    <div className="w-full max-w-[800px] space-y-3 lg:max-w-[280px]">
      {/* Headline */}
      <p className="text-center text-sm font-medium text-muted-foreground">
        {SLIDES[current].headline}
      </p>

      {/* Phone frame */}
      <div className="relative mx-auto w-[240px] lg:w-full">
        {/* Notch */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 z-10 h-5 w-20 rounded-b-xl bg-foreground/10" />

        {/* Screen */}
        <div className="aspect-[9/16] w-full overflow-hidden rounded-[2rem] border-4 border-foreground/10 bg-background shadow-lg">
          <Slide />
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-3">
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={prev}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div className="flex gap-1.5">
          {SLIDES.map((slide, i) => (
            <button
              key={slide.label}
              onClick={() => setCurrent(i)}
              className={`h-1.5 rounded-full transition-all ${
                i === current ? "w-4 bg-primary" : "w-1.5 bg-muted-foreground/30"
              }`}
            />
          ))}
        </div>
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={next}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Labels */}
      <div className="flex flex-wrap justify-center gap-2">
        {SLIDES.map((slide, i) => (
          <button
            key={slide.label}
            onClick={() => setCurrent(i)}
            className={`rounded-full px-2.5 py-0.5 text-xs transition-colors ${
              i === current
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            {slide.label}
          </button>
        ))}
      </div>
    </div>
  );
}
