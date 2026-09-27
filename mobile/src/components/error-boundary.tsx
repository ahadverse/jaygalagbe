import { Component, type ErrorInfo, type ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, Text, useTheme } from 'react-native-paper';

type Props = {
  children: ReactNode;
};

type State = {
  error: Error | null;
};

/**
 * Catches render-time errors anywhere below it in the tree so a crash shows
 * a recoverable screen instead of leaving the app blank. This has to be a
 * class component - componentDidCatch/getDerivedStateFromError have no hook
 * equivalent. The fallback UI itself is the plain function component below
 * so it can still use useTheme() like every other screen.
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ error: null });
  };

  render() {
    if (this.state.error) {
      return <ErrorFallback onRetry={this.handleReset} />;
    }
    return this.props.children;
  }
}

function ErrorFallback({ onRetry }: { onRetry: () => void }) {
  const theme = useTheme();

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <Text variant="titleMedium" style={styles.title}>
        Something went wrong.
      </Text>
      <Text
        variant="bodyMedium"
        style={[styles.message, { color: theme.colors.onSurfaceVariant }]}
      >
        You can try again, or restart the app if it keeps happening.
      </Text>
      <Button mode="contained" onPress={onRetry}>
        Try again
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 12,
  },
  title: {
    textAlign: 'center',
  },
  message: {
    textAlign: 'center',
    marginBottom: 8,
  },
});
