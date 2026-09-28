import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StyleSheet, View } from 'react-native';

import { NavMenuButton } from '../components/brand/nav-menu-button';
import { PostAdButton } from '../components/brand/post-ad-button';
import { Wordmark } from '../components/brand/wordmark';
import { getSectorOption } from '../features/ads/sectors';
import { AdDetailScreen } from '../screens/home/ad-detail-screen';
import { HomeScreen } from '../screens/home/home-screen';
import { SectorListingScreen } from '../screens/home/sector-listing-screen';
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
          // Web's header is an opaque white bar above the hero. On a phone
          // that leaves a dead strip across the top, so the same three
          // controls float over the photo instead and the hero runs edge to
          // edge, including behind the status bar.
          headerTransparent: true,
          headerStyle: { backgroundColor: 'transparent' },
          headerTitle: () => <Wordmark size="sm" tone="light" />,
          headerRight: () => (
            <View style={styles.headerActions}>
              <PostAdButton />
              <NavMenuButton tone="light" />
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
