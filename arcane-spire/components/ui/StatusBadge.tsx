import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import Animated from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius, FontSize } from '../../constants/theme';
import { StatusColors } from '../../constants/theme';
import { usePulseAnimation } from '../../hooks/useAnimatedValue';
import { AgentStatus, AgentActivity } from '../../shared/types/agent';

interface StatusBadgeProps {
  status: AgentStatus;
  activity?: AgentActivity;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
  style?: ViewStyle;
}

const STATUS_CONFIG: Record<AgentStatus, { icon: string; label: string; pulsing: boolean }> = {
  spawning: { icon: 'sparkles', label: 'Spawning', pulsing: true },
  channeling: { icon: 'flash', label: 'Channeling', pulsing: false },
  dormant: { icon: 'moon', label: 'Dormant', pulsing: false },
  awaiting: { icon: 'help-circle', label: 'Awaiting', pulsing: true },
  complete: { icon: 'checkmark-circle', label: 'Complete', pulsing: true },
  error: { icon: 'warning', label: 'Error', pulsing: true },
};

const SIZE_CONFIG = {
  sm: { iconSize: 12, fontSize: FontSize.xs, padding: Spacing.xs },
  md: { iconSize: 16, fontSize: FontSize.sm, padding: Spacing.sm },
  lg: { iconSize: 20, fontSize: FontSize.md, padding: Spacing.md },
};

export function StatusBadge({
  status,
  activity,
  showLabel = false,
  size = 'md',
  style,
}: StatusBadgeProps) {
  const config = STATUS_CONFIG[status];
  const sizeConfig = SIZE_CONFIG[size];
  const color = StatusColors[status];
  const shouldPulse = config.pulsing && (status === 'awaiting' || status === 'error');
  const pulseStyle = usePulseAnimation(shouldPulse, 1);

  return (
    <Animated.View
      style={[
        styles.badge,
        {
          backgroundColor: color + '30', // 30% opacity
          paddingHorizontal: sizeConfig.padding,
          paddingVertical: sizeConfig.padding / 2,
        },
        style,
        pulseStyle,
      ]}
    >
      <Ionicons
        name={config.icon as any}
        size={sizeConfig.iconSize}
        color={color}
      />
      {showLabel && (
        <Text
          style={[
            styles.label,
            {
              color,
              fontSize: sizeConfig.fontSize,
              marginLeft: Spacing.xs,
            },
          ]}
        >
          {config.label}
        </Text>
      )}
    </Animated.View>
  );
}

// Activity badge (smaller, icon only)
interface ActivityBadgeProps {
  activity: AgentActivity;
  size?: 'sm' | 'md';
  style?: ViewStyle;
}

const ACTIVITY_ICONS: Record<AgentActivity, string> = {
  idle: 'moon-outline',
  thinking: 'bulb-outline',
  researching: 'search-outline',
  reading: 'book-outline',
  writing: 'pencil-outline',
  testing: 'flask-outline',
  building: 'hammer-outline',
  git: 'git-branch-outline',
  waiting: 'chatbubble-ellipses-outline',
  error: 'alert-circle-outline',
};

export function ActivityBadge({ activity, size = 'sm', style }: ActivityBadgeProps) {
  const iconSize = size === 'sm' ? 14 : 18;

  return (
    <View style={[styles.activityBadge, style]}>
      <Ionicons
        name={ACTIVITY_ICONS[activity] as any}
        size={iconSize}
        color={Colors.textSecondary}
      />
    </View>
  );
}

// Count badge (for notifications)
interface CountBadgeProps {
  count: number;
  maxCount?: number;
  variant?: 'default' | 'alert' | 'new';
  style?: ViewStyle;
}

export function CountBadge({
  count,
  maxCount = 99,
  variant = 'default',
  style,
}: CountBadgeProps) {
  if (count <= 0) return null;

  const displayCount = count > maxCount ? `${maxCount}+` : count.toString();
  const bgColor = variant === 'alert' ? Colors.fire.orange : variant === 'new' ? Colors.arcane.purple : Colors.fire.orange;

  return (
    <View style={[styles.countBadge, { backgroundColor: bgColor }, style]}>
      <Text style={styles.countText}>{displayCount}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: BorderRadius.full,
  },
  label: {
    fontWeight: '600',
  },
  activityBadge: {
    padding: 2,
  },
  countBadge: {
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  countText: {
    color: Colors.text,
    fontSize: FontSize.xs,
    fontWeight: '700',
  },
});
