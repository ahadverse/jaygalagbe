import type { Sector } from "./types";

export type SectorConfig = {
  slug: string;
  sector: Sector;
  name: string;
  tagline: string;
  description: string;
  searchPlaceholder: string;
  propertyTypes: string[];
};

export const sectorConfigs: Record<string, SectorConfig> = {
  "jayga-jomi": {
    slug: "jayga-jomi",
    sector: "LAND",
    name: "Jayga Jomi",
    tagline: "Land for sale",
    description:
      "Residential, commercial, and agricultural plots, verified before they go live.",
    searchPlaceholder: "Search by area, e.g. Bashundhara, Dhaka",
    propertyTypes: ["Residential", "Commercial", "Agricultural"],
  },
  "basha-bhara": {
    slug: "basha-bhara",
    sector: "HOUSE_RENT",
    name: "Basha Bhara",
    tagline: "Houses for rent",
    description:
      "Flats, houses, rooms, and sublets, verified before they go live.",
    searchPlaceholder: "Search by area, e.g. Dhanmondi, Dhaka",
    propertyTypes: ["Flat", "House", "Room", "Sublet"],
  },
};

export const sectorSlugs = Object.keys(sectorConfigs);

export function getSectorConfig(slug: string): SectorConfig | undefined {
  return sectorConfigs[slug];
}
