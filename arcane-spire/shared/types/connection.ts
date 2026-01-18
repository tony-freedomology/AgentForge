// Connection status
export type ConnectionStatus =
  | 'disconnected'
  | 'connecting'
  | 'connected'
  | 'error'
  | 'reconnecting';

// Spire connection (to daemon on dev machine)
export interface SpireConnection {
  id: string;
  name: string;              // "Tony's MacBook"
  url: string;               // wss://xxx.tailscale.net or ws://localhost:3001
  status: ConnectionStatus;
  lastConnected?: Date;
  lastDisconnected?: Date;
  agentIds: string[];        // Agents running on this connection
  machineInfo?: MachineInfo;
}

// Info about the connected machine
export interface MachineInfo {
  hostname: string;
  platform: string;         // darwin, linux, win32
  username: string;
  workspaces: string[];     // Available working directories
}

// Connection code for pairing
export interface ConnectionCode {
  code: string;             // spire-xxxx-yyyy-zzzz
  expiresAt: Date;
  url: string;
}

// WebSocket message types
export type WSMessageType =
  // Connection
  | 'auth'
  | 'auth_success'
  | 'auth_error'
  | 'heartbeat'
  | 'heartbeat_ack'

  // Agent management
  | 'agent_list'
  | 'agent_spawn'
  | 'agent_spawned'
  | 'agent_update'
  | 'agent_kill'
  | 'agent_killed'

  // Agent interaction
  | 'agent_input'
  | 'agent_output'
  | 'agent_thought'
  | 'agent_status_change'
  | 'agent_activity_change'
  | 'agent_progress'
  | 'agent_question'
  | 'agent_answer'

  // Quest events
  | 'quest_started'
  | 'quest_progress'
  | 'quest_complete'
  | 'quest_accepted'
  | 'quest_revision'

  // Error
  | 'error';

// Base WebSocket message
export interface WSMessage<T = unknown> {
  type: WSMessageType;
  payload: T;
  timestamp: number;
  id?: string;
}

// Auth message payload
export interface AuthPayload {
  connectionCode?: string;
  token?: string;
}

// Agent spawn request
export interface AgentSpawnPayload {
  name: string;
  class: string;
  workingDirectory: string;
  initialTask?: string;
}

// Agent input (send command to agent)
export interface AgentInputPayload {
  agentId: string;
  input: string;
}

// Agent output (terminal output from agent)
export interface AgentOutputPayload {
  agentId: string;
  output: string;
  timestamp: number;
}

// Agent thought (chain of thought)
export interface AgentThoughtPayload {
  agentId: string;
  thought: string;
  type: 'thinking' | 'action' | 'result';
  timestamp: number;
}

// Agent status change
export interface AgentStatusPayload {
  agentId: string;
  status: string;
  activity?: string;
}

// Agent progress update
export interface AgentProgressPayload {
  agentId: string;
  current: number;
  total: number;
  label: string;
}

// Agent question (needs input)
export interface AgentQuestionPayload {
  agentId: string;
  question: string;
  quickReplies?: string[];
}

// Create typed WS message
export function createWSMessage<T>(type: WSMessageType, payload: T): WSMessage<T> {
  return {
    type,
    payload,
    timestamp: Date.now(),
    id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
  };
}
