import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, ImageBackground, Image } from 'react-native';
import Animated, {
  useAnimatedStyle,
  withSpring,
  useSharedValue,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';
import { Colors, Spacing, BorderRadius, FontSize, Shadows, AgentColors, StatusColors } from '../../constants/theme';
import { UIElements, Icons } from '../../constants/assets';
import { Agent, AGENT_CLASSES } from '../../shared/types/agent';
import { MiniAvatar } from '../ui/AgentAvatar';
import { MiniProgressBar } from '../ui/ProgressBar';
import { soundService } from '../../services/sound';

interface PartyDockProps {
  agents: Agent[];
  onAgentPress: (agentId: string) => void;
}

export function PartyDock({ agents, onAgentPress }: PartyDockProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const expandProgress = useSharedValue(0);

  const toggleExpand = () => {
    soundService.playSound('ui', isExpanded ? 'collapse' : 'expand');
    setIsExpanded(!isExpanded);
    expandProgress.value = withSpring(isExpanded ? 0 : 1, { damping: 15 });
  };

  const containerStyle = useAnimatedStyle(() => {
    const height = interpolate(
      expandProgress.value,
      [0, 1],
      [80, 200],
      Extrapolation.CLAMP
    );
    return { height };
  });

  const handleAgentPress = (agentId: string) => {
    soundService.play('tap');
    onAgentPress(agentId);
  };

  if (agents.length === 0) {
    return null;
  }

  // Count agents needing attention
  const attentionCount = agents.filter(
    (a) => a.status === 'awaiting' || a.status === 'error' || a.status === 'complete'
  ).length;

  return (
    <ImageBackground
      source={UIElements.dock.background}
      style={[styles.container]}
      imageStyle={styles.backgroundImage}
    >
      <Animated.View style={[styles.innerContainer, containerStyle]}>
        {/* Collapsed view - mini icons */}
        {!isExpanded && (
          <View style={styles.collapsedContent}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.miniIconsContainer}
            >
              {agents.map((agent) => (
                <PartyDockSlot
                  key={agent.id}
                  agent={agent}
                  onPress={() => handleAgentPress(agent.id)}
                />
              ))}
            </ScrollView>

            {/* Attention indicator */}
            {attentionCount > 0 && (
              <View style={styles.attentionBadge}>
                <Image source={Icons.badges.alert} style={styles.attentionIcon} resizeMode="contain" />
                <Text style={styles.attentionText}>{attentionCount}</Text>
              </View>
            )}
          </View>
        )}

        {/* Expanded view - full party frames */}
        {isExpanded && (
          <ScrollView
            style={styles.expandedContent}
            showsVerticalScrollIndicator={false}
          >
            {agents.map((agent) => (
              <ExpandedPartyFrame
                key={agent.id}
                agent={agent}
                onPress={() => handleAgentPress(agent.id)}
              />
            ))}
          </ScrollView>
        )}

        {/* Expand/collapse handle */}
        <Pressable onPress={toggleExpand} style={styles.handle}>
          <Image
            source={UIElements.dock.expandHandle}
            style={[styles.handleImage, isExpanded && styles.handleImageFlipped]}
            resizeMode="contain"
          />
        </Pressable>
      </Animated.View>
    </ImageBackground>
  );
}

// Individual slot in collapsed dock
interface PartyDockSlotProps {
  agent: Agent;
  onPress: () => void;
}

function PartyDockSlot({ agent, onPress }: PartyDockSlotProps) {
  const classInfo = AGENT_CLASSES[agent.class];
  const color = AgentColors[agent.class];
  const needsAttention = agent.status === 'awaiting' || agent.status === 'error' || agent.status === 'complete';

  // Get status icon from assets
  const getStatusIconSource = () => {
    switch (agent.status) {
      case 'channeling':
        return Icons.status.working;
      case 'dormant':
        return Icons.status.idle;
      case 'awaiting':
        return Icons.status.waiting;
      case 'complete':
        return Icons.status.complete;
      case 'error':
        return Icons.status.error;
      case 'spawning':
        return Icons.status.spawning;
      default:
        return Icons.status.idle;
    }
  };

  return (
    <Pressable onPress={onPress}>
      <ImageBackground
        source={needsAttention ? UIElements.dock.slotAlert : UIElements.dock.slot}
        style={[
          styles.slot,
          {
            borderColor: needsAttention ? StatusColors[agent.status] : color,
          },
        ]}
        imageStyle={styles.slotImage}
      >
        <Text style={styles.slotIcon}>{classInfo.icon}</Text>
        <Image source={getStatusIconSource()} style={styles.slotStatusIcon} resizeMode="contain" />

        {/* Mini context bar using dock miniBar */}
        <ImageBackground
          source={UIElements.dock.miniBar}
          style={styles.slotBarContainer}
          imageStyle={styles.slotBarBg}
        >
          <View
            style={[
              styles.slotBar,
              {
                width: `${agent.contextUsed}%`,
                backgroundColor: color,
              },
            ]}
          />
        </ImageBackground>
      </ImageBackground>
    </Pressable>
  );
}

// Expanded party frame
interface ExpandedPartyFrameProps {
  agent: Agent;
  onPress: () => void;
}

function ExpandedPartyFrame({ agent, onPress }: ExpandedPartyFrameProps) {
  const classInfo = AGENT_CLASSES[agent.class];
  const color = AgentColors[agent.class];

  const getStatusLabel = () => {
    switch (agent.status) {
      case 'channeling':
        return 'CHANNELING';
      case 'dormant':
        return `DORMANT ${agent.idleSince ? getIdleTime(agent.idleSince) : ''}`;
      case 'awaiting':
        return 'AWAITING INPUT';
      case 'complete':
        return 'COMPLETE';
      case 'error':
        return 'ERROR';
      case 'spawning':
        return 'SPAWNING';
      default:
        return '';
    }
  };

  return (
    <Pressable onPress={onPress} style={styles.expandedFrame}>
      <View style={[styles.expandedIcon, { borderColor: color }]}>
        <Text style={styles.expandedIconText}>{classInfo.icon}</Text>
      </View>

      <View style={styles.expandedInfo}>
        <View style={styles.expandedHeader}>
          <Text style={styles.expandedName}>{agent.name}</Text>
          <Text style={[styles.expandedStatus, { color: StatusColors[agent.status] }]}>
            {getStatusLabel()}
          </Text>
        </View>

        <MiniProgressBar
          progress={agent.contextUsed}
          variant="mana"
          style={styles.expandedBar}
        />

        {agent.progressTotal && agent.progressTotal > 0 && (
          <Text style={styles.expandedProgress}>
            {agent.progressCurrent}/{agent.progressTotal} {agent.progressLabel}
          </Text>
        )}
      </View>
    </Pressable>
  );
}

function getIdleTime(idleSince: Date): string {
  const minutes = Math.floor((Date.now() - new Date(idleSince).getTime()) / 60000);
  if (minutes < 1) return '';
  if (minutes < 60) return `${minutes}m`;
  return `${Math.floor(minutes / 60)}h`;
}

const styles = StyleSheet.create({
  container: {
    borderBottomWidth: 2,
    borderBottomColor: Colors.border,
    overflow: 'hidden',
  },
  backgroundImage: {
    opacity: 0.9,
  },
  innerContainer: {
    flex: 1,
  },
  collapsedContent: {
    flex: 1,
    paddingHorizontal: Spacing.sm,
    paddingTop: Spacing.sm,
  },
  miniIconsContainer: {
    paddingHorizontal: Spacing.sm,
    gap: Spacing.sm,
  },
  attentionBadge: {
    position: 'absolute',
    top: Spacing.sm,
    right: Spacing.sm,
    backgroundColor: Colors.fire.orange,
    borderRadius: 10,
    minWidth: 24,
    height: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
    gap: 2,
  },
  attentionIcon: {
    width: 12,
    height: 12,
  },
  attentionText: {
    color: Colors.text,
    fontSize: FontSize.xs,
    fontWeight: '700',
  },
  expandedContent: {
    flex: 1,
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm,
  },
  handle: {
    alignItems: 'center',
    paddingVertical: Spacing.xs,
  },
  handleImage: {
    width: 48,
    height: 16,
  },
  handleImageFlipped: {
    transform: [{ rotate: '180deg' }],
  },

  // Slot styles
  slot: {
    width: 56,
    height: 64,
    borderRadius: BorderRadius.md,
    borderWidth: 2,
    alignItems: 'center',
    padding: 4,
    overflow: 'hidden',
  },
  slotImage: {
    borderRadius: BorderRadius.md - 2,
  },
  slotIcon: {
    fontSize: 24,
  },
  slotStatusIcon: {
    width: 12,
    height: 12,
    marginTop: 2,
  },
  slotBarContainer: {
    width: '100%',
    height: 6,
    marginTop: 4,
    overflow: 'hidden',
  },
  slotBarBg: {
    borderRadius: 3,
  },
  slotBar: {
    height: '100%',
    borderRadius: 3,
  },

  // Expanded frame styles
  expandedFrame: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  expandedIcon: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.md,
    borderWidth: 2,
    backgroundColor: Colors.shadow.darker,
    alignItems: 'center',
    justifyContent: 'center',
  },
  expandedIconText: {
    fontSize: 24,
  },
  expandedInfo: {
    flex: 1,
    marginLeft: Spacing.sm,
  },
  expandedHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  expandedName: {
    fontSize: FontSize.md,
    fontWeight: '600',
    color: Colors.text,
  },
  expandedStatus: {
    fontSize: FontSize.xs,
    fontWeight: '500',
  },
  expandedBar: {
    marginTop: 4,
  },
  expandedProgress: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    marginTop: 2,
  },
});
