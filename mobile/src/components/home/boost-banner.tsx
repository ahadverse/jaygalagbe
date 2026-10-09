import { Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { BOOST_TIERS } from '../../features/boost/types';
import { formatPrice } from '../../lib/format';
import { colors, fontFamily, radius, shadow } from '../../theme/tokens';

const cheapestBoost = BOOST_TIERS.reduce((cheapest, tier) =>
  tier.priceBdt < cheapest.priceBdt ? tier : cheapest,
);

// Ports web/src/components/home/boost-banner.tsx. The My Ads stack handles its
// own logged-out prompt, so guests are sent there the same way PostAdButton does.
export function BoostBanner({ onBoost }: { onBoost: () => void }) {
  return (
    <View style={styles.section}>
      <View style={styles.card}>
        <View style={styles.header}>
          <View style={styles.iconTile}>
            <Svg width={24} height={24} viewBox="0 0 24 24">
              <Path
                d="M13 3 5 13.5h6L10 21l8-10.5h-6L13 3Z"
                fill="none"
                stroke="#ffffff"
                strokeWidth={1.8}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </Svg>
          </View>
          <View style={styles.text}>
            <Text style={styles.title}>Get More Buyers</Text>
            <Text style={styles.body}>
              Boost your property from only {formatPrice(cheapestBoost.priceBdt)}{' '}
              and place it above regular listings.
            </Text>
          </View>
        </View>
        <Pressable
          accessibilityRole="button"
          onPress={onBoost}
          style={({ pressed }) => [
            styles.button,
            pressed ? styles.buttonPressed : null,
          ]}
        >
          <Text style={styles.buttonLabel}>Boost your listing</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  card: {
    gap: 18,
    borderRadius: radius['2xl'],
    backgroundColor: colors.brand[600],
    padding: 22,
    ...shadow('lg'),
  },
  header: {
    flexDirection: 'row',
    gap: 14,
  },
  iconTile: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.lg,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
  },
  text: {
    flex: 1,
    gap: 4,
  },
  title: {
    fontFamily: fontFamily.display,
    fontSize: 20,
    lineHeight: 26,
    letterSpacing: -0.4,
    color: '#ffffff',
  },
  body: {
    fontFamily: fontFamily.text,
    fontSize: 14,
    lineHeight: 21,
    color: 'rgba(255,255,255,0.85)',
  },
  button: {
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.full,
    backgroundColor: '#ffffff',
  },
  buttonPressed: {
    backgroundColor: colors.brand[50],
  },
  buttonLabel: {
    fontFamily: fontFamily.textSemibold,
    fontSize: 15,
    color: colors.brand[700],
  },
});
