import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { HelperText, IconButton } from 'react-native-paper';

import { ApiError } from '../../api/errors';
import { uploadAdPhotos } from '../../features/uploads/api';
import { MAX_AD_PHOTOS, pickAdPhotos } from '../../features/uploads/picker';
import { colors, fontFamily, radius } from '../../theme/tokens';

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
              iconColor={colors.neutral[800]}
              containerColor="rgba(255,255,255,0.92)"
              style={styles.removeButton}
              onPress={() => removePhoto(url)}
            />
          </View>
        ))}
        {photos.length < MAX_AD_PHOTOS ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Add photos"
            onPress={addPhotos}
            disabled={uploading}
            style={styles.addTile}
          >
            {uploading ? (
              <ActivityIndicator color={colors.brand[600]} />
            ) : (
              <>
                <MaterialCommunityIcons
                  name="camera-plus-outline"
                  size={22}
                  color={colors.brand[600]}
                />
                <Text style={styles.addLabel}>Add photos</Text>
              </>
            )}
          </Pressable>
        ) : null}
      </View>
      <Text style={styles.counter}>
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
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  removeButton: {
    position: 'absolute',
    top: -12,
    right: -12,
    margin: 0,
  },
  addTile: {
    width: 88,
    height: 88,
    borderRadius: radius.sm,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: colors.brand[200],
    backgroundColor: colors.brand[50],
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingHorizontal: 6,
  },
  addLabel: {
    fontFamily: fontFamily.textSemibold,
    fontSize: 11,
    textAlign: 'center',
    color: colors.brand[700],
  },
  counter: {
    fontFamily: fontFamily.text,
    fontSize: 12,
    color: colors.neutral[500],
  },
});
