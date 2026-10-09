import type { Sector } from './sectors';

export type AdStatus = 'PENDING' | 'LIVE' | 'REJECTED' | 'SOLD' | 'REMOVED';

export type LandAttributes = {
  size?: number;
  sizeUnit?: 'katha' | 'decimal';
  /** Legacy: ads saved before units existed; always katha. */
  sizeKatha?: number;
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
  /** First 3 digits of the advertiser phone, rest masked; detail endpoint only. */
  ownerPhoneMasked?: string | null;
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
