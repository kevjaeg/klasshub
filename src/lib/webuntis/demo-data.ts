import type { TimetableEntry, SubstitutionEntry } from "./service";

// Realistic German school timetable for a 7th grader
export const DEMO_LESSONS: TimetableEntry[] = [
  // Monday
  { subject: "Mathematik", teacher: "Hr. Schmidt", room: "A204", dayOfWeek: 1, lessonNumber: 1, startTime: "07:50", endTime: "08:35" },
  { subject: "Mathematik", teacher: "Hr. Schmidt", room: "A204", dayOfWeek: 1, lessonNumber: 2, startTime: "08:40", endTime: "09:25" },
  { subject: "Englisch", teacher: "Fr. Weber", room: "B112", dayOfWeek: 1, lessonNumber: 3, startTime: "09:45", endTime: "10:30" },
  { subject: "Deutsch", teacher: "Fr. Müller", room: "A201", dayOfWeek: 1, lessonNumber: 4, startTime: "10:35", endTime: "11:20" },
  { subject: "Biologie", teacher: "Hr. Fischer", room: "NW3", dayOfWeek: 1, lessonNumber: 5, startTime: "11:40", endTime: "12:25" },
  { subject: "Sport", teacher: "Hr. Wagner", room: "TH1", dayOfWeek: 1, lessonNumber: 6, startTime: "12:30", endTime: "13:15" },

  // Tuesday
  { subject: "Deutsch", teacher: "Fr. Müller", room: "A201", dayOfWeek: 2, lessonNumber: 1, startTime: "07:50", endTime: "08:35" },
  { subject: "Physik", teacher: "Hr. Becker", room: "NW1", dayOfWeek: 2, lessonNumber: 2, startTime: "08:40", endTime: "09:25" },
  { subject: "Physik", teacher: "Hr. Becker", room: "NW1", dayOfWeek: 2, lessonNumber: 3, startTime: "09:45", endTime: "10:30" },
  { subject: "Geschichte", teacher: "Fr. Hoffmann", room: "C305", dayOfWeek: 2, lessonNumber: 4, startTime: "10:35", endTime: "11:20" },
  { subject: "Englisch", teacher: "Fr. Weber", room: "B112", dayOfWeek: 2, lessonNumber: 5, startTime: "11:40", endTime: "12:25" },
  { subject: "Kunst", teacher: "Fr. Klein", room: "K1", dayOfWeek: 2, lessonNumber: 6, startTime: "12:30", endTime: "13:15" },

  // Wednesday
  { subject: "Englisch", teacher: "Fr. Weber", room: "B112", dayOfWeek: 3, lessonNumber: 1, startTime: "07:50", endTime: "08:35" },
  { subject: "Mathematik", teacher: "Hr. Schmidt", room: "A204", dayOfWeek: 3, lessonNumber: 2, startTime: "08:40", endTime: "09:25" },
  { subject: "Französisch", teacher: "Fr. Dupont", room: "B108", dayOfWeek: 3, lessonNumber: 3, startTime: "09:45", endTime: "10:30" },
  { subject: "Französisch", teacher: "Fr. Dupont", room: "B108", dayOfWeek: 3, lessonNumber: 4, startTime: "10:35", endTime: "11:20" },
  { subject: "Musik", teacher: "Hr. Lange", room: "MU1", dayOfWeek: 3, lessonNumber: 5, startTime: "11:40", endTime: "12:25" },

  // Thursday
  { subject: "Deutsch", teacher: "Fr. Müller", room: "A201", dayOfWeek: 4, lessonNumber: 1, startTime: "07:50", endTime: "08:35" },
  { subject: "Deutsch", teacher: "Fr. Müller", room: "A201", dayOfWeek: 4, lessonNumber: 2, startTime: "08:40", endTime: "09:25" },
  { subject: "Chemie", teacher: "Hr. Braun", room: "NW2", dayOfWeek: 4, lessonNumber: 3, startTime: "09:45", endTime: "10:30" },
  { subject: "Erdkunde", teacher: "Fr. Koch", room: "C302", dayOfWeek: 4, lessonNumber: 4, startTime: "10:35", endTime: "11:20" },
  { subject: "Mathematik", teacher: "Hr. Schmidt", room: "A204", dayOfWeek: 4, lessonNumber: 5, startTime: "11:40", endTime: "12:25" },
  { subject: "Religion", teacher: "Hr. Krause", room: "A103", dayOfWeek: 4, lessonNumber: 6, startTime: "12:30", endTime: "13:15" },

  // Friday
  { subject: "Sport", teacher: "Hr. Wagner", room: "TH1", dayOfWeek: 5, lessonNumber: 1, startTime: "07:50", endTime: "08:35" },
  { subject: "Sport", teacher: "Hr. Wagner", room: "TH1", dayOfWeek: 5, lessonNumber: 2, startTime: "08:40", endTime: "09:25" },
  { subject: "Informatik", teacher: "Hr. Neumann", room: "PC1", dayOfWeek: 5, lessonNumber: 3, startTime: "09:45", endTime: "10:30" },
  { subject: "Biologie", teacher: "Hr. Fischer", room: "NW3", dayOfWeek: 5, lessonNumber: 4, startTime: "10:35", endTime: "11:20" },
  { subject: "Englisch", teacher: "Fr. Weber", room: "B112", dayOfWeek: 5, lessonNumber: 5, startTime: "11:40", endTime: "12:25" },
];

// Generate dynamic substitutions based on the current date
export function generateDemoSubstitutions(): SubstitutionEntry[] {
  const today = new Date();
  const todayStr = today.toISOString().split("T")[0];

  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split("T")[0];

  const dayAfter = new Date(today);
  dayAfter.setDate(today.getDate() + 2);
  const dayAfterStr = dayAfter.toISOString().split("T")[0];

  return [
    {
      date: todayStr,
      lessonNumber: 3,
      originalSubject: "Englisch",
      newSubject: null,
      originalTeacher: "Fr. Weber",
      newTeacher: null,
      newRoom: null,
      type: "cancelled",
      infoText: "Lehrkraft erkrankt",
    },
    {
      date: todayStr,
      lessonNumber: 5,
      originalSubject: "Biologie",
      newSubject: "Mathematik",
      originalTeacher: "Hr. Fischer",
      newTeacher: "Hr. Schmidt",
      newRoom: "A204",
      type: "substituted",
      infoText: "Vertretung",
    },
    {
      date: tomorrowStr,
      lessonNumber: 1,
      originalSubject: "Deutsch",
      newSubject: null,
      originalTeacher: "Fr. Müller",
      newTeacher: null,
      newRoom: null,
      type: "cancelled",
      infoText: "1. Stunde entfällt – Unterricht beginnt zur 2. Stunde",
    },
    {
      date: dayAfterStr,
      lessonNumber: 4,
      originalSubject: "Erdkunde",
      newSubject: "Erdkunde",
      originalTeacher: "Fr. Koch",
      newTeacher: "Fr. Koch",
      newRoom: "A201",
      type: "room_change",
      infoText: "Raumänderung",
    },
  ];
}
