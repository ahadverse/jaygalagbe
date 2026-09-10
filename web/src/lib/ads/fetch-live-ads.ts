import type { Ad, Sector } from "./types";

const API_URL = process.env.API_URL ?? "http://localhost:4000";

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
