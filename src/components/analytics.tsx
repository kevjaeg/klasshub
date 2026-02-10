"use client";

import Script from "next/script";

// ─── Configuration ───────────────────────────────────────────────
// Set ONE of these env vars to activate analytics:
//   NEXT_PUBLIC_PLAUSIBLE_DOMAIN  → e.g. "klasshub.app"
//   NEXT_PUBLIC_GA_ID             → e.g. "G-XXXXXXXXXX"

const PLAUSIBLE_DOMAIN = process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN;
const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

// ─── Event Tracking Helper ───────────────────────────────────────
// Usage:  import { trackEvent } from "@/components/analytics";
//         trackEvent("cta_click", { location: "hero" });

export function trackEvent(name: string, props?: Record<string, string>) {
  // Plausible
  if (typeof window !== "undefined" && "plausible" in window) {
    (window as unknown as { plausible: (name: string, opts?: { props: Record<string, string> }) => void })
      .plausible(name, props ? { props } : undefined);
  }

  // Google Analytics
  if (typeof window !== "undefined" && "gtag" in window) {
    (window as unknown as { gtag: (...args: unknown[]) => void })
      .gtag("event", name, props);
  }
}

// ─── Script Component ────────────────────────────────────────────
// Drop <Analytics /> into your root layout to load the chosen provider.

export function Analytics() {
  if (PLAUSIBLE_DOMAIN) {
    return (
      <Script
        defer
        data-domain={PLAUSIBLE_DOMAIN}
        src="https://plausible.io/js/script.js"
        strategy="afterInteractive"
      />
    );
  }

  if (GA_ID) {
    return (
      <>
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
          strategy="afterInteractive"
        />
        <Script id="ga-init" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_ID}', { send_page_view: true });
          `}
        </Script>
      </>
    );
  }

  // No analytics configured — render nothing
  return null;
}
