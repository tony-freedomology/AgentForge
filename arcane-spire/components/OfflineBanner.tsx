import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Pressable, AppState, AppStateStatus } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  withRepeat,
  withSequence,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';
import NetInfo, { NetInfoState } from '@react-native-community/netinfo';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSize } from '../constants/theme';
import { useSpireConnection } from '../hooks/useSpireConnection';
import { useNetworkStatus } from '../hooks/useNetworkStatus';

interface OfflineBannerProps {
  /** Style variant */
  variant?: 'full' | 'compact' | 'minimal';
  /** Custom message */
  message?: string;
  /** Show reconnect button */
  showRetry?: boolean;
  /** Callback when retry is pressed */
  onRetry?: () => void;
}

/**
 * OfflineBanner - Shows when device loses network connectivity
 *
 * Variants:
 * - full: Large banner with icon, message, and retry button
 * - compact: Slim banner with icon and message
 * - minimal: Just a colored bar indicator
 */
export function OfflineBanner({
  variant = 'compact',
  message,
  showRetry = true,
  onRetry,
}: OfflineBannerProps) {
  const [isConnected, setIsConnected] = useState<boolean | null>(true);
  const [isVisible, setIsVisible] = useState(false);

  // Animation values
  const slideAnim = useSharedValue(-100);
  const pulseAnim = useSharedValue(1);

  useEffect(() => {
    // Subscribe to network state changes
    const unsubscribe = NetInfo.addEventListener((state: NetInfoState) => {
      const connected = state.isConnected ?? true;
      setIsConnected(connected);

      if (!connected) {
        setIsVisible(true);
        slideAnim.value = withTiming(0, { duration: 300 });
        pulseAnim.value = withRepeat(
          withSequence(
            withTiming(0.6, { duration: 1000 }),
            withTiming(1, { duration: 1000 })
          ),
          -1,
          true
        );
      } else {
        slideAnim.value = withTiming(-100, { duration: 300 });
        setTimeout(() => setIsVisible(false), 300);
      }
    });

    // Also listen for app state changes to recheck
    const appStateSubscription = AppState.addEventListener(
      'change',
      (nextAppState: AppStateStatus) => {
        if (nextAppState === 'active') {
          NetInfo.fetch().then((state) => {
            setIsConnected(state.isConnected ?? true);
          });
        }
      }
    );

    return () => {
      unsubscribe();
      appStateSubscription.remove();
    };
  }, []);

  const slideStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: slideAnim.value }],
  }));

  const pulseStyle = useAnimatedStyle(() => ({
    opacity: pulseAnim.value,
  }));

  if (!isVisible) return null;

  const displayMessage = message || 'No network connection';

  if (variant === 'minimal') {
    return (
      <Animated.View style={[styles.minimal, slideStyle]}>
        <Animated.View style={[styles.minimalIndicator, pulseStyle]} />
      </Animated.View>
    );
  }

  if (variant === 'compact') {
    return (
      <Animated.View style={[styles.compact, slideStyle]}>
        <Animated.View style={pulseStyle}>
          <Ionicons name="cloud-offline" size={16} color={Colors.text} />
        </Animated.View>
        <Text style={styles.compactText}>{displayMessage}</Text>
        {showRetry && onRetry && (
          <Pressable onPress={onRetry} style={styles.compactRetry}>
            <Ionicons name="refresh" size={16} color={Colors.text} />
          </Pressable>
        )}
      </Animated.View>
    );
  }

  // Full variant
  return (
    <Animated.View style={[styles.full, slideStyle]}>
      <Animated.View style={[styles.fullIcon, pulseStyle]}>
        <Ionicons name="cloud-offline" size={32} color={Colors.fire.orange} />
      </Animated.View>
      <View style={styles.fullContent}>
        <Text style={styles.fullTitle}>Lost in the Void</Text>
        <Text style={styles.fullMessage}>{displayMessage}</Text>
      </View>
      {showRetry && onRetry && (
        <Pressable onPress={onRetry} style={styles.fullRetry}>
          <Ionicons name="refresh" size={20} color={Colors.text} />
          <Text style={styles.fullRetryText}>Retry</Text>
        </Pressable>
      )}
    </Animated.View>
  );
}

/**
 * ConnectionStatusBanner - Shows WebSocket connection status
 */
export function ConnectionStatusBanner() {
  const { connectionStatus, reconnect } = useSpireConnection();

  const isDisconnected = connectionStatus === 'disconnected';
  const isConnecting = connectionStatus === 'connecting';

  const slideAnim = useSharedValue(-60);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isDisconnected || isConnecting) {
      setIsVisible(true);
      slideAnim.value = withTiming(0, { duration: 300 });
    } else {
      slideAnim.value = withTiming(-60, { duration: 300 });
      setTimeout(() => setIsVisible(false), 300);
    }
  }, [connectionStatus]);

  const slideStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: slideAnim.value }],
  }));

  if (!isVisible) return null;

  return (
    <Animated.View
      style={[
        styles.connectionBanner,
        isConnecting ? styles.connectionConnecting : styles.connectionDisconnected,
        slideStyle,
      ]}
    >
      <Ionicons
        name={isConnecting ? 'sync' : 'unlink'}
        size={16}
        color={isConnecting ? Colors.frost.blue : Colors.fire.orange}
      />
      <Text style={styles.connectionText}>
        {isConnecting ? 'Reconnecting to Forge...' : 'Disconnected from Forge'}
      </Text>
      {isDisconnected && (
        <Pressable onPress={reconnect} style={styles.connectionRetry}>
          <Text style={styles.connectionRetryText}>Reconnect</Text>
        </Pressable>
      )}
    </Animated.View>
  );
}

/**
 * useNetworkStatus - Hook to get current network status
 */
/**
 * OfflineWrapper - Wraps content and shows offline state
 */
interface OfflineWrapperProps {
  children: React.ReactNode;
  offlineContent?: React.ReactNode;
}

export function OfflineWrapper({ children, offlineContent }: OfflineWrapperProps) {
  const { isConnected } = useNetworkStatus();

  if (isConnected === false) {
    return (
      offlineContent || (
        <View style={styles.offlineWrapper}>
          <Ionicons name="cloud-offline" size={64} color={Colors.textMuted} />
          <Text style={styles.offlineTitle}>No Connection</Text>
          <Text style={styles.offlineText}>
            Check your network connection and try again
          </Text>
        </View>
      )
    );
  }

  return <>{children}</>;
}

const styles = StyleSheet.create({
  // Minimal variant
  minimal: {
    height: 4,
    backgroundColor: Colors.fire.orange,
  },
  minimalIndicator: {
    flex: 1,
    backgroundColor: Colors.fire.orangeLight,
  },

  // Compact variant
  compact: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.shadow.darker,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.fire.orange,
    gap: Spacing.sm,
  },
  compactText: {
    flex: 1,
    fontSize: FontSize.sm,
    color: Colors.text,
  },
  compactRetry: {
    padding: Spacing.xs,
  },

  // Full variant
  full: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.shadow.darker,
    padding: Spacing.md,
    borderBottomWidth: 2,
    borderBottomColor: Colors.fire.orange,
    gap: Spacing.md,
  },
  fullIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.fire.orange + '20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullContent: {
    flex: 1,
  },
  fullTitle: {
    fontSize: FontSize.md,
    fontWeight: '700',
    color: Colors.text,
  },
  fullMessage: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  fullRetry: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.shadow.lighter,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: 20,
    gap: 4,
  },
  fullRetryText: {
    fontSize: FontSize.sm,
    color: Colors.text,
    fontWeight: '600',
  },

  // Connection banner
  connectionBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    gap: Spacing.sm,
  },
  connectionDisconnected: {
    backgroundColor: Colors.fire.orange + '20',
    borderBottomWidth: 1,
    borderBottomColor: Colors.fire.orange,
  },
  connectionConnecting: {
    backgroundColor: Colors.frost.blue + '20',
    borderBottomWidth: 1,
    borderBottomColor: Colors.frost.blue,
  },
  connectionText: {
    flex: 1,
    fontSize: FontSize.sm,
    color: Colors.text,
  },
  connectionRetry: {
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.sm,
  },
  connectionRetryText: {
    fontSize: FontSize.sm,
    color: Colors.arcane.purple,
    fontWeight: '600',
  },

  // Offline wrapper
  offlineWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
  },
  offlineTitle: {
    fontSize: FontSize.xl,
    fontWeight: '700',
    color: Colors.text,
    marginTop: Spacing.lg,
  },
  offlineText: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    marginTop: Spacing.sm,
    textAlign: 'center',
  },
});

export default OfflineBanner;
