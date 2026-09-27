import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { NavigationContainer } from '@react-navigation/native';
import { QueryClientProvider } from '@tanstack/react-query';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, useColorScheme, View } from 'react-native';
import { ActivityIndicator, PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { queryClient } from './src/api/query-client';
import { AuthProvider, useAuth } from './src/features/auth/auth-context';
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
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <AppContent theme={theme} isDark={isDark} />
          </AuthProvider>
        </QueryClientProvider>
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
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
