# User Acquisition & Growth Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add growth features across 4 phases — lower entry barriers, sharing, SEO, and social proof — to make KlassHub discoverable and shareable.

**Architecture:** Each phase adds a self-contained feature layer. Phase 1 fixes discoverability quick wins and adds Google OAuth. Phase 2 adds a share section to the landing page and dashboard. Phase 3 adds structured data and FAQ for SEO. Phase 4 adds testimonials and social proof.

**Tech Stack:** Next.js 16 App Router, Supabase Auth (Google OAuth), Framer Motion, Jest

---

### Task 1: Add /demo to sitemap and robots

**Files:**
- Modify: `src/app/sitemap.ts`
- Modify: `src/app/robots.ts`

**Step 1: Add /demo to sitemap**

In `src/app/sitemap.ts`, add after the `/register` entry:

```typescript
{ url: `${SITE_URL}/demo`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
```

**Step 2: Verify robots.ts doesn't block /demo**

Check `src/app/robots.ts` — the `disallow` array should NOT include `/demo`. Currently it doesn't, so no change needed.

**Step 3: Commit**

```bash
git add src/app/sitemap.ts
git commit -m "feat: add /demo to sitemap for SEO"
```

---

### Task 2: Improve Demo CTA on hero section

**Files:**
- Modify: `src/components/landing/hero-section.tsx`

**Step 1: Make Demo button tracked and more descriptive**

Find the Demo button (currently a plain `Link` to `/demo`) and replace it with a `TrackedLink` with better copy. Change:

```tsx
<Link href="/demo" ...>
  Demo ansehen
</Link>
```

To:

```tsx
<TrackedLink
  href="/demo"
  event="cta_click"
  props={{ location: "hero_demo" }}
  className={/* same classes as before */}
>
  Demo ansehen — ohne Account
</TrackedLink>
```

Import `TrackedLink` from `@/components/tracked-link` at top of file.

**Step 2: Verify on dev server**

Run: `node node_modules/next/dist/bin/next dev`
Check: Hero section shows both CTAs, "Demo ansehen — ohne Account" is visible.

**Step 3: Commit**

```bash
git add src/components/landing/hero-section.tsx
git commit -m "feat: improve demo CTA copy and add tracking"
```

---

### Task 3: Add Google OAuth login

**Files:**
- Modify: `src/app/login/page.tsx`
- Modify: `src/app/register/page.tsx`
- Create: `src/components/google-login-button.tsx`
- Modify: `src/app/auth/callback/route.ts` (if exists, else create)

**Step 1: Create Google login button component**

Create `src/components/google-login-button.tsx`:

```tsx
"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

export function GoogleLoginButton() {
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  async function handleGoogleLogin() {
    setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) {
      setLoading(false);
    }
  }

  return (
    <Button
      type="button"
      variant="outline"
      className="w-full"
      onClick={handleGoogleLogin}
      disabled={loading}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <>
          <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </svg>
          Mit Google anmelden
        </>
      )}
    </Button>
  );
}
```

**Step 2: Check if auth callback route exists**

Check `src/app/auth/callback/route.ts`. If it exists and handles the OAuth code exchange, no change needed. If it doesn't exist, create it:

```typescript
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth`);
}
```

**Step 3: Add Google button to login page**

In `src/app/login/page.tsx`, import `GoogleLoginButton` and add after the login form, before the "Noch kein Konto?" link:

```tsx
<div className="relative my-4">
  <div className="absolute inset-0 flex items-center">
    <span className="w-full border-t" />
  </div>
  <div className="relative flex justify-center text-xs uppercase">
    <span className="bg-card px-2 text-muted-foreground">oder</span>
  </div>
</div>

<GoogleLoginButton />
```

**Step 4: Add Google button to register page**

Same pattern in `src/app/register/page.tsx` — add the divider and `GoogleLoginButton` after the form submit button, before the "Bereits ein Konto?" link.

**Step 5: Verify on dev server**

Check: Login and Register pages show Google button with "oder" divider.

**Step 6: Commit**

```bash
git add src/components/google-login-button.tsx src/app/login/page.tsx src/app/register/page.tsx src/app/auth/callback/route.ts
git commit -m "feat: add Google OAuth login option"
```

**Note:** Google OAuth requires Supabase Dashboard configuration (Google Cloud credentials). Document this in a comment or README. The button will render but won't work until the Supabase project has Google OAuth enabled.

---

### Task 4: Create share section component

**Files:**
- Create: `src/components/landing/share-section.tsx`
- Modify: `src/app/page.tsx`

**Step 1: Create the share section**

Create `src/components/landing/share-section.tsx`:

```tsx
"use client";

import { useState } from "react";
import { Share2, MessageCircle, Mail, Link2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AnimatedSection } from "./animated-section";
import { trackEvent } from "@/components/analytics";

const SHARE_URL = "https://klasshub.de?ref=share";
const SHARE_TEXT =
  "Hey, ich hab KlassHub gefunden – eine App die WebUntis, Schulmanager & Co. in einem Dashboard vereint. Schau mal:";

export function ShareSection() {
  const [copied, setCopied] = useState(false);

  function shareWhatsApp() {
    trackEvent("share", { method: "whatsapp" });
    window.open(
      `https://wa.me/?text=${encodeURIComponent(`${SHARE_TEXT} ${SHARE_URL}_whatsapp`)}`,
      "_blank"
    );
  }

  function shareEmail() {
    trackEvent("share", { method: "email" });
    window.open(
      `mailto:?subject=${encodeURIComponent("KlassHub – Alle Schul-Apps in einem Dashboard")}&body=${encodeURIComponent(`${SHARE_TEXT}\n\n${SHARE_URL}_email`)}`,
      "_blank"
    );
  }

  async function copyLink() {
    trackEvent("share", { method: "copy_link" });
    await navigator.clipboard.writeText(`${SHARE_URL}_link`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <section className="px-6 py-16">
      <div className="mx-auto max-w-xl">
        <AnimatedSection className="text-center">
          <div className="mx-auto mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
            <Share2 className="h-5 w-5 text-primary" />
          </div>
          <h2 className="text-xl font-bold tracking-tight">
            Teile KlassHub mit anderen Eltern
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Kennst du Eltern, die auch zwischen zu vielen Schul-Apps jonglieren?
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={shareWhatsApp}
              className="gap-2"
            >
              <MessageCircle className="h-4 w-4 text-green-600" />
              WhatsApp
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={shareEmail}
              className="gap-2"
            >
              <Mail className="h-4 w-4" />
              E-Mail
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={copyLink}
              className="gap-2"
            >
              {copied ? (
                <Check className="h-4 w-4 text-green-600" />
              ) : (
                <Link2 className="h-4 w-4" />
              )}
              {copied ? "Kopiert!" : "Link kopieren"}
            </Button>
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
}
```

**Step 2: Add ShareSection to landing page**

In `src/app/page.tsx`, import `ShareSection` and add it between `CTASection` and `StickyCTABar`:

```tsx
import { ShareSection } from "@/components/landing/share-section";

// In the JSX, after <CTASection />:
<ShareSection />
```

**Step 3: Verify on dev server**

Check: Share section appears below the CTA gradient. WhatsApp, Email, Link buttons all visible. "Link kopieren" shows "Kopiert!" feedback.

**Step 4: Commit**

```bash
git add src/components/landing/share-section.tsx src/app/page.tsx
git commit -m "feat: add share section to landing page"
```

---

### Task 5: Add share button to dashboard user menu

**Files:**
- Modify: `src/components/app-shell.tsx`

**Step 1: Add "Empfehlen" item to user dropdown**

In `src/components/app-shell.tsx`, find the user dropdown menu. Add a new menu item before the Settings link:

```tsx
<DropdownMenuItem
  onClick={() => {
    const url = "https://klasshub.de?ref=dashboard_share";
    const text = "Hey, ich hab KlassHub gefunden – eine App die WebUntis, Schulmanager & Co. in einem Dashboard vereint. Schau mal:";
    if (navigator.share) {
      navigator.share({ title: "KlassHub", text, url });
    } else {
      navigator.clipboard.writeText(url);
    }
  }}
>
  <Share2 className="mr-2 h-4 w-4" />
  Empfehlen
</DropdownMenuItem>
```

Import `Share2` from `lucide-react` at top of file.

**Step 2: Verify on dev server**

Log in, click user menu → "Empfehlen" should appear. On mobile it triggers native share sheet, on desktop it copies link.

**Step 3: Commit**

```bash
git add src/components/app-shell.tsx
git commit -m "feat: add share/recommend button to dashboard user menu"
```

---

### Task 6: Add JSON-LD structured data to landing page

**Files:**
- Create: `src/components/landing/structured-data.tsx`
- Modify: `src/app/page.tsx`

**Step 1: Create structured data component**

Create `src/components/landing/structured-data.tsx`:

```tsx
export function StructuredData() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "KlassHub",
    applicationCategory: "EducationalApplication",
    operatingSystem: "Web, Android, iOS",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "EUR",
    },
    description:
      "Alle Schul-Apps in einem Dashboard. Stundenplan, Vertretungen und Ausfälle deiner Kinder – zentral an einem Ort.",
    url: "https://klasshub.de",
    author: {
      "@type": "Person",
      name: "Kevin Jägle",
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
```

**Step 2: Add to landing page**

In `src/app/page.tsx`, import and add `<StructuredData />` at the top of the JSX, inside the outer `<div>`:

```tsx
import { StructuredData } from "@/components/landing/structured-data";

// First child inside the outer div:
<StructuredData />
```

**Step 3: Commit**

```bash
git add src/components/landing/structured-data.tsx src/app/page.tsx
git commit -m "feat: add JSON-LD structured data for SEO"
```

---

### Task 7: Add optimized meta tags for /demo page

**Files:**
- Create or modify: `src/app/demo/layout.tsx` (if no layout exists, add metadata export)

**Step 1: Add metadata for demo page**

If `src/app/demo/layout.tsx` doesn't exist, add metadata via a separate `src/app/demo/metadata.ts` or add it directly to the page. The simplest approach — export metadata from the demo page file or create a new `src/app/demo/layout.tsx`:

Since `/demo` is a page within `src/app/demo/page.tsx`, add at the top of that file (before the default export):

```typescript
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Demo – Schul-Dashboard kostenlos testen",
  description:
    "Teste KlassHub kostenlos ohne Account. Sieh Stundenplan, Vertretungen und Nachrichten in einem Dashboard – so wie echte Eltern es nutzen.",
};
```

**Note:** If `page.tsx` is a client component (`"use client"`), metadata must go in a separate `layout.tsx`. Check the file first — if it has `"use client"`, create `src/app/demo/layout.tsx` with the metadata export instead.

**Step 2: Commit**

```bash
git add src/app/demo/
git commit -m "feat: add SEO meta tags for demo page"
```

---

### Task 8: Create FAQ section with schema markup

**Files:**
- Create: `src/components/landing/faq-section.tsx`
- Create: `src/components/landing/faq-structured-data.tsx`
- Modify: `src/app/page.tsx`

**Step 1: Create FAQ structured data**

Create `src/components/landing/faq-structured-data.tsx`:

```tsx
const faqs = [
  {
    question: "Ist KlassHub kostenlos?",
    answer:
      "Ja, KlassHub ist während der Beta komplett kostenlos. Alle Features, keine Limits, keine Kreditkarte nötig.",
  },
  {
    question: "Welche Schulplattformen werden unterstützt?",
    answer:
      "Aktuell unterstützt KlassHub WebUntis (verfügbar), Schulmanager, IServ, Moodle und Sdui (alle in Beta). Weitere Plattformen folgen.",
  },
  {
    question: "Sind meine Daten sicher?",
    answer:
      "Ja. KlassHub ist Open Source, DSGVO-konform und speichert Daten ausschließlich in der EU. Passwörter werden nie gespeichert. Du kannst dein Konto jederzeit löschen.",
  },
  {
    question: "Kann ich mehrere Kinder verwalten?",
    answer:
      "Ja, du kannst beliebig viele Kinder hinzufügen – auch von verschiedenen Schulen mit verschiedenen Plattformen.",
  },
  {
    question: "Brauche ich einen Account zum Testen?",
    answer:
      "Nein, du kannst KlassHub in der Demo kostenlos und ohne Account ausprobieren.",
  },
];

export { faqs };

export function FAQStructuredData() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
```

**Step 2: Create FAQ section UI**

Create `src/components/landing/faq-section.tsx`:

```tsx
"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { AnimatedSection } from "./animated-section";
import { faqs } from "./faq-structured-data";

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="px-6 py-24">
      <div className="mx-auto max-w-2xl">
        <AnimatedSection className="mb-10 text-center">
          <h2 className="text-3xl font-bold tracking-tight">
            Häufige Fragen
          </h2>
        </AnimatedSection>

        <div className="space-y-2">
          {faqs.map((faq, i) => (
            <AnimatedSection key={i} delay={i * 0.05}>
              <button
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="flex w-full items-center justify-between rounded-xl border border-gray-200/80 bg-white px-5 py-4 text-left transition-colors hover:bg-gray-50"
              >
                <span className="text-sm font-semibold text-gray-900">
                  {faq.question}
                </span>
                <ChevronDown
                  className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200 ${
                    openIndex === i ? "rotate-180" : ""
                  }`}
                />
              </button>
              <AnimatePresence>
                {openIndex === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <p className="px-5 py-3 text-sm leading-relaxed text-muted-foreground">
                      {faq.answer}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
}
```

**Step 3: Add to landing page**

In `src/app/page.tsx`, import both and add:
- `<FAQStructuredData />` next to `<StructuredData />`
- `<FAQSection />` between `<PricingSection />` and `<CTASection />`

**Step 4: Verify on dev server**

Check: FAQ accordion works, questions expand/collapse smoothly.

**Step 5: Commit**

```bash
git add src/components/landing/faq-section.tsx src/components/landing/faq-structured-data.tsx src/app/page.tsx
git commit -m "feat: add FAQ section with accordion and schema markup"
```

---

### Task 9: Create testimonials section

**Files:**
- Create: `src/components/landing/testimonials-section.tsx`
- Modify: `src/app/page.tsx`

**Step 1: Create testimonials section**

Create `src/components/landing/testimonials-section.tsx`:

```tsx
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
```

**Step 2: Add to landing page**

In `src/app/page.tsx`, import and place `<TestimonialsSection />` between `<FeaturesSection />` and `<PricingSection />`.

**Step 3: Verify on dev server**

Check: Three testimonial cards in a row on desktop, stacked on mobile.

**Step 4: Commit**

```bash
git add src/components/landing/testimonials-section.tsx src/app/page.tsx
git commit -m "feat: add testimonials section to landing page"
```

**Note:** These are placeholder testimonials. Replace with real ones as user feedback comes in.

---

### Task 10: Add GitHub stars badge to footer

**Files:**
- Create: `src/components/github-stars.tsx`
- Modify: `src/components/landing/landing-footer.tsx`

**Step 1: Create GitHub stars component**

Create `src/components/github-stars.tsx`:

```tsx
"use client";

import { useEffect, useState } from "react";
import { Star } from "lucide-react";

export function GitHubStars() {
  const [stars, setStars] = useState<number | null>(null);

  useEffect(() => {
    fetch("https://api.github.com/repos/kevjaeg/klasshub")
      .then((res) => res.json())
      .then((data) => {
        if (typeof data.stargazers_count === "number") {
          setStars(data.stargazers_count);
        }
      })
      .catch(() => {});
  }, []);

  if (stars === null) return null;

  return (
    <span className="inline-flex items-center gap-1">
      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
      {stars}
    </span>
  );
}
```

**Step 2: Add to landing footer**

In `src/components/landing/landing-footer.tsx`, import `GitHubStars` and add it next to the GitHub link:

```tsx
<a href="https://github.com/kevjaeg/klasshub" ...>
  <Github className="h-3.5 w-3.5" />
  GitHub
  <GitHubStars />
</a>
```

**Step 3: Verify on dev server**

Check: Footer shows star count next to GitHub link. If API fails, nothing shows (graceful fallback).

**Step 4: Commit**

```bash
git add src/components/github-stars.tsx src/components/landing/landing-footer.tsx
git commit -m "feat: add GitHub stars badge to landing footer"
```

---

### Task 11: Add user counter to landing page

**Files:**
- Modify: `src/components/landing/hero-section.tsx`

**Step 1: Add counter below hero CTAs**

In `src/components/landing/hero-section.tsx`, find the trust line that says "Einrichtung in unter 2 Minuten · Keine Kreditkarte nötig" and add a user counter. For now use a static number that gets updated manually:

```tsx
<p className="text-sm text-muted-foreground">
  Einrichtung in unter 2 Minuten · Keine Kreditkarte nötig
</p>
```

**Note:** The user counter should only be shown once there are enough users (20+). For now, keep the existing trust line as-is. When ready, add:

```tsx
<p className="text-sm text-muted-foreground">
  ✓ Bereits von <strong>X Eltern</strong> genutzt · Einrichtung in unter 2 Minuten
</p>
```

This task is a placeholder — skip for now and implement when user count is meaningful.

**Step 2: Commit (skip for now)**

No changes needed yet. Move to next task.

---

### Task 12: Final integration test and typecheck

**Step 1: Run typecheck**

```bash
npx tsc --noEmit
```

Expected: No errors.

**Step 2: Run tests**

```bash
npx jest
```

Expected: All existing tests still pass.

**Step 3: Visual QA on dev server**

Check the full landing page top-to-bottom:
1. Hero with both CTAs (Register + Demo)
2. Problem section
3. Platforms grid (uniform tiles)
4. Features grid (uniform tiles, centered)
5. Testimonials section (3 cards)
6. FAQ section (accordion works)
7. Pricing section
8. CTA gradient section
9. Share section (WhatsApp, Email, Link buttons)
10. Footer with GitHub stars

**Step 4: Check mobile (375px)**

Verify all new sections stack properly on mobile.

**Step 5: Final commit and push**

```bash
git push
```
