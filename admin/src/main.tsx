import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ApiError } from '@/lib/api/client';
import { AuthProvider } from '@/lib/auth/auth-provider';
import { PrefsProvider } from '@/lib/prefs/prefs-provider';
import { ToastProvider } from '@/components/ui/toast';
import { App } from './App';
import './index.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 15_000,
      refetchOnWindowFocus: false,
      // An expired or revoked token will never succeed on retry; anything
      // else gets one more attempt in case the API blipped.
      retry: (failureCount, error) =>
        error instanceof ApiError && error.status < 500
          ? false
          : failureCount < 1,
    },
  },
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <PrefsProvider>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <AuthProvider>
            <ToastProvider>
              <App />
            </ToastProvider>
          </AuthProvider>
        </BrowserRouter>
      </QueryClientProvider>
    </PrefsProvider>
  </StrictMode>,
);
