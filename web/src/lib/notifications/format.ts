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
        title: "New message",
        description: notification.body,
        href: `/dashboard/messages/${notification.conversationId}`,
        variant: "info",
      };
  }
}
