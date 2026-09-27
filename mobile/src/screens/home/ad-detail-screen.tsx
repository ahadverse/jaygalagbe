import { useQuery } from '@tanstack/react-query';
import { useEffect, useRef } from 'react';
import {
  Image,
  ScrollView,
  StyleSheet,
  View,
  useWindowDimensions,
} from 'react-native';
import { ActivityIndicator, Chip, Text, useTheme } from 'react-native-paper';

import { NearbyListings } from '../../components/ads/nearby-listings';
import { logVisit } from '../../features/analytics/api';
import { getAd, getLiveAds } from '../../features/ads/api';
import { describeAdAttributes } from '../../features/ads/describe-attributes';
import type { Ad } from '../../features/ads/types';
import { formatPrice, formatRelativeTime } from '../../lib/format';
import type { HomeStackScreenProps } from '../../navigation/types';

const SECTOR_LABEL: Record<Ad['sector'], string> = {
  LAND: 'Land for sale',
  HOUSE_RENT: 'House rent',
};

const PRICE_LABEL: Record<Ad['sector'], string> = {
  LAND: 'Asking price',
  HOUSE_RENT: 'Monthly rent',
};

const RELATED_LIMIT = 3;

/* Same district first, then anything else live in the sector, so the row
 * only disappears when the sector genuinely has nothing else to show -
 * mirrors web's ads/[id]/page.tsx relatedAds(). */
function relatedAds(pool: Ad[], current: Ad): { ads: Ad[]; sameArea: boolean } {
  const others = pool.filter((ad) => ad.id !== current.id);
  const sameDistrict = others.filter(
    (ad) => ad.locationDistrict === current.locationDistrict,
  );
  if (sameDistrict.length > 0) {
    return { ads: sameDistrict.slice(0, RELATED_LIMIT), sameArea: true };
  }
  return { ads: others.slice(0, RELATED_LIMIT), sameArea: false };
}

export function AdDetailScreen({
  route,
  navigation,
}: HomeStackScreenProps<'AdDetail'>) {
  const theme = useTheme();
  const { width } = useWindowDimensions();
  const { adId } = route.params;
  const visited = useRef<string | null>(null);

  const {
    data: ad,
    isPending,
    isError,
  } = useQuery({
    queryKey: ['ads', 'detail', adId],
    queryFn: () => getAd(adId),
  });

  const { data: pool } = useQuery({
    queryKey: ['ads', 'live', ad?.sector, 'related'],
    queryFn: () => getLiveAds(ad!.sector, { take: 200 }),
    enabled: !!ad,
  });

  useEffect(() => {
    if (!ad || visited.current === ad.id) return;
    visited.current = ad.id;
    void logVisit(ad.id);
  }, [ad]);

  useEffect(() => {
    if (ad) navigation.setOptions({ title: ad.title });
  }, [ad, navigation]);

  if (isPending) {
    return (
      <View
        style={[styles.center, { backgroundColor: theme.colors.background }]}
      >
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (isError || !ad) {
    return (
      <View
        style={[styles.center, { backgroundColor: theme.colors.background }]}
      >
        <Text style={{ color: theme.colors.error }}>
          Couldn&apos;t load this listing.
        </Text>
      </View>
    );
  }

  const facts = describeAdAttributes(ad);
  const posted = formatRelativeTime(ad.createdAt);
  const related = pool ? relatedAds(pool, ad) : { ads: [], sameArea: false };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {ad.photos.length > 0 ? (
        <ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
        >
          {ad.photos.map((photo) => (
            <Image
              key={photo}
              source={{ uri: photo }}
              resizeMode="cover"
              style={{ width, height: width * 0.75 }}
            />
          ))}
        </ScrollView>
      ) : null}

      <View style={styles.body}>
        <View style={styles.chipRow}>
          <Chip compact>{ad.status}</Chip>
          <Chip compact>{SECTOR_LABEL[ad.sector]}</Chip>
          {posted ? (
            <Text
              variant="bodySmall"
              style={{
                color: theme.colors.onSurfaceVariant,
                alignSelf: 'center',
              }}
            >
              Posted {posted.toLowerCase()}
            </Text>
          ) : null}
        </View>

        <Text variant="headlineSmall">{ad.title}</Text>
        <Text
          variant="bodyMedium"
          style={{ color: theme.colors.onSurfaceVariant }}
        >
          {ad.locationArea}, {ad.locationDistrict}
          {ad.address ? ` — ${ad.address}` : ''}
        </Text>

        <View
          style={[
            styles.priceCard,
            { backgroundColor: theme.colors.surfaceVariant },
          ]}
        >
          <Text
            variant="labelMedium"
            style={{ color: theme.colors.onSurfaceVariant }}
          >
            {PRICE_LABEL[ad.sector]}
          </Text>
          <Text
            variant="headlineMedium"
            style={{ color: theme.colors.primary }}
          >
            {formatPrice(ad.price)}
          </Text>
        </View>

        {facts.length > 0 ? (
          <View style={styles.factsRow}>
            {facts.map((fact) => (
              <View
                key={fact.label}
                style={[
                  styles.factBox,
                  { backgroundColor: theme.colors.surfaceVariant },
                ]}
              >
                <Text
                  variant="labelSmall"
                  style={{ color: theme.colors.onSurfaceVariant }}
                >
                  {fact.label}
                </Text>
                <Text variant="titleSmall">{fact.value}</Text>
              </View>
            ))}
          </View>
        ) : null}

        <View style={styles.section}>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            About this property
          </Text>
          <Text variant="bodyMedium">{ad.description}</Text>
        </View>

        <View
          style={[
            styles.noticeBox,
            { backgroundColor: theme.colors.errorContainer },
          ]}
        >
          <Text
            variant="bodySmall"
            style={{ color: theme.colors.onErrorContainer }}
          >
            <Text style={{ fontWeight: '700' }}>Stay safe. </Text>
            Visit the property in person and verify ownership papers before
            paying any advance. Jayga Lagbe never asks for payment on behalf of
            an advertiser.
          </Text>
        </View>

        <NearbyListings
          ads={related.ads}
          heading={
            related.sameArea
              ? `More ${SECTOR_LABEL[ad.sector].toLowerCase()} in ${ad.locationDistrict}`
              : `More ${SECTOR_LABEL[ad.sector].toLowerCase()}`
          }
          onSelect={(nextAdId) =>
            navigation.push('AdDetail', { adId: nextAdId })
          }
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  container: {
    paddingBottom: 24,
  },
  body: {
    padding: 16,
    gap: 12,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    alignItems: 'center',
  },
  priceCard: {
    borderRadius: 12,
    padding: 16,
    gap: 4,
  },
  factsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  factBox: {
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    minWidth: 100,
    gap: 2,
  },
  section: {
    gap: 6,
  },
  sectionTitle: {
    marginBottom: 2,
  },
  noticeBox: {
    borderRadius: 12,
    padding: 14,
  },
});
