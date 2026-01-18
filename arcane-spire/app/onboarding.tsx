import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  FlatList,
  Pressable,
  ViewToken,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  interpolate,
  Extrapolation,
  FadeIn,
  FadeOut,
} from 'react-native-reanimated';
import { Colors, Spacing, BorderRadius, FontSize } from '../constants/theme';
import { usePrefsStore } from '../stores/prefsStore';
import { FantasyButton } from '../components/ui/FantasyButton';
import { AgentSprite } from '../components/ui/PixelAsset';
import { soundService } from '../services/sound';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface OnboardingSlide {
  id: string;
  title: string;
  description: string;
  agentClass?: 'mage' | 'architect' | 'engineer' | 'scout' | 'guardian' | 'artisan';
  emoji?: string;
  features?: string[];
}

const ONBOARDING_SLIDES: OnboardingSlide[] = [
  {
    id: 'welcome',
    title: 'Welcome to the Arcane Spire',
    description:
      'Your mobile command center for AI coding agents. Summon powerful agents, assign quests, and watch your projects come to life.',
    emoji: '🏰',
  },
  {
    id: 'agents',
    title: 'Summon Your Champions',
    description:
      'Each agent class has unique abilities. From the versatile Mage to the methodical Architect, assemble your perfect party.',
    agentClass: 'mage',
    features: ['Mage - Versatile caster', 'Architect - System designer', 'Engineer - Builder'],
  },
  {
    id: 'quests',
    title: 'Assign Quests',
    description:
      'Send your agents on coding quests. They\'ll work autonomously, earning XP and leveling up as they complete tasks.',
    emoji: '📜',
    features: ['Auto-complete tasks', 'Earn XP rewards', 'Collect loot (artifacts)'],
  },
  {
    id: 'connect',
    title: 'Connect Your Forge',
    description:
      'Link your mobile device to your development machine. Monitor progress, review changes, and command your agents from anywhere.',
    emoji: '🔗',
    features: ['WebSocket connection', 'Real-time updates', 'Remote control'],
  },
  {
    id: 'ready',
    title: 'Ready to Begin',
    description:
      'Your Spire awaits. Connect to your Forge and summon your first agent to start your journey.',
    emoji: '✨',
  },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const flatListRef = useRef<FlatList>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollX = useSharedValue(0);

  const { completeOnboarding } = usePrefsStore();

  const handleSkip = () => {
    soundService.play('tap');
    completeOnboarding();
    router.replace('/(tabs)/spire');
  };

  const handleNext = () => {
    soundService.play('tap');
    if (currentIndex < ONBOARDING_SLIDES.length - 1) {
      flatListRef.current?.scrollToIndex({
        index: currentIndex + 1,
        animated: true,
      });
    } else {
      // Complete onboarding
      completeOnboarding();
      router.replace('/(tabs)/spire');
    }
  };

  const handleViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length > 0 && viewableItems[0].index !== null) {
        setCurrentIndex(viewableItems[0].index);
      }
    }
  ).current;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
  }).current;

  const renderSlide = ({ item, index }: { item: OnboardingSlide; index: number }) => (
    <View style={styles.slide}>
      {/* Visual */}
      <View style={styles.visualContainer}>
        {item.agentClass ? (
          <View style={styles.agentShowcase}>
            <AgentSprite agentClass={item.agentClass} size="xl" animated />
          </View>
        ) : (
          <Text style={styles.visualEmoji}>{item.emoji}</Text>
        )}
      </View>

      {/* Content */}
      <View style={styles.contentContainer}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.description}>{item.description}</Text>

        {/* Features list */}
        {item.features && (
          <View style={styles.featuresList}>
            {item.features.map((feature, idx) => (
              <View key={idx} style={styles.featureItem}>
                <Text style={styles.featureBullet}>✦</Text>
                <Text style={styles.featureText}>{feature}</Text>
              </View>
            ))}
          </View>
        )}
      </View>
    </View>
  );

  const isLastSlide = currentIndex === ONBOARDING_SLIDES.length - 1;

  return (
    <SafeAreaView style={styles.container}>
      {/* Skip button */}
      {!isLastSlide && (
        <Animated.View entering={FadeIn} exiting={FadeOut} style={styles.skipContainer}>
          <Pressable onPress={handleSkip}>
            <Text style={styles.skipText}>Skip</Text>
          </Pressable>
        </Animated.View>
      )}

      {/* Slides */}
      <FlatList
        ref={flatListRef}
        data={ONBOARDING_SLIDES}
        renderItem={renderSlide}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onViewableItemsChanged={handleViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        onScroll={(e) => {
          scrollX.value = e.nativeEvent.contentOffset.x;
        }}
        scrollEventThrottle={16}
      />

      {/* Pagination dots */}
      <View style={styles.pagination}>
        {ONBOARDING_SLIDES.map((_, index) => {
          const dotStyle = useAnimatedStyle(() => {
            const inputRange = [
              (index - 1) * SCREEN_WIDTH,
              index * SCREEN_WIDTH,
              (index + 1) * SCREEN_WIDTH,
            ];

            const scale = interpolate(
              scrollX.value,
              inputRange,
              [0.8, 1.2, 0.8],
              Extrapolation.CLAMP
            );

            const opacity = interpolate(
              scrollX.value,
              inputRange,
              [0.4, 1, 0.4],
              Extrapolation.CLAMP
            );

            return {
              transform: [{ scale }],
              opacity,
            };
          });

          return (
            <Animated.View
              key={index}
              style={[
                styles.dot,
                index === currentIndex && styles.dotActive,
                dotStyle,
              ]}
            />
          );
        })}
      </View>

      {/* Action buttons */}
      <View style={styles.footer}>
        <FantasyButton
          variant={isLastSlide ? 'summon' : 'primary'}
          size="lg"
          fullWidth
          onPress={handleNext}
        >
          {isLastSlide ? "🏰 Enter the Spire 🏰" : 'Continue'}
        </FantasyButton>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  skipContainer: {
    position: 'absolute',
    top: 60,
    right: Spacing.md,
    zIndex: 10,
  },
  skipText: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    padding: Spacing.sm,
  },
  slide: {
    width: SCREEN_WIDTH,
    flex: 1,
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xxl,
  },
  visualContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    maxHeight: SCREEN_HEIGHT * 0.35,
  },
  visualEmoji: {
    fontSize: 120,
  },
  agentShowcase: {
    width: 150,
    height: 150,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.shadow.darker,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: Colors.arcane.purple,
  },
  contentContainer: {
    flex: 1,
    paddingTop: Spacing.xl,
  },
  title: {
    fontSize: FontSize.xxl,
    fontWeight: '700',
    color: Colors.text,
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  description: {
    fontSize: FontSize.lg,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: FontSize.lg * 1.5,
  },
  featuresList: {
    marginTop: Spacing.xl,
    alignItems: 'center',
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  featureBullet: {
    color: Colors.holy.gold,
    marginRight: Spacing.sm,
  },
  featureText: {
    fontSize: FontSize.md,
    color: Colors.text,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: Spacing.lg,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.stone.dark,
    marginHorizontal: 6,
  },
  dotActive: {
    backgroundColor: Colors.arcane.purple,
  },
  footer: {
    padding: Spacing.md,
    paddingBottom: Spacing.xl,
  },
});
