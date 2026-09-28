import { StyleSheet, Text, type TextStyle } from 'react-native';

import { colors, fontFamily } from '../../theme/tokens';

// Web's `eyebrow` utility (globals.css): the small uppercase letter-spaced
// label that sits above section headings across the site.
export function Eyebrow({
  children,
  style,
}: {
  children: string;
  style?: TextStyle;
}) {
  return <Text style={[styles.eyebrow, style]}>{children}</Text>;
}

const styles = StyleSheet.create({
  eyebrow: {
    fontFamily: fontFamily.textSemibold,
    fontSize: 11,
    lineHeight: 13,
    letterSpacing: 1.5, // web uses 0.14em, ~1.5px at this size
    textTransform: 'uppercase',
    color: colors.neutral[600],
  },
});
