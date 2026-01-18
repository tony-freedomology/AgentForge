import React from 'react';
import { View, Image, Text, StyleSheet, ImageStyle, ViewStyle, ImageSourcePropType } from 'react-native';
import Animated, {
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  useSharedValue,
  withDelay,
} from 'react-native-reanimated';
import { Colors, BorderRadius } from '../../constants/theme';
import { AgentSprites, statusToSpriteState, AgentSpriteState } from '../../constants/assets';

interface PixelAssetProps {
  /** The asset source (from require() in assets.ts) */
  source: ImageSourcePropType;
  /** Width of the asset */
  width: number;
  /** Height of the asset */
  height: number;
  /** Whether this is an animated sprite */
  animated?: boolean;
  /** Animation type for sprites */
  animationType?: 'idle' | 'working' | 'pulse' | 'bounce' | 'none';
  /** Additional style for the container */
  style?: ViewStyle;
  /** Additional style for the image */
  imageStyle?: ImageStyle;
  /** Test ID for testing */
  testID?: string;
}

/**
 * PixelAsset - Renders pixel art assets with optional animations
 */
export function PixelAsset({
  source,
  width,
  height,
  animated = false,
  animationType = 'none',
  style,
  imageStyle,
  testID,
}: PixelAssetProps) {
  // Animation values
  const animatedScale = useSharedValue(1);
  const animatedTranslateY = useSharedValue(0);
  const animatedOpacity = useSharedValue(1);

  // Start animations based on type
  React.useEffect(() => {
    if (!animated || animationType === 'none') return;

    switch (animationType) {
      case 'idle':
        // Gentle breathing animation
        animatedScale.value = withRepeat(
          withSequence(
            withTiming(1.02, { duration: 1500 }),
            withTiming(1, { duration: 1500 })
          ),
          -1,
          true
        );
        break;

      case 'working':
        // Busy working animation
        animatedTranslateY.value = withRepeat(
          withSequence(
            withTiming(-2, { duration: 200 }),
            withTiming(0, { duration: 200 })
          ),
          -1,
          true
        );
        break;

      case 'pulse':
        // Pulsing glow effect
        animatedOpacity.value = withRepeat(
          withSequence(
            withTiming(0.7, { duration: 800 }),
            withTiming(1, { duration: 800 })
          ),
          -1,
          true
        );
        break;

      case 'bounce':
        // Bouncy attention animation
        animatedTranslateY.value = withRepeat(
          withSequence(
            withTiming(-8, { duration: 300 }),
            withTiming(0, { duration: 300 }),
            withDelay(500, withTiming(0, { duration: 0 }))
          ),
          -1,
          true
        );
        break;
    }
  }, [animated, animationType]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: animatedScale.value },
      { translateY: animatedTranslateY.value },
    ],
    opacity: animatedOpacity.value,
  }));

  const content = (
    <Image
      source={source}
      style={[{ width, height }, imageStyle]}
      resizeMode="contain"
    />
  );

  if (animated && animationType !== 'none') {
    return (
      <Animated.View style={[style, animatedStyle]} testID={testID}>
        {content}
      </Animated.View>
    );
  }

  return (
    <View style={style} testID={testID}>
      {content}
    </View>
  );
}

/**
 * Pre-configured agent sprite component
 */
interface AgentSpriteProps {
  agentClass: 'mage' | 'architect' | 'engineer' | 'scout' | 'guardian' | 'artisan';
  state?: 'idle' | 'working' | 'waiting' | 'complete' | 'error' | 'sleeping' | 'spawning';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  animated?: boolean;
  style?: ViewStyle;
}

const SPRITE_SIZES = {
  sm: { width: 32, height: 32 },
  md: { width: 48, height: 48 },
  lg: { width: 64, height: 64 },
  xl: { width: 96, height: 96 },
};

export function AgentSprite({
  agentClass,
  state = 'idle',
  size = 'md',
  animated = true,
  style,
}: AgentSpriteProps) {
  const { width, height } = SPRITE_SIZES[size];

  // Get the sprite source
  const sprites = AgentSprites[agentClass];
  const source = sprites?.[state as AgentSpriteState] || sprites?.idle || AgentSprites.mage.idle;

  // Map state to animation type
  const animationType =
    state === 'working'
      ? 'working'
      : state === 'error'
      ? 'pulse'
      : state === 'complete'
      ? 'bounce'
      : state === 'waiting'
      ? 'pulse'
      : 'idle';

  return (
    <PixelAsset
      source={source}
      width={width}
      height={height}
      animated={animated}
      animationType={animated ? animationType : 'none'}
      style={style}
    />
  );
}

/**
 * Agent portrait for detail views
 */
interface AgentPortraitProps {
  agentClass: 'mage' | 'architect' | 'engineer' | 'scout' | 'guardian' | 'artisan';
  size?: number;
  style?: ViewStyle;
}

export function AgentPortrait({ agentClass, size = 120, style }: AgentPortraitProps) {
  const sprites = AgentSprites[agentClass];
  const source = sprites?.portrait || AgentSprites.mage.portrait;

  return (
    <View style={style}>
      <Image
        source={source}
        style={{ width: size, height: size }}
        resizeMode="contain"
      />
    </View>
  );
}

/**
 * Pre-configured icon component using real assets
 */
interface PixelIconProps {
  /** Icon source from Icons constant */
  source: ImageSourcePropType;
  size?: number;
  style?: ViewStyle;
}

export function PixelIcon({
  source,
  size = 24,
  style,
}: PixelIconProps) {
  return (
    <View style={style}>
      <Image
        source={source}
        style={{ width: size, height: size }}
        resizeMode="contain"
      />
    </View>
  );
}

/**
 * Pre-configured effect component with animation
 */
interface PixelEffectProps {
  source: ImageSourcePropType;
  size?: number;
  animated?: boolean;
  style?: ViewStyle;
}

export function PixelEffect({
  source,
  size = 32,
  animated = true,
  style,
}: PixelEffectProps) {
  return (
    <PixelAsset
      source={source}
      width={size}
      height={size}
      animated={animated}
      animationType={animated ? 'pulse' : 'none'}
      style={style}
    />
  );
}

/**
 * Pre-configured loot item component
 */
interface LootItemProps {
  source: ImageSourcePropType;
  rarity?: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  size?: number;
  style?: ViewStyle;
}

const RARITY_COLORS: Record<string, string> = {
  common: Colors.stone.light,
  uncommon: Colors.fel.green,
  rare: Colors.frost.blue,
  epic: Colors.arcane.purple,
  legendary: Colors.holy.gold,
};

export function LootItem({
  source,
  rarity = 'common',
  size = 48,
  style,
}: LootItemProps) {
  const color = RARITY_COLORS[rarity];

  return (
    <View style={[styles.lootContainer, { borderColor: color }, style]}>
      <Image
        source={source}
        style={{ width: size, height: size }}
        resizeMode="contain"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  lootContainer: {
    borderWidth: 2,
    borderRadius: BorderRadius.md,
    padding: 4,
    backgroundColor: Colors.shadow.darker,
  },
});

export default PixelAsset;
