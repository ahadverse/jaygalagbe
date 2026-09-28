import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { ActivityIndicator, Text } from 'react-native-paper';

import { AdCard } from '../../components/ads/ad-card';
import { Eyebrow } from '../../components/brand/eyebrow';
import { Hero } from '../../components/home/hero';
import { getLiveAds } from '../../features/ads/api';
import { sectors, type SectorSlug } from '../../features/ads/sectors';
import type { Ad } from '../../features/ads/types';
import {
  AD_IMPRESSION_VIEWABILITY_CONFIG,
  useAdImpressions,
} from '../../features/analytics/use-ad-impressions';
import type { HomeStackScreenProps } from '../../navigation/types';
import { colors } from '../../theme/tokens';

const LATEST_TAKE = 10;

export function HomeScreen({ navigation }: HomeStackScreenProps<'Home'>) {
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
        <View style={styles.cardSlot}>
          <AdCard
            ad={item}
            onPress={() => navigation.push('AdDetail', { adId: item.id })}
          />
        </View>
      )}
      onViewableItemsChanged={onViewableItemsChanged}
      viewabilityConfig={AD_IMPRESSION_VIEWABILITY_CONFIG}
      style={styles.list}
      ListHeaderComponent={
        <View>
          <Hero
            sector={sector}
            onSectorChange={setSector}
            location={location}
            onLocationChange={setLocation}
            onSearch={goToSectorListing}
          />

          <View style={styles.latestHeader}>
            <View style={styles.sectionHeading}>
              <Eyebrow>Fresh on the market</Eyebrow>
              <Text variant="headlineSmall">Latest listings</Text>
            </View>

            {isPending ? (
              <ActivityIndicator style={styles.stateIndicator} />
            ) : null}
            {isError ? (
              <Text style={[styles.stateIndicator, styles.errorText]}>
                Couldn&apos;t load listings. Pull down to try again.
              </Text>
            ) : null}
            {!isPending && !isError && ads?.length === 0 ? (
              <Text style={[styles.stateIndicator, styles.mutedText]}>
                No listings yet - check back shortly.
              </Text>
            ) : null}
          </View>
        </View>
      }
      ListFooterComponent={<View style={styles.listFooter} />}
    />
  );
}

const styles = StyleSheet.create({
  list: {
    backgroundColor: colors.surface,
  },
  cardSlot: {
    paddingHorizontal: 16,
  },
  latestHeader: {
    paddingHorizontal: 16,
    paddingTop: 22,
    paddingBottom: 4,
  },
  listFooter: {
    height: 8,
  },
  sectionHeading: {
    gap: 4,
  },
  stateIndicator: {
    marginTop: 8,
    textAlign: 'center',
  },
  errorText: {
    color: colors.danger[600],
  },
  mutedText: {
    color: colors.neutral[600],
  },
});
