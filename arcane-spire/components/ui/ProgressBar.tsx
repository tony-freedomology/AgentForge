import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import Animated from 'react-native-reanimated';
import { Colors, Spacing, BorderRadius, FontSize } from '../../constants/theme';
import { useProgressAnimation } from '../../hooks/useAnimatedValue';

type ProgressVariant = 'mana' | 'health' | 'xp' | 'gold' | 'default';

interface ProgressBarProps {
  progress: number; // 0-100
  variant?: ProgressVariant;
  showLabel?: boolean;
  label?: string;
  showPercentage?: boolean;
  height?: number;
  style?: ViewStyle;
}

const VARIANT_COLORS: Record<ProgressVariant, { fill: string; bg: string }> = {
  mana: {
    fill: Colors.frost.blue,
    bg: Colors.frost.blueDark,
  },
  health: {
    fill: Colors.fel.green,
    bg: Colors.fel.greenDark,
  },
  xp: {
    fill: Colors.arcane.purple,
    bg: Colors.arcane.purpleDark,
  },
  gold: {
    fill: Colors.holy.gold,
    bg: Colors.holy.goldDark,
  },
  default: {
    fill: Colors.stone.light,
    bg: Colors.stone.dark,
  },
};

export function ProgressBar({
  progress,
  variant = 'default',
  showLabel = false,
  label,
  showPercentage = false,
  height = 12,
  style,
}: ProgressBarProps) {
  const clampedProgress = Math.min(100, Math.max(0, progress));
  const colors = VARIANT_COLORS[variant];
  const animatedWidth = useProgressAnimation(clampedProgress);

  return (
    <View style={[styles.container, style]}>
      {(showLabel || showPercentage) && (
        <View style={styles.labelContainer}>
          {showLabel && label && (
            <Text style={styles.label}>{label}</Text>
          )}
          {showPercentage && (
            <Text style={styles.percentage}>{Math.round(clampedProgress)}%</Text>
          )}
        </View>
      )}
      <View
        style={[
          styles.track,
          {
            height,
            backgroundColor: colors.bg,
          },
        ]}
      >
        <Animated.View
          style={[
            styles.fill,
            {
              backgroundColor: colors.fill,
              height: '100%',
            },
            animatedWidth,
          ]}
        />
      </View>
    </View>
  );
}

// Compact version for floor cards
interface MiniProgressBarProps {
  progress: number;
  variant?: ProgressVariant;
  style?: ViewStyle;
}

export function MiniProgressBar({ progress, variant = 'mana', style }: MiniProgressBarProps) {
  const clampedProgress = Math.min(100, Math.max(0, progress));
  const colors = VARIANT_COLORS[variant];
  const animatedWidth = useProgressAnimation(clampedProgress);

  return (
    <View style={[styles.miniTrack, { backgroundColor: colors.bg }, style]}>
      <Animated.View
        style={[
          styles.miniFill,
          { backgroundColor: colors.fill },
          animatedWidth,
        ]}
      />
    </View>
  );
}

// Segmented progress (e.g., 3/10 tests)
interface SegmentedProgressProps {
  current: number;
  total: number;
  label?: string;
  variant?: ProgressVariant;
  style?: ViewStyle;
}

export function SegmentedProgress({
  current,
  total,
  label,
  variant = 'gold',
  style,
}: SegmentedProgressProps) {
  const colors = VARIANT_COLORS[variant];
  const percentage = total > 0 ? (current / total) * 100 : 0;
  const animatedWidth = useProgressAnimation(percentage);

  return (
    <View style={[styles.segmentedContainer, style]}>
      <View style={[styles.track, { height: 8, backgroundColor: colors.bg }]}>
        <Animated.View
          style={[
            styles.fill,
            { backgroundColor: colors.fill, height: '100%' },
            animatedWidth,
          ]}
        />
      </View>
      <Text style={styles.segmentedLabel}>
        {current}/{total} {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  labelContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.xs,
  },
  label: {
    color: Colors.textSecondary,
    fontSize: FontSize.xs,
  },
  percentage: {
    color: Colors.textSecondary,
    fontSize: FontSize.xs,
  },
  track: {
    width: '100%',
    borderRadius: BorderRadius.sm,
    overflow: 'hidden',
  },
  fill: {
    borderRadius: BorderRadius.sm,
  },
  miniTrack: {
    width: '100%',
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  miniFill: {
    height: '100%',
    borderRadius: 2,
  },
  segmentedContainer: {
    width: '100%',
  },
  segmentedLabel: {
    color: Colors.textSecondary,
    fontSize: FontSize.xs,
    marginTop: 2,
    textAlign: 'right',
  },
});
