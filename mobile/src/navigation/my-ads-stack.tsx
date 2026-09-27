import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { MyAdsScreen } from '../screens/my-ads/my-ads-screen';
import type { MyAdsStackParamList } from './types';

const Stack = createNativeStackNavigator<MyAdsStackParamList>();

export function MyAdsStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="MyAds"
        component={MyAdsScreen}
        options={{ title: 'My Ads' }}
      />
    </Stack.Navigator>
  );
}
