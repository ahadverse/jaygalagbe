import { useEffect } from 'react';
import { FlatList, StyleSheet } from 'react-native';
import { List, Text, useTheme } from 'react-native-paper';

import { useNotifications } from '../../features/notifications/notifications-context';
import type { NotificationEntry } from '../../features/notifications/types';
import type { ProfileStackScreenProps } from '../../navigation/types';

// Only ad.approved/ad.rejected land here - message.received only ever bumps
// the Messages tab's unread count (see notifications-context.tsx). There's
// no server-side history endpoint, so this list is session-ephemeral,
// same as web's header bell.
function describe(entry: NotificationEntry): {
  title: string;
  description: string;
} {
  if (entry.type === 'ad.approved') {
    return { title: 'Ad approved', description: entry.adTitle };
  }
  return {
    title: 'Ad rejected',
    description: `${entry.adTitle} - ${entry.reason}`,
  };
}

export function NotificationsScreen({
  navigation,
}: ProfileStackScreenProps<'Notifications'>) {
  const theme = useTheme();
  const { activity, markActivitySeen } = useNotifications();

  useEffect(() => {
    markActivitySeen();
  }, [markActivitySeen]);

  return (
    <FlatList<NotificationEntry>
      data={activity}
      keyExtractor={(entry) => entry.id}
      contentContainerStyle={styles.content}
      ListEmptyComponent={
        <Text style={[styles.empty, { color: theme.colors.onSurfaceVariant }]}>
          Nothing yet - approvals, rejections and other account activity show up
          here while the app is open.
        </Text>
      }
      renderItem={({ item: entry }) => {
        const { title, description } = describe(entry);
        return (
          <List.Item
            title={title}
            description={description}
            left={(props) => (
              <List.Icon
                {...props}
                icon={
                  entry.type === 'ad.approved'
                    ? 'check-circle-outline'
                    : 'close-circle-outline'
                }
              />
            )}
            onPress={() =>
              navigation.navigate('AdDetail', { adId: entry.adId })
            }
          />
        );
      }}
    />
  );
}

const styles = StyleSheet.create({
  content: {
    flexGrow: 1,
  },
  empty: {
    textAlign: 'center',
    padding: 24,
  },
});
