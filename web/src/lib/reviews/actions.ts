"use server";

import { revalidatePath } from "next/cache";
import { API_URL } from "@/lib/api/config";
import { getToken } from "@/lib/auth/session";

export type ReviewFormState = { error?: string; success?: boolean };

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

export async function upsertReviewAction(
  _prevState: ReviewFormState,
  formData: FormData,
): Promise<ReviewFormState> {
  const advertiserId = String(formData.get("advertiserId") ?? "");
  const rating = Number(formData.get("rating"));
  const comment = String(formData.get("comment") ?? "").trim();

  if (!advertiserId || !rating) {
    return { error: "Choose a rating before submitting." };
  }

  const token = await getToken();
  if (!token) {
    return { error: "You need to be logged in to leave a review." };
  }

  try {
    const response = await fetch(`${API_URL}/advertisers/${advertiserId}/reviews`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ rating, comment: comment || undefined }),
    });
    if (!response.ok) {
      const errBody = await response.json().catch(() => null);
      return { error: extractErrorMessage(errBody, "Couldn't save your review.") };
    }
  } catch {
    return { error: "Couldn't reach the server. Please try again." };
  }

  revalidatePath("/dashboard");
  return { success: true };
}
