import { useIsFocused } from '@react-navigation/native';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useMemo, useState } from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  View,
} from 'react-native';
import {
  ActivityIndicator,
  IconButton,
  Text,
  TextInput,
} from 'react-native-paper';

import { Eyebrow } from '../../components/brand/eyebrow';
import { useAuth } from '../../features/auth/auth-context';
import { getConversation, getMessages } from '../../features/messaging/api';
import { mergeMessages } from '../../features/messaging/merge-messages';
import type { Message } from '../../features/messaging/types';
import { useConversationSocket } from '../../features/messaging/use-conversation-socket';
import { useAppActive } from '../../lib/use-app-active';
import type { MessagesStackScreenProps } from '../../navigation/types';
import { colors, radius, shadow } from '../../theme/tokens';

// Mirrors web/src/components/messaging/chat-thread.tsx: messages arrive
// through the socket's `message:new` echo (no local-optimistic append), a
// message from the other party marks the thread read immediately while it's
// open, and Sent/Seen is a simple two-party read receipt. When the socket is
// unavailable the messages endpoint is polled every 3s while the app is in
// the foreground and this screen is focused; results merge by message id.
const POLL_INTERVAL_MS = 3000;

export function ChatThreadScreen({
  route,
  navigation,
}: MessagesStackScreenProps<'ChatThread'>) {
  const { conversationId } = route.params;
  const { user } = useAuth();
  // Messages that arrived by socket or REST send, layered over the fetched
  // list (initial load + polls) and de-duplicated by id when merged.
  const [liveMessages, setLiveMessages] = useState<Message[]>([]);
  const [readAllAt, setReadAllAt] = useState<string | null>(null);
  const [body, setBody] = useState('');
  const [sending, setSending] = useState(false);
  const appActive = useAppActive();
  const focused = useIsFocused();
  const queryClient = useQueryClient();
  const messagesKey = ['conversations', conversationId, 'messages'];

  const { data: conversation } = useQuery({
    queryKey: ['conversations', conversationId],
    queryFn: () => getConversation(conversationId),
  });

  const { fallback, sendMessage, markRead } = useConversationSocket(
    conversationId,
    (message) => {
      setLiveMessages((current) => mergeMessages(current, [message]));
    },
    (readerId) => {
      if (readerId === user?.id) return;
      setReadAllAt((current) => current ?? new Date().toISOString());
    },
    // Socket is back: one refetch closes any gap left while polling.
    () => {
      void queryClient.refetchQueries({ queryKey: messagesKey });
    },
  );

  const { data: fetchedMessages, isPending } = useQuery({
    queryKey: messagesKey,
    queryFn: () => getMessages(conversationId),
    refetchInterval:
      fallback && appActive && focused ? POLL_INTERVAL_MS : false,
  });

  // Fetched list (initial load + polls) merged with live arrivals; the
  // reference only changes when the content does.
  const messages = useMemo(() => {
    const merged = mergeMessages(fetchedMessages ?? [], liveMessages);
    return readAllAt
      ? merged.map((m) =>
          m.readAt || m.createdAt > readAllAt ? m : { ...m, readAt: readAllAt },
        )
      : merged;
  }, [fetchedMessages, liveMessages, readAllAt]);

  useEffect(() => {
    const last = messages[messages.length - 1];
    if (last && last.senderId !== user?.id && !last.readAt) {
      markRead();
    }
  }, [messages, user?.id, markRead]);

  useEffect(() => {
    if (conversation) {
      const otherParty =
        conversation.advertiserId === user?.id
          ? conversation.customer
          : conversation.advertiser;
      navigation.setOptions({ title: otherParty.name });
    }
  }, [conversation, navigation, user?.id]);

  async function send() {
    const trimmed = body.trim();
    if (!trimmed) return;
    setSending(true);
    setBody('');
    try {
      const sent = await sendMessage(trimmed);
      // Over REST there is no `message:new` echo to wait for; merging by id
      // keeps this safe when the socket echo arrives as well.
      setLiveMessages((current) => mergeMessages(current, [sent]));
    } catch {
      setBody(trimmed);
    } finally {
      setSending(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={80}
    >
      {conversation ? (
        <View style={styles.adBanner}>
          <Eyebrow>About this listing</Eyebrow>
          <Text variant="titleSmall" numberOfLines={1}>
            {conversation.ad.title}
          </Text>
        </View>
      ) : null}

      {isPending ? (
        <ActivityIndicator style={styles.loading} />
      ) : (
        <FlatList<Message>
          data={messages}
          keyExtractor={(message) => message.id}
          contentContainerStyle={[
            styles.messageList,
            messages.length === 0 ? styles.messageListEmpty : null,
          ]}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text variant="titleSmall" style={styles.emptyTitle}>
                No messages yet
              </Text>
              <Text variant="bodySmall" style={styles.emptyNote}>
                Say hello and ask whatever you need to know about the property.
              </Text>
            </View>
          }
          renderItem={({ item: message }) => {
            const mine = message.senderId === user?.id;
            return (
              <View
                style={[
                  styles.bubble,
                  mine ? styles.bubbleMine : styles.bubbleTheirs,
                ]}
              >
                <Text
                  variant="bodyMedium"
                  style={mine ? styles.bodyMine : styles.bodyTheirs}
                >
                  {message.body}
                </Text>
                <Text
                  variant="labelSmall"
                  style={[
                    styles.timestamp,
                    mine ? styles.timestampMine : styles.timestampTheirs,
                  ]}
                >
                  {new Date(message.createdAt).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                  {mine ? ` · ${message.readAt ? 'Seen' : 'Sent'}` : ''}
                </Text>
              </View>
            );
          }}
        />
      )}

      <View style={styles.composer}>
        <TextInput
          mode="outlined"
          style={styles.input}
          // The fill rides on the outline view so it follows the pill's
          // corners; on the container it would square off behind them.
          outlineStyle={styles.inputOutline}
          value={body}
          onChangeText={setBody}
          placeholder="Type a message"
          maxLength={2000}
          multiline
        />
        <IconButton
          icon="send"
          mode="contained"
          size={20}
          containerColor={colors.brand[700]}
          iconColor={colors.surfaceCard}
          style={styles.send}
          onPress={send}
          disabled={sending || !body.trim()}
        />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  adBanner: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 2,
    backgroundColor: colors.surfaceCard,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  loading: {
    flex: 1,
  },
  messageList: {
    padding: 16,
    gap: 10,
  },
  messageListEmpty: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  empty: {
    alignItems: 'center',
    paddingHorizontal: 32,
    gap: 6,
  },
  emptyTitle: {
    color: colors.neutral[800],
  },
  emptyNote: {
    color: colors.neutral[500],
    textAlign: 'center',
  },
  bubble: {
    maxWidth: '82%',
    borderRadius: radius.lg,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  bubbleMine: {
    alignSelf: 'flex-end',
    backgroundColor: colors.brand[700],
    // The corner nearest the sender is tightened into a tail.
    borderBottomRightRadius: radius.xs,
  },
  bubbleTheirs: {
    alignSelf: 'flex-start',
    backgroundColor: colors.surfaceCard,
    borderWidth: 1,
    borderColor: 'rgba(22,18,15,0.05)',
    borderBottomLeftRadius: radius.xs,
    ...shadow('sm'),
  },
  bodyMine: {
    color: colors.surfaceCard,
  },
  bodyTheirs: {
    color: colors.neutral[900],
  },
  timestamp: {
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  timestampMine: {
    color: colors.brand[200],
  },
  timestampTheirs: {
    color: colors.neutral[500],
  },
  composer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
    padding: 10,
    backgroundColor: colors.surfaceCard,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  input: {
    flex: 1,
    maxHeight: 120,
  },
  inputOutline: {
    borderRadius: radius.full,
    backgroundColor: colors.neutral[100],
  },
  send: {
    margin: 0,
  },
});
