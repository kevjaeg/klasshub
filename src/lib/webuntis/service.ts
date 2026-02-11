import https from "https";
import { WebUntis } from "webuntis";

/**
 * Shared HTTPS agent that tolerates servers with incomplete certificate chains.
 * Many WebUntis instances omit intermediate CA certs, causing Node.js to reject
 * the connection with "unable to verify the first certificate".
 * Scoped only to WebUntis requests – does not affect other connections.
 */
const lenientAgent = new https.Agent({ rejectUnauthorized: false });

export interface TimetableEntry {
  subject: string;
  teacher: string | null;
  room: string | null;
  dayOfWeek: number; // 1=Monday, 5=Friday
  lessonNumber: number;
  startTime: string; // "08:00"
  endTime: string; // "08:45"
}

export interface SubstitutionEntry {
  date: string; // "2025-01-15"
  lessonNumber: number;
  originalSubject: string | null;
  newSubject: string | null;
  originalTeacher: string | null;
  newTeacher: string | null;
  newRoom: string | null;
  type: "cancelled" | "substituted" | "room_change" | "other";
  infoText: string | null;
}

export interface SyncResult {
  lessons: TimetableEntry[];
  substitutions: SubstitutionEntry[];
}

function untisTimeToString(time: number): string {
  // WebUntis returns time as integer, e.g. 800 = 08:00, 1345 = 13:45
  const hours = Math.floor(time / 100);
  const minutes = time % 100;
  return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
}

function getDayOfWeek(date: number): number {
  // WebUntis date is YYYYMMDD integer
  const str = date.toString();
  const d = new Date(
    parseInt(str.slice(0, 4)),
    parseInt(str.slice(4, 6)) - 1,
    parseInt(str.slice(6, 8))
  );
  const day = d.getDay();
  return day === 0 ? 7 : day;
}

function untisDateToISO(date: number): string {
  const str = date.toString();
  return `${str.slice(0, 4)}-${str.slice(4, 6)}-${str.slice(6, 8)}`;
}

export async function syncWebUntis(
  server: string,
  school: string,
  username: string,
  password: string
): Promise<SyncResult> {
  const untis = new WebUntis(school, username, password, server);
  untis.axios.defaults.httpsAgent = lenientAgent;

  try {
    await untis.login();

    // Get current week timetable
    const today = new Date();
    const monday = new Date(today);
    monday.setDate(today.getDate() - ((today.getDay() + 6) % 7));

    const friday = new Date(monday);
    friday.setDate(monday.getDate() + 4);

    const ownTimetable = await untis.getOwnTimetableForRange(monday, friday);

    // Build lessons from timetable, deduplicating by day+period
    const lessonMap = new Map<string, TimetableEntry>();
    const substitutions: SubstitutionEntry[] = [];

    for (const entry of ownTimetable) {
      const dow = getDayOfWeek(entry.date);
      const lessonNum = entry.lsnumber || 0;

      const subjects = entry.su || [];
      const teachers = entry.te || [];
      const rooms = entry.ro || [];

      const subjectName = subjects[0]?.longname || subjects[0]?.name || "Unbekannt";
      const teacherName = teachers[0]?.longname || teachers[0]?.name || null;
      const roomName = rooms[0]?.longname || rooms[0]?.name || null;

      // Check if this is a substitution/cancellation
      if (entry.code === "cancelled" || entry.code === "irregular" || entry.substText) {
        let type: SubstitutionEntry["type"] = "other";
        if (entry.code === "cancelled") type = "cancelled";
        else if (entry.code === "irregular") type = "substituted";

        substitutions.push({
          date: untisDateToISO(entry.date),
          lessonNumber: lessonNum,
          originalSubject: subjectName,
          newSubject: entry.code === "cancelled" ? null : subjectName,
          originalTeacher: teacherName,
          newTeacher: entry.code === "cancelled" ? null : teacherName,
          newRoom: entry.code === "cancelled" ? null : roomName,
          type,
          infoText: entry.substText || entry.info || null,
        });
      }

      // Build regular timetable (skip duplicates per day+lesson)
      const key = `${dow}-${lessonNum}`;
      if (!lessonMap.has(key)) {
        lessonMap.set(key, {
          subject: subjectName,
          teacher: teacherName,
          room: roomName,
          dayOfWeek: dow,
          lessonNumber: lessonNum,
          startTime: untisTimeToString(entry.startTime),
          endTime: untisTimeToString(entry.endTime),
        });
      }
    }

    // Also try to fetch substitutions for next 7 days
    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);

    try {
      const futureTimetable = await untis.getOwnTimetableForRange(
        new Date(friday.getTime() + 86400000), // day after friday
        nextWeek
      );

      for (const entry of futureTimetable) {
        if (entry.code === "cancelled" || entry.code === "irregular" || entry.substText) {
          const subjects = entry.su || [];
          const teachers = entry.te || [];
          const rooms = entry.ro || [];

          let type: SubstitutionEntry["type"] = "other";
          if (entry.code === "cancelled") type = "cancelled";
          else if (entry.code === "irregular") type = "substituted";

          substitutions.push({
            date: untisDateToISO(entry.date),
            lessonNumber: entry.lsnumber || 0,
            originalSubject: subjects[0]?.longname || subjects[0]?.name || null,
            newSubject: entry.code === "cancelled" ? null : (subjects[0]?.longname || subjects[0]?.name || null),
            originalTeacher: teachers[0]?.longname || teachers[0]?.name || null,
            newTeacher: entry.code === "cancelled" ? null : (teachers[0]?.longname || teachers[0]?.name || null),
            newRoom: entry.code === "cancelled" ? null : (rooms[0]?.longname || rooms[0]?.name || null),
            type,
            infoText: entry.substText || entry.info || null,
          });
        }
      }
    } catch {
      // Future data might not be available, continue
    }

    await untis.logout();

    return {
      lessons: Array.from(lessonMap.values()),
      substitutions,
    };
  } catch (error) {
    try {
      await untis.logout();
    } catch {
      // Ignore logout errors
    }
    throw error;
  }
}
