import Link from "next/link";
import { Button, Input, Select } from "@/components/ui";
import type { SectorConfig } from "@/lib/ads/sectors";

export type SectorFilterValues = {
  q?: string;
  location?: string;
  minPrice?: string;
  maxPrice?: string;
  propertyType?: string;
  minSize?: string;
  bedrooms?: string;
  sort?: string;
};

const bedroomOptions = [1, 2, 3, 4, 5];

export function SectorFilters({
  config,
  values,
  hasActiveFilters,
}: {
  config: SectorConfig;
  values: SectorFilterValues;
  hasActiveFilters: boolean;
}) {
  return (
    <form
      action={`/${config.slug}`}
      className="flex flex-col gap-4 rounded-xl border border-border bg-background p-4"
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Input
          name="q"
          label="Keyword"
          defaultValue={values.q}
          placeholder="e.g. corner plot, near school"
        />
        <Input
          name="location"
          label="Location"
          defaultValue={values.location}
          placeholder={config.searchPlaceholder}
        />
        <Input
          name="minPrice"
          type="number"
          min={0}
          label="Min price (৳)"
          defaultValue={values.minPrice}
        />
        <Input
          name="maxPrice"
          type="number"
          min={0}
          label="Max price (৳)"
          defaultValue={values.maxPrice}
        />

        <Select
          name="propertyType"
          label="Property type"
          defaultValue={values.propertyType ?? ""}
        >
          <option value="">Any</option>
          {config.propertyTypes.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </Select>

        {config.sector === "LAND" ? (
          <Input
            name="minSize"
            type="number"
            min={0}
            step="0.5"
            label="Min size (katha)"
            defaultValue={values.minSize}
          />
        ) : (
          <Select
            name="bedrooms"
            label="Min bedrooms"
            defaultValue={values.bedrooms ?? ""}
          >
            <option value="">Any</option>
            {bedroomOptions.map((count) => (
              <option key={count} value={count}>
                {count}+
              </option>
            ))}
          </Select>
        )}

        <Select name="sort" label="Sort by" defaultValue={values.sort ?? "newest"}>
          <option value="newest">Newest</option>
          <option value="price_asc">Price: low to high</option>
          <option value="price_desc">Price: high to low</option>
        </Select>
      </div>

      <div className="flex items-center gap-4">
        <Button type="submit">Apply filters</Button>
        {hasActiveFilters && (
          <Link
            href={`/${config.slug}`}
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            Clear filters
          </Link>
        )}
      </div>
    </form>
  );
}
