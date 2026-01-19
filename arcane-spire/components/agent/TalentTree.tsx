import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Dimensions, Image, ImageBackground } from 'react-native';
import Animated, {
  useAnimatedStyle,
  withSpring,
  withTiming,
  useSharedValue,
  interpolateColor,
} from 'react-native-reanimated';
import { Colors, Spacing, BorderRadius, FontSize, AgentColors } from '../../constants/theme';
import { UIElements, Icons } from '../../constants/assets';
import { Agent, AgentClass } from '../../shared/types/agent';
import { Talent, TALENT_TREES } from '../../constants/talents';
import { FantasyCard } from '../ui/FantasyCard';
import { FantasyButton } from '../ui/FantasyButton';
import { soundService } from '../../services/sound';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface TalentTreeProps {
  agent: Agent;
  onTalentAllocate?: (talentId: string) => void;
}

/**
 * TalentTree - Visual talent tree for agent specialization
 *
 * Shows a tree of talents that can be unlocked with talent points.
 * Each agent class has a unique talent tree.
 */
export function TalentTree({ agent, onTalentAllocate }: TalentTreeProps) {
  const agentClass = agent.class as AgentClass;
  const talents = TALENT_TREES[agentClass] || [];
  const agentColor = AgentColors[agentClass] || Colors.arcane.purple;

  // Group talents by tier
  const tiers = talents.reduce((acc, talent) => {
    if (!acc[talent.tier]) acc[talent.tier] = [];
    acc[talent.tier].push(talent);
    return acc;
  }, {} as Record<number, Talent[]>);

  const tierNumbers = Object.keys(tiers)
    .map(Number)
    .sort((a, b) => a - b);

  // Calculate available points
  const usedPoints = talents.reduce((sum, t) => sum + t.currentRank, 0);
  const availablePoints = agent.talentPoints - usedPoints;

  const [selectedTalent, setSelectedTalent] = useState<Talent | null>(null);

  const handleTalentPress = (talent: Talent) => {
    soundService.play('tap');
    setSelectedTalent(talent);
  };

  const handleAllocate = () => {
    if (!selectedTalent || availablePoints <= 0) return;
    if (selectedTalent.currentRank >= selectedTalent.maxRank) return;

    soundService.playSound('quest', 'talentUnlock');
    onTalentAllocate?.(selectedTalent.id);
    setSelectedTalent(null);
  };

  const canAllocate = (talent: Talent): boolean => {
    if (availablePoints <= 0) return false;
    if (talent.currentRank >= talent.maxRank) return false;
    if (talent.requires) {
      const required = talents.find((t) => t.id === talent.requires);
      if (!required || required.currentRank === 0) return false;
    }
    return true;
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <ImageBackground
        source={UIElements.talent.header}
        style={styles.header}
        imageStyle={styles.headerImage}
      >
        <Text style={styles.title}>Talent Tree</Text>
        <View style={[styles.pointsBadge, { backgroundColor: agentColor + '30' }]}>
          <Image source={Icons.talent.point} style={styles.pointIcon} resizeMode="contain" />
          <Text style={[styles.pointsText, { color: agentColor }]}>
            {availablePoints} Points
          </Text>
        </View>
      </ImageBackground>

      {/* Tree visualization */}
      <ScrollView
        style={styles.treeContainer}
        contentContainerStyle={styles.treeContent}
        showsVerticalScrollIndicator={false}
      >
        {tierNumbers.map((tierNum) => (
          <View key={tierNum} style={styles.tier}>
            <Text style={styles.tierLabel}>Tier {tierNum}</Text>
            <View style={styles.tierTalents}>
              {tiers[tierNum]
                .sort((a, b) => a.position - b.position)
                .map((talent) => (
                  <TalentNode
                    key={talent.id}
                    talent={talent}
                    agentColor={agentColor}
                    isSelected={selectedTalent?.id === talent.id}
                    canAllocate={canAllocate(talent)}
                    onPress={() => handleTalentPress(talent)}
                  />
                ))}
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Selected talent details */}
      {selectedTalent && (
        <FantasyCard variant="dark" style={styles.detailCard}>
          <View style={styles.detailHeader}>
            <Text style={styles.detailIcon}>{selectedTalent.icon}</Text>
            <View style={styles.detailInfo}>
              <Text style={styles.detailName}>{selectedTalent.name}</Text>
              <Text style={styles.detailRanks}>
                Rank {selectedTalent.currentRank}/{selectedTalent.maxRank}
              </Text>
            </View>
          </View>
          <Text style={styles.detailDesc}>{selectedTalent.description}</Text>
          <Text style={styles.detailEffect}>{selectedTalent.effect}</Text>

          {canAllocate(selectedTalent) && (
            <FantasyButton
              variant="summon"
              size="md"
              onPress={handleAllocate}
              style={styles.allocateButton}
            >
              Allocate Point
            </FantasyButton>
          )}
        </FantasyCard>
      )}
    </View>
  );
}

// Individual talent node
interface TalentNodeProps {
  talent: Talent;
  agentColor: string;
  isSelected: boolean;
  canAllocate: boolean;
  onPress: () => void;
}

function TalentNode({
  talent,
  agentColor,
  isSelected,
  canAllocate,
  onPress,
}: TalentNodeProps) {
  const scale = useSharedValue(1);
  const isUnlocked = talent.currentRank > 0;
  const isMaxed = talent.currentRank >= talent.maxRank;

  const handlePressIn = () => {
    scale.value = withSpring(0.95);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  // Get the appropriate status icon
  const getStatusIcon = () => {
    if (isMaxed || isUnlocked) return Icons.talent.learned;
    if (canAllocate) return Icons.talent.available;
    return Icons.talent.locked;
  };

  return (
    <Pressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
    >
      <Animated.View
        style={[
          isSelected && styles.talentNodeSelected,
          !isUnlocked && !canAllocate && styles.talentNodeLocked,
          animatedStyle,
        ]}
      >
        <ImageBackground
          source={isUnlocked ? UIElements.talent.nodeActive : UIElements.talent.nodeBg}
          style={[
            styles.talentNode,
            isUnlocked && { borderColor: agentColor },
          ]}
          imageStyle={styles.talentNodeImage}
        >
          <Text style={styles.talentIcon}>{talent.icon}</Text>

          {/* Status indicator */}
          <Image source={getStatusIcon()} style={styles.talentStatusIcon} resizeMode="contain" />

          <View style={styles.rankIndicator}>
            {Array.from({ length: talent.maxRank }).map((_, i) => (
              <View
                key={i}
                style={[
                  styles.rankDot,
                  i < talent.currentRank && { backgroundColor: agentColor },
                ]}
              />
            ))}
          </View>
          {isMaxed && (
            <View style={[styles.maxBadge, { backgroundColor: agentColor }]}>
              <Text style={styles.maxBadgeText}>MAX</Text>
            </View>
          )}
        </ImageBackground>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    marginBottom: Spacing.sm,
  },
  headerImage: {
    borderRadius: BorderRadius.md,
    opacity: 0.9,
  },
  title: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    color: Colors.text,
  },
  pointsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.full,
    gap: 4,
  },
  pointIcon: {
    width: 16,
    height: 16,
  },
  pointsText: {
    fontSize: FontSize.md,
    fontWeight: '600',
  },
  treeContainer: {
    flex: 1,
  },
  treeContent: {
    padding: Spacing.md,
  },
  tier: {
    marginBottom: Spacing.xl,
  },
  tierLabel: {
    fontSize: FontSize.sm,
    color: Colors.textMuted,
    textAlign: 'center',
    marginBottom: Spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  tierTalents: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing.md,
  },
  talentNode: {
    width: 80,
    height: 80,
    borderRadius: BorderRadius.lg,
    borderWidth: 2,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  talentNodeImage: {
    borderRadius: BorderRadius.lg - 2,
  },
  talentNodeSelected: {
    borderRadius: BorderRadius.lg,
    borderWidth: 3,
    borderColor: Colors.holy.gold,
  },
  talentNodeLocked: {
    opacity: 0.4,
  },
  talentIcon: {
    fontSize: 32,
  },
  talentStatusIcon: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 14,
    height: 14,
  },
  rankIndicator: {
    position: 'absolute',
    bottom: 4,
    flexDirection: 'row',
    gap: 2,
  },
  rankDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.stone.dark,
  },
  maxBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  maxBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.shadow.black,
  },
  detailCard: {
    margin: Spacing.md,
  },
  detailHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  detailIcon: {
    fontSize: 36,
    marginRight: Spacing.md,
  },
  detailInfo: {
    flex: 1,
  },
  detailName: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    color: Colors.text,
  },
  detailRanks: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  detailDesc: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
  },
  detailEffect: {
    fontSize: FontSize.sm,
    color: Colors.fel.green,
    fontStyle: 'italic',
  },
  allocateButton: {
    marginTop: Spacing.md,
  },
});

export default TalentTree;
