"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const SLIDES = [
  { src: "/screenshots/dashboard.png", alt: "Dashboard", label: "Dashboard" },
  { src: "/screenshots/stundenplan.png", alt: "Stundenplan", label: "Stundenplan" },
  { src: "/screenshots/vertretungen.png", alt: "Vertretungen", label: "Vertretungen" },
  { src: "/screenshots/multi-kind.png", alt: "Mehrere Kinder", label: "Multi-Kind" },
];

export function ScreenshotCarousel() {
  const [current, setCurrent] = useState(0);

  function prev() {
    setCurrent((c) => (c === 0 ? SLIDES.length - 1 : c - 1));
  }

  function next() {
    setCurrent((c) => (c === SLIDES.length - 1 ? 0 : c + 1));
  }

  return (
    <div className="w-full max-w-[800px] space-y-4 lg:max-w-[280px]">
      {/* Image container */}
      <div className="relative aspect-[9/16] w-full overflow-hidden rounded-xl border border-border/50 bg-muted shadow-sm">
        {/* Placeholder fallback */}
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-muted-foreground">
          <div className="rounded-lg bg-muted-foreground/10 p-3">
            <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0 0 22.5 18.75V5.25A2.25 2.25 0 0 0 20.25 3H3.75A2.25 2.25 0 0 0 1.5 5.25v13.5A2.25 2.25 0 0 0 3.75 21Z" />
            </svg>
          </div>
          <span className="text-xs">{SLIDES[current].label}</span>
        </div>

        {/* Actual image (lazy loaded, renders on top of placeholder) */}
        <Image
          src={SLIDES[current].src}
          alt={SLIDES[current].alt}
          fill
          className="object-cover"
          loading="lazy"
          sizes="(max-width: 1024px) 100vw, 280px"
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = "none";
          }}
        />
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
      <div className="flex justify-center gap-2">
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
