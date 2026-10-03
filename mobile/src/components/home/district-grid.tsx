import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { DistrictFacet } from '../../features/ads/home-facets';
import type { SectorSlug } from '../../features/ads/sectors';
import { colors, fontFamily, radius } from '../../theme/tokens';
import { BrandCard } from '../brand/brand-card';
import { Eyebrow } from '../brand/eyebrow';

// Ports web/src/components/home/district-grid.tsx. Web keeps this as a hairline
// grid rather than another row of cards because it is a data surface; a phone
// has no room for columns, so the density carries over as one sheet of
// hairline-divided rows instead of a stack of separate cards.
export function DistrictGrid({
  districts,
  onSelect,
}: {
  districts: DistrictFacet[];
  onSelect: (slug: SectorSlug, district: string) => void;
}) {
  if (districts.length === 0) {
    return null;
  }

  return (
    <View style={styles.section}>
      <View style={styles.headingBlock}>
        <Eyebrow>Where we cover</Eyebrow>
        <Text style={styles.heading}>Browse by district</Text>
        <Text style={styles.subheading}>
          Every count below is live right now. Pick a district to jump straight
          into its listings.
        </Text>
      </View>

      <BrandCard radius="2xl" style={styles.sheet}>
        {districts.map((facet, index) => (
          <View
            key={facet.district}
            style={index === 0 ? styles.row : [styles.row, styles.rowDivided]}
          >
            <View style={styles.rowHeader}>
              <Text style={styles.district}>{facet.district}</Text>
              <Text style={styles.areas}>
                {facet.areas} {facet.areas === 1 ? 'area' : 'areas'}
              </Text>
            </View>

            <View style={styles.totalRow}>
              <Text style={styles.total}>{facet.total}</Text>
              <Text style={styles.totalLabel}>
                live {facet.total === 1 ? 'listing' : 'listings'}
              </Text>
            </View>

            <View style={styles.chips}>
              {facet.land > 0 ? (
                <FacetChip
                  count={facet.land}
                  noun="land"
                  district={facet.district}
                  onPress={() => onSelect('jayga-jomi', facet.district)}
                />
              ) : null}
              {facet.house > 0 ? (
                <FacetChip
                  count={facet.house}
                  noun="rent"
                  district={facet.district}
                  onPress={() => onSelect('basha-bhara', facet.district)}
                />
              ) : null}
            </View>
          </View>
        ))}
      </BrandCard>
    </View>
  );
}

function FacetChip({
  count,
  noun,
  district,
  onPress,
}: {
  count: number;
  noun: string;
  district: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      // Carries web's sr-only "listings in {district}" suffix, which is the only
      // thing that tells these chips apart once they are read out of context.
      accessibilityLabel={`${count} ${noun} listings in ${district}`}
      onPress={onPress}
      style={({ pressed }) =>
        pressed ? [styles.chip, styles.chipPressed] : styles.chip
      }
    >
      {({ pressed }) => (
        <Text
          style={
            pressed
              ? [styles.chipLabel, styles.chipLabelPressed]
              : styles.chipLabel
          }
        >
          {count} {noun}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  section: {
    paddingHorizontal: 16,
    paddingTop: 28,
    paddingBottom: 28,
  },
  headingBlock: {
    gap: 6,
    marginBottom: 16,
  },
  heading: {
    fontFamily: fontFamily.display,
    fontSize: 22,
    lineHeight: 27,
    letterSpacing: -0.6,
    color: colors.neutral[900],
  },
  subheading: {
    fontFamily: fontFamily.text,
    fontSize: 13.5,
    lineHeight: 20,
    color: colors.neutral[600],
  },
  sheet: {
    padding: 0,
    overflow: 'hidden',
  },
  row: {
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  rowDivided: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  rowHeader: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    gap: 12,
  },
  district: {
    flex: 1,
    fontFamily: fontFamily.display,
    fontSize: 16,
    letterSpacing: -0.3,
    color: colors.neutral[900],
  },
  areas: {
    fontFamily: fontFamily.text,
    fontSize: 11,
    color: colors.neutral[500],
    fontVariant: ['tabular-nums'],
  },
  totalRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
  },
  total: {
    fontFamily: fontFamily.display,
    fontSize: 26,
    lineHeight: 30,
    letterSpacing: -0.8,
    color: colors.neutral[900],
    fontVariant: ['tabular-nums'],
  },
  totalLabel: {
    fontFamily: fontFamily.text,
    fontSize: 12,
    color: colors.neutral[600],
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 2,
  },
  chip: {
    borderRadius: radius.full,
    backgroundColor: colors.neutral[100],
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  chipPressed: {
    backgroundColor: colors.brand[100],
  },
  chipLabel: {
    fontFamily: fontFamily.textSemibold,
    fontSize: 12,
    color: colors.neutral[700],
    fontVariant: ['tabular-nums'],
  },
  chipLabelPressed: {
    color: colors.brand[800],
  },
});
