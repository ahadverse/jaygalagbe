"use server";

import { API_URL } from "@/lib/api/config";
import { readError } from "@/lib/api/errors";

export type ContactFormState = { error?: string; success?: boolean };

export async function sendContactMessageAction(
  _prevState: ContactFormState,
  formData: FormData,
): Promise<ContactFormState> {
  const field = (name: string) => String(formData.get(name) ?? "").trim();

  const name = field("name");
  const email = field("email");
  const phone = field("phone");
  const topic = field("topic");
  const message = field("message");

  if (name.length < 2) return { error: "Please enter your name." };
  if (!email && !phone) {
    return { error: "Add an email or phone number so we can reply." };
  }
  if (message.length < 10) {
    return {
      error: "Please write a little more so we can help (10+ characters).",
    };
  }

  try {
    const response = await fetch(`${API_URL}/contact`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        email: email || undefined,
        phone: phone || undefined,
        topic,
        message,
      }),
    });
    if (!response.ok) {
      if (response.status === 429) {
        return { error: "Too many messages sent. Please try again later." };
      }
      return { error: await readError(response, "Couldn't send your message.") };
    }
  } catch {
    return { error: "Couldn't reach the server. Please try again." };
  }

  return { success: true };
}
