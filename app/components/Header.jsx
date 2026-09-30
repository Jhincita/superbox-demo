import {Suspense} from 'react';
import {
  Await,
  Form,
  Link,
  NavLink,
  useAsyncValue,
  useLocation,
  useSearchParams,
} from 'react-router';
import {useAnalytics, useOptimisticCart} from '@shopify/hydrogen';
import {useAside} from '~/components/Aside';
import {Icon, Logo} from '~/components/Icon';
import {ThemeToggle} from '~/components/ThemeToggle';
import {getCategories} from '~/lib/categories';
import {STORE} from '~/lib/storeConfig';

/**
 * @param {HeaderProps}
 */
export function Header({header, cart, publicStoreDomain}) {
  const {shop, menu} = header;
  const categories = getCategories(header);

  return (
    <>
      <TopBar />
      <header className="header">
        <div className="container header-main">
          <Link prefetch="intent" to="/" className="brand" aria-label="Inicio">
            <Logo />
            <span className="brand-name">{STORE.name || shop.name}</span>
          </Link>
          <HeaderMenu
            menu={menu}
            primaryDomainUrl={shop.primaryDomain.url}
            publicStoreDomain={publicStoreDomain}
          />
          <div className="header-actions">
            <ThemeToggle />
            <Link
              prefetch="intent"
              to="/account"
              aria-label="Mi cuenta"
              className="icon-btn"
            >
              <Icon name="user" size={21} strokeWidth={1.8} />
            </Link>
            <CartToggle cart={cart} />
          </div>
        </div>
        <div className="container header-sub">
          <CategoryTabs categories={categories} />
          <HeaderSearch />
        </div>
      </header>
    </>
  );
}

function TopBar() {
  return (
    <div className="topbar">
      <div className="container topbar-inner">
        <span className="topbar-item">
          <Icon name="truck" size={16} strokeWidth={2} />
          Despacho a todo Chile
        </span>
        <span className="topbar-item">
          <Icon name="headset" size={16} strokeWidth={2} />
          Soporte técnico propio
        </span>
        <a
          className="topbar-whatsapp"
          href={STORE.whatsappUrl}
          rel="noopener noreferrer"
          target="_blank"
        >
          WhatsApp {STORE.whatsappNumber}
        </a>
      </div>
    </div>
  );
}

/**
 * Primary links ("Catálogo", "Contacto") from the Shopify header menu.
 * @param {{
 *   menu: HeaderProps['header']['menu'];
 *   primaryDomainUrl: string;
 *   publicStoreDomain: string;
 * }}
 */
export function HeaderMenu({menu, primaryDomainUrl, publicStoreDomain}) {
  const items = (menu?.items?.length ? menu.items : FALLBACK_HEADER_MENU.items)
    .map((item) => ({
      ...item,
      url: toRelativeUrl(item.url, primaryDomainUrl, publicStoreDomain),
    }))
    // The logo already links home.
    .filter((item) => item.url && item.url !== '/');

  return (
    <nav className="header-nav" aria-label="Principal">
      {items.map((item) => (
        <NavLink end key={item.id} prefetch="intent" to={item.url}>
          {item.title}
        </NavLink>
      ))}
    </nav>
  );
}

/**
 * @param {{categories: import('~/lib/categories').Category[]}}
 */
function CategoryTabs({categories}) {
  const {pathname} = useLocation();
  const tabs = [{id: 'all', handle: 'all', title: 'Todos'}, ...categories];

  return (
    <nav className="category-tabs" aria-label="Categorías">
      {tabs.map((tab) => {
        const to = `/collections/${tab.handle}`;
        const active = pathname.endsWith(to);
        return (
          <Link
            aria-current={active ? 'page' : undefined}
            className={`category-tab${active ? ' active' : ''}`}
            key={tab.id}
            prefetch="intent"
            to={to}
          >
            {tab.title}
          </Link>
        );
      })}
    </nav>
  );
}

function HeaderSearch() {
  const [searchParams] = useSearchParams();
  const {pathname} = useLocation();
  const current = pathname.endsWith('/search') ? searchParams.get('q') : '';

  return (
    <Form method="get" action="/search" className="header-search" role="search">
      <Icon name="search" size={17} />
      <input
        aria-label="Buscar"
        defaultValue={current ?? ''}
        key={current ?? ''}
        name="q"
        placeholder="Buscar lectores, POS, impresoras…"
        type="search"
      />
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
      className="cart-button"
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
      <Icon name="bag" size={19} />
      <span>{count}</span>
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
 * Strips the shop's own domain from menu URLs so they route client-side.
 * @param {string | null | undefined} url
 * @param {string} primaryDomainUrl
 * @param {string} publicStoreDomain
 */
export function toRelativeUrl(url, primaryDomainUrl, publicStoreDomain) {
  if (!url) return null;
  const isInternal =
    url.includes('myshopify.com') ||
    (publicStoreDomain && url.includes(publicStoreDomain)) ||
    (primaryDomainUrl && url.includes(primaryDomainUrl));
  return isInternal ? new URL(url).pathname : url;
}

const FALLBACK_HEADER_MENU = {
  id: 'fallback-header-menu',
  items: [
    {
      id: 'fallback-catalog',
      resourceId: null,
      tags: [],
      title: 'Catálogo',
      type: 'HTTP',
      url: '/collections/all',
      items: [],
    },
    {
      id: 'fallback-contact',
      resourceId: null,
      tags: [],
      title: 'Contacto',
      type: 'HTTP',
      url: STORE.contactPath,
      items: [],
    },
  ],
};

/**
 * @typedef {Object} HeaderProps
 * @property {HeaderQuery} header
 * @property {Promise<CartApiQueryFragment|null>} cart
 * @property {Promise<boolean>} isLoggedIn
 * @property {string} publicStoreDomain
 */

/** @typedef {import('storefrontapi.generated').HeaderQuery} HeaderQuery */
/** @typedef {import('storefrontapi.generated').CartApiQueryFragment} CartApiQueryFragment */
