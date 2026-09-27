import { StyleSheet, View } from 'react-native';
import { Card, Text, useTheme } from 'react-native-paper';

import type { Ad } from '../../features/ads/types';
import { formatPrice, formatRelativeTime } from '../../lib/format';

const SECTOR_LABEL: Record<Ad['sector'], string> = {
  LAND: 'Land for sale',
  HOUSE_RENT: 'For rent',
};

// Shared by the home screen's latest listings, the sector listing screen,
// and nearby-listings on the ad detail screen.
export function AdCard({ ad, onPress }: { ad: Ad; onPress?: () => void }) {
  const theme = useTheme();
  const posted = formatRelativeTime(ad.createdAt);

  return (
    <Card style={styles.card} mode="elevated" onPress={onPress}>
      {ad.photos[0] ? <Card.Cover source={{ uri: ad.photos[0] }} /> : null}
      <Card.Content style={styles.content}>
        <Text
          variant="labelSmall"
          style={[styles.sectorLabel, { color: theme.colors.onSurfaceVariant }]}
        >
          {SECTOR_LABEL[ad.sector]}
        </Text>
        <Text variant="titleMedium" numberOfLines={2}>
          {ad.title}
        </Text>
        <Text
          variant="bodySmall"
          numberOfLines={1}
          style={{ color: theme.colors.onSurfaceVariant }}
        >
          {ad.locationArea}, {ad.locationDistrict}
        </Text>
        <View style={styles.footer}>
          <Text variant="titleMedium" style={{ color: theme.colors.primary }}>
            {formatPrice(ad.price)}
          </Text>
          {posted ? (
            <Text
              variant="bodySmall"
              style={{ color: theme.colors.onSurfaceVariant }}
            >
              {posted}
            </Text>
          ) : null}
        </View>
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 12,
  },
  content: {
    paddingTop: 12,
    gap: 4,
  },
  sectorLabel: {
    textTransform: 'uppercase',
  },
  footer: {
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
});
