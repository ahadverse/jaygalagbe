export type AnalyticsSeriesPoint = {
  date: string;
  impressions: number;
  visits: number;
  conversions: number;
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

export type DateRangeQuery = {
  from?: string;
  to?: string;
};
