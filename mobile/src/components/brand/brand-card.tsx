import type { ReactNode } from 'react';
import { StyleSheet, Text, View, type ViewStyle } from 'react-native';

import { colors, fontFamily, radius, shadow } from '../../theme/tokens';

type Variant = 'card' | 'sunken' | 'danger' | 'warning';

// The two surfaces web's layout is built from: `card` is the white sheet that
// floats on the paper canvas (web: rounded-xl bg-card shadow-sm ring-1), and
// `sunken` is the flat tinted fill used for inset boxes. The tone variants
// cover web's semantic notice boxes.
export function BrandCard({
  variant = 'card',
  // Web's Card base is `rounded-xl`, which Tailwind resolves against web's own
  // --radius-xl (1.375rem) - 22px, not Tailwind's stock 12px.
  radius: cornerRadius = 'xl',
  style,
  children,
}: {
  variant?: Variant;
  radius?: keyof typeof radius;
  style?: ViewStyle | ViewStyle[];
  children: ReactNode;
}) {
  return (
    <View
      style={[
        styles.base,
        { borderRadius: radius[cornerRadius] },
        VARIANT_STYLES[variant],
        style,
      ]}
    >
      {children}
    </View>
  );
}

const VARIANT_STYLES: Record<Variant, ViewStyle> = {
  card: {
    backgroundColor: colors.surfaceCard,
    borderWidth: 1,
    borderColor: 'rgba(22,18,15,0.05)', // web's ring-1 ring-neutral-900/5
    ...shadow('sm'),
  },
  sunken: {
    backgroundColor: colors.neutral[100],
  },
  danger: {
    backgroundColor: colors.danger[50],
    borderWidth: 1,
    borderColor: colors.danger[100],
  },
  warning: {
    backgroundColor: colors.warning[50],
    borderWidth: 1,
    borderColor: colors.warning[100],
  },
};

// Replaces the near-identical StatCard/StatTile functions that ad-stats-screen
// and profile-screen each defined locally. Mirrors web's stat-card.tsx: an
// eyebrow-style label over a large display-font number.
export function StatTile({
  label,
  value,
  style,
}: {
  label: string;
  value: string;
  style?: ViewStyle;
}) {
  return (
    <BrandCard variant="sunken" style={style}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
    </BrandCard>
  );
}

const styles = StyleSheet.create({
  base: {
    padding: 16,
  },
  statLabel: {
    fontFamily: fontFamily.textSemibold,
    fontSize: 11,
    lineHeight: 13,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: colors.neutral[600],
    marginBottom: 6,
  },
  statValue: {
    fontFamily: fontFamily.display,
    fontSize: 22,
    color: colors.neutral[900],
    letterSpacing: -0.4,
    fontVariant: ['tabular-nums'],
  },
});
