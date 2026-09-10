export type Sector = "LAND" | "HOUSE_RENT";

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
  sector: Sector;
  title: string;
  description: string;
  price: string | number;
  locationArea: string;
  locationDistrict: string;
  address?: string | null;
  photos: string[];
  attributes: LandAttributes | HouseRentAttributes | null;
  createdAt: string;
};
