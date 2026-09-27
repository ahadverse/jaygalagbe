import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import {
  ActivityIndicator,
  Avatar,
  List,
  SegmentedButtons,
  Text,
  useTheme,
} from 'react-native-paper';

import { PlaceholderScreen } from '../../components/placeholder-screen';
import { useAuth } from '../../features/auth/auth-context';
import { getMyConversations } from '../../features/messaging/api';
import type { Conversation } from '../../features/messaging/types';
import { useNotifications } from '../../features/notifications/notifications-context';
import type { MessagesStackScreenProps } from '../../navigation/types';

type Tab = 'all' | 'received' | 'sent';

// Mirrors web/src/app/dashboard/messages/page.tsx: one GET /conversations
// call, split into tabs client-side rather than separate endpoints.
export function MessagesScreen({
  navigation,
}: MessagesStackScreenProps<'Messages'>) {
  const { user } = useAuth();
  const theme = useTheme();
  const { markMessagesSeen } = useNotifications();
  const [tab, setTab] = useState<Tab>('all');

  const {
    data: conversations,
    isPending,
    isError,
  } = useQuery({
    queryKey: ['conversations'],
    queryFn: getMyConversations,
    enabled: !!user,
  });

  useEffect(() => {
    markMessagesSeen();
  }, [markMessagesSeen]);

  if (!user) {
    return (
      <PlaceholderScreen
        title="Log in to message advertisers"
        note="Go to the Profile tab to log in or create an account."
      />
    );
  }

  const filtered = (conversations ?? []).filter((conversation) => {
    if (tab === 'received') return conversation.advertiserId === user.id;
    if (tab === 'sent') return conversation.customerId === user.id;
    return true;
  });

  return (
    <View style={styles.screen}>
      <View style={styles.tabs}>
        <SegmentedButtons
          value={tab}
          onValueChange={(value) => setTab(value as Tab)}
          buttons={[
            { value: 'all', label: 'All' },
            { value: 'received', label: 'About your listings' },
            { value: 'sent', label: 'Your enquiries' },
          ]}
        />
      </View>

      {isPending ? <ActivityIndicator style={styles.state} /> : null}
      {isError ? (
        <Text style={[styles.state, { color: theme.colors.error }]}>
          Couldn&apos;t load your conversations.
        </Text>
      ) : null}

      <FlatList<Conversation>
        data={filtered}
        keyExtractor={(conversation) => conversation.id}
        ListEmptyComponent={
          !isPending && !isError ? (
            <Text
              style={[styles.state, { color: theme.colors.onSurfaceVariant }]}
            >
              No conversations yet.
            </Text>
          ) : null
        }
        renderItem={({ item: conversation }) => {
          const otherParty =
            conversation.advertiserId === user.id
              ? conversation.customer
              : conversation.advertiser;
          const lastMessage = conversation.messages?.[0];
          const unread =
            !!lastMessage &&
            lastMessage.senderId !== user.id &&
            !lastMessage.readAt;

          return (
            <List.Item
              title={otherParty.name}
              description={`${conversation.ad.title}\n${lastMessage?.body ?? 'No messages yet'}`}
              descriptionNumberOfLines={2}
              left={(props) => (
                <Avatar.Text
                  {...props}
                  label={otherParty.name.charAt(0)}
                  size={40}
                />
              )}
              right={() =>
                unread ? (
                  <View
                    style={[
                      styles.unreadDot,
                      { backgroundColor: theme.colors.primary },
                    ]}
                  />
                ) : null
              }
              onPress={() =>
                navigation.navigate('ChatThread', {
                  conversationId: conversation.id,
                })
              }
            />
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  tabs: {
    padding: 16,
    paddingBottom: 8,
  },
  state: {
    textAlign: 'center',
    marginTop: 24,
  },
  unreadDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    alignSelf: 'center',
  },
});
