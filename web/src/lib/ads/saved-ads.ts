"use client";

import { useEffect, useSyncExternalStore } from "react";
import {
  getSavedAdIds as getLocalSavedIds,
  toggleSavedAd as toggleLocalSavedAd,
  clearLocalSavedAds,
  useLocalSavedAdIds,
} from "./local-lists";

/**
 * Saved ads live on the account so they follow the user across devices. A
 * visitor who is not signed in can still save into this browser (the old
 * behaviour); on the first signed-in load those ids are imported once and the
 * local copy is cleared.
 */
export type SavedAdsState = {
  /** `loading` until the first answer, then `user` (server) or `guest` (local). */
  status: "loading" | "user" | "guest";
  ids: string[];
};

const LOADING: SavedAdsState = { status: "loading", ids: [] };

let state: SavedAdsState = LOADING;
let inflight: Promise<void> | null = null;
const listeners = new Set<() => void>();

function setState(next: SavedAdsState) {
  state = next;
  for (const listener of listeners) listener();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

async function fetchServerIds(): Promise<{
  authenticated: boolean;
  adIds: string[];
}> {
  const response = await fetch("/api/saved-ads", { cache: "no-store" });
  if (!response.ok) throw new Error("saved ads unavailable");
  return (await response.json()) as { authenticated: boolean; adIds: string[] };
}

async function load(): Promise<void> {
  try {
    let result = await fetchServerIds();
    if (result.authenticated) {
      const local = getLocalSavedIds();
      if (local.length > 0) {
        // Only forget the local copy once the server confirmed the import.
        const response = await fetch("/api/saved-ads", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ adIds: local.slice(0, 50) }),
        });
        if (response.ok) {
          clearLocalSavedAds();
          result = await fetchServerIds();
        }
      }
      setState({ status: "user", ids: result.adIds });
    } else {
      setState({ status: "guest", ids: [] });
    }
  } catch {
    // Offline or backend blip: behave like a guest so the button still works.
    setState({ status: "guest", ids: [] });
  }
}

/** Loads once per page session; later callers share the same request. */
export function ensureSavedAdsLoaded(): Promise<void> {
  if (state.status === "loading" && !inflight) {
    inflight = load().finally(() => {
      inflight = null;
    });
  }
  return inflight ?? Promise.resolve();
}

export function useSavedAds(): SavedAdsState & { savedIds: string[] } {
  const current = useSyncExternalStore(
    subscribe,
    () => state,
    () => LOADING,
  );
  const localIds = useLocalSavedAdIds();

  useEffect(() => {
    void ensureSavedAdsLoaded();
  }, []);

  return {
    ...current,
    savedIds: current.status === "user" ? current.ids : localIds,
  };
}

/** Saves or unsaves, optimistically, and returns whether it is now saved. */
export async function toggleSaved(adId: string): Promise<boolean> {
  await ensureSavedAdsLoaded();

  if (state.status !== "user") {
    return toggleLocalSavedAd(adId);
  }

  const previous = state.ids;
  const saving = !previous.includes(adId);
  setState({
    status: "user",
    ids: saving ? [adId, ...previous] : previous.filter((id) => id !== adId),
  });

  try {
    const response = await fetch(
      saving
        ? "/api/saved-ads"
        : `/api/saved-ads?adId=${encodeURIComponent(adId)}`,
      saving
        ? {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ adId }),
          }
        : { method: "DELETE" },
    );
    if (!response.ok) throw new Error("save failed");
    return saving;
  } catch {
    setState({ status: "user", ids: previous });
    return !saving;
  }
}
