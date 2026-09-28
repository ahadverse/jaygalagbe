import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';

import type { Ad } from '../../features/ads/types';
import { formatPrice, formatRelativeTime } from '../../lib/format';
import { colors, fontFamily, radius, shadow } from '../../theme/tokens';

const SECTOR_LABEL: Record<Ad['sector'], string> = {
  LAND: 'Land for sale',
  HOUSE_RENT: 'For rent',
};

// Ports web/src/components/ads/ad-card.tsx: a white sheet on the paper canvas
// (rounded-xl, soft warm shadow, hairline ring), a 4:3 photo with a frosted
// sector pill over it, display-font title, and a price footer above a
// hairline rule. Web's boosted treatment (gradient hairline + Boosted badge)
// is intentionally absent - mobile's Ad type carries no boost data because no
// endpoint the app calls returns it.
export function AdCard({ ad, onPress }: { ad: Ad; onPress?: () => void }) {
  const posted = formatRelativeTime(ad.createdAt);
  const price = formatPrice(ad.price);
  // formatPrice prefixes the taka sign; web renders that glyph a step smaller
  // and a shade lighter than the number itself.
  const hasTakaPrefix = price.startsWith('৳');
  const priceDigits = hasTakaPrefix ? price.slice(1) : price;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        pressed ? styles.cardPressed : null,
      ]}
    >
      {ad.photos[0] ? (
        <View style={styles.photoWrap}>
          <Image
            source={{ uri: ad.photos[0] }}
            style={styles.photo}
            resizeMode="cover"
          />
          <View style={styles.sectorPill}>
            <Text style={styles.sectorPillText}>{SECTOR_LABEL[ad.sector]}</Text>
          </View>
        </View>
      ) : null}

      <View style={styles.body}>
        {!ad.photos[0] ? (
          <Text style={styles.sectorLabel}>{SECTOR_LABEL[ad.sector]}</Text>
        ) : null}

        <Text style={styles.title} numberOfLines={2}>
          {ad.title}
        </Text>

        <View style={styles.locationRow}>
          <Svg width={13} height={13} viewBox="0 0 24 24">
            <Path
              d="M12 21s7-5.5 7-11a7 7 0 1 0-14 0c0 5.5 7 11 7 11Z"
              fill="none"
              stroke={colors.neutral[400]}
              strokeWidth={1.8}
              strokeLinejoin="round"
            />
            <Circle
              cx={12}
              cy={10}
              r={2.4}
              fill="none"
              stroke={colors.neutral[400]}
              strokeWidth={1.8}
            />
          </Svg>
          <Text style={styles.location} numberOfLines={1}>
            {ad.locationArea}, {ad.locationDistrict}
          </Text>
        </View>

        <View style={styles.footer}>
          <Text style={styles.price}>
            {hasTakaPrefix ? <Text style={styles.priceGlyph}>৳</Text> : null}
            {priceDigits}
          </Text>
          {posted ? <Text style={styles.posted}>{posted}</Text> : null}
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 14,
    // Tailwind reads `rounded-xl` off web's own --radius-xl (1.375rem), so
    // web's cards sit at 22px, not Tailwind's stock 12px.
    borderRadius: radius.xl,
    backgroundColor: colors.surfaceCard,
    borderWidth: 1,
    borderColor: 'rgba(22,18,15,0.05)',
    overflow: 'hidden',
    ...shadow('sm'),
  },
  cardPressed: {
    // Web lifts the card on hover and settles it on press; on touch the
    // settle is the only half that translates.
    opacity: 0.92,
  },
  photoWrap: {
    width: '100%',
    aspectRatio: 4 / 3,
    backgroundColor: colors.neutral[150],
  },
  photo: {
    width: '100%',
    height: '100%',
  },
  sectorPill: {
    position: 'absolute',
    top: 10,
    left: 10,
    // Web frosts this pill with backdrop-blur; plain RN has no blur without
    // expo-blur, so a 92%-white fill stands in.
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderRadius: radius.full,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  sectorPillText: {
    fontFamily: fontFamily.textSemibold,
    fontSize: 11,
    color: colors.neutral[800],
  },
  body: {
    padding: 16,
    gap: 6,
  },
  sectorLabel: {
    fontFamily: fontFamily.textSemibold,
    fontSize: 11,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: colors.neutral[500],
  },
  title: {
    fontFamily: fontFamily.display,
    fontSize: 16,
    lineHeight: 21,
    letterSpacing: -0.3,
    color: colors.neutral[900],
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  location: {
    flex: 1,
    fontFamily: fontFamily.text,
    fontSize: 12.5,
    color: colors.neutral[600],
  },
  footer: {
    marginTop: 6,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
  },
  price: {
    fontFamily: fontFamily.display,
    fontSize: 20,
    letterSpacing: -0.5,
    color: colors.brand[700],
    fontVariant: ['tabular-nums'],
  },
  priceGlyph: {
    fontFamily: fontFamily.displaySemibold,
    fontSize: 14,
    color: colors.brand[600],
  },
  posted: {
    fontFamily: fontFamily.text,
    fontSize: 11,
    color: colors.neutral[500],
  },
});
