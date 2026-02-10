# KlassHub

Schulplattform-Aggregator als PWA. Stundenplan, Vertretungen, Hausaufgaben und Nachrichten aus verschiedenen Schulplattformen in einer App.

## Setup

1. Clone repo
2. Copy `.env.example` to `.env.local` and fill in your Supabase credentials
3. Setup Supabase project (see [Database Schema](#database-schema))
4. `npm install`
5. `npm run dev`

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm run typecheck` | Run TypeScript type checking |
| `npm run test` | Run tests |
| `npm run lint` | Run ESLint |
| `npm run db:push` | Push schema to Supabase |
| `npm run db:reset` | Reset Supabase database |

## Supported Platforms

- WebUntis – Stundenplan, Vertretungen, Nachrichten, Hausaufgaben
- IServ – coming soon
- Schulmanager Online – coming soon
- Moodle – coming soon
- Sdui – coming soon

## Database Schema

### `children`
| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid (PK) | |
| `user_id` | uuid (FK → auth.users) | Owner |
| `name` | text | Child's name |
| `school_name` | text | School name |
| `class_name` | text | Class name |
| `platform` | text | Platform ID (webuntis, iserv, ...) |
| `platform_config` | jsonb | Platform-specific config (server, school, etc.) |
| `last_synced_at` | timestamptz | Last successful sync |

### `lessons`
| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid (PK) | |
| `child_id` | uuid (FK → children) | |
| `subject` | text | Subject name |
| `teacher` | text | Teacher name |
| `room` | text | Room |
| `day_of_week` | int | 1=Monday, 7=Sunday |
| `lesson_number` | int | Period number |
| `start_time` | time | Start time |
| `end_time` | time | End time |

### `substitutions`
| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid (PK) | |
| `child_id` | uuid (FK → children) | |
| `date` | date | Date of substitution |
| `lesson_number` | int | Period number |
| `original_subject` | text | Original subject |
| `new_subject` | text | Replacement subject |
| `original_teacher` | text | Original teacher |
| `new_teacher` | text | Replacement teacher |
| `new_room` | text | New room |
| `type` | text | cancelled, substituted, room_change, other |
| `info_text` | text | Additional info |

### `homework`
| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid (PK) | |
| `child_id` | uuid (FK → children) | |
| `external_id` | text | ID from platform (for dedup) |
| `subject` | text | Subject |
| `description` | text | Task description |
| `due_date` | date | Due date |
| `completed` | boolean | Completion status |
| `notes` | text | User notes |

### `messages`
| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid (PK) | |
| `child_id` | uuid (FK → children) | |
| `external_id` | text | ID from platform |
| `title` | text | Message title |
| `body` | text | Message body |
| `sender` | text | Sender name |
| `date` | timestamptz | Message date |
| `read` | boolean | Read status |

## Adding a Platform Adapter

Create a new file in `src/lib/platforms/adapters/`:

```typescript
import type { PlatformAdapter, PlatformCredentials, SyncResult } from "../types";

export class MyPlatformAdapter implements PlatformAdapter {
  readonly id = "myplatform" as const;

  async sync(
    config: Record<string, string>,
    credentials: PlatformCredentials
  ): Promise<SyncResult> {
    // 1. Login to the platform API
    // 2. Fetch timetable, substitutions, homework, messages
    // 3. Return normalized SyncResult

    return {
      lessons: [],        // required
      substitutions: [],   // required
      homework: [],        // optional
      messages: [],        // optional
    };
  }
}
```

Then register it in `src/lib/platforms/registry.ts`:

1. Add the adapter import and instance to the `adapters` map
2. Add platform metadata (name, fields, color) to the `PLATFORMS` map
3. Add the new ID to the `PlatformId` union in `types.ts`
