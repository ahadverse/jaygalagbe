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

const searchIcon = (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.8}
    aria-hidden="true"
    className="size-4"
  >
    <circle cx="11" cy="11" r="7" />
    <path strokeLinecap="round" d="m20 20-3.5-3.5" />
  </svg>
);

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
      className="rounded-2xl bg-card p-4 shadow-md ring-1 ring-neutral-900/5 sm:p-5"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          name="q"
          label="Keyword"
          defaultValue={values.q}
          adornment={searchIcon}
          placeholder="e.g. corner plot, near school"
        />
        <Input
          name="location"
          label="Location"
          defaultValue={values.location}
          placeholder={config.searchPlaceholder}
        />
      </div>

      <div className="mt-4 grid gap-4 border-t border-border pt-4 sm:grid-cols-2 lg:grid-cols-4">
        <Input
          name="minPrice"
          type="number"
          inputMode="numeric"
          min={0}
          label="Min price"
          adornment="৳"
          placeholder="0"
          defaultValue={values.minPrice}
          className="numeric"
        />
        <Input
          name="maxPrice"
          type="number"
          inputMode="numeric"
          min={0}
          label="Max price"
          adornment="৳"
          placeholder="Any"
          defaultValue={values.maxPrice}
          className="numeric"
        />

        <Select
          name="propertyType"
          label="Property type"
          defaultValue={values.propertyType ?? ""}
        >
          <option value="">Any type</option>
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
            inputMode="decimal"
            step="0.5"
            min={0}
            label="Min size"
            placeholder="Katha"
            defaultValue={values.minSize}
            className="numeric"
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
      </div>

      <div className="mt-4 flex flex-wrap items-end justify-between gap-4 border-t border-border pt-4">
        <Select
          name="sort"
          label="Sort by"
          defaultValue={values.sort ?? "newest"}
          fieldClassName="w-full sm:w-52"
        >
          <option value="newest">Newest first</option>
          <option value="price_asc">Price: low to high</option>
          <option value="price_desc">Price: high to low</option>
        </Select>

        <div className="flex w-full items-center gap-3 sm:w-auto">
          <Button type="submit" className="flex-1 sm:flex-none">
            Apply filters
          </Button>
          {hasActiveFilters && (
            <Link
              href={`/${config.slug}`}
              className="shrink-0 rounded-full px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              Clear
            </Link>
          )}
        </div>
      </div>
    </form>
  );
}
