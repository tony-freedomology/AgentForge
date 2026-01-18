import React, { useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable, RefreshControl, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeIn, SlideInLeft } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius, FontSize, AgentColors } from '../../constants/theme';
import { EmptyStates } from '../../constants/assets';
import { useChronicleStore } from '../../stores/chronicleStore';
import { ChronicleEntry, ChronicleEntryType } from '../../shared/types/chronicle';
import { AGENT_CLASSES } from '../../shared/types/agent';
import { FantasyCard } from '../../components/ui/FantasyCard';
import { FantasyButton } from '../../components/ui/FantasyButton';
import { soundService } from '../../services/sound';

export default function FeedScreen() {
  const router = useRouter();
  const [refreshing, setRefreshing] = React.useState(false);

  const entries = useChronicleStore((state) => state.getRecentEntries(100));
  const unreadCount = useChronicleStore((state) => state.unreadCount);
  const markAsRead = useChronicleStore((state) => state.markAsRead);
  const markAllAsRead = useChronicleStore((state) => state.markAllAsRead);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    // In a real app, this would fetch new entries from the server
    await new Promise((resolve) => setTimeout(resolve, 500));
    setRefreshing(false);
  }, []);

  const handleEntryPress = useCallback(
    (entry: ChronicleEntry) => {
      soundService.play('tap');
      markAsRead(entry.id);

      if (entry.actionRoute) {
        router.push(entry.actionRoute as any);
      }
    },
    [markAsRead, router]
  );

  const handleMarkAllRead = useCallback(() => {
    soundService.play('tap');
    markAllAsRead();
  }, [markAllAsRead]);

  const renderEntry = useCallback(
    ({ item, index }: { item: ChronicleEntry; index: number }) => (
      <ChronicleEntryCard
        entry={item}
        index={index}
        onPress={() => handleEntryPress(item)}
      />
    ),
    [handleEntryPress]
  );

  const ListHeader = useCallback(
    () => (
      <View style={styles.header}>
        <Text style={styles.title}>═══ THE CHRONICLE ═══</Text>
        {unreadCount > 0 && (
          <FantasyButton
            variant="ghost"
            size="sm"
            onPress={handleMarkAllRead}
          >
            Mark all read
          </FantasyButton>
        )}
      </View>
    ),
    [unreadCount, handleMarkAllRead]
  );

  const ListEmpty = useCallback(
    () => (
      <View style={styles.emptyContainer}>
        <Image
          source={EmptyStates.chronicle}
          style={styles.emptyImage}
          resizeMode="contain"
        />
        <Text style={styles.emptyTitle}>The Chronicle is Empty</Text>
        <Text style={styles.emptyText}>
          Activity from your agents will appear here
        </Text>
      </View>
    ),
    []
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <FlatList
        data={entries}
        renderItem={renderEntry}
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

// Chronicle entry card
interface ChronicleEntryCardProps {
  entry: ChronicleEntry;
  index: number;
  onPress: () => void;
}

function ChronicleEntryCard({ entry, index, onPress }: ChronicleEntryCardProps) {
  const config = getEntryConfig(entry.type);
  const agentColor = entry.agentClass ? AgentColors[entry.agentClass] : Colors.stone.default;
  const agentIcon = entry.agentClass ? AGENT_CLASSES[entry.agentClass as keyof typeof AGENT_CLASSES]?.icon : '📜';

  const timeAgo = getTimeAgo(entry.timestamp);

  return (
    <Animated.View entering={SlideInLeft.delay(index * 50).duration(200)}>
      <Pressable onPress={onPress}>
        <FantasyCard
          variant={entry.isRead ? 'stone' : 'dark'}
          highlighted={!entry.isRead}
          glowing={!entry.isRead}
          glowColor={config.color}
          style={styles.entryCard}
        >
          <View style={styles.entryHeader}>
            <View style={[styles.entryIcon, { backgroundColor: agentColor + '30' }]}>
              <Text style={styles.entryIconText}>{agentIcon}</Text>
            </View>
            <View style={styles.entryMeta}>
              <Text style={styles.entryTitle}>{entry.title}</Text>
              <Text style={styles.entryTime}>{timeAgo}</Text>
            </View>
            {!entry.isRead && <View style={styles.unreadDot} />}
          </View>

          {entry.description && (
            <Text style={styles.entryDescription}>{entry.description}</Text>
          )}

          {entry.actionLabel && (
            <View style={styles.entryAction}>
              <Text style={[styles.actionLabel, { color: config.color }]}>
                [{entry.actionLabel}]
              </Text>
            </View>
          )}
        </FantasyCard>
      </Pressable>
    </Animated.View>
  );
}

// Get entry type configuration
function getEntryConfig(type: ChronicleEntryType): { color: string; icon: string } {
  switch (type) {
    case 'quest_complete':
      return { color: Colors.holy.gold, icon: 'trophy' };
    case 'quest_started':
      return { color: Colors.arcane.purple, icon: 'flag' };
    case 'quest_accepted':
      return { color: Colors.fel.green, icon: 'checkmark-circle' };
    case 'quest_revision':
      return { color: Colors.holy.gold, icon: 'refresh' };
    case 'agent_spawned':
      return { color: Colors.arcane.purple, icon: 'sparkles' };
    case 'agent_dismissed':
      return { color: Colors.stone.default, icon: 'exit' };
    case 'agent_question':
      return { color: Colors.frost.blue, icon: 'help-circle' };
    case 'agent_error':
      return { color: Colors.fire.orange, icon: 'warning' };
    case 'agent_level_up':
      return { color: Colors.holy.gold, icon: 'star' };
    case 'agent_idle':
      return { color: Colors.stone.default, icon: 'moon' };
    default:
      return { color: Colors.textSecondary, icon: 'information-circle' };
  }
}

// Get relative time string
function getTimeAgo(timestamp: Date): string {
  const now = Date.now();
  const then = new Date(timestamp).getTime();
  const seconds = Math.floor((now - then) / 1000);

  if (seconds < 60) return 'Just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
  return `${Math.floor(seconds / 86400)} days ago`;
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
    paddingHorizontal: Spacing.sm,
  },
  title: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    color: Colors.text,
    letterSpacing: 2,
  },
  entryCard: {
    marginBottom: Spacing.md,
  },
  entryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  entryIcon: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  entryIconText: {
    fontSize: 20,
  },
  entryMeta: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  entryTitle: {
    fontSize: FontSize.md,
    fontWeight: '600',
    color: Colors.text,
  },
  entryTime: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    marginTop: 2,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.arcane.purple,
  },
  entryDescription: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginTop: Spacing.sm,
    fontStyle: 'italic',
  },
  entryAction: {
    marginTop: Spacing.sm,
    alignItems: 'flex-end',
  },
  actionLabel: {
    fontSize: FontSize.sm,
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
