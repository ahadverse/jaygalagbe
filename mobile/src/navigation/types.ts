import type { NavigatorScreenParams } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import type { SectorSlug } from '../features/ads/sectors';

export type HomeStackParamList = {
  Home: undefined;
  SectorListing: { sector: SectorSlug; location?: string };
  AdDetail: { adId: string };
};

export type HomeStackScreenProps<T extends keyof HomeStackParamList> =
  NativeStackScreenProps<HomeStackParamList, T>;

export type MyAdsStackParamList = {
  MyAds: undefined;
  // adId absent = create, present = edit.
  AdForm: { adId?: string } | undefined;
  Boost: { adId: string };
  AdStats: { adId: string };
};

export type MyAdsStackScreenProps<T extends keyof MyAdsStackParamList> =
  NativeStackScreenProps<MyAdsStackParamList, T>;

export type MessagesStackParamList = {
  Messages: undefined;
  ChatThread: { conversationId: string };
};

export type MessagesStackScreenProps<T extends keyof MessagesStackParamList> =
  NativeStackScreenProps<MessagesStackParamList, T>;

// Login/Register live inside the Profile stack rather than a separate
// top-level auth stack, since there's no login wall - guest actions
// elsewhere (contact-gate, report-ad) reach these through the parent tab
// navigator (see ad-detail-screen.tsx's requireAuth()).
export type ProfileStackParamList = {
  Profile: undefined;
  Login: undefined;
  Register: undefined;
  Saved: undefined;
  Reviews: undefined;
  Notifications: undefined;
  Settings: undefined;
  AdDetail: { adId: string };
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
