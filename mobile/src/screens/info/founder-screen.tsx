import { useNavigation, type NavigationProp } from '@react-navigation/native';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { BrandCard } from '../../components/brand/brand-card';
import { Eyebrow } from '../../components/brand/eyebrow';
import type { InfoScreensParamList } from '../../navigation/types';
import { colors, fontFamily, radius, shadow } from '../../theme/tokens';

const photo = require('../../../assets/founder.jpeg');

const FOUNDER = {
  name: 'Ziaul Haque',
  initials: 'ZH',
  role: 'Founder & Managing Director',
  company: 'JaygaLagbe.com',
};

const AVATAR = 224;

export function FounderScreen() {
  const navigation = useNavigation<NavigationProp<InfoScreensParamList>>();

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.hero}>
        <Eyebrow>Meet the Founder</Eyebrow>
        <View style={styles.avatarHalo}>
          {/* The face sits in the top third of the portrait, so the image is
           * rendered a little taller than the circle and pinned to the top. */}
          <View style={styles.avatar}>
            <Image
              source={photo}
              accessibilityLabel={FOUNDER.name}
              style={styles.avatarImage}
              resizeMode="cover"
            />
          </View>
        </View>
        <Text style={styles.name}>{FOUNDER.name}</Text>
        <Text style={styles.role}>
          {FOUNDER.role}, {FOUNDER.company}
        </Text>
      </View>

      <BrandCard radius="2xl" style={styles.quoteCard}>
        <Text style={styles.quoteMark}>{'“'}</Text>
        <Text style={styles.leadParagraph}>
          JaygaLagbe.com was created with a simple vision: to make property
          discovery and advertising easier, more accessible, and more convenient
          for people across Bangladesh.
        </Text>
        <Text style={styles.paragraph}>
          Our goal is to connect property owners, buyers, sellers, landlords,
          and tenants through a modern online platform where people can discover
          property opportunities more easily.
        </Text>
        <Text style={styles.paragraph}>
          We believe that technology can make the property market more
          transparent, accessible, and convenient for everyone.
        </Text>

        <View style={styles.signature}>
          <View style={styles.initials}>
            <Text style={styles.initialsText}>{FOUNDER.initials}</Text>
          </View>
          <View style={styles.signatureCopy}>
            <Text style={styles.signatureName}>
              {'—'} {FOUNDER.name}
            </Text>
            <Text style={styles.signatureMeta}>{FOUNDER.role}</Text>
            <Text style={styles.signatureMeta}>{FOUNDER.company}</Text>
          </View>
        </View>
      </BrandCard>

      <View style={styles.links}>
        <Pressable onPress={() => navigation.navigate('About')} hitSlop={8}>
          <Text style={styles.link}>About JaygaLagbe.com {'→'}</Text>
        </Pressable>
        <Pressable onPress={() => navigation.navigate('Contact')} hitSlop={8}>
          <Text style={styles.link}>Get in touch {'→'}</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingBottom: 56,
    gap: 24,
  },
  hero: {
    alignItems: 'center',
    gap: 8,
    paddingTop: 8,
  },
  avatarHalo: {
    marginTop: 20,
    marginBottom: 12,
    padding: 6,
    borderRadius: radius.full,
    backgroundColor: colors.brand[100],
  },
  avatar: {
    width: AVATAR,
    height: AVATAR,
    borderRadius: radius.full,
    overflow: 'hidden',
    borderWidth: 4,
    borderColor: '#ffffff',
    backgroundColor: colors.brand[200],
    ...shadow('lg'),
  },
  avatarImage: {
    width: AVATAR,
    height: AVATAR * 1.12,
    position: 'absolute',
    top: 0,
    left: 0,
  },
  name: {
    fontFamily: fontFamily.display,
    fontSize: 30,
    lineHeight: 36,
    letterSpacing: -0.8,
    color: colors.neutral[900],
    textAlign: 'center',
  },
  role: {
    fontFamily: fontFamily.displaySemibold,
    fontSize: 15,
    lineHeight: 22,
    color: colors.brand[700],
    textAlign: 'center',
  },
  quoteCard: {
    padding: 22,
    gap: 16,
  },
  quoteMark: {
    fontFamily: fontFamily.display,
    fontSize: 64,
    lineHeight: 56,
    height: 36,
    color: colors.brand[200],
  },
  leadParagraph: {
    fontFamily: fontFamily.text,
    fontSize: 16,
    lineHeight: 26,
    color: colors.neutral[900],
  },
  paragraph: {
    fontFamily: fontFamily.text,
    fontSize: 16,
    lineHeight: 26,
    color: colors.neutral[600],
  },
  signature: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginTop: 8,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  initials: {
    width: 48,
    height: 48,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.brand[600],
  },
  initialsText: {
    fontFamily: fontFamily.display,
    fontSize: 16,
    color: '#ffffff',
  },
  signatureCopy: {
    flex: 1,
    gap: 1,
  },
  signatureName: {
    fontFamily: fontFamily.display,
    fontSize: 16,
    color: colors.neutral[900],
  },
  signatureMeta: {
    fontFamily: fontFamily.text,
    fontSize: 13,
    color: colors.neutral[600],
  },
  links: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 20,
  },
  link: {
    fontFamily: fontFamily.textSemibold,
    fontSize: 14,
    color: colors.brand[700],
  },
});
