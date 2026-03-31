import { kv } from "@vercel/kv";

// Key format: "slug:<slug>" → originalUrl
export const SLUG_PREFIX = "slug:";

export async function getUrlBySlug(slug: string): Promise<string | null> {
  return kv.get<string>(`${SLUG_PREFIX}${slug}`);
}

export async function setSlugUrl(slug: string, url: string, ttlSeconds?: number): Promise<void> {
  // Use link's own expiry if shorter than 24h default, so expired links auto-evict from KV
  const ex = ttlSeconds !== undefined && ttlSeconds > 0 && ttlSeconds < 86400
    ? ttlSeconds
    : 86400;
  await kv.set(`${SLUG_PREFIX}${slug}`, url, { ex });
}

export async function deleteSlugUrl(slug: string): Promise<void> {
  await kv.del(`${SLUG_PREFIX}${slug}`);
}

export { kv };
