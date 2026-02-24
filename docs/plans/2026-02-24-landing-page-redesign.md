# Landing Page Redesign — Full Rethink Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Transform the KlassHub landing page from a standard shadcn/Tailwind look into a Premium-Minimal design with Bento-Grids, Glassmorphism, 3D effects, and rich Framer Motion animations.

**Architecture:** The landing page (`src/app/page.tsx`) is a Next.js Server Component that imports client-side sub-components. We will keep this pattern: page.tsx stays as Server Component, all animated sections become client components in `src/components/landing/`. Existing components (`ScreenshotCarousel`, `StickyCTABar`, `TrackedLink`, `ForceLightMode`) are preserved or adapted.

**Tech Stack:** Next.js 16, React 19, Tailwind CSS 4, shadcn/ui, Framer Motion (new), Lucide React

**Design doc:** `docs/plans/2026-02-24-landing-page-redesign-design.md`

---

### Task 1: Install Framer Motion + Create Feature Branch

**Files:**
- Modify: `package.json`

**Step 1: Create feature branch**

```bash
git checkout -b feat/landing-page-redesign
```

**Step 2: Install framer-motion**

```bash
npm install framer-motion
```

**Step 3: Verify installation**

```bash
npm ls framer-motion
```

Expected: `framer-motion@...` listed

**Step 4: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: add framer-motion dependency for landing page redesign"
```

---

### Task 2: Create AnimatedSection Component

Reusable wrapper that fades + slides children in when they scroll into view.

**Files:**
- Create: `src/components/landing/animated-section.tsx`

**Step 1: Create the component**

```tsx
"use client";

import { motion } from "framer-motion";
import { type ReactNode } from "react";

interface AnimatedSectionProps {
  children: ReactNode;
  className?: string;
  delay?: number;
}

export function AnimatedSection({ children, className, delay = 0 }: AnimatedSectionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.6, delay, ease: [0.21, 0.47, 0.32, 0.98] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
```

**Step 2: Verify it compiles**

```bash
npx tsc --noEmit
```

Expected: No errors

**Step 3: Commit**

```bash
git add src/components/landing/animated-section.tsx
git commit -m "feat: add AnimatedSection component for scroll-triggered animations"
```

---

### Task 3: Create ShimmerBadge Component

A pill badge with a CSS shimmer/glint animation running across it.

**Files:**
- Create: `src/components/landing/shimmer-badge.tsx`
- Modify: `src/app/globals.css` (add shimmer keyframe)

**Step 1: Add shimmer keyframe to globals.css**

Add this after the existing `@keyframes bounce-check` block at the end of `src/app/globals.css`:

```css
@keyframes shimmer {
  0% { background-position: -200% center; }
  100% { background-position: 200% center; }
}
```

**Step 2: Create the component**

```tsx
import { type ReactNode } from "react";

interface ShimmerBadgeProps {
  children: ReactNode;
  className?: string;
}

export function ShimmerBadge({ children, className = "" }: ShimmerBadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border border-border/50 bg-muted/50 px-4 py-1.5 text-sm text-muted-foreground ${className}`}
      style={{
        backgroundImage:
          "linear-gradient(110deg, transparent 33%, rgba(255,255,255,0.6) 50%, transparent 67%)",
        backgroundSize: "200% 100%",
        animation: "shimmer 3s ease-in-out infinite",
      }}
    >
      {children}
    </span>
  );
}
```

**Step 3: Verify it compiles**

```bash
npx tsc --noEmit
```

**Step 4: Commit**

```bash
git add src/components/landing/shimmer-badge.tsx src/app/globals.css
git commit -m "feat: add ShimmerBadge component with CSS shimmer animation"
```

---

### Task 4: Create GradientText Component

A span that applies a CSS gradient fill to text.

**Files:**
- Create: `src/components/landing/gradient-text.tsx`

**Step 1: Create the component**

```tsx
import { type ReactNode } from "react";

interface GradientTextProps {
  children: ReactNode;
  className?: string;
}

export function GradientText({ children, className = "" }: GradientTextProps) {
  return (
    <span
      className={`bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-500 bg-clip-text text-transparent ${className}`}
    >
      {children}
    </span>
  );
}
```

**Step 2: Verify and commit**

```bash
npx tsc --noEmit
git add src/components/landing/gradient-text.tsx
git commit -m "feat: add GradientText component for gradient headline effect"
```

---

### Task 5: Create AnimatedCounter Component

Counts up from 0 to a target number when it scrolls into view.

**Files:**
- Create: `src/components/landing/animated-counter.tsx`

**Step 1: Create the component**

```tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { useInView, animate } from "framer-motion";

interface AnimatedCounterProps {
  target: number;
  suffix?: string;
  className?: string;
}

export function AnimatedCounter({ target, suffix = "", className = "" }: AnimatedCounterProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!isInView) return;
    const controls = animate(0, target, {
      duration: 1.5,
      ease: "easeOut",
      onUpdate: (v) => setDisplay(Math.round(v)),
    });
    return () => controls.stop();
  }, [isInView, target]);

  return (
    <span ref={ref} className={className}>
      {display}{suffix}
    </span>
  );
}
```

**Step 2: Verify and commit**

```bash
npx tsc --noEmit
git add src/components/landing/animated-counter.tsx
git commit -m "feat: add AnimatedCounter component for number count-up animation"
```

---

### Task 6: Create FloatingScreenshot Component

Replaces the old ScreenshotCarousel with a 3D-perspective floating phone mockup.

**Files:**
- Create: `src/components/landing/floating-screenshot.tsx`

**Step 1: Create the component**

This component wraps the existing `ScreenshotCarousel` in a 3D perspective container with Framer Motion float animation.

```tsx
"use client";

import { motion } from "framer-motion";
import { ScreenshotCarousel } from "@/components/screenshot-carousel";

export function FloatingScreenshot() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 60 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8, delay: 0.4, ease: [0.21, 0.47, 0.32, 0.98] }}
      className="relative mx-auto w-full max-w-sm"
    >
      {/* Glow behind the phone */}
      <div className="absolute inset-0 -z-10 mx-auto h-full w-3/4 rounded-full bg-primary/10 blur-3xl" />

      {/* 3D perspective wrapper */}
      <motion.div
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        style={{ perspective: "1000px" }}
      >
        <div
          style={{ transform: "rotateX(2deg)" }}
          className="transition-transform duration-500 hover:!rotate-x-0"
        >
          <ScreenshotCarousel />
        </div>
      </motion.div>
    </motion.div>
  );
}
```

**Step 2: Verify and commit**

```bash
npx tsc --noEmit
git add src/components/landing/floating-screenshot.tsx
git commit -m "feat: add FloatingScreenshot with 3D perspective and float animation"
```

---

### Task 7: Create GlowCard Component

Card with an animated glow border effect, used for the pricing section.

**Files:**
- Create: `src/components/landing/glow-card.tsx`

**Step 1: Add glow keyframe to globals.css**

Add after the shimmer keyframe:

```css
@keyframes glow-pulse {
  0%, 100% { opacity: 0.4; }
  50% { opacity: 0.8; }
}
```

**Step 2: Create the component**

```tsx
import { type ReactNode } from "react";

interface GlowCardProps {
  children: ReactNode;
  className?: string;
}

export function GlowCard({ children, className = "" }: GlowCardProps) {
  return (
    <div className={`relative ${className}`}>
      {/* Animated glow */}
      <div
        className="pointer-events-none absolute -inset-0.5 rounded-2xl bg-primary/20 blur-md"
        style={{ animation: "glow-pulse 3s ease-in-out infinite" }}
      />
      {/* Card content */}
      <div className="relative rounded-2xl border border-primary/20 bg-white p-8 shadow-lg">
        {children}
      </div>
    </div>
  );
}
```

**Step 3: Verify and commit**

```bash
npx tsc --noEmit
git add src/components/landing/glow-card.tsx src/app/globals.css
git commit -m "feat: add GlowCard component with animated glow border effect"
```

---

### Task 8: Create Landing Header Component

Glassmorphism header with dynamic scroll shadow.

**Files:**
- Create: `src/components/landing/landing-header.tsx`

**Step 1: Create the component**

```tsx
"use client";

import { useScroll, useTransform, motion } from "framer-motion";
import Link from "next/link";
import { GraduationCap, Github } from "lucide-react";
import { Button } from "@/components/ui/button";

export function LandingHeader() {
  const { scrollY } = useScroll();
  const shadow = useTransform(
    scrollY,
    [0, 100],
    ["0 0 0 0 rgba(0,0,0,0)", "0 1px 8px 0 rgba(0,0,0,0.06)"]
  );
  const borderOpacity = useTransform(scrollY, [0, 100], [0, 1]);

  return (
    <motion.header
      className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl"
      style={{ boxShadow: shadow }}
    >
      <motion.div
        className="absolute inset-x-0 bottom-0 h-px bg-border"
        style={{ opacity: borderOpacity }}
      />
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary">
            <GraduationCap className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-lg font-bold tracking-tight">KlassHub</span>
        </Link>
        <div className="flex items-center gap-2">
          <a href="https://github.com/kevjaeg/klasshub" target="_blank" rel="noopener noreferrer">
            <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full" aria-label="GitHub">
              <Github className="h-4 w-4" />
            </Button>
          </a>
          <Link href="/login">
            <Button variant="ghost" className="rounded-full px-4">Anmelden</Button>
          </Link>
          <Link href="/register">
            <Button className="rounded-full px-5">Registrieren</Button>
          </Link>
        </div>
      </div>
    </motion.header>
  );
}
```

**Step 2: Verify and commit**

```bash
npx tsc --noEmit
git add src/components/landing/landing-header.tsx
git commit -m "feat: add glassmorphism LandingHeader with dynamic scroll shadow"
```

---

### Task 9: Create Landing Hero Section Component

Full-viewport hero with staggered entrance animations, gradient text, shimmer badge, and floating screenshot.

**Files:**
- Create: `src/components/landing/hero-section.tsx`

**Step 1: Create the component**

```tsx
"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TrackedLink } from "@/components/tracked-link";
import { ShimmerBadge } from "./shimmer-badge";
import { GradientText } from "./gradient-text";
import { FloatingScreenshot } from "./floating-screenshot";
import Link from "next/link";

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.21, 0.47, 0.32, 0.98] } },
};

export function HeroSection() {
  return (
    <section className="relative flex min-h-[90vh] items-center justify-center overflow-hidden px-6 py-20">
      {/* Background: radial gradient + dot grid */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent" />
        <div
          className="absolute inset-0 opacity-[0.4]"
          style={{
            backgroundImage: "radial-gradient(circle, #d1d5db 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />
      </div>

      <motion.div
        variants={stagger}
        initial="hidden"
        animate="show"
        className="mx-auto flex max-w-5xl flex-col items-center gap-16 lg:flex-row lg:items-center lg:gap-20"
      >
        {/* Text content */}
        <div className="flex flex-1 flex-col items-center gap-6 text-center lg:items-start lg:text-left">
          <motion.div variants={fadeUp}>
            <ShimmerBadge>
              <span className="inline-block h-2 w-2 rounded-full bg-green-500" />
              Kostenlos in der Beta
            </ShimmerBadge>
          </motion.div>

          <motion.h1
            variants={fadeUp}
            className="text-5xl font-bold tracking-tight sm:text-6xl lg:text-7xl"
          >
            Alle Schul-Apps.{" "}
            <GradientText>Ein Dashboard.</GradientText>
          </motion.h1>

          <motion.p
            variants={fadeUp}
            className="max-w-xl text-lg leading-relaxed text-muted-foreground sm:text-xl"
          >
            Stundenplan, Vertretungen und Ausfälle deiner Kinder – zentral an einem Ort.
            Nie wieder zwischen fünf Apps wechseln.
          </motion.p>

          <motion.div
            variants={fadeUp}
            className="flex flex-col gap-3 sm:flex-row"
          >
            <TrackedLink href="/register" event="cta_click" props={{ location: "hero" }}>
              <Button size="lg" className="gap-2 rounded-full px-8 text-base shadow-lg shadow-primary/25 transition-shadow hover:shadow-xl hover:shadow-primary/30">
                Jetzt kostenlos starten
                <ArrowRight className="h-4 w-4" />
              </Button>
            </TrackedLink>
            <Link href="/demo">
              <Button size="lg" variant="outline" className="gap-2 rounded-full px-8 text-base">
                Demo ansehen
              </Button>
            </Link>
          </motion.div>

          <motion.p variants={fadeUp} className="text-sm text-muted-foreground">
            Einrichtung in unter 2 Minuten &middot; Keine Kreditkarte nötig
          </motion.p>
        </div>

        {/* Screenshot */}
        <div className="w-full max-w-sm lg:w-auto">
          <FloatingScreenshot />
        </div>
      </motion.div>
    </section>
  );
}
```

**Step 2: Verify and commit**

```bash
npx tsc --noEmit
git add src/components/landing/hero-section.tsx
git commit -m "feat: add HeroSection with staggered animations, gradient text, floating screenshot"
```

---

### Task 10: Create Problem Section Component

**Files:**
- Create: `src/components/landing/problem-section.tsx`

**Step 1: Create the component**

```tsx
"use client";

import { AnimatedSection } from "./animated-section";
import { AnimatedCounter } from "./animated-counter";

export function ProblemSection() {
  return (
    <section className="px-6 py-24">
      <AnimatedSection className="mx-auto max-w-3xl text-center">
        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Das Chaos hat ein Ende
        </h2>
        <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
          WebUntis, Schulmanager, IServ, Moodle, Sdui – Eltern jonglieren
          mit bis zu{" "}
          <span className="font-semibold text-foreground">
            <AnimatedCounter target={6} /> verschiedenen Apps
          </span>{" "}
          pro Kind. Wer mehrere Kinder hat,
          verliert den Überblick. KlassHub bringt alles zusammen.
        </p>
      </AnimatedSection>
    </section>
  );
}
```

**Step 2: Verify and commit**

```bash
npx tsc --noEmit
git add src/components/landing/problem-section.tsx
git commit -m "feat: add ProblemSection with animated counter"
```

---

### Task 11: Create Platforms Bento Grid Section

**Files:**
- Create: `src/components/landing/platforms-section.tsx`

**Step 1: Create the component**

```tsx
"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { AnimatedSection } from "./animated-section";

const platforms = [
  { name: "WebUntis", short: "WE", color: "bg-orange-100 text-orange-700 ring-orange-200", status: "live" as const, span: "sm:col-span-2" },
  { name: "Schulmanager", short: "SC", color: "bg-green-100 text-green-700 ring-green-200", status: "beta" as const, span: "" },
  { name: "IServ", short: "IS", color: "bg-blue-100 text-blue-700 ring-blue-200", status: "beta" as const, span: "" },
  { name: "Moodle", short: "MO", color: "bg-yellow-100 text-yellow-700 ring-yellow-200", status: "beta" as const, span: "" },
  { name: "Sdui", short: "SD", color: "bg-purple-100 text-purple-700 ring-purple-200", status: "beta" as const, span: "" },
  { name: "DieSchulApp", short: "DS", color: "bg-rose-100 text-rose-700 ring-rose-200", status: "soon" as const, span: "" },
];

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

const item = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.5, ease: [0.21, 0.47, 0.32, 0.98] } },
};

export function PlatformsSection() {
  return (
    <section className="px-6 py-24">
      <div className="mx-auto max-w-3xl">
        <AnimatedSection className="mb-12 text-center">
          <h2 className="text-3xl font-bold tracking-tight">Unterstützte Plattformen</h2>
          <p className="mt-4 text-lg text-muted-foreground">
            KlassHub verbindet sich mit den gängigsten Schulplattformen.
          </p>
        </AnimatedSection>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-50px" }}
          className="grid grid-cols-1 gap-4 sm:grid-cols-3"
        >
          {platforms.map((p) => (
            <motion.div
              key={p.name}
              variants={item}
              className={`group relative flex flex-col items-center gap-3 rounded-2xl border border-white/60 bg-white/70 p-6 shadow-sm backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md ${
                p.span
              } ${p.status === "soon" ? "opacity-50" : ""}`}
            >
              <div className={`flex h-12 w-12 items-center justify-center rounded-xl text-sm font-bold ring-2 ${p.color}`}>
                {p.short}
              </div>
              <span className="text-sm font-semibold">{p.name}</span>
              {p.status === "live" ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-700">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
                  </span>
                  Verfügbar
                </span>
              ) : p.status === "beta" ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-700">
                  <Check className="h-3 w-3" />
                  Beta
                </span>
              ) : (
                <span className="inline-flex items-center rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                  Coming Soon
                </span>
              )}
            </motion.div>
          ))}
        </motion.div>

        <AnimatedSection delay={0.3} className="mt-6 text-center">
          <p className="text-sm text-muted-foreground">
            Deine Schule nutzt eine andere App?{" "}
            <a href="mailto:kontakt@klasshub.app" className="text-primary hover:underline">
              Schreib uns
            </a>{" "}
            – wir bauen sie ein!
          </p>
        </AnimatedSection>
      </div>
    </section>
  );
}
```

**Step 2: Verify and commit**

```bash
npx tsc --noEmit
git add src/components/landing/platforms-section.tsx
git commit -m "feat: add PlatformsSection bento grid with glassmorphism cards and staggered animation"
```

---

### Task 12: Create Features Bento Grid Section

**Files:**
- Create: `src/components/landing/features-section.tsx`

**Step 1: Create the component**

```tsx
"use client";

import { motion } from "framer-motion";
import { Zap, Clock, Users, Shield, Smartphone, Github } from "lucide-react";
import { AnimatedSection } from "./animated-section";

const features = [
  {
    icon: Zap,
    title: "Tagesübersicht",
    description: "Sieh auf einen Blick, was heute und morgen ansteht. Ausfälle sofort erkennen.",
    tint: "bg-blue-50 text-blue-600",
    iconBg: "bg-blue-100",
    span: "sm:col-span-2",
  },
  {
    icon: Clock,
    title: "Vertretungen live",
    description: "Ausfälle rot, Vertretungen orange – farbcodiert und sofort erkennbar.",
    tint: "bg-orange-50 text-orange-600",
    iconBg: "bg-orange-100",
    span: "",
  },
  {
    icon: Users,
    title: "Mehrere Kinder",
    description: "Alle Kinder in einem Dashboard. Egal welche Schule, egal welche Klasse.",
    tint: "bg-violet-50 text-violet-600",
    iconBg: "bg-violet-100",
    span: "",
  },
  {
    icon: Shield,
    title: "Open Source & DSGVO",
    description: "Passwörter werden nie gespeichert. Daten in der EU. Konto jederzeit löschbar.",
    tint: "bg-green-50 text-green-600",
    iconBg: "bg-green-100",
    span: "",
    extra: (
      <a href="https://github.com/kevjaeg/klasshub" target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex items-center gap-1.5 text-sm text-primary hover:underline">
        <Github className="h-3.5 w-3.5" />
        Quellcode auf GitHub
      </a>
    ),
  },
  {
    icon: Smartphone,
    title: "Installierbar wie eine App",
    description: "KlassHub ist eine Progressive Web App. Installiere sie auf dem Homescreen – fühlt sich an wie eine native App, ohne App Store.",
    tint: "bg-indigo-50 text-indigo-600",
    iconBg: "bg-indigo-100",
    span: "sm:col-span-2",
  },
];

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

const item = {
  hidden: { opacity: 0, scale: 0.95 },
  show: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: [0.21, 0.47, 0.32, 0.98] } },
};

export function FeaturesSection() {
  return (
    <section className="bg-muted/20 px-6 py-24">
      <div className="mx-auto max-w-3xl">
        <AnimatedSection className="mb-12 text-center">
          <h2 className="text-3xl font-bold tracking-tight">Was KlassHub kann</h2>
        </AnimatedSection>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-50px" }}
          className="grid grid-cols-1 gap-4 sm:grid-cols-2"
        >
          {features.map((f) => (
            <motion.div
              key={f.title}
              variants={item}
              className={`group rounded-2xl ${f.tint.split(" ")[0]} p-6 shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${f.span}`}
            >
              <div className="flex gap-4">
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${f.iconBg}`}>
                  <f.icon className={`h-5 w-5 ${f.tint.split(" ")[1]}`} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground">{f.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                    {f.description}
                  </p>
                  {f.extra}
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
```

**Step 2: Verify and commit**

```bash
npx tsc --noEmit
git add src/components/landing/features-section.tsx
git commit -m "feat: add FeaturesSection bento grid with colored accent cards"
```

---

### Task 13: Create Pricing Section Component

**Files:**
- Create: `src/components/landing/pricing-section.tsx`

**Step 1: Create the component**

```tsx
"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TrackedLink } from "@/components/tracked-link";
import { AnimatedSection } from "./animated-section";
import { GlowCard } from "./glow-card";

const checkItem = {
  hidden: { opacity: 0, x: -10 },
  show: { opacity: 1, x: 0 },
};

const checkList = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};

const benefits = [
  "Alle Plattformen",
  "Unbegrenzt Kinder",
  "Push-Benachrichtigungen",
  "Offline-Modus",
];

export function PricingSection() {
  return (
    <section className="px-6 py-24">
      <div className="mx-auto max-w-sm">
        <AnimatedSection className="mb-10 text-center">
          <h2 className="text-3xl font-bold tracking-tight">Kostenlose Beta</h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Während der Beta ist KlassHub komplett kostenlos.
          </p>
        </AnimatedSection>

        <AnimatedSection delay={0.2}>
          <GlowCard>
            <div className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary">
              Beta
            </div>
            <div className="mt-4">
              <span className="text-5xl font-bold">0 &euro;</span>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              Alle Features, keine Limits, kein Kleingedrucktes.
            </p>
            <motion.ul
              variants={checkList}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              className="mt-6 space-y-2.5"
            >
              {benefits.map((b) => (
                <motion.li key={b} variants={checkItem} className="flex items-center gap-2 text-sm">
                  <Check className="h-4 w-4 shrink-0 text-primary" />
                  {b}
                </motion.li>
              ))}
            </motion.ul>
            <TrackedLink href="/register" event="cta_click" props={{ location: "pricing_beta" }}>
              <Button className="mt-6 w-full rounded-full shadow-lg shadow-primary/20 transition-shadow hover:shadow-xl hover:shadow-primary/30">
                Kostenlos starten
              </Button>
            </TrackedLink>
          </GlowCard>
        </AnimatedSection>
      </div>
    </section>
  );
}
```

**Step 2: Verify and commit**

```bash
npx tsc --noEmit
git add src/components/landing/pricing-section.tsx
git commit -m "feat: add PricingSection with glow card and staggered check-marks"
```

---

### Task 14: Create CTA Section Component

**Files:**
- Create: `src/components/landing/cta-section.tsx`

**Step 1: Create the component**

```tsx
"use client";

import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TrackedLink } from "@/components/tracked-link";
import { AnimatedSection } from "./animated-section";

export function CTASection() {
  return (
    <section className="relative overflow-hidden px-6 py-24">
      {/* Gradient background */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-primary via-blue-600 to-indigo-700" />
      {/* Dot pattern overlay */}
      <div
        className="absolute inset-0 -z-10 opacity-[0.15]"
        style={{
          backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)",
          backgroundSize: "20px 20px",
        }}
      />

      <AnimatedSection className="mx-auto max-w-lg text-center">
        <h2 className="text-3xl font-bold text-white sm:text-4xl">
          Bereit für weniger Stress?
        </h2>
        <TrackedLink href="/register" event="cta_click" props={{ location: "footer_cta" }}>
          <Button
            size="lg"
            variant="secondary"
            className="mt-8 gap-2 rounded-full px-8 text-base font-semibold shadow-lg"
          >
            Jetzt Beta-Zugang sichern
            <ArrowRight className="h-4 w-4" />
          </Button>
        </TrackedLink>
        <p className="mt-4 text-sm text-white/60">
          Kostenlos während der Beta
        </p>
      </AnimatedSection>
    </section>
  );
}
```

**Step 2: Verify and commit**

```bash
npx tsc --noEmit
git add src/components/landing/cta-section.tsx
git commit -m "feat: add CTASection with gradient background and dot pattern"
```

---

### Task 15: Create Landing Footer Component

**Files:**
- Create: `src/components/landing/landing-footer.tsx`

**Step 1: Create the component**

```tsx
import Link from "next/link";
import { GraduationCap, Github } from "lucide-react";

export function LandingFooter() {
  return (
    <footer className="border-t px-6 py-8">
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-4 sm:flex-row sm:justify-between">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <GraduationCap className="h-4 w-4" />
          <span className="font-medium">KlassHub</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <a href="https://github.com/kevjaeg/klasshub" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 transition-colors hover:text-foreground">
            <Github className="h-3.5 w-3.5" />
            GitHub
          </a>
          <span className="text-border">&middot;</span>
          <Link href="/datenschutz" className="transition-colors hover:text-foreground">
            Datenschutz
          </Link>
          <span className="text-border">&middot;</span>
          <Link href="/impressum" className="transition-colors hover:text-foreground">
            Impressum
          </Link>
        </div>
      </div>
    </footer>
  );
}
```

**Step 2: Verify and commit**

```bash
npx tsc --noEmit
git add src/components/landing/landing-footer.tsx
git commit -m "feat: add LandingFooter with dot separators and more breathing room"
```

---

### Task 16: Rewrite Landing Page (page.tsx)

Replace the existing landing page with the new section components.

**Files:**
- Modify: `src/app/page.tsx`

**Step 1: Rewrite page.tsx**

Replace the entire content of `src/app/page.tsx` with:

```tsx
import { ForceLightMode } from "@/components/force-light-mode";
import { StickyCTABar } from "@/components/sticky-cta-bar";
import { LandingHeader } from "@/components/landing/landing-header";
import { HeroSection } from "@/components/landing/hero-section";
import { ProblemSection } from "@/components/landing/problem-section";
import { PlatformsSection } from "@/components/landing/platforms-section";
import { FeaturesSection } from "@/components/landing/features-section";
import { PricingSection } from "@/components/landing/pricing-section";
import { CTASection } from "@/components/landing/cta-section";
import { LandingFooter } from "@/components/landing/landing-footer";

export default function LandingPage() {
  return (
    <div className="flex min-h-dvh flex-col overflow-x-hidden">
      <ForceLightMode />
      <LandingHeader />
      <main className="flex-1">
        <HeroSection />
        <ProblemSection />
        <PlatformsSection />
        <FeaturesSection />
        <PricingSection />
        <CTASection />
      </main>
      <StickyCTABar />
      <LandingFooter />
    </div>
  );
}
```

**Step 2: Verify it compiles**

```bash
npx tsc --noEmit
```

**Step 3: Verify dev server loads landing page without errors**

Open `http://localhost:3000` and visually check all sections render.

**Step 4: Commit**

```bash
git add src/app/page.tsx
git commit -m "feat: rewrite landing page with new section components"
```

---

### Task 17: Visual QA + Polish

Manual visual review of each section and fix any issues.

**Step 1: Check all sections render correctly on desktop**

Open `http://localhost:3000` at 1280px+ width. Verify:
- Header glassmorphism + scroll shadow works
- Hero: staggered entrance, gradient text, floating screenshot
- Problem: counter animation counts up
- Platforms: bento grid with WebUntis spanning 2 cols
- Features: colored cards with hover effects
- Pricing: glow card pulses
- CTA: gradient background + dot pattern
- Footer: dot separators

**Step 2: Check mobile (375px width)**

Verify responsive layout works:
- Header: buttons fit
- Hero: stacks vertically
- Grids: collapse to single column
- StickyCTABar appears on scroll

**Step 3: Fix any visual issues found**

Apply Tailwind tweaks as needed.

**Step 4: Run tests and typecheck**

```bash
npm test
npx tsc --noEmit
```

Expected: All 43 tests pass, no type errors.

**Step 5: Final commit**

```bash
git add -A
git commit -m "fix: polish landing page responsive layout and visual details"
```

---

### Task 18: Create Pull Request

**Step 1: Push branch**

```bash
git push -u origin feat/landing-page-redesign
```

**Step 2: Create PR**

```bash
gh pr create --title "feat: Landing Page Redesign — Full Rethink" --body "$(cat <<'EOF'
## Summary
- Complete visual redesign of landing page with Premium-Minimal style
- Added Framer Motion for rich scroll animations and micro-interactions
- Bento-Grid layouts for platforms and features sections
- Glassmorphism header, gradient text, floating 3D screenshot, glow cards
- All existing functionality preserved (tracking, links, carousel, sticky CTA)

## New Components
- `src/components/landing/animated-section.tsx` — Scroll-triggered fade-in wrapper
- `src/components/landing/animated-counter.tsx` — Number count-up animation
- `src/components/landing/shimmer-badge.tsx` — Badge with shimmer effect
- `src/components/landing/gradient-text.tsx` — Gradient text fill
- `src/components/landing/floating-screenshot.tsx` — 3D perspective phone mockup
- `src/components/landing/glow-card.tsx` — Card with animated glow border
- `src/components/landing/landing-header.tsx` — Glassmorphism header
- `src/components/landing/hero-section.tsx` — Full-viewport hero
- `src/components/landing/problem-section.tsx` — Problem statement
- `src/components/landing/platforms-section.tsx` — Bento grid platforms
- `src/components/landing/features-section.tsx` — Bento grid features
- `src/components/landing/pricing-section.tsx` — Pricing with glow card
- `src/components/landing/cta-section.tsx` — Gradient CTA
- `src/components/landing/landing-footer.tsx` — Redesigned footer

## New Dependencies
- `framer-motion` — React animation library

## Test plan
- [ ] All 43 existing tests pass
- [ ] TypeScript typecheck passes
- [ ] Visual QA on desktop (1280px+)
- [ ] Visual QA on mobile (375px)
- [ ] Verify landing page loads without console errors
- [ ] Verify all links work (register, login, demo, GitHub, legal pages)
- [ ] Verify StickyCTABar still appears on mobile scroll
- [ ] Verify analytics tracking still fires on CTA clicks
EOF
)"
```

**Step 3: Return PR URL**
