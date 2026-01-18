import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  Agent,
  AgentStatus,
  AgentActivity,
  AgentThought,
  createAgent,
  addXpToAgent,
  AgentClass,
} from '../shared/types/agent';

interface AgentState {
  // Agent data
  agents: Record<string, Agent>;
  agentOrder: string[]; // Order for display (floor order)
  selectedAgentId: string | null;
  expandedAgentId: string | null; // For chamber view

  // Filtering
  selectedRealm: string | null;
  showOnlyFavorites: boolean;

  // Actions
  setAgents: (agents: Agent[]) => void;
  addAgent: (agent: Agent) => void;
  removeAgent: (id: string) => void;
  updateAgent: (id: string, updates: Partial<Agent>) => void;

  // Status updates
  setAgentStatus: (id: string, status: AgentStatus) => void;
  setAgentActivity: (id: string, activity: AgentActivity) => void;
  setAgentProgress: (id: string, current: number, total: number, label: string) => void;

  // Thoughts/output
  addAgentThought: (id: string, thought: AgentThought) => void;
  addAgentOutput: (id: string, output: string) => void;
  clearAgentOutput: (id: string) => void;

  // Questions
  setAgentQuestion: (id: string, question: string, quickReplies?: string[]) => void;
  clearAgentQuestion: (id: string) => void;

  // XP/Leveling
  grantXp: (id: string, amount: number) => { leveledUp: boolean; levelsGained: number };

  // Selection
  selectAgent: (id: string | null) => void;
  expandAgent: (id: string | null) => void;

  // Favorites
  toggleFavorite: (id: string) => void;

  // Filtering
  setSelectedRealm: (realm: string | null) => void;
  setShowOnlyFavorites: (show: boolean) => void;

  // Reordering
  moveAgent: (fromIndex: number, toIndex: number) => void;

  // Spawn new agent
  spawnAgent: (name: string, agentClass: AgentClass, workingDirectory?: string, initialTask?: string) => Agent;

  // Getters
  getAgent: (id: string) => Agent | undefined;
  getAgentList: () => Agent[];
  getFilteredAgents: () => Agent[];
  getAgentsNeedingAttention: () => Agent[];
}

export const useAgentStore = create<AgentState>()(
  persist(
    (set, get) => ({
      agents: {},
      agentOrder: [],
      selectedAgentId: null,
      expandedAgentId: null,
      selectedRealm: null,
      showOnlyFavorites: false,

      setAgents: (agents) => {
        const agentsMap: Record<string, Agent> = {};
        const order: string[] = [];
        agents.forEach((agent) => {
          agentsMap[agent.id] = agent;
          order.push(agent.id);
        });
        set({ agents: agentsMap, agentOrder: order });
      },

      addAgent: (agent) => {
        set((state) => ({
          agents: { ...state.agents, [agent.id]: agent },
          agentOrder: [...state.agentOrder, agent.id],
        }));
      },

      removeAgent: (id) => {
        set((state) => {
          const { [id]: removed, ...rest } = state.agents;
          return {
            agents: rest,
            agentOrder: state.agentOrder.filter((aid) => aid !== id),
            selectedAgentId: state.selectedAgentId === id ? null : state.selectedAgentId,
            expandedAgentId: state.expandedAgentId === id ? null : state.expandedAgentId,
          };
        });
      },

      updateAgent: (id, updates) => {
        set((state) => {
          const agent = state.agents[id];
          if (!agent) return state;
          return {
            agents: {
              ...state.agents,
              [id]: { ...agent, ...updates },
            },
          };
        });
      },

      setAgentStatus: (id, status) => {
        set((state) => {
          const agent = state.agents[id];
          if (!agent) return state;
          return {
            agents: {
              ...state.agents,
              [id]: {
                ...agent,
                status,
                lastActivity: new Date(),
                idleSince: status === 'dormant' ? new Date() : undefined,
              },
            },
          };
        });
      },

      setAgentActivity: (id, activity) => {
        set((state) => {
          const agent = state.agents[id];
          if (!agent) return state;
          return {
            agents: {
              ...state.agents,
              [id]: { ...agent, activity, lastActivity: new Date() },
            },
          };
        });
      },

      setAgentProgress: (id, current, total, label) => {
        set((state) => {
          const agent = state.agents[id];
          if (!agent) return state;
          return {
            agents: {
              ...state.agents,
              [id]: {
                ...agent,
                progressCurrent: current,
                progressTotal: total,
                progressLabel: label,
              },
            },
          };
        });
      },

      addAgentThought: (id, thought) => {
        set((state) => {
          const agent = state.agents[id];
          if (!agent) return state;
          const thoughts = [...agent.thoughts, thought].slice(-50); // Keep last 50
          return {
            agents: {
              ...state.agents,
              [id]: {
                ...agent,
                thoughts,
                lastThought: thought.content,
              },
            },
          };
        });
      },

      addAgentOutput: (id, output) => {
        set((state) => {
          const agent = state.agents[id];
          if (!agent) return state;
          const outputBuffer = [...agent.outputBuffer, output].slice(-500); // Keep last 500 lines
          return {
            agents: {
              ...state.agents,
              [id]: { ...agent, outputBuffer },
            },
          };
        });
      },

      clearAgentOutput: (id) => {
        set((state) => {
          const agent = state.agents[id];
          if (!agent) return state;
          return {
            agents: {
              ...state.agents,
              [id]: { ...agent, outputBuffer: [] },
            },
          };
        });
      },

      setAgentQuestion: (id, question, quickReplies) => {
        set((state) => {
          const agent = state.agents[id];
          if (!agent) return state;
          return {
            agents: {
              ...state.agents,
              [id]: {
                ...agent,
                status: 'awaiting',
                pendingQuestion: question,
                quickReplies,
              },
            },
          };
        });
      },

      clearAgentQuestion: (id) => {
        set((state) => {
          const agent = state.agents[id];
          if (!agent) return state;
          return {
            agents: {
              ...state.agents,
              [id]: {
                ...agent,
                status: 'channeling',
                pendingQuestion: undefined,
                quickReplies: undefined,
              },
            },
          };
        });
      },

      grantXp: (id, amount) => {
        const agent = get().agents[id];
        if (!agent) return { leveledUp: false, levelsGained: 0 };

        const result = addXpToAgent(agent, amount);
        set((state) => ({
          agents: {
            ...state.agents,
            [id]: result.agent,
          },
        }));

        return { leveledUp: result.leveledUp, levelsGained: result.levelsGained };
      },

      selectAgent: (id) => {
        set({ selectedAgentId: id });
      },

      expandAgent: (id) => {
        set({ expandedAgentId: id });
      },

      toggleFavorite: (id) => {
        set((state) => {
          const agent = state.agents[id];
          if (!agent) return state;
          return {
            agents: {
              ...state.agents,
              [id]: { ...agent, isFavorite: !agent.isFavorite },
            },
          };
        });
      },

      setSelectedRealm: (realm) => {
        set({ selectedRealm: realm });
      },

      setShowOnlyFavorites: (show) => {
        set({ showOnlyFavorites: show });
      },

      moveAgent: (fromIndex, toIndex) => {
        set((state) => {
          const newOrder = [...state.agentOrder];
          const [removed] = newOrder.splice(fromIndex, 1);
          newOrder.splice(toIndex, 0, removed);
          return { agentOrder: newOrder };
        });
      },

      spawnAgent: (name, agentClass, workingDirectory, initialTask) => {
        const agent = createAgent(name, agentClass, workingDirectory, initialTask);
        get().addAgent(agent);
        return agent;
      },

      getAgent: (id) => get().agents[id],

      getAgentList: () => {
        const { agents, agentOrder } = get();
        return agentOrder.map((id) => agents[id]).filter(Boolean);
      },

      getFilteredAgents: () => {
        const { agents, agentOrder, selectedRealm, showOnlyFavorites } = get();
        return agentOrder
          .map((id) => agents[id])
          .filter(Boolean)
          .filter((agent) => {
            if (showOnlyFavorites && !agent.isFavorite) return false;
            if (selectedRealm && agent.realm !== selectedRealm) return false;
            return true;
          });
      },

      getAgentsNeedingAttention: () => {
        const { agents } = get();
        return Object.values(agents).filter(
          (agent) =>
            agent.status === 'awaiting' ||
            agent.status === 'error' ||
            agent.status === 'complete'
        );
      },
    }),
    {
      name: 'arcane-spire-agents',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        agents: state.agents,
        agentOrder: state.agentOrder,
      }),
    }
  )
);
