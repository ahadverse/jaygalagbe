import { StyleSheet, Text, View, type ViewStyle } from 'react-native';

import { colors, fontFamily, radius } from '../../theme/tokens';
import { BrandCard } from '../brand/brand-card';
import { Eyebrow } from '../brand/eyebrow';
import { DashboardIcon, type DashboardIconName } from './icons';

export type StatCardTone =
  'default' | 'info' | 'accent' | 'success' | 'warning';

// web/src/components/dashboard/stat-card.tsx's toneVariants, one for one -
// the -50 fill under the icon and the -600/-700 stroke on it.
const TONE: Record<StatCardTone, { background: string; foreground: string }> = {
  default: { background: colors.brand[50], foreground: colors.brand[600] },
  accent: { background: colors.accent[50], foreground: colors.accent[600] },
  success: { background: colors.success[50], foreground: colors.success[700] },
  info: { background: colors.info[50], foreground: colors.info[700] },
  warning: { background: colors.warning[50], foreground: colors.warning[700] },
};

/** The richer sibling of brand-card's StatTile: an icon, a tone and a hint line. */
export function StatCard({
  label,
  value,
  hint,
  icon,
  tone = 'default',
  style,
}: {
  label: string;
  value: string;
  hint?: string;
  icon?: DashboardIconName;
  tone?: StatCardTone;
  style?: ViewStyle;
}) {
  const { background, foreground } = TONE[tone];

  return (
    <BrandCard
      variant="card"
      radius="lg"
      style={style ? [styles.card, style] : styles.card}
    >
      <View style={styles.header}>
        <Eyebrow style={styles.label}>{label}</Eyebrow>
        {icon ? (
          <View style={[styles.iconChip, { backgroundColor: background }]}>
            <DashboardIcon name={icon} color={foreground} />
          </View>
        ) : null}
      </View>
      <Text style={styles.value}>{value}</Text>
      {hint ? (
        <Text style={styles.hint} numberOfLines={2}>
          {hint}
        </Text>
      ) : null}
    </BrandCard>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 14,
    gap: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  label: {
    flexShrink: 1,
  },
  iconChip: {
    width: 30,
    height: 30,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  value: {
    fontFamily: fontFamily.display,
    fontSize: 22,
    letterSpacing: -0.4,
    color: colors.neutral[900],
    fontVariant: ['tabular-nums'],
  },
  hint: {
    fontFamily: fontFamily.text,
    fontSize: 11.5,
    lineHeight: 15,
    color: colors.neutral[500],
  },
});
