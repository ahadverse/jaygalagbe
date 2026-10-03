import { LinearGradient } from 'expo-linear-gradient';
import type { JSX } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { sectors, type SectorSlug } from '../../features/ads/sectors';
import { colors, fontFamily, radius } from '../../theme/tokens';
import { Eyebrow } from '../brand/eyebrow';

type InfoScreen = 'About' | 'Contact' | 'Privacy' | 'Terms';

type FooterLink = { label: string; onPress: () => void };
type FooterGroup = { title: string; links: FooterLink[] };

// sectors.ts carries the Bangla names only; the footer is where a first-time
// visitor meets them, so each gets its English gloss the way web's does.
const SECTOR_GLOSS: Record<SectorSlug, string> = {
  'jayga-jomi': 'Land for sale',
  'basha-bhara': 'House rent',
};

function FooterWordmark() {
  return (
    <View style={styles.wordmarkRow}>
      <LinearGradient
        colors={[colors.brand[500], colors.accent[600]]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.wordmarkTile}
      >
        <Svg width={18} height={18} viewBox="0 0 24 24">
          <Path
            d="M4 11 12 4.5 20 11v8.5h-5.5V14h-5v5.5H4V11Z"
            fill="none"
            stroke="#ffffff"
            strokeWidth={1.9}
            strokeLinejoin="round"
          />
        </Svg>
      </LinearGradient>
      <Text style={styles.wordmarkText}>
        Jayga<Text style={styles.wordmarkTextAccent}>Lagbe</Text>
      </Text>
    </View>
  );
}

function FooterColumn({ group }: { group: FooterGroup }) {
  return (
    <View style={styles.column}>
      <Eyebrow style={styles.columnTitle}>{group.title}</Eyebrow>
      {group.links.map((link) => (
        <Pressable
          key={link.label}
          onPress={link.onPress}
          hitSlop={6}
          style={styles.link}
        >
          {({ pressed }) => (
            <Text style={[styles.linkText, pressed && styles.linkTextPressed]}>
              {link.label}
            </Text>
          )}
        </Pressable>
      ))}
    </View>
  );
}

// Ports web/src/components/layout/site-footer.tsx. It renders as a FlatList's
// ListFooterComponent, so everything below is plain Views - no scrollable of
// its own. The Legal column is new here: web has no such group yet, but a
// store-visible privacy policy has to be reachable from the public home
// screen without logging in.
export function SiteFooter({
  onNavigate,
  onBrowseSector,
  onPostAd,
}: {
  onNavigate: (screen: InfoScreen) => void;
  onBrowseSector: (slug: SectorSlug) => void;
  onPostAd: () => void;
}): JSX.Element {
  const groups: FooterGroup[] = [
    {
      title: 'Browse',
      links: sectors.map((option) => ({
        label: `${option.label} (${SECTOR_GLOSS[option.slug]})`,
        onPress: () => onBrowseSector(option.slug),
      })),
    },
    {
      title: 'For advertisers',
      links: [{ label: 'Post an ad', onPress: onPostAd }],
    },
    {
      title: 'Company',
      links: [
        { label: 'About Jayga Lagbe', onPress: () => onNavigate('About') },
        { label: 'Contact us', onPress: () => onNavigate('Contact') },
      ],
    },
    {
      title: 'Legal',
      links: [
        { label: 'Privacy Policy', onPress: () => onNavigate('Privacy') },
        { label: 'Terms of Service', onPress: () => onNavigate('Terms') },
      ],
    },
  ];

  return (
    <View style={styles.footer}>
      <View style={styles.body}>
        <View style={styles.brandBlock}>
          <FooterWordmark />
          <Text style={styles.tagline}>
            Verified land and rental listings, with every ad manually reviewed
            before it goes live.
          </Text>
        </View>

        <View style={styles.columns}>
          {groups.map((group) => (
            <FooterColumn key={group.title} group={group} />
          ))}
        </View>
      </View>

      <View style={styles.bottomBar}>
        <Text style={styles.bottomText}>
          © {new Date().getFullYear()} Jayga Lagbe. All rights reserved.
        </Text>
        <Text style={styles.bottomText}>Made for Bangladesh</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  footer: {
    backgroundColor: colors.neutral[950],
    marginTop: 32,
  },
  body: {
    paddingHorizontal: 20,
    paddingTop: 32,
    paddingBottom: 28,
    gap: 28,
  },
  brandBlock: {
    gap: 12,
  },
  wordmarkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
  },
  wordmarkTile: {
    width: 32,
    height: 32,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  wordmarkText: {
    fontFamily: fontFamily.display,
    fontSize: 19,
    letterSpacing: -0.4,
    color: '#ffffff',
  },
  wordmarkTextAccent: {
    fontFamily: fontFamily.display,
    color: colors.brand[400],
  },
  tagline: {
    fontFamily: fontFamily.text,
    fontSize: 13,
    lineHeight: 21,
    color: colors.neutral[400],
    maxWidth: 300,
  },
  // Four columns never fit side by side on a phone, so they wrap into a
  // two-up grid instead of stacking into one long list.
  columns: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    rowGap: 26,
    columnGap: 16,
  },
  column: {
    minWidth: '42%',
    flexGrow: 1,
    flexShrink: 1,
    gap: 10,
  },
  // Eyebrow's default neutral-600 disappears against this block; web reaches
  // for the same one-step-lighter tone here.
  columnTitle: {
    color: colors.neutral[500],
  },
  link: {
    paddingVertical: 2,
  },
  linkText: {
    fontFamily: fontFamily.text,
    fontSize: 13,
    lineHeight: 19,
    color: colors.neutral[400],
  },
  linkTextPressed: {
    color: '#ffffff',
  },
  bottomBar: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(255,255,255,0.1)', // web's border-white/10
  },
  bottomText: {
    fontFamily: fontFamily.text,
    fontSize: 11,
    color: colors.neutral[500],
  },
});
