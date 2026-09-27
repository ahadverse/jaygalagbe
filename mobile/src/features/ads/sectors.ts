// Mirrors web/src/components/home/home-sector-context.tsx's homeSectors and
// web/src/lib/ads/sectors.ts's slug->enum mapping, now including the
// propertyTypes list the sector listing screen's filters need.
export type SectorSlug = 'jayga-jomi' | 'basha-bhara';
export type Sector = 'LAND' | 'HOUSE_RENT';

export type SectorOption = {
  slug: SectorSlug;
  sector: Sector;
  label: string;
  propertyTypes: string[];
};

export const sectors: SectorOption[] = [
  {
    slug: 'jayga-jomi',
    sector: 'LAND',
    label: 'Jayga Jomi',
    propertyTypes: ['Residential', 'Commercial', 'Agricultural'],
  },
  {
    slug: 'basha-bhara',
    sector: 'HOUSE_RENT',
    label: 'Basha Bhara',
    propertyTypes: ['Flat', 'House', 'Room', 'Sublet'],
  },
];

export function getSectorOption(slug: SectorSlug): SectorOption {
  const option = sectors.find((candidate) => candidate.slug === slug);
  if (!option) {
    throw new Error(`Unknown sector slug: ${slug}`);
  }
  return option;
}

export function getSectorOptionBySector(sector: Sector): SectorOption {
  const option = sectors.find((candidate) => candidate.sector === sector);
  if (!option) {
    throw new Error(`Unknown sector: ${sector}`);
  }
  return option;
}
