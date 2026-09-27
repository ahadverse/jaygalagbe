import NetInfo from '@react-native-community/netinfo';
import {
  QueryClient,
  focusManager,
  onlineManager,
} from '@tanstack/react-query';
import { AppState } from 'react-native';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // The backend has no realtime invalidation for ad listings, so a short
      // staleTime avoids refetching on every tab focus while still catching
      // new/boosted ads reasonably soon.
      staleTime: 60_000,
      retry: 1,
    },
  },
});

// TanStack Query's defaults assume a browser (`navigator.onLine`, a `focus`
// DOM event) - neither exists on React Native, so without this wiring
// queries never pause while offline and never refetch when the app returns
// to the foreground. Per TanStack's React Native guide:
// https://tanstack.com/query/latest/docs/framework/react/react-native
onlineManager.setEventListener((setOnline) => {
  return NetInfo.addEventListener((state) => setOnline(!!state.isConnected));
});

focusManager.setEventListener((handleFocus) => {
  const subscription = AppState.addEventListener('change', (status) => {
    handleFocus(status === 'active');
  });
  return () => subscription.remove();
});
