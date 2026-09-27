import { apiPost } from '../../api/client';
import type { ReportReasonCode } from './types';

export function reportAd(
  adId: string,
  input: { reasonCode: ReportReasonCode; note?: string },
): Promise<void> {
  return apiPost<void>(`/ads/${adId}/reports`, input);
}
