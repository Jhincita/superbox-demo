import {formatMoney} from '~/lib/format';

/**
 * @param {{
 *   price?: MoneyV2;
 *   compareAtPrice?: MoneyV2 | null;
 *   className?: string;
 * }}
 */
export function ProductPrice({price, compareAtPrice, className = 'price'}) {
  const onSale =
    compareAtPrice &&
    price &&
    Number(compareAtPrice.amount) > Number(price.amount);

  return (
    <div aria-label="Precio" className={className} role="group">
      {price ? formatMoney(price) : <span>&nbsp;</span>}
      {onSale ? <s>{formatMoney(compareAtPrice)}</s> : null}
    </div>
  );
}

/** @typedef {import('@shopify/hydrogen/storefront-api-types').MoneyV2} MoneyV2 */
