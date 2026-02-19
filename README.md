<p align="center">
  <img src="https://img.shields.io/github/license/kevinjaegle/klasshub?style=flat-square" alt="License" />
  <img src="https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js" alt="Next.js" />
  <img src="https://img.shields.io/badge/Supabase-Database%20%2B%20Auth-3ECF8E?style=flat-square&logo=supabase" alt="Supabase" />
  <img src="https://img.shields.io/badge/PWA-installierbar-5A0FC8?style=flat-square&logo=pwa" alt="PWA" />
</p>

# KlassHub

**Alle Schul-Apps. Ein Dashboard.**

KlassHub ist eine Open-Source PWA, die Daten aus verschiedenen Schulplattformen (WebUntis, IServ, Schulmanager, Moodle, Sdui) in einem einzigen Dashboard bündelt. Stundenplan, Vertretungen, Hausaufgaben und Nachrichten — für alle Kinder an einem Ort.

## Warum?

Eltern jonglieren mit bis zu 6 verschiedenen Schul-Apps pro Kind. Wer mehrere Kinder hat, verliert den Überblick. KlassHub löst das Problem:

- **Tagesübersicht** — Sieh auf einen Blick, was heute und morgen ansteht
- **Vertretungen live** — Ausfälle rot, Vertretungen orange, sofort erkennbar
- **Mehrere Kinder** — Alle Kinder in einem Dashboard, egal welche Schule
- **Hausaufgaben** — Überfällige und anstehende Aufgaben im Blick, mit eigenen Notizen
- **Nachrichten** — Alle Schulnachrichten zentral lesen
- **Offline-fähig** — Funktioniert auch ohne Internet dank Service Worker
- **Installierbar** — Als PWA auf dem Homescreen, fühlt sich an wie eine native App
- **DSGVO-konform** — Passwörter werden nie gespeichert, Daten in der EU

## Unterstützte Plattformen

| Plattform | Status |
|-----------|--------|
| **WebUntis** | Verfügbar |
| **IServ** | In Arbeit |
| **Schulmanager Online** | In Arbeit |
| **Moodle** | In Arbeit |
| **Sdui** | In Arbeit |

> Deine Schule nutzt eine andere Plattform? [Öffne ein Issue](https://github.com/kevinjaegle/klasshub/issues) oder bau selbst einen Adapter — siehe [Adapter erstellen](#adapter-erstellen).

## Tech-Stack

- **Framework:** [Next.js 16](https://nextjs.org/) (Turbopack in dev, webpack für PWA-Build)
- **Auth & Datenbank:** [Supabase](https://supabase.com/) (PostgreSQL, Row Level Security, Realtime)
- **UI:** [shadcn/ui](https://ui.shadcn.com/) + [Radix UI](https://www.radix-ui.com/) + [Tailwind CSS v4](https://tailwindcss.com/)
- **PWA:** [Serwist](https://serwist.pages.dev/) (Service Worker, Background Sync, Offline-Support)
- **Forms:** react-hook-form + zod
- **Sprache:** TypeScript (strict mode)

## Schnellstart

### Voraussetzungen

- Node.js >= 20
- Ein [Supabase](https://supabase.com/)-Projekt (kostenloser Tier reicht)

### Setup

```bash
# Repo klonen
git clone https://github.com/kevinjaegle/klasshub.git
cd klasshub

# Dependencies installieren
npm install

# Umgebungsvariablen konfigurieren
cp .env.example .env.local
# → NEXT_PUBLIC_SUPABASE_URL und NEXT_PUBLIC_SUPABASE_ANON_KEY eintragen

# Datenbank-Schema pushen
npm run db:push

# Dev-Server starten
npm run dev
```

Die App läuft dann unter [http://localhost:3000](http://localhost:3000).

### Scripts

| Befehl | Beschreibung |
|--------|-------------|
| `npm run dev` | Dev-Server starten (Turbopack) |
| `npm run build` | Production-Build (inkl. Service Worker) |
| `npm run typecheck` | TypeScript prüfen |
| `npm run lint` | ESLint |
| `npm run test` | Tests ausführen |
| `npm run db:push` | Schema zu Supabase pushen |
| `npm run db:reset` | Supabase-Datenbank zurücksetzen |

## Architektur

```
src/
├── app/
│   ├── (app)/           # Authentifizierte Seiten (Dashboard, Stundenplan, ...)
│   ├── api/             # API-Routes (Sync, Homework, Calendar, ...)
│   ├── login/           # Auth-Seiten
│   └── page.tsx         # Landing Page
├── components/
│   ├── ui/              # shadcn/ui Basis-Komponenten
│   └── ...              # App-Komponenten (AppShell, SyncDialog, ...)
└── lib/
    ├── platforms/
    │   ├── types.ts     # PlatformAdapter-Interface, Datentypen
    │   ├── registry.ts  # Platform-Registry (Adapter + UI-Metadaten)
    │   └── adapters/    # Ein Adapter pro Plattform
    ├── supabase/        # Supabase-Client (Server + Browser)
    └── ...              # Utilities (date-utils, sanitize, ...)
```

### Sync-Flow

1. Nutzer gibt Schulplattform-Zugangsdaten ein (werden **nie** gespeichert)
2. `POST /api/sync` ruft den passenden Platform-Adapter auf
3. Adapter holt Daten von der Schulplattform und gibt normalisierte `SyncResult` zurück
4. Neue Daten werden eingefügt, erst danach alte gelöscht (Insert-first-then-delete)
5. Zugangsdaten werden im Speicher überschrieben

## Adapter erstellen

KlassHub nutzt ein Plugin-System für Schulplattformen. So fügst du eine neue Plattform hinzu:

### 1. Adapter implementieren

Erstelle `src/lib/platforms/adapters/meineplattform.ts`:

```typescript
import type { PlatformAdapter, PlatformCredentials, SyncResult } from "../types";

export class MeinePlatformAdapter implements PlatformAdapter {
  readonly id = "meineplattform" as const;

  async sync(
    config: Record<string, string>,
    credentials: PlatformCredentials
  ): Promise<SyncResult> {
    // 1. Bei der Plattform-API einloggen
    // 2. Stundenplan, Vertretungen, Hausaufgaben, Nachrichten abrufen
    // 3. Normalisiertes SyncResult zurückgeben

    return {
      lessons: [],        // Pflicht
      substitutions: [],  // Pflicht
      homework: [],       // Optional
      messages: [],       // Optional
    };
  }
}
```

### 2. Registrieren

In `src/lib/platforms/registry.ts`:
- Adapter-Import und Instanz zur `adapters`-Map hinzufügen
- Plattform-Metadaten (Name, Felder, Farbe) zur `PLATFORMS`-Map hinzufügen

In `src/lib/platforms/types.ts`:
- Neue ID zum `PlatformId`-Union hinzufügen

## Datenbank

Schema in `supabase/schema.sql`, Migrationen in `supabase/migration-*.sql`.

Alle Tabellen nutzen Row Level Security (RLS), scoped auf `auth.uid()`.

| Tabelle | Beschreibung |
|---------|-------------|
| `children` | Kinder mit Schulzuordnung und Plattform-Config |
| `lessons` | Stundenplan (Fach, Lehrer, Raum, Wochentag, Stunde) |
| `substitutions` | Vertretungen/Ausfälle mit Typ und Datum |
| `homework` | Hausaufgaben mit Fälligkeitsdatum und Nutzer-Notizen |
| `messages` | Schulnachrichten |

## Contributing

Beiträge sind willkommen! Besonders gesucht:

- **Neue Platform-Adapter** (IServ, Moodle, Sdui, DieSchulApp, ...)
- **Bug Reports** und Feature Requests via [Issues](https://github.com/kevinjaegle/klasshub/issues)
- **Übersetzungen** (aktuell nur Deutsch)

### Workflow

1. Fork erstellen
2. Feature Branch anlegen (`git checkout -b feature/mein-feature`)
3. Änderungen committen
4. Pull Request öffnen

Bitte stelle sicher, dass `npm run typecheck` und `npm run lint` ohne Fehler durchlaufen.

## Lizenz

[AGPL-3.0](LICENSE) — Du darfst den Code frei nutzen, verändern und verteilen. Wenn du eine modifizierte Version als Service anbietest, muss der Quellcode ebenfalls offengelegt werden.

## Gehostet nutzen

Du willst KlassHub einfach nur nutzen, ohne selbst zu hosten? Die gehostete Version findest du unter [klasshub.de](https://klasshub.de).
