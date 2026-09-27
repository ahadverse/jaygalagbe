import Constants from 'expo-constants';

import { registerFcmToken, unregisterFcmToken } from '../auth/api';

// Expo Go dropped Android remote-push support in SDK 53 - merely importing
// expo-notifications and calling setNotificationHandler() throws immediately
// there (confirmed on-device: it crashed the whole app at boot, before any
// login, since that call used to run unconditionally at module load). A real
// expo-dev-client build still supports push fine, so the import itself has
// to be conditional, not just the calls inside it.
//
// `appOwnership` is deprecated in favor of `executionEnvironment`, but it's
// the only field that identifies classic Expo Go specifically -
// `executionEnvironment` lumps Expo Go and a dev-client build together under
// `storeClient`, which would wrongly disable push in a real dev-client too.
const isExpoGo = Constants.appOwnership === 'expo';

if (!isExpoGo) {
  void import('expo-notifications').then((Notifications) => {
    // Account-activity and message alerts are delivered live over the
    // sockets in notifications-context.tsx while the app is open - this
    // handler only governs how a system push (once task 34f ships a real
    // sender) shows up.
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowBanner: true,
        shouldShowList: true,
        shouldPlaySound: false,
        shouldSetBadge: false,
      }),
    });
  });
}

// Registers this device's native FCM token against the backend's fcmToken
// field so a future push sender (app.md task 34f) has somewhere to send to.
// Best-effort throughout: push isn't wired up server-side yet (no sender
// reads this column today), and a device without Google Play services / FCM
// config simply won't produce a token - neither case should block login.
export async function registerPushToken(): Promise<void> {
  if (isExpoGo) return;
  try {
    const Notifications = await import('expo-notifications');
    const existing = await Notifications.getPermissionsAsync();
    let status = existing.status;
    if (status !== 'granted') {
      const requested = await Notifications.requestPermissionsAsync();
      status = requested.status;
    }
    if (status !== 'granted') return;

    const { data } = await Notifications.getDevicePushTokenAsync();
    await registerFcmToken(String(data));
  } catch {
    // See above - push registration is best-effort.
  }
}

export async function clearPushToken(): Promise<void> {
  try {
    await unregisterFcmToken();
  } catch {
    // Best-effort - see registerPushToken().
  }
}
