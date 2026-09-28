import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import {
  Button,
  Dialog,
  HelperText,
  Portal,
  RadioButton,
  Text,
  TextInput,
} from 'react-native-paper';

import { ApiError } from '../../api/errors';
import { useAuth } from '../../features/auth/auth-context';
import type { AdStatus } from '../../features/ads/types';
import { reportAd } from '../../features/reports/api';
import {
  REPORT_NOTE_MAX,
  REPORT_REASONS,
  type ReportReasonCode,
} from '../../features/reports/types';
import { colors, radius } from '../../theme/tokens';

// Mirrors web/src/components/ads/report-ad-button.tsx.
export function ReportAdButton({
  adId,
  ownerId,
  status,
  onRequireAuth,
}: {
  adId: string;
  ownerId: string;
  status: AdStatus;
  onRequireAuth: () => void;
}) {
  const { user } = useAuth();
  const [visible, setVisible] = useState(false);
  const [reasonCode, setReasonCode] = useState<ReportReasonCode | undefined>();
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  if (status !== 'LIVE' || user?.id === ownerId) {
    return null;
  }

  if (!user) {
    return (
      <Button
        mode="text"
        icon="flag-outline"
        textColor={colors.neutral[600]}
        rippleColor={colors.danger[50]}
        style={styles.trigger}
        onPress={onRequireAuth}
      >
        Log in to report this listing
      </Button>
    );
  }

  function reset() {
    setVisible(false);
    setReasonCode(undefined);
    setNote('');
    setError(null);
    setSuccess(false);
  }

  async function submit() {
    if (!reasonCode) {
      setError('Pick a reason for the report.');
      return;
    }
    if (reasonCode === 'OTHER' && !note.trim()) {
      setError('Tell us what is wrong so our team can look into it.');
      return;
    }
    if (note.length > REPORT_NOTE_MAX) {
      setError('Keep the details under 500 characters.');
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await reportAd(adId, { reasonCode, note: note.trim() || undefined });
      setSuccess(true);
    } catch (cause) {
      setError(
        cause instanceof ApiError
          ? cause.message
          : "Couldn't reach the server. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <Button
        mode="text"
        icon="flag-outline"
        textColor={colors.neutral[600]}
        rippleColor={colors.danger[50]}
        style={styles.trigger}
        onPress={() => setVisible(true)}
      >
        Report this listing
      </Button>
      <Portal>
        <Dialog visible={visible} onDismiss={reset} style={styles.dialog}>
          <Dialog.Title>Report this listing</Dialog.Title>
          <Dialog.Content>
            {success ? (
              <Text variant="bodyMedium">
                Report sent. Our moderators will review this listing. You will
                not be told who reported it, and the advertiser is not shown
                your name.
              </Text>
            ) : (
              <View style={styles.form}>
                <Text variant="titleSmall">
                  What is wrong with this listing?
                </Text>
                <RadioButton.Group
                  value={reasonCode ?? ''}
                  onValueChange={(value) =>
                    setReasonCode(value as ReportReasonCode)
                  }
                >
                  {REPORT_REASONS.map((reason) => (
                    <RadioButton.Item
                      key={reason.code}
                      label={reason.label}
                      value={reason.code}
                      position="leading"
                      style={[
                        styles.reason,
                        reasonCode === reason.code
                          ? styles.reasonSelected
                          : null,
                      ]}
                      labelStyle={styles.reasonLabel}
                    />
                  ))}
                </RadioButton.Group>
                <TextInput
                  mode="outlined"
                  label={
                    reasonCode === 'OTHER'
                      ? 'What happened?'
                      : 'Anything to add? (optional)'
                  }
                  value={note}
                  onChangeText={setNote}
                  multiline
                  maxLength={REPORT_NOTE_MAX}
                  style={styles.input}
                />
                <HelperText type={error ? 'error' : 'info'} visible>
                  {error ??
                    'Reports go to our moderation team only. Misusing this to harass an advertiser can get your own account suspended.'}
                </HelperText>
              </View>
            )}
          </Dialog.Content>
          <Dialog.Actions>
            {success ? (
              <Button
                mode="outlined"
                rippleColor={colors.brand[100]}
                style={styles.pillButton}
                onPress={reset}
              >
                Close
              </Button>
            ) : (
              /* Web submits this one as its danger variant - the action is
               * destructive for the advertiser, not a brand CTA. */
              <Button
                mode="contained"
                buttonColor={colors.danger[600]}
                textColor="#ffffff"
                style={styles.pillButton}
                onPress={submit}
                loading={submitting}
                disabled={submitting}
              >
                Send report
              </Button>
            )}
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </>
  );
}

const styles = StyleSheet.create({
  form: {
    gap: 8,
  },
  trigger: {
    alignSelf: 'stretch',
    borderRadius: radius.full,
  },
  dialog: {
    borderRadius: radius.xl,
  },
  reason: {
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 4,
    marginBottom: 6,
  },
  reasonSelected: {
    borderColor: colors.brand[300],
    backgroundColor: colors.brand[50],
  },
  reasonLabel: {
    textAlign: 'left',
  },
  input: {
    backgroundColor: colors.surfaceCard,
  },
  pillButton: {
    borderRadius: radius.full,
  },
});
