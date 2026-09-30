/**
 * Store-level copy and settings for the Superbox storefront design.
 * Everything here is static content that isn't modelled in Shopify
 * (contact details, hero copy, value props). Product, collection and
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
  kicker: 'Equipamiento para retail',
  title: 'Todo el equipo para armar',
  titleAccent: 'tu negocio.',
  text: 'Lectores de código, terminales POS, impresoras y periféricos para el comercio chileno. Precios directos y soporte técnico de nuestro propio equipo.',
  /** Product highlighted in the hero card. Falls back to the first best seller. */
  productHandle: 'all-in-one-con-impresora-integrada-barpos-d1a',
};

export const VALUE_PROPS = [
  {icon: 'truck', title: 'Despacho nacional', text: 'Enviamos a todo Chile.'},
  {
    icon: 'headset',
    title: 'Soporte técnico',
    text: 'Configuración y ayuda post venta.',
  },
  {
    icon: 'shield',
    title: 'Compra segura',
    text: 'Pago protegido, IVA incluido.',
  },
  {
    icon: 'chat',
    title: 'Asesoría directa',
    text: 'Te ayudamos a elegir por WhatsApp.',
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
 * Design toggles from the Claude Design file:
 * - grayscalePhotos: render product photos in black & white ("fotosColor" off)
 * - compactGrid: 190px minimum card width instead of 240px ("densidad")
 */
export const DESIGN = {
  grayscalePhotos: true,
  compactGrid: false,
};
