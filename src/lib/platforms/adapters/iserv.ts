import type {
  PlatformAdapter,
  PlatformCredentials,
  SyncResult,
  LessonData,
  SubstitutionData,
  MessageData,
  HomeworkData,
} from "../types";

// IServ REST API adapter
// IServ exposes a JSON API at https://<school-domain>/iserv/...
// Auth is via session cookie obtained through form-based login

export class IServAdapter implements PlatformAdapter {
  readonly id = "iserv" as const;

  async sync(
    config: Record<string, string>,
    credentials: PlatformCredentials
  ): Promise<SyncResult> {
    const serverUrl = config.serverUrl;
    if (!serverUrl) {
      throw new Error("IServ-URL ist erforderlich");
    }

    const baseUrl = serverUrl.startsWith("http")
      ? serverUrl
      : `https://${serverUrl}`;

    // Step 1: Login to get session cookie
    const sessionCookie = await this.login(
      baseUrl,
      credentials.username,
      credentials.password
    );

    try {
      // Step 2: Fetch data in parallel
      const [lessons, substitutions, messages, homework] = await Promise.all([
        this.fetchTimetable(baseUrl, sessionCookie),
        this.fetchSubstitutions(baseUrl, sessionCookie),
        this.fetchMessages(baseUrl, sessionCookie),
        this.fetchHomework(baseUrl, sessionCookie),
      ]);

      return { lessons, substitutions, messages, homework };
    } finally {
      // Always logout to clean up the session
      await this.logout(baseUrl, sessionCookie).catch(() => {});
    }
  }

  private async login(
    baseUrl: string,
    username: string,
    password: string
  ): Promise<string> {
    // IServ uses form-based auth at /iserv/auth/login
    const loginUrl = `${baseUrl}/iserv/auth/login`;

    const formData = new URLSearchParams();
    formData.append("_username", username);
    formData.append("_password", password);

    const response = await fetch(loginUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: formData.toString(),
      redirect: "manual",
    });

    // IServ returns a redirect (302) with Set-Cookie on success
    const cookies = response.headers.getSetCookie?.() || [];
    const sessionCookie = cookies
      .map((c) => c.split(";")[0])
      .join("; ");

    if (!sessionCookie || response.status >= 400) {
      throw new Error(
        "IServ-Anmeldung fehlgeschlagen. Prüfe Benutzername und Passwort."
      );
    }

    return sessionCookie;
  }

  private async logout(baseUrl: string, cookie: string): Promise<void> {
    await fetch(`${baseUrl}/iserv/auth/logout`, {
      headers: { Cookie: cookie },
      redirect: "manual",
    });
  }

  private async fetchTimetable(
    baseUrl: string,
    cookie: string
  ): Promise<LessonData[]> {
    try {
      // IServ timetable API: /iserv/timetable/table/current
      const response = await fetch(
        `${baseUrl}/iserv/timetable/api/current.json`,
        { headers: { Cookie: cookie, Accept: "application/json" } }
      );

      if (!response.ok) return [];

      const data = await response.json();

      // IServ timetable format varies by school config
      // Common structure: array of entries with day, period, subject, teacher, room
      if (!Array.isArray(data?.entries)) return [];

      return data.entries.map(
        (entry: {
          subject?: string;
          teacher?: string;
          room?: string;
          day?: number;
          period?: number;
          startTime?: string;
          endTime?: string;
        }) => ({
          subject: entry.subject || "Unbekannt",
          teacher: entry.teacher || null,
          room: entry.room || null,
          dayOfWeek: entry.day || 1,
          lessonNumber: entry.period || 0,
          startTime: entry.startTime || "08:00",
          endTime: entry.endTime || "08:45",
        })
      );
    } catch {
      return [];
    }
  }

  private async fetchSubstitutions(
    baseUrl: string,
    cookie: string
  ): Promise<SubstitutionData[]> {
    try {
      const response = await fetch(
        `${baseUrl}/iserv/timetable/api/substitutions.json`,
        { headers: { Cookie: cookie, Accept: "application/json" } }
      );

      if (!response.ok) return [];

      const data = await response.json();

      if (!Array.isArray(data?.substitutions)) return [];

      return data.substitutions.map(
        (s: {
          date?: string;
          period?: number;
          originalSubject?: string;
          newSubject?: string;
          originalTeacher?: string;
          newTeacher?: string;
          room?: string;
          type?: string;
          info?: string;
        }) => ({
          date: s.date || new Date().toISOString().split("T")[0],
          lessonNumber: s.period || 0,
          originalSubject: s.originalSubject || null,
          newSubject: s.newSubject || null,
          originalTeacher: s.originalTeacher || null,
          newTeacher: s.newTeacher || null,
          newRoom: s.room || null,
          type: this.mapSubstitutionType(s.type),
          infoText: s.info || null,
        })
      );
    } catch {
      return [];
    }
  }

  private async fetchMessages(
    baseUrl: string,
    cookie: string
  ): Promise<MessageData[]> {
    try {
      // IServ messages/email API
      const response = await fetch(
        `${baseUrl}/iserv/mail/api/message/list?folder=INBOX&length=20`,
        { headers: { Cookie: cookie, Accept: "application/json" } }
      );

      if (!response.ok) return [];

      const data = await response.json();

      if (!Array.isArray(data?.data)) return [];

      return data.data.map(
        (msg: {
          id?: string;
          subject?: string;
          body?: string;
          from?: string;
          date?: string;
          seen?: boolean;
        }) => ({
          id: String(msg.id || Math.random()),
          title: msg.subject || "Kein Betreff",
          body: msg.body || "",
          sender: msg.from || null,
          date:
            msg.date || new Date().toISOString().split("T")[0],
          read: msg.seen ?? false,
        })
      );
    } catch {
      return [];
    }
  }

  private async fetchHomework(
    baseUrl: string,
    cookie: string
  ): Promise<HomeworkData[]> {
    try {
      // IServ exercise/homework module
      const response = await fetch(
        `${baseUrl}/iserv/exercise/api/exercises.json`,
        { headers: { Cookie: cookie, Accept: "application/json" } }
      );

      if (!response.ok) return [];

      const data = await response.json();

      if (!Array.isArray(data?.exercises)) return [];

      return data.exercises.map(
        (hw: {
          id?: string;
          title?: string;
          description?: string;
          subject?: string;
          dueDate?: string;
          completed?: boolean;
        }) => ({
          id: String(hw.id || Math.random()),
          subject: hw.subject || hw.title || "Unbekannt",
          description: hw.description || hw.title || "",
          dueDate:
            hw.dueDate || new Date().toISOString().split("T")[0],
          completed: hw.completed ?? false,
        })
      );
    } catch {
      return [];
    }
  }

  private mapSubstitutionType(
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
