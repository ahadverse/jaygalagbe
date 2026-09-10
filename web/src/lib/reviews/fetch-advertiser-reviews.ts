import { API_URL } from "@/lib/api/config";
import type { AdvertiserReviews } from "./types";

export async function fetchAdvertiserReviews(
  advertiserId: string,
): Promise<AdvertiserReviews> {
  try {
    const response = await fetch(`${API_URL}/advertisers/${advertiserId}/reviews`, {
      cache: "no-store",
    });
    if (!response.ok) {
      return { reviews: [], averageRating: 0, reviewCount: 0 };
    }
    return (await response.json()) as AdvertiserReviews;
  } catch {
    return { reviews: [], averageRating: 0, reviewCount: 0 };
  }
}
