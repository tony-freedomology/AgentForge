import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Notification preferences
export interface NotificationPrefs {
  enabled: boolean;
  questComplete: boolean;
  needsInput: boolean;
  errors: boolean;
  levelUp: boolean;
  agentIdle: boolean;
  quietHoursEnabled: boolean;
  quietHoursStart: string; // HH:MM format
  quietHoursEnd: string;
}

// Sound preferences
export interface SoundPrefs {
  enabled: boolean;
  effectsVolume: number;    // 0-1
  ambientVolume: number;    // 0-1
  notificationVolume: number; // 0-1
  hapticEnabled: boolean;
}

// Display preferences
export interface DisplayPrefs {
  theme: 'dark' | 'light' | 'system';
  animationsEnabled: boolean;
  reducedMotion: boolean;
  showPartyDock: boolean;
  partyDockExpanded: boolean;
  showFloorNames: boolean;
  compactFloorCards: boolean;
}

// Realm/Project filters
export interface Realm {
  id: string;
  name: string;
  icon: string;
  workingDirectory?: string;
}

interface PrefsState {
  // Preferences
  notifications: NotificationPrefs;
  sound: SoundPrefs;
  display: DisplayPrefs;

  // Realms
  realms: Realm[];

  // First launch
  hasCompletedOnboarding: boolean;
  hasSeenWelcome: boolean;

  // Actions
  setNotificationPrefs: (prefs: Partial<NotificationPrefs>) => void;
  setSoundPrefs: (prefs: Partial<SoundPrefs>) => void;
  setDisplayPrefs: (prefs: Partial<DisplayPrefs>) => void;

  // Realms
  addRealm: (realm: Realm) => void;
  updateRealm: (id: string, updates: Partial<Realm>) => void;
  removeRealm: (id: string) => void;

  // Onboarding
  completeOnboarding: () => void;
  markWelcomeSeen: () => void;
  resetOnboarding: () => void;
}

const defaultNotificationPrefs: NotificationPrefs = {
  enabled: true,
  questComplete: true,
  needsInput: true,
  errors: true,
  levelUp: true,
  agentIdle: false,
  quietHoursEnabled: false,
  quietHoursStart: '22:00',
  quietHoursEnd: '08:00',
};

const defaultSoundPrefs: SoundPrefs = {
  enabled: true,
  effectsVolume: 0.7,
  ambientVolume: 0.3,
  notificationVolume: 0.8,
  hapticEnabled: true,
};

const defaultDisplayPrefs: DisplayPrefs = {
  theme: 'dark',
  animationsEnabled: true,
  reducedMotion: false,
  showPartyDock: true,
  partyDockExpanded: false,
  showFloorNames: true,
  compactFloorCards: false,
};

const defaultRealms: Realm[] = [
  { id: 'all', name: 'All', icon: '🏰' },
];

export const usePrefsStore = create<PrefsState>()(
  persist(
    (set, get) => ({
      notifications: defaultNotificationPrefs,
      sound: defaultSoundPrefs,
      display: defaultDisplayPrefs,
      realms: defaultRealms,
      hasCompletedOnboarding: false,
      hasSeenWelcome: false,

      setNotificationPrefs: (prefs) => {
        set((state) => ({
          notifications: { ...state.notifications, ...prefs },
        }));
      },

      setSoundPrefs: (prefs) => {
        set((state) => ({
          sound: { ...state.sound, ...prefs },
        }));
      },

      setDisplayPrefs: (prefs) => {
        set((state) => ({
          display: { ...state.display, ...prefs },
        }));
      },

      addRealm: (realm) => {
        set((state) => ({
          realms: [...state.realms, realm],
        }));
      },

      updateRealm: (id, updates) => {
        set((state) => ({
          realms: state.realms.map((r) =>
            r.id === id ? { ...r, ...updates } : r
          ),
        }));
      },

      removeRealm: (id) => {
        if (id === 'all') return; // Can't remove default realm
        set((state) => ({
          realms: state.realms.filter((r) => r.id !== id),
        }));
      },

      completeOnboarding: () => {
        set({ hasCompletedOnboarding: true });
      },

      markWelcomeSeen: () => {
        set({ hasSeenWelcome: true });
      },

      resetOnboarding: () => {
        set({
          hasCompletedOnboarding: false,
          hasSeenWelcome: false,
        });
      },
    }),
    {
      name: 'arcane-spire-prefs',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

// Create a new realm
export function createRealm(name: string, icon: string, workingDirectory?: string): Realm {
  return {
    id: `realm-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    name,
    icon,
    workingDirectory,
  };
}
