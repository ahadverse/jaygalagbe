"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { API_URL, apiUrl, isValidId } from "@/lib/api/config";
import { SESSION_COOKIE } from "./session";
import { safeRedirectPath } from "./safe-redirect";

export type AuthFormState = { error?: string };

const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days, matches backend JWT_EXPIRES_IN default

function splitIdentifier(identifier: string): { email?: string; phone?: string } {
  const trimmed = identifier.trim();
  return trimmed.includes("@") ? { email: trimmed } : { phone: trimmed };
}

async function setSessionCookie(token: string) {
  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
}

async function logConversionIfFromAd(
  from: string,
  visitId: string | null,
  token: string,
) {
  const adId = from.match(/^\/ads\/([^/?#]+)/)?.[1];
  if (!isValidId(adId)) return;

  try {
    await fetch(apiUrl`/ads/${adId}/conversions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(isValidId(visitId) ? { visitId } : {}),
    });
  } catch {
    // Conversion tracking is best-effort; never block the auth flow on it.
  }
}

function extractErrorMessage(body: unknown, fallback: string): string {
  if (body && typeof body === "object" && "message" in body) {
    const message = (body as { message?: unknown }).message;
    if (Array.isArray(message) && typeof message[0] === "string") {
      return message[0];
    }
    if (typeof message === "string") {
      return message;
    }
  }
  return fallback;
}

export async function loginAction(
  _prevState: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const identifier = String(formData.get("identifier") ?? "");
  const password = String(formData.get("password") ?? "");
  const from = safeRedirectPath(formData.get("from")?.toString());
  const visitId = formData.get("visitId")?.toString() ?? null;

  if (!identifier || !password) {
    return { error: "Enter your email or phone and password." };
  }

  let token: string;
  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...splitIdentifier(identifier), password }),
    });

    if (!response.ok) {
      const body = await response.json().catch(() => null);
      return { error: extractErrorMessage(body, "Invalid credentials.") };
    }

    const data = (await response.json()) as { accessToken: string };
    token = data.accessToken;
  } catch {
    return { error: "Couldn't reach the server. Please try again." };
  }

  await setSessionCookie(token);
  await logConversionIfFromAd(from, visitId, token);
  redirect(from);
}

export async function registerAction(
  _prevState: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const name = String(formData.get("name") ?? "");
  const identifier = String(formData.get("identifier") ?? "");
  const password = String(formData.get("password") ?? "");
  const from = safeRedirectPath(formData.get("from")?.toString());
  const visitId = formData.get("visitId")?.toString() ?? null;

  if (!name || !identifier || !password) {
    return { error: "Fill in your name, email or phone, and password." };
  }

  let token: string;
  try {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, ...splitIdentifier(identifier), password }),
    });

    if (!response.ok) {
      const body = await response.json().catch(() => null);
      return { error: extractErrorMessage(body, "Couldn't create your account.") };
    }

    const data = (await response.json()) as { accessToken: string };
    token = data.accessToken;
  } catch {
    return { error: "Couldn't reach the server. Please try again." };
  }

  await setSessionCookie(token);
  await logConversionIfFromAd(from, visitId, token);
  redirect(from);
}

export async function logoutAction() {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
  redirect("/");
}
