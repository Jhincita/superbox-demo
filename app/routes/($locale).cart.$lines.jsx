import {redirect} from 'react-router';

/** Upper bound on lines accepted from a cart permalink. */
const MAX_LINES = 50;

/**
 * Automatically creates a new cart based on the URL and redirects straight to checkout.
 * Expected URL structure:
 * ```js
 * /cart/<variant_id>:<quantity>
 *
 * ```
 *
 * More than one `<variant_id>:<quantity>` separated by a comma, can be supplied in the URL, for
 * carts with more than one product variant.
 *
 * @example
 * Example path creating a cart with two product variants, different quantities, and a discount code in the querystring:
 * ```js
 * /cart/41007289663544:1,41007289696312:2?discount=HYDROBOARD
 *
 * ```
 * @param {Route.LoaderArgs}
 */
export async function loader({request, context, params}) {
  const {cart} = context;
  const {lines} = params;
  if (!lines) return redirect('/cart');
  const linesMap = lines
    .split(',')
    .slice(0, MAX_LINES)
    .map((line) => {
      const [variantId, rawQuantity] = line.split(':');
      const quantity = Number.parseInt(rawQuantity ?? '1', 10);
      if (!/^\d{1,20}$/.test(variantId ?? '')) return null;
      if (!Number.isInteger(quantity) || quantity < 1 || quantity > 99) {
        return null;
      }
      return {
        merchandiseId: `gid://shopify/ProductVariant/${variantId}`,
        quantity,
      };
    });

  if (!linesMap.length || linesMap.some((line) => line === null)) {
    throw new Response('Invalid cart link', {status: 400});
  }

  const url = new URL(request.url);
  const discount = url.searchParams.get('discount')?.trim().slice(0, 255);
  const discountArray = discount ? [discount] : [];

  // create a cart
  const result = await cart.create({
    lines: linesMap,
    discountCodes: discountArray,
  });

  const cartResult = result.cart;

  if (result.errors?.length || !cartResult) {
    throw new Response('Link may be expired. Try checking the URL.', {
      status: 410,
    });
  }

  // Update cart id in cookie
  const headers = cart.setCartId(cartResult.id);

  // redirect to checkout
  if (cartResult.checkoutUrl) {
    return redirect(cartResult.checkoutUrl, {headers});
  } else {
    throw new Error('No checkout URL found');
  }
}

export default function Component() {
  return null;
}

/** @typedef {import('./+types/cart.$lines').Route} Route */
/** @typedef {ReturnType<typeof useLoaderData<typeof loader>>} LoaderReturnData */
