/**
 * Module-level stale-while-revalidate cache for links.
 * Persists across page navigations within the same session.
 * Components show cached data instantly, then revalidate in background.
 */

export interface CachedLink {
  id: string;
  slug: string;
  originalUrl: string;
  createdAt: string;
  expiresAt: string | null;
  _count: { clicks: number };
}

let cache: CachedLink[] | null = null;

export function getLinksCache(): CachedLink[] | null {
  return cache;
}

export function setLinksCache(links: CachedLink[]): void {
  cache = [...links];
}

export function invalidateLinksCache(): void {
  cache = null;
}
