import { useNavigation, type NavigationProp } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ActivityIndicator } from 'react-native-paper';

import { getAd } from '../../features/ads/api';
import { useRecentlyViewedIds } from '../../features/ads/local-lists';
import { useSavedAdIds } from '../../features/ads/saved-ads';
import type { Ad } from '../../features/ads/types';
import type {
  ProfileStackParamList,
  RootTabParamList,
} from '../../navigation/types';
import { colors, fontFamily, radius } from '../../theme/tokens';
import { AdCard } from '../ads/ad-card';
import { DashboardIcon, type DashboardIconName } from './icons';

type Source = 'saved' | 'viewed';

const COPY: Record<
  Source,
  { title: string; description: string; icon: DashboardIconName }
> = {
  saved: {
    title: 'Nothing saved yet',
    description:
      'Tap "Save this ad" on any listing and it will be kept here, on every device you sign in on.',
    icon: 'bookmark',
  },
  viewed: {
    title: 'Nothing viewed yet',
    description:
      'Listings you open will appear here so you can pick up where you left off.',
    icon: 'eye',
  },
};

/**
 * Both lists live on this device, so the ids come from AsyncStorage and each
 * listing is re-fetched - a since-removed ad drops out instead of going stale.
 * Shares saved-screen's query key, so opening either costs one round trip.
 */
export function LocalAdsGrid({
  source,
  limit,
}: {
  source: Source;
  limit?: number;
}) {
  const savedIds = useSavedAdIds();
  const viewedIds = useRecentlyViewedIds();
  const ids = source === 'saved' ? savedIds : viewedIds;

  // Mounted in the Profile stack, which registers its own AdDetail route; the
  // browse fallback leaves the tab, which only the tab param list types.
  const stack = useNavigation<NavigationProp<ProfileStackParamList>>();
  const tabs = useNavigation<NavigationProp<RootTabParamList>>();

  const { data: ads, isPending } = useQuery({
    queryKey: ['ads', 'batch', ids.join(',')],
    queryFn: async () => {
      const results = await Promise.all(
        ids.map((id) => getAd(id).catch(() => null)),
      );
      return results.filter((ad): ad is Ad => ad !== null);
    },
    enabled: ids.length > 0,
  });

  if (ids.length === 0) {
    const copy = COPY[source];
    return (
      <View style={styles.empty}>
        <DashboardIcon name={copy.icon} size={26} color={colors.neutral[300]} />
        <Text style={styles.emptyTitle}>{copy.title}</Text>
        <Text style={styles.emptyText}>{copy.description}</Text>
        <Pressable
          accessibilityRole="button"
          onPress={() => tabs.navigate('HomeTab', { screen: 'Home' })}
          style={({ pressed }) => [
            styles.browseButton,
            pressed ? styles.browsePressed : null,
          ]}
        >
          <Text style={styles.browseLabel}>Browse listings</Text>
        </Pressable>
      </View>
    );
  }

  if (isPending) {
    return <ActivityIndicator style={styles.loading} />;
  }

  return (
    <View>
      {(limit ? (ads ?? []).slice(0, limit) : (ads ?? [])).map((ad) => (
        <AdCard
          key={ad.id}
          ad={ad}
          onPress={() => stack.navigate('AdDetail', { adId: ad.id })}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  loading: {
    marginVertical: 24,
  },
  empty: {
    alignItems: 'center',
    gap: 8,
    paddingVertical: 22,
    paddingHorizontal: 16,
  },
  emptyTitle: {
    fontFamily: fontFamily.displaySemibold,
    fontSize: 15,
    letterSpacing: -0.2,
    color: colors.neutral[800],
  },
  emptyText: {
    fontFamily: fontFamily.text,
    fontSize: 12.5,
    lineHeight: 18,
    textAlign: 'center',
    color: colors.neutral[500],
  },
  browseButton: {
    marginTop: 4,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  browsePressed: {
    backgroundColor: colors.neutral[100],
  },
  browseLabel: {
    fontFamily: fontFamily.textSemibold,
    fontSize: 13,
    color: colors.neutral[800],
  },
});
