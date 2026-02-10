"use client";

import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { getNotificationSettings } from "@/lib/notifications";

const REMINDER_KEY = "klasshub-last-hw-reminder";

function showNotification(title: string, body: string, url: string) {
  if ("serviceWorker" in navigator && navigator.serviceWorker.controller) {
    navigator.serviceWorker.controller.postMessage({
      type: "SHOW_NOTIFICATION",
      title,
      options: {
        body,
        icon: "/icon-192.svg",
        badge: "/icon-192.svg",
        tag: `reminder-${Date.now()}`,
        data: { url },
      },
    });
  } else if ("Notification" in window && Notification.permission === "granted") {
    new Notification(title, { body, icon: "/icon-192.svg" });
  }
}

/**
 * Checks for homework due tomorrow and sends a reminder notification
 * once per day (tracked via localStorage).
 */
async function checkHomeworkReminder(childIds: string[]) {
  if (!("Notification" in window) || Notification.permission !== "granted") return;
  if (childIds.length === 0) return;

  const settings = getNotificationSettings();
  if (!settings.homework) return;

  // Only remind once per day
  const today = new Date().toISOString().split("T")[0];
  if (localStorage.getItem(REMINDER_KEY) === today) return;

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowDate = tomorrow.toISOString().split("T")[0];

  const supabase = createClient();
  const { data: homework } = await supabase
    .from("homework")
    .select("id, subject")
    .in("child_id", childIds)
    .eq("completed", false)
    .eq("due_date", tomorrowDate);

  if (!homework || homework.length === 0) return;

  localStorage.setItem(REMINDER_KEY, today);

  const subjects = homework.slice(0, 3).map((h) => h.subject).join(", ");
  const extra = homework.length > 3 ? ` und ${homework.length - 3} weitere` : "";

  showNotification(
    "Hausaufgaben für morgen",
    `Du hast noch ${homework.length} Aufgabe${homework.length > 1 ? "n" : ""} für morgen: ${subjects}${extra}`,
    "/homework"
  );
}

/**
 * Checks for overdue homework and sends a morning reminder.
 */
async function checkOverdueReminder(childIds: string[]) {
  if (!("Notification" in window) || Notification.permission !== "granted") return;
  if (childIds.length === 0) return;

  const settings = getNotificationSettings();
  if (!settings.homework) return;

  const OVERDUE_KEY = "klasshub-last-overdue-reminder";
  const today = new Date().toISOString().split("T")[0];
  if (localStorage.getItem(OVERDUE_KEY) === today) return;

  const supabase = createClient();
  const { data: homework } = await supabase
    .from("homework")
    .select("id")
    .in("child_id", childIds)
    .eq("completed", false)
    .lt("due_date", today);

  if (!homework || homework.length === 0) return;

  localStorage.setItem(OVERDUE_KEY, today);

  showNotification(
    "Überfällige Hausaufgaben",
    `${homework.length} Aufgabe${homework.length > 1 ? "n sind" : " ist"} überfällig.`,
    "/homework"
  );
}

export function useNotificationScheduler(childIds: string[]) {
  useEffect(() => {
    if (childIds.length === 0) return;

    // Check immediately on app load
    checkOverdueReminder(childIds);

    // Schedule homework reminder for 18:00
    const now = new Date();
    const reminderTime = new Date();
    reminderTime.setHours(18, 0, 0, 0);

    // If it's past 18:00, still check (user just opened the app in the evening)
    if (now.getHours() >= 18) {
      checkHomeworkReminder(childIds);
      return;
    }

    // Otherwise schedule for 18:00 today
    const msUntilReminder = reminderTime.getTime() - now.getTime();
    const timer = setTimeout(() => {
      checkHomeworkReminder(childIds);
    }, msUntilReminder);

    return () => clearTimeout(timer);
  }, [childIds]);
}
