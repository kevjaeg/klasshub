import type {
  PlatformAdapter,
  PlatformCredentials,
  SyncResult,
  LessonData,
  SubstitutionData,
  MessageData,
  HomeworkData,
} from "../types";
import { DiagnosticError, fetchWithDiagnostic } from "../sync-diagnostic";
import { validatePlatformUrl } from "../validate-url";

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

    validatePlatformUrl(baseUrl);

    // Step 1: Login to get session cookie
    const sessionCookie = await this.login(
      baseUrl,
      credentials.username,
      credentials.password
    );

    try {
      // Step 2: Fetch data in parallel with diagnostics
      const [l, s, m, h] = await Promise.all([
        this.fetchTimetable(baseUrl, sessionCookie),
        this.fetchSubstitutions(baseUrl, sessionCookie),
        this.fetchMessages(baseUrl, sessionCookie),
        this.fetchHomework(baseUrl, sessionCookie),
      ]);

      const diagnostics = [l.diagnostic, s.diagnostic, m.diagnostic, h.diagnostic]
        .filter(d => d.code !== "ok");

      return {
        lessons: l.data,
        substitutions: s.data,
        messages: m.data,
        homework: h.data,
        diagnostics: diagnostics.length > 0 ? diagnostics : undefined,
      };
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

  private fetchTimetable(baseUrl: string, cookie: string) {
    const url = `${baseUrl}/iserv/timetable/api/current.json`;
    return fetchWithDiagnostic<LessonData[]>("lessons", async () => {
      const response = await fetch(url, {
        headers: { Cookie: cookie, Accept: "application/json" },
      });

      if (!response.ok)
        throw new DiagnosticError("http_error", response.status, `GET ${url} → ${response.status}`);

      const data = await response.json();

      if (!Array.isArray(data?.entries))
        throw new DiagnosticError("shape_mismatch", undefined, `Expected data.entries array, got ${typeof data?.entries}`);

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
    });
  }

  private fetchSubstitutions(baseUrl: string, cookie: string) {
    const url = `${baseUrl}/iserv/timetable/api/substitutions.json`;
    return fetchWithDiagnostic<SubstitutionData[]>("substitutions", async () => {
      const response = await fetch(url, {
        headers: { Cookie: cookie, Accept: "application/json" },
      });

      if (!response.ok)
        throw new DiagnosticError("http_error", response.status, `GET ${url} → ${response.status}`);

      const data = await response.json();

      if (!Array.isArray(data?.substitutions))
        throw new DiagnosticError("shape_mismatch", undefined, `Expected data.substitutions array, got ${typeof data?.substitutions}`);

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
    });
  }

  private fetchMessages(baseUrl: string, cookie: string) {
    const url = `${baseUrl}/iserv/mail/api/message/list?folder=INBOX&length=20`;
    return fetchWithDiagnostic<MessageData[]>("messages", async () => {
      const response = await fetch(url, {
        headers: { Cookie: cookie, Accept: "application/json" },
      });

      if (!response.ok)
        throw new DiagnosticError("http_error", response.status, `GET ${url} → ${response.status}`);

      const data = await response.json();

      if (!Array.isArray(data?.data))
        throw new DiagnosticError("shape_mismatch", undefined, `Expected data.data array, got ${typeof data?.data}`);

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
    });
  }

  private fetchHomework(baseUrl: string, cookie: string) {
    const url = `${baseUrl}/iserv/exercise/api/exercises.json`;
    return fetchWithDiagnostic<HomeworkData[]>("homework", async () => {
      const response = await fetch(url, {
        headers: { Cookie: cookie, Accept: "application/json" },
      });

      if (!response.ok)
        throw new DiagnosticError("http_error", response.status, `GET ${url} → ${response.status}`);

      const data = await response.json();

      if (!Array.isArray(data?.exercises))
        throw new DiagnosticError("shape_mismatch", undefined, `Expected data.exercises array, got ${typeof data?.exercises}`);

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
    });
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
