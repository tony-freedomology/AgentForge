import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSize, AgentColors } from '../../constants/theme';
import { useAgentStore } from '../../stores/agentStore';
import { ChamberView } from '../../components/chamber/ChamberView';
import { useSpireConnection } from '../../hooks/useSpireConnection';
import { FantasyButton } from '../../components/ui/FantasyButton';
import { AGENT_CLASSES } from '../../shared/types/agent';
import { soundService } from '../../services/sound';

export default function AgentDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const agent = useAgentStore((state) => state.getAgent(id || ''));
  const { sendInput } = useSpireConnection();

  const handleBack = () => {
    soundService.play('tap');
    router.back();
  };

  if (!agent) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.notFound}>
          <Ionicons name="help-circle" size={64} color={Colors.textMuted} />
          <Text style={styles.notFoundTitle}>Agent Not Found</Text>
          <Text style={styles.notFoundText}>
            This agent may have been dismissed
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

  const classInfo = AGENT_CLASSES[agent.class];
  const color = AgentColors[agent.class];

  const handleSendMessage = (message: string) => {
    sendInput(agent.id, message);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header with back button */}
      <View style={[styles.header, { borderBottomColor: color }]}>
        <Pressable onPress={handleBack} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={Colors.textSecondary} />
        </Pressable>
        <View style={styles.headerInfo}>
          <Text style={styles.headerIcon}>{classInfo.icon}</Text>
          <Text style={styles.headerName}>{agent.name}</Text>
        </View>
        <View style={styles.backBtn} />
      </View>

      <ChamberView agent={agent} onSendMessage={handleSendMessage} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 2,
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  headerIcon: {
    fontSize: 24,
  },
  headerName: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    color: Colors.text,
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
});
