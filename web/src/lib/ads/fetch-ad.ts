import { apiUrl, isValidId } from "@/lib/api/config";
import type { Ad } from "./types";

export async function fetchAd(id: string): Promise<Ad | null> {
  if (!isValidId(id)) {
    return null;
  }

  try {
    const response = await fetch(apiUrl`/ads/${id}`, { cache: "no-store" });
    if (!response.ok) {
      return null;
    }
    return (await response.json()) as Ad;
  } catch {
    return null;
  }
}
