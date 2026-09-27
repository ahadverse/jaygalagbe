import type { NavigatorScreenParams } from '@react-navigation/native';

export type HomeStackParamList = {
  Home: undefined;
};

export type MyAdsStackParamList = {
  MyAds: undefined;
};

export type MessagesStackParamList = {
  Messages: undefined;
};

export type ProfileStackParamList = {
  Profile: undefined;
};

// Tab route names carry a "Tab" suffix so they never collide with a nested
// stack's own screen names once deep links start targeting specific screens.
export type RootTabParamList = {
  HomeTab: NavigatorScreenParams<HomeStackParamList>;
  MyAdsTab: NavigatorScreenParams<MyAdsStackParamList>;
  MessagesTab: NavigatorScreenParams<MessagesStackParamList>;
  ProfileTab: NavigatorScreenParams<ProfileStackParamList>;
};
