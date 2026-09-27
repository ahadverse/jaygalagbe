export type AnalyticsSeriesPoint = {
  date: string;
  impressions: number;
  visits: number;
  conversions: number;
};

export type AdStats = {
  impressions: number;
  visits: number;
  conversions: number;
  conversionRate: number;
  series: AnalyticsSeriesPoint[];
};

export type AnalyticsTotals = {
  impressions: number;
  visits: number;
  conversions: number;
  conversionRate: number;
};

export type AdBreakdown = AnalyticsTotals & {
  id: string;
  title: string;
  status: string;
};

export type AnalyticsOverview = {
  totals: AnalyticsTotals;
  series: AnalyticsSeriesPoint[];
  ads: AdBreakdown[];
};

// Mirrors web/src/lib/analytics/date-range.ts.
export const STATS_RANGE_PRESETS = [
  { value: '7d', label: 'Last 7 days', days: 7 },
  { value: '30d', label: 'Last 30 days', days: 30 },
  { value: '90d', label: 'Last 90 days', days: 90 },
  { value: '365d', label: 'Last 12 months', days: 365 },
] as const;

export type StatsRangeValue = (typeof STATS_RANGE_PRESETS)[number]['value'];

export function resolveStatsRange(value: StatsRangeValue): {
  from: string;
  to: string;
} {
  const preset = STATS_RANGE_PRESETS.find((option) => option.value === value)!;
  const to = new Date();
  const from = new Date(to.getTime() - (preset.days - 1) * 86_400_000);
  return {
    from: from.toISOString().slice(0, 10),
    to: to.toISOString().slice(0, 10),
  };
}
