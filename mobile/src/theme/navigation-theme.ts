import { DefaultTheme as NavigationDefaultTheme } from '@react-navigation/native';
import { adaptNavigationTheme } from 'react-native-paper';

import { jaygalagbeTheme } from './md3-theme';
import { fontFamily } from './tokens';

const { LightTheme: adaptedNavTheme } = adaptNavigationTheme({
  reactNavigationLight: NavigationDefaultTheme,
  materialLight: jaygalagbeTheme,
});

// React Navigation asks for four named weights where Paper asks for the MD3
// typescale, so the same two families are mapped onto its shape as well -
// otherwise headers and tab labels fall back to the OS font.
const navigationFonts = {
  regular: { fontFamily: fontFamily.text, fontWeight: '400' as const },
  medium: { fontFamily: fontFamily.textMedium, fontWeight: '500' as const },
  bold: { fontFamily: fontFamily.displaySemibold, fontWeight: '600' as const },
  heavy: { fontFamily: fontFamily.display, fontWeight: '700' as const },
};

// One object satisfies both PaperProvider's and NavigationContainer's `theme`
// prop: the colors adaptNavigationTheme derived, plus the union of both font
// shapes. Spread explicitly rather than deep-merged so the type checker can
// still see both halves.
export const combinedTheme = {
  ...jaygalagbeTheme,
  ...adaptedNavTheme,
  colors: { ...jaygalagbeTheme.colors, ...adaptedNavTheme.colors },
  fonts: { ...jaygalagbeTheme.fonts, ...navigationFonts },
};
