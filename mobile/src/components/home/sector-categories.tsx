import { Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { sectors, type SectorSlug } from '../../features/ads/sectors';
import { colors, fontFamily, radius, shadow } from '../../theme/tokens';
import { BrandCard } from '../brand/brand-card';
import { Eyebrow } from '../brand/eyebrow';

// Icon paths lifted verbatim from web's SectorSidebar, still on its 0 0 32 32
// viewBox. Taglines live here rather than in sectors.ts because they are this
// section's marketing copy, not a property of the sector.
const SECTOR_DETAILS: Record<SectorSlug, { tagline: string; icon: string }> = {
  'jayga-jomi': {
    tagline: 'Plots & land for sale',
    icon: 'M4 20h24M7 20V9l9-5 9 5v11M12 20v-6h6v6',
  },
  'basha-bhara': {
    tagline: 'Flats, houses & rooms to rent',
    icon: 'M5 18V10l11-6 11 6v8M9 26V16h5v10M20 26h6v-7h-6v7Z',
  },
};

// Ports web/src/components/home/sector-sidebar.tsx, renamed because nothing
// sits beside anything on a phone - it is a full-width section here, not an
// aside. Web lifts each sheet on hover; a press state tints the row instead,
// since there is no hover to track.
export function SectorCategories({
  counts,
  onSelectSector,
  onPostAd,
}: {
  counts: Record<SectorSlug, number>;
  onSelectSector: (slug: SectorSlug) => void;
  onPostAd: () => void;
}) {
  return (
    <View style={styles.section}>
      <Eyebrow>Browse by category</Eyebrow>

      <View style={styles.rows}>
        {sectors.map((sector) => {
          const details = SECTOR_DETAILS[sector.slug];
          return (
            <Pressable
              key={sector.slug}
              accessibilityRole="button"
              accessibilityLabel={`${sector.label} — ${details.tagline}`}
              onPress={() => onSelectSector(sector.slug)}
            >
              {({ pressed }) => (
                <BrandCard
                  style={pressed ? [styles.row, styles.rowPressed] : styles.row}
                >
                  <View
                    style={[
                      styles.iconTile,
                      pressed ? styles.iconTilePressed : null,
                    ]}
                  >
                    <Svg width={20} height={20} viewBox="0 0 32 32">
                      <Path
                        d={details.icon}
                        fill="none"
                        stroke={colors.brand[700]}
                        strokeWidth={1.6}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </Svg>
                  </View>

                  <View style={styles.rowText}>
                    <Text
                      style={[
                        styles.rowLabel,
                        pressed ? styles.rowLabelPressed : null,
                      ]}
                    >
                      {sector.label}
                    </Text>
                    <Text style={styles.rowTagline} numberOfLines={1}>
                      {details.tagline}
                    </Text>
                  </View>

                  <View style={styles.countPill}>
                    <Text style={styles.countLabel}>
                      {counts[sector.slug] ?? 0}
                    </Text>
                  </View>
                </BrandCard>
              )}
            </Pressable>
          );
        })}
      </View>

      <View style={styles.promo}>
        <View style={styles.promoText}>
          <Text style={styles.promoHeading}>Have a property to list?</Text>
          <Text style={styles.promoBody}>
            Post it free, get reviewed within a day, and boost it to the top
            whenever you want more eyes on it.
          </Text>
        </View>
        <Pressable
          accessibilityRole="button"
          onPress={onPostAd}
          style={({ pressed }) => [
            styles.promoButton,
            pressed ? styles.promoButtonPressed : null,
          ]}
        >
          <Text style={styles.promoButtonLabel}>Post an ad</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    paddingHorizontal: 16,
    paddingTop: 28,
    paddingBottom: 28,
    gap: 12,
  },
  rows: {
    gap: 10,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 14,
  },
  rowPressed: {
    backgroundColor: colors.brand[50],
    borderColor: colors.brand[100],
  },
  iconTile: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.sm,
    backgroundColor: colors.brand[50],
    borderWidth: 1,
    borderColor: colors.brand[100],
  },
  iconTilePressed: {
    backgroundColor: colors.brand[100],
  },
  rowText: {
    flex: 1,
    gap: 2,
  },
  rowLabel: {
    fontFamily: fontFamily.display,
    fontSize: 15,
    color: colors.neutral[900],
  },
  rowLabelPressed: {
    color: colors.brand[700],
  },
  rowTagline: {
    fontFamily: fontFamily.text,
    fontSize: 12,
    color: colors.neutral[600],
  },
  countPill: {
    borderRadius: radius.full,
    backgroundColor: colors.neutral[100],
    paddingHorizontal: 9,
    paddingVertical: 4,
  },
  countLabel: {
    fontFamily: fontFamily.textSemibold,
    fontSize: 11,
    color: colors.neutral[700],
    fontVariant: ['tabular-nums'],
  },
  promo: {
    gap: 14,
    marginTop: 2,
    borderRadius: radius.xl,
    backgroundColor: colors.neutral[900],
    padding: 20,
  },
  promoText: {
    gap: 6,
  },
  promoHeading: {
    fontFamily: fontFamily.display,
    fontSize: 17,
    color: '#ffffff',
  },
  promoBody: {
    fontFamily: fontFamily.text,
    fontSize: 12.5,
    lineHeight: 19,
    color: colors.neutral[300],
  },
  promoButton: {
    alignSelf: 'flex-start',
    borderRadius: radius.full,
    backgroundColor: colors.accent[600],
    paddingHorizontal: 18,
    paddingVertical: 11,
    ...shadow('accent'),
  },
  promoButtonPressed: {
    backgroundColor: colors.accent[700],
  },
  promoButtonLabel: {
    fontFamily: fontFamily.textSemibold,
    fontSize: 14,
    color: '#ffffff',
  },
});
