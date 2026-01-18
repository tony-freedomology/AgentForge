import React from 'react';
import { View, StyleSheet, ViewStyle, Pressable } from 'react-native';
import Animated, { useAnimatedStyle, withSpring, useSharedValue } from 'react-native-reanimated';
import { Colors, Spacing, BorderRadius, Shadows } from '../../constants/theme';
import { soundService } from '../../services/sound';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type CardVariant = 'stone' | 'parchment' | 'dark' | 'gold' | 'agent';

interface FantasyCardProps {
  children: React.ReactNode;
  variant?: CardVariant;
  onPress?: () => void;
  onLongPress?: () => void;
  style?: ViewStyle;
  glowColor?: string;
  glowing?: boolean;
  highlighted?: boolean;
}

const VARIANT_COLORS: Record<CardVariant, { bg: string; border: string }> = {
  stone: {
    bg: Colors.shadow.lighter,
    border: Colors.stone.dark,
  },
  parchment: {
    bg: Colors.parchment.default,
    border: Colors.parchment.dark,
  },
  dark: {
    bg: Colors.shadow.darker,
    border: Colors.shadow.lighter,
  },
  gold: {
    bg: Colors.holy.goldDark,
    border: Colors.holy.gold,
  },
  agent: {
    bg: Colors.shadow.lighter,
    border: Colors.stone.dark,
  },
};

export function FantasyCard({
  children,
  variant = 'stone',
  onPress,
  onLongPress,
  style,
  glowColor,
  glowing = false,
  highlighted = false,
}: FantasyCardProps) {
  const scale = useSharedValue(1);
  const colors = VARIANT_COLORS[variant];

  const handlePressIn = () => {
    if (onPress || onLongPress) {
      scale.value = withSpring(0.98, { damping: 15 });
    }
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15 });
  };

  const handlePress = () => {
    if (onPress) {
      soundService.play('tap');
      onPress();
    }
  };

  const handleLongPress = () => {
    if (onLongPress) {
      soundService.playHaptic('medium');
      onLongPress();
    }
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const glowStyle = glowing && glowColor ? Shadows.glow(glowColor) : {};

  const content = (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.bg,
          borderColor: highlighted ? Colors.holy.gold : colors.border,
        },
        glowStyle,
        style,
      ]}
    >
      {children}
    </View>
  );

  if (onPress || onLongPress) {
    return (
      <AnimatedPressable
        onPress={handlePress}
        onLongPress={handleLongPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={animatedStyle}
      >
        {content}
      </AnimatedPressable>
    );
  }

  return content;
}

const styles = StyleSheet.create({
  card: {
    borderRadius: BorderRadius.lg,
    borderWidth: 2,
    padding: Spacing.md,
    ...Shadows.md,
  },
});
