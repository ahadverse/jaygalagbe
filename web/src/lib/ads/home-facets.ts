import { isAdBoosted, type Ad, type Sector } from "./types";

/* Every homepage browse section is derived from the ads already fetched, so
 * no count is shown that no listing backs. */

export type DistrictFacet = {
  district: string;
  total: number;
  land: number;
  house: number;
  areas: number;
};

export function districtFacets(ads: Ad[], limit = 6): DistrictFacet[] {
  const groups = new Map<
    string,
    { total: number; land: number; house: number; areas: Set<string> }
  >();

  for (const ad of ads) {
    let group = groups.get(ad.locationDistrict);
    if (!group) {
      group = { total: 0, land: 0, house: 0, areas: new Set() };
      groups.set(ad.locationDistrict, group);
    }
    group.total += 1;
    if (ad.sector === "LAND") group.land += 1;
    else group.house += 1;
    group.areas.add(ad.locationArea);
  }

  return [...groups.entries()]
    .map(([district, group]) => ({
      district,
      total: group.total,
      land: group.land,
      house: group.house,
      areas: group.areas.size,
    }))
    .sort((a, b) => b.total - a.total || a.district.localeCompare(b.district))
    .slice(0, limit);
}

export type BudgetBand = {
  id: string;
  label: string;
  minPrice?: number;
  maxPrice?: number;
  count: number;
};

type BandSpec = Omit<BudgetBand, "count">;

/* Brackets follow how prices are actually talked about here — lakh and crore
 * for plots, round monthly figures for rent. */
const bandSpecs: Record<Sector, BandSpec[]> = {
  LAND: [
    { id: "under-25l", label: "Under ৳25 lakh", maxPrice: 2_500_000 },
    { id: "25l-50l", label: "৳25 – ৳50 lakh", minPrice: 2_500_000, maxPrice: 5_000_000 },
    { id: "50l-1cr", label: "৳50 lakh – ৳1 crore", minPrice: 5_000_000, maxPrice: 10_000_000 },
    { id: "1cr-up", label: "৳1 crore & above", minPrice: 10_000_000 },
  ],
  HOUSE_RENT: [
    { id: "under-20k", label: "Under ৳20,000", maxPrice: 20_000 },
    { id: "20k-35k", label: "৳20,000 – ৳35,000", minPrice: 20_000, maxPrice: 35_000 },
    { id: "35k-50k", label: "৳35,000 – ৳50,000", minPrice: 35_000, maxPrice: 50_000 },
    { id: "50k-up", label: "৳50,000 & above", minPrice: 50_000 },
  ],
};

export function budgetBands(ads: Ad[], sector: Sector): BudgetBand[] {
  return bandSpecs[sector]
    .map((spec) => ({
      ...spec,
      count: ads.filter((ad) => {
        if (ad.sector !== sector) return false;
        const price = Number(ad.price);
        if (spec.minPrice != null && price < spec.minPrice) return false;
        if (spec.maxPrice != null && price >= spec.maxPrice) return false;
        return true;
      }).length,
    }))
    // A bracket with nothing behind it is a dead end, not an entry point.
    .filter((band) => band.count > 0);
}

export type FeaturedSelection = {
  ads: Ad[];
  /** True when these are boosts an advertiser paid for, not an editorial pick. */
  paid: boolean;
};

/*
 * Boosts win the slot whenever they exist — that is what owners pay
 * for, and a boost showing up twice on the page is the product working.
 *
 * Until the ads endpoint expands boosts there will never be any, so the
 * fallback has to earn the slot instead: one listing from each of three
 * districts, alternating sector, skipping anything the grid below already
 * shows. That gives a genuinely different cut of the data rather than a
 * second copy of the newest corner of Dhaka.
 */
export function selectFeatured(
  ads: Ad[],
  { limit = 3, exclude }: { limit?: number; exclude?: Iterable<string> } = {},
): FeaturedSelection {
  const boosted = ads.filter((ad) => isAdBoosted(ad));
  if (boosted.length > 0) {
    return { ads: boosted.slice(0, limit), paid: true };
  }

  const skip = new Set(exclude ?? []);
  const pool = ads
    .filter((ad) => !skip.has(ad.id))
    .sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );

  const districts = new Set<string>();
  const picked: Ad[] = [];
  for (let slot = 0; slot < limit; slot += 1) {
    const wanted: Sector = slot % 2 === 0 ? "LAND" : "HOUSE_RENT";
    const unseen = (ad: Ad) => !districts.has(ad.locationDistrict);
    const choice =
      pool.find((ad) => unseen(ad) && ad.sector === wanted) ?? pool.find(unseen);
    if (!choice) break;
    districts.add(choice.locationDistrict);
    picked.push(choice);
  }

  // A half-empty feature row looks broken; skip the band instead.
  return picked.length < limit
    ? { ads: [], paid: false }
    : { ads: picked, paid: false };
}
