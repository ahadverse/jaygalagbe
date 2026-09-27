import {
  DarkTheme as NavigationDarkTheme,
  DefaultTheme as NavigationDefaultTheme,
} from '@react-navigation/native';
import merge from 'deepmerge';
import { adaptNavigationTheme } from 'react-native-paper';

import { jaygalagbeDarkTheme, jaygalagbeLightTheme } from './md3-theme';

const { LightTheme: adaptedNavLight, DarkTheme: adaptedNavDark } =
  adaptNavigationTheme({
    reactNavigationLight: NavigationDefaultTheme,
    reactNavigationDark: NavigationDarkTheme,
    materialLight: jaygalagbeLightTheme,
    materialDark: jaygalagbeDarkTheme,
  });

// react-native-paper's official recipe for pairing Paper + React Navigation:
// merge each side's theme so screen headers/tab bars pick up the same MD3
// colors that Paper components use. The result satisfies both PaperProvider's
// and NavigationContainer's `theme` prop directly.
export const combinedLightTheme = merge(jaygalagbeLightTheme, adaptedNavLight);
export const combinedDarkTheme = merge(jaygalagbeDarkTheme, adaptedNavDark);
