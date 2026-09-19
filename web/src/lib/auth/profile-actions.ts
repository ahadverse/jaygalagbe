"use server";

import { revalidatePath } from "next/cache";
import { apiUrl } from "@/lib/api/config";
import { readError } from "@/lib/api/errors";
import { getToken } from "./session";

export type ProfileFormState = { error?: string; success?: boolean };

export async function updateProfileAction(
  _prevState: ProfileFormState,
  formData: FormData,
): Promise<ProfileFormState> {
  const token = await getToken();
  if (!token) {
    return { error: "You need to be logged in." };
  }

  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();

  if (name.length < 2) {
    return { error: "Enter your full name." };
  }
  if (!email && !phone) {
    return { error: "Keep at least an email or a phone number on file." };
  }

  try {
    const response = await fetch(apiUrl`/users/me`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        name,
        email: email || undefined,
        phone: phone || undefined,
      }),
    });
    if (!response.ok) {
      return { error: await readError(response, "Couldn't save your profile.") };
    }
  } catch {
    return { error: "Couldn't reach the server. Please try again." };
  }

  revalidatePath("/dashboard/settings");
  return { success: true };
}
