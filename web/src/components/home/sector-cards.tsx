import Link from "next/link";
import { Badge } from "@/components/ui";

const sectors = [
  {
    href: "/jayga-bikroy",
    badge: "Jayga Bikroy",
    title: "Land for sale",
    description:
      "Residential, commercial, and agricultural plots with verified ownership documents, size, and road width.",
    variant: "brand" as const,
  },
  {
    href: "/basa-bhara",
    badge: "Basa Bhara",
    title: "Houses for rent",
    description:
      "Flats, houses, rooms, and sublets with rent, deposit, furnishing status, and availability up front.",
    variant: "accent" as const,
  },
];

export function SectorCards() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-16">
      <div className="mb-8 flex flex-col gap-2 text-center">
        <h2 className="text-2xl font-semibold tracking-tight text-foreground">
          Two sectors, one trusted marketplace
        </h2>
        <p className="text-muted-foreground">
          Pick a sector to start browsing live, approved listings.
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        {sectors.map((sector) => (
          <Link
            key={sector.href}
            href={sector.href}
            className="group flex flex-col gap-4 rounded-xl border border-transparent bg-background p-6 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-lg"
          >
            <Badge variant={sector.variant}>{sector.badge}</Badge>
            <h3 className="text-xl font-semibold text-foreground">
              {sector.title}
            </h3>
            <p className="text-sm text-muted-foreground">
              {sector.description}
            </p>
            <span className="mt-auto text-sm font-medium text-primary group-hover:underline">
              Browse {sector.title.toLowerCase()} →
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
