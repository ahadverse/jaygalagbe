import type { Sector } from "./types";

export type SectorConfig = {
  slug: string;
  sector: Sector;
  name: string;
  tagline: string;
  description: string;
  searchPlaceholder: string;
};

export const sectorConfigs: Record<string, SectorConfig> = {
  "jayga-bikroy": {
    slug: "jayga-bikroy",
    sector: "LAND",
    name: "Jayga Bikroy",
    tagline: "Land for sale",
    description:
      "Residential, commercial, and agricultural plots, verified before they go live.",
    searchPlaceholder: "Search by area, e.g. Bashundhara, Dhaka",
  },
  "basa-bhara": {
    slug: "basa-bhara",
    sector: "HOUSE_RENT",
    name: "Basa Bhara",
    tagline: "Houses for rent",
    description:
      "Flats, houses, rooms, and sublets, verified before they go live.",
    searchPlaceholder: "Search by area, e.g. Dhanmondi, Dhaka",
  },
};

export const sectorSlugs = Object.keys(sectorConfigs);

export function getSectorConfig(slug: string): SectorConfig | undefined {
  return sectorConfigs[slug];
}
