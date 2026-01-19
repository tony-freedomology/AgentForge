import { useEffect, useCallback, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { spireConnection } from '../services/spireConnection';
import { notificationService } from '../services/notifications';
import { soundService } from '../services/sound';
import { storageService } from '../services/storage';
import { useConnectionStore, createConnection } from '../stores/connectionStore';
import { useAgentStore } from '../stores/agentStore';
import { useChronicleStore } from '../stores/chronicleStore';
import { useQuestStore } from '../stores/questStore';
import { ConnectionStatus } from '../shared/types/connection';
import { Agent, AgentStatus, AgentActivity, AgentThought, AgentClass, xpForLevel, createAgent } from '../shared/types/agent';
import { Quest, QuestArtifact, QuestPriority, QuestStatus } from '../shared/types/quest';

export function useSpireConnection() {
  const appState = useRef(AppState.currentState);
  const wasConnected = useRef(false);

  // Connection store
  const {
    currentConnection,
    connectionStatus,
    setConnectionStatus,
    setCurrentConnection,
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
  } = useAgentStore();

  // Chronicle store
  const { createEntry } = useChronicleStore();

  // Quest store
  const {
    addQuest,
    updateQuest,
    completeQuest,
    requestRevision,
    rejectQuest,
  } = useQuestStore();

  const normalizeActivity = useCallback((activity?: string): AgentActivity => {
    switch (activity) {
      case 'searching':
        return 'researching';
      case 'idle':
      case 'thinking':
      case 'researching':
      case 'reading':
      case 'writing':
      case 'testing':
      case 'building':
      case 'git':
      case 'waiting':
      case 'error':
        return activity;
      default:
        return 'idle';
    }
  }, []);

  const normalizeXp = useCallback(
    (xpValue?: number, levelValue?: number): number | undefined => {
      if (xpValue === undefined) return undefined;
      if (levelValue === undefined) return xpValue;
      const perLevel = xpForLevel(levelValue);
      const base = Math.max(0, levelValue - 1) * perLevel;
      return Math.max(0, xpValue - base);
    },
    []
  );

  const normalizeQuestStatus = useCallback((status?: string): QuestStatus => {
    switch (status) {
      case 'active':
        return 'active';
      case 'complete':
        return 'complete';
      case 'accepted':
        return 'accepted';
      case 'revision':
      case 'revising':
        return 'revising';
      case 'failed':
        return 'failed';
      default:
        return 'active';
    }
  }, []);

  const normalizeQuestArtifacts = useCallback(
    (questId: string, artifacts: unknown[] = []): QuestArtifact[] => {
      return artifacts.map((artifact, index) => {
        if (typeof artifact === 'string') {
          return {
            id: `${questId}-artifact-${index}`,
            path: artifact,
            changeType: 'modified',
          };
        }
        if (artifact && typeof artifact === 'object') {
          const typed = artifact as Partial<QuestArtifact> & { path?: string };
          return {
            id: typed.id || `${questId}-artifact-${index}`,
            path: typed.path || `artifact-${index}`,
            changeType: typed.changeType || 'modified',
            linesChanged: typed.linesChanged,
            preview: typed.preview,
          };
        }
        return {
          id: `${questId}-artifact-${index}`,
          path: `artifact-${index}`,
          changeType: 'modified',
        };
      });
    },
    []
  );

  const normalizeQuestPayload = useCallback(
    (payload: {
      id: string;
      agentId: string;
      title?: string;
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
    }): Quest => {
      const agent = useAgentStore.getState().getAgent(payload.agentId);
      const agentName = payload.agentName || agent?.name || 'Unknown Agent';
      const agentClass = (payload.agentClass as AgentClass) || agent?.class || 'mage';

      return {
        id: payload.id,
        agentId: payload.agentId,
        agentName,
        agentClass,
        title: payload.title || 'Quest',
        description: payload.description || '',
        status: normalizeQuestStatus(payload.status),
        priority: (payload.priority as QuestPriority) || 'normal',
        artifacts: normalizeQuestArtifacts(payload.id, payload.artifacts),
        completionSummary: payload.completionSummary,
        startedAt: payload.startedAt ? new Date(payload.startedAt) : new Date(),
        completedAt: payload.completedAt ? new Date(payload.completedAt) : undefined,
        reviewedAt: payload.reviewedAt ? new Date(payload.reviewedAt) : undefined,
        xpReward: payload.xpReward ?? 0,
        revisionNotes: payload.revisionNotes,
      };
    },
    [normalizeQuestArtifacts, normalizeQuestStatus]
  );

  const normalizeAgentPayload = useCallback(
    (payload: Partial<Agent> & {
      id?: string;
      name?: string;
      class?: AgentClass;
      status?: AgentStatus;
      activity?: AgentActivity;
      workingDirectory?: string;
      gitBranch?: string;
      currentThought?: string;
      currentQuestion?: string;
      lastActivityAt?: string | number | Date;
      createdAt?: string | number | Date;
    }): Agent => {
      const agentName = payload.name || 'Unknown Agent';
      const agentClass = payload.class || 'mage';
      const base = createAgent(agentName, agentClass, payload.workingDirectory);
      const level = payload.level ?? base.level;
      const normalizedXp = normalizeXp(payload.xp, level) ?? base.xp;
      const existing = payload.id ? useAgentStore.getState().getAgent(payload.id) : undefined;

      return {
        ...base,
        ...payload,
        id: payload.id || base.id,
        class: agentClass,
        provider: base.provider,
        status: payload.status || base.status,
        activity: normalizeActivity(payload.activity) || base.activity,
        branch: payload.branch || payload.gitBranch || base.branch,
        lastThought: payload.lastThought || payload.currentThought || existing?.lastThought || base.lastThought,
        pendingQuestion: payload.pendingQuestion || payload.currentQuestion || existing?.pendingQuestion || base.pendingQuestion,
        quickReplies: payload.quickReplies ?? existing?.quickReplies ?? base.quickReplies,
        createdAt: payload.createdAt ? new Date(payload.createdAt) : base.createdAt,
        lastActivity: payload.lastActivity
          ? new Date(payload.lastActivity)
          : payload.lastActivityAt
            ? new Date(payload.lastActivityAt)
            : base.lastActivity,
        thoughts: payload.thoughts ?? existing?.thoughts ?? base.thoughts,
        outputBuffer: payload.outputBuffer ?? existing?.outputBuffer ?? base.outputBuffer,
        contextUsed: payload.contextUsed ?? base.contextUsed,
        contextTotal: payload.contextTotal ?? base.contextTotal,
        tokensUsed: payload.tokensUsed ?? base.tokensUsed,
        xp: normalizedXp,
        level,
        xpToNextLevel: payload.xpToNextLevel ?? xpForLevel(level),
        talentPoints: payload.talentPoints ?? existing?.talentPoints ?? base.talentPoints,
        isFavorite: payload.isFavorite ?? base.isFavorite,
      };
    },
    [normalizeActivity, normalizeXp]
  );

  // Handle connection status changes
  const handleConnectionChange = useCallback(
    async (status: ConnectionStatus, error?: string) => {
      setConnectionStatus(status, error);

      if (status === 'connected') {
        wasConnected.current = true;
        soundService.playSound('connection', 'connectSuccess');

        // Notify if we were disconnected before
        if (appState.current !== 'active') {
          notificationService.notifyConnectionRestored();
        }
      } else if (status === 'disconnected' && wasConnected.current) {
        soundService.playSound('connection', 'disconnect');

        // Notify if app is backgrounded
        if (appState.current !== 'active') {
          notificationService.notifyConnectionLost();
        }
      } else if (status === 'error') {
        soundService.playSound('connection', 'connectFail');
      }
    },
    [setConnectionStatus]
  );

  // Handle agent list received
  const handleAgentList = useCallback(
    (agents: Agent[]) => {
      const normalized = agents.map((agent) => normalizeAgentPayload(agent));
      setAgents(normalized);
    },
    [normalizeAgentPayload, setAgents]
  );

  // Handle agent spawned
  const handleAgentSpawned = useCallback(
    (agent: Agent) => {
      const normalized = normalizeAgentPayload(agent);
      addAgent(normalized);
      soundService.playSound('agent', 'spawn');

      createEntry(
        'agent_spawned',
        `${agent.name} has arrived!`,
        {
          agentId: normalized.id,
          agentName: normalized.name,
          agentClass: normalized.class,
          description: 'A new agent joins the Spire',
          actionLabel: 'View',
          actionRoute: `/agent/${normalized.id}`,
        }
      );
    },
    [addAgent, createEntry, normalizeAgentPayload]
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
        setAgentActivity(payload.agentId, normalizeActivity(payload.activity));
      }

      // Handle status-specific events
      const agent = useAgentStore.getState().getAgent(payload.agentId);
      if (!agent) return;

      if (payload.status === 'complete' && previousStatus !== 'complete') {
        // Quest completion handled separately
      } else if (payload.status === 'error' && previousStatus !== 'error') {
        soundService.playSound('agent', 'error');

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
    [normalizeActivity, setAgentStatus, setAgentActivity, createEntry]
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
      soundService.playSound('notification', 'input');

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

  const handleAgentActivity = useCallback(
    (payload: { agentId: string; activity: string }) => {
      setAgentActivity(payload.agentId, normalizeActivity(payload.activity));
    },
    [normalizeActivity, setAgentActivity]
  );

  // Handle agent updates (XP/level/etc)
  const handleAgentUpdate = useCallback(
    (agentId: string, updates: Partial<Agent>) => {
      const payload = updates as Partial<Agent> & {
        lastActivityAt?: string | number | Date;
        gitBranch?: string;
        currentThought?: string;
        currentQuestion?: string;
        activity?: string;
      };
      const previous = useAgentStore.getState().getAgent(agentId);
      const nextLevel = updates.level ?? previous?.level;
      const levelsGained = previous && updates.level ? Math.max(0, updates.level - previous.level) : 0;
      const normalizedXp = normalizeXp(updates.xp, nextLevel);
      const normalizedActivity = payload.activity ? normalizeActivity(payload.activity) : undefined;
      const lastActivity =
        updates.lastActivity ??
        (payload.lastActivityAt ? new Date(payload.lastActivityAt) : undefined);
      const branch = updates.branch ?? payload.gitBranch;
      const lastThought = updates.lastThought ?? payload.currentThought;
      const pendingQuestion = updates.pendingQuestion ?? payload.currentQuestion;

      const mergedUpdates: Partial<Agent> = {
        ...updates,
        activity: normalizedActivity ?? updates.activity,
        branch,
        lastThought,
        pendingQuestion,
        lastActivity,
        xp: normalizedXp ?? updates.xp,
        xpToNextLevel: nextLevel ? xpForLevel(nextLevel) : previous?.xpToNextLevel,
        talentPoints: updates.talentPoints ?? (previous ? previous.talentPoints + levelsGained : undefined),
      };

      if (updates.level && previous && updates.level > previous.level) {
        const agent = useAgentStore.getState().getAgent(agentId);
        if (agent) {
          soundService.playSound('quest', 'levelUp');

          createEntry(
            'agent_level_up',
            `${agent.name} reached Level ${updates.level}!`,
            {
              agentId: agent.id,
              agentName: agent.name,
              agentClass: agent.class,
              description: '+1 Talent Point available',
              actionLabel: 'Assign',
              actionRoute: `/agent/${agent.id}/talents`,
            }
          );

          notificationService.notifyLevelUp(agent, updates.level);
        }
      }

      updateAgent(agentId, mergedUpdates);
    },
    [createEntry, normalizeActivity, normalizeXp, updateAgent]
  );

  const handleQuestStarted = useCallback(
    (payload: {
      id: string;
      agentId: string;
      title?: string;
      description?: string;
      status?: string;
      artifacts?: unknown[];
      xpReward?: number;
      startedAt?: string | number | Date;
      agentName?: string;
      agentClass?: string;
      priority?: string;
    }) => {
      const quest = normalizeQuestPayload({ ...payload, status: 'active' });
      const existing = useQuestStore.getState().getQuest(quest.id);

      if (existing) {
        updateQuest(quest.id, quest);
      } else {
        addQuest(quest);
      }

      soundService.playSound('quest', 'questStart');
      createEntry('quest_started', `${quest.agentName} began a quest`, {
        agentId: quest.agentId,
        agentName: quest.agentName,
        agentClass: quest.agentClass,
        questId: quest.id,
        description: `"${quest.title}"`,
        actionLabel: 'View',
        actionRoute: `/quest/${quest.id}`,
      });
    },
    [addQuest, createEntry, normalizeQuestPayload, updateQuest]
  );

  const handleQuestComplete = useCallback(
    (payload: {
      id: string;
      agentId: string;
      title?: string;
      description?: string;
      status?: string;
      artifacts?: unknown[];
      xpReward?: number;
      completedAt?: string | number | Date;
      agentName?: string;
      agentClass?: string;
      priority?: string;
      completionSummary?: string;
    }) => {
      const quest = normalizeQuestPayload({ ...payload, status: 'complete' });
      const existing = useQuestStore.getState().getQuest(quest.id);
      const summary = payload.completionSummary || payload.description || '';

      if (!existing) {
        addQuest({ ...quest, status: 'active', artifacts: [] });
      }

      completeQuest(quest.id, summary, quest.artifacts);

      soundService.playSound('quest', 'questComplete');
      createEntry(
        'quest_complete',
        `${quest.agentName} completed a quest!`,
        {
          agentId: quest.agentId,
          agentName: quest.agentName,
          agentClass: quest.agentClass,
          questId: quest.id,
          description: `"${quest.title}"`,
          actionLabel: 'Review',
          actionRoute: `/quest/${quest.id}`,
        }
      );

      if (appState.current !== 'active') {
        const agent = useAgentStore.getState().getAgent(quest.agentId);
        if (agent) {
          notificationService.notifyQuestComplete(agent, quest);
        }
      }
    },
    [addQuest, completeQuest, createEntry, normalizeQuestPayload]
  );

  const handleQuestAccepted = useCallback(
    (payload: {
      id: string;
      agentId: string;
      title?: string;
      status?: string;
      reviewedAt?: string | number | Date;
      agentName?: string;
      agentClass?: string;
    }) => {
      const quest = normalizeQuestPayload({ ...payload, status: 'accepted' });
      const existing = useQuestStore.getState().getQuest(quest.id);

      if (!existing) {
        addQuest(quest);
      } else {
        updateQuest(quest.id, { status: 'accepted', reviewedAt: quest.reviewedAt || new Date() });
      }

      createEntry('quest_accepted', `${quest.agentName} quest accepted`, {
        agentId: quest.agentId,
        agentName: quest.agentName,
        agentClass: quest.agentClass,
        questId: quest.id,
        description: `"${quest.title}"`,
        actionLabel: 'View',
        actionRoute: `/quest/${quest.id}`,
      });
    },
    [addQuest, createEntry, normalizeQuestPayload, updateQuest]
  );

  const handleQuestFailed = useCallback(
    (payload: {
      id: string;
      agentId: string;
      title?: string;
      status?: string;
      completedAt?: string | number | Date;
      agentName?: string;
      agentClass?: string;
    }) => {
      const quest = normalizeQuestPayload({ ...payload, status: 'failed' });
      const existing = useQuestStore.getState().getQuest(quest.id);

      if (!existing) {
        addQuest(quest);
      } else {
        updateQuest(quest.id, { status: 'failed', completedAt: quest.completedAt || new Date() });
      }

      rejectQuest(quest.id);
      soundService.playSound('quest', 'questFail');
      createEntry('quest_failed', `${quest.agentName} quest failed`, {
        agentId: quest.agentId,
        agentName: quest.agentName,
        agentClass: quest.agentClass,
        questId: quest.id,
        description: `"${quest.title}"`,
        actionLabel: 'View',
        actionRoute: `/quest/${quest.id}`,
      });
    },
    [addQuest, createEntry, normalizeQuestPayload, rejectQuest, updateQuest]
  );

  const handleQuestRevision = useCallback(
    (payload: { quest: { id: string; agentId: string; title?: string; status?: string; agentName?: string; agentClass?: string }; note?: string }) => {
      const questPayload = payload.quest;
      const quest = normalizeQuestPayload({ ...questPayload, status: 'revising' });
      const existing = useQuestStore.getState().getQuest(quest.id);

      if (!existing) {
        addQuest({ ...quest, revisionNotes: payload.note });
      } else {
        requestRevision(quest.id, payload.note || 'Revision requested');
      }

      createEntry('quest_revision', `${quest.agentName} needs revisions`, {
        agentId: quest.agentId,
        agentName: quest.agentName,
        agentClass: quest.agentClass,
        questId: quest.id,
        description: payload.note || `"${quest.title}"`,
        actionLabel: 'Review',
        actionRoute: `/quest/${quest.id}`,
      });
    },
    [addQuest, createEntry, normalizeQuestPayload, requestRevision]
  );

  // Handle errors
  const handleError = useCallback((error: string) => {
    console.error('Spire connection error:', error);
  }, []);

  // Connect to daemon
  const connect = useCallback(
    async (url: string, name: string) => {
      const token = await storageService.getConnectionToken();
      const saved = useConnectionStore.getState().savedConnections;
      const existing = saved.find((connection) => connection.url === url);
      const connection = existing ? { ...existing, name } : createConnection(name, url);

      setCurrentConnection({ ...connection, status: 'connecting' });

      spireConnection.setCallbacks({
        onConnectionChange: handleConnectionChange,
        onAgentList: handleAgentList,
        onAgentUpdate: handleAgentUpdate,
        onAgentSpawned: handleAgentSpawned,
        onAgentKilled: handleAgentKilled,
        onAgentOutput: handleAgentOutput,
        onAgentThought: handleAgentThought,
        onAgentStatus: handleAgentStatus,
        onAgentActivity: handleAgentActivity,
        onAgentProgress: handleAgentProgress,
        onAgentQuestion: handleAgentQuestion,
        onQuestStarted: handleQuestStarted,
        onQuestComplete: handleQuestComplete,
        onQuestFailed: handleQuestFailed,
        onQuestAccepted: handleQuestAccepted,
        onQuestRevision: handleQuestRevision,
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
      handleAgentUpdate,
      handleAgentSpawned,
      handleAgentKilled,
      handleAgentOutput,
      handleAgentThought,
      handleAgentStatus,
      handleAgentActivity,
      handleAgentProgress,
      handleAgentQuestion,
      handleQuestStarted,
      handleQuestComplete,
      handleQuestFailed,
      handleQuestAccepted,
      handleQuestRevision,
      handleError,
      setCurrentConnection,
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

  // Review quest (accept, reject, request revision)
  const sendQuestReview = useCallback((questId: string, action: 'accept' | 'reject' | 'revise', note?: string) => {
    spireConnection.reviewQuest(questId, action, note);
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
    sendQuestReview,
  };
}
