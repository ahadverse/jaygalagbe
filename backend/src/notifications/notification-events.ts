export enum NotificationEvent {
  AdApproved = 'ad.approved',
  AdRejected = 'ad.rejected',
  MessageReceived = 'message.received',
}

export interface AdApprovedPayload {
  userId: string;
  adId: string;
  adTitle: string;
}

export interface AdRejectedPayload {
  userId: string;
  adId: string;
  adTitle: string;
  reason: string;
}

export interface MessageReceivedPayload {
  userId: string;
  conversationId: string;
  senderId: string;
  body: string;
}
