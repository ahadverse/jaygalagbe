import type { NavigatorScreenParams } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import type { SectorSlug } from '../features/ads/sectors';

export type HomeStackParamList = {
  Home: undefined;
  // Destination screen for the home screen's search bar / popular-location
  // chips - a PlaceholderScreen until the real search & filters UI lands
  // (commit 72), same forward-reference pattern as ProfileStack's Login
  // screen was before commit 69.
  SectorListing: { sector: SectorSlug; location?: string };
};

export type HomeStackScreenProps<T extends keyof HomeStackParamList> =
  NativeStackScreenProps<HomeStackParamList, T>;

export type MyAdsStackParamList = {
  MyAds: undefined;
};

export type MessagesStackParamList = {
  Messages: undefined;
};

// Login/Register live inside the Profile stack rather than a separate
// top-level auth stack, since there's no login wall - they're one of
// possibly several places (see commits 76-78) that will present them.
export type ProfileStackParamList = {
  Profile: undefined;
  Login: undefined;
  Register: undefined;
};

export type ProfileStackScreenProps<T extends keyof ProfileStackParamList> =
  NativeStackScreenProps<ProfileStackParamList, T>;

// Tab route names carry a "Tab" suffix so they never collide with a nested
// stack's own screen names once deep links start targeting specific screens.
export type RootTabParamList = {
  HomeTab: NavigatorScreenParams<HomeStackParamList>;
  MyAdsTab: NavigatorScreenParams<MyAdsStackParamList>;
  MessagesTab: NavigatorScreenParams<MessagesStackParamList>;
  ProfileTab: NavigatorScreenParams<ProfileStackParamList>;
};
