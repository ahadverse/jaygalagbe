import type { Ad, LandAttributes } from "./types";

export type SizeUnit = "katha" | "decimal";

export const SIZE_UNITS: { value: SizeUnit; label: string }[] = [
  { value: "katha", label: "Katha" },
  { value: "decimal", label: "Decimal (শতক)" },
];

// 1 katha = 720 sq ft and 1 decimal (shotok) = 435.6 sq ft. Katha differs by
// region, so change this one constant if the local conversion is different.
export const DECIMAL_PER_KATHA = 1.65;

export function toDecimal(value: number, unit: SizeUnit): number {
  return unit === "katha" ? value * DECIMAL_PER_KATHA : value;
}

// Ads saved before the unit dropdown only have `sizeKatha`.
export function getLandSize(
  attrs: LandAttributes | null | undefined,
): { value: number; unit: SizeUnit } | null {
  if (!attrs) return null;
  if (attrs.size != null) return { value: attrs.size, unit: attrs.sizeUnit ?? "katha" };
  if (attrs.sizeKatha != null) return { value: attrs.sizeKatha, unit: "katha" };
  return null;
}

export function formatLandSize(attrs: LandAttributes | null | undefined): string {
  const size = getLandSize(attrs);
  return size ? `${size.value} ${size.unit}` : "";
}

export function landSizeInDecimal(attrs: LandAttributes | null | undefined): number {
  const size = getLandSize(attrs);
  return size ? toDecimal(size.value, size.unit) : 0;
}

/**
 * The asking price as entered: a flat total, or a rate per decimal — set on
 * the listing form, shown next to the price everywhere it appears.
 */
export function isPerDecimalPrice(ad: Ad): boolean {
  return ad.sector === "LAND" && (ad.attributes as LandAttributes | null)?.priceType === "per_decimal";
}

/**
 * Normalizes any land ad's price to a comparable whole-plot total — a
 * per-decimal rate times the plot's size in decimals — so sorting and the
 * min/max price filters stay meaningful across listings priced either way.
 * House rent has no such concept and passes through unchanged.
 */
export function normalizedPrice(ad: Ad): number | null {
  if (ad.price == null) return null;
  const price = Number(ad.price);
  if (!isPerDecimalPrice(ad)) return price;
  return price * landSizeInDecimal(ad.attributes as LandAttributes | null);
}

/**
 * The rate per decimal — the figure itself when the ad was priced that way,
 * or the whole-plot total divided back down by size otherwise. `null` when
 * the size isn't known, so a rate per zero decimals is never shown.
 */
export function ratePerDecimal(ad: Ad): number | null {
  if (ad.sector !== "LAND") return null;
  const size = landSizeInDecimal(ad.attributes as LandAttributes | null);
  if (!size) return null;
  const total = normalizedPrice(ad);
  return total == null ? null : total / size;
}
