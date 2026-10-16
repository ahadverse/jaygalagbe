import { apiUrl, isValidId } from "@/lib/api/config";
import { getToken } from "@/lib/auth/session";
import type { Ad } from "./types";

// A non-LIVE ad (pending review, rejected, sold, removed) is only visible to
// its owner or an admin, so this has to carry the viewer's session along —
// an anonymous request only ever sees LIVE ads, which would 404 an owner
// trying to view or edit their own ad while it's still in review.
export async function fetchAd(id: string): Promise<Ad | null> {
  if (!isValidId(id)) {
    return null;
  }

  try {
    const token = await getToken();
    const response = await fetch(apiUrl`/ads/${id}`, {
      cache: "no-store",
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });
    if (!response.ok) {
      return null;
    }
    return (await response.json()) as Ad;
  } catch {
    return null;
  }
}
