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
  Quest,
  TaskProgress,
  ProjectZone,
  AgentTalents,
} from '../types/agent';
import { canLearnTalent } from '../config/talents';
import { ACTIVITY_PATTERNS, PROGRESS_PATTERNS } from '../types/agent';
import { v4 as uuidv4 } from 'uuid';
import { generateHexGrid } from '../utils/hexUtils';
import { agentBridge } from '../services/agentBridge';
import { toast } from './toastStore';

// Idle timeout threshold in milliseconds (60 seconds)
const IDLE_TIMEOUT_MS = 60000;

// Session storage key
const SESSION_STORAGE_KEY = 'agentforge_session';

// Saved agent data structure for session persistence
export interface SavedAgentData {
  id: string;
  name: string;
  provider: AgentProvider;
  class: AgentClass;
  position: AgentPosition;
  level: number;
  experience: number;
  talents: AgentTalents;
  completedQuests: Quest[];
  controlGroup?: number;
}

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

  // Project Zones
  projectZones: Map<string, ProjectZone>;

  // Actions
  spawnAgent: (provider: AgentProvider, agentClass: AgentClass, name: string, position: AgentPosition, workingDir?: string) => Agent;
  spawnAgentWithId: (id: string, provider: AgentProvider, agentClass: AgentClass, name: string, position: AgentPosition, workingDir?: string) => Agent;
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
  updateAgentProgress: (agentId: string, progress: TaskProgress | undefined) => void;
  detectProgressFromOutput: (agentId: string, output: string) => void;
  detectResourceUsageFromOutput: (agentId: string, output: string) => void;
  checkIdleTimeouts: () => void;

  // Quest System Actions
  startQuest: (agentId: string, description: string) => void;
  completeQuest: (agentId: string, notes?: string) => void;
  approveQuest: (agentId: string) => void;
  rejectQuest: (agentId: string, feedback: string) => void;
  detectQuestCompletion: (agentId: string, output: string) => void;
  detectFileArtifacts: (agentId: string, output: string) => void;
  getAgentsWithPendingQuests: () => Agent[];

  // Talent System Actions
  allocateTalent: (agentId: string, talentId: string) => boolean;
  resetTalents: (agentId: string) => void;
  awardTalentPoint: (agentId: string) => void;

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

  // Project Zones
  createProjectZone: (name: string, color: string, hexes: Array<{ q: number; r: number }>) => ProjectZone;
  removeProjectZone: (zoneId: string) => void;
  updateProjectZone: (zoneId: string, updates: Partial<ProjectZone>) => void;
  getZoneForHex: (q: number, r: number) => ProjectZone | undefined;

  // Session Persistence
  saveSession: () => boolean;
  loadSession: () => SavedAgentData[] | false;
  clearSession: () => void;
  restoreAgents: (agents: SavedAgentData[]) => void;

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
    hexGrid: generateHexGrid(16),
    mapSize: 16,
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
    projectZones: new Map(),

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

        // Talent system
        talents: { points: 1, allocated: {} }, // Start with 1 talent point
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
        // Check if agent still exists before updating
        const agent = get().agents.get(id);
        if (agent && agent.status === 'spawning') {
          get().updateAgentStatus(id, 'idle');
          get().updateAgentActivity(id, 'idle', 'Ready for commands');
        }
      }, 2000);

      // Show toast notification
      toast.info('Agent Summoned', `${finalName} (${agentClass}) has joined your legion`);

      return newAgent;
    },

    // Spawn agent with a specific ID (used when syncing from server)
    spawnAgentWithId: (id, provider, agentClass, name, position, _workingDir) => {
      // Check if agent already exists
      const existingAgent = get().agents.get(id);
      if (existingAgent) {
        return existingAgent;
      }

      const finalName = name || getRandomName(agentClass);
      const now = Date.now();
      const newAgent: Agent = {
        id,
        name: finalName,
        provider,
        class: agentClass,
        status: 'idle', // Server-synced agents start idle
        position,
        health: 100,
        mana: 100,
        experience: 0,
        level: 1,
        taskQueue: [],
        terminalOutput: [`[${new Date().toLocaleTimeString()}] ${finalName} materialized...`],
        createdAt: new Date(),
        lastActiveAt: new Date(),
        activity: 'idle',
        activityStartedAt: now,
        activityDetails: 'Ready for commands',
        needsAttention: false,
        contextTokens: 0,
        contextLimit: getContextLimit(agentClass),
        usagePercent: 100,
        completedQuests: [],
        producedFiles: [],
        talents: { points: 1, allocated: {} },
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

      toast.info('Agent Synced', `${finalName} has joined from server`);
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

        const now = Date.now();
        const newAgents = new Map(state.agents);

        // Track when agent becomes idle for timeout detection
        const wasIdle = agent.activity === 'idle';
        const isNowIdle = activity === 'idle';

        newAgents.set(agentId, {
          ...agent,
          activity,
          activityStartedAt: now,
          activityDetails: details,
          // Set idleSince when transitioning to idle, clear when leaving idle
          idleSince: isNowIdle ? (wasIdle ? agent.idleSince : now) : undefined,
          // Clear progress when activity changes
          taskProgress: activity !== agent.activity ? undefined : agent.taskProgress,
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

      // Also detect file artifacts, quest completion, progress, and resource usage
      get().detectFileArtifacts(agentId, output);
      get().detectQuestCompletion(agentId, output);
      get().detectProgressFromOutput(agentId, output);
      get().detectResourceUsageFromOutput(agentId, output);
    },

    // Progress tracking
    updateAgentProgress: (agentId, progress) => {
      set((state) => {
        const agent = state.agents.get(agentId);
        if (!agent) return state;

        const newAgents = new Map(state.agents);
        newAgents.set(agentId, {
          ...agent,
          taskProgress: progress,
        });
        return { agents: newAgents };
      });
    },

    detectProgressFromOutput: (agentId, output) => {
      const agent = get().agents.get(agentId);
      if (!agent) return;

      // Check each progress pattern type
      for (const [type, patterns] of Object.entries(PROGRESS_PATTERNS)) {
        if (type === 'context' || type === 'usage') continue; // Handle separately

        for (const pattern of patterns) {
          const match = output.match(pattern);
          if (match) {
            const current = parseInt(match[1], 10);
            const total = match[2] ? parseInt(match[2], 10) : current;

            // Only update if we have valid numbers
            if (!isNaN(current) && total > 0) {
              const progressType = type as 'tests' | 'build' | 'lint' | 'files';
              const labels: Record<string, string> = {
                tests: 'Running tests...',
                build: 'Building...',
                lint: 'Linting...',
                files: 'Processing files...',
              };

              get().updateAgentProgress(agentId, {
                type: progressType,
                current,
                total,
                label: labels[progressType] || 'Processing...',
                startedAt: agent.taskProgress?.startedAt || Date.now(),
              });

              // Clear progress when complete
              if (current >= total) {
                setTimeout(() => {
                  // Check if agent still exists before clearing
                  const agent = get().agents.get(agentId);
                  if (agent) {
                    get().updateAgentProgress(agentId, undefined);
                  }
                }, 2000);
              }
              return;
            }
          }
        }
      }
    },

    detectResourceUsageFromOutput: (agentId, output) => {
      // Check for context token usage
      for (const pattern of PROGRESS_PATTERNS.context) {
        const match = output.match(pattern);
        if (match) {
          const current = parseInt(match[1].replace(/,/g, ''), 10);
          const limit = parseInt(match[2].replace(/,/g, ''), 10);
          if (!isNaN(current) && !isNaN(limit) && limit > 0) {
            get().updateAgentContext(agentId, current, limit);
            return;
          }
        }
      }

      // Check for API usage percentage
      for (const pattern of PROGRESS_PATTERNS.usage) {
        const match = output.match(pattern);
        if (match) {
          let percent: number;
          if (match[2]) {
            // $current/$total format
            const current = parseFloat(match[1]);
            const total = parseFloat(match[2]);
            percent = total > 0 ? ((total - current) / total) * 100 : 100;
          } else {
            // Direct percentage
            percent = 100 - parseInt(match[1], 10); // Invert: usage shown vs remaining
          }
          if (!isNaN(percent)) {
            get().updateAgentUsage(agentId, Math.max(0, Math.min(100, percent)));
            return;
          }
        }
      }
    },

    // Idle timeout checking - called periodically
    checkIdleTimeouts: () => {
      const now = Date.now();
      const agents = get().agents;

      agents.forEach((agent, agentId) => {
        // Skip if already needs attention or not idle
        if (agent.needsAttention) return;
        if (agent.status !== 'idle') return;
        if (agent.activity !== 'idle') return;

        // Check if idle for too long
        const idleTime = agent.idleSince ? now - agent.idleSince : 0;
        if (idleTime > IDLE_TIMEOUT_MS) {
          get().setAgentNeedsAttention(agentId, true, 'idle_timeout');
          toast.warning(
            'Agent Idle',
            `${agent.name} has been idle for over a minute`
          );
        }
      });
    },

    // Quest System Actions
    startQuest: (agentId, description) => {
      set((state) => {
        const agent = state.agents.get(agentId);
        if (!agent) return state;

        const quest: Quest = {
          id: uuidv4(),
          description,
          startedAt: Date.now(),
          status: 'in_progress',
          producedFiles: [],
        };

        const newAgents = new Map(state.agents);
        newAgents.set(agentId, {
          ...agent,
          currentQuest: quest,
          status: 'working',
          activity: 'thinking',
          activityStartedAt: Date.now(),
          activityDetails: description.slice(0, 50),
          needsAttention: false,
          producedFiles: [], // Reset for new quest
        });
        return { agents: newAgents };
      });
    },

    completeQuest: (agentId, notes) => {
      const agent = get().agents.get(agentId);
      if (!agent || !agent.currentQuest) return;

      set((state) => {
        const stateAgent = state.agents.get(agentId);
        if (!stateAgent || !stateAgent.currentQuest) return state;

        const completedQuest: Quest = {
          ...stateAgent.currentQuest,
          status: 'pending_review',
          completedAt: Date.now(),
          agentNotes: notes,
          producedFiles: [...stateAgent.producedFiles], // Copy files produced during quest
        };

        const newAgents = new Map(state.agents);
        newAgents.set(agentId, {
          ...stateAgent,
          currentQuest: completedQuest,
          status: 'completed',
          activity: 'idle',
          activityDetails: 'Quest complete - awaiting review',
          needsAttention: true,
          attentionReason: 'task_complete',
          attentionSince: Date.now(),
        });
        return { agents: newAgents };
      });

      // Show toast notification
      const desc = agent.currentQuest.description;
      const truncatedDesc = desc.length > 50 ? `${desc.slice(0, 50)}...` : desc;
      toast.quest(`Quest Complete!`, `${agent.name} has completed: "${truncatedDesc}"`);
    },

    approveQuest: (agentId) => {
      const agentBefore = get().agents.get(agentId);
      if (!agentBefore || !agentBefore.currentQuest) return;

      const oldLevel = agentBefore.level;
      const newExperience = agentBefore.experience + 1;
      const newLevel = Math.floor(newExperience / 5) + 1;

      set((state) => {
        const agent = state.agents.get(agentId);
        if (!agent || !agent.currentQuest) return state;

        const approvedQuest: Quest = {
          ...agent.currentQuest,
          status: 'approved',
        };

        const newAgents = new Map(state.agents);
        newAgents.set(agentId, {
          ...agent,
          currentQuest: undefined,
          completedQuests: [...agent.completedQuests, approvedQuest],
          status: 'idle',
          activity: 'idle',
          activityDetails: 'Ready for commands',
          needsAttention: false,
          attentionReason: undefined,
          experience: newExperience,
          level: newLevel,
          talents: {
            ...agent.talents,
            points: agent.talents.points + 1, // Award talent point on quest completion
          },
          producedFiles: [], // Clear for next quest
        });
        return { agents: newAgents };
      });

      // Add terminal output
      get().addTerminalOutput(agentId, `✓ Quest approved! ${agentBefore.name} gains experience.`);

      // Show toast notifications
      toast.success('Quest Approved!', `${agentBefore.name} earned +1 talent point`);

      // Check for level up
      if (newLevel > oldLevel) {
        toast.achievement(
          `Level Up!`,
          `${agentBefore.name} reached Level ${newLevel}!`
        );
      }
    },

    rejectQuest: (agentId, feedback) => {
      const agentBefore = get().agents.get(agentId);
      if (!agentBefore || !agentBefore.currentQuest) return;

      set((state) => {
        const agent = state.agents.get(agentId);
        if (!agent || !agent.currentQuest) return state;

        const rejectedQuest: Quest = {
          ...agent.currentQuest,
          status: 'rejected',
        };

        const newAgents = new Map(state.agents);
        newAgents.set(agentId, {
          ...agent,
          currentQuest: rejectedQuest,
          status: 'working',
          activity: 'thinking',
          activityDetails: 'Revising work...',
          needsAttention: false,
          attentionReason: undefined,
        });
        return { agents: newAgents };
      });

      // Send feedback to agent
      get().addTerminalOutput(agentId, `⟳ Revision requested: ${feedback}`);
      // Send the feedback through the agent bridge
      agentBridge.sendInput(agentId, feedback);

      // Show toast notification
      toast.warning('Revision Requested', `${agentBefore.name} is revising their work`);
    },

    detectQuestCompletion: (agentId, output) => {
      const agent = get().agents.get(agentId);
      if (!agent || !agent.currentQuest || agent.currentQuest.status !== 'in_progress') return;

      // Patterns that indicate completion
      const completionPatterns = [
        /\bdone\b/i,
        /\bcompleted?\b/i,
        /\bfinished\b/i,
        /ready for review/i,
        /task complete/i,
        /successfully/i,
        /all tests pass/i,
        /build succeeded/i,
        /✓.*complete/i,
        /I've (completed|finished|done)/i,
        /changes have been (made|applied|committed)/i,
      ];

      for (const pattern of completionPatterns) {
        if (pattern.test(output)) {
          // Extract potential notes from the output
          const notes = output.slice(0, 200);
          get().completeQuest(agentId, notes);
          return;
        }
      }
    },

    detectFileArtifacts: (agentId, output) => {
      const agent = get().agents.get(agentId);
      if (!agent) return;

      // Patterns to detect file operations
      const filePatterns = [
        { pattern: /(?:Created|Writing|Wrote to|New file):?\s*[`'"]?([^\s`'"]+\.[a-z]+)/gi, type: 'created' as const },
        { pattern: /(?:Modified|Updated|Edited|Edit\(|Changed):?\s*[`'"]?([^\s`'"]+\.[a-z]+)/gi, type: 'modified' as const },
        { pattern: /(?:Deleted|Removed|Delete\():?\s*[`'"]?([^\s`'"]+\.[a-z]+)/gi, type: 'deleted' as const },
        { pattern: /Write\([`'"]([^`'"]+)[`'"]/g, type: 'created' as const },
        { pattern: /Edit\([`'"]([^`'"]+)[`'"]/g, type: 'modified' as const },
      ];

      for (const { pattern, type } of filePatterns) {
        let match;
        while ((match = pattern.exec(output)) !== null) {
          const filePath = match[1];
          // Avoid duplicates
          const alreadyTracked = agent.producedFiles.some(f => f.path === filePath && f.type === type);
          if (!alreadyTracked && filePath.includes('.')) {
            get().addProducedFile(agentId, {
              path: filePath,
              type,
              timestamp: Date.now(),
            });
          }
        }
      }
    },

    getAgentsWithPendingQuests: () => {
      const agents = get().agents;
      return Array.from(agents.values()).filter(
        (a) => a.currentQuest?.status === 'pending_review'
      );
    },

    // Talent System Actions
    allocateTalent: (agentId, talentId) => {
      const agent = get().agents.get(agentId);
      if (!agent) return false;

      // Check if we can learn this talent
      const { canLearn } = canLearnTalent(agent.class, talentId, agent.talents.allocated, agent.talents.points, agent.level);
      if (!canLearn) {
        return false;
      }

      set((state) => {
        const currentAgent = state.agents.get(agentId);
        if (!currentAgent) return state;

        const newAgents = new Map(state.agents);
        const currentRanks = currentAgent.talents.allocated[talentId] || 0;

        newAgents.set(agentId, {
          ...currentAgent,
          talents: {
            points: currentAgent.talents.points - 1,
            allocated: {
              ...currentAgent.talents.allocated,
              [talentId]: currentRanks + 1,
            },
          },
        });
        return { agents: newAgents };
      });

      // Add feedback
      get().addTerminalOutput(agentId, `✨ New talent unlocked!`);
      return true;
    },

    resetTalents: (agentId) => {
      set((state) => {
        const agent = state.agents.get(agentId);
        if (!agent) return state;

        // Calculate total points spent
        const spentPoints = Object.values(agent.talents.allocated).reduce((sum, ranks) => sum + ranks, 0);

        const newAgents = new Map(state.agents);
        newAgents.set(agentId, {
          ...agent,
          talents: {
            points: agent.talents.points + spentPoints,
            allocated: {},
          },
        });
        return { agents: newAgents };
      });

      get().addTerminalOutput(agentId, `⟳ Talents reset. All points refunded.`);
    },

    awardTalentPoint: (agentId) => {
      set((state) => {
        const agent = state.agents.get(agentId);
        if (!agent) return state;

        const newAgents = new Map(state.agents);
        newAgents.set(agentId, {
          ...agent,
          talents: {
            ...agent.talents,
            points: agent.talents.points + 1,
          },
        });
        return { agents: newAgents };
      });

      get().addTerminalOutput(agentId, `🌟 Talent point earned!`);
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

    // Project Zones
    createProjectZone: (name, color, hexes) => {
      const id = uuidv4();
      const zone: ProjectZone = { id, name, color, hexes };

      set((state) => {
        const newZones = new Map(state.projectZones);
        newZones.set(id, zone);
        return { projectZones: newZones };
      });

      toast.info('Zone Created', `Project zone "${name}" has been created`);
      return zone;
    },

    removeProjectZone: (zoneId) => {
      set((state) => {
        const newZones = new Map(state.projectZones);
        newZones.delete(zoneId);
        return { projectZones: newZones };
      });
    },

    updateProjectZone: (zoneId, updates) => {
      set((state) => {
        const zone = state.projectZones.get(zoneId);
        if (!zone) return state;

        const newZones = new Map(state.projectZones);
        newZones.set(zoneId, { ...zone, ...updates });
        return { projectZones: newZones };
      });
    },

    getZoneForHex: (q, r) => {
      const zones = get().projectZones;
      for (const zone of zones.values()) {
        if (zone.hexes.some(h => h.q === q && h.r === r)) {
          return zone;
        }
      }
      return undefined;
    },

    // Session Persistence
    saveSession: () => {
      try {
        const state = get();

        // Serialize agents (convert Map to array)
        const agentsArray = Array.from(state.agents.entries()).map(([id, agent]) => ({
          id,
          name: agent.name,
          provider: agent.provider,
          class: agent.class,
          position: agent.position,
          level: agent.level,
          experience: agent.experience,
          talents: agent.talents,
          completedQuests: agent.completedQuests,
          controlGroup: agent.controlGroup,
        }));

        // Serialize project zones
        const zonesArray = Array.from(state.projectZones.entries());

        // Serialize control groups
        const controlGroupsArray = Array.from(state.controlGroups.entries()).map(
          ([num, ids]) => [num, Array.from(ids)]
        );

        const session = {
          version: 1,
          timestamp: Date.now(),
          agents: agentsArray,
          projectZones: zonesArray,
          controlGroups: controlGroupsArray,
          camera: state.camera,
          resources: state.resources,
        };

        localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
        toast.success('Session Saved', 'Your agent layout has been saved');
        return true;
      } catch (error) {
        console.error('Failed to save session:', error);
        toast.error('Save Failed', 'Could not save session');
        return false;
      }
    },

    loadSession: () => {
      try {
        const saved = localStorage.getItem(SESSION_STORAGE_KEY);
        if (!saved) return false;

        const session = JSON.parse(saved);
        if (session.version !== 1) return false;

        // Restore project zones
        const zones = new Map<string, ProjectZone>(session.projectZones || []);

        // Restore control groups
        const controlGroups = new Map<number, Set<string>>(
          (session.controlGroups || []).map(([num, ids]: [number, string[]]) => [num, new Set(ids)])
        );

        set({
          projectZones: zones,
          controlGroups,
          camera: session.camera || get().camera,
        });

        // Note: Agents need to be re-spawned via the backend
        // We return the saved agent data for the caller to handle
        toast.info('Session Loaded', `Found ${session.agents?.length || 0} saved agents`);

        return session.agents || [];
      } catch (error) {
        console.error('Failed to load session:', error);
        return false;
      }
    },

    clearSession: () => {
      localStorage.removeItem(SESSION_STORAGE_KEY);
      toast.info('Session Cleared', 'Saved session data has been removed');
    },

    restoreAgents: (savedAgents: SavedAgentData[]) => {
      if (!savedAgents || savedAgents.length === 0) return;

      savedAgents.forEach(saved => {
        const hexGrid = get().hexGrid;

        // Check if position is available
        const hexKey = `${saved.position.q},${saved.position.r}`;
        const hex = hexGrid.get(hexKey);
        if (hex?.occupied) {
          // Find a nearby unoccupied hex
          const neighbors = [
            { q: saved.position.q + 1, r: saved.position.r },
            { q: saved.position.q - 1, r: saved.position.r },
            { q: saved.position.q, r: saved.position.r + 1 },
            { q: saved.position.q, r: saved.position.r - 1 },
          ];
          for (const n of neighbors) {
            const nHex = hexGrid.get(`${n.q},${n.r}`);
            if (nHex && !nHex.occupied && nHex.type !== 'water' && nHex.type !== 'portal') {
              saved.position = { ...saved.position, q: n.q, r: n.r };
              break;
            }
          }
        }

        // Create the agent with saved data
        const newAgent: Agent = {
          id: saved.id,
          name: saved.name,
          provider: saved.provider,
          class: saved.class,
          status: 'idle',
          position: saved.position,
          health: 100,
          mana: 100,
          experience: saved.experience,
          level: saved.level,
          taskQueue: [],
          terminalOutput: ['[Session restored]'],
          createdAt: new Date(),
          lastActiveAt: new Date(),
          controlGroup: saved.controlGroup,
          activity: 'idle',
          activityStartedAt: Date.now(),
          needsAttention: false,
          contextTokens: 0,
          contextLimit: 200000,
          usagePercent: 0,
          completedQuests: saved.completedQuests || [],
          producedFiles: [],
          talents: saved.talents || { points: 0, allocated: {} },
        };

        set(state => {
          const newAgents = new Map(state.agents);
          newAgents.set(newAgent.id, newAgent);

          // Update hex grid
          const newHexGrid = new Map(state.hexGrid);
          const targetHex = newHexGrid.get(`${newAgent.position.q},${newAgent.position.r}`);
          if (targetHex) {
            newHexGrid.set(`${newAgent.position.q},${newAgent.position.r}`, {
              ...targetHex,
              occupied: true,
              occupiedBy: newAgent.id,
            });
          }

          return { agents: newAgents, hexGrid: newHexGrid };
        });
      });

      toast.success('Agents Restored', `${savedAgents.length} agent(s) restored from session`);
    },

    // Computed helpers
    getAgentsNeedingAttention: () => {
      const agents = get().agents;
      return Array.from(agents.values()).filter(a => a.needsAttention);
    },
  }))
);
