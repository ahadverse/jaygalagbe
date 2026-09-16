"use client";

import { useEffect, useState } from "react";
import { StatCard } from "@/components/dashboard/stat-card";
import { getSavedAdIds } from "@/lib/ads/saved-ads";

export function CustomerStatsRow({
  conversationCount,
  advertiserCount,
}: {
  conversationCount: number;
  advertiserCount: number;
}) {
  const [savedCount, setSavedCount] = useState<number | null>(null);

  useEffect(() => {
    queueMicrotask(() => setSavedCount(getSavedAdIds().length));
  }, []);

  if (savedCount === null) return null;
  if (savedCount === 0 && conversationCount === 0 && advertiserCount === 0) return null;

  return (
    <div className="grid animate-fade-in grid-cols-2 gap-4 sm:grid-cols-3">
      {savedCount > 0 && <StatCard label="Saved ads" value={savedCount.toLocaleString()} />}
      {conversationCount > 0 && (
        <StatCard label="Conversations" value={conversationCount.toLocaleString()} tone="info" />
      )}
      {advertiserCount > 0 && (
        <StatCard label="Advertisers contacted" value={advertiserCount.toLocaleString()} tone="accent" />
      )}
    </div>
  );
}
