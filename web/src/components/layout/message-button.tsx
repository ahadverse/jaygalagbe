"use client";

import Link from "next/link";
import { useRealtime } from "@/lib/notifications/realtime-provider";

/**
 * Straight to the inbox — no dropdown. A message needs the full thread to be
 * worth anything, so a preview panel would only add a click on the way there.
 */
export function MessageButton() {
  const { unreadMessages, markMessagesSeen } = useRealtime();

  return (
    <Link
      href="/dashboard/messages"
      onClick={markMessagesSeen}
      aria-label={
        unreadMessages > 0
          ? `Messages — ${unreadMessages} unread`
          : "Messages"
      }
      className="relative inline-flex size-10 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.75}
        strokeLinejoin="round"
        className="h-5 w-5"
        aria-hidden="true"
      >
        <path d="M4 6.5A2.5 2.5 0 0 1 6.5 4h11A2.5 2.5 0 0 1 20 6.5v7a2.5 2.5 0 0 1-2.5 2.5H10l-4.5 4v-4A1.5 1.5 0 0 1 4 14.5v-8Z" />
      </svg>
      {unreadMessages > 0 && (
        <span className="numeric absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 text-[10px] font-bold text-accent-foreground ring-2 ring-background">
          {unreadMessages > 9 ? "9+" : unreadMessages}
        </span>
      )}
    </Link>
  );
}
