import {Await, useLoaderData, useRouteLoaderData, Link} from 'react-router';
import {Suspense} from 'react';
import {Image} from '@shopify/hydrogen';
import {ProductItem} from '~/components/ProductItem';
import {MockShopNotice} from '~/components/MockShopNotice';
import {Icon, categoryIcon} from '~/components/Icon';
import {getCategories} from '~/lib/categories';
import {PRODUCT_CARD_FRAGMENT} from '~/lib/fragments';
import {formatMoney} from '~/lib/format';
import {DESIGN, HERO, STORE, VALUE_PROPS} from '~/lib/storeConfig';
import heroFallbackImage from '~/assets/images/hero-barpos-d1a.png';

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
  const {heroProduct, products} = await context.storefront.query(
    HERO_PRODUCT_QUERY,
    {variables: {handle: HERO.productHandle}},
  );

  return {
    isShopLinked: Boolean(context.env.PUBLIC_STORE_DOMAIN),
    heroProduct: heroProduct ?? products.nodes[0] ?? null,
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
    .query(FEATURED_PRODUCTS_QUERY)
    .catch((error) => {
      // Log query errors, but don't throw them so the page can still render
      console.error(error);
      return null;
    });

  return {
    featuredProducts,
  };
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
      <Hero product={data.heroProduct} />
      <ValueProps />
      {categories.length > 0 && <CategoryGrid categories={categories} />}
      <FeaturedProducts products={data.featuredProducts} />
    </div>
  );
}

/**
 * @param {{product: HeroProductFragment | null}}
 */
function Hero({product}) {
  const image = product?.featuredImage;
  const kicker = ['Destacado', product?.vendor].filter(Boolean).join(' · ');

  return (
    <section className="container hero">
      <div className="hero-copy">
        <span className="tag tag-accent">{HERO.kicker}</span>
        <h1>
          {HERO.title} <span>{HERO.titleAccent}</span>
        </h1>
        <p>{HERO.text}</p>
        <div className="hero-actions">
          <Link
            className="btn btn-primary btn-lg btn-split"
            prefetch="intent"
            to="/collections/all"
          >
            Ver catálogo <Icon name="arrow" size={18} strokeWidth={2.2} />
          </Link>
          <a
            className="btn btn-outline btn-lg"
            href={STORE.whatsappUrl}
            rel="noopener noreferrer"
            target="_blank"
          >
            Hablar con un asesor
          </a>
        </div>
      </div>
      <Link
        className="hero-card"
        prefetch="intent"
        to={product ? `/products/${product.handle}` : '/collections/all'}
      >
        {image ? (
          <Image
            alt={image.altText || product.title}
            className={DESIGN.grayscalePhotos ? 'grayscale' : undefined}
            data={image}
            loading="eager"
            sizes="(min-width: 64em) 520px, 90vw"
          />
        ) : (
          <img
            alt=""
            className={DESIGN.grayscalePhotos ? 'grayscale' : undefined}
            src={heroFallbackImage}
          />
        )}
        {product && (
          <span className="hero-card-caption">
            <span>
              <span className="kicker">{kicker}</span>
              <strong>{product.title}</strong>
            </span>
            <strong>{formatMoney(product.priceRange.minVariantPrice)}</strong>
          </span>
        )}
      </Link>
    </section>
  );
}

function ValueProps() {
  return (
    <section className="value-props">
      <div className="container value-props-grid">
        {VALUE_PROPS.map((prop) => (
          <div className="value-prop" key={prop.title}>
            <Icon name={prop.icon} size={26} strokeWidth={1.8} />
            <div>
              <strong>{prop.title}</strong>
              <span>{prop.text}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/**
 * @param {{categories: import('~/lib/categories').Category[]}}
 */
function CategoryGrid({categories}) {
  return (
    <section className="container home-section" aria-labelledby="home-cats">
      <div className="section-head">
        <h2 id="home-cats">Compra por categoría</h2>
        <Link className="btn btn-ghost" prefetch="intent" to="/collections/all">
          Ver todos los productos
        </Link>
      </div>
      <div className="category-grid">
        {categories.map((category) => (
          <Link
            className="category-card"
            key={category.id}
            prefetch="intent"
            to={`/collections/${category.handle}`}
          >
            <Icon
              name={categoryIcon(`${category.handle} ${category.title}`)}
              size={40}
              strokeWidth={1.6}
            />
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
    <section className="container home-section" aria-labelledby="home-featured">
      <div className="section-head ruled">
        <h2 id="home-featured">Los más buscados</h2>
        <Link className="btn btn-ghost" prefetch="intent" to="/collections/all">
          Ver catálogo completo
        </Link>
      </div>
      <Suspense fallback={<p className="muted">Cargando productos…</p>}>
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

const HERO_PRODUCT_QUERY = `#graphql
  fragment HeroProduct on Product {
    id
    title
    handle
    vendor
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
  }
  query HeroProduct(
    $handle: String!
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
  }
`;

const FEATURED_PRODUCTS_QUERY = `#graphql
  query FeaturedProducts($country: CountryCode, $language: LanguageCode)
    @inContext(country: $country, language: $language) {
    products(first: 8, sortKey: BEST_SELLING) {
      nodes {
        ...ProductCard
      }
    }
  }
  ${PRODUCT_CARD_FRAGMENT}
`;

/** @typedef {import('./+types/($locale)._index').Route} Route */
/** @typedef {import('storefrontapi.generated').HeroProductFragment} HeroProductFragment */
/** @typedef {import('storefrontapi.generated').FeaturedProductsQuery} FeaturedProductsQuery */
/** @typedef {ReturnType<typeof useLoaderData<typeof loader>>} LoaderReturnData */
