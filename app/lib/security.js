/**
 * Security headers sent with every response (HTML from entry.server.jsx,
 * everything else from server.js). The Content-Security-Policy is added
 * separately for HTML because it carries the per-request nonce.
 */
export const SECURITY_HEADERS = {
  'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=(self)',
  'X-Frame-Options': 'DENY',
  'Cross-Origin-Opener-Policy': 'same-origin',
};

/**
 * Sets every security header that isn't already present on `headers`.
 * @param {Headers} headers
 */
export function applySecurityHeaders(headers) {
  for (const [name, value] of Object.entries(SECURITY_HEADERS)) {
    if (!headers.has(name)) headers.set(name, value);
  }
  return headers;
}

/**
 * Explicit CSP directives passed to Hydrogen's createContentSecurityPolicy.
 * Hydrogen merges them with its defaults and appends the script nonce to
 * default-src, so scripts never need 'unsafe-inline' or 'unsafe-eval'.
 * @param {{checkoutDomain?: string; storeDomain?: string}} shop
 */
export function cspDirectives({checkoutDomain, storeDomain}) {
  const https = (/** @type {string | undefined} */ domain) =>
    domain ? [domain.includes('://') ? domain : `https://${domain}`] : [];

  return {
    defaultSrc: ["'self'", 'https://cdn.shopify.com', 'https://shopify.com'],
    imgSrc: ["'self'", 'data:', 'https://cdn.shopify.com'],
    styleSrc: ["'self'", 'https://cdn.shopify.com'],
    fontSrc: ["'self'"],
    connectSrc: [
      "'self'",
      'https://cdn.shopify.com',
      'https://monorail-edge.shopifysvc.com',
      ...https(storeDomain),
      ...https(checkoutDomain),
    ],
    frameAncestors: ["'none'"],
    baseUri: ["'self'"],
    formAction: ["'self'", ...https(checkoutDomain)],
    objectSrc: ["'none'"],
  };
}

/**
 * Hydrogen appends our directives to its own defaults, which repeats some
 * sources. Removes duplicate sources within each directive.
 * @param {string} header
 */
export function dedupeCsp(header) {
  return header
    .split(';')
    .map((directive) => {
      const [name, ...sources] = directive.trim().split(/\s+/);
      return [name, ...new Set(sources)].join(' ');
    })
    .filter(Boolean)
    .join('; ');
}

/**
 * Same-origin check for state-changing requests (CSRF defense in depth).
 * Accepts the request's own origin plus the store's public domains.
 * @param {Request} request
 * @param {Array<string | undefined | null>} [allowedHosts]
 */
export function isSameOriginRequest(request, allowedHosts = []) {
  const requestUrl = new URL(request.url);
  const allowed = new Set(
    [requestUrl.host, ...allowedHosts].filter(Boolean).map(String),
  );
  const source = request.headers.get('Origin') ?? request.headers.get('Referer');
  if (!source || source === 'null') return false;
  try {
    return allowed.has(new URL(source).host);
  } catch {
    return false;
  }
}
