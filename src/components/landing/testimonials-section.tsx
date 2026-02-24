"use client";

import { AnimatedSection } from "./animated-section";
import { Quote } from "lucide-react";

const testimonials = [
  {
    quote:
      "Endlich muss ich morgens nicht mehr drei Apps öffnen, um zu wissen ob meine Kinder Ausfall haben.",
    name: "Lisa M.",
    role: "Mutter von 2 Kindern",
  },
  {
    quote:
      "Als Elternbeirätin empfehle ich KlassHub allen Eltern. Übersichtlich, schnell, und kostenlos.",
    name: "Sabine K.",
    role: "Elternbeirätin",
  },
  {
    quote:
      "Mein Mann und ich nutzen KlassHub beide – wir sehen sofort, wenn sich im Stundenplan was ändert.",
    name: "Thomas R.",
    role: "Vater von 3 Kindern",
  },
];

export function TestimonialsSection() {
  return (
    <section className="bg-muted/20 px-6 py-24">
      <div className="mx-auto max-w-4xl">
        <AnimatedSection className="mb-10 text-center">
          <h2 className="text-3xl font-bold tracking-tight">
            Das sagen Eltern
          </h2>
        </AnimatedSection>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {testimonials.map((t, i) => (
            <AnimatedSection key={i} delay={i * 0.1}>
              <div className="flex h-full flex-col rounded-2xl border border-gray-200/80 bg-white p-6">
                <Quote className="mb-3 h-5 w-5 text-primary/30" />
                <p className="flex-1 text-sm leading-relaxed text-gray-700">
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div className="mt-4 border-t pt-3">
                  <p className="text-sm font-semibold text-gray-900">
                    {t.name}
                  </p>
                  <p className="text-xs text-muted-foreground">{t.role}</p>
                </div>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
}
