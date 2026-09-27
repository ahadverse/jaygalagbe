import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { useAuth } from '../features/auth/auth-context';
import { LoginScreen } from '../screens/auth/login-screen';
import { RegisterScreen } from '../screens/auth/register-screen';
import { ProfileScreen } from '../screens/profile/profile-screen';
import type { ProfileStackParamList } from './types';

const Stack = createNativeStackNavigator<ProfileStackParamList>();

// No login wall elsewhere in the app, but the Profile tab itself has nothing
// to show a guest except the door in - so it's Login/Register directly here.
export function ProfileStack() {
  const { user } = useAuth();

  return (
    <Stack.Navigator>
      {user ? (
        <Stack.Screen
          name="Profile"
          component={ProfileScreen}
          options={{ title: 'Profile' }}
        />
      ) : (
        <>
          <Stack.Screen
            name="Login"
            component={LoginScreen}
            options={{ title: 'Log in' }}
          />
          <Stack.Screen
            name="Register"
            component={RegisterScreen}
            options={{ title: 'Create account' }}
          />
        </>
      )}
    </Stack.Navigator>
  );
}
