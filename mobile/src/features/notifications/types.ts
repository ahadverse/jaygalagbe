export type AdApprovedNotification = {
  type: 'ad.approved';
  userId: string;
  adId: string;
  adTitle: string;
};

export type AdRejectedNotification = {
  type: 'ad.rejected';
  userId: string;
  adId: string;
  adTitle: string;
  reason: string;
};

export type MessageReceivedNotification = {
  type: 'message.received';
  userId: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  body: string;
};

// The full set emitted by backend/src/notifications/notifications.gateway.ts
// today - all three funnel through one socket event, `notification`.
export type NotificationPayload =
  AdApprovedNotification | AdRejectedNotification | MessageReceivedNotification;

// message.received never becomes an activity entry - it only bumps the
// Messages tab's unread count (see notifications-context.tsx) - so the
// activity list's type excludes it rather than every reader needing to
// narrow the full union.
export type AccountActivityPayload =
  AdApprovedNotification | AdRejectedNotification;

export type NotificationEntry = AccountActivityPayload & {
  id: string;
  receivedAt: number;
};
