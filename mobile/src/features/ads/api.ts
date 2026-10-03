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

/** The backend's own ceiling - ads.service.ts clamps /ads to 200 rows. */
export const LIVE_ADS_TAKE = 200;

/*
 * Home and the sector listing both want every live ad in a sector: home
 * derives its district/budget facets from the whole set the same way web's
 * page.tsx does, and the listing screen filters it client-side. Sharing one
 * query descriptor means they share one cache entry, so opening a sector from
 * home costs no round trip.
 */
export function liveAdsQuery(sector: Sector) {
  return {
    queryKey: ['ads', 'live', sector, 'browse'] as const,
    queryFn: () => getLiveAds(sector, { take: LIVE_ADS_TAKE }),
  };
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
