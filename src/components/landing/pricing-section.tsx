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
