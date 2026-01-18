import React, { useCallback, useRef } from 'react';
import { View, StyleSheet, FlatList, ListRenderItem, RefreshControl } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { Agent } from '../../shared/types/agent';
import { useAgentStore } from '../../stores/agentStore';
import { useConnectionStore } from '../../stores/connectionStore';
import { Colors, Spacing } from '../../constants/theme';
import { FloorCard } from './FloorCard';
import { SummonPortal } from './SummonPortal';
import { EmptySpire } from './EmptySpire';
import { PartyDock } from '../party-dock/PartyDock';

interface SpireViewProps {
  onAgentPress: (agent: Agent) => void;
  onAgentLongPress: (agent: Agent) => void;
  onSummonPress: () => void;
  onRefresh: () => Promise<void>;
}

export function SpireView({
  onAgentPress,
  onAgentLongPress,
  onSummonPress,
  onRefresh,
}: SpireViewProps) {
  const flatListRef = useRef<FlatList>(null);
  const [refreshing, setRefreshing] = React.useState(false);

  const agents = useAgentStore((state) => state.getFilteredAgents());
  const selectedAgentId = useAgentStore((state) => state.selectedAgentId);
  const expandedAgentId = useAgentStore((state) => state.expandedAgentId);
  const connectionStatus = useConnectionStore((state) => state.connectionStatus);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await onRefresh();
    setRefreshing(false);
  }, [onRefresh]);

  const handleAgentPress = useCallback(
    (agent: Agent) => {
      onAgentPress(agent);
    },
    [onAgentPress]
  );

  const handleAgentLongPress = useCallback(
    (agent: Agent) => {
      onAgentLongPress(agent);
    },
    [onAgentLongPress]
  );

  // Scroll to agent
  const scrollToAgent = useCallback(
    (agentId: string) => {
      const index = agents.findIndex((a) => a.id === agentId);
      if (index !== -1 && flatListRef.current) {
        flatListRef.current.scrollToIndex({
          index,
          animated: true,
          viewPosition: 0.5,
        });
      }
    },
    [agents]
  );

  const renderFloor: ListRenderItem<Agent> = useCallback(
    ({ item, index }) => (
      <FloorCard
        agent={item}
        floorIndex={agents.length - index} // Reverse order for tower effect
        isExpanded={expandedAgentId === item.id}
        isSelected={selectedAgentId === item.id}
        onPress={() => handleAgentPress(item)}
        onLongPress={() => handleAgentLongPress(item)}
      />
    ),
    [agents.length, expandedAgentId, selectedAgentId, handleAgentPress, handleAgentLongPress]
  );

  const keyExtractor = useCallback((item: Agent) => item.id, []);

  const ListHeader = useCallback(
    () => (
      <Animated.View entering={FadeIn.duration(500)}>
        {/* Party Dock */}
        <PartyDock
          agents={agents}
          onAgentPress={scrollToAgent}
        />

        {/* Spire top decoration (placeholder) */}
        <View style={styles.spireTop}>
          {/* Spire top art would go here */}
        </View>
      </Animated.View>
    ),
    [agents, scrollToAgent]
  );

  const ListFooter = useCallback(
    () => (
      <View style={styles.footer}>
        {/* Summon Portal */}
        <SummonPortal
          onPress={onSummonPress}
          disabled={connectionStatus !== 'connected'}
        />

        {/* Spire ground decoration (placeholder) */}
        <View style={styles.spireGround}>
          {/* Spire ground art would go here */}
        </View>
      </View>
    ),
    [onSummonPress, connectionStatus]
  );

  const ListEmpty = useCallback(
    () => (
      <EmptySpire
        isConnected={connectionStatus === 'connected'}
        onSummonPress={onSummonPress}
      />
    ),
    [connectionStatus, onSummonPress]
  );

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={agents}
        renderItem={renderFloor}
        keyExtractor={keyExtractor}
        ListHeaderComponent={ListHeader}
        ListFooterComponent={ListFooter}
        ListEmptyComponent={ListEmpty}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={Colors.arcane.purple}
            colors={[Colors.arcane.purple]}
          />
        }
        // Performance optimizations
        removeClippedSubviews={true}
        maxToRenderPerBatch={5}
        windowSize={5}
        initialNumToRender={5}
        getItemLayout={(_, index) => ({
          length: 180, // Approximate height of FloorCard
          offset: 180 * index,
          index,
        })}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  listContent: {
    paddingBottom: Spacing.xxl,
  },
  spireTop: {
    height: 60,
    // Spire top decoration
  },
  footer: {
    marginTop: Spacing.md,
  },
  spireGround: {
    height: 40,
    // Spire ground decoration
  },
});
