import type { ToastVariant } from "@/components/ui/toast";
import type { AppNotification } from "./types";

export type FormattedNotification = {
  title: string;
  description: string;
  href: string;
  variant: ToastVariant;
};

export function formatNotification(notification: AppNotification): FormattedNotification {
  switch (notification.type) {
    case "ad.approved":
      return {
        title: "Ad approved",
        description: notification.adTitle,
        href: `/ads/${notification.adId}`,
        variant: "success",
      };
    case "ad.rejected":
      return {
        title: "Ad rejected",
        description: `${notification.adTitle} — ${notification.reason}`,
        href: `/dashboard/ads/${notification.adId}/edit`,
        variant: "danger",
      };
    case "message.received":
      return {
        // The sender's name is the useful part — "New message" told you
        // nothing you could not already see from the badge. Older clients
        // may still be on a payload without it.
        title: notification.senderName?.trim() || "New message",
        description: notification.body,
        href: `/dashboard/messages/${notification.conversationId}`,
        variant: "info",
      };
  }
}
