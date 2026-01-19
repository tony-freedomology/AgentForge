import { io, Socket } from 'socket.io-client';
import {
  WSMessage,
  WSMessageType,
  AuthPayload,
  AgentSpawnPayload,
  AgentInputPayload,
  AgentOutputPayload,
  AgentThoughtPayload,
  AgentStatusPayload,
  AgentProgressPayload,
  AgentQuestionPayload,
  createWSMessage,
  ConnectionStatus,
} from '../shared/types/connection';
import { Agent } from '../shared/types/agent';

// Event callback types
type ConnectionCallback = (status: ConnectionStatus, error?: string) => void;
type AgentListCallback = (agents: Agent[]) => void;
type AgentUpdateCallback = (agentId: string, updates: Partial<Agent>) => void;
type AgentOutputCallback = (payload: AgentOutputPayload) => void;
type AgentThoughtCallback = (payload: AgentThoughtPayload) => void;
type AgentStatusCallback = (payload: AgentStatusPayload) => void;
type AgentProgressCallback = (payload: AgentProgressPayload) => void;
type AgentQuestionCallback = (payload: AgentQuestionPayload) => void;
type AgentSpawnedCallback = (agent: Agent) => void;
type AgentKilledCallback = (agentId: string) => void;
type ErrorCallback = (error: string) => void;
type QuestPayload = {
  id: string;
  agentId: string;
  title: string;
  description?: string;
  status?: string;
  artifacts?: unknown[];
  xpReward?: number;
  startedAt?: string | number | Date;
  completedAt?: string | number | Date;
  reviewedAt?: string | number | Date;
  agentName?: string;
  agentClass?: string;
  priority?: string;
  completionSummary?: string;
  revisionNotes?: string;
};
type QuestStartedCallback = (quest: QuestPayload) => void;
type QuestCompleteCallback = (quest: QuestPayload) => void;
type QuestAcceptedCallback = (quest: QuestPayload) => void;
type QuestRevisionCallback = (payload: { quest: QuestPayload; note?: string }) => void;

interface SpireConnectionOptions {
  url: string;
  token?: string;
  connectionCode?: string;
  reconnectionAttempts?: number;
  reconnectionDelay?: number;
}

class SpireConnectionService {
  private socket: Socket | null = null;
  private options: SpireConnectionOptions | null = null;
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private reconnectAttempts = 0;

  // Callbacks
  private onConnectionChange: ConnectionCallback | null = null;
  private onAgentList: AgentListCallback | null = null;
  private onAgentUpdate: AgentUpdateCallback | null = null;
  private onAgentOutput: AgentOutputCallback | null = null;
  private onAgentThought: AgentThoughtCallback | null = null;
  private onAgentStatus: AgentStatusCallback | null = null;
  private onAgentProgress: AgentProgressCallback | null = null;
  private onAgentQuestion: AgentQuestionCallback | null = null;
  private onAgentSpawned: AgentSpawnedCallback | null = null;
  private onAgentKilled: AgentKilledCallback | null = null;
  private onError: ErrorCallback | null = null;
  private onQuestStarted: QuestStartedCallback | null = null;
  private onQuestComplete: QuestCompleteCallback | null = null;
  private onQuestAccepted: QuestAcceptedCallback | null = null;
  private onQuestRevision: QuestRevisionCallback | null = null;

  // Connect to daemon
  connect(options: SpireConnectionOptions): void {
    this.options = options;
    this.reconnectAttempts = 0;

    this.notifyConnectionChange('connecting');

    this.socket = io(options.url, {
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: options.reconnectionAttempts ?? 10,
      reconnectionDelay: options.reconnectionDelay ?? 1000,
      timeout: 10000,
    });

    this.setupSocketListeners();
  }

  // Disconnect from daemon
  disconnect(): void {
    this.stopHeartbeat();

    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }

    this.notifyConnectionChange('disconnected');
  }

  // Check if connected
  isConnected(): boolean {
    return this.socket?.connected ?? false;
  }

  // Register callbacks
  setCallbacks(callbacks: {
    onConnectionChange?: ConnectionCallback;
    onAgentList?: AgentListCallback;
    onAgentUpdate?: AgentUpdateCallback;
    onAgentOutput?: AgentOutputCallback;
    onAgentThought?: AgentThoughtCallback;
    onAgentStatus?: AgentStatusCallback;
    onAgentProgress?: AgentProgressCallback;
    onAgentQuestion?: AgentQuestionCallback;
    onAgentSpawned?: AgentSpawnedCallback;
    onAgentKilled?: AgentKilledCallback;
    onError?: ErrorCallback;
    onQuestStarted?: QuestStartedCallback;
    onQuestComplete?: QuestCompleteCallback;
    onQuestAccepted?: QuestAcceptedCallback;
    onQuestRevision?: QuestRevisionCallback;
  }): void {
    this.onConnectionChange = callbacks.onConnectionChange ?? null;
    this.onAgentList = callbacks.onAgentList ?? null;
    this.onAgentUpdate = callbacks.onAgentUpdate ?? null;
    this.onAgentOutput = callbacks.onAgentOutput ?? null;
    this.onAgentThought = callbacks.onAgentThought ?? null;
    this.onAgentStatus = callbacks.onAgentStatus ?? null;
    this.onAgentProgress = callbacks.onAgentProgress ?? null;
    this.onAgentQuestion = callbacks.onAgentQuestion ?? null;
    this.onAgentSpawned = callbacks.onAgentSpawned ?? null;
    this.onAgentKilled = callbacks.onAgentKilled ?? null;
    this.onError = callbacks.onError ?? null;
    this.onQuestStarted = callbacks.onQuestStarted ?? null;
    this.onQuestComplete = callbacks.onQuestComplete ?? null;
    this.onQuestAccepted = callbacks.onQuestAccepted ?? null;
    this.onQuestRevision = callbacks.onQuestRevision ?? null;
  }

  // Send messages
  sendInput(agentId: string, input: string): void {
    this.send('agent_input', { agentId, input } as AgentInputPayload);
  }

  spawnAgent(payload: AgentSpawnPayload): void {
    this.send('agent_spawn', payload);
  }

  killAgent(agentId: string): void {
    this.send('agent_kill', { agentId });
  }

  answerQuestion(agentId: string, answer: string): void {
    this.send('agent_answer', { agentId, answer });
  }

  requestAgentList(): void {
    this.send('agent_list', {});
  }

  reviewQuest(questId: string, action: 'accept' | 'reject' | 'revise', note?: string): void {
    this.send('quest_review', { questId, action, note });
  }

  // Private methods
  private setupSocketListeners(): void {
    if (!this.socket) return;

    // Connection events
    this.socket.on('connect', () => {
      this.reconnectAttempts = 0;
      this.authenticate();
    });

    this.socket.on('disconnect', (reason) => {
      this.stopHeartbeat();
      if (reason === 'io server disconnect') {
        // Server initiated disconnect
        this.notifyConnectionChange('disconnected');
      } else {
        // Connection lost, will attempt reconnect
        this.notifyConnectionChange('reconnecting');
      }
    });

    this.socket.on('connect_error', (error) => {
      this.reconnectAttempts++;
      const maxAttempts = this.options?.reconnectionAttempts ?? 10;

      if (this.reconnectAttempts >= maxAttempts) {
        this.notifyConnectionChange('error', `Connection failed: ${error.message}`);
      } else {
        this.notifyConnectionChange('reconnecting');
      }
    });

    // Message handlers
    this.socket.on('message', (message: WSMessage) => {
      this.handleMessage(message);
    });

    // Direct event handlers (alternative to message wrapper)
    this.socket.on('auth_success', () => {
      this.notifyConnectionChange('connected');
      this.startHeartbeat();
      this.requestAgentList();
    });

    this.socket.on('auth_error', (error: string) => {
      this.notifyConnectionChange('error', `Authentication failed: ${error}`);
    });

    this.socket.on('agent_list', (agents: Agent[]) => {
      this.onAgentList?.(agents);
    });

    this.socket.on('agent_spawned', (agent: Agent) => {
      this.onAgentSpawned?.(agent);
    });

    this.socket.on('agent_update', (payload: { agentId: string; updates: Partial<Agent> }) => {
      this.onAgentUpdate?.(payload.agentId, payload.updates);
    });

    this.socket.on('agent_killed', (data: { agentId: string }) => {
      this.onAgentKilled?.(data.agentId);
    });

    this.socket.on('agent_output', (payload: AgentOutputPayload) => {
      this.onAgentOutput?.(payload);
    });

    this.socket.on('agent_thought', (payload: AgentThoughtPayload) => {
      this.onAgentThought?.(payload);
    });

    this.socket.on('agent_status_change', (payload: AgentStatusPayload) => {
      this.onAgentStatus?.(payload);
    });

    this.socket.on('agent_progress', (payload: AgentProgressPayload) => {
      this.onAgentProgress?.(payload);
    });

    this.socket.on('agent_question', (payload: AgentQuestionPayload) => {
      this.onAgentQuestion?.(payload);
    });

    this.socket.on('quest_started', (quest: QuestPayload) => {
      this.onQuestStarted?.(quest);
    });

    this.socket.on('quest_complete', (quest: QuestPayload) => {
      this.onQuestComplete?.(quest);
    });

    this.socket.on('quest_accepted', (quest: QuestPayload) => {
      this.onQuestAccepted?.(quest);
    });

    this.socket.on('quest_revision', (payload: { quest: QuestPayload; note?: string }) => {
      this.onQuestRevision?.(payload);
    });

    this.socket.on('error', (error: string) => {
      this.onError?.(error);
    });
  }

  private handleMessage(message: WSMessage): void {
    switch (message.type) {
      case 'auth_success':
        this.notifyConnectionChange('connected');
        this.startHeartbeat();
        this.requestAgentList();
        break;

      case 'auth_error':
        this.notifyConnectionChange('error', `Authentication failed: ${message.payload}`);
        break;

      case 'heartbeat_ack':
        // Heartbeat acknowledged, connection is healthy
        break;

      case 'agent_list':
        this.onAgentList?.(message.payload as Agent[]);
        break;

      case 'agent_spawned':
        this.onAgentSpawned?.(message.payload as Agent);
        break;

      case 'agent_killed':
        this.onAgentKilled?.((message.payload as { agentId: string }).agentId);
        break;

      case 'agent_update':
        const update = message.payload as { agentId: string; updates: Partial<Agent> };
        this.onAgentUpdate?.(update.agentId, update.updates);
        break;

      case 'agent_output':
        this.onAgentOutput?.(message.payload as AgentOutputPayload);
        break;

      case 'agent_thought':
        this.onAgentThought?.(message.payload as AgentThoughtPayload);
        break;

      case 'agent_status_change':
        this.onAgentStatus?.(message.payload as AgentStatusPayload);
        break;

      case 'agent_progress':
        this.onAgentProgress?.(message.payload as AgentProgressPayload);
        break;

      case 'agent_question':
        this.onAgentQuestion?.(message.payload as AgentQuestionPayload);
        break;

      case 'quest_started':
        this.onQuestStarted?.(message.payload as QuestPayload);
        break;

      case 'quest_complete':
        this.onQuestComplete?.(message.payload as QuestPayload);
        break;

      case 'quest_accepted':
        this.onQuestAccepted?.(message.payload as QuestPayload);
        break;

      case 'quest_revision':
        this.onQuestRevision?.(message.payload as { quest: QuestPayload; note?: string });
        break;

      case 'error':
        this.onError?.(message.payload as string);
        break;
    }
  }

  private authenticate(): void {
    if (!this.options) return;

    const payload: AuthPayload = {};
    if (this.options.token) {
      payload.token = this.options.token;
    }
    if (this.options.connectionCode) {
      payload.connectionCode = this.options.connectionCode;
    }

    this.send('auth', payload);
  }

  private send<T>(type: WSMessageType, payload: T): void {
    if (!this.socket?.connected) {
      console.warn('Cannot send message: not connected');
      return;
    }

    const message = createWSMessage(type, payload);
    this.socket.emit('message', message);

    // Also emit as direct event for compatibility
    this.socket.emit(type, payload);
  }

  private startHeartbeat(): void {
    this.stopHeartbeat();

    this.heartbeatInterval = setInterval(() => {
      this.send('heartbeat', { timestamp: Date.now() });
    }, 30000); // Every 30 seconds
  }

  private stopHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  private notifyConnectionChange(status: ConnectionStatus, error?: string): void {
    this.onConnectionChange?.(status, error);
  }
}

// Export singleton instance
export const spireConnection = new SpireConnectionService();

// Export class for testing
export { SpireConnectionService };
