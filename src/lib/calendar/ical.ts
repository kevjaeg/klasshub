import type { Lesson, Substitution } from "@/lib/types";

// Generate iCal date string: 20250210T075000
function toICalDate(date: Date): string {
  const y = date.getFullYear();
  const m = (date.getMonth() + 1).toString().padStart(2, "0");
  const d = date.getDate().toString().padStart(2, "0");
  const h = date.getHours().toString().padStart(2, "0");
  const min = date.getMinutes().toString().padStart(2, "0");
  return `${y}${m}${d}T${h}${min}00`;
}

function escapeIcal(text: string): string {
  return text.replace(/[\\;,\n]/g, (match) => {
    if (match === "\n") return "\\n";
    return "\\" + match;
  });
}

// Get dates for the current week (Monday-Friday)
function getCurrentWeekDates(): Date[] {
  const today = new Date();
  const monday = new Date(today);
  monday.setDate(today.getDate() - ((today.getDay() + 6) % 7));

  const dates: Date[] = [];
  for (let i = 0; i < 5; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    dates.push(d);
  }
  return dates;
}

export function generateICalFeed(
  childName: string,
  lessons: Lesson[],
  substitutions: Substitution[]
): string {
  const weekDates = getCurrentWeekDates();
  const events: string[] = [];

  // Generate 4 weeks of recurring lessons
  for (let weekOffset = 0; weekOffset < 4; weekOffset++) {
    for (const lesson of lessons) {
      const dayIndex = lesson.day_of_week - 1; // 0=Monday
      if (dayIndex < 0 || dayIndex > 4) continue;

      const baseDate = new Date(weekDates[dayIndex]);
      baseDate.setDate(baseDate.getDate() + weekOffset * 7);

      const [startH, startM] = lesson.start_time.split(":").map(Number);
      const [endH, endM] = lesson.end_time.split(":").map(Number);

      const start = new Date(baseDate);
      start.setHours(startH, startM, 0, 0);

      const end = new Date(baseDate);
      end.setHours(endH, endM, 0, 0);

      const dateStr = baseDate.toISOString().split("T")[0];

      // Check for substitution on this date + lesson number
      const sub = substitutions.find(
        (s) => s.date === dateStr && s.lesson_number === lesson.lesson_number
      );

      let summary = lesson.subject;
      let description = "";
      let status = "CONFIRMED";

      if (sub) {
        if (sub.type === "cancelled") {
          summary = `[ENTFÄLLT] ${lesson.subject}`;
          status = "CANCELLED";
          description = sub.info_text || "Stunde entfällt";
        } else if (sub.type === "substituted") {
          summary = `[VERTRETUNG] ${sub.new_subject || lesson.subject}`;
          description = `Vertretung: ${sub.new_teacher || ""}`;
          if (sub.info_text) description += `\\n${sub.info_text}`;
        } else if (sub.type === "room_change") {
          summary = `${lesson.subject} [Raum: ${sub.new_room}]`;
          description = "Raumänderung";
        }
      }

      const location = sub?.new_room || lesson.room || "";
      const teacher = sub?.new_teacher || lesson.teacher || "";
      if (teacher && !description) {
        description = teacher;
      }

      const uid = `${dateStr}-${lesson.lesson_number}-${lesson.child_id}@schoolhub`;

      events.push(
        [
          "BEGIN:VEVENT",
          `UID:${uid}`,
          `DTSTART:${toICalDate(start)}`,
          `DTEND:${toICalDate(end)}`,
          `SUMMARY:${escapeIcal(summary)}`,
          description ? `DESCRIPTION:${escapeIcal(description)}` : "",
          location ? `LOCATION:${escapeIcal(location)}` : "",
          `STATUS:${status}`,
          `CATEGORIES:${escapeIcal(childName)}`,
          "END:VEVENT",
        ]
          .filter(Boolean)
          .join("\r\n")
      );
    }
  }

  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    `PRODID:-//SchoolHub//Stundenplan ${escapeIcal(childName)}//DE`,
    `X-WR-CALNAME:${escapeIcal(childName)} – Stundenplan`,
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    ...events,
    "END:VCALENDAR",
  ].join("\r\n");
}
