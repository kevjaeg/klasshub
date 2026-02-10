const SETTINGS_KEY = "klasshub-notification-settings";

export interface NotificationSettings {
  substitutions: boolean;
  messages: boolean;
  homework: boolean;
}

const defaultSettings: NotificationSettings = {
  substitutions: true,
  messages: true,
  homework: true,
};

export function getNotificationSettings(): NotificationSettings {
  if (typeof window === "undefined") return defaultSettings;
  try {
    const stored = localStorage.getItem(SETTINGS_KEY);
    if (!stored) return defaultSettings;
    return { ...defaultSettings, ...JSON.parse(stored) };
  } catch {
    return defaultSettings;
  }
}

export function saveNotificationSettings(settings: NotificationSettings) {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

export async function requestPermission(): Promise<NotificationPermission> {
  if (!("Notification" in window)) return "denied";
  if (Notification.permission === "granted") return "granted";
  if (Notification.permission === "denied") return "denied";
  return Notification.requestPermission();
}

export interface SyncCounts {
  substitutions: number;
  messages: number;
  homework: number;
}

export function sendSyncNotifications(
  oldCounts: SyncCounts,
  newCounts: SyncCounts,
  childName: string
) {
  if (typeof window === "undefined") return;
  if (!("Notification" in window)) return;
  if (Notification.permission !== "granted") return;

  const settings = getNotificationSettings();
  const lines: string[] = [];

  const newSubs = newCounts.substitutions - oldCounts.substitutions;
  const newMsgs = newCounts.messages - oldCounts.messages;
  const newHw = newCounts.homework - oldCounts.homework;

  if (settings.substitutions && newSubs > 0) {
    lines.push(`${newSubs} neue Vertretung${newSubs > 1 ? "en" : ""}`);
  }
  if (settings.messages && newMsgs > 0) {
    lines.push(`${newMsgs} neue Nachricht${newMsgs > 1 ? "en" : ""}`);
  }
  if (settings.homework && newHw > 0) {
    lines.push(`${newHw} neue Hausaufgabe${newHw > 1 ? "n" : ""}`);
  }

  if (lines.length === 0) return;

  const body = lines.join(", ");

  if ("serviceWorker" in navigator && navigator.serviceWorker.controller) {
    navigator.serviceWorker.controller.postMessage({
      type: "SHOW_NOTIFICATION",
      title: `KlassHub – ${childName}`,
      options: {
        body,
        icon: "/icon-192.svg",
        badge: "/icon-192.svg",
        tag: `sync-${childName}`,
        data: {
          url: "/dashboard",
        },
      },
    });
  } else {
    new Notification(`KlassHub – ${childName}`, {
      body,
      icon: "/icon-192.svg",
      tag: `sync-${childName}`,
    });
  }
}
