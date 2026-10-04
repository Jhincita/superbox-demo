# Handoff: Superbox storefront — Theme 1a "Retail"

**Target repo:** `Jhincita/superbox-demo` (Shopify Hydrogen + React Router 7, JS/JSX, Archivo self-hosted fonts, `app/styles/app.css`).

**Instruction to Claude Code:** reskin the existing storefront to Theme 1a in this document. Keep all data flows, routes, cart, analytics and Shopify queries as they are. This is a visual reskin plus a security hardening pass. Do both, and finish with the checklist in §8.

---

## 1. Overview
Theme 1a is a bold, friendly retail homepage inspired by large electronics retailers, toned down so it doesn't overwhelm:
- an orange header with a pill-shaped search box,
- a lime "featured product" card with just enough context: name, one sentence, 3 spec chips and a price,
- two promo tiles,
- 5 category cards,
- a 4-up best-seller grid,
- an olive footer.

**Retail only.** Do NOT add B2B or "cotizar pack" blocks. Business sales live on a separate site (Est SA).

## 2. About the design files
`reference/Superbox Redesign.dc.html` is a **design reference built in HTML**. It is not production code. Open it in a browser next to `reference/support.js`. The relevant artboard is the one labelled **1a**. Ignore 1b–1d and 2a–2c.

Recreate it with the repo's own patterns: Hydrogen `<Image>`, the existing components and the class names in `app/styles/app.css`. Do not paste the HTML.

`theme.css` is a ready-to-merge token and component layer, with exact values for every element. Prefer merging it into `app/styles/app.css` over adding a new stylesheet.

## 3. Fidelity
**High-fidelity.** Colors, type sizes, weights, radii and spacing are final. Copy is final except product data, which comes from Shopify.

## 4. Design tokens
| Token | Hex | Use |
|---|---|---|
| orange | `#D2733A` | Header band, buy button, discount badges (toned from #E47B31 so it sits with lime) |
| orange-deep | `#B35C2B` | Accent text/links on light, hover of buy button |
| orange-light | `#E8955C` | Logo light faces |
| orange-ink | `#8C4520` / `#7E3E1C` | Logo interior |
| lime | `#C6E048` | Featured card, quick-add buttons, cart count, offers pill, focus ring |
| lime-tint | `#EEF5D0` | Category icon circle |
| lime-shade | `#B3CC3A` | Disc behind hero product |
| olive | `#2B3510` | Topbar, footer, promo tile ground |
| olive-text | `#C9D3A8` | Footer body text |
| green-text | `#5E7D1E` | "Despacho en 24–48 h" line, category icon glyph |
| ink | `#191C14` | Text, search button, hero tag ground |
| bg | `#F4F3EF` | Page |
| surface | `#FFFFFF` | Cards, category bar |
| tile | `#F1F0EA` | Product image well |
| line | `#E4E2DA` | Borders |
| muted / faint | `#7A7D70` / `#9A9C90` | Secondary text / strikethrough |

- **Type:** Archivo (already self-hosted in `app/assets/fonts`). Weights used are 400, 600, 700, 800 and 900. If 900 isn't bundled, add the woff2 locally. Never load it from Google Fonts (see CSP, §7).
  - Brand wordmark: 28 / 900 / -0.03em
  - Hero title: 56 / 900 / lh .95 / -0.035em
  - Section h2: 32 / 900 / -0.03em
  - Card title: 16 / 600 / lh 1.3
  - Price: 24 / 900
  - Kicker: 12 / 700 / uppercase / .06em
  - Body: 15–17
- **Radii:** pill 999 · 24 (hero, promo) · 20 (product card) · 18 (category) · 14 (image well) · 6 (tags).
- **Spacing:**
  - Page max width 1280, gutter 40.
  - Section gap 44 (categories 40).
  - Grid gaps 16 (hero 20).
  - Card padding 18; hero padding 44.
- **Dark mode:** the repo has `ThemeToggle`. Keep it. `theme.css` includes a `[data-theme='dark']` mapping (olive-black ground, same accents).

## 5. Screens / components → repo mapping

### 5.1 Topbar (`Header.jsx` → `TopBar`)
- Olive `#2B3510` band, text `#E5EFC0`, 13px, centered, gap 40, padding 9px 0.
- Items: "Envío a todo Chile" · "Factura electrónica" · "Soporte técnico incluido". The WhatsApp link stays.

### 5.2 Header (`Header.jsx`)
- Orange band `#D2733A`, padding 18px 40px, flex, gap 32.
- **Logo:** replace the `Logo` component in `app/components/Icon.jsx` with the new symmetric SVG (see §6).
  - In the header use the "on orange" palette: white/cream faces with stroke `#D2733A`.
  - Wordmark "superbox" is white, 28/900.
- **Search:** move `HeaderSearch` into the header row (`flex:1`).
  - White pill with padding 6 6 6 24.
  - Placeholder "Busca lectores, impresoras, POS…" (#8A8C80, 16px).
  - Add a visible submit `<button type="submit">Buscar</button>`: ink ground, white 15/700, pill, padding 10 22.
- **Actions:** white 15/600.
  - "Ingresar" links to `/account`.
  - Cart shows "Carrito" plus a count chip (lime ground, ink, 12/800, padding 2 8).
  - Keep `ThemeToggle`, but style it white on the orange band.

### 5.3 Category bar (`CategoryTabs`)
- White, height 52, bottom border `#E4E2DA`, 15/600, gap 32.
- First item is "☰ Todas las categorías" in orange-deep, linking to `/collections/all`. Use the existing `Icon` instead of the ☰ glyph.
- Active tab: orange-deep text with a 3px orange underline.
- Right-aligned lime pill "OFERTAS DE OCTUBRE" (13/800). Make its text a constant in `storeConfig.js` (`PROMO_PILL`) so it can change monthly, linking to a sale collection handle from config.
- Must scroll horizontally on mobile.

### 5.4 Hero (`_index.jsx` → `Hero`)
Grid `2fr 1fr`, gap 20, padding-top 28.

**Left: featured card**
- Lime `#C6E048`, radius 24, padding 44, inner grid 1fr 1fr, min-height 440.
- Copy column, gap 18:
  - Tag "PRODUCTO DESTACADO": ink ground, lime text, 12/800, radius 6.
  - Title = `product.title`, 56/900. Allow a `<br>` split via config if needed.
  - One-sentence text, 17px, olive, max 340px. Source: a product metafield `custom.tagline` if present, else `HERO.text`. **Keep it to one sentence. Don't overload.**
  - **Exactly 3** spec chips from metafield `custom.hero_specs` (list) or a `HERO.specs` fallback. Style: `rgba(255,255,255,.6)`, pill, 13/600. Design values: "Intel J6412", "128 GB SSD", "Fanless".
  - Buy row: orange pill button "Comprar ahora" linking to the product page, plus the price block: compare-at price struck through (13px) over the price (30/900). Only show the strikethrough when `compareAtPrice > price`.
- Media column:
  - A 380px `#B3CC3A` circle behind a 340px product image (radius 20, `object-fit: contain`).
  - A rotated (10°) 96px orange circle "AHORRA / NN%". **Compute NN from compareAtPrice. Hide it if there's no discount.** Never hard-code it.
- Set `DESIGN.grayscalePhotos = false`. Theme 1a uses color photos.

**Right: promo stack** (two tiles, gap 20, radius 24, padding 24, content bottom-left, white text)
1. Olive ground, collection image at opacity .55.
   - Kicker "DESDE $24.990" in lime: compute from the collection's min price, or take it from config.
   - Title "Lectores de código", 26/900.
2. Orange ground, image at opacity .45 with `mix-blend-mode: multiply`.
   - Kicker "3 CUOTAS SIN INTERÉS".
   - Title "Impresoras térmicas".

Tile collections and kickers come from `storeConfig.js` (`PROMO_TILES`). Images come from the collection's Shopify `image` field.

### 5.5 Value props
The current `ValueProps` band is replaced by the topbar copy. Remove it from the homepage, or keep it only on the product page.

### 5.6 Category cards (`CategoryGrid`)
- 5 columns, gap 16, padding-top 40.
- White card, radius 18, padding 20, row layout, gap 14.
- 52px circle icon in lime-tint with a green glyph. Use the existing `categoryIcon()` + `Icon`.
- Title 16/700. Sub-line "{n} productos", 13px muted: use `collection.products` count if cheaply available, else "Ver productos".
- Hover: translateY(-2px) plus a soft shadow.

### 5.7 "Lo más vendido" (`FeaturedProducts` + `ProductItem.jsx`)
- Head: h2 "Lo más vendido" (32/900) with "Ver todo →" (orange-deep 15/700) on the right.
- Grid: 4 columns, gap 16. **Show 4 on the homepage** (the query is `first: 8`; change it to 4 here).
- Card: white, radius 20, padding 18, column, gap 12.
  - Image well `#F1F0EA`, radius 14, square, `contain`.
  - Orange "-NN%" badge top-left, only when discounted (compute it).
  - Kicker = vendor (uppercase 12/700 muted).
  - Title 16/600 with a 2-line clamp.
  - Foot: strikethrough compare-at (13px faint) over the price (24/900). On the right, a 42px lime circle quick-add with a `plus` icon. Keep the existing `AddToCartButton` logic, sold-out handling and "Avísame" link.
  - Line "● Despacho en 24–48 h" (green 13/600), only when `availableForSale`.

### 5.8 Newsletter + Footer (`Footer.jsx`)
- Keep the newsletter (restyled: white card, lime submit button). It sits above the footer.
- Footer: olive `#2B3510`, text `#C9D3A8` 14px, padding 40, grid `2fr 1fr 1fr 1fr`, gap 32.
  - Column 1: logo (default palette, stroke `#2B3510`) + "superbox" 22/900 white, then `STORE.about`.
  - Columns: Catálogo / Ayuda / Newsletter. Headings are white 14/700, links hover lime.
- Bottom row: "© {year} Superbox · Santiago, Chile" and "Precios en CLP, impuesto incluido".

### 5.9 Removed
- The B2B "¿Equipando un local completo?" banner. Do not implement it.
- The "Hablar con un asesor" hero button. WhatsApp stays in the topbar and footer.

## 6. Logo
New symmetric isometric open box: same silhouette as the original icon, mirrored left/right, with 4 flaps and a 3.5-unit gap stroke between panels. Files:
- `assets/logo.svg`: default palette on white.
- `assets/logo-on-orange.svg`: header palette.
- Also use it for `app/assets/favicon.svg`.

Replace `Logo` in `app/components/Icon.jsx` with:
```jsx
const LOGO_PALETTES = {
  default: {light: '#E8955C', mid: '#D2733A', dark: '#B35C2B', inner: '#7E3E1C'},
  onOrange: {light: '#FFFFFF', mid: '#FBE7D8', dark: '#F0C8A9', inner: '#8C4520'},
};
export function Logo({size = 42, variant = 'default', gap = 'var(--logo-gap, #fff)'}) {
  const c = LOGO_PALETTES[variant] ?? LOGO_PALETTES.default;
  return (
    <svg viewBox="0 8 100 92" width={size} height={size} aria-hidden="true" focusable="false">
      <g stroke={gap} strokeWidth="3.5" strokeLinejoin="round">
        <polygon points="50,30 14,48 50,66 86,48" fill={c.inner} />
        <polygon points="14,48 50,30 42,12 6,30" fill={c.light} />
        <polygon points="50,30 86,48 94,30 58,12" fill={c.mid} />
        <polygon points="14,48 50,66 50,96 14,78" fill={c.mid} />
        <polygon points="50,66 86,48 86,78 50,96" fill={c.dark} />
        <polygon points="14,48 50,66 40,78 4,60" fill={c.light} />
        <polygon points="50,66 86,48 96,60 60,78" fill={c.light} />
      </g>
    </svg>
  );
}
```
The `gap` stroke must equal the background behind the logo:
- `#D2733A` in the header,
- `#2B3510` in the footer,
- `var(--sbx-bg)` elsewhere.

Set `--logo-gap` per container in CSS.

## 7. Interactions & states
- Hovers:
  - links → orange-deep,
  - buy button → `#B35C2B`,
  - quick-add → scale 1.06 (active .96),
  - category card → lift 2px,
  - promo tile → image scale 1.03 (transition .25s ease).
- Focus: `:focus-visible` 3px lime outline with 2px offset on every interactive element. The search input and buttons must be keyboard reachable.
- Respect `prefers-reduced-motion`.
- Loading: the product grid Suspense fallback shows 4 skeleton cards (tile color `#F1F0EA`), not text.
- Empty or no hero product: show the hero with `HERO.title` and a "Ver catálogo" CTA. Never render an empty price or badge.
- Responsive (in `theme.css`):
  - ≤1080: hero stacks, 3-column grids.
  - ≤720: search wraps to full width, 2-column grids, footer 2 columns.
- All copy is Spanish (es-CL). Prices use the existing `formatMoney` (CLP, no decimals).

## 8. SECURITY: required hardening (do all, then report)
The storefront must ship with no known vulnerabilities. Work through this list, fix what's missing, and summarize what changed.

1. **CSP (`entry.server.jsx`):** keep `createContentSecurityPolicy` with the nonce. Pass explicit directives:
   - `defaultSrc: ["'self'", 'https://cdn.shopify.com', 'https://shopify.com']`
   - `imgSrc: ["'self'", 'data:', 'https://cdn.shopify.com']`
   - `styleSrc: ["'self'", 'https://cdn.shopify.com']`
   - `fontSrc: ["'self'"]`
   - `connectSrc`: only Shopify domains + `PUBLIC_STORE_DOMAIN`
   - `frameAncestors: ["'none'"]`
   - `baseUri: ["'self'"]`
   - `formAction: ["'self'", PUBLIC_CHECKOUT_DOMAIN]`

   No `'unsafe-inline'` for scripts, no `'unsafe-eval'`. Fonts stay self-hosted, with no Google Fonts or third-party CDNs. Any image hosted outside Shopify must be moved into Shopify Files, not whitelisted.
2. **Security headers** on every response (set them in `entry.server.jsx` and `server.js` for non-HTML responses):
   - `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload`
   - `X-Content-Type-Options: nosniff`
   - `Referrer-Policy: strict-origin-when-cross-origin`
   - `Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=(self)`
   - `X-Frame-Options: DENY`
   - `Cross-Origin-Opener-Policy: same-origin`
3. **Error leakage:** `root.jsx` `ErrorBoundary` currently renders `error.message` and `<pre>` for any error. In production, show only a generic Spanish message plus the status code. Log details server-side only. `server.js` already returns a generic 500. Keep it that way.
4. **Secrets:**
   - Only `PUBLIC_*` vars may reach the client.
   - Verify that `PRIVATE_STOREFRONT_API_TOKEN` and `SESSION_SECRET` are never passed to loaders' return values or `consent`.
   - Fail fast if `SESSION_SECRET` is missing or shorter than 32 characters.
   - No secrets in the repo: check `.env*` is gitignored and git history is clean.
5. **Session cookie (`lib/session.js`):** `httpOnly`, `secure` (in prod), `sameSite: 'lax'`, `path: '/'`, signed with `SESSION_SECRET`.
6. **Input validation:**
   - Whitelist the catalog URL params: `orden` ∈ {asc, desc, ...}, `stock` ∈ known values, `max` = an integer clamped to `PRICE_FILTER`.
   - Search `q`: trim and cap at 100 characters.
   - Pass everything to GraphQL as variables only. Never use string interpolation into queries.
7. **Redirects:** `lib/redirect.js`, the `discount.$code` route and any `redirect` param must only allow same-origin relative paths (start with `/`, not `//`, no scheme). Prevent open redirects.
8. **Newsletter (`newsletter.jsx`):**
   - Add a hidden honeypot field (reject silently if filled).
   - Add a per-IP rate limit (e.g. 5/min via Oxygen cache or KV).
   - Cap email length at 254 and normalize to lowercase.
   - Keep the non-enumerating success response.
   - Check `Origin`/`Referer` matches the store domain for POSTs (CSRF defense in depth; React Router forms are same-site, but enforce it).
9. **XSS:**
   - No new `dangerouslySetInnerHTML`. The only allowed one is the existing nonce'd theme script.
   - Product `descriptionHtml` / page bodies come from Shopify admin. Render them, but sanitize to a strict allowlist (no `script`, `iframe`, `on*` attributes, `javascript:` URLs).
   - Metafield text (tagline, specs) renders as plain text only.
10. **External links:** all `target="_blank"` links keep `rel="noopener noreferrer"`. Validate menu URLs from Shopify (`toRelativeUrl`) so only `http(s)` and relative URLs render. Drop `javascript:` and `data:`.
11. **Dependencies:**
    - Run `npm audit --omit=dev` and fix every high/critical issue.
    - Keep Hydrogen and React Router on current patch versions.
    - Commit the lockfile.
    - Add `npm audit` to CI if CI exists.
12. **robots / sitemap:** `/account`, `/cart` and `/search?` are disallowed in `robots.txt`. Account routes send `Cache-Control: private, no-store`.
13. **Checkout and payments** stay on Shopify-hosted checkout. Never collect card data in the storefront.

**Deliverable from Claude Code:**
- the reskinned homepage, header, footer and product cards;
- a `SECURITY.md` listing each item above with its status, the file changed and how to verify it (e.g. `curl -I` header output);
- confirmation that `npm run build` and `npm run lint` pass.

## 9. Assets
- `assets/logo.svg`, `assets/logo-on-orange.svg`: new logo.
- Product, collection and hero images come from Shopify (`featuredImage`, `collection.image`). The design's photos are placeholders.
- Icons: use the existing `app/components/Icon.jsx` set.

## 10. Files in this bundle
- `README.md`: this spec.
- `theme.css`: tokens + component styles to merge into `app/styles/app.css`.
- `assets/`: logo SVGs.
- `reference/Superbox Redesign.dc.html` (+ `Logo.dc.html`, `support.js`): visual reference. Open it in a browser and look at artboard **1a**.
