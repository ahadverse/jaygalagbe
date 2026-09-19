import { cookies } from "next/headers";
import { apiUrl } from "@/lib/api/config";
import type { AuthUser } from "./types";

export const SESSION_COOKIE = "jl_token";

export async function getToken(): Promise<string | undefined> {
  const store = await cookies();
  return store.get(SESSION_COOKIE)?.value;
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  const token = await getToken();
  if (!token) return null;

  try {
    const response = await fetch(apiUrl`/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    if (!response.ok) return null;
    return (await response.json()) as AuthUser;
  } catch {
    return null;
  }
}
