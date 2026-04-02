type Entry = { count: number; resetAt: number };

declare global {
  var __rateLimitStore: Map<string, Entry> | undefined;
}

function getStore(): Map<string, Entry> {
  if (!globalThis.__rateLimitStore) {
    globalThis.__rateLimitStore = new Map();
  }
  return globalThis.__rateLimitStore;
}

export function rateLimit(key: string, windowMs: number, max: number): { ok: boolean; retryAfterSeconds: number } {
  const store = getStore();
  const now = Date.now();

  const existing = store.get(key);
  if (!existing || now >= existing.resetAt) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, retryAfterSeconds: Math.ceil(windowMs / 1000) };
  }

  existing.count += 1;
  store.set(key, existing);

  const retryAfterSeconds = Math.max(0, Math.ceil((existing.resetAt - now) / 1000));
  return { ok: existing.count <= max, retryAfterSeconds };
}
