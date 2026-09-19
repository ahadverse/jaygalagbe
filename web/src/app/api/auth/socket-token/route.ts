import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { getToken } from "@/lib/auth/session";

/**
 * Hands the session token to our own socket client. It is the one place the
 * httpOnly cookie is unwrapped, so it only answers same-origin requests and is
 * never cached anywhere.
 */
export async function GET() {
  const headerList = await headers();

  const fetchSite = headerList.get("sec-fetch-site");
  if (fetchSite && fetchSite !== "same-origin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const origin = headerList.get("origin");
  const host = headerList.get("host");
  if (origin && host) {
    let originHost: string;
    try {
      originHost = new URL(origin).host;
    } catch {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    if (originHost !== host) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  }

  const token = await getToken();
  if (!token) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  return NextResponse.json(
    { token },
    { headers: { "Cache-Control": "no-store, private" } },
  );
}
