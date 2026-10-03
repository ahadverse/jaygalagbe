import { StyleSheet } from 'react-native';
import { Button } from 'react-native-paper';

import { useSavedAdIds, useToggleSavedAd } from '../../features/ads/saved-ads';
import { colors, radius } from '../../theme/tokens';

// Mirrors web/src/components/ads/save-ad-button.tsx: signed-in users save to
// their account, guests save on this device until they sign in.
export function SaveAdButton({ adId }: { adId: string }) {
  const savedIds = useSavedAdIds();
  const toggleSaved = useToggleSavedAd();
  const saved = savedIds.includes(adId);

  return (
    <Button
      mode={saved ? 'contained-tonal' : 'outlined'}
      icon={saved ? 'bookmark' : 'bookmark-outline'}
      rippleColor={colors.brand[100]}
      style={[styles.button, saved ? styles.saved : styles.unsaved]}
      onPress={() => void toggleSaved(adId)}
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
