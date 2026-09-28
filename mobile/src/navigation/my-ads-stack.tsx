import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { AdFormScreen } from '../screens/my-ads/ad-form-screen';
import { AdStatsScreen } from '../screens/my-ads/ad-stats-screen';
import { BoostScreen } from '../screens/my-ads/boost-screen';
import { MyAdsScreen } from '../screens/my-ads/my-ads-screen';
import { defaultStackScreenOptions } from './screen-options';
import type { MyAdsStackParamList } from './types';

const Stack = createNativeStackNavigator<MyAdsStackParamList>();

export function MyAdsStack() {
  return (
    <Stack.Navigator screenOptions={defaultStackScreenOptions}>
      <Stack.Screen
        name="MyAds"
        component={MyAdsScreen}
        options={{ title: 'My Ads' }}
      />
      <Stack.Screen
        name="AdForm"
        component={AdFormScreen}
        options={({ route }) => ({
          title: route.params?.adId ? 'Edit ad' : 'Post an ad',
        })}
      />
      <Stack.Screen
        name="Boost"
        component={BoostScreen}
        options={{ title: 'Boost this ad' }}
      />
      <Stack.Screen
        name="AdStats"
        component={AdStatsScreen}
        options={{ title: 'Ad stats' }}
      />
    </Stack.Navigator>
  );
}
