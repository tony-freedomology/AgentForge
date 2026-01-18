import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  FlatList,
  Pressable,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
  useAnimatedStyle,
  withSpring,
  useSharedValue,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius, FontSize, AgentColors } from '../constants/theme';
import { AGENT_CLASSES, AgentClass, AgentClassInfo } from '../shared/types/agent';
import { getRandomAgentName } from '../constants/agentClasses';
import { useConnectionStore } from '../stores/connectionStore';
import { useSpireConnection } from '../hooks/useSpireConnection';
import { FantasyCard } from '../components/ui/FantasyCard';
import { FantasyButton } from '../components/ui/FantasyButton';
import { FantasyInput } from '../components/ui/FantasyInput';
import { LoadingRune } from '../components/ui/LoadingRune';
import { soundService } from '../services/sound';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH * 0.7;
const CARD_SPACING = 20;

type SummonStep = 'class' | 'config' | 'summoning';

export default function SummonScreen() {
  const router = useRouter();
  const flatListRef = useRef<FlatList>(null);

  const [step, setStep] = useState<SummonStep>('class');
  const [selectedClass, setSelectedClass] = useState<AgentClass>('mage');
  const [agentName, setAgentName] = useState(getRandomAgentName('mage'));
  const [workingDirectory, setWorkingDirectory] = useState('');
  const [initialTask, setInitialTask] = useState('');

  const { spawnAgent, connectionStatus } = useSpireConnection();
  const recentWorkspaces = useConnectionStore((state) => state.recentWorkspaces);

  const classes = Object.values(AGENT_CLASSES);
  const selectedClassInfo = AGENT_CLASSES[selectedClass];

  const handleClassSelect = (agentClass: AgentClass) => {
    soundService.play('tap');
    setSelectedClass(agentClass);
    setAgentName(getRandomAgentName(agentClass));
  };

  const handleRandomName = () => {
    soundService.play('tap');
    setAgentName(getRandomAgentName(selectedClass));
  };

  const handleProceedToConfig = () => {
    soundService.play('tap');
    setStep('config');
  };

  const handleBack = () => {
    soundService.play('tap');
    if (step === 'config') {
      setStep('class');
    } else {
      router.back();
    }
  };

  const handleSummon = () => {
    soundService.play('spawn');
    setStep('summoning');

    // Actually spawn the agent
    spawnAgent(agentName, selectedClass, workingDirectory || '~', initialTask || undefined);

    // Navigate back after animation
    setTimeout(() => {
      router.back();
    }, 2000);
  };

  const handleClose = () => {
    soundService.play('tap');
    router.back();
  };

  const renderClassCard = ({ item, index }: { item: AgentClassInfo; index: number }) => {
    const isSelected = item.id === selectedClass;
    const color = AgentColors[item.id];

    return (
      <Pressable onPress={() => handleClassSelect(item.id)}>
        <Animated.View
          style={[
            styles.classCard,
            {
              borderColor: isSelected ? color : Colors.border,
              backgroundColor: isSelected ? color + '20' : Colors.shadow.lighter,
            },
          ]}
        >
          <Text style={styles.classIcon}>{item.icon}</Text>
          <Text style={[styles.className, isSelected && { color }]}>{item.name}</Text>
          <Text style={styles.classProvider}>{item.provider}</Text>
        </Animated.View>
      </Pressable>
    );
  };

  // Step 1: Class Selection
  if (step === 'class') {
    return (
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={handleClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color={Colors.textSecondary} />
          </Pressable>
          <Text style={styles.title}>═══ SUMMON NEW AGENT ═══</Text>
          <View style={styles.closeButton} />
        </View>

        <Text style={styles.subtitle}>Choose your champion</Text>

        {/* Class Carousel */}
        <FlatList
          ref={flatListRef}
          data={classes}
          renderItem={renderClassCard}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.carouselContent}
          snapToInterval={CARD_WIDTH + CARD_SPACING}
          decelerationRate="fast"
        />

        {/* Selected Class Details */}
        <FantasyCard variant="dark" style={styles.detailsCard}>
          <View style={styles.detailsHeader}>
            <View style={[styles.detailsIcon, { backgroundColor: AgentColors[selectedClass] + '30' }]}>
              <Text style={styles.detailsIconText}>{selectedClassInfo.icon}</Text>
            </View>
            <View style={styles.detailsInfo}>
              <Text style={[styles.detailsName, { color: AgentColors[selectedClass] }]}>
                {selectedClassInfo.name.toUpperCase()}
              </Text>
              <Text style={styles.detailsProvider}>{selectedClassInfo.provider}</Text>
            </View>
          </View>

          <Text style={styles.detailsDescription}>{selectedClassInfo.description}</Text>

          <View style={styles.strengthsList}>
            {selectedClassInfo.strengths.map((strength, index) => (
              <View key={index} style={styles.strengthItem}>
                <Text style={styles.strengthBullet}>✦</Text>
                <Text style={styles.strengthText}>{strength}</Text>
              </View>
            ))}
          </View>
        </FantasyCard>

        {/* Proceed button */}
        <View style={styles.footer}>
          <FantasyButton
            variant="summon"
            size="lg"
            fullWidth
            onPress={handleProceedToConfig}
            disabled={connectionStatus !== 'connected'}
          >
            Select {selectedClassInfo.name}
          </FantasyButton>
          {connectionStatus !== 'connected' && (
            <Text style={styles.warningText}>Connect to a Forge to summon agents</Text>
          )}
        </View>
      </SafeAreaView>
    );
  }

  // Step 2: Configuration
  if (step === 'config') {
    return (
      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.configContainer}
        >
          {/* Header */}
          <View style={styles.header}>
            <Pressable onPress={handleBack} style={styles.closeButton}>
              <Ionicons name="arrow-back" size={24} color={Colors.textSecondary} />
            </Pressable>
            <Text style={styles.title}>═══ CONFIGURE YOUR {selectedClassInfo.name.toUpperCase()} ═══</Text>
            <View style={styles.closeButton} />
          </View>

          <View style={styles.configContent}>
            {/* Name input */}
            <View style={styles.configSection}>
              <Text style={styles.configLabel}>Name</Text>
              <View style={styles.nameInputRow}>
                <View style={styles.nameInputContainer}>
                  <FantasyInput
                    value={agentName}
                    onChangeText={setAgentName}
                    placeholder="Agent name"
                  />
                </View>
                <Pressable onPress={handleRandomName} style={styles.randomButton}>
                  <Ionicons name="dice" size={24} color={Colors.arcane.purple} />
                </Pressable>
              </View>
            </View>

            {/* Working Directory */}
            <View style={styles.configSection}>
              <Text style={styles.configLabel}>Working Directory</Text>
              <FantasyInput
                value={workingDirectory}
                onChangeText={setWorkingDirectory}
                placeholder="~/projects/my-app"
              />
              {recentWorkspaces.length > 0 && (
                <View style={styles.recentWorkspaces}>
                  <Text style={styles.recentLabel}>Recent:</Text>
                  {recentWorkspaces.slice(0, 3).map((ws, index) => (
                    <Pressable
                      key={index}
                      onPress={() => {
                        soundService.play('tap');
                        setWorkingDirectory(ws);
                      }}
                      style={styles.recentItem}
                    >
                      <Text style={styles.recentItemText} numberOfLines={1}>
                        {ws}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              )}
            </View>

            {/* Initial Task */}
            <View style={styles.configSection}>
              <Text style={styles.configLabel}>Initial Quest (optional)</Text>
              <FantasyInput
                value={initialTask}
                onChangeText={setInitialTask}
                placeholder="What should this agent work on?"
                multiline
                numberOfLines={3}
              />
            </View>
          </View>

          {/* Summon button */}
          <View style={styles.footer}>
            <FantasyButton
              variant="summon"
              size="lg"
              fullWidth
              onPress={handleSummon}
              disabled={!agentName.trim()}
            >
              🌟 BEGIN SUMMONING 🌟
            </FantasyButton>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  // Step 3: Summoning Animation
  return (
    <SafeAreaView style={styles.summoningContainer}>
      <View style={styles.portalContainer}>
        {/* Portal animation */}
        <Animated.View style={styles.portal}>
          <View style={styles.portalRing}>
            <View style={styles.portalInner}>
              <Text style={styles.summoningIcon}>{selectedClassInfo.icon}</Text>
            </View>
          </View>
        </Animated.View>

        <LoadingRune
          size="lg"
          color={AgentColors[selectedClass]}
          label={`Summoning ${agentName} the ${selectedClassInfo.name}...`}
        />
      </View>
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
    paddingVertical: Spacing.md,
  },
  closeButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: FontSize.md,
    fontWeight: '700',
    color: Colors.text,
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: FontSize.lg,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  carouselContent: {
    paddingHorizontal: (SCREEN_WIDTH - CARD_WIDTH) / 2,
    gap: CARD_SPACING,
  },
  classCard: {
    width: CARD_WIDTH,
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    borderWidth: 2,
    alignItems: 'center',
  },
  classIcon: {
    fontSize: 64,
    marginBottom: Spacing.md,
  },
  className: {
    fontSize: FontSize.xl,
    fontWeight: '700',
    color: Colors.text,
  },
  classProvider: {
    fontSize: FontSize.sm,
    color: Colors.textMuted,
    marginTop: Spacing.xs,
  },
  detailsCard: {
    margin: Spacing.md,
    marginTop: Spacing.lg,
  },
  detailsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  detailsIcon: {
    width: 60,
    height: 60,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailsIconText: {
    fontSize: 36,
  },
  detailsInfo: {
    marginLeft: Spacing.md,
  },
  detailsName: {
    fontSize: FontSize.lg,
    fontWeight: '700',
  },
  detailsProvider: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
  detailsDescription: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    lineHeight: FontSize.md * 1.5,
    marginBottom: Spacing.md,
  },
  strengthsList: {
    gap: Spacing.xs,
  },
  strengthItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  strengthBullet: {
    color: Colors.holy.gold,
    marginRight: Spacing.sm,
  },
  strengthText: {
    fontSize: FontSize.sm,
    color: Colors.text,
  },
  footer: {
    padding: Spacing.md,
    paddingBottom: Spacing.xl,
  },
  warningText: {
    fontSize: FontSize.sm,
    color: Colors.fire.orange,
    textAlign: 'center',
    marginTop: Spacing.sm,
  },

  // Config styles
  configContainer: {
    flex: 1,
  },
  configContent: {
    flex: 1,
    padding: Spacing.md,
  },
  configSection: {
    marginBottom: Spacing.lg,
  },
  configLabel: {
    fontSize: FontSize.sm,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
  },
  nameInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  nameInputContainer: {
    flex: 1,
  },
  randomButton: {
    width: 48,
    height: 48,
    backgroundColor: Colors.shadow.lighter,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.border,
  },
  recentWorkspaces: {
    marginTop: Spacing.sm,
  },
  recentLabel: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    marginBottom: Spacing.xs,
  },
  recentItem: {
    backgroundColor: Colors.shadow.lighter,
    borderRadius: BorderRadius.sm,
    padding: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  recentItemText: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },

  // Summoning styles
  summoningContainer: {
    flex: 1,
    backgroundColor: Colors.shadow.black,
    alignItems: 'center',
    justifyContent: 'center',
  },
  portalContainer: {
    alignItems: 'center',
  },
  portal: {
    marginBottom: Spacing.xxl,
  },
  portalRing: {
    width: 150,
    height: 150,
    borderRadius: 75,
    borderWidth: 3,
    borderColor: Colors.arcane.purple,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  portalInner: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.arcane.purple + '30',
    alignItems: 'center',
    justifyContent: 'center',
  },
  summoningIcon: {
    fontSize: 64,
  },
});
