import { QueryClient } from '@tanstack/react-query';

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
