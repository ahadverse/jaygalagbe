import type { TextStyle } from 'react-native';

import { colors, fontFamily } from '../../theme/tokens';

// Series colors follow web/src/components/charts/palette.ts's assignment:
// impressions in soft brand, visits in brand, leads in accent.
export const chartSeries = {
  impressions: colors.brand[300],
  visits: colors.brand[600],
  leads: colors.accent[600],
} as const;

/** Web's chartColors.grid/.axis, which every chart paints its rules and ticks with. */
export const chartRuleColor = colors.neutral[300];

export const chartAxisTextStyle: TextStyle = {
  fontFamily: fontFamily.text,
  fontSize: 11,
  color: colors.neutral[500],
};
