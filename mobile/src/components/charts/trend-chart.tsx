import { StyleSheet, Text, View } from 'react-native';
import { LineChart } from 'react-native-gifted-charts';

import type { AnalyticsSeriesPoint } from '../../features/analytics/types';
import { colors, fontFamily, radius } from '../../theme/tokens';
import { chartAxisTextStyle, chartRuleColor, chartSeries } from './palette';

// Web's TrendChart is a stacked-gradient recharts AreaChart; gifted-charts has
// no per-series area fill, so the three series read as lines and the legend
// (recharts renders its own) is drawn below the plot.
export function TrendChart({ data }: { data: AnalyticsSeriesPoint[] }) {
  return (
    <View style={styles.chart}>
      <LineChart
        data={data.map((point) => ({ value: point.impressions }))}
        data2={data.map((point) => ({ value: point.visits }))}
        data3={data.map((point) => ({ value: point.conversions }))}
        color={chartSeries.impressions}
        color2={chartSeries.visits}
        color3={chartSeries.leads}
        thickness={2}
        hideDataPoints
        spacing={Math.max(4, 300 / Math.max(data.length, 1))}
        height={180}
        noOfSections={4}
        rulesColor={chartRuleColor}
        yAxisColor={chartRuleColor}
        xAxisColor={chartRuleColor}
        // Dates are too dense to label at phone width; the range filter above
        // already states the window.
        xAxisLabelTextStyle={styles.hiddenAxisLabel}
        yAxisTextStyle={chartAxisTextStyle}
      />
      <View style={styles.legendRow}>
        <LegendItem color={chartSeries.impressions} label="Impressions" />
        <LegendItem color={chartSeries.visits} label="Visits" />
        <LegendItem color={chartSeries.leads} label="Leads" />
      </View>
    </View>
  );
}

function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <View style={styles.legendItem}>
      <View style={[styles.legendDot, { backgroundColor: color }]} />
      <Text style={styles.legendLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  chart: {
    gap: 12,
  },
  hiddenAxisLabel: {
    fontSize: 0,
  },
  legendRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
    justifyContent: 'center',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: radius.full,
  },
  legendLabel: {
    fontFamily: fontFamily.textMedium,
    fontSize: 12,
    color: colors.neutral[600],
  },
});
