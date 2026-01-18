import { useEffect, useCallback, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { spireConnection } from '../services/spireConnection';
import { notificationService } from '../services/notifications';
import { soundService } from '../services/sound';
import { storageService } from '../services/storage';
import { useConnectionStore } from '../stores/connectionStore';
import { useAgentStore } from '../stores/agentStore';
import { useChronicleStore } from '../stores/chronicleStore';
import { ChronicleEntries } from '../shared/types/chronicle';
import { ConnectionStatus } from '../shared/types/connection';
import { Agent, AgentStatus, AgentActivity, AgentThought } from '../shared/types/agent';

export function useSpireConnection() {
  const appState = useRef(AppState.currentState);
  const wasConnected = useRef(false);

  // Connection store
  const {
    currentConnection,
    connectionStatus,
    setConnectionStatus,
    setCurrentConnection,
    setMachineInfo,
    addRecentWorkspace,
  } = useConnectionStore();

  // Agent store
  const {
    setAgents,
    addAgent,
    removeAgent,
    updateAgent,
    setAgentStatus,
    setAgentActivity,
    setAgentProgress,
    addAgentOutput,
    addAgentThought,
    setAgentQuestion,
    grantXp,
  } = useAgentStore();

  // Chronicle store
  const { createEntry } = useChronicleStore();

  // Handle connection status changes
  const handleConnectionChange = useCallback(
    async (status: ConnectionStatus, error?: string) => {
      setConnectionStatus(status, error);

      if (status === 'connected') {
        wasConnected.current = true;
        soundService.play('connect');

        // Notify if we were disconnected before
        if (appState.current !== 'active') {
          notificationService.notifyConnectionRestored();
        }
      } else if (status === 'disconnected' && wasConnected.current) {
        soundService.play('disconnect');

        // Notify if app is backgrounded
        if (appState.current !== 'active') {
          notificationService.notifyConnectionLost();
        }
      } else if (status === 'error') {
        soundService.play('error');
      }
    },
    [setConnectionStatus]
  );

  // Handle agent list received
  const handleAgentList = useCallback(
    (agents: Agent[]) => {
      setAgents(agents);
    },
    [setAgents]
  );

  // Handle agent spawned
  const handleAgentSpawned = useCallback(
    (agent: Agent) => {
      addAgent(agent);
      soundService.play('spawn');

      createEntry(
        'agent_spawned',
        `${agent.name} has arrived!`,
        {
          agentId: agent.id,
          agentName: agent.name,
          agentClass: agent.class,
          description: 'A new agent joins the Spire',
          actionLabel: 'View',
          actionRoute: `/agent/${agent.id}`,
        }
      );
    },
    [addAgent, createEntry]
  );

  // Handle agent killed
  const handleAgentKilled = useCallback(
    (agentId: string) => {
      const agent = useAgentStore.getState().getAgent(agentId);
      if (agent) {
        createEntry(
          'agent_dismissed',
          `${agent.name} has departed`,
          {
            agentId: agent.id,
            agentName: agent.name,
            agentClass: agent.class,
          }
        );
      }
      removeAgent(agentId);
    },
    [removeAgent, createEntry]
  );

  // Handle agent output
  const handleAgentOutput = useCallback(
    (payload: { agentId: string; output: string }) => {
      addAgentOutput(payload.agentId, payload.output);
    },
    [addAgentOutput]
  );

  // Handle agent thought
  const handleAgentThought = useCallback(
    (payload: { agentId: string; thought: string; type: 'thinking' | 'action' | 'result'; timestamp: number }) => {
      const thought: AgentThought = {
        id: `thought-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        content: payload.thought,
        timestamp: new Date(payload.timestamp),
        type: payload.type,
      };
      addAgentThought(payload.agentId, thought);
    },
    [addAgentThought]
  );

  // Handle agent status change
  const handleAgentStatus = useCallback(
    async (payload: { agentId: string; status: string; activity?: string }) => {
      const previousAgent = useAgentStore.getState().getAgent(payload.agentId);
      const previousStatus = previousAgent?.status;

      setAgentStatus(payload.agentId, payload.status as AgentStatus);

      if (payload.activity) {
        setAgentActivity(payload.agentId, payload.activity as AgentActivity);
      }

      // Handle status-specific events
      const agent = useAgentStore.getState().getAgent(payload.agentId);
      if (!agent) return;

      if (payload.status === 'complete' && previousStatus !== 'complete') {
        soundService.play('complete');

        // Notify if app is backgrounded
        if (appState.current !== 'active') {
          // Quest completion handled separately
        }
      } else if (payload.status === 'error' && previousStatus !== 'error') {
        soundService.play('error');

        createEntry(
          'agent_error',
          `${agent.name} encountered an error`,
          {
            agentId: agent.id,
            agentName: agent.name,
            agentClass: agent.class,
            actionLabel: 'Investigate',
            actionRoute: `/agent/${agent.id}`,
          }
        );

        if (appState.current !== 'active') {
          notificationService.notifyAgentError(agent, 'An error occurred');
        }
      }
    },
    [setAgentStatus, setAgentActivity, createEntry]
  );

  // Handle agent progress
  const handleAgentProgress = useCallback(
    (payload: { agentId: string; current: number; total: number; label: string }) => {
      setAgentProgress(payload.agentId, payload.current, payload.total, payload.label);
    },
    [setAgentProgress]
  );

  // Handle agent question
  const handleAgentQuestion = useCallback(
    async (payload: { agentId: string; question: string; quickReplies?: string[] }) => {
      setAgentQuestion(payload.agentId, payload.question, payload.quickReplies);
      soundService.play('notification');

      const agent = useAgentStore.getState().getAgent(payload.agentId);
      if (!agent) return;

      createEntry(
        'agent_question',
        `${agent.name} has a question`,
        {
          agentId: agent.id,
          agentName: agent.name,
          agentClass: agent.class,
          description: `"${payload.question}"`,
          actionLabel: 'Answer',
          actionRoute: `/agent/${agent.id}`,
        }
      );

      if (appState.current !== 'active') {
        notificationService.notifyAgentQuestion(agent, payload.question);
      }
    },
    [setAgentQuestion, createEntry]
  );

  // Handle errors
  const handleError = useCallback((error: string) => {
    console.error('Spire connection error:', error);
  }, []);

  // Connect to daemon
  const connect = useCallback(
    async (url: string, name: string) => {
      const token = await storageService.getConnectionToken();

      spireConnection.setCallbacks({
        onConnectionChange: handleConnectionChange,
        onAgentList: handleAgentList,
        onAgentSpawned: handleAgentSpawned,
        onAgentKilled: handleAgentKilled,
        onAgentOutput: handleAgentOutput,
        onAgentThought: handleAgentThought,
        onAgentStatus: handleAgentStatus,
        onAgentProgress: handleAgentProgress,
        onAgentQuestion: handleAgentQuestion,
        onError: handleError,
      });

      spireConnection.connect({
        url,
        token: token || undefined,
      });

      // Save as last connection
      await storageService.setLastConnection(url, name);
    },
    [
      handleConnectionChange,
      handleAgentList,
      handleAgentSpawned,
      handleAgentKilled,
      handleAgentOutput,
      handleAgentThought,
      handleAgentStatus,
      handleAgentProgress,
      handleAgentQuestion,
      handleError,
    ]
  );

  // Disconnect
  const disconnect = useCallback(() => {
    spireConnection.disconnect();
  }, []);

  // Reconnect
  const reconnect = useCallback(async () => {
    const lastConnection = await storageService.getLastConnection();
    if (lastConnection) {
      connect(lastConnection.url, lastConnection.name);
    }
  }, [connect]);

  // Handle app state changes
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
      if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
        // App came to foreground
        if (!spireConnection.isConnected() && wasConnected.current) {
          // Attempt to reconnect
          reconnect();
        }
      }
      appState.current = nextAppState;
    });

    return () => {
      subscription.remove();
    };
  }, [reconnect]);

  // Send input to agent
  const sendInput = useCallback((agentId: string, input: string) => {
    spireConnection.sendInput(agentId, input);
  }, []);

  // Spawn agent
  const spawnAgent = useCallback(
    (name: string, agentClass: string, workingDirectory: string, initialTask?: string) => {
      spireConnection.spawnAgent({
        name,
        class: agentClass,
        workingDirectory,
        initialTask,
      });

      // Add to recent workspaces
      addRecentWorkspace(workingDirectory);
    },
    [addRecentWorkspace]
  );

  // Kill agent
  const killAgent = useCallback((agentId: string) => {
    spireConnection.killAgent(agentId);
  }, []);

  // Answer question
  const answerQuestion = useCallback((agentId: string, answer: string) => {
    spireConnection.answerQuestion(agentId, answer);
  }, []);

  return {
    // State
    connectionStatus,
    isConnected: connectionStatus === 'connected',
    currentConnection,

    // Actions
    connect,
    disconnect,
    reconnect,
    sendInput,
    spawnAgent,
    killAgent,
    answerQuestion,
  };
}
