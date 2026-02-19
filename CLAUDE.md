# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

KlassHub is a German-language PWA that aggregates data from multiple school platforms (WebUntis, IServ, Schulmanager, Moodle, Sdui) into a single dashboard. Parents can manage multiple children, each connected to a different school platform.

## Commands

```bash
npm run dev          # Start dev server (Turbopack)
npm run build        # Production build (webpack, required for Serwist PWA)
npm run lint         # ESLint
npm run typecheck    # TypeScript type checking (tsc --noEmit)
npm run test         # Jest tests
npm run db:push      # Push schema to Supabase
npm run db:reset     # Reset Supabase database
```

## Architecture

### Route Groups & Layouts

- `src/app/(app)/` — Authenticated app pages (dashboard, timetable, homework, messages, insights, children, settings). The `(app)/layout.tsx` checks auth via Supabase and wraps content in `AppShell` (top bar + bottom nav).
- `src/app/` — Public pages: landing page (`page.tsx`), `/login`, `/register`, `/demo`, `/datenschutz`, `/impressum`, `/offline`.
- `src/app/api/` — API routes: `/api/sync` (platform data sync), `/api/demo` (demo data), `/api/homework/*` (toggle/notes), `/api/calendar/[childId]` (iCal export), `/api/webuntis-schools` (school search).

### Auth & Middleware

- `src/middleware.ts` delegates to `src/lib/supabase/middleware.ts`
- Unauthenticated users are redirected to `/login` (except public paths: `/login`, `/register`, `/auth/callback`, `/`)
- Authenticated users are redirected away from `/login` and `/register` to `/dashboard`
- Supabase clients: `src/lib/supabase/server.ts` (server components/API routes), `src/lib/supabase/client.ts` (browser)

### Platform Adapter System

The core extensibility pattern for adding school platform integrations:

- `src/lib/platforms/types.ts` — `PlatformAdapter` interface, `PlatformId` union type, data types (`SyncResult`, `LessonData`, `SubstitutionData`, etc.)
- `src/lib/platforms/registry.ts` — Maps platform IDs to adapter instances and UI metadata (`PLATFORMS` record with name, fields, color)
- `src/lib/platforms/adapters/` — One file per platform. Each implements `PlatformAdapter.sync()` returning normalized `SyncResult`
- To add a new platform: create adapter in `adapters/`, add to `registry.ts` maps, add ID to `PlatformId` union

### Sync Flow

`POST /api/sync` receives `{ childId, username, password }`:
1. Verifies auth and child ownership (+ RLS)
2. Rate-limits to 5-minute intervals per child
3. Calls `adapter.sync()` for the child's platform
4. Uses insert-first-then-delete strategy (old data kept as safety net until new inserts succeed)
5. Preserves user-edited homework fields (notes, completed) across syncs
6. Credentials are overwritten in memory after use

### PWA / Service Worker

- Serwist-based (`src/app/sw.ts`), disabled in dev mode
- Dev uses Turbopack; production build uses webpack (required for Serwist)
- Offline support: Supabase GET queries use StaleWhileRevalidate, API mutations use BackgroundSyncPlugin
- Offline fallback page at `/offline`

### Key Utilities

- `src/lib/date-utils.ts` — All dates use Europe/Berlin timezone (`todayBerlin()`, `dateBerlin()`, `dowBerlin()`)
- `src/lib/sanitize.ts` — `safeString()` for grapheme-safe string truncation, `safeSyncResult()` for defensive array validation
- `src/lib/types.ts` — Database row types (Child, Lesson, Substitution, Message, Homework)

## Conventions

- **UI language is German** — all user-facing text, error messages, labels, and toasts must be in German
- **Path alias**: `@/*` maps to `./src/*`
- **UI components**: shadcn/ui in `src/components/ui/`, built on Radix UI + Tailwind CSS v4
- **Forms**: react-hook-form + zod validation
- **Icons**: lucide-react
- **Theming**: next-themes with light/dark support

## Environment

Requires `.env.local` with `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` (copy from `.env.example`).

## Database

Schema in `supabase/schema.sql` with migrations in `supabase/migration-*.sql`. All tables use RLS scoped to `auth.uid()`. Core tables: `children`, `lessons`, `substitutions`, `homework`, `messages`.
