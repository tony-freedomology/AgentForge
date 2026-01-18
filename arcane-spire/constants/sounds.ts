// Sound effect references
// These will be loaded from assets/sounds/

export const Sounds = {
  // Agent events
  spawn: require('../assets/sounds/sfx_spawn.wav'),
  complete: require('../assets/sounds/sfx_complete.wav'),
  error: require('../assets/sounds/sfx_error.wav'),
  levelUp: require('../assets/sounds/sfx_level_up.wav'),

  // UI interactions
  tap: require('../assets/sounds/sfx_tap.wav'),
  swipe: require('../assets/sounds/sfx_swipe.wav'),
  notification: require('../assets/sounds/sfx_notification.wav'),
  typing: require('../assets/sounds/sfx_typing.wav'),

  // Connection
  connect: require('../assets/sounds/sfx_connect.wav'),
  disconnect: require('../assets/sounds/sfx_disconnect.wav'),

  // Ambient
  ambientSpire: require('../assets/sounds/ambient_spire.wav'),
} as const;

// Sound categories for volume control
export type SoundCategory = 'effects' | 'ambient' | 'notifications';

export const SoundCategoryMap: Record<keyof typeof Sounds, SoundCategory> = {
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
  ambientSpire: 'ambient',
};

// Placeholder sounds (will be created as empty files)
// The actual audio files should be 8-bit style chiptune sounds
export const SoundPlaceholders = [
  'sfx_spawn.wav',
  'sfx_complete.wav',
  'sfx_error.wav',
  'sfx_level_up.wav',
  'sfx_tap.wav',
  'sfx_swipe.wav',
  'sfx_notification.wav',
  'sfx_typing.wav',
  'sfx_connect.wav',
  'sfx_disconnect.wav',
  'ambient_spire.wav',
] as const;
