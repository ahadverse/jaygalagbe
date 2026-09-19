export type Sector = "LAND" | "HOUSE_RENT";

export type AdStatus = "PENDING" | "LIVE" | "REJECTED" | "SOLD" | "REMOVED";

export type LandAttributes = {
  sizeKatha: number;
  propertyType?: string;
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
  sector: Sector;
  title: string;
  description: string;
  price: string | number;
  locationDivision?: string | null;
  locationArea: string;
  locationDistrict: string;
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
