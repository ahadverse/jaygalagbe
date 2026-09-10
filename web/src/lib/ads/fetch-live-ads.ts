import type { Ad, Sector } from "./types";

const API_URL = process.env.API_URL ?? "http://localhost:4000";

export async function fetchLiveAds(
  sector: Sector,
  location?: string,
): Promise<{ ads: Ad[]; error: boolean }> {
  const params = new URLSearchParams({ sector });

  try {
    const response = await fetch(`${API_URL}/ads?${params.toString()}`, {
      cache: "no-store",
    });

    if (!response.ok) {
      return { ads: [], error: true };
    }

    const ads = (await response.json()) as Ad[];
    const trimmedLocation = location?.trim().toLowerCase();
    const filtered = trimmedLocation
      ? ads.filter(
          (ad) =>
            ad.locationArea.toLowerCase().includes(trimmedLocation) ||
            ad.locationDistrict.toLowerCase().includes(trimmedLocation),
        )
      : ads;

    return { ads: filtered, error: false };
  } catch {
    return { ads: [], error: true };
  }
}
