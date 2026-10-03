import { LinearGradient } from 'expo-linear-gradient';
import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';

import { colors, fontFamily, radius, shadow } from '../../theme/tokens';
import { Eyebrow } from '../brand/eyebrow';

const ICON_STROKE = {
  fill: 'none',
  stroke: colors.brand[700],
  strokeWidth: 1.7,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
} as const;

const STEPS: {
  step: string;
  title: string;
  description: string;
  icon: ReactNode;
}[] = [
  {
    step: '01',
    title: 'Browse & filter',
    description:
      'Search Jayga Jomi or Basha Bhara listings by location, price, and size — no account needed.',
    icon: (
      <>
        <Circle cx={11} cy={11} r={7} {...ICON_STROKE} />
        <Path d="m20 20-3.5-3.5" {...ICON_STROKE} />
      </>
    ),
  },
  {
    step: '02',
    title: 'Message the advertiser',
    description:
      'Create a free account to unlock direct, real-time chat with the person behind the listing.',
    icon: (
      <Path
        d="M4 6.5A2.5 2.5 0 0 1 6.5 4h11A2.5 2.5 0 0 1 20 6.5v7a2.5 2.5 0 0 1-2.5 2.5H10l-4.5 4v-4A1.5 1.5 0 0 1 4 14.5v-8Z"
        {...ICON_STROKE}
      />
    ),
  },
  {
    step: '03',
    title: 'Close with confidence',
    description:
      "Every ad is manually reviewed before it goes live, so you're never chasing a fake listing.",
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
];

// Ports web/src/components/home/how-it-works.tsx. Two deviations: web's
// `bg-gradient-to-b from-background to-brand-50/60` becomes a LinearGradient
// because RN has no background-image, and web's three-across row - joined by a
// horizontal rule that fades between steps - is rotated into a vertical spine,
// since three columns of body copy are unreadable at phone width. The rule
// still runs from one step's icon to the next, so the sequence reads as one
// connected path rather than three loose cards.
export function HowItWorks() {
  return (
    <LinearGradient
      colors={[colors.surface, colors.brand[50]]}
      style={styles.section}
    >
      <View style={styles.heading}>
        <Eyebrow style={styles.eyebrow}>How it works</Eyebrow>
        <Text style={styles.title}>
          From search to conversation in three steps
        </Text>
        <Text style={styles.intro}>
          No brokers in the middle, no paywall on browsing — just verified
          listings and a direct line to the owner.
        </Text>
      </View>

      {/* No gap between steps: the spacing lives inside each row so the rule
          stays unbroken from one icon to the next. */}
      <View>
        {STEPS.map((item, index) => {
          const isLast = index === STEPS.length - 1;
          return (
            <View key={item.step} style={styles.step}>
              <View style={styles.spine}>
                <View style={styles.iconTile}>
                  <Svg width={20} height={20} viewBox="0 0 24 24">
                    {item.icon}
                  </Svg>
                </View>
                {isLast ? null : (
                  <LinearGradient
                    colors={[colors.brand[200], 'transparent']}
                    style={styles.spineRule}
                  />
                )}
              </View>

              <View style={[styles.stepText, isLast ? null : styles.stepGap]}>
                <Eyebrow style={styles.stepNumber}>{item.step}</Eyebrow>
                <Text style={styles.stepTitle}>{item.title}</Text>
                <Text style={styles.stepBody}>{item.description}</Text>
              </View>
            </View>
          );
        })}
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  section: {
    paddingHorizontal: 16,
    paddingTop: 34,
    paddingBottom: 34,
    gap: 24,
    borderTopWidth: 1,
    borderTopColor: colors.border,
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
  intro: {
    fontFamily: fontFamily.text,
    fontSize: 14.5,
    lineHeight: 23,
    color: colors.neutral[600],
  },
  step: {
    flexDirection: 'row',
    gap: 14,
  },
  spine: {
    alignItems: 'center',
    gap: 8,
  },
  iconTile: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.lg,
    backgroundColor: colors.surfaceCard,
    borderWidth: 1,
    borderColor: 'rgba(22,18,15,0.05)', // web's ring-1 ring-neutral-900/5
    ...shadow('sm'),
  },
  spineRule: {
    flex: 1,
    width: 2,
    borderRadius: radius.full,
  },
  stepText: {
    flex: 1,
    gap: 6,
    paddingTop: 2,
  },
  stepGap: {
    paddingBottom: 26,
  },
  stepNumber: {
    color: colors.brand[600],
    fontVariant: ['tabular-nums'],
  },
  stepTitle: {
    fontFamily: fontFamily.display,
    fontSize: 17,
    letterSpacing: -0.4,
    color: colors.neutral[900],
  },
  stepBody: {
    fontFamily: fontFamily.text,
    fontSize: 13.5,
    lineHeight: 21,
    color: colors.neutral[600],
  },
});
