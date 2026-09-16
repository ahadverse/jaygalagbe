export enum MessagingEvent {
  MessageCreated = 'messaging.message.created',
}

export interface MessageCreatedPayload {
  conversationId: string;
  message: {
    id: string;
    conversationId: string;
    senderId: string;
    body: string;
    createdAt: Date;
    deliveredAt: Date | null;
    readAt: Date | null;
    sender: { id: string; name: string };
  };
}
