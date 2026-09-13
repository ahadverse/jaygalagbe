"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { EmptyState, buttonVariants } from "@/components/ui";
import { AdCard } from "@/components/ads/ad-card";
import { AdCardSkeleton } from "@/components/ads/ad-card-skeleton";
import { getSavedAdIds } from "@/lib/ads/saved-ads";
import type { Ad } from "@/lib/ads/types";

export function SavedAdsSection() {
  const [ads, setAds] = useState<Ad[] | null>(null);

  useEffect(() => {
    const ids = getSavedAdIds();
    if (ids.length === 0) {
      queueMicrotask(() => setAds([]));
      return;
    }

    fetch(`/api/ads?ids=${ids.join(",")}`)
      .then((response) => (response.ok ? response.json() : []))
      .then((data: Ad[]) => setAds(data))
      .catch(() => setAds([]));
  }, []);

  if (ads === null) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <AdCardSkeleton key={index} />
        ))}
      </div>
    );
  }

  if (ads.length === 0) {
    return (
      <EmptyState
        compact
        title="Nothing saved yet"
        description="Tap “Save this ad” on any listing and it will be kept here on this device."
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
            <path d="M7 4h10a1 1 0 0 1 1 1v15l-6-4-6 4V5a1 1 0 0 1 1-1Z" />
          </svg>
        }
      />
    );
  }

  return (
    <div className="grid animate-fade-in gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {ads.map((ad) => (
        <AdCard key={ad.id} ad={ad} />
      ))}
    </div>
  );
}
