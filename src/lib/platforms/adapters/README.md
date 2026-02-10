# Platform Adapters

Each adapter connects SchoolHub to a school platform (WebUntis, IServ, Schulmanager, Moodle, Sdui, etc.).

## Architecture

```
types.ts          – PlatformAdapter interface + shared data types
registry.ts       – Platform metadata (UI fields, colors) + adapter instances
adapters/
  webuntis.ts     – Reference implementation (delegates to lib/webuntis/service)
  iserv.ts        – Session-cookie auth, REST API
  schulmanager.ts – JWT auth, batch API
  moodle.ts       – Token auth, official Web Services API
  sdui.ts         – Bearer token auth, REST API
```

## How to add a new adapter

### 1. Add the platform ID

In `types.ts`, add your ID to the union type:

```ts
export type PlatformId = "webuntis" | "iserv" | ... | "your_platform";
```

### 2. Create the adapter file

Create `adapters/your_platform.ts` implementing the `PlatformAdapter` interface:

```ts
import type { PlatformAdapter, PlatformCredentials, SyncResult } from "../types";

export class YourPlatformAdapter implements PlatformAdapter {
  readonly id = "your_platform" as const;

  async sync(
    config: Record<string, string>,  // platform_config from the child record
    credentials: PlatformCredentials  // { username, password } – used once, never stored
  ): Promise<SyncResult> {
    // 1. Authenticate with the platform
    // 2. Fetch timetable, substitutions, messages, homework
    // 3. Return normalized SyncResult
    // 4. Credentials go out of scope and are garbage collected
  }
}
```

### 3. Register in registry.ts

Add platform metadata (name, fields, color) to `PLATFORMS` and an instance to `adapters`.

### SyncResult contract

```ts
{
  lessons: LessonData[];         // Weekly timetable entries (required)
  substitutions: SubstitutionData[]; // Schedule changes (required, can be [])
  messages?: MessageData[];      // School messages/notifications (optional)
  homework?: HomeworkData[];     // Assignments with due dates (optional)
}
```

### Auth patterns used

| Platform       | Auth method                  | Cleanup        |
|----------------|------------------------------|----------------|
| WebUntis       | JSON-RPC session             | Logout call    |
| IServ          | Form POST → session cookie   | Logout call    |
| Schulmanager   | POST /api/login → JWT        | Token discarded|
| Moodle         | /login/token.php → API token | Token discarded|
| Sdui           | POST /auth/login → Bearer    | Token discarded|

### Tips for reverse-engineering APIs

1. Open the school platform in Chrome
2. DevTools → Network → filter by XHR/Fetch
3. Log in and navigate around, note the endpoints
4. Look for: auth endpoint, timetable/schedule, substitutions, messages, tasks/homework
5. Replicate requests in your adapter using `fetch()`
6. Handle errors gracefully – return `[]` for optional data types if a fetch fails
7. Always wrap fetches in try/catch so one failing endpoint doesn't block the whole sync

### Important rules

- **Never store credentials** – use them for the single sync request and discard
- **Graceful degradation** – if messages/homework fetches fail, still return lessons + substitutions
- **German error messages** – users see these in toast notifications
- **Normalize data** – map platform-specific types to the shared `SyncResult` types
