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

/** @typedef {import('@shopify/hydrogen/storefront-api-types').MoneyV2} MoneyV2 */
