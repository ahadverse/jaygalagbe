import { useNavigation, type NavigationProp } from '@react-navigation/native';
import type { ReactNode } from 'react';
import {
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { BrandCard } from '../../components/brand/brand-card';
import { Eyebrow } from '../../components/brand/eyebrow';
import type { InfoScreensParamList } from '../../navigation/types';
import { colors, fontFamily } from '../../theme/tokens';

// Privacy and Terms each run to several phone-screens of prose, and About and
// Contact sit one tap away from them - so all four share one shell rather than
// each setting its own type scale. Anything that differed between them would
// read as a different document written by a different company.
export function InfoPage({
  eyebrow,
  title,
  subtitle,
  intro,
  lastUpdated,
  effectiveDate,
  children,
}: {
  eyebrow: string;
  title: string;
  subtitle?: string;
  intro?: string;
  lastUpdated?: string;
  effectiveDate?: string;
  children: ReactNode;
}) {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <Eyebrow>{eyebrow}</Eyebrow>
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        {intro ? <Text style={styles.intro}>{intro}</Text> : null}
        {lastUpdated ? (
          <Text style={styles.lastUpdated}>Last updated: {lastUpdated}</Text>
        ) : null}
        {effectiveDate ? (
          <Text style={styles.lastUpdated}>
            Effective Date: {effectiveDate}
          </Text>
        ) : null}
      </View>
      {children}
    </ScrollView>
  );
}

export function Section({
  title,
  number,
  children,
}: {
  title: string;
  number?: number;
  children: ReactNode;
}) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>
        {number !== undefined ? `${number}. ` : ''}
        {title}
      </Text>
      {children}
    </View>
  );
}

export function SubHeading({ children }: { children: ReactNode }) {
  return <Text style={styles.subHeading}>{children}</Text>;
}

export function Paragraph({ children }: { children: ReactNode }) {
  return <Text style={styles.paragraph}>{children}</Text>;
}

export type BulletItem = string | { lead: string; text: string };

export function BulletList({ items }: { items: BulletItem[] }) {
  return (
    <View style={styles.list}>
      {items.map((item, index) => (
        <View
          key={`${index}-${typeof item === 'string' ? item : item.lead}`}
          style={styles.listItem}
        >
          <Text style={styles.bullet}>{'•'}</Text>
          <Text style={styles.listItemText}>
            {typeof item === 'string' ? (
              item
            ) : (
              <>
                <Text style={styles.lead}>{item.lead}</Text> {item.text}
              </>
            )}
          </Text>
        </View>
      ))}
    </View>
  );
}

/** Tappable inline link; a failed openURL (no handler) is swallowed. */
export function ExternalLink({ url }: { url: string }) {
  return (
    <Text
      accessibilityRole="link"
      style={styles.link}
      onPress={() => {
        Linking.openURL(url).catch(() => {});
      }}
    >
      {url}
    </Text>
  );
}

export function WebsiteLine() {
  return (
    <Paragraph>
      Website: <ExternalLink url="https://jaygalagbe.com/" />
    </Paragraph>
  );
}

export function ContactLink() {
  const navigation = useNavigation<NavigationProp<InfoScreensParamList>>();
  return (
    <Pressable
      accessibilityRole="button"
      onPress={() => navigation.navigate('Contact')}
      style={({ pressed }) => [
        styles.contactButton,
        pressed ? styles.pressed : null,
      ]}
    >
      <Text style={styles.contactButtonLabel}>Go to the contact page</Text>
    </Pressable>
  );
}

export type LegalBlock =
  | { p: string }
  | { h: string }
  | { list: BulletItem[] }
  | { contact: string }
  | { website: true };

export type LegalSectionData = { title: string; blocks: LegalBlock[] };

/** Renders numbered terms/privacy sections from plain data. */
export function LegalSections({ sections }: { sections: LegalSectionData[] }) {
  return (
    <>
      {sections.map((section, i) => (
        <Section key={section.title} number={i + 1} title={section.title}>
          {section.blocks.map((block, j) => {
            if ('p' in block) return <Paragraph key={j}>{block.p}</Paragraph>;
            if ('h' in block) return <SubHeading key={j}>{block.h}</SubHeading>;
            if ('list' in block) return <BulletList key={j} items={block.list} />;
            if ('contact' in block) {
              return (
                <View key={j} style={styles.section}>
                  <Paragraph>{block.contact}</Paragraph>
                  <ContactLink />
                </View>
              );
            }
            return <WebsiteLine key={j} />;
          })}
        </Section>
      ))}
    </>
  );
}

/** For the one or two warnings in a document that must not be skimmed past. */
export function Callout({
  title,
  children,
}: {
  title?: string;
  children: ReactNode;
}) {
  return (
    <BrandCard variant="warning" radius="lg" style={styles.callout}>
      {title ? <Text style={styles.calloutTitle}>{title}</Text> : null}
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
  subtitle: {
    fontFamily: fontFamily.displaySemibold,
    fontSize: 17,
    lineHeight: 24,
    color: colors.brand[700],
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
  subHeading: {
    fontFamily: fontFamily.textSemibold,
    fontSize: 15,
    lineHeight: 22,
    color: colors.neutral[900],
    marginTop: 4,
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
  lead: {
    fontFamily: fontFamily.textSemibold,
    color: colors.neutral[900],
  },
  link: {
    fontFamily: fontFamily.textSemibold,
    color: colors.brand[700],
    textDecorationLine: 'underline',
  },
  contactButton: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    backgroundColor: colors.brand[700],
    paddingHorizontal: 18,
    paddingVertical: 10,
  },
  contactButtonLabel: {
    fontFamily: fontFamily.textSemibold,
    fontSize: 14,
    color: '#ffffff',
  },
  pressed: {
    opacity: 0.8,
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
