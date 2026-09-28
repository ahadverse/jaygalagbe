import Ionicons from '@expo/vector-icons/Ionicons';
import { useQuery } from '@tanstack/react-query';
import type { ComponentProps } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Badge, Button, List } from 'react-native-paper';

import { BrandCard, StatTile } from '../../components/brand/brand-card';
import { Eyebrow } from '../../components/brand/eyebrow';
import { useAuth } from '../../features/auth/auth-context';
import { getOverview } from '../../features/analytics/api';
import { useNotifications } from '../../features/notifications/notifications-context';
import type { ProfileStackScreenProps } from '../../navigation/types';
import { colors, fontFamily, radius } from '../../theme/tokens';

function NavRow({
  title,
  icon,
  onPress,
  badgeCount,
  divided,
}: {
  title: string;
  icon: ComponentProps<typeof List.Icon>['icon'];
  onPress: () => void;
  badgeCount?: number;
  divided: boolean;
}) {
  return (
    <List.Item
      title={title}
      titleStyle={styles.navTitle}
      style={[styles.navRow, divided ? styles.navRowDivided : null]}
      left={(props) => (
        <List.Icon {...props} icon={icon} color={colors.brand[600]} />
      )}
      right={() => (
        <View style={styles.navRight}>
          {badgeCount ? <Badge style={styles.badge}>{badgeCount}</Badge> : null}
          <Ionicons
            name="chevron-forward"
            size={18}
            color={colors.neutral[400]}
          />
        </View>
      )}
      onPress={onPress}
    />
  );
}

// The Profile tab's logged-in root: a light dashboard overview (aggregate
// stats rollup, only shown once the user has posted at least one ad) plus
// the nav rows into Saved/Reviews/Notifications/Settings - see app.md's
// Profile tab section.
export function ProfileScreen({
  navigation,
}: ProfileStackScreenProps<'Profile'>) {
  const { user, logout } = useAuth();
  const { unreadActivity } = useNotifications();

  const { data: overview } = useQuery({
    queryKey: ['analytics', 'overview', '30d'],
    queryFn: () => getOverview('30d'),
  });

  const initial = user?.name?.trim().charAt(0).toUpperCase() ?? '?';
  const contact = user?.email ?? user?.phone ?? null;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <BrandCard style={styles.identityCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarInitial}>{initial}</Text>
        </View>
        <View style={styles.identityText}>
          <Text style={styles.name} numberOfLines={1}>
            {user?.name}
          </Text>
          {contact ? (
            <Text style={styles.contact} numberOfLines={1}>
              {contact}
            </Text>
          ) : null}
        </View>
      </BrandCard>

      {overview && overview.ads.length > 0 ? (
        <View style={styles.statsBlock}>
          <Eyebrow>Last 30 days</Eyebrow>
          <View style={styles.statsGrid}>
            <StatTile
              label="Impressions"
              value={String(overview.totals.impressions)}
              style={styles.statTile}
            />
            <StatTile
              label="Visits"
              value={String(overview.totals.visits)}
              style={styles.statTile}
            />
            <StatTile
              label="Leads"
              value={String(overview.totals.conversions)}
              style={styles.statTile}
            />
            <StatTile
              label="Conv. rate"
              value={`${(overview.totals.conversionRate * 100).toFixed(1)}%`}
              style={styles.statTile}
            />
          </View>
        </View>
      ) : null}

      <BrandCard style={styles.navCard}>
        <NavRow
          title="Saved & recently viewed"
          icon="bookmark-outline"
          onPress={() => navigation.navigate('Saved')}
          divided={false}
        />
        <NavRow
          title="Reviews"
          icon="star-outline"
          onPress={() => navigation.navigate('Reviews')}
          divided
        />
        <NavRow
          title="Notifications"
          icon="bell-outline"
          badgeCount={unreadActivity}
          onPress={() => navigation.navigate('Notifications')}
          divided
        />
        <NavRow
          title="Settings"
          icon="cog-outline"
          onPress={() => navigation.navigate('Settings')}
          divided
        />
      </BrandCard>

      <Button
        mode="outlined"
        onPress={logout}
        textColor={colors.danger[600]}
        style={styles.logoutButton}
        contentStyle={styles.logoutContent}
      >
        Log out
      </Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    gap: 16,
  },
  identityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    borderRadius: radius.lg,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: radius.full,
    backgroundColor: colors.brand[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: {
    fontFamily: fontFamily.display,
    fontSize: 24,
    color: colors.brand[800],
  },
  identityText: {
    flex: 1,
    gap: 3,
  },
  name: {
    fontFamily: fontFamily.display,
    fontSize: 20,
    letterSpacing: -0.4,
    color: colors.neutral[900],
  },
  contact: {
    fontFamily: fontFamily.text,
    fontSize: 13,
    color: colors.neutral[600],
  },
  statsBlock: {
    gap: 10,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  statTile: {
    minWidth: '45%',
    flexGrow: 1,
  },
  navCard: {
    // BrandCard's own 16px padding would inset the rows and cut their
    // separators short of the card edges.
    padding: 0,
    overflow: 'hidden',
  },
  navRow: {
    paddingRight: 12,
  },
  navRowDivided: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  navTitle: {
    fontFamily: fontFamily.textMedium,
    fontSize: 15,
    color: colors.neutral[800],
  },
  navRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  // An unread count is the one "needs attention" signal on this screen, which
  // is what web reserves the crimson accent for.
  badge: {
    backgroundColor: colors.accent[600],
    fontFamily: fontFamily.textSemibold,
  },
  logoutButton: {
    borderRadius: radius.full,
    borderColor: colors.danger[500],
  },
  logoutContent: {
    paddingVertical: 4,
  },
});
