import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Path, Rect } from 'react-native-svg';

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
    title: 'Reviewed before it is published',
    body: 'Nothing reaches the listings straight from a form. Anything fake, duplicated or in the wrong sector is rejected with a reason, and the advertiser has to fix it and resubmit.',
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
    title: 'Contact details sit behind a free account',
    body: 'Advertiser inboxes are not sitting in the page source for scrapers. You make a free account to start a conversation, which keeps bulk spam off the platform.',
    icon: (
      <>
        <Rect x={5} y={10.5} width={14} height={9} rx={2} {...ICON_STROKE} />
        <Path d="M8.5 10.5V8a3.5 3.5 0 1 1 7 0v2.5" {...ICON_STROKE} />
      </>
    ),
  },
  {
    title: 'Conversations stay on the platform',
    body: 'Messages are delivered in real time inside Jayga Lagbe, so you keep the whole thread — and you can rate the advertiser once you have dealt with them.',
    icon: (
      <Path
        d="M4 6.5A2.5 2.5 0 0 1 6.5 4h11A2.5 2.5 0 0 1 20 6.5v7a2.5 2.5 0 0 1-2.5 2.5H10l-4.5 4v-4A1.5 1.5 0 0 1 4 14.5v-8Z"
        {...ICON_STROKE}
      />
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
