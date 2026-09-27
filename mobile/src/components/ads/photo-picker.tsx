import { useState } from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { Button, HelperText, IconButton, Text } from 'react-native-paper';

import { ApiError } from '../../api/errors';
import { uploadAdPhotos } from '../../features/uploads/api';
import { MAX_AD_PHOTOS, pickAdPhotos } from '../../features/uploads/picker';

// pick -> client-side resize/compress (picker.ts) -> multipart upload ->
// attach returned URLs, matching app.md's cross-cutting image upload flow.
export function PhotoPicker({
  photos,
  onChange,
}: {
  photos: string[];
  onChange: (photos: string[]) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function addPhotos() {
    const remaining = MAX_AD_PHOTOS - photos.length;
    if (remaining <= 0) return;
    setError(null);
    const picked = await pickAdPhotos(remaining);
    if (picked.length === 0) return;

    setUploading(true);
    try {
      const uploaded = await uploadAdPhotos(picked);
      onChange([...photos, ...uploaded.map((photo) => photo.url)]);
    } catch (cause) {
      setError(
        cause instanceof ApiError
          ? cause.message
          : "Couldn't upload photos. Please try again.",
      );
    } finally {
      setUploading(false);
    }
  }

  function removePhoto(url: string) {
    onChange(photos.filter((photo) => photo !== url));
  }

  return (
    <View style={styles.container}>
      <View style={styles.grid}>
        {photos.map((url) => (
          <View key={url} style={styles.thumbnailWrap}>
            <Image source={{ uri: url }} style={styles.thumbnail} />
            <IconButton
              icon="close-circle"
              size={20}
              style={styles.removeButton}
              onPress={() => removePhoto(url)}
            />
          </View>
        ))}
        {photos.length < MAX_AD_PHOTOS ? (
          <Button
            mode="outlined"
            icon="camera-plus-outline"
            onPress={addPhotos}
            loading={uploading}
            disabled={uploading}
          >
            Add photos
          </Button>
        ) : null}
      </View>
      <Text variant="bodySmall">
        {photos.length}/{MAX_AD_PHOTOS} photos
      </Text>
      {error ? (
        <HelperText type="error" visible>
          {error}
        </HelperText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 8,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  thumbnailWrap: {
    width: 88,
    height: 88,
  },
  thumbnail: {
    width: 88,
    height: 88,
    borderRadius: 8,
  },
  removeButton: {
    position: 'absolute',
    top: -12,
    right: -12,
    margin: 0,
  },
});
