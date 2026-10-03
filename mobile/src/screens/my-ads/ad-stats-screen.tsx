import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { ActivityIndicator } from 'react-native-paper';

import { BrandCard, StatTile } from '../../components/brand/brand-card';
import { Eyebrow } from '../../components/brand/eyebrow';
import { FunnelBarChart } from '../../components/charts/funnel-bar-chart';
import { TrendChart } from '../../components/charts/trend-chart';
import { getAdStats } from '../../features/analytics/api';
import {
  STATS_RANGE_PRESETS,
  type StatsRangeValue,
} from '../../features/analytics/types';
import type { MyAdsStackScreenProps } from '../../navigation/types';
import { colors, fontFamily, radius } from '../../theme/tokens';

// Mirrors web/src/app/dashboard/ads/[id]/stats/page.tsx: 4 range presets (no
// custom date pickers), the same 5 stat cards, a 3-series trend chart, and a
// 3-stage funnel that's just the window's Impressions/Visits/Leads totals.
export function AdStatsScreen({ route }: MyAdsStackScreenProps<'AdStats'>) {
  const { adId } = route.params;
  const [range, setRange] = useState<StatsRangeValue>('30d');

  const {
    data: stats,
    isPending,
    isError,
  } = useQuery({
    queryKey: ['ads', 'stats', adId, range],
    queryFn: () => getAdStats(adId, range),
  });

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.chipRow}>
        {STATS_RANGE_PRESETS.map((preset) => {
          const selected = range === preset.value;
          return (
            <Pressable
              key={preset.value}
              onPress={() => setRange(preset.value)}
              style={[styles.pill, selected ? styles.pillSelected : null]}
            >
              <Text
                style={[
                  styles.pillLabel,
                  selected ? styles.pillLabelSelected : null,
                ]}
              >
                {preset.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {isPending ? <ActivityIndicator style={styles.state} /> : null}
      {isError ? (
        <View style={styles.stateBlock}>
          <Text style={styles.stateTitle}>Couldn&apos;t load stats</Text>
          <Text style={styles.stateNote}>
            Check your connection and try this range again.
          </Text>
        </View>
      ) : null}

      {stats ? (
        <>
          <View style={styles.statsGrid}>
            <StatTile
              label="Impressions"
              value={String(stats.impressions)}
              style={styles.statTile}
            />
            <StatTile
              label="Visits"
              value={String(stats.visits)}
              style={styles.statTile}
            />
            <StatTile
              label="Leads"
              value={String(stats.conversions)}
              style={styles.statTile}
            />
            <StatTile
              label="Click-through"
              value={
                stats.impressions > 0
                  ? `${((stats.visits / stats.impressions) * 100).toFixed(1)}%`
                  : '0%'
              }
              style={styles.statTile}
            />
            <StatTile
              label="Conversion rate"
              value={`${(stats.conversionRate * 100).toFixed(1)}%`}
              style={styles.statTile}
            />
          </View>

          <BrandCard variant="card" radius="lg" style={styles.chartCard}>
            <View style={styles.chartHeader}>
              <Eyebrow>Activity over time</Eyebrow>
              <Text style={styles.chartTitle}>Trend</Text>
            </View>
            {stats.series.some(
              (point) => point.impressions || point.visits || point.conversions,
            ) ? (
              <TrendChart data={stats.series} />
            ) : (
              <Text style={styles.chartEmpty}>
                No activity in this range yet. Try a wider range.
              </Text>
            )}
          </BrandCard>

          <BrandCard variant="card" radius="lg" style={styles.chartCard}>
            <View style={styles.chartHeader}>
              <Eyebrow>Performance funnel</Eyebrow>
              <Text style={styles.chartTitle}>Seen to contacted</Text>
            </View>
            <FunnelBarChart
              stages={[
                { label: 'Impressions', value: stats.impressions },
                { label: 'Visits', value: stats.visits },
                { label: 'Leads', value: stats.conversions },
              ]}
            />
          </BrandCard>
        </>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    gap: 16,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  pill: {
    backgroundColor: colors.brand[50],
    borderRadius: radius.full,
    paddingHorizontal: 14,
    paddingVertical: 7,
  },
  pillSelected: {
    backgroundColor: colors.brand[600],
  },
  pillLabel: {
    fontFamily: fontFamily.textSemibold,
    fontSize: 13,
    lineHeight: 16,
    color: colors.brand[800],
  },
  pillLabelSelected: {
    color: colors.surfaceCard,
  },
  state: {
    marginTop: 16,
  },
  stateBlock: {
    marginTop: 24,
    alignItems: 'center',
    gap: 6,
  },
  stateTitle: {
    fontFamily: fontFamily.displaySemibold,
    fontSize: 16,
    color: colors.neutral[700],
  },
  stateNote: {
    fontFamily: fontFamily.text,
    fontSize: 13,
    textAlign: 'center',
    color: colors.neutral[500],
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  statTile: {
    minWidth: '30%',
    flexGrow: 1,
    padding: 12,
  },
  chartCard: {
    gap: 12,
  },
  chartHeader: {
    gap: 4,
  },
  chartTitle: {
    fontFamily: fontFamily.display,
    fontSize: 17,
    letterSpacing: -0.3,
    color: colors.neutral[900],
  },
  chartEmpty: {
    fontFamily: fontFamily.text,
    fontSize: 13,
    color: colors.neutral[500],
  },
});
