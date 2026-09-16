import { API_URL } from "@/lib/api/config";
import type { AdvertiserReviews } from "./types";

export async function fetchAdvertiserReviewsBatch(
  advertiserIds: string[],
): Promise<Record<string, AdvertiserReviews>> {
  if (advertiserIds.length === 0) {
    return {};
  }
  try {
    const response = await fetch(
      `${API_URL}/reviews/batch?advertiserIds=${advertiserIds.join(",")}`,
      { cache: "no-store" },
    );
    if (!response.ok) {
      return {};
    }
    return (await response.json()) as Record<string, AdvertiserReviews>;
  } catch {
    return {};
  }
}
