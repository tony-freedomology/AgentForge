import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
} from 'react-native';
import Animated, { useAnimatedStyle, withSpring, useSharedValue } from 'react-native-reanimated';
import { Colors, Spacing, BorderRadius, FontSize, Shadows } from '../../constants/theme';
import { soundService } from '../../services/sound';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost' | 'summon';
type ButtonSize = 'sm' | 'md' | 'lg';

interface FantasyButtonProps {
  children: React.ReactNode;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  fullWidth?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

const VARIANT_COLORS: Record<ButtonVariant, { bg: string; text: string; border: string }> = {
  primary: {
    bg: Colors.holy.gold,
    text: Colors.shadow.black,
    border: Colors.holy.goldDark,
  },
  secondary: {
    bg: Colors.stone.dark,
    text: Colors.text,
    border: Colors.stone.default,
  },
  danger: {
    bg: Colors.fire.orange,
    text: Colors.text,
    border: Colors.fire.orangeDark,
  },
  ghost: {
    bg: 'transparent',
    text: Colors.textSecondary,
    border: Colors.border,
  },
  summon: {
    bg: Colors.arcane.purple,
    text: Colors.text,
    border: Colors.arcane.purpleDark,
  },
};

const SIZE_STYLES: Record<ButtonSize, { height: number; paddingHorizontal: number; fontSize: number }> = {
  sm: { height: 32, paddingHorizontal: Spacing.md, fontSize: FontSize.sm },
  md: { height: 44, paddingHorizontal: Spacing.lg, fontSize: FontSize.md },
  lg: { height: 56, paddingHorizontal: Spacing.xl, fontSize: FontSize.lg },
};

export function FantasyButton({
  children,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  icon,
  fullWidth = false,
  style,
  textStyle,
}: FantasyButtonProps) {
  const scale = useSharedValue(1);
  const colors = VARIANT_COLORS[variant];
  const sizeStyle = SIZE_STYLES[size];

  const handlePressIn = () => {
    scale.value = withSpring(0.96, { damping: 15 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15 });
  };

  const handlePress = () => {
    if (disabled || loading) return;
    soundService.play('tap');
    onPress();
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedTouchable
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled || loading}
      activeOpacity={0.8}
      style={[
        styles.button,
        {
          backgroundColor: colors.bg,
          borderColor: colors.border,
          height: sizeStyle.height,
          paddingHorizontal: sizeStyle.paddingHorizontal,
          opacity: disabled ? 0.5 : 1,
        },
        fullWidth && styles.fullWidth,
        animatedStyle,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator size="small" color={colors.text} />
      ) : (
        <>
          {icon}
          <Text
            style={[
              styles.text,
              {
                color: colors.text,
                fontSize: sizeStyle.fontSize,
                marginLeft: icon ? Spacing.sm : 0,
              },
              textStyle,
            ]}
          >
            {children}
          </Text>
        </>
      )}
    </AnimatedTouchable>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BorderRadius.md,
    borderWidth: 2,
    ...Shadows.sm,
  },
  fullWidth: {
    width: '100%',
  },
  text: {
    fontWeight: '600',
    textAlign: 'center',
  },
});
