import { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  type GestureResponderEvent,
  type LayoutRectangle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';

import { fontFamily, radius } from '../../theme/tokens';

// Ports web/src/components/ads/ad-lightbox.tsx's behaviour to touch. Built on
// core Animated plus View's own responder props rather than
// gesture-handler/reanimated: neither is installed, and pinch/pan/double-tap
// is the whole requirement here - not enough to justify two native
// dependencies and a babel-plugin change. The responder props are used
// directly instead of PanResponder so every handler is a fresh closure over
// the current props, with no mutable refs mirroring them.
const MIN_SCALE = 1;
const MAX_SCALE = 5;
/** Where a double-tap lands: close enough to read a room, still framed. */
const DOUBLE_TAP_SCALE = 2.5;
const DOUBLE_TAP_MS = 320;
/** Distance a touch must travel before it counts as a drag rather than a tap. */
const TAP_SLOP = 6;
/** Travel past this, at 1x, means "next photo". */
const SWIPE_THRESHOLD = 48;

const THUMB_WIDTH = 72;
const THUMB_HEIGHT = 52;
const THUMB_GAP = 8;

type Viewport = { scale: number; x: number; y: number };

const RESET: Viewport = { scale: 1, x: 0, y: 0 };

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

/** Spread of a two-finger touch, or 0 whenever fewer than two are down. */
function touchDistance(event: GestureResponderEvent): number {
  const [a, b] = event.nativeEvent.touches;
  if (!a || !b) {
    return 0;
  }
  return Math.hypot(a.pageX - b.pageX, a.pageY - b.pageY);
}

/**
 * Keeps the photo from being dragged off screen: at any scale it may be panned
 * only as far as the part that overflows the stage. The photo is measured as
 * if it filled the stage, so a letterboxed image can drift into its own bars
 * by a few points - cheap next to threading the intrinsic aspect ratio through
 * every gesture.
 */
function clampOffset(
  x: number,
  y: number,
  scale: number,
  stage: LayoutRectangle,
): { x: number; y: number } {
  if (scale <= MIN_SCALE) {
    return { x: 0, y: 0 };
  }
  const maxX = (stage.width * scale - stage.width) / 2;
  const maxY = (stage.height * scale - stage.height) / 2;
  return { x: clamp(x, -maxX, maxX), y: clamp(y, -maxY, maxY) };
}

export function AdLightbox({
  photos,
  title,
  index,
  onIndexChange,
  onClose,
}: {
  photos: string[];
  title: string;
  index: number;
  onIndexChange: (index: number) => void;
  onClose: () => void;
}) {
  const insets = useSafeAreaInsets();
  const [stage, setStage] = useState<LayoutRectangle>({
    x: 0,
    y: 0,
    width: 1,
    height: 1,
  });

  // Lazy state rather than useRef so the values are never read off a ref
  // during render - they are handed straight to the transform below.
  const [scale] = useState(() => new Animated.Value(1));
  const [translateX] = useState(() => new Animated.Value(0));
  const [translateY] = useState(() => new Animated.Value(0));

  // The committed viewport, as plain numbers so gesture maths never has to
  // read back out of an Animated.Value. Touched only from handlers/effects.
  const viewport = useRef<Viewport>(RESET);
  const origin = useRef({ ...RESET, x0: 0, y0: 0, distance: 0 });
  const travel = useRef({ dx: 0, dy: 0 });
  const lastTap = useRef(0);
  const dragged = useRef(false);

  const count = photos.length;

  // Every photo starts fresh rather than inheriting the last one's zoom -
  // covers the swipe, the thumbnails and the initial open in one place.
  useEffect(() => {
    viewport.current = RESET;
    scale.setValue(1);
    translateX.setValue(0);
    translateY.setValue(0);
  }, [index, scale, translateX, translateY]);

  function write(next: Viewport) {
    viewport.current = next;
    scale.setValue(next.scale);
    translateX.setValue(next.x);
    translateY.setValue(next.y);
  }

  function animateTo(next: Viewport) {
    viewport.current = next;
    Animated.parallel([
      Animated.timing(scale, {
        toValue: next.scale,
        duration: 180,
        useNativeDriver: true,
      }),
      Animated.timing(translateX, {
        toValue: next.x,
        duration: 180,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: next.y,
        duration: 180,
        useNativeDriver: true,
      }),
    ]).start();
  }

  function onGrant(event: GestureResponderEvent) {
    const touch = event.nativeEvent;
    dragged.current = false;
    travel.current = { dx: 0, dy: 0 };
    origin.current = {
      ...viewport.current,
      x0: touch.pageX,
      y0: touch.pageY,
      distance: touchDistance(event),
    };
  }

  function onMove(event: GestureResponderEvent) {
    const touch = event.nativeEvent;
    const dx = touch.pageX - origin.current.x0;
    const dy = touch.pageY - origin.current.y0;
    travel.current = { dx, dy };
    if (Math.hypot(dx, dy) > TAP_SLOP) {
      dragged.current = true;
    }

    const distance = touchDistance(event);
    if (distance > 0) {
      // A second finger can land after the gesture began, so the pinch
      // baseline is taken the first time two touches are seen.
      if (origin.current.distance === 0) {
        origin.current = {
          ...viewport.current,
          x0: touch.pageX,
          y0: touch.pageY,
          distance,
        };
        return;
      }
      const next = clamp(
        (origin.current.scale * distance) / origin.current.distance,
        MIN_SCALE,
        MAX_SCALE,
      );
      write({
        scale: next,
        ...clampOffset(origin.current.x, origin.current.y, next, stage),
      });
      return;
    }

    // At 1x there is nothing to pan, so the same drag means "next photo".
    if (viewport.current.scale <= MIN_SCALE) {
      return;
    }
    write({
      scale: viewport.current.scale,
      ...clampOffset(
        origin.current.x + dx,
        origin.current.y + dy,
        viewport.current.scale,
        stage,
      ),
    });
  }

  function onRelease() {
    const wasPinch = origin.current.distance > 0;
    origin.current.distance = 0;

    if (!dragged.current) {
      /* Double-tap is timed here rather than left to a gesture library: it is
       * two taps inside a window, nothing more. */
      const now = Date.now();
      if (now - lastTap.current < DOUBLE_TAP_MS) {
        lastTap.current = 0;
        animateTo(
          viewport.current.scale > MIN_SCALE
            ? RESET
            : { scale: DOUBLE_TAP_SCALE, x: 0, y: 0 },
        );
      } else {
        lastTap.current = now;
      }
      return;
    }

    if (
      !wasPinch &&
      viewport.current.scale <= MIN_SCALE &&
      count > 1 &&
      Math.abs(travel.current.dx) >= SWIPE_THRESHOLD
    ) {
      onIndexChange((index + (travel.current.dx < 0 ? 1 : -1) + count) % count);
    }
  }

  return (
    <Modal
      visible
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View style={styles.root}>
        <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>
          <View style={styles.headerRight}>
            <Text style={styles.counter}>
              {index + 1} / {count}
            </Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Close photo viewer"
              onPress={onClose}
              style={({ pressed }) => [
                styles.closeButton,
                pressed ? styles.closeButtonPressed : null,
              ]}
            >
              <Svg width={20} height={20} viewBox="0 0 24 24">
                <Path
                  d="m6 6 12 12M18 6 6 18"
                  stroke="#ffffff"
                  strokeWidth={1.9}
                  strokeLinecap="round"
                />
              </Svg>
            </Pressable>
          </View>
        </View>

        <View
          style={styles.stage}
          onLayout={(event) => setStage(event.nativeEvent.layout)}
          onStartShouldSetResponder={() => true}
          onMoveShouldSetResponder={() => true}
          onResponderTerminationRequest={() => false}
          onResponderGrant={onGrant}
          onResponderMove={onMove}
          onResponderRelease={onRelease}
          onResponderTerminate={onRelease}
        >
          <Animated.Image
            source={{ uri: photos[index] }}
            accessibilityLabel={`${title} - photo ${index + 1} of ${count}`}
            resizeMode="contain"
            style={[
              StyleSheet.absoluteFill,
              { transform: [{ translateX }, { translateY }, { scale }] },
            ]}
          />
        </View>

        {count > 1 ? (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={[
              styles.strip,
              { paddingBottom: insets.bottom + 16 },
            ]}
          >
            {photos.map((photo, position) => {
              const active = position === index;
              return (
                <Pressable
                  key={`${position}-${photo}`}
                  accessibilityRole="button"
                  accessibilityState={{ selected: active }}
                  accessibilityLabel={`Show photo ${position + 1}`}
                  onPress={() => onIndexChange(position)}
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
        ) : null}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: 'rgba(7,5,4,0.96)',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  title: {
    flex: 1,
    fontFamily: fontFamily.textMedium,
    fontSize: 14,
    color: '#ffffff',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  counter: {
    fontFamily: fontFamily.text,
    fontSize: 13,
    color: 'rgba(255,255,255,0.7)',
    fontVariant: ['tabular-nums'],
  },
  closeButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.full,
  },
  closeButtonPressed: {
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  stage: {
    flex: 1,
    overflow: 'hidden',
  },
  strip: {
    gap: THUMB_GAP,
    // Matches the detail-screen strip: centred while the thumbnails fit, a
    // normal scrolling row once they do not.
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  thumb: {
    width: THUMB_WIDTH,
    height: THUMB_HEIGHT,
    borderRadius: radius.sm,
    borderWidth: 2,
    borderColor: 'transparent',
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  thumbActive: {
    borderColor: '#ffffff',
  },
  thumbImage: {
    width: '100%',
    height: '100%',
  },
  thumbImageIdle: {
    opacity: 0.55,
  },
});
