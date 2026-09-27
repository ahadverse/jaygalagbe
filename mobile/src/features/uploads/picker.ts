import * as ImageManipulator from 'expo-image-manipulator';
import * as ImagePicker from 'expo-image-picker';

import type { PickedImage } from './api';

// Web caps a listing at 10 photos even though the backend DTO allows up to
// 12 - that's also the hard per-request limit on the upload endpoint itself
// (MAX_FILES_PER_REQUEST), so mirroring 10 avoids ever needing a second
// upload call for one listing.
export const MAX_AD_PHOTOS = 10;

const MAX_DIMENSION = 1600;

/** Picks up to `remainingSlots` images and resizes/recompresses each to fit comfortably under the 8MB backend cap. */
export async function pickAdPhotos(
  remainingSlots: number,
): Promise<PickedImage[]> {
  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!permission.granted) return [];

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: 'images',
    allowsMultipleSelection: true,
    selectionLimit: remainingSlots,
    quality: 1,
  });
  if (result.canceled) return [];

  const prepared: PickedImage[] = [];
  for (const [index, asset] of result.assets.entries()) {
    const longEdge = Math.max(asset.width, asset.height);
    const actions =
      longEdge > MAX_DIMENSION
        ? [
            {
              resize:
                asset.width >= asset.height
                  ? { width: MAX_DIMENSION }
                  : { height: MAX_DIMENSION },
            },
          ]
        : [];

    const manipulated = await ImageManipulator.manipulateAsync(
      asset.uri,
      actions,
      {
        compress: 0.8,
        format: ImageManipulator.SaveFormat.JPEG,
      },
    );

    prepared.push({
      uri: manipulated.uri,
      name: `photo-${Date.now()}-${index}.jpg`,
      type: 'image/jpeg',
    });
  }
  return prepared;
}
