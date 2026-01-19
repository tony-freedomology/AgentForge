import { Audio } from 'expo-av';
import * as Haptics from 'expo-haptics';
import { usePrefsStore } from '../stores/prefsStore';
import {
  UISounds,
  AgentSounds,
  QuestSounds,
  ConnectionSounds,
  NotificationSounds,
  AmbientSounds,
  OnboardingSounds,
  EffectSounds,
  SoundCategoryMap,
  SoundCategory,
} from '../constants/sounds';

// Sound effect types - all 65 sounds organized by category
export type UISoundEffect = keyof typeof UISounds;
export type AgentSoundEffect = keyof typeof AgentSounds;
export type QuestSoundEffect = keyof typeof QuestSounds;
export type ConnectionSoundEffect = keyof typeof ConnectionSounds;
export type NotificationSoundEffect = keyof typeof NotificationSounds;
export type AmbientSoundEffect = keyof typeof AmbientSounds;
export type OnboardingSoundEffect = keyof typeof OnboardingSounds;
export type EffectSoundEffect = keyof typeof EffectSounds;

// Legacy sound effect type for backward compatibility
export type SoundEffect =
  | 'spawn'
  | 'complete'
  | 'error'
  | 'levelUp'
  | 'tap'
  | 'swipe'
  | 'notification'
  | 'typing'
  | 'connect'
  | 'disconnect';

// All sound sources organized by category
const SOUND_SOURCES = {
  ui: UISounds,
  agent: AgentSounds,
  quest: QuestSounds,
  connection: ConnectionSounds,
  notification: NotificationSounds,
  ambient: AmbientSounds,
  onboarding: OnboardingSounds,
  effect: EffectSounds,
} as const;

// Legacy sound mapping for backward compatibility
const LEGACY_SOUND_MAP: Record<SoundEffect, { category: keyof typeof SOUND_SOURCES; key: string }> = {
  spawn: { category: 'agent', key: 'spawn' },
  complete: { category: 'quest', key: 'questComplete' },
  error: { category: 'agent', key: 'error' },
  levelUp: { category: 'quest', key: 'levelUp' },
  tap: { category: 'ui', key: 'tap' },
  swipe: { category: 'ui', key: 'swipe' },
  notification: { category: 'notification', key: 'quest' },
  typing: { category: 'agent', key: 'writing' },
  connect: { category: 'connection', key: 'connectSuccess' },
  disconnect: { category: 'connection', key: 'disconnect' },
};

// Sound category mapping for legacy effects
const LEGACY_SOUND_CATEGORIES: Record<SoundEffect, SoundCategory> = {
  spawn: 'effects',
  complete: 'effects',
  error: 'effects',
  levelUp: 'effects',
  tap: 'ui',
  swipe: 'ui',
  notification: 'notifications',
  typing: 'ambient',
  connect: 'effects',
  disconnect: 'effects',
};

class SoundService {
  private sounds: Map<string, Audio.Sound> = new Map();
  private ambientSound: Audio.Sound | null = null;
  private currentAmbientKey: string | null = null;
  private isInitialized = false;

  // Initialize audio
  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: false,
        staysActiveInBackground: false,
        shouldDuckAndroid: true,
      });

      this.isInitialized = true;
    } catch (error) {
      console.error('Failed to initialize audio:', error);
    }
  }

  // Get sound source by category and key
  private getSoundSource(category: keyof typeof SOUND_SOURCES, key: string): number | null {
    const categorySource = SOUND_SOURCES[category] as Record<string, number>;
    return categorySource[key] ?? null;
  }

  // Load a sound
  private async loadSound(cacheKey: string, source: number): Promise<Audio.Sound | null> {
    try {
      const { sound } = await Audio.Sound.createAsync(source);
      return sound;
    } catch (error) {
      console.error(`Failed to load sound ${cacheKey}:`, error);
      return null;
    }
  }

  // Get or load a sound
  private async getSound(cacheKey: string, source: number): Promise<Audio.Sound | null> {
    if (this.sounds.has(cacheKey)) {
      return this.sounds.get(cacheKey)!;
    }

    const sound = await this.loadSound(cacheKey, source);
    if (sound) {
      this.sounds.set(cacheKey, sound);
    }
    return sound;
  }

  // Get volume for a category
  private getVolumeForCategory(category: SoundCategory): number {
    const prefs = usePrefsStore.getState().sound;

    switch (category) {
      case 'ambient':
        return prefs.ambientVolume;
      case 'notifications':
        return prefs.notificationVolume;
      case 'ui':
      case 'effects':
      default:
        return prefs.effectsVolume;
    }
  }

  // Play a sound by category and key (new API)
  async playSound<C extends keyof typeof SOUND_SOURCES>(
    category: C,
    key: keyof (typeof SOUND_SOURCES)[C]
  ): Promise<void> {
    const prefs = usePrefsStore.getState().sound;
    if (!prefs.enabled) return;

    const source = this.getSoundSource(category, key as string);
    if (!source) {
      console.warn(`Sound not found: ${category}.${String(key)}`);
      return;
    }

    const soundCategoryKey = `${category}.${String(key)}` as keyof typeof SoundCategoryMap;
    const soundCategory = SoundCategoryMap[soundCategoryKey] || 'effects';
    const volume = this.getVolumeForCategory(soundCategory);

    if (volume === 0) return;

    try {
      const cacheKey = `${category}.${String(key)}`;
      const sound = await this.getSound(cacheKey, source);
      if (sound) {
        await sound.setVolumeAsync(volume);
        await sound.setPositionAsync(0);
        await sound.playAsync();
      }
    } catch (error) {
      console.error(`Failed to play sound ${category}.${String(key)}:`, error);
    }
  }

  // Play a legacy sound effect (backward compatible)
  async play(effect: SoundEffect): Promise<void> {
    const prefs = usePrefsStore.getState().sound;
    if (!prefs.enabled) return;

    const mapping = LEGACY_SOUND_MAP[effect];
    if (!mapping) {
      console.warn(`Unknown legacy sound effect: ${effect}`);
      return;
    }

    const source = this.getSoundSource(mapping.category, mapping.key);
    if (!source) {
      console.warn(`Sound source not found for legacy effect: ${effect}`);
      return;
    }

    const category = LEGACY_SOUND_CATEGORIES[effect];
    const volume = this.getVolumeForCategory(category);

    if (volume === 0) return;

    try {
      const cacheKey = `legacy.${effect}`;
      const sound = await this.getSound(cacheKey, source);
      if (sound) {
        await sound.setVolumeAsync(volume);
        await sound.setPositionAsync(0);
        await sound.playAsync();
      }
    } catch (error) {
      console.error(`Failed to play sound ${effect}:`, error);
    }

    // Also trigger haptic feedback
    if (prefs.hapticEnabled) {
      this.triggerHaptic(effect);
    }
  }

  // Trigger haptic feedback
  private triggerHaptic(effect: SoundEffect): void {
    switch (effect) {
      case 'tap':
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        break;
      case 'spawn':
      case 'levelUp':
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        break;
      case 'complete':
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        break;
      case 'error':
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        break;
      case 'notification':
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        break;
      default:
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  }

  // Play haptic only (no sound)
  async playHaptic(type: 'light' | 'medium' | 'heavy' | 'success' | 'error' | 'warning'): Promise<void> {
    const prefs = usePrefsStore.getState().sound;
    if (!prefs.hapticEnabled) return;

    switch (type) {
      case 'light':
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        break;
      case 'medium':
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        break;
      case 'heavy':
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        break;
      case 'success':
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        break;
      case 'error':
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        break;
      case 'warning':
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        break;
    }
  }

  // Start ambient sound
  async startAmbient(key: AmbientSoundEffect = 'spireDay'): Promise<void> {
    const prefs = usePrefsStore.getState().sound;
    if (!prefs.enabled || prefs.ambientVolume === 0) return;

    // Stop current ambient if different
    if (this.currentAmbientKey && this.currentAmbientKey !== key) {
      await this.stopAmbient();
    }

    // Already playing this ambient
    if (this.currentAmbientKey === key && this.ambientSound) {
      return;
    }

    const source = AmbientSounds[key];
    if (!source) {
      console.warn(`Ambient sound not found: ${key}`);
      return;
    }

    try {
      const { sound } = await Audio.Sound.createAsync(source, {
        isLooping: true,
        volume: prefs.ambientVolume,
      });
      this.ambientSound = sound;
      this.currentAmbientKey = key;
      await sound.playAsync();
    } catch (error) {
      console.error(`Failed to start ambient sound ${key}:`, error);
    }
  }

  // Stop ambient sound
  async stopAmbient(): Promise<void> {
    if (this.ambientSound) {
      try {
        await this.ambientSound.stopAsync();
        await this.ambientSound.unloadAsync();
      } catch (error) {
        console.error('Failed to stop ambient sound:', error);
      }
      this.ambientSound = null;
      this.currentAmbientKey = null;
    }
  }

  // Update ambient volume
  async setAmbientVolume(volume: number): Promise<void> {
    if (this.ambientSound) {
      try {
        await this.ambientSound.setVolumeAsync(volume);
      } catch (error) {
        console.error('Failed to set ambient volume:', error);
      }
    }
  }

  // Cleanup all sounds
  async cleanup(): Promise<void> {
    for (const sound of this.sounds.values()) {
      try {
        await sound.unloadAsync();
      } catch (error) {
        console.error('Failed to unload sound:', error);
      }
    }
    this.sounds.clear();

    if (this.ambientSound) {
      try {
        await this.ambientSound.unloadAsync();
      } catch (error) {
        console.error('Failed to unload ambient sound:', error);
      }
      this.ambientSound = null;
      this.currentAmbientKey = null;
    }
  }
}

// Export singleton instance
export const soundService = new SoundService();

// Export class for testing
export { SoundService };
