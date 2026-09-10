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
  className,
}: {
  sector: Sector;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "relative flex items-center justify-center overflow-hidden bg-gradient-to-br from-brand-100 via-neutral-100 to-accent-100",
        className,
      )}
    >
      <svg
        viewBox="0 0 32 32"
        className="h-10 w-10 text-brand-400/70"
        aria-hidden="true"
      >
        {sectorIcon[sector]}
      </svg>
    </div>
  );
}
