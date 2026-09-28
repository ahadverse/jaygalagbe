import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, fontFamily, radius, shadow } from '../../theme/tokens';

// Ports web/src/components/messaging/conversation-card.tsx: a white sheet with
// a hairline ring, a brand-tinted initial avatar, and an unread state that
// switches the ring to brand-200 over a brand-tinted fill. The dot is crimson
// accent, not brand - web reserves accent for things asking for attention.
export function ConversationCard({
  name,
  adTitle,
  preview,
  timestamp,
  unread,
  onPress,
}: {
  name: string;
  adTitle: string;
  preview?: string;
  timestamp?: string;
  unread?: boolean;
  onPress?: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        unread ? styles.cardUnread : null,
        pressed ? styles.cardPressed : null,
      ]}
    >
      <View style={styles.avatar}>
        <Text style={styles.avatarInitial}>
          {name.trim().charAt(0).toUpperCase()}
        </Text>
        {unread ? <View style={styles.unreadDot} /> : null}
      </View>

      <View style={styles.body}>
        <View style={styles.headRow}>
          <Text style={styles.name} numberOfLines={1}>
            {name}
          </Text>
          {timestamp ? <Text style={styles.timestamp}>{timestamp}</Text> : null}
        </View>

        <Text style={styles.adTitle} numberOfLines={1}>
          {adTitle}
        </Text>

        <Text
          style={[styles.preview, unread ? styles.previewUnread : null]}
          numberOfLines={1}
        >
          {preview ?? 'No messages yet'}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 13,
    padding: 14,
    marginBottom: 10,
    borderRadius: radius.xl,
    backgroundColor: colors.surfaceCard,
    borderWidth: 1,
    borderColor: 'rgba(22,18,15,0.05)',
    ...shadow('sm'),
  },
  cardUnread: {
    // Web tints this fill at 40% over white; at that strength the row reads as
    // plain white on a phone screen, so the token goes in undiluted.
    backgroundColor: colors.brand[50],
    borderColor: colors.brand[200],
  },
  cardPressed: {
    opacity: 0.92,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: radius.full,
    backgroundColor: colors.brand[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: {
    fontFamily: fontFamily.display,
    fontSize: 15,
    color: colors.brand[800],
  },
  unreadDot: {
    position: 'absolute',
    top: -1,
    right: -1,
    width: 11,
    height: 11,
    borderRadius: radius.full,
    backgroundColor: colors.accent[600],
    borderWidth: 2,
    borderColor: colors.surfaceCard,
  },
  body: {
    flex: 1,
    gap: 2,
  },
  headRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  name: {
    flex: 1,
    fontFamily: fontFamily.displaySemibold,
    fontSize: 14.5,
    letterSpacing: -0.2,
    color: colors.neutral[900],
  },
  timestamp: {
    fontFamily: fontFamily.text,
    fontSize: 11,
    color: colors.neutral[500],
  },
  adTitle: {
    fontFamily: fontFamily.text,
    fontSize: 11.5,
    color: colors.neutral[500],
  },
  preview: {
    fontFamily: fontFamily.text,
    fontSize: 13,
    color: colors.neutral[600],
  },
  previewUnread: {
    fontFamily: fontFamily.textMedium,
    color: colors.neutral[900],
  },
});
