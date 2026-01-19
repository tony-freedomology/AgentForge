import { AgentClass } from '../shared/types/agent';

export interface Talent {
  id: string;
  name: string;
  description: string;
  icon: string;
  maxRank: number;
  currentRank: number;
  tier: number;
  position: number; // Position in tier (0-2 for 3 columns)
  requires?: string; // ID of required talent
  effect: string;
}

// Talent trees per class
export const TALENT_TREES: Record<AgentClass, Talent[]> = {
  mage: [
    // Tier 1
    { id: 'mage_focus', name: 'Deep Focus', description: 'Increases context window utilization', icon: '🧠', maxRank: 3, currentRank: 0, tier: 1, position: 1, effect: '+10% context per rank' },
    { id: 'mage_speed', name: 'Quick Casting', description: 'Faster response times', icon: '⚡', maxRank: 3, currentRank: 0, tier: 1, position: 0, effect: '-5% response time per rank' },
    { id: 'mage_accuracy', name: 'Precision', description: 'More accurate code generation', icon: '🎯', maxRank: 3, currentRank: 0, tier: 1, position: 2, effect: '+5% accuracy per rank' },
    // Tier 2
    { id: 'mage_multicast', name: 'Multi-Task', description: 'Handle multiple requests better', icon: '🔮', maxRank: 2, currentRank: 0, tier: 2, position: 0, requires: 'mage_speed', effect: '+1 parallel task per rank' },
    { id: 'mage_insight', name: 'Deep Insight', description: 'Better code analysis', icon: '👁️', maxRank: 2, currentRank: 0, tier: 2, position: 1, requires: 'mage_focus', effect: '+15% analysis depth per rank' },
    { id: 'mage_refine', name: 'Self Refine', description: 'Auto-improve output quality', icon: '✨', maxRank: 2, currentRank: 0, tier: 2, position: 2, requires: 'mage_accuracy', effect: 'Auto-review enabled' },
    // Tier 3
    { id: 'mage_mastery', name: 'Arcane Mastery', description: 'Ultimate power boost', icon: '🌟', maxRank: 1, currentRank: 0, tier: 3, position: 1, requires: 'mage_insight', effect: '+25% all stats' },
  ],
  architect: [
    // Tier 1
    { id: 'arch_design', name: 'System Design', description: 'Better architectural decisions', icon: '📐', maxRank: 3, currentRank: 0, tier: 1, position: 1, effect: '+10% design quality per rank' },
    { id: 'arch_docs', name: 'Documentation', description: 'Generate better docs', icon: '📝', maxRank: 3, currentRank: 0, tier: 1, position: 0, effect: '+15% doc quality per rank' },
    { id: 'arch_scale', name: 'Scalability', description: 'Focus on scalable solutions', icon: '📈', maxRank: 3, currentRank: 0, tier: 1, position: 2, effect: '+10% scalability score per rank' },
    // Tier 2
    { id: 'arch_patterns', name: 'Design Patterns', description: 'Apply advanced patterns', icon: '🏗️', maxRank: 2, currentRank: 0, tier: 2, position: 0, requires: 'arch_docs', effect: 'Pattern suggestions enabled' },
    { id: 'arch_review', name: 'Code Review', description: 'Better review capabilities', icon: '🔍', maxRank: 2, currentRank: 0, tier: 2, position: 1, requires: 'arch_design', effect: '+20% review depth per rank' },
    { id: 'arch_perf', name: 'Performance', description: 'Optimize for performance', icon: '🚀', maxRank: 2, currentRank: 0, tier: 2, position: 2, requires: 'arch_scale', effect: '+15% perf focus per rank' },
    // Tier 3
    { id: 'arch_master', name: 'Grand Architect', description: 'Master of systems', icon: '👑', maxRank: 1, currentRank: 0, tier: 3, position: 1, requires: 'arch_review', effect: '+25% all architectural stats' },
  ],
  engineer: [
    { id: 'eng_build', name: 'Build Mastery', description: 'Better build processes', icon: '🔨', maxRank: 3, currentRank: 0, tier: 1, position: 1, effect: '+10% build speed per rank' },
    { id: 'eng_test', name: 'Test Coverage', description: 'Write more tests', icon: '🧪', maxRank: 3, currentRank: 0, tier: 1, position: 0, effect: '+15% test coverage per rank' },
    { id: 'eng_debug', name: 'Debugging', description: 'Find bugs faster', icon: '🐛', maxRank: 3, currentRank: 0, tier: 1, position: 2, effect: '+10% debug accuracy per rank' },
    { id: 'eng_ci', name: 'CI/CD', description: 'Pipeline expertise', icon: '⚙️', maxRank: 2, currentRank: 0, tier: 2, position: 0, requires: 'eng_test', effect: 'CI suggestions enabled' },
    { id: 'eng_refactor', name: 'Refactoring', description: 'Clean code transformations', icon: '♻️', maxRank: 2, currentRank: 0, tier: 2, position: 1, requires: 'eng_build', effect: '+20% refactor quality per rank' },
    { id: 'eng_tools', name: 'Tool Mastery', description: 'Use tools effectively', icon: '🛠️', maxRank: 2, currentRank: 0, tier: 2, position: 2, requires: 'eng_debug', effect: '+15% tool efficiency per rank' },
    { id: 'eng_master', name: 'Master Builder', description: 'Ultimate engineering', icon: '🏆', maxRank: 1, currentRank: 0, tier: 3, position: 1, requires: 'eng_refactor', effect: '+25% all engineering stats' },
  ],
  scout: [
    { id: 'scout_search', name: 'Quick Search', description: 'Find code faster', icon: '🔍', maxRank: 3, currentRank: 0, tier: 1, position: 1, effect: '+15% search speed per rank' },
    { id: 'scout_nav', name: 'Codebase Nav', description: 'Navigate efficiently', icon: '🧭', maxRank: 3, currentRank: 0, tier: 1, position: 0, effect: '+10% navigation per rank' },
    { id: 'scout_analyze', name: 'Analysis', description: 'Deeper code analysis', icon: '📊', maxRank: 3, currentRank: 0, tier: 1, position: 2, effect: '+10% analysis depth per rank' },
    { id: 'scout_pattern', name: 'Pattern Match', description: 'Find patterns in code', icon: '🔎', maxRank: 2, currentRank: 0, tier: 2, position: 0, requires: 'scout_nav', effect: 'Pattern detection enabled' },
    { id: 'scout_map', name: 'Code Mapping', description: 'Map the codebase', icon: '🗺️', maxRank: 2, currentRank: 0, tier: 2, position: 1, requires: 'scout_search', effect: '+20% mapping quality per rank' },
    { id: 'scout_report', name: 'Reporting', description: 'Better reports', icon: '📋', maxRank: 2, currentRank: 0, tier: 2, position: 2, requires: 'scout_analyze', effect: '+15% report quality per rank' },
    { id: 'scout_master', name: 'Master Scout', description: 'All-seeing eye', icon: '👁️‍🗨️', maxRank: 1, currentRank: 0, tier: 3, position: 1, requires: 'scout_map', effect: '+25% all scout stats' },
  ],
  guardian: [
    { id: 'guard_secure', name: 'Security', description: 'Focus on security', icon: '🔒', maxRank: 3, currentRank: 0, tier: 1, position: 1, effect: '+15% security focus per rank' },
    { id: 'guard_validate', name: 'Validation', description: 'Better input validation', icon: '✅', maxRank: 3, currentRank: 0, tier: 1, position: 0, effect: '+10% validation per rank' },
    { id: 'guard_monitor', name: 'Monitoring', description: 'Watch for issues', icon: '👀', maxRank: 3, currentRank: 0, tier: 1, position: 2, effect: '+10% monitoring per rank' },
    { id: 'guard_audit', name: 'Auditing', description: 'Security audits', icon: '🛡️', maxRank: 2, currentRank: 0, tier: 2, position: 0, requires: 'guard_validate', effect: 'Audit mode enabled' },
    { id: 'guard_protect', name: 'Protection', description: 'Prevent vulnerabilities', icon: '🏰', maxRank: 2, currentRank: 0, tier: 2, position: 1, requires: 'guard_secure', effect: '+20% protection per rank' },
    { id: 'guard_alert', name: 'Alerting', description: 'Quick issue alerts', icon: '🚨', maxRank: 2, currentRank: 0, tier: 2, position: 2, requires: 'guard_monitor', effect: '+15% alert speed per rank' },
    { id: 'guard_master', name: 'Sentinel', description: 'Ultimate guardian', icon: '⚔️', maxRank: 1, currentRank: 0, tier: 3, position: 1, requires: 'guard_protect', effect: '+25% all guardian stats' },
  ],
  artisan: [
    { id: 'art_style', name: 'Code Style', description: 'Beautiful code', icon: '🎨', maxRank: 3, currentRank: 0, tier: 1, position: 1, effect: '+15% style score per rank' },
    { id: 'art_clean', name: 'Clean Code', description: 'Cleaner implementations', icon: '✨', maxRank: 3, currentRank: 0, tier: 1, position: 0, effect: '+10% cleanliness per rank' },
    { id: 'art_optimize', name: 'Optimization', description: 'Optimize everything', icon: '💎', maxRank: 3, currentRank: 0, tier: 1, position: 2, effect: '+10% optimization per rank' },
    { id: 'art_polish', name: 'Polish', description: 'Final polish passes', icon: '💅', maxRank: 2, currentRank: 0, tier: 2, position: 0, requires: 'art_clean', effect: 'Auto-polish enabled' },
    { id: 'art_craft', name: 'Craftsmanship', description: 'Expert crafting', icon: '🏺', maxRank: 2, currentRank: 0, tier: 2, position: 1, requires: 'art_style', effect: '+20% craft quality per rank' },
    { id: 'art_perfect', name: 'Perfection', description: 'Strive for perfection', icon: '👌', maxRank: 2, currentRank: 0, tier: 2, position: 2, requires: 'art_optimize', effect: '+15% perfection per rank' },
    { id: 'art_master', name: 'Grand Artisan', description: 'Master craftsman', icon: '🎭', maxRank: 1, currentRank: 0, tier: 3, position: 1, requires: 'art_craft', effect: '+25% all artisan stats' },
  ],
};
