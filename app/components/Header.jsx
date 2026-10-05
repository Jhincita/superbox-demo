import {Suspense} from 'react';
import {
  Await,
  Form,
  Link,
  useAsyncValue,
  useLocation,
  useSearchParams,
} from 'react-router';
import {useAnalytics, useOptimisticCart} from '@shopify/hydrogen';
import {useAside} from '~/components/Aside';
import {Icon, Logo} from '~/components/Icon';
import {ThemeToggle} from '~/components/ThemeToggle';
import {getCategories} from '~/lib/categories';
import {PROMO_PILL, STORE, TOPBAR_ITEMS} from '~/lib/storeConfig';
import {SEARCH_TERM_MAX_LENGTH, normalizeSearchTerm} from '~/lib/urls';

/**
 * Theme 1a header: olive topbar, orange band (logo, search, actions) and the
 * white category bar.
 * @param {HeaderProps}
 */
export function Header({header, cart}) {
  const categories = getCategories(header);

  return (
    <>
      <TopBar />
      <header className="header">
        <div className="container header-main">
          <Link prefetch="intent" to="/" className="brand" aria-label="Inicio">
            <Logo size={42} variant="onOrange" />
            <span className="brand-name">{STORE.name}</span>
          </Link>
          <HeaderSearch />
          <div className="header-actions">
            <ThemeToggle />
            <Link className="header-action" prefetch="intent" to="/account">
              <Icon className="header-icon" name="user" size={22} />
              <span className="header-label">Ingresar</span>
            </Link>
            <CartToggle cart={cart} />
          </div>
        </div>
      </header>
      <CategoryTabs categories={categories} />
    </>
  );
}

function TopBar() {
  return (
    <div className="topbar">
      <div className="container topbar-inner" role="list">
        {TOPBAR_ITEMS.map((item) => (
          <span key={item} role="listitem">
            {item}
          </span>
        ))}
        <span role="listitem">
          <a
            className="topbar-whatsapp"
            href={STORE.whatsappUrl}
            rel="noopener noreferrer"
            target="_blank"
          >
            WhatsApp {STORE.whatsappNumber}
          </a>
        </span>
      </div>
    </div>
  );
}

/**
 * @param {{categories: import('~/lib/categories').Category[]}}
 */
function CategoryTabs({categories}) {
  const {pathname} = useLocation();
  const isActive = (/** @type {string} */ to) =>
    pathname === to || pathname.endsWith(to);
  const allActive = isActive('/collections/all');
  const promoTo = `/collections/${PROMO_PILL.collectionHandle}`;

  return (
    <div className="category-bar">
      <nav className="container category-tabs" aria-label="Categorías">
        <Link
          aria-current={allActive ? 'page' : undefined}
          className={`category-tab all${allActive ? ' active' : ''}`}
          prefetch="intent"
          to="/collections/all"
        >
          <Icon name="menu" size={18} strokeWidth={2.2} />
          Todas las categorías
        </Link>
        {categories.map((category) => {
          const to = `/collections/${category.handle}`;
          const active = isActive(to);
          return (
            <Link
              aria-current={active ? 'page' : undefined}
              className={`category-tab${active ? ' active' : ''}`}
              key={category.id}
              prefetch="intent"
              to={to}
            >
              {category.title}
            </Link>
          );
        })}
        <Link className="tag-offers" prefetch="intent" to={promoTo}>
          {PROMO_PILL.label}
        </Link>
      </nav>
    </div>
  );
}

function HeaderSearch() {
  const [searchParams] = useSearchParams();
  const {pathname} = useLocation();
  const current = pathname.endsWith('/search')
    ? normalizeSearchTerm(searchParams.get('q'))
    : '';

  return (
    <Form method="get" action="/search" className="header-search" role="search">
      <input
        aria-label="Buscar productos"
        defaultValue={current}
        key={current}
        maxLength={SEARCH_TERM_MAX_LENGTH}
        name="q"
        placeholder="Busca lectores, impresoras, POS…"
        type="search"
      />
      <button type="submit">Buscar</button>
    </Form>
  );
}

/**
 * @param {{count: number}}
 */
function CartBadge({count}) {
  const {open} = useAside();
  const {publish, shop, cart, prevCart} = useAnalytics();

  return (
    <a
      aria-label={`Carrito (${count})`}
      className="header-action cart-button"
      href="/cart"
      onClick={(e) => {
        e.preventDefault();
        open('cart');
        publish('cart_viewed', {
          cart,
          prevCart,
          shop,
          url: window.location.href || '',
        });
      }}
    >
      <Icon className="header-icon" name="bag" size={22} />
      <span className="header-label">Carrito</span>
      <span className="cart-count">{count}</span>
    </a>
  );
}

/**
 * @param {Pick<HeaderProps, 'cart'>}
 */
function CartToggle({cart}) {
  return (
    <Suspense fallback={<CartBadge count={0} />}>
      <Await resolve={cart}>
        <CartBanner />
      </Await>
    </Suspense>
  );
}

function CartBanner() {
  const originalCart = useAsyncValue();
  const cart = useOptimisticCart(originalCart);
  return <CartBadge count={cart?.totalQuantity ?? 0} />;
}

/**
 * @typedef {Object} HeaderProps
 * @property {HeaderQuery} header
 * @property {Promise<CartApiQueryFragment|null>} cart
 * @property {Promise<boolean>} isLoggedIn
 * @property {string} publicStoreDomain
 */

/** @typedef {import('storefrontapi.generated').HeaderQuery} HeaderQuery */
/** @typedef {import('storefrontapi.generated').CartApiQueryFragment} CartApiQueryFragment */
