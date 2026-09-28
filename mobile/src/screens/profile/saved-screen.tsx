import Ionicons from '@expo/vector-icons/Ionicons';
import { useQuery } from '@tanstack/react-query';
import type { ComponentProps } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { ActivityIndicator } from 'react-native-paper';

import { AdCard } from '../../components/ads/ad-card';
import { Eyebrow } from '../../components/brand/eyebrow';
import { getAd } from '../../features/ads/api';
import {
  useRecentlyViewedIds,
  useSavedAdIds,
} from '../../features/ads/local-lists';
import type { Ad } from '../../features/ads/types';
import type { ProfileStackScreenProps } from '../../navigation/types';
import { colors, fontFamily } from '../../theme/tokens';

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
  eyebrow,
  title,
  emptyText,
  emptyIcon,
  ids,
  onSelect,
}: {
  eyebrow: string;
  title: string;
  emptyText: string;
  emptyIcon: ComponentProps<typeof Ionicons>['name'];
  ids: string[];
  onSelect: (adId: string) => void;
}) {
  const { data: ads, isPending } = useAdsByIds(ids);

  return (
    <View style={styles.section}>
      <Eyebrow>{eyebrow}</Eyebrow>
      <Text style={styles.sectionTitle}>{title}</Text>
      {ids.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name={emptyIcon} size={30} color={colors.neutral[300]} />
          <Text style={styles.emptyText}>{emptyText}</Text>
        </View>
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
        eyebrow="Kept on this device"
        title="Saved listings"
        emptyText={
          'Tap "Save this ad" on any listing and it will be kept here on this device.'
        }
        emptyIcon="bookmark-outline"
        ids={savedIds}
        onSelect={open}
      />
      <AdSection
        eyebrow="Your trail"
        title="Recently viewed"
        emptyText="Listings you open will appear here so you can pick up where you left off."
        emptyIcon="time-outline"
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
    gap: 4,
  },
  sectionTitle: {
    fontFamily: fontFamily.display,
    fontSize: 20,
    letterSpacing: -0.4,
    color: colors.neutral[900],
    marginBottom: 10,
  },
  empty: {
    alignItems: 'center',
    gap: 10,
    paddingVertical: 28,
    paddingHorizontal: 24,
  },
  emptyText: {
    fontFamily: fontFamily.text,
    fontSize: 13,
    lineHeight: 19,
    textAlign: 'center',
    color: colors.neutral[500],
  },
});
