"use server";

import { apiUrl, isValidId } from "@/lib/api/config";
import { readError } from "@/lib/api/errors";
import { getToken } from "@/lib/auth/session";

export type RevealPhoneResult = { phone?: string; error?: string };

export async function revealPhoneAction(
  adId: string,
): Promise<RevealPhoneResult> {
  if (!isValidId(adId)) {
    return { error: "Couldn't load the phone number." };
  }

  const token = await getToken();
  if (!token) {
    return { error: "Log in to see the phone number." };
  }

  try {
    const response = await fetch(apiUrl`/ads/${adId}/phone`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    if (!response.ok) {
      return { error: await readError(response, "Couldn't load the phone number.") };
    }
    const { phone } = (await response.json()) as { phone: string };
    return { phone };
  } catch {
    return { error: "Couldn't reach the server. Please try again." };
  }
}
