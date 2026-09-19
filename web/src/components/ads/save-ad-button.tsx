"use client";

import { Button } from "@/components/ui";
import { cn } from "@/lib/utils";
import { toggleSavedAd, useSavedAdIds } from "@/lib/ads/local-lists";

export function SaveAdButton({ adId }: { adId: string }) {
  const saved = useSavedAdIds().includes(adId);

  return (
    <Button
      type="button"
      variant="outline"
      aria-pressed={saved}
      className={cn(
        "w-full",
        saved && "border-brand-300 bg-brand-50 text-brand-800",
      )}
      onClick={() => toggleSavedAd(adId)}
    >
      <svg
        viewBox="0 0 24 24"
        aria-hidden="true"
        className="size-4"
        fill={saved ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth={1.7}
        strokeLinejoin="round"
      >
        <path d="M7 4h10a1 1 0 0 1 1 1v15l-6-4-6 4V5a1 1 0 0 1 1-1Z" />
      </svg>
      {saved ? "Saved to your list" : "Save this ad"}
    </Button>
  );
}
