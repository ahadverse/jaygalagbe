import {
  argbFromHex,
  hexFromArgb,
  themeFromSourceColor,
  type Scheme,
} from '@material/material-color-utilities';
import { MD3DarkTheme, MD3LightTheme, type MD3Theme } from 'react-native-paper';

// Seed colors pulled from web/src/app/globals.css's OKLCH brand tokens
// (--color-brand-500, --color-accent-500), converted to sRGB hex. The two
// apps intentionally don't share a component system (this one is native
// MD3, not a port of web's Tailwind system), but using the same seed hues
// keeps them reading as one brand.
const BRAND_SEED_HEX = '#ed5f0b'; // burnt-orange, brand-500
const ACCENT_SEED_HEX = '#da354e'; // crimson, accent-500

const brandTheme = themeFromSourceColor(argbFromHex(BRAND_SEED_HEX));
// On web, crimson is "reserved almost exclusively" for special emphasis.
// MD3's tertiary role (a contrasting accent) is the closest semantic match,
// so it borrows the accent seed's own primary family rather than the brand
// seed's algorithmically hue-shifted tertiary.
const accentTheme = themeFromSourceColor(argbFromHex(ACCENT_SEED_HEX));

function buildColors(mode: 'light' | 'dark') {
  const brand: Scheme =
    mode === 'light' ? brandTheme.schemes.light : brandTheme.schemes.dark;
  const accent: Scheme =
    mode === 'light' ? accentTheme.schemes.light : accentTheme.schemes.dark;
  const hex = (argb: number) => hexFromArgb(argb);

  return {
    primary: hex(brand.primary),
    onPrimary: hex(brand.onPrimary),
    primaryContainer: hex(brand.primaryContainer),
    onPrimaryContainer: hex(brand.onPrimaryContainer),
    secondary: hex(brand.secondary),
    onSecondary: hex(brand.onSecondary),
    secondaryContainer: hex(brand.secondaryContainer),
    onSecondaryContainer: hex(brand.onSecondaryContainer),
    tertiary: hex(accent.primary),
    onTertiary: hex(accent.onPrimary),
    tertiaryContainer: hex(accent.primaryContainer),
    onTertiaryContainer: hex(accent.onPrimaryContainer),
    error: hex(brand.error),
    onError: hex(brand.onError),
    errorContainer: hex(brand.errorContainer),
    onErrorContainer: hex(brand.onErrorContainer),
    background: hex(brand.background),
    onBackground: hex(brand.onBackground),
    surface: hex(brand.surface),
    onSurface: hex(brand.onSurface),
    surfaceVariant: hex(brand.surfaceVariant),
    onSurfaceVariant: hex(brand.onSurfaceVariant),
    outline: hex(brand.outline),
    outlineVariant: hex(brand.outlineVariant),
    shadow: hex(brand.shadow),
    scrim: hex(brand.scrim),
    inverseSurface: hex(brand.inverseSurface),
    inverseOnSurface: hex(brand.inverseOnSurface),
    inversePrimary: hex(brand.inversePrimary),
  };
}

export const jaygalagbeLightTheme: MD3Theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    ...buildColors('light'),
  },
};

export const jaygalagbeDarkTheme: MD3Theme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    ...buildColors('dark'),
  },
};
