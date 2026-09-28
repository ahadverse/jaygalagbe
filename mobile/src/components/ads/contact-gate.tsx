import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, HelperText, Text, TextInput } from 'react-native-paper';

import { ApiError } from '../../api/errors';
import { useAuth } from '../../features/auth/auth-context';
import {
  sendMessageRest,
  startConversation,
} from '../../features/messaging/api';
import { colors, radius } from '../../theme/tokens';
import { BrandCard } from '../brand/brand-card';

// Mirrors web/src/components/ads/contact-gate.tsx's three branches (owner /
// guest / logged-in non-owner), replicating sendFirstMessageAction's two
// REST calls (POST /conversations then POST /conversations/:id/messages)
// directly since there's no server action layer on mobile.
export function ContactGate({
  adId,
  ownerId,
  onRequireAuth,
}: {
  adId: string;
  ownerId: string;
  onRequireAuth: (screen: 'Login' | 'Register') => void;
}) {
  const { user } = useAuth();
  const [body, setBody] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  if (user?.id === ownerId) {
    return (
      <BrandCard style={styles.card}>
        <Text variant="titleMedium">This is your listing</Text>
        <Text variant="bodyMedium" style={styles.bodyText}>
          Manage this ad from the My Ads tab.
        </Text>
      </BrandCard>
    );
  }

  if (!user) {
    return (
      <BrandCard style={styles.gateCard}>
        {/* Registration gate - the conversion moment, so web gives it the warm
         * brand-to-accent wash instead of a plain card header. */}
        <LinearGradient
          colors={[colors.brand[50], colors.accent[50]]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gateHeader}
        >
          <Text variant="titleMedium">Contact the advertiser</Text>
          <Text variant="bodySmall" style={styles.gateSubtitle}>
            Create a free account to chat directly with the owner - no broker,
            no fee.
          </Text>
        </LinearGradient>
        <View style={styles.guestActions}>
          <Button
            mode="contained"
            style={styles.pillButton}
            onPress={() => onRequireAuth('Register')}
          >
            Create free account
          </Button>
          <Button
            mode="outlined"
            style={[styles.pillButton, styles.outlinedButton]}
            rippleColor={colors.brand[100]}
            onPress={() => onRequireAuth('Login')}
          >
            I already have an account
          </Button>
        </View>
      </BrandCard>
    );
  }

  if (success) {
    return (
      <BrandCard style={styles.card}>
        <Text variant="titleMedium">Message sent</Text>
        <Text variant="bodyMedium" style={styles.bodyText}>
          The advertiser will reply in your inbox - check the Messages tab.
        </Text>
      </BrandCard>
    );
  }

  async function send() {
    if (!body.trim()) {
      setError('Write a message before sending.');
      return;
    }
    setSending(true);
    setError(null);
    try {
      const conversation = await startConversation(adId);
      await sendMessageRest(conversation.id, body.trim());
      setSuccess(true);
    } catch (cause) {
      setError(
        cause instanceof ApiError
          ? cause.message
          : "Couldn't reach the server. Please try again.",
      );
    } finally {
      setSending(false);
    }
  }

  return (
    <BrandCard style={styles.card}>
      <Text variant="titleMedium">Message the advertiser</Text>
      <View style={styles.form}>
        <TextInput
          mode="outlined"
          multiline
          numberOfLines={3}
          placeholder="Hi, I'm interested in this listing - is it still available?"
          value={body}
          onChangeText={setBody}
          maxLength={2000}
          style={styles.input}
        />
        <HelperText type={error ? 'error' : 'info'} visible>
          {error ??
            'Your name is shared with the advertiser when you send a message.'}
        </HelperText>
      </View>
      <Button
        mode="contained"
        style={styles.pillButton}
        onPress={send}
        loading={sending}
        disabled={sending}
      >
        Send message
      </Button>
    </BrandCard>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: 6,
  },
  gateCard: {
    padding: 0,
    overflow: 'hidden',
  },
  gateHeader: {
    paddingHorizontal: 16,
    paddingVertical: 18,
    gap: 4,
  },
  gateSubtitle: {
    color: colors.neutral[700],
    lineHeight: 18,
  },
  guestActions: {
    padding: 16,
    gap: 8,
  },
  bodyText: {
    color: colors.neutral[700],
  },
  form: {
    gap: 4,
    marginTop: 4,
  },
  input: {
    backgroundColor: colors.surfaceCard,
  },
  pillButton: {
    borderRadius: radius.full,
  },
  outlinedButton: {
    backgroundColor: colors.surfaceCard,
  },
});
