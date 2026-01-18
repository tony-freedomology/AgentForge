import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import Animated, {
  useAnimatedStyle,
  withSpring,
  useSharedValue,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius, FontSize, Shadows, AgentColors, StatusColors } from '../../constants/theme';
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
    soundService.play('tap');
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
    <Animated.View style={[styles.container, containerStyle]}>
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
        <View style={styles.handleBar} />
        <Ionicons
          name={isExpanded ? 'chevron-up' : 'chevron-down'}
          size={16}
          color={Colors.textMuted}
        />
      </Pressable>
    </Animated.View>
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

  const getStatusIcon = () => {
    switch (agent.status) {
      case 'channeling':
        return '⚡';
      case 'dormant':
        return '💤';
      case 'awaiting':
        return '❓';
      case 'complete':
        return '✓';
      case 'error':
        return '⚠️';
      case 'spawning':
        return '✨';
      default:
        return '';
    }
  };

  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.slot,
        {
          borderColor: needsAttention ? StatusColors[agent.status] : color,
        },
        needsAttention && styles.slotAttention,
      ]}
    >
      <Text style={styles.slotIcon}>{classInfo.icon}</Text>
      <Text style={styles.slotStatus}>{getStatusIcon()}</Text>

      {/* Mini context bar */}
      <View style={styles.slotBarContainer}>
        <View
          style={[
            styles.slotBar,
            {
              width: `${agent.contextUsed}%`,
              backgroundColor: color,
            },
          ]}
        />
      </View>
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
    backgroundColor: Colors.shadow.lighter,
    borderBottomWidth: 2,
    borderBottomColor: Colors.border,
    overflow: 'hidden',
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
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
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
  handleBar: {
    width: 40,
    height: 4,
    backgroundColor: Colors.stone.dark,
    borderRadius: 2,
    marginBottom: 2,
  },

  // Slot styles
  slot: {
    width: 56,
    height: 64,
    borderRadius: BorderRadius.md,
    borderWidth: 2,
    backgroundColor: Colors.shadow.darker,
    alignItems: 'center',
    padding: 4,
  },
  slotAttention: {
    ...Shadows.glow(Colors.holy.gold),
  },
  slotIcon: {
    fontSize: 24,
  },
  slotStatus: {
    fontSize: 10,
    marginTop: 2,
  },
  slotBarContainer: {
    width: '100%',
    height: 4,
    backgroundColor: Colors.shadow.black,
    borderRadius: 2,
    marginTop: 4,
    overflow: 'hidden',
  },
  slotBar: {
    height: '100%',
    borderRadius: 2,
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
