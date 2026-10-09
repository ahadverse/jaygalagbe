import type { Sector } from './sectors';
import { landSizeInDecimal, toDecimal, type SizeUnit } from './land-size';
import type { Ad, HouseRentAttributes, LandAttributes } from './types';

export type SortOption = 'newest' | 'price_asc' | 'price_desc';

export type AdFilters = {
  q?: string;
  location?: string;
  minPrice?: number;
  maxPrice?: number;
  propertyType?: string;
  minSize?: number;
  minSizeUnit?: SizeUnit;
  bedrooms?: number;
  sort?: SortOption;
};

// Mirrors web/src/lib/ads/filter-ads.ts exactly - the backend's GET /ads has
// no search/filter query params, so both apps fetch a live pool for the
// sector and filter it client-side.
function matchesKeyword(ad: Ad, q: string): boolean {
  const needle = q.toLowerCase();
  return (
    ad.title.toLowerCase().includes(needle) ||
    ad.description.toLowerCase().includes(needle)
  );
}

function matchesLocation(ad: Ad, location: string): boolean {
  const needle = location.toLowerCase();
  return (
    ad.locationArea.toLowerCase().includes(needle) ||
    ad.locationDistrict.toLowerCase().includes(needle)
  );
}

function matchesAttributes(
  ad: Ad,
  sector: Sector,
  filters: AdFilters,
): boolean {
  if (sector === 'LAND') {
    const attrs = ad.attributes as LandAttributes | null;
    if (filters.propertyType && attrs?.propertyType !== filters.propertyType) {
      return false;
    }
    if (filters.minSize != null && landSizeInDecimal(attrs) < toDecimal(filters.minSize, filters.minSizeUnit ?? 'katha')) {
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
    if (filters.location && !matchesLocation(ad, filters.location))
      return false;

    const price = Number(ad.price);
    if (filters.minPrice != null && price < filters.minPrice) return false;
    if (filters.maxPrice != null && price > filters.maxPrice) return false;

    return matchesAttributes(ad, sector, filters);
  });

  const sorted = [...filtered];
  if (filters.sort === 'price_asc') {
    sorted.sort((a, b) => Number(a.price) - Number(b.price));
  } else if (filters.sort === 'price_desc') {
    sorted.sort((a, b) => Number(b.price) - Number(a.price));
  } else {
    sorted.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  }

  return sorted;
}
