"use client";

import { useSyncExternalStore } from "react";

const SAVED_KEY = "jl_saved_ads";
const VIEWED_KEY = "jl_recent_ads";
const MAX_VIEWED = 12;

/**
 * Saved and recently-viewed listings are per-browser, not per-account: a
 * visitor can collect listings before signing up, and nothing about what they
 * browsed leaves the device.
 */
const listeners = new Set<() => void>();

function notify() {
  for (const listener of listeners) listener();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  window.addEventListener("storage", listener);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", listener);
  };
}

function read(key: string): string[] {
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed)
      ? parsed.filter((id): id is string => typeof id === "string")
      : [];
  } catch {
    return [];
  }
}

function write(key: string, ids: string[]): void {
  try {
    window.localStorage.setItem(key, JSON.stringify(ids));
  } catch {
    // A locked-down browser just means the list does not persist.
  }
  notify();
}

// useSyncExternalStore compares snapshots by identity, so each list is cached
// and only replaced when its serialised form actually changes.
const snapshots = new Map<string, { raw: string; value: string[] }>();

function snapshot(key: string): string[] {
  const ids = read(key);
  const raw = JSON.stringify(ids);
  const cached = snapshots.get(key);
  if (cached && cached.raw === raw) {
    return cached.value;
  }
  snapshots.set(key, { raw, value: ids });
  return ids;
}

const EMPTY: string[] = [];

function useLocalIds(key: string): string[] {
  return useSyncExternalStore(
    subscribe,
    () => snapshot(key),
    () => EMPTY,
  );
}

export function getSavedAdIds(): string[] {
  return read(SAVED_KEY);
}

export function isAdSaved(adId: string): boolean {
  return read(SAVED_KEY).includes(adId);
}

export function toggleSavedAd(adId: string): boolean {
  const ids = read(SAVED_KEY);
  const index = ids.indexOf(adId);
  if (index === -1) {
    write(SAVED_KEY, [...ids, adId]);
    return true;
  }
  write(SAVED_KEY, ids.toSpliced(index, 1));
  return false;
}

export function useSavedAdIds(): string[] {
  return useLocalIds(SAVED_KEY);
}

export function getRecentlyViewedIds(): string[] {
  return read(VIEWED_KEY);
}

export function recordAdView(adId: string): void {
  const ids = read(VIEWED_KEY);
  const next = [adId, ...ids.filter((id) => id !== adId)].slice(0, MAX_VIEWED);
  if (next.join(",") !== ids.join(",")) {
    write(VIEWED_KEY, next);
  }
}

export function useRecentlyViewedIds(): string[] {
  return useLocalIds(VIEWED_KEY);
}
