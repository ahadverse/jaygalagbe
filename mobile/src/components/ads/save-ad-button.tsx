import { Button } from 'react-native-paper';

import { toggleSavedAd, useSavedAdIds } from '../../features/ads/local-lists';

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
      onPress={() => toggleSavedAd(adId)}
    >
      {saved ? 'Saved to your list' : 'Save this ad'}
    </Button>
  );
}
