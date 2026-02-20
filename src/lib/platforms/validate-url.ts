/**
 * Validate a user-supplied platform URL to prevent SSRF attacks.
 * Blocks private/internal IP ranges and non-HTTPS protocols.
 */
export function validatePlatformUrl(url: string): void {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    throw new Error("Ungültige URL");
  }

  if (parsed.protocol !== "https:") {
    throw new Error("Nur HTTPS-URLs sind erlaubt");
  }

  const host = parsed.hostname.toLowerCase();

  if (
    host === "localhost" ||
    host === "[::1]" ||
    /^127\./.test(host) ||
    /^10\./.test(host) ||
    /^192\.168\./.test(host) ||
    /^172\.(1[6-9]|2\d|3[01])\./.test(host) ||
    /^169\.254\./.test(host) ||
    host.endsWith(".local") ||
    host.endsWith(".internal")
  ) {
    throw new Error("Private oder interne Adressen sind nicht erlaubt");
  }
}
