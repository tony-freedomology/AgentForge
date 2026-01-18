import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSize } from '../../constants/theme';
import { useAgentStore } from '../../stores/agentStore';
import { ChamberView } from '../../components/chamber/ChamberView';
import { useSpireConnection } from '../../hooks/useSpireConnection';
import { FantasyButton } from '../../components/ui/FantasyButton';

export default function AgentDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const agent = useAgentStore((state) => state.getAgent(id || ''));
  const { sendInput } = useSpireConnection();

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

  const handleSendMessage = (message: string) => {
    sendInput(agent.id, message);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ChamberView agent={agent} onSendMessage={handleSendMessage} />
    </SafeAreaView>
  );
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
});
