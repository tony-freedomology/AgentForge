/**
 * Talent Tree Configurations
 *
 * Each agent class has a unique talent tree with 5 tiers and 3 columns.
 * Talents provide passive bonuses or unlock special abilities.
 * Points are earned every level (1 point per level).
 */

import type { Talent, AgentClass } from '../types/agent';

// Mage Talents - Arcane mastery and versatility
const MAGE_TALENTS: Talent[] = [
  // Tier 1 - Foundation
  {
    id: 'mage_arcane_intellect',
    name: 'Arcane Intellect',
    description: 'Increases context window utilization efficiency',
    icon: '🧠',
    tier: 1,
    column: 0,
    maxRanks: 3,
    effect: { type: 'modifier', stat: 'context', value: 5, description: '+5% context efficiency per rank' }
  },
  {
    id: 'mage_quick_casting',
    name: 'Quick Casting',
    description: 'Reduces response latency through optimized prompts',
    icon: '⚡',
    tier: 1,
    column: 1,
    maxRanks: 3,
    effect: { type: 'modifier', stat: 'speed', value: 10, description: '+10% response speed per rank' }
  },
  {
    id: 'mage_spell_focus',
    name: 'Spell Focus',
    description: 'Improves accuracy of code generation',
    icon: '🎯',
    tier: 1,
    column: 2,
    maxRanks: 3,
    effect: { type: 'modifier', stat: 'accuracy', value: 5, description: '+5% accuracy per rank' }
  },

  // Tier 2 - Specialization begins
  {
    id: 'mage_pyroblast',
    name: 'Pyroblast',
    description: 'Enables rapid prototyping mode - fast but less refined',
    icon: '🔥',
    tier: 2,
    column: 0,
    maxRanks: 2,
    requires: 'mage_arcane_intellect',
    effect: { type: 'active', description: 'Unlocks Rapid Prototype command' }
  },
  {
    id: 'mage_arcane_missiles',
    name: 'Arcane Missiles',
    description: 'Enables multi-file editing in a single response',
    icon: '✨',
    tier: 2,
    column: 1,
    maxRanks: 2,
    requires: 'mage_quick_casting',
    effect: { type: 'active', description: 'Can edit up to 3 files simultaneously' }
  },
  {
    id: 'mage_frost_nova',
    name: 'Frost Nova',
    description: 'Enables code review mode with detailed analysis',
    icon: '❄️',
    tier: 2,
    column: 2,
    maxRanks: 2,
    requires: 'mage_spell_focus',
    effect: { type: 'active', description: 'Unlocks Deep Review command' }
  },

  // Tier 3 - Power spike
  {
    id: 'mage_presence_of_mind',
    name: 'Presence of Mind',
    description: 'Maintains better context across long conversations',
    icon: '💭',
    tier: 3,
    column: 0,
    maxRanks: 1,
    requires: 'mage_pyroblast',
    effect: { type: 'passive', stat: 'context', value: 20, description: '+20% context retention' }
  },
  {
    id: 'mage_arcane_power',
    name: 'Arcane Power',
    description: 'Significantly boosts all magical abilities',
    icon: '💫',
    tier: 3,
    column: 1,
    maxRanks: 1,
    requires: 'mage_arcane_missiles',
    effect: { type: 'modifier', stat: 'creativity', value: 25, description: '+25% creative solutions' }
  },
  {
    id: 'mage_ice_barrier',
    name: 'Ice Barrier',
    description: 'Automatically validates output before presenting',
    icon: '🛡️',
    tier: 3,
    column: 2,
    maxRanks: 1,
    requires: 'mage_frost_nova',
    effect: { type: 'passive', description: 'Auto-validates code syntax' }
  },

  // Tier 4 - Advanced
  {
    id: 'mage_combustion',
    name: 'Combustion',
    description: 'Burst mode: Complete complex tasks in fewer iterations',
    icon: '🌋',
    tier: 4,
    column: 0,
    maxRanks: 2,
    requires: 'mage_presence_of_mind',
    effect: { type: 'active', description: 'Unlocks Burst Mode' }
  },
  {
    id: 'mage_evocation',
    name: 'Evocation',
    description: 'Recovers context efficiency over time',
    icon: '🌀',
    tier: 4,
    column: 1,
    maxRanks: 2,
    requires: 'mage_arcane_power',
    effect: { type: 'passive', description: 'Context regeneration during idle' }
  },
  {
    id: 'mage_deep_freeze',
    name: 'Deep Freeze',
    description: 'Can pause and resume complex tasks perfectly',
    icon: '🧊',
    tier: 4,
    column: 2,
    maxRanks: 2,
    requires: 'mage_ice_barrier',
    effect: { type: 'active', description: 'Perfect task suspension' }
  },

  // Tier 5 - Ultimate
  {
    id: 'mage_archmage',
    name: 'Archmage Ascension',
    description: 'Master of all arcane arts - unlocks specialization',
    icon: '👑',
    tier: 5,
    column: 1,
    maxRanks: 1,
    requires: 'mage_evocation',
    effect: { type: 'passive', description: 'Unlocks Mage specializations' }
  }
];

// Guardian Talents - Protection and quality assurance
const GUARDIAN_TALENTS: Talent[] = [
  // Tier 1
  {
    id: 'guardian_shield_wall',
    name: 'Shield Wall',
    description: 'Improved error detection and prevention',
    icon: '🛡️',
    tier: 1,
    column: 0,
    maxRanks: 3,
    effect: { type: 'modifier', stat: 'accuracy', value: 8, description: '+8% error detection per rank' }
  },
  {
    id: 'guardian_vigilance',
    name: 'Vigilance',
    description: 'Enhanced security vulnerability scanning',
    icon: '👁️',
    tier: 1,
    column: 1,
    maxRanks: 3,
    effect: { type: 'passive', description: 'Auto-scans for security issues' }
  },
  {
    id: 'guardian_fortitude',
    name: 'Fortitude',
    description: 'More thorough code reviews',
    icon: '💪',
    tier: 1,
    column: 2,
    maxRanks: 3,
    effect: { type: 'modifier', stat: 'focus', value: 10, description: '+10% review depth per rank' }
  },

  // Tier 2
  {
    id: 'guardian_consecration',
    name: 'Consecration',
    description: 'Marks code sections that need attention',
    icon: '✝️',
    tier: 2,
    column: 0,
    maxRanks: 2,
    requires: 'guardian_shield_wall',
    effect: { type: 'active', description: 'Code annotation mode' }
  },
  {
    id: 'guardian_divine_shield',
    name: 'Divine Shield',
    description: 'Creates backup before any destructive operation',
    icon: '💛',
    tier: 2,
    column: 1,
    maxRanks: 2,
    requires: 'guardian_vigilance',
    effect: { type: 'passive', description: 'Auto-backup on destructive ops' }
  },
  {
    id: 'guardian_righteous_fury',
    name: 'Righteous Fury',
    description: 'Aggressive bug hunting mode',
    icon: '⚔️',
    tier: 2,
    column: 2,
    maxRanks: 2,
    requires: 'guardian_fortitude',
    effect: { type: 'active', description: 'Deep bug analysis mode' }
  },

  // Tier 3
  {
    id: 'guardian_blessing_of_protection',
    name: 'Blessing of Protection',
    description: 'Ensures backward compatibility',
    icon: '🙏',
    tier: 3,
    column: 0,
    maxRanks: 1,
    requires: 'guardian_consecration',
    effect: { type: 'passive', description: 'Compatibility checking' }
  },
  {
    id: 'guardian_aura_mastery',
    name: 'Aura Mastery',
    description: 'Improves team coordination insights',
    icon: '🌟',
    tier: 3,
    column: 1,
    maxRanks: 1,
    requires: 'guardian_divine_shield',
    effect: { type: 'passive', description: 'Cross-agent awareness' }
  },
  {
    id: 'guardian_hammer_of_justice',
    name: 'Hammer of Justice',
    description: 'Strict type checking enforcement',
    icon: '🔨',
    tier: 3,
    column: 2,
    maxRanks: 1,
    requires: 'guardian_righteous_fury',
    effect: { type: 'active', description: 'Strict mode enforcement' }
  },

  // Tier 4
  {
    id: 'guardian_ardent_defender',
    name: 'Ardent Defender',
    description: 'Prevents catastrophic errors from reaching production',
    icon: '🏰',
    tier: 4,
    column: 0,
    maxRanks: 2,
    requires: 'guardian_blessing_of_protection',
    effect: { type: 'passive', description: 'Production safeguards' }
  },
  {
    id: 'guardian_lay_on_hands',
    name: 'Lay on Hands',
    description: 'Emergency rollback capability',
    icon: '🤲',
    tier: 4,
    column: 1,
    maxRanks: 2,
    requires: 'guardian_aura_mastery',
    effect: { type: 'active', description: 'Instant rollback' }
  },
  {
    id: 'guardian_avenging_wrath',
    name: 'Avenging Wrath',
    description: 'Intensive debugging session',
    icon: '👼',
    tier: 4,
    column: 2,
    maxRanks: 2,
    requires: 'guardian_hammer_of_justice',
    effect: { type: 'active', description: 'Deep debug mode' }
  },

  // Tier 5
  {
    id: 'guardian_divine_intervention',
    name: 'Divine Intervention',
    description: 'Master protector - unlocks specialization',
    icon: '👑',
    tier: 5,
    column: 1,
    maxRanks: 1,
    requires: 'guardian_lay_on_hands',
    effect: { type: 'passive', description: 'Unlocks Guardian specializations' }
  }
];

// Architect Talents - System design and planning
const ARCHITECT_TALENTS: Talent[] = [
  // Tier 1
  {
    id: 'architect_blueprints',
    name: 'Arcane Blueprints',
    description: 'Enhanced system design capabilities',
    icon: '📐',
    tier: 1,
    column: 0,
    maxRanks: 3,
    effect: { type: 'modifier', stat: 'creativity', value: 8, description: '+8% design quality per rank' }
  },
  {
    id: 'architect_foresight',
    name: 'Mystic Foresight',
    description: 'Better prediction of potential issues',
    icon: '🔮',
    tier: 1,
    column: 1,
    maxRanks: 3,
    effect: { type: 'passive', description: 'Predicts scaling issues' }
  },
  {
    id: 'architect_foundation',
    name: 'Strong Foundation',
    description: 'Creates more maintainable code structures',
    icon: '🏛️',
    tier: 1,
    column: 2,
    maxRanks: 3,
    effect: { type: 'modifier', stat: 'accuracy', value: 6, description: '+6% maintainability per rank' }
  },

  // Tier 2
  {
    id: 'architect_grand_design',
    name: 'Grand Design',
    description: 'Can plan entire system architectures',
    icon: '🗺️',
    tier: 2,
    column: 0,
    maxRanks: 2,
    requires: 'architect_blueprints',
    effect: { type: 'active', description: 'System architecture mode' }
  },
  {
    id: 'architect_scrying',
    name: 'Scrying Pool',
    description: 'Analyzes dependencies and impacts',
    icon: '💧',
    tier: 2,
    column: 1,
    maxRanks: 2,
    requires: 'architect_foresight',
    effect: { type: 'active', description: 'Dependency analysis' }
  },
  {
    id: 'architect_structural_integrity',
    name: 'Structural Integrity',
    description: 'Ensures SOLID principles compliance',
    icon: '⚖️',
    tier: 2,
    column: 2,
    maxRanks: 2,
    requires: 'architect_foundation',
    effect: { type: 'passive', description: 'SOLID enforcement' }
  },

  // Tier 3
  {
    id: 'architect_master_builder',
    name: 'Master Builder',
    description: 'Creates reusable component libraries',
    icon: '🏗️',
    tier: 3,
    column: 0,
    maxRanks: 1,
    requires: 'architect_grand_design',
    effect: { type: 'active', description: 'Component library generation' }
  },
  {
    id: 'architect_time_warp',
    name: 'Time Warp',
    description: 'Considers long-term maintenance implications',
    icon: '⏳',
    tier: 3,
    column: 1,
    maxRanks: 1,
    requires: 'architect_scrying',
    effect: { type: 'passive', description: 'Future-proofing analysis' }
  },
  {
    id: 'architect_load_bearing',
    name: 'Load Bearing Pillars',
    description: 'Optimizes for performance at scale',
    icon: '📊',
    tier: 3,
    column: 2,
    maxRanks: 1,
    requires: 'architect_structural_integrity',
    effect: { type: 'passive', description: 'Scalability optimization' }
  },

  // Tier 4
  {
    id: 'architect_world_shaper',
    name: 'World Shaper',
    description: 'Can refactor entire codebases safely',
    icon: '🌍',
    tier: 4,
    column: 0,
    maxRanks: 2,
    requires: 'architect_master_builder',
    effect: { type: 'active', description: 'Mass refactoring mode' }
  },
  {
    id: 'architect_dimensional_anchor',
    name: 'Dimensional Anchor',
    description: 'Creates migration paths between architectures',
    icon: '⚓',
    tier: 4,
    column: 1,
    maxRanks: 2,
    requires: 'architect_time_warp',
    effect: { type: 'active', description: 'Migration planning' }
  },
  {
    id: 'architect_infinity_engine',
    name: 'Infinity Engine',
    description: 'Designs for infinite scalability',
    icon: '♾️',
    tier: 4,
    column: 2,
    maxRanks: 2,
    requires: 'architect_load_bearing',
    effect: { type: 'passive', description: 'Infinite scale design' }
  },

  // Tier 5
  {
    id: 'architect_grand_architect',
    name: 'Grand Architect Ascension',
    description: 'Master of all design - unlocks specialization',
    icon: '👑',
    tier: 5,
    column: 1,
    maxRanks: 1,
    requires: 'architect_dimensional_anchor',
    effect: { type: 'passive', description: 'Unlocks Architect specializations' }
  }
];

// Scout Talents - Fast exploration and research
const SCOUT_TALENTS: Talent[] = [
  // Tier 1
  {
    id: 'scout_tracking',
    name: 'Expert Tracking',
    description: 'Faster codebase navigation',
    icon: '🐾',
    tier: 1,
    column: 0,
    maxRanks: 3,
    effect: { type: 'modifier', stat: 'speed', value: 15, description: '+15% search speed per rank' }
  },
  {
    id: 'scout_keen_eyes',
    name: 'Keen Eyes',
    description: 'Better pattern recognition',
    icon: '👁️',
    tier: 1,
    column: 1,
    maxRanks: 3,
    effect: { type: 'modifier', stat: 'accuracy', value: 6, description: '+6% pattern matching per rank' }
  },
  {
    id: 'scout_light_feet',
    name: 'Light Feet',
    description: 'More efficient resource usage',
    icon: '🦶',
    tier: 1,
    column: 2,
    maxRanks: 3,
    effect: { type: 'modifier', stat: 'context', value: 5, description: '+5% efficiency per rank' }
  },

  // Tier 2
  {
    id: 'scout_shadowmeld',
    name: 'Shadowmeld',
    description: 'Silent observation mode - no changes',
    icon: '🌑',
    tier: 2,
    column: 0,
    maxRanks: 2,
    requires: 'scout_tracking',
    effect: { type: 'active', description: 'Read-only exploration' }
  },
  {
    id: 'scout_hunters_mark',
    name: "Hunter's Mark",
    description: 'Tags important code sections for later',
    icon: '🎯',
    tier: 2,
    column: 1,
    maxRanks: 2,
    requires: 'scout_keen_eyes',
    effect: { type: 'active', description: 'Code bookmarking' }
  },
  {
    id: 'scout_aspect_of_cheetah',
    name: 'Aspect of the Cheetah',
    description: 'Rapid file traversal',
    icon: '🐆',
    tier: 2,
    column: 2,
    maxRanks: 2,
    requires: 'scout_light_feet',
    effect: { type: 'modifier', stat: 'speed', value: 25, description: '+25% traversal speed' }
  },

  // Tier 3
  {
    id: 'scout_camouflage',
    name: 'Camouflage',
    description: 'Minimal footprint exploration',
    icon: '🌿',
    tier: 3,
    column: 0,
    maxRanks: 1,
    requires: 'scout_shadowmeld',
    effect: { type: 'passive', description: 'Zero-impact analysis' }
  },
  {
    id: 'scout_eagle_eye',
    name: 'Eagle Eye',
    description: 'Can analyze very large codebases',
    icon: '🦅',
    tier: 3,
    column: 1,
    maxRanks: 1,
    requires: 'scout_hunters_mark',
    effect: { type: 'passive', description: 'Large-scale analysis' }
  },
  {
    id: 'scout_rapid_fire',
    name: 'Rapid Fire',
    description: 'Quick successive searches',
    icon: '🏹',
    tier: 3,
    column: 2,
    maxRanks: 1,
    requires: 'scout_aspect_of_cheetah',
    effect: { type: 'active', description: 'Batch search mode' }
  },

  // Tier 4
  {
    id: 'scout_master_tracker',
    name: 'Master Tracker',
    description: 'Traces code execution paths',
    icon: '🗺️',
    tier: 4,
    column: 0,
    maxRanks: 2,
    requires: 'scout_camouflage',
    effect: { type: 'active', description: 'Execution tracing' }
  },
  {
    id: 'scout_beast_mastery',
    name: 'Beast Mastery',
    description: 'Commands sub-agents for parallel search',
    icon: '🐺',
    tier: 4,
    column: 1,
    maxRanks: 2,
    requires: 'scout_eagle_eye',
    effect: { type: 'active', description: 'Parallel search' }
  },
  {
    id: 'scout_multishot',
    name: 'Multishot',
    description: 'Search multiple patterns simultaneously',
    icon: '🎆',
    tier: 4,
    column: 2,
    maxRanks: 2,
    requires: 'scout_rapid_fire',
    effect: { type: 'active', description: 'Multi-pattern search' }
  },

  // Tier 5
  {
    id: 'scout_ranger_lord',
    name: 'Ranger Lord Ascension',
    description: 'Master explorer - unlocks specialization',
    icon: '👑',
    tier: 5,
    column: 1,
    maxRanks: 1,
    requires: 'scout_beast_mastery',
    effect: { type: 'passive', description: 'Unlocks Scout specializations' }
  }
];

// Artisan Talents - Crafting and creation
const ARTISAN_TALENTS: Talent[] = [
  // Tier 1
  {
    id: 'artisan_craftsmanship',
    name: 'Master Craftsmanship',
    description: 'Higher quality code output',
    icon: '⚒️',
    tier: 1,
    column: 0,
    maxRanks: 3,
    effect: { type: 'modifier', stat: 'accuracy', value: 8, description: '+8% code quality per rank' }
  },
  {
    id: 'artisan_efficiency',
    name: 'Forge Efficiency',
    description: 'Faster implementation speed',
    icon: '🔥',
    tier: 1,
    column: 1,
    maxRanks: 3,
    effect: { type: 'modifier', stat: 'speed', value: 10, description: '+10% coding speed per rank' }
  },
  {
    id: 'artisan_resourcefulness',
    name: 'Resourcefulness',
    description: 'Better use of existing code',
    icon: '♻️',
    tier: 1,
    column: 2,
    maxRanks: 3,
    effect: { type: 'passive', description: 'Code reuse optimization' }
  },

  // Tier 2
  {
    id: 'artisan_enchanting',
    name: 'Enchanting',
    description: 'Adds polish and refinement to code',
    icon: '✨',
    tier: 2,
    column: 0,
    maxRanks: 2,
    requires: 'artisan_craftsmanship',
    effect: { type: 'active', description: 'Code polishing mode' }
  },
  {
    id: 'artisan_mass_production',
    name: 'Mass Production',
    description: 'Efficient boilerplate generation',
    icon: '🏭',
    tier: 2,
    column: 1,
    maxRanks: 2,
    requires: 'artisan_efficiency',
    effect: { type: 'active', description: 'Template generation' }
  },
  {
    id: 'artisan_salvaging',
    name: 'Salvaging',
    description: 'Extracts useful patterns from legacy code',
    icon: '🔧',
    tier: 2,
    column: 2,
    maxRanks: 2,
    requires: 'artisan_resourcefulness',
    effect: { type: 'active', description: 'Pattern extraction' }
  },

  // Tier 3
  {
    id: 'artisan_masterwork',
    name: 'Masterwork',
    description: 'Creates exceptional quality components',
    icon: '💎',
    tier: 3,
    column: 0,
    maxRanks: 1,
    requires: 'artisan_enchanting',
    effect: { type: 'passive', description: 'Premium quality output' }
  },
  {
    id: 'artisan_assembly_line',
    name: 'Assembly Line',
    description: 'Rapid consistent feature implementation',
    icon: '⚙️',
    tier: 3,
    column: 1,
    maxRanks: 1,
    requires: 'artisan_mass_production',
    effect: { type: 'active', description: 'Rapid feature mode' }
  },
  {
    id: 'artisan_transmutation',
    name: 'Transmutation',
    description: 'Converts code between frameworks',
    icon: '🔄',
    tier: 3,
    column: 2,
    maxRanks: 1,
    requires: 'artisan_salvaging',
    effect: { type: 'active', description: 'Framework conversion' }
  },

  // Tier 4
  {
    id: 'artisan_legendary_craft',
    name: 'Legendary Craft',
    description: 'Creates highly optimized implementations',
    icon: '🌟',
    tier: 4,
    column: 0,
    maxRanks: 2,
    requires: 'artisan_masterwork',
    effect: { type: 'passive', description: 'Peak optimization' }
  },
  {
    id: 'artisan_automation',
    name: 'Full Automation',
    description: 'Generates complete feature sets',
    icon: '🤖',
    tier: 4,
    column: 1,
    maxRanks: 2,
    requires: 'artisan_assembly_line',
    effect: { type: 'active', description: 'Full feature generation' }
  },
  {
    id: 'artisan_philosophers_stone',
    name: "Philosopher's Stone",
    description: 'Transforms any code quality level',
    icon: '🪨',
    tier: 4,
    column: 2,
    maxRanks: 2,
    requires: 'artisan_transmutation',
    effect: { type: 'active', description: 'Quality transformation' }
  },

  // Tier 5
  {
    id: 'artisan_grand_master',
    name: 'Grand Master Artisan',
    description: 'Master crafter - unlocks specialization',
    icon: '👑',
    tier: 5,
    column: 1,
    maxRanks: 1,
    requires: 'artisan_automation',
    effect: { type: 'passive', description: 'Unlocks Artisan specializations' }
  }
];

// Map class to talent tree
export const CLASS_TALENTS: Record<AgentClass, Talent[]> = {
  mage: MAGE_TALENTS,
  guardian: GUARDIAN_TALENTS,
  architect: ARCHITECT_TALENTS,
  scout: SCOUT_TALENTS,
  engineer: ARTISAN_TALENTS,  // Engineers use Artisan tree
  designer: ARTISAN_TALENTS,  // Designers use Artisan tree with different flavor
};

// Get talent by ID
export function getTalent(agentClass: AgentClass, talentId: string): Talent | undefined {
  return CLASS_TALENTS[agentClass]?.find(t => t.id === talentId);
}

// Check if talent can be learned
export function canLearnTalent(
  agentClass: AgentClass,
  talentId: string,
  currentTalents: Record<string, number>,
  availablePoints: number,
  agentLevel: number
): { canLearn: boolean; reason?: string } {
  const talent = getTalent(agentClass, talentId);
  if (!talent) return { canLearn: false, reason: 'Talent not found' };

  // Check points
  if (availablePoints <= 0) return { canLearn: false, reason: 'No talent points available' };

  // Check current rank
  const currentRank = currentTalents[talentId] || 0;
  if (currentRank >= talent.maxRanks) return { canLearn: false, reason: 'Already at max rank' };

  // Check tier requirement (need to spend 5 points in lower tiers)
  const pointsInLowerTiers = Object.entries(currentTalents).reduce((sum, [id, ranks]) => {
    const t = getTalent(agentClass, id);
    if (t && t.tier < talent.tier) return sum + ranks;
    return sum;
  }, 0);

  const requiredPoints = (talent.tier - 1) * 5;
  if (pointsInLowerTiers < requiredPoints) {
    return { canLearn: false, reason: `Need ${requiredPoints} points in lower tiers (have ${pointsInLowerTiers})` };
  }

  // Check prerequisite
  if (talent.requires) {
    const prereqRanks = currentTalents[talent.requires] || 0;
    const prereq = getTalent(agentClass, talent.requires);
    if (!prereq || prereqRanks < prereq.maxRanks) {
      return { canLearn: false, reason: `Requires ${prereq?.name || talent.requires}` };
    }
  }

  // Check level requirement (tier * 2)
  const requiredLevel = talent.tier * 2;
  if (agentLevel < requiredLevel) {
    return { canLearn: false, reason: `Requires level ${requiredLevel}` };
  }

  return { canLearn: true };
}

// Calculate total stat bonuses from talents
export function calculateTalentBonuses(
  agentClass: AgentClass,
  allocatedTalents: Record<string, number>
): Record<string, number> {
  const bonuses: Record<string, number> = {
    speed: 0,
    accuracy: 0,
    context: 0,
    creativity: 0,
    focus: 0,
  };

  for (const [talentId, ranks] of Object.entries(allocatedTalents)) {
    if (ranks <= 0) continue;
    const talent = getTalent(agentClass, talentId);
    if (talent?.effect.stat && talent.effect.value) {
      bonuses[talent.effect.stat] += talent.effect.value * ranks;
    }
  }

  return bonuses;
}
