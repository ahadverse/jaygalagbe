import { API_URL } from "@/lib/api/config";
import type { Conversation, Message } from "./types";

export async function fetchMyConversations(token: string): Promise<Conversation[]> {
  try {
    const response = await fetch(`${API_URL}/conversations`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
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
    const response = await fetch(`${API_URL}/conversations/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    if (!response.ok) return null;
    return (await response.json()) as Conversation;
  } catch {
    return null;
  }
}

export async function fetchMessages(id: string, token: string): Promise<Message[]> {
  try {
    const response = await fetch(`${API_URL}/conversations/${id}/messages`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    if (!response.ok) return [];
    return (await response.json()) as Message[];
  } catch {
    return [];
  }
}
