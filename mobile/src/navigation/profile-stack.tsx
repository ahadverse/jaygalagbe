import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { useAuth } from '../features/auth/auth-context';
import { LoginScreen } from '../screens/auth/login-screen';
import { RegisterScreen } from '../screens/auth/register-screen';
import { AdDetailScreen } from '../screens/home/ad-detail-screen';
import { AboutScreen } from '../screens/info/about-screen';
import { ContactScreen } from '../screens/info/contact-screen';
import { FounderScreen } from '../screens/info/founder-screen';
import { PrivacyScreen } from '../screens/info/privacy-screen';
import { TermsScreen } from '../screens/info/terms-screen';
import { NotificationsScreen } from '../screens/profile/notifications-screen';
import { ProfileScreen } from '../screens/profile/profile-screen';
import { ReviewsScreen } from '../screens/profile/reviews-screen';
import { SavedScreen } from '../screens/profile/saved-screen';
import { SettingsScreen } from '../screens/profile/settings-screen';
import { defaultStackScreenOptions } from './screen-options';
import type { ProfileStackParamList } from './types';

const Stack = createNativeStackNavigator<ProfileStackParamList>();

// No login wall elsewhere in the app, but the Profile tab itself has nothing
// to show a guest except the door in - so it's Login/Register directly here.
export function ProfileStack() {
  const { user } = useAuth();

  return (
    <Stack.Navigator screenOptions={defaultStackScreenOptions}>
      {user ? (
        <>
          <Stack.Screen
            name="Profile"
            component={ProfileScreen}
            options={{ title: 'Profile' }}
          />
          <Stack.Screen
            name="Saved"
            component={SavedScreen}
            options={{ title: 'Saved & viewed' }}
          />
          <Stack.Screen
            name="Reviews"
            component={ReviewsScreen}
            options={{ title: 'Reviews' }}
          />
          <Stack.Screen
            name="Notifications"
            component={NotificationsScreen}
            options={{ title: 'Notifications' }}
          />
          <Stack.Screen
            name="Settings"
            component={SettingsScreen}
            options={{ title: 'Settings' }}
          />
          <Stack.Screen
            name="AdDetail"
            component={AdDetailScreen}
            options={{ title: 'Listing' }}
          />
        </>
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

      {/* Outside the auth branch on purpose: a guest has to be able to read
       * the privacy policy, and the home footer links here from a tab that
       * knows nothing about whether anyone is logged in. */}
      <Stack.Screen
        name="About"
        component={AboutScreen}
        options={{ title: 'About' }}
      />
      <Stack.Screen
        name="Founder"
        component={FounderScreen}
        options={{ title: 'Meet the Founder' }}
      />
      <Stack.Screen
        name="Contact"
        component={ContactScreen}
        options={{ title: 'Contact Us' }}
      />
      <Stack.Screen
        name="Privacy"
        component={PrivacyScreen}
        options={{ title: 'Privacy Policy' }}
      />
      <Stack.Screen
        name="Terms"
        component={TermsScreen}
        options={{ title: 'Terms and Conditions' }}
      />
    </Stack.Navigator>
  );
}
