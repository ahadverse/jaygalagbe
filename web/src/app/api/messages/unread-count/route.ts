import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { apiUrl } from "@/lib/api/config";
import { getToken } from "@/lib/auth/session";

/**
 * Seeds the header's message badge on load — the socket only reports messages
 * that arrive while the tab is open, so without this the badge would read zero
 * until someone messaged you mid-session.
 *
 * Same-origin only, like the socket-token route: it spends the session cookie.
 */
export async function GET() {
  const headerList = await headers();

  const fetchSite = headerList.get("sec-fetch-site");
  if (fetchSite && fetchSite !== "same-origin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const token = await getToken();
  if (!token) {
    return NextResponse.json({ messages: 0, conversations: 0 });
  }

  try {
    const response = await fetch(apiUrl`/conversations/unread-count`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    if (!response.ok) {
      return NextResponse.json({ messages: 0, conversations: 0 });
    }

    const data = (await response.json()) as {
      messages: number;
      conversations: number;
    };
    return NextResponse.json(data, {
      headers: { "Cache-Control": "no-store, private" },
    });
  } catch {
    // The badge is an enhancement; a backend blip should not break the header.
    return NextResponse.json({ messages: 0, conversations: 0 });
  }
}
