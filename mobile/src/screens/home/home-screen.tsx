import { useNavigation, type NavigationProp } from '@react-navigation/native';
import { useQueries } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { ActivityIndicator, Text } from 'react-native-paper';

import { AdCard } from '../../components/ads/ad-card';
import { Eyebrow } from '../../components/brand/eyebrow';
import { AdvertiserCta } from '../../components/home/advertiser-cta';
import { BoostBanner } from '../../components/home/boost-banner';
import { BudgetGuide } from '../../components/home/budget-guide';
import { DistrictGrid } from '../../components/home/district-grid';
import { Hero } from '../../components/home/hero';
import { HomeFaq } from '../../components/home/home-faq';
import { HowItWorks } from '../../components/home/how-it-works';
import { SectorCategories } from '../../components/home/sector-categories';
import { StatsBand } from '../../components/home/stats-band';
import { TrustBand } from '../../components/home/trust-band';
import { SiteFooter } from '../../components/layout/site-footer';
import { liveAdsQuery } from '../../features/ads/api';
import {
  budgetBands,
  districtFacets,
  type BudgetBand,
} from '../../features/ads/home-facets';
import { sectors, type SectorSlug } from '../../features/ads/sectors';
import type { Ad } from '../../features/ads/types';
import {
  AD_IMPRESSION_VIEWABILITY_CONFIG,
  useAdImpressions,
} from '../../features/analytics/use-ad-impressions';
import { useAuth } from '../../features/auth/auth-context';
import type { HomeStackScreenProps, RootTabParamList } from '../../navigation/types';
import { colors } from '../../theme/tokens';

const HOME_PAGE_SIZE = 30;

/*
 * Mirrors web/src/app/page.tsx section for section. app.md originally planned
 * to drop the marketing half of the scroll on mobile as an SEO-only concern;
 * that was reversed - the two clients are meant to be the same product, and a
 * phone visitor gets the trust and how-it-works story for the same reason a
 * browser one does.
 *
 * Both sectors come down with the screen, so the hero toggle swaps the feed
 * with no round trip, and every derived surface below is cut from ads already
 * fetched rather than costing its own request - the same trade web makes.
 */
export function HomeScreen({ navigation }: HomeStackScreenProps<'Home'>) {
  const rootNavigation = useNavigation<NavigationProp<RootTabParamList>>();
  const { user } = useAuth();
  const [sector, setSector] = useState<SectorSlug>(sectors[0].slug);
  const [location, setLocation] = useState('');
  const onViewableItemsChanged = useAdImpressions('HOMEPAGE');

  const [landQuery, houseQuery] = useQueries({
    queries: [liveAdsQuery('LAND'), liveAdsQuery('HOUSE_RENT')],
  });

  const landAds = landQuery.data;
  const houseAds = houseQuery.data;

  // Memoized, unlike the sector listing's per-render filter: the hero's
  // location field re-renders this screen on every keystroke, and these facets
  // walk ~400 rows four times over.
  const home = useMemo(() => {
    const land = landAds ?? [];
    const house = houseAds ?? [];
    const ads = [...land, ...house].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );

    return {
      ads,
      districts: districtFacets(ads),
      landBands: budgetBands(land, 'LAND'),
      houseBands: budgetBands(house, 'HOUSE_RENT'),
      counts: {
        'jayga-jomi': land.length,
        'basha-bhara': house.length,
      } satisfies Record<SectorSlug, number>,
      listings: {
        'jayga-jomi': land.slice(0, HOME_PAGE_SIZE),
        'basha-bhara': house.slice(0, HOME_PAGE_SIZE),
      } satisfies Record<SectorSlug, Ad[]>,
    };
  }, [landAds, houseAds]);

  const isPending = landQuery.isPending || houseQuery.isPending;
  const isError = landQuery.isError || houseQuery.isError;
  const feed = home.listings[sector];

  function goToSectorListing(nextLocation?: string) {
    navigation.navigate('SectorListing', {
      sector,
      location: nextLocation?.trim() || undefined,
    });
  }

  function browseDistrict(slug: SectorSlug, district: string) {
    navigation.navigate('SectorListing', { sector: slug, location: district });
  }

  function browseBudget(slug: SectorSlug, band: BudgetBand) {
    navigation.navigate('SectorListing', {
      sector: slug,
      minPrice: band.minPrice,
      maxPrice: band.maxPrice,
    });
  }

  function postAd() {
    rootNavigation.navigate('MyAdsTab', { screen: 'AdForm', params: undefined });
  }

  function boostListing() {
    rootNavigation.navigate('MyAdsTab', { screen: 'MyAds' });
  }

  function openAccount() {
    // Register only exists in the Profile stack's logged-out branch, so a
    // signed-in user gets sent to their profile instead of a dead route.
    if (user) {
      rootNavigation.navigate('ProfileTab', { screen: 'Profile' });
    } else {
      rootNavigation.navigate('ProfileTab', { screen: 'Register' });
    }
  }

  return (
    <FlatList<Ad>
      data={feed}
      keyExtractor={(ad) => ad.id}
      renderItem={({ item }) => (
        <View style={styles.cardSlot}>
          <AdCard
            ad={item}
            onPress={() => navigation.push('AdDetail', { adId: item.id })}
          />
        </View>
      )}
      onViewableItemsChanged={onViewableItemsChanged}
      viewabilityConfig={AD_IMPRESSION_VIEWABILITY_CONFIG}
      style={styles.list}
      ListHeaderComponent={
        <View>
          <Hero
            sector={sector}
            onSectorChange={setSector}
            location={location}
            onLocationChange={setLocation}
            onSearch={goToSectorListing}
          />

          {/* Web server-renders its counts, so it never shows a band of
           * zeros. Here they'd flash during the fetch, and a "0 live
           * listings" headline reads as a broken site rather than a loading
           * one. */}
          {home.ads.length > 0 ? <StatsBand ads={home.ads} /> : null}

          <SectorCategories
            counts={home.counts}
            onSelectSector={(slug) =>
              navigation.navigate('SectorListing', { sector: slug })
            }
            onPostAd={postAd}
          />

          <View style={styles.latestHeader}>
            <View style={styles.sectionHeading}>
              <Eyebrow>Fresh on the market</Eyebrow>
              <Text variant="headlineSmall">Latest listings</Text>
            </View>

            {isPending ? (
              <ActivityIndicator style={styles.stateIndicator} />
            ) : null}
            {isError ? (
              <Text style={[styles.stateIndicator, styles.errorText]}>
                Couldn&apos;t load listings. Pull down to try again.
              </Text>
            ) : null}
            {!isPending && !isError && feed.length === 0 ? (
              <Text style={[styles.stateIndicator, styles.mutedText]}>
                No listings yet - check back shortly.
              </Text>
            ) : null}
          </View>
        </View>
      }
      ListFooterComponent={
        <View>
          <DistrictGrid
            districts={home.districts}
            onSelect={browseDistrict}
          />
          <BudgetGuide
            land={home.landBands}
            house={home.houseBands}
            onSelect={browseBudget}
          />
          <TrustBand liveCount={home.ads.length} />
          <HowItWorks />
          <BoostBanner onBoost={boostListing} />
          <AdvertiserCta onPostAd={postAd} onCreateAccount={openAccount} />
          <HomeFaq />
          <SiteFooter
            onNavigate={(screen) => navigation.navigate(screen)}
            onBrowseSector={(slug) =>
              navigation.navigate('SectorListing', { sector: slug })
            }
            onPostAd={postAd}
            onBecomeAdvertiser={openAccount}
            onBoost={boostListing}
          />
        </View>
      }
    />
  );
}

const styles = StyleSheet.create({
  list: {
    backgroundColor: colors.surface,
  },
  cardSlot: {
    paddingHorizontal: 16,
  },
  latestHeader: {
    paddingHorizontal: 16,
    paddingTop: 22,
    paddingBottom: 4,
  },
  sectionHeading: {
    gap: 4,
  },
  stateIndicator: {
    marginTop: 8,
    textAlign: 'center',
  },
  errorText: {
    color: colors.danger[600],
  },
  mutedText: {
    color: colors.neutral[600],
  },
});
