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
