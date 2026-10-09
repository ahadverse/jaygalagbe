import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StyleSheet, View } from 'react-native';

import { NavMenuButton } from '../components/brand/nav-menu-button';
import { PostAdButton } from '../components/brand/post-ad-button';
import { Wordmark } from '../components/brand/wordmark';
import { getSectorOption } from '../features/ads/sectors';
import { AdDetailScreen } from '../screens/home/ad-detail-screen';
import { HomeScreen } from '../screens/home/home-screen';
import { SectorListingScreen } from '../screens/home/sector-listing-screen';
import { AboutScreen } from '../screens/info/about-screen';
import { ContactScreen } from '../screens/info/contact-screen';
import { FounderScreen } from '../screens/info/founder-screen';
import { PrivacyScreen } from '../screens/info/privacy-screen';
import { TermsScreen } from '../screens/info/terms-screen';
import { defaultStackScreenOptions } from './screen-options';
import type { HomeStackParamList } from './types';

const Stack = createNativeStackNavigator<HomeStackParamList>();

export function HomeStack() {
  return (
    <Stack.Navigator screenOptions={defaultStackScreenOptions}>
      <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={{
          title: 'Jayga Lagbe',
          // Matches web: an opaque bar on the paper canvas above the hero.
          // A transparent header floating over the photo was tried first, but
          // the hero then had to guess how far down its own content should
          // start, and any mismatch put the eyebrow pill under the wordmark.
          headerTitle: () => <Wordmark size="sm" />,
          headerRight: () => (
            <View style={styles.headerActions}>
              <PostAdButton />
              <NavMenuButton />
            </View>
          ),
        }}
      />
      <Stack.Screen
        name="SectorListing"
        component={SectorListingScreen}
        options={({ route }) => ({
          title: getSectorOption(route.params.sector).label,
        })}
      />
      <Stack.Screen
        name="AdDetail"
        component={AdDetailScreen}
        options={{ title: 'Listing' }}
      />
      {/* Registered here as well as on the Profile stack so the home footer
       * reaches them without throwing the user into another tab. */}
      <Stack.Screen
        name="About"
        component={AboutScreen}
        options={{ title: 'About' }}
      />
      <Stack.Screen
        name="Founder"
        component={FounderScreen}
        options={{ title: 'Meet the Founder' }}
      />
      <Stack.Screen
        name="Contact"
        component={ContactScreen}
        options={{ title: 'Contact Us' }}
      />
      <Stack.Screen
        name="Privacy"
        component={PrivacyScreen}
        options={{ title: 'Privacy Policy' }}
      />
      <Stack.Screen
        name="Terms"
        component={TermsScreen}
        options={{ title: 'Terms and Conditions' }}
      />
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
});
