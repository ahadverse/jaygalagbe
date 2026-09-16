import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { EmptyState, buttonVariants } from "@/components/ui";
import { TrackedAdCard } from "@/components/ads/tracked-ad-card";
import { SectorFilters, type SectorFilterValues } from "@/components/ads/sector-filters";
import { Pagination } from "@/components/ads/pagination";
import { fetchLiveAds } from "@/lib/ads/fetch-live-ads";
import { filterAndSortAds, type SortOption } from "@/lib/ads/filter-ads";
import { getSectorConfig, sectorSlugs } from "@/lib/ads/sectors";

const PAGE_SIZE = 30;

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

function buildPageHref(slug: string, values: SectorFilterValues, page: number): string {
  const params = new URLSearchParams();
  if (values.q) params.set("q", values.q);
  if (values.location) params.set("location", values.location);
  if (values.minPrice) params.set("minPrice", values.minPrice);
  if (values.maxPrice) params.set("maxPrice", values.maxPrice);
  if (values.propertyType) params.set("propertyType", values.propertyType);
  if (values.minSize) params.set("minSize", values.minSize);
  if (values.bedrooms) params.set("bedrooms", values.bedrooms);
  if (values.sort && values.sort !== "newest") params.set("sort", values.sort);
  if (page > 1) params.set("page", String(page));

  const query = params.toString();
  return query ? `/${slug}?${query}` : `/${slug}`;
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

  const { ads, error } = await fetchLiveAds(config.sector, { take: 200 });
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

  const totalPages = Math.max(1, Math.ceil(filteredAds.length / PAGE_SIZE));
  const page = Math.min(Math.max(1, parseNumber(firstValue(resolved?.page)) ?? 1), totalPages);
  const pageAds = filteredAds.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <main className="flex flex-1 flex-col">
      <section className="grain relative overflow-hidden border-b border-border bg-gradient-to-b from-brand-50 to-background">
        <div className="shell flex flex-col gap-7 pb-8 pt-10 sm:pb-10 sm:pt-14">
          <div className="flex flex-col gap-2">
            <nav aria-label="Breadcrumb" className="text-xs text-muted-foreground">
              <Link href="/" className="transition-colors hover:text-foreground">
                Home
              </Link>
              <span aria-hidden="true" className="mx-1.5 text-neutral-300">
                /
              </span>
              <span className="text-foreground">{config.name}</span>
            </nav>
            <h1 className="font-heading text-title text-neutral-900">
              {config.name}
            </h1>
            <p className="measure text-base text-muted-foreground">
              {config.description}
            </p>
          </div>

          <SectorFilters
            config={config}
            values={values}
            hasActiveFilters={hasActiveFilters}
          />
        </div>
      </section>

      <section className="shell flex-1 py-10 sm:py-14">
        {error ? (
          <EmptyState
            tone="danger"
            title="Listings didn't load"
            description="Something went wrong reaching our servers. Refresh the page in a moment and they should be back."
            icon={
              <svg
                viewBox="0 0 24 24"
                aria-hidden="true"
                className="size-6"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.6}
                strokeLinecap="round"
              >
                <circle cx="12" cy="12" r="8.5" />
                <path d="M12 8v4.5M12 15.6v.2" />
              </svg>
            }
          />
        ) : filteredAds.length === 0 ? (
          <EmptyState
            title={
              hasActiveFilters
                ? "No listings match those filters"
                : `No ${config.tagline.toLowerCase()} listings yet`
            }
            description={
              hasActiveFilters
                ? "Try widening the price range or clearing the location to see more of what's available."
                : "Approved ads show up here as soon as they clear review. Check back shortly."
            }
            action={
              hasActiveFilters ? (
                <Link
                  href={`/${config.slug}`}
                  className={buttonVariants({ variant: "outline", size: "sm" })}
                >
                  Clear all filters
                </Link>
              ) : null
            }
          />
        ) : (
          <>
            <div className="mb-5 flex flex-wrap items-baseline justify-between gap-2">
              <p className="text-sm text-muted-foreground">
                <span className="numeric font-semibold text-foreground">
                  {filteredAds.length}
                </span>{" "}
                listing{filteredAds.length === 1 ? "" : "s"}
                {hasActiveFilters ? " match your filters" : " available"}
              </p>
              {totalPages > 1 && (
                <p className="numeric text-xs text-subtle-foreground">
                  Page {page} of {totalPages}
                </p>
              )}
            </div>
            <div className="grid gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
              {pageAds.map((ad, index) => (
                <TrackedAdCard
                  key={ad.id}
                  ad={ad}
                  context="SECTOR_LISTING"
                  index={index}
                />
              ))}
            </div>
            <Pagination
              page={page}
              totalPages={totalPages}
              buildHref={(target) => buildPageHref(config.slug, values, target)}
            />
          </>
        )}
      </section>
    </main>
  );
}
