/**
 * Lightweight in-memory request cache for API responses.
 * Prevents redundant network calls when navigating back/forward within a session.
 * Entries expire after DEFAULT_TTL_MS; call clearCache() on logout.
 */

const DEFAULT_TTL_MS = 5 * 60 * 1000; // 5 minutes

interface CacheEntry<T> {
  data: T;
  expiry: number;
}

const store = new Map<string, CacheEntry<unknown>>();

export function getCached<T>(key: string): T | null {
  const entry = store.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiry) {
    store.delete(key);
    return null;
  }
  return entry.data as T;
}

export function setCached<T>(key: string, data: T, ttlMs = DEFAULT_TTL_MS): void {
  store.set(key, { data, expiry: Date.now() + ttlMs });
}

export function clearCache(): void {
  store.clear();
}
