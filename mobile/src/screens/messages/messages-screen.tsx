import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { ActivityIndicator, SegmentedButtons } from 'react-native-paper';

import { ConversationCard } from '../../components/messages/conversation-card';
import { PlaceholderScreen } from '../../components/placeholder-screen';
import { useAuth } from '../../features/auth/auth-context';
import { getMyConversations } from '../../features/messaging/api';
import type { Conversation } from '../../features/messaging/types';
import { useNotifications } from '../../features/notifications/notifications-context';
import { formatRelativeTime } from '../../lib/format';
import type { MessagesStackScreenProps } from '../../navigation/types';
import { colors, fontFamily, radius } from '../../theme/tokens';

type Tab = 'all' | 'received' | 'sent';

const TABS: { value: Tab; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'received', label: 'About your listings' },
  { value: 'sent', label: 'Your enquiries' },
];

// Mirrors web/src/app/dashboard/messages/page.tsx: one GET /conversations
// call, split into tabs client-side rather than separate endpoints.
export function MessagesScreen({
  navigation,
}: MessagesStackScreenProps<'Messages'>) {
  const { user } = useAuth();
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
        <View style={styles.tabTrack}>
          <SegmentedButtons
            value={tab}
            onValueChange={(value) => setTab(value as Tab)}
            // Paper paints the checked segment with secondaryContainer; web's
            // toggle is a solid fill, so the role is swapped locally rather
            // than shifting it app-wide in the theme.
            theme={{ colors: { secondaryContainer: colors.brand[700] } }}
            buttons={TABS.map((option) => ({
              ...option,
              style: styles.tabButton,
              labelStyle: styles.tabLabel,
              checkedColor: colors.surfaceCard,
              uncheckedColor: colors.neutral[600],
            }))}
          />
        </View>
      </View>

      {isPending ? <ActivityIndicator style={styles.loading} /> : null}
      {isError ? (
        <View style={styles.state}>
          <Text style={styles.stateTitle}>
            Couldn&apos;t load your conversations.
          </Text>
          <Text style={styles.stateNote}>
            Check your connection and try again in a moment.
          </Text>
        </View>
      ) : null}

      <FlatList<Conversation>
        data={filtered}
        keyExtractor={(conversation) => conversation.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          !isPending && !isError ? (
            <View style={styles.state}>
              <Text style={styles.stateTitle}>No conversations yet</Text>
              <Text style={styles.stateNote}>
                When someone messages you about a listing - or you contact an
                owner - the thread shows up here.
              </Text>
            </View>
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
            <ConversationCard
              name={otherParty.name}
              adTitle={conversation.ad.title}
              preview={lastMessage?.body}
              timestamp={
                lastMessage
                  ? formatRelativeTime(lastMessage.createdAt)
                  : undefined
              }
              unread={unread}
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
    backgroundColor: colors.surface,
  },
  tabs: {
    padding: 16,
    paddingBottom: 10,
  },
  tabTrack: {
    padding: 3,
    borderRadius: radius.full,
    backgroundColor: colors.neutral[100],
  },
  tabButton: {
    borderWidth: 0,
    minWidth: 0,
    // Paper squares off the inner corners of each segment with per-corner
    // props, so a plain borderRadius here would not win against them.
    borderTopLeftRadius: radius.full,
    borderTopRightRadius: radius.full,
    borderBottomLeftRadius: radius.full,
    borderBottomRightRadius: radius.full,
  },
  tabLabel: {
    fontFamily: fontFamily.textSemibold,
    fontSize: 12.5,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  loading: {
    marginTop: 28,
  },
  state: {
    marginTop: 28,
    paddingHorizontal: 32,
    alignItems: 'center',
    gap: 6,
  },
  stateTitle: {
    fontFamily: fontFamily.displaySemibold,
    fontSize: 15,
    letterSpacing: -0.2,
    color: colors.neutral[800],
    textAlign: 'center',
  },
  stateNote: {
    fontFamily: fontFamily.text,
    fontSize: 12.5,
    lineHeight: 18,
    color: colors.neutral[500],
    textAlign: 'center',
  },
});
