/**
 * Small fixed-window rate limiter for form endpoints. Counters live in the
 * worker Cache API (Oxygen's per-location cache), with an in-memory fallback
 * when the Cache API is unavailable. It is best-effort, not a global quota:
 * enough to stop a single client from hammering the newsletter form.
 */

/** In-isolate fallback store: key → {count, expires}. */
const memory = new Map();

/**
 * @param {Request} request
 */
export function clientIp(request) {
  return (
    request.headers.get('oxygen-buyer-ip') ||
    request.headers.get('cf-connecting-ip') ||
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    'unknown'
  );
}

/**
 * Counts one hit for `key` and reports whether it is still within `limit`
 * hits per `windowSeconds`.
 * @param {{key: string; limit: number; windowSeconds: number}} options
 * @return {Promise<boolean>} true when the request is allowed
 */
export async function hitRateLimit({key, limit, windowSeconds}) {
  const windowId = Math.floor(Date.now() / (windowSeconds * 1000));
  const id = `${await sha256(key)}-${windowId}`;

  if (typeof caches === 'undefined') return hitMemory(id, limit, windowSeconds);

  try {
    const cache = await caches.open('rate-limit');
    const url = `https://rate-limit.invalid/${id}`;
    const cached = await cache.match(url);
    const count = (cached ? Number(await cached.text()) || 0 : 0) + 1;
    await cache.put(
      url,
      new Response(String(count), {
        headers: {'Cache-Control': `max-age=${windowSeconds}`},
      }),
    );
    return count <= limit;
  } catch {
    return hitMemory(id, limit, windowSeconds);
  }
}

/**
 * @param {string} id
 * @param {number} limit
 * @param {number} windowSeconds
 */
function hitMemory(id, limit, windowSeconds) {
  const now = Date.now();
  for (const [key, entry] of memory) {
    if (entry.expires <= now) memory.delete(key);
  }
  const entry = memory.get(id) ?? {count: 0, expires: now + windowSeconds * 1000};
  entry.count += 1;
  memory.set(id, entry);
  return entry.count <= limit;
}

/**
 * Hashes the key so client IPs are never stored in clear text.
 * @param {string} value
 */
async function sha256(value) {
  const digest = await crypto.subtle.digest(
    'SHA-256',
    new TextEncoder().encode(value),
  );
  return Array.from(new Uint8Array(digest), (b) =>
    b.toString(16).padStart(2, '0'),
  ).join('');
}
