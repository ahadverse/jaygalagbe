import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';

import type { Ad } from '../../features/ads/types';
import { Eyebrow } from '../brand/eyebrow';
import { AdCard } from './ad-card';

// Plain AdCards, not impression-tracked: a related-listing render isn't a
// feed impression and would skew the owner's funnel - mirrors
// web/src/components/ads/nearby-listings.tsx's own comment on this.
export function NearbyListings({
  ads,
  heading,
  onSelect,
}: {
  ads: Ad[];
  heading: string;
  onSelect: (adId: string) => void;
}) {
  if (ads.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.headingBlock}>
        <Eyebrow>Keep looking</Eyebrow>
        <Text variant="headlineSmall" style={styles.heading}>
          {heading}
        </Text>
      </View>
      {ads.map((ad) => (
        <AdCard key={ad.id} ad={ad} onPress={() => onSelect(ad.id)} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 16,
  },
  headingBlock: {
    gap: 4,
    marginBottom: 12,
  },
  // The heading wraps to two lines on narrow phones; web's `text-xl sm:text-2xl`
  // steps down for the same reason.
  heading: {
    fontSize: 20,
    lineHeight: 26,
  },
});
