import { LinearGradient } from 'expo-linear-gradient';
import {
  ImageBackground,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle, Path } from 'react-native-svg';

import { sectors, type SectorSlug } from '../../features/ads/sectors';
import { colors, fontFamily, radius, shadow } from '../../theme/tokens';

// Clears the transparent stack header floating above the photo (see
// home-stack.tsx), on top of the status-bar inset.
const FLOATING_HEADER_HEIGHT = 56;

const POPULAR_AREAS = [
  'Dhanmondi',
  'Bashundhara',
  'Uttara',
  'Chattogram',
  'Sylhet',
];

const ASSURANCES = [
  'Every ad manually reviewed',
  'Free to browse, no login',
  'Chat directly with the owner',
];

// Ports web/src/components/home/hero.tsx, including its photo, scrim stack and
// copy. Web layers four gradients (two radial) over the image; RN has no
// radial gradient, so the same job is done with vertical fades plus a warm
// bottom glow - the contrast floor the scrims exist to guarantee is what
// matters, not the exact gradient geometry.
export function Hero({
  sector,
  onSectorChange,
  location,
  onLocationChange,
  onSearch,
}: {
  sector: SectorSlug;
  onSectorChange: (sector: SectorSlug) => void;
  location: string;
  onLocationChange: (location: string) => void;
  onSearch: (location?: string) => void;
}) {
  const insets = useSafeAreaInsets();

  return (
    <ImageBackground
      source={require('../../../assets/hero-dhaka-dusk.jpg')}
      resizeMode="cover"
      // The dark floor shows through if the photo is slow to decode, so white
      // type never lands on a blank white box.
      style={styles.hero}
      imageStyle={styles.heroImage}
    >
      <View style={styles.scrimFlat} />
      <LinearGradient
        colors={['rgba(7,5,4,0.55)', 'transparent']}
        style={styles.scrimTop}
        pointerEvents="none"
      />
      <LinearGradient
        colors={['transparent', 'rgba(7,5,4,0.55)']}
        style={styles.scrimBottom}
        pointerEvents="none"
      />
      <LinearGradient
        colors={['transparent', 'rgba(207,69,2,0.32)']}
        style={styles.scrimGlow}
        pointerEvents="none"
      />

      <View
        style={[
          styles.content,
          { paddingTop: insets.top + FLOATING_HEADER_HEIGHT },
        ]}
      >
        <View style={styles.eyebrowPill}>
          <View style={styles.eyebrowDot} />
          <Text style={styles.eyebrowText}>
            Land &amp; rentals across Bangladesh
          </Text>
        </View>

        <View style={styles.headlineBlock}>
          <Text style={styles.headline}>Find the right jayga.</Text>
          <Text style={[styles.headline, styles.headlineAccent]}>
            Or the right basha.
          </Text>
          <Text style={styles.subcopy}>
            Plots to buy and homes to rent across Bangladesh — every listing
            checked by a human before it reaches you.
          </Text>
        </View>

        <View style={styles.searchCard}>
          <View style={styles.toggleTrack}>
            {sectors.map((option) => {
              const active = option.slug === sector;
              return (
                <Pressable
                  key={option.slug}
                  accessibilityRole="button"
                  accessibilityState={{ selected: active }}
                  onPress={() => onSectorChange(option.slug)}
                  style={[
                    styles.toggleButton,
                    active ? styles.toggleButtonActive : null,
                  ]}
                >
                  <Text
                    style={[
                      styles.toggleLabel,
                      active ? styles.toggleLabelActive : null,
                    ]}
                  >
                    {option.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <View style={styles.inputRow}>
            <Svg
              width={19}
              height={19}
              viewBox="0 0 24 24"
              style={styles.inputIcon}
            >
              <Path
                d="M12 21s-6.5-5.4-6.5-10a6.5 6.5 0 1 1 13 0c0 4.6-6.5 10-6.5 10Z"
                fill="none"
                stroke={colors.neutral[500]}
                strokeWidth={1.7}
              />
              <Circle
                cx={12}
                cy={11}
                r={2.25}
                fill="none"
                stroke={colors.neutral[500]}
                strokeWidth={1.7}
              />
            </Svg>
            <TextInput
              value={location}
              onChangeText={onLocationChange}
              onSubmitEditing={() => onSearch(location)}
              returnKeyType="search"
              placeholder="Area or district — e.g. Dhanmondi, Dhaka"
              placeholderTextColor={colors.neutral[400]}
              accessibilityLabel="Location"
              style={styles.input}
            />
          </View>

          <Pressable
            accessibilityRole="button"
            onPress={() => onSearch(location)}
            style={({ pressed }) => [
              styles.searchButton,
              pressed ? styles.searchButtonPressed : null,
            ]}
          >
            <Svg width={16} height={16} viewBox="0 0 24 24">
              <Circle
                cx={11}
                cy={11}
                r={7}
                fill="none"
                stroke="#ffffff"
                strokeWidth={2}
              />
              <Path
                d="m20 20-3.5-3.5"
                stroke="#ffffff"
                strokeWidth={2}
                strokeLinecap="round"
              />
            </Svg>
            <Text style={styles.searchButtonLabel}>Search</Text>
          </Pressable>
        </View>

        <View style={styles.popularRow}>
          <Text style={styles.popularLabel}>Popular:</Text>
          {POPULAR_AREAS.map((area) => (
            <Pressable
              key={area}
              accessibilityRole="button"
              onPress={() => onSearch(area)}
              style={styles.areaChip}
            >
              <Text style={styles.areaChipLabel}>{area}</Text>
            </Pressable>
          ))}
        </View>

        <View style={styles.assurances}>
          {ASSURANCES.map((item) => (
            <View key={item} style={styles.assuranceRow}>
              <Svg width={13} height={13} viewBox="0 0 16 16">
                <Path
                  d="m3 8.5 3.2 3.2L13 5"
                  fill="none"
                  stroke={colors.success[100]}
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </Svg>
              <Text style={styles.assuranceText}>{item}</Text>
            </View>
          ))}
        </View>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  hero: {
    backgroundColor: colors.neutral[950],
  },
  heroImage: {
    // Web pins the photo at 58%/62% so the skyline, not the sky, fills the
    // frame on a narrow viewport.
    top: '-8%',
  },
  scrimFlat: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(7,5,4,0.45)',
  },
  scrimTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '32%',
  },
  scrimBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '34%',
  },
  scrimGlow: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '45%',
  },
  content: {
    alignItems: 'center',
    gap: 22,
    paddingHorizontal: 20,
    paddingTop: 34,
    paddingBottom: 38,
  },
  eyebrowPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: radius.full,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.22)',
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  eyebrowDot: {
    width: 6,
    height: 6,
    borderRadius: radius.full,
    backgroundColor: colors.brand[400],
  },
  eyebrowText: {
    fontFamily: fontFamily.textSemibold,
    fontSize: 11,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    color: '#ffffff',
  },
  headlineBlock: {
    alignItems: 'center',
    gap: 12,
  },
  headline: {
    fontFamily: fontFamily.display,
    fontSize: 33,
    lineHeight: 37,
    letterSpacing: -1.2,
    textAlign: 'center',
    color: '#ffffff',
  },
  headlineAccent: {
    color: colors.brand[200],
  },
  subcopy: {
    fontFamily: fontFamily.text,
    fontSize: 14.5,
    lineHeight: 22,
    textAlign: 'center',
    color: colors.neutral[200],
  },
  searchCard: {
    width: '100%',
    borderRadius: radius['2xl'],
    backgroundColor: colors.surfaceCard,
    padding: 10,
    gap: 10,
    ...shadow('lg'),
  },
  toggleTrack: {
    flexDirection: 'row',
    gap: 4,
    borderRadius: radius.full,
    backgroundColor: colors.neutral[100],
    padding: 4,
  },
  toggleButton: {
    flex: 1,
    alignItems: 'center',
    borderRadius: radius.full,
    paddingVertical: 10,
  },
  toggleButtonActive: {
    backgroundColor: colors.surfaceCard,
    ...shadow('sm'),
  },
  toggleLabel: {
    fontFamily: fontFamily.textSemibold,
    fontSize: 14,
    color: colors.neutral[600],
  },
  toggleLabelActive: {
    color: colors.brand[800],
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radius.xl,
    backgroundColor: colors.neutral[100],
    paddingHorizontal: 14,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: 52,
    fontFamily: fontFamily.text,
    fontSize: 14.5,
    color: colors.neutral[900],
  },
  searchButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 52,
    borderRadius: radius.xl,
    backgroundColor: colors.brand[700],
    ...shadow('brand'),
  },
  searchButtonPressed: {
    backgroundColor: colors.brand[800],
  },
  searchButtonLabel: {
    fontFamily: fontFamily.textSemibold,
    fontSize: 15,
    color: '#ffffff',
  },
  popularRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  popularLabel: {
    fontFamily: fontFamily.text,
    fontSize: 12,
    color: colors.neutral[300],
  },
  areaChip: {
    borderRadius: radius.full,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.22)',
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  areaChipLabel: {
    fontFamily: fontFamily.textMedium,
    fontSize: 12,
    color: '#ffffff',
  },
  assurances: {
    gap: 8,
  },
  assuranceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  assuranceText: {
    fontFamily: fontFamily.text,
    fontSize: 12.5,
    color: colors.neutral[200],
  },
});
