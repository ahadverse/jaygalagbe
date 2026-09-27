import { apiGet } from '../../api/client';
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
