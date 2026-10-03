import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import {
  STATS_RANGE_PRESETS,
  type StatsRangeValue,
} from '../../features/analytics/types';
import { colors, fontFamily, radius } from '../../theme/tokens';
import { Eyebrow } from '../brand/eyebrow';

export type StatsAdOption = { id: string; title: string };

// Web's StatsFilters is a GET form because its filters live in the URL of a
// server-rendered page. Mobile holds them in component state, so a pill applies
// the moment it is tapped and there is no Apply/Reset pair to mirror.
export function StatsRangeFilter({
  range,
  onRangeChange,
  ads,
  adId,
  onAdChange,
}: {
  range: StatsRangeValue;
  onRangeChange: (range: StatsRangeValue) => void;
  ads?: StatsAdOption[];
  adId?: string;
  onAdChange?: (adId: string | undefined) => void;
}) {
  return (
    <View style={styles.filters}>
      <View style={styles.group}>
        <Eyebrow>Date range</Eyebrow>
        <View style={styles.chipRow}>
          {STATS_RANGE_PRESETS.map((preset) => (
            <FilterPill
              key={preset.value}
              label={preset.label}
              selected={range === preset.value}
              onPress={() => onRangeChange(preset.value)}
            />
          ))}
        </View>
      </View>

      {/* Web only offers the listing filter once there is more than one. */}
      {ads && ads.length > 1 && onAdChange ? (
        <View style={styles.group}>
          <Eyebrow>Listing</Eyebrow>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chipScroll}
          >
            <FilterPill
              label="All listings"
              selected={!adId}
              onPress={() => onAdChange(undefined)}
            />
            {ads.map((ad) => (
              <FilterPill
                key={ad.id}
                label={ad.title}
                selected={adId === ad.id}
                onPress={() => onAdChange(ad.id)}
              />
            ))}
          </ScrollView>
        </View>
      ) : null}
    </View>
  );
}

function FilterPill({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={[styles.pill, selected ? styles.pillSelected : null]}
    >
      <Text
        style={[styles.pillLabel, selected ? styles.pillLabelSelected : null]}
        numberOfLines={1}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  filters: {
    gap: 14,
  },
  group: {
    gap: 8,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chipScroll: {
    flexDirection: 'row',
    gap: 8,
    paddingRight: 4,
  },
  pill: {
    backgroundColor: colors.brand[50],
    borderRadius: radius.full,
    paddingHorizontal: 14,
    paddingVertical: 7,
    maxWidth: 220,
  },
  pillSelected: {
    backgroundColor: colors.brand[600],
  },
  pillLabel: {
    fontFamily: fontFamily.textSemibold,
    fontSize: 13,
    lineHeight: 16,
    color: colors.brand[800],
  },
  pillLabelSelected: {
    color: colors.surfaceCard,
  },
});
