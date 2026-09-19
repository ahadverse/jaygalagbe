import Link from "next/link";
import { buttonVariants } from "@/components/ui";

const sectors = [
  {
    href: "/jayga-jomi",
    label: "Jayga Jomi",
    tagline: "Plots & land for sale",
    icon: (
      <path
        d="M4 20h24M7 20V9l9-5 9 5v11M12 20v-6h6v6"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    ),
  },
  {
    href: "/basha-bhara",
    label: "Basha Bhara",
    tagline: "Flats, houses & rooms to rent",
    icon: (
      <path
        d="M5 18V10l11-6 11 6v8M9 26V16h5v10M20 26h6v-7h-6v7Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    ),
  },
];

export function SectorSidebar({ counts }: { counts: Record<string, number> }) {
  return (
    <aside className="w-full shrink-0 lg:w-72">
      <div className="flex flex-col gap-3 lg:sticky lg:top-24">
        <p className="eyebrow px-1 text-subtle-foreground">Browse by category</p>

        <nav className="flex flex-col gap-2.5">
          {sectors.map((sector) => (
            <Link
              key={sector.href}
              href={sector.href}
              className="group flex items-center gap-3.5 rounded-xl bg-card p-3.5 shadow-sm ring-1 ring-neutral-900/5 transition-[transform,box-shadow] duration-200 ease-soft hover:-translate-y-0.5 hover:shadow-md active:translate-y-0"
            >
              <span className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-700 ring-1 ring-brand-100 transition-colors duration-200 group-hover:bg-brand-100">
                <svg viewBox="0 0 32 32" className="size-5" aria-hidden="true">
                  {sector.icon}
                </svg>
              </span>
              <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                <span className="font-heading text-sm font-bold text-foreground transition-colors duration-200 group-hover:text-primary">
                  {sector.label}
                </span>
                <span className="truncate text-xs text-muted-foreground">
                  {sector.tagline}
                </span>
              </span>
              <span className="numeric shrink-0 rounded-full bg-muted px-2 py-1 text-2xs font-semibold text-neutral-700">
                {counts[sector.href] ?? 0}
              </span>
            </Link>
          ))}
        </nav>

        <div className="mt-2 flex flex-col gap-3 rounded-xl bg-neutral-900 p-5 text-white">
          <div className="flex flex-col gap-1.5">
            <p className="font-heading text-base font-bold">
              Have a property to list?
            </p>
            <p className="text-xs leading-relaxed text-neutral-300">
              Post it free, get reviewed within a day, and boost it to the top
              whenever you want more eyes on it.
            </p>
          </div>
          <Link
            href="/dashboard/ads/new"
            className={buttonVariants({ variant: "accent", size: "sm" })}
          >
            Post an ad
          </Link>
        </div>
      </div>
    </aside>
  );
}
