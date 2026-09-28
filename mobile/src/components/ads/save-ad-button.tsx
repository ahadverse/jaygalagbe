import { StyleSheet } from 'react-native';
import { Button } from 'react-native-paper';

import { toggleSavedAd, useSavedAdIds } from '../../features/ads/local-lists';
import { colors, radius } from '../../theme/tokens';

// Mirrors web/src/components/ads/save-ad-button.tsx: saving is pure
// device-local storage, no auth required, works identically for guests and
// logged-in users.
export function SaveAdButton({ adId }: { adId: string }) {
  const savedIds = useSavedAdIds();
  const saved = savedIds.includes(adId);

  return (
    <Button
      mode={saved ? 'contained-tonal' : 'outlined'}
      icon={saved ? 'bookmark' : 'bookmark-outline'}
      rippleColor={colors.brand[100]}
      style={[styles.button, saved ? styles.saved : styles.unsaved]}
      onPress={() => toggleSavedAd(adId)}
    >
      {saved ? 'Saved to your list' : 'Save this ad'}
    </Button>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: radius.full,
  },
  // Web's saved state is an outline button tinted brand-50 with a brand-300
  // edge; contained-tonal already supplies the fill, only the edge is missing.
  saved: {
    borderWidth: 1,
    borderColor: colors.brand[300],
  },
  unsaved: {
    backgroundColor: colors.surfaceCard,
  },
});
