import type { Sector } from './sectors';

export type AdStatus = 'PENDING' | 'LIVE' | 'REJECTED' | 'SOLD' | 'REMOVED';

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

// Covers GET /ads, GET /ads/:id and GET /ads/mine - the backend returns the
// same full row from all three, trimmed here to the fields a mobile screen
// actually reads (see web/src/lib/ads/types.ts for the rest, e.g. `boosts`,
// which no endpoint mobile calls actually populates today).
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
  createdAt: string;
  updatedAt: string;
};
