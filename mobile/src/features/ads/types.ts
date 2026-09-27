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

// Covers both GET /ads (list) and GET /ads/:id (detail) - the backend
// returns the same full row from both, trimmed here to the fields a mobile
// screen actually reads (see web/src/lib/ads/types.ts for the rest, e.g.
// ownerId/rejectionReason/boosts, none of which are used yet).
export type Ad = {
  id: string;
  sector: Sector;
  title: string;
  description: string;
  price: string | number;
  locationArea: string;
  locationDistrict: string;
  address?: string | null;
  photos: string[];
  attributes: LandAttributes | HouseRentAttributes | null;
  status: AdStatus;
  createdAt: string;
  updatedAt: string;
};
