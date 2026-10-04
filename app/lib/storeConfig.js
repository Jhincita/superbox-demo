/**
 * Store-level copy and settings for the Superbox storefront design.
 * Everything here is static content that isn't modelled in Shopify
 * (contact details, hero copy, promo tiles). Product, collection and
 * menu data still come from the Storefront API.
 */
export const STORE = {
  name: 'superbox',
  whatsappNumber: '+56 9 9845 0496',
  whatsappUrl: 'https://wa.me/56998450496',
  supportUrl: 'https://soporte.doblei.cl/',
  contactPath: '/pages/contact',
  location: 'Santiago, Chile',
  about:
    'Somos Superbox, empresa especializada en comercializar productos para el retail. Te invitamos a conocer nuestro catálogo con los mejores precios del mercado.',
};

/**
 * Handle of the Shopify menu whose collection links drive the category
 * navigation (header tabs, home grid, catalog filter, footer). When the
 * menu doesn't exist, the storefront falls back to the shop's collections.
 */
export const CATEGORY_MENU_HANDLE = 'categorias';

/** Collections never shown as categories. */
export const HIDDEN_COLLECTION_HANDLES = ['frontpage', 'all'];

export const HERO = {
  /** Shown when there is no hero product (title + "Ver catálogo" CTA). */
  title: 'Todo el equipo para tu negocio',
  /** One sentence. Used when the product has no `custom.tagline` metafield. */
  text: 'Caja completa en un solo equipo: pantalla táctil de 15", sin ventilador y lista para vender desde el primer día.',
  /** Exactly 3 chips. Used when the product has no `custom.hero_specs` metafield. */
  specs: ['Intel J6412', '128 GB SSD', 'Fanless'],
  /**
   * Optional line break in the product title: text before this marker goes
   * on the first line (e.g. 'BarPOS' → "BarPOS<br>All-in-One E200").
   * @type {string | null}
   */
  titleBreakAfter: null,
  /** Product highlighted in the hero card. Falls back to the first best seller. */
  productHandle: 'all-in-one-con-impresora-integrada-barpos-d1a',
};

/** Topbar copy (replaces the old value-props band on the homepage). */
export const TOPBAR_ITEMS = [
  'Envío a todo Chile',
  'Factura electrónica',
  'Soporte técnico incluido',
];

/**
 * Lime pill at the right end of the category bar. Change it monthly.
 * `collectionHandle` is the sale collection it links to.
 */
export const PROMO_PILL = {
  label: 'OFERTAS DE OCTUBRE',
  collectionHandle: 'ofertas',
};

/**
 * The two promo tiles next to the hero card. The image comes from the
 * collection's Shopify `image` field. When `kicker` is null and the tile is
 * marked `fromPrice`, the kicker is computed from the collection's lowest
 * product price ("DESDE $24.990").
 */
export const PROMO_TILES = [
  {
    collectionHandle: 'lectores-de-codigo',
    title: 'Lectores de código',
    kicker: null,
    fromPrice: true,
    fallbackKicker: 'DESDE $24.990',
    tone: 'olive',
  },
  {
    collectionHandle: 'impresoras-termicas',
    title: 'Impresoras térmicas',
    kicker: '3 CUOTAS SIN INTERÉS',
    fromPrice: false,
    fallbackKicker: '3 CUOTAS SIN INTERÉS',
    tone: 'orange',
  },
];

export const PRODUCT_PERKS = [
  'Despacho a todo Chile',
  'Soporte técnico Superbox incluido',
  'Precio con IVA incluido',
];

/** Upper bound of the catalog's max-price slider, in store currency. */
export const PRICE_FILTER = {min: 10000, max: 1100000, step: 10000};

/**
 * Design toggles:
 * - grayscalePhotos: render product photos in black & white (Theme 1a: off)
 * - compactGrid: 190px minimum card width instead of 240px ("densidad")
 */
export const DESIGN = {
  grayscalePhotos: false,
  compactGrid: false,
};
