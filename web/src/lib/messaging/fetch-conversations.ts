import { apiUrl } from "@/lib/api/config";
import type { Conversation, Message } from "./types";

const authed = (token: string) => ({
  headers: { Authorization: `Bearer ${token}` },
  cache: "no-store" as const,
});

export async function fetchMyConversations(
  token: string,
): Promise<Conversation[]> {
  try {
    const response = await fetch(apiUrl`/conversations`, authed(token));
    if (!response.ok) return [];
    return (await response.json()) as Conversation[];
  } catch {
    return [];
  }
}

export async function fetchConversation(
  id: string,
  token: string,
): Promise<Conversation | null> {
  try {
    const response = await fetch(apiUrl`/conversations/${id}`, authed(token));
    if (!response.ok) return null;
    return (await response.json()) as Conversation;
  } catch {
    return null;
  }
}

export async function fetchMessages(
  id: string,
  token: string,
): Promise<Message[]> {
  try {
    const response = await fetch(
      apiUrl`/conversations/${id}/messages`,
      authed(token),
    );
    if (!response.ok) return [];
    return (await response.json()) as Message[];
  } catch {
    return [];
  }
}
