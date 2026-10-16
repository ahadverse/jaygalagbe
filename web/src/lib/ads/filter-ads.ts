import { landSizeInDecimal, normalizedPrice, toDecimal, type SizeUnit } from "./land-size";
import type { Ad, HouseRentAttributes, LandAttributes, Sector } from "./types";

export type SortOption = "newest" | "price_asc" | "price_desc";

export type AdFilters = {
  q?: string;
  location?: string;
  /** Exact match against the country/division/district/thana cascade, as
   * opposed to `location`'s free-text substring search. */
  country?: string;
  division?: string;
  district?: string;
  thana?: string;
  minPrice?: number;
  maxPrice?: number;
  propertyType?: string;
  minSize?: number;
  minSizeUnit?: SizeUnit;
  bedrooms?: number;
  sort?: SortOption;
};

function matchesKeyword(ad: Ad, q: string): boolean {
  const needle = q.toLowerCase();
  return (
    ad.title.toLowerCase().includes(needle) ||
    ad.description.toLowerCase().includes(needle)
  );
}

function matchesLocation(ad: Ad, location: string): boolean {
  const needle = location.toLowerCase();
  const region = ad.locationDistrict || ad.locationDivision || "";
  return (
    ad.locationArea.toLowerCase().includes(needle) ||
    region.toLowerCase().includes(needle)
  );
}

function matchesAttributes(ad: Ad, sector: Sector, filters: AdFilters): boolean {
  if (sector === "LAND") {
    const attrs = ad.attributes as LandAttributes | null;
    if (filters.propertyType && attrs?.propertyType !== filters.propertyType) {
      return false;
    }
    if (filters.minSize != null && landSizeInDecimal(attrs) < toDecimal(filters.minSize, filters.minSizeUnit ?? "katha")) {
      return false;
    }
    return true;
  }

  const attrs = ad.attributes as HouseRentAttributes | null;
  if (filters.propertyType && attrs?.propertyType !== filters.propertyType) {
    return false;
  }
  if (filters.bedrooms != null && (attrs?.bedrooms ?? 0) < filters.bedrooms) {
    return false;
  }
  return true;
}

export function filterAndSortAds(
  ads: Ad[],
  sector: Sector,
  filters: AdFilters,
): Ad[] {
  const filtered = ads.filter((ad) => {
    if (filters.q && !matchesKeyword(ad, filters.q)) return false;
    if (filters.location && !matchesLocation(ad, filters.location)) return false;
    // Ads written before worldwide locations existed have no stored
    // country — they're all Bangladesh.
    if (filters.country && (ad.locationCountry || "Bangladesh") !== filters.country) {
      return false;
    }
    if (filters.division && ad.locationDivision !== filters.division) return false;
    if (filters.district && ad.locationDistrict !== filters.district) return false;
    if (filters.thana && ad.locationArea !== filters.thana) return false;

    // A per-decimal land price is normalized to the whole-plot total first,
    // so a ৳50,000/decimal listing doesn't look cheaper than an actual
    // ৳50,000 total just because of how the owner entered it.
    const price = normalizedPrice(ad);
    if (price != null) {
      if (filters.minPrice != null && price < filters.minPrice) return false;
      if (filters.maxPrice != null && price > filters.maxPrice) return false;
    }

    return matchesAttributes(ad, sector, filters);
  });

  const sorted = [...filtered];
  // Ads with no stated price ("negotiable") always sort to the end, in
  // either direction — a null would otherwise make them look like the
  // cheapest listing on the page.
  const priceOrInfinity = (ad: Ad) => normalizedPrice(ad) ?? Infinity;
  if (filters.sort === "price_asc") {
    sorted.sort((a, b) => priceOrInfinity(a) - priceOrInfinity(b));
  } else if (filters.sort === "price_desc") {
    sorted.sort((a, b) => {
      const priceA = normalizedPrice(a);
      const priceB = normalizedPrice(b);
      if (priceA == null) return 1;
      if (priceB == null) return -1;
      return priceB - priceA;
    });
  } else {
    sorted.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  }

  return sorted;
}
