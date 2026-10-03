import { StyleSheet, Text, View } from 'react-native';

import type { AdBreakdown } from '../../features/analytics/types';
import { colors, fontFamily, radius } from '../../theme/tokens';
import { chartSeries } from './palette';

const MAX_ROWS = 8;

function truncate(title: string, max = 26) {
  return title.length > max ? `${title.slice(0, max - 1)}…` : title;
}

// Ports web's AdBreakdownChart, but as plain bars rather than a chart library:
// gifted-charts' horizontal mode can't hang a long listing title off each bar
// at phone width, and the whole point of this panel is naming the listing.
export function AdBreakdownChart({ ads }: { ads: AdBreakdown[] }) {
  const rows = [...ads].sort((a, b) => b.visits - a.visits).slice(0, MAX_ROWS);
  const max = rows.length > 0 ? rows[0].visits : 0;

  return (
    <View style={styles.rows}>
      {rows.map((ad) => (
        <View key={ad.id} style={styles.row}>
          <View style={styles.labelRow}>
            <Text style={styles.title} numberOfLines={1}>
              {truncate(ad.title)}
            </Text>
            <Text style={styles.value}>{ad.visits}</Text>
          </View>
          <View style={styles.track}>
            <View
              style={[
                styles.bar,
                { width: `${max > 0 ? (ad.visits / max) * 100 : 0}%` },
              ]}
            />
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  rows: {
    gap: 12,
  },
  row: {
    gap: 6,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 10,
  },
  title: {
    flex: 1,
    fontFamily: fontFamily.textMedium,
    fontSize: 13,
    color: colors.neutral[800],
  },
  value: {
    fontFamily: fontFamily.displaySemibold,
    fontSize: 13,
    color: colors.neutral[900],
    fontVariant: ['tabular-nums'],
  },
  track: {
    height: 8,
    borderRadius: radius.full,
    backgroundColor: colors.neutral[150],
    overflow: 'hidden',
  },
  bar: {
    height: '100%',
    borderRadius: radius.full,
    backgroundColor: chartSeries.visits,
  },
});
