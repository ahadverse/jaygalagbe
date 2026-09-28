import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { colors, fontFamily, radius, shadow } from '../../theme/tokens';

// Ports web/src/components/layout/site-header.tsx's Wordmark: a brand->accent
// gradient tile holding the same house outline path, next to "JaygaLagbe"
// with the second half in the brand color.
const TILE = { sm: 28, lg: 40 } as const;
const TEXT = { sm: 17, lg: 24 } as const;

export function Wordmark({
  size = 'sm',
  showText = true,
  tone = 'dark',
}: {
  size?: 'sm' | 'lg';
  showText?: boolean;
  // `light` is for the wordmark sitting over the hero photo, where web's
  // near-black text would disappear.
  tone?: 'dark' | 'light';
}) {
  const tileSize = TILE[size];
  const glyphSize = tileSize * 0.58;

  return (
    <View style={styles.row}>
      <LinearGradient
        colors={[colors.brand[500], colors.accent[600]]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[
          styles.tile,
          {
            width: tileSize,
            height: tileSize,
            borderRadius: size === 'sm' ? radius.sm : radius.md,
          },
          shadow('brand'),
        ]}
      >
        <Svg width={glyphSize} height={glyphSize} viewBox="0 0 24 24">
          <Path
            d="M4 11 12 4.5 20 11v8.5h-5.5V14h-5v5.5H4V11Z"
            fill="none"
            stroke="#ffffff"
            strokeWidth={1.9}
            strokeLinejoin="round"
          />
        </Svg>
      </LinearGradient>

      {showText ? (
        <Text
          style={[
            styles.text,
            { fontSize: TEXT[size] },
            tone === 'light' ? styles.textLight : null,
          ]}
        >
          Jayga
          <Text
            style={[
              styles.textAccent,
              tone === 'light' ? styles.textAccentLight : null,
            ]}
          >
            Lagbe
          </Text>
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
  },
  tile: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontFamily: fontFamily.display,
    color: colors.neutral[900],
    letterSpacing: -0.4,
  },
  textAccent: {
    fontFamily: fontFamily.display,
    color: colors.brand[700],
  },
  textLight: {
    color: '#ffffff',
  },
  textAccentLight: {
    color: colors.brand[200],
  },
});
