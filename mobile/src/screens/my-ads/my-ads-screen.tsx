import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import {
  Alert,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { ActivityIndicator, Button, FAB } from 'react-native-paper';

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
import { BrandCard } from '../../components/brand/brand-card';
import { StatusBadge } from '../../components/brand/status-badge';
import { PlaceholderScreen } from '../../components/placeholder-screen';
import type { MyAdsStackScreenProps } from '../../navigation/types';
import { colors, fontFamily, radius } from '../../theme/tokens';

// Mirrors web/src/app/dashboard/ads/page.tsx's status filter tabs and
// per-status action visibility (AD_STATUS_BADGE, the row action conditionals).
const STATUS_FILTERS: { value: AdStatus | 'ALL'; label: string }[] = [
  { value: 'ALL', label: 'All' },
  { value: 'LIVE', label: 'Live' },
  { value: 'PENDING', label: 'In review' },
  { value: 'REJECTED', label: 'Rejected' },
  { value: 'SOLD', label: 'Sold' },
];

export function MyAdsScreen({ navigation }: MyAdsStackScreenProps<'MyAds'>) {
  const { user } = useAuth();
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
            {STATUS_FILTERS.map((option) => {
              const selected = filter === option.value;
              return (
                <Pressable
                  key={option.value}
                  onPress={() => setFilter(option.value)}
                  style={[styles.pill, selected ? styles.pillSelected : null]}
                >
                  <Text
                    style={[
                      styles.pillLabel,
                      selected ? styles.pillLabelSelected : null,
                    ]}
                  >
                    {option.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        }
        ListEmptyComponent={
          isPending ? (
            <ActivityIndicator style={styles.stateBlock} />
          ) : (
            <View style={styles.stateBlock}>
              <Text style={styles.stateTitle}>
                {isError ? "Couldn't load your ads" : 'No ads here yet'}
              </Text>
              <Text style={styles.stateNote}>
                {isError
                  ? 'Check your connection and open this tab again.'
                  : 'Tap the + button to post your first listing.'}
              </Text>
            </View>
          )
        }
        renderItem={({ item: ad }) => (
          <BrandCard style={styles.card}>
            <View style={styles.badgeRow}>
              <StatusBadge status={ad.status} />
              <Text style={styles.sector}>
                {getSectorOptionBySector(ad.sector).label}
              </Text>
            </View>
            <Text style={styles.title} numberOfLines={2}>
              {ad.title}
            </Text>
            <Text style={styles.price}>{formatPrice(ad.price)}</Text>
            <Text style={styles.location} numberOfLines={1}>
              {ad.locationArea}, {ad.locationDistrict}
            </Text>
            {ad.status === 'REJECTED' && ad.rejectionReason ? (
              <Text style={styles.rejection}>
                Rejected: {ad.rejectionReason}
              </Text>
            ) : null}
            <View style={styles.actions}>
              <Button
                compact
                onPress={() => navigation.navigate('AdForm', { adId: ad.id })}
              >
                Edit
              </Button>
              {ad.status === 'LIVE' ? (
                <>
                  <Button
                    compact
                    onPress={() =>
                      navigation.navigate('Boost', { adId: ad.id })
                    }
                  >
                    Boost
                  </Button>
                  <Button
                    compact
                    onPress={() =>
                      navigation.navigate('AdStats', { adId: ad.id })
                    }
                  >
                    Stats
                  </Button>
                  <Button
                    compact
                    onPress={() => markSoldMutation.mutate(ad.id)}
                    loading={markSoldMutation.isPending}
                  >
                    Mark sold
                  </Button>
                </>
              ) : null}
              {ad.status === 'REJECTED' ? (
                <Button
                  compact
                  onPress={() => resubmitMutation.mutate(ad.id)}
                  loading={resubmitMutation.isPending}
                >
                  Resubmit
                </Button>
              ) : null}
              <Button
                compact
                textColor={colors.danger[600]}
                onPress={() => confirmRemove(ad)}
              >
                Remove
              </Button>
            </View>
          </BrandCard>
        )}
      />
      <FAB
        icon="plus"
        color={colors.surfaceCard}
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
    marginBottom: 14,
  },
  pill: {
    backgroundColor: colors.brand[50],
    borderRadius: radius.full,
    paddingHorizontal: 14,
    paddingVertical: 7,
  },
  pillSelected: {
    backgroundColor: colors.brand[600],
  },
  pillLabel: {
    fontFamily: fontFamily.textSemibold,
    fontSize: 13,
    lineHeight: 16,
    color: colors.brand[800],
  },
  pillLabelSelected: {
    color: colors.surfaceCard,
  },
  card: {
    marginBottom: 12,
    gap: 6,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sector: {
    fontFamily: fontFamily.textSemibold,
    fontSize: 11,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: colors.neutral[500],
  },
  title: {
    fontFamily: fontFamily.display,
    fontSize: 16,
    lineHeight: 21,
    letterSpacing: -0.3,
    color: colors.neutral[900],
  },
  price: {
    fontFamily: fontFamily.display,
    fontSize: 18,
    letterSpacing: -0.4,
    color: colors.brand[700],
    fontVariant: ['tabular-nums'],
  },
  location: {
    fontFamily: fontFamily.text,
    fontSize: 12.5,
    color: colors.neutral[600],
  },
  rejection: {
    fontFamily: fontFamily.text,
    fontSize: 12.5,
    lineHeight: 18,
    color: colors.danger[700],
  },
  actions: {
    marginTop: 8,
    paddingTop: 4,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  stateBlock: {
    marginTop: 32,
    alignItems: 'center',
    gap: 6,
  },
  stateTitle: {
    fontFamily: fontFamily.displaySemibold,
    fontSize: 16,
    color: colors.neutral[700],
  },
  stateNote: {
    fontFamily: fontFamily.text,
    fontSize: 13,
    textAlign: 'center',
    color: colors.neutral[500],
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    backgroundColor: colors.brand[700],
    borderRadius: radius.lg,
  },
});
