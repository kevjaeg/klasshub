import type {
  PlatformAdapter,
  PlatformCredentials,
  SyncResult,
  LessonData,
  SubstitutionData,
} from "../types";

// Schulmanager Online API adapter
// Uses the undocumented REST API at https://login.schulmanager-online.de/
// Auth is via JWT token obtained through email/password login

const API_BASE = "https://login.schulmanager-online.de";

export class SchulmanagerAdapter implements PlatformAdapter {
  readonly id = "schulmanager" as const;

  async sync(
    _config: Record<string, string>,
    credentials: PlatformCredentials
  ): Promise<SyncResult> {
    // Step 1: Login to get JWT token
    const token = await this.login(
      credentials.username,
      credentials.password
    );

    try {
      // Step 2: Fetch timetable and substitutions
      const [lessons, substitutions] = await Promise.all([
        this.fetchTimetable(token),
        this.fetchSubstitutions(token),
      ]);

      return { lessons, substitutions };
    } finally {
      // Token is discarded when this scope ends – no logout endpoint needed
    }
  }

  private async login(email: string, password: string): Promise<string> {
    const response = await fetch(`${API_BASE}/api/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ emailOrUsername: email, password }),
    });

    if (!response.ok) {
      throw new Error(
        "Schulmanager-Anmeldung fehlgeschlagen. Prüfe E-Mail und Passwort."
      );
    }

    const data = await response.json();
    const token = data?.token;

    if (!token) {
      throw new Error(
        "Schulmanager-Anmeldung fehlgeschlagen: Kein Token erhalten."
      );
    }

    return token;
  }

  private async fetchTimetable(token: string): Promise<LessonData[]> {
    try {
      // Schulmanager uses a batch/call-based API
      const today = new Date();
      const monday = new Date(today);
      monday.setDate(today.getDate() - ((today.getDay() + 6) % 7));

      const response = await fetch(`${API_BASE}/api/calls`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          bundleVersion: "unknown",
          calls: [
            {
              moduleName: "schedules",
              endpointName: "get-actual-lessons",
              parameters: {
                start: monday.toISOString().split("T")[0],
              },
            },
          ],
        }),
      });

      if (!response.ok) return [];

      const data = await response.json();
      const results = data?.results?.[0]?.result;

      if (!Array.isArray(results?.lessons)) return [];

      return results.lessons.map(
        (entry: {
          subject?: { abbreviation?: string; name?: string };
          teacher?: { firstName?: string; lastName?: string };
          room?: { name?: string };
          weekday?: number;
          lessonNumber?: number;
          startTime?: string;
          endTime?: string;
        }) => ({
          subject:
            entry.subject?.name ||
            entry.subject?.abbreviation ||
            "Unbekannt",
          teacher: entry.teacher
            ? `${entry.teacher.firstName || ""} ${entry.teacher.lastName || ""}`.trim() || null
            : null,
          room: entry.room?.name || null,
          dayOfWeek: entry.weekday || 1,
          lessonNumber: entry.lessonNumber || 0,
          startTime: entry.startTime || "08:00",
          endTime: entry.endTime || "08:45",
        })
      );
    } catch {
      return [];
    }
  }

  private async fetchSubstitutions(
    token: string
  ): Promise<SubstitutionData[]> {
    try {
      const today = new Date();
      const nextWeek = new Date(today);
      nextWeek.setDate(today.getDate() + 7);

      const response = await fetch(`${API_BASE}/api/calls`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          bundleVersion: "unknown",
          calls: [
            {
              moduleName: "schedules",
              endpointName: "get-substitution-plan",
              parameters: {
                start: today.toISOString().split("T")[0],
                end: nextWeek.toISOString().split("T")[0],
              },
            },
          ],
        }),
      });

      if (!response.ok) return [];

      const data = await response.json();
      const results = data?.results?.[0]?.result;

      if (!Array.isArray(results?.substitutions)) return [];

      return results.substitutions.map(
        (s: {
          date?: string;
          lessonNumber?: number;
          originalSubject?: { name?: string };
          newSubject?: { name?: string };
          originalTeacher?: { lastName?: string };
          newTeacher?: { lastName?: string };
          room?: { name?: string };
          type?: string;
          comment?: string;
        }) => ({
          date: s.date || today.toISOString().split("T")[0],
          lessonNumber: s.lessonNumber || 0,
          originalSubject: s.originalSubject?.name || null,
          newSubject: s.newSubject?.name || null,
          originalTeacher: s.originalTeacher?.lastName || null,
          newTeacher: s.newTeacher?.lastName || null,
          newRoom: s.room?.name || null,
          type: this.mapType(s.type),
          infoText: s.comment || null,
        })
      );
    } catch {
      return [];
    }
  }

  private mapType(
    type?: string
  ): "cancelled" | "substituted" | "room_change" | "other" {
    if (!type) return "other";
    const lower = type.toLowerCase();
    if (lower.includes("cancel") || lower.includes("entfall"))
      return "cancelled";
    if (lower.includes("substit") || lower.includes("vertretung"))
      return "substituted";
    if (lower.includes("room") || lower.includes("raum"))
      return "room_change";
    return "other";
  }
}
