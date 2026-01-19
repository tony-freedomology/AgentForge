import React from 'react';
import { View, Text, StyleSheet, Pressable, Image, ImageBackground } from 'react-native';
import Animated, {
  FadeIn,
  FadeOut,
  useAnimatedStyle,
  withSpring,
  useSharedValue,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius, FontSize, Shadows, AgentColors, StatusColors } from '../../constants/theme';
import { getFloorName } from '../../constants/agentClasses';
import { SpireElements, getFloorFrame } from '../../constants/assets';
import { Agent, AGENT_CLASSES } from '../../shared/types/agent';
import { AgentAvatar } from '../ui/AgentAvatar';
import { StatusBadge, ActivityBadge } from '../ui/StatusBadge';
import { MiniProgressBar, SegmentedProgress } from '../ui/ProgressBar';
import { useGlowAnimation, usePulseAnimation } from '../../hooks/useAnimatedValue';
import { soundService } from '../../services/sound';

interface FloorCardProps {
  agent: Agent;
  floorIndex: number;
  isExpanded?: boolean;
  isSelected?: boolean;
  onPress: () => void;
  onLongPress: () => void;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function FloorCard({
  agent,
  floorIndex,
  isExpanded = false,
  isSelected = false,
  onPress,
  onLongPress,
}: FloorCardProps) {
  const scale = useSharedValue(1);
  const classInfo = AGENT_CLASSES[agent.class];
  const color = AgentColors[agent.class];

  // Animations based on status
  const isWorking = agent.status === 'channeling';
  const needsAttention = agent.status === 'awaiting' || agent.status === 'error' || agent.status === 'complete';
  const isSpawning = agent.status === 'spawning';

  const glowStyle = useGlowAnimation(isWorking || isSelected, color);
  const pulseStyle = usePulseAnimation(needsAttention, 1);

  const handlePressIn = () => {
    scale.value = withSpring(0.98, { damping: 15 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15 });
  };

  const handlePress = () => {
    soundService.play('tap');
    onPress();
  };

  const handleLongPress = () => {
    soundService.playHaptic('medium');
    onLongPress();
  };

  const scaleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  // Get status-based border color
  const getBorderColor = () => {
    if (isSelected) return Colors.holy.gold;
    if (needsAttention) return StatusColors[agent.status];
    if (isWorking) return color;
    return Colors.stone.dark;
  };

  // Get activity text
  const getActivityText = () => {
    if (agent.currentTask) {
      return `"${agent.currentTask}"`;
    }
    if (agent.lastThought) {
      return `"${agent.lastThought}"`;
    }
    switch (agent.status) {
      case 'dormant':
        return 'Tap to awaken...';
      case 'awaiting':
        return agent.pendingQuestion || 'Waiting for input...';
      case 'complete':
        return 'Quest complete! Tap to review.';
      case 'error':
        return 'Error encountered. Tap to investigate.';
      case 'spawning':
        return 'Materializing...';
      default:
        return 'Ready for orders...';
    }
  };

  // Get floor frame based on agent status
  const floorFrame = getFloorFrame(agent.status);

  return (
    <AnimatedPressable
      onPress={handlePress}
      onLongPress={handleLongPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      entering={FadeIn.duration(300)}
      exiting={FadeOut.duration(200)}
      style={[scaleStyle, needsAttention ? pulseStyle : glowStyle]}
    >
      {/* Floor connector between floors */}
      <View style={styles.connectorContainer}>
        <Image
          source={SpireElements.connector}
          style={styles.connector}
          resizeMode="contain"
        />
      </View>

      <ImageBackground
        source={floorFrame}
        style={[
          styles.container,
          {
            borderColor: getBorderColor(),
          },
        ]}
        imageStyle={styles.frameImage}
      >
        {/* Floor header */}
        <View style={styles.header}>
          <Text style={[styles.floorName, { color: color }]}>
            {classInfo.icon} {getFloorName(floorIndex)}
          </Text>
        </View>

        {/* Agent content */}
        <View style={styles.content}>
          {/* Avatar */}
          <AgentAvatar
            agentClass={agent.class}
            status={agent.status}
            size="lg"
          />

          {/* Agent info */}
          <View style={styles.info}>
            <View style={styles.nameRow}>
              <Text style={styles.agentName}>{agent.name}</Text>
              <StatusBadge status={agent.status} showLabel size="sm" />
            </View>

            {/* Context bar */}
            <View style={styles.contextRow}>
              <Text style={styles.contextLabel}>Context</Text>
              <View style={styles.contextBar}>
                <MiniProgressBar
                  progress={agent.contextUsed}
                  variant="mana"
                />
              </View>
              <Text style={styles.contextPercent}>{agent.contextUsed}%</Text>
            </View>

            {/* Progress (if available) */}
            {agent.progressTotal && agent.progressTotal > 0 && (
              <SegmentedProgress
                current={agent.progressCurrent || 0}
                total={agent.progressTotal}
                label={agent.progressLabel || ''}
                variant="gold"
                style={styles.progress}
              />
            )}
          </View>
        </View>

        {/* Activity text */}
        <View style={styles.activityRow}>
          <ActivityBadge activity={agent.activity} />
          <Text style={styles.activityText} numberOfLines={1}>
            {getActivityText()}
          </Text>
        </View>

        {/* Quick reply hints for awaiting state */}
        {agent.status === 'awaiting' && agent.quickReplies && agent.quickReplies.length > 0 && (
          <View style={styles.quickRepliesHint}>
            <Ionicons name="chatbubbles-outline" size={14} color={Colors.holy.gold} />
            <Text style={styles.quickRepliesText}>
              {agent.quickReplies.length} quick replies available
            </Text>
          </View>
        )}
      </ImageBackground>
    </AnimatedPressable>
  );
}

// Compact version for smaller displays
interface CompactFloorCardProps {
  agent: Agent;
  onPress: () => void;
}

export function CompactFloorCard({ agent, onPress }: CompactFloorCardProps) {
  const classInfo = AGENT_CLASSES[agent.class];
  const color = AgentColors[agent.class];
  const needsAttention = agent.status === 'awaiting' || agent.status === 'error' || agent.status === 'complete';

  return (
    <Pressable
      onPress={() => {
        soundService.play('tap');
        onPress();
      }}
      style={[
        styles.compactContainer,
        {
          borderColor: needsAttention ? StatusColors[agent.status] : color,
        },
      ]}
    >
      <Text style={styles.compactIcon}>{classInfo.icon}</Text>
      <Text style={styles.compactName} numberOfLines={1}>{agent.name}</Text>
      <StatusBadge status={agent.status} size="sm" />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  connectorContainer: {
    alignItems: 'center',
    height: 20,
    marginBottom: -10,
    zIndex: 1,
  },
  connector: {
    width: 30,
    height: 20,
  },
  container: {
    borderRadius: BorderRadius.lg,
    borderWidth: 2,
    padding: Spacing.md,
    marginHorizontal: Spacing.md,
    overflow: 'hidden',
    ...Shadows.md,
  },
  frameImage: {
    borderRadius: BorderRadius.lg,
    opacity: 0.15,
  },
  header: {
    marginBottom: Spacing.sm,
  },
  floorName: {
    fontSize: FontSize.xs,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  info: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  agentName: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    color: Colors.text,
  },
  contextRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  contextLabel: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    width: 50,
  },
  contextBar: {
    flex: 1,
    marginHorizontal: Spacing.sm,
  },
  contextPercent: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    width: 35,
    textAlign: 'right',
  },
  progress: {
    marginTop: Spacing.xs,
  },
  activityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.md,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  activityText: {
    flex: 1,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    fontStyle: 'italic',
    marginLeft: Spacing.sm,
  },
  quickRepliesHint: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.sm,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  quickRepliesText: {
    fontSize: FontSize.xs,
    color: Colors.holy.gold,
    marginLeft: Spacing.xs,
  },

  // Compact styles
  compactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.shadow.lighter,
    borderRadius: BorderRadius.md,
    borderWidth: 2,
    padding: Spacing.sm,
    marginVertical: Spacing.xs,
  },
  compactIcon: {
    fontSize: 20,
    marginRight: Spacing.sm,
  },
  compactName: {
    flex: 1,
    fontSize: FontSize.md,
    fontWeight: '600',
    color: Colors.text,
    marginRight: Spacing.sm,
  },
});
