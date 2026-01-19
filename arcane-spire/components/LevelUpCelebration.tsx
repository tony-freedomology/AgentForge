import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Dimensions, Modal, Pressable } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  withSequence,
  withDelay,
  withRepeat,
  withSpring,
  Easing,
  interpolate,
  Extrapolation,
  runOnJS,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSize, BorderRadius, AgentColors } from '../constants/theme';
import { Agent, AGENT_CLASSES, AgentClass } from '../shared/types/agent';
import { AgentSprite } from './ui/PixelAsset';
import { FantasyButton } from './ui/FantasyButton';
import { soundService } from '../services/sound';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface LevelUpCelebrationProps {
  /** The agent that leveled up */
  agent: Agent;
  /** The new level */
  newLevel: number;
  /** Callback when celebration is dismissed */
  onDismiss: () => void;
  /** Whether to show the modal */
  visible: boolean;
}

/**
 * LevelUpCelebration - Full-screen celebration when an agent levels up
 *
 * Features:
 * - Particle burst animation
 * - Level number counter
 * - Agent showcase
 * - Sound effects
 */
export function LevelUpCelebration({
  agent,
  newLevel,
  onDismiss,
  visible,
}: LevelUpCelebrationProps) {
  const [showContent, setShowContent] = useState(false);

  // Animation values
  const backgroundOpacity = useSharedValue(0);
  const burstScale = useSharedValue(0);
  const textScale = useSharedValue(0);
  const agentScale = useSharedValue(0);
  const levelNumber = useSharedValue(newLevel - 1);
  const particles = Array.from({ length: 12 }, (_, i) => ({
    angle: useSharedValue(i * 30),
    distance: useSharedValue(0),
    opacity: useSharedValue(0),
    rotation: useSharedValue(0),
  }));

  const agentClass = agent.class as AgentClass;
  const agentColor = AgentColors[agentClass] || Colors.arcane.purple;
  const classInfo = AGENT_CLASSES[agentClass];

  useEffect(() => {
    if (visible) {
      // Play level up sound
      soundService.playSound('quest', 'levelUp');

      // Start animation sequence
      setShowContent(true);

      // Background fade in
      backgroundOpacity.value = withTiming(1, { duration: 300 });

      // Burst animation
      burstScale.value = withSequence(
        withTiming(1.5, { duration: 400, easing: Easing.out(Easing.back) }),
        withTiming(1, { duration: 200 })
      );

      // Text animation
      textScale.value = withDelay(
        200,
        withSequence(
          withSpring(1.2, { damping: 8, stiffness: 100 }),
          withSpring(1, { damping: 12 })
        )
      );

      // Agent bounce in
      agentScale.value = withDelay(
        400,
        withSequence(
          withSpring(1.1, { damping: 8, stiffness: 100 }),
          withSpring(1, { damping: 12 })
        )
      );

      // Level counter
      levelNumber.value = withDelay(
        600,
        withTiming(newLevel, { duration: 500, easing: Easing.out(Easing.cubic) })
      );

      // Particle animations
      particles.forEach((particle, i) => {
        particle.distance.value = withDelay(
          100 + i * 50,
          withSequence(
            withTiming(150, { duration: 600, easing: Easing.out(Easing.cubic) }),
            withTiming(200, { duration: 400 })
          )
        );
        particle.opacity.value = withDelay(
          100 + i * 50,
          withSequence(
            withTiming(1, { duration: 200 }),
            withDelay(400, withTiming(0, { duration: 400 }))
          )
        );
        particle.rotation.value = withDelay(
          100 + i * 50,
          withTiming(360, { duration: 1000 })
        );
      });
    } else {
      // Reset animations
      backgroundOpacity.value = 0;
      burstScale.value = 0;
      textScale.value = 0;
      agentScale.value = 0;
      levelNumber.value = newLevel - 1;
      particles.forEach((particle) => {
        particle.distance.value = 0;
        particle.opacity.value = 0;
        particle.rotation.value = 0;
      });
      setShowContent(false);
    }
  }, [visible, newLevel]);

  const backgroundStyle = useAnimatedStyle(() => ({
    opacity: backgroundOpacity.value,
  }));

  const burstStyle = useAnimatedStyle(() => ({
    transform: [{ scale: burstScale.value }],
    opacity: interpolate(burstScale.value, [0, 0.5, 1, 1.5], [0, 1, 0.5, 0]),
  }));

  const textStyle = useAnimatedStyle(() => ({
    transform: [{ scale: textScale.value }],
  }));

  const agentStyle = useAnimatedStyle(() => ({
    transform: [{ scale: agentScale.value }],
  }));

  const levelStyle = useAnimatedStyle(() => ({
    fontSize: 72,
    fontWeight: '900' as const,
    color: agentColor,
  }));

  const handleDismiss = () => {
    soundService.play('tap');
    backgroundOpacity.value = withTiming(0, { duration: 200 }, () => {
      runOnJS(onDismiss)();
    });
  };

  if (!showContent) return null;

  return (
    <Modal transparent visible={visible} animationType="none">
      <Pressable style={styles.container} onPress={handleDismiss}>
        {/* Background */}
        <Animated.View style={[styles.background, backgroundStyle]}>
          {/* Burst effect */}
          <Animated.View style={[styles.burst, burstStyle]}>
            <View style={[styles.burstInner, { borderColor: agentColor }]} />
          </Animated.View>

          {/* Particles */}
          {particles.map((particle, i) => (
            <AnimatedParticle
              key={i}
              index={i}
              angle={particle.angle}
              distance={particle.distance}
              opacity={particle.opacity}
              rotation={particle.rotation}
              color={agentColor}
            />
          ))}

          {/* Content */}
          <View style={styles.content}>
            {/* Title */}
            <Animated.View style={textStyle}>
              <Text style={styles.title}>LEVEL UP!</Text>
            </Animated.View>

            {/* Agent showcase */}
            <Animated.View style={[styles.agentContainer, agentStyle]}>
              <View style={[styles.agentGlow, { backgroundColor: agentColor + '30' }]}>
                <AgentSprite agentClass={agentClass} size="xl" state="complete" />
              </View>
              <Text style={styles.agentName}>{agent.name}</Text>
              <Text style={styles.agentClass}>{classInfo?.name}</Text>
            </Animated.View>

            {/* Level display */}
            <View style={styles.levelContainer}>
              <Text style={styles.levelLabel}>Level</Text>
              <Animated.Text style={levelStyle}>
                {Math.round(levelNumber.value)}
              </Animated.Text>
            </View>

            {/* Stats gained */}
            <View style={styles.statsContainer}>
              <StatGain label="Max Tokens" value="+500" icon="flash" />
              <StatGain label="Speed" value="+5%" icon="speedometer" />
            </View>

            {/* Dismiss button */}
            <FantasyButton
              variant="summon"
              size="lg"
              onPress={handleDismiss}
              style={styles.dismissButton}
            >
              Continue
            </FantasyButton>
          </View>
        </Animated.View>
      </Pressable>
    </Modal>
  );
}

// Animated particle component
interface AnimatedParticleProps {
  index: number;
  angle: Animated.SharedValue<number>;
  distance: Animated.SharedValue<number>;
  opacity: Animated.SharedValue<number>;
  rotation: Animated.SharedValue<number>;
  color: string;
}

function AnimatedParticle({
  index,
  angle,
  distance,
  opacity,
  rotation,
  color,
}: AnimatedParticleProps) {
  const style = useAnimatedStyle(() => {
    const rad = (angle.value * Math.PI) / 180;
    const x = Math.cos(rad) * distance.value;
    const y = Math.sin(rad) * distance.value;

    return {
      position: 'absolute',
      left: SCREEN_WIDTH / 2 - 10,
      top: SCREEN_HEIGHT / 2 - 10,
      transform: [
        { translateX: x },
        { translateY: y },
        { rotate: `${rotation.value}deg` },
      ],
      opacity: opacity.value,
    };
  });

  const PARTICLE_EMOJIS = ['✨', '⭐', '💫', '🌟'];
  const emoji = PARTICLE_EMOJIS[index % PARTICLE_EMOJIS.length];

  return (
    <Animated.View style={style}>
      <Text style={styles.particle}>{emoji}</Text>
    </Animated.View>
  );
}

// Stat gain display
interface StatGainProps {
  label: string;
  value: string;
  icon: string;
}

function StatGain({ label, value, icon }: StatGainProps) {
  return (
    <View style={styles.statItem}>
      <Ionicons name={icon as any} size={16} color={Colors.fel.green} />
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
    </View>
  );
}

/**
 * useLevelUpCelebration - Hook to trigger level up celebration
 */
export function useLevelUpCelebration() {
  const [celebration, setCelebration] = useState<{
    visible: boolean;
    agent: Agent | null;
    newLevel: number;
  }>({
    visible: false,
    agent: null,
    newLevel: 1,
  });

  const showCelebration = (agent: Agent, newLevel: number) => {
    setCelebration({ visible: true, agent, newLevel });
  };

  const hideCelebration = () => {
    setCelebration((prev) => ({ ...prev, visible: false }));
  };

  const CelebrationComponent = celebration.agent ? (
    <LevelUpCelebration
      agent={celebration.agent}
      newLevel={celebration.newLevel}
      visible={celebration.visible}
      onDismiss={hideCelebration}
    />
  ) : null;

  return {
    showCelebration,
    hideCelebration,
    CelebrationComponent,
  };
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  burst: {
    position: 'absolute',
    width: 300,
    height: 300,
    alignItems: 'center',
    justifyContent: 'center',
  },
  burstInner: {
    width: '100%',
    height: '100%',
    borderRadius: 150,
    borderWidth: 4,
    borderStyle: 'dashed',
  },
  particle: {
    fontSize: 24,
  },
  content: {
    alignItems: 'center',
    padding: Spacing.xl,
  },
  title: {
    fontSize: 48,
    fontWeight: '900',
    color: Colors.holy.gold,
    letterSpacing: 4,
    textShadowColor: Colors.holy.goldDark,
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
    marginBottom: Spacing.xl,
  },
  agentContainer: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  agentGlow: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  agentName: {
    fontSize: FontSize.xl,
    fontWeight: '700',
    color: Colors.text,
  },
  agentClass: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  levelContainer: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  levelLabel: {
    fontSize: FontSize.md,
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  statsContainer: {
    backgroundColor: Colors.shadow.darker,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.xl,
    minWidth: 200,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.xs,
    gap: Spacing.sm,
  },
  statLabel: {
    flex: 1,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
  statValue: {
    fontSize: FontSize.md,
    fontWeight: '700',
    color: Colors.fel.green,
  },
  dismissButton: {
    minWidth: 200,
  },
});

export default LevelUpCelebration;
