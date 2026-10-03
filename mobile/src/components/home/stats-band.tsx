import { StyleSheet, Text, View } from 'react-native';

import type { Ad } from '../../features/ads/types';
import { colors, fontFamily, radius, shadow } from '../../theme/tokens';

// Ports web/src/components/home/stats-band.tsx. Web fans the four tiles out in
// one row; at phone width that leaves four cramped columns, so this keeps the
// sm breakpoint's 2x2 instead. The hairline "grid" is a bordered container with
// 1px gaps showing through, since RN has no grid gap-px equivalent.
export function StatsBand({ ads }: { ads: Ad[] }) {
  const districts = new Set(ads.map((ad) => ad.locationDistrict)).size;
  const landCount = ads.filter((ad) => ad.sector === 'LAND').length;
  const houseCount = ads.filter((ad) => ad.sector === 'HOUSE_RENT').length;

  const stats = [
    { label: 'Live listings', value: String(ads.length) },
    { label: 'Districts covered', value: String(districts) },
    { label: 'Land for sale', value: String(landCount) },
    { label: 'Houses for rent', value: String(houseCount) },
  ];

  const rows = [stats.slice(0, 2), stats.slice(2)];

  return (
    <View style={styles.grid}>
      {rows.map((row) => (
        <View key={row[0].label} style={styles.row}>
          {row.map((stat) => (
            <View key={stat.label} style={styles.tile}>
              <Text style={styles.value}>{stat.value}</Text>
              <Text style={styles.label}>{stat.label}</Text>
            </View>
          ))}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    // Web pulls the band 56px up into a hero that reserves 112px of bottom
    // padding for it; mobile's hero only reserves 38, so the overlap is scaled
    // to match - enough to tie the band to the photo, not enough to crowd the
    // assurance list above it.
    marginTop: -22,
    marginHorizontal: 16,
    borderRadius: radius['2xl'],
    overflow: 'hidden',
    backgroundColor: colors.border, // shows through the 1px gaps as hairlines
    gap: 1,
    ...shadow('lg'),
  },
  row: {
    flexDirection: 'row',
    gap: 1,
  },
  tile: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.surfaceCard,
    paddingHorizontal: 12,
    paddingVertical: 20,
  },
  value: {
    fontFamily: fontFamily.display,
    fontSize: 28,
    lineHeight: 32,
    letterSpacing: -0.8,
    color: colors.neutral[900],
    fontVariant: ['tabular-nums'],
  },
  label: {
    fontFamily: fontFamily.textMedium,
    fontSize: 12,
    lineHeight: 16,
    textAlign: 'center',
    color: colors.neutral[600],
  },
});
