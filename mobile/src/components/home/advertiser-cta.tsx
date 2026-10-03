import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { BOOST_TIERS } from '../../features/boost/types';
import { formatPrice } from '../../lib/format';
import { colors, fontFamily, radius, shadow } from '../../theme/tokens';
import { Eyebrow } from '../brand/eyebrow';

const cheapestBoost = BOOST_TIERS.reduce((cheapest, tier) =>
  tier.priceBdt < cheapest.priceBdt ? tier : cheapest,
);

const POINTS = [
  {
    title: 'Posting is free',
    body: 'No listing fee, no commission on the deal. You only ever pay if you choose to boost.',
  },
  {
    title: 'Reviewed, usually within a day',
    body: 'A person checks the ad and either publishes it or tells you exactly what to fix.',
  },
  {
    title: 'Buyers message you in the app',
    body: 'Replies arrive in your inbox in real time — no phone number posted in public.',
  },
  {
    // Web writes `৳${formatAmount(...)}`; mobile's formatPrice already carries
    // the taka sign, so the price is interpolated whole.
    title: `Boost from ${formatPrice(cheapestBoost.priceBdt)}`,
    body: `Optional paid placement above organic results, from ${cheapestBoost.label}, paid by bKash, Nagad or card.`,
  },
];

// Ports web/src/components/home/advertiser-cta.tsx. Web lights the near-black
// band with two radial gradients (a warm one from the bottom-left, a cooler
// accent one from the top-right); RN has no radial gradient, so each is faked
// with a diagonal LinearGradient anchored in the same corner - the glow's
// direction and warmth are the point, not its exact falloff. The alpha colours
// below are brand-600 and accent-500 from tokens, written as rgba because RN
// styles cannot take a colour with a separate opacity.
export function AdvertiserCta({
  onPostAd,
  onCreateAccount,
}: {
  onPostAd: () => void;
  onCreateAccount: () => void;
}) {
  return (
    <View style={styles.section}>
      <LinearGradient
        colors={['rgba(207,69,2,0.35)', 'transparent']}
        start={{ x: 0, y: 1 }}
        end={{ x: 0.9, y: 0.1 }}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />
      <LinearGradient
        colors={['rgba(218,53,78,0.22)', 'transparent']}
        start={{ x: 1, y: 0 }}
        end={{ x: 0.1, y: 0.7 }}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />

      <View style={styles.content}>
        <Eyebrow style={styles.eyebrow}>For owners and agents</Eyebrow>
        <Text style={styles.title}>
          Have a plot or a flat to put on the market?
        </Text>
        <Text style={styles.body}>
          Put it in front of people who are already searching for it. You keep
          control of the listing, you talk to buyers directly, and you can see
          exactly how the ad is performing.
        </Text>

        <View style={styles.actions}>
          <Pressable
            accessibilityRole="button"
            onPress={onPostAd}
            style={({ pressed }) => [
              styles.primaryButton,
              pressed ? styles.primaryButtonPressed : null,
            ]}
          >
            <Text style={styles.primaryLabel}>Post your property</Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            onPress={onCreateAccount}
            style={({ pressed }) => [
              styles.ghostButton,
              pressed ? styles.ghostButtonPressed : null,
            ]}
          >
            <Text style={styles.ghostLabel}>Create an account</Text>
          </Pressable>
        </View>

        <View style={styles.points}>
          {POINTS.map((point, index) => (
            <View
              key={point.title}
              style={[styles.point, index > 0 ? styles.pointDivider : null]}
            >
              <View style={styles.pointHeader}>
                <Svg width={14} height={14} viewBox="0 0 16 16">
                  <Path
                    d="m3 8.5 3.2 3.2L13 5"
                    fill="none"
                    stroke={colors.brand[300]}
                    strokeWidth={2.2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </Svg>
                <Text style={styles.pointTitle}>{point.title}</Text>
              </View>
              <Text style={styles.pointBody}>{point.body}</Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    backgroundColor: colors.neutral[950],
    overflow: 'hidden',
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 34,
    paddingBottom: 34,
    gap: 12,
  },
  eyebrow: {
    color: colors.brand[300],
  },
  title: {
    fontFamily: fontFamily.display,
    fontSize: 26,
    lineHeight: 30,
    letterSpacing: -0.7,
    color: '#ffffff',
  },
  body: {
    fontFamily: fontFamily.text,
    fontSize: 14.5,
    lineHeight: 23,
    color: colors.neutral[300],
  },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 4,
  },
  primaryButton: {
    flexGrow: 1,
    flexBasis: 150,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.full,
    backgroundColor: colors.brand[700],
    ...shadow('brand'),
  },
  primaryButtonPressed: {
    backgroundColor: colors.brand[800],
  },
  primaryLabel: {
    fontFamily: fontFamily.textSemibold,
    fontSize: 15,
    color: '#ffffff',
  },
  ghostButton: {
    flexGrow: 1,
    flexBasis: 150,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
  },
  ghostButtonPressed: {
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  ghostLabel: {
    fontFamily: fontFamily.textMedium,
    fontSize: 15,
    color: '#ffffff',
  },
  points: {
    marginTop: 10,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    overflow: 'hidden',
  },
  point: {
    gap: 5,
    padding: 18,
  },
  // Web separates the point grid with `gap-px bg-white/10`; a hairline top
  // border does the same job once the grid is one column.
  pointDivider: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(255,255,255,0.12)',
  },
  pointHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  pointTitle: {
    flex: 1,
    fontFamily: fontFamily.display,
    fontSize: 14.5,
    letterSpacing: -0.2,
    color: '#ffffff',
  },
  pointBody: {
    fontFamily: fontFamily.text,
    fontSize: 12.5,
    lineHeight: 19,
    color: colors.neutral[400],
  },
});
