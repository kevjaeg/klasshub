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
