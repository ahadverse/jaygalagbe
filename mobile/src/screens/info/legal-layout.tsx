import type { ReactNode } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { BrandCard } from '../../components/brand/brand-card';
import { Eyebrow } from '../../components/brand/eyebrow';
import { colors, fontFamily } from '../../theme/tokens';

// Privacy and Terms each run to several phone-screens of prose, and About and
// Contact sit one tap away from them - so all four share one shell rather than
// each setting its own type scale. Anything that differed between them would
// read as a different document written by a different company.
export function InfoPage({
  eyebrow,
  title,
  intro,
  lastUpdated,
  children,
}: {
  eyebrow: string;
  title: string;
  intro?: string;
  lastUpdated?: string;
  children: ReactNode;
}) {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <Eyebrow>{eyebrow}</Eyebrow>
        <Text style={styles.title}>{title}</Text>
        {intro ? <Text style={styles.intro}>{intro}</Text> : null}
        {lastUpdated ? (
          <Text style={styles.lastUpdated}>Last updated: {lastUpdated}</Text>
        ) : null}
      </View>
      {children}
    </ScrollView>
  );
}

export function Section({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

export function Paragraph({ children }: { children: ReactNode }) {
  return <Text style={styles.paragraph}>{children}</Text>;
}

export function BulletList({ items }: { items: string[] }) {
  return (
    <View style={styles.list}>
      {items.map((item) => (
        <View key={item} style={styles.listItem}>
          <Text style={styles.bullet}>{'•'}</Text>
          <Text style={styles.listItemText}>{item}</Text>
        </View>
      ))}
    </View>
  );
}

/** For the one or two warnings in a document that must not be skimmed past. */
export function Callout({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <BrandCard variant="warning" radius="lg" style={styles.callout}>
      <Text style={styles.calloutTitle}>{title}</Text>
      {children}
    </BrandCard>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingBottom: 56,
    gap: 26,
  },
  header: {
    gap: 6,
  },
  title: {
    fontFamily: fontFamily.display,
    fontSize: 28,
    lineHeight: 34,
    letterSpacing: -0.8,
    color: colors.neutral[900],
  },
  intro: {
    fontFamily: fontFamily.text,
    fontSize: 15,
    lineHeight: 24,
    color: colors.neutral[600],
    marginTop: 2,
  },
  lastUpdated: {
    fontFamily: fontFamily.textMedium,
    fontSize: 12,
    color: colors.neutral[500],
    marginTop: 6,
  },
  section: {
    gap: 10,
  },
  sectionTitle: {
    fontFamily: fontFamily.displaySemibold,
    fontSize: 18,
    lineHeight: 24,
    letterSpacing: -0.4,
    color: colors.neutral[900],
  },
  // Long-form prose needs more air than the app's dense cards: 15/25 is what
  // keeps a full screen of legal text readable at arm's length.
  paragraph: {
    fontFamily: fontFamily.text,
    fontSize: 15,
    lineHeight: 25,
    color: colors.neutral[700],
  },
  list: {
    gap: 8,
  },
  listItem: {
    flexDirection: 'row',
    gap: 10,
  },
  bullet: {
    fontFamily: fontFamily.text,
    fontSize: 15,
    lineHeight: 25,
    color: colors.brand[500],
  },
  listItemText: {
    flex: 1,
    fontFamily: fontFamily.text,
    fontSize: 15,
    lineHeight: 25,
    color: colors.neutral[700],
  },
  callout: {
    gap: 8,
  },
  calloutTitle: {
    fontFamily: fontFamily.textSemibold,
    fontSize: 14,
    color: colors.warning[800],
  },
});
