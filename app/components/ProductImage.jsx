import {Image} from '@shopify/hydrogen';
import {DESIGN} from '~/lib/storeConfig';

/**
 * @param {{
 *   image: ProductVariantFragment['image'];
 * }}
 */
export function ProductImage({image}) {
  return (
    <div className="product-media">
      {image ? (
        <Image
          alt={image.altText || 'Imagen del producto'}
          aspectRatio="1/1"
          className={DESIGN.grayscalePhotos ? 'grayscale' : undefined}
          data={image}
          key={image.id}
          loading="eager"
          sizes="(min-width: 64em) 600px, 100vw"
        />
      ) : null}
    </div>
  );
}

/** @typedef {import('storefrontapi.generated').ProductVariantFragment} ProductVariantFragment */
