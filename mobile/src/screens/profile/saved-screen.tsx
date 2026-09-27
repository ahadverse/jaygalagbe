import { useQuery } from '@tanstack/react-query';
import { ScrollView, StyleSheet, View } from 'react-native';
import { ActivityIndicator, Text, useTheme } from 'react-native-paper';

import { AdCard } from '../../components/ads/ad-card';
import { getAd } from '../../features/ads/api';
import {
  useRecentlyViewedIds,
  useSavedAdIds,
} from '../../features/ads/local-lists';
import type { Ad } from '../../features/ads/types';
import type { ProfileStackScreenProps } from '../../navigation/types';

// Re-fetches each id from the backend rather than trusting a stored
// snapshot - mirrors web's LocalAdsGrid, so a since-removed ad just silently
// drops out of the list instead of showing stale data.
function useAdsByIds(ids: string[]) {
  return useQuery({
    queryKey: ['ads', 'batch', ids.join(',')],
    queryFn: async () => {
      const results = await Promise.all(
        ids.map((id) => getAd(id).catch(() => null)),
      );
      return results.filter((ad): ad is Ad => ad !== null);
    },
    enabled: ids.length > 0,
  });
}

function AdSection({
  title,
  emptyText,
  ids,
  onSelect,
}: {
  title: string;
  emptyText: string;
  ids: string[];
  onSelect: (adId: string) => void;
}) {
  const theme = useTheme();
  const { data: ads, isPending } = useAdsByIds(ids);

  return (
    <View style={styles.section}>
      <Text variant="titleMedium">{title}</Text>
      {ids.length === 0 ? (
        <Text style={{ color: theme.colors.onSurfaceVariant }}>
          {emptyText}
        </Text>
      ) : isPending ? (
        <ActivityIndicator />
      ) : (
        (ads ?? []).map((ad) => (
          <AdCard key={ad.id} ad={ad} onPress={() => onSelect(ad.id)} />
        ))
      )}
    </View>
  );
}

export function SavedScreen({ navigation }: ProfileStackScreenProps<'Saved'>) {
  const savedIds = useSavedAdIds();
  const viewedIds = useRecentlyViewedIds();

  function open(adId: string) {
    navigation.navigate('AdDetail', { adId });
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <AdSection
        title="Saved listings"
        emptyText={
          'Tap "Save this ad" on any listing and it will be kept here on this device.'
        }
        ids={savedIds}
        onSelect={open}
      />
      <AdSection
        title="Recently viewed"
        emptyText="Listings you open will appear here so you can pick up where you left off."
        ids={viewedIds}
        onSelect={open}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    gap: 24,
  },
  section: {
    gap: 8,
  },
});
