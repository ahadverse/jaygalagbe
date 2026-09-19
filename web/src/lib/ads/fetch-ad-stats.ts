import { apiUrl } from "@/lib/api/config";
import type {
  AnalyticsSeriesPoint,
  DateRangeQuery,
} from "@/lib/analytics/types";

export type AdStats = {
  impressions: number;
  visits: number;
  conversions: number;
  conversionRate: number;
  series: AnalyticsSeriesPoint[];
};

export async function fetchAdStats(
  adId: string,
  token: string,
  query: DateRangeQuery = {},
): Promise<AdStats | null> {
  try {
    const params = new URLSearchParams();
    if (query.from) params.set("from", query.from);
    if (query.to) params.set("to", query.to);
    const search = params.toString();

    const response = await fetch(
      `${apiUrl`/ads/${adId}/stats`}${search ? `?${search}` : ""}`,
      {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      },
    );
    if (!response.ok) return null;
    return (await response.json()) as AdStats;
  } catch {
    return null;
  }
}
