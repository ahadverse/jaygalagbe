import Link from "next/link";
import { EmptyState, buttonVariants } from "@/components/ui";
import { TrackedAdCard } from "@/components/ads/tracked-ad-card";
import type { Ad } from "@/lib/ads/types";

export function LatestListings({ ads }: { ads: Ad[] }) {
  return (
    <div className="min-w-0 flex-1">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div className="flex flex-col gap-1">
          <p className="eyebrow text-subtle-foreground">Fresh on the market</p>
          <h2 className="font-heading text-2xl font-bold tracking-tight text-neutral-900">
            Latest listings
          </h2>
        </div>
        <Link
          href="/jayga-jomi"
          className="group inline-flex items-center gap-1.5 text-sm font-semibold text-primary transition-colors hover:text-brand-800"
        >
          Browse all
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

      {ads.length === 0 ? (
        <EmptyState
          title="No listings yet"
          description="Approved ads appear here as soon as they clear review. Check back shortly, or post the first one yourself."
          action={
            <Link
              href="/advertiser/ads/new"
              className={buttonVariants({ variant: "outline", size: "sm" })}
            >
              Post an ad
            </Link>
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 sm:gap-5 xl:grid-cols-3">
          {ads.map((ad, index) => (
            <TrackedAdCard
              key={ad.id}
              ad={ad}
              context="HOMEPAGE"
              index={index}
            />
          ))}
        </div>
      )}
    </div>
  );
}
