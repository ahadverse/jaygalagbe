import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { apiUrl, isValidId } from "@/lib/api/config";
import { getToken } from "@/lib/auth/session";

/**
 * HTTP stand-in for the chat socket, used when the WebSocket cannot connect.
 * The browser never talks to the API directly: these handlers spend the
 * session cookie, so — like the socket-token route — they are same-origin only.
 */

type Context = { params: Promise<{ id: string }> };

const NO_STORE = { "Cache-Control": "no-store, private" };

async function authorize(
  context: Context,
): Promise<
  | { id: string; token: string; error?: undefined }
  | { error: NextResponse }
> {
  const fetchSite = (await headers()).get("sec-fetch-site");
  if (fetchSite && fetchSite !== "same-origin") {
    return { error: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  }
  const { id } = await context.params;
  if (!isValidId(id)) {
    return { error: NextResponse.json({ error: "Not found" }, { status: 404 }) };
  }
  const token = await getToken();
  if (!token) {
    return {
      error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }
  return { id, token };
}

async function relay(response: Response) {
  const text = await response.text();
  return new NextResponse(text || null, {
    status: response.status,
    headers: { "Content-Type": "application/json", ...NO_STORE },
  });
}

const unreachable = () =>
  NextResponse.json({ error: "Couldn't reach the server." }, { status: 502 });

export async function GET(_request: Request, context: Context) {
  const auth = await authorize(context);
  if (auth.error) return auth.error;
  try {
    return await relay(
      await fetch(apiUrl`/conversations/${auth.id}/messages`, {
        headers: { Authorization: `Bearer ${auth.token}` },
        cache: "no-store",
      }),
    );
  } catch {
    return unreachable();
  }
}

export async function POST(request: Request, context: Context) {
  const auth = await authorize(context);
  if (auth.error) return auth.error;

  const payload = (await request.json().catch(() => null)) as {
    body?: unknown;
  } | null;
  const body = typeof payload?.body === "string" ? payload.body.trim() : "";
  if (!body) {
    return NextResponse.json({ error: "Write a message first." }, { status: 400 });
  }

  try {
    return await relay(
      await fetch(apiUrl`/conversations/${auth.id}/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${auth.token}`,
        },
        body: JSON.stringify({ body }),
        cache: "no-store",
      }),
    );
  } catch {
    return unreachable();
  }
}

/** Marks the thread read for the current user. */
export async function PATCH(_request: Request, context: Context) {
  const auth = await authorize(context);
  if (auth.error) return auth.error;
  try {
    return await relay(
      await fetch(apiUrl`/conversations/${auth.id}/read`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${auth.token}` },
        cache: "no-store",
      }),
    );
  } catch {
    return unreachable();
  }
}
