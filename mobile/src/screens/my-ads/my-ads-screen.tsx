import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { Alert, FlatList, StyleSheet, View } from 'react-native';
import {
  ActivityIndicator,
  Button,
  Card,
  Chip,
  FAB,
  Text,
  useTheme,
} from 'react-native-paper';

import {
  deleteAd,
  getMyAds,
  markAdSold,
  resubmitAd,
} from '../../features/ads/api';
import { getSectorOptionBySector } from '../../features/ads/sectors';
import type { Ad, AdStatus } from '../../features/ads/types';
import { useAuth } from '../../features/auth/auth-context';
import { formatPrice } from '../../lib/format';
import { PlaceholderScreen } from '../../components/placeholder-screen';
import type { MyAdsStackScreenProps } from '../../navigation/types';

// Mirrors web/src/app/dashboard/ads/page.tsx's status filter tabs and
// per-status action visibility (AD_STATUS_BADGE, the row action conditionals).
const STATUS_FILTERS: { value: AdStatus | 'ALL'; label: string }[] = [
  { value: 'ALL', label: 'All' },
  { value: 'LIVE', label: 'Live' },
  { value: 'PENDING', label: 'In review' },
  { value: 'REJECTED', label: 'Rejected' },
  { value: 'SOLD', label: 'Sold' },
];

const STATUS_LABEL: Record<AdStatus, string> = {
  LIVE: 'Live',
  PENDING: 'In review',
  REJECTED: 'Rejected',
  SOLD: 'Sold',
  REMOVED: 'Removed',
};

export function MyAdsScreen({ navigation }: MyAdsStackScreenProps<'MyAds'>) {
  const { user } = useAuth();
  const theme = useTheme();
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<AdStatus | 'ALL'>('ALL');

  const {
    data: ads,
    isPending,
    isError,
  } = useQuery({
    queryKey: ['ads', 'mine'],
    queryFn: getMyAds,
    enabled: !!user,
  });

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ['ads', 'mine'] });

  const markSoldMutation = useMutation({
    mutationFn: markAdSold,
    onSuccess: invalidate,
  });
  const resubmitMutation = useMutation({
    mutationFn: resubmitAd,
    onSuccess: invalidate,
  });
  const deleteMutation = useMutation({
    mutationFn: deleteAd,
    onSuccess: invalidate,
  });

  if (!user) {
    return (
      <PlaceholderScreen
        title="Log in to post and manage ads"
        note="Go to the Profile tab to log in or create an account."
      />
    );
  }

  function confirmRemove(ad: Ad) {
    Alert.alert('Remove this ad?', ad.title, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: () => deleteMutation.mutate(ad.id),
      },
    ]);
  }

  const filtered = (ads ?? []).filter(
    (ad) => filter === 'ALL' || ad.status === filter,
  );

  return (
    <View style={styles.screen}>
      <FlatList<Ad>
        data={filtered}
        keyExtractor={(ad) => ad.id}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <View style={styles.filterRow}>
            {STATUS_FILTERS.map((option) => (
              <Chip
                key={option.value}
                selected={filter === option.value}
                onPress={() => setFilter(option.value)}
              >
                {option.label}
              </Chip>
            ))}
          </View>
        }
        ListEmptyComponent={
          isPending ? (
            <ActivityIndicator style={styles.stateIndicator} />
          ) : isError ? (
            <Text
              style={[styles.stateIndicator, { color: theme.colors.error }]}
            >
              Couldn&apos;t load your ads.
            </Text>
          ) : (
            <Text
              style={[
                styles.stateIndicator,
                { color: theme.colors.onSurfaceVariant },
              ]}
            >
              No ads here yet.
            </Text>
          )
        }
        renderItem={({ item: ad }) => (
          <Card style={styles.card}>
            <Card.Content style={styles.cardContent}>
              <View style={styles.badgeRow}>
                <Chip compact>{STATUS_LABEL[ad.status]}</Chip>
                <Text
                  variant="labelMedium"
                  style={{ color: theme.colors.onSurfaceVariant }}
                >
                  {getSectorOptionBySector(ad.sector).label}
                </Text>
              </View>
              <Text variant="titleMedium">{ad.title}</Text>
              <Text style={{ color: theme.colors.onSurfaceVariant }}>
                {formatPrice(ad.price)} - {ad.locationArea},{' '}
                {ad.locationDistrict}
              </Text>
              {ad.status === 'REJECTED' && ad.rejectionReason ? (
                <Text style={{ color: theme.colors.error }}>
                  Rejected: {ad.rejectionReason}
                </Text>
              ) : null}
            </Card.Content>
            <Card.Actions style={styles.actions}>
              <Button
                onPress={() => navigation.navigate('AdForm', { adId: ad.id })}
              >
                Edit
              </Button>
              {ad.status === 'LIVE' ? (
                <>
                  <Button
                    onPress={() =>
                      navigation.navigate('Boost', { adId: ad.id })
                    }
                  >
                    Boost
                  </Button>
                  <Button
                    onPress={() =>
                      navigation.navigate('AdStats', { adId: ad.id })
                    }
                  >
                    Stats
                  </Button>
                  <Button
                    onPress={() => markSoldMutation.mutate(ad.id)}
                    loading={markSoldMutation.isPending}
                  >
                    Mark sold
                  </Button>
                </>
              ) : null}
              {ad.status === 'REJECTED' ? (
                <Button
                  onPress={() => resubmitMutation.mutate(ad.id)}
                  loading={resubmitMutation.isPending}
                >
                  Resubmit
                </Button>
              ) : null}
              <Button
                textColor={theme.colors.error}
                onPress={() => confirmRemove(ad)}
              >
                Remove
              </Button>
            </Card.Actions>
          </Card>
        )}
      />
      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => navigation.navigate('AdForm')}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  listContent: {
    padding: 16,
    paddingBottom: 96,
  },
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  card: {
    marginBottom: 12,
  },
  cardContent: {
    gap: 4,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actions: {
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
  },
  stateIndicator: {
    marginTop: 24,
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
  },
});
