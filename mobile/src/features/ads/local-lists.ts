import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';

// Mirrors web/src/lib/ads/local-lists.ts: recently-viewed is device-local, and
// a guest's saved list sits here until sign-in imports it into the account
// (see saved-ads.ts); nothing about what a visitor browsed leaves the device - same keys, same id-only storage format,
// same caps/ordering, just AsyncStorage instead of localStorage and a plain
// subscribe/notify hook instead of useSyncExternalStore (AsyncStorage is
// async, so a snapshot can't be read synchronously the way localStorage's can).
const SAVED_KEY = 'jl_saved_ads';
const VIEWED_KEY = 'jl_recent_ads';
const MAX_VIEWED = 12;

type Listener = () => void;
const listeners = new Map<string, Set<Listener>>();

function notify(key: string) {
  for (const listener of listeners.get(key) ?? []) listener();
}

function subscribe(key: string, listener: Listener): () => void {
  if (!listeners.has(key)) listeners.set(key, new Set());
  listeners.get(key)!.add(listener);
  return () => listeners.get(key)?.delete(listener);
}

async function read(key: string): Promise<string[]> {
  try {
    const raw = await AsyncStorage.getItem(key);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed)
      ? parsed.filter((id): id is string => typeof id === 'string')
      : [];
  } catch {
    return [];
  }
}

async function write(key: string, ids: string[]): Promise<void> {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(ids));
  } catch {
    // Best-effort, same as web: the list just doesn't persist this time.
  }
  notify(key);
}

/** Hook that re-reads a key's id list whenever it changes. */
function useLocalIds(key: string): string[] {
  const [ids, setIds] = useState<string[]>([]);

  useEffect(() => {
    let cancelled = false;
    const load = () => {
      void read(key).then((next) => {
        if (!cancelled) setIds(next);
      });
    };
    load();
    const unsubscribe = subscribe(key, load);
    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, [key]);

  return ids;
}

export function getSavedAdIds(): Promise<string[]> {
  return read(SAVED_KEY);
}

export async function clearLocalSavedAds(): Promise<void> {
  await write(SAVED_KEY, []);
}

export async function isAdSaved(adId: string): Promise<boolean> {
  return (await read(SAVED_KEY)).includes(adId);
}

/** Toggles the id and returns whether it's now saved (true) or removed (false). */
export async function toggleSavedAd(adId: string): Promise<boolean> {
  const ids = await read(SAVED_KEY);
  const isSaved = ids.includes(adId);
  await write(
    SAVED_KEY,
    isSaved ? ids.filter((id) => id !== adId) : [...ids, adId],
  );
  return !isSaved;
}

export function useLocalSavedAdIds(): string[] {
  return useLocalIds(SAVED_KEY);
}

export function getRecentlyViewedIds(): Promise<string[]> {
  return read(VIEWED_KEY);
}

export async function recordAdView(adId: string): Promise<void> {
  const ids = await read(VIEWED_KEY);
  await write(
    VIEWED_KEY,
    [adId, ...ids.filter((id) => id !== adId)].slice(0, MAX_VIEWED),
  );
}

export function useRecentlyViewedIds(): string[] {
  return useLocalIds(VIEWED_KEY);
}
