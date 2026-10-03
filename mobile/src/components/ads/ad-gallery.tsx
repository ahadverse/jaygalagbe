import { useRef, useState } from 'react';
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';

import { colors, fontFamily, radius } from '../../theme/tokens';
import { AdLightbox } from './ad-lightbox';

// Web composes a mosaic that opens a lightbox (web/src/components/ads/
// ad-gallery.tsx). A phone has no room for a mosaic and no hover to hint that
// the tiles are clickable, so the same job - "there are more photos, here they
// are" - is done with a full-bleed pager over a strip of thumbnails. Tapping
// the pager opens the same lightbox web does.
const THUMB_SIZE = 64;
const THUMB_GAP = 8;
const STRIP_PADDING = 16;
const PHOTO_ASPECT = 0.75;

export function AdGallery({
  photos,
  title,
}: {
  photos: string[];
  title: string;
}) {
  const { width } = useWindowDimensions();
  const [index, setIndex] = useState(0);
  // Which photo the full-screen viewer is open on, or null while it is closed.
  const [viewerAt, setViewerAt] = useState<number | null>(null);
  const pagerRef = useRef<ScrollView>(null);
  const stripRef = useRef<ScrollView>(null);

  if (photos.length === 0) {
    return null;
  }

  // Centres the active thumbnail where the strip has room to scroll, so the
  // selection never sits off-screen after a swipe on the pager.
  function keepThumbVisible(next: number) {
    const stride = THUMB_SIZE + THUMB_GAP;
    const contentWidth = photos.length * stride - THUMB_GAP + STRIP_PADDING * 2;
    const target = STRIP_PADDING + next * stride + THUMB_SIZE / 2 - width / 2;
    const maxOffset = Math.max(0, contentWidth - width);
    stripRef.current?.scrollTo({
      x: Math.min(Math.max(0, target), maxOffset),
      animated: true,
    });
  }

  function showPhoto(next: number) {
    setIndex(next);
    pagerRef.current?.scrollTo({ x: next * width, animated: true });
    keepThumbVisible(next);
  }

  return (
    <View>
      <ScrollView
        ref={pagerRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(event) => {
          const next = Math.round(event.nativeEvent.contentOffset.x / width);
          if (next === index) {
            return;
          }
          setIndex(next);
          keepThumbVisible(next);
        }}
      >
        {photos.map((photo, position) => (
          <Pressable
            key={`${position}-${photo}`}
            accessibilityRole="button"
            accessibilityLabel={
              position === 0
                ? `View photo of ${title}`
                : `View photo ${position + 1} of ${photos.length}`
            }
            onPress={() => setViewerAt(position)}
          >
            <Image
              source={{ uri: photo }}
              resizeMode="cover"
              style={{ width, height: width * PHOTO_ASPECT }}
            />
          </Pressable>
        ))}
      </ScrollView>

      {photos.length > 1 ? (
        <>
          <View style={styles.counter}>
            <Text style={styles.counterText}>
              {index + 1} / {photos.length}
            </Text>
          </View>

          <ScrollView
            ref={stripRef}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.strip}
          >
            {photos.map((photo, position) => {
              const active = position === index;
              return (
                <Pressable
                  key={`${position}-${photo}`}
                  accessibilityRole="button"
                  accessibilityState={{ selected: active }}
                  accessibilityLabel={`View photo ${position + 1} of ${photos.length}`}
                  onPress={() => showPhoto(position)}
                  style={[styles.thumb, active ? styles.thumbActive : null]}
                >
                  <Image
                    source={{ uri: photo }}
                    resizeMode="cover"
                    style={[
                      styles.thumbImage,
                      active ? null : styles.thumbImageIdle,
                    ]}
                  />
                </Pressable>
              );
            })}
          </ScrollView>
        </>
      ) : null}

      {viewerAt !== null ? (
        <AdLightbox
          photos={photos}
          title={title}
          index={viewerAt}
          onIndexChange={setViewerAt}
          // Whatever photo they ended on in the viewer is the one the pager
          // should be showing once it closes.
          onClose={() => {
            showPhoto(viewerAt);
            setViewerAt(null);
          }}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  counter: {
    position: 'absolute',
    top: 12,
    right: 12,
    // Same frosted-pill stand-in as ad-card's sector label: plain RN has no
    // backdrop blur without expo-blur.
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderRadius: radius.full,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  counterText: {
    fontFamily: fontFamily.textSemibold,
    fontSize: 11,
    color: colors.neutral[800],
    fontVariant: ['tabular-nums'],
  },
  strip: {
    // flexGrow lets the row fill the viewport when there are only a few
    // thumbnails, so justifyContent can centre them. Once they overflow, the
    // content is already wider than the viewport and both are no-ops.
    flexGrow: 1,
    justifyContent: 'center',
    gap: THUMB_GAP,
    paddingHorizontal: STRIP_PADDING,
    paddingTop: 12,
  },
  thumb: {
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: radius.md,
    // Always 2px, transparent when idle, so selecting a thumb never resizes it.
    borderWidth: 2,
    borderColor: 'transparent',
    overflow: 'hidden',
    backgroundColor: colors.neutral[150],
  },
  thumbActive: {
    borderColor: colors.brand[600],
  },
  thumbImage: {
    width: '100%',
    height: '100%',
  },
  thumbImageIdle: {
    opacity: 0.6,
  },
});
