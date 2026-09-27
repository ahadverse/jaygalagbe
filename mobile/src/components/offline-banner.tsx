import { useNetInfo } from '@react-native-community/netinfo';
import { StyleSheet, View } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

/**
 * Persistent, unobtrusive connectivity notice - no dismiss control, it just
 * disappears on its own once NetInfo reports a connection again. `isConnected`
 * is `null` for a beat right after launch while NetInfo determines the
 * initial state, so this only renders once it has positively confirmed
 * there's no connection, rather than flashing on startup.
 */
export function OfflineBanner() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { isConnected } = useNetInfo();

  if (isConnected !== false) return null;

  return (
    <View
      style={[
        styles.banner,
        {
          paddingTop: insets.top + 6,
          backgroundColor: theme.colors.surfaceVariant,
        },
      ]}
    >
      <Text
        variant="labelMedium"
        style={{ color: theme.colors.onSurfaceVariant }}
      >
        You&apos;re offline.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    alignItems: 'center',
    paddingBottom: 6,
  },
});
