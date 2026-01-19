// Sound effect references
// All 65 sounds organized by category from assets/sounds/

// ============================================
// UI INTERACTION SOUNDS (12)
// ============================================
export const UISounds = {
  tap: require('../assets/sounds/ui/sfx_tap.wav'),
  tapSecondary: require('../assets/sounds/ui/sfx_tap_secondary.wav'),
  swipe: require('../assets/sounds/ui/sfx_swipe.wav'),
  toggleOn: require('../assets/sounds/ui/sfx_toggle_on.wav'),
  toggleOff: require('../assets/sounds/ui/sfx_toggle_off.wav'),
  expand: require('../assets/sounds/ui/sfx_expand.wav'),
  collapse: require('../assets/sounds/ui/sfx_collapse.wav'),
  scrollTick: require('../assets/sounds/ui/sfx_scroll_tick.wav'),
  navTab: require('../assets/sounds/ui/sfx_nav_tab.wav'),
  navBack: require('../assets/sounds/ui/sfx_nav_back.wav'),
  modalOpen: require('../assets/sounds/ui/sfx_modal_open.wav'),
  modalClose: require('../assets/sounds/ui/sfx_modal_close.wav'),
} as const;

// ============================================
// AGENT SOUNDS (11)
// ============================================
export const AgentSounds = {
  // Status changes
  spawn: require('../assets/sounds/agents/sfx_agent_spawn.wav'),
  awaken: require('../assets/sounds/agents/sfx_agent_awaken.wav'),
  channeling: require('../assets/sounds/agents/sfx_agent_channeling.wav'),
  dormant: require('../assets/sounds/agents/sfx_agent_dormant.wav'),
  waiting: require('../assets/sounds/agents/sfx_agent_waiting.wav'),
  error: require('../assets/sounds/agents/sfx_agent_error.wav'),
  // Activity ambient loops
  thinking: require('../assets/sounds/agents/amb_agent_thinking.wav'),
  writing: require('../assets/sounds/agents/amb_agent_writing.wav'),
  reading: require('../assets/sounds/agents/amb_agent_reading.wav'),
  building: require('../assets/sounds/agents/amb_agent_building.wav'),
  testing: require('../assets/sounds/agents/amb_agent_testing.wav'),
} as const;

// ============================================
// QUEST & PROGRESS SOUNDS (9)
// ============================================
export const QuestSounds = {
  questStart: require('../assets/sounds/quests/sfx_quest_start.wav'),
  questComplete: require('../assets/sounds/quests/sfx_quest_complete.wav'),
  questFail: require('../assets/sounds/quests/sfx_quest_fail.wav'),
  questPending: require('../assets/sounds/quests/sfx_quest_pending.wav'),
  xpGain: require('../assets/sounds/quests/sfx_xp_gain.wav'),
  levelUp: require('../assets/sounds/quests/sfx_level_up.wav'),
  talentUnlock: require('../assets/sounds/quests/sfx_talent_unlock.wav'),
  lootReveal: require('../assets/sounds/quests/sfx_loot_reveal.wav'),
  lootCollect: require('../assets/sounds/quests/sfx_loot_collect.wav'),
} as const;

// ============================================
// CONNECTION & SYSTEM SOUNDS (8)
// ============================================
export const ConnectionSounds = {
  connectStart: require('../assets/sounds/connection/sfx_connect_start.wav'),
  connectSuccess: require('../assets/sounds/connection/sfx_connect_success.wav'),
  connectFail: require('../assets/sounds/connection/sfx_connect_fail.wav'),
  disconnect: require('../assets/sounds/connection/sfx_disconnect.wav'),
  reconnect: require('../assets/sounds/connection/sfx_reconnect.wav'),
  scanStart: require('../assets/sounds/connection/sfx_scan_start.wav'),
  scanSuccess: require('../assets/sounds/connection/sfx_scan_success.wav'),
  scanFail: require('../assets/sounds/connection/sfx_scan_fail.wav'),
} as const;

// ============================================
// NOTIFICATION SOUNDS (5)
// ============================================
export const NotificationSounds = {
  quest: require('../assets/sounds/notifications/sfx_notif_quest.wav'),
  input: require('../assets/sounds/notifications/sfx_notif_input.wav'),
  error: require('../assets/sounds/notifications/sfx_notif_error.wav'),
  success: require('../assets/sounds/notifications/sfx_notif_success.wav'),
  level: require('../assets/sounds/notifications/sfx_notif_level.wav'),
} as const;

// ============================================
// AMBIENT SOUNDS (9)
// ============================================
export const AmbientSounds = {
  // Spire time-of-day
  spireDay: require('../assets/sounds/ambient/amb_spire_day.wav'),
  spireNight: require('../assets/sounds/ambient/amb_spire_night.wav'),
  spireSunset: require('../assets/sounds/ambient/amb_spire_sunset.wav'),
  // Chamber-specific
  chamberMage: require('../assets/sounds/ambient/amb_chamber_mage.wav'),
  chamberArchitect: require('../assets/sounds/ambient/amb_chamber_architect.wav'),
  chamberEngineer: require('../assets/sounds/ambient/amb_chamber_engineer.wav'),
  chamberScout: require('../assets/sounds/ambient/amb_chamber_scout.wav'),
  chamberGuardian: require('../assets/sounds/ambient/amb_chamber_guardian.wav'),
  chamberArtisan: require('../assets/sounds/ambient/amb_chamber_artisan.wav'),
} as const;

// ============================================
// ONBOARDING SOUNDS (3)
// ============================================
export const OnboardingSounds = {
  welcome: require('../assets/sounds/onboarding/sfx_onboard_welcome.wav'),
  step: require('../assets/sounds/onboarding/sfx_onboard_step.wav'),
  complete: require('../assets/sounds/onboarding/sfx_onboard_complete.wav'),
} as const;

// ============================================
// SPECIAL EFFECT SOUNDS (8)
// ============================================
export const EffectSounds = {
  magicSparkle: require('../assets/sounds/effects/sfx_magic_sparkle.wav'),
  magicRune: require('../assets/sounds/effects/sfx_magic_rune.wav'),
  magicPortal: require('../assets/sounds/effects/sfx_magic_portal.wav'),
  magicFloat: require('../assets/sounds/effects/sfx_magic_float.wav'),
  success: require('../assets/sounds/effects/sfx_success.wav'),
  error: require('../assets/sounds/effects/sfx_error.wav'),
  warning: require('../assets/sounds/effects/sfx_warning.wav'),
  info: require('../assets/sounds/effects/sfx_info.wav'),
} as const;

// ============================================
// COMBINED SOUNDS EXPORT
// ============================================
export const Sounds = {
  ui: UISounds,
  agent: AgentSounds,
  quest: QuestSounds,
  connection: ConnectionSounds,
  notification: NotificationSounds,
  ambient: AmbientSounds,
  onboarding: OnboardingSounds,
  effect: EffectSounds,
} as const;

// ============================================
// SOUND CATEGORIES FOR VOLUME CONTROL
// ============================================
export type SoundCategory = 'effects' | 'ambient' | 'notifications' | 'ui';

// Map each sound to its category for volume control
export const SoundCategoryMap = {
  // UI
  'ui.tap': 'ui',
  'ui.tapSecondary': 'ui',
  'ui.swipe': 'ui',
  'ui.toggleOn': 'ui',
  'ui.toggleOff': 'ui',
  'ui.expand': 'ui',
  'ui.collapse': 'ui',
  'ui.scrollTick': 'ui',
  'ui.navTab': 'ui',
  'ui.navBack': 'ui',
  'ui.modalOpen': 'ui',
  'ui.modalClose': 'ui',
  // Agent
  'agent.spawn': 'effects',
  'agent.awaken': 'effects',
  'agent.channeling': 'effects',
  'agent.dormant': 'effects',
  'agent.waiting': 'effects',
  'agent.error': 'effects',
  'agent.thinking': 'ambient',
  'agent.writing': 'ambient',
  'agent.reading': 'ambient',
  'agent.building': 'ambient',
  'agent.testing': 'ambient',
  // Quest
  'quest.questStart': 'effects',
  'quest.questComplete': 'effects',
  'quest.questFail': 'effects',
  'quest.questPending': 'effects',
  'quest.xpGain': 'effects',
  'quest.levelUp': 'effects',
  'quest.talentUnlock': 'effects',
  'quest.lootReveal': 'effects',
  'quest.lootCollect': 'effects',
  // Connection
  'connection.connectStart': 'effects',
  'connection.connectSuccess': 'effects',
  'connection.connectFail': 'effects',
  'connection.disconnect': 'effects',
  'connection.reconnect': 'effects',
  'connection.scanStart': 'effects',
  'connection.scanSuccess': 'effects',
  'connection.scanFail': 'effects',
  // Notifications
  'notification.quest': 'notifications',
  'notification.input': 'notifications',
  'notification.error': 'notifications',
  'notification.success': 'notifications',
  'notification.level': 'notifications',
  // Ambient
  'ambient.spireDay': 'ambient',
  'ambient.spireNight': 'ambient',
  'ambient.spireSunset': 'ambient',
  'ambient.chamberMage': 'ambient',
  'ambient.chamberArchitect': 'ambient',
  'ambient.chamberEngineer': 'ambient',
  'ambient.chamberScout': 'ambient',
  'ambient.chamberGuardian': 'ambient',
  'ambient.chamberArtisan': 'ambient',
  // Onboarding
  'onboarding.welcome': 'effects',
  'onboarding.step': 'ui',
  'onboarding.complete': 'effects',
  // Effects
  'effect.magicSparkle': 'effects',
  'effect.magicRune': 'effects',
  'effect.magicPortal': 'effects',
  'effect.magicFloat': 'effects',
  'effect.success': 'effects',
  'effect.error': 'effects',
  'effect.warning': 'effects',
  'effect.info': 'effects',
} as const satisfies Record<string, SoundCategory>;

// ============================================
// LEGACY EXPORTS (for backward compatibility)
// ============================================
export const LegacySounds = {
  spawn: AgentSounds.spawn,
  complete: QuestSounds.questComplete,
  error: AgentSounds.error,
  levelUp: QuestSounds.levelUp,
  tap: UISounds.tap,
  swipe: UISounds.swipe,
  notification: NotificationSounds.quest,
  typing: AgentSounds.writing,
  connect: ConnectionSounds.connectSuccess,
  disconnect: ConnectionSounds.disconnect,
  ambientSpire: AmbientSounds.spireDay,
} as const;

// ============================================
// HELPER TYPES
// ============================================
export type SoundKey = keyof typeof SoundCategoryMap;
export type UISoundKey = keyof typeof UISounds;
export type AgentSoundKey = keyof typeof AgentSounds;
export type QuestSoundKey = keyof typeof QuestSounds;
export type ConnectionSoundKey = keyof typeof ConnectionSounds;
export type NotificationSoundKey = keyof typeof NotificationSounds;
export type AmbientSoundKey = keyof typeof AmbientSounds;
export type OnboardingSoundKey = keyof typeof OnboardingSounds;
export type EffectSoundKey = keyof typeof EffectSounds;
