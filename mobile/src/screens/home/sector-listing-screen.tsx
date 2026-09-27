import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import {
  ActivityIndicator,
  Button,
  Chip,
  SegmentedButtons,
  Text,
  TextInput,
  useTheme,
} from 'react-native-paper';

import { AdCard } from '../../components/ads/ad-card';
import { getLiveAds } from '../../features/ads/api';
import { getSectorOption } from '../../features/ads/sectors';
import type { Ad } from '../../features/ads/types';
import {
  filterAndSortAds,
  type AdFilters,
  type SortOption,
} from '../../features/ads/filter-ads';
import {
  useAdImpressions,
  AD_IMPRESSION_VIEWABILITY_CONFIG,
} from '../../features/analytics/use-ad-impressions';
import type { HomeStackScreenProps } from '../../navigation/types';

const BROWSE_TAKE = 200;
const BEDROOM_OPTIONS = [1, 2, 3, 4, 5];

const SORT_BUTTONS: { value: SortOption; label: string }[] = [
  { value: 'newest', label: 'Newest' },
  { value: 'price_asc', label: 'Price ↑' },
  { value: 'price_desc', label: 'Price ↓' },
];

export function SectorListingScreen({
  route,
  navigation,
}: HomeStackScreenProps<'SectorListing'>) {
  const theme = useTheme();
  const { sector: slug, location: initialLocation } = route.params;
  const sectorOption = getSectorOption(slug);

  const [q, setQ] = useState('');
  const [location, setLocation] = useState(initialLocation ?? '');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [propertyType, setPropertyType] = useState<string | undefined>();
  const [minSize, setMinSize] = useState('');
  const [bedrooms, setBedrooms] = useState<number | undefined>();
  const [sort, setSort] = useState<SortOption>('newest');

  const onViewableItemsChanged = useAdImpressions('SECTOR_LISTING');

  const {
    data: ads,
    isPending,
    isError,
  } = useQuery({
    queryKey: ['ads', 'live', sectorOption.sector, 'browse'],
    queryFn: () => getLiveAds(sectorOption.sector, { take: BROWSE_TAKE }),
  });

  const filters: AdFilters = {
    q: q.trim() || undefined,
    location: location.trim() || undefined,
    minPrice: minPrice ? Number(minPrice) : undefined,
    maxPrice: maxPrice ? Number(maxPrice) : undefined,
    propertyType,
    minSize: minSize ? Number(minSize) : undefined,
    bedrooms,
    sort,
  };
  const hasActiveFilters =
    !!filters.q ||
    !!filters.location ||
    filters.minPrice != null ||
    filters.maxPrice != null ||
    !!filters.propertyType ||
    filters.minSize != null ||
    filters.bedrooms != null;

  // No useMemo: filtering a couple hundred rows client-side is cheap enough
  // to just do on every render, and `filters` is a fresh object every render
  // anyway (it depends on live input state), so memoizing it would buy nothing.
  const filteredAds = filterAndSortAds(ads ?? [], sectorOption.sector, filters);

  function clearFilters() {
    setQ('');
    setLocation('');
    setMinPrice('');
    setMaxPrice('');
    setPropertyType(undefined);
    setMinSize('');
    setBedrooms(undefined);
    setSort('newest');
  }

  return (
    <FlatList<Ad>
      data={filteredAds}
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
          <TextInput
            mode="outlined"
            label="Keyword"
            placeholder="e.g. corner plot, near school"
            value={q}
            onChangeText={setQ}
          />
          <TextInput
            mode="outlined"
            label="Location"
            placeholder="Area or district"
            value={location}
            onChangeText={setLocation}
          />

          <View style={styles.row}>
            <TextInput
              mode="outlined"
              label="Min price"
              keyboardType="numeric"
              value={minPrice}
              onChangeText={setMinPrice}
              style={styles.flex1}
            />
            <TextInput
              mode="outlined"
              label="Max price"
              keyboardType="numeric"
              value={maxPrice}
              onChangeText={setMaxPrice}
              style={styles.flex1}
            />
          </View>

          <View style={styles.chipRow}>
            {sectorOption.propertyTypes.map((type) => (
              <Chip
                key={type}
                selected={propertyType === type}
                onPress={() =>
                  setPropertyType((current) =>
                    current === type ? undefined : type,
                  )
                }
              >
                {type}
              </Chip>
            ))}
          </View>

          {sectorOption.sector === 'LAND' ? (
            <TextInput
              mode="outlined"
              label="Min size (katha)"
              keyboardType="numeric"
              value={minSize}
              onChangeText={setMinSize}
            />
          ) : (
            <View style={styles.chipRow}>
              {BEDROOM_OPTIONS.map((count) => (
                <Chip
                  key={count}
                  selected={bedrooms === count}
                  onPress={() =>
                    setBedrooms((current) =>
                      current === count ? undefined : count,
                    )
                  }
                >
                  {count}+ beds
                </Chip>
              ))}
            </View>
          )}

          <SegmentedButtons
            value={sort}
            onValueChange={(value) => setSort(value as SortOption)}
            buttons={SORT_BUTTONS}
          />

          {hasActiveFilters ? (
            <Button
              mode="text"
              onPress={clearFilters}
              style={styles.clearButton}
            >
              Clear filters
            </Button>
          ) : null}

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
          {!isPending && !isError ? (
            <Text
              style={[
                styles.stateIndicator,
                { color: theme.colors.onSurfaceVariant },
              ]}
            >
              {filteredAds.length === 0
                ? hasActiveFilters
                  ? 'No listings match those filters.'
                  : `No ${sectorOption.label.toLowerCase()} listings yet.`
                : `${filteredAds.length} listing${filteredAds.length === 1 ? '' : 's'}`}
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
    gap: 12,
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  flex1: {
    flex: 1,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  clearButton: {
    alignSelf: 'flex-start',
  },
  stateIndicator: {
    marginTop: 4,
    textAlign: 'center',
  },
});
