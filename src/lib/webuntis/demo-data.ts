import type { TimetableEntry, SubstitutionEntry } from "./service";
import type { MessageData, HomeworkData } from "@/lib/platforms/types";

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

// Realistic school messages
export function generateDemoMessages(): MessageData[] {
  const today = new Date();

  const twoDaysAgo = new Date(today);
  twoDaysAgo.setDate(today.getDate() - 2);

  const fiveDaysAgo = new Date(today);
  fiveDaysAgo.setDate(today.getDate() - 5);

  const oneWeekAgo = new Date(today);
  oneWeekAgo.setDate(today.getDate() - 7);

  return [
    {
      id: "msg-1",
      title: "Elternbrief: Projektwoche 17.–21. März",
      body: "Liebe Eltern,\n\nin der Woche vom 17. bis 21. März findet unsere jährliche Projektwoche statt. Die Schülerinnen und Schüler der 7. Klassen arbeiten zum Thema \"Nachhaltigkeit im Alltag\". Bitte geben Sie Ihrem Kind Materialien zum Basteln mit (Kartons, Stoffreste etc.).\n\nMit freundlichen Grüßen\nDie Schulleitung",
      sender: "Schulleitung",
      date: twoDaysAgo.toISOString(),
      read: false,
    },
    {
      id: "msg-2",
      title: "Wandertag am Freitag – Packliste",
      body: "Liebe Eltern,\n\nam kommenden Freitag findet der Wandertag der Klasse 7b statt. Treffpunkt ist um 8:00 Uhr am Haupteingang. Bitte geben Sie Ihrem Kind festes Schuhwerk, Regenjacke und ausreichend Verpflegung mit. Rückkehr gegen 14:00 Uhr.\n\nBei Rückfragen wenden Sie sich an Fr. Müller.\n\nViele Grüße\nFr. Müller",
      sender: "Fr. Müller",
      date: fiveDaysAgo.toISOString(),
      read: false,
    },
    {
      id: "msg-3",
      title: "Elternsprechtag am 12. März",
      body: "Sehr geehrte Eltern,\n\nder nächste Elternsprechtag findet am 12. März von 15:00 bis 19:00 Uhr statt. Bitte melden Sie sich über das Online-Buchungstool an. Die Terminvergabe ist ab sofort freigeschaltet.\n\nMit freundlichen Grüßen\nDas Sekretariat",
      sender: "Sekretariat",
      date: oneWeekAgo.toISOString(),
      read: true,
    },
    {
      id: "msg-4",
      title: "Neue AGs im 2. Halbjahr",
      body: "Liebe Schülerinnen und Schüler,\n\nim 2. Halbjahr bieten wir folgende neue AGs an:\n- Robotik (Mi, 14:00–15:30)\n- Schulgarten (Do, 14:00–15:00)\n- Theater (Fr, 14:00–16:00)\n\nAnmeldung bis Ende der Woche bei Herrn Neumann.\n\nViele Grüße\nHr. Neumann",
      sender: "Hr. Neumann",
      date: oneWeekAgo.toISOString(),
      read: true,
    },
  ];
}

// Realistic homework assignments
export function generateDemoHomework(): HomeworkData[] {
  const today = new Date();

  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  const inTwoDays = new Date(today);
  inTwoDays.setDate(today.getDate() + 2);

  const inFourDays = new Date(today);
  inFourDays.setDate(today.getDate() + 4);

  const nextWeek = new Date(today);
  nextWeek.setDate(today.getDate() + 7);

  return [
    {
      id: "hw-1",
      subject: "Mathematik",
      description: "S. 142, Aufgaben 3a–d (Gleichungen lösen)",
      dueDate: yesterday.toISOString().split("T")[0],
      completed: false,
    },
    {
      id: "hw-2",
      subject: "Deutsch",
      description: "Aufsatz: \"Mein Lieblingsbuch\" (mind. 250 Wörter)",
      dueDate: tomorrow.toISOString().split("T")[0],
      completed: false,
    },
    {
      id: "hw-3",
      subject: "Englisch",
      description: "Workbook p. 67, Ex. 1–3 (Past Simple)",
      dueDate: inTwoDays.toISOString().split("T")[0],
      completed: false,
    },
    {
      id: "hw-4",
      subject: "Biologie",
      description: "Arbeitsblatt Fotosynthese ausfüllen",
      dueDate: inFourDays.toISOString().split("T")[0],
      completed: true,
    },
    {
      id: "hw-5",
      subject: "Geschichte",
      description: "Referat vorbereiten: Industrielle Revolution (5 Min.)",
      dueDate: nextWeek.toISOString().split("T")[0],
      completed: false,
    },
  ];
}

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
