import { Linking, StyleSheet, Text, View } from 'react-native';
import { Button } from 'react-native-paper';

import { BrandCard } from '../../components/brand/brand-card';
import { colors, fontFamily, radius } from '../../theme/tokens';
import { InfoPage, Paragraph, Section } from './legal-layout';

// PLACEHOLDER: swap for real support address before launch
const SUPPORT_EMAIL = 'support@jaygalagbe.com';
// PLACEHOLDER: swap for the real registered address before launch
const OFFICE_LOCATION = 'Dhaka, Bangladesh';

function openSupportMail(subject: string) {
  // Nothing useful to show if the device has no mail client configured, and a
  // failed intent must not surface as an unhandled rejection.
  void Linking.openURL(
    `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(subject)}`,
  ).catch(() => {});
}

function MailButton({ label, subject }: { label: string; subject: string }) {
  return (
    <Button
      mode="contained"
      icon="email-outline"
      onPress={() => openSupportMail(subject)}
      style={styles.mailButton}
      contentStyle={styles.mailButtonContent}
    >
      {label}
    </Button>
  );
}

export function ContactScreen() {
  return (
    <InfoPage
      eyebrow="Contact"
      title="Get in touch"
      intro="Different problems have different fastest routes. Pick the one that matches what you need."
    >
      <Section title="Something about a specific listing">
        <Paragraph>
          Message the advertiser from the listing itself. That thread is the
          fastest route by a long way - it reaches the person who actually knows
          the property, and it keeps the answer on record for both of you. Open
          the listing, write your question in the message box and check the
          Messages tab for the reply.
        </Paragraph>
        <Paragraph>
          We cannot answer questions about a property&apos;s price, condition or
          availability on an advertiser&apos;s behalf.
        </Paragraph>
      </Section>

      <Section title="A listing that looks suspicious">
        <Paragraph>
          Use the Report button on the listing itself. It is on every live ad,
          just under the advertiser&apos;s details. Choose the reason that fits
          - a fake or duplicate listing, the wrong section, a misleading price -
          and add a note if there is more to say.
        </Paragraph>
        <Paragraph>
          A report goes straight to our moderators. The advertiser is never told
          who reported them.
        </Paragraph>
      </Section>

      <Section title="Help with a boost payment">
        <Paragraph>
          If a boost payment was taken but the listing is not showing as
          boosted, give it a few minutes first - payments confirm on the
          gateway&apos;s side and the boost activates by itself once they do. If
          it still has not moved, email us with the listing title and the
          transaction ID from your payment confirmation, and we will trace it.
        </Paragraph>
        <MailButton
          label="Email about a payment"
          subject="Boost payment help"
        />
      </Section>

      <Section title="Everything else">
        <Paragraph>
          Account trouble, a moderation decision you think is wrong, a privacy
          request, or anything the app does not have a button for - email our
          support team.
        </Paragraph>
        <BrandCard variant="sunken" radius="lg" style={styles.detailsCard}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Support email</Text>
            <Text style={styles.detailValue}>{SUPPORT_EMAIL}</Text>
          </View>
          <View style={[styles.detailRow, styles.detailRowDivided]}>
            <Text style={styles.detailLabel}>Based in</Text>
            <Text style={styles.detailValue}>{OFFICE_LOCATION}</Text>
          </View>
        </BrandCard>
        <MailButton label="Email support" subject="Jayga Lagbe support" />
      </Section>

      <Section title="When to expect a reply">
        <Paragraph>
          We answer support email within two working days. Our working week is
          Sunday to Thursday, so a message sent on Friday is usually picked up
          on Sunday.
        </Paragraph>
        <Paragraph>
          Reports of fraudulent listings are looked at ahead of everything else.
        </Paragraph>
      </Section>
    </InfoPage>
  );
}

const styles = StyleSheet.create({
  mailButton: {
    borderRadius: radius.full,
    alignSelf: 'flex-start',
    marginTop: 2,
  },
  mailButtonContent: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  detailsCard: {
    gap: 2,
  },
  detailRow: {
    gap: 3,
    paddingVertical: 8,
  },
  detailRowDivided: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  detailLabel: {
    fontFamily: fontFamily.text,
    fontSize: 13,
    color: colors.neutral[600],
  },
  detailValue: {
    fontFamily: fontFamily.textSemibold,
    fontSize: 15,
    color: colors.neutral[900],
  },
});
