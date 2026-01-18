import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import Animated, { FadeIn, FadeOut, useAnimatedStyle, withRepeat, withTiming, useSharedValue } from 'react-native-reanimated';
import { useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Colors, Spacing, FontSize, BorderRadius } from '../constants/theme';
import { useConnectionStore } from '../stores/connectionStore';
import { ConnectionStatus } from '../shared/types/connection';
import { soundService } from '../services/sound';

export function ConnectionStatusBar() {
  const router = useRouter();
  const { connectionStatus, currentConnection, connectionError } = useConnectionStore();

  const pulseOpacity = useSharedValue(1);

  // Pulse animation for connecting state
  useEffect(() => {
    if (connectionStatus === 'connecting' || connectionStatus === 'reconnecting') {
      pulseOpacity.value = withRepeat(
        withTiming(0.4, { duration: 500 }),
        -1,
        true
      );
    } else {
      pulseOpacity.value = 1;
    }
  }, [connectionStatus]);

  const pulseStyle = useAnimatedStyle(() => ({
    opacity: pulseOpacity.value,
  }));

  if (connectionStatus === 'connected') {
    return null; // Don't show when connected
  }

  const getStatusConfig = (): {
    icon: string;
    color: string;
    text: string;
    showAction: boolean;
  } => {
    switch (connectionStatus) {
      case 'connecting':
        return {
          icon: 'sync-outline',
          color: Colors.holy.gold,
          text: 'Connecting to Forge...',
          showAction: false,
        };
      case 'reconnecting':
        return {
          icon: 'sync-outline',
          color: Colors.holy.gold,
          text: 'Reconnecting...',
          showAction: false,
        };
      case 'disconnected':
        return {
          icon: 'cloud-offline-outline',
          color: Colors.stone.default,
          text: 'Disconnected',
          showAction: true,
        };
      case 'error':
        return {
          icon: 'alert-circle-outline',
          color: Colors.fire.orange,
          text: connectionError || 'Connection error',
          showAction: true,
        };
      default:
        return {
          icon: 'cloud-offline-outline',
          color: Colors.stone.default,
          text: 'Not connected',
          showAction: true,
        };
    }
  };

  const config = getStatusConfig();

  const handlePress = () => {
    soundService.play('tap');
    router.push('/connect');
  };

  return (
    <Animated.View
      entering={FadeIn.duration(200)}
      exiting={FadeOut.duration(200)}
      style={[styles.container, { backgroundColor: config.color + '20' }]}
    >
      <Animated.View style={[styles.iconContainer, pulseStyle]}>
        <Ionicons name={config.icon as any} size={18} color={config.color} />
      </Animated.View>

      <Text style={[styles.text, { color: config.color }]} numberOfLines={1}>
        {config.text}
      </Text>

      {config.showAction && (
        <Pressable onPress={handlePress} style={styles.actionButton}>
          <Text style={styles.actionText}>Connect</Text>
        </Pressable>
      )}
    </Animated.View>
  );
}

// Compact version for header
export function ConnectionStatusIndicator() {
  const { connectionStatus } = useConnectionStore();

  const getColor = () => {
    switch (connectionStatus) {
      case 'connected':
        return Colors.fel.green;
      case 'connecting':
      case 'reconnecting':
        return Colors.holy.gold;
      case 'error':
        return Colors.fire.orange;
      default:
        return Colors.stone.default;
    }
  };

  return (
    <View style={[styles.indicator, { backgroundColor: getColor() }]} />
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  iconContainer: {
    marginRight: Spacing.sm,
  },
  text: {
    flex: 1,
    fontSize: FontSize.sm,
    fontWeight: '500',
  },
  actionButton: {
    backgroundColor: Colors.arcane.purple,
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.full,
  },
  actionText: {
    color: Colors.text,
    fontSize: FontSize.sm,
    fontWeight: '600',
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});
