import { apiPost } from '../../api/client';
import { getSessionId } from './session-id';

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
