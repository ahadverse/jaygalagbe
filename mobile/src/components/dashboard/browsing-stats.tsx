import type { ViewStyle } from 'react-native';

import { useRecentlyViewedIds } from '../../features/ads/local-lists';
import { useSavedAdIds } from '../../features/ads/saved-ads';
import { StatCard } from './stat-card';

/** Counts that fill in once the saved list and device storage resolve. */
export function BrowsingStats({ cardStyle }: { cardStyle?: ViewStyle }) {
  const saved = useSavedAdIds().length;
  const viewed = useRecentlyViewedIds().length;

  return (
    <>
      <StatCard
        label="Saved"
        value={String(saved)}
        hint="Synced to your account"
        tone="info"
        icon="bookmark"
        style={cardStyle}
      />
      <StatCard
        label="Recently viewed"
        value={String(viewed)}
        hint="Listings you opened"
        icon="eye"
        style={cardStyle}
      />
    </>
  );
}
