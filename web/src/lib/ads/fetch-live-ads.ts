import { API_URL } from "@/lib/api/config";
import type { Ad, Sector } from "./types";

export async function fetchLiveAds(
  sector: Sector,
): Promise<{ ads: Ad[]; error: boolean }> {
  try {
    const response = await fetch(`${API_URL}/ads?sector=${sector}`, {
      cache: "no-store",
    });

    if (!response.ok) {
      return { ads: [], error: true };
    }

    const ads = (await response.json()) as Ad[];
    return { ads, error: false };
  } catch {
    return { ads: [], error: true };
  }
}
