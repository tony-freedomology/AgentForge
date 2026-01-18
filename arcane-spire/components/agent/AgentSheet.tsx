import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  Pressable,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius, FontSize, AgentColors, StatusColors } from '../../constants/theme';
import { Agent, AGENT_CLASSES } from '../../shared/types/agent';
import { AgentAvatar } from '../ui/AgentAvatar';
import { StatusBadge } from '../ui/StatusBadge';
import { ProgressBar, SegmentedProgress } from '../ui/ProgressBar';
import { FantasyButton } from '../ui/FantasyButton';
import { FantasyInput } from '../ui/FantasyInput';
import { FantasyCard } from '../ui/FantasyCard';
import { ScryingPool } from './ScryingPool';
import { QuickReplies } from './QuickReplies';
import { soundService } from '../../services/sound';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const MAX_SHEET_HEIGHT = SCREEN_HEIGHT * 0.85;
const MIN_SHEET_HEIGHT = SCREEN_HEIGHT * 0.4;

interface AgentSheetProps {
  agent: Agent;
  visible: boolean;
  onClose: () => void;
  onSendMessage: (message: string) => void;
  onQuickReply: (reply: string) => void;
  onViewQuest?: () => void;
  onViewLoot?: () => void;
  onViewTalents?: () => void;
}

export function AgentSheet({
  agent,
  visible,
  onClose,
  onSendMessage,
  onQuickReply,
  onViewQuest,
  onViewLoot,
  onViewTalents,
}: AgentSheetProps) {
  const [inputValue, setInputValue] = useState('');
  const [activeTab, setActiveTab] = useState<'scrying' | 'quest' | 'loot' | 'talents'>('scrying');
  const translateY = useSharedValue(MAX_SHEET_HEIGHT);

  const classInfo = AGENT_CLASSES[agent.class];
  const color = AgentColors[agent.class];

  // Show/hide sheet
  React.useEffect(() => {
    if (visible) {
      translateY.value = withSpring(0, { damping: 20 });
    } else {
      translateY.value = withSpring(MAX_SHEET_HEIGHT, { damping: 20 });
    }
  }, [visible]);

  const handleSendMessage = () => {
    if (inputValue.trim()) {
      onSendMessage(inputValue.trim());
      setInputValue('');
    }
  };

  const handleClose = useCallback(() => {
    soundService.play('swipe');
    onClose();
  }, [onClose]);

  // Pan gesture for dragging
  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      if (event.translationY > 0) {
        translateY.value = event.translationY;
      }
    })
    .onEnd((event) => {
      if (event.translationY > 100 || event.velocityY > 500) {
        translateY.value = withSpring(MAX_SHEET_HEIGHT, { damping: 20 });
        runOnJS(handleClose)();
      } else {
        translateY.value = withSpring(0, { damping: 20 });
      }
    });

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  if (!visible) return null;

  return (
    <>
      {/* Backdrop */}
      <Pressable style={styles.backdrop} onPress={handleClose} />

      {/* Sheet */}
      <GestureDetector gesture={panGesture}>
        <Animated.View style={[styles.sheet, sheetStyle]}>
          {/* Drag handle */}
          <View style={styles.handleContainer}>
            <View style={styles.handle} />
          </View>

          {/* Agent header */}
          <View style={[styles.header, { borderBottomColor: color }]}>
            <AgentAvatar
              agentClass={agent.class}
              status={agent.status}
              size="lg"
            />
            <View style={styles.headerInfo}>
              <View style={styles.nameRow}>
                <Text style={styles.agentName}>{agent.name}</Text>
                <StatusBadge status={agent.status} showLabel size="md" />
              </View>
              <Text style={styles.classLabel}>
                {classInfo.name} • Level {agent.level}
              </Text>
              <Text style={styles.branchLabel}>
                {agent.branch || 'No branch'} • {agent.workingDirectory || 'No directory'}
              </Text>
            </View>
          </View>

          {/* Context bar */}
          <View style={styles.contextSection}>
            <ProgressBar
              progress={agent.contextUsed}
              variant="mana"
              showLabel
              label="Context"
              showPercentage
              height={8}
            />
          </View>

          {/* Pending question (if awaiting) */}
          {agent.status === 'awaiting' && agent.pendingQuestion && (
            <FantasyCard variant="gold" style={styles.questionCard}>
              <Text style={styles.questionText}>"{agent.pendingQuestion}"</Text>
              {agent.quickReplies && agent.quickReplies.length > 0 && (
                <QuickReplies replies={agent.quickReplies} onReply={onQuickReply} />
              )}
            </FantasyCard>
          )}

          {/* Tab bar */}
          <View style={styles.tabBar}>
            <TabButton
              label="Scrying Pool"
              icon="water"
              active={activeTab === 'scrying'}
              onPress={() => setActiveTab('scrying')}
            />
            <TabButton
              label="Quest"
              icon="scroll"
              active={activeTab === 'quest'}
              onPress={() => setActiveTab('quest')}
            />
            <TabButton
              label="Loot"
              icon="cube"
              active={activeTab === 'loot'}
              onPress={() => setActiveTab('loot')}
            />
            <TabButton
              label="Talents"
              icon="sparkles"
              active={activeTab === 'talents'}
              badge={agent.talentPoints > 0 ? agent.talentPoints : undefined}
              onPress={() => setActiveTab('talents')}
            />
          </View>

          {/* Tab content */}
          <View style={styles.tabContent}>
            {activeTab === 'scrying' && (
              <ScryingPool outputBuffer={agent.outputBuffer} />
            )}
            {activeTab === 'quest' && (
              <View style={styles.placeholder}>
                <Ionicons name="document-text-outline" size={48} color={Colors.textMuted} />
                <Text style={styles.placeholderText}>Quest details coming soon</Text>
              </View>
            )}
            {activeTab === 'loot' && (
              <View style={styles.placeholder}>
                <Ionicons name="gift-outline" size={48} color={Colors.textMuted} />
                <Text style={styles.placeholderText}>Loot panel coming soon</Text>
              </View>
            )}
            {activeTab === 'talents' && (
              <View style={styles.placeholder}>
                <Ionicons name="star-outline" size={48} color={Colors.textMuted} />
                <Text style={styles.placeholderText}>Talent tree coming soon</Text>
                {agent.talentPoints > 0 && (
                  <Text style={styles.talentPoints}>{agent.talentPoints} points available</Text>
                )}
              </View>
            )}
          </View>

          {/* Input area */}
          <View style={styles.inputContainer}>
            <FantasyInput
              value={inputValue}
              onChangeText={setInputValue}
              placeholder={`Speak to ${agent.name}...`}
              onSubmit={handleSendMessage}
              showSendButton
              sendButtonDisabled={!inputValue.trim()}
            />
          </View>
        </Animated.View>
      </GestureDetector>
    </>
  );
}

// Tab button component
interface TabButtonProps {
  label: string;
  icon: string;
  active: boolean;
  badge?: number;
  onPress: () => void;
}

function TabButton({ label, icon, active, badge, onPress }: TabButtonProps) {
  return (
    <Pressable
      onPress={() => {
        soundService.play('tap');
        onPress();
      }}
      style={[styles.tabButton, active && styles.tabButtonActive]}
    >
      <Ionicons
        name={icon as any}
        size={20}
        color={active ? Colors.arcane.purple : Colors.textMuted}
      />
      <Text style={[styles.tabLabel, active && styles.tabLabelActive]}>{label}</Text>
      {badge !== undefined && badge > 0 && (
        <View style={styles.tabBadge}>
          <Text style={styles.tabBadgeText}>{badge}</Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: MAX_SHEET_HEIGHT,
    backgroundColor: Colors.shadow.black,
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
  },
  handleContainer: {
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: Colors.stone.dark,
    borderRadius: 2,
  },
  header: {
    flexDirection: 'row',
    padding: Spacing.md,
    borderBottomWidth: 2,
  },
  headerInfo: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  agentName: {
    fontSize: FontSize.xl,
    fontWeight: '700',
    color: Colors.text,
  },
  classLabel: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  branchLabel: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    marginTop: 2,
  },
  contextSection: {
    padding: Spacing.md,
  },
  questionCard: {
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.md,
  },
  questionText: {
    fontSize: FontSize.md,
    color: Colors.shadow.black,
    fontStyle: 'italic',
    marginBottom: Spacing.md,
  },
  tabBar: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 4,
  },
  tabButtonActive: {
    borderBottomWidth: 2,
    borderBottomColor: Colors.arcane.purple,
  },
  tabLabel: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
  },
  tabLabelActive: {
    color: Colors.arcane.purple,
    fontWeight: '600',
  },
  tabBadge: {
    backgroundColor: Colors.holy.gold,
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  tabBadgeText: {
    fontSize: FontSize.xs,
    fontWeight: '700',
    color: Colors.shadow.black,
  },
  tabContent: {
    flex: 1,
  },
  placeholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
  },
  placeholderText: {
    fontSize: FontSize.md,
    color: Colors.textMuted,
    marginTop: Spacing.md,
  },
  talentPoints: {
    fontSize: FontSize.sm,
    color: Colors.holy.gold,
    marginTop: Spacing.sm,
  },
  inputContainer: {
    padding: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
});
