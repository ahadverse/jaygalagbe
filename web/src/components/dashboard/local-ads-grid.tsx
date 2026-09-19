"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { EmptyState, buttonVariants } from "@/components/ui";
import { AdCard } from "@/components/ads/ad-card";
import { AdCardSkeleton } from "@/components/ads/ad-card-skeleton";
import { useRecentlyViewedIds, useSavedAdIds } from "@/lib/ads/local-lists";
import type { Ad } from "@/lib/ads/types";

type Source = "saved" | "viewed";

const EMPTY_ADS: Ad[] = [];

const COPY: Record<Source, { title: string; description: string }> = {
  saved: {
    title: "Nothing saved yet",
    description:
      "Tap “Save this ad” on any listing and it will be kept here on this device.",
  },
  viewed: {
    title: "Nothing viewed yet",
    description:
      "Listings you open will appear here so you can pick up where you left off.",
  },
};

/**
 * Both lists live in this browser, so the ids are read on the client and the
 * listings themselves fetched through our own route.
 */
export function LocalAdsGrid({
  source,
  limit,
  skeletonCount = 3,
}: {
  source: Source;
  limit?: number;
  skeletonCount?: number;
}) {
  const savedIds = useSavedAdIds();
  const viewedIds = useRecentlyViewedIds();
  const ids = source === "saved" ? savedIds : viewedIds;
  const key = ids.join(",");

  const [fetched, setFetched] = useState<Ad[] | null>(null);
  const ads = key.length === 0 ? EMPTY_ADS : fetched;

  useEffect(() => {
    if (key.length === 0) return;

    let active = true;
    fetch(`/api/ads?ids=${encodeURIComponent(key)}`)
      .then((response) => (response.ok ? response.json() : []))
      .then((data: Ad[]) => {
        if (!active) return;
        // Keep the order the ids are stored in, newest interaction first.
        const byId = new Map(data.map((ad) => [ad.id, ad]));
        setFetched(
          key
            .split(",")
            .map((id) => byId.get(id))
            .filter((ad): ad is Ad => Boolean(ad)),
        );
      })
      .catch(() => {
        if (active) setFetched(EMPTY_ADS);
      });

    return () => {
      active = false;
    };
  }, [key]);

  if (ads === null) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: skeletonCount }).map((_, index) => (
          <AdCardSkeleton key={index} />
        ))}
      </div>
    );
  }

  if (ads.length === 0) {
    return (
      <EmptyState
        compact
        title={COPY[source].title}
        description={COPY[source].description}
        action={
          <Link
            href="/jayga-jomi"
            className={buttonVariants({ variant: "outline", size: "sm" })}
          >
            Browse listings
          </Link>
        }
        icon={
          <svg
            viewBox="0 0 24 24"
            aria-hidden="true"
            className="size-6"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.5}
            strokeLinejoin="round"
          >
            <path
              d={
                source === "saved"
                  ? "M7 4h10a1 1 0 0 1 1 1v15l-6-4-6 4V5a1 1 0 0 1 1-1Z"
                  : "M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Zm9.5 2.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z"
              }
            />
          </svg>
        }
      />
    );
  }

  return (
    <div className="grid animate-fade-in gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {(limit ? ads.slice(0, limit) : ads).map((ad) => (
        <AdCard key={ad.id} ad={ad} />
      ))}
    </div>
  );
}
