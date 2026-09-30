import {CartForm} from '@shopify/hydrogen';
import {Icon} from '~/components/Icon';
import {formatMoney} from '~/lib/format';
import {useEffect, useId, useRef, useState} from 'react';
import {useFetcher} from 'react-router';

/**
 * @param {CartSummaryProps}
 */
export function CartSummary({cart, layout}) {
  const summaryId = useId();
  const discountsHeadingId = useId();
  const discountCodeInputId = useId();
  const giftCardHeadingId = useId();
  const giftCardInputId = useId();
  const subtotal = cart?.cost?.subtotalAmount;

  return (
    <div aria-labelledby={summaryId} className="cart-summary">
      <h4 id={summaryId} className="sr-only">
        Resumen
      </h4>
      <dl role="group" className="cart-subtotal">
        <dt>Subtotal</dt>
        <dd>
          {subtotal?.amount ? formatMoney(subtotal) : '-'}{' '}
          {subtotal?.currencyCode && <small>{subtotal.currencyCode}</small>}
        </dd>
      </dl>
      <span className="cart-note">
        Impuesto incluido. El envío se calcula al pagar.
      </span>
      {layout === 'page' && (
        <div className="cart-codes">
          <CartDiscounts
            discountCodes={cart?.discountCodes}
            discountsHeadingId={discountsHeadingId}
            discountCodeInputId={discountCodeInputId}
          />
          <CartGiftCard
            giftCardCodes={cart?.appliedGiftCards}
            giftCardHeadingId={giftCardHeadingId}
            giftCardInputId={giftCardInputId}
          />
        </div>
      )}
      <CartCheckoutActions checkoutUrl={cart?.checkoutUrl} />
    </div>
  );
}

/**
 * @param {{checkoutUrl?: string}}
 */
function CartCheckoutActions({checkoutUrl}) {
  if (!checkoutUrl) return null;

  return (
    <a className="btn btn-primary cart-checkout" href={checkoutUrl} target="_self">
      Pagar pedido <Icon name="arrow" size={18} strokeWidth={2.2} />
    </a>
  );
}

/**
 * @param {{
 *   discountCodes?: CartApiQueryFragment['discountCodes'];
 *   discountsHeadingId: string;
 *   discountCodeInputId: string;
 * }}
 */
function CartDiscounts({
  discountCodes,
  discountsHeadingId,
  discountCodeInputId,
}) {
  const codes =
    discountCodes
      ?.filter((discount) => discount.applicable)
      ?.map(({code}) => code) || [];

  return (
    <section aria-label="Descuentos">
      {/* Have existing discount, display it with a remove option */}
      <dl hidden={!codes.length}>
        <div>
          <dt id={discountsHeadingId}>Descuentos</dt>
          <UpdateDiscountForm>
            <div
              className="cart-code-applied"
              role="group"
              aria-labelledby={discountsHeadingId}
            >
              <code>{codes?.join(', ')}</code>
              &nbsp;
              <button
                type="submit"
                className="cart-line-remove"
                aria-label="Quitar descuento"
              >
                Quitar
              </button>
            </div>
          </UpdateDiscountForm>
        </div>
      </dl>

      {/* Show an input to apply a discount */}
      <UpdateDiscountForm discountCodes={codes}>
        <div className="cart-code-row">
          <label htmlFor={discountCodeInputId} className="sr-only">
            Código de descuento
          </label>
          <input
            className="input"
            id={discountCodeInputId}
            type="text"
            name="discountCode"
            placeholder="Código de descuento"
          />
          <button
            type="submit"
            className="btn btn-secondary"
            aria-label="Aplicar código de descuento"
          >
            Aplicar
          </button>
        </div>
      </UpdateDiscountForm>
    </section>
  );
}

/**
 * @param {{
 *   discountCodes?: string[];
 *   children: React.ReactNode;
 * }}
 */
function UpdateDiscountForm({discountCodes, children}) {
  return (
    <CartForm
      route="/cart"
      action={CartForm.ACTIONS.DiscountCodesUpdate}
      inputs={{
        discountCodes: discountCodes || [],
      }}
    >
      {children}
    </CartForm>
  );
}

/**
 * @param {{
 *   giftCardCodes: CartApiQueryFragment['appliedGiftCards'] | undefined;
 *   giftCardHeadingId: string;
 *   giftCardInputId: string;
 * }}
 */
function CartGiftCard({giftCardCodes, giftCardHeadingId, giftCardInputId}) {
  const giftCardCodeInput = useRef(null);
  const removeButtonRefs = useRef(new Map());
  const previousCardIdsRef = useRef([]);
  const giftCardAddFetcher = useFetcher({key: 'gift-card-add'});
  const [removedCardIndex, setRemovedCardIndex] = useState(null);

  useEffect(() => {
    if (giftCardAddFetcher.data) {
      if (giftCardCodeInput.current !== null) {
        giftCardCodeInput.current.value = '';
      }
    }
  }, [giftCardAddFetcher.data]);

  useEffect(() => {
    const currentCardIds = giftCardCodes?.map((card) => card.id) || [];

    if (removedCardIndex !== null && giftCardCodes) {
      const focusTargetIndex = Math.min(
        removedCardIndex,
        giftCardCodes.length - 1,
      );
      const focusTargetCard = giftCardCodes[focusTargetIndex];
      const focusButton = focusTargetCard
        ? removeButtonRefs.current.get(focusTargetCard.id)
        : null;

      if (focusButton) {
        focusButton.focus();
      } else if (giftCardCodeInput.current) {
        giftCardCodeInput.current.focus();
      }

      setRemovedCardIndex(null);
    }

    previousCardIdsRef.current = currentCardIds;
  }, [giftCardCodes, removedCardIndex]);

  const handleRemoveClick = (cardId) => {
    const index = previousCardIdsRef.current.indexOf(cardId);
    if (index !== -1) {
      setRemovedCardIndex(index);
    }
  };

  return (
    <section aria-label="Tarjetas de regalo">
      {giftCardCodes && giftCardCodes.length > 0 && (
        <dl>
          <dt id={giftCardHeadingId}>Tarjetas de regalo aplicadas</dt>
          {giftCardCodes.map((giftCard) => (
            <dd key={giftCard.id} className="cart-code-applied">
              <RemoveGiftCardForm
                giftCardId={giftCard.id}
                lastCharacters={giftCard.lastCharacters}
                onRemoveClick={() => handleRemoveClick(giftCard.id)}
                buttonRef={(el) => {
                  if (el) {
                    removeButtonRefs.current.set(giftCard.id, el);
                  } else {
                    removeButtonRefs.current.delete(giftCard.id);
                  }
                }}
              >
                <code>***{giftCard.lastCharacters}</code>
                &nbsp;
                {formatMoney(giftCard.amountUsed)}
              </RemoveGiftCardForm>
            </dd>
          ))}
        </dl>
      )}

      <AddGiftCardForm fetcherKey="gift-card-add">
        <div className="cart-code-row">
          <label htmlFor={giftCardInputId} className="sr-only">
            Código de tarjeta de regalo
          </label>
          <input
            className="input"
            id={giftCardInputId}
            type="text"
            name="giftCardCode"
            placeholder="Tarjeta de regalo"
            ref={giftCardCodeInput}
          />
          <button
            type="submit"
            className="btn btn-secondary"
            disabled={giftCardAddFetcher.state !== 'idle'}
            aria-label="Aplicar tarjeta de regalo"
          >
            Aplicar
          </button>
        </div>
      </AddGiftCardForm>
    </section>
  );
}

/**
 * @param {{
 *   fetcherKey?: string;
 *   children: React.ReactNode;
 * }}
 */
function AddGiftCardForm({fetcherKey, children}) {
  return (
    <CartForm
      fetcherKey={fetcherKey}
      route="/cart"
      action={CartForm.ACTIONS.GiftCardCodesAdd}
    >
      {children}
    </CartForm>
  );
}

/**
 * @param {{
 *   giftCardId: string;
 *   lastCharacters: string;
 *   children: React.ReactNode;
 *   onRemoveClick?: () => void;
 *   buttonRef?: (el: HTMLButtonElement | null) => void;
 * }}
 */
function RemoveGiftCardForm({
  giftCardId,
  lastCharacters,
  children,
  onRemoveClick,
  buttonRef,
}) {
  return (
    <CartForm
      route="/cart"
      action={CartForm.ACTIONS.GiftCardCodesRemove}
      inputs={{
        giftCardCodes: [giftCardId],
      }}
    >
      {children}
      &nbsp;
      <button
        type="submit"
        className="cart-line-remove"
        aria-label={`Quitar tarjeta terminada en ${lastCharacters}`}
        onClick={onRemoveClick}
        ref={buttonRef}
      >
        Quitar
      </button>
    </CartForm>
  );
}

/**
 * @typedef {{
 *   cart: OptimisticCart<CartApiQueryFragment | null>;
 *   layout: CartLayout;
 * }} CartSummaryProps
 */

/** @typedef {import('storefrontapi.generated').CartApiQueryFragment} CartApiQueryFragment */
/** @typedef {import('~/components/CartMain').CartLayout} CartLayout */
/** @typedef {import('@shopify/hydrogen').OptimisticCart} OptimisticCart */
