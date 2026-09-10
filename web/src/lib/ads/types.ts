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

export type Ad = {
  id: string;
  ownerId: string;
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
  rejectionReason?: string | null;
  createdAt: string;
  updatedAt: string;
};
