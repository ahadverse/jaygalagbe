import Ionicons from '@expo/vector-icons/Ionicons';
import type { ComponentProps } from 'react';
import { useEffect } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';

import { BrandCard } from '../../components/brand/brand-card';
import { useNotifications } from '../../features/notifications/notifications-context';
import type { NotificationEntry } from '../../features/notifications/types';
import { formatRelativeTime } from '../../lib/format';
import type { ProfileStackScreenProps } from '../../navigation/types';
import { colors, fontFamily, radius } from '../../theme/tokens';

// Only ad.approved/ad.rejected land here - message.received only ever bumps
// the Messages tab's unread count (see notifications-context.tsx). There's
// no server-side history endpoint, so this list is session-ephemeral,
// same as web's header bell.
function describe(entry: NotificationEntry): {
  title: string;
  description: string;
  icon: ComponentProps<typeof Ionicons>['name'];
  tint: string;
  tile: string;
} {
  if (entry.type === 'ad.approved') {
    return {
      title: 'Ad approved',
      description: entry.adTitle,
      icon: 'checkmark-circle',
      tint: colors.success[600],
      tile: colors.success[50],
    };
  }
  return {
    title: 'Ad rejected',
    description: `${entry.adTitle} - ${entry.reason}`,
    icon: 'close-circle',
    tint: colors.danger[600],
    tile: colors.danger[50],
  };
}

export function NotificationsScreen({
  navigation,
}: ProfileStackScreenProps<'Notifications'>) {
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
        <View style={styles.empty}>
          <Ionicons
            name="notifications-outline"
            size={30}
            color={colors.neutral[300]}
          />
          <Text style={styles.emptyText}>
            Nothing yet - approvals, rejections and other account activity show
            up here while the app is open.
          </Text>
        </View>
      }
      renderItem={({ item: entry }) => {
        const { title, description, icon, tint, tile } = describe(entry);
        return (
          <Pressable
            onPress={() =>
              navigation.navigate('AdDetail', { adId: entry.adId })
            }
            style={({ pressed }) => (pressed ? styles.rowPressed : null)}
          >
            <BrandCard variant="card" radius="lg" style={styles.row}>
              <View style={[styles.iconTile, { backgroundColor: tile }]}>
                <Ionicons name={icon} size={19} color={tint} />
              </View>
              <View style={styles.rowText}>
                <Text style={styles.title}>{title}</Text>
                <Text style={styles.description} numberOfLines={2}>
                  {description}
                </Text>
                <Text style={styles.timestamp}>
                  {formatRelativeTime(new Date(entry.receivedAt).toISOString())}
                </Text>
              </View>
            </BrandCard>
          </Pressable>
        );
      }}
    />
  );
}

const styles = StyleSheet.create({
  content: {
    flexGrow: 1,
    padding: 16,
    gap: 10,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  rowPressed: {
    opacity: 0.92,
  },
  iconTile: {
    width: 36,
    height: 36,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowText: {
    flex: 1,
    gap: 3,
  },
  title: {
    fontFamily: fontFamily.displaySemibold,
    fontSize: 15,
    letterSpacing: -0.2,
    color: colors.neutral[900],
  },
  description: {
    fontFamily: fontFamily.text,
    fontSize: 13,
    lineHeight: 19,
    color: colors.neutral[600],
  },
  timestamp: {
    fontFamily: fontFamily.text,
    fontSize: 11.5,
    color: colors.neutral[500],
  },
  empty: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingHorizontal: 32,
  },
  emptyText: {
    fontFamily: fontFamily.text,
    fontSize: 13,
    lineHeight: 19,
    textAlign: 'center',
    color: colors.neutral[500],
  },
});
