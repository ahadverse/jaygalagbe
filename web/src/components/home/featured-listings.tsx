import Link from "next/link";
import { TrackedAdCard } from "@/components/ads/tracked-ad-card";
import type { FeaturedSelection } from "@/lib/ads/home-facets";

export function FeaturedListings({ selection }: { selection: FeaturedSelection }) {
  if (selection.ads.length === 0) {
    return null;
  }

  const { ads, paid } = selection;

  return (
    <section
      aria-labelledby="featured-heading"
      className="mt-12 border-y border-border bg-gradient-to-b from-brand-50/80 to-brand-50/20 sm:mt-16"
    >
      <div className="shell py-12 sm:py-16">
        <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
          <div className="flex flex-col gap-2">
            <p className={paid ? "eyebrow text-accent-700" : "eyebrow text-brand-700"}>
              {paid ? "Paid placement" : "Featured"}
            </p>
            <h2
              id="featured-heading"
              className="font-heading text-2xl font-bold tracking-tight text-neutral-900 sm:text-3xl"
            >
              {paid ? "Boosted listings" : "Featured listings"}
            </h2>
            <p className="measure text-sm text-muted-foreground">
              {paid
                ? "Advertisers paid to put these at the top of their sector this week."
                : "One listing from each of three districts, across both sectors — there is more here than Dhaka."}
            </p>
          </div>

          <Link
            href="/jayga-jomi"
            className="group inline-flex items-center gap-1.5 text-sm font-semibold text-primary transition-colors hover:text-brand-800"
          >
            Browse everything
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

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {ads.map((ad, index) => (
            <TrackedAdCard key={ad.id} ad={ad} context="HOMEPAGE" index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
