import { API_URL } from "@/lib/api/config";
import type { Ad, Sector } from "./types";

export async function fetchLiveAds(
  sector: Sector,
  options?: { take?: number; skip?: number },
): Promise<{ ads: Ad[]; error: boolean }> {
  try {
    const params = new URLSearchParams({ sector });
    if (options?.take) params.set("take", String(options.take));
    if (options?.skip) params.set("skip", String(options.skip));

    const response = await fetch(`${API_URL}/ads?${params.toString()}`, {
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
