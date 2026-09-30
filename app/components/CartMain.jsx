import {useOptimisticCart} from '@shopify/hydrogen';
import {Link} from 'react-router';
import {useAside} from '~/components/Aside';
import {CartLineItem} from '~/components/CartLineItem';
import {CartSummary} from './CartSummary';
/**
 * Returns a map of all line items and their children.
 * @param {CartLine[]} lines
 * @return {LineItemChildrenMap}
 */
function getLineItemChildrenMap(lines) {
  const children = {};
  for (const line of lines) {
    if ('parentRelationship' in line && line.parentRelationship?.parent) {
      const parentId = line.parentRelationship.parent.id;
      if (!children[parentId]) children[parentId] = [];
      children[parentId].push(line);
    }
    if ('lineComponents' in line) {
      const lineChildren = getLineItemChildrenMap(line.lineComponents);
      for (const [parentId, childIds] of Object.entries(lineChildren)) {
        if (!children[parentId]) children[parentId] = [];
        children[parentId].push(...childIds);
      }
    }
  }
  return children;
}
/**
 * The main cart component that displays the cart items and summary.
 * It is used by both the /cart route and the cart aside dialog.
 * @param {CartMainProps}
 */
export function CartMain({layout, cart: originalCart}) {
  // The useOptimisticCart hook applies pending actions to the cart
  // so the user immediately sees feedback when they modify the cart.
  const cart = useOptimisticCart(originalCart);

  const lines = cart?.lines?.nodes ?? [];
  const cartHasItems = cart?.totalQuantity ? cart.totalQuantity > 0 : false;
  const childrenMap = getLineItemChildrenMap(lines);

  return (
    <section
      className="cart-main"
      aria-label={layout === 'page' ? 'Carrito' : 'Carrito lateral'}
    >
      <div className="cart-lines">
        {!lines.length && <CartEmpty layout={layout} />}
        <p id="cart-lines" className="sr-only">
          Productos en el carrito
        </p>
        <ul aria-labelledby="cart-lines">
          {lines.map((line) => {
            // we do not render non-parent lines at the root of the cart
            if ('parentRelationship' in line && line.parentRelationship?.parent) {
              return null;
            }
            return (
              <CartLineItem
                key={line.id}
                line={line}
                layout={layout}
                childrenMap={childrenMap}
              />
            );
          })}
        </ul>
      </div>
      {cartHasItems && <CartSummary cart={cart} layout={layout} />}
    </section>
  );
}

/**
 * @param {{layout?: CartMainProps['layout']}}
 */
function CartEmpty({layout}) {
  const {close} = useAside();
  return (
    <div className="cart-empty">
      <h3>Tu carrito está vacío.</h3>
      <Link
        className="btn btn-primary"
        onClick={layout === 'aside' ? close : undefined}
        prefetch="viewport"
        to="/collections/all"
      >
        Seguir comprando
      </Link>
    </div>
  );
}

/** @typedef {'page' | 'aside'} CartLayout */
/**
 * @typedef {{
 *   cart: CartApiQueryFragment | null;
 *   layout: CartLayout;
 * }} CartMainProps
 */
/** @typedef {{[parentId: string]: CartLine[]}} LineItemChildrenMap */

/** @typedef {import('storefrontapi.generated').CartApiQueryFragment} CartApiQueryFragment */
/** @typedef {import('~/components/CartLineItem').CartLine} CartLine */
