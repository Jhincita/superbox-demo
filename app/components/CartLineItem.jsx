import {CartForm, Image} from '@shopify/hydrogen';
import {useVariantUrl} from '~/lib/variants';
import {Link} from 'react-router';
import {Icon} from './Icon';
import {formatMoney} from '~/lib/format';
import {DESIGN} from '~/lib/storeConfig';
import {useAside} from './Aside';

/**
 * A single line item in the cart. It displays the product image, title, price.
 * It also provides controls to update the quantity or remove the line item.
 * If the line is a parent line that has child components (like warranties or gift wrapping), they are
 * rendered nested below the parent line.
 * @param {{
 *   layout: CartLayout;
 *   line: CartLine;
 *   childrenMap: LineItemChildrenMap;
 * }}
 */
export function CartLineItem({layout, line, childrenMap}) {
  const {id, merchandise} = line;
  const {product, title, image, selectedOptions} = merchandise;
  const lineItemUrl = useVariantUrl(product.handle, selectedOptions);
  const {close} = useAside();
  const lineItemChildren = childrenMap[id];
  const childrenLabelId = `cart-line-children-${id}`;
  const options = selectedOptions.filter(
    (option) => option.value !== 'Default Title',
  );

  return (
    <li key={id} className="cart-line">
      <div className="cart-line-thumb">
        {image && (
          <Image
            alt={title}
            className={DESIGN.grayscalePhotos ? 'grayscale' : undefined}
            data={image}
            height={120}
            loading="lazy"
            width={120}
          />
        )}
      </div>
      <div className="cart-line-info">
        <Link
          className="cart-line-title"
          prefetch="intent"
          to={lineItemUrl}
          onClick={() => {
            if (layout === 'aside') close();
          }}
        >
          {product.title}
        </Link>
        {options.length > 0 && (
          <span className="cart-line-options">
            {options.map((o) => `${o.name}: ${o.value}`).join(' · ')}
          </span>
        )}
        <div className="cart-line-row">
          <CartLineQuantity line={line} />
          <strong>{formatMoney(line?.cost?.totalAmount)}</strong>
        </div>
        <CartLineRemoveButton lineIds={[id]} disabled={!!line.isOptimistic} />
      </div>

      {lineItemChildren ? (
        <div className="cart-line-children">
          <p id={childrenLabelId} className="sr-only">
            Productos incluidos con {product.title}
          </p>
          <ul aria-labelledby={childrenLabelId}>
            {lineItemChildren.map((childLine) => (
              <CartLineItem
                childrenMap={childrenMap}
                key={childLine.id}
                line={childLine}
                layout={layout}
              />
            ))}
          </ul>
        </div>
      ) : null}
    </li>
  );
}

/**
 * Provides the controls to update the quantity of a line item in the cart.
 * These controls are disabled when the line item is new, and the server
 * hasn't yet responded that it was successfully added to the cart.
 * @param {{line: CartLine}}
 */
function CartLineQuantity({line}) {
  if (!line || typeof line?.quantity === 'undefined') return null;
  const {id: lineId, quantity, isOptimistic} = line;
  const prevQuantity = Number(Math.max(0, quantity - 1).toFixed(0));
  const nextQuantity = Number((quantity + 1).toFixed(0));

  return (
    <div className="stepper sm">
      <CartLineUpdateButton lines={[{id: lineId, quantity: prevQuantity}]}>
        <button
          aria-label="Menos"
          disabled={quantity <= 1 || !!isOptimistic}
          name="decrease-quantity"
          value={prevQuantity}
        >
          <Icon name="minus" size={14} strokeWidth={2.2} />
        </button>
      </CartLineUpdateButton>
      <span aria-label="Cantidad">{quantity}</span>
      <CartLineUpdateButton lines={[{id: lineId, quantity: nextQuantity}]}>
        <button
          aria-label="Más"
          name="increase-quantity"
          value={nextQuantity}
          disabled={!!isOptimistic}
        >
          <Icon name="plus" size={14} strokeWidth={2.2} />
        </button>
      </CartLineUpdateButton>
    </div>
  );
}

/**
 * A button that removes a line item from the cart. It is disabled
 * when the line item is new, and the server hasn't yet responded
 * that it was successfully added to the cart.
 * @param {{
 *   lineIds: string[];
 *   disabled: boolean;
 * }}
 */
function CartLineRemoveButton({lineIds, disabled}) {
  return (
    <CartForm
      fetcherKey={getUpdateKey(lineIds)}
      route="/cart"
      action={CartForm.ACTIONS.LinesRemove}
      inputs={{lineIds}}
    >
      <button className="cart-line-remove" disabled={disabled} type="submit">
        Quitar
      </button>
    </CartForm>
  );
}

/**
 * @param {{
 *   children: React.ReactNode;
 *   lines: CartLineUpdateInput[];
 * }}
 */
function CartLineUpdateButton({children, lines}) {
  const lineIds = lines.map((line) => line.id);

  return (
    <CartForm
      fetcherKey={getUpdateKey(lineIds)}
      route="/cart"
      action={CartForm.ACTIONS.LinesUpdate}
      inputs={{lines}}
    >
      {children}
    </CartForm>
  );
}

/**
 * Returns a unique key for the update action. This is used to make sure actions modifying the same line
 * items are not run concurrently, but cancel each other. For example, if the user clicks "Increase quantity"
 * and "Decrease quantity" in rapid succession, the actions will cancel each other and only the last one will run.
 * @returns
 * @param {string[]} lineIds - line ids affected by the update
 */
function getUpdateKey(lineIds) {
  return [CartForm.ACTIONS.LinesUpdate, ...lineIds].join('-');
}

/** @typedef {OptimisticCartLine<CartApiQueryFragment>} CartLine */

/** @typedef {import('@shopify/hydrogen/storefront-api-types').CartLineUpdateInput} CartLineUpdateInput */
/** @typedef {import('~/components/CartMain').CartLayout} CartLayout */
/** @typedef {import('~/components/CartMain').LineItemChildrenMap} LineItemChildrenMap */
/** @typedef {import('@shopify/hydrogen').OptimisticCartLine} OptimisticCartLine */
/** @typedef {import('storefrontapi.generated').CartApiQueryFragment} CartApiQueryFragment */
/** @typedef {import('storefrontapi.generated').CartLineFragment} CartLineFragment */
