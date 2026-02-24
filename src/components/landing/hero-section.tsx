"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TrackedLink } from "@/components/tracked-link";
import { ShimmerBadge } from "./shimmer-badge";
import { GradientText } from "./gradient-text";
import { FloatingScreenshot } from "./floating-screenshot";

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.21, 0.47, 0.32, 0.98] as const } },
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
            <TrackedLink href="/demo" event="cta_click" props={{ location: "hero_demo" }}>
              <Button size="lg" variant="outline" className="gap-2 rounded-full px-8 text-base">
                Demo ansehen — ohne Account
              </Button>
            </TrackedLink>
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
