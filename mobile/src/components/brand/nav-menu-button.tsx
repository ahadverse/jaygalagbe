import { useNavigation, type NavigationProp } from '@react-navigation/native';
import { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';

import { useAuth } from '../../features/auth/auth-context';
import { sectors } from '../../features/ads/sectors';
import type { RootTabParamList } from '../../navigation/types';
import { colors, fontFamily, radius, shadow } from '../../theme/tokens';

// Ports web/src/components/layout/mobile-nav.tsx: the same two sector rows
// with icon tiles and hints, over the same scrim, plus the log-in row web
// shows at the bottom.
const SECTOR_ROWS = [
  {
    slug: sectors[0].slug,
    label: sectors[0].label,
    hint: 'Land for sale',
    icon: 'M4 20h24M7 20V9l9-5 9 5v11M12 20v-6h6v6',
  },
  {
    slug: sectors[1].slug,
    label: sectors[1].label,
    hint: 'Houses for rent',
    icon: 'M5 18V10l11-6 11 6v8M9 26V16h5v10M20 26h6v-7h-6v7Z',
  },
];

export function NavMenuButton({ tone = 'dark' }: { tone?: 'dark' | 'light' }) {
  const navigation = useNavigation<NavigationProp<RootTabParamList>>();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [open, setOpen] = useState(false);

  function goToSector(slug: (typeof SECTOR_ROWS)[number]['slug']) {
    setOpen(false);
    navigation.navigate('HomeTab', {
      screen: 'SectorListing',
      params: { sector: slug },
    });
  }

  function goToAccount() {
    setOpen(false);
    navigation.navigate('ProfileTab', {
      screen: user ? 'Profile' : 'Login',
    });
  }

  return (
    <>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Open menu"
        accessibilityState={{ expanded: open }}
        onPress={() => setOpen(true)}
        style={({ pressed }) => [
          styles.trigger,
          pressed ? styles.triggerPressed : null,
        ]}
      >
        <Svg width={21} height={21} viewBox="0 0 24 24">
          <Path
            d="M4 7h16M4 12h16M4 17h16"
            stroke={tone === 'light' ? '#ffffff' : colors.neutral[900]}
            strokeWidth={1.9}
            strokeLinecap="round"
          />
        </Svg>
      </Pressable>

      <Modal
        visible={open}
        transparent
        animationType="fade"
        onRequestClose={() => setOpen(false)}
      >
        <Pressable style={styles.scrim} onPress={() => setOpen(false)} />
        <View style={[styles.panel, { paddingTop: insets.top + 12 }]}>
          <View style={styles.panelHead}>
            <Text style={styles.panelTitle}>Browse</Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Close menu"
              onPress={() => setOpen(false)}
              style={styles.closeButton}
            >
              <Svg width={20} height={20} viewBox="0 0 24 24">
                <Path
                  d="M6 18 18 6M6 6l12 12"
                  stroke={colors.neutral[900]}
                  strokeWidth={1.9}
                  strokeLinecap="round"
                />
              </Svg>
            </Pressable>
          </View>

          {SECTOR_ROWS.map((row) => (
            <Pressable
              key={row.slug}
              accessibilityRole="button"
              onPress={() => goToSector(row.slug)}
              style={({ pressed }) => [
                styles.navRow,
                pressed ? styles.navRowPressed : null,
              ]}
            >
              <View style={styles.navIconTile}>
                <Svg width={20} height={20} viewBox="0 0 32 32">
                  <Path
                    d={row.icon}
                    fill="none"
                    stroke={colors.brand[700]}
                    strokeWidth={1.6}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </Svg>
              </View>
              <View style={styles.navCopy}>
                <Text style={styles.navLabel}>{row.label}</Text>
                <Text style={styles.navHint}>{row.hint}</Text>
              </View>
            </Pressable>
          ))}

          <Pressable
            accessibilityRole="button"
            onPress={goToAccount}
            style={({ pressed }) => [
              styles.accountButton,
              pressed ? styles.accountButtonPressed : null,
            ]}
          >
            <Text style={styles.accountLabel}>
              {user ? `${user.name.split(' ')[0]}'s dashboard` : 'Log in'}
            </Text>
          </Pressable>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  trigger: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.full,
  },
  triggerPressed: {
    backgroundColor: colors.neutral[100],
  },
  scrim: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(7,5,4,0.25)',
  },
  panel: {
    backgroundColor: colors.surfaceCard,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingHorizontal: 16,
    paddingBottom: 20,
    gap: 8,
    ...shadow('lg'),
  },
  panelHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  panelTitle: {
    fontFamily: fontFamily.display,
    fontSize: 18,
    letterSpacing: -0.4,
    color: colors.neutral[900],
  },
  closeButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.full,
  },
  navRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    borderRadius: radius.xl,
    backgroundColor: colors.neutral[100],
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  navRowPressed: {
    backgroundColor: colors.brand[50],
  },
  navIconTile: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.lg,
    backgroundColor: colors.surfaceCard,
    ...shadow('sm'),
  },
  navCopy: {
    gap: 2,
  },
  navLabel: {
    fontFamily: fontFamily.displaySemibold,
    fontSize: 14.5,
    color: colors.neutral[900],
  },
  navHint: {
    fontFamily: fontFamily.text,
    fontSize: 12,
    color: colors.neutral[600],
  },
  accountButton: {
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 16,
    alignItems: 'center',
  },
  accountButtonPressed: {
    opacity: 0.7,
  },
  accountLabel: {
    fontFamily: fontFamily.textSemibold,
    fontSize: 14,
    color: colors.brand[700],
  },
});
