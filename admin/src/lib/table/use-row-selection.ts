import { useCallback, useMemo, useState } from 'react';

/**
 * Checkbox selection for a paginated table.
 *
 * Selection is scoped to what is currently on screen: when the page, filters
 * or sort change, the ids underneath change with them, and acting on a
 * selection the moderator can no longer see is exactly the mistake a bulk
 * action must not make. So the set is cleared whenever the visible rows
 * change identity.
 */
export function useRowSelection(visibleIds: string[]) {
  const [selected, setSelected] = useState<Set<string>>(() => new Set());

  // A stable key for "this exact set of rows", so the reset below triggers on
  // a real page change rather than on every render's new array instance.
  const pageKey = visibleIds.join(',');

  // Adjusted during render rather than in an effect: an effect would leave the
  // stale selection visible for a frame, and the bulk bar would briefly offer
  // to act on rows that are no longer on screen.
  const [seenPageKey, setSeenPageKey] = useState(pageKey);
  if (pageKey !== seenPageKey) {
    setSeenPageKey(pageKey);
    if (selected.size > 0) setSelected(new Set());
  }

  const toggle = useCallback((id: string) => {
    setSelected((current) => {
      const next = new Set(current);
      if (!next.delete(id)) next.add(id);
      return next;
    });
  }, []);

  const toggleAll = useCallback(() => {
    setSelected((current) =>
      current.size === visibleIds.length ? new Set() : new Set(visibleIds),
    );
  }, [visibleIds]);

  const clear = useCallback(() => setSelected(new Set()), []);

  const ids = useMemo(
    // Ordered as the table shows them, not as they were clicked.
    () => visibleIds.filter((id) => selected.has(id)),
    [visibleIds, selected],
  );

  return {
    selected,
    ids,
    count: ids.length,
    allSelected: visibleIds.length > 0 && ids.length === visibleIds.length,
    someSelected: ids.length > 0 && ids.length < visibleIds.length,
    isSelected: (id: string) => selected.has(id),
    toggle,
    toggleAll,
    clear,
  };
}

export type RowSelection = ReturnType<typeof useRowSelection>;
