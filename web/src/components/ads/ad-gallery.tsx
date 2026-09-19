import { cn } from "@/lib/utils";
import { PhotoPlaceholder } from "./photo-placeholder";
import type { Sector } from "@/lib/ads/types";

const tileClassName =
  "overflow-hidden rounded-2xl shadow-sm ring-1 ring-neutral-900/5";

/* Every tile sets its own aspect ratio so no cell is sized by a sibling. */
const MOSAIC_THUMBS = 2;

export function AdGallery({
  photos,
  sector,
  title,
}: {
  photos: string[];
  sector: Sector;
  title: string;
}) {
  // Nothing to compose: the sector placeholder carries the full width.
  if (photos.length <= 1) {
    return (
      <PhotoPlaceholder
        sector={sector}
        photo={photos[0]}
        alt={title}
        className={cn(tileClassName, "aspect-[16/9]")}
      />
    );
  }

  if (photos.length === 2) {
    return (
      <div className="grid gap-2 sm:grid-cols-2">
        {photos.map((photo, index) => (
          <PhotoPlaceholder
            key={`${index}-${photo}`}
            sector={sector}
            photo={photo}
            alt={index === 0 ? title : `${title} — photo ${index + 1}`}
            className={cn(tileClassName, "aspect-[16/10]")}
          />
        ))}
      </div>
    );
  }

  const [lead, ...rest] = photos;
  const thumbs = rest.slice(0, MOSAIC_THUMBS);
  const remaining = photos.length - 1 - thumbs.length;

  return (
    <div className="grid gap-2 sm:grid-cols-3">
      <PhotoPlaceholder
        sector={sector}
        photo={lead}
        alt={title}
        className={cn(tileClassName, "aspect-[16/10] sm:col-span-2")}
      />
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-1">
        {thumbs.map((photo, index) => {
          const showRemaining = remaining > 0 && index === thumbs.length - 1;
          return (
            <div key={`${index}-${photo}`} className="relative">
              <PhotoPlaceholder
                sector={sector}
                photo={photo}
                alt={`${title} — photo ${index + 2}`}
                className={cn(tileClassName, "aspect-[16/10]")}
              />
              {showRemaining && (
                <span className="pointer-events-none absolute inset-0 flex items-center justify-center rounded-2xl bg-neutral-950/55 text-sm font-semibold text-white">
                  +{remaining} more
                  <span className="sr-only"> photos on this listing</span>
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
