export type ConversationParty = { id: string; name: string };

export type ConversationAdSummary = {
  id: string;
  title: string;
  photos: string[];
  sector: "LAND" | "HOUSE_RENT";
};

export type Message = {
  id: string;
  conversationId: string;
  senderId: string;
  body: string;
  deliveredAt: string | null;
  readAt: string | null;
  createdAt: string;
};

export type Conversation = {
  id: string;
  adId: string;
  ad: ConversationAdSummary;
  customerId: string;
  customer: ConversationParty;
  advertiserId: string;
  advertiser: ConversationParty;
  createdAt: string;
  updatedAt: string;
  messages?: Message[];
};
