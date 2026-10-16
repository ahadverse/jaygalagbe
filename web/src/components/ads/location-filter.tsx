import { LocationCascade } from "./location-cascade";

/** Same country → division/state → district (Bangladesh only) → thana/city
 * cascade as the post-ad form, but every level optional — this narrows a
 * search, it doesn't have to pin down a single place. */
export function LocationFilter({
  country,
  countryCode,
  division,
  district,
  thana,
}: {
  country?: string;
  countryCode?: string;
  division?: string;
  district?: string;
  thana?: string;
}) {
  return (
    <LocationCascade
      value={{ country, countryCode, division, district, area: thana }}
    />
  );
}
