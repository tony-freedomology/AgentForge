/**
 * Agent Orchestrator Service
 *
 * This service manages communication between the frontend and AI agents.
 * In production, this would connect to real Claude and Codex APIs.
 * For now, it provides a simulated experience.
 */

import type { AgentTask } from '../types/agent';
import { useGameStore } from '../stores/gameStore';

// Simulated task responses for demo
const DEMO_RESPONSES: Record<string, string[]> = {
  default: [
    'Analyzing the codebase structure...',
    'Found 47 TypeScript files to examine',
    'Identifying key patterns and dependencies...',
    'Processing import statements...',
    'Building dependency graph...',
    'Analysis complete. Ready for next command.',
  ],
  fix: [
    'Scanning for issues in the specified area...',
    'Found potential problem in line 42',
    'Analyzing root cause...',
    'Applying fix...',
    'Verifying changes...',
    'Fix applied successfully!',
  ],
  create: [
    'Understanding requirements...',
    'Designing component structure...',
    'Generating boilerplate...',
    'Adding logic and handlers...',
    'Implementing styles...',
    'Component created successfully!',
  ],
  test: [
    'Running test suite...',
    'Executing 23 test files...',
    '✓ Unit tests passed (142/142)',
    '✓ Integration tests passed (28/28)',
    '⚠ 2 tests skipped',
    'All tests completed!',
  ],
  review: [
    'Starting code review...',
    'Checking for security vulnerabilities...',
    'Analyzing code quality...',
    'Reviewing naming conventions...',
    'Checking for performance issues...',
    'Review complete. 3 suggestions found.',
  ],
};

// Determine response type based on prompt
function getResponseType(prompt: string): string {
  const lower = prompt.toLowerCase();
  if (lower.includes('fix') || lower.includes('bug') || lower.includes('error')) return 'fix';
  if (lower.includes('create') || lower.includes('add') || lower.includes('new')) return 'create';
  if (lower.includes('test') || lower.includes('verify')) return 'test';
  if (lower.includes('review') || lower.includes('check')) return 'review';
  return 'default';
}

// Simulate agent work with streaming output
async function simulateAgentWork(
  agentId: string,
  task: AgentTask,
  onOutput: (line: string) => void,
  onComplete: () => void,
  onError: (error: string) => void
): Promise<void> {
  const responseType = getResponseType(task.prompt);
  const responses = DEMO_RESPONSES[responseType];

  onOutput(`[${new Date().toLocaleTimeString()}] Starting task: ${task.prompt}`);

  for (let i = 0; i < responses.length; i++) {
    // Random delay between 500ms and 2000ms
    await new Promise((resolve) => setTimeout(resolve, 500 + Math.random() * 1500));

    // 5% chance of error for realism
    if (Math.random() < 0.05) {
      onError('Unexpected error encountered. Retrying...');
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    onOutput(`[${new Date().toLocaleTimeString()}] ${responses[i]}`);

    // Update health/mana to simulate resource usage
    const store = useGameStore.getState();
    const agent = store.agents.get(agentId);
    if (agent) {
      store.updateAgentMana(agentId, agent.mana - Math.random() * 5);

      // Consume tokens
      const currentTokens = store.resources.tokens.current;
      store.updateResource('tokens', currentTokens - Math.floor(Math.random() * 1000));
    }
  }

  onOutput(`[${new Date().toLocaleTimeString()}] Task completed successfully!`);
  onComplete();
}

// Agent Orchestrator class
export class AgentOrchestrator {
  private static instance: AgentOrchestrator;
  private activeTasks: Map<string, AbortController> = new Map();
  private isConnected: boolean = false;

  private constructor() {
    // Singleton
  }

  static getInstance(): AgentOrchestrator {
    if (!AgentOrchestrator.instance) {
      AgentOrchestrator.instance = new AgentOrchestrator();
    }
    return AgentOrchestrator.instance;
  }

  // Connect to backend (simulated)
  async connect(): Promise<void> {
    console.log('[Orchestrator] Connecting to agent backend...');
    await new Promise((resolve) => setTimeout(resolve, 500));
    this.isConnected = true;
    console.log('[Orchestrator] Connected!');
  }

  // Disconnect
  disconnect(): void {
    this.isConnected = false;
    this.activeTasks.forEach((controller) => controller.abort());
    this.activeTasks.clear();
    console.log('[Orchestrator] Disconnected');
  }

  // Execute a task on an agent
  async executeTask(agentId: string, task: AgentTask): Promise<void> {
    const store = useGameStore.getState();
    const agent = store.agents.get(agentId);

    if (!agent) {
      console.error(`[Orchestrator] Agent ${agentId} not found`);
      return;
    }

    // Check if agent is already working
    if (agent.status === 'working') {
      console.log(`[Orchestrator] Agent ${agent.name} is already working. Queueing task.`);
      store.addAgentTask(agentId, task);
      return;
    }

    // Create abort controller for cancellation
    const controller = new AbortController();
    this.activeTasks.set(agentId, controller);

    // Update agent status
    store.updateAgentStatus(agentId, 'working');

    try {
      await simulateAgentWork(
        agentId,
        task,
        (line) => store.addTerminalOutput(agentId, line),
        () => {
          store.updateAgentStatus(agentId, 'completed');
          this.activeTasks.delete(agentId);

          // Check for queued tasks
          const updatedAgent = store.agents.get(agentId);
          if (updatedAgent && updatedAgent.taskQueue.length > 0) {
            // Process next task after a short delay
            setTimeout(() => {
              const nextTask = updatedAgent.taskQueue[0];
              // Remove from queue (this is simplified)
              this.executeTask(agentId, nextTask);
            }, 500);
          } else {
            // Return to idle after completion
            setTimeout(() => {
              store.updateAgentStatus(agentId, 'idle');
            }, 2000);
          }
        },
        (error) => {
          store.addTerminalOutput(agentId, `⚠️ ${error}`);
        }
      );
    } catch (error) {
      store.updateAgentStatus(agentId, 'error');
      store.addTerminalOutput(agentId, `❌ Fatal error: ${error}`);
    }
  }

  // Cancel a task
  cancelTask(agentId: string): void {
    const controller = this.activeTasks.get(agentId);
    if (controller) {
      controller.abort();
      this.activeTasks.delete(agentId);

      const store = useGameStore.getState();
      store.updateAgentStatus(agentId, 'idle');
      store.addTerminalOutput(agentId, `[${new Date().toLocaleTimeString()}] Task cancelled`);
    }
  }

  // Get orchestrator status
  getStatus(): { connected: boolean; activeTaskCount: number } {
    return {
      connected: this.isConnected,
      activeTaskCount: this.activeTasks.size,
    };
  }
}

// Hook for using orchestrator in React components
export function useOrchestrator() {
  const orchestrator = AgentOrchestrator.getInstance();

  return {
    executeTask: (agentId: string, prompt: string) => {
      const task: AgentTask = {
        id: crypto.randomUUID(),
        prompt,
        status: 'active',
        startedAt: new Date(),
      };
      return orchestrator.executeTask(agentId, task);
    },
    cancelTask: (agentId: string) => orchestrator.cancelTask(agentId),
    getStatus: () => orchestrator.getStatus(),
    connect: () => orchestrator.connect(),
    disconnect: () => orchestrator.disconnect(),
  };
}

// Export singleton
export const orchestrator = AgentOrchestrator.getInstance();
