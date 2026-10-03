import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, fontFamily, radius } from '../../theme/tokens';
import { BrandCard } from '../brand/brand-card';

/** The single surface every dashboard block sits on (web: dashboard/panel.tsx). */
export function Panel({
  title,
  description,
  action,
  children,
}: {
  title?: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <BrandCard variant="card" radius="lg" style={styles.panel}>
      {title ? (
        <View style={styles.header}>
          <View style={styles.headerText}>
            <Text style={styles.title}>{title}</Text>
            {description ? (
              <Text style={styles.description}>{description}</Text>
            ) : null}
          </View>
          {action}
        </View>
      ) : null}
      <View style={styles.body}>{children}</View>
    </BrandCard>
  );
}

export function PanelNote({ children }: { children: ReactNode }) {
  return (
    <View style={styles.note}>
      <Text style={styles.noteText}>{children}</Text>
    </View>
  );
}

/** Web's `text-xs font-semibold text-primary` header link, as a tap target. */
export function PanelAction({
  label,
  onPress,
}: {
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      hitSlop={8}
      style={({ pressed }) => (pressed ? styles.actionPressed : null)}
    >
      <Text style={styles.actionLabel}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  panel: {
    // The header rule has to reach both edges, so the padding moves inside.
    padding: 0,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 13,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  headerText: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontFamily: fontFamily.display,
    fontSize: 15.5,
    letterSpacing: -0.3,
    color: colors.neutral[900],
  },
  description: {
    fontFamily: fontFamily.text,
    fontSize: 12,
    lineHeight: 16,
    color: colors.neutral[500],
  },
  body: {
    padding: 16,
  },
  note: {
    borderRadius: radius.md,
    backgroundColor: colors.neutral[100],
    paddingHorizontal: 16,
    paddingVertical: 26,
  },
  noteText: {
    fontFamily: fontFamily.text,
    fontSize: 13,
    lineHeight: 19,
    textAlign: 'center',
    color: colors.neutral[500],
  },
  actionLabel: {
    fontFamily: fontFamily.textSemibold,
    fontSize: 12.5,
    color: colors.brand[700],
  },
  actionPressed: {
    opacity: 0.6,
  },
});
