"use client";

import { motion } from "framer-motion";
import { Zap, Clock, Users, Shield, Smartphone, Github } from "lucide-react";
import { AnimatedSection } from "./animated-section";

const features = [
  {
    icon: Zap,
    title: "Tagesübersicht",
    description: "Sieh auf einen Blick, was heute und morgen ansteht. Ausfälle sofort erkennen.",
    tint: "bg-blue-50",
    iconColor: "text-blue-600",
    iconBg: "bg-blue-100",
    span: "sm:col-span-2",
  },
  {
    icon: Clock,
    title: "Vertretungen live",
    description: "Ausfälle rot, Vertretungen orange – farbcodiert und sofort erkennbar.",
    tint: "bg-orange-50",
    iconColor: "text-orange-600",
    iconBg: "bg-orange-100",
    span: "",
  },
  {
    icon: Users,
    title: "Mehrere Kinder",
    description: "Alle Kinder in einem Dashboard. Egal welche Schule, egal welche Klasse.",
    tint: "bg-violet-50",
    iconColor: "text-violet-600",
    iconBg: "bg-violet-100",
    span: "",
  },
  {
    icon: Shield,
    title: "Open Source & DSGVO",
    description: "Passwörter werden nie gespeichert. Daten in der EU. Konto jederzeit löschbar.",
    tint: "bg-green-50",
    iconColor: "text-green-600",
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
    tint: "bg-indigo-50",
    iconColor: "text-indigo-600",
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
  show: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: [0.21, 0.47, 0.32, 0.98] as const } },
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
              className={`group rounded-2xl ${f.tint} p-6 shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${f.span}`}
            >
              <div className="flex gap-4">
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${f.iconBg}`}>
                  <f.icon className={`h-5 w-5 ${f.iconColor}`} />
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
