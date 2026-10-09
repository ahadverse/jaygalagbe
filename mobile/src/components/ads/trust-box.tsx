import { StyleSheet, Text, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { colors, fontFamily } from '../../theme/tokens';
import { BrandCard } from '../brand/brand-card';

function Check() {
  return (
    <Svg width={16} height={16} viewBox="0 0 24 24" style={styles.check}>
      <Path
        d="m5 12.5 4.5 4.5L19 7.5"
        fill="none"
        stroke={colors.success[600]}
        strokeWidth={2.2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

// Ports web/src/components/ads/trust-box.tsx. Says "reviewed", never
// "verified": nobody here has checked the deed.
export function TrustBox({ isLive }: { isLive: boolean }) {
  const items = [
    'Listing reviewed before publication',
    'Advertiser information submitted to Jayga Lagbe',
    ...(isLive ? ['Listing is currently active'] : []),
  ];

  return (
    <BrandCard style={styles.card}>
      <View style={styles.header}>
        <Svg width={16} height={16} viewBox="0 0 24 24">
          <Path
            d="M12 3 5 6v5c0 4.5 3 8 7 10 4-2 7-5.5 7-10V6l-7-3Z"
            fill="none"
            stroke={colors.brand[600]}
            strokeWidth={1.8}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <Path
            d="m9 12 2 2 4-4"
            fill="none"
            stroke={colors.brand[600]}
            strokeWidth={1.8}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
        <Text style={styles.heading}>Jayga Lagbe review</Text>
      </View>
      <View style={styles.content}>
        <View style={styles.list}>
          {items.map((item) => (
            <View key={item} style={styles.item}>
              <Check />
              <Text style={styles.itemText}>{item}</Text>
            </View>
          ))}
        </View>
        <View style={styles.notice}>
          <Text style={styles.noticeText}>
            <Text style={styles.noticeStrong}>Important:</Text> we review
            listings for quality and authenticity, but we do not verify
            ownership or legal status. Always visit the property and check
            ownership documents before making any payment.
          </Text>
        </View>
      </View>
    </BrandCard>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 0,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  heading: {
    fontFamily: fontFamily.display,
    fontSize: 14,
    letterSpacing: -0.2,
    color: colors.neutral[900],
  },
  content: {
    gap: 12,
    paddingHorizontal: 18,
    paddingVertical: 16,
  },
  list: {
    gap: 8,
  },
  item: {
    flexDirection: 'row',
    gap: 10,
  },
  check: {
    marginTop: 2,
  },
  itemText: {
    flex: 1,
    fontFamily: fontFamily.text,
    fontSize: 14,
    lineHeight: 21,
    color: colors.neutral[900],
  },
  notice: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.warning[100],
    backgroundColor: colors.warning[50],
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  noticeText: {
    fontFamily: fontFamily.text,
    fontSize: 12.5,
    lineHeight: 19,
    color: colors.warning[800],
  },
  noticeStrong: {
    fontFamily: fontFamily.textSemibold,
  },
});
