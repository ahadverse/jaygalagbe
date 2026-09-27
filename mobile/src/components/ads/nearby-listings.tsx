import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';

import type { Ad } from '../../features/ads/types';
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
      <Text variant="titleMedium" style={styles.heading}>
        {heading}
      </Text>
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
  heading: {
    marginBottom: 12,
  },
});
