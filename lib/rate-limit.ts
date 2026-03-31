/**
 * Distributed rate limiter using Vercel KV (Upstash Redis) INCR+EXPIRE.
 * Works correctly across multiple serverless function instances.
 * Falls open (allows request) if KV is unavailable.
 */

import { kv } from "@/lib/kv";

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
 * Uses KV INCR+EXPIRE for distributed correctness on Vercel serverless.
 *
 * @example
 * const rl = await rateLimit("create-link", userId, { maxRequests: 10, windowMs: 60_000 });
 * if (!rl.allowed) return NextResponse.json({ error: "Too many requests" }, { status: 429 });
 */
export async function rateLimit(
  action: string,
  identifier: string,
  options: RateLimitOptions
): Promise<RateLimitResult> {
  const key = `rl:${action}:${identifier}`;
  const windowSec = Math.ceil(options.windowMs / 1000);

  try {
    const count = await kv.incr(key);
    if (count === 1) {
      // First request in this window — set TTL
      await kv.expire(key, windowSec);
    }

    if (count > options.maxRequests) {
      const ttl = await kv.ttl(key);
      return {
        allowed: false,
        remaining: 0,
        retryAfterMs: Math.max(ttl, 0) * 1000,
      };
    }

    return {
      allowed: true,
      remaining: options.maxRequests - count,
      retryAfterMs: 0,
    };
  } catch {
    // KV unavailable — fail open so users are not blocked
    return { allowed: true, remaining: options.maxRequests, retryAfterMs: 0 };
  }
}
