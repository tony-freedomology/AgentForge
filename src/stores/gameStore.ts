import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import type {
  Agent,
  AgentStatus,
  AgentActivity,
  AttentionReason,
  HexTile,
  GameResources,
  SelectionBox,
  CameraState,
  AgentPosition,
  AgentClass,
  AgentProvider,
  AgentTask,
  FileArtifact,
} from '../types/agent';
import { ACTIVITY_PATTERNS } from '../types/agent';
import { v4 as uuidv4 } from 'uuid';
import { generateHexGrid } from '../utils/hexUtils';
import { agentBridge } from '../services/agentBridge';

interface GameState {
  // Agents
  agents: Map<string, Agent>;
  selectedAgentIds: Set<string>;
  hoveredAgentId: string | null;

  // Map
  hexGrid: Map<string, HexTile>;
  mapSize: number;

  // Resources
  resources: GameResources;

  // Selection
  selectionBox: SelectionBox;

  // Camera
  camera: CameraState;

  // UI State
  showMinimap: boolean;
  showCommandPanel: boolean;
  showAgentDetails: boolean;
  isPaused: boolean;
  currentTime: number;

  // Control Groups
  controlGroups: Map<number, Set<string>>;

  // Actions
  spawnAgent: (provider: AgentProvider, agentClass: AgentClass, name: string, position: AgentPosition, workingDir?: string) => Agent;
  removeAgent: (agentId: string) => void;
  selectAgent: (agentId: string, addToSelection?: boolean) => void;
  selectAgents: (agentIds: string[]) => void;
  deselectAll: () => void;
  setHoveredAgent: (agentId: string | null) => void;
  updateAgentStatus: (agentId: string, status: AgentStatus) => void;
  updateAgentPosition: (agentId: string, position: AgentPosition) => void;
  addAgentTask: (agentId: string, task: Omit<AgentTask, 'id' | 'status'>) => void;
  addTerminalOutput: (agentId: string, output: string) => void;
  updateAgentHealth: (agentId: string, health: number) => void;
  updateAgentMana: (agentId: string, mana: number) => void;

  // New: Activity & Attention Actions
  updateAgentActivity: (agentId: string, activity: AgentActivity, details?: string) => void;
  setAgentNeedsAttention: (agentId: string, needsAttention: boolean, reason?: AttentionReason) => void;
  updateAgentContext: (agentId: string, tokens: number, limit: number) => void;
  updateAgentUsage: (agentId: string, percent: number) => void;
  addProducedFile: (agentId: string, file: FileArtifact) => void;
  detectActivityFromOutput: (agentId: string, output: string) => void;

  // Selection Box
  startSelection: (x: number, y: number) => void;
  updateSelection: (x: number, y: number) => void;
  endSelection: () => void;

  // Camera
  setCameraPosition: (position: [number, number, number]) => void;
  setCameraTarget: (target: [number, number, number]) => void;
  setCameraZoom: (zoom: number) => void;

  // Control Groups
  setControlGroup: (groupNumber: number) => void;
  selectControlGroup: (groupNumber: number) => void;

  // Resources
  updateResource: (resourceName: keyof GameResources, amount: number) => void;
  spendResources: (tokens?: number, gold?: number, mana?: number) => boolean;

  // UI
  toggleMinimap: () => void;
  toggleCommandPanel: () => void;
  toggleAgentDetails: () => void;
  togglePause: () => void;

  // Hex Grid
  revealHex: (q: number, r: number) => void;
  setHexOccupied: (q: number, r: number, occupied: boolean, agentId?: string) => void;

  // Computed helpers
  getAgentsNeedingAttention: () => Agent[];
}

const AGENT_NAMES: Record<AgentClass, string[]> = {
  mage: ['Merlyn', 'Gandara', 'Zephyrus', 'Arcanum', 'Mystica', 'Shadowweave'],
  engineer: ['Gearwright', 'Cogsworth', 'Steamheart', 'Boltforge', 'Ironcode'],
  scout: ['Swiftwind', 'Shadowstep', 'Quicksilver', 'Pathfinder', 'Whisper'],
  guardian: ['Sentinel', 'Wardkeeper', 'Shieldmaiden', 'Bulwark', 'Aegis'],
  architect: ['Grandmaster', 'Worldshaper', 'Visionweaver', 'Planarch', 'Designus'],
  designer: ['Palette', 'Chromaweave', 'Artifax', 'Stylist', 'Glamour'],
};

const getRandomName = (agentClass: AgentClass): string => {
  const names = AGENT_NAMES[agentClass] || AGENT_NAMES.mage;
  return names[Math.floor(Math.random() * names.length)];
};

// Get context limit based on agent class/model
const getContextLimit = (agentClass: AgentClass): number => {
  switch (agentClass) {
    case 'architect': return 200000; // Opus has large context
    case 'mage': return 200000;
    case 'engineer': return 200000;
    case 'scout': return 200000; // Haiku
    case 'guardian': return 128000; // Codex
    case 'designer': return 1000000; // Gemini Pro
    default: return 200000;
  }
};

const initialResources: GameResources = {
  tokens: { name: 'Tokens', current: 100000, max: 1000000, icon: '✨', color: '#fbbf24' },
  gold: { name: 'Gold', current: 50, max: 100, icon: '💰', color: '#f59e0b' },
  mana: { name: 'Mana', current: 1000, max: 1000, icon: '💎', color: '#3b82f6' },
  souls: { name: 'Souls', current: 0, max: 10, icon: '👻', color: '#a855f7' },
};

export const useGameStore = create<GameState>()(
  subscribeWithSelector((set, get) => ({
    // Initial State
    agents: new Map(),
    selectedAgentIds: new Set(),
    hoveredAgentId: null,
    hexGrid: generateHexGrid(8),
    mapSize: 8,
    resources: initialResources,
    selectionBox: { start: null, end: null, isSelecting: false },
    camera: {
      position: [0, 20, 20],
      target: [0, 0, 0],
      zoom: 1,
    },
    showMinimap: true,
    showCommandPanel: true,
    showAgentDetails: true,
    isPaused: false,
    currentTime: 0,
    controlGroups: new Map(),

    // Agent Actions
    spawnAgent: (provider, agentClass, name, position, workingDir) => {
      const id = uuidv4();
      const finalName = name || getRandomName(agentClass);

      // Use provided working directory or default to home
      const finalWorkingDir = workingDir || '~';
      agentBridge.spawnAgent(id, finalName, agentClass, finalWorkingDir);

      const now = Date.now();
      const newAgent: Agent = {
        id,
        name: finalName,
        provider,
        class: agentClass,
        status: 'spawning',
        position,
        health: 100,
        mana: 100,
        experience: 0,
        level: 1,
        taskQueue: [],
        terminalOutput: [`[${new Date().toLocaleTimeString()}] ${finalName} awakens...`],
        createdAt: new Date(),
        lastActiveAt: new Date(),

        // New fields
        activity: 'idle',
        activityStartedAt: now,
        activityDetails: 'Initializing...',
        needsAttention: false,
        contextTokens: 0,
        contextLimit: getContextLimit(agentClass),
        usagePercent: 100, // Start with full usage available
        completedQuests: [],
        producedFiles: [],
      };

      set((state) => {
        const newAgents = new Map(state.agents);
        newAgents.set(id, newAgent);

        // Update hex occupation
        const hexKey = `${position.q},${position.r}`;
        const newGrid = new Map(state.hexGrid);
        const hex = newGrid.get(hexKey);
        if (hex) {
          newGrid.set(hexKey, { ...hex, occupied: true, occupiedBy: id });
        }

        // Update soul count
        const newResources = { ...state.resources };
        newResources.souls = { ...newResources.souls, current: newResources.souls.current + 1 };

        return { agents: newAgents, hexGrid: newGrid, resources: newResources };
      });

      // Transition to idle after spawn animation
      setTimeout(() => {
        get().updateAgentStatus(id, 'idle');
        get().updateAgentActivity(id, 'idle', 'Ready for commands');
      }, 2000);

      return newAgent;
    },

    removeAgent: (agentId) => {
      // Kill backend process
      agentBridge.killAgent(agentId);

      set((state) => {
        const agent = state.agents.get(agentId);
        if (!agent) return state;

        const newAgents = new Map(state.agents);
        newAgents.delete(agentId);

        const newSelected = new Set(state.selectedAgentIds);
        newSelected.delete(agentId);

        // Free up hex
        const hexKey = `${agent.position.q},${agent.position.r}`;
        const newGrid = new Map(state.hexGrid);
        const hex = newGrid.get(hexKey);
        if (hex) {
          newGrid.set(hexKey, { ...hex, occupied: false, occupiedBy: undefined });
        }

        // Update soul count
        const newResources = { ...state.resources };
        newResources.souls = { ...newResources.souls, current: Math.max(0, newResources.souls.current - 1) };

        return { agents: newAgents, selectedAgentIds: newSelected, hexGrid: newGrid, resources: newResources };
      });
    },

    selectAgent: (agentId, addToSelection = false) => {
      set((state) => {
        const newSelected = addToSelection ? new Set(state.selectedAgentIds) : new Set<string>();
        if (state.selectedAgentIds.has(agentId) && addToSelection) {
          newSelected.delete(agentId);
        } else {
          newSelected.add(agentId);
        }
        return { selectedAgentIds: newSelected };
      });
    },

    selectAgents: (agentIds) => {
      set({ selectedAgentIds: new Set(agentIds) });
    },

    deselectAll: () => {
      set({ selectedAgentIds: new Set() });
    },

    setHoveredAgent: (agentId) => {
      set({ hoveredAgentId: agentId });
    },

    updateAgentStatus: (agentId, status) => {
      set((state) => {
        const agent = state.agents.get(agentId);
        if (!agent) return state;

        const newAgents = new Map(state.agents);
        const updates: Partial<Agent> = { status, lastActiveAt: new Date() };

        // Auto-set attention states based on status
        if (status === 'waiting') {
          updates.needsAttention = true;
          updates.attentionReason = 'waiting_input';
          updates.attentionSince = Date.now();
        } else if (status === 'error') {
          updates.needsAttention = true;
          updates.attentionReason = 'error';
          updates.attentionSince = Date.now();
        } else if (status === 'completed') {
          updates.needsAttention = true;
          updates.attentionReason = 'task_complete';
          updates.attentionSince = Date.now();
        } else if (status === 'working') {
          updates.needsAttention = false;
          updates.attentionReason = undefined;
        }

        newAgents.set(agentId, { ...agent, ...updates });
        return { agents: newAgents };
      });
    },

    updateAgentPosition: (agentId, position) => {
      set((state) => {
        const agent = state.agents.get(agentId);
        if (!agent) return state;

        const newAgents = new Map(state.agents);
        const newGrid = new Map(state.hexGrid);

        // Free old hex
        const oldHexKey = `${agent.position.q},${agent.position.r}`;
        const oldHex = newGrid.get(oldHexKey);
        if (oldHex) {
          newGrid.set(oldHexKey, { ...oldHex, occupied: false, occupiedBy: undefined });
        }

        // Occupy new hex
        const newHexKey = `${position.q},${position.r}`;
        const newHex = newGrid.get(newHexKey);
        if (newHex) {
          newGrid.set(newHexKey, { ...newHex, occupied: true, occupiedBy: agentId });
        }

        newAgents.set(agentId, { ...agent, position });
        return { agents: newAgents, hexGrid: newGrid };
      });
    },

    addAgentTask: (agentId, task) => {
      set((state) => {
        const agent = state.agents.get(agentId);
        if (!agent) return state;

        const newTask: AgentTask = {
          id: uuidv4(),
          status: 'queued',
          ...task,
        };

        const newAgents = new Map(state.agents);
        newAgents.set(agentId, {
          ...agent,
          taskQueue: [...agent.taskQueue, newTask],
        });
        return { agents: newAgents };
      });
    },

    addTerminalOutput: (agentId, output) => {
      set((state) => {
        const agent = state.agents.get(agentId);
        if (!agent) return state;

        const newAgents = new Map(state.agents);
        const newOutput = [...agent.terminalOutput, output].slice(-100); // Keep last 100 lines
        newAgents.set(agentId, { ...agent, terminalOutput: newOutput });
        return { agents: newAgents };
      });

      // Also detect activity from this output
      get().detectActivityFromOutput(agentId, output);
    },

    updateAgentHealth: (agentId, health) => {
      set((state) => {
        const agent = state.agents.get(agentId);
        if (!agent) return state;

        const newAgents = new Map(state.agents);
        newAgents.set(agentId, { ...agent, health: Math.max(0, Math.min(100, health)) });
        return { agents: newAgents };
      });
    },

    updateAgentMana: (agentId, mana) => {
      set((state) => {
        const agent = state.agents.get(agentId);
        if (!agent) return state;

        const newAgents = new Map(state.agents);
        newAgents.set(agentId, { ...agent, mana: Math.max(0, Math.min(100, mana)) });
        return { agents: newAgents };
      });
    },

    // New: Activity & Attention Actions
    updateAgentActivity: (agentId, activity, details) => {
      set((state) => {
        const agent = state.agents.get(agentId);
        if (!agent) return state;

        const newAgents = new Map(state.agents);
        newAgents.set(agentId, {
          ...agent,
          activity,
          activityStartedAt: Date.now(),
          activityDetails: details,
        });
        return { agents: newAgents };
      });
    },

    setAgentNeedsAttention: (agentId, needsAttention, reason) => {
      set((state) => {
        const agent = state.agents.get(agentId);
        if (!agent) return state;

        const newAgents = new Map(state.agents);
        newAgents.set(agentId, {
          ...agent,
          needsAttention,
          attentionReason: needsAttention ? reason : undefined,
          attentionSince: needsAttention ? (agent.attentionSince || Date.now()) : undefined,
        });
        return { agents: newAgents };
      });
    },

    updateAgentContext: (agentId, tokens, limit) => {
      set((state) => {
        const agent = state.agents.get(agentId);
        if (!agent) return state;

        const newAgents = new Map(state.agents);
        newAgents.set(agentId, {
          ...agent,
          contextTokens: tokens,
          contextLimit: limit,
        });
        return { agents: newAgents };
      });
    },

    updateAgentUsage: (agentId, percent) => {
      set((state) => {
        const agent = state.agents.get(agentId);
        if (!agent) return state;

        const newAgents = new Map(state.agents);
        newAgents.set(agentId, {
          ...agent,
          usagePercent: Math.max(0, Math.min(100, percent)),
        });
        return { agents: newAgents };
      });
    },

    addProducedFile: (agentId, file) => {
      set((state) => {
        const agent = state.agents.get(agentId);
        if (!agent) return state;

        const newAgents = new Map(state.agents);
        newAgents.set(agentId, {
          ...agent,
          producedFiles: [...agent.producedFiles, file],
        });
        return { agents: newAgents };
      });
    },

    detectActivityFromOutput: (agentId, output) => {
      // Detect activity from output patterns
      for (const [activity, patterns] of Object.entries(ACTIVITY_PATTERNS)) {
        if (activity === 'idle') continue; // Skip idle, it's the default

        for (const pattern of patterns) {
          if (pattern.test(output)) {
            get().updateAgentActivity(agentId, activity as AgentActivity, output.slice(0, 50));

            // Auto-set status based on activity
            if (activity === 'waiting') {
              get().updateAgentStatus(agentId, 'waiting');
            } else if (activity === 'error') {
              get().updateAgentStatus(agentId, 'error');
            } else if (activity !== 'idle') {
              // For other activities, set to working
              const agent = get().agents.get(agentId);
              if (agent && agent.status !== 'working') {
                get().updateAgentStatus(agentId, 'working');
              }
            }
            return;
          }
        }
      }
    },

    // Selection Box
    startSelection: (x, y) => {
      set({
        selectionBox: { start: { x, y }, end: { x, y }, isSelecting: true },
      });
    },

    updateSelection: (x, y) => {
      set((state) => ({
        selectionBox: { ...state.selectionBox, end: { x, y } },
      }));
    },

    endSelection: () => {
      set({
        selectionBox: { start: null, end: null, isSelecting: false },
      });
    },

    // Camera
    setCameraPosition: (position) => {
      set((state) => ({ camera: { ...state.camera, position } }));
    },

    setCameraTarget: (target) => {
      set((state) => ({ camera: { ...state.camera, target } }));
    },

    setCameraZoom: (zoom) => {
      set((state) => ({ camera: { ...state.camera, zoom: Math.max(0.5, Math.min(3, zoom)) } }));
    },

    // Control Groups
    setControlGroup: (groupNumber) => {
      set((state) => {
        const newGroups = new Map(state.controlGroups);
        newGroups.set(groupNumber, new Set(state.selectedAgentIds));

        // Update agents with control group assignment
        const newAgents = new Map(state.agents);
        state.selectedAgentIds.forEach((id) => {
          const agent = newAgents.get(id);
          if (agent) {
            newAgents.set(id, { ...agent, controlGroup: groupNumber });
          }
        });

        return { controlGroups: newGroups, agents: newAgents };
      });
    },

    selectControlGroup: (groupNumber) => {
      set((state) => {
        const group = state.controlGroups.get(groupNumber);
        if (!group) return state;
        return { selectedAgentIds: new Set(group) };
      });
    },

    // Resources
    updateResource: (resourceName, amount) => {
      set((state) => {
        const newResources = { ...state.resources };
        newResources[resourceName] = {
          ...newResources[resourceName],
          current: Math.max(0, Math.min(newResources[resourceName].max, amount)),
        };
        return { resources: newResources };
      });
    },

    spendResources: (tokens = 0, gold = 0, mana = 0) => {
      const state = get();
      if (
        state.resources.tokens.current < tokens ||
        state.resources.gold.current < gold ||
        state.resources.mana.current < mana
      ) {
        return false;
      }

      set((state) => {
        const newResources = { ...state.resources };
        newResources.tokens = { ...newResources.tokens, current: newResources.tokens.current - tokens };
        newResources.gold = { ...newResources.gold, current: newResources.gold.current - gold };
        newResources.mana = { ...newResources.mana, current: newResources.mana.current - mana };
        return { resources: newResources };
      });

      return true;
    },

    // UI
    toggleMinimap: () => set((state) => ({ showMinimap: !state.showMinimap })),
    toggleCommandPanel: () => set((state) => ({ showCommandPanel: !state.showCommandPanel })),
    toggleAgentDetails: () => set((state) => ({ showAgentDetails: !state.showAgentDetails })),
    togglePause: () => set((state) => ({ isPaused: !state.isPaused })),

    // Hex Grid
    revealHex: (q, r) => {
      set((state) => {
        const hexKey = `${q},${r}`;
        const hex = state.hexGrid.get(hexKey);
        if (!hex) return state;

        const newGrid = new Map(state.hexGrid);
        newGrid.set(hexKey, { ...hex, revealed: true, fogOfWar: false });
        return { hexGrid: newGrid };
      });
    },

    setHexOccupied: (q, r, occupied, agentId) => {
      set((state) => {
        const hexKey = `${q},${r}`;
        const hex = state.hexGrid.get(hexKey);
        if (!hex) return state;

        const newGrid = new Map(state.hexGrid);
        newGrid.set(hexKey, { ...hex, occupied, occupiedBy: agentId });
        return { hexGrid: newGrid };
      });
    },

    // Computed helpers
    getAgentsNeedingAttention: () => {
      const agents = get().agents;
      return Array.from(agents.values()).filter(a => a.needsAttention);
    },
  }))
);
