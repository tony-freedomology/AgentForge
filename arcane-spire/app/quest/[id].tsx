import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeIn, FadeInDown, SlideInRight } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius, FontSize, AgentColors } from '../../constants/theme';
import { useQuestStore } from '../../stores/questStore';
import { useAgentStore } from '../../stores/agentStore';
import { useSpireConnection } from '../../hooks/useSpireConnection';
import { Quest, QuestArtifact } from '../../shared/types/quest';
import { AGENT_CLASSES } from '../../shared/types/agent';
import { FantasyCard } from '../../components/ui/FantasyCard';
import { FantasyButton } from '../../components/ui/FantasyButton';
import { FantasyInput } from '../../components/ui/FantasyInput';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { LoadingRune, LoadingOverlay } from '../../components/ui/LoadingRune';
import { LootItem, AgentSprite } from '../../components/ui/PixelAsset';
import { soundService } from '../../services/sound';

type ReviewAction = 'accept' | 'reject' | 'revise';

export default function QuestDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const quest = useQuestStore((state) => state.quests[id || '']);
  const { acceptQuest, rejectQuest, requestRevision } = useQuestStore();
  const agent = useAgentStore((state) => quest ? state.getAgent(quest.agentId) : null);
  const { sendQuestReview } = useSpireConnection();

  const [reviewMode, setReviewMode] = useState(false);
  const [revisionNote, setRevisionNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showLootReward, setShowLootReward] = useState(false);

  if (!quest) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.notFound}>
          <Ionicons name="document-outline" size={64} color={Colors.textMuted} />
          <Text style={styles.notFoundTitle}>Quest Not Found</Text>
          <Text style={styles.notFoundText}>
            This quest may have been completed or dismissed
          </Text>
          <FantasyButton
            variant="secondary"
            onPress={() => router.back()}
            style={styles.backButton}
          >
            Go Back
          </FantasyButton>
        </View>
      </SafeAreaView>
    );
  }

  const agentClass = quest.agentClass as keyof typeof AGENT_CLASSES;
  const agentColor = AgentColors[agentClass] || Colors.stone.default;
  const agentIcon = AGENT_CLASSES[agentClass]?.icon || '📜';
  const isComplete = quest.status === 'complete';
  const canReview = isComplete;

  const handleBack = () => {
    soundService.play('tap');
    router.back();
  };

  const handleAccept = async () => {
    soundService.play('tap');
    setIsSubmitting(true);

    // Accept the quest
    acceptQuest(quest.id);

    // Send to server
    sendQuestReview(quest.id, 'accept');

    // Show loot reward animation
    setShowLootReward(true);

    // Wait for animation then go back
    setTimeout(() => {
      soundService.play('spawn');
      setIsSubmitting(false);
      setTimeout(() => router.back(), 1500);
    }, 1000);
  };

  const handleReject = async () => {
    soundService.play('tap');
    setIsSubmitting(true);

    // Reject the quest
    rejectQuest(quest.id);

    // Send to server
    sendQuestReview(quest.id, 'reject');

    setTimeout(() => {
      setIsSubmitting(false);
      router.back();
    }, 500);
  };

  const handleRequestRevision = async () => {
    if (!revisionNote.trim()) return;

    soundService.play('tap');
    setIsSubmitting(true);

    // Request revision
    requestRevision(quest.id, revisionNote);

    // Send to server
    sendQuestReview(quest.id, 'revise', revisionNote);

    setTimeout(() => {
      setIsSubmitting(false);
      router.back();
    }, 500);
  };

  const getStatusConfig = () => {
    switch (quest.status) {
      case 'active':
        return { color: Colors.arcane.purple, label: 'In Progress', icon: 'hourglass-outline' };
      case 'complete':
        return { color: Colors.holy.gold, label: 'Ready for Review', icon: 'checkmark-circle-outline' };
      case 'accepted':
        return { color: Colors.fel.green, label: 'Accepted', icon: 'checkmark-done-outline' };
      case 'revising':
        return { color: Colors.frost.blue, label: 'Revising', icon: 'refresh-outline' };
      case 'failed':
        return { color: Colors.fire.orange, label: 'Failed', icon: 'close-circle-outline' };
      default:
        return { color: Colors.textMuted, label: quest.status, icon: 'help-outline' };
    }
  };

  const statusConfig = getStatusConfig();

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Loot reward overlay
  if (showLootReward) {
    return (
      <SafeAreaView style={styles.lootOverlay}>
        <Animated.View entering={FadeIn.duration(300)} style={styles.lootContent}>
          <Text style={styles.lootTitle}>QUEST COMPLETE!</Text>
          <View style={styles.lootRewards}>
            <View style={styles.xpReward}>
              <Ionicons name="star" size={48} color={Colors.holy.gold} />
              <Text style={styles.xpAmount}>+{quest.xpReward} XP</Text>
            </View>
            {quest.artifacts.length > 0 && (
              <View style={styles.lootItems}>
                <Text style={styles.lootLabel}>Artifacts Collected</Text>
                <View style={styles.lootGrid}>
                  {quest.artifacts.slice(0, 4).map((artifact, index) => (
                    <Animated.View
                      key={artifact.path}
                      entering={SlideInRight.delay(index * 100)}
                    >
                      <LootItem
                        type={getArtifactType(artifact)}
                        rarity={artifact.status === 'created' ? 'epic' : 'rare'}
                        size={56}
                      />
                    </Animated.View>
                  ))}
                </View>
              </View>
            )}
          </View>
        </Animated.View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {isSubmitting && <LoadingOverlay />}

      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={handleBack} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={Colors.textSecondary} />
        </Pressable>
        <Text style={styles.headerTitle}>Quest Details</Text>
        <View style={styles.backBtn} />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {/* Quest Header Card */}
        <FantasyCard variant={isComplete ? 'gold' : 'stone'} style={styles.questHeader}>
          <View style={styles.questTopRow}>
            <View style={[styles.questIcon, { borderColor: agentColor }]}>
              <Text style={styles.questIconText}>{agentIcon}</Text>
            </View>
            <View style={styles.questInfo}>
              <Text style={styles.questTitle}>{quest.title}</Text>
              <Text style={styles.questAgent}>
                {quest.agentName} • Started {formatDate(quest.startedAt)}
              </Text>
            </View>
          </View>

          <View style={[styles.statusBadge, { backgroundColor: statusConfig.color + '30' }]}>
            <Ionicons name={statusConfig.icon as any} size={16} color={statusConfig.color} />
            <Text style={[styles.statusText, { color: statusConfig.color }]}>
              {statusConfig.label}
            </Text>
          </View>

          {quest.description && (
            <Text style={styles.questDescription}>{quest.description}</Text>
          )}

          {/* XP Reward */}
          <View style={styles.rewardRow}>
            <Ionicons name="star" size={20} color={Colors.holy.gold} />
            <Text style={styles.rewardText}>{quest.xpReward} XP Reward</Text>
          </View>
        </FantasyCard>

        {/* Agent Section */}
        {agent && (
          <FantasyCard variant="dark" style={styles.section}>
            <Text style={styles.sectionTitle}>Assigned Agent</Text>
            <View style={styles.agentRow}>
              <AgentSprite agentClass={agentClass} size="lg" />
              <View style={styles.agentInfo}>
                <Text style={styles.agentName}>{agent.name}</Text>
                <Text style={styles.agentClass}>
                  Level {agent.level} {AGENT_CLASSES[agentClass]?.name}
                </Text>
                <ProgressBar
                  current={agent.xp}
                  max={agent.xpToNextLevel}
                  variant="xp"
                  showLabel
                  style={styles.agentXp}
                />
              </View>
            </View>
          </FantasyCard>
        )}

        {/* Artifacts Section */}
        {quest.artifacts.length > 0 && (
          <FantasyCard variant="dark" style={styles.section}>
            <Text style={styles.sectionTitle}>
              Artifacts ({quest.artifacts.length})
            </Text>
            {quest.artifacts.map((artifact, index) => (
              <Animated.View
                key={artifact.path}
                entering={FadeInDown.delay(index * 50)}
              >
                <ArtifactItem artifact={artifact} color={agentColor} />
              </Animated.View>
            ))}
          </FantasyCard>
        )}

        {/* Review Section */}
        {canReview && (
          <FantasyCard variant="stone" style={styles.section}>
            <Text style={styles.sectionTitle}>Review Quest</Text>

            {!reviewMode ? (
              <View style={styles.reviewActions}>
                <FantasyButton
                  variant="summon"
                  size="lg"
                  fullWidth
                  onPress={handleAccept}
                  icon={<Ionicons name="checkmark-circle" size={20} color={Colors.shadow.black} />}
                >
                  Accept & Collect Loot
                </FantasyButton>

                <View style={styles.secondaryActions}>
                  <FantasyButton
                    variant="secondary"
                    size="md"
                    onPress={() => {
                      soundService.play('tap');
                      setReviewMode(true);
                    }}
                    style={styles.halfButton}
                  >
                    Request Changes
                  </FantasyButton>

                  <FantasyButton
                    variant="danger"
                    size="md"
                    onPress={handleReject}
                    style={styles.halfButton}
                  >
                    Reject
                  </FantasyButton>
                </View>
              </View>
            ) : (
              <View style={styles.revisionForm}>
                <Text style={styles.revisionLabel}>
                  What changes are needed?
                </Text>
                <FantasyInput
                  value={revisionNote}
                  onChangeText={setRevisionNote}
                  placeholder="Describe what needs to be changed..."
                  multiline
                  numberOfLines={4}
                />
                <View style={styles.revisionActions}>
                  <FantasyButton
                    variant="secondary"
                    size="md"
                    onPress={() => {
                      soundService.play('tap');
                      setReviewMode(false);
                      setRevisionNote('');
                    }}
                    style={styles.halfButton}
                  >
                    Cancel
                  </FantasyButton>
                  <FantasyButton
                    variant="primary"
                    size="md"
                    onPress={handleRequestRevision}
                    disabled={!revisionNote.trim()}
                    style={styles.halfButton}
                  >
                    Send for Revision
                  </FantasyButton>
                </View>
              </View>
            )}
          </FantasyCard>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

// Artifact item component
interface ArtifactItemProps {
  artifact: QuestArtifact;
  color: string;
}

function ArtifactItem({ artifact, color }: ArtifactItemProps) {
  const getStatusIcon = () => {
    switch (artifact.status) {
      case 'created':
        return { icon: 'add-circle', color: Colors.fel.green, label: 'Created' };
      case 'modified':
        return { icon: 'create', color: Colors.frost.blue, label: 'Modified' };
      case 'deleted':
        return { icon: 'remove-circle', color: Colors.fire.orange, label: 'Deleted' };
      default:
        return { icon: 'document', color: Colors.textMuted, label: artifact.status };
    }
  };

  const status = getStatusIcon();
  const fileName = artifact.path.split('/').pop() || artifact.path;

  return (
    <View style={styles.artifactItem}>
      <View style={styles.artifactIcon}>
        <Ionicons name={status.icon as any} size={20} color={status.color} />
      </View>
      <View style={styles.artifactInfo}>
        <Text style={styles.artifactName} numberOfLines={1}>
          {fileName}
        </Text>
        <Text style={styles.artifactPath} numberOfLines={1}>
          {artifact.path}
        </Text>
      </View>
      <View style={[styles.artifactStatus, { backgroundColor: status.color + '20' }]}>
        <Text style={[styles.artifactStatusText, { color: status.color }]}>
          {status.label}
        </Text>
      </View>
    </View>
  );
}

// Helper to determine artifact type for loot display
function getArtifactType(artifact: QuestArtifact): 'scroll' | 'tome' | 'crystal' | 'orb' | 'gem' {
  const ext = artifact.path.split('.').pop()?.toLowerCase();
  if (ext === 'ts' || ext === 'tsx' || ext === 'js' || ext === 'jsx') return 'crystal';
  if (ext === 'py' || ext === 'rs' || ext === 'go') return 'orb';
  if (ext === 'md' || ext === 'txt') return 'scroll';
  if (ext === 'json' || ext === 'yaml' || ext === 'toml') return 'tome';
  return 'gem';
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  notFound: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
  },
  notFoundTitle: {
    fontSize: FontSize.xl,
    fontWeight: '700',
    color: Colors.text,
    marginTop: Spacing.lg,
  },
  notFoundText: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    marginTop: Spacing.sm,
    textAlign: 'center',
  },
  backButton: {
    marginTop: Spacing.xl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    color: Colors.text,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: Spacing.md,
    paddingBottom: Spacing.xxl,
  },
  questHeader: {
    marginBottom: Spacing.md,
  },
  questTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  questIcon: {
    width: 56,
    height: 56,
    borderRadius: BorderRadius.md,
    borderWidth: 2,
    backgroundColor: Colors.shadow.darker,
    alignItems: 'center',
    justifyContent: 'center',
  },
  questIconText: {
    fontSize: 28,
  },
  questInfo: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  questTitle: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    color: Colors.text,
  },
  questAgent: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.full,
    gap: 6,
    marginBottom: Spacing.md,
  },
  statusText: {
    fontSize: FontSize.sm,
    fontWeight: '600',
  },
  questDescription: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    lineHeight: FontSize.md * 1.5,
    marginBottom: Spacing.md,
  },
  rewardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  rewardText: {
    fontSize: FontSize.md,
    fontWeight: '600',
    color: Colors.holy.gold,
  },
  section: {
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: FontSize.md,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  agentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  agentInfo: {
    flex: 1,
  },
  agentName: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    color: Colors.text,
  },
  agentClass: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  agentXp: {
    marginTop: Spacing.sm,
  },
  artifactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  artifactIcon: {
    width: 32,
    height: 32,
    borderRadius: BorderRadius.sm,
    backgroundColor: Colors.shadow.darker,
    alignItems: 'center',
    justifyContent: 'center',
  },
  artifactInfo: {
    flex: 1,
    marginLeft: Spacing.sm,
    marginRight: Spacing.sm,
  },
  artifactName: {
    fontSize: FontSize.md,
    fontWeight: '600',
    color: Colors.text,
  },
  artifactPath: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    marginTop: 2,
  },
  artifactStatus: {
    paddingVertical: 2,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.full,
  },
  artifactStatusText: {
    fontSize: FontSize.xs,
    fontWeight: '600',
  },
  reviewActions: {
    gap: Spacing.md,
  },
  secondaryActions: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  halfButton: {
    flex: 1,
  },
  revisionForm: {
    gap: Spacing.md,
  },
  revisionLabel: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
  },
  revisionActions: {
    flexDirection: 'row',
    gap: Spacing.md,
  },

  // Loot overlay
  lootOverlay: {
    flex: 1,
    backgroundColor: Colors.shadow.black,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lootContent: {
    alignItems: 'center',
    padding: Spacing.xl,
  },
  lootTitle: {
    fontSize: FontSize.xxl,
    fontWeight: '700',
    color: Colors.holy.gold,
    marginBottom: Spacing.xl,
    letterSpacing: 2,
  },
  lootRewards: {
    alignItems: 'center',
    gap: Spacing.xl,
  },
  xpReward: {
    alignItems: 'center',
  },
  xpAmount: {
    fontSize: FontSize.xl,
    fontWeight: '700',
    color: Colors.holy.gold,
    marginTop: Spacing.sm,
  },
  lootItems: {
    alignItems: 'center',
  },
  lootLabel: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    marginBottom: Spacing.md,
  },
  lootGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: Spacing.md,
  },
});
