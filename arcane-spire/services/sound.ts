import { Audio } from 'expo-av';
import * as Haptics from 'expo-haptics';
import { usePrefsStore } from '../stores/prefsStore';

// Sound effect types
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

// Sound category mapping
const SOUND_CATEGORIES: Record<SoundEffect, 'effects' | 'ambient' | 'notifications'> = {
  spawn: 'effects',
  complete: 'effects',
  error: 'effects',
  levelUp: 'effects',
  tap: 'effects',
  swipe: 'effects',
  notification: 'notifications',
  typing: 'effects',
  connect: 'effects',
  disconnect: 'effects',
};

// Sound file paths (will be placeholder until real assets are added)
const SOUND_FILES: Record<SoundEffect, number | null> = {
  spawn: null, // require('../assets/sounds/sfx_spawn.wav'),
  complete: null, // require('../assets/sounds/sfx_complete.wav'),
  error: null, // require('../assets/sounds/sfx_error.wav'),
  levelUp: null, // require('../assets/sounds/sfx_level_up.wav'),
  tap: null, // require('../assets/sounds/sfx_tap.wav'),
  swipe: null, // require('../assets/sounds/sfx_swipe.wav'),
  notification: null, // require('../assets/sounds/sfx_notification.wav'),
  typing: null, // require('../assets/sounds/sfx_typing.wav'),
  connect: null, // require('../assets/sounds/sfx_connect.wav'),
  disconnect: null, // require('../assets/sounds/sfx_disconnect.wav'),
};

class SoundService {
  private sounds: Map<SoundEffect, Audio.Sound> = new Map();
  private ambientSound: Audio.Sound | null = null;
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

  // Preload a sound
  private async loadSound(effect: SoundEffect): Promise<Audio.Sound | null> {
    const file = SOUND_FILES[effect];
    if (!file) {
      // No sound file yet, return null
      return null;
    }

    try {
      const { sound } = await Audio.Sound.createAsync(file);
      return sound;
    } catch (error) {
      console.error(`Failed to load sound ${effect}:`, error);
      return null;
    }
  }

  // Get or load a sound
  private async getSound(effect: SoundEffect): Promise<Audio.Sound | null> {
    if (this.sounds.has(effect)) {
      return this.sounds.get(effect)!;
    }

    const sound = await this.loadSound(effect);
    if (sound) {
      this.sounds.set(effect, sound);
    }
    return sound;
  }

  // Play a sound effect
  async play(effect: SoundEffect): Promise<void> {
    const prefs = usePrefsStore.getState().sound;

    if (!prefs.enabled) return;

    const category = SOUND_CATEGORIES[effect];
    let volume = prefs.effectsVolume;

    if (category === 'ambient') {
      volume = prefs.ambientVolume;
    } else if (category === 'notifications') {
      volume = prefs.notificationVolume;
    }

    if (volume === 0) return;

    try {
      const sound = await this.getSound(effect);
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
  async startAmbient(): Promise<void> {
    const prefs = usePrefsStore.getState().sound;
    if (!prefs.enabled || prefs.ambientVolume === 0) return;

    // Placeholder - ambient sound would be loaded here
    // const { sound } = await Audio.Sound.createAsync(
    //   require('../assets/sounds/ambient_spire.wav'),
    //   { isLooping: true, volume: prefs.ambientVolume }
    // );
    // this.ambientSound = sound;
    // await sound.playAsync();
  }

  // Stop ambient sound
  async stopAmbient(): Promise<void> {
    if (this.ambientSound) {
      await this.ambientSound.stopAsync();
      await this.ambientSound.unloadAsync();
      this.ambientSound = null;
    }
  }

  // Update ambient volume
  async setAmbientVolume(volume: number): Promise<void> {
    if (this.ambientSound) {
      await this.ambientSound.setVolumeAsync(volume);
    }
  }

  // Cleanup all sounds
  async cleanup(): Promise<void> {
    for (const sound of this.sounds.values()) {
      await sound.unloadAsync();
    }
    this.sounds.clear();

    if (this.ambientSound) {
      await this.ambientSound.unloadAsync();
      this.ambientSound = null;
    }
  }
}

// Export singleton instance
export const soundService = new SoundService();

// Export class for testing
export { SoundService };
