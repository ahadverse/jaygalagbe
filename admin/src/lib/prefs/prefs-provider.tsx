import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import {
  PrefsContext,
  type Density,
  type ThemeMode,
} from './prefs-context';

const THEME_KEY = 'jl_admin_theme';
const DENSITY_KEY = 'jl_admin_density';

function read<T extends string>(key: string, allowed: readonly T[], fallback: T): T {
  try {
    const stored = localStorage.getItem(key);
    return allowed.includes(stored as T) ? (stored as T) : fallback;
  } catch {
    return fallback;
  }
}

function write(key: string, value: string) {
  try {
    localStorage.setItem(key, value);
  } catch {
    // A locked-down profile just means the preference lasts one session.
  }
}

const DARK_QUERY = '(prefers-color-scheme: dark)';

function systemPrefersDark(): boolean {
  return typeof window !== 'undefined' && window.matchMedia(DARK_QUERY).matches;
}

/**
 * Theme and row density, persisted per browser.
 *
 * Both are written onto `<html>` as data attributes rather than threaded
 * through components: the tokens in `index.css` key off them, so one
 * attribute flip restyles the whole console including anything rendered into
 * a portal.
 */
export function PrefsProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemeMode>(() =>
    read(THEME_KEY, ['light', 'dark', 'system'] as const, 'light'),
  );
  const [density, setDensityState] = useState<Density>(() =>
    read(DENSITY_KEY, ['comfortable', 'compact'] as const, 'comfortable'),
  );
  const [systemDark, setSystemDark] = useState(systemPrefersDark);

  // Only matters while the mode is `system`, but the listener is cheap and
  // unconditional subscription keeps the hook order stable.
  useEffect(() => {
    const media = window.matchMedia(DARK_QUERY);
    const onChange = (event: MediaQueryListEvent) => setSystemDark(event.matches);
    media.addEventListener('change', onChange);
    return () => media.removeEventListener('change', onChange);
  }, []);

  const resolvedTheme: 'light' | 'dark' =
    theme === 'system' ? (systemDark ? 'dark' : 'light') : theme;

  useEffect(() => {
    const root = document.documentElement;

    // Suppress transitions for the frame in which everything repaints.
    root.classList.add('theme-switching');
    root.dataset.theme = resolvedTheme;
    const timer = window.setTimeout(
      () => root.classList.remove('theme-switching'),
      0,
    );

    return () => window.clearTimeout(timer);
  }, [resolvedTheme]);

  useEffect(() => {
    document.documentElement.dataset.density = density;
  }, [density]);

  const setTheme = useCallback((next: ThemeMode) => {
    setThemeState(next);
    write(THEME_KEY, next);
  }, []);

  const setDensity = useCallback((next: Density) => {
    setDensityState(next);
    write(DENSITY_KEY, next);
  }, []);

  const value = useMemo(
    () => ({ theme, setTheme, resolvedTheme, density, setDensity }),
    [theme, setTheme, resolvedTheme, density, setDensity],
  );

  return (
    <PrefsContext.Provider value={value}>{children}</PrefsContext.Provider>
  );
}
