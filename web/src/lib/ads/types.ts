export type Sector = "LAND" | "HOUSE_RENT";

export type AdStatus = "PENDING" | "LIVE" | "REJECTED" | "SOLD" | "REMOVED";

export type LandAttributes = {
  size?: number;
  sizeUnit?: "katha" | "decimal";
  /** Legacy: ads saved before units existed; always katha. */
  sizeKatha?: number;
  propertyType?: string;
  /** Absent means `total` — ads posted before this existed were always a
   * total asking price. */
  priceType?: "total" | "per_decimal";
};

export type HouseRentAttributes = {
  bedrooms: number;
  bathrooms?: number;
  furnished?: boolean;
  propertyType?: string;
};

export type AdBoost = {
  endAt: string;
};

export type Ad = {
  id: string;
  ownerId: string;
  /** First 3 digits of the advertiser phone, rest masked; detail endpoint only. */
  ownerPhoneMasked?: string | null;
  sector: Sector;
  title: string;
  description: string;
  price: string | number | null;
  /** Absent on ads written before worldwide locations existed — treat as Bangladesh. */
  locationCountry?: string | null;
  locationCountryCode?: string | null;
  /** Bangladesh: division. Elsewhere: state/province, when the country has one. */
  locationDivision?: string | null;
  /** Bangladesh: thana/upazila. Elsewhere: city. Always present. */
  locationArea: string;
  /** Bangladesh only — no other country in the dataset has this tier. */
  locationDistrict?: string | null;
  address?: string | null;
  photos: string[];
  attributes: LandAttributes | HouseRentAttributes | null;
  status: AdStatus;
  rejectionReason?: string | null;
  /** Present only on endpoints that expand boosts; absent means "not boosted". */
  boosts?: AdBoost[];
  createdAt: string;
  updatedAt: string;
};

export function isAdBoosted(ad: Ad, now = Date.now()): boolean {
  return (ad.boosts ?? []).some((boost) => new Date(boost.endAt).getTime() > now);
}

/**
 * "Savar, Dhaka" for Bangladesh (area, district); "Manhattan, New York" for
 * a country with states but no district tier; just "Manhattan" for one of
 * the 21 countries with no state data at all.
 */
export function formatAdLocation(ad: Ad): string {
  const region = ad.locationDistrict || ad.locationDivision;
  return region ? `${ad.locationArea}, ${region}` : ad.locationArea;
}
