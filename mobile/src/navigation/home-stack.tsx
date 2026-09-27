import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { getSectorOption } from '../features/ads/sectors';
import { HomeScreen } from '../screens/home/home-screen';
import { SectorListingScreen } from '../screens/home/sector-listing-screen';
import type { HomeStackParamList } from './types';

const Stack = createNativeStackNavigator<HomeStackParamList>();

export function HomeStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={{ title: 'Jayga Lagbe' }}
      />
      <Stack.Screen
        name="SectorListing"
        component={SectorListingScreen}
        options={({ route }) => ({
          title: getSectorOption(route.params.sector).label,
        })}
      />
    </Stack.Navigator>
  );
}
