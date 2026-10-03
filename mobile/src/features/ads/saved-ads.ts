import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';

import { apiDelete, apiGet, apiPost } from '../../api/client';
import { useAuth } from '../auth/auth-context';
import {
  clearLocalSavedAds,
  getSavedAdIds as getLocalSavedIds,
  toggleSavedAd as toggleLocalSavedAd,
  useLocalSavedAdIds,
} from './local-lists';

// Saved ads live on the account so they follow the user across devices (same
// as web's lib/ads/saved-ads.ts). A guest can still save into AsyncStorage;
// the first signed-in fetch imports those ids once and clears the local copy.
// Offline or failing requests fall back to the last cached ids.

const MAX_IMPORT = 50;

function savedIdsKey(userId: string | undefined) {
  return ['saved-ads', 'ids', userId ?? 'guest'] as const;
}

async function fetchSavedIds(): Promise<string[]> {
  const local = await getLocalSavedIds();
  if (local.length > 0) {
    // Ads that are gone 404 individually; keep going so one stale id does
    // not strand the rest.
    const results = await Promise.allSettled(
      local
        .slice(0, MAX_IMPORT)
        .map((adId) => apiPost<void>(`/ads/${adId}/save`)),
    );
    // Only forget the local copy if nothing failed for a reason other than
    // the ad being gone, so a network blip cannot lose the guest's list.
    const lostToNetwork = results.some(
      (r) =>
        r.status === 'rejected' &&
        (r.reason as { status?: number } | undefined)?.status !== 404,
    );
    if (!lostToNetwork) await clearLocalSavedAds();
  }
  const { adIds } = await apiGet<{ adIds: string[] }>('/saved-ads/ids');
  return adIds;
}

/** Saved ad ids for the signed-in account, or this device's list for guests. */
export function useSavedAdIds(): string[] {
  const { user } = useAuth();
  const localIds = useLocalSavedAdIds();
  const { data } = useQuery({
    queryKey: savedIdsKey(user?.id),
    queryFn: fetchSavedIds,
    enabled: Boolean(user),
  });
  return user ? (data ?? []) : localIds;
}

/** Returns a function that saves/unsaves optimistically; resolves to the new state. */
export function useToggleSavedAd(): (adId: string) => Promise<boolean> {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useCallback(
    async (adId: string) => {
      if (!user) return toggleLocalSavedAd(adId);

      const key = savedIdsKey(user.id);
      const previous = queryClient.getQueryData<string[]>(key) ?? [];
      const saving = !previous.includes(adId);
      queryClient.setQueryData<string[]>(
        key,
        saving ? [adId, ...previous] : previous.filter((id) => id !== adId),
      );

      try {
        if (saving) await apiPost<void>(`/ads/${adId}/save`);
        else await apiDelete<void>(`/ads/${adId}/save`);
        return saving;
      } catch {
        queryClient.setQueryData<string[]>(key, previous);
        return !saving;
      } finally {
        void queryClient.invalidateQueries({ queryKey: ['ads', 'batch'] });
      }
    },
    [user, queryClient],
  );
}
