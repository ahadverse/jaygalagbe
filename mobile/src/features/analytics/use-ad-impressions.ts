import { useCallback, useRef } from 'react';
import type { ViewToken } from 'react-native';

import { logImpression, type ImpressionContext } from './api';

// FlatList's viewabilityConfig already does the "at least X% visible for Y ms"
// bookkeeping natively, so this is the RN equivalent of web's per-card
// IntersectionObserver (components/analytics/use-impression-on-view.ts) -
// same thresholds, applied once per list instead of once per card.
export const AD_IMPRESSION_VIEWABILITY_CONFIG = {
  itemVisiblePercentThreshold: 25,
  minimumViewTime: 400,
};

type ViewableItem = { id: string };

export function useAdImpressions(context: ImpressionContext) {
  const pinged = useRef(new Set<string>());

  const onViewableItemsChanged = useCallback(
    ({ viewableItems }: { viewableItems: ViewToken<ViewableItem>[] }) => {
      for (const token of viewableItems) {
        const id = token.item?.id;
        if (!id || pinged.current.has(id)) continue;
        pinged.current.add(id);
        void logImpression(id, context);
      }
    },
    [context],
  );

  return onViewableItemsChanged;
}
