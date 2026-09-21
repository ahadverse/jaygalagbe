"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

/**
 * Shared shell for the header's bell and message buttons: the trigger, the
 * unread badge, and a panel that closes on outside click or Escape.
 */
export function HeaderPopover({
  label,
  icon,
  unread,
  onOpen,
  children,
}: {
  label: string;
  icon: ReactNode;
  unread: number;
  onOpen?: () => void;
  children: (close: () => void) => ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    function handlePointerDown(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => {
          setOpen((value) => {
            if (!value) onOpen?.();
            return !value;
          });
        }}
        aria-label={
          unread > 0 ? `${label} — ${unread} unread` : label
        }
        aria-expanded={open}
        aria-haspopup="menu"
        className="relative inline-flex size-10 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
      >
        {icon}
        {unread > 0 && (
          <span className="numeric absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 text-[10px] font-bold text-accent-foreground ring-2 ring-background">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 z-50 mt-2 w-80 max-w-[calc(100vw-2rem)] animate-slide-down overflow-hidden rounded-xl bg-card shadow-lg ring-1 ring-neutral-900/10"
        >
          {children(() => setOpen(false))}
        </div>
      )}
    </div>
  );
}
