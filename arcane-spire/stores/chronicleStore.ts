import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  ChronicleEntry,
  ChronicleEntryType,
  createChronicleEntry,
} from '../shared/types/chronicle';

interface ChronicleState {
  // Chronicle entries
  entries: ChronicleEntry[];
  unreadCount: number;

  // Max entries to keep
  maxEntries: number;

  // Actions
  addEntry: (entry: ChronicleEntry) => void;
  createEntry: (
    type: ChronicleEntryType,
    title: string,
    options?: Partial<Omit<ChronicleEntry, 'id' | 'type' | 'title' | 'timestamp' | 'isRead'>>
  ) => ChronicleEntry;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  removeEntry: (id: string) => void;
  clearOldEntries: () => void;

  // Getters
  getUnreadEntries: () => ChronicleEntry[];
  getEntriesByAgent: (agentId: string) => ChronicleEntry[];
  getRecentEntries: (count?: number) => ChronicleEntry[];
}

export const useChronicleStore = create<ChronicleState>()(
  persist(
    (set, get) => ({
      entries: [],
      unreadCount: 0,
      maxEntries: 200,

      addEntry: (entry) => {
        set((state) => {
          const entries = [entry, ...state.entries].slice(0, state.maxEntries);
          const unreadCount = entries.filter((e) => !e.isRead).length;
          return { entries, unreadCount };
        });
      },

      createEntry: (type, title, options) => {
        const entry = createChronicleEntry(type, title, options);
        get().addEntry(entry);
        return entry;
      },

      markAsRead: (id) => {
        set((state) => {
          const entries = state.entries.map((e) =>
            e.id === id ? { ...e, isRead: true } : e
          );
          const unreadCount = entries.filter((e) => !e.isRead).length;
          return { entries, unreadCount };
        });
      },

      markAllAsRead: () => {
        set((state) => ({
          entries: state.entries.map((e) => ({ ...e, isRead: true })),
          unreadCount: 0,
        }));
      },

      removeEntry: (id) => {
        set((state) => {
          const entries = state.entries.filter((e) => e.id !== id);
          const unreadCount = entries.filter((e) => !e.isRead).length;
          return { entries, unreadCount };
        });
      },

      clearOldEntries: () => {
        set((state) => {
          const entries = state.entries.slice(0, state.maxEntries);
          const unreadCount = entries.filter((e) => !e.isRead).length;
          return { entries, unreadCount };
        });
      },

      getUnreadEntries: () => {
        return get().entries.filter((e) => !e.isRead);
      },

      getEntriesByAgent: (agentId) => {
        return get().entries.filter((e) => e.agentId === agentId);
      },

      getRecentEntries: (count = 50) => {
        return get().entries.slice(0, count);
      },
    }),
    {
      name: 'arcane-spire-chronicle',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        entries: state.entries.slice(0, 100), // Only persist last 100
      }),
    }
  )
);
