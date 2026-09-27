import { apiGet, apiPost } from '../../api/client';
import { getSessionId } from './session-id';
import type { AdStats, AnalyticsOverview, StatsRangeValue } from './types';
import { resolveStatsRange } from './types';

export type ImpressionContext = 'SEARCH' | 'SECTOR_LISTING' | 'HOMEPAGE';

// Mirrors web/src/lib/analytics/track.ts: analytics is best-effort, so a
// failed ping (offline, rate-limited, ...) should never break a screen.
export async function logImpression(
  adId: string,
  context: ImpressionContext,
): Promise<void> {
  try {
    await apiPost(`/ads/${adId}/impressions`, { context });
  } catch {
    // ignored - see above
  }
}

export async function logVisit(adId: string): Promise<void> {
  try {
    await apiPost(`/ads/${adId}/visits`, { sessionId: getSessionId() });
  } catch {
    // ignored - see above
  }
}

export function getAdStats(
  adId: string,
  range: StatsRangeValue,
): Promise<AdStats> {
  const { from, to } = resolveStatsRange(range);
  return apiGet<AdStats>(`/ads/${adId}/stats?from=${from}&to=${to}`);
}

export function getOverview(
  range: StatsRangeValue,
  adId?: string,
): Promise<AnalyticsOverview> {
  const { from, to } = resolveStatsRange(range);
  const params = new URLSearchParams({ from, to });
  if (adId) params.set('adId', adId);
  return apiGet<AnalyticsOverview>(`/analytics/overview?${params.toString()}`);
}
