import {CATEGORY_CODES, HIDDEN_COLLECTION_HANDLES} from '~/lib/storeConfig';

/**
 * Resolves the storefront's category list from the root loader's header
 * query: the collection links of the category menu when it exists,
 * otherwise every visible collection.
 * @param {HeaderQuery | null | undefined} header
 * @return {Category[]}
 */
export function getCategories(header) {
  if (!header) return [];

  const fromMenu = (header.categoryMenu?.items ?? [])
    .map((item) => {
      const handle = collectionHandleFromUrl(item.url);
      return handle ? {id: item.id, handle, title: item.title} : null;
    })
    .filter(Boolean);
  if (fromMenu.length) return fromMenu;

  return (header.collections?.nodes ?? [])
    .filter((c) => !HIDDEN_COLLECTION_HANDLES.includes(c.handle))
    .map(({id, handle, title}) => ({id, handle, title}));
}

/**
 * Short badge code for a category ("LC", "POS", "BIO"…): the first
 * CATEGORY_CODES entry matching its handle or title, otherwise the first
 * three letters of the title.
 * @param {Pick<Category, 'handle' | 'title'>} category
 */
export function categoryCode({handle, title}) {
  const key = removeAccents(`${handle} ${title}`.toLowerCase());
  const known = CATEGORY_CODES.find(({match}) => match.test(key));
  if (known) return known.code;
  const letters = removeAccents(title).replace(/[^a-z0-9]/gi, '');
  return (letters.slice(0, 3) || '•').toUpperCase();
}

/**
 * @param {string} value
 */
function removeAccents(value) {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

/**
 * @param {string | null | undefined} url
 */
function collectionHandleFromUrl(url) {
  if (!url) return null;
  try {
    const {pathname} = new URL(url, 'https://placeholder.invalid');
    const match = pathname.match(/\/collections\/([^/?#]+)\/?$/);
    return match && match[1] !== 'all' ? decodeURIComponent(match[1]) : null;
  } catch {
    return null;
  }
}

/**
 * @typedef {{id: string; handle: string; title: string}} Category
 */

/** @typedef {import('storefrontapi.generated').HeaderQuery} HeaderQuery */
