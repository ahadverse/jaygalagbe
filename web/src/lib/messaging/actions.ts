"use server";

import { apiUrl, isValidId } from "@/lib/api/config";
import { readError } from "@/lib/api/errors";
import { getToken } from "@/lib/auth/session";

export type SendMessageState = { error?: string; success?: boolean };

export async function sendFirstMessageAction(
  _prevState: SendMessageState,
  formData: FormData,
): Promise<SendMessageState> {
  const adId = formData.get("adId")?.toString();
  const body = String(formData.get("body") ?? "").trim();

  if (!isValidId(adId) || !body) {
    return { error: "Write a message before sending." };
  }

  const token = await getToken();
  if (!token) {
    return { error: "You need to be logged in to send a message." };
  }

  const authHeaders = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };

  try {
    const convoResponse = await fetch(apiUrl`/conversations`, {
      method: "POST",
      headers: authHeaders,
      body: JSON.stringify({ adId }),
    });
    if (!convoResponse.ok) {
      return {
        error: await readError(
          convoResponse,
          "Couldn't start the conversation.",
        ),
      };
    }
    const conversation = (await convoResponse.json()) as { id: string };

    const messageResponse = await fetch(
      apiUrl`/conversations/${conversation.id}/messages`,
      { method: "POST", headers: authHeaders, body: JSON.stringify({ body }) },
    );
    if (!messageResponse.ok) {
      return {
        error: await readError(messageResponse, "Couldn't send the message."),
      };
    }

    return { success: true };
  } catch {
    return { error: "Couldn't reach the server. Please try again." };
  }
}
