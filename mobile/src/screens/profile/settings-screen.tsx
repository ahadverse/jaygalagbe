import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import {
  Button,
  Divider,
  HelperText,
  Text,
  TextInput,
  useTheme,
} from 'react-native-paper';

import { ApiError } from '../../api/errors';
import { updateProfile } from '../../features/auth/api';
import { useAuth } from '../../features/auth/auth-context';
import { formatRelativeTime } from '../../lib/format';

// Mirrors web/src/app/dashboard/settings/page.tsx's three panels exactly:
// Profile (editable), Account (read-only), Session (logout). Deliberately
// no password-change/notification-preference fields or delete-account UI -
// web doesn't have them either (see app.md's Settings note / research: no
// web precedent exists for account deletion).
export function SettingsScreen() {
  const { user, setUser, logout } = useAuth();
  const theme = useTheme();
  const [name, setName] = useState(user?.name ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [phone, setPhone] = useState(user?.phone ?? '');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [saving, setSaving] = useState(false);

  if (!user) return null;

  async function save() {
    setError(null);
    setSuccess(false);
    if (name.trim().length < 2) {
      setError('Enter your full name.');
      return;
    }
    if (!email.trim() && !phone.trim()) {
      setError('Keep at least an email or a phone number on file.');
      return;
    }
    setSaving(true);
    try {
      const updated = await updateProfile({
        name: name.trim(),
        email: email.trim() || undefined,
        phone: phone.trim() || undefined,
      });
      setUser(updated);
      setSuccess(true);
    } catch (cause) {
      setError(
        cause instanceof ApiError
          ? cause.message
          : "Couldn't save your profile.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.section}>
        <Text variant="titleMedium">Profile</Text>
        <Text
          variant="bodySmall"
          style={{ color: theme.colors.onSurfaceVariant }}
        >
          Shown on your listings and messages.
        </Text>
        <TextInput
          mode="outlined"
          label="Full name"
          value={name}
          onChangeText={setName}
        />
        <TextInput
          mode="outlined"
          label="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <TextInput
          mode="outlined"
          label="Phone"
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
        />
        {error ? (
          <HelperText type="error" visible>
            {error}
          </HelperText>
        ) : null}
        {success ? (
          <HelperText type="info" visible>
            Profile updated.
          </HelperText>
        ) : null}
        <Button
          mode="contained"
          onPress={save}
          loading={saving}
          disabled={saving}
        >
          Save changes
        </Button>
      </View>

      <Divider />

      <View style={styles.section}>
        <Text variant="titleMedium">Account</Text>
        <View style={styles.row}>
          <Text style={{ color: theme.colors.onSurfaceVariant }}>
            Member since
          </Text>
          <Text>{formatRelativeTime(user.createdAt)}</Text>
        </View>
        <View style={styles.row}>
          <Text style={{ color: theme.colors.onSurfaceVariant }}>
            Verification
          </Text>
          <Text>{user.isVerified ? 'Verified' : 'Not verified yet'}</Text>
        </View>
      </View>

      <Divider />

      <View style={styles.section}>
        <Text variant="titleMedium">Session</Text>
        <Text
          variant="bodySmall"
          style={{ color: theme.colors.onSurfaceVariant }}
        >
          Signing out clears this device&apos;s session only.
        </Text>
        <Button mode="outlined" onPress={logout}>
          Log out
        </Button>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    gap: 20,
  },
  section: {
    gap: 10,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});
