import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable, RefreshControl, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeIn } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius, FontSize, AgentColors } from '../../constants/theme';
import { EmptyStates } from '../../constants/assets';
import { useQuestStore } from '../../stores/questStore';
import { Quest, QuestStatus } from '../../shared/types/quest';
import { AGENT_CLASSES } from '../../shared/types/agent';
import { FantasyCard } from '../../components/ui/FantasyCard';
import { FantasyButton } from '../../components/ui/FantasyButton';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { soundService } from '../../services/sound';

type QuestFilter = 'all' | 'pending' | 'active' | 'history';

export default function QuestsScreen() {
  const router = useRouter();
  const [filter, setFilter] = useState<QuestFilter>('all');
  const [refreshing, setRefreshing] = useState(false);

  const allQuests = useQuestStore((state) => Object.values(state.quests));
  const pendingQuests = useQuestStore((state) => state.getPendingReviewQuests());
  const activeQuests = useQuestStore((state) => state.getActiveQuests());
  const historyQuests = useQuestStore((state) => state.getQuestHistory());

  const getFilteredQuests = (): Quest[] => {
    switch (filter) {
      case 'pending':
        return pendingQuests;
      case 'active':
        return activeQuests;
      case 'history':
        return historyQuests;
      default:
        return allQuests.sort(
          (a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime()
        );
    }
  };

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await new Promise((resolve) => setTimeout(resolve, 500));
    setRefreshing(false);
  }, []);

  const handleQuestPress = useCallback(
    (quest: Quest) => {
      soundService.play('tap');
      router.push(`/quest/${quest.id}`);
    },
    [router]
  );

  const renderQuest = useCallback(
    ({ item }: { item: Quest }) => (
      <QuestCard quest={item} onPress={() => handleQuestPress(item)} />
    ),
    [handleQuestPress]
  );

  const ListHeader = useCallback(
    () => (
      <View style={styles.header}>
        <Text style={styles.title}>═══ QUEST LOG ═══</Text>

        {/* Filter tabs */}
        <View style={styles.filterTabs}>
          <FilterTab
            label="All"
            count={allQuests.length}
            active={filter === 'all'}
            onPress={() => setFilter('all')}
          />
          <FilterTab
            label="Pending"
            count={pendingQuests.length}
            active={filter === 'pending'}
            highlight={pendingQuests.length > 0}
            onPress={() => setFilter('pending')}
          />
          <FilterTab
            label="Active"
            count={activeQuests.length}
            active={filter === 'active'}
            onPress={() => setFilter('active')}
          />
          <FilterTab
            label="History"
            count={historyQuests.length}
            active={filter === 'history'}
            onPress={() => setFilter('history')}
          />
        </View>
      </View>
    ),
    [filter, allQuests.length, pendingQuests.length, activeQuests.length, historyQuests.length]
  );

  const ListEmpty = useCallback(
    () => (
      <View style={styles.emptyContainer}>
        <Image
          source={EmptyStates.quests}
          style={styles.emptyImage}
          resizeMode="contain"
        />
        <Text style={styles.emptyTitle}>No Quests Yet</Text>
        <Text style={styles.emptyText}>
          Assign tasks to your agents to begin quests
        </Text>
      </View>
    ),
    []
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <FlatList
        data={getFilteredQuests()}
        renderItem={renderQuest}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={ListHeader}
        ListEmptyComponent={ListEmpty}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={Colors.arcane.purple}
          />
        }
      />
    </SafeAreaView>
  );
}

// Filter tab component
interface FilterTabProps {
  label: string;
  count: number;
  active: boolean;
  highlight?: boolean;
  onPress: () => void;
}

function FilterTab({ label, count, active, highlight, onPress }: FilterTabProps) {
  return (
    <Pressable
      onPress={() => {
        soundService.play('tap');
        onPress();
      }}
      style={[styles.filterTab, active && styles.filterTabActive]}
    >
      <Text style={[styles.filterLabel, active && styles.filterLabelActive]}>
        {label}
      </Text>
      <View
        style={[
          styles.filterCount,
          active && styles.filterCountActive,
          highlight && styles.filterCountHighlight,
        ]}
      >
        <Text style={[styles.filterCountText, active && styles.filterCountTextActive]}>
          {count}
        </Text>
      </View>
    </Pressable>
  );
}

// Quest card component
interface QuestCardProps {
  quest: Quest;
  onPress: () => void;
}

function QuestCard({ quest, onPress }: QuestCardProps) {
  const agentColor = quest.agentClass ? AgentColors[quest.agentClass] : Colors.stone.default;
  const agentIcon = quest.agentClass
    ? AGENT_CLASSES[quest.agentClass as keyof typeof AGENT_CLASSES]?.icon
    : '📜';

  const getStatusConfig = (): { color: string; label: string } => {
    switch (quest.status) {
      case 'active':
        return { color: Colors.arcane.purple, label: 'In Progress' };
      case 'complete':
        return { color: Colors.holy.gold, label: 'Ready for Review' };
      case 'accepted':
        return { color: Colors.fel.green, label: 'Accepted' };
      case 'revising':
        return { color: Colors.frost.blue, label: 'Revising' };
      case 'failed':
        return { color: Colors.fire.orange, label: 'Failed' };
      default:
        return { color: Colors.textMuted, label: quest.status };
    }
  };

  const statusConfig = getStatusConfig();

  return (
    <Animated.View entering={FadeIn.duration(200)}>
      <FantasyCard
        variant={quest.status === 'complete' ? 'gold' : 'stone'}
        onPress={onPress}
        style={styles.questCard}
      >
        <View style={styles.questHeader}>
          <View style={[styles.questIcon, { borderColor: agentColor }]}>
            <Text style={styles.questIconText}>{agentIcon}</Text>
          </View>
          <View style={styles.questMeta}>
            <Text style={styles.questTitle} numberOfLines={1}>
              {quest.title}
            </Text>
            <Text style={styles.questAgent}>
              {quest.agentName} • {getTimeAgo(quest.startedAt)}
            </Text>
          </View>
          <View style={[styles.questStatus, { backgroundColor: statusConfig.color + '30' }]}>
            <Text style={[styles.questStatusText, { color: statusConfig.color }]}>
              {statusConfig.label}
            </Text>
          </View>
        </View>

        {quest.description && (
          <Text style={styles.questDescription} numberOfLines={2}>
            {quest.description}
          </Text>
        )}

        {/* Artifacts count */}
        {quest.artifacts.length > 0 && (
          <View style={styles.questArtifacts}>
            <Ionicons name="cube-outline" size={14} color={Colors.textSecondary} />
            <Text style={styles.questArtifactsText}>
              {quest.artifacts.length} file{quest.artifacts.length !== 1 ? 's' : ''} modified
            </Text>
          </View>
        )}

        {/* XP reward */}
        <View style={styles.questXp}>
          <Ionicons name="star" size={14} color={Colors.holy.gold} />
          <Text style={styles.questXpText}>{quest.xpReward} XP</Text>
        </View>
      </FantasyCard>
    </Animated.View>
  );
}

function getTimeAgo(date: Date): string {
  const now = Date.now();
  const then = new Date(date).getTime();
  const seconds = Math.floor((now - then) / 1000);

  if (seconds < 60) return 'Just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  listContent: {
    padding: Spacing.md,
  },
  header: {
    marginBottom: Spacing.lg,
  },
  title: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    color: Colors.text,
    letterSpacing: 2,
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  filterTabs: {
    flexDirection: 'row',
    backgroundColor: Colors.shadow.lighter,
    borderRadius: BorderRadius.md,
    padding: Spacing.xs,
  },
  filterTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.sm,
    gap: 4,
  },
  filterTabActive: {
    backgroundColor: Colors.shadow.darker,
  },
  filterLabel: {
    fontSize: FontSize.sm,
    color: Colors.textMuted,
  },
  filterLabelActive: {
    color: Colors.text,
    fontWeight: '600',
  },
  filterCount: {
    backgroundColor: Colors.shadow.darker,
    borderRadius: BorderRadius.full,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  filterCountActive: {
    backgroundColor: Colors.arcane.purple,
  },
  filterCountHighlight: {
    backgroundColor: Colors.holy.gold,
  },
  filterCountText: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    fontWeight: '600',
  },
  filterCountTextActive: {
    color: Colors.text,
  },
  questCard: {
    marginBottom: Spacing.md,
  },
  questHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  questIcon: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.md,
    borderWidth: 2,
    backgroundColor: Colors.shadow.darker,
    alignItems: 'center',
    justifyContent: 'center',
  },
  questIconText: {
    fontSize: 20,
  },
  questMeta: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  questTitle: {
    fontSize: FontSize.md,
    fontWeight: '600',
    color: Colors.text,
  },
  questAgent: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    marginTop: 2,
  },
  questStatus: {
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.full,
  },
  questStatusText: {
    fontSize: FontSize.xs,
    fontWeight: '600',
  },
  questDescription: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginTop: Spacing.sm,
    lineHeight: FontSize.sm * 1.4,
  },
  questArtifacts: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.sm,
    gap: 4,
  },
  questArtifactsText: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
  },
  questXp: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.sm,
    gap: 4,
  },
  questXpText: {
    fontSize: FontSize.sm,
    color: Colors.holy.gold,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xxl * 2,
  },
  emptyImage: {
    width: 150,
    height: 150,
    marginBottom: Spacing.md,
  },
  emptyTitle: {
    fontSize: FontSize.xl,
    fontWeight: '700',
    color: Colors.text,
  },
  emptyText: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    marginTop: Spacing.sm,
    textAlign: 'center',
  },
});
