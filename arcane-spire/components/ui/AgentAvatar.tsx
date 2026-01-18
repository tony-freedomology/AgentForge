import React from 'react';
import { View, Text, StyleSheet, ViewStyle, Image } from 'react-native';
import Animated from 'react-native-reanimated';
import { Colors, BorderRadius, Shadows } from '../../constants/theme';
import { AgentColors } from '../../constants/theme';
import { AGENT_CLASSES, AgentClass, AgentStatus } from '../../shared/types/agent';
import { useGlowAnimation, usePulseAnimation, useFloatAnimation } from '../../hooks/useAnimatedValue';
import { StatusBadge } from './StatusBadge';

interface AgentAvatarProps {
  agentClass: AgentClass;
  status: AgentStatus;
  name?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showStatus?: boolean;
  showName?: boolean;
  style?: ViewStyle;
}

const SIZE_CONFIG = {
  sm: { container: 32, icon: 20, statusSize: 'sm' as const },
  md: { container: 48, icon: 28, statusSize: 'sm' as const },
  lg: { container: 64, icon: 36, statusSize: 'md' as const },
  xl: { container: 96, icon: 56, statusSize: 'md' as const },
};

export function AgentAvatar({
  agentClass,
  status,
  name,
  size = 'md',
  showStatus = false,
  showName = false,
  style,
}: AgentAvatarProps) {
  const classInfo = AGENT_CLASSES[agentClass];
  const sizeConfig = SIZE_CONFIG[size];
  const color = AgentColors[agentClass];

  // Animations based on status
  const isWorking = status === 'channeling';
  const needsAttention = status === 'awaiting' || status === 'error';
  const isIdle = status === 'dormant';

  const glowStyle = useGlowAnimation(isWorking, color);
  const pulseStyle = usePulseAnimation(needsAttention, 1.2);
  const floatStyle = useFloatAnimation(isIdle);

  // Combine animations based on status
  const getAnimatedStyle = () => {
    if (needsAttention) return pulseStyle;
    if (isWorking) return glowStyle;
    if (isIdle) return floatStyle;
    return {};
  };

  return (
    <View style={[styles.wrapper, style]}>
      <Animated.View
        style={[
          styles.container,
          {
            width: sizeConfig.container,
            height: sizeConfig.container,
            backgroundColor: color + '30', // 30% opacity
            borderColor: color,
          },
          getAnimatedStyle(),
        ]}
      >
        {/* Placeholder emoji - will be replaced with pixel art */}
        <Text style={{ fontSize: sizeConfig.icon }}>{classInfo.icon}</Text>

        {/* Status badge */}
        {showStatus && (
          <View style={styles.statusContainer}>
            <StatusBadge status={status} size={sizeConfig.statusSize} />
          </View>
        )}
      </Animated.View>

      {/* Name label */}
      {showName && name && (
        <Text style={styles.name} numberOfLines={1}>
          {name}
        </Text>
      )}
    </View>
  );
}

// Mini avatar for Party Dock
interface MiniAvatarProps {
  agentClass: AgentClass;
  status: AgentStatus;
  contextPercentage: number;
  onPress?: () => void;
  style?: ViewStyle;
}

export function MiniAvatar({
  agentClass,
  status,
  contextPercentage,
  onPress,
  style,
}: MiniAvatarProps) {
  const classInfo = AGENT_CLASSES[agentClass];
  const color = AgentColors[agentClass];
  const needsAttention = status === 'awaiting' || status === 'error' || status === 'complete';
  const pulseStyle = usePulseAnimation(needsAttention, 1);

  return (
    <Animated.View style={[styles.miniContainer, style, pulseStyle]}>
      <View
        style={[
          styles.miniAvatar,
          {
            backgroundColor: color + '30',
            borderColor: needsAttention ? Colors.holy.gold : color,
          },
        ]}
      >
        <Text style={styles.miniIcon}>{classInfo.icon}</Text>
      </View>

      {/* Mini context bar */}
      <View style={styles.miniBarContainer}>
        <View
          style={[
            styles.miniBar,
            {
              width: `${contextPercentage}%`,
              backgroundColor: color,
            },
          ]}
        />
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
  },
  container: {
    borderRadius: BorderRadius.lg,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.sm,
  },
  statusContainer: {
    position: 'absolute',
    bottom: -4,
    right: -4,
  },
  name: {
    color: Colors.text,
    fontSize: 12,
    fontWeight: '500',
    marginTop: 4,
    textAlign: 'center',
    maxWidth: 80,
  },
  miniContainer: {
    alignItems: 'center',
    width: 48,
  },
  miniAvatar: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.md,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  miniIcon: {
    fontSize: 24,
  },
  miniBarContainer: {
    width: 36,
    height: 4,
    backgroundColor: Colors.shadow.darker,
    borderRadius: 2,
    marginTop: 4,
    overflow: 'hidden',
  },
  miniBar: {
    height: '100%',
    borderRadius: 2,
  },
});
