"use client";

import { useEffect } from "react";
import { recordAdView } from "@/lib/ads/local-lists";

/** Adds the listing to this browser's "recently viewed" list. */
export function ViewRecorder({ adId }: { adId: string }) {
  useEffect(() => {
    recordAdView(adId);
  }, [adId]);

  return null;
}
