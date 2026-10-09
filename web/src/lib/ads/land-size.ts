import type { LandAttributes } from "./types";

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
