import type {
  PlatformAdapter,
  PlatformCredentials,
  SyncResult,
  LessonData,
  HomeworkData,
} from "../types";

// Moodle Web Services API adapter
// Uses the official REST API at https://<instance>/webservice/rest/server.php
// Auth is via token obtained through /login/token.php

export class MoodleAdapter implements PlatformAdapter {
  readonly id = "moodle" as const;

  async sync(
    config: Record<string, string>,
    credentials: PlatformCredentials
  ): Promise<SyncResult> {
    const instanceUrl = config.instanceUrl;
    if (!instanceUrl) {
      throw new Error("Moodle-URL ist erforderlich");
    }

    const baseUrl = instanceUrl.startsWith("http")
      ? instanceUrl.replace(/\/$/, "")
      : `https://${instanceUrl}`.replace(/\/$/, "");

    // Step 1: Get API token via login
    const token = await this.getToken(
      baseUrl,
      credentials.username,
      credentials.password
    );

    // Step 2: Get user info to find enrolled courses
    const userId = await this.getUserId(baseUrl, token);

    // Step 3: Fetch courses and assignments in parallel
    const [courses, homework] = await Promise.all([
      this.fetchCourses(baseUrl, token, userId),
      this.fetchAssignments(baseUrl, token),
    ]);

    // Convert courses to "lessons" (Moodle doesn't have a timetable,
    // but we can show enrolled courses as lesson entries)
    const lessons: LessonData[] = courses.map((course, index) => ({
      subject: course.name,
      teacher: null,
      room: null,
      dayOfWeek: (index % 5) + 1, // Distribute across weekdays for display
      lessonNumber: Math.floor(index / 5) + 1,
      startTime: "08:00",
      endTime: "08:45",
    }));

    return {
      lessons,
      substitutions: [], // Moodle doesn't have substitutions
      homework,
    };
  }

  private async getToken(
    baseUrl: string,
    username: string,
    password: string
  ): Promise<string> {
    const params = new URLSearchParams({
      username,
      password,
      service: "moodle_mobile_app",
    });

    const response = await fetch(
      `${baseUrl}/login/token.php?${params.toString()}`
    );

    if (!response.ok) {
      throw new Error("Moodle-Server nicht erreichbar.");
    }

    const data = await response.json();

    if (data.error) {
      throw new Error(
        `Moodle-Anmeldung fehlgeschlagen: ${data.error}`
      );
    }

    if (!data.token) {
      throw new Error(
        "Moodle-Anmeldung fehlgeschlagen. Prüfe Benutzername und Passwort."
      );
    }

    return data.token;
  }

  private async getUserId(
    baseUrl: string,
    token: string
  ): Promise<number> {
    const data = await this.callApi(
      baseUrl,
      token,
      "core_webservice_get_site_info"
    );
    return data.userid as number;
  }

  private async fetchCourses(
    baseUrl: string,
    token: string,
    userId: number
  ): Promise<{ id: number; name: string }[]> {
    try {
      const data = await this.callApi(
        baseUrl,
        token,
        "core_enrol_get_users_courses",
        { userid: userId }
      );

      if (!Array.isArray(data)) return [];

      return data.map((course: { id: number; fullname?: string; shortname?: string }) => ({
        id: course.id,
        name: course.fullname || course.shortname || "Kurs",
      }));
    } catch {
      return [];
    }
  }

  private async fetchAssignments(
    baseUrl: string,
    token: string
  ): Promise<HomeworkData[]> {
    try {
      const data = await this.callApi(
        baseUrl,
        token,
        "mod_assign_get_assignments"
      );

      if (!Array.isArray(data?.courses)) return [];

      const homework: HomeworkData[] = [];

      for (const course of data.courses) {
        const courseName =
          course.fullname || course.shortname || "Kurs";

        if (!Array.isArray(course.assignments)) continue;

        for (const assignment of course.assignments) {
          homework.push({
            id: String(assignment.id),
            subject: courseName,
            description: assignment.name || "Aufgabe",
            dueDate: assignment.duedate
              ? new Date(assignment.duedate * 1000)
                  .toISOString()
                  .split("T")[0]
              : new Date().toISOString().split("T")[0],
            completed: false,
          });
        }
      }

      return homework;
    } catch {
      return [];
    }
  }

  private async callApi(
    baseUrl: string,
    token: string,
    functionName: string,
    params: Record<string, string | number> = {}
  ): Promise<Record<string, unknown>> {
    const queryParams = new URLSearchParams({
      wstoken: token,
      wsfunction: functionName,
      moodlewsrestformat: "json",
      ...Object.fromEntries(
        Object.entries(params).map(([k, v]) => [k, String(v)])
      ),
    });

    const response = await fetch(
      `${baseUrl}/webservice/rest/server.php?${queryParams.toString()}`
    );

    if (!response.ok) {
      throw new Error(`Moodle API-Fehler: ${response.status}`);
    }

    const data = await response.json();

    if (data?.exception) {
      throw new Error(
        `Moodle API-Fehler: ${data.message || data.exception}`
      );
    }

    return data;
  }
}
