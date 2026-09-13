import Link from "next/link";
import { AdCard } from "./ad-card";
import type { Ad } from "@/lib/ads/types";

/*
 * Deliberately plain AdCards rather than TrackedAdCard: the impression
 * contexts the API accepts describe feeds, and logging a related-listing
 * render as a homepage impression would skew an advertiser's funnel.
 */
export function NearbyListings({
  ads,
  heading,
  seeAllLabel,
  seeAllHref,
}: {
  ads: Ad[];
  heading: string;
  seeAllLabel: string;
  seeAllHref: string;
}) {
  if (ads.length === 0) {
    return null;
  }

  return (
    <section
      aria-labelledby="nearby-heading"
      className="border-t border-border bg-muted/50"
    >
      <div className="shell py-12 sm:py-16">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <h2
            id="nearby-heading"
            className="font-heading text-xl font-bold tracking-tight text-neutral-900 sm:text-2xl"
          >
            {heading}
          </h2>
          <Link
            href={seeAllHref}
            className="group inline-flex items-center gap-1.5 text-sm font-semibold text-primary transition-colors hover:text-brand-800"
          >
            {seeAllLabel}
            <svg
              viewBox="0 0 24 24"
              aria-hidden="true"
              className="size-4 transition-transform duration-200 group-hover:translate-x-0.5"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </Link>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
          {ads.map((ad) => (
            <AdCard key={ad.id} ad={ad} />
          ))}
        </div>
      </div>
    </section>
  );
}
