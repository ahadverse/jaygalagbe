import { apiGet, apiPatch, apiPost } from '../../api/client';
import type { Conversation, Message, UnreadCount } from './types';

/** Idempotent: upserts on (ad, customer, advertiser), so this doubles as "get or create". */
export function startConversation(adId: string): Promise<Conversation> {
  return apiPost<Conversation>('/conversations', { adId });
}

export function getMyConversations(): Promise<Conversation[]> {
  return apiGet<Conversation[]>('/conversations');
}

export function getConversation(id: string): Promise<Conversation> {
  return apiGet<Conversation>(`/conversations/${id}`);
}

export function getMessages(conversationId: string): Promise<Message[]> {
  return apiGet<Message[]>(`/conversations/${conversationId}/messages`);
}

export function sendMessageRest(
  conversationId: string,
  body: string,
): Promise<Message> {
  return apiPost<Message>(`/conversations/${conversationId}/messages`, {
    body,
  });
}

export function markConversationRead(conversationId: string): Promise<void> {
  return apiPatch<void>(`/conversations/${conversationId}/read`);
}

export function getUnreadCount(): Promise<UnreadCount> {
  return apiGet<UnreadCount>('/conversations/unread-count');
}
