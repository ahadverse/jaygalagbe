import { useQuery } from '@tanstack/react-query';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Badge, Button, List, Text, useTheme } from 'react-native-paper';

import { useAuth } from '../../features/auth/auth-context';
import { getOverview } from '../../features/analytics/api';
import { useNotifications } from '../../features/notifications/notifications-context';
import type { ProfileStackScreenProps } from '../../navigation/types';

function StatTile({ label, value }: { label: string; value: string }) {
  const theme = useTheme();
  return (
    <View
      style={[
        styles.statTile,
        { backgroundColor: theme.colors.surfaceVariant },
      ]}
    >
      <Text
        variant="labelSmall"
        style={{ color: theme.colors.onSurfaceVariant }}
      >
        {label}
      </Text>
      <Text variant="titleMedium">{value}</Text>
    </View>
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

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text variant="headlineSmall">Hi, {user?.name}</Text>

      {overview && overview.ads.length > 0 ? (
        <View style={styles.statsGrid}>
          <StatTile
            label="Impressions"
            value={String(overview.totals.impressions)}
          />
          <StatTile label="Visits" value={String(overview.totals.visits)} />
          <StatTile label="Leads" value={String(overview.totals.conversions)} />
          <StatTile
            label="Conv. rate"
            value={`${(overview.totals.conversionRate * 100).toFixed(1)}%`}
          />
        </View>
      ) : null}

      <List.Section>
        <List.Item
          title="Saved & recently viewed"
          left={(props) => <List.Icon {...props} icon="bookmark-outline" />}
          onPress={() => navigation.navigate('Saved')}
        />
        <List.Item
          title="Reviews"
          left={(props) => <List.Icon {...props} icon="star-outline" />}
          onPress={() => navigation.navigate('Reviews')}
        />
        <List.Item
          title="Notifications"
          left={(props) => <List.Icon {...props} icon="bell-outline" />}
          right={() =>
            unreadActivity > 0 ? (
              <Badge style={styles.badge}>{unreadActivity}</Badge>
            ) : null
          }
          onPress={() => navigation.navigate('Notifications')}
        />
        <List.Item
          title="Settings"
          left={(props) => <List.Icon {...props} icon="cog-outline" />}
          onPress={() => navigation.navigate('Settings')}
        />
      </List.Section>

      <Button mode="outlined" onPress={logout}>
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
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  statTile: {
    borderRadius: 12,
    padding: 12,
    minWidth: '45%',
    flexGrow: 1,
    gap: 4,
  },
  badge: {
    alignSelf: 'center',
  },
});
