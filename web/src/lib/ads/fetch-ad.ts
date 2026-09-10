import { API_URL } from "@/lib/api/config";
import type { Ad } from "./types";

export async function fetchAd(id: string): Promise<Ad | null> {
  try {
    const response = await fetch(`${API_URL}/ads/${id}`, {
      cache: "no-store",
    });

    if (!response.ok) {
      return null;
    }

    return (await response.json()) as Ad;
  } catch {
    return null;
  }
}
