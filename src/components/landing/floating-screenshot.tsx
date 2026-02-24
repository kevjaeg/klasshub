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
        <div style={{ transform: "rotateX(2deg)" }}>
          <ScreenshotCarousel />
        </div>
      </motion.div>
    </motion.div>
  );
}
