import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import {
  ActivityIndicator,
  Chip,
  SegmentedButtons,
  Searchbar,
  Text,
  useTheme,
} from 'react-native-paper';

import { AdCard } from '../../components/ads/ad-card';
import { getLiveAds } from '../../features/ads/api';
import { sectors, type SectorSlug } from '../../features/ads/sectors';
import type { Ad } from '../../features/ads/types';
import {
  AD_IMPRESSION_VIEWABILITY_CONFIG,
  useAdImpressions,
} from '../../features/analytics/use-ad-impressions';
import type { HomeStackScreenProps } from '../../navigation/types';

// Mirrors web/src/components/home/hero.tsx's hardcoded shortlist - same
// reasoning applies here (a handful of areas people actually search, not a
// full district list; that's the district-browse section web has and this
// trimmed mobile home screen intentionally drops, see app.md).
const POPULAR_AREAS = [
  'Dhanmondi',
  'Bashundhara',
  'Uttara',
  'Chattogram',
  'Sylhet',
];

const LATEST_TAKE = 10;

export function HomeScreen({ navigation }: HomeStackScreenProps<'Home'>) {
  const theme = useTheme();
  const [sector, setSector] = useState<SectorSlug>(sectors[0].slug);
  const [location, setLocation] = useState('');
  const onViewableItemsChanged = useAdImpressions('HOMEPAGE');

  const {
    data: ads,
    isPending,
    isError,
  } = useQuery({
    queryKey: ['ads', 'live', sector, LATEST_TAKE],
    queryFn: () =>
      getLiveAds(sectors.find((option) => option.slug === sector)!.sector, {
        take: LATEST_TAKE,
      }),
  });

  function goToSectorListing(nextLocation?: string) {
    navigation.navigate('SectorListing', {
      sector,
      location: nextLocation?.trim() || undefined,
    });
  }

  return (
    <FlatList<Ad>
      data={ads ?? []}
      keyExtractor={(ad) => ad.id}
      renderItem={({ item }) => (
        <AdCard
          ad={item}
          onPress={() => navigation.push('AdDetail', { adId: item.id })}
        />
      )}
      onViewableItemsChanged={onViewableItemsChanged}
      viewabilityConfig={AD_IMPRESSION_VIEWABILITY_CONFIG}
      contentContainerStyle={styles.listContent}
      ListHeaderComponent={
        <View style={styles.header}>
          <SegmentedButtons
            value={sector}
            onValueChange={(value) => setSector(value as SectorSlug)}
            buttons={sectors.map((option) => ({
              value: option.slug,
              label: option.label,
            }))}
          />

          <Searchbar
            placeholder="Area or district - e.g. Dhanmondi, Dhaka"
            value={location}
            onChangeText={setLocation}
            onSubmitEditing={() => goToSectorListing(location)}
            onIconPress={() => goToSectorListing(location)}
          />

          <View style={styles.chipRow}>
            {POPULAR_AREAS.map((area) => (
              <Chip key={area} onPress={() => goToSectorListing(area)}>
                {area}
              </Chip>
            ))}
          </View>

          <Text variant="titleMedium" style={styles.sectionTitle}>
            Latest listings
          </Text>

          {isPending ? (
            <ActivityIndicator style={styles.stateIndicator} />
          ) : null}
          {isError ? (
            <Text
              style={[styles.stateIndicator, { color: theme.colors.error }]}
            >
              Couldn&apos;t load listings. Pull down to try again.
            </Text>
          ) : null}
          {!isPending && !isError && ads?.length === 0 ? (
            <Text
              style={[
                styles.stateIndicator,
                { color: theme.colors.onSurfaceVariant },
              ]}
            >
              No listings yet - check back shortly.
            </Text>
          ) : null}
        </View>
      }
    />
  );
}

const styles = StyleSheet.create({
  listContent: {
    padding: 16,
  },
  header: {
    gap: 16,
    marginBottom: 8,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  sectionTitle: {
    marginTop: 4,
  },
  stateIndicator: {
    marginTop: 8,
    textAlign: 'center',
  },
});
