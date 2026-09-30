import {createContext, useContext, useEffect, useState} from 'react';
import {useId} from 'react';
import {Icon} from '~/components/Icon';

/**
 * A side bar component with Overlay
 * @example
 * ```jsx
 * <Aside type="search" heading="SEARCH">
 *  <input type="search" />
 *  ...
 * </Aside>
 * ```
 * @param {{
 *   children?: React.ReactNode;
 *   type: AsideType;
 *   heading: React.ReactNode;
 * }}
 */
export function Aside({children, heading, type}) {
  const {type: activeType, close} = useAside();
  const expanded = type === activeType;
  const id = useId();
  useEffect(() => {
    const abortController = new AbortController();

    if (expanded) {
      document.addEventListener(
        'keydown',
        function handler(event) {
          if (event.key === 'Escape') {
            close();
          }
        },
        {signal: abortController.signal},
      );
    }
    return () => abortController.abort();
  }, [close, expanded]);

  return (
    <div
      aria-hidden={!expanded}
      className={`overlay ${expanded ? 'expanded' : ''}`}
      inert={!expanded ? '' : undefined}
    >
      <button
        aria-label="Cerrar"
        className="close-outside"
        onClick={close}
        tabIndex={-1}
        type="button"
      />
      <aside aria-labelledby={id} aria-modal role="dialog">
        <div className="aside-head">
          <h4 id={id}>{heading}</h4>
          <button
            aria-label="Cerrar"
            className="icon-btn sm"
            onClick={close}
            type="button"
          >
            <Icon name="close" size={20} strokeWidth={2} />
          </button>
        </div>
        <div className="aside-body">{children}</div>
      </aside>
    </div>
  );
}

const AsideContext = createContext(null);

Aside.Provider = function AsideProvider({children}) {
  const [type, setType] = useState('closed');

  return (
    <AsideContext.Provider
      value={{
        type,
        open: setType,
        close: () => setType('closed'),
      }}
    >
      {children}
    </AsideContext.Provider>
  );
};

export function useAside() {
  const aside = useContext(AsideContext);
  if (!aside) {
    throw new Error('useAside must be used within an AsideProvider');
  }
  return aside;
}

/** @typedef {'cart' | 'closed'} AsideType */
/**
 * @typedef {{
 *   type: AsideType;
 *   open: (mode: AsideType) => void;
 *   close: () => void;
 * }} AsideContextValue
 */

/** @typedef {import('react').ReactNode} ReactNode */
