import { API_URL, isValidId } from "@/lib/api/config";
import type { AdvertiserReviews } from "./types";

const MAX_BATCH = 50;

export async function fetchAdvertiserReviewsBatch(
  advertiserIds: string[],
): Promise<Record<string, AdvertiserReviews>> {
  const ids = [...new Set(advertiserIds.filter(isValidId))].slice(0, MAX_BATCH);
  if (ids.length === 0) {
    return {};
  }

  try {
    const params = new URLSearchParams({ advertiserIds: ids.join(",") });
    const response = await fetch(`${API_URL}/reviews/batch?${params}`, {
      cache: "no-store",
    });
    if (!response.ok) {
      return {};
    }
    return (await response.json()) as Record<string, AdvertiserReviews>;
  } catch {
    return {};
  }
}
