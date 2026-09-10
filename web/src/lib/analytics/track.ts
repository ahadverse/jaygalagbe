import { getSessionId } from "./session-id";

export type ImpressionContext = "SEARCH" | "SECTOR_LISTING" | "HOMEPAGE";

export async function pingImpression(
  adId: string,
  context: ImpressionContext,
): Promise<void> {
  try {
    await fetch("/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ kind: "impression", adId, context }),
      keepalive: true,
    });
  } catch {
    // Analytics is best-effort; a failed ping should never break the page.
  }
}

export async function pingVisit(adId: string): Promise<string | null> {
  try {
    const response = await fetch("/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ kind: "visit", adId, sessionId: getSessionId() }),
      keepalive: true,
    });
    if (!response.ok) return null;
    const data = (await response.json()) as { id?: string };
    return data.id ?? null;
  } catch {
    return null;
  }
}
