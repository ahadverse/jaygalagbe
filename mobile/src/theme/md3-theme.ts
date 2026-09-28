import {
  configureFonts,
  MD3LightTheme,
  type MD3Theme,
} from 'react-native-paper';

import { colors, fontFamily } from './tokens';

// Web has no dark mode ("intentionally light/off-white only", see
// web/src/app/globals.css) and app.json's userInterfaceStyle is "light", so
// there's exactly one theme here - no light/dark pair to pick between.
const fontConfig = {
  displayLarge: {
    fontFamily: fontFamily.display,
    fontWeight: '700' as const,
    letterSpacing: -0.25,
  },
  displayMedium: {
    fontFamily: fontFamily.display,
    fontWeight: '700' as const,
    letterSpacing: -0.25,
  },
  displaySmall: {
    fontFamily: fontFamily.display,
    fontWeight: '700' as const,
    letterSpacing: -0.2,
  },
  headlineLarge: {
    fontFamily: fontFamily.display,
    fontWeight: '700' as const,
    letterSpacing: -0.2,
  },
  headlineMedium: {
    fontFamily: fontFamily.display,
    fontWeight: '700' as const,
    letterSpacing: -0.15,
  },
  headlineSmall: {
    fontFamily: fontFamily.display,
    fontWeight: '700' as const,
    letterSpacing: -0.1,
  },
  titleLarge: {
    fontFamily: fontFamily.displaySemibold,
    fontWeight: '600' as const,
    letterSpacing: -0.1,
  },
  titleMedium: {
    fontFamily: fontFamily.displaySemibold,
    fontWeight: '600' as const,
  },
  titleSmall: {
    fontFamily: fontFamily.displaySemibold,
    fontWeight: '600' as const,
  },
  bodyLarge: { fontFamily: fontFamily.text, fontWeight: '400' as const },
  bodyMedium: { fontFamily: fontFamily.text, fontWeight: '400' as const },
  bodySmall: { fontFamily: fontFamily.text, fontWeight: '400' as const },
  labelLarge: { fontFamily: fontFamily.textMedium, fontWeight: '500' as const },
  labelMedium: {
    fontFamily: fontFamily.textMedium,
    fontWeight: '500' as const,
  },
  labelSmall: { fontFamily: fontFamily.textMedium, fontWeight: '500' as const },
};

export const jaygalagbeTheme: MD3Theme = {
  ...MD3LightTheme,
  // Paper multiplies roundness by 1/2/3/4 depending on component; 3 lands
  // default cards/buttons around 12px, matching web's rounded-xl baseline.
  roundness: 3,
  fonts: configureFonts({ config: fontConfig }),
  colors: {
    ...MD3LightTheme.colors,
    primary: colors.brand[700],
    onPrimary: '#ffffff',
    primaryContainer: colors.brand[100],
    onPrimaryContainer: colors.brand[800],
    secondary: colors.brand[500],
    onSecondary: '#ffffff',
    secondaryContainer: colors.brand[50],
    onSecondaryContainer: colors.brand[800],
    // Web reserves crimson accent almost exclusively for "boosted"/paid
    // surfaces and things that need attention - MD3's tertiary role is the
    // closest match for that "special emphasis, used sparingly" semantic.
    tertiary: colors.accent[600],
    onTertiary: '#ffffff',
    tertiaryContainer: colors.accent[100],
    onTertiaryContainer: colors.accent[800],
    error: colors.danger[600],
    onError: '#ffffff',
    errorContainer: colors.danger[100],
    onErrorContainer: colors.danger[800],
    background: colors.surface,
    onBackground: colors.neutral[900],
    surface: colors.surfaceCard,
    onSurface: colors.neutral[900],
    surfaceVariant: colors.neutral[100],
    onSurfaceVariant: colors.neutral[600],
    outline: colors.border,
    outlineVariant: colors.neutral[200],
    inverseSurface: colors.neutral[900],
    inverseOnSurface: colors.neutral[50],
    inversePrimary: colors.brand[200],
    elevation: {
      level0: 'transparent',
      level1: colors.surfaceCard,
      level2: colors.surfaceCard,
      level3: colors.surfaceCard,
      level4: colors.surfaceCard,
      level5: colors.surfaceCard,
    },
  },
};
