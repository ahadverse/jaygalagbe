import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui";
import { AdGallery } from "@/components/ads/ad-gallery";
import { NearbyListings } from "@/components/ads/nearby-listings";
import { ContactGate } from "@/components/ads/contact-gate";
import { SaveAdButton } from "@/components/ads/save-ad-button";
import { fetchAd } from "@/lib/ads/fetch-ad";
import { fetchLiveAds } from "@/lib/ads/fetch-live-ads";
import { describeAdAttributes } from "@/lib/ads/describe-attributes";
import { formatAmount, formatRelativeTime } from "@/lib/format";
import { getCurrentUser } from "@/lib/auth/session";
import { isAdBoosted, type Ad } from "@/lib/ads/types";

const statusBadge = {
  LIVE: { label: "Live", variant: "success" as const },
  PENDING: { label: "Pending review", variant: "warning" as const },
  REJECTED: { label: "Rejected", variant: "danger" as const },
  SOLD: { label: "Sold", variant: "info" as const },
  REMOVED: { label: "Removed", variant: "neutral" as const },
};

const RELATED_LIMIT = 3;

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/* Same district first, then anything else live in the sector, so the band
 * only disappears when the sector genuinely has nothing else to show. */
function relatedAds(pool: Ad[], current: Ad): { ads: Ad[]; sameArea: boolean } {
  const others = pool.filter((ad) => ad.id !== current.id);
  const sameDistrict = others.filter(
    (ad) => ad.locationDistrict === current.locationDistrict,
  );
  if (sameDistrict.length > 0) {
    return { ads: sameDistrict.slice(0, RELATED_LIMIT), sameArea: true };
  }
  return { ads: others.slice(0, RELATED_LIMIT), sameArea: false };
}

export async function generateMetadata({
  params,
}: PageProps<"/ads/[id]">): Promise<Metadata> {
  const { id } = await params;
  const ad = await fetchAd(id);
  if (!ad) {
    return {};
  }

  return {
    title: `${ad.title} | Jayga Lagbe`,
    description: ad.description.slice(0, 160),
  };
}

function DetailRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-4 px-5 py-3">
      <dt className="shrink-0 text-xs text-muted-foreground">{label}</dt>
      <dd className="min-w-0 text-right text-sm font-medium text-foreground">
        {children}
      </dd>
    </div>
  );
}

export default async function AdDetailPage({ params }: PageProps<"/ads/[id]">) {
  const { id } = await params;
  const [ad, currentUser] = await Promise.all([fetchAd(id), getCurrentUser()]);
  if (!ad) {
    notFound();
  }

  const facts = describeAdAttributes(ad);
  const badge = statusBadge[ad.status];
  const sectorHref = ad.sector === "LAND" ? "/jayga-jomi" : "/basha-bhara";
  const sectorName = ad.sector === "LAND" ? "Jayga Jomi" : "Basha Bhara";
  const sectorLabel = ad.sector === "LAND" ? "Land for sale" : "House rent";
  const posted = formatRelativeTime(ad.createdAt);
  const edited = new Date(ad.updatedAt).getTime() - new Date(ad.createdAt).getTime() > 60_000;

  const { ads: pool } = await fetchLiveAds(ad.sector);
  const related = relatedAds(pool, ad);

  return (
    <main className="flex flex-1 flex-col">
      <div className="shell flex w-full flex-col gap-7 py-6 sm:gap-8 sm:py-10">
        <nav aria-label="Breadcrumb" className="text-xs text-muted-foreground">
          <Link href="/" className="transition-colors hover:text-foreground">
            Home
          </Link>
          <span aria-hidden="true" className="mx-1.5 text-neutral-300">
            /
          </span>
          <Link
            href={sectorHref}
            className="transition-colors hover:text-foreground"
          >
            {sectorName}
          </Link>
          <span aria-hidden="true" className="mx-1.5 text-neutral-300">
            /
          </span>
          <Link
            href={`${sectorHref}?location=${encodeURIComponent(ad.locationDistrict)}`}
            className="transition-colors hover:text-foreground"
          >
            {ad.locationDistrict}
          </Link>
          <span aria-hidden="true" className="mx-1.5 text-neutral-300">
            /
          </span>
          <span className="text-foreground">{ad.locationArea}</span>
        </nav>

        <AdGallery photos={ad.photos} sector={ad.sector} title={ad.title} />

        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_21rem] lg:gap-10">
          <div className="flex min-w-0 flex-col gap-6">
            <header className="flex flex-col gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant={badge.variant}>{badge.label}</Badge>
                {isAdBoosted(ad) && <Badge variant="boost">Boosted</Badge>}
                <Badge variant="outline">{sectorLabel}</Badge>
                {posted && (
                  <span className="text-xs text-subtle-foreground">
                    Posted {posted.toLowerCase()}
                  </span>
                )}
              </div>
              <h1 className="font-heading text-title text-neutral-900">
                {ad.title}
              </h1>
              <p className="flex items-start gap-2 text-sm text-muted-foreground">
                <svg
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                  className="mt-0.5 size-4 shrink-0 text-neutral-400"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.6}
                >
                  <path d="M12 21s-6.5-5.4-6.5-10a6.5 6.5 0 1 1 13 0c0 4.6-6.5 10-6.5 10Z" />
                  <circle cx="12" cy="11" r="2.25" />
                </svg>
                <span>
                  {ad.locationArea}, {ad.locationDistrict}
                  {ad.address ? ` — ${ad.address}` : ""}
                </span>
              </p>
            </header>

            {/* Facts and copy share one sheet so a one-line description still
             * sits on something rather than floating in whitespace. */}
            <section
              aria-labelledby="about-heading"
              className="overflow-hidden rounded-2xl bg-card shadow-sm ring-1 ring-neutral-900/5"
            >
              {facts.length > 0 && (
                <div className="grid grid-cols-2 gap-px bg-border sm:grid-cols-4">
                  {facts.map((fact) => (
                    <div
                      key={fact.label}
                      className="flex flex-col gap-1 bg-card px-4 py-3.5"
                    >
                      <span className="eyebrow text-subtle-foreground">
                        {fact.label}
                      </span>
                      <span className="font-heading text-sm font-bold text-foreground">
                        {fact.value}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex flex-col gap-3 border-t border-border p-5 sm:p-6">
                <h2
                  id="about-heading"
                  className="font-heading text-lg font-bold tracking-tight text-neutral-900"
                >
                  About this property
                </h2>
                <p className="measure whitespace-pre-line text-base leading-relaxed text-neutral-700">
                  {ad.description}
                </p>
              </div>
            </section>

            <aside className="flex gap-3 rounded-xl bg-warning-50 p-4 ring-1 ring-warning-100">
              <svg
                viewBox="0 0 24 24"
                aria-hidden="true"
                className="size-5 shrink-0 text-warning-700"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.6}
                strokeLinecap="round"
              >
                <path d="M12 3.5 19 6v6c0 4.2-2.9 7.4-7 8.5-4.1-1.1-7-4.3-7-8.5V6l7-2.5Z" />
                <path d="M12 9v4M12 16.2v.2" />
              </svg>
              <p className="text-xs leading-relaxed text-warning-800">
                <span className="font-semibold">Stay safe.</span> Visit the
                property in person and verify ownership papers before paying any
                advance. Jayga Lagbe never asks for payment on behalf of an
                advertiser.
              </p>
            </aside>
          </div>

          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1 rounded-xl bg-card p-5 shadow-sm ring-1 ring-neutral-900/5">
              <span className="eyebrow text-subtle-foreground">
                {ad.sector === "LAND" ? "Asking price" : "Monthly rent"}
              </span>
              <p className="numeric font-heading text-3xl font-bold tracking-tight text-primary">
                <span className="mr-1 text-xl font-semibold text-brand-600">
                  ৳
                </span>
                {formatAmount(ad.price)}
              </p>
            </div>

            <ContactGate
              adId={ad.id}
              ownerId={ad.ownerId}
              currentUser={currentUser}
            />
            <SaveAdButton adId={ad.id} />

            <section
              aria-labelledby="listing-details-heading"
              className="overflow-hidden rounded-xl bg-card shadow-sm ring-1 ring-neutral-900/5"
            >
              <h2
                id="listing-details-heading"
                className="border-b border-border px-5 py-3.5 font-heading text-sm font-bold tracking-tight text-foreground"
              >
                Listing details
              </h2>
              <dl className="flex flex-col divide-y divide-border">
                <DetailRow label="Category">
                  <Link
                    href={sectorHref}
                    className="text-primary transition-colors hover:text-brand-800"
                  >
                    {sectorName}
                  </Link>
                </DetailRow>
                <DetailRow label="Area">{ad.locationArea}</DetailRow>
                <DetailRow label="District">{ad.locationDistrict}</DetailRow>
                {ad.address && (
                  <DetailRow label="Address">{ad.address}</DetailRow>
                )}
                <DetailRow label="Posted">{formatDate(ad.createdAt)}</DetailRow>
                {edited && (
                  <DetailRow label="Last updated">
                    {formatDate(ad.updatedAt)}
                  </DetailRow>
                )}
                <DetailRow label="Reference">
                  <span className="numeric break-all text-xs text-muted-foreground">
                    {ad.id}
                  </span>
                </DetailRow>
              </dl>
            </section>
          </div>
        </div>
      </div>

      <NearbyListings
        ads={related.ads}
        heading={
          related.sameArea
            ? `More ${sectorLabel.toLowerCase()} in ${ad.locationDistrict}`
            : `More ${sectorLabel.toLowerCase()}`
        }
        seeAllLabel={
          related.sameArea ? `All of ${ad.locationDistrict}` : `All ${sectorName}`
        }
        seeAllHref={
          related.sameArea
            ? `${sectorHref}?location=${encodeURIComponent(ad.locationDistrict)}`
            : sectorHref
        }
      />
    </main>
  );
}
