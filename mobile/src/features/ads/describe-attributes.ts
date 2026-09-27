import type { Ad, HouseRentAttributes, LandAttributes } from './types';

export type AdFact = { label: string; value: string };

// Mirrors web/src/lib/ads/describe-attributes.ts's describeAdAttributes
// (the detail-page fact grid); card-level adHighlights isn't ported since
// AdCard doesn't show attribute chips yet.
export function describeAdAttributes(ad: Ad): AdFact[] {
  if (ad.sector === 'LAND') {
    const attrs = ad.attributes as LandAttributes | null;
    if (!attrs) return [];
    const facts: AdFact[] = [
      { label: 'Size', value: `${attrs.sizeKatha} katha` },
    ];
    if (attrs.propertyType) {
      facts.push({ label: 'Type', value: attrs.propertyType });
    }
    return facts;
  }

  const attrs = ad.attributes as HouseRentAttributes | null;
  if (!attrs) return [];
  const facts: AdFact[] = [
    { label: 'Bedrooms', value: String(attrs.bedrooms) },
  ];
  if (attrs.bathrooms != null) {
    facts.push({ label: 'Bathrooms', value: String(attrs.bathrooms) });
  }
  if (attrs.furnished != null) {
    facts.push({ label: 'Furnished', value: attrs.furnished ? 'Yes' : 'No' });
  }
  if (attrs.propertyType) {
    facts.push({ label: 'Type', value: attrs.propertyType });
  }
  return facts;
}
