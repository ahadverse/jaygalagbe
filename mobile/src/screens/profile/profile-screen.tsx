import { StyleSheet, View } from 'react-native';
import { Button, Text } from 'react-native-paper';

import { useAuth } from '../../features/auth/auth-context';

// Full dashboard/settings content lands in commits 83 and 88 - this just
// proves the signed-in state is real end to end.
export function ProfileScreen() {
  const { user, logout } = useAuth();

  return (
    <View style={styles.container}>
      <Text variant="headlineSmall">Signed in as {user?.name}</Text>
      <Button mode="outlined" onPress={logout} style={styles.logoutButton}>
        Log out
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 16,
  },
  logoutButton: {
    marginTop: 8,
  },
});
