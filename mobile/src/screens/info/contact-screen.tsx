import Ionicons from '@expo/vector-icons/Ionicons';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Button, HelperText, TextInput } from 'react-native-paper';

import { ApiError } from '../../api/errors';
import { BrandCard } from '../../components/brand/brand-card';
import { Eyebrow } from '../../components/brand/eyebrow';
import { SelectField } from '../../components/forms/select-field';
import { CONTACT_TOPICS, sendContactMessage } from '../../features/contact/api';
import {
  contactSchema,
  type ContactFormValues,
} from '../../features/contact/schema';
import { colors, fontFamily, radius } from '../../theme/tokens';

const AUDIENCES = [
  {
    title: 'Buyers & renters',
    body: 'Looking for land or a house to rent? We can help you find your way around, understand a listing, or report something that looks off.',
    points: [
      'Finding the right listing',
      'Contacting an advertiser',
      'Reporting a suspicious ad',
    ],
  },
  {
    title: 'Advertisers & owners',
    body: 'Selling land or renting out a home? Get help posting, editing or boosting your ad so it reaches more people.',
    points: [
      'Posting and editing ads',
      'Boosting for more visibility',
      'Ad approval questions',
    ],
  },
  {
    title: 'Partners & media',
    body: 'Agencies, developers, businesses and journalists are welcome to get in touch about partnerships and collaborations.',
    points: [
      'Business partnerships',
      'Bulk or agency listings',
      'Press and media enquiries',
    ],
  },
];

const STEPS = [
  {
    n: '1',
    title: 'You send a message',
    body: 'Tell us what you need using the form above.',
  },
  {
    n: '2',
    title: 'We review it',
    body: 'A team member reads it and looks into your question.',
  },
  {
    n: '3',
    title: 'We reply to you',
    body: 'You hear back by email or phone, usually within one working day.',
  },
];

const SAFETY_TIPS = [
  'Visit the property in person and meet the owner before paying anything.',
  'Never send money in advance to someone you have not met.',
  'Verify ownership papers (deed, khatian, mutation) before buying land.',
  'Keep conversations on Jayga Lagbe so there is a record if something goes wrong.',
  'Report any ad that asks for advance payment or looks too good to be true.',
];

const TOPIC_LABELS: string[] = CONTACT_TOPICS.map((topic) => topic.label);

function topicLabel(value: string): string {
  return CONTACT_TOPICS.find((topic) => topic.value === value)?.label ?? '';
}

function ContactForm() {
  const [sent, setSent] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: '',
      topic: 'general',
      email: '',
      phone: '',
      message: '',
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);
    try {
      await sendContactMessage({
        name: values.name,
        email: values.email || undefined,
        phone: values.phone || undefined,
        topic: values.topic,
        message: values.message,
      });
      setSent(true);
    } catch (error) {
      if (error instanceof ApiError && error.status === 429) {
        setFormError('Too many messages sent. Please try again later.');
      } else if (error instanceof ApiError && error.status > 0) {
        setFormError(error.message || "Couldn't send your message.");
      } else {
        setFormError("Couldn't reach the server. Please try again.");
      }
    }
  });

  if (sent) {
    return (
      <View style={styles.success}>
        <View style={styles.successIcon}>
          <Ionicons name="checkmark" size={30} color={colors.success[700]} />
        </View>
        <Text style={styles.successTitle}>Message received</Text>
        <Text style={styles.successBody}>
          Thank you for reaching out. Our team will get back to you using the
          email or phone number you gave, usually within one working day.
        </Text>
      </View>
    );
  }

  return (
    <View>
      <Controller
        control={control}
        name="name"
        render={({ field }) => (
          <TextInput
            label="Full name"
            mode="outlined"
            autoComplete="name"
            maxLength={80}
            value={field.value}
            onChangeText={field.onChange}
            onBlur={field.onBlur}
            error={!!errors.name}
          />
        )}
      />
      <HelperText type="error" visible={!!errors.name}>
        {errors.name?.message}
      </HelperText>

      <Controller
        control={control}
        name="topic"
        render={({ field }) => (
          <SelectField
            label="What is this about?"
            value={topicLabel(field.value)}
            options={TOPIC_LABELS}
            onChange={(label) => {
              const match = CONTACT_TOPICS.find((t) => t.label === label);
              if (match) field.onChange(match.value);
            }}
          />
        )}
      />
      <View style={styles.gap} />

      <Controller
        control={control}
        name="email"
        render={({ field }) => (
          <TextInput
            label="Email"
            mode="outlined"
            autoCapitalize="none"
            autoComplete="email"
            keyboardType="email-address"
            maxLength={120}
            value={field.value}
            onChangeText={field.onChange}
            onBlur={field.onBlur}
            error={!!errors.email}
          />
        )}
      />
      <HelperText type="error" visible={!!errors.email}>
        {errors.email?.message}
      </HelperText>

      <Controller
        control={control}
        name="phone"
        render={({ field }) => (
          <TextInput
            label="Phone"
            mode="outlined"
            placeholder="01XXXXXXXXX"
            autoComplete="tel"
            keyboardType="phone-pad"
            maxLength={20}
            value={field.value}
            onChangeText={field.onChange}
            onBlur={field.onBlur}
            error={!!errors.phone}
          />
        )}
      />
      <HelperText type={errors.phone ? 'error' : 'info'} visible>
        {errors.phone?.message ??
          'Give at least one of email or phone so we can reply.'}
      </HelperText>

      <Controller
        control={control}
        name="message"
        render={({ field }) => (
          <TextInput
            label="Your message"
            mode="outlined"
            multiline
            numberOfLines={6}
            maxLength={2000}
            placeholder="Tell us how we can help. If it's about an ad, include the ad link."
            style={styles.messageInput}
            value={field.value}
            onChangeText={field.onChange}
            onBlur={field.onBlur}
            error={!!errors.message}
          />
        )}
      />
      <HelperText type="error" visible={!!errors.message}>
        {errors.message?.message}
      </HelperText>

      <HelperText type="error" visible={!!formError}>
        {formError}
      </HelperText>

      <Button
        mode="contained"
        onPress={onSubmit}
        loading={isSubmitting}
        disabled={isSubmitting}
        style={styles.submitButton}
        contentStyle={styles.submitContent}
      >
        {isSubmitting ? 'Sending…' : 'Send message'}
      </Button>
    </View>
  );
}

export function ContactScreen() {
  return (
    <ScrollView
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.hero}>
        <Eyebrow>Contact us</Eyebrow>
        <Text style={styles.title}>How can we help you?</Text>
        <Text style={styles.intro}>
          Questions about a listing, your account or advertising with us? Send a
          message and our team will get back to you, usually within one working
          day.
        </Text>
      </View>

      <BrandCard radius="2xl" style={styles.formCard}>
        <Text style={styles.cardTitle}>Send us a message</Text>
        <Text style={styles.cardSub}>
          Fill in the form and we&apos;ll reply by email or phone.
        </Text>
        <ContactForm />
      </BrandCard>

      <View style={styles.block}>
        <Eyebrow>Who we help</Eyebrow>
        <Text style={styles.sectionTitle}>Whatever you need, we are here</Text>
        {AUDIENCES.map((audience) => (
          <BrandCard key={audience.title} style={styles.audienceCard}>
            <Text style={styles.audienceTitle}>{audience.title}</Text>
            <Text style={styles.body}>{audience.body}</Text>
            <View style={styles.points}>
              {audience.points.map((point) => (
                <View key={point} style={styles.pointRow}>
                  <Ionicons
                    name="checkmark"
                    size={16}
                    color={colors.success[600]}
                  />
                  <Text style={styles.pointText}>{point}</Text>
                </View>
              ))}
            </View>
          </BrandCard>
        ))}
      </View>

      <View style={styles.block}>
        <Eyebrow>What happens next</Eyebrow>
        <Text style={styles.sectionTitle}>From your message to our reply</Text>
        {STEPS.map((step) => (
          <BrandCard key={step.n} style={styles.stepCard}>
            <View style={styles.stepBadge}>
              <Text style={styles.stepBadgeText}>{step.n}</Text>
            </View>
            <View style={styles.stepCopy}>
              <Text style={styles.audienceTitle}>{step.title}</Text>
              <Text style={styles.body}>{step.body}</Text>
            </View>
          </BrandCard>
        ))}
      </View>

      <View style={styles.block}>
        <Eyebrow>Stay safe</Eyebrow>
        <Text style={styles.sectionTitle}>Tips for safer property deals</Text>
        <Text style={styles.body}>
          Most deals go smoothly, but a little caution protects you. If
          something feels wrong, tell us.
        </Text>
        {SAFETY_TIPS.map((tip) => (
          <BrandCard
            key={tip}
            variant="sunken"
            radius="md"
            style={styles.tipCard}
          >
            <Ionicons
              name="shield-checkmark-outline"
              size={20}
              color={colors.brand[600]}
              style={styles.tipIcon}
            />
            <Text style={styles.tipText}>{tip}</Text>
          </BrandCard>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingBottom: 56,
    gap: 28,
  },
  hero: {
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
  formCard: {
    padding: 18,
  },
  cardTitle: {
    fontFamily: fontFamily.displaySemibold,
    fontSize: 20,
    color: colors.neutral[900],
  },
  cardSub: {
    fontFamily: fontFamily.text,
    fontSize: 13.5,
    color: colors.neutral[600],
    marginTop: 2,
    marginBottom: 16,
  },
  gap: {
    height: 8,
  },
  messageInput: {
    minHeight: 130,
  },
  submitButton: {
    borderRadius: radius.full,
    marginTop: 4,
  },
  submitContent: {
    paddingVertical: 6,
  },
  success: {
    alignItems: 'center',
    gap: 10,
    paddingVertical: 24,
  },
  successIcon: {
    width: 56,
    height: 56,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.success[50],
  },
  successTitle: {
    fontFamily: fontFamily.display,
    fontSize: 20,
    color: colors.neutral[900],
  },
  successBody: {
    fontFamily: fontFamily.text,
    fontSize: 14,
    lineHeight: 21,
    textAlign: 'center',
    color: colors.neutral[600],
  },
  block: {
    gap: 12,
  },
  sectionTitle: {
    fontFamily: fontFamily.displaySemibold,
    fontSize: 22,
    lineHeight: 28,
    letterSpacing: -0.5,
    color: colors.neutral[900],
  },
  audienceCard: {
    padding: 18,
    gap: 10,
  },
  audienceTitle: {
    fontFamily: fontFamily.displaySemibold,
    fontSize: 17,
    color: colors.neutral[900],
  },
  body: {
    fontFamily: fontFamily.text,
    fontSize: 14,
    lineHeight: 22,
    color: colors.neutral[600],
  },
  points: {
    gap: 6,
  },
  pointRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  pointText: {
    flex: 1,
    fontFamily: fontFamily.text,
    fontSize: 14,
    color: colors.neutral[900],
  },
  stepCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 16,
  },
  stepBadge: {
    width: 40,
    height: 40,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.brand[600],
  },
  stepBadgeText: {
    fontFamily: fontFamily.display,
    fontSize: 16,
    color: '#ffffff',
  },
  stepCopy: {
    flex: 1,
    gap: 2,
  },
  tipCard: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  tipIcon: {
    marginTop: 1,
  },
  tipText: {
    flex: 1,
    fontFamily: fontFamily.text,
    fontSize: 14,
    lineHeight: 21,
    color: colors.neutral[900],
  },
});
