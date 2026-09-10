"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui";
import { isAdSaved, toggleSavedAd } from "@/lib/ads/saved-ads";

export function SaveAdButton({ adId }: { adId: string }) {
  const [saved, setSaved] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    queueMicrotask(() => {
      setSaved(isAdSaved(adId));
      setReady(true);
    });
  }, [adId]);

  return (
    <Button
      type="button"
      variant="outline"
      className="w-full"
      disabled={!ready}
      onClick={() => setSaved(toggleSavedAd(adId))}
    >
      {saved ? "Saved" : "Save this ad"}
    </Button>
  );
}
