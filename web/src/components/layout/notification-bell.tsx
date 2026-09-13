"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useNotifications } from "@/lib/notifications/use-notifications";

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const { entries, unread, clearUnread } = useNotifications(true);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => {
          setOpen((value) => !value);
          clearUnread();
        }}
        aria-label="Notifications"
        aria-expanded={open}
        className="relative inline-flex size-10 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.75}
          className="h-5 w-5"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"
          />
          <path strokeLinecap="round" strokeLinejoin="round" d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
        {unread > 0 && (
          <span className="numeric absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 text-[10px] font-bold text-accent-foreground ring-2 ring-background">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-2 w-80 max-w-[calc(100vw-2rem)] animate-slide-down overflow-hidden rounded-xl bg-card shadow-lg ring-1 ring-neutral-900/10">
          <p className="eyebrow border-b border-border px-4 py-3 text-subtle-foreground">
            Notifications
          </p>
          {entries.length === 0 ? (
            <p className="px-4 py-6 text-center text-sm text-muted-foreground">
              Nothing new right now.
            </p>
          ) : (
            <ul className="flex max-h-96 flex-col overflow-y-auto p-1.5">
              {entries.map((entry) => (
                <li key={entry.id}>
                  <Link
                    href={entry.href}
                    onClick={() => setOpen(false)}
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
        </div>
      )}
    </div>
  );
}
