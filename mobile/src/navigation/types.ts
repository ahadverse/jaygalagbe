import type { NavigatorScreenParams } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

export type HomeStackParamList = {
  Home: undefined;
};

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
