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
} from 'react-native-paper';

import { AdCard } from '../../components/ads/ad-card';
import { SelectField } from '../../components/forms/select-field';
import {
  SIZE_UNITS,
  sizeUnitFromLabel,
  sizeUnitLabel,
  type SizeUnit,
} from '../../features/ads/land-size';
import { BrandCard } from '../../components/brand/brand-card';
import { liveAdsQuery } from '../../features/ads/api';
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
import { colors, radius, shadow } from '../../theme/tokens';

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
  const {
    sector: slug,
    location: initialLocation,
    minPrice: initialMinPrice,
    maxPrice: initialMaxPrice,
  } = route.params;
  const sectorOption = getSectorOption(slug);

  const [q, setQ] = useState('');
  const [location, setLocation] = useState(initialLocation ?? '');
  // Seeded rather than locked: arriving from a home budget bracket pre-fills
  // the range, and the user can still widen or clear it from here.
  const [minPrice, setMinPrice] = useState(
    initialMinPrice != null ? String(initialMinPrice) : '',
  );
  const [maxPrice, setMaxPrice] = useState(
    initialMaxPrice != null ? String(initialMaxPrice) : '',
  );
  const [propertyType, setPropertyType] = useState<string | undefined>();
  const [minSize, setMinSize] = useState('');
  const [minSizeUnit, setMinSizeUnit] = useState<SizeUnit>('katha');
  const [bedrooms, setBedrooms] = useState<number | undefined>();
  const [sort, setSort] = useState<SortOption>('newest');

  const onViewableItemsChanged = useAdImpressions('SECTOR_LISTING');

  const {
    data: ads,
    isPending,
    isError,
  } = useQuery(liveAdsQuery(sectorOption.sector));

  const filters: AdFilters = {
    q: q.trim() || undefined,
    location: location.trim() || undefined,
    minPrice: minPrice ? Number(minPrice) : undefined,
    maxPrice: maxPrice ? Number(maxPrice) : undefined,
    propertyType,
    minSize: minSize ? Number(minSize) : undefined,
    minSizeUnit,
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
      style={styles.list}
      contentContainerStyle={styles.listContent}
      ListHeaderComponent={
        <View style={styles.header}>
          {/* Web renders the filters as a floating sheet over the canvas
           * (sector-filters.tsx), so they're grouped rather than sitting
           * loose on the background. */}
          <BrandCard variant="card" radius="lg" style={styles.filterPanel}>
            <TextInput
              mode="outlined"
              label="Keyword"
              placeholder="e.g. corner plot, near school"
              value={q}
              onChangeText={setQ}
              style={styles.input}
            />
            <TextInput
              mode="outlined"
              label="Location"
              placeholder="Area or district"
              value={location}
              onChangeText={setLocation}
              style={styles.input}
            />

            <View style={styles.row}>
              <TextInput
                mode="outlined"
                label="Min price"
                keyboardType="numeric"
                value={minPrice}
                onChangeText={setMinPrice}
                style={[styles.input, styles.flex1]}
              />
              <TextInput
                mode="outlined"
                label="Max price"
                keyboardType="numeric"
                value={maxPrice}
                onChangeText={setMaxPrice}
                style={[styles.input, styles.flex1]}
              />
            </View>

            <View style={styles.chipRow}>
              {sectorOption.propertyTypes.map((type) => {
                const selected = propertyType === type;
                return (
                  <Chip
                    key={type}
                    selected={selected}
                    showSelectedCheck={false}
                    onPress={() =>
                      setPropertyType((current) =>
                        current === type ? undefined : type,
                      )
                    }
                    style={[
                      styles.filterChip,
                      selected ? styles.filterChipSelected : null,
                    ]}
                    textStyle={
                      selected
                        ? styles.filterChipLabelSelected
                        : styles.filterChipLabel
                    }
                  >
                    {type}
                  </Chip>
                );
              })}
            </View>

            {sectorOption.sector === 'LAND' ? (
              <>
                <TextInput
                  mode="outlined"
                  label="Min size"
                  keyboardType="numeric"
                  value={minSize}
                  onChangeText={setMinSize}
                  style={styles.input}
                />
                <SelectField
                  label="Unit"
                  value={sizeUnitLabel(minSizeUnit)}
                  options={SIZE_UNITS.map((unit) => unit.label)}
                  onChange={(label) => setMinSizeUnit(sizeUnitFromLabel(label))}
                />
              </>
            ) : (
              <View style={styles.chipRow}>
                {BEDROOM_OPTIONS.map((count) => {
                  const selected = bedrooms === count;
                  return (
                    <Chip
                      key={count}
                      selected={selected}
                      showSelectedCheck={false}
                      onPress={() =>
                        setBedrooms((current) =>
                          current === count ? undefined : count,
                        )
                      }
                      style={[
                        styles.filterChip,
                        selected ? styles.filterChipSelected : null,
                      ]}
                      textStyle={
                        selected
                          ? styles.filterChipLabelSelected
                          : styles.filterChipLabel
                      }
                    >
                      {count}+ beds
                    </Chip>
                  );
                })}
              </View>
            )}

            <View style={styles.toggleTrack}>
              <SegmentedButtons
                value={sort}
                onValueChange={(value) => setSort(value as SortOption)}
                buttons={SORT_BUTTONS.map((option) => ({
                  ...option,
                  checkedColor: colors.brand[800],
                  uncheckedColor: colors.neutral[600],
                  style: [
                    styles.toggleSegment,
                    sort === option.value ? styles.toggleSegmentActive : null,
                  ],
                }))}
              />
            </View>

            {hasActiveFilters ? (
              <Button
                mode="text"
                onPress={clearFilters}
                style={styles.clearButton}
              >
                Clear filters
              </Button>
            ) : null}
          </BrandCard>

          {isPending ? (
            <ActivityIndicator style={styles.stateIndicator} />
          ) : null}
          {isError ? (
            <Text style={[styles.stateIndicator, styles.errorText]}>
              Couldn&apos;t load listings. Pull down to try again.
            </Text>
          ) : null}
          {!isPending && !isError ? (
            <Text style={[styles.stateIndicator, styles.mutedText]}>
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
  list: {
    backgroundColor: colors.surface,
  },
  listContent: {
    padding: 16,
  },
  header: {
    gap: 12,
    marginBottom: 8,
  },
  filterPanel: {
    gap: 12,
  },
  // The outlined inputs sit on the white sheet, not the canvas, and Paper
  // takes the label's notch fill from this same backgroundColor.
  input: {
    backgroundColor: colors.surfaceCard,
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
  filterChip: {
    backgroundColor: colors.brand[50],
    borderColor: colors.brand[100],
    borderRadius: radius.full,
  },
  filterChipSelected: {
    backgroundColor: colors.brand[600],
    borderColor: colors.brand[600],
  },
  filterChipLabel: {
    color: colors.brand[800],
  },
  filterChipLabelSelected: {
    color: '#ffffff',
  },
  toggleTrack: {
    backgroundColor: colors.neutral[100],
    borderRadius: radius.full,
    padding: 4,
  },
  toggleSegment: {
    borderWidth: 0,
    borderLeftWidth: 0,
    backgroundColor: 'transparent',
    borderTopLeftRadius: radius.full,
    borderTopRightRadius: radius.full,
    borderBottomLeftRadius: radius.full,
    borderBottomRightRadius: radius.full,
  },
  toggleSegmentActive: {
    backgroundColor: colors.surfaceCard,
    ...shadow('sm'),
  },
  clearButton: {
    alignSelf: 'flex-start',
    borderRadius: radius.full,
  },
  stateIndicator: {
    marginTop: 4,
    textAlign: 'center',
  },
  errorText: {
    color: colors.danger[600],
  },
  mutedText: {
    color: colors.neutral[600],
  },
});
