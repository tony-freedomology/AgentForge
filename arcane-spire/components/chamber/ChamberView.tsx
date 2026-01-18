import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import Animated, { FadeIn, FadeOut, SlideInUp } from 'react-native-reanimated';
import { Colors, Spacing, BorderRadius, FontSize, AgentColors } from '../../constants/theme';
import { Agent, AGENT_CLASSES } from '../../shared/types/agent';
import { AgentAvatar } from '../ui/AgentAvatar';
import { ThoughtBubble, ThoughtHistoryItem, FloatingThought } from '../ui/ThoughtBubble';
import { SegmentedProgress } from '../ui/ProgressBar';
import { FantasyInput } from '../ui/FantasyInput';

interface ChamberViewProps {
  agent: Agent;
  onSendMessage: (message: string) => void;
}

export function ChamberView({ agent, onSendMessage }: ChamberViewProps) {
  const [inputValue, setInputValue] = React.useState('');
  const classInfo = AGENT_CLASSES[agent.class];
  const color = AgentColors[agent.class];

  const handleSendMessage = () => {
    if (inputValue.trim()) {
      onSendMessage(inputValue.trim());
      setInputValue('');
    }
  };

  // Get current action description
  const getCurrentAction = () => {
    switch (agent.activity) {
      case 'reading':
        return '📚 Reading code...';
      case 'writing':
        return '✍️ Writing code...';
      case 'testing':
        return '🧪 Running tests...';
      case 'researching':
        return '🔍 Researching...';
      case 'thinking':
        return '🤔 Thinking...';
      case 'building':
        return '🔨 Building...';
      case 'git':
        return '🌳 Git operations...';
      case 'waiting':
        return '⏳ Waiting for input...';
      case 'error':
        return '❌ Error encountered';
      default:
        return '💤 Idle';
    }
  };

  return (
    <Animated.View
      entering={SlideInUp.duration(300)}
      exiting={FadeOut.duration(200)}
      style={styles.container}
    >
      {/* Chamber header */}
      <View style={[styles.header, { borderColor: color }]}>
        <Text style={styles.headerTitle}>═══ {agent.name.toUpperCase()}'S CHAMBER ═══</Text>
      </View>

      {/* Thought bubble (current thought) */}
      {agent.lastThought && (
        <View style={styles.thoughtContainer}>
          <ThoughtBubble
            content={agent.lastThought}
            type="thought"
            maxLines={4}
          />
        </View>
      )}

      {/* Agent chamber (visual area) */}
      <View style={[styles.chamberArea, { borderColor: color + '50' }]}>
        {/* Background would be chamber art */}
        <View style={styles.chamberBackground}>
          {/* Placeholder for chamber background art */}
        </View>

        {/* Agent sprite */}
        <View style={styles.agentContainer}>
          <AgentAvatar
            agentClass={agent.class}
            status={agent.status}
            size="xl"
          />
        </View>

        {/* Current action indicator */}
        <View style={styles.actionIndicator}>
          <Text style={styles.actionText}>{getCurrentAction()}</Text>
          {agent.currentTask && (
            <Text style={styles.taskText} numberOfLines={1}>
              {agent.currentTask}
            </Text>
          )}
        </View>

        {/* Progress if available */}
        {agent.progressTotal && agent.progressTotal > 0 && (
          <SegmentedProgress
            current={agent.progressCurrent || 0}
            total={agent.progressTotal}
            label={agent.progressLabel || ''}
            variant="gold"
            style={styles.progressBar}
          />
        )}
      </View>

      {/* Thought history */}
      <View style={styles.thoughtHistory}>
        <Text style={styles.historyTitle}>Recent thoughts:</Text>
        <ScrollView style={styles.historyScroll} showsVerticalScrollIndicator={false}>
          {agent.thoughts.slice(-10).reverse().map((thought) => (
            <ThoughtHistoryItem
              key={thought.id}
              content={thought.content}
              type={thought.type}
              timestamp={thought.timestamp}
            />
          ))}
          {agent.thoughts.length === 0 && (
            <Text style={styles.emptyHistory}>No thoughts yet...</Text>
          )}
        </ScrollView>
      </View>

      {/* Input area */}
      <View style={styles.inputContainer}>
        <FantasyInput
          value={inputValue}
          onChangeText={setInputValue}
          placeholder={`Redirect ${agent.name}...`}
          onSubmit={handleSendMessage}
          showSendButton
          sendButtonDisabled={!inputValue.trim()}
        />
      </View>
    </Animated.View>
  );
}

// Compact chamber preview for inline expansion
interface ChamberPreviewProps {
  agent: Agent;
  onExpand: () => void;
}

export function ChamberPreview({ agent, onExpand }: ChamberPreviewProps) {
  const color = AgentColors[agent.class];

  return (
    <Animated.View
      entering={FadeIn.duration(200)}
      style={[styles.preview, { borderColor: color }]}
    >
      {/* Quick thought preview */}
      {agent.lastThought && (
        <View style={styles.previewThought}>
          <Text style={styles.previewThoughtText} numberOfLines={2}>
            💭 "{agent.lastThought}"
          </Text>
        </View>
      )}

      {/* Mini agent */}
      <View style={styles.previewAgent}>
        <AgentAvatar
          agentClass={agent.class}
          status={agent.status}
          size="md"
        />
        <View style={styles.previewInfo}>
          <Text style={styles.previewActivity}>{agent.activity}</Text>
          {agent.progressTotal && (
            <Text style={styles.previewProgress}>
              {agent.progressCurrent}/{agent.progressTotal}
            </Text>
          )}
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.shadow.black,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    marginHorizontal: Spacing.md,
    marginVertical: Spacing.sm,
  },
  header: {
    padding: Spacing.md,
    borderBottomWidth: 2,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: FontSize.sm,
    fontWeight: '700',
    color: Colors.text,
    letterSpacing: 1,
  },
  thoughtContainer: {
    padding: Spacing.md,
    alignItems: 'center',
  },
  chamberArea: {
    height: 200,
    marginHorizontal: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    overflow: 'hidden',
    position: 'relative',
  },
  chamberBackground: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: Colors.shadow.darker,
    // Placeholder for chamber background art
  },
  agentContainer: {
    position: 'absolute',
    bottom: 40,
    left: '50%',
    transform: [{ translateX: -48 }], // Half of xl size
  },
  actionIndicator: {
    position: 'absolute',
    bottom: Spacing.md,
    left: Spacing.md,
    right: Spacing.md,
    backgroundColor: Colors.shadow.black + 'CC',
    borderRadius: BorderRadius.md,
    padding: Spacing.sm,
  },
  actionText: {
    fontSize: FontSize.sm,
    color: Colors.text,
    fontWeight: '500',
  },
  taskText: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  progressBar: {
    position: 'absolute',
    top: Spacing.md,
    left: Spacing.md,
    right: Spacing.md,
  },
  thoughtHistory: {
    padding: Spacing.md,
    maxHeight: 150,
  },
  historyTitle: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
  },
  historyScroll: {
    maxHeight: 120,
  },
  emptyHistory: {
    fontSize: FontSize.sm,
    color: Colors.textMuted,
    fontStyle: 'italic',
  },
  inputContainer: {
    padding: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },

  // Preview styles
  preview: {
    backgroundColor: Colors.shadow.darker,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    padding: Spacing.md,
    marginHorizontal: Spacing.md,
    marginTop: Spacing.sm,
  },
  previewThought: {
    marginBottom: Spacing.sm,
  },
  previewThoughtText: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    fontStyle: 'italic',
  },
  previewAgent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  previewInfo: {
    marginLeft: Spacing.sm,
  },
  previewActivity: {
    fontSize: FontSize.sm,
    color: Colors.text,
    textTransform: 'capitalize',
  },
  previewProgress: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
  },
});
