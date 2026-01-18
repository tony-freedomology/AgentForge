import React from 'react';
import { View, Text, StyleSheet, Pressable, Image } from 'react-native';
import Animated, {
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  useSharedValue,
  Easing,
} from 'react-native-reanimated';
import { useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius, FontSize, Shadows } from '../../constants/theme';
import { Effects } from '../../constants/assets';
import { soundService } from '../../services/sound';

interface SummonPortalProps {
  onPress: () => void;
  disabled?: boolean;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function SummonPortal({ onPress, disabled = false }: SummonPortalProps) {
  const rotation = useSharedValue(0);
  const scale = useSharedValue(1);
  const glowOpacity = useSharedValue(0.5);

  // Continuous subtle rotation for the portal effect
  useEffect(() => {
    if (!disabled) {
      rotation.value = withRepeat(
        withTiming(360, {
          duration: 20000,
          easing: Easing.linear,
        }),
        -1,
        false
      );

      glowOpacity.value = withRepeat(
        withSequence(
          withTiming(0.8, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
          withTiming(0.4, { duration: 1500, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      );
    }
  }, [disabled]);

  const handlePress = () => {
    if (!disabled) {
      soundService.play('tap');
      onPress();
    }
  };

  const handlePressIn = () => {
    if (!disabled) {
      scale.value = withTiming(0.95, { duration: 100 });
    }
  };

  const handlePressOut = () => {
    scale.value = withTiming(1, { duration: 100 });
  };

  const portalStyle = useAnimatedStyle(() => ({
    transform: [
      { rotate: `${rotation.value}deg` },
    ],
  }));

  const containerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }));

  return (
    <AnimatedPressable
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
      style={[styles.container, containerStyle, disabled && styles.disabled]}
    >
      {/* Glow effect */}
      <Animated.View style={[styles.glow, glowStyle]} />

      {/* Portal ring with pixel art */}
      <Animated.View style={[styles.portalRing, portalStyle]}>
        <Image
          source={Effects.spawnPortal}
          style={styles.portalImage}
          resizeMode="contain"
        />
      </Animated.View>

      {/* Label */}
      <Text style={[styles.label, disabled && styles.labelDisabled]}>
        SUMMON AGENT
      </Text>
    </AnimatedPressable>
  );
}

// Smaller version for inline use
interface MiniSummonButtonProps {
  onPress: () => void;
  disabled?: boolean;
}

export function MiniSummonButton({ onPress, disabled }: MiniSummonButtonProps) {
  return (
    <Pressable
      onPress={() => {
        if (!disabled) {
          soundService.play('tap');
          onPress();
        }
      }}
      disabled={disabled}
      style={[styles.miniButton, disabled && styles.disabled]}
    >
      <Ionicons
        name="add-circle"
        size={24}
        color={disabled ? Colors.textMuted : Colors.arcane.purple}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: Spacing.lg,
    marginHorizontal: Spacing.md,
  },
  disabled: {
    opacity: 0.5,
  },
  glow: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.arcane.purple,
    ...Shadows.glow(Colors.arcane.purple),
  },
  portalRing: {
    width: 100,
    height: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  portalImage: {
    width: 100,
    height: 100,
  },
  label: {
    marginTop: Spacing.md,
    fontSize: FontSize.md,
    fontWeight: '700',
    color: Colors.arcane.purple,
    letterSpacing: 2,
  },
  labelDisabled: {
    color: Colors.textMuted,
  },
  miniButton: {
    padding: Spacing.sm,
  },
});
