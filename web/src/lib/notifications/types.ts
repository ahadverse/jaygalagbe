export type AppNotification =
  | { type: "ad.approved"; userId: string; adId: string; adTitle: string }
  | {
      type: "ad.rejected";
      userId: string;
      adId: string;
      adTitle: string;
      reason: string;
    }
  | {
      type: "message.received";
      userId: string;
      conversationId: string;
      senderId: string;
      senderName: string;
      body: string;
    };
