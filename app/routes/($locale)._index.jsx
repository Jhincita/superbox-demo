import {Await, useLoaderData, useRouteLoaderData, Link} from 'react-router';
import {Suspense} from 'react';
import {Image} from '@shopify/hydrogen';
import {ProductItem} from '~/components/ProductItem';
import {MockShopNotice} from '~/components/MockShopNotice';
import {categoryCode, getCategories} from '~/lib/categories';
import {PRODUCT_CARD_FRAGMENT} from '~/lib/fragments';
import {discountPercent, formatMoney} from '~/lib/format';
import {HERO, PROMO_TILES} from '~/lib/storeConfig';
import heroFallbackImage from '~/assets/images/hero-barpos-d1a.png';
import promoLectoresImage from '~/assets/images/promo-lectores.jpg';
import promoImpresorasImage from '~/assets/images/promo-impresoras.jpg';

/** Products shown in "Lo más vendido". */
const FEATURED_COUNT = 4;

/** Bundled promo tile photos, keyed by PROMO_TILES[].fallbackImage. */
const PROMO_FALLBACK_IMAGES = {
  lectores: promoLectoresImage,
  impresoras: promoImpresorasImage,
};

/**
 * @type {Route.MetaFunction}
 */
export const meta = () => {
  return [
    {title: 'Superbox | Equipamiento para retail'},
    {
      name: 'description',
      content:
        'Lectores de código, terminales POS, impresoras y periféricos para el comercio chileno.',
    },
  ];
};

/**
 * @param {Route.LoaderArgs} args
 */
export async function loader(args) {
  // Start fetching non-critical data without blocking time to first byte
  const deferredData = loadDeferredData(args);

  // Await the critical data required to render initial state of the page
  const criticalData = await loadCriticalData(args);

  return {...deferredData, ...criticalData};
}

/**
 * Load data necessary for rendering content above the fold. This is the critical data
 * needed to render the page. If it's unavailable, the whole page should 400 or 500 error.
 * @param {Route.LoaderArgs}
 */
async function loadCriticalData({context}) {
  const {heroProduct, products, tileA, tileB} = await context.storefront.query(
    HERO_QUERY,
    {
      variables: {
        handle: HERO.productHandle,
        tileAHandle: PROMO_TILES[0].collectionHandle,
        tileBHandle: PROMO_TILES[1].collectionHandle,
      },
    },
  );

  const product = heroProduct ?? products.nodes[0] ?? null;

  return {
    isShopLinked: Boolean(context.env.PUBLIC_STORE_DOMAIN),
    hero: product ? toHeroData(product) : null,
    promoTiles: PROMO_TILES.map((tile, i) =>
      toPromoTile(tile, i === 0 ? tileA : tileB),
    ),
  };
}

/**
 * Load data for rendering content below the fold. This data is deferred and will be
 * fetched after the initial page load. If it's unavailable, the page should still 200.
 * Make sure to not throw any errors here, as it will cause the page to 500.
 * @param {Route.LoaderArgs}
 */
function loadDeferredData({context}) {
  const featuredProducts = context.storefront
    .query(FEATURED_PRODUCTS_QUERY, {variables: {first: FEATURED_COUNT}})
    .catch((error) => {
      // Log query errors, but don't throw them so the page can still render
      console.error(error);
      return null;
    });

  return {
    featuredProducts,
  };
}

/**
 * Reduces the hero product to plain values. Metafield text is kept as plain
 * strings (React escapes it); nothing from Shopify is rendered as HTML.
 * @param {HeroProductFragment} product
 */
function toHeroData(product) {
  const price = product.priceRange.minVariantPrice;
  const compareAt = product.compareAtPriceRange?.minVariantPrice ?? null;
  const percent = discountPercent(price, compareAt);

  return {
    handle: product.handle,
    title: product.title,
    text: plainText(product.tagline?.value, 200) || HERO.text,
    specs: parseSpecs(product.heroSpecs?.value) ?? HERO.specs.slice(0, 3),
    image: product.featuredImage ?? null,
    price: Number(price.amount) > 0 ? price : null,
    compareAtPrice: percent ? compareAt : null,
    discount: percent,
  };
}

/**
 * @param {(typeof PROMO_TILES)[number]} tile
 * @param {PromoCollectionFragment | null | undefined} collection
 */
function toPromoTile(tile, collection) {
  const minPrice = collection?.products.nodes[0]?.priceRange.minVariantPrice;
  const computed =
    tile.fromPrice && minPrice && Number(minPrice.amount) > 0
      ? `DESDE ${formatMoney(minPrice)}`
      : null;

  return {
    to: `/collections/${collection?.handle ?? tile.collectionHandle}`,
    title: tile.title,
    kicker: tile.kicker ?? computed ?? tile.fallbackKicker,
    tone: tile.tone,
    image: collection?.image ?? null,
    fallbackImage: PROMO_FALLBACK_IMAGES[tile.fallbackImage] ?? null,
  };
}

/**
 * @param {string | null | undefined} value
 * @param {number} max
 */
function plainText(value, max) {
  if (typeof value !== 'string') return '';
  return value.replace(/\s+/g, ' ').trim().slice(0, max);
}

/**
 * `custom.hero_specs` is a list metafield (JSON array of strings). Returns
 * exactly 3 specs, or null so the config fallback is used.
 * @param {string | null | undefined} value
 * @return {string[] | null}
 */
function parseSpecs(value) {
  if (!value) return null;
  let list;
  try {
    list = JSON.parse(value);
  } catch {
    list = value.split(/[\n,]/);
  }
  if (!Array.isArray(list)) return null;
  const specs = list
    .filter((item) => typeof item === 'string')
    .map((item) => plainText(item, 40))
    .filter(Boolean);
  return specs.length >= 3 ? specs.slice(0, 3) : null;
}

export default function Homepage() {
  /** @type {LoaderReturnData} */
  const data = useLoaderData();
  /** @type {import('~/root').RootLoader | undefined} */
  const root = useRouteLoaderData('root');
  const categories = getCategories(root?.header);

  return (
    <div className="home">
      {data.isShopLinked ? null : (
        <div className="container">
          <MockShopNotice />
        </div>
      )}
      {/* Section 1 wraps two rows: A (the hero) full width on top, then B,
          the promo grid with b.1 Lectores and b.2 Impresoras side by side.
          The layout lives in .home-feature / .promo-grid (app.css). */}
      <section className="container home-feature" aria-label="Destacados">
        <div className="home-feature-a">
          <Hero hero={data.hero} />
        </div>
        <div className="home-feature-b">
          <PromoGrid tiles={data.promoTiles} />
        </div>
      </section>
      {categories.length > 0 && <CategoryGrid categories={categories} />}
      <FeaturedProducts products={data.featuredProducts} />
    </div>
  );
}

/**
 * @param {{hero: ReturnType<typeof toHeroData> | null}}
 */
function Hero({hero}) {
  if (!hero) {
    return (
      <div className="hero-card">
        <div className="hero-copy">
          <h1 className="hero-title">{HERO.title}</h1>
          <p className="hero-text">{HERO.text}</p>
          <div className="hero-buy">
            <Link className="btn-buy" prefetch="intent" to="/collections/all">
              Ver catálogo
            </Link>
          </div>
        </div>
        <div className="hero-media">
          <img alt="" height={340} src={heroFallbackImage} width={340} />
        </div>
      </div>
    );
  }

  const to = `/products/${hero.handle}`;

  return (
    <div className="hero-card">
      <div className="hero-copy">
        <span className="hero-tag">Producto destacado</span>
        <h1 className="hero-title">
          <HeroTitle title={hero.title} />
        </h1>
        <p className="hero-text">{hero.text}</p>
        <ul className="hero-chips" aria-label="Especificaciones">
          {hero.specs.map((spec) => (
            <li className="hero-chip" key={spec}>
              {spec}
            </li>
          ))}
        </ul>
        <div className="hero-buy">
          <Link className="btn-buy" prefetch="intent" to={to}>
            Comprar ahora
          </Link>
          {hero.price && (
            <div className="hero-prices">
              {hero.compareAtPrice && (
                <s className="hero-price-old">
                  <span className="sr-only">Antes </span>
                  {formatMoney(hero.compareAtPrice)}
                </s>
              )}
              <strong className="hero-price">
                {hero.compareAtPrice && <span className="sr-only">Ahora </span>}
                {formatMoney(hero.price)}
              </strong>
            </div>
          )}
        </div>
      </div>
      <Link className="hero-media" prefetch="intent" tabIndex={-1} to={to}>
        {hero.image ? (
          <Image
            alt={hero.image.altText || hero.title}
            aspectRatio="1/1"
            data={hero.image}
            loading="eager"
            sizes="340px"
          />
        ) : (
          <img alt="" height={340} src={heroFallbackImage} width={340} />
        )}
        {hero.discount && (
          <span className="hero-save">
            <small>AHORRA</small>
            <strong>{hero.discount}%</strong>
          </span>
        )}
      </Link>
    </div>
  );
}

/**
 * @param {{title: string}}
 */
function HeroTitle({title}) {
  const marker = HERO.titleBreakAfter;
  if (!marker || !title.startsWith(marker) || title.length === marker.length) {
    return keepHyphenatedWords(title);
  }
  return (
    <>
      {marker}
      <br />
      {keepHyphenatedWords(title.slice(marker.length).trim())}
    </>
  );
}

/**
 * Keeps short hyphenated words ("All-in-One") on one line, so the large hero
 * title wraps between words like the design instead of at a hyphen. Longer
 * ones may still break, so they can't overflow the card on small phones.
 * @param {string} text
 */
function keepHyphenatedWords(text) {
  /** @type {React.ReactNode[]} */
  const parts = [];
  let last = 0;
  for (const match of text.matchAll(/\S+-\S+/g)) {
    if (match[0].length > 14) continue;
    parts.push(
      text.slice(last, match.index),
      <span className="nowrap" key={match.index}>
        {match[0]}
      </span>,
    );
    last = match.index + match[0].length;
  }
  parts.push(text.slice(last));
  return parts;
}

/**
 * Row B: the promo tiles as a grid under the hero — b.1 (Lectores) and b.2
 * (Impresoras) side by side in equal columns; they stack on phones (see
 * .promo-grid in app.css).
 * @param {{tiles: Array<ReturnType<typeof toPromoTile>>}}
 */
function PromoGrid({tiles}) {
  return (
    <div className="promo-grid">
      {tiles.map((tile) => (
        <Link
          className={`promo-tile ${tile.tone}`}
          key={tile.to}
          prefetch="intent"
          to={tile.to}
        >
          {tile.image ? (
            <Image
              alt=""
              data={tile.image}
              loading="eager"
              sizes="(min-width: 1281px) 640px, (min-width: 601px) 50vw, 100vw"
            />
          ) : tile.fallbackImage ? (
            <img
              alt=""
              height={500}
              loading="eager"
              src={tile.fallbackImage}
              width={500}
            />
          ) : null}
          <div>
            <span className="promo-kicker">{tile.kicker}</span>
            <span className="promo-title">{tile.title}</span>
          </div>
        </Link>
      ))}
    </div>
  );
}

/**
 * @param {{categories: import('~/lib/categories').Category[]}}
 */
function CategoryGrid({categories}) {
  return (
    <section className="container" aria-label="Categorías">
      <div className="category-grid">
        {categories.map((category) => (
          <Link
            className="category-card"
            key={category.id}
            prefetch="intent"
            to={`/collections/${category.handle}`}
          >
            <span className="category-code" aria-hidden="true">
              {categoryCode(category)}
            </span>
            <span>
              <strong>{category.title}</strong>
              <span>Ver productos</span>
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}

/**
 * @param {{
 *   products: Promise<FeaturedProductsQuery | null>;
 * }}
 */
function FeaturedProducts({products}) {
  return (
    <section className="container" aria-labelledby="home-featured">
      <div className="section-head">
        <h2 id="home-featured">Lo más vendido</h2>
        <Link prefetch="intent" to="/collections/all">
          Ver todo →
        </Link>
      </div>
      <Suspense fallback={<ProductGridSkeleton count={FEATURED_COUNT} />}>
        <Await resolve={products}>
          {(response) => (
            <div className="product-grid">
              {response?.products.nodes.map((product) => (
                <ProductItem key={product.id} product={product} loading="lazy" />
              ))}
            </div>
          )}
        </Await>
      </Suspense>
    </section>
  );
}

/**
 * @param {{count: number}}
 */
function ProductGridSkeleton({count}) {
  return (
    <div className="product-grid" aria-busy="true" aria-label="Cargando productos">
      {Array.from({length: count}, (_, i) => (
        <div className="product-card skeleton" key={i} aria-hidden="true">
          <span className="product-tile" />
          <span className="skeleton-line short" />
          <span className="skeleton-line" />
          <span className="skeleton-line price" />
        </div>
      ))}
    </div>
  );
}

const HERO_QUERY = `#graphql
fragment HeroProduct on Product {
  id
  title
  handle
  featuredImage {
    id
    url
    altText
    width
    height
  }
  priceRange {
    minVariantPrice {
      amount
      currencyCode
    }
  }
  compareAtPriceRange {
    minVariantPrice {
      amount
      currencyCode
    }
  }
  tagline: metafield(namespace: "custom", key: "tagline") {
    value
  }
  heroSpecs: metafield(namespace: "custom", key: "hero_specs") {
    value
  }
}
fragment PromoCollection on Collection {
  id
  handle
  image {
    id
    url
    altText
    width
    height
  }
  products(first: 1, sortKey: PRICE) {
    nodes {
      id
      priceRange {
        minVariantPrice {
          amount
          currencyCode
        }
      }
    }
  }
}
query HeroProduct(
  $handle: String!
  $tileAHandle: String!
  $tileBHandle: String!
  $country: CountryCode
  $language: LanguageCode
) @inContext(country: $country, language: $language) {
  heroProduct: product(handle: $handle) {
    ...HeroProduct
  }
  products(first: 1, sortKey: BEST_SELLING) {
    nodes {
      ...HeroProduct
    }
  }
  tileA: collection(handle: $tileAHandle) {
    ...PromoCollection
  }
  tileB: collection(handle: $tileBHandle) {
    ...PromoCollection
  }
}
`;

const FEATURED_PRODUCTS_QUERY = `#graphql
query FeaturedProducts(
  $first: Int!
  $country: CountryCode
  $language: LanguageCode
) @inContext(country: $country, language: $language) {
  products(first: $first, sortKey: BEST_SELLING) {
    nodes {
      ...ProductCard
    }
  }
}
${PRODUCT_CARD_FRAGMENT}
`;

/** @typedef {import('./+types/($locale)._index').Route} Route */
/** @typedef {import('storefrontapi.generated').HeroProductFragment} HeroProductFragment */
/** @typedef {import('storefrontapi.generated').PromoCollectionFragment} PromoCollectionFragment */
/** @typedef {import('storefrontapi.generated').FeaturedProductsQuery} FeaturedProductsQuery */
