"use server";

import { revalidatePath } from "next/cache";
import { API_URL } from "@/lib/api/config";
import { getToken } from "@/lib/auth/session";

export type SendMessageState = { error?: string; success?: boolean };

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

export async function sendFirstMessageAction(
  _prevState: SendMessageState,
  formData: FormData,
): Promise<SendMessageState> {
  const adId = String(formData.get("adId") ?? "");
  const body = String(formData.get("body") ?? "").trim();

  if (!adId || !body) {
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
    const convoResponse = await fetch(`${API_URL}/conversations`, {
      method: "POST",
      headers: authHeaders,
      body: JSON.stringify({ adId }),
    });
    if (!convoResponse.ok) {
      const errBody = await convoResponse.json().catch(() => null);
      return { error: extractErrorMessage(errBody, "Couldn't start the conversation.") };
    }
    const conversation = (await convoResponse.json()) as { id: string };

    const messageResponse = await fetch(
      `${API_URL}/conversations/${conversation.id}/messages`,
      {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify({ body }),
      },
    );
    if (!messageResponse.ok) {
      const errBody = await messageResponse.json().catch(() => null);
      return { error: extractErrorMessage(errBody, "Couldn't send the message.") };
    }

    return { success: true };
  } catch {
    return { error: "Couldn't reach the server. Please try again." };
  }
}

export async function replyToConversationAction(
  _prevState: SendMessageState,
  formData: FormData,
): Promise<SendMessageState> {
  const conversationId = String(formData.get("conversationId") ?? "");
  const body = String(formData.get("body") ?? "").trim();

  if (!conversationId || !body) {
    return { error: "Write a message before sending." };
  }

  const token = await getToken();
  if (!token) {
    return { error: "You need to be logged in to send a message." };
  }

  try {
    const response = await fetch(
      `${API_URL}/conversations/${conversationId}/messages`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ body }),
      },
    );
    if (!response.ok) {
      const errBody = await response.json().catch(() => null);
      return { error: extractErrorMessage(errBody, "Couldn't send the message.") };
    }
  } catch {
    return { error: "Couldn't reach the server. Please try again." };
  }

  revalidatePath(`/dashboard/messages/${conversationId}`);
  return { success: true };
}
