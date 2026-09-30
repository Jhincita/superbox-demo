import {useState} from 'react';
import {Link, useNavigate} from 'react-router';
import {AddToCartButton} from '~/components/AddToCartButton';
import {useAside} from '~/components/Aside';
import {Icon} from '~/components/Icon';
import {STORE} from '~/lib/storeConfig';

/**
 * @param {{
 *   productOptions: MappedProductOptions[];
 *   selectedVariant: ProductFragment['selectedOrFirstAvailableVariant'];
 * }}
 */
export function ProductForm({productOptions, selectedVariant}) {
  const navigate = useNavigate();
  const {open} = useAside();
  const [quantity, setQuantity] = useState(1);
  const available = Boolean(selectedVariant?.availableForSale);

  return (
    <>
      {productOptions.map((option) => {
        // If there is only a single value in the option values, don't display the option
        if (option.optionValues.length === 1) return null;

        return (
          <div className="product-options" key={option.name}>
            <h6>{option.name}</h6>
            <div className="product-options-grid" role="radiogroup">
              {option.optionValues.map((value) => {
                const {
                  name,
                  handle,
                  variantUriQuery,
                  selected,
                  available,
                  exists,
                  isDifferentProduct,
                  swatch,
                } = value;
                const className = `option-chip${available ? '' : ' unavailable'}`;

                if (isDifferentProduct) {
                  // SEO
                  // When the variant is a combined listing child product
                  // that leads to a different url, we need to render it
                  // as an anchor tag
                  return (
                    <Link
                      aria-checked={selected}
                      className={className}
                      key={option.name + name}
                      prefetch="intent"
                      preventScrollReset
                      replace
                      role="radio"
                      to={`/products/${handle}?${variantUriQuery}`}
                    >
                      <ProductOptionSwatch swatch={swatch} name={name} />
                    </Link>
                  );
                }

                // SEO
                // When the variant is an update to the search param,
                // render it as a button with javascript navigating to
                // the variant so that SEO bots do not index these as
                // duplicated links
                return (
                  <button
                    aria-checked={selected}
                    className={className}
                    disabled={!exists}
                    key={option.name + name}
                    role="radio"
                    type="button"
                    onClick={() => {
                      if (!selected) {
                        void navigate(`?${variantUriQuery}`, {
                          replace: true,
                          preventScrollReset: true,
                        });
                      }
                    }}
                  >
                    <ProductOptionSwatch swatch={swatch} name={name} />
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}

      {available ? (
        <div className="buy-row">
          <div className="stepper">
            <button
              aria-label="Menos"
              disabled={quantity <= 1}
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              type="button"
            >
              <Icon name="minus" size={16} strokeWidth={2.2} />
            </button>
            <span aria-label="Cantidad">{quantity}</span>
            <button
              aria-label="Más"
              onClick={() => setQuantity((q) => q + 1)}
              type="button"
            >
              <Icon name="plus" size={16} strokeWidth={2.2} />
            </button>
          </div>
          <AddToCartButton
            className="btn btn-primary"
            onClick={() => open('cart')}
            lines={[
              {
                merchandiseId: selectedVariant.id,
                quantity,
                selectedVariant,
              },
            ]}
          >
            Agregar al carrito <Icon name="bag" size={18} strokeWidth={2} />
          </AddToCartButton>
        </div>
      ) : (
        <a
          className="btn btn-outline btn-lg"
          href={STORE.whatsappUrl}
          rel="noopener noreferrer"
          style={{justifyContent: 'flex-start', height: 52}}
          target="_blank"
        >
          Consultar reposición por WhatsApp
        </a>
      )}
    </>
  );
}

/**
 * @param {{
 *   swatch?: Maybe<ProductOptionValueSwatch> | undefined;
 *   name: string;
 * }}
 */
function ProductOptionSwatch({swatch, name}) {
  const image = swatch?.image?.previewImage?.url;
  const color = swatch?.color;

  if (!image && !color) return name;

  return (
    <span
      aria-label={name}
      className="option-swatch"
      style={{backgroundColor: color || 'transparent'}}
    >
      {!!image && <img src={image} alt={name} />}
    </span>
  );
}

/** @typedef {import('@shopify/hydrogen').MappedProductOptions} MappedProductOptions */
/** @typedef {import('@shopify/hydrogen/storefront-api-types').Maybe} Maybe */
/** @typedef {import('@shopify/hydrogen/storefront-api-types').ProductOptionValueSwatch} ProductOptionValueSwatch */
/** @typedef {import('storefrontapi.generated').ProductFragment} ProductFragment */
