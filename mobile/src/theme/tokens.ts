import type { ViewStyle } from 'react-native';

// Hand-mapped from web/src/app/globals.css's OKLCH ramps (converted through
// OKLab -> linear-sRGB -> sRGB). brand-500 (#ed5f0b) and accent-500
// (#da354e) match the seed hexes already hardcoded in app.json's splash/icon
// config, confirming the rest of the ramp below is trustworthy. Unlike the
// old md3-theme.ts, these are literally web's swatches, not an algorithmic
// approximation of them - so the two apps share actual colors, not just seed
// hues.
export const colors = {
  brand: {
    50: '#fff5eb',
    100: '#ffe7d1',
    200: '#ffcda7',
    300: '#ffa970',
    400: '#fc833f',
    500: '#ed5f0b',
    600: '#cf4502',
    700: '#aa320a',
    800: '#7f2210',
    900: '#5b180f',
    950: '#2f0705',
  },
  accent: {
    50: '#fff1ed',
    100: '#ffdcd5',
    200: '#ffb9b3',
    300: '#ff898a',
    400: '#fb5a68',
    500: '#da354e',
    600: '#b20d3a',
    700: '#8e002e',
    800: '#6c0125',
    900: '#4e031c',
    950: '#25030a',
  },
  neutral: {
    50: '#fdfbf8',
    100: '#f5f3ef',
    150: '#efece7',
    200: '#e9e4e0',
    300: '#d4cec8',
    400: '#a59f98',
    500: '#7d766f',
    600: '#5d5751',
    700: '#433d39',
    800: '#292421',
    900: '#16120f',
    950: '#070504',
  },
  success: {
    50: '#ecfbf2',
    100: '#d2f5e1',
    500: '#008c58',
    600: '#007244',
    700: '#005932',
    800: '#004325',
  },
  warning: {
    50: '#fff6e1',
    100: '#fceabe',
    500: '#dca400',
    600: '#ba7500',
    700: '#8c4b00',
    800: '#6a3500',
  },
  danger: {
    50: '#fff0ee',
    100: '#ffdcd7',
    500: '#d73431',
    600: '#b71824',
    700: '#97061e',
    800: '#720117',
  },
  info: {
    50: '#edf7fe',
    100: '#d4ecfd',
    500: '#1a83db',
    600: '#0062bd',
    700: '#004da2',
    800: '#00377a',
  },
  // Semantic surfaces, mirrors web's :root block.
  surface: '#fbf9f5', // warm paper canvas
  surfaceCard: '#ffffff',
  border: '#e5e0db',
} as const;

export const radius = {
  xs: 6,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 22,
  '2xl': 28,
  '3xl': 36,
  full: 999,
} as const;

// RN can't render web's multi-layer CSS box-shadows, so each level is
// approximated with one shadowColor (warm-tinted, never plain black) +
// elevation for Android's Material shadow renderer.
type ShadowLevel = 'sm' | 'md' | 'lg' | 'brand' | 'accent';

const SHADOW_SPECS: Record<ShadowLevel, ViewStyle> = {
  sm: {
    shadowColor: colors.neutral[900],
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  md: {
    shadowColor: colors.neutral[900],
    shadowOpacity: 0.12,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  lg: {
    shadowColor: colors.neutral[900],
    shadowOpacity: 0.16,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 12 },
    elevation: 8,
  },
  brand: {
    shadowColor: colors.brand[700],
    shadowOpacity: 0.35,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
  accent: {
    shadowColor: colors.accent[600],
    shadowOpacity: 0.38,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
};

export function shadow(level: ShadowLevel): ViewStyle {
  return SHADOW_SPECS[level];
}

// Loaded in App.tsx via @expo-google-fonts/bricolage-grotesque and
// @expo-google-fonts/inter - matches web's --font-display/--font-text pair.
export const fontFamily = {
  display: 'BricolageGrotesque_700Bold',
  displaySemibold: 'BricolageGrotesque_600SemiBold',
  text: 'Inter_400Regular',
  textMedium: 'Inter_500Medium',
  textSemibold: 'Inter_600SemiBold',
} as const;
