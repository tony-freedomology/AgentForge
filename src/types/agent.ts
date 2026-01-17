// Agent Types for the RTS Command Interface

export type AgentProvider = 'claude' | 'codex' | 'gemini';

export type AgentStatus =
  | 'idle'           // Ready for commands
  | 'working'        // Actively processing
  | 'waiting'        // Waiting for user input (NEEDS ATTENTION)
  | 'blocked'        // Waiting for external resource
  | 'error'          // Something went wrong
  | 'completed'      // Task finished (quest ready)
  | 'spawning';      // Being created

// What the agent is currently doing (detected from output)
export type AgentActivity =
  | 'idle'           // Not doing anything
  | 'thinking'       // Processing, no specific action
  | 'researching'    // Web search, reading docs
  | 'reading'        // Reading files
  | 'writing'        // Writing/editing code
  | 'testing'        // Running tests
  | 'building'       // Compiling, bundling
  | 'git'            // Git operations
  | 'waiting'        // Waiting for user input
  | 'error';         // Something went wrong

// Why the agent needs attention
export type AttentionReason =
  | 'waiting_input'  // Asked a question or needs confirmation
  | 'error'          // Something went wrong
  | 'idle_timeout'   // Been idle too long
  | 'task_complete'; // Finished work, ready for review

// Quest/task completion status
export type QuestStatus =
  | 'none'           // No active quest
  | 'in_progress'    // Working on it
  | 'pending_review' // Done, awaiting user review
  | 'approved'       // User accepted
  | 'rejected';      // User sent back for revision

export type AgentClass =
  | 'mage'           // Claude - powerful, versatile
  | 'engineer'       // Codex - code specialist
  | 'scout'          // Fast exploration agent
  | 'guardian'       // Security/review specialist
  | 'architect'      // System design specialist
  | 'designer';      // Artisan - UI/UX specialist

export interface AgentPosition {
  q: number;  // Hex coordinate
  r: number;  // Hex coordinate
  y: number;  // Height (for floating effects)
}

export interface AgentTask {
  id: string;
  prompt: string;
  status: 'queued' | 'active' | 'completed' | 'failed';
  startedAt?: Date;
  completedAt?: Date;
  output?: string;
  error?: string;
}

// File artifact produced by an agent
export interface FileArtifact {
  path: string;
  type: 'created' | 'modified' | 'deleted';
  timestamp: number;
  size?: number;
}

// Quest/task tracking
export interface Quest {
  id: string;
  description: string;
  startedAt: number;
  completedAt?: number;
  status: QuestStatus;
  producedFiles: FileArtifact[];
  agentNotes?: string;
}

export interface Agent {
  id: string;
  name: string;
  provider: AgentProvider;
  class: AgentClass;
  status: AgentStatus;
  position: AgentPosition;
  health: number;        // 0-100, represents session health/tokens remaining
  mana: number;          // 0-100, represents API budget remaining
  experience: number;    // Tasks completed
  level: number;         // Derived from experience
  currentTask?: AgentTask;
  taskQueue: AgentTask[];
  sessionId?: string;    // For resuming sessions
  terminalOutput: string[];
  createdAt: Date;
  lastActiveAt: Date;
  controlGroup?: number; // 1-9 for Ctrl+# selection

  // Activity tracking (Phase 1)
  activity: AgentActivity;
  activityStartedAt: number;
  activityDetails?: string;   // e.g., "Searching for auth patterns..."

  // Attention system (Phase 1)
  needsAttention: boolean;
  attentionReason?: AttentionReason;
  attentionSince?: number;    // Timestamp when attention was first needed

  // Resource tracking (Phase 1)
  contextTokens: number;      // Current context usage
  contextLimit: number;       // Max context for this model
  usagePercent: number;       // API usage 0-100

  // Quest system (Phase 3)
  currentQuest?: Quest;
  completedQuests: Quest[];

  // File artifacts (Phase 4)
  producedFiles: FileArtifact[];
}

export interface HexTile {
  q: number;
  r: number;
  type: 'grass' | 'stone' | 'water' | 'forest' | 'portal';
  elevation: number;
  occupied: boolean;
  occupiedBy?: string;  // Agent ID
  fogOfWar: boolean;
  revealed: boolean;
}

export interface Resource {
  name: string;
  current: number;
  max: number;
  icon: string;
  color: string;
}

export interface GameResources {
  tokens: Resource;      // API tokens
  gold: Resource;        // Budget ($)
  mana: Resource;        // Rate limit capacity
  souls: Resource;       // Active agent slots
}

export interface SelectionBox {
  start: { x: number; y: number } | null;
  end: { x: number; y: number } | null;
  isSelecting: boolean;
}

export interface CameraState {
  position: [number, number, number];
  target: [number, number, number];
  zoom: number;
}

// Command types for the command panel
export interface Command {
  id: string;
  name: string;
  icon: string;
  hotkey: string;
  description: string;
  cost?: {
    tokens?: number;
    gold?: number;
    mana?: number;
  };
  requiresSelection: boolean;
  action: string;
}

// WebSocket message types
export interface WSMessage {
  type: 'agent_update' | 'agent_output' | 'agent_spawn' | 'agent_death' | 'resource_update' | 'error';
  payload: unknown;
}

export interface AgentSpawnRequest {
  provider: AgentProvider;
  class: AgentClass;
  name: string;
  position: AgentPosition;
  initialTask?: string;
}

export interface AgentCommandRequest {
  agentId: string;
  command: string;
  prompt?: string;
}

// Activity detection patterns
export const ACTIVITY_PATTERNS: Record<AgentActivity, RegExp[]> = {
  researching: [/search/i, /fetching/i, /looking up/i, /researching/i, /web.*search/i],
  reading: [/reading/i, /analyzing/i, /examining/i, /Read\(/i, /file:/i, /scanning/i],
  writing: [/writing/i, /creating/i, /editing/i, /updating/i, /Write\(/i, /Edit\(/i],
  testing: [/test/i, /running tests/i, /pytest/i, /jest/i, /npm test/i, /vitest/i],
  building: [/build/i, /compile/i, /bundle/i, /webpack/i, /vite/i, /npm run/i],
  git: [/git/i, /commit/i, /push/i, /pull/i, /branch/i, /merge/i],
  waiting: [/\?$/m, /waiting/i, /input/i, /confirm/i, /y\/n/i, /proceed\?/i, /continue\?/i],
  error: [/error/i, /failed/i, /exception/i, /crash/i, /❌/],
  thinking: [/thinking/i, /processing/i, /analyzing/i],
  idle: [],
};

// Activity icons for display
export const ACTIVITY_ICONS: Record<AgentActivity, { icon: string; label: string; color: string }> = {
  idle: { icon: '💤', label: 'Idle', color: '#6b7280' },
  thinking: { icon: '🧠', label: 'Thinking', color: '#8b5cf6' },
  researching: { icon: '🔍', label: 'Researching', color: '#06b6d4' },
  reading: { icon: '📖', label: 'Reading', color: '#3b82f6' },
  writing: { icon: '✍️', label: 'Writing', color: '#10b981' },
  testing: { icon: '🧪', label: 'Testing', color: '#f59e0b' },
  building: { icon: '🔨', label: 'Building', color: '#ef4444' },
  git: { icon: '🌿', label: 'Git', color: '#22c55e' },
  waiting: { icon: '❓', label: 'Waiting', color: '#eab308' },
  error: { icon: '❌', label: 'Error', color: '#ef4444' },
};

// File type icons
export const FILE_TYPE_ICONS: Record<string, { icon: string; name: string }> = {
  '.ts': { icon: '📜', name: 'Spell Scroll' },
  '.tsx': { icon: '⚡', name: 'Enchanted Scroll' },
  '.js': { icon: '📜', name: 'Spell Scroll' },
  '.jsx': { icon: '⚡', name: 'Enchanted Scroll' },
  '.css': { icon: '🎨', name: 'Glamour Rune' },
  '.scss': { icon: '🎨', name: 'Glamour Rune' },
  '.json': { icon: '📋', name: 'Data Tablet' },
  '.md': { icon: '📖', name: 'Tome Page' },
  '.pdf': { icon: '📕', name: 'Bound Tome' },
  '.png': { icon: '🖼️', name: 'Vision Crystal' },
  '.jpg': { icon: '🖼️', name: 'Vision Crystal' },
  '.svg': { icon: '✨', name: 'Arcane Sigil' },
  '.zip': { icon: '📦', name: 'Treasure Chest' },
  '.test.ts': { icon: '🧪', name: "Alchemist's Notes" },
  '.spec.ts': { icon: '🧪', name: "Alchemist's Notes" },
};
