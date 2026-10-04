/**
 * URL helpers shared by redirects, menus and links. Everything that turns
 * user- or admin-controlled input into a link or a redirect goes through here.
 */

/** Longest search term accepted by the search routes and header form. */
export const SEARCH_TERM_MAX_LENGTH = 100;

/**
 * True when `path` is a same-origin relative path: it starts with a single
 * `/`, is not protocol-relative (`//host`, `/\host`) and has no scheme or
 * control characters that browsers would strip before resolving it.
 * @param {unknown} path
 * @return {path is string}
 */
export function isSafeRelativePath(path) {
  if (typeof path !== 'string' || path.length === 0 || path.length > 2048) {
    return false;
  }
  // Browsers drop tabs/newlines and treat `\` like `/` when resolving URLs.
  // eslint-disable-next-line no-control-regex
  if (/[\u0000-\u001F\u007F\\]/.test(path)) return false;
  if (!path.startsWith('/') || path.startsWith('//')) return false;
  try {
    const base = 'https://same-origin.invalid';
    return new URL(path, base).origin === base;
  } catch {
    return false;
  }
}

/**
 * Returns `path` when it is a safe same-origin relative path, else `fallback`.
 * @param {unknown} path
 * @param {string} [fallback]
 */
export function safeRedirectPath(path, fallback = '/') {
  return isSafeRelativePath(path) ? path : fallback;
}

/**
 * Normalizes a menu URL from Shopify: the shop's own domains become
 * relative paths (so they route client-side), other http(s) URLs are kept,
 * and everything else (`javascript:`, `data:`, malformed) is dropped.
 * @param {string | null | undefined} url
 * @param {string | null | undefined} primaryDomainUrl
 * @param {string | null | undefined} publicStoreDomain
 * @return {string | null}
 */
export function toRelativeUrl(url, primaryDomainUrl, publicStoreDomain) {
  if (!url) return null;
  if (url.startsWith('/')) return isSafeRelativePath(url) ? url : null;

  let parsed;
  try {
    parsed = new URL(url);
  } catch {
    return null;
  }
  if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') return null;

  const internalHosts = [publicStoreDomain, hostOf(primaryDomainUrl)].filter(
    Boolean,
  );
  const isInternal =
    parsed.hostname.endsWith('.myshopify.com') ||
    internalHosts.includes(parsed.hostname);

  if (!isInternal) return parsed.href;
  const relative = `${parsed.pathname}${parsed.search}${parsed.hash}`;
  return isSafeRelativePath(relative) ? relative : '/';
}

/**
 * Trims a search term and caps its length.
 * @param {unknown} term
 */
export function normalizeSearchTerm(term) {
  return String(term ?? '')
    .trim()
    .slice(0, SEARCH_TERM_MAX_LENGTH);
}

/**
 * @param {string | null | undefined} url
 */
function hostOf(url) {
  if (!url) return null;
  try {
    return new URL(url).hostname;
  } catch {
    return null;
  }
}
