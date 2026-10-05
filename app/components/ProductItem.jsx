import {Link} from 'react-router';
import {Image} from '@shopify/hydrogen';
import {AddToCartButton} from '~/components/AddToCartButton';
import {useAside} from '~/components/Aside';
import {Icon} from '~/components/Icon';
import {discountPercent, formatMoney} from '~/lib/format';
import {useVariantUrl} from '~/lib/variants';
import {DESIGN, STORE} from '~/lib/storeConfig';

/**
 * Theme 1a product card: image well with a discount badge, vendor kicker,
 * 2-line title, price block and a lime quick-add button. Products with
 * several variants link to the product page instead of adding a default
 * variant.
 * @param {{
 *   product: ProductCardFragment;
 *   loading?: 'eager' | 'lazy';
 *   to?: string;
 * }}
 */
export function ProductItem({product, loading, to}) {
  const defaultUrl = useVariantUrl(product.handle);
  const variantUrl = to ?? defaultUrl;
  const {open} = useAside();
  const image = product.featuredImage;
  const variants = product.variants?.nodes ?? [];
  const soldOut = !product.availableForSale;
  const singleVariant = variants.length === 1 ? variants[0] : null;
  const price = product.priceRange.minVariantPrice;
  const compareAt = product.compareAtPriceRange?.minVariantPrice;
  const discount = discountPercent(price, compareAt);

  return (
    <article className="product-card">
      <Link
        aria-label={product.title}
        className="product-tile"
        prefetch="intent"
        to={variantUrl}
      >
        {image && (
          <Image
            alt={image.altText || product.title}
            aspectRatio="1/1"
            className={DESIGN.grayscalePhotos ? 'grayscale' : undefined}
            data={image}
            loading={loading}
            sizes="(min-width: 64em) 300px, (min-width: 45em) 33vw, 50vw"
          />
        )}
        {soldOut ? (
          <span className="badge-soldout">Agotado</span>
        ) : discount ? (
          <span className="badge-off">-{discount}%</span>
        ) : null}
      </Link>
      {product.vendor && <span className="kicker">{product.vendor}</span>}
      <Link className="product-card-title" prefetch="intent" to={variantUrl}>
        {product.title}
      </Link>
      <div className="product-card-foot">
        <div className="product-card-prices">
          {discount ? (
            <s className="price-old">
              <span className="sr-only">Antes </span>
              {formatMoney(compareAt)}
            </s>
          ) : null}
          {Number(price.amount) > 0 && (
            <span className="price">
              {discount ? <span className="sr-only">Ahora </span> : null}
              {formatMoney(price)}
            </span>
          )}
        </div>
        {soldOut ? (
          <a
            className="notify-link"
            href={STORE.whatsappUrl}
            rel="noopener noreferrer"
            target="_blank"
          >
            Avísame
          </a>
        ) : singleVariant?.availableForSale ? (
          <AddToCartButton
            ariaLabel={`Agregar ${product.title} al carrito`}
            className="quick-add"
            lines={[{merchandiseId: singleVariant.id, quantity: 1}]}
            onClick={() => open('cart')}
          >
            <Icon name="plus" size={20} strokeWidth={2.4} />
          </AddToCartButton>
        ) : (
          <Link
            aria-label={`Ver opciones de ${product.title}`}
            className="quick-add"
            prefetch="intent"
            to={variantUrl}
          >
            <Icon name="arrow" size={18} strokeWidth={2.2} />
          </Link>
        )}
      </div>
      {product.availableForSale && (
        <span className="ship-line">{'● Despacho en 24–48\u00a0h'}</span>
      )}
    </article>
  );
}

/** @typedef {import('storefrontapi.generated').ProductCardFragment} ProductCardFragment */
