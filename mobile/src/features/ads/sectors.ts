// Mirrors web/src/components/home/home-sector-context.tsx's homeSectors and
// web/src/lib/ads/sectors.ts's slug->enum mapping, kept as one small table
// since mobile doesn't (yet) need the rest of web's per-sector config
// (taglines, search placeholders, property type lists - those land with the
// sector listing / ad-form commits that actually use them).
export type SectorSlug = 'jayga-jomi' | 'basha-bhara';
export type Sector = 'LAND' | 'HOUSE_RENT';

export type SectorOption = {
  slug: SectorSlug;
  sector: Sector;
  label: string;
};

export const sectors: SectorOption[] = [
  { slug: 'jayga-jomi', sector: 'LAND', label: 'Jayga Jomi' },
  { slug: 'basha-bhara', sector: 'HOUSE_RENT', label: 'Basha Bhara' },
];

export function getSectorOption(slug: SectorSlug): SectorOption {
  const option = sectors.find((candidate) => candidate.slug === slug);
  if (!option) {
    throw new Error(`Unknown sector slug: ${slug}`);
  }
  return option;
}
