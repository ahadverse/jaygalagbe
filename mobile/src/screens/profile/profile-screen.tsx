import Ionicons from '@expo/vector-icons/Ionicons';
import type { ComponentProps } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Badge, Button, List } from 'react-native-paper';

import { BrandCard } from '../../components/brand/brand-card';
import { Eyebrow } from '../../components/brand/eyebrow';
import { DashboardOverview } from '../../components/dashboard/dashboard-overview';
import { useAuth } from '../../features/auth/auth-context';
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

// The Profile tab's logged-in root, and mobile's equivalent of web's
// /dashboard: the identity card, the full overview, then the nav rows. The
// overview owns its own queries and filter state, so this screen stays a
// layout - see components/dashboard/dashboard-overview.tsx.
export function ProfileScreen({
  navigation,
}: ProfileStackScreenProps<'Profile'>) {
  const { user, logout } = useAuth();
  const { unreadActivity } = useNotifications();

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

      <DashboardOverview />

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

      {/* A second group rather than four more rows on the first: these are
       * read-once documents, not places anyone returns to. */}
      <View style={styles.infoBlock}>
        <Eyebrow>Company &amp; legal</Eyebrow>
        <BrandCard style={styles.navCard}>
          <NavRow
            title="About Jayga Lagbe"
            icon="information-outline"
            onPress={() => navigation.navigate('About')}
            divided={false}
          />
          <NavRow
            title="Contact us"
            icon="email-outline"
            onPress={() => navigation.navigate('Contact')}
            divided
          />
          <NavRow
            title="Privacy Policy"
            icon="shield-check-outline"
            onPress={() => navigation.navigate('Privacy')}
            divided
          />
          <NavRow
            title="Terms of Service"
            icon="file-document-outline"
            onPress={() => navigation.navigate('Terms')}
            divided
          />
        </BrandCard>
      </View>

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
  navCard: {
    // BrandCard's own 16px padding would inset the rows and cut their
    // separators short of the card edges.
    padding: 0,
    overflow: 'hidden',
  },
  infoBlock: {
    gap: 10,
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
