"use server";

import { revalidatePath } from "next/cache";
import { apiUrl, isValidId } from "@/lib/api/config";
import { readError } from "@/lib/api/errors";
import { getToken } from "@/lib/auth/session";

export type ReviewFormState = { error?: string; success?: boolean };

export async function upsertReviewAction(
  _prevState: ReviewFormState,
  formData: FormData,
): Promise<ReviewFormState> {
  const advertiserId = formData.get("advertiserId")?.toString();
  const rating = Number(formData.get("rating"));
  const comment = String(formData.get("comment") ?? "").trim();

  if (!isValidId(advertiserId) || !rating) {
    return { error: "Choose a rating before submitting." };
  }

  const token = await getToken();
  if (!token) {
    return { error: "You need to be logged in to leave a review." };
  }

  try {
    const response = await fetch(apiUrl`/advertisers/${advertiserId}/reviews`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ rating, comment: comment || undefined }),
    });
    if (!response.ok) {
      return { error: await readError(response, "Couldn't save your review.") };
    }
  } catch {
    return { error: "Couldn't reach the server. Please try again." };
  }

  revalidatePath("/dashboard/reviews");
  return { success: true };
}
