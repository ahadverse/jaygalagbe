"use client";

import { StatCard } from "./stat-card";
import { DashboardIcon } from "./icons";
import { useRecentlyViewedIds } from "@/lib/ads/local-lists";
import { useSavedAds } from "@/lib/ads/saved-ads";

/** Counts read on the client, so they render after hydration. */
export function BrowsingStats() {
  const saved = useSavedAds().savedIds.length;
  const viewed = useRecentlyViewedIds().length;

  return (
    <>
      <StatCard
        label="Saved"
        value={saved.toLocaleString()}
        hint="Synced to your account"
        tone="info"
        icon={
          <svg
            viewBox="0 0 24 24"
            aria-hidden="true"
            className="size-4"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.7}
            strokeLinejoin="round"
          >
            <path d="M7 4h10a1 1 0 0 1 1 1v15l-6-4-6 4V5a1 1 0 0 1 1-1Z" />
          </svg>
        }
      />
      <StatCard
        label="Recently viewed"
        value={viewed.toLocaleString()}
        hint="Listings you opened"
        icon={<DashboardIcon name="eye" />}
      />
    </>
  );
}
