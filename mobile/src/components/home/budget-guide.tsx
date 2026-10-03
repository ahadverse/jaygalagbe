import { Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import type { BudgetBand } from '../../features/ads/home-facets';
import type { SectorSlug } from '../../features/ads/sectors';
import { colors, fontFamily, radius } from '../../theme/tokens';
import { BrandCard } from '../brand/brand-card';
import { Eyebrow } from '../brand/eyebrow';

type Panel = {
  slug: SectorSlug;
  name: string;
  note: string;
  bands: BudgetBand[];
};

// Ports web/src/components/home/budget-guide.tsx. Web hands each bracket to a
// URL carrying minPrice/maxPrice; on mobile the band object goes straight to
// the caller, which owns the navigation params - so no query string is built
// here. The two panels stack, as they already do below web's lg breakpoint.
export function BudgetGuide({
  land,
  house,
  onSelect,
}: {
  land: BudgetBand[];
  house: BudgetBand[];
  onSelect: (slug: SectorSlug, band: BudgetBand) => void;
}) {
  const panels: Panel[] = [];
  if (land.length > 0) {
    panels.push({
      slug: 'jayga-jomi',
      name: 'Jayga Jomi',
      note: 'Asking price',
      bands: land,
    });
  }
  if (house.length > 0) {
    panels.push({
      slug: 'basha-bhara',
      name: 'Basha Bhara',
      note: 'Monthly rent',
      bands: house,
    });
  }

  if (panels.length === 0) {
    return null;
  }

  return (
    <View style={styles.section}>
      <View style={styles.headingBlock}>
        <Eyebrow>Start from a number</Eyebrow>
        <Text style={styles.heading}>Browse by budget</Text>
        <Text style={styles.subheading}>
          Each bracket opens the listings already filtered to that price range.
        </Text>
      </View>

      <View style={styles.panels}>
        {panels.map((panel) => (
          <BudgetPanel key={panel.slug} panel={panel} onSelect={onSelect} />
        ))}
      </View>
    </View>
  );
}

function BudgetPanel({
  panel,
  onSelect,
}: {
  panel: Panel;
  onSelect: (slug: SectorSlug, band: BudgetBand) => void;
}) {
  return (
    <BrandCard radius="2xl" style={styles.panel}>
      <View style={styles.panelHeader}>
        <Text style={styles.panelName}>{panel.name}</Text>
        <Eyebrow style={styles.panelNote}>{panel.note}</Eyebrow>
      </View>

      {panel.bands.map((band, index) => (
        <Pressable
          key={band.id}
          accessibilityRole="button"
          accessibilityLabel={`${panel.name}, ${band.label}, ${band.count} listings`}
          onPress={() => onSelect(panel.slug, band)}
          style={({ pressed }) => {
            const base =
              index === 0 ? [styles.bandRow] : [styles.bandRow, styles.divided];
            return pressed ? [...base, styles.bandRowPressed] : base;
          }}
        >
          {({ pressed }) => (
            <>
              <Text style={styles.bandLabel}>{band.label}</Text>
              <View
                style={
                  pressed
                    ? [styles.countPill, styles.countPillPressed]
                    : styles.countPill
                }
              >
                <Text
                  style={
                    pressed
                      ? [styles.countLabel, styles.countLabelPressed]
                      : styles.countLabel
                  }
                >
                  {band.count}
                </Text>
              </View>
              <Svg width={16} height={16} viewBox="0 0 24 24">
                <Path
                  d="m9 6 6 6-6 6"
                  fill="none"
                  stroke={pressed ? colors.brand[700] : colors.neutral[300]}
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </Svg>
            </>
          )}
        </Pressable>
      ))}
    </BrandCard>
  );
}

const styles = StyleSheet.create({
  section: {
    // Web sets this section apart with a muted band and hairline rules top and
    // bottom; full-bleed here, so the horizontal padding sits inside it.
    backgroundColor: colors.neutral[100],
    borderTopWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
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
  panels: {
    gap: 16,
  },
  panel: {
    padding: 0,
    overflow: 'hidden',
  },
  panelHeader: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    gap: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
    paddingHorizontal: 16,
    paddingVertical: 13,
  },
  panelName: {
    fontFamily: fontFamily.display,
    fontSize: 16,
    letterSpacing: -0.3,
    color: colors.neutral[900],
  },
  panelNote: {
    color: colors.neutral[500],
  },
  bandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    minHeight: 56,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  bandRowPressed: {
    backgroundColor: colors.brand[50],
  },
  divided: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  bandLabel: {
    flex: 1,
    fontFamily: fontFamily.textMedium,
    fontSize: 14,
    color: colors.neutral[900],
  },
  countPill: {
    borderRadius: radius.full,
    backgroundColor: colors.neutral[100],
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  countPillPressed: {
    backgroundColor: colors.brand[100],
  },
  countLabel: {
    fontFamily: fontFamily.textSemibold,
    fontSize: 11,
    color: colors.neutral[700],
    fontVariant: ['tabular-nums'],
  },
  countLabelPressed: {
    color: colors.brand[800],
  },
});
