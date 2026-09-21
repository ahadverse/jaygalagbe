import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { apiUrl } from "@/lib/api/config";
import { getToken } from "@/lib/auth/session";

/**
 * Forwards the photo batch to the API with the session token attached.
 *
 * The browser cannot call the API directly because the token lives in an
 * httpOnly cookie, so this is the same same-origin proxy shape as the other
 * authenticated client routes.
 */
export async function POST(request: Request) {
  const headerList = await headers();

  const fetchSite = headerList.get("sec-fetch-site");
  if (fetchSite && fetchSite !== "same-origin") {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  const token = await getToken();
  if (!token) {
    return NextResponse.json(
      { message: "Sign in again to upload photos." },
      { status: 401 },
    );
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json(
      { message: "That upload could not be read." },
      { status: 400 },
    );
  }

  try {
    // The multipart body is rebuilt rather than streamed through, so `fetch`
    // sets its own boundary — forwarding the original Content-Type header
    // with a mismatched boundary is the classic way this breaks.
    const response = await fetch(apiUrl`/uploads/ad-photos`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: form,
      cache: "no-store",
    });

    const body: unknown = await response.json().catch(() => null);
    return NextResponse.json(body ?? { message: "Upload failed." }, {
      status: response.status,
      headers: { "Cache-Control": "no-store, private" },
    });
  } catch {
    return NextResponse.json(
      { message: "Could not reach the server. Please try again." },
      { status: 502 },
    );
  }
}
