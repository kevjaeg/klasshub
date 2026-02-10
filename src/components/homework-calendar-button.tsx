"use client";

import { CalendarPlus } from "lucide-react";

interface HomeworkCalendarButtonProps {
  subject: string;
  description: string;
  dueDate: string; // YYYY-MM-DD
}

function generateIcs(subject: string, description: string, dueDate: string): string {
  const dateFormatted = dueDate.replace(/-/g, "");
  const nextDay = new Date(dueDate + "T00:00:00");
  nextDay.setDate(nextDay.getDate() + 1);
  const nextDayFormatted = nextDay.toISOString().split("T")[0].replace(/-/g, "");
  const now = new Date().toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
  const uid = `hw-${dateFormatted}-${Math.random().toString(36).slice(2, 9)}@schoolhub`;

  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//SchoolHub//Homework//DE",
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${now}`,
    `DTSTART;VALUE=DATE:${dateFormatted}`,
    `DTEND;VALUE=DATE:${nextDayFormatted}`,
    `SUMMARY:${subject}`,
    `DESCRIPTION:${description.replace(/\n/g, "\\n")}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
}

export function HomeworkCalendarButton({
  subject,
  description,
  dueDate,
}: HomeworkCalendarButtonProps) {
  function handleClick(e: React.MouseEvent) {
    e.stopPropagation();
    const ics = generateIcs(subject, description, dueDate);
    const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${subject}-hausaufgabe.ics`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className="mt-0.5 shrink-0 rounded p-1 text-muted-foreground hover:text-primary hover:bg-muted transition-colors"
      title="Zum Kalender hinzufügen"
    >
      <CalendarPlus className="h-3.5 w-3.5" />
    </button>
  );
}
