import type { Ad, HouseRentAttributes, LandAttributes } from "./types";

export type AdFact = { label: string; value: string };

export function describeAdAttributes(ad: Ad): AdFact[] {
  if (ad.sector === "LAND") {
    const attrs = ad.attributes as LandAttributes | null;
    if (!attrs) return [];
    const facts: AdFact[] = [{ label: "Size", value: `${attrs.sizeKatha} katha` }];
    if (attrs.propertyType) {
      facts.push({ label: "Type", value: attrs.propertyType });
    }
    return facts;
  }

  const attrs = ad.attributes as HouseRentAttributes | null;
  if (!attrs) return [];
  const facts: AdFact[] = [{ label: "Bedrooms", value: String(attrs.bedrooms) }];
  if (attrs.bathrooms != null) {
    facts.push({ label: "Bathrooms", value: String(attrs.bathrooms) });
  }
  if (attrs.furnished != null) {
    facts.push({ label: "Furnished", value: attrs.furnished ? "Yes" : "No" });
  }
  if (attrs.propertyType) {
    facts.push({ label: "Type", value: attrs.propertyType });
  }
  return facts;
}

export type AdHighlight = { key: string; icon: "size" | "bed" | "bath" | "type"; text: string };

/*
 * Card-sized attribute chips. Unlike the detail-page facts these carry their
 * own unit — a bare "2" next to a bare "1" tells a scanner nothing.
 */
export function adHighlights(ad: Ad): AdHighlight[] {
  if (ad.sector === "LAND") {
    const attrs = ad.attributes as LandAttributes | null;
    if (!attrs) return [];
    const highlights: AdHighlight[] = [
      { key: "size", icon: "size", text: `${attrs.sizeKatha} katha` },
    ];
    if (attrs.propertyType) {
      highlights.push({ key: "type", icon: "type", text: attrs.propertyType });
    }
    return highlights;
  }

  const attrs = ad.attributes as HouseRentAttributes | null;
  if (!attrs) return [];
  const highlights: AdHighlight[] = [
    {
      key: "bed",
      icon: "bed",
      text: `${attrs.bedrooms} ${attrs.bedrooms === 1 ? "bed" : "beds"}`,
    },
  ];
  if (attrs.bathrooms != null) {
    highlights.push({
      key: "bath",
      icon: "bath",
      text: `${attrs.bathrooms} ${attrs.bathrooms === 1 ? "bath" : "baths"}`,
    });
  }
  if (attrs.propertyType) {
    highlights.push({
      key: "type",
      icon: "type",
      text: attrs.furnished ? `Furnished ${attrs.propertyType.toLowerCase()}` : attrs.propertyType,
    });
  } else if (attrs.furnished) {
    highlights.push({ key: "type", icon: "type", text: "Furnished" });
  }
  return highlights;
}
