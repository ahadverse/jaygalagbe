import { AdCard } from "./ad-card";
import { ImpressionPing } from "@/components/analytics/impression-ping";
import type { ImpressionContext } from "@/lib/analytics/track";
import type { Ad } from "@/lib/ads/types";

export function TrackedAdCard({
  ad,
  context,
}: {
  ad: Ad;
  context: ImpressionContext;
}) {
  return (
    <>
      <AdCard ad={ad} />
      <ImpressionPing adId={ad.id} context={context} />
    </>
  );
}
