# Hydrogen template: Skeleton

Hydrogen is Shopify’s stack for headless commerce. Hydrogen is designed to dovetail with [React Router](https://reactrouter.com/), the modern multi-strategy router for React. This template contains a **minimal setup** of components, queries and tooling to get started with Hydrogen.

[Check out Hydrogen docs](https://shopify.dev/custom-storefronts/hydrogen)
[Get familiar with React Router](https://reactrouter.com/start/framework/routing)

## What's included

- React Router
- Hydrogen
- Oxygen
- Vite
- Shopify CLI
- ESLint
- Prettier
- GraphQL generator
- TypeScript and JavaScript flavors
- Minimal setup of components and routes

## Getting started

**Requirements:**

- Node.js version 22.x or 24.x

```bash
npm create @shopify/hydrogen@latest
```

## Building for production

```bash
npm run build
```

## Local development

```bash
npm run dev
```

## Setup for using Customer Account API (`/account` section)

Follow step 1 and 2 of <https://shopify.dev/docs/custom-storefronts/building-with-the-customer-account-api/hydrogen#step-1-set-up-a-public-domain-for-local-development>

## Superbox design — Theme v3 "1a Retail"

The storefront UI is a port of the "1a Retail" Claude Design artifact:
orange header with a pill search, lime featured-product card, two promo
tiles, five category badges, a 4-up best-seller grid and an olive footer
with the newsletter form. Archivo type, light/dark theme.

- **Theme (tokens):** `app/styles/theme.css` holds the fonts and every
  color, type size, radius and spacing token for light and dark mode.
  `app/styles/app.css` only consumes those variables, so re-theming means
  editing `theme.css` alone.
- **Components and layout:** `app/styles/app.css`. Responsive breakpoints
  are 1080px (hero stacks), 860px (search on its own row, 2-column
  products, catalog filters behind a toggle), 600px (compact header with
  icons, scrolling category row) and 380px.
- **Store copy and settings:** `app/lib/storeConfig.js`: topbar items, hero
  fallback copy and specs, the "OFERTAS" pill, promo tiles (collection,
  kicker and bundled fallback photo), category badge codes
  (`CATEGORY_CODES`) and design toggles (grayscale photos, compact grid).
- Category navigation reads the Shopify menu with handle `categorias`
  (collection links). Without that menu, all collections are listed.
- The hero features the product set in `HERO.productHandle`, falling back
  to the best seller. Its tagline and specs come from the `custom.tagline`
  and `custom.hero_specs` metafields when present.
- Promo tiles use the collection image from Shopify, or the design's photos
  in `app/assets/images/promo-*.jpg` when the collection has none.
- Catalog filters (availability, max price, sort) live in the URL:
  `?stock=en-existencia&max=100000&orden=asc`.

Security notes and the dependency audit are in `SECURITY.md`.
