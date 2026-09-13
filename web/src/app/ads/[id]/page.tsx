import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui";
import { ContactGate } from "@/components/ads/contact-gate";
import { SaveAdButton } from "@/components/ads/save-ad-button";
import { PhotoPlaceholder } from "@/components/ads/photo-placeholder";
import { fetchAd } from "@/lib/ads/fetch-ad";
import { describeAdAttributes } from "@/lib/ads/describe-attributes";
import { formatAmount, formatRelativeTime } from "@/lib/format";
import { getCurrentUser } from "@/lib/auth/session";
import { isAdBoosted } from "@/lib/ads/types";

const statusBadge = {
  LIVE: { label: "Live", variant: "success" as const },
  PENDING: { label: "Pending review", variant: "warning" as const },
  REJECTED: { label: "Rejected", variant: "danger" as const },
  SOLD: { label: "Sold", variant: "info" as const },
  REMOVED: { label: "Removed", variant: "neutral" as const },
};

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
  const extraPhotos = ad.photos.slice(1, 3);
  const posted = formatRelativeTime(ad.createdAt);

  return (
    <main className="shell flex w-full flex-col gap-8 py-6 sm:py-10">
      <nav aria-label="Breadcrumb" className="text-xs text-muted-foreground">
        <Link href="/" className="transition-colors hover:text-foreground">
          Home
        </Link>
        <span aria-hidden="true" className="mx-1.5 text-neutral-300">
          /
        </span>
        <Link href={sectorHref} className="transition-colors hover:text-foreground">
          {sectorName}
        </Link>
        <span aria-hidden="true" className="mx-1.5 text-neutral-300">
          /
        </span>
        <span className="text-foreground">{ad.locationArea}</span>
      </nav>

      <div
        className={
          extraPhotos.length > 0
            ? "grid gap-2 sm:grid-cols-3 sm:grid-rows-2"
            : "grid gap-2"
        }
      >
        <PhotoPlaceholder
          sector={ad.sector}
          photo={ad.photos[0]}
          alt={ad.title}
          className={
            extraPhotos.length > 0
              ? "aspect-[4/3] overflow-hidden rounded-2xl shadow-sm ring-1 ring-neutral-900/5 sm:col-span-2 sm:row-span-2 sm:aspect-auto sm:min-h-80"
              : "aspect-[16/9] overflow-hidden rounded-2xl shadow-sm ring-1 ring-neutral-900/5"
          }
        />
        {extraPhotos.map((photo, index) => (
          <PhotoPlaceholder
            key={photo}
            sector={ad.sector}
            photo={photo}
            alt={`${ad.title} — photo ${index + 2}`}
            className="hidden overflow-hidden rounded-2xl shadow-sm ring-1 ring-neutral-900/5 sm:block"
          />
        ))}
      </div>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_22rem] lg:gap-12">
        <div className="flex min-w-0 flex-col gap-8">
          <header className="flex flex-col gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant={badge.variant}>{badge.label}</Badge>
              {isAdBoosted(ad) && <Badge variant="boost">Boosted</Badge>}
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

          {facts.length > 0 && (
            <div className="grid grid-cols-2 gap-px overflow-hidden rounded-xl bg-border ring-1 ring-neutral-900/5 sm:grid-cols-4">
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

          <section className="flex flex-col gap-3">
            <h2 className="font-heading text-lg font-bold tracking-tight text-neutral-900">
              About this property
            </h2>
            <p className="measure whitespace-pre-line text-base leading-relaxed text-neutral-700">
              {ad.description}
            </p>
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

        <div className="flex flex-col gap-4 lg:sticky lg:top-24 lg:self-start">
          <div className="flex flex-col gap-1 rounded-xl bg-card p-5 shadow-sm ring-1 ring-neutral-900/5">
            <span className="eyebrow text-subtle-foreground">
              {ad.sector === "LAND" ? "Asking price" : "Monthly rent"}
            </span>
            <p className="numeric font-heading text-3xl font-bold tracking-tight text-primary">
              <span className="mr-1 text-xl font-semibold text-brand-600">৳</span>
              {formatAmount(ad.price)}
            </p>
          </div>

          <ContactGate
            adId={ad.id}
            ownerId={ad.ownerId}
            currentUser={currentUser}
          />
          <SaveAdButton adId={ad.id} />
        </div>
      </div>
    </main>
  );
}
