import { Image } from 'react-native';

const logo = require('../../../assets/logo.png');

// The full logo (mark and name) on a transparent background. Its aspect ratio
// is 900:740, so the width follows from the height.
const HEIGHT = { sm: 44, lg: 96 } as const;
const ASPECT = 900 / 740;

export function Wordmark({ size = 'sm' }: { size?: 'sm' | 'lg' }) {
  const height = HEIGHT[size];

  return (
    <Image
      source={logo}
      accessibilityLabel="Jayga Lagbe"
      resizeMode="contain"
      style={{ width: height * ASPECT, height }}
    />
  );
}
