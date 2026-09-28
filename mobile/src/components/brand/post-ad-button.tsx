import { useNavigation } from '@react-navigation/native';
import { Pressable, StyleSheet, Text } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { colors, fontFamily, radius, shadow } from '../../theme/tokens';
import type { RootTabParamList } from '../../navigation/types';
import type { NavigationProp } from '@react-navigation/native';

// Web keeps a "Post an ad" CTA in the site header on every page
// (site-header.tsx), so the app's tab-root headers carry the same one. It
// jumps across tabs into the My Ads stack's form, which handles its own
// logged-out prompt.
export function PostAdButton() {
  const navigation = useNavigation<NavigationProp<RootTabParamList>>();

  return (
    <Pressable
      accessibilityRole="button"
      onPress={() =>
        navigation.navigate('MyAdsTab', { screen: 'AdForm', params: undefined })
      }
      style={({ pressed }) => [
        styles.button,
        pressed ? styles.buttonPressed : null,
      ]}
    >
      <Svg width={14} height={14} viewBox="0 0 24 24">
        <Path
          d="M12 5v14M5 12h14"
          stroke="#ffffff"
          strokeWidth={2.4}
          strokeLinecap="round"
        />
      </Svg>
      <Text style={styles.label}>Post an ad</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: radius.full,
    backgroundColor: colors.brand[700],
    paddingHorizontal: 14,
    paddingVertical: 8,
    ...shadow('brand'),
  },
  buttonPressed: {
    backgroundColor: colors.brand[800],
  },
  label: {
    fontFamily: fontFamily.textSemibold,
    fontSize: 13,
    color: '#ffffff',
  },
});
