import {PRICE_FILTER} from '~/lib/storeConfig';

/** URL params owned by the catalog filters. */
export const CATALOG_PARAMS = {sort: 'orden', stock: 'stock', max: 'max'};

export const SORT_OPTIONS = [
  {value: 'rel', label: 'Más relevantes'},
  {value: 'asc', label: 'Precio, menor a mayor'},
  {value: 'desc', label: 'Precio, mayor a menor'},
  {value: 'az', label: 'Alfabéticamente, A–Z'},
];

/**
 * @param {URLSearchParams} searchParams
 * @return {CatalogState}
 */
export function parseCatalogParams(searchParams) {
  const sortParam = searchParams.get(CATALOG_PARAMS.sort);
  const sort = SORT_OPTIONS.some((o) => o.value === sortParam)
    ? /** @type {CatalogSort} */ (sortParam)
    : 'rel';
  const inStock = searchParams.get(CATALOG_PARAMS.stock) === 'en-existencia';
  const maxPrice = parseMaxPrice(searchParams.get(CATALOG_PARAMS.max));
  return {sort, inStock, maxPrice};
}

/**
 * `max` must be a plain integer. It is clamped to PRICE_FILTER; values at or
 * above the slider's upper bound mean "no price filter".
 * @param {string | null} raw
 * @return {number | null}
 */
export function parseMaxPrice(raw) {
  if (!raw || !/^\d{1,9}$/.test(raw)) return null;
  const value = Math.max(Number.parseInt(raw, 10), PRICE_FILTER.min);
  return value >= PRICE_FILTER.max ? null : value;
}

/**
 * Sort + filter variables for `collection.products`.
 * @param {CatalogState} state
 */
export function collectionProductsInput({sort, inStock, maxPrice}) {
  /** @type {Array<import('@shopify/hydrogen/storefront-api-types').ProductFilter>} */
  const filters = [];
  if (inStock) filters.push({available: true});
  if (maxPrice !== null) filters.push({price: {min: 0, max: maxPrice}});

  const sortKey = {
    rel: 'COLLECTION_DEFAULT',
    asc: 'PRICE',
    desc: 'PRICE',
    az: 'TITLE',
  }[sort];

  return {filters, sortKey, reverse: sort === 'desc'};
}

/**
 * Sort + search-syntax filter variables for the top-level `products` query
 * used by /collections/all (it has no `filters` argument).
 * @param {CatalogState} state
 */
export function allProductsInput({sort, inStock, maxPrice}) {
  const terms = [];
  if (inStock) terms.push('available_for_sale:true');
  if (maxPrice !== null) terms.push(`variants.price:<=${maxPrice}`);

  const sortKey = {
    rel: 'BEST_SELLING',
    asc: 'PRICE',
    desc: 'PRICE',
    az: 'TITLE',
  }[sort];

  return {
    query: terms.length ? terms.join(' AND ') : null,
    sortKey,
    reverse: sort === 'desc',
  };
}

/**
 * @typedef {'rel' | 'asc' | 'desc' | 'az'} CatalogSort
 * @typedef {{sort: CatalogSort; inStock: boolean; maxPrice: number | null}} CatalogState
 */
