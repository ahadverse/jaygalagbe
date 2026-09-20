import { NextResponse } from "next/server";
import { apiUrl, isValidId } from "@/lib/api/config";

const IMPRESSION_CONTEXTS = new Set(["SEARCH", "SECTOR_LISTING", "HOMEPAGE"]);
const MAX_SESSION_ID = 64;
/* Only the characters an IPv4 or IPv6 literal can contain — the value comes
 * from a request header and is echoed into an upstream one. */
const IP_ADDRESS = /^[0-9a-f.:]{3,45}$/i;

type TrackPayload = {
  kind?: unknown;
  adId?: unknown;
  context?: unknown;
  sessionId?: unknown;
};

export async function POST(request: Request) {
  let payload: TrackPayload;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  // Every field is echoed into an upstream path or body, so nothing is
  // forwarded until it matches the exact shape this route accepts.
  if (!isValidId(payload?.adId)) {
    return NextResponse.json({ error: "Invalid adId" }, { status: 400 });
  }

  if (payload.kind === "impression") {
    if (typeof payload.context !== "string" || !IMPRESSION_CONTEXTS.has(payload.context)) {
      return NextResponse.json({ error: "Invalid context" }, { status: 400 });
    }
    return forward(
      apiUrl`/ads/${payload.adId}/impressions`,
      { context: payload.context },
      clientAddress(request),
    );
  }

  if (payload.kind === "visit") {
    if (
      typeof payload.sessionId !== "string" ||
      payload.sessionId.length === 0 ||
      payload.sessionId.length > MAX_SESSION_ID
    ) {
      return NextResponse.json({ error: "Invalid sessionId" }, { status: 400 });
    }
    return forward(
      apiUrl`/ads/${payload.adId}/visits`,
      { sessionId: payload.sessionId },
      clientAddress(request),
    );
  }

  return NextResponse.json({ error: "Invalid kind" }, { status: 400 });
}

/**
 * Tracking pings reach the API from this server, not the browser, so without
 * the original address the API's per-caller rate limit is one budget shared by
 * every visitor at once — a single busy listing page exhausts it.
 */
function clientAddress(request: Request): string | null {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0];
  const candidate = (forwarded ?? request.headers.get("x-real-ip") ?? "").trim();
  return IP_ADDRESS.test(candidate) ? candidate : null;
}

async function forward(
  url: string,
  body: Record<string, string>,
  clientIp: string | null,
) {
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(clientIp ? { "X-Forwarded-For": clientIp } : {}),
      },
      body: JSON.stringify(body),
    });
    if (!response.ok) {
      return NextResponse.json({ error: "Tracking failed" }, { status: 502 });
    }
    return NextResponse.json(await response.json());
  } catch {
    return NextResponse.json({ error: "Tracking failed" }, { status: 502 });
  }
}
