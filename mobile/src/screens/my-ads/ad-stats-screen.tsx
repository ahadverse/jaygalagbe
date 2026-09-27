import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { BarChart, LineChart } from 'react-native-gifted-charts';
import { ActivityIndicator, Chip, Text, useTheme } from 'react-native-paper';

import { getAdStats } from '../../features/analytics/api';
import {
  STATS_RANGE_PRESETS,
  type StatsRangeValue,
} from '../../features/analytics/types';
import type { MyAdsStackScreenProps } from '../../navigation/types';

function StatCard({ label, value }: { label: string; value: string }) {
  const theme = useTheme();
  return (
    <View
      style={[
        styles.statCard,
        { backgroundColor: theme.colors.surfaceVariant },
      ]}
    >
      <Text
        variant="labelMedium"
        style={{ color: theme.colors.onSurfaceVariant }}
      >
        {label}
      </Text>
      <Text variant="titleLarge">{value}</Text>
    </View>
  );
}

// Mirrors web/src/app/dashboard/ads/[id]/stats/page.tsx: 4 range presets (no
// custom date pickers), the same 5 stat cards, a 3-series trend chart, and a
// 3-stage funnel that's just the window's Impressions/Visits/Leads totals.
export function AdStatsScreen({ route }: MyAdsStackScreenProps<'AdStats'>) {
  const { adId } = route.params;
  const theme = useTheme();
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
        {STATS_RANGE_PRESETS.map((preset) => (
          <Chip
            key={preset.value}
            selected={range === preset.value}
            onPress={() => setRange(preset.value)}
          >
            {preset.label}
          </Chip>
        ))}
      </View>

      {isPending ? <ActivityIndicator style={styles.state} /> : null}
      {isError ? (
        <Text style={[styles.state, { color: theme.colors.error }]}>
          Couldn&apos;t load stats for this ad.
        </Text>
      ) : null}

      {stats ? (
        <>
          <View style={styles.statsGrid}>
            <StatCard label="Impressions" value={String(stats.impressions)} />
            <StatCard label="Visits" value={String(stats.visits)} />
            <StatCard label="Leads" value={String(stats.conversions)} />
            <StatCard
              label="Click-through"
              value={
                stats.impressions > 0
                  ? `${((stats.visits / stats.impressions) * 100).toFixed(1)}%`
                  : '0%'
              }
            />
            <StatCard
              label="Conversion rate"
              value={`${(stats.conversionRate * 100).toFixed(1)}%`}
            />
          </View>

          {stats.series.some(
            (point) => point.impressions || point.visits || point.conversions,
          ) ? (
            <View style={styles.chartCard}>
              <Text variant="titleMedium" style={styles.chartTitle}>
                Trend
              </Text>
              <LineChart
                data={stats.series.map((point) => ({
                  value: point.impressions,
                }))}
                data2={stats.series.map((point) => ({ value: point.visits }))}
                data3={stats.series.map((point) => ({
                  value: point.conversions,
                }))}
                color={theme.colors.primary}
                color2={theme.colors.tertiary}
                color3={theme.colors.secondary}
                thickness={2}
                hideDataPoints
                spacing={Math.max(4, 300 / stats.series.length)}
                height={180}
                noOfSections={4}
                xAxisLabelTextStyle={{ fontSize: 0 }}
                yAxisTextStyle={{ color: theme.colors.onSurfaceVariant }}
              />
              <View style={styles.legendRow}>
                <Text style={{ color: theme.colors.primary }}>
                  - Impressions
                </Text>
                <Text style={{ color: theme.colors.tertiary }}>- Visits</Text>
                <Text style={{ color: theme.colors.secondary }}>- Leads</Text>
              </View>
            </View>
          ) : (
            <Text style={{ color: theme.colors.onSurfaceVariant }}>
              No activity in this range yet.
            </Text>
          )}

          <View style={styles.chartCard}>
            <Text variant="titleMedium" style={styles.chartTitle}>
              Funnel
            </Text>
            <BarChart
              data={[
                {
                  value: stats.impressions,
                  label: 'Impressions',
                  frontColor: theme.colors.primary,
                },
                {
                  value: stats.visits,
                  label: 'Visits',
                  frontColor: theme.colors.tertiary,
                },
                {
                  value: stats.conversions,
                  label: 'Leads',
                  frontColor: theme.colors.secondary,
                },
              ]}
              height={160}
              yAxisTextStyle={{ color: theme.colors.onSurfaceVariant }}
              xAxisLabelTextStyle={{ color: theme.colors.onSurfaceVariant }}
            />
          </View>
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
  state: {
    textAlign: 'center',
    marginTop: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  statCard: {
    borderRadius: 12,
    padding: 12,
    minWidth: '30%',
    flexGrow: 1,
    gap: 4,
  },
  chartCard: {
    gap: 8,
  },
  chartTitle: {
    marginBottom: 4,
  },
  legendRow: {
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'center',
  },
});
