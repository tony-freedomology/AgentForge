// Agent Types for the RTS Command Interface

export type AgentProvider = 'claude' | 'codex';

export type AgentStatus =
  | 'idle'           // Ready for commands
  | 'working'        // Actively processing
  | 'blocked'        // Waiting for input/approval
  | 'error'          // Something went wrong
  | 'completed'      // Task finished
  | 'spawning';      // Being created

export type AgentClass =
  | 'mage'           // Claude - powerful, versatile
  | 'engineer'       // Codex - code specialist
  | 'scout'          // Fast exploration agent
  | 'guardian'       // Security/review specialist
  | 'architect';     // System design specialist

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
