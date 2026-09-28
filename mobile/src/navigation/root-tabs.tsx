import Ionicons from '@expo/vector-icons/Ionicons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import type { ComponentProps } from 'react';

import { colors, fontFamily } from '../theme/tokens';
import { HomeStack } from './home-stack';
import { MessagesStack } from './messages-stack';
import { MyAdsStack } from './my-ads-stack';
import { ProfileStack } from './profile-stack';
import type { RootTabParamList } from './types';

type IoniconName = ComponentProps<typeof Ionicons>['name'];

const TAB_ICONS: Record<
  keyof RootTabParamList,
  { active: IoniconName; inactive: IoniconName }
> = {
  HomeTab: { active: 'home', inactive: 'home-outline' },
  MyAdsTab: { active: 'pricetags', inactive: 'pricetags-outline' },
  MessagesTab: { active: 'chatbubble', inactive: 'chatbubble-outline' },
  ProfileTab: { active: 'person', inactive: 'person-outline' },
};

const Tab = createBottomTabNavigator<RootTabParamList>();

// Every tab is reachable without logging in — gating happens per action inside
// each stack (contact/report/post-ad), not at the navigation level. See app.md.
export function RootTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.brand[700],
        tabBarInactiveTintColor: colors.neutral[400],
        tabBarStyle: {
          backgroundColor: colors.surfaceCard,
          borderTopColor: colors.border,
        },
        tabBarLabelStyle: {
          fontFamily: fontFamily.textMedium,
          fontSize: 11,
        },
        tabBarIcon: ({ color, size, focused }) => (
          <Ionicons
            name={TAB_ICONS[route.name][focused ? 'active' : 'inactive']}
            color={color}
            size={size}
          />
        ),
      })}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeStack}
        options={{ title: 'Home' }}
      />
      <Tab.Screen
        name="MyAdsTab"
        component={MyAdsStack}
        options={{ title: 'My Ads' }}
      />
      <Tab.Screen
        name="MessagesTab"
        component={MessagesStack}
        options={{ title: 'Messages' }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileStack}
        options={{ title: 'Profile' }}
      />
    </Tab.Navigator>
  );
}
