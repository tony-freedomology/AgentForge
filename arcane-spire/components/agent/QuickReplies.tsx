import React from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import Animated, { FadeIn, useAnimatedStyle, withSpring, useSharedValue } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius, FontSize } from '../../constants/theme';
import { soundService } from '../../services/sound';

interface QuickRepliesProps {
  replies: string[];
  onReply: (reply: string) => void;
}

export function QuickReplies({ replies, onReply }: QuickRepliesProps) {
  return (
    <View style={styles.container}>
      {replies.map((reply, index) => (
        <QuickReplyButton
          key={`${index}-${reply}`}
          reply={reply}
          index={index}
          onPress={() => {
            soundService.play('tap');
            onReply(reply);
          }}
        />
      ))}
      <QuickReplyButton
        reply="Custom reply..."
        isCustom
        onPress={() => {
          soundService.play('tap');
          // This would typically open the input field or focus it
        }}
      />
    </View>
  );
}

interface QuickReplyButtonProps {
  reply: string;
  index?: number;
  isCustom?: boolean;
  onPress: () => void;
}

function QuickReplyButton({ reply, index = 0, isCustom = false, onPress }: QuickReplyButtonProps) {
  const scale = useSharedValue(1);

  const handlePressIn = () => {
    scale.value = withSpring(0.95, { damping: 15 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15 });
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const getIcon = () => {
    if (isCustom) return 'chatbubble-outline';
    if (reply.toLowerCase().includes('yes') || reply.toLowerCase().includes('proceed') || reply.toLowerCase().includes('accept')) {
      return 'checkmark-circle-outline';
    }
    if (reply.toLowerCase().includes('no') || reply.toLowerCase().includes('cancel') || reply.toLowerCase().includes('stop')) {
      return 'close-circle-outline';
    }
    if (reply.toLowerCase().includes('wait') || reply.toLowerCase().includes('pause')) {
      return 'pause-circle-outline';
    }
    return 'arrow-forward-circle-outline';
  };

  const getIconColor = () => {
    if (isCustom) return Colors.textSecondary;
    if (reply.toLowerCase().includes('yes') || reply.toLowerCase().includes('proceed') || reply.toLowerCase().includes('accept')) {
      return Colors.fel.green;
    }
    if (reply.toLowerCase().includes('no') || reply.toLowerCase().includes('cancel') || reply.toLowerCase().includes('stop')) {
      return Colors.fire.orange;
    }
    return Colors.frost.blue;
  };

  return (
    <Animated.View
      entering={FadeIn.delay(index * 50).duration(200)}
      style={animatedStyle}
    >
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={[styles.button, isCustom && styles.customButton]}
      >
        <Ionicons
          name={getIcon() as any}
          size={18}
          color={getIconColor()}
          style={styles.icon}
        />
        <Text style={[styles.buttonText, isCustom && styles.customButtonText]}>
          {reply}
        </Text>
      </Pressable>
    </Animated.View>
  );
}

// Horizontal scrollable quick replies (for narrow spaces)
interface HorizontalQuickRepliesProps {
  replies: string[];
  onReply: (reply: string) => void;
}

export function HorizontalQuickReplies({ replies, onReply }: HorizontalQuickRepliesProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.horizontalContainer}
    >
      {replies.map((reply, index) => (
        <Pressable
          key={`${index}-${reply}`}
          onPress={() => {
            soundService.play('tap');
            onReply(reply);
          }}
          style={styles.horizontalButton}
        >
          <Text style={styles.horizontalButtonText}>{reply}</Text>
        </Pressable>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.sm,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.shadow.lighter,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.sm,
    paddingHorizontal: Spacing.md,
  },
  customButton: {
    borderStyle: 'dashed',
    opacity: 0.7,
  },
  icon: {
    marginRight: Spacing.sm,
  },
  buttonText: {
    flex: 1,
    fontSize: FontSize.md,
    color: Colors.text,
  },
  customButtonText: {
    color: Colors.textSecondary,
    fontStyle: 'italic',
  },

  // Horizontal styles
  horizontalContainer: {
    paddingHorizontal: Spacing.md,
    gap: Spacing.sm,
  },
  horizontalButton: {
    backgroundColor: Colors.shadow.lighter,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.arcane.purple,
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.md,
  },
  horizontalButtonText: {
    fontSize: FontSize.sm,
    color: Colors.arcane.purple,
  },
});
