import React, { useState, useRef, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  FlatList,
  Pressable,
  ViewToken,
  Image,
  ImageSourcePropType,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  withRepeat,
  withSequence,
  interpolate,
  Extrapolation,
  FadeIn,
  FadeOut,
  SharedValue,
} from 'react-native-reanimated';
import { Colors, Spacing, BorderRadius, FontSize } from '../constants/theme';
import { usePrefsStore } from '../stores/prefsStore';
import { FantasyButton } from '../components/ui/FantasyButton';
import { AgentSprite } from '../components/ui/PixelAsset';
import { Onboarding as OnboardingAssets, Backgrounds, AgentSprites } from '../constants/assets';
import { soundService } from '../services/sound';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface OnboardingSlide {
  id: string;
  title: string;
  description: string;
  image?: ImageSourcePropType;
  agentShowcase?: boolean;
  features?: string[];
  accentColor?: string;
}

const ONBOARDING_SLIDES: OnboardingSlide[] = [
  {
    id: 'welcome',
    title: 'Welcome to the Arcane Spire',
    description:
      'Your mobile command center for AI coding agents. Summon powerful champions and watch your projects come to life.',
    image: OnboardingAssets.welcome,
    accentColor: Colors.arcane.purple,
  },
  {
    id: 'agents',
    title: 'Summon Your Champions',
    description:
      'Each agent class has unique abilities. From the versatile Mage to the methodical Architect, assemble your perfect party.',
    agentShowcase: true,
    features: ['Mage - Complex reasoning', 'Architect - System design', 'Engineer - Fast building'],
    accentColor: Colors.holy.gold,
  },
  {
    id: 'quests',
    title: 'Assign Epic Quests',
    description:
      'Send your agents on coding adventures. They work autonomously, earning XP and leveling up as they conquer tasks.',
    image: OnboardingAssets.daemon,
    features: ['Complete tasks autonomously', 'Earn XP rewards', 'Collect artifact loot'],
    accentColor: Colors.fel.green,
  },
  {
    id: 'connect',
    title: 'Connect Your Forge',
    description:
      'Link to your development machine via Tailscale. Monitor progress and command your agents from anywhere.',
    image: OnboardingAssets.connect,
    features: ['Secure connection', 'Real-time updates', 'Remote control'],
    accentColor: Colors.frost.blue,
  },
  {
    id: 'ready',
    title: 'Your Adventure Awaits',
    description:
      'The Spire stands ready. Connect your Forge and summon your first agent to begin your journey!',
    image: OnboardingAssets.success,
    accentColor: Colors.holy.gold,
  },
];

// Animated agent showcase component
function AgentShowcase() {
  const floatAnim = useSharedValue(0);

  React.useEffect(() => {
    floatAnim.value = withRepeat(
      withSequence(
        withTiming(-8, { duration: 1500 }),
        withTiming(0, { duration: 1500 })
      ),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: floatAnim.value }],
  }));

  return (
    <View style={styles.agentShowcaseContainer}>
      {/* Background glow */}
      <View style={styles.showcaseGlow} />

      {/* Agent sprites in a row */}
      <Animated.View style={[styles.agentRow, animatedStyle]}>
        <View style={styles.agentSlot}>
          <AgentSprite agentClass="mage" size="lg" animated />
          <Text style={styles.agentLabel}>Mage</Text>
        </View>
        <View style={[styles.agentSlot, styles.agentCenter]}>
          <AgentSprite agentClass="architect" size="xl" animated />
          <Text style={styles.agentLabel}>Architect</Text>
        </View>
        <View style={styles.agentSlot}>
          <AgentSprite agentClass="engineer" size="lg" animated />
          <Text style={styles.agentLabel}>Engineer</Text>
        </View>
      </Animated.View>

      {/* Secondary row */}
      <View style={styles.agentRowSecondary}>
        <View style={styles.agentSlotSmall}>
          <AgentSprite agentClass="scout" size="md" animated />
        </View>
        <View style={styles.agentSlotSmall}>
          <AgentSprite agentClass="guardian" size="md" animated />
        </View>
        <View style={styles.agentSlotSmall}>
          <AgentSprite agentClass="artisan" size="md" animated />
        </View>
      </View>
    </View>
  );
}

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
      soundService.play('spawn');
      completeOnboarding();
      router.replace('/(tabs)/spire');
    }
  };

  const handleViewableItemsChanged = useCallback(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length > 0 && viewableItems[0].index !== null) {
        setCurrentIndex(viewableItems[0].index);
      }
    },
    []
  );

  const viewabilityConfig = useMemo(
    () => ({
      itemVisiblePercentThreshold: 50,
    }),
    []
  );

  const renderSlide = ({ item, index }: { item: OnboardingSlide; index: number }) => (
    <View style={styles.slide}>
      {/* Visual */}
      <View style={styles.visualContainer}>
        {item.agentShowcase ? (
          <AgentShowcase />
        ) : item.image ? (
          <View style={styles.imageContainer}>
            <Image
              source={item.image}
              style={styles.slideImage}
              resizeMode="contain"
            />
            {/* Decorative border */}
            <View style={[styles.imageBorder, { borderColor: item.accentColor }]} />
          </View>
        ) : null}
      </View>

      {/* Content */}
      <View style={styles.contentContainer}>
        <Text style={[styles.title, { color: item.accentColor || Colors.text }]}>
          {item.title}
        </Text>
        <Text style={styles.description}>{item.description}</Text>

        {/* Features list */}
        {item.features && (
          <View style={styles.featuresList}>
            {item.features.map((feature, idx) => (
              <Animated.View
                key={idx}
                style={styles.featureItem}
                entering={FadeIn.delay(idx * 100)}
              >
                <View style={[styles.featureBullet, { backgroundColor: item.accentColor }]} />
                <Text style={styles.featureText}>{feature}</Text>
              </Animated.View>
            ))}
          </View>
        )}
      </View>
    </View>
  );

  const isLastSlide = currentIndex === ONBOARDING_SLIDES.length - 1;
  const currentSlide = ONBOARDING_SLIDES[currentIndex];

  return (
    <SafeAreaView style={styles.container}>
      {/* Background decoration */}
      <View style={styles.bgDecoration}>
        <View style={[styles.bgOrb, styles.bgOrb1]} />
        <View style={[styles.bgOrb, styles.bgOrb2]} />
      </View>

      {/* Skip button */}
      {!isLastSlide && (
        <Animated.View entering={FadeIn} exiting={FadeOut} style={styles.skipContainer}>
          <Pressable onPress={handleSkip} hitSlop={20}>
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
        {ONBOARDING_SLIDES.map((slide, index) => (
          <PaginationDot
            key={slide.id}
            index={index}
            scrollX={scrollX}
            currentIndex={currentIndex}
            accentColor={slide.accentColor || Colors.arcane.purple}
          />
        ))}
      </View>

      {/* Action button */}
      <View style={styles.footer}>
        <FantasyButton
          variant={isLastSlide ? 'summon' : 'primary'}
          size="lg"
          fullWidth
          onPress={handleNext}
        >
          {isLastSlide ? "Enter the Spire" : 'Continue'}
        </FantasyButton>
      </View>
    </SafeAreaView>
  );
}

interface PaginationDotProps {
  index: number;
  scrollX: SharedValue<number>;
  currentIndex: number;
  accentColor: string;
}

function PaginationDot({ index, scrollX, currentIndex, accentColor }: PaginationDotProps) {
  const dotStyle = useAnimatedStyle(() => {
    const inputRange = [
      (index - 1) * SCREEN_WIDTH,
      index * SCREEN_WIDTH,
      (index + 1) * SCREEN_WIDTH,
    ];

    const width = interpolate(
      scrollX.value,
      inputRange,
      [10, 28, 10],
      Extrapolation.CLAMP
    );

    const opacity = interpolate(
      scrollX.value,
      inputRange,
      [0.4, 1, 0.4],
      Extrapolation.CLAMP
    );

    return {
      width,
      opacity,
      backgroundColor: index === currentIndex ? accentColor : Colors.stone.dark,
    };
  });

  return <Animated.View style={[styles.dot, dotStyle]} />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  bgDecoration: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  bgOrb: {
    position: 'absolute',
    borderRadius: 999,
    opacity: 0.1,
  },
  bgOrb1: {
    width: 300,
    height: 300,
    backgroundColor: Colors.arcane.purple,
    top: -50,
    right: -100,
  },
  bgOrb2: {
    width: 200,
    height: 200,
    backgroundColor: Colors.frost.blue,
    bottom: 100,
    left: -50,
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
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
  },
  visualContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    maxHeight: SCREEN_HEIGHT * 0.4,
  },
  imageContainer: {
    width: SCREEN_WIDTH - Spacing.lg * 2,
    height: SCREEN_HEIGHT * 0.35,
    alignItems: 'center',
    justifyContent: 'center',
  },
  slideImage: {
    width: '100%',
    height: '100%',
  },
  imageBorder: {
    ...StyleSheet.absoluteFillObject,
    borderWidth: 3,
    borderRadius: BorderRadius.lg,
    opacity: 0.3,
  },
  agentShowcaseContainer: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.lg,
  },
  showcaseGlow: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: Colors.arcane.purple,
    opacity: 0.15,
  },
  agentRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    gap: Spacing.md,
  },
  agentRowSecondary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xl,
    marginTop: Spacing.md,
    opacity: 0.7,
  },
  agentSlot: {
    alignItems: 'center',
  },
  agentSlotSmall: {
    alignItems: 'center',
  },
  agentCenter: {
    marginBottom: Spacing.sm,
  },
  agentLabel: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },
  contentContainer: {
    flex: 1,
    paddingTop: Spacing.lg,
  },
  title: {
    fontSize: FontSize.xxl,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  description: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: FontSize.md * 1.6,
    paddingHorizontal: Spacing.md,
  },
  featuresList: {
    marginTop: Spacing.lg,
    alignItems: 'center',
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
    paddingHorizontal: Spacing.md,
  },
  featureBullet: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: Spacing.sm,
  },
  featureText: {
    fontSize: FontSize.sm,
    color: Colors.text,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: Spacing.lg,
    gap: 8,
  },
  dot: {
    height: 10,
    borderRadius: 5,
  },
  footer: {
    padding: Spacing.md,
    paddingBottom: Spacing.xl,
  },
});
