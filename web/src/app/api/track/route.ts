import { NextResponse } from "next/server";
import { API_URL } from "@/lib/api/config";

type TrackPayload =
  | { kind: "impression"; adId: string; context: "SEARCH" | "SECTOR_LISTING" | "HOMEPAGE" }
  | { kind: "visit"; adId: string; sessionId: string };

export async function POST(request: Request) {
  let payload: TrackPayload;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!payload?.adId || !payload.kind) {
    return NextResponse.json({ error: "Missing adId or kind" }, { status: 400 });
  }

  const path =
    payload.kind === "impression"
      ? `/ads/${payload.adId}/impressions`
      : `/ads/${payload.adId}/visits`;
  const body =
    payload.kind === "impression"
      ? { context: payload.context }
      : { sessionId: payload.sessionId };

  try {
    const response = await fetch(`${API_URL}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      return NextResponse.json({ error: "Tracking failed" }, { status: 502 });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "Tracking failed" }, { status: 502 });
  }
}
