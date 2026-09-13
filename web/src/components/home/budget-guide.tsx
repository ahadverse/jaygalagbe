import Link from "next/link";
import type { BudgetBand } from "@/lib/ads/home-facets";

type Panel = {
  slug: string;
  name: string;
  note: string;
  bands: BudgetBand[];
};

function bandHref(slug: string, band: BudgetBand): string {
  const params = new URLSearchParams();
  if (band.minPrice != null) params.set("minPrice", String(band.minPrice));
  if (band.maxPrice != null) params.set("maxPrice", String(band.maxPrice));
  return `/${slug}?${params.toString()}`;
}

function BudgetPanel({ panel }: { panel: Panel }) {
  return (
    <div className="flex flex-col overflow-hidden rounded-2xl bg-card shadow-sm ring-1 ring-neutral-900/5">
      <div className="flex items-baseline justify-between gap-3 border-b border-border px-5 py-4">
        <h3 className="font-heading text-base font-bold tracking-tight text-foreground">
          {panel.name}
        </h3>
        <span className="eyebrow text-subtle-foreground">{panel.note}</span>
      </div>

      <ul className="flex flex-col divide-y divide-border">
        {panel.bands.map((band) => (
          <li key={band.id}>
            <Link
              href={bandHref(panel.slug, band)}
              className="group flex min-h-14 items-center gap-3 px-5 py-3.5 transition-colors duration-150 hover:bg-brand-50/60"
            >
              <span className="flex-1 text-sm font-medium text-foreground">
                {band.label}
              </span>
              <span className="numeric shrink-0 rounded-full bg-muted px-2.5 py-1 text-2xs font-semibold text-neutral-700 transition-colors duration-150 group-hover:bg-brand-100 group-hover:text-brand-800">
                {band.count}
              </span>
              <svg
                viewBox="0 0 24 24"
                aria-hidden="true"
                className="size-4 shrink-0 text-neutral-300 transition-[color,transform] duration-200 group-hover:translate-x-0.5 group-hover:text-primary"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="m9 6 6 6-6 6" />
              </svg>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function BudgetGuide({
  land,
  house,
}: {
  land: BudgetBand[];
  house: BudgetBand[];
}) {
  const panels: Panel[] = [];
  if (land.length > 0) {
    panels.push({
      slug: "jayga-jomi",
      name: "Jayga Jomi",
      note: "Asking price",
      bands: land,
    });
  }
  if (house.length > 0) {
    panels.push({
      slug: "basha-bhara",
      name: "Basha Bhara",
      note: "Monthly rent",
      bands: house,
    });
  }

  if (panels.length === 0) {
    return null;
  }

  return (
    <section
      aria-labelledby="budget-heading"
      className="border-y border-border bg-muted/60"
    >
      <div className="shell py-14 sm:py-20">
        <div className="mb-7 flex flex-col gap-2">
          <p className="eyebrow text-subtle-foreground">Start from a number</p>
          <h2
            id="budget-heading"
            className="font-heading text-2xl font-bold tracking-tight text-neutral-900 sm:text-3xl"
          >
            Browse by budget
          </h2>
          <p className="measure text-sm text-muted-foreground">
            Each bracket opens the listings already filtered to that price
            range.
          </p>
        </div>

        <div className="grid gap-5 lg:grid-cols-2">
          {panels.map((panel) => (
            <BudgetPanel key={panel.slug} panel={panel} />
          ))}
        </div>
      </div>
    </section>
  );
}
