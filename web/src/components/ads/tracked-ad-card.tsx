"use client";

import { AdCard } from "./ad-card";
import { useImpressionOnView } from "@/components/analytics/use-impression-on-view";
import type { ImpressionContext } from "@/lib/analytics/track";
import type { Ad } from "@/lib/ads/types";

/* Cards enter in a short cascade; anything past the first row is capped so a
 * full page of results doesn't crawl in. */
const STAGGER_MS = 45;
const MAX_STAGGER_MS = 320;

export function TrackedAdCard({
  ad,
  context,
  index = 0,
}: {
  ad: Ad;
  context: ImpressionContext;
  index?: number;
}) {
  const ref = useImpressionOnView<HTMLDivElement>(ad.id, context);

  return (
    <div
      ref={ref}
      className="h-full animate-rise"
      style={{ animationDelay: `${Math.min(index * STAGGER_MS, MAX_STAGGER_MS)}ms` }}
    >
      <AdCard ad={ad} />
    </div>
  );
}
