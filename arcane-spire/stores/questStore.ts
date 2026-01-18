import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  Quest,
  QuestStatus,
  QuestArtifact,
  LootItem,
  createQuest,
  questArtifactsToLoot,
  QuestPriority,
} from '../shared/types/quest';

interface QuestState {
  // Quest data
  quests: Record<string, Quest>;

  // Loot/Treasure vault
  loot: LootItem[];
  unreadLootCount: number;

  // Actions
  addQuest: (quest: Quest) => void;
  updateQuest: (id: string, updates: Partial<Quest>) => void;
  removeQuest: (id: string) => void;

  // Quest lifecycle
  startQuest: (
    agentId: string,
    agentName: string,
    agentClass: string,
    title: string,
    description: string,
    priority?: QuestPriority
  ) => Quest;
  completeQuest: (id: string, summary: string, artifacts: QuestArtifact[]) => void;
  acceptQuest: (id: string) => number; // Returns XP reward
  requestRevision: (id: string, notes: string) => void;
  failQuest: (id: string) => void;

  // Loot management
  collectLoot: (lootId: string) => void;
  collectAllLoot: () => void;
  clearCollectedLoot: () => void;

  // Getters
  getQuest: (id: string) => Quest | undefined;
  getQuestsByAgent: (agentId: string) => Quest[];
  getActiveQuests: () => Quest[];
  getPendingReviewQuests: () => Quest[];
  getQuestHistory: () => Quest[];
  getUncollectedLoot: () => LootItem[];
}

export const useQuestStore = create<QuestState>()(
  persist(
    (set, get) => ({
      quests: {},
      loot: [],
      unreadLootCount: 0,

      addQuest: (quest) => {
        set((state) => ({
          quests: { ...state.quests, [quest.id]: quest },
        }));
      },

      updateQuest: (id, updates) => {
        set((state) => {
          const quest = state.quests[id];
          if (!quest) return state;
          return {
            quests: {
              ...state.quests,
              [id]: { ...quest, ...updates },
            },
          };
        });
      },

      removeQuest: (id) => {
        set((state) => {
          const { [id]: removed, ...rest } = state.quests;
          return { quests: rest };
        });
      },

      startQuest: (agentId, agentName, agentClass, title, description, priority) => {
        const quest = createQuest(agentId, agentName, agentClass, title, description, priority);
        get().addQuest(quest);
        return quest;
      },

      completeQuest: (id, summary, artifacts) => {
        const quest = get().quests[id];
        if (!quest) return;

        // Update quest
        set((state) => ({
          quests: {
            ...state.quests,
            [id]: {
              ...quest,
              status: 'complete',
              completionSummary: summary,
              artifacts,
              completedAt: new Date(),
            },
          },
        }));

        // Create loot items
        const updatedQuest = { ...quest, artifacts };
        const newLoot = questArtifactsToLoot(updatedQuest);

        set((state) => ({
          loot: [...state.loot, ...newLoot],
          unreadLootCount: state.unreadLootCount + newLoot.length,
        }));
      },

      acceptQuest: (id) => {
        const quest = get().quests[id];
        if (!quest || quest.status !== 'complete') return 0;

        set((state) => ({
          quests: {
            ...state.quests,
            [id]: {
              ...quest,
              status: 'accepted',
              reviewedAt: new Date(),
            },
          },
        }));

        return quest.xpReward;
      },

      requestRevision: (id, notes) => {
        const quest = get().quests[id];
        if (!quest) return;

        set((state) => ({
          quests: {
            ...state.quests,
            [id]: {
              ...quest,
              status: 'revising',
              revisionNotes: notes,
            },
          },
        }));
      },

      failQuest: (id) => {
        const quest = get().quests[id];
        if (!quest) return;

        set((state) => ({
          quests: {
            ...state.quests,
            [id]: {
              ...quest,
              status: 'failed',
              completedAt: new Date(),
            },
          },
        }));
      },

      collectLoot: (lootId) => {
        set((state) => ({
          loot: state.loot.map((item) =>
            item.id === lootId
              ? { ...item, isNew: false, collectedAt: new Date() }
              : item
          ),
          unreadLootCount: Math.max(0, state.unreadLootCount - 1),
        }));
      },

      collectAllLoot: () => {
        const now = new Date();
        set((state) => ({
          loot: state.loot.map((item) =>
            item.isNew ? { ...item, isNew: false, collectedAt: now } : item
          ),
          unreadLootCount: 0,
        }));
      },

      clearCollectedLoot: () => {
        set((state) => ({
          loot: state.loot.filter((item) => item.isNew),
        }));
      },

      getQuest: (id) => get().quests[id],

      getQuestsByAgent: (agentId) => {
        return Object.values(get().quests).filter((q) => q.agentId === agentId);
      },

      getActiveQuests: () => {
        return Object.values(get().quests).filter(
          (q) => q.status === 'active' || q.status === 'revising'
        );
      },

      getPendingReviewQuests: () => {
        return Object.values(get().quests).filter((q) => q.status === 'complete');
      },

      getQuestHistory: () => {
        return Object.values(get().quests)
          .filter((q) => q.status === 'accepted' || q.status === 'failed')
          .sort((a, b) => {
            const aDate = a.completedAt || a.startedAt;
            const bDate = b.completedAt || b.startedAt;
            return bDate.getTime() - aDate.getTime();
          });
      },

      getUncollectedLoot: () => {
        return get().loot.filter((item) => item.isNew);
      },
    }),
    {
      name: 'arcane-spire-quests',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        quests: state.quests,
        loot: state.loot,
      }),
    }
  )
);
