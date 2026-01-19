/**
 * Asset Registry for Arcane Spire
 *
 * Maps all asset names to their require() statements for static loading.
 * These assets are now available in assets/images/
 */

// ============================================================================
// AGENT SPRITES
// Each agent class has states: idle, working, waiting, complete, error, sleeping, spawning, portrait
// ============================================================================

export const AgentSprites = {
  mage: {
    idle: require('../assets/images/sprites/mage/mage_idle.png'),
    working: require('../assets/images/sprites/mage/mage_working.png'),
    waiting: require('../assets/images/sprites/mage/mage_waiting.png'),
    complete: require('../assets/images/sprites/mage/mage_complete.png'),
    error: require('../assets/images/sprites/mage/mage_error.png'),
    sleeping: require('../assets/images/sprites/mage/mage_sleeping.png'),
    spawning: require('../assets/images/sprites/mage/mage_spawning.png'),
    portrait: require('../assets/images/sprites/mage/mage_portrait.png'),
  },
  architect: {
    idle: require('../assets/images/sprites/architect/architect_idle.png'),
    working: require('../assets/images/sprites/architect/architect_working.png'),
    waiting: require('../assets/images/sprites/architect/architect_waiting.png'),
    complete: require('../assets/images/sprites/architect/architect_complete.png'),
    error: require('../assets/images/sprites/architect/architect_error.png'),
    sleeping: require('../assets/images/sprites/architect/architect_sleeping.png'),
    spawning: require('../assets/images/sprites/architect/architect_spawning.png'),
    portrait: require('../assets/images/sprites/architect/architect_portrait.png'),
  },
  engineer: {
    idle: require('../assets/images/sprites/engineer/engineer_idle.png'),
    working: require('../assets/images/sprites/engineer/engineer_working.png'),
    waiting: require('../assets/images/sprites/engineer/engineer_waiting.png'),
    complete: require('../assets/images/sprites/engineer/engineer_complete.png'),
    error: require('../assets/images/sprites/engineer/engineer_error.png'),
    sleeping: require('../assets/images/sprites/engineer/engineer_sleeping.png'),
    spawning: require('../assets/images/sprites/engineer/engineer_spawning.png'),
    portrait: require('../assets/images/sprites/engineer/engineer_portrait.png'),
  },
  scout: {
    idle: require('../assets/images/sprites/scout/scout_idle.png'),
    working: require('../assets/images/sprites/scout/scout_working.png'),
    waiting: require('../assets/images/sprites/scout/scout_waiting.png'),
    complete: require('../assets/images/sprites/scout/scout_complete.png'),
    error: require('../assets/images/sprites/scout/scout_error.png'),
    sleeping: require('../assets/images/sprites/scout/scout_sleeping.png'),
    spawning: require('../assets/images/sprites/scout/scout_spawning.png'),
    portrait: require('../assets/images/sprites/scout/scout_portrait.png'),
  },
  guardian: {
    idle: require('../assets/images/sprites/guardian/guardian_idle.png'),
    working: require('../assets/images/sprites/guardian/guardian_working.png'),
    waiting: require('../assets/images/sprites/guardian/guardian_waiting.png'),
    complete: require('../assets/images/sprites/guardian/guardian_complete.png'),
    error: require('../assets/images/sprites/guardian/guardian_error.png'),
    sleeping: require('../assets/images/sprites/guardian/guardian_sleeping.png'),
    spawning: require('../assets/images/sprites/guardian/guardian_spawning.png'),
    portrait: require('../assets/images/sprites/guardian/guardian_portrait.png'),
  },
  artisan: {
    idle: require('../assets/images/sprites/artisan/artisan_idle.png'),
    working: require('../assets/images/sprites/artisan/artisan_working.png'),
    waiting: require('../assets/images/sprites/artisan/artisan_waiting.png'),
    complete: require('../assets/images/sprites/artisan/artisan_complete.png'),
    error: require('../assets/images/sprites/artisan/artisan_error.png'),
    sleeping: require('../assets/images/sprites/artisan/artisan_sleeping.png'),
    spawning: require('../assets/images/sprites/artisan/artisan_spawning.png'),
    portrait: require('../assets/images/sprites/artisan/artisan_portrait.png'),
  },
} as const;

export type SpriteAgentClass = keyof typeof AgentSprites;
export type AgentSpriteState = keyof typeof AgentSprites.mage;

// ============================================================================
// UI ELEMENTS
// ============================================================================

export const UIElements = {
  // Buttons
  buttons: {
    primary: require('../assets/images/ui/buttons/btn_primary.png'),
    primaryPressed: require('../assets/images/ui/buttons/btn_primary_pressed.png'),
    secondary: require('../assets/images/ui/buttons/btn_secondary.png'),
    secondaryPressed: require('../assets/images/ui/buttons/btn_secondary_pressed.png'),
    danger: require('../assets/images/ui/buttons/btn_danger.png'),
    summon: require('../assets/images/ui/buttons/btn_summon.png'),
    iconCircle: require('../assets/images/ui/buttons/btn_icon_circle.png'),
  },

  // Progress bars
  progress: {
    frame: require('../assets/images/ui/progress/progress_frame.png'),
    fillXp: require('../assets/images/ui/progress/progress_fill_xp.png'),
    fillHealth: require('../assets/images/ui/progress/progress_fill_health.png'),
    fillMana: require('../assets/images/ui/progress/progress_fill_mana.png'),
    fillGold: require('../assets/images/ui/progress/progress_fill_gold.png'),
  },

  // Panels
  panels: {
    stone: require('../assets/images/ui/panels/panel_stone.png'),
    dark: require('../assets/images/ui/panels/panel_dark.png'),
    gold: require('../assets/images/ui/panels/panel_gold.png'),
    parchment: require('../assets/images/ui/panels/panel_parchment.png'),
    cardAgent: require('../assets/images/ui/panels/card_agent.png'),
    headerBanner: require('../assets/images/ui/panels/header_banner.png'),
    dividerOrnate: require('../assets/images/ui/panels/divider_ornate.png'),
    sheetHandle: require('../assets/images/ui/panels/sheet_handle.png'),
  },

  // Input fields
  inputs: {
    field: require('../assets/images/ui/inputs/input_field.png'),
    fieldFocus: require('../assets/images/ui/inputs/input_field_focus.png'),
    sendBtn: require('../assets/images/ui/inputs/input_send_btn.png'),
  },

  // Tab bar
  tabs: {
    background: require('../assets/images/ui/tabs/tab_bar_bg.png'),
  },

  // Party Dock
  dock: {
    background: require('../assets/images/ui/panels/dock_bg.png'),
    slot: require('../assets/images/ui/panels/dock_slot.png'),
    slotAlert: require('../assets/images/ui/panels/dock_slot_alert.png'),
    miniBar: require('../assets/images/ui/panels/dock_mini_bar.png'),
    expandHandle: require('../assets/images/ui/panels/dock_expand_handle.png'),
  },

  // Chamber elements
  chamber: {
    frame: require('../assets/images/ui/panels/chamber_frame.png'),
    floor: require('../assets/images/ui/panels/chamber_floor.png'),
    desk: require('../assets/images/ui/panels/chamber_desk.png'),
    bookshelf: require('../assets/images/ui/panels/chamber_bookshelf.png'),
    cauldron: require('../assets/images/ui/panels/chamber_cauldron.png'),
    anvil: require('../assets/images/ui/panels/chamber_anvil.png'),
    telescope: require('../assets/images/ui/panels/chamber_telescope.png'),
    thoughtHistoryBg: require('../assets/images/ui/panels/thought_history_bg.png'),
  },

  // Quest elements
  quest: {
    scrollBg: require('../assets/images/ui/panels/quest_scroll_bg.png'),
    ribbon: require('../assets/images/ui/panels/quest_ribbon.png'),
    headerComplete: require('../assets/images/ui/panels/quest_header_complete.png'),
    sealAccept: require('../assets/images/ui/panels/quest_seal_accept.png'),
    sealRevise: require('../assets/images/ui/panels/quest_seal_revise.png'),
  },

  // Talent tree
  talent: {
    header: require('../assets/images/ui/panels/talent_header.png'),
    nodeBg: require('../assets/images/ui/panels/talent_node_bg.png'),
    nodeActive: require('../assets/images/ui/panels/talent_node_active.png'),
    connector: require('../assets/images/ui/panels/talent_connector.png'),
    connectorH: require('../assets/images/ui/panels/talent_connector_h.png'),
  },

  // Vault (loot)
  vault: {
    header: require('../assets/images/ui/panels/vault_header.png'),
    itemSlot: require('../assets/images/ui/panels/vault_item_slot.png'),
    chestLarge: require('../assets/images/ui/panels/vault_chest_large.png'),
  },
} as const;

// ============================================================================
// SPIRE / TOWER ELEMENTS
// ============================================================================

export const SpireElements = {
  top: require('../assets/images/spire/spire_top.png'),
  ground: require('../assets/images/spire/spire_ground.png'),
  connector: require('../assets/images/spire/spire_connector.png'),
  floors: {
    empty: require('../assets/images/spire/floor_frame_empty.png'),
    idle: require('../assets/images/spire/floor_frame_idle.png'),
    working: require('../assets/images/spire/floor_frame_working.png'),
    attention: require('../assets/images/spire/floor_frame_attention.png'),
    complete: require('../assets/images/spire/floor_frame_complete.png'),
    error: require('../assets/images/spire/floor_frame_error.png'),
  },
} as const;

// ============================================================================
// BACKGROUNDS
// ============================================================================

export const Backgrounds = {
  spireDay: require('../assets/images/backgrounds/bg_spire_day.png'),
  spireNight: require('../assets/images/backgrounds/bg_spire_night.png'),
  spireSunset: require('../assets/images/backgrounds/bg_spire_sunset.png'),
  summonRitual: require('../assets/images/backgrounds/bg_summon_ritual.png'),
  connectWizard: require('../assets/images/backgrounds/bg_connect_wizard.png'),
  decorations: {
    cloud1: require('../assets/images/backgrounds/deco_cloud_1.png'),
    cloud2: require('../assets/images/backgrounds/deco_cloud_2.png'),
    cloud3: require('../assets/images/backgrounds/deco_cloud_3.png'),
    bird: require('../assets/images/backgrounds/deco_bird.png'),
    star: require('../assets/images/backgrounds/deco_star.png'),
    banner: require('../assets/images/backgrounds/deco_banner.png'),
  },
} as const;

// ============================================================================
// CHAMBERS (Agent-specific backgrounds)
// ============================================================================

export const Chambers = {
  mage: require('../assets/images/chambers/chamber_mage.png'),
  architect: require('../assets/images/chambers/chamber_architect.png'),
  engineer: require('../assets/images/chambers/chamber_engineer.png'),
  scout: require('../assets/images/chambers/chamber_scout.png'),
  guardian: require('../assets/images/chambers/chamber_guardian.png'),
  artisan: require('../assets/images/chambers/chamber_artisan.png'),
} as const;

// ============================================================================
// ICONS
// ============================================================================

export const Icons = {
  // Status icons
  status: {
    working: require('../assets/images/icons/status/icon_status_working.png'),
    idle: require('../assets/images/icons/status/icon_status_idle.png'),
    waiting: require('../assets/images/icons/status/icon_status_waiting.png'),
    spawning: require('../assets/images/icons/status/icon_status_spawning.png'),
    complete: require('../assets/images/icons/status/icon_status_complete.png'),
    error: require('../assets/images/icons/status/icon_status_error.png'),
  },

  // Activity icons
  activity: {
    thinking: require('../assets/images/icons/activity/icon_activity_thinking.png'),
    writing: require('../assets/images/icons/activity/icon_activity_writing.png'),
    reading: require('../assets/images/icons/activity/icon_activity_reading.png'),
    researching: require('../assets/images/icons/activity/icon_activity_researching.png'),
    building: require('../assets/images/icons/activity/icon_activity_building.png'),
    testing: require('../assets/images/icons/activity/icon_activity_testing.png'),
    git: require('../assets/images/icons/activity/icon_activity_git.png'),
    waiting: require('../assets/images/icons/activity/icon_activity_waiting.png'),
    idle: require('../assets/images/icons/activity/icon_activity_idle.png'),
    error: require('../assets/images/icons/activity/icon_activity_error.png'),
  },

  // File type icons
  file: {
    code: require('../assets/images/icons/file/icon_file_code.png'),
    doc: require('../assets/images/icons/file/icon_file_doc.png'),
    config: require('../assets/images/icons/file/icon_file_config.png'),
    image: require('../assets/images/icons/file/icon_file_image.png'),
    folder: require('../assets/images/icons/file/icon_file_folder.png'),
  },

  // Provider icons
  provider: {
    claude: require('../assets/images/icons/provider/icon_claude.png'),
    openai: require('../assets/images/icons/provider/icon_openai.png'),
    gemini: require('../assets/images/icons/provider/icon_gemini.png'),
  },

  // Action icons
  action: {
    send: require('../assets/images/icons/action/icon_send.png'),
    back: require('../assets/images/icons/action/icon_back.png'),
    close: require('../assets/images/icons/action/icon_close.png'),
    settings: require('../assets/images/icons/action/icon_settings.png'),
    refresh: require('../assets/images/icons/action/icon_refresh.png'),
    menu: require('../assets/images/icons/action/icon_menu.png'),
    expand: require('../assets/images/icons/action/icon_expand.png'),
    collapse: require('../assets/images/icons/action/icon_collapse.png'),
  },

  // Tab icons
  tabs: {
    spire: require('../assets/images/icons/action/tab_spire.png'),
    spireActive: require('../assets/images/icons/action/tab_spire_active.png'),
    chronicle: require('../assets/images/icons/action/tab_chronicle.png'),
    chronicleActive: require('../assets/images/icons/action/tab_chronicle_active.png'),
    quests: require('../assets/images/icons/action/tab_quests.png'),
    questsActive: require('../assets/images/icons/action/tab_quests_active.png'),
    grimoire: require('../assets/images/icons/action/tab_grimoire.png'),
    grimoireActive: require('../assets/images/icons/action/tab_grimoire_active.png'),
  },

  // Quest icons
  quest: {
    active: require('../assets/images/icons/quest/icon_quest_active.png'),
    complete: require('../assets/images/icons/quest/icon_quest_complete.png'),
    failed: require('../assets/images/icons/quest/icon_quest_failed.png'),
    pending: require('../assets/images/icons/quest/icon_quest_pending.png'),
    scroll: require('../assets/images/icons/quest/icon_scroll.png'),
    loot: require('../assets/images/icons/quest/icon_loot.png'),
    accept: require('../assets/images/icons/quest/icon_accept.png'),
    revise: require('../assets/images/icons/quest/icon_revise.png'),
    diff: require('../assets/images/icons/quest/icon_diff.png'),
  },

  // Loot icons
  loot: {
    chestClosed: require('../assets/images/icons/loot/icon_chest_closed.png'),
    chestOpen: require('../assets/images/icons/loot/icon_chest_open.png'),
    artifact: require('../assets/images/icons/loot/icon_artifact.png'),
    preview: require('../assets/images/icons/loot/icon_preview.png'),
    share: require('../assets/images/icons/loot/icon_share.png'),
    fileCreated: require('../assets/images/icons/loot/icon_file_created.png'),
    fileModified: require('../assets/images/icons/loot/icon_file_modified.png'),
    fileDeleted: require('../assets/images/icons/loot/icon_file_deleted.png'),
  },

  // Badge icons
  badges: {
    count: require('../assets/images/icons/badges/badge_count.png'),
    new: require('../assets/images/icons/badges/badge_new.png'),
    alert: require('../assets/images/icons/badges/badge_alert.png'),
  },

  // Realm icons
  realm: {
    all: require('../assets/images/icons/realm/icon_realm_all.png'),
    mobile: require('../assets/images/icons/realm/icon_realm_mobile.png'),
    web: require('../assets/images/icons/realm/icon_realm_web.png'),
    api: require('../assets/images/icons/realm/icon_realm_api.png'),
    add: require('../assets/images/icons/realm/icon_realm_add.png'),
    custom: require('../assets/images/icons/realm/icon_realm_custom.png'),
  },

  // Talent icons
  talent: {
    locked: require('../assets/images/icons/talent/icon_talent_locked.png'),
    available: require('../assets/images/icons/talent/icon_talent_available.png'),
    learned: require('../assets/images/icons/talent/icon_talent_learned.png'),
    point: require('../assets/images/icons/talent/icon_talent_point.png'),
    focus: require('../assets/images/icons/talent/icon_talent_focus.png'),
    lore: require('../assets/images/icons/talent/icon_talent_lore.png'),
    mastery: require('../assets/images/icons/talent/icon_talent_mastery.png'),
    haste: require('../assets/images/icons/talent/icon_talent_haste.png'),
    endurance: require('../assets/images/icons/talent/icon_talent_endurance.png'),
  },
} as const;

// ============================================================================
// EFFECTS
// ============================================================================

export const Effects = {
  spawnPortal: require('../assets/images/effects/effect_spawn_portal.png'),
  levelUp: require('../assets/images/effects/effect_level_up.png'),
  questComplete: require('../assets/images/effects/effect_quest_complete.png'),
  magicSparkle: require('../assets/images/effects/effect_magic_sparkle.png'),
  magicFloat: require('../assets/images/effects/effect_magic_float.png'),
  runeGlow: require('../assets/images/effects/effect_rune_glow.png'),
  thinking: require('../assets/images/effects/effect_thinking.png'),
  typing: require('../assets/images/effects/effect_typing.png'),
  steam: require('../assets/images/effects/effect_steam.png'),
  candleFlicker: require('../assets/images/effects/effect_candle_flicker.png'),
  errorFlash: require('../assets/images/effects/effect_error_flash.png'),
  vaultGlow: require('../assets/images/effects/vault_glow.png'),
  // Thought bubbles
  bubbleThought: require('../assets/images/effects/bubble_thought.png'),
  bubbleThoughtTail: require('../assets/images/effects/bubble_thought_tail.png'),
  bubbleSpeech: require('../assets/images/effects/bubble_speech.png'),
  bubbleSpeechTail: require('../assets/images/effects/bubble_speech_tail.png'),
} as const;

// ============================================================================
// EMPTY STATES
// ============================================================================

export const EmptyStates = {
  spire: require('../assets/images/empty-states/empty_spire.png'),
  chronicle: require('../assets/images/empty-states/empty_chronicle.png'),
  quests: require('../assets/images/empty-states/empty_quests.png'),
  loot: require('../assets/images/empty-states/empty_loot.png'),
} as const;

// ============================================================================
// ONBOARDING
// ============================================================================

export const Onboarding = {
  welcome: require('../assets/images/onboarding/onboard_welcome.png'),
  connect: require('../assets/images/onboarding/onboard_connect.png'),
  daemon: require('../assets/images/onboarding/onboard_daemon.png'),
  success: require('../assets/images/onboarding/onboard_success.png'),
  // Connection status indicators
  statusConnecting: require('../assets/images/onboarding/status_connecting.png'),
  statusConnected: require('../assets/images/onboarding/status_connected.png'),
  statusDisconnected: require('../assets/images/onboarding/status_disconnected.png'),
  statusError: require('../assets/images/onboarding/status_error.png'),
  qrFrame: require('../assets/images/onboarding/qr_frame.png'),
} as const;

// ============================================================================
// BRANDING
// ============================================================================

export const Branding = {
  appIcon: require('../assets/images/branding/app_icon.png'),
  logoIcon: require('../assets/images/branding/logo_icon.png'),
  logoHorizontal: require('../assets/images/branding/logo_horizontal.png'),
  logoVertical: require('../assets/images/branding/logo_vertical.png'),
  splashScreen: require('../assets/images/branding/splash_screen.png'),
} as const;

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get the sprite for an agent class and state
 */
export function getAgentSprite(
  agentClass: SpriteAgentClass,
  state: AgentSpriteState
): any {
  return AgentSprites[agentClass]?.[state] || AgentSprites.mage.idle;
}

/**
 * Get the chamber background for an agent class
 */
export function getChamberBackground(agentClass: SpriteAgentClass): any {
  return Chambers[agentClass] || Chambers.mage;
}

/**
 * Map agent status to sprite state
 */
export function statusToSpriteState(
  status: 'spawning' | 'channeling' | 'dormant' | 'awaiting' | 'complete' | 'error'
): AgentSpriteState {
  const mapping: Record<string, AgentSpriteState> = {
    spawning: 'spawning',
    channeling: 'working',
    dormant: 'sleeping',
    awaiting: 'waiting',
    complete: 'complete',
    error: 'error',
  };
  return mapping[status] || 'idle';
}

/**
 * Get floor frame based on agent status
 */
export function getFloorFrame(status: string): any {
  const mapping: Record<string, any> = {
    spawning: SpireElements.floors.working,
    channeling: SpireElements.floors.working,
    dormant: SpireElements.floors.idle,
    awaiting: SpireElements.floors.attention,
    complete: SpireElements.floors.complete,
    error: SpireElements.floors.error,
  };
  return mapping[status] || SpireElements.floors.empty;
}

// Export all assets as a single object
export const Assets = {
  agents: AgentSprites,
  ui: UIElements,
  spire: SpireElements,
  backgrounds: Backgrounds,
  chambers: Chambers,
  icons: Icons,
  effects: Effects,
  emptyStates: EmptyStates,
  onboarding: Onboarding,
  branding: Branding,
} as const;

export default Assets;
