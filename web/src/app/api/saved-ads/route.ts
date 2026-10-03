import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { apiUrl, isValidId } from "@/lib/api/config";
import { getToken } from "@/lib/auth/session";

const MAX_BULK_IDS = 50;
const NO_STORE = { "Cache-Control": "no-store, private" };

/**
 * Same-origin proxy for the saved-ads endpoints: the browser never holds the
 * API token, so every call spends the session cookie here. Mutations are
 * refused cross-site, like the other cookie-spending routes.
 */
async function forbidden(): Promise<NextResponse | null> {
  const fetchSite = (await headers()).get("sec-fetch-site");
  return fetchSite && fetchSite !== "same-origin"
    ? NextResponse.json({ error: "Forbidden" }, { status: 403 })
    : null;
}

function authInit(token: string, method = "GET"): RequestInit {
  return {
    method,
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  };
}

/** `?view=list` returns the saved listings; otherwise just the saved ids. */
export async function GET(request: Request) {
  const blocked = await forbidden();
  if (blocked) return blocked;

  const token = await getToken();
  if (!token) {
    return NextResponse.json({ authenticated: false, adIds: [] });
  }

  const { searchParams } = new URL(request.url);
  try {
    if (searchParams.get("view") === "list") {
      const query = new URLSearchParams();
      for (const key of ["page", "limit"]) {
        const value = searchParams.get(key);
        if (value && /^\d{1,3}$/.test(value)) query.set(key, value);
      }
      const response = await fetch(
        `${apiUrl`/saved-ads`}?${query.toString()}`,
        authInit(token),
      );
      if (!response.ok) {
        return NextResponse.json(
          { error: "Could not load saved ads" },
          { status: response.status === 401 ? 401 : 502 },
        );
      }
      return NextResponse.json(await response.json(), { headers: NO_STORE });
    }

    const response = await fetch(apiUrl`/saved-ads/ids`, authInit(token));
    if (response.status === 401) {
      return NextResponse.json({ authenticated: false, adIds: [] });
    }
    if (!response.ok) {
      return NextResponse.json({ error: "Unavailable" }, { status: 502 });
    }
    const data = (await response.json()) as { adIds: string[] };
    return NextResponse.json(
      { authenticated: true, adIds: data.adIds },
      { headers: NO_STORE },
    );
  } catch {
    return NextResponse.json({ error: "Unavailable" }, { status: 502 });
  }
}

/** Body is `{ adId }`, or `{ adIds }` to import a guest's local list in bulk. */
export async function POST(request: Request) {
  const blocked = await forbidden();
  if (blocked) return blocked;

  const token = await getToken();
  if (!token) {
    return NextResponse.json({ error: "Sign in to save ads" }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as {
    adId?: unknown;
    adIds?: unknown;
  } | null;
  const ids = (
    Array.isArray(body?.adIds) ? body.adIds : [body?.adId]
  ).filter(isValidId);
  if (ids.length === 0 || ids.length > MAX_BULK_IDS) {
    return NextResponse.json({ error: "Invalid ad" }, { status: 400 });
  }

  try {
    let saved = 0;
    let status = 200;
    for (const id of ids) {
      const response = await fetch(
        apiUrl`/ads/${id}/save`,
        authInit(token, "POST"),
      );
      if (response.ok) {
        saved += 1;
      } else if (response.status === 401) {
        return NextResponse.json({ error: "Session expired" }, { status: 401 });
      } else if (response.status !== 404) {
        status = 502;
      } else if (!Array.isArray(body?.adIds)) {
        // A single save of an ad that is gone/not live is a real 404; a bulk
        // import just skips ads that no longer exist.
        return NextResponse.json({ error: "Ad not found" }, { status: 404 });
      }
    }
    return NextResponse.json({ saved }, { status });
  } catch {
    return NextResponse.json({ error: "Unavailable" }, { status: 502 });
  }
}

export async function DELETE(request: Request) {
  const blocked = await forbidden();
  if (blocked) return blocked;

  const token = await getToken();
  if (!token) {
    return NextResponse.json({ error: "Sign in to save ads" }, { status: 401 });
  }

  const adId = new URL(request.url).searchParams.get("adId");
  if (!isValidId(adId)) {
    return NextResponse.json({ error: "Invalid ad" }, { status: 400 });
  }

  try {
    const response = await fetch(
      apiUrl`/ads/${adId}/save`,
      authInit(token, "DELETE"),
    );
    return NextResponse.json(
      { saved: false },
      { status: response.ok ? 200 : response.status === 401 ? 401 : 502 },
    );
  } catch {
    return NextResponse.json({ error: "Unavailable" }, { status: 502 });
  }
}
