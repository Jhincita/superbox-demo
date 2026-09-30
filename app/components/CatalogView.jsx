import {useEffect, useState} from 'react';
import {
  Link,
  useLocation,
  useNavigate,
  useRouteLoaderData,
  useSearchParams,
} from 'react-router';
import {PaginatedResourceSection} from '~/components/PaginatedResourceSection';
import {ProductItem} from '~/components/ProductItem';
import {getCategories} from '~/lib/categories';
import {
  CATALOG_PARAMS,
  SORT_OPTIONS,
  parseCatalogParams,
} from '~/lib/catalog';
import {formatPlainAmount, productCountLabel} from '~/lib/format';
import {PRICE_FILTER, STORE} from '~/lib/storeConfig';

/** Pagination params that must reset whenever the filters change. */
const PAGINATION_PARAMS = ['cursor', 'direction'];

/**
 * Catalog layout from the design: breadcrumb, title, sort select, filter
 * sidebar (category, availability, max price) and the product grid.
 * Filter state lives in the URL so results are server-rendered and shareable.
 * @param {{
 *   title: string;
 *   description?: string | null;
 *   activeHandle: string;
 *   products: {
 *     nodes: Array<ProductCardFragment>;
 *     pageInfo: {hasNextPage: boolean; hasPreviousPage: boolean};
 *   };
 * }}
 */
export function CatalogView({title, description, activeHandle, products}) {
  /** @type {import('~/root').RootLoader | undefined} */
  const root = useRouteLoaderData('root');
  const categories = getCategories(root?.header);
  const [searchParams] = useSearchParams();
  const {pathname} = useLocation();
  const navigate = useNavigate();
  const state = parseCatalogParams(searchParams);
  const hasFilters = state.inStock || state.maxPrice !== null;

  /**
   * @param {Record<string, string | null>} changes
   */
  function updateParams(changes) {
    const next = new URLSearchParams(searchParams);
    PAGINATION_PARAMS.forEach((key) => next.delete(key));
    for (const [key, value] of Object.entries(changes)) {
      if (value === null) next.delete(key);
      else next.set(key, value);
    }
    const query = next.toString();
    void navigate(`${pathname}${query ? `?${query}` : ''}`, {
      preventScrollReset: true,
      replace: true,
    });
  }

  function resetFilters() {
    updateParams({
      [CATALOG_PARAMS.sort]: null,
      [CATALOG_PARAMS.stock]: null,
      [CATALOG_PARAMS.max]: null,
    });
  }

  /** Keeps the active filters when jumping between categories. */
  function categoryHref(handle) {
    const next = new URLSearchParams(searchParams);
    PAGINATION_PARAMS.forEach((key) => next.delete(key));
    const query = next.toString();
    return `/collections/${handle}${query ? `?${query}` : ''}`;
  }

  const count = products.nodes.length;
  const resultLabel = products.pageInfo.hasNextPage
    ? `${count}+ productos`
    : productCountLabel(count);

  return (
    <div className="container catalog">
      <nav className="breadcrumb" aria-label="Ruta de navegación">
        <Link to="/">Inicio</Link>
        <span aria-hidden="true">/</span>
        <span aria-current="page">{title}</span>
      </nav>
      <div className="catalog-head">
        <div>
          <h1>{title}</h1>
          <p>
            {description ||
              'Todos los equipos necesarios para armar tu negocio.'}
          </p>
        </div>
        <div className="catalog-sort">
          <span>{resultLabel}</span>
          <select
            aria-label="Ordenar"
            className="input"
            value={state.sort}
            onChange={(e) =>
              updateParams({
                [CATALOG_PARAMS.sort]:
                  e.target.value === 'rel' ? null : e.target.value,
              })
            }
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="catalog-body">
        <aside className="catalog-filters" aria-label="Filtros">
          <div className="filter-group">
            <h6>Categoría</h6>
            {[{id: 'all', handle: 'all', title: 'Todos'}, ...categories].map(
              (category) => {
                const active = category.handle === activeHandle;
                return (
                  <Link
                    aria-current={active ? 'true' : undefined}
                    className="radio"
                    key={category.id}
                    prefetch="intent"
                    preventScrollReset
                    to={categoryHref(category.handle)}
                  >
                    <span className="dot" />
                    {category.title}
                  </Link>
                );
              },
            )}
          </div>
          <div className="filter-group">
            <h6>Disponibilidad</h6>
            <div className="seg" role="group" aria-label="Disponibilidad">
              <button
                aria-pressed={!state.inStock}
                className="seg-opt"
                onClick={() => updateParams({[CATALOG_PARAMS.stock]: null})}
                type="button"
              >
                Todos
              </button>
              <button
                aria-pressed={state.inStock}
                className="seg-opt"
                onClick={() =>
                  updateParams({[CATALOG_PARAMS.stock]: 'en-existencia'})
                }
                type="button"
              >
                En existencia
              </button>
            </div>
          </div>
          <PriceFilter
            value={state.maxPrice}
            onCommit={(max) =>
              updateParams({
                [CATALOG_PARAMS.max]:
                  max >= PRICE_FILTER.max ? null : String(max),
              })
            }
          />
          <div className="filter-group">
            <button
              className="btn btn-secondary"
              style={{alignSelf: 'flex-start'}}
              onClick={resetFilters}
              type="button"
            >
              Restablecer filtros
            </button>
          </div>
        </aside>

        <div className="catalog-results">
          {count === 0 ? (
            <div className="empty-state">
              <h3>No encontramos productos con esos filtros.</h3>
              <p>
                Prueba con otra categoría o escríbenos: conseguimos el equipo
                que necesitas.
              </p>
              <div className="actions">
                {hasFilters ? (
                  <button
                    className="btn btn-primary"
                    onClick={resetFilters}
                    type="button"
                  >
                    Ver todo
                  </button>
                ) : (
                  <Link className="btn btn-primary" to="/collections/all">
                    Ver todo
                  </Link>
                )}
                <a
                  className="btn btn-secondary"
                  href={STORE.whatsappUrl}
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  Consultar por WhatsApp
                </a>
              </div>
            </div>
          ) : (
            <PaginatedResourceSection
              connection={products}
              resourcesClassName="product-grid"
            >
              {({node: product, index}) => (
                <ProductItem
                  key={product.id}
                  product={product}
                  loading={index < 8 ? 'eager' : undefined}
                />
              )}
            </PaginatedResourceSection>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Max-price slider. Moves locally while dragging and commits to the URL
 * once the value settles, so each tick doesn't trigger a navigation.
 * @param {{value: number | null; onCommit: (max: number) => void}}
 */
function PriceFilter({value, onCommit}) {
  const committed = value ?? PRICE_FILTER.max;
  const [draft, setDraft] = useState(committed);

  useEffect(() => setDraft(committed), [committed]);

  useEffect(() => {
    if (draft === committed) return;
    const timeout = setTimeout(() => onCommit(draft), 400);
    return () => clearTimeout(timeout);
    // onCommit is recreated every render; the draft value is what matters.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draft, committed]);

  return (
    <div className="filter-group">
      <h6>Precio máximo</h6>
      <input
        aria-label="Precio máximo"
        max={PRICE_FILTER.max}
        min={PRICE_FILTER.min}
        onChange={(e) => setDraft(Number(e.target.value))}
        step={PRICE_FILTER.step}
        type="range"
        value={draft}
      />
      <div className="range-labels">
        <span>{formatPlainAmount(PRICE_FILTER.min)}</span>
        <strong>{formatPlainAmount(draft)}</strong>
      </div>
    </div>
  );
}

/** @typedef {import('storefrontapi.generated').ProductCardFragment} ProductCardFragment */
