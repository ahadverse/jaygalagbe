import { API_URL } from "@/lib/api/config";

export type AdStats = {
  impressions: number;
  visits: number;
  conversions: number;
  conversionRate: number;
};

export async function fetchAdStats(
  adId: string,
  token: string,
): Promise<AdStats | null> {
  try {
    const response = await fetch(`${API_URL}/ads/${adId}/stats`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    if (!response.ok) return null;
    return (await response.json()) as AdStats;
  } catch {
    return null;
  }
}
