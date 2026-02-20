// Safe string helpers for platform data that may contain emoji or unicode

/** Trim and limit a string by grapheme count (handles emoji correctly) */
export function safeString(value: string | null | undefined, maxChars = 200): string | null {
  if (!value) return null;
  const trimmed = value.trim();
  if (trimmed.length === 0) return null;
  const chars = Array.from(trimmed); // splits by grapheme, handles emoji
  if (chars.length > maxChars) {
    return chars.slice(0, maxChars - 1).join("") + "\u2026";
  }
  return trimmed;
}

/** Ensure sync result has valid arrays (defensive against malformed adapter data) */
export function safeSyncResult(data: unknown): {
  lessons: unknown[];
  substitutions: unknown[];
  messages: unknown[];
  homework: unknown[];
  diagnostics: unknown[] | undefined;
} {
  const obj = data && typeof data === "object" ? data as Record<string, unknown> : {};
  return {
    lessons: Array.isArray(obj.lessons) ? obj.lessons : [],
    substitutions: Array.isArray(obj.substitutions) ? obj.substitutions : [],
    messages: Array.isArray(obj.messages) ? obj.messages : [],
    homework: Array.isArray(obj.homework) ? obj.homework : [],
    diagnostics: Array.isArray(obj.diagnostics) ? obj.diagnostics : undefined,
  };
}
