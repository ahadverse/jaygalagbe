import { useEffect, useState } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { BOOST_TIERS } from '../../features/boost/types';
import { formatPrice } from '../../lib/format';
import { colors, fontFamily, radius } from '../../theme/tokens';
import { BrandCard } from '../brand/brand-card';
import { Eyebrow } from '../brand/eyebrow';

const cheapestBoost = BOOST_TIERS.reduce((cheapest, tier) =>
  tier.priceBdt < cheapest.priceBdt ? tier : cheapest,
);
const tierLabels = BOOST_TIERS.map((tier) => tier.label).join(', ');

const FAQS = [
  {
    question: 'Is Jayga Lagbe free to use?',
    answer:
      'Browsing and searching are free and need no account at all. Creating an account is free, and so is posting a listing. Boosting an ad is the only thing on the platform you ever pay for.',
  },
  {
    question: 'How long before my ad goes live?',
    answer:
      'Every submission goes into a review queue and a person checks it, usually within a day. If it is rejected you are told the reason, and you can fix the ad and resubmit it without starting again.',
  },
  {
    question: 'How do I contact an advertiser?',
    answer:
      // Web says "the message box in the sidebar" and "while you have the site
      // open" - neither describes the app, where the action is a button on the
      // listing and replies keep arriving as notifications.
      'Open the listing and tap "Message the advertiser". You need a free account to send the first message; after that the thread lives in your Messages tab, and replies arrive in real time.',
  },
  {
    question: 'What does boosting actually do?',
    answer: `A boosted ad sits above the organic results in its sector's listing and search pages for the whole period you buy. Boosts come in ${tierLabels}, starting at ${formatPrice(cheapestBoost.priceBdt)}, paid by bKash, Nagad or card, and activate automatically once the payment succeeds.`,
  },
  {
    question: 'Can I list my own property?',
    // Diverges from web, which still offers an "upgrade to an advertiser
    // account" that no longer exists: the backend's Role enum is USER/ADMIN
    // only, and every signed-in account already has the posting tools.
    answer:
      'Yes. Every account can post from the moment you sign up — there is no separate advertiser account to upgrade to. You can post listings, edit the price, mark a property sold or rented, and open per-ad statistics showing impressions, visits and how many people registered to contact you.',
  },
  {
    question: 'What if a listing looks fake?',
    answer:
      'Every ad is read by a moderator before it is published, and the team can take a live ad down at any point if it turns out to be a scam or has already gone. Whatever the listing says, visit the property in person and check the ownership papers before you pay any advance — we never handle money between you and an advertiser.',
  },
];

// Ports web/src/components/home/home-faq.tsx. Web uses native <details>, which
// RN has no equivalent of, so this is a controlled accordion. It holds one
// open question rather than web's independent toggles, because the section
// renders inside the home FlatList's header and six open answers would push
// the listings far off screen.
export function HomeFaq() {
  const [openQuestion, setOpenQuestion] = useState<string | null>(null);

  return (
    <View style={styles.section}>
      <View style={styles.heading}>
        <Eyebrow>Questions</Eyebrow>
        <Text style={styles.title}>Before you start</Text>
      </View>

      <View style={styles.list}>
        {FAQS.map((faq) => (
          <FaqItem
            key={faq.question}
            question={faq.question}
            answer={faq.answer}
            expanded={openQuestion === faq.question}
            onToggle={() =>
              setOpenQuestion((current) =>
                current === faq.question ? null : faq.question,
              )
            }
          />
        ))}
      </View>
    </View>
  );
}

function FaqItem({
  question,
  answer,
  expanded,
  onToggle,
}: {
  question: string;
  answer: string;
  expanded: boolean;
  onToggle: () => void;
}) {
  // Lazy state rather than useRef, matching ad-lightbox.tsx: the value is
  // handed straight to a transform, so it must not be read off a ref in render.
  const [spin] = useState(() => new Animated.Value(expanded ? 1 : 0));

  useEffect(() => {
    Animated.timing(spin, {
      toValue: expanded ? 1 : 0,
      duration: 180,
      useNativeDriver: true,
    }).start();
  }, [expanded, spin]);

  const rotate = spin.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  return (
    <BrandCard radius="lg" style={styles.card}>
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ expanded }}
        onPress={onToggle}
        style={({ pressed }) => [
          styles.header,
          pressed ? styles.headerPressed : null,
        ]}
      >
        <Text style={styles.question}>{question}</Text>
        <Animated.View
          style={[styles.chevron, { transform: [{ rotate }] }]}
          pointerEvents="none"
        >
          <Svg width={16} height={16} viewBox="0 0 24 24">
            <Path
              d="m6 9 6 6 6-6"
              fill="none"
              stroke={colors.neutral[600]}
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
        </Animated.View>
      </Pressable>

      {expanded ? <Text style={styles.answer}>{answer}</Text> : null}
    </BrandCard>
  );
}

const styles = StyleSheet.create({
  section: {
    paddingHorizontal: 16,
    paddingTop: 34,
    paddingBottom: 34,
    gap: 18,
  },
  heading: {
    gap: 8,
  },
  title: {
    fontFamily: fontFamily.display,
    fontSize: 26,
    lineHeight: 30,
    letterSpacing: -0.7,
    color: colors.neutral[900],
  },
  list: {
    gap: 10,
  },
  card: {
    padding: 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: 18,
    paddingVertical: 16,
  },
  headerPressed: {
    backgroundColor: colors.neutral[100],
    borderRadius: radius.lg,
  },
  question: {
    flex: 1,
    fontFamily: fontFamily.display,
    fontSize: 15.5,
    lineHeight: 21,
    letterSpacing: -0.3,
    color: colors.neutral[900],
  },
  chevron: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.full,
    backgroundColor: colors.neutral[100],
  },
  answer: {
    fontFamily: fontFamily.text,
    fontSize: 13.5,
    lineHeight: 21,
    color: colors.neutral[600],
    paddingHorizontal: 18,
    paddingBottom: 18,
  },
});
