import {FilterXSS, escapeAttrValue, friendlyAttrValue} from 'xss';

/**
 * Strict allowlist for rich text authored in the Shopify admin (product
 * descriptions, pages, policies, blog articles). Anything not listed is
 * removed: no scripts, iframes, forms, SVG, inline styles or `on*` handlers.
 */
const ALLOWED = {
  a: ['href', 'title', 'target'],
  abbr: ['title'],
  b: [],
  blockquote: [],
  br: [],
  caption: [],
  code: [],
  dd: [],
  div: [],
  dl: [],
  dt: [],
  em: [],
  figcaption: [],
  figure: [],
  h1: [],
  h2: [],
  h3: [],
  h4: [],
  h5: [],
  h6: [],
  hr: [],
  i: [],
  img: ['src', 'alt', 'title', 'width', 'height', 'loading'],
  li: [],
  ol: ['start'],
  p: [],
  pre: [],
  s: [],
  small: [],
  span: [],
  strong: [],
  sub: [],
  sup: [],
  table: [],
  tbody: [],
  td: ['colspan', 'rowspan'],
  tfoot: [],
  th: ['colspan', 'rowspan', 'scope'],
  thead: [],
  tr: [],
  u: [],
  ul: [],
};

/** Elements removed together with their content. */
const STRIP_WITH_BODY = [
  'script',
  'style',
  'iframe',
  'frame',
  'object',
  'embed',
  'noscript',
  'template',
  'svg',
  'math',
  'form',
  'textarea',
  'select',
  'button',
];

const SCHEME = /^([a-z][a-z0-9+.-]*):/i;

/**
 * @param {string} value
 * @param {'href' | 'src'} attr
 * @return {string | null}
 */
function safeUrl(value, attr) {
  // Browsers ignore whitespace and control characters inside URLs.
  // eslint-disable-next-line no-control-regex
  const url = friendlyAttrValue(value).replace(/[\u0000- \u007F]/g, '');
  if (!url) return null;
  const scheme = SCHEME.exec(url)?.[1]?.toLowerCase();
  if (!scheme) return url; // relative URL, fragment or protocol-relative
  const allowed =
    attr === 'src' ? ['https', 'http'] : ['https', 'http', 'mailto', 'tel'];
  return allowed.includes(scheme) ? url : null;
}

const filter = new FilterXSS({
  whiteList: ALLOWED,
  stripIgnoreTag: true,
  stripIgnoreTagBody: STRIP_WITH_BODY,
  allowCommentTag: false,
  css: false,
  safeAttrValue(tag, name, value) {
    if (name === 'href' || name === 'src') {
      const url = safeUrl(value, name);
      return url ? escapeAttrValue(url) : '';
    }
    if (name === 'target') return '_blank';
    return escapeAttrValue(friendlyAttrValue(value));
  },
});

/**
 * Sanitizes admin-authored HTML before it is rendered with
 * dangerouslySetInnerHTML. Runs on the server only (loaders).
 * @param {string | null | undefined} html
 */
export function sanitizeHtml(html) {
  if (!html) return '';
  return (
    filter
      .process(String(html))
      // Every link may open in a new tab, so none can reach window.opener.
      .replace(/<a\s/gi, '<a rel="noopener noreferrer" ')
  );
}
