import type { JSX } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

import type { SectorSlug } from '../../features/ads/sectors';
import { colors, fontFamily, radius } from '../../theme/tokens';
import { Eyebrow } from '../brand/eyebrow';

const logo = require('../../../assets/logo.png');

type InfoScreen = 'Home' | 'About' | 'Founder' | 'Contact' | 'Privacy' | 'Terms';

type FooterLink = { label: string; onPress: () => void };
type FooterGroup = { title: string; links: FooterLink[] };

function FooterWordmark() {
  return (
    <View style={styles.logoCard}>
      <Image source={logo} style={styles.logo} resizeMode="contain" />
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
  onBecomeAdvertiser,
  onBoost,
}: {
  onNavigate: (screen: InfoScreen) => void;
  onBrowseSector: (slug: SectorSlug) => void;
  onPostAd: () => void;
  onBecomeAdvertiser: () => void;
  onBoost: () => void;
}): JSX.Element {
  const groups: FooterGroup[] = [
    {
      title: 'For Buyers',
      links: [
        { label: 'Browse Land', onPress: () => onBrowseSector('jayga-jomi') },
        { label: 'Browse Rentals', onPress: () => onBrowseSector('basha-bhara') },
        { label: 'Search by District', onPress: () => onNavigate('Home') },
      ],
    },
    {
      title: 'For Owners',
      links: [
        { label: 'Post Your Property', onPress: onPostAd },
        { label: 'Become an Advertiser', onPress: onBecomeAdvertiser },
        { label: 'Boost Your Listing', onPress: onBoost },
      ],
    },
    {
      title: 'Company',
      links: [
        { label: 'About Us', onPress: () => onNavigate('About') },
        { label: 'Meet the Founder', onPress: () => onNavigate('Founder') },
        { label: 'Contact Us', onPress: () => onNavigate('Contact') },
        { label: 'Terms & Conditions', onPress: () => onNavigate('Terms') },
        { label: 'Privacy Policy', onPress: () => onNavigate('Privacy') },
      ],
    },
    {
      title: 'Support',
      links: [
        { label: 'Contact Support', onPress: () => onNavigate('Contact') },
        { label: 'Safety Tips', onPress: () => onNavigate('Contact') },
        { label: 'Frequently Asked Questions', onPress: () => onNavigate('Home') },
      ],
    },
  ];

  return (
    <View style={styles.footer}>
      <View style={styles.body}>
        <View style={styles.brandBlock}>
          <FooterWordmark />
          <Text style={styles.tagline}>
            Bangladesh's property listing platform. Every listing is manually reviewed before publication.
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
  logoCard: {
    alignSelf: 'flex-start',
    backgroundColor: '#ffffff',
    borderRadius: radius.md,
    padding: 10,
  },
  logo: {
    width: 117,
    height: 96,
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
