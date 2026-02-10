import type {
  PlatformAdapter,
  PlatformCredentials,
  SyncResult,
  LessonData,
  SubstitutionData,
  MessageData,
  HomeworkData,
} from "../types";

// Sdui REST API adapter
// Sdui uses a GraphQL-style REST API at https://gateway.sdui.app/
// Auth is via Bearer token obtained through email/password login

const API_BASE = "https://gateway.sdui.app/api/v1";

export class SduiAdapter implements PlatformAdapter {
  readonly id = "sdui" as const;

  async sync(
    config: Record<string, string>,
    credentials: PlatformCredentials
  ): Promise<SyncResult> {
    const schoolId = config.schoolId;
    if (!schoolId) {
      throw new Error("Sdui Schul-ID ist erforderlich");
    }

    // Step 1: Login to get access token
    const token = await this.login(credentials.username, credentials.password);

    try {
      // Step 2: Get user info for timetable context
      const userId = await this.getUserId(token);

      // Step 3: Fetch data in parallel
      const [lessons, substitutions, messages, homework] = await Promise.all([
        this.fetchTimetable(token, userId),
        this.fetchSubstitutions(token, userId),
        this.fetchMessages(token),
        this.fetchHomework(token),
      ]);

      return { lessons, substitutions, messages, homework };
    } finally {
      // Token is short-lived and discarded after scope
    }
  }

  private async login(email: string, password: string): Promise<string> {
    const response = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ identifier: email, password }),
    });

    if (!response.ok) {
      throw new Error(
        "Sdui-Anmeldung fehlgeschlagen. Prüfe E-Mail und Passwort."
      );
    }

    const data = await response.json();
    const token = data?.data?.accesstoken || data?.accesstoken;

    if (!token) {
      throw new Error("Sdui-Anmeldung fehlgeschlagen: Kein Token erhalten.");
    }

    return token;
  }

  private async getUserId(token: string): Promise<number> {
    const response = await fetch(`${API_BASE}/users/self`, {
      headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
    });

    if (!response.ok) throw new Error("Sdui: Benutzerinfo nicht abrufbar.");

    const data = await response.json();
    return data?.data?.id as number;
  }

  private async fetchTimetable(
    token: string,
    userId: number
  ): Promise<LessonData[]> {
    try {
      const today = new Date();
      const monday = new Date(today);
      monday.setDate(today.getDate() - ((today.getDay() + 6) % 7));

      const response = await fetch(
        `${API_BASE}/users/${userId}/timetable?from=${monday.toISOString().split("T")[0]}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );

      if (!response.ok) return [];

      const data = await response.json();
      const entries = data?.data?.lessons || data?.data || [];

      if (!Array.isArray(entries)) return [];

      return entries.map(
        (entry: {
          subject?: { name?: string; shortcut?: string };
          teachers?: { firstname?: string; lastname?: string }[];
          room?: { name?: string };
          weekday?: number;
          position?: number;
          time_start?: string;
          time_end?: string;
        }) => ({
          subject:
            entry.subject?.name ||
            entry.subject?.shortcut ||
            "Unbekannt",
          teacher: entry.teachers?.[0]
            ? `${entry.teachers[0].firstname || ""} ${entry.teachers[0].lastname || ""}`.trim() || null
            : null,
          room: entry.room?.name || null,
          dayOfWeek: entry.weekday || 1,
          lessonNumber: entry.position || 0,
          startTime: entry.time_start?.slice(0, 5) || "08:00",
          endTime: entry.time_end?.slice(0, 5) || "08:45",
        })
      );
    } catch {
      return [];
    }
  }

  private async fetchSubstitutions(
    token: string,
    userId: number
  ): Promise<SubstitutionData[]> {
    try {
      const today = new Date();
      const nextWeek = new Date(today);
      nextWeek.setDate(today.getDate() + 7);

      const response = await fetch(
        `${API_BASE}/users/${userId}/substitutions?from=${today.toISOString().split("T")[0]}&to=${nextWeek.toISOString().split("T")[0]}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );

      if (!response.ok) return [];

      const data = await response.json();
      const entries = data?.data || [];

      if (!Array.isArray(entries)) return [];

      return entries.map(
        (s: {
          date?: string;
          position?: number;
          subject_old?: { name?: string };
          subject_new?: { name?: string };
          teacher_old?: { lastname?: string };
          teacher_new?: { lastname?: string };
          room_new?: { name?: string };
          type?: string;
          comment?: string;
        }) => ({
          date: s.date || today.toISOString().split("T")[0],
          lessonNumber: s.position || 0,
          originalSubject: s.subject_old?.name || null,
          newSubject: s.subject_new?.name || null,
          originalTeacher: s.teacher_old?.lastname || null,
          newTeacher: s.teacher_new?.lastname || null,
          newRoom: s.room_new?.name || null,
          type: this.mapType(s.type),
          infoText: s.comment || null,
        })
      );
    } catch {
      return [];
    }
  }

  private async fetchMessages(token: string): Promise<MessageData[]> {
    try {
      const response = await fetch(`${API_BASE}/notifications?type=news`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      if (!response.ok) return [];

      const data = await response.json();
      const entries = data?.data || [];

      if (!Array.isArray(entries)) return [];

      return entries.slice(0, 20).map(
        (msg: {
          id?: number;
          title?: string;
          body?: string;
          user?: { firstname?: string; lastname?: string };
          created_at?: string;
          read_at?: string | null;
        }) => ({
          id: String(msg.id || Math.random()),
          title: msg.title || "Kein Betreff",
          body: msg.body || "",
          sender: msg.user
            ? `${msg.user.firstname || ""} ${msg.user.lastname || ""}`.trim() || null
            : null,
          date: msg.created_at || new Date().toISOString(),
          read: !!msg.read_at,
        })
      );
    } catch {
      return [];
    }
  }

  private async fetchHomework(token: string): Promise<HomeworkData[]> {
    try {
      const response = await fetch(`${API_BASE}/tasks?filter=student`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      if (!response.ok) return [];

      const data = await response.json();
      const entries = data?.data || [];

      if (!Array.isArray(entries)) return [];

      return entries.map(
        (hw: {
          id?: number;
          title?: string;
          description?: string;
          subject?: { name?: string };
          due_at?: string;
          completed?: boolean;
        }) => ({
          id: String(hw.id || Math.random()),
          subject: hw.subject?.name || "Unbekannt",
          description: hw.title || hw.description || "",
          dueDate: hw.due_at
            ? hw.due_at.split("T")[0]
            : new Date().toISOString().split("T")[0],
          completed: hw.completed ?? false,
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
