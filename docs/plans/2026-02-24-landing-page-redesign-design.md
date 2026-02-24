# Landing Page Redesign — Full Rethink

**Datum:** 2026-02-24
**Stil:** Premium-Minimal mit reichhaltigen Animationen
**Animation Library:** Framer Motion
**Scope:** Nur Landing Page (`src/app/page.tsx` + neue Komponenten)

---

## Design-Entscheidungen

- Bestehende Sektionsstruktur bleibt (Hero, Problem, Plattformen, Features, Pricing, CTA, Footer)
- Komplett neue visuelle Sprache: Bento-Grids, Glassmorphism, 3D-Perspektive
- Framer Motion fuer alle Scroll-Animationen und Micro-Interactions
- Landing Page bleibt im Light Mode (`ForceLightMode`)

---

## Sektion 1: Header

- Glassmorphism: `backdrop-blur-xl` + semi-transparenter Hintergrund
- Kein sichtbarer Border — stattdessen dynamischer `shadow-sm` beim Scrollen (Framer Motion `useScroll`)
- Navigation-Buttons als Pill-Shape (`rounded-full`)
- Logo mit sanftem Scale-In beim Laden
- `max-w-4xl` (breiter als aktuell)

## Sektion 2: Hero

- Volle Viewport-Hoehe: `min-h-[90vh]`, zentriertes vertikales Layout
- Animierter Pill-Badge: "Kostenlos in der Beta" mit Shimmer-Effekt
- Headline: `text-5xl sm:text-6xl lg:text-7xl font-bold`
- Gradient-Text fuer "Ein Dashboard" (primary-Farbverlauf)
- Subtitle: `text-xl`, `max-w-xl`, `text-muted-foreground`
- CTA-Buttons: `rounded-full`, groesser, mit hover-glow
- Screenshot-Mockup: 3D-Perspektive (`perspective` + `rotateX`) mit Float-Animation
- Hintergrund: Subtiles Radial-Gradient + Dot-Grid-Pattern (CSS-only)
- Staggered Entrance: Badge > Headline > Subtitle > Buttons > Screenshot (100ms Versatz)

## Sektion 3: Problem/Solution

- `max-w-3xl`, kein harter Border-Trenner
- Sanfter Gradient-Uebergang zum Hintergrund
- Heading: `text-3xl font-bold`, fade-up Animation
- Subtext: `text-lg`, bessere Lesbarkeit
- Animierte Zahlen-Counter ("6 verschiedene Apps" zaehlt hoch)

## Sektion 4: Plattformen (Bento-Grid)

- Bento-Grid Layout:
  - WebUntis (live) = doppelt breite Karte (`col-span-2`)
  - 5 weitere Plattformen in Standard-Zellen
- Glassmorphism-Cards: `bg-white/70 backdrop-blur-sm`, subtiler Border
- Platform-Icons: `h-12 w-12`, farbiger Hintergrund-Ring
- Hover: Elevation + staerkerer Shadow
- Status-Badge "Verfuegbar" mit pulsierendem gruenen Dot
- Scroll-Animation: Cards staggered reinsliden

## Sektion 5: Features (Bento-Grid)

- Asymmetrisches Bento-Grid:
  - "Tagesuebersicht" und "Mehrere Kinder" = grosse Karten
  - Andere Features in Standard-Zellen
- Jede Card hat eigenen dezenten Farbakzent:
  - Tagesuebersicht = blaues Tint
  - Vertretungen = oranges Tint
  - Mehrere Kinder = violettes Tint
  - Open Source = gruenes Tint
  - PWA = indigo Tint
- Card-Styling: `shadow-md` statt border, `rounded-2xl`
- Icons: `h-8 w-8` in farbigen Kreisen
- Typografie: Titles `text-lg`, Descriptions `text-sm`
- Animation: Scale + Opacity fade-in, staggered
- Hover: `translateY(-4px)` + staerkerer Shadow

## Sektion 6: Pricing

- Spotlight-Card mit animiertem Glow-Effekt (Primary-Farbe, niedrige Opacity)
- Preis: `text-5xl font-bold`
- Leichter Gradient-Background: Weiss nach `primary/5`
- `rounded-2xl` + `shadow-lg`
- Feature-Liste: staggered Check-Marks beim Scrollen
- CTA-Button: `rounded-full`, hover-glow

## Sektion 7: Final CTA

- Gradient-Background: Primary zu dunklerer Shade
- Heading: `text-3xl sm:text-4xl`
- Subtiles Dot-Pattern im Hintergrund
- CTA-Button: Weiss auf Gradient, `rounded-full`, Shimmer-Animation
- Framer Motion: fade-up von unten

## Sektion 8: Footer

- Mehr Breathing Room, `max-w-4xl`
- Dot-Separatoren zwischen Links
- Minimal veraendert

---

## Technische Anforderungen

- `framer-motion` als neue Dependency
- Neue Komponenten:
  - `AnimatedSection` — Wrapper fuer Scroll-Enter Animationen
  - `AnimatedCounter` — Zahlen-Counter
  - `GlowCard` — Card mit Glow-Effekt
  - `ShimmerBadge` — Badge mit Shimmer
  - `GradientText` — Text mit Gradient
  - `FloatingScreenshot` — 3D-perspektivischer Screenshot
- Landing Page bleibt `"use client"` (oder spezifische Client-Komponenten innerhalb Server-Page)
- Keine Aenderungen an bestehenden shadcn/ui Komponenten
- Keine Aenderungen am App-Bereich (Dashboard etc.)
