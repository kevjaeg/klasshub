/**
 * Simple in-memory rate limiter for API routes.
 * Tracks request timestamps per key (typically user ID).
 * Note: resets on server restart and is per-instance only.
 */

interface RateLimitEntry {
  timestamps: number[];
}

const store = new Map<string, RateLimitEntry>();

// Clean up expired entries every 5 minutes
const cleanup = setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of store) {
    entry.timestamps = entry.timestamps.filter((t) => now - t < 600_000);
    if (entry.timestamps.length === 0) store.delete(key);
  }
}, 300_000);
cleanup.unref();

/**
 * Check if a request is within the rate limit.
 * @param key   Unique identifier (e.g. userId or userId:endpoint)
 * @param limit Max number of requests in the window
 * @param windowMs Time window in milliseconds
 * @returns { allowed: boolean, remaining: number }
 */
export function rateLimit(
  key: string,
  limit: number,
  windowMs: number
): { allowed: boolean; remaining: number } {
  const now = Date.now();
  let entry = store.get(key);

  if (!entry) {
    entry = { timestamps: [] };
    store.set(key, entry);
  }

  // Remove timestamps outside the window
  entry.timestamps = entry.timestamps.filter((t) => now - t < windowMs);

  if (entry.timestamps.length >= limit) {
    return { allowed: false, remaining: 0 };
  }

  entry.timestamps.push(now);
  return { allowed: true, remaining: limit - entry.timestamps.length };
}
