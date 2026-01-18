import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  withRepeat,
  withTiming,
  useSharedValue,
  Easing,
} from 'react-native-reanimated';
import { useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Colors, FontSize, Spacing } from '../../constants/theme';

interface LoadingRuneProps {
  size?: 'sm' | 'md' | 'lg';
  color?: string;
  label?: string;
  style?: ViewStyle;
}

const SIZE_CONFIG = {
  sm: { iconSize: 24, fontSize: FontSize.sm },
  md: { iconSize: 40, fontSize: FontSize.md },
  lg: { iconSize: 64, fontSize: FontSize.lg },
};

export function LoadingRune({
  size = 'md',
  color = Colors.arcane.purple,
  label,
  style,
}: LoadingRuneProps) {
  const rotation = useSharedValue(0);
  const scale = useSharedValue(1);
  const opacity = useSharedValue(0.7);
  const sizeConfig = SIZE_CONFIG[size];

  useEffect(() => {
    rotation.value = withRepeat(
      withTiming(360, {
        duration: 2000,
        easing: Easing.linear,
      }),
      -1,
      false
    );

    scale.value = withRepeat(
      withTiming(1.1, {
        duration: 1000,
        easing: Easing.inOut(Easing.ease),
      }),
      -1,
      true
    );

    opacity.value = withRepeat(
      withTiming(1, {
        duration: 1000,
        easing: Easing.inOut(Easing.ease),
      }),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { rotate: `${rotation.value}deg` },
      { scale: scale.value },
    ],
    opacity: opacity.value,
  }));

  return (
    <View style={[styles.container, style]}>
      <Animated.View style={animatedStyle}>
        <Ionicons
          name="sparkles"
          size={sizeConfig.iconSize}
          color={color}
        />
      </Animated.View>
      {label && (
        <Text style={[styles.label, { fontSize: sizeConfig.fontSize }]}>
          {label}
        </Text>
      )}
    </View>
  );
}

// Full screen loading overlay
interface LoadingOverlayProps {
  visible: boolean;
  label?: string;
}

export function LoadingOverlay({ visible, label }: LoadingOverlayProps) {
  if (!visible) return null;

  return (
    <View style={styles.overlay}>
      <LoadingRune size="lg" label={label} />
    </View>
  );
}

// Inline loading dots
interface LoadingDotsProps {
  color?: string;
  style?: ViewStyle;
}

export function LoadingDots({ color = Colors.textSecondary, style }: LoadingDotsProps) {
  const dot1Opacity = useSharedValue(0.3);
  const dot2Opacity = useSharedValue(0.3);
  const dot3Opacity = useSharedValue(0.3);

  useEffect(() => {
    dot1Opacity.value = withRepeat(
      withTiming(1, { duration: 300 }),
      -1,
      true
    );

    setTimeout(() => {
      dot2Opacity.value = withRepeat(
        withTiming(1, { duration: 300 }),
        -1,
        true
      );
    }, 100);

    setTimeout(() => {
      dot3Opacity.value = withRepeat(
        withTiming(1, { duration: 300 }),
        -1,
        true
      );
    }, 200);
  }, []);

  const dot1Style = useAnimatedStyle(() => ({ opacity: dot1Opacity.value }));
  const dot2Style = useAnimatedStyle(() => ({ opacity: dot2Opacity.value }));
  const dot3Style = useAnimatedStyle(() => ({ opacity: dot3Opacity.value }));

  return (
    <View style={[styles.dotsContainer, style]}>
      <Animated.View style={[styles.dot, { backgroundColor: color }, dot1Style]} />
      <Animated.View style={[styles.dot, { backgroundColor: color }, dot2Style]} />
      <Animated.View style={[styles.dot, { backgroundColor: color }, dot3Style]} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    color: Colors.textSecondary,
    marginTop: Spacing.md,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: Colors.shadow.black + 'CC', // 80% opacity
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  dotsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
});
