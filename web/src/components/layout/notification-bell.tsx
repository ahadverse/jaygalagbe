"use client";

import Link from "next/link";
import { HeaderPopover } from "@/components/layout/header-popover";
import { useRealtime } from "@/lib/notifications/realtime-provider";

const BellIcon = (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.75}
    className="h-5 w-5"
    aria-hidden="true"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M13.73 21a2 2 0 0 1-3.46 0"
    />
  </svg>
);

const SoundOnIcon = (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.75}
    strokeLinecap="round"
    strokeLinejoin="round"
    className="size-4"
    aria-hidden="true"
  >
    <path d="M11 5 6.5 9H3v6h3.5L11 19V5Z" />
    <path d="M15.5 9.5a3.5 3.5 0 0 1 0 5M18 7a7 7 0 0 1 0 10" />
  </svg>
);

const SoundOffIcon = (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.75}
    strokeLinecap="round"
    strokeLinejoin="round"
    className="size-4"
    aria-hidden="true"
  >
    <path d="M11 5 6.5 9H3v6h3.5L11 19V5Z" />
    <path d="m16 10 4 4M20 10l-4 4" />
  </svg>
);

/** Account activity only — messages have their own button beside this one. */
export function NotificationBell() {
  const {
    notifications,
    unreadNotifications,
    markNotificationsSeen,
    soundMuted,
    toggleSound,
  } = useRealtime();

  return (
    <HeaderPopover
      label="Notifications"
      icon={BellIcon}
      unread={unreadNotifications}
      onOpen={markNotificationsSeen}
    >
      {(close) => (
        <>
          <p className="eyebrow border-b border-border px-4 py-3 text-subtle-foreground">
            Notifications
          </p>
          {notifications.length === 0 ? (
            <p className="px-4 py-6 text-center text-sm text-muted-foreground">
              Nothing new right now.
            </p>
          ) : (
            <ul className="flex max-h-96 flex-col overflow-y-auto p-1.5">
              {notifications.map((entry) => (
                <li key={entry.id}>
                  <Link
                    href={entry.href}
                    onClick={close}
                    className="flex flex-col gap-0.5 rounded-lg px-3 py-2.5 transition-colors hover:bg-muted"
                  >
                    <span className="text-sm font-semibold text-foreground">
                      {entry.title}
                    </span>
                    <span className="line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                      {entry.description}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}

          <button
            type="button"
            onClick={toggleSound}
            aria-pressed={!soundMuted}
            className="flex w-full items-center justify-between gap-2 border-t border-border px-4 py-2.5 text-left text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <span className="inline-flex items-center gap-2">
              {soundMuted ? SoundOffIcon : SoundOnIcon}
              Message sound
            </span>
            <span
              className={
                soundMuted ? "text-subtle-foreground" : "text-success-600"
              }
            >
              {soundMuted ? "Off" : "On"}
            </span>
          </button>
        </>
      )}
    </HeaderPopover>
  );
}
