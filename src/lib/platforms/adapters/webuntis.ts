import type { PlatformAdapter, PlatformCredentials, SyncResult } from "../types";
import { syncWebUntis } from "@/lib/webuntis/service";
import { validatePlatformUrl } from "../validate-url";

export class WebUntisAdapter implements PlatformAdapter {
  readonly id = "webuntis" as const;

  async sync(
    config: Record<string, string>,
    credentials: PlatformCredentials
  ): Promise<SyncResult> {
    const server = config.server;
    const school = config.school;

    if (!server || !school) {
      throw new Error("WebUntis Server und Schulkürzel sind erforderlich");
    }

    validatePlatformUrl(`https://${server}`);

    const result = await syncWebUntis(
      server,
      school,
      credentials.username,
      credentials.password
    );

    return {
      lessons: result.lessons.map((l) => ({
        subject: l.subject,
        teacher: l.teacher,
        room: l.room,
        dayOfWeek: l.dayOfWeek,
        lessonNumber: l.lessonNumber,
        startTime: l.startTime,
        endTime: l.endTime,
      })),
      substitutions: result.substitutions.map((s) => ({
        date: s.date,
        lessonNumber: s.lessonNumber,
        originalSubject: s.originalSubject,
        newSubject: s.newSubject,
        originalTeacher: s.originalTeacher,
        newTeacher: s.newTeacher,
        newRoom: s.newRoom,
        type: s.type,
        infoText: s.infoText,
      })),
    };
  }
}
