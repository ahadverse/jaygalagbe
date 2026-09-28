import * as WebBrowser from 'expo-web-browser';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Button, HelperText } from 'react-native-paper';

import { ApiError } from '../../api/errors';
import { BrandCard } from '../../components/brand/brand-card';
import { Eyebrow } from '../../components/brand/eyebrow';
import {
  isTrustedGatewayUrl,
  purchaseBoost,
  startCheckout,
} from '../../features/boost/api';
import {
  BOOST_TIERS,
  PAYMENT_GATEWAYS,
  type BoostTier,
  type PaymentGateway,
} from '../../features/boost/types';
import { formatPrice } from '../../lib/format';
import type { MyAdsStackScreenProps } from '../../navigation/types';
import { colors, fontFamily, radius } from '../../theme/tokens';

const TIER_DAYS: Record<BoostTier, number> = {
  THREE_DAY: 3,
  SEVEN_DAY: 7,
  FIFTEEN_DAY: 15,
};

// Mirrors web/src/app/dashboard/ads/[id]/boost/page.tsx. There's no
// payment-status endpoint anywhere in the backend today (see app.md's open
// items) - once the in-app browser closes, the most honest thing to show is
// "we'll confirm once it clears" rather than faking a poll against nothing.
export function BoostScreen({
  route,
  navigation,
}: MyAdsStackScreenProps<'Boost'>) {
  const { adId } = route.params;
  const [tier, setTier] = useState<BoostTier>(BOOST_TIERS[0].value);
  const [gateway, setGateway] = useState<PaymentGateway>(
    PAYMENT_GATEWAYS[0].value,
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [awaitingPayment, setAwaitingPayment] = useState(false);

  async function submit() {
    setSubmitting(true);
    setError(null);
    try {
      const boost = await purchaseBoost(adId, { tier, gateway });
      const { gatewayPageUrl } = await startCheckout(boost.paymentId);
      if (!isTrustedGatewayUrl(gatewayPageUrl)) {
        setError('The payment gateway returned an unexpected address.');
        return;
      }
      setAwaitingPayment(true);
      await WebBrowser.openBrowserAsync(gatewayPageUrl);
    } catch (cause) {
      setError(
        cause instanceof ApiError
          ? cause.message
          : "Couldn't reach the payment gateway. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (awaitingPayment) {
    return (
      <View style={styles.center}>
        <Eyebrow>Payment pending</Eyebrow>
        <Text style={styles.centerTitle}>Verifying payment</Text>
        <Text style={styles.centerText}>
          Boost activates automatically once payment succeeds. Check this
          ad&apos;s status in a minute or two from My Ads - failed payments are
          never charged.
        </Text>
        <Button
          mode="contained"
          onPress={() => navigation.goBack()}
          style={styles.cta}
          contentStyle={styles.ctaContent}
        >
          Back to My Ads
        </Button>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <Eyebrow>Paid placement</Eyebrow>
        <Text style={styles.heading}>Boost this ad</Text>
        <Text style={styles.subheading}>
          Boosted listings sit above every organic result in search and category
          pages for the whole period.
        </Text>
      </View>

      <View style={styles.tierList}>
        {BOOST_TIERS.map((option) => {
          const selected = tier === option.value;
          const perDay = Math.round(option.priceBdt / TIER_DAYS[option.value]);
          return (
            <Pressable
              key={option.value}
              accessibilityRole="radio"
              accessibilityState={{ selected }}
              onPress={() => setTier(option.value)}
            >
              <BrandCard
                variant="card"
                radius="lg"
                style={
                  selected ? [styles.tier, styles.tierSelected] : [styles.tier]
                }
              >
                <View style={styles.tierRow}>
                  <View
                    style={[styles.radio, selected ? styles.radioOn : null]}
                  >
                    {selected ? <View style={styles.radioDot} /> : null}
                  </View>
                  <View style={styles.tierCopy}>
                    <Text style={styles.tierLabel}>
                      {option.label} at the top
                    </Text>
                    <Text style={styles.tierBlurb}>{option.blurb}</Text>
                  </View>
                  <View style={styles.tierPriceCol}>
                    <Text style={styles.tierPrice}>
                      {formatPrice(option.priceBdt)}
                    </Text>
                    <Text style={styles.tierPerDay}>
                      {formatPrice(perDay)} / day
                    </Text>
                  </View>
                </View>
              </BrandCard>
            </Pressable>
          );
        })}
      </View>

      <BrandCard variant="card" radius="lg" style={styles.paymentCard}>
        <Eyebrow>Payment method</Eyebrow>
        <View style={styles.gatewayRow}>
          {PAYMENT_GATEWAYS.map((option) => {
            const selected = gateway === option.value;
            return (
              <Pressable
                key={option.value}
                accessibilityRole="radio"
                accessibilityState={{ selected }}
                onPress={() => setGateway(option.value)}
                style={[
                  styles.gateway,
                  selected ? styles.gatewaySelected : null,
                ]}
              >
                <Text
                  style={[
                    styles.gatewayLabel,
                    selected ? styles.gatewayLabelSelected : null,
                  ]}
                >
                  {option.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </BrandCard>

      {error ? (
        <HelperText type="error" visible>
          {error}
        </HelperText>
      ) : null}

      <Button
        mode="contained"
        onPress={submit}
        loading={submitting}
        disabled={submitting}
        style={styles.cta}
        contentStyle={styles.ctaContent}
      >
        {submitting ? 'Redirecting to payment...' : 'Continue to payment'}
      </Button>
      <Text style={styles.footnote}>
        Boost activates automatically once payment succeeds. Failed payments are
        never charged.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    gap: 14,
  },
  header: {
    gap: 4,
  },
  heading: {
    fontFamily: fontFamily.display,
    fontSize: 22,
    letterSpacing: -0.5,
    color: colors.neutral[900],
  },
  subheading: {
    fontFamily: fontFamily.text,
    fontSize: 13,
    lineHeight: 19,
    color: colors.neutral[600],
  },
  tierList: {
    gap: 10,
  },
  tier: {
    gap: 10,
  },
  tierSelected: {
    backgroundColor: colors.brand[50],
    borderColor: colors.brand[600],
  },
  tierRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: radius.full,
    borderWidth: 1.5,
    borderColor: colors.neutral[300],
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioOn: {
    borderColor: colors.brand[600],
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: radius.full,
    backgroundColor: colors.brand[600],
  },
  tierCopy: {
    flex: 1,
    gap: 2,
  },
  tierLabel: {
    fontFamily: fontFamily.display,
    fontSize: 15,
    letterSpacing: -0.2,
    color: colors.neutral[900],
  },
  tierBlurb: {
    fontFamily: fontFamily.text,
    fontSize: 12,
    lineHeight: 17,
    color: colors.neutral[600],
  },
  tierPriceCol: {
    alignItems: 'flex-end',
    gap: 2,
  },
  tierPrice: {
    fontFamily: fontFamily.display,
    fontSize: 18,
    letterSpacing: -0.4,
    // Web prices boost tiers in crimson: paid placement is the one surface
    // where accent leads instead of brand.
    color: colors.accent[700],
    fontVariant: ['tabular-nums'],
  },
  tierPerDay: {
    fontFamily: fontFamily.text,
    fontSize: 11,
    color: colors.neutral[500],
    fontVariant: ['tabular-nums'],
  },
  paymentCard: {
    gap: 12,
  },
  gatewayRow: {
    flexDirection: 'row',
    gap: 8,
  },
  gateway: {
    flex: 1,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 12,
    alignItems: 'center',
  },
  gatewaySelected: {
    borderColor: colors.brand[600],
    backgroundColor: colors.brand[50],
  },
  gatewayLabel: {
    fontFamily: fontFamily.textSemibold,
    fontSize: 13,
    color: colors.neutral[700],
  },
  gatewayLabelSelected: {
    color: colors.brand[800],
  },
  cta: {
    borderRadius: radius.full,
    marginTop: 2,
  },
  ctaContent: {
    height: 50,
  },
  footnote: {
    fontFamily: fontFamily.text,
    fontSize: 11.5,
    lineHeight: 17,
    textAlign: 'center',
    color: colors.neutral[500],
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 10,
  },
  centerTitle: {
    fontFamily: fontFamily.display,
    fontSize: 20,
    letterSpacing: -0.4,
    color: colors.neutral[900],
  },
  centerText: {
    fontFamily: fontFamily.text,
    fontSize: 13,
    lineHeight: 20,
    textAlign: 'center',
    color: colors.neutral[600],
    marginBottom: 6,
  },
});
