import { API_URL } from "@/lib/api/config";
import type { AnalyticsOverview, DateRangeQuery } from "./types";

export async function fetchAnalyticsOverview(
  token: string,
  query: DateRangeQuery & { adId?: string } = {},
): Promise<AnalyticsOverview | null> {
  try {
    const params = new URLSearchParams();
    if (query.from) params.set("from", query.from);
    if (query.to) params.set("to", query.to);
    if (query.adId) params.set("adId", query.adId);
    const search = params.toString();

    const response = await fetch(
      `${API_URL}/analytics/overview${search ? `?${search}` : ""}`,
      {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      },
    );
    if (!response.ok) return null;
    return (await response.json()) as AnalyticsOverview;
  } catch {
    return null;
  }
}
