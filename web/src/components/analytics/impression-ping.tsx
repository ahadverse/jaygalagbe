"use client";

import { useEffect, useRef } from "react";
import { pingImpression, type ImpressionContext } from "@/lib/analytics/track";

export function ImpressionPing({
  adId,
  context,
}: {
  adId: string;
  context: ImpressionContext;
}) {
  const pinged = useRef(false);

  useEffect(() => {
    if (pinged.current) return;
    pinged.current = true;
    void pingImpression(adId, context);
  }, [adId, context]);

  return null;
}
