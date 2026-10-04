# Security hardening — Theme 1a (redesign_ver2 §8)

This file records the status of each item in `redesign_ver2/README.md` §8: what changed, where, and how to verify it.

**Status legend:** ✅ done · ⚠️ done, with a documented deviation

Run the verification commands against a local preview (`npm run build && npx shopify hydrogen preview`) or against the deployed store.

---

## 1. Content-Security-Policy ⚠️

**Files:** `app/entry.server.jsx`, `app/lib/security.js` (`cspDirectives`, `dedupeCsp`)

- `createContentSecurityPolicy` is still used with the per-request nonce. The explicit directives are passed in: `defaultSrc`, `imgSrc` (`'self' data: https://cdn.shopify.com`), `styleSrc`, `fontSrc 'self'`, `connectSrc` (Shopify domains, `PUBLIC_STORE_DOMAIN` and `PUBLIC_CHECKOUT_DOMAIN`), `frameAncestors 'none'`, `baseUri 'self'` and `formAction 'self' + checkout domain`. `object-src 'none'` was added on top of the list.
- Hydrogen merges our directives into its defaults, which duplicated sources. `dedupeCsp` now removes the duplicates.
- Scripts are controlled by `default-src` + nonce. There is no `'unsafe-inline'` or `'unsafe-eval'` for scripts.
- Fonts are self-hosted (`app/assets/fonts`, Archivo variable 100–900). The stylesheet has no `@import`, no Google Fonts and no third-party CDN.
- **Deviation:** `style-src` still contains `'unsafe-inline'`. Hydrogen always adds it to its default `style-src`, and it can't be removed through the API. The storefront also needs it: Hydrogen's `<Image>` renders `style="width:100%;aspect-ratio:…"`, and option swatches use an inline `background-color` that comes from data. Only styles are affected; script injection is still blocked by the nonce. Removing it would require replacing `<Image>`, so it is left as is.
- No images outside Shopify are referenced. Product, collection and hero images come from `cdn.shopify.com`. The only local fallback is `app/assets/images/hero-barpos-d1a.png`, served from `'self'`.

**Verify:** `curl -sI https://<store>/ | grep -i content-security-policy`

```
Content-Security-Policy: base-uri 'self'; default-src 'self' https://cdn.shopify.com https://shopify.com 'nonce-…'; frame-ancestors 'none'; style-src 'self' https://cdn.shopify.com 'unsafe-inline'; connect-src 'self' https://cdn.shopify.com https://monorail-edge.shopifysvc.com https://<store-domain> https://<checkout-domain> …; img-src 'self' data: https://cdn.shopify.com; font-src 'self'; form-action 'self' https://<checkout-domain>; object-src 'none'
```

## 2. Security headers on every response ✅

**Files:** `app/lib/security.js` (`SECURITY_HEADERS`, `applySecurityHeaders`), `app/entry.server.jsx` (HTML), `server.js` (all other responses: `.data`, robots/sitemap, redirects, storefront redirects and the generic 500)

The headers are:
- `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload`
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=(self)`
- `X-Frame-Options: DENY`
- `Cross-Origin-Opener-Policy: same-origin`

**Verify:**

```
$ curl -sI https://<store>/robots.txt
HTTP/1.1 200 OK
Strict-Transport-Security: max-age=63072000; includeSubDomains; preload
Referrer-Policy: strict-origin-when-cross-origin
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
Cross-Origin-Opener-Policy: same-origin
Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=(self)
```

The same headers are present on `/`, on a 404, on the `/discount/*` 302 and on the generic 500.

## 3. Error leakage ✅

**Files:** `app/root.jsx` (`ErrorBoundary`), `app/entry.server.jsx` (`handleError`), `server.js`, `app/routes/($locale).search.jsx`

- In production, `ErrorBoundary` shows only a generic Spanish message, the status code and a "Volver al inicio" link. `error.message`, the stack and `<pre>` are rendered only when `import.meta.env.DEV` is set.
- Errors are logged on the server only, through `handleError` and `console.error` in `server.js`. `server.js` still returns a generic `An unexpected error occurred` 500.
- The search page used to print raw Storefront API error messages to visitors. It now shows a generic message and logs the details on the server. Its loader also had a broken `.catch` (the result was discarded, so every error became a 500); that is fixed.

**Verify:** `curl -s https://<store>/no-such-page | grep -o 'route-error.\{0,200\}'`. The response shows "Página no encontrada", "Error 404" and no details.

## 4. Secrets ✅

**Files:** `app/lib/context.js` (`assertSessionSecret`), `.gitignore`

- Only `PUBLIC_*` values reach the client. The root loader returns `publicStoreDomain`, `PUBLIC_STOREFRONT_ID` (through `getShopAnalytics`), and `PUBLIC_CHECKOUT_DOMAIN` + `PUBLIC_STOREFRONT_API_TOKEN` in `consent`. `PRIVATE_STOREFRONT_API_TOKEN` and `SESSION_SECRET` are never returned by any loader. To check: `grep -rn "PRIVATE_\|SESSION_SECRET" app` only matches `context.js`.
- The app fails fast at startup if `SESSION_SECRET` is missing or shorter than 32 characters. The error message never includes the value.
- `.gitignore` now covers `.env` and `.env.*`, with `!.env.example`.
- Git history was searched with `git log --all -p` for `SESSION_SECRET=`, `PRIVATE_STOREFRONT_API_TOKEN=`, `shpat_`/`shpss_`/`shpca_` and `.env`/key files. The only matches are type declarations in docs; no secret values were found.

## 5. Session cookie ✅

**File:** `app/lib/session.js`

The cookie settings are `httpOnly: true`, `secure` (always in production and on any HTTPS request), `sameSite: 'lax'` and `path: '/'`. It is signed with `[SESSION_SECRET]`.

**Verify:** after an action that writes the session (e.g. login), `curl -sI` shows `Set-Cookie: session=…; Path=/; HttpOnly; Secure; SameSite=Lax`.

## 6. Input validation ✅

**Files:** `app/lib/catalog.js`, `app/lib/urls.js`, `app/routes/($locale).search.jsx`, `app/components/Header.jsx`, `app/routes/($locale).cart.$lines.jsx`

- **Catalog params:** `orden` is checked against `SORT_OPTIONS` (`rel|asc|desc|az`). `stock` only accepts `en-existencia`. `max` must match `^\d{1,9}$`, is clamped to `PRICE_FILTER.min`, and anything at or above `PRICE_FILTER.max` means no filter (so `1e9`, `12.5` and `abc` are ignored).
- **Search `q`:** trimmed and capped at 100 characters by `normalizeSearchTerm` in both the regular and predictive search. The inputs have `maxLength=100`. An empty query skips the API call. The predictive `limit` is clamped to 1–10.
- **Cart permalinks** (`/cart/<id>:<qty>,…`): variant IDs must be numeric and quantities 1–99, with at most 50 lines; anything else returns 400. The `discount` code is capped at 255 characters.
- **GraphQL:** every value is passed as a GraphQL variable; nothing is interpolated into a query document. The `/collections/all` search-syntax string only interpolates the validated integer `maxPrice`.
- Two encoding bugs were fixed. `SearchFormPredictive` now URL-encodes the term. `urlWithTrackingParams` no longer double-encodes `q`.

## 7. Redirects ✅

**Files:** `app/lib/urls.js` (`isSafeRelativePath`, `safeRedirectPath`), `app/routes/($locale).discount.$code.jsx`, `app/lib/redirect.js`

- Only same-origin relative paths are accepted. They must start with a single `/`, can't start with `//` or `/\`, can't contain control characters or backslashes, and must resolve to the same origin.
- `discount.$code` validates `redirect`/`return_to` and falls back to `/`. It also no longer crashes with a 500 when Shopify returns no cart.
- `redirectIfHandleIsLocalized` redirects to a relative path only.

**Verify** (all of these return `302 → /`):

```
/discount/X?redirect=//evil.com
/discount/X?redirect=/%5Cevil.com
/discount/X?redirect=https://evil.com
/discount/X?redirect=javascript:alert(1)
/discount/X?redirect=/%09/evil.com
```

`/discount/X?return_to=/collections/all&utm=1` returns `302 → /collections/all?utm=1`.

## 8. Newsletter ✅

**Files:** `app/routes/($locale).newsletter.jsx`, `app/lib/rateLimit.js`, `app/lib/security.js` (`isSameOriginRequest`), `app/components/Footer.jsx`

- **Honeypot:** a `company` field is placed off-screen with `aria-hidden` and `tabIndex=-1`. If it is filled, the action returns `{ok: true}` and never calls Shopify.
- **Rate limit:** 5 requests per minute per client IP (`oxygen-buyer-ip` / `cf-connecting-ip`). Counters are stored in the worker Cache API, keyed by a SHA-256 hash of the IP, with an in-memory fallback. Over the limit the action returns 429 with `Retry-After`.
- **Email:** trimmed, lowercased and capped at 254 characters (`maxLength=254` on the input). Bodies over 4 KB are rejected with 413.
- **CSRF:** POSTs must have an `Origin` (or `Referer`) whose host is the request host or `PUBLIC_STORE_DOMAIN`. Otherwise the action returns 403.
- The success response still doesn't reveal whether an email already exists (`TAKEN` is treated as success).

**Verify:**
- `curl -X POST -d email=a@b.cl https://<store>/newsletter` → 403
- adding `-H "Origin: https://<store>"` → 200
- the 6th request within a minute → 429

## 9. XSS ✅

**Files:** `app/lib/sanitizeHtml.server.js` (server-only), and the loaders of `products.$handle`, `pages.$handle`, `policies.$handle` and `blogs.$blogHandle.$articleHandle`

- Admin-authored HTML (`descriptionHtml`, page/policy `body`, article `contentHtml`) is sanitized in the loader with `xss`, using a strict tag/attribute allowlist:
  - `script`, `style`, `iframe`, `object`, `embed`, `svg`, `math`, `form` and `template` are removed together with their content.
  - Every `on*` attribute and every `style`/`class` attribute is dropped.
  - `href`/`src` allow only `http(s)`, `mailto` and `tel` (images: `http(s)`) or relative URLs. `javascript:`, `data:` and entity-encoded variants are stripped.
  - Every link gets `rel="noopener noreferrer"`.
- No new `dangerouslySetInnerHTML` was added. The existing uses render the sanitized strings, plus the nonce'd theme script in `root.jsx`.
- Metafield text (`custom.tagline`, `custom.hero_specs`) is parsed as JSON or plain text and rendered as React text, so it is escaped.

**Verified locally** against a mock product description containing `<script>`, `<img onerror>`, `<a href="javascript:…">`, `<a href="JaVaScRiPt&#58;…">`, `<iframe>`, `<svg><script>` and `style`/`onclick`. Only safe markup was rendered.

## 10. External links ✅

**Files:** `app/lib/urls.js` (`toRelativeUrl`), `app/components/Footer.jsx`, `app/routes/($locale).account.orders.$id.jsx`

- Every `target="_blank"` link has `rel="noopener noreferrer"`. The order status link only had `noreferrer` and was fixed.
- Menu URLs from Shopify now go through `toRelativeUrl`. It keeps only relative and `http(s)` URLs and drops `javascript:`, `data:` and malformed URLs. It matches the shop's hosts exactly. The old substring match treated `https://evil.com/?superbox.cl` as internal.

## 11. Dependencies ✅

**Files:** `package.json`, `package-lock.json`

- `react-router` / `react-router-dom` / `@react-router/dev` / `@react-router/fs-routes` were upgraded from 7.16.0 to **7.18.4**. This fixes GHSA-wrjc-x8rr-h8h6 (backslash open redirect), GHSA-h8fp-f39c-q6mh, GHSA-337j-9hxr-rhxg, GHSA-chx6-hx7r-mcp5 and GHSA-qwww-vcr4-c8h2.
- `@shopify/hydrogen` was upgraded from 2026.4.5 to **2026.4.7**, the current stable patch. Its peer range still pins `react-router ~7.16`, so `overrides` force the patched version. Build, preview and runtime behaviour were tested with it.
- `lodash` was raised to 4.18.1 and `esbuild` to 0.28.2 through overrides. `ws`, `qs` and `body-parser@1` were bumped too.
- `npm audit --omit=dev` (also available as `npm run audit`) reports **found 0 vulnerabilities**.
- **Residual, dev-only:** high/moderate advisories remain in local tooling that never ships to Oxygen: `undici`/`@fastify/busboy`/`miniflare` (from `@shopify/mini-oxygen`) and `braces`/`micromatch` (from `@graphql-codegen/cli`). The only fixes npm offers are major downgrades. Revisit when Shopify publishes updated CLI packages.
- The lockfile is committed. The repo has no CI, so there is nowhere to add `npm audit` yet. When CI is added, run `npm ci && npm run audit && npm run lint && npm run build`.

## 12. robots / caching ✅

**Files:** `app/routes/[robots.txt].jsx` (unchanged; already compliant), `server.js`, `app/routes/($locale).account.jsx`

- `robots.txt` disallows `/cart`, `/account` and `/search` (which covers `/search?…`) for all agents.
- Every `/account…` response (pages, `.data`, login/logout/authorize, any locale prefix) sends `Cache-Control: private, no-store`.

**Verify:** `curl -sI https://<store>/account | grep -i cache-control` → `Cache-Control: private, no-store`

## 13. Checkout and payments ✅

Checkout goes through Shopify's `cart.checkoutUrl` (hosted checkout). The storefront has no payment or card fields. `form-action` only allows `'self'` and the checkout domain.

---

**Build checks:** `npm run lint` passes (0 problems) and `npm run build` passes, including GraphQL codegen against the Storefront schema.
