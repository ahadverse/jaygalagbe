import { createContext, useContext } from 'react';

export type ThemeMode = 'light' | 'dark' | 'system';
export type Density = 'comfortable' | 'compact';

export interface Prefs {
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  /** What `system` actually resolved to — for the toggle's icon. */
  resolvedTheme: 'light' | 'dark';
  density: Density;
  setDensity: (density: Density) => void;
}

export const PrefsContext = createContext<Prefs | null>(null);

export function usePrefs(): Prefs {
  const context = useContext(PrefsContext);
  if (!context) {
    throw new Error('usePrefs must be used within a PrefsProvider');
  }
  return context;
}
