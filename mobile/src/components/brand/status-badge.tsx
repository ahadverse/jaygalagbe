import { StyleSheet, Text, View, type ViewStyle } from 'react-native';

import type { AdStatus } from '../../features/ads/types';
import { colors, fontFamily, radius } from '../../theme/tokens';

type Tone = 'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'brand';

// Ports web/src/lib/ads/status.ts's AD_STATUS_BADGE, including its exact
// bg-{tone}-50 / text-{tone}-700 pairing.
const AD_STATUS_BADGE: Record<AdStatus, { label: string; tone: Tone }> = {
  LIVE: { label: 'Live', tone: 'success' },
  PENDING: { label: 'In review', tone: 'warning' },
  REJECTED: { label: 'Rejected', tone: 'danger' },
  SOLD: { label: 'Sold', tone: 'info' },
  REMOVED: { label: 'Removed', tone: 'neutral' },
};

const TONE_BG: Record<Tone, string> = {
  success: colors.success[50],
  warning: colors.warning[50],
  danger: colors.danger[50],
  info: colors.info[50],
  neutral: colors.neutral[100],
  brand: colors.brand[50],
};

const TONE_FG: Record<Tone, string> = {
  success: colors.success[700],
  warning: colors.warning[700],
  danger: colors.danger[700],
  info: colors.info[700],
  neutral: colors.neutral[600],
  brand: colors.brand[700],
};

export function StatusBadge({
  status,
  style,
}: {
  status: AdStatus;
  style?: ViewStyle;
}) {
  const { label, tone } = AD_STATUS_BADGE[status];
  return <Badge label={label} tone={tone} style={style} />;
}

// Web's badge.tsx recipe, reusable for the non-status pills screens need
// (sector labels, counts, filter tags).
export function Badge({
  label,
  tone = 'neutral',
  style,
}: {
  label: string;
  tone?: Tone;
  style?: ViewStyle;
}) {
  return (
    <View style={[styles.badge, { backgroundColor: TONE_BG[tone] }, style]}>
      <Text style={[styles.label, { color: TONE_FG[tone] }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderRadius: radius.full,
    paddingHorizontal: 10,
    paddingVertical: 4,
    alignSelf: 'flex-start',
  },
  label: {
    fontFamily: fontFamily.textSemibold,
    fontSize: 12,
    lineHeight: 16,
  },
});
