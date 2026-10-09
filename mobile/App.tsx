import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { NavigationContainer } from '@react-navigation/native';
import { QueryClientProvider } from '@tanstack/react-query';
// Imported per weight, not from the package roots: those re-export every
// weight and italic in the family, and Metro then bundles ~9MB of unused TTFs
// into the APK.
import { BricolageGrotesque_600SemiBold } from '@expo-google-fonts/bricolage-grotesque/600SemiBold';
import { BricolageGrotesque_700Bold } from '@expo-google-fonts/bricolage-grotesque/700Bold';
import { Inter_400Regular } from '@expo-google-fonts/inter/400Regular';
import { Inter_500Medium } from '@expo-google-fonts/inter/500Medium';
import { Inter_600SemiBold } from '@expo-google-fonts/inter/600SemiBold';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { ActivityIndicator, PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { queryClient } from './src/api/query-client';
import { ErrorBoundary } from './src/components/error-boundary';
import { OfflineBanner } from './src/components/offline-banner';
import { AuthProvider, useAuth } from './src/features/auth/auth-context';
import { NotificationsProvider } from './src/features/notifications/notifications-context';
import { RootTabs } from './src/navigation/root-tabs';
import { combinedTheme } from './src/theme/navigation-theme';

SplashScreen.preventAutoHideAsync().catch(() => {
  // Rejects if the splash screen is already gone. Nothing to recover from,
  // and it must never surface as an unhandled rejection at module load.
});

export default function App() {
  const [fontsLoaded, fontError] = useFonts({
    BricolageGrotesque_600SemiBold,
    BricolageGrotesque_700Bold,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
  });

  // Either outcome ends the wait: a font that failed to load would otherwise
  // pin the app on the splash screen forever.
  const fontsSettled = fontsLoaded || fontError !== null;

  useEffect(() => {
    if (fontsSettled) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [fontsSettled]);

  // Hold first paint until both font families are ready, so headings never
  // flash in the OS default font before swapping to Bricolage Grotesque.
  // On a load failure the app renders anyway, in the OS default font.
  if (!fontsSettled) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <PaperProvider
        theme={combinedTheme}
        settings={{ icon: (props) => <MaterialCommunityIcons {...props} /> }}
      >
        <View style={styles.flex}>
          <OfflineBanner />
          <ErrorBoundary>
            <QueryClientProvider client={queryClient}>
              <AuthProvider>
                <NotificationsProvider>
                  <AppContent />
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
function AppContent() {
  const { isRestoring } = useAuth();

  if (isRestoring) {
    return (
      <View
        style={[
          styles.loadingContainer,
          { backgroundColor: combinedTheme.colors.background },
        ]}
      >
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <NavigationContainer theme={combinedTheme}>
      <RootTabs />
      {/* The status bar area is black on Android, so it needs light icons. */}
      <StatusBar style={Platform.OS === 'android' ? 'light' : 'dark'} />
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
