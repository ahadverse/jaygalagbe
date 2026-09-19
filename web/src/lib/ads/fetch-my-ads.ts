import { apiUrl } from "@/lib/api/config";
import type { Ad } from "./types";

export async function fetchMyAds(token: string): Promise<Ad[]> {
  try {
    const response = await fetch(apiUrl`/ads/mine`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    if (!response.ok) return [];
    return (await response.json()) as Ad[];
  } catch {
    return [];
  }
}
