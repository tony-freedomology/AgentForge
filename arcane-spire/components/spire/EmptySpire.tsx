import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { Colors, Spacing, FontSize } from '../../constants/theme';
import { EmptyStates } from '../../constants/assets';
import { FantasyButton } from '../ui/FantasyButton';

interface EmptySpireProps {
  isConnected: boolean;
  onSummonPress: () => void;
  onConnectPress?: () => void;
}

export function EmptySpire({ isConnected, onSummonPress, onConnectPress }: EmptySpireProps) {
  if (!isConnected) {
    return (
      <View style={styles.container}>
        {/* Empty tower illustration */}
        <View style={styles.illustration}>
          <Image
            source={EmptyStates.spire}
            style={styles.illustrationImage}
            resizeMode="contain"
          />
        </View>

        <Text style={styles.title}>Spire Disconnected</Text>
        <Text style={styles.description}>
          Connect to your development machine to see your agents
        </Text>

        {onConnectPress && (
          <FantasyButton
            onPress={onConnectPress}
            variant="summon"
            style={styles.button}
          >
            Connect to Forge
          </FantasyButton>
        )}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Empty tower illustration */}
      <View style={styles.illustration}>
        <Image
          source={EmptyStates.spire}
          style={styles.illustrationImage}
          resizeMode="contain"
        />
      </View>

      <Text style={styles.title}>Your Spire Awaits</Text>
      <Text style={styles.description}>
        Summon your first agent to begin your magical coding journey
      </Text>

      <FantasyButton
        onPress={onSummonPress}
        variant="summon"
        size="lg"
        style={styles.button}
      >
        Summon Your First Agent
      </FantasyButton>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.xxl,
  },
  illustration: {
    width: 200,
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
  },
  illustrationImage: {
    width: '100%',
    height: '100%',
  },
  title: {
    fontSize: FontSize.xxl,
    fontWeight: '700',
    color: Colors.text,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  description: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.xl,
    lineHeight: FontSize.md * 1.5,
  },
  button: {
    minWidth: 200,
  },
});
