import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Path, Rect } from 'react-native-svg';

import { colors, fontFamily, radius } from '../../theme/tokens';
import { BrandCard } from '../brand/brand-card';
import { Eyebrow } from '../brand/eyebrow';

// Web's SVGs inherit `currentColor` from the tinted tile; react-native-svg has
// no cascade, so the brand stroke is stated on every path.
const ICON_STROKE = {
  fill: 'none',
  stroke: colors.brand[700],
  strokeWidth: 1.6,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
} as const;

const SAFEGUARDS: { title: string; body: string; icon: ReactNode }[] = [
  {
    title: 'Manually Reviewed Listings',
    body: 'Every listing is reviewed before publication. Anything fake, duplicated or in the wrong sector is rejected with a reason.',
    icon: (
      <>
        <Path
          d="M12 3.5 19 6v6c0 4.2-2.9 7.4-7 8.5-4.1-1.1-7-4.3-7-8.5V6l7-2.5Z"
          {...ICON_STROKE}
        />
        <Path d="m9 12 2.2 2.2L15.5 10" {...ICON_STROKE} />
      </>
    ),
  },
  {
    title: 'Free Property Posting',
    body: 'List your property without a listing fee. You only pay if you choose to boost.',
    icon: (
      <>
        <Circle cx={12} cy={12} r={8.5} {...ICON_STROKE} />
        <Path
          d="M12 7.5v9M9.5 10a2.5 1.8 0 0 1 5 0c0 2-5 1.6-5 3.8a2.5 1.8 0 0 0 5 0"
          {...ICON_STROKE}
        />
      </>
    ),
  },
  {
    title: 'Direct Communication',
    body: 'Connect directly with the advertiser. Messages arrive in real time inside Jayga Lagbe, so you keep the whole thread.',
    icon: (
      <Path
        d="M4 6.5A2.5 2.5 0 0 1 6.5 4h11A2.5 2.5 0 0 1 20 6.5v7a2.5 2.5 0 0 1-2.5 2.5H10l-4.5 4v-4A1.5 1.5 0 0 1 4 14.5v-8Z"
        {...ICON_STROKE}
      />
    ),
  },
  {
    title: 'No Money Handling',
    body: "We don't handle property transaction payments between users. Always verify ownership documents before paying anyone.",
    icon: (
      <>
        <Rect x={3.5} y={7} width={17} height={10.5} rx={2} {...ICON_STROKE} />
        <Circle cx={12} cy={12.2} r={2.3} {...ICON_STROKE} />
        <Path d="M4 20 20 4" {...ICON_STROKE} />
      </>
    ),
  },
];

// Ports web/src/components/home/trust-band.tsx. Web puts the heading and the
// safeguard list in a two-column grid from `lg` up; a phone only ever sees the
// stacked fallback, so the grid is dropped rather than approximated.
export function TrustBand({ liveCount }: { liveCount: number }) {
  return (
    <View style={styles.section}>
      <View style={styles.heading}>
        <Eyebrow style={styles.eyebrow}>Why Jayga Lagbe</Eyebrow>
        <Text style={styles.title}>
          Every listing here was opened by a person first
        </Text>
        <Text style={styles.body}>
          Fake listings are the thing that makes property classifieds miserable,
          so approval is a real step and not a formality. An ad stays invisible
          until someone on our team has read it and let it through.
          {liveCount > 0 ? (
            <>
              {' '}
              All <Text style={styles.count}>{liveCount}</Text> listings live on
              the site right now cleared that queue.
            </>
          ) : null}
        </Text>
      </View>

      <View style={styles.list}>
        {SAFEGUARDS.map((item) => (
          <BrandCard key={item.title} style={styles.card}>
            <View style={styles.iconTile}>
              <Svg width={20} height={20} viewBox="0 0 24 24">
                {item.icon}
              </Svg>
            </View>
            <View style={styles.cardText}>
              <Text style={styles.cardTitle}>{item.title}</Text>
              <Text style={styles.cardBody}>{item.body}</Text>
            </View>
          </BrandCard>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    paddingHorizontal: 16,
    paddingTop: 34,
    paddingBottom: 34,
    gap: 20,
  },
  heading: {
    gap: 10,
  },
  eyebrow: {
    color: colors.brand[700],
  },
  title: {
    fontFamily: fontFamily.display,
    fontSize: 26,
    lineHeight: 30,
    letterSpacing: -0.7,
    color: colors.neutral[900],
  },
  body: {
    fontFamily: fontFamily.text,
    fontSize: 14.5,
    lineHeight: 23,
    color: colors.neutral[600],
  },
  count: {
    fontFamily: fontFamily.textSemibold,
    color: colors.neutral[900],
    fontVariant: ['tabular-nums'],
  },
  list: {
    gap: 12,
  },
  card: {
    flexDirection: 'row',
    gap: 14,
    padding: 18,
  },
  iconTile: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.md,
    backgroundColor: colors.brand[50],
    borderWidth: 1,
    borderColor: colors.brand[100],
  },
  cardText: {
    flex: 1,
    gap: 4,
  },
  cardTitle: {
    fontFamily: fontFamily.display,
    fontSize: 14.5,
    letterSpacing: -0.2,
    color: colors.neutral[900],
  },
  cardBody: {
    fontFamily: fontFamily.text,
    fontSize: 13,
    lineHeight: 20,
    color: colors.neutral[600],
  },
});
