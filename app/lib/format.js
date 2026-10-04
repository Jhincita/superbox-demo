/**
 * Formats a Storefront API MoneyV2 the way Chilean shoppers expect it
 * ("$597.230" for CLP), keeping decimals for currencies that use them.
 * @param {Pick<MoneyV2, 'amount' | 'currencyCode'> | null | undefined} money
 * @param {number} [quantity]
 */
export function formatMoney(money, quantity = 1) {
  if (!money) return '';
  const amount = Number(money.amount) * quantity;
  try {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: money.currencyCode,
      currencyDisplay: 'narrowSymbol',
    }).format(amount);
  } catch {
    return `${amount} ${money.currencyCode}`;
  }
}

/**
 * @param {number} amount
 */
export function formatPlainAmount(amount) {
  return '$' + Math.round(amount).toLocaleString('es-CL');
}

/**
 * @param {number} count
 */
export function productCountLabel(count) {
  return count === 1 ? '1 producto' : `${count} productos`;
}

/**
 * Whole-number discount percentage from a compare-at price, or null when the
 * product isn't discounted (or either price is missing).
 * @param {Pick<MoneyV2, 'amount'> | null | undefined} price
 * @param {Pick<MoneyV2, 'amount'> | null | undefined} compareAtPrice
 * @return {number | null}
 */
export function discountPercent(price, compareAtPrice) {
  const current = Number(price?.amount);
  const original = Number(compareAtPrice?.amount);
  if (!Number.isFinite(current) || !Number.isFinite(original)) return null;
  if (original <= 0 || current < 0 || original <= current) return null;
  const percent = Math.round(((original - current) / original) * 100);
  return percent > 0 ? percent : null;
}

/** @typedef {import('@shopify/hydrogen/storefront-api-types').MoneyV2} MoneyV2 */
