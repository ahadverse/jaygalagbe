import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Button, Input } from "@/components/ui";
import { AdCard } from "@/components/ads/ad-card";
import { fetchLiveAds } from "@/lib/ads/fetch-live-ads";
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

export default async function SectorPage({ params, searchParams }: PageProps<"/[sector]">) {
  const { sector } = await params;
  const config = getSectorConfig(sector);
  if (!config) {
    notFound();
  }

  const resolvedSearchParams = await searchParams;
  const locationParam = resolvedSearchParams?.location;
  const location = Array.isArray(locationParam) ? locationParam[0] : locationParam;

  const { ads, error } = await fetchLiveAds(config.sector, location);

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

          <form
            action={`/${config.slug}`}
            className="flex flex-col gap-2 sm:max-w-md sm:flex-row"
          >
            <div className="flex-1">
              <Input
                name="location"
                defaultValue={location ?? ""}
                placeholder={config.searchPlaceholder}
                aria-label="Location"
              />
            </div>
            <Button type="submit">Search</Button>
          </form>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl flex-1 px-6 py-10">
        {error ? (
          <p className="rounded-lg border border-border bg-muted p-6 text-center text-muted-foreground">
            Couldn&apos;t load listings right now. Please try again shortly.
          </p>
        ) : ads.length === 0 ? (
          <p className="rounded-lg border border-border bg-muted p-6 text-center text-muted-foreground">
            {location
              ? `No live ${config.tagline.toLowerCase()} listings found for "${location}".`
              : `No live ${config.tagline.toLowerCase()} listings yet — check back soon.`}
          </p>
        ) : (
          <>
            <p className="mb-4 text-sm text-muted-foreground">
              {ads.length} listing{ads.length === 1 ? "" : "s"} found
            </p>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {ads.map((ad) => (
                <AdCard key={ad.id} ad={ad} />
              ))}
            </div>
          </>
        )}
      </section>
    </main>
  );
}
