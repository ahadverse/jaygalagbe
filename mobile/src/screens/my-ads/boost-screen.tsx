import * as WebBrowser from 'expo-web-browser';
import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Button, HelperText, RadioButton, Text } from 'react-native-paper';

import { ApiError } from '../../api/errors';
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
        <Text variant="titleMedium">Verifying payment</Text>
        <Text variant="bodyMedium" style={styles.centerText}>
          Boost activates automatically once payment succeeds. Check this
          ad&apos;s status in a minute or two from My Ads - failed payments are
          never charged.
        </Text>
        <Button mode="contained" onPress={() => navigation.goBack()}>
          Back to My Ads
        </Button>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text variant="titleMedium">Boost duration</Text>
      <RadioButton.Group
        value={tier}
        onValueChange={(value) => setTier(value as BoostTier)}
      >
        {BOOST_TIERS.map((option) => (
          <RadioButton.Item
            key={option.value}
            value={option.value}
            label={`${option.label} at the top - ${formatPrice(option.priceBdt)}`}
          />
        ))}
      </RadioButton.Group>

      <Text variant="titleMedium">Payment method</Text>
      <RadioButton.Group
        value={gateway}
        onValueChange={(value) => setGateway(value as PaymentGateway)}
      >
        {PAYMENT_GATEWAYS.map((option) => (
          <RadioButton.Item
            key={option.value}
            value={option.value}
            label={option.label}
          />
        ))}
      </RadioButton.Group>

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
      >
        {submitting ? 'Redirecting to payment...' : 'Continue to payment'}
      </Button>
      <Text variant="bodySmall">
        Boost activates automatically once payment succeeds. Failed payments are
        never charged.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    gap: 12,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 12,
  },
  centerText: {
    textAlign: 'center',
  },
});
