import { Platform } from 'react-native';
import type { NativeStackNavigationOptions } from '@react-navigation/native-stack';

import { colors, fontFamily } from '../theme/tokens';

// Shared by all four stacks so headers read as one app: web's header sits on
// the paper canvas with a hairline bottom border and no shadow, and its titles
// are set in the display font.
export const defaultStackScreenOptions: NativeStackNavigationOptions = {
  headerStyle: { backgroundColor: colors.surface },
  headerTintColor: colors.neutral[900],
  headerTitleStyle: {
    fontFamily: fontFamily.displaySemibold,
    fontSize: 17,
  },
  headerShadowVisible: false,
  // On Android the system status bar already sits above the app window (the
  // black strip), so the native header must not add the status-bar inset again.
  ...(Platform.OS === 'android'
    ? { unstable_headerInsets: { top: false } }
    : null),
  contentStyle: { backgroundColor: colors.surface },
};
