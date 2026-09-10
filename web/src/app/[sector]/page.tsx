import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AdCard } from "@/components/ads/ad-card";
import { SectorFilters, type SectorFilterValues } from "@/components/ads/sector-filters";
import { fetchLiveAds } from "@/lib/ads/fetch-live-ads";
import { filterAndSortAds, type SortOption } from "@/lib/ads/filter-ads";
import { getSectorConfig, sectorSlugs } from "@/lib/ads/sectors";

export function generateStaticParams() {
  return sectorSlugs.map((sector) => ({ sector }));
}

export async function generateMetadata({
  params,
}: PageProps<"/[sector]">): Promise<Metadata> {
  const { sector } = await params;
  const config = getSectorConfig(sector);
  if (!config) {
    return {};
  }

  return {
    title: `${config.name} — ${config.tagline} | Jayga Lagbe`,
    description: config.description,
  };
}

function firstValue(value?: string | string[]): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function parseNumber(value?: string): number | undefined {
  if (!value) return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

export default async function SectorPage({
  params,
  searchParams,
}: PageProps<"/[sector]">) {
  const { sector } = await params;
  const config = getSectorConfig(sector);
  if (!config) {
    notFound();
  }

  const resolved = await searchParams;
  const values: SectorFilterValues = {
    q: firstValue(resolved?.q),
    location: firstValue(resolved?.location),
    minPrice: firstValue(resolved?.minPrice),
    maxPrice: firstValue(resolved?.maxPrice),
    propertyType: firstValue(resolved?.propertyType),
    minSize: firstValue(resolved?.minSize),
    bedrooms: firstValue(resolved?.bedrooms),
    sort: firstValue(resolved?.sort),
  };
  const hasActiveFilters = Object.values(values).some(
    (value) => value && value !== "newest",
  );

  const { ads, error } = await fetchLiveAds(config.sector);
  const filteredAds = error
    ? []
    : filterAndSortAds(ads, config.sector, {
        q: values.q,
        location: values.location,
        minPrice: parseNumber(values.minPrice),
        maxPrice: parseNumber(values.maxPrice),
        propertyType: values.propertyType || undefined,
        minSize: parseNumber(values.minSize),
        bedrooms: parseNumber(values.bedrooms),
        sort: (values.sort as SortOption) || "newest",
      });

  return (
    <main className="flex flex-1 flex-col">
      <section className="border-b border-border bg-muted">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-10">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              {config.name}
            </h1>
            <p className="mt-1 text-muted-foreground">{config.description}</p>
          </div>

          <SectorFilters
            config={config}
            values={values}
            hasActiveFilters={hasActiveFilters}
          />
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl flex-1 px-6 py-10">
        {error ? (
          <p className="rounded-lg border border-border bg-muted p-6 text-center text-muted-foreground">
            Couldn&apos;t load listings right now. Please try again shortly.
          </p>
        ) : filteredAds.length === 0 ? (
          <p className="rounded-lg border border-border bg-muted p-6 text-center text-muted-foreground">
            {hasActiveFilters
              ? `No live ${config.tagline.toLowerCase()} listings match your filters.`
              : `No live ${config.tagline.toLowerCase()} listings yet — check back soon.`}
          </p>
        ) : (
          <>
            <p className="mb-4 text-sm text-muted-foreground">
              {filteredAds.length} listing{filteredAds.length === 1 ? "" : "s"} found
            </p>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filteredAds.map((ad) => (
                <AdCard key={ad.id} ad={ad} />
              ))}
            </div>
          </>
        )}
      </section>
    </main>
  );
}
