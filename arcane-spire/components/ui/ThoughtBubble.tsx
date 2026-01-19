import React from 'react';
import { View, Text, StyleSheet, ViewStyle, Image, ImageBackground } from 'react-native';
import Animated, { FadeIn, FadeOut, SlideInUp } from 'react-native-reanimated';
import { Colors, Spacing, BorderRadius, FontSize } from '../../constants/theme';
import { Effects, Icons } from '../../constants/assets';

type BubbleType = 'thought' | 'speech' | 'action';

interface ThoughtBubbleProps {
  content: string;
  type?: BubbleType;
  maxLines?: number;
  style?: ViewStyle;
  onPress?: () => void;
}

const TYPE_CONFIG: Record<BubbleType, { bg: string; border: string; textColor: string }> = {
  thought: {
    bg: Colors.shadow.lighter,
    border: Colors.stone.dark,
    textColor: Colors.textSecondary,
  },
  speech: {
    bg: Colors.parchment.default,
    border: Colors.parchment.dark,
    textColor: Colors.shadow.black,
  },
  action: {
    bg: Colors.arcane.purple + '30',
    border: Colors.arcane.purple,
    textColor: Colors.arcane.purpleLight,
  },
};

export function ThoughtBubble({
  content,
  type = 'thought',
  maxLines = 3,
  style,
  onPress,
}: ThoughtBubbleProps) {
  const config = TYPE_CONFIG[type];

  // Get the appropriate bubble tail based on type
  const getBubbleTail = () => {
    return type === 'thought' ? Effects.bubbleThoughtTail : Effects.bubbleSpeechTail;
  };

  return (
    <Animated.View
      entering={FadeIn.duration(300).springify()}
      exiting={FadeOut.duration(200)}
      style={[styles.bubbleContainer, style]}
    >
      <ImageBackground
        source={type === 'thought' ? Effects.bubbleThought : Effects.bubbleSpeech}
        style={[
          styles.bubble,
          {
            borderColor: config.border,
          },
        ]}
        imageStyle={styles.bubbleImage}
      >
        <Text
          style={[styles.text, { color: config.textColor }]}
          numberOfLines={maxLines}
        >
          {type === 'thought' ? `"${content}"` : content}
        </Text>
      </ImageBackground>
      {/* Bubble tail */}
      <Image
        source={getBubbleTail()}
        style={styles.tailImage}
        resizeMode="contain"
      />
    </Animated.View>
  );
}

// Floating thought that appears and fades
interface FloatingThoughtProps {
  content: string;
  visible: boolean;
  position?: 'top' | 'bottom';
  style?: ViewStyle;
}

export function FloatingThought({
  content,
  visible,
  position = 'top',
  style,
}: FloatingThoughtProps) {
  if (!visible) return null;

  return (
    <Animated.View
      entering={SlideInUp.duration(300).springify()}
      exiting={FadeOut.duration(200)}
      style={[
        styles.floatingContainer,
        position === 'bottom' && styles.floatingBottom,
        style,
      ]}
    >
      <View style={styles.floatingBubble}>
        <Text style={styles.floatingText} numberOfLines={2}>
          {content}
        </Text>
      </View>
    </Animated.View>
  );
}

// Thought history item
interface ThoughtHistoryItemProps {
  content: string;
  type: 'thinking' | 'action' | 'result';
  timestamp?: Date;
}

export function ThoughtHistoryItem({ content, type, timestamp }: ThoughtHistoryItemProps) {
  const getIconSource = () => {
    switch (type) {
      case 'thinking':
        return Icons.activity.thinking;
      case 'action':
        return Icons.status.working;
      case 'result':
        return Icons.status.complete;
    }
  };

  return (
    <View style={styles.historyItem}>
      <Image source={getIconSource()} style={styles.historyIcon} resizeMode="contain" />
      <Text style={styles.historyText} numberOfLines={2}>
        {content}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  bubbleContainer: {
    maxWidth: '90%',
    alignSelf: 'center',
    alignItems: 'center',
  },
  bubble: {
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 2,
    overflow: 'hidden',
  },
  bubbleImage: {
    borderRadius: BorderRadius.lg - 2,
    opacity: 0.95,
  },
  text: {
    fontSize: FontSize.sm,
    fontStyle: 'italic',
    lineHeight: FontSize.sm * 1.4,
  },
  tailImage: {
    width: 20,
    height: 12,
    marginTop: -2,
  },
  floatingContainer: {
    position: 'absolute',
    top: Spacing.md,
    left: Spacing.md,
    right: Spacing.md,
    zIndex: 10,
  },
  floatingBottom: {
    top: undefined,
    bottom: Spacing.md,
  },
  floatingBubble: {
    backgroundColor: Colors.shadow.lighter + 'F0',
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.arcane.purple,
  },
  floatingText: {
    color: Colors.text,
    fontSize: FontSize.sm,
    fontStyle: 'italic',
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: Spacing.xs,
  },
  historyIcon: {
    width: 16,
    height: 16,
    marginRight: Spacing.sm,
  },
  historyText: {
    flex: 1,
    color: Colors.textSecondary,
    fontSize: FontSize.sm,
    lineHeight: FontSize.sm * 1.4,
  },
});
