"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { EmptyState, buttonVariants } from "@/components/ui";
import { AdCard } from "@/components/ads/ad-card";
import { AdCardSkeleton } from "@/components/ads/ad-card-skeleton";
import { useRecentlyViewedIds } from "@/lib/ads/local-lists";
import { useSavedAds } from "@/lib/ads/saved-ads";
import type { Ad } from "@/lib/ads/types";

type Source = "saved" | "viewed";

const EMPTY_ADS: Ad[] = [];

const COPY: Record<Source, { title: string; description: string }> = {
  saved: {
    title: "Nothing saved yet",
    description:
      "Tap “Save this ad” on any listing and it will be kept here, on every device you sign in on.",
  },
  viewed: {
    title: "Nothing viewed yet",
    description:
      "Listings you open will appear here so you can pick up where you left off.",
  },
};

/**
 * Saved listings come from the account (through our own route); recently
 * viewed stays in this browser, so those ids are read on the client and the
 * listings fetched through the ids route.
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
  return source === "saved" ? (
    <SavedGrid limit={limit} skeletonCount={skeletonCount} />
  ) : (
    <ViewedGrid limit={limit} skeletonCount={skeletonCount} />
  );
}

type GridProps = { limit?: number; skeletonCount: number };

function SavedGrid({ limit, skeletonCount }: GridProps) {
  const { status, ids } = useSavedAds();
  const key = ids.join(",");
  const [fetched, setFetched] = useState<Ad[] | null>(null);
  const ads =
    status === "loading" ? null : status === "guest" ? EMPTY_ADS : fetched;

  useEffect(() => {
    if (status !== "user") return;

    let active = true;
    fetch(`/api/saved-ads?view=list&limit=${limit ?? 50}`)
      .then((response) => (response.ok ? response.json() : { data: [] }))
      .then((body: { data: Ad[] }) => {
        if (active) setFetched(body.data);
      })
      .catch(() => {
        if (active) setFetched(EMPTY_ADS);
      });

    return () => {
      active = false;
    };
    // key: refetch when the saved set changes (e.g. after the guest import).
  }, [status, key, limit]);

  return (
    <AdsGrid ads={ads} source="saved" limit={limit} skeletonCount={skeletonCount} />
  );
}

function ViewedGrid({ limit, skeletonCount }: GridProps) {
  const ids = useRecentlyViewedIds();
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

  return (
    <AdsGrid ads={ads} source="viewed" limit={limit} skeletonCount={skeletonCount} />
  );
}

function AdsGrid({
  ads,
  source,
  limit,
  skeletonCount,
}: GridProps & { ads: Ad[] | null; source: Source }) {
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
