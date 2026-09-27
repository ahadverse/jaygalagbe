import type { Sector } from '../ads/sectors';

export type ConversationParty = { id: string; name: string };

// Mirrors backend's conversationSummaryInclude (messaging.controller.ts).
export type Conversation = {
  id: string;
  adId: string;
  customerId: string;
  advertiserId: string;
  createdAt: string;
  updatedAt: string;
  ad: { id: string; title: string; photos: string[]; sector: Sector };
  customer: ConversationParty;
  advertiser: ConversationParty;
  /** Only present on GET /conversations - the single most recent message. */
  messages?: Message[];
};

export type Message = {
  id: string;
  conversationId: string;
  senderId: string;
  body: string;
  createdAt: string;
  deliveredAt: string | null;
  readAt: string | null;
  /** Only present on the socket's `message:new` event, not REST responses. */
  sender?: ConversationParty;
};

export type UnreadCount = { messages: number; conversations: number };
