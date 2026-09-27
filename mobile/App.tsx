import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { NavigationContainer } from '@react-navigation/native';
import { QueryClientProvider } from '@tanstack/react-query';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, useColorScheme, View } from 'react-native';
import { ActivityIndicator, PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { queryClient } from './src/api/query-client';
import { ErrorBoundary } from './src/components/error-boundary';
import { OfflineBanner } from './src/components/offline-banner';
import { AuthProvider, useAuth } from './src/features/auth/auth-context';
import { NotificationsProvider } from './src/features/notifications/notifications-context';
import { RootTabs } from './src/navigation/root-tabs';
import {
  combinedDarkTheme,
  combinedLightTheme,
} from './src/theme/navigation-theme';

type Theme = typeof combinedLightTheme;

export default function App() {
  const isDark = useColorScheme() === 'dark';
  const theme = isDark ? combinedDarkTheme : combinedLightTheme;

  return (
    <SafeAreaProvider>
      <PaperProvider
        theme={theme}
        settings={{ icon: (props) => <MaterialCommunityIcons {...props} /> }}
      >
        <View style={styles.flex}>
          <OfflineBanner />
          <ErrorBoundary>
            <QueryClientProvider client={queryClient}>
              <AuthProvider>
                <NotificationsProvider>
                  <AppContent theme={theme} isDark={isDark} />
                </NotificationsProvider>
              </AuthProvider>
            </QueryClientProvider>
          </ErrorBoundary>
        </View>
      </PaperProvider>
    </SafeAreaProvider>
  );
}

// Split out so it can read auth state from inside AuthProvider: the app
// stays on a loading screen until the boot-time session restore (commit 70)
// resolves, instead of flashing a logged-out Profile tab first.
function AppContent({ theme, isDark }: { theme: Theme; isDark: boolean }) {
  const { isRestoring } = useAuth();

  if (isRestoring) {
    return (
      <View
        style={[
          styles.loadingContainer,
          { backgroundColor: theme.colors.background },
        ]}
      >
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <NavigationContainer theme={theme}>
      <RootTabs />
      <StatusBar style={isDark ? 'light' : 'dark'} />
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
