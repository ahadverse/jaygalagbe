"use client";

import { useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { PhotoPlaceholder } from "./photo-placeholder";
import { AdLightbox } from "./ad-lightbox";
import type { Sector } from "@/lib/ads/types";

const tileClassName =
  "overflow-hidden rounded-2xl shadow-sm ring-1 ring-neutral-900/5";

/* Every tile sets its own aspect ratio so no cell is sized by a sibling. */
const MOSAIC_THUMBS = 2;

/** Wraps a tile so the whole photo is the hit area for opening the viewer. */
function PhotoButton({
  onOpen,
  label,
  className,
  children,
}: {
  onOpen: () => void;
  label: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onOpen}
      aria-label={label}
      className={cn(
        "group relative block w-full cursor-zoom-in rounded-2xl text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2",
        className,
      )}
    >
      {children}
    </button>
  );
}

export function AdGallery({
  photos,
  sector,
  title,
}: {
  photos: string[];
  sector: Sector;
  title: string;
}) {
  const [openAt, setOpenAt] = useState<number | null>(null);
  const count = photos.length;

  const viewer =
    openAt !== null && count > 0 ? (
      <AdLightbox
        photos={photos}
        title={title}
        index={openAt}
        onIndexChange={setOpenAt}
        onClose={() => setOpenAt(null)}
      />
    ) : null;

  // Nothing to compose: the sector placeholder carries the full width. With no
  // photo at all there is nothing to enlarge, so it stays a plain tile.
  if (count <= 1) {
    const tile = (
      <PhotoPlaceholder
        sector={sector}
        photo={photos[0]}
        alt={title}
        className={cn(tileClassName, "aspect-[16/9]")}
      />
    );

    if (count === 0) return tile;

    return (
      <>
        <PhotoButton onOpen={() => setOpenAt(0)} label={`View photo of ${title}`}>
          {tile}
        </PhotoButton>
        {viewer}
      </>
    );
  }

  if (count === 2) {
    return (
      <>
        <div className="grid gap-2 sm:grid-cols-2">
          {photos.map((photo, index) => (
            <PhotoButton
              key={`${index}-${photo}`}
              onOpen={() => setOpenAt(index)}
              label={`View photo ${index + 1} of ${count}`}
            >
              <PhotoPlaceholder
                sector={sector}
                photo={photo}
                alt={index === 0 ? title : `${title} — photo ${index + 1}`}
                className={cn(tileClassName, "aspect-[16/10]")}
                zoom
              />
            </PhotoButton>
          ))}
        </div>
        {viewer}
      </>
    );
  }

  const [lead, ...rest] = photos;
  const thumbs = rest.slice(0, MOSAIC_THUMBS);
  const remaining = count - 1 - thumbs.length;

  return (
    <>
      <div className="relative">
        <div className="grid gap-2 sm:grid-cols-3">
          <PhotoButton
            onOpen={() => setOpenAt(0)}
            label={`View photo 1 of ${count}`}
            className="sm:col-span-2"
          >
            <PhotoPlaceholder
              sector={sector}
              photo={lead}
              alt={title}
              className={cn(tileClassName, "aspect-[16/10]")}
              zoom
            />
          </PhotoButton>

          <div className="grid grid-cols-2 gap-2 sm:grid-cols-1">
            {thumbs.map((photo, index) => {
              const showRemaining = remaining > 0 && index === thumbs.length - 1;
              return (
                <PhotoButton
                  key={`${index}-${photo}`}
                  onOpen={() => setOpenAt(index + 1)}
                  label={
                    showRemaining
                      ? `View all ${count} photos`
                      : `View photo ${index + 2} of ${count}`
                  }
                >
                  <PhotoPlaceholder
                    sector={sector}
                    photo={photo}
                    alt={`${title} — photo ${index + 2}`}
                    className={cn(tileClassName, "aspect-[16/10]")}
                    zoom
                  />
                  {/* The overlay is decorative: the button around it is what
                   * opens the viewer, so it must not swallow the click. */}
                  {showRemaining && (
                    <span className="pointer-events-none absolute inset-0 flex items-center justify-center rounded-2xl bg-neutral-950/55 text-sm font-semibold text-white transition-colors group-hover:bg-neutral-950/65">
                      +{remaining} more
                    </span>
                  )}
                </PhotoButton>
              );
            })}
          </div>
        </div>

        {/* A plain, always-visible way in — the mosaic alone does not say that
         * the photos are clickable, and on a phone there is no hover to hint.
         * It sits bottom-left, over the lead photo, to stay clear of the
         * "+N more" tile in the corner opposite. */}
        <button
          type="button"
          onClick={() => setOpenAt(0)}
          className="absolute bottom-3 left-3 inline-flex items-center gap-1.5 rounded-full bg-card/95 px-3.5 py-2 text-xs font-semibold text-foreground shadow-md ring-1 ring-neutral-900/10 backdrop-blur transition-colors hover:bg-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
        >
          <svg
            viewBox="0 0 24 24"
            aria-hidden="true"
            className="size-4 text-muted-foreground"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.7}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="3" y="4" width="18" height="14" rx="2.5" />
            <circle cx="8.5" cy="9.5" r="1.5" />
            <path d="m4 16 4.5-4 3.5 3 3-2.5L20 17" />
          </svg>
          View all {count} photos
        </button>
      </div>
      {viewer}
    </>
  );
}
