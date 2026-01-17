/**
 * Sound Manager - Audio system for AgentForge
 *
 * Provides a centralized system for game audio including:
 * - Background music/ambience
 * - UI sound effects
 * - Agent action sounds
 * - Event notifications
 *
 * Uses Web Audio API for spatial audio and proper mixing.
 * Sounds are organized by category and can be enabled/disabled.
 */

export type SoundCategory =
  | 'ui'        // Button clicks, panel opens
  | 'agent'     // Agent actions, spawning
  | 'quest'     // Quest events
  | 'talent'    // Talent allocation
  | 'combat'    // Errors, warnings (combat metaphor)
  | 'ambient'   // Background atmosphere
  | 'music';    // Background music

export type SoundEvent =
  // UI Sounds
  | 'ui_click'
  | 'ui_hover'
  | 'ui_open_panel'
  | 'ui_close_panel'
  | 'ui_error'
  | 'ui_success'
  | 'ui_notification'

  // Agent Sounds
  | 'agent_spawn'
  | 'agent_select'
  | 'agent_deselect'
  | 'agent_working'
  | 'agent_idle'
  | 'agent_death'
  | 'agent_attention'
  | 'agent_level_up'

  // Quest Sounds
  | 'quest_start'
  | 'quest_complete'
  | 'quest_turn_in'
  | 'quest_approved'
  | 'quest_rejected'

  // Talent Sounds
  | 'talent_allocate'
  | 'talent_reset'
  | 'talent_tree_open'
  | 'talent_tree_close'
  | 'talent_maxed'

  // File/Loot Sounds
  | 'file_created'
  | 'file_modified'
  | 'file_deleted'
  | 'loot_drop'
  | 'loot_pickup'

  // Ambient/Music
  | 'ambient_forge'
  | 'music_main_theme'
  | 'music_battle'
  | 'music_victory';

// Sound definitions with metadata
interface SoundDefinition {
  event: SoundEvent;
  category: SoundCategory;
  file: string;
  volume: number;       // 0-1
  loop: boolean;
  cooldown?: number;    // ms between plays
  variations?: number;  // Number of variation files (e.g., click_1.mp3, click_2.mp3)
  description: string;  // For asset generation
}

// Sound configuration
const SOUND_DEFINITIONS: SoundDefinition[] = [
  // UI Sounds
  {
    event: 'ui_click',
    category: 'ui',
    file: 'ui/click',
    volume: 0.5,
    loop: false,
    variations: 3,
    description: 'Soft magical click, like a rune activating'
  },
  {
    event: 'ui_hover',
    category: 'ui',
    file: 'ui/hover',
    volume: 0.2,
    loop: false,
    cooldown: 50,
    description: 'Subtle shimmer, hovering over enchanted UI element'
  },
  {
    event: 'ui_open_panel',
    category: 'ui',
    file: 'ui/panel_open',
    volume: 0.6,
    loop: false,
    description: 'Ancient tome opening, pages rustling with magic'
  },
  {
    event: 'ui_close_panel',
    category: 'ui',
    file: 'ui/panel_close',
    volume: 0.5,
    loop: false,
    description: 'Tome closing, magical seal forming'
  },
  {
    event: 'ui_error',
    category: 'ui',
    file: 'ui/error',
    volume: 0.7,
    loop: false,
    description: 'Dark chord, spell fizzle, warning tone'
  },
  {
    event: 'ui_success',
    category: 'ui',
    file: 'ui/success',
    volume: 0.6,
    loop: false,
    description: 'Triumphant chime, golden sparkle sound'
  },
  {
    event: 'ui_notification',
    category: 'ui',
    file: 'ui/notification',
    volume: 0.5,
    loop: false,
    description: 'Crystal bell, gentle alert chime'
  },

  // Agent Sounds
  {
    event: 'agent_spawn',
    category: 'agent',
    file: 'agent/spawn',
    volume: 0.8,
    loop: false,
    description: 'Magical summoning, portal opening, energy coalescing'
  },
  {
    event: 'agent_select',
    category: 'agent',
    file: 'agent/select',
    volume: 0.5,
    loop: false,
    variations: 3,
    description: 'Unit acknowledgement, "Ready", magical affirmation'
  },
  {
    event: 'agent_deselect',
    category: 'agent',
    file: 'agent/deselect',
    volume: 0.3,
    loop: false,
    description: 'Soft magical release, selection fading'
  },
  {
    event: 'agent_working',
    category: 'agent',
    file: 'agent/working',
    volume: 0.3,
    loop: true,
    description: 'Typing on magical keyboard, soft arcane humming'
  },
  {
    event: 'agent_idle',
    category: 'agent',
    file: 'agent/idle',
    volume: 0.2,
    loop: true,
    description: 'Ambient breathing, occasional movement'
  },
  {
    event: 'agent_death',
    category: 'agent',
    file: 'agent/death',
    volume: 0.8,
    loop: false,
    description: 'Dramatic departure, energy dispersing'
  },
  {
    event: 'agent_attention',
    category: 'agent',
    file: 'agent/attention',
    volume: 0.9,
    loop: false,
    description: 'Urgent ping, crystal alarm, attention required'
  },
  {
    event: 'agent_level_up',
    category: 'agent',
    file: 'agent/level_up',
    volume: 0.9,
    loop: false,
    description: 'Triumphant fanfare, power surge, achievement unlocked'
  },

  // Quest Sounds
  {
    event: 'quest_start',
    category: 'quest',
    file: 'quest/start',
    volume: 0.7,
    loop: false,
    description: 'Quest accepted, scroll unrolling, commitment made'
  },
  {
    event: 'quest_complete',
    category: 'quest',
    file: 'quest/complete',
    volume: 0.8,
    loop: false,
    description: 'Quest finished, achievement sound, ready for review'
  },
  {
    event: 'quest_turn_in',
    category: 'quest',
    file: 'quest/turn_in',
    volume: 0.6,
    loop: false,
    description: 'Presenting work, quest giver interaction'
  },
  {
    event: 'quest_approved',
    category: 'quest',
    file: 'quest/approved',
    volume: 1.0,
    loop: false,
    description: 'Glorious approval, golden fanfare, success celebration'
  },
  {
    event: 'quest_rejected',
    category: 'quest',
    file: 'quest/rejected',
    volume: 0.7,
    loop: false,
    description: 'Rejection tone, sent back, try again'
  },

  // Talent Sounds
  {
    event: 'talent_allocate',
    category: 'talent',
    file: 'talent/allocate',
    volume: 0.8,
    loop: false,
    description: 'Power unlocked, skill learned, magical empowerment'
  },
  {
    event: 'talent_reset',
    category: 'talent',
    file: 'talent/reset',
    volume: 0.6,
    loop: false,
    description: 'Talents unwinding, power refund, reset complete'
  },
  {
    event: 'talent_tree_open',
    category: 'talent',
    file: 'talent/tree_open',
    volume: 0.6,
    loop: false,
    description: 'Ancient skill book opening, talents revealed'
  },
  {
    event: 'talent_tree_close',
    category: 'talent',
    file: 'talent/tree_close',
    volume: 0.5,
    loop: false,
    description: 'Skill book closing, talents stored'
  },
  {
    event: 'talent_maxed',
    category: 'talent',
    file: 'talent/maxed',
    volume: 0.9,
    loop: false,
    description: 'Talent mastered, golden completion, ultimate power'
  },

  // File/Loot Sounds
  {
    event: 'file_created',
    category: 'quest',
    file: 'loot/created',
    volume: 0.5,
    loop: false,
    description: 'Item crafted, scroll appearing, artifact created'
  },
  {
    event: 'file_modified',
    category: 'quest',
    file: 'loot/modified',
    volume: 0.4,
    loop: false,
    description: 'Item enhanced, gentle modification sound'
  },
  {
    event: 'file_deleted',
    category: 'quest',
    file: 'loot/deleted',
    volume: 0.4,
    loop: false,
    description: 'Item destroyed, dissipating, removal'
  },
  {
    event: 'loot_drop',
    category: 'quest',
    file: 'loot/drop',
    volume: 0.7,
    loop: false,
    description: 'Treasure drop, coins falling, loot available'
  },
  {
    event: 'loot_pickup',
    category: 'quest',
    file: 'loot/pickup',
    volume: 0.6,
    loop: false,
    description: 'Loot collected, item obtained, satisfying grab'
  },

  // Ambient/Music
  {
    event: 'ambient_forge',
    category: 'ambient',
    file: 'ambient/forge',
    volume: 0.3,
    loop: true,
    description: 'Distant forge sounds, magical workshop ambience, crackling energy'
  },
  {
    event: 'music_main_theme',
    category: 'music',
    file: 'music/main_theme',
    volume: 0.4,
    loop: true,
    description: 'Epic orchestral theme, heroic and inspiring, fantasy adventure'
  },
  {
    event: 'music_battle',
    category: 'music',
    file: 'music/battle',
    volume: 0.5,
    loop: true,
    description: 'Intense battle music, driving percussion, urgent strings'
  },
  {
    event: 'music_victory',
    category: 'music',
    file: 'music/victory',
    volume: 0.6,
    loop: false,
    description: 'Victory fanfare, triumphant brass, celebration'
  },
];

// Sound Manager class
class SoundManager {
  private audioContext: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private categoryGains: Map<SoundCategory, GainNode> = new Map();
  private loadedSounds: Map<string, AudioBuffer> = new Map();
  private activeSources: Map<string, AudioBufferSourceNode> = new Map();
  private lastPlayed: Map<SoundEvent, number> = new Map();
  private enabled: boolean = true;
  private soundsPath: string = '/assets/sounds/';

  // Category volume defaults
  private categoryVolumes: Record<SoundCategory, number> = {
    ui: 0.7,
    agent: 0.8,
    quest: 0.9,
    talent: 0.8,
    combat: 0.9,
    ambient: 0.4,
    music: 0.5,
  };

  constructor() {
    // Initialize audio context on user interaction (browser requirement)
    if (typeof window !== 'undefined') {
      const initAudio = () => {
        if (!this.audioContext) {
          this.initAudioContext();
        }
        window.removeEventListener('click', initAudio);
        window.removeEventListener('keydown', initAudio);
      };
      window.addEventListener('click', initAudio);
      window.addEventListener('keydown', initAudio);
    }
  }

  private initAudioContext() {
    try {
      this.audioContext = new AudioContext();
      this.masterGain = this.audioContext.createGain();
      this.masterGain.connect(this.audioContext.destination);
      this.masterGain.gain.value = 0.8;

      // Create gain nodes for each category
      for (const category of Object.keys(this.categoryVolumes) as SoundCategory[]) {
        const gain = this.audioContext.createGain();
        gain.gain.value = this.categoryVolumes[category];
        gain.connect(this.masterGain);
        this.categoryGains.set(category, gain);
      }

      console.log('[SoundManager] Audio context initialized');
    } catch (error) {
      console.warn('[SoundManager] Failed to initialize audio context:', error);
    }
  }

  /**
   * Play a sound event
   */
  async play(event: SoundEvent, options?: { volume?: number; loop?: boolean }): Promise<void> {
    if (!this.enabled || !this.audioContext) return;

    const definition = SOUND_DEFINITIONS.find(d => d.event === event);
    if (!definition) {
      console.warn(`[SoundManager] Unknown sound event: ${event}`);
      return;
    }

    // Check cooldown
    if (definition.cooldown) {
      const lastTime = this.lastPlayed.get(event) || 0;
      if (Date.now() - lastTime < definition.cooldown) {
        return;
      }
    }
    this.lastPlayed.set(event, Date.now());

    // Get or load the audio buffer
    let file = definition.file;
    if (definition.variations) {
      const variation = Math.floor(Math.random() * definition.variations) + 1;
      file = `${definition.file}_${variation}`;
    }

    const buffer = await this.loadSound(file);
    if (!buffer) return;

    // Create and configure source
    const source = this.audioContext.createBufferSource();
    source.buffer = buffer;
    source.loop = options?.loop ?? definition.loop;

    // Create gain for this specific sound
    const soundGain = this.audioContext.createGain();
    soundGain.gain.value = (options?.volume ?? definition.volume);

    // Connect through category gain
    const categoryGain = this.categoryGains.get(definition.category);
    if (categoryGain) {
      source.connect(soundGain);
      soundGain.connect(categoryGain);
    }

    // Track and play
    this.activeSources.set(event, source);
    source.start();

    source.onended = () => {
      this.activeSources.delete(event);
    };
  }

  /**
   * Stop a currently playing sound
   */
  stop(event: SoundEvent): void {
    const source = this.activeSources.get(event);
    if (source) {
      source.stop();
      this.activeSources.delete(event);
    }
  }

  /**
   * Stop all sounds in a category
   */
  stopCategory(category: SoundCategory): void {
    for (const [event, source] of this.activeSources) {
      const definition = SOUND_DEFINITIONS.find(d => d.event === event);
      if (definition?.category === category) {
        source.stop();
        this.activeSources.delete(event);
      }
    }
  }

  /**
   * Set volume for a category (0-1)
   */
  setCategoryVolume(category: SoundCategory, volume: number): void {
    this.categoryVolumes[category] = Math.max(0, Math.min(1, volume));
    const gain = this.categoryGains.get(category);
    if (gain) {
      gain.gain.value = this.categoryVolumes[category];
    }
  }

  /**
   * Set master volume (0-1)
   */
  setMasterVolume(volume: number): void {
    if (this.masterGain) {
      this.masterGain.gain.value = Math.max(0, Math.min(1, volume));
    }
  }

  /**
   * Enable/disable all sounds
   */
  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
    if (!enabled) {
      // Stop all active sounds
      for (const source of this.activeSources.values()) {
        source.stop();
      }
      this.activeSources.clear();
    }
  }

  /**
   * Check if sound is enabled
   */
  isEnabled(): boolean {
    return this.enabled;
  }

  /**
   * Load a sound file
   */
  private async loadSound(file: string): Promise<AudioBuffer | null> {
    if (this.loadedSounds.has(file)) {
      return this.loadedSounds.get(file)!;
    }

    if (!this.audioContext) return null;

    try {
      const response = await fetch(`${this.soundsPath}${file}.mp3`);
      if (!response.ok) {
        // Try ogg fallback
        const oggResponse = await fetch(`${this.soundsPath}${file}.ogg`);
        if (!oggResponse.ok) {
          console.warn(`[SoundManager] Sound not found: ${file}`);
          return null;
        }
        const arrayBuffer = await oggResponse.arrayBuffer();
        const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
        this.loadedSounds.set(file, audioBuffer);
        return audioBuffer;
      }

      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
      this.loadedSounds.set(file, audioBuffer);
      return audioBuffer;
    } catch (error) {
      console.warn(`[SoundManager] Failed to load sound: ${file}`, error);
      return null;
    }
  }

  /**
   * Preload all sounds
   */
  async preloadAll(): Promise<void> {
    const promises = SOUND_DEFINITIONS.map(async (def) => {
      if (def.variations) {
        for (let i = 1; i <= def.variations; i++) {
          await this.loadSound(`${def.file}_${i}`);
        }
      } else {
        await this.loadSound(def.file);
      }
    });

    await Promise.all(promises);
    console.log('[SoundManager] All sounds preloaded');
  }

  /**
   * Get sound definitions (for asset generation)
   */
  getSoundDefinitions(): SoundDefinition[] {
    return SOUND_DEFINITIONS;
  }
}

// Export singleton instance
export const soundManager = new SoundManager();

// Export sound definitions for asset generation
export { SOUND_DEFINITIONS };
export type { SoundDefinition };
