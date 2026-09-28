import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Button, HelperText, TextInput } from 'react-native-paper';

import { ApiError } from '../../api/errors';
import { BrandCard } from '../../components/brand/brand-card';
import { Eyebrow } from '../../components/brand/eyebrow';
import { updateProfile } from '../../features/auth/api';
import { useAuth } from '../../features/auth/auth-context';
import { formatRelativeTime } from '../../lib/format';
import { colors, fontFamily, radius } from '../../theme/tokens';

// Mirrors web/src/app/dashboard/settings/page.tsx's three panels exactly:
// Profile (editable), Account (read-only), Session (logout). Deliberately
// no password-change/notification-preference fields or delete-account UI -
// web doesn't have them either (see app.md's Settings note / research: no
// web precedent exists for account deletion).
export function SettingsScreen() {
  const { user, setUser, logout } = useAuth();
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
      <View style={styles.group}>
        <Eyebrow>Profile</Eyebrow>
        <Text style={styles.groupTitle}>How you appear</Text>
        <BrandCard variant="card" radius="lg" style={styles.card}>
          <Text style={styles.cardHint}>
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
            style={styles.saveButton}
            contentStyle={styles.buttonContent}
          >
            Save changes
          </Button>
        </BrandCard>
      </View>

      <View style={styles.group}>
        <Eyebrow>Account</Eyebrow>
        <Text style={styles.groupTitle}>Your standing</Text>
        <BrandCard variant="card" radius="lg">
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Member since</Text>
            <Text style={styles.rowValue}>
              {formatRelativeTime(user.createdAt)}
            </Text>
          </View>
          <View style={[styles.row, styles.rowDivided]}>
            <Text style={styles.rowLabel}>Verification</Text>
            <Text style={styles.rowValue}>
              {user.isVerified ? 'Verified' : 'Not verified yet'}
            </Text>
          </View>
        </BrandCard>
      </View>

      <View style={styles.group}>
        <Eyebrow>Session</Eyebrow>
        <Text style={styles.groupTitle}>Sign out</Text>
        <BrandCard variant="card" radius="lg" style={styles.card}>
          <Text style={styles.cardHint}>
            Signing out clears this device&apos;s session only.
          </Text>
          <Button
            mode="outlined"
            onPress={logout}
            textColor={colors.danger[600]}
            style={styles.logoutButton}
            contentStyle={styles.buttonContent}
          >
            Log out
          </Button>
        </BrandCard>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    gap: 24,
  },
  group: {
    gap: 4,
  },
  groupTitle: {
    fontFamily: fontFamily.display,
    fontSize: 19,
    letterSpacing: -0.4,
    color: colors.neutral[900],
    marginBottom: 10,
  },
  card: {
    gap: 12,
  },
  cardHint: {
    fontFamily: fontFamily.text,
    fontSize: 13,
    lineHeight: 19,
    color: colors.neutral[600],
  },
  saveButton: {
    borderRadius: radius.full,
    marginTop: 4,
  },
  logoutButton: {
    borderRadius: radius.full,
    borderColor: colors.danger[500],
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
  },
  buttonContent: {
    paddingVertical: 4,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 16,
    paddingVertical: 8,
  },
  rowDivided: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  rowLabel: {
    fontFamily: fontFamily.text,
    fontSize: 14,
    color: colors.neutral[600],
  },
  rowValue: {
    fontFamily: fontFamily.textSemibold,
    fontSize: 14,
    color: colors.neutral[900],
  },
});
