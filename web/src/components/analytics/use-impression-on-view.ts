"use client";

import { useEffect, useRef } from "react";
import { pingImpression, type ImpressionContext } from "@/lib/analytics/track";

/* A card counts as seen once a quarter of it has held the screen for a moment:
 * long enough to rule out a fast scroll past, short enough to catch a real
 * look. Pinging on mount instead would both count cards nobody scrolled to and
 * fire one request per card the instant a 30-card grid renders, which is more
 * than the API's tracking rate limit allows in a single burst. */
const VISIBLE_RATIO = 0.25;
const DWELL_MS = 400;

export function useImpressionOnView<T extends HTMLElement>(
  adId: string,
  context: ImpressionContext,
) {
  const ref = useRef<T>(null);
  const pinged = useRef(false);

  useEffect(() => {
    const element = ref.current;
    // Browsers without the observer get no impression data rather than a burst.
    if (!element || pinged.current || typeof IntersectionObserver === "undefined") {
      return;
    }

    let timer: ReturnType<typeof setTimeout> | undefined;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) {
          clearTimeout(timer);
          timer = undefined;
          return;
        }
        if (timer) return;
        timer = setTimeout(() => {
          pinged.current = true;
          observer.disconnect();
          void pingImpression(adId, context);
        }, DWELL_MS);
      },
      { threshold: VISIBLE_RATIO },
    );

    observer.observe(element);

    return () => {
      clearTimeout(timer);
      observer.disconnect();
    };
  }, [adId, context]);

  return ref;
}
