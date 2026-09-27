import { useQuery } from '@tanstack/react-query';
import { useEffect, useRef, useState } from 'react';
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
  useTheme,
} from 'react-native-paper';

import { useAuth } from '../../features/auth/auth-context';
import { getConversation, getMessages } from '../../features/messaging/api';
import type { Message } from '../../features/messaging/types';
import { useConversationSocket } from '../../features/messaging/use-conversation-socket';
import type { MessagesStackScreenProps } from '../../navigation/types';

// Mirrors web/src/components/messaging/chat-thread.tsx: messages arrive only
// through the socket's `message:new` echo (no local-optimistic append), a
// message from the other party marks the thread read immediately while it's
// open, and Sent/Seen is a simple two-party read receipt.
export function ChatThreadScreen({
  route,
  navigation,
}: MessagesStackScreenProps<'ChatThread'>) {
  const { conversationId } = route.params;
  const { user } = useAuth();
  const theme = useTheme();
  const [messages, setMessages] = useState<Message[]>([]);
  const [body, setBody] = useState('');
  const [sending, setSending] = useState(false);
  const seeded = useRef(false);

  const { data: conversation } = useQuery({
    queryKey: ['conversations', conversationId],
    queryFn: () => getConversation(conversationId),
  });

  const { data: initialMessages, isPending } = useQuery({
    queryKey: ['conversations', conversationId, 'messages'],
    queryFn: () => getMessages(conversationId),
  });

  useEffect(() => {
    if (initialMessages && !seeded.current) {
      setMessages(initialMessages);
      seeded.current = true;
    }
  }, [initialMessages]);

  const { sendMessage, markRead } = useConversationSocket(
    conversationId,
    (message) => {
      setMessages((current) =>
        current.some((existing) => existing.id === message.id)
          ? current
          : [...current, message],
      );
    },
    (readerId) => {
      if (readerId === user?.id) return;
      setMessages((current) =>
        current.map((message) =>
          message.readAt
            ? message
            : { ...message, readAt: new Date().toISOString() },
        ),
      );
    },
  );

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
      await sendMessage(trimmed);
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
        <View
          style={[
            styles.adBanner,
            { borderBottomColor: theme.colors.outlineVariant },
          ]}
        >
          <Text variant="bodySmall" numberOfLines={1}>
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
          contentContainerStyle={styles.messageList}
          renderItem={({ item: message }) => {
            const mine = message.senderId === user?.id;
            return (
              <View
                style={[
                  styles.bubble,
                  mine
                    ? [
                        styles.bubbleMine,
                        { backgroundColor: theme.colors.primaryContainer },
                      ]
                    : [
                        styles.bubbleTheirs,
                        { backgroundColor: theme.colors.surfaceVariant },
                      ],
                ]}
              >
                <Text>{message.body}</Text>
                <Text variant="labelSmall" style={styles.timestamp}>
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

      <View
        style={[
          styles.composer,
          { borderTopColor: theme.colors.outlineVariant },
        ]}
      >
        <TextInput
          mode="outlined"
          style={styles.input}
          value={body}
          onChangeText={setBody}
          placeholder="Type a message"
          maxLength={2000}
          multiline
        />
        <IconButton
          icon="send"
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
  },
  adBanner: {
    padding: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  loading: {
    flex: 1,
  },
  messageList: {
    padding: 16,
    gap: 8,
  },
  bubble: {
    maxWidth: '80%',
    borderRadius: 12,
    padding: 10,
  },
  bubbleMine: {
    alignSelf: 'flex-end',
  },
  bubbleTheirs: {
    alignSelf: 'flex-start',
  },
  timestamp: {
    marginTop: 4,
    opacity: 0.7,
  },
  composer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  input: {
    flex: 1,
    maxHeight: 120,
  },
});
