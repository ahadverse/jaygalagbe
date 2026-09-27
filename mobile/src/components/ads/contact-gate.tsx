import { useState } from 'react';
import { StyleSheet } from 'react-native';
import { Button, Card, HelperText, Text, TextInput } from 'react-native-paper';

import { ApiError } from '../../api/errors';
import { useAuth } from '../../features/auth/auth-context';
import {
  sendMessageRest,
  startConversation,
} from '../../features/messaging/api';

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
      <Card>
        <Card.Title title="This is your listing" />
        <Card.Content>
          <Text variant="bodyMedium">Manage this ad from the My Ads tab.</Text>
        </Card.Content>
      </Card>
    );
  }

  if (!user) {
    return (
      <Card>
        <Card.Title
          title="Contact the advertiser"
          subtitle="Create a free account to chat directly with the owner - no broker, no fee."
          subtitleNumberOfLines={3}
        />
        <Card.Actions style={styles.guestActions}>
          <Button mode="contained" onPress={() => onRequireAuth('Register')}>
            Create free account
          </Button>
          <Button mode="outlined" onPress={() => onRequireAuth('Login')}>
            I already have an account
          </Button>
        </Card.Actions>
      </Card>
    );
  }

  if (success) {
    return (
      <Card>
        <Card.Content>
          <Text variant="titleMedium">Message sent</Text>
          <Text variant="bodyMedium">
            The advertiser will reply in your inbox - check the Messages tab.
          </Text>
        </Card.Content>
      </Card>
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
    <Card>
      <Card.Title title="Message the advertiser" />
      <Card.Content style={styles.form}>
        <TextInput
          mode="outlined"
          multiline
          numberOfLines={3}
          placeholder="Hi, I'm interested in this listing - is it still available?"
          value={body}
          onChangeText={setBody}
          maxLength={2000}
        />
        <HelperText type={error ? 'error' : 'info'} visible>
          {error ??
            'Your name is shared with the advertiser when you send a message.'}
        </HelperText>
      </Card.Content>
      <Card.Actions>
        <Button
          mode="contained"
          onPress={send}
          loading={sending}
          disabled={sending}
        >
          Send message
        </Button>
      </Card.Actions>
    </Card>
  );
}

const styles = StyleSheet.create({
  guestActions: {
    flexDirection: 'column',
    alignItems: 'stretch',
    gap: 8,
    paddingBottom: 16,
  },
  form: {
    gap: 4,
  },
});
