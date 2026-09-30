/**
 * Line icons from the Superbox design, drawn on a 24×24 grid with square caps.
 * Paths marked `ink` use the current text color; the rest use the accent.
 */
const ICONS = {
  truck: {
    accent: true,
    body: (
      <>
        <path d="M3 6h11v10H3zM14 10h4l3 3v3h-7" />
        <circle cx="7" cy="18" r="1.6" />
        <circle cx="17" cy="18" r="1.6" />
      </>
    ),
  },
  headset: {
    accent: true,
    body: (
      <>
        <path d="M4 14v-2a8 8 0 0 1 16 0v2" />
        <path d="M3 14h4v6H3zM17 14h4v6h-4z" />
      </>
    ),
  },
  shield: {
    accent: true,
    body: (
      <>
        <path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z" />
        <path d="M8.5 12l2.5 2.5 4.5-4.5" />
      </>
    ),
  },
  chat: {
    accent: true,
    body: (
      <>
        <path d="M4 5h16v11H9l-5 4z" />
        <path d="M8 10h8" />
      </>
    ),
  },
  scanner: {
    accent: true,
    body: (
      <>
        <path d="M3 7V4h3M18 4h3v3M21 17v3h-3M6 20H3v-3" />
        <path d="M7 8v8M10 8v8M12.5 8v8M15 8v8M17 8v8" stroke="currentColor" />
      </>
    ),
  },
  pos: {
    accent: true,
    body: (
      <>
        <path d="M6 3h12v18H6z" />
        <path d="M8.5 5.5h7v5h-7z" stroke="currentColor" />
        <path
          d="M9 14h1M14 14h1M9 17h1M14 17h1"
          stroke="currentColor"
          strokeWidth="2"
        />
      </>
    ),
  },
  fingerprint: {
    accent: true,
    round: true,
    body: (
      <>
        <path d="M5 15c.6-1 .9-2 .9-3a6.1 6.1 0 0 1 12.2 0c0 2.2-.3 4.3-1 6.3" />
        <path
          d="M9 19c.8-1.4 1-3 1-4.5V12a2 2 0 0 1 4 0v1.5c0 2-.3 3.8-1 5.5"
          stroke="currentColor"
        />
        <path d="M8 5.5A8 8 0 0 1 19.5 8" stroke="currentColor" />
      </>
    ),
  },
  printer: {
    accent: true,
    body: (
      <>
        <path d="M6 9V3h12v6M6 17H3V9h18v8h-3" />
        <path d="M6 14h12v7H6z" stroke="currentColor" />
      </>
    ),
  },
  plug: {
    accent: true,
    body: (
      <>
        <path d="M9 2v5M15 2v5" stroke="currentColor" />
        <path d="M6 7h12v4a6 6 0 0 1-12 0z" />
        <path d="M12 17v5" stroke="currentColor" />
      </>
    ),
  },
  box: {
    accent: true,
    body: (
      <>
        <path d="M4 8l8-4 8 4v9l-8 4-8-4z" />
        <path d="M4 8l8 4 8-4M12 12v9" stroke="currentColor" />
      </>
    ),
  },
  user: {
    body: (
      <>
        <circle cx="12" cy="8" r="4" />
        <path d="M4 21v-1a6 6 0 0 1 6-6h4a6 6 0 0 1 6 6v1" />
      </>
    ),
  },
  bag: {
    body: (
      <>
        <path d="M5 8h14l-1 13H6z" />
        <path d="M9 8V6a3 3 0 0 1 6 0v2" />
      </>
    ),
  },
  search: {body: <path d="M15.5 15.5L21 21M17 10.5a6.5 6.5 0 1 1-13 0 6.5 6.5 0 0 1 13 0z" />},
  sun: {
    body: (
      <>
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
      </>
    ),
  },
  moon: {body: <path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z" />},
  close: {body: <path d="M6 6l12 12M18 6L6 18" />},
  plus: {body: <path d="M12 5v14M5 12h14" />},
  minus: {body: <path d="M5 12h14" />},
  arrow: {body: <path d="M4 12h15M13 6l6 6-6 6" />},
};

/**
 * @param {{
 *   name: keyof typeof ICONS;
 *   size?: number;
 *   strokeWidth?: number;
 *   className?: string;
 *   style?: React.CSSProperties;
 * }}
 */
export function Icon({name, size = 20, strokeWidth = 1.9, className, style}) {
  const icon = ICONS[name];
  if (!icon) return null;
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      height={size}
      stroke={icon.accent ? 'var(--color-accent)' : 'currentColor'}
      strokeLinecap={icon.round ? 'round' : 'square'}
      strokeWidth={strokeWidth}
      style={style}
      viewBox="0 0 24 24"
      width={size}
    >
      {icon.body}
    </svg>
  );
}

/**
 * Picks a category icon from a collection's handle or title.
 * @param {string} key
 */
export function categoryIcon(key) {
  const k = key
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '');
  if (/lector|scanner|escaner|capturador|codigo/.test(k)) return 'scanner';
  if (/pos|terminal|caja/.test(k)) return 'pos';
  if (/biometr|huella|reloj/.test(k)) return 'fingerprint';
  if (/impres|printer|etiquet/.test(k)) return 'printer';
  if (/perif|accesor|cable|base|cuna/.test(k)) return 'plug';
  return 'box';
}

export function Logo({size = 30}) {
  return (
    <svg aria-hidden="true" height={size} viewBox="0 0 30 30" width={size}>
      <rect fill="var(--color-accent)" height="30" width="30" />
      <path
        d="M7 11l8-4 8 4v9l-8 4-8-4z"
        fill="none"
        stroke="#1b1411"
        strokeLinejoin="miter"
        strokeWidth="2.2"
      />
      <path
        d="M7 11l8 4 8-4M15 15v9"
        fill="none"
        stroke="#1b1411"
        strokeWidth="2.2"
      />
    </svg>
  );
}
