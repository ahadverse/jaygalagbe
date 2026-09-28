import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import {
  useNavigation,
  useRoute,
  type RouteProp,
} from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useRef } from 'react';
import {
  Image,
  ScrollView,
  StyleSheet,
  View,
  useWindowDimensions,
} from 'react-native';
import { ActivityIndicator, Text } from 'react-native-paper';

import { ContactGate } from '../../components/ads/contact-gate';
import { NearbyListings } from '../../components/ads/nearby-listings';
import { ReportAdButton } from '../../components/ads/report-ad-button';
import { SaveAdButton } from '../../components/ads/save-ad-button';
import { BrandCard } from '../../components/brand/brand-card';
import { Eyebrow } from '../../components/brand/eyebrow';
import { Badge, StatusBadge } from '../../components/brand/status-badge';
import { logVisit } from '../../features/analytics/api';
import { getAd, getLiveAds } from '../../features/ads/api';
import { describeAdAttributes } from '../../features/ads/describe-attributes';
import { recordAdView } from '../../features/ads/local-lists';
import type { Ad } from '../../features/ads/types';
import { formatPrice, formatRelativeTime } from '../../lib/format';
import type { RootTabParamList } from '../../navigation/types';
import { colors, fontFamily } from '../../theme/tokens';

// This screen is registered under both HomeStack and ProfileStack (the
// Saved screen also needs to reach it), so it can't be typed against either
// stack's own ParamList specifically - the shared shape below is all it
// actually needs from whichever stack rendered it.
type AdDetailParamList = { AdDetail: { adId: string } };
type AdDetailNavigation = NativeStackNavigationProp<
  AdDetailParamList,
  'AdDetail'
>;

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

export function AdDetailScreen() {
  const { width } = useWindowDimensions();
  const navigation = useNavigation<AdDetailNavigation>();
  const route = useRoute<RouteProp<AdDetailParamList, 'AdDetail'>>();
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
    void recordAdView(ad.id);
  }, [ad]);

  useEffect(() => {
    if (ad) navigation.setOptions({ title: ad.title });
  }, [ad, navigation]);

  // Login/Register live under the Profile tab, not this stack - reach them
  // through the parent tab navigator (see navigation/types.ts's note on why
  // there's no dedicated top-level auth stack).
  function requireAuth(screen: 'Login' | 'Register') {
    navigation
      .getParent<BottomTabNavigationProp<RootTabParamList>>()
      ?.navigate('ProfileTab', { screen });
  }

  if (isPending) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (isError || !ad) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Couldn&apos;t load this listing.</Text>
      </View>
    );
  }

  const facts = describeAdAttributes(ad);
  const posted = formatRelativeTime(ad.createdAt);
  const related = pool ? relatedAds(pool, ad) : { ads: [], sameArea: false };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.container}>
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
          <StatusBadge status={ad.status} />
          <Badge tone="brand" label={SECTOR_LABEL[ad.sector]} />
          {posted ? (
            <Text variant="bodySmall" style={styles.posted}>
              Posted {posted.toLowerCase()}
            </Text>
          ) : null}
        </View>

        <Text variant="headlineSmall">{ad.title}</Text>
        <Text variant="bodyMedium" style={styles.mutedText}>
          {ad.locationArea}, {ad.locationDistrict}
          {ad.address ? ` — ${ad.address}` : ''}
        </Text>

        <BrandCard variant="sunken">
          <Eyebrow>{PRICE_LABEL[ad.sector]}</Eyebrow>
          <Text variant="headlineMedium" style={styles.price}>
            {formatPrice(ad.price)}
          </Text>
        </BrandCard>

        <ContactGate
          adId={ad.id}
          ownerId={ad.ownerId}
          onRequireAuth={requireAuth}
        />
        <SaveAdButton adId={ad.id} />

        {facts.length > 0 ? (
          <View style={styles.factsRow}>
            {facts.map((fact) => (
              <BrandCard
                key={fact.label}
                variant="sunken"
                radius="sm"
                style={styles.factBox}
              >
                <Eyebrow>{fact.label}</Eyebrow>
                <Text variant="titleSmall">{fact.value}</Text>
              </BrandCard>
            ))}
          </View>
        ) : null}

        <View style={styles.section}>
          <Eyebrow>The details</Eyebrow>
          <Text variant="headlineSmall" style={styles.sectionTitle}>
            About this property
          </Text>
          <Text variant="bodyMedium">{ad.description}</Text>
        </View>

        {/* Warning, not danger: web's own safety aside is warning-50/800
         * (web/src/app/ads/[id]/page.tsx) - it's a caution, not an error. */}
        <BrandCard variant="warning">
          <Text variant="bodySmall" style={styles.noticeText}>
            <Text style={styles.noticeLead}>Stay safe. </Text>
            Visit the property in person and verify ownership papers before
            paying any advance. Jayga Lagbe never asks for payment on behalf of
            an advertiser.
          </Text>
        </BrandCard>

        <ReportAdButton
          adId={ad.id}
          ownerId={ad.ownerId}
          status={ad.status}
          onRequireAuth={() => requireAuth('Login')}
        />

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
  screen: {
    backgroundColor: colors.surface,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
  },
  errorText: {
    color: colors.danger[600],
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
  posted: {
    color: colors.neutral[600],
    alignSelf: 'center',
  },
  mutedText: {
    color: colors.neutral[600],
  },
  price: {
    marginTop: 2,
    color: colors.brand[700],
    fontVariant: ['tabular-nums'],
  },
  factsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  factBox: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    minWidth: 100,
    gap: 2,
  },
  section: {
    gap: 6,
  },
  // Web's section headings are 18px display-bold; headlineSmall already
  // carries that family and weight, only the size differs.
  sectionTitle: {
    fontSize: 18,
    lineHeight: 24,
    marginBottom: 2,
  },
  noticeText: {
    color: colors.warning[800],
    lineHeight: 18,
  },
  noticeLead: {
    fontFamily: fontFamily.textSemibold,
  },
});
