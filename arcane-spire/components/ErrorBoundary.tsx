import React, { Component, ErrorInfo, ReactNode } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius, FontSize } from '../constants/theme';
import { FantasyButton } from './ui/FantasyButton';
import { FantasyCard } from './ui/FantasyCard';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  showDetails: boolean;
}

/**
 * ErrorBoundary - Catches JavaScript errors anywhere in the child component tree
 *
 * Displays a fantasy-themed error screen instead of crashing the app.
 * In development, shows error details. In production, shows a user-friendly message.
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      showDetails: false,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ errorInfo });

    // Log error to console
    console.error('ErrorBoundary caught an error:', error, errorInfo);

    // Call optional error handler
    this.props.onError?.(error, errorInfo);

    // In production, you might want to send this to an error tracking service
    // like Sentry, Bugsnag, etc.
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      showDetails: false,
    });
  };

  toggleDetails = () => {
    this.setState((prev) => ({ showDetails: !prev.showDetails }));
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const { error, errorInfo, showDetails } = this.state;
      const isDev = __DEV__;

      return (
        <SafeAreaView style={styles.container}>
          <View style={styles.content}>
            {/* Error Icon */}
            <View style={styles.iconContainer}>
              <Text style={styles.errorEmoji}>💀</Text>
            </View>

            {/* Title */}
            <Text style={styles.title}>A Dark Curse Has Struck!</Text>
            <Text style={styles.subtitle}>
              Something went wrong in the arcane machinery
            </Text>

            {/* Error Message Card */}
            <FantasyCard variant="dark" style={styles.errorCard}>
              <Text style={styles.errorLabel}>The curse reads:</Text>
              <Text style={styles.errorMessage}>
                {error?.message || 'Unknown error'}
              </Text>
            </FantasyCard>

            {/* Action Buttons */}
            <View style={styles.actions}>
              <FantasyButton
                variant="summon"
                size="lg"
                fullWidth
                onPress={this.handleReset}
                icon={<Ionicons name="refresh" size={20} color={Colors.shadow.black} />}
              >
                Dispel the Curse
              </FantasyButton>

              {isDev && (
                <FantasyButton
                  variant="secondary"
                  size="md"
                  fullWidth
                  onPress={this.toggleDetails}
                  style={styles.detailsButton}
                >
                  {showDetails ? 'Hide Arcane Details' : 'Show Arcane Details'}
                </FantasyButton>
              )}
            </View>

            {/* Error Details (Dev only) */}
            {isDev && showDetails && errorInfo && (
              <ScrollView style={styles.detailsScroll}>
                <FantasyCard variant="stone" style={styles.detailsCard}>
                  <Text style={styles.detailsTitle}>Stack Trace</Text>
                  <Text style={styles.detailsText}>
                    {error?.stack || 'No stack trace available'}
                  </Text>

                  <Text style={styles.detailsTitle}>Component Stack</Text>
                  <Text style={styles.detailsText}>
                    {errorInfo.componentStack}
                  </Text>
                </FantasyCard>
              </ScrollView>
            )}
          </View>
        </SafeAreaView>
      );
    }

    return this.props.children;
  }
}

/**
 * Screen-level error boundary with reset callback
 */
interface ScreenErrorBoundaryProps {
  children: ReactNode;
  screenName: string;
}

export function ScreenErrorBoundary({ children, screenName }: ScreenErrorBoundaryProps) {
  const handleError = (error: Error, errorInfo: ErrorInfo) => {
    console.error(`Error in ${screenName}:`, error);
    // Could report to analytics here
  };

  return (
    <ErrorBoundary onError={handleError}>
      {children}
    </ErrorBoundary>
  );
}

/**
 * Minimal error fallback for non-critical components
 */
interface MinimalErrorFallbackProps {
  error?: Error;
  onRetry?: () => void;
}

export function MinimalErrorFallback({ error, onRetry }: MinimalErrorFallbackProps) {
  return (
    <View style={styles.minimalFallback}>
      <Ionicons name="warning" size={24} color={Colors.fire.orange} />
      <Text style={styles.minimalText}>Something went wrong</Text>
      {onRetry && (
        <Pressable onPress={onRetry} style={styles.minimalRetry}>
          <Text style={styles.minimalRetryText}>Tap to retry</Text>
        </Pressable>
      )}
    </View>
  );
}

/**
 * withErrorBoundary HOC - Wraps a component with an error boundary
 */
export function withErrorBoundary<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  fallback?: ReactNode
) {
  return function WithErrorBoundary(props: P) {
    return (
      <ErrorBoundary fallback={fallback}>
        <WrappedComponent {...props} />
      </ErrorBoundary>
    );
  };
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    flex: 1,
    padding: Spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    marginBottom: Spacing.lg,
  },
  errorEmoji: {
    fontSize: 80,
  },
  title: {
    fontSize: FontSize.xxl,
    fontWeight: '700',
    color: Colors.fire.orange,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  subtitle: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.xl,
  },
  errorCard: {
    width: '100%',
    marginBottom: Spacing.xl,
  },
  errorLabel: {
    fontSize: FontSize.sm,
    color: Colors.textMuted,
    marginBottom: Spacing.xs,
  },
  errorMessage: {
    fontSize: FontSize.md,
    color: Colors.fire.orange,
    fontFamily: 'monospace',
  },
  actions: {
    width: '100%',
  },
  detailsButton: {
    marginTop: Spacing.md,
  },
  detailsScroll: {
    width: '100%',
    maxHeight: 300,
    marginTop: Spacing.lg,
  },
  detailsCard: {
    padding: Spacing.md,
  },
  detailsTitle: {
    fontSize: FontSize.sm,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: Spacing.xs,
    marginTop: Spacing.md,
  },
  detailsText: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    fontFamily: 'monospace',
  },

  // Minimal fallback
  minimalFallback: {
    padding: Spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  minimalText: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginTop: Spacing.sm,
  },
  minimalRetry: {
    marginTop: Spacing.sm,
    padding: Spacing.sm,
  },
  minimalRetryText: {
    fontSize: FontSize.sm,
    color: Colors.arcane.purple,
    textDecorationLine: 'underline',
  },
});

export default ErrorBoundary;
