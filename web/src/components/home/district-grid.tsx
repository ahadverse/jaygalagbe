import Link from "next/link";
import type { DistrictFacet } from "@/lib/ads/home-facets";

function sectorHref(slug: string, district: string): string {
  return `/${slug}?location=${encodeURIComponent(district)}`;
}

const chipClassName =
  "inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1.5 text-xs font-semibold text-neutral-700 transition-colors duration-150 hover:bg-brand-100 hover:text-brand-800";

export function DistrictGrid({ districts }: { districts: DistrictFacet[] }) {
  if (districts.length === 0) {
    return null;
  }

  return (
    <section aria-labelledby="districts-heading" className="shell py-14 sm:py-20">
      <div className="mb-7 flex flex-col gap-2">
        <p className="eyebrow text-subtle-foreground">Where we cover</p>
        <h2
          id="districts-heading"
          className="font-heading text-2xl font-bold tracking-tight text-neutral-900 sm:text-3xl"
        >
          Browse by district
        </h2>
        <p className="measure text-sm text-muted-foreground">
          Every count below is live right now. Pick a district to jump straight
          into its listings.
        </p>
      </div>

      {/* Hairline grid rather than another row of cards — this is a data
       * surface, so it should read denser than the listing sections. */}
      <div className="grid grid-cols-1 gap-px overflow-hidden rounded-2xl bg-border shadow-sm ring-1 ring-neutral-900/5 sm:grid-cols-2 lg:grid-cols-3">
        {districts.map((facet) => (
          <div
            key={facet.district}
            className="flex flex-col gap-3 bg-card p-5 transition-colors duration-200 hover:bg-brand-50/40"
          >
            <div className="flex items-baseline justify-between gap-3">
              <h3 className="font-heading text-base font-bold tracking-tight text-foreground">
                {facet.district}
              </h3>
              <span className="numeric shrink-0 text-2xs text-subtle-foreground">
                {facet.areas} {facet.areas === 1 ? "area" : "areas"}
              </span>
            </div>

            <p className="flex items-baseline gap-1.5">
              <span className="numeric font-heading text-3xl font-bold tracking-tight text-neutral-900">
                {facet.total}
              </span>
              <span className="text-xs text-muted-foreground">
                live {facet.total === 1 ? "listing" : "listings"}
              </span>
            </p>

            <div className="mt-auto flex flex-wrap gap-2 pt-1">
              {facet.land > 0 && (
                <Link
                  href={sectorHref("jayga-jomi", facet.district)}
                  className={chipClassName}
                >
                  <span className="numeric">{facet.land}</span> land
                  <span className="sr-only"> listings in {facet.district}</span>
                </Link>
              )}
              {facet.house > 0 && (
                <Link
                  href={sectorHref("basha-bhara", facet.district)}
                  className={chipClassName}
                >
                  <span className="numeric">{facet.house}</span> rent
                  <span className="sr-only"> listings in {facet.district}</span>
                </Link>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
