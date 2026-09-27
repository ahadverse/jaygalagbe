import { apiDelete, apiGet, apiPost } from '../../api/client';
import type { ReviewBatchEntry } from './types';

// No dedicated "given"/"received" endpoints exist - both views are derived
// client-side from this one batch lookup, same as web's dashboard/reviews
// page (see reviews-screen.tsx for how "given" additionally cross-references
// GET /conversations to find reviewable advertisers).
export function getReviewsBatch(
  advertiserIds: string[],
): Promise<Record<string, ReviewBatchEntry>> {
  if (advertiserIds.length === 0) return Promise.resolve({});
  const params = new URLSearchParams({
    advertiserIds: advertiserIds.join(','),
  });
  return apiGet<Record<string, ReviewBatchEntry>>(
    `/reviews/batch?${params.toString()}`,
  );
}

export function upsertReview(
  advertiserId: string,
  input: { rating: number; comment?: string },
): Promise<void> {
  return apiPost<void>(`/advertisers/${advertiserId}/reviews`, input);
}

export function deleteReview(advertiserId: string): Promise<void> {
  return apiDelete<void>(`/advertisers/${advertiserId}/reviews`);
}
