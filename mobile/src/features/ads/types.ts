import type { Sector } from './sectors';

// Trimmed to the fields GET /ads (backend's findLive, no `include`) actually
// returns - full Ad has more (description, attributes, boosts on other
// endpoints, ...), added here when a screen that needs them lands.
export type Ad = {
  id: string;
  sector: Sector;
  title: string;
  price: string | number;
  locationArea: string;
  locationDistrict: string;
  photos: string[];
  createdAt: string;
};
