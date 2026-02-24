# User Acquisition & Growth — Design Document

**Datum:** 2026-02-24
**Ansatz:** Quick Wins First — niedrige Hürden → Sharing → SEO → Social Proof

## Kontext

KlassHub hat eine funktionierende Landing Page mit CTAs, eine Demo-Seite und Analytics-Infrastruktur. Es fehlen jedoch aktive Wachstumsmechanismen: kein Referral, kein Social Sharing, keine E-Mail-Liste, kein UTM-Tracking. Das Hauptproblem ist Sichtbarkeit — niemand weiß, dass KlassHub existiert.

## Phase 1: Niedrigere Einstiegshürde

**Ziel:** Besucher können KlassHub mit minimaler Friction ausprobieren.

1. **Demo-Seite in Sitemap** — `/demo` fehlt aktuell in `sitemap.ts`. Einfacher SEO-Win.
2. **Demo-CTA prominenter** — "Demo ansehen" Button gleichwertig neben Registrierung positionieren. Vorschau-Text: "Sieh dir einen echten Schultag an — ohne Account".
3. **Landing → Demo Übergang** — Bessere Kommunikation was in der Demo wartet.
4. **Google Login** — One-Click Social Login via Supabase Auth. Reduziert Signup-Friction auf einen Klick.

## Phase 2: Sharing & Referral

**Ziel:** Besucher und Nutzer bringen neue Nutzer.

1. **Share-Buttons auf Landing Page** — Neuer Bereich nach CTA-Section:
   - WhatsApp teilen (wichtigster Kanal für Eltern in DE)
   - Link kopieren (universell)
   - E-Mail teilen
   - Vorformulierte Nachricht: "Hey, ich hab KlassHub gefunden — eine App die WebUntis, Schulmanager & Co. in einem Dashboard vereint. Schau mal: klasshub.de"
2. **Share im Dashboard** — "Empfehlen"-Button im User-Menü für eingeloggte Nutzer.
3. **UTM-Tracking** — Share-Links mit `?ref=share_whatsapp` / `?ref=share_link` etc. für Analytics.

## Phase 3: SEO & Auffindbarkeit

**Ziel:** Eltern die nach "Schulapp", "WebUntis Alternative" googeln, finden KlassHub.

1. **Strukturierte Daten (JSON-LD)** — `SoftwareApplication` Schema auf Landing Page für Rich Results.
2. **Erweiterte Meta-Tags** — Suchoptimierte `title` und `description` für jede öffentliche Seite:
   - `/` → "KlassHub – WebUntis, Schulmanager & IServ in einem Dashboard für Eltern"
   - `/demo` → "KlassHub Demo – Schul-Dashboard kostenlos testen ohne Account"
3. **FAQ-Section** — Häufige Fragen mit FAQ-Schema-Markup auf der Landing Page:
   - "Ist KlassHub kostenlos?"
   - "Welche Schulplattformen werden unterstützt?"
   - "Sind meine Daten sicher?"
4. **Demo in Sitemap + Robots** — `/demo` aufnehmen.

## Phase 4: Social Proof

**Ziel:** Vertrauen aufbauen durch sichtbare Nutzung.

1. **Testimonial-Section** — Zwischen Features und Pricing. 2-3 Zitate (Platzhalter, später echte). Format: Zitat + Name + Rolle.
2. **Nutzerzähler** — "Bereits X Eltern nutzen KlassHub". Dynamisch aus DB oder manuell. Erst ab ~20+ Nutzern einblenden.
3. **GitHub Stars Badge** — Stars-Counter neben dem GitHub-Link für Open-Source-Credibility.

## Reihenfolge

Phase 1 → 2 → 3 → 4. Jede Phase baut auf der vorherigen auf.
