// Timezone-aware date utilities
// All school data is German, so we use Europe/Berlin consistently.

const TZ = "Europe/Berlin";

/** Current date in Europe/Berlin as YYYY-MM-DD */
export function todayBerlin(): string {
  return new Date().toLocaleDateString("en-CA", { timeZone: TZ });
}

/** Date offset from today in Europe/Berlin as YYYY-MM-DD */
export function dateBerlin(daysFromNow: number): string {
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  return d.toLocaleDateString("en-CA", { timeZone: TZ });
}

/** Day of week in Europe/Berlin (1=Monday … 7=Sunday) */
export function dowBerlin(daysFromNow = 0): number {
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  // getDay() uses UTC, but we need Berlin local day
  const weekday = new Intl.DateTimeFormat("en-US", {
    timeZone: TZ,
    weekday: "short",
  }).format(d);
  const map: Record<string, number> = {
    Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6, Sun: 7,
  };
  return map[weekday] ?? 1;
}
