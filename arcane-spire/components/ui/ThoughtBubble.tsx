import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import Animated, { FadeIn, FadeOut, SlideInUp } from 'react-native-reanimated';
import { Colors, Spacing, BorderRadius, FontSize } from '../../constants/theme';

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

  return (
    <Animated.View
      entering={FadeIn.duration(300).springify()}
      exiting={FadeOut.duration(200)}
      style={[
        styles.bubble,
        {
          backgroundColor: config.bg,
          borderColor: config.border,
        },
        style,
      ]}
    >
      <Text
        style={[styles.text, { color: config.textColor }]}
        numberOfLines={maxLines}
      >
        {type === 'thought' ? `"${content}"` : content}
      </Text>
      {/* Bubble tail */}
      <View
        style={[
          styles.tail,
          {
            borderTopColor: config.border,
          },
        ]}
      />
      <View
        style={[
          styles.tailInner,
          {
            borderTopColor: config.bg,
          },
        ]}
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
  const getIcon = () => {
    switch (type) {
      case 'thinking':
        return '💭';
      case 'action':
        return '⚡';
      case 'result':
        return '✓';
    }
  };

  return (
    <View style={styles.historyItem}>
      <Text style={styles.historyIcon}>{getIcon()}</Text>
      <Text style={styles.historyText} numberOfLines={2}>
        {content}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  bubble: {
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 2,
    maxWidth: '90%',
    alignSelf: 'center',
  },
  text: {
    fontSize: FontSize.sm,
    fontStyle: 'italic',
    lineHeight: FontSize.sm * 1.4,
  },
  tail: {
    position: 'absolute',
    bottom: -10,
    left: '50%',
    marginLeft: -8,
    width: 0,
    height: 0,
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderTopWidth: 10,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
  },
  tailInner: {
    position: 'absolute',
    bottom: -6,
    left: '50%',
    marginLeft: -6,
    width: 0,
    height: 0,
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderTopWidth: 8,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
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
    fontSize: FontSize.sm,
    marginRight: Spacing.sm,
  },
  historyText: {
    flex: 1,
    color: Colors.textSecondary,
    fontSize: FontSize.sm,
    lineHeight: FontSize.sm * 1.4,
  },
});
