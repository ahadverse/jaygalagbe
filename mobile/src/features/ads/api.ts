import { apiDelete, apiGet, apiPatch, apiPost } from '../../api/client';
import type { Sector } from './sectors';
import type { Ad } from './types';

export function getLiveAds(
  sector: Sector,
  options?: { take?: number },
): Promise<Ad[]> {
  const params = new URLSearchParams({ sector });
  if (options?.take) params.set('take', String(options.take));
  return apiGet<Ad[]>(`/ads?${params.toString()}`);
}

export function getAd(id: string): Promise<Ad> {
  return apiGet<Ad>(`/ads/${id}`);
}

export function getMyAds(): Promise<Ad[]> {
  return apiGet<Ad[]>('/ads/mine');
}

// Mirrors backend's CreateAdDto/UpdateAdDto - `attributes` is validated
// server-side against LandAttributesDto/HouseRentAttributesDto with
// forbidNonWhitelisted, so only send the fields that DTO declares.
export type AdInput = {
  sector: Sector;
  title: string;
  description: string;
  price: number;
  locationDivision: string;
  locationDistrict: string;
  locationArea: string;
  address?: string;
  photos?: string[];
  attributes: Record<string, unknown>;
};

export function createAd(input: AdInput): Promise<Ad> {
  return apiPost<Ad>('/ads', input);
}

export function updateAd(
  id: string,
  input: Partial<Omit<AdInput, 'sector'>>,
): Promise<Ad> {
  return apiPatch<Ad>(`/ads/${id}`, input);
}

export function deleteAd(id: string): Promise<void> {
  return apiDelete<void>(`/ads/${id}`);
}

export function markAdSold(id: string): Promise<Ad> {
  return apiPatch<Ad>(`/ads/${id}/mark-sold`);
}

export function resubmitAd(id: string): Promise<Ad> {
  return apiPatch<Ad>(`/ads/${id}/resubmit`);
}
