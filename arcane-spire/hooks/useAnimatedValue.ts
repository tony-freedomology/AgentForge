import { useRef, useEffect } from 'react';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withRepeat,
  withSequence,
  Easing,
  cancelAnimation,
} from 'react-native-reanimated';

// Pulse animation for attention states
export function usePulseAnimation(active: boolean, intensity: number = 1) {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  useEffect(() => {
    if (active) {
      scale.value = withRepeat(
        withSequence(
          withTiming(1 + 0.05 * intensity, { duration: 500, easing: Easing.inOut(Easing.ease) }),
          withTiming(1, { duration: 500, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      );

      opacity.value = withRepeat(
        withSequence(
          withTiming(0.7, { duration: 500 }),
          withTiming(1, { duration: 500 })
        ),
        -1,
        true
      );
    } else {
      cancelAnimation(scale);
      cancelAnimation(opacity);
      scale.value = withSpring(1);
      opacity.value = withSpring(1);
    }
  }, [active, intensity]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return animatedStyle;
}

// Glow animation for working states
export function useGlowAnimation(active: boolean, color: string) {
  const glowOpacity = useSharedValue(0);
  const glowScale = useSharedValue(1);

  useEffect(() => {
    if (active) {
      glowOpacity.value = withRepeat(
        withSequence(
          withTiming(0.5, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
          withTiming(0.2, { duration: 1000, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      );

      glowScale.value = withRepeat(
        withSequence(
          withTiming(1.02, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
          withTiming(1, { duration: 1000, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      );
    } else {
      cancelAnimation(glowOpacity);
      cancelAnimation(glowScale);
      glowOpacity.value = withTiming(0, { duration: 300 });
      glowScale.value = withTiming(1, { duration: 300 });
    }
  }, [active]);

  const glowStyle = useAnimatedStyle(() => ({
    shadowColor: color,
    shadowOpacity: glowOpacity.value,
    shadowRadius: 10 * glowScale.value,
    transform: [{ scale: glowScale.value }],
  }));

  return glowStyle;
}

// Shake animation for errors
export function useShakeAnimation() {
  const translateX = useSharedValue(0);

  const shake = () => {
    translateX.value = withSequence(
      withTiming(-10, { duration: 50 }),
      withTiming(10, { duration: 100 }),
      withTiming(-10, { duration: 100 }),
      withTiming(10, { duration: 100 }),
      withTiming(0, { duration: 50 })
    );
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  return { animatedStyle, shake };
}

// Float animation for idle states
export function useFloatAnimation(active: boolean) {
  const translateY = useSharedValue(0);

  useEffect(() => {
    if (active) {
      translateY.value = withRepeat(
        withSequence(
          withTiming(-5, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
          withTiming(0, { duration: 1500, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      );
    } else {
      cancelAnimation(translateY);
      translateY.value = withSpring(0);
    }
  }, [active]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  return animatedStyle;
}

// Spawn animation (fade in + scale up)
export function useSpawnAnimation(trigger: boolean) {
  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);
  const rotation = useSharedValue(0);

  useEffect(() => {
    if (trigger) {
      scale.value = withSequence(
        withTiming(0, { duration: 0 }),
        withSpring(1.1, { damping: 8 }),
        withSpring(1, { damping: 10 })
      );

      opacity.value = withTiming(1, { duration: 500 });

      rotation.value = withSequence(
        withTiming(0, { duration: 0 }),
        withTiming(360, { duration: 1000, easing: Easing.out(Easing.cubic) })
      );
    }
  }, [trigger]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { rotate: `${rotation.value}deg` },
    ],
    opacity: opacity.value,
  }));

  return animatedStyle;
}

// Progress bar animation
export function useProgressAnimation(progress: number) {
  const width = useSharedValue(0);

  useEffect(() => {
    width.value = withSpring(progress, { damping: 15 });
  }, [progress]);

  const animatedStyle = useAnimatedStyle(() => ({
    width: `${width.value}%`,
  }));

  return animatedStyle;
}

// Slide in animation
export function useSlideInAnimation(visible: boolean, direction: 'left' | 'right' | 'up' | 'down' = 'up') {
  const offset = useSharedValue(100);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      offset.value = withSpring(0, { damping: 15 });
      opacity.value = withTiming(1, { duration: 200 });
    } else {
      offset.value = withTiming(100, { duration: 200 });
      opacity.value = withTiming(0, { duration: 200 });
    }
  }, [visible]);

  const animatedStyle = useAnimatedStyle(() => {
    const transform = [];
    switch (direction) {
      case 'left':
        transform.push({ translateX: -offset.value });
        break;
      case 'right':
        transform.push({ translateX: offset.value });
        break;
      case 'up':
        transform.push({ translateY: offset.value });
        break;
      case 'down':
        transform.push({ translateY: -offset.value });
        break;
    }

    return {
      transform,
      opacity: opacity.value,
    };
  });

  return animatedStyle;
}
