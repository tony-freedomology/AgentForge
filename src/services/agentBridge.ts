/**
 * Agent Bridge Service
 *
 * Connects the frontend to the AgentForge backend server
 * via WebSocket for real Claude CLI process management.
 */

import { useGameStore } from '../stores/gameStore';
import type { AgentClass, AgentProvider } from '../types/agent';

const WS_URL = 'ws://localhost:3001';

// Terminal output parser - strips ANSI codes for clean display
function stripAnsi(str: string): string {
  return str.replace(/\x1B\[[0-9;]*[a-zA-Z]/g, '');
}

class AgentBridge {
  private static instance: AgentBridge;
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 2000;
  private messageQueue: object[] = [];
  private connected = false;

  private constructor() {}

  static getInstance(): AgentBridge {
    if (!AgentBridge.instance) {
      AgentBridge.instance = new AgentBridge();
    }
    return AgentBridge.instance;
  }

  // Connect to the backend server
  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        resolve();
        return;
      }

      console.log('[AgentBridge] Connecting to server...');
      this.ws = new WebSocket(WS_URL);

      this.ws.onopen = () => {
        console.log('[AgentBridge] Connected!');
        this.connected = true;
        this.reconnectAttempts = 0;

        // Send queued messages
        while (this.messageQueue.length > 0) {
          const msg = this.messageQueue.shift();
          if (msg) this.send(msg);
        }

        resolve();
      };

      this.ws.onclose = () => {
        console.log('[AgentBridge] Disconnected');
        this.connected = false;
        this.attemptReconnect();
      };

      this.ws.onerror = (error) => {
        console.error('[AgentBridge] WebSocket error:', error);
        if (!this.connected) {
          reject(new Error('Failed to connect to AgentForge server'));
        }
      };

      this.ws.onmessage = (event) => {
        this.handleMessage(JSON.parse(event.data));
      };
    });
  }

  private attemptReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('[AgentBridge] Max reconnection attempts reached');
      return;
    }

    this.reconnectAttempts++;
    console.log(`[AgentBridge] Reconnecting in ${this.reconnectDelay}ms (attempt ${this.reconnectAttempts})`);

    setTimeout(() => {
      this.connect().catch(() => {});
    }, this.reconnectDelay);
  }

  private send(message: object) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    } else {
      this.messageQueue.push(message);
    }
  }

  private handleMessage(msg: any) {
    const store = useGameStore.getState();

    switch (msg.type) {
      case 'init':
        console.log('[AgentBridge] Received init with', msg.agents.length, 'agents');
        // Sync existing agents from server
        msg.agents.forEach((agent: any) => {
          this.syncAgentToStore(agent);
        });
        break;

      case 'agent:spawned':
        console.log('[AgentBridge] Agent spawned:', msg.agent.name);
        this.syncAgentToStore(msg.agent);
        break;

      case 'agent:output':
        // Add terminal output to the agent
        const lines = msg.data.split('\n');
        lines.forEach((line: string) => {
          if (line.trim()) {
            store.addTerminalOutput(msg.agentId, stripAnsi(line));
          }
        });
        break;

      case 'agent:status':
        store.updateAgentStatus(msg.agentId, msg.status);
        break;

      case 'agent:exit':
        console.log('[AgentBridge] Agent exited:', msg.agentId);
        store.removeAgent(msg.agentId);
        break;

      case 'error':
        console.error('[AgentBridge] Server error:', msg.message);
        break;

      default:
        console.log('[AgentBridge] Unknown message:', msg.type);
    }
  }

  private syncAgentToStore(serverAgent: any) {
    const store = useGameStore.getState();
    const existingAgent = store.agents.get(serverAgent.id);

    if (!existingAgent) {
      // Find an empty hex position for the agent
      const position = this.findEmptyHexPosition(store);

      // Map working directory to agent class (just for visuals)
      const agentClass = this.inferAgentClass(serverAgent.name, serverAgent.workingDir);
      const provider = serverAgent.name.toLowerCase().includes('codex') ? 'codex' : 'claude';

      store.spawnAgent(
        provider as AgentProvider,
        agentClass,
        serverAgent.name,
        position
      );

      // Update with server-specific info
      const newAgent = store.agents.get(serverAgent.id);
      if (newAgent) {
        store.addTerminalOutput(serverAgent.id, `📁 Working directory: ${serverAgent.workingDir}`);
        if (serverAgent.gitBranch) {
          store.addTerminalOutput(serverAgent.id, `🌿 Branch: ${serverAgent.gitBranch}`);
        }
      }
    }
  }

  private findEmptyHexPosition(store: ReturnType<typeof useGameStore.getState>): { q: number; r: number; y: number } {
    // Find the first unoccupied grass hex
    for (const [, hex] of store.hexGrid) {
      if (!hex.occupied && hex.type === 'grass') {
        return { q: hex.q, r: hex.r, y: 0 };
      }
    }
    // Default fallback
    return { q: 0, r: 0, y: 0 };
  }

  private inferAgentClass(name: string, workingDir: string): AgentClass {
    const lower = (name + workingDir).toLowerCase();
    if (lower.includes('review') || lower.includes('codex')) return 'guardian';
    if (lower.includes('plan') || lower.includes('arch')) return 'architect';
    if (lower.includes('test') || lower.includes('scout')) return 'scout';
    if (lower.includes('build') || lower.includes('eng')) return 'engineer';
    return 'mage'; // Default to mage for Claude agents
  }

  // Public API

  /**
   * Spawn a new AI agent with the specified class
   */
  spawnAgent(
    id: string,
    name: string,
    classId: string,
    workingDir: string,
    initialPrompt?: string
  ) {
    this.send({
      type: 'agent:spawn',
      id,
      name,
      classId,
      workingDir,
      initialPrompt,
    });
  }

  /**
   * Send input/prompt to an agent
   */
  sendInput(agentId: string, input: string) {
    this.send({
      type: 'agent:input',
      agentId,
      input,
    });
  }

  /**
   * Kill an agent process
   */
  killAgent(agentId: string) {
    this.send({
      type: 'agent:kill',
      agentId,
    });
  }

  /**
   * Resize agent terminal
   */
  resizeAgent(agentId: string, cols: number, rows: number) {
    this.send({
      type: 'agent:resize',
      agentId,
      cols,
      rows,
    });
  }

  /**
   * Check if connected to server
   */
  isConnected(): boolean {
    return this.connected;
  }

  /**
   * Disconnect from server
   */
  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.connected = false;
  }
}

// Export singleton instance
export const agentBridge = AgentBridge.getInstance();

// React hook for using the bridge
export function useAgentBridge() {
  return {
    connect: () => agentBridge.connect(),
    disconnect: () => agentBridge.disconnect(),
    isConnected: () => agentBridge.isConnected(),
    spawnAgent: (id: string, name: string, classId: string, workingDir: string, initialPrompt?: string) =>
      agentBridge.spawnAgent(id, name, classId, workingDir, initialPrompt),
    sendInput: (agentId: string, input: string) =>
      agentBridge.sendInput(agentId, input),
    killAgent: (agentId: string) =>
      agentBridge.killAgent(agentId),
  };
}
