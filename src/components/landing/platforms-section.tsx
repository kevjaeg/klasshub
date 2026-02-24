"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { AnimatedSection } from "./animated-section";

const platforms = [
  { name: "WebUntis", short: "WE", color: "bg-orange-100 text-orange-700 ring-orange-200", status: "live" as const },
  { name: "Schulmanager", short: "SC", color: "bg-green-100 text-green-700 ring-green-200", status: "beta" as const },
  { name: "IServ", short: "IS", color: "bg-blue-100 text-blue-700 ring-blue-200", status: "beta" as const },
  { name: "Moodle", short: "MO", color: "bg-yellow-100 text-yellow-700 ring-yellow-200", status: "beta" as const },
  { name: "Sdui", short: "SD", color: "bg-purple-100 text-purple-700 ring-purple-200", status: "beta" as const },
  { name: "DieSchulApp", short: "DS", color: "bg-rose-100 text-rose-700 ring-rose-200", status: "soon" as const },
];

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

const item = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.5, ease: [0.21, 0.47, 0.32, 0.98] as const } },
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
          className="grid grid-cols-2 gap-4 sm:grid-cols-3"
        >
          {platforms.map((p) => (
            <motion.div
              key={p.name}
              variants={item}
              className={`group relative flex flex-col items-center gap-3 rounded-2xl border border-white/60 bg-white/70 p-6 shadow-sm backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md ${
                p.status === "soon" ? "opacity-50" : ""
              }`}
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
