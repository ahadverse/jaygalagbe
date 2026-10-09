import { StyleSheet, Text, View } from 'react-native';

import { colors, fontFamily } from '../../theme/tokens';
import {
  BulletList,
  Callout,
  InfoPage,
  Paragraph,
  Section,
} from './legal-layout';

const reasons = [
  {
    title: 'Nationwide Property Opportunities',
    body: 'Explore property advertisements from different parts of Bangladesh and discover options that match your location and requirements.',
  },
  {
    title: 'Convenient Property Search',
    body: 'Browse listings and compare available details, including location, price, size, and property type, where provided.',
  },
  {
    title: 'A Platform for Owners and Advertisers',
    body: 'We aim to make it easier for property owners and authorized advertisers to publish listings and reach interested people.',
  },
  {
    title: 'Designed for Buyers and Renters',
    body: 'Our goal is to help users discover relevant property advertisements without having to search across numerous unrelated sources.',
  },
  {
    title: 'A Growing Property Community',
    body: 'We aim to build a useful online destination where people can explore property opportunities and connect with potential buyers, sellers, landlords, and tenants.',
  },
];

export function AboutScreen() {
  return (
    <InfoPage
      eyebrow="About Us"
      title="About JaygaLagbe.com"
      subtitle="Your Trusted Destination for Property Listings in Bangladesh"
      intro="Welcome to JaygaLagbe.com, an online platform designed to make finding, buying, selling, and renting property easier across Bangladesh."
    >
      <Paragraph>
        Whether you are looking for land to purchase, a house to sell, an
        apartment to rent, or a suitable property for your next investment,
        JaygaLagbe.com aims to help you discover property opportunities in one
        convenient place.
      </Paragraph>

      <Section title="Our Mission">
        <Paragraph>
          Our mission is to connect property owners, buyers, sellers,
          landlords, tenants, and real estate professionals through an
          accessible and user-friendly online platform.
        </Paragraph>
        <Paragraph>
          We aim to make property advertising more convenient and help people
          discover opportunities across different districts of Bangladesh.
        </Paragraph>
      </Section>

      <Section title="What You Can Find on JaygaLagbe.com">
        <Paragraph>
          Our platform is designed for a range of property needs, including:
        </Paragraph>
        <BulletList
          items={[
            {
              lead: 'Land for Sale:',
              text: 'Explore land and plot advertisements in different locations.',
            },
            {
              lead: 'Houses for Sale:',
              text: 'Discover residential properties offered by owners and advertisers.',
            },
            {
              lead: 'Property for Rent:',
              text: 'Find houses, apartments, rooms, and commercial spaces advertised for rent.',
            },
            {
              lead: 'Commercial Property:',
              text: 'Explore shops, offices, and other commercial property listings where available.',
            },
            {
              lead: 'Property Advertising:',
              text: 'Give owners and authorized advertisers a place to promote their available properties.',
            },
          ]}
        />
        <Text style={styles.note}>
          Available categories and features may vary as the platform develops.
        </Text>
      </Section>

      <Section title="Why Choose JaygaLagbe.com?">
        <View style={styles.reasons}>
          {reasons.map((reason, index) => (
            <View key={reason.title} style={styles.reason}>
              <View style={styles.pill}>
                <Text style={styles.pillText}>{index + 1}</Text>
              </View>
              <View style={styles.reasonBody}>
                <Text style={styles.reasonTitle}>{reason.title}</Text>
                <Text style={styles.reasonText}>{reason.body}</Text>
              </View>
            </View>
          ))}
        </View>
      </Section>

      <Section title="Our Commitment">
        <Paragraph>
          We believe that clear information and responsible communication are
          important when dealing with property.
        </Paragraph>
        <Paragraph>
          We encourage users to provide accurate advertisements, communicate
          honestly, and verify property ownership and legal documents before
          making payments or entering into agreements.
        </Paragraph>
        <Callout>
          <Text style={styles.calloutText}>
            JaygaLagbe.com aims to support property discovery and advertising.
            Unless a specific verification service is expressly offered, we do
            not guarantee the accuracy, ownership, availability, or legal
            status of individual listings.
          </Text>
        </Callout>
      </Section>

      <Section title="Our Vision">
        <Paragraph>
          Our vision is to become a recognized online destination for land,
          housing, rental, and other property listings across Bangladesh.
        </Paragraph>
        <Paragraph>
          We want to make it easier for people to find suitable property
          opportunities, advertise available properties, and connect with
          others in the property market.
        </Paragraph>
      </Section>

      <Section title="Get Started Today">
        <Paragraph>
          Looking for land? Planning to sell a property? Searching for a house
          or apartment to rent? Visit JaygaLagbe.com and explore the property
          opportunities available on our platform.
        </Paragraph>
        <Text style={styles.tagline}>
          JaygaLagbe.com — Find Property. Connect with People. Explore
          Opportunities.
        </Text>
      </Section>
    </InfoPage>
  );
}

const styles = StyleSheet.create({
  note: {
    fontFamily: fontFamily.text,
    fontSize: 12,
    lineHeight: 18,
    color: colors.neutral[500],
  },
  reasons: {
    gap: 14,
  },
  reason: {
    flexDirection: 'row',
    gap: 12,
  },
  pill: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.brand[600],
    alignItems: 'center',
    justifyContent: 'center',
  },
  pillText: {
    fontFamily: fontFamily.displaySemibold,
    fontSize: 14,
    color: '#ffffff',
  },
  reasonBody: {
    flex: 1,
    gap: 4,
  },
  reasonTitle: {
    fontFamily: fontFamily.textSemibold,
    fontSize: 15,
    lineHeight: 22,
    color: colors.neutral[900],
  },
  reasonText: {
    fontFamily: fontFamily.text,
    fontSize: 15,
    lineHeight: 25,
    color: colors.neutral[700],
  },
  calloutText: {
    fontFamily: fontFamily.text,
    fontSize: 15,
    lineHeight: 25,
    color: colors.warning[800],
  },
  tagline: {
    fontFamily: fontFamily.displaySemibold,
    fontSize: 15,
    lineHeight: 24,
    color: colors.brand[700],
  },
});
