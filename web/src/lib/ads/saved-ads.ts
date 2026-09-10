const STORAGE_KEY = "jl_saved_ads";

function readIds(): string[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((id) => typeof id === "string") : [];
  } catch {
    return [];
  }
}

function writeIds(ids: string[]): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  } catch {
    // Best-effort; saved ads are a local convenience, not critical state.
  }
}

export function getSavedAdIds(): string[] {
  return readIds();
}

export function isAdSaved(adId: string): boolean {
  return readIds().includes(adId);
}

export function toggleSavedAd(adId: string): boolean {
  const ids = readIds();
  const index = ids.indexOf(adId);
  if (index === -1) {
    writeIds([...ids, adId]);
    return true;
  }
  ids.splice(index, 1);
  writeIds(ids);
  return false;
}
