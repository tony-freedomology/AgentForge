import React, { useState, useCallback } from 'react';
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
import { Colors, Spacing, BorderRadius, FontSize, AgentColors } from '../../constants/theme';
import { Agent, AGENT_CLASSES } from '../../shared/types/agent';
import { AgentAvatar } from '../ui/AgentAvatar';
import { StatusBadge } from '../ui/StatusBadge';
import { ProgressBar, MiniProgressBar } from '../ui/ProgressBar';
import { FantasyButton } from '../ui/FantasyButton';
import { FantasyInput } from '../ui/FantasyInput';
import { FantasyCard } from '../ui/FantasyCard';
import { LootItem } from '../ui/PixelAsset';
import { ScryingPool } from './ScryingPool';
import { QuickReplies } from './QuickReplies';
import { soundService } from '../../services/sound';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const MAX_SHEET_HEIGHT = SCREEN_HEIGHT * 0.85;

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
}: AgentSheetProps) {
  const [inputValue, setInputValue] = useState('');
  const [activeTab, setActiveTab] = useState<'scrying' | 'quest' | 'loot' | 'talents'>('scrying');
  const translateY = useSharedValue(MAX_SHEET_HEIGHT);

  const classInfo = AGENT_CLASSES[agent.class];
  const color = AgentColors[agent.class];

  // Show/hide sheet
  React.useEffect(() => {
    if (visible) {
      soundService.playSound('ui', 'modalOpen');
      translateY.value = withSpring(0, { damping: 20 });
    } else {
      translateY.value = withSpring(MAX_SHEET_HEIGHT, { damping: 20 });
    }
  }, [visible, translateY]);

  const handleSendMessage = () => {
    if (inputValue.trim()) {
      onSendMessage(inputValue.trim());
      setInputValue('');
    }
  };

  const handleClose = useCallback(() => {
    soundService.playSound('ui', 'modalClose');
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
              icon="document-text"
              active={activeTab === 'quest'}
              onPress={() => setActiveTab('quest')}
            />
            <TabButton
              label="Loot"
              icon="cube"
              active={activeTab === 'loot'}
              onPress={() => setActiveTab('loot')}
              badge={agent.filesChanged?.length}
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
              <QuestTab agent={agent} />
            )}
            {activeTab === 'loot' && (
              <LootTab agent={agent} />
            )}
            {activeTab === 'talents' && (
              <TalentsTab agent={agent} />
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

// ===== QUEST TAB =====
function QuestTab({ agent }: { agent: Agent }) {
  if (!agent.currentTask) {
    return (
      <View style={styles.emptyTab}>
        <Ionicons name="document-text-outline" size={48} color={Colors.textMuted} />
        <Text style={styles.emptyTitle}>No Active Quest</Text>
        <Text style={styles.emptyText}>
          This agent is idle and ready for a new task
        </Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.tabScroll} contentContainerStyle={styles.tabScrollContent}>
      <FantasyCard variant="stone" style={styles.questCard}>
        <View style={styles.questHeader}>
          <Ionicons name="book-outline" size={24} color={Colors.holy.gold} />
          <Text style={styles.questTitle}>Current Quest</Text>
        </View>
        <Text style={styles.questTask}>{agent.currentTask}</Text>

        {/* Progress */}
        {agent.progressTotal && agent.progressTotal > 0 && (
          <View style={styles.questProgress}>
            <View style={styles.questProgressHeader}>
              <Text style={styles.questProgressLabel}>{agent.progressLabel || 'Progress'}</Text>
              <Text style={styles.questProgressValue}>
                {agent.progressCurrent}/{agent.progressTotal}
              </Text>
            </View>
            <MiniProgressBar
              progress={(agent.progressCurrent || 0) / agent.progressTotal * 100}
              variant="gold"
            />
          </View>
        )}

        {/* Activity */}
        <View style={styles.questActivity}>
          <Text style={styles.questActivityLabel}>Current Activity:</Text>
          <View style={styles.activityBadge}>
            <Text style={styles.activityText}>{formatActivity(agent.activity)}</Text>
          </View>
        </View>
      </FantasyCard>

      {/* Recent thoughts */}
      {agent.thoughts.length > 0 && (
        <View style={styles.thoughtsSection}>
          <Text style={styles.sectionTitle}>Recent Thoughts</Text>
          {agent.thoughts.slice(-5).reverse().map((thought, index) => (
            <View key={thought.id || index} style={styles.thoughtItem}>
              <Text style={styles.thoughtIcon}>
                {thought.type === 'thinking' ? '💭' : thought.type === 'tool' ? '🔧' : '💬'}
              </Text>
              <Text style={styles.thoughtContent} numberOfLines={2}>
                {thought.content}
              </Text>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

// ===== LOOT TAB =====
function LootTab({ agent }: { agent: Agent }) {
  const filesChanged = agent.filesChanged || [];

  if (filesChanged.length === 0) {
    return (
      <View style={styles.emptyTab}>
        <Ionicons name="cube-outline" size={48} color={Colors.textMuted} />
        <Text style={styles.emptyTitle}>No Loot Yet</Text>
        <Text style={styles.emptyText}>
          Files created or modified will appear here
        </Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.tabScroll} contentContainerStyle={styles.tabScrollContent}>
      <View style={styles.lootHeader}>
        <Text style={styles.sectionTitle}>Files Changed</Text>
        <View style={styles.lootCount}>
          <Text style={styles.lootCountText}>{filesChanged.length}</Text>
        </View>
      </View>

      {filesChanged.map((file, index) => (
        <FantasyCard key={`${file.path}-${index}`} variant="dark" style={styles.fileCard}>
          <View style={styles.fileRow}>
            <LootItem
              type={file.action === 'created' ? 'scroll' : file.action === 'deleted' ? 'chest' : 'tome'}
              rarity={file.action === 'created' ? 'uncommon' : file.action === 'deleted' ? 'common' : 'rare'}
              size={32}
            />
            <View style={styles.fileInfo}>
              <Text style={styles.fileName} numberOfLines={1}>
                {file.path.split('/').pop()}
              </Text>
              <Text style={styles.filePath} numberOfLines={1}>
                {file.path}
              </Text>
            </View>
            <View style={[styles.fileActionBadge, { backgroundColor: getFileActionColor(file.action) }]}>
              <Text style={styles.fileActionText}>
                {file.action === 'created' ? '+' : file.action === 'deleted' ? '-' : '~'}
              </Text>
            </View>
          </View>
        </FantasyCard>
      ))}
    </ScrollView>
  );
}

// ===== TALENTS TAB =====
function TalentsTab({ agent }: { agent: Agent }) {
  const talents = [
    { id: 'focus', name: 'Focus', desc: 'Increased context efficiency', icon: '🎯', current: 0, max: 5 },
    { id: 'haste', name: 'Haste', desc: 'Faster task completion', icon: '⚡', current: 0, max: 5 },
    { id: 'lore', name: 'Lore', desc: 'Better code understanding', icon: '📚', current: 0, max: 5 },
    { id: 'mastery', name: 'Mastery', desc: 'Higher quality output', icon: '✨', current: 0, max: 5 },
    { id: 'endurance', name: 'Endurance', desc: 'Extended session length', icon: '🛡️', current: 0, max: 5 },
  ];

  return (
    <ScrollView style={styles.tabScroll} contentContainerStyle={styles.tabScrollContent}>
      {/* Talent points available */}
      {agent.talentPoints > 0 && (
        <FantasyCard variant="gold" style={styles.talentPointsCard}>
          <Text style={styles.talentPointsLabel}>Available Points</Text>
          <Text style={styles.talentPointsValue}>{agent.talentPoints}</Text>
        </FantasyCard>
      )}

      {/* XP Progress */}
      <View style={styles.xpSection}>
        <View style={styles.xpHeader}>
          <Text style={styles.xpLabel}>Level {agent.level}</Text>
          <Text style={styles.xpValue}>{agent.xp || 0} / {agent.xpToNextLevel} XP</Text>
        </View>
        <ProgressBar
          progress={((agent.xp || 0) / agent.xpToNextLevel) * 100}
          variant="xp"
          height={8}
        />
      </View>

      {/* Talent tree */}
      <Text style={styles.sectionTitle}>Talent Tree</Text>
      <Text style={styles.talentHint}>
        Earn talent points by completing quests and leveling up
      </Text>

      {talents.map((talent) => (
        <View key={talent.id} style={styles.talentRow}>
          <View style={styles.talentIcon}>
            <Text style={styles.talentIconText}>{talent.icon}</Text>
          </View>
          <View style={styles.talentInfo}>
            <Text style={styles.talentName}>{talent.name}</Text>
            <Text style={styles.talentDesc}>{talent.desc}</Text>
            <View style={styles.talentPips}>
              {Array.from({ length: talent.max }).map((_, i) => (
                <View
                  key={i}
                  style={[
                    styles.talentPip,
                    i < talent.current && styles.talentPipFilled,
                  ]}
                />
              ))}
            </View>
          </View>
          {agent.talentPoints > 0 && talent.current < talent.max && (
            <Pressable style={styles.talentAddBtn}>
              <Ionicons name="add" size={20} color={Colors.holy.gold} />
            </Pressable>
          )}
        </View>
      ))}
    </ScrollView>
  );
}

// ===== TAB BUTTON =====
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
          <Text style={styles.tabBadgeText}>{badge > 9 ? '9+' : badge}</Text>
        </View>
      )}
    </Pressable>
  );
}

// ===== HELPERS =====
function formatActivity(activity: string | undefined): string {
  if (!activity) return 'Idle';
  const map: Record<string, string> = {
    thinking: '🤔 Thinking...',
    reading: '📖 Reading code...',
    writing: '✍️ Writing code...',
    testing: '🧪 Running tests...',
    researching: '🔍 Researching...',
    building: '🔨 Building...',
    git: '🌳 Git operations...',
    waiting: '⏳ Waiting for input...',
    error: '❌ Error encountered',
    idle: '💤 Idle',
  };
  return map[activity] || activity;
}

function getFileActionColor(action: string): string {
  switch (action) {
    case 'created': return Colors.fel.green;
    case 'deleted': return Colors.fire.orange;
    case 'modified': return Colors.frost.blue;
    default: return Colors.textMuted;
  }
}

// ===== STYLES =====
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
  inputContainer: {
    padding: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },

  // Empty states
  emptyTab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
  },
  emptyTitle: {
    fontSize: FontSize.lg,
    fontWeight: '600',
    color: Colors.text,
    marginTop: Spacing.md,
  },
  emptyText: {
    fontSize: FontSize.sm,
    color: Colors.textMuted,
    textAlign: 'center',
    marginTop: Spacing.sm,
  },

  // Tab scroll
  tabScroll: {
    flex: 1,
  },
  tabScrollContent: {
    padding: Spacing.md,
  },
  sectionTitle: {
    fontSize: FontSize.md,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: Spacing.md,
  },

  // Quest tab
  questCard: {
    marginBottom: Spacing.md,
  },
  questHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  questTitle: {
    fontSize: FontSize.md,
    fontWeight: '600',
    color: Colors.holy.gold,
    marginLeft: Spacing.sm,
  },
  questTask: {
    fontSize: FontSize.md,
    color: Colors.text,
    lineHeight: FontSize.md * 1.5,
  },
  questProgress: {
    marginTop: Spacing.md,
  },
  questProgressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.xs,
  },
  questProgressLabel: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
  questProgressValue: {
    fontSize: FontSize.sm,
    color: Colors.holy.gold,
    fontWeight: '600',
  },
  questActivity: {
    marginTop: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
  },
  questActivityLabel: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginRight: Spacing.sm,
  },
  activityBadge: {
    backgroundColor: Colors.shadow.darker,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  activityText: {
    fontSize: FontSize.sm,
    color: Colors.text,
  },
  thoughtsSection: {
    marginTop: Spacing.md,
  },
  thoughtItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: Spacing.sm,
    backgroundColor: Colors.shadow.darker,
    padding: Spacing.sm,
    borderRadius: BorderRadius.sm,
  },
  thoughtIcon: {
    fontSize: 16,
    marginRight: Spacing.sm,
  },
  thoughtContent: {
    flex: 1,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },

  // Loot tab
  lootHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  lootCount: {
    backgroundColor: Colors.arcane.purple,
    borderRadius: 12,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
  },
  lootCountText: {
    fontSize: FontSize.sm,
    fontWeight: '700',
    color: Colors.text,
  },
  fileCard: {
    marginBottom: Spacing.sm,
  },
  fileRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  fileInfo: {
    flex: 1,
    marginLeft: Spacing.sm,
  },
  fileName: {
    fontSize: FontSize.md,
    fontWeight: '600',
    color: Colors.text,
  },
  filePath: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    marginTop: 2,
  },
  fileActionBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fileActionText: {
    fontSize: FontSize.md,
    fontWeight: '700',
    color: Colors.text,
  },

  // Talents tab
  talentPointsCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  talentPointsLabel: {
    fontSize: FontSize.md,
    fontWeight: '600',
    color: Colors.shadow.black,
  },
  talentPointsValue: {
    fontSize: FontSize.xl,
    fontWeight: '700',
    color: Colors.shadow.black,
  },
  xpSection: {
    marginBottom: Spacing.lg,
  },
  xpHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.xs,
  },
  xpLabel: {
    fontSize: FontSize.sm,
    fontWeight: '600',
    color: Colors.text,
  },
  xpValue: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
  talentHint: {
    fontSize: FontSize.sm,
    color: Colors.textMuted,
    marginBottom: Spacing.md,
  },
  talentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.shadow.darker,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.sm,
  },
  talentIcon: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.shadow.black,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  talentIconText: {
    fontSize: 20,
  },
  talentInfo: {
    flex: 1,
  },
  talentName: {
    fontSize: FontSize.md,
    fontWeight: '600',
    color: Colors.text,
  },
  talentDesc: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  talentPips: {
    flexDirection: 'row',
    marginTop: Spacing.xs,
    gap: 4,
  },
  talentPip: {
    width: 12,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.stone.dark,
  },
  talentPipFilled: {
    backgroundColor: Colors.holy.gold,
  },
  talentAddBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.shadow.black,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.holy.gold,
  },
});
