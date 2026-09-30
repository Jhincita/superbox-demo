import {useEffect, useState} from 'react';
import {Icon} from '~/components/Icon';

export const THEME_STORAGE_KEY = 'sbx-theme';

/**
 * Light/dark switch from the design. The initial theme is applied to
 * <html data-theme> by an inline script in root.jsx before first paint;
 * this component only syncs with it and persists the choice.
 */
export function ThemeToggle() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    setIsDark(document.documentElement.dataset.theme === 'dark');
  }, []);

  function toggle() {
    const next = isDark ? 'light' : 'dark';
    document.documentElement.dataset.theme = next;
    try {
      localStorage.setItem(THEME_STORAGE_KEY, next);
    } catch {
      // Storage can be unavailable (private mode); the toggle still works.
    }
    setIsDark(!isDark);
  }

  return (
    <button
      aria-checked={isDark}
      aria-label="Modo oscuro"
      className="theme-toggle"
      onClick={toggle}
      role="switch"
      type="button"
    >
      <Icon className="sun" name="sun" size={18} />
      <span className="theme-toggle-track">
        <span className="theme-toggle-knob" />
      </span>
      <Icon className="moon" name="moon" size={17} />
    </button>
  );
}
