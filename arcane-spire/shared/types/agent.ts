// Agent Classes - each maps to a specific AI provider
export type AgentClass =
  | 'mage'       // Claude - General coding, complex reasoning
  | 'architect'  // Claude Opus - System design, architecture
  | 'engineer'   // OpenAI Codex - Implementation, building
  | 'scout'      // Claude - Research, exploration, discovery
  | 'guardian'   // Codex - Code review, security, testing
  | 'artisan';   // Gemini - UI/UX, design, visual work

// AI Provider mapping
export type AgentProvider =
  | 'claude'
  | 'claude-opus'
  | 'openai'
  | 'codex'
  | 'gemini';

// Agent operational states
export type AgentStatus =
  | 'spawning'    // Being created, portal animation
  | 'channeling'  // Actively working
  | 'dormant'     // Idle, not working
  | 'awaiting'    // Waiting for user input
  | 'complete'    // Task finished successfully
  | 'error';      // Something went wrong

// What the agent is currently doing
export type AgentActivity =
  | 'idle'
  | 'thinking'
  | 'researching'
  | 'reading'
  | 'writing'
  | 'testing'
  | 'building'
  | 'git'
  | 'waiting'
  | 'error';

// Agent class to provider mapping
export const CLASS_PROVIDER_MAP: Record<AgentClass, AgentProvider> = {
  mage: 'claude',
  architect: 'claude-opus',
  engineer: 'codex',
  scout: 'claude',
  guardian: 'codex',
  artisan: 'gemini',
};

// Agent class metadata
export interface AgentClassInfo {
  id: AgentClass;
  name: string;
  provider: AgentProvider;
  color: string;
  icon: string; // emoji fallback
  description: string;
  strengths: string[];
}

export const AGENT_CLASSES: Record<AgentClass, AgentClassInfo> = {
  mage: {
    id: 'mage',
    name: 'Mage',
    provider: 'claude',
    color: '#8B5CF6', // Arcane Purple
    icon: '🧙‍♂️',
    description: 'Master of arcane code arts. Excels at complex reasoning, refactoring, and solving difficult bugs with elegance.',
    strengths: ['Complex problem solving', 'Architecture decisions', 'Code refactoring'],
  },
  architect: {
    id: 'architect',
    name: 'Architect',
    provider: 'claude-opus',
    color: '#6D28D9', // Royal Purple
    icon: '📐',
    description: 'Grand designer of systems. Plans large-scale architectures and ensures structural integrity of the codebase.',
    strengths: ['System design', 'Database schemas', 'API architecture'],
  },
  engineer: {
    id: 'engineer',
    name: 'Engineer',
    provider: 'codex',
    color: '#22C55E', // Fel Green
    icon: '⚗️',
    description: 'Builder of mechanical wonders. Rapid implementation and practical problem-solving.',
    strengths: ['Fast implementation', 'Building features', 'Docker & DevOps'],
  },
  scout: {
    id: 'scout',
    name: 'Scout',
    provider: 'claude',
    color: '#14B8A6', // Teal
    icon: '🔍',
    description: 'Explorer of unknown codebases. Researches, discovers patterns, and maps the terrain.',
    strengths: ['Code exploration', 'Research tasks', 'Documentation'],
  },
  guardian: {
    id: 'guardian',
    name: 'Guardian',
    provider: 'codex',
    color: '#3B82F6', // Frost Blue
    icon: '🛡️',
    description: 'Protector of code quality. Reviews changes, guards against bugs, and fortifies security.',
    strengths: ['Code review', 'Security audits', 'Testing'],
  },
  artisan: {
    id: 'artisan',
    name: 'Artisan',
    provider: 'gemini',
    color: '#06B6D4', // Cyan
    icon: '🎨',
    description: 'Crafter of beautiful interfaces. Creates stunning UI/UX and visual experiences.',
    strengths: ['UI/UX design', 'Visual polish', 'Frontend work'],
  },
};

// Thought from chain-of-thought output
export interface AgentThought {
  id: string;
  content: string;
  timestamp: Date;
  type: 'thinking' | 'action' | 'result' | 'tool';
}

// File change tracking for agent work session
export interface FileChange {
  path: string;
  action: 'created' | 'modified' | 'deleted';
  linesChanged?: number;
}

// Core Agent interface
export interface Agent {
  id: string;
  name: string;
  class: AgentClass;
  provider: AgentProvider;
  status: AgentStatus;
  activity: AgentActivity;

  // Level/XP system
  level: number;
  xp: number;
  xpToNextLevel: number;
  talentPoints: number;

  // Resource tracking
  contextUsed: number;      // 0-100 percentage
  contextTotal: number;     // Max context window
  tokensUsed: number;

  // Current work
  currentTask?: string;
  workingDirectory?: string;
  branch?: string;

  // Progress tracking
  progressCurrent?: number;  // e.g., 3 (tests passing)
  progressTotal?: number;    // e.g., 10 (total tests)
  progressLabel?: string;    // e.g., "tests"

  // Chain of thought
  thoughts: AgentThought[];
  lastThought?: string;

  // Terminal output
  outputBuffer: string[];

  // Timing
  idleSince?: Date;
  lastActivity?: Date;
  createdAt: Date;

  // Question pending (awaiting state)
  pendingQuestion?: string;
  quickReplies?: string[];

  // Realm/Project grouping
  realm?: string;

  // Favorited/pinned
  isFavorite: boolean;

  // Files changed during current work session
  filesChanged?: FileChange[];
}

// Create a new agent with defaults
export function createAgent(
  name: string,
  agentClass: AgentClass,
  workingDirectory?: string,
  initialTask?: string
): Agent {
  const classInfo = AGENT_CLASSES[agentClass];

  return {
    id: `agent-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    name,
    class: agentClass,
    provider: classInfo.provider,
    status: 'spawning',
    activity: 'idle',
    level: 1,
    xp: 0,
    xpToNextLevel: xpForLevel(1),
    talentPoints: 0,
    contextUsed: 0,
    contextTotal: 100,
    tokensUsed: 0,
    currentTask: initialTask,
    workingDirectory,
    thoughts: [],
    outputBuffer: [],
    createdAt: new Date(),
    isFavorite: false,
  };
}

// XP required per level (kept in sync with the daemon)
export const XP_PER_LEVEL = 500;

// Calculate XP needed for a given level
export function xpForLevel(_level: number): number {
  return XP_PER_LEVEL;
}

// Add XP to agent and handle level ups
export function addXpToAgent(agent: Agent, amount: number): { agent: Agent; leveledUp: boolean; levelsGained: number } {
  let newXp = agent.xp + amount;
  let newLevel = agent.level;
  let newTalentPoints = agent.talentPoints;
  let levelsGained = 0;
  let xpToNext = agent.xpToNextLevel;

  while (newXp >= xpToNext) {
    newXp -= xpToNext;
    newLevel++;
    newTalentPoints++;
    levelsGained++;
    xpToNext = xpForLevel(newLevel);
  }

  return {
    agent: {
      ...agent,
      xp: newXp,
      level: newLevel,
      xpToNextLevel: xpToNext,
      talentPoints: newTalentPoints,
    },
    leveledUp: levelsGained > 0,
    levelsGained,
  };
}
