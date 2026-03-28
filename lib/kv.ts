import { kv } from "@vercel/kv";

// Key format: "slug:<slug>" → originalUrl
export const SLUG_PREFIX = "slug:";

export async function getUrlBySlug(slug: string): Promise<string | null> {
  return kv.get<string>(`${SLUG_PREFIX}${slug}`);
}

export async function setSlugUrl(slug: string, url: string): Promise<void> {
  await kv.set(`${SLUG_PREFIX}${slug}`, url, { ex: 86400 }); // 24h TTL
}

export async function deleteSlugUrl(slug: string): Promise<void> {
  await kv.del(`${SLUG_PREFIX}${slug}`);
}

export { kv };
