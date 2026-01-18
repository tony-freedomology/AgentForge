import React, { useState, useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing } from '../../constants/theme';
import { Agent } from '../../shared/types/agent';
import { useAgentStore } from '../../stores/agentStore';
import { useConnectionStore } from '../../stores/connectionStore';
import { useSpireConnection } from '../../hooks/useSpireConnection';
import { SpireView } from '../../components/spire/SpireView';
import { AgentSheet } from '../../components/agent/AgentSheet';
import { ConnectionStatusBar } from '../../components/ConnectionStatusBar';

export default function SpireScreen() {
  const router = useRouter();
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [sheetVisible, setSheetVisible] = useState(false);

  const { connectionStatus, sendInput, reconnect, answerQuestion } = useSpireConnection();
  const selectAgent = useAgentStore((state) => state.selectAgent);

  const handleAgentPress = useCallback((agent: Agent) => {
    setSelectedAgent(agent);
    setSheetVisible(true);
    selectAgent(agent.id);
  }, [selectAgent]);

  const handleAgentLongPress = useCallback((agent: Agent) => {
    // Show quick actions menu
    // For now, just open the detail view
    router.push(`/agent/${agent.id}`);
  }, [router]);

  const handleSummonPress = useCallback(() => {
    router.push('/summon');
  }, [router]);

  const handleRefresh = useCallback(async () => {
    if (connectionStatus !== 'connected') {
      await reconnect();
    }
  }, [connectionStatus, reconnect]);

  const handleCloseSheet = useCallback(() => {
    setSheetVisible(false);
    setSelectedAgent(null);
    selectAgent(null);
  }, [selectAgent]);

  const handleSendMessage = useCallback((message: string) => {
    if (selectedAgent) {
      sendInput(selectedAgent.id, message);
    }
  }, [selectedAgent, sendInput]);

  const handleQuickReply = useCallback((reply: string) => {
    if (selectedAgent) {
      answerQuestion(selectedAgent.id, reply);
    }
  }, [selectedAgent, answerQuestion]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Connection status bar */}
      <ConnectionStatusBar />

      {/* Main spire view */}
      <SpireView
        onAgentPress={handleAgentPress}
        onAgentLongPress={handleAgentLongPress}
        onSummonPress={handleSummonPress}
        onRefresh={handleRefresh}
      />

      {/* Agent detail sheet */}
      {selectedAgent && (
        <AgentSheet
          agent={selectedAgent}
          visible={sheetVisible}
          onClose={handleCloseSheet}
          onSendMessage={handleSendMessage}
          onQuickReply={handleQuickReply}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
});
