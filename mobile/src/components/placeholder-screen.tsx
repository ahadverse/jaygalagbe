import { StyleSheet, View } from 'react-native';
import { Text, useTheme } from 'react-native-paper';

type PlaceholderScreenProps = {
  title: string;
  note?: string;
};

// Stands in for screens that get their real content in a later, dedicated commit.
export function PlaceholderScreen({ title, note }: PlaceholderScreenProps) {
  const theme = useTheme();

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <Text variant="headlineSmall">{title}</Text>
      {note ? (
        <Text
          variant="bodyMedium"
          style={[styles.note, { color: theme.colors.onSurfaceVariant }]}
        >
          {note}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 8,
  },
  note: {
    textAlign: 'center',
  },
});
