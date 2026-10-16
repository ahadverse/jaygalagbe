"use client";

import { useEffect, useRef, useState, type FocusEvent } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { sectorConfigs } from "@/lib/ads/sectors";

const menus = [
  { label: "For Sale", slug: "jayga-jomi" },
  { label: "For Rent", slug: "basha-bhara" },
] as const;

// Matches the panel's own width class below — used to predict, before the
// panel has rendered, whether left-aligning it would run it off the edge of
// the viewport. Computing this from the trigger button's position (known
// immediately) rather than the panel's (known only after paint) means the
// correct side is picked in the very first frame, with no visible flip.
const PANEL_WIDTH = 384;
const VIEWPORT_MARGIN = 16;
const CLOSE_DELAY = 150;

function MegaMenuItem({ label, slug }: { label: string; slug: string }) {
  const items = sectorConfigs[slug].propertyTypes;
  const [open, setOpen] = useState(false);
  const [align, setAlign] = useState<"left" | "right">("left");
  const containerRef = useRef<HTMLDivElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function clearCloseTimer() {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  }

  function openMenu() {
    clearCloseTimer();
    const rect = containerRef.current?.getBoundingClientRect();
    if (rect) {
      const overflowsRight = rect.left + PANEL_WIDTH > window.innerWidth - VIEWPORT_MARGIN;
      setAlign(overflowsRight ? "right" : "left");
    }
    setOpen(true);
  }

  // A short delay survives the gap between the button and the panel — move
  // the cursor diagonally and it would otherwise cross neither element and
  // close the menu before it reaches the list.
  function scheduleClose() {
    clearCloseTimer();
    closeTimer.current = setTimeout(() => setOpen(false), CLOSE_DELAY);
  }

  function closeNow() {
    clearCloseTimer();
    setOpen(false);
  }

  function onBlur(event: FocusEvent<HTMLDivElement>) {
    if (!containerRef.current?.contains(event.relatedTarget as Node)) {
      closeNow();
    }
  }

  useEffect(() => {
    if (!open) return;
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") closeNow();
    }
    function onClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        closeNow();
      }
    }
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onClickOutside);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onClickOutside);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => () => clearCloseTimer(), []);

  return (
    <div
      ref={containerRef}
      className="relative"
      onMouseEnter={openMenu}
      onMouseLeave={scheduleClose}
      onFocus={openMenu}
      onBlur={onBlur}
    >
      <button
        type="button"
        onClick={() => (open ? closeNow() : openMenu())}
        aria-expanded={open}
        aria-haspopup="true"
        className={cn(
          "flex items-center gap-1 rounded-full px-3.5 py-2 text-sm font-medium text-muted-foreground transition-colors duration-150 hover:bg-muted hover:text-foreground",
          open && "bg-muted text-foreground",
        )}
      >
        {label}
        <svg
          viewBox="0 0 20 20"
          aria-hidden="true"
          className={cn("size-3.5 transition-transform duration-150", open && "rotate-180")}
        >
          <path
            d="m6 8.5 4 4 4-4"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {open && (
        <div
          className={cn(
            "absolute top-full z-30 w-[min(24rem,calc(100vw-2rem))] animate-slide-down pt-2",
            align === "left" ? "left-0" : "right-0",
          )}
        >
          <div className="overflow-hidden rounded-2xl bg-card shadow-lg ring-1 ring-neutral-900/5">
            <Link
              href={`/${slug}`}
              onClick={closeNow}
              className="flex items-center justify-between gap-2 bg-brand-50 px-5 py-3 text-sm font-semibold text-brand-700 transition-colors hover:bg-brand-100"
            >
              All {label.toLowerCase()} listings
              <svg viewBox="0 0 20 20" aria-hidden="true" className="size-3.5 shrink-0">
                <path
                  d="m8 5 5 5-5 5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </Link>

            <div className="p-3">
              <p className="eyebrow px-2 pb-1.5 text-subtle-foreground">Browse by category</p>
              <div className="grid grid-cols-2 gap-x-1 gap-y-0.5">
                {items.map((item) => (
                  <Link
                    key={item}
                    href={`/${slug}?propertyType=${encodeURIComponent(item)}`}
                    onClick={closeNow}
                    className="rounded-lg px-2.5 py-2 text-sm leading-snug text-foreground transition-colors hover:bg-muted"
                  >
                    {item}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/** "For Sale" / "For Rent" in the header nav, each opening on hover (and on
 * click or keyboard focus, for touch and keyboard users) into a panel of the
 * sector's property-type categories — the same list the post-ad form and the
 * browse filters use, so every link here actually matches listings. */
export function MegaNav() {
  return (
    <>
      {menus.map((menu) => (
        <MegaMenuItem key={menu.slug} label={menu.label} slug={menu.slug} />
      ))}
    </>
  );
}
