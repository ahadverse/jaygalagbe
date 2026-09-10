"use client";

import { useEffect, useState } from "react";
import { AdCard } from "@/components/ads/ad-card";
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
    return <p className="text-sm text-muted-foreground">Loading saved ads…</p>;
  }

  if (ads.length === 0) {
    return (
      <p className="rounded-lg border border-border bg-muted p-4 text-sm text-muted-foreground">
        Ads you save (on this device) will show up here.
      </p>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {ads.map((ad) => (
        <AdCard key={ad.id} ad={ad} />
      ))}
    </div>
  );
}
