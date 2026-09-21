import { useCallback, useEffect, useState } from 'react';

export interface SavedView {
  id: string;
  name: string;
  /** Route this view belongs to, e.g. `/ads`. */
  path: string;
  /** The query string, without the leading `?`. */
  search: string;
  createdAt: number;
}

const STORAGE_KEY = 'jl_admin_saved_views';
const MAX_VIEWS = 30;

/** Fires when another hook instance writes, so every consumer re-reads. */
const CHANGE_EVENT = 'jl-saved-views-change';

function read(): SavedView[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as SavedView[]) : [];
  } catch {
    return [];
  }
}

function write(views: SavedView[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(views));
  } catch {
    // Out of quota or a locked-down profile — the list stays in memory only.
  }
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

/**
 * Named filter combinations, kept per browser.
 *
 * A view is just a path plus a query string, which works because every admin
 * table already keeps its entire state in the URL — so saving a view is
 * saving the URL, and restoring one is a navigation.
 */
export function useSavedViews() {
  const [views, setViews] = useState<SavedView[]>(read);

  useEffect(() => {
    const sync = () => setViews(read());
    window.addEventListener(CHANGE_EVENT, sync);
    // `storage` only fires in other tabs, which is exactly what it is for.
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener(CHANGE_EVENT, sync);
      window.removeEventListener('storage', sync);
    };
  }, []);

  const save = useCallback((name: string, path: string, search: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;

    const next: SavedView = {
      id: crypto.randomUUID(),
      name: trimmed,
      path,
      search: search.replace(/^\?/, ''),
      createdAt: Date.now(),
    };

    // Re-saving under an existing name replaces it rather than stacking up
    // three views all called "Overdue".
    const existing = read().filter(
      (view) =>
        !(view.path === path && view.name.toLowerCase() === trimmed.toLowerCase()),
    );
    write([next, ...existing].slice(0, MAX_VIEWS));
  }, []);

  const remove = useCallback((id: string) => {
    write(read().filter((view) => view.id !== id));
  }, []);

  return { views, save, remove };
}
