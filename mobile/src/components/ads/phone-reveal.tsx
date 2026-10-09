import { useState } from 'react';
import { Linking, StyleSheet, View } from 'react-native';
import { Button, HelperText, Text } from 'react-native-paper';

import { ApiError } from '../../api/errors';
import { useAuth } from '../../features/auth/auth-context';
import { revealAdPhone } from '../../features/ads/api';
import { colors, radius } from '../../theme/tokens';
import { BrandCard } from '../brand/brand-card';
import { Eyebrow } from '../brand/eyebrow';

const PREVIEW_LENGTH = 3;

export function PhoneReveal({
  adId,
  ownerId,
  maskedPhone,
  onRequireAuth,
}: {
  adId: string;
  ownerId: string;
  maskedPhone: string | null | undefined;
  onRequireAuth: (screen: 'Login' | 'Register') => void;
}) {
  const { user } = useAuth();
  const [phone, setPhone] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!maskedPhone || user?.id === ownerId) return null;

  async function reveal() {
    setLoading(true);
    setError(null);
    try {
      setPhone((await revealAdPhone(adId)).phone);
    } catch (cause) {
      setError(
        cause instanceof ApiError
          ? cause.message
          : "Couldn't reach the server. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <BrandCard style={styles.card}>
      <Eyebrow>Phone</Eyebrow>
      {phone ? (
        <Text
          variant="headlineSmall"
          style={styles.number}
          onPress={() => void Linking.openURL(`tel:${phone}`)}
        >
          {phone}
        </Text>
      ) : (
        <View style={styles.row}>
          <Text variant="headlineSmall" style={styles.visible}>
            {maskedPhone.slice(0, PREVIEW_LENGTH)}
          </Text>
          {/* The hidden part is drawn, not sent: faint bars stand in for digits
           * so nothing real sits under the blur. */}
          <View style={styles.blurBars} accessibilityLabel="Hidden digits" />
        </View>
      )}

      {phone ? null : user ? (
        <>
          <Button
            mode="outlined"
            style={styles.pill}
            onPress={reveal}
            loading={loading}
            disabled={loading}
          >
            Show phone number
          </Button>
          {error ? <HelperText type="error">{error}</HelperText> : null}
        </>
      ) : (
        <>
          <Text variant="bodySmall" style={styles.hint}>
            Log in or create a free account to see the full number.
          </Text>
          <Button
            mode="contained"
            style={styles.pill}
            onPress={() => onRequireAuth('Register')}
          >
            Register to unlock
          </Button>
          <Button mode="text" onPress={() => onRequireAuth('Login')}>
            Log in
          </Button>
        </>
      )}
    </BrandCard>
  );
}

const styles = StyleSheet.create({
  card: { gap: 8 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  visible: { fontVariant: ['tabular-nums'] },
  blurBars: {
    flex: 1,
    height: 18,
    maxWidth: 140,
    borderRadius: radius.full,
    backgroundColor: colors.neutral[200],
  },
  number: { color: colors.brand[700], fontVariant: ['tabular-nums'] },
  hint: { color: colors.neutral[700] },
  pill: { borderRadius: radius.full },
});
