import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import type { Sector } from "@/lib/ads/types";

const sectorIcon: Record<Sector, ReactNode> = {
  LAND: (
    <path
      d="M4 20h24M7 20V9l9-5 9 5v11M12 20v-6h6v6"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
  ),
  HOUSE_RENT: (
    <path
      d="M5 18V10l11-6 11 6v8M9 26V16h5v10M20 26h6v-7h-6v7Z"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
  ),
};

export function PhotoPlaceholder({
  sector,
  photo,
  alt,
  className,
  zoom,
}: {
  sector: Sector;
  photo?: string | null;
  alt?: string;
  className?: string;
  /** Slow scale-up on hover of an ancestor marked `group`. */
  zoom?: boolean;
}) {
  if (photo) {
    return (
      <div className={cn("relative overflow-hidden bg-neutral-150", className)}>
        {/* eslint-disable-next-line @next/next/no-img-element -- external placeholder photos, no remote-image config yet */}
        <img
          src={photo}
          alt={alt ?? ""}
          loading="lazy"
          className={cn(
            "h-full w-full object-cover",
            zoom &&
              "transition-transform duration-700 ease-soft group-hover:scale-[1.045]",
          )}
        />
        {/* Keeps white overlay chips legible over bright photos. */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-1/3 bg-gradient-to-b from-black/25 to-transparent"
        />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "relative flex items-center justify-center overflow-hidden bg-gradient-to-br from-brand-100 via-neutral-100 to-accent-100",
        className,
      )}
    >
      <span
        aria-hidden="true"
        className="absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage:
            "linear-gradient(to right, oklch(49.5% 0.163 36 / 0.18) 1px, transparent 1px), linear-gradient(to bottom, oklch(49.5% 0.163 36 / 0.18) 1px, transparent 1px)",
          backgroundSize: "22px 22px",
        }}
      />
      <svg
        viewBox="0 0 32 32"
        className="relative h-10 w-10 text-brand-700/45"
        aria-hidden="true"
      >
        {sectorIcon[sector]}
      </svg>
    </div>
  );
}
