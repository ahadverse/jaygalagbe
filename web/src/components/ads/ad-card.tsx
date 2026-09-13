import Link from "next/link";
import { Badge } from "@/components/ui";
import { cn } from "@/lib/utils";
import { formatAmount, formatRelativeTime } from "@/lib/format";
import { adHighlights, type AdHighlight } from "@/lib/ads/describe-attributes";
import { PhotoPlaceholder } from "./photo-placeholder";
import { isAdBoosted, type Ad } from "@/lib/ads/types";

const highlightIcon: Record<AdHighlight["icon"], string> = {
  size: "M4 4h6M4 4v6M20 20h-6M20 20v-6M4 4l6 6M20 20l-6-6",
  bed: "M3 17v-5h18v5M3 17v2M21 17v2M6 12V8h5v4M13 12V9.5h5V12",
  bath: "M4 11h16v3a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4v-3ZM7 11V6a2 2 0 1 1 4 0",
  type: "M4 10.5 12 4l8 6.5V20H4v-9.5Z",
};

function Highlight({ highlight }: { highlight: AdHighlight }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-neutral-700">
      <svg
        viewBox="0 0 24 24"
        aria-hidden="true"
        className="size-3.5 shrink-0 text-neutral-400"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.6}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d={highlightIcon[highlight.icon]} />
      </svg>
      {highlight.text}
    </span>
  );
}

export function AdCard({ ad, boosted }: { ad: Ad; boosted?: boolean }) {
  const highlights = adHighlights(ad).slice(0, 3);
  const isBoosted = boosted ?? isAdBoosted(ad);
  const sectorLabel = ad.sector === "LAND" ? "Land for sale" : "For rent";
  const posted = formatRelativeTime(ad.createdAt);

  return (
    <Link
      href={`/ads/${ad.id}`}
      className={cn(
        "group relative flex h-full flex-col overflow-hidden rounded-xl bg-card shadow-sm ring-1 transition-[transform,box-shadow] duration-300 ease-soft hover:-translate-y-1 hover:shadow-lg active:translate-y-0 active:shadow-md",
        isBoosted ? "ring-accent-200" : "ring-neutral-900/5",
      )}
    >
      {isBoosted && (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 z-10 h-0.5 bg-gradient-to-r from-accent-500 via-brand-500 to-accent-500"
        />
      )}

      <div className="relative">
        <PhotoPlaceholder
          sector={ad.sector}
          photo={ad.photos[0]}
          alt={ad.title}
          className="aspect-[4/3]"
          zoom
        />
        <div className="pointer-events-none absolute inset-x-3 top-3 flex items-start justify-between gap-2">
          <span className="rounded-full bg-white/92 px-2.5 py-1 text-2xs font-semibold text-neutral-800 shadow-xs backdrop-blur-sm">
            {sectorLabel}
          </span>
          {isBoosted && (
            <Badge variant="boost" size="sm" className="shadow-accent">
              <svg viewBox="0 0 12 12" aria-hidden="true" className="size-2.5">
                <path
                  d="M6.6 1 2.2 6.9h3L5.4 11l4.4-5.9h-3L6.6 1Z"
                  fill="currentColor"
                />
              </svg>
              Boosted
            </Badge>
          )}
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4 sm:p-5">
        <div className="flex flex-col gap-1.5">
          <h3 className="line-clamp-2 font-heading text-base font-bold leading-snug tracking-tight text-foreground transition-colors duration-200 group-hover:text-primary">
            {ad.title}
          </h3>
          <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <svg
              viewBox="0 0 24 24"
              aria-hidden="true"
              className="size-3.5 shrink-0 text-neutral-400"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.6}
            >
              <path d="M12 21s-6.5-5.4-6.5-10a6.5 6.5 0 1 1 13 0c0 4.6-6.5 10-6.5 10Z" />
              <circle cx="12" cy="11" r="2.25" />
            </svg>
            <span className="truncate">
              {ad.locationArea}, {ad.locationDistrict}
            </span>
          </p>
        </div>

        {highlights.length > 0 && (
          <div className="flex flex-wrap items-center gap-x-3.5 gap-y-1.5">
            {highlights.map((highlight) => (
              <Highlight key={highlight.key} highlight={highlight} />
            ))}
          </div>
        )}

        <div className="mt-auto flex items-end justify-between gap-3 border-t border-border pt-3">
          <p className="numeric font-heading text-xl font-bold tracking-tight text-primary">
            <span className="mr-0.5 text-sm font-semibold text-brand-600">৳</span>
            {formatAmount(ad.price)}
          </p>
          {posted && (
            <span className="shrink-0 text-2xs text-subtle-foreground">
              {posted}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
