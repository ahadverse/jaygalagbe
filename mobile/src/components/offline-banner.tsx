import { useNetInfo } from '@react-native-community/netinfo';
import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors } from '../theme/tokens';

/**
 * Persistent, unobtrusive connectivity notice - no dismiss control, it just
 * disappears on its own once NetInfo reports a connection again. `isConnected`
 * is `null` for a beat right after launch while NetInfo determines the
 * initial state, so this only renders once it has positively confirmed
 * there's no connection, rather than flashing on startup.
 */
export function OfflineBanner() {
  const insets = useSafeAreaInsets();
  const { isConnected } = useNetInfo();

  if (isConnected !== false) return null;

  return (
    <View style={[styles.banner, { paddingTop: insets.top + 6 }]}>
      <Text variant="labelMedium" style={styles.label}>
        You&apos;re offline.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  // A notice, so it takes web's warning tone rather than reading as chrome.
  banner: {
    alignItems: 'center',
    paddingBottom: 6,
    backgroundColor: colors.warning[50],
    borderBottomWidth: 1,
    borderBottomColor: colors.warning[100],
  },
  label: {
    color: colors.warning[700],
  },
});
