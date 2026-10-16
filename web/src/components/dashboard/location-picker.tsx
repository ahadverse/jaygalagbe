import { LocationCascade } from "@/components/ads/location-cascade";

/** Country → division/state → district (Bangladesh only) → thana/city. All
 * four are required here — see `LocationCascade` for the full cascade. */
export function LocationPicker({
  country,
  countryCode,
  division,
  district,
  thana,
}: {
  country?: string | null;
  countryCode?: string | null;
  division?: string | null;
  district?: string | null;
  thana?: string | null;
}) {
  return (
    <LocationCascade
      required
      value={{ country, countryCode, division, district, area: thana }}
    />
  );
}
