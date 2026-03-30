/**
 * In-memory sliding window rate limiter.
 * Suitable for single-instance deployments (Vercel serverless has short-lived instances).
 * For distributed rate limiting, swap internals to use Vercel KV INCR+EXPIRE.
 */

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateLimitEntry>();

// Cleanup stale entries periodically
const CLEANUP_INTERVAL_MS = 60_000;
let lastCleanup = Date.now();

function cleanup() {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL_MS) return;
  lastCleanup = now;
  for (const [key, entry] of store) {
    if (now > entry.resetAt) store.delete(key);
  }
}

interface RateLimitOptions {
  /** Maximum number of requests allowed within the window */
  maxRequests: number;
  /** Window duration in milliseconds */
  windowMs: number;
}

interface RateLimitResult {
  allowed: boolean;
  /** Remaining requests in current window */
  remaining: number;
  /** Milliseconds until the window resets */
  retryAfterMs: number;
}

/**
 * Check rate limit for a given action + identifier (e.g., userId or IP).
 *
 * @example
 * const rl = rateLimit("create-link", userId, { maxRequests: 10, windowMs: 60_000 });
 * if (!rl.allowed) return NextResponse.json({ error: "Too many requests" }, { status: 429 });
 */
export function rateLimit(
  action: string,
  identifier: string,
  options: RateLimitOptions
): RateLimitResult {
  cleanup();

  const key = `${action}:${identifier}`;
  const now = Date.now();
  const entry = store.get(key);

  // No existing entry or window expired — fresh window
  if (!entry || now > entry.resetAt) {
    store.set(key, { count: 1, resetAt: now + options.windowMs });
    return { allowed: true, remaining: options.maxRequests - 1, retryAfterMs: 0 };
  }

  // Within window
  entry.count++;
  if (entry.count > options.maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      retryAfterMs: entry.resetAt - now,
    };
  }

  return {
    allowed: true,
    remaining: options.maxRequests - entry.count,
    retryAfterMs: 0,
  };
}
