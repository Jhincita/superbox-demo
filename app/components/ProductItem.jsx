import {Link} from 'react-router';
import {Image} from '@shopify/hydrogen';
import {AddToCartButton} from '~/components/AddToCartButton';
import {useAside} from '~/components/Aside';
import {Icon} from '~/components/Icon';
import {ProductPrice} from '~/components/ProductPrice';
import {useVariantUrl} from '~/lib/variants';
import {DESIGN, STORE} from '~/lib/storeConfig';

/**
 * Product card from the design: white tile, "Brand · Type" kicker, title,
 * price and a quick-add button. Products with several variants link to the
 * product page instead of adding a default variant.
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
  const kicker = [product.vendor, product.productType]
    .filter(Boolean)
    .join(' · ');

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
            sizes="(min-width: 64em) 300px, (min-width: 40em) 33vw, 50vw"
          />
        )}
        {soldOut && <span className="badge-soldout">Agotado</span>}
      </Link>
      <div className="product-card-body">
        {kicker && <span className="kicker">{kicker}</span>}
        <Link className="product-card-title" prefetch="intent" to={variantUrl}>
          {product.title}
        </Link>
      </div>
      <div className="product-card-foot">
        <ProductPrice
          price={product.priceRange.minVariantPrice}
          compareAtPrice={product.compareAtPriceRange?.minVariantPrice}
        />
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
            ariaLabel="Agregar al carrito"
            className="quick-add"
            lines={[{merchandiseId: singleVariant.id, quantity: 1}]}
            onClick={() => open('cart')}
          >
            <Icon name="plus" size={18} strokeWidth={2.2} />
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
    </article>
  );
}

/** @typedef {import('storefrontapi.generated').ProductCardFragment} ProductCardFragment */
