import { useEffect, useCallback, useRef } from 'react';
import { useAgentStore } from '../stores/agentStore';
import { useQuestStore } from '../stores/questStore';
import { useChronicleStore } from '../stores/chronicleStore';
import { notificationService } from '../services/notifications';
import { soundService } from '../services/sound';
import { Agent, AgentStatus } from '../shared/types/agent';

// Idle timeout in milliseconds (5 minutes)
const IDLE_TIMEOUT = 5 * 60 * 1000;

// Check interval in milliseconds (30 seconds)
const CHECK_INTERVAL = 30 * 1000;

export function useAgentSync() {
  const checkInterval = useRef<ReturnType<typeof setInterval> | null>(null);
  const notifiedIdleAgents = useRef<Set<string>>(new Set());

  const { agents, getAgentList, updateAgent, grantXp } = useAgentStore();
  const { completeQuest, acceptQuest, getActiveQuests } = useQuestStore();
  const { createEntry } = useChronicleStore();

  // Check for idle agents
  const checkIdleAgents = useCallback(() => {
    const agentList = getAgentList();
    const now = Date.now();

    agentList.forEach((agent) => {
      if (agent.status === 'dormant' && agent.idleSince) {
        const idleTime = now - new Date(agent.idleSince).getTime();

        if (idleTime >= IDLE_TIMEOUT && !notifiedIdleAgents.current.has(agent.id)) {
          // Agent has been idle for too long
          notifiedIdleAgents.current.add(agent.id);

          const idleMinutes = Math.floor(idleTime / 60000);

          createEntry(
            'agent_idle',
            `${agent.name} is dormant`,
            {
              agentId: agent.id,
              agentName: agent.name,
              agentClass: agent.class,
              description: `Idle for ${idleMinutes} minutes`,
              actionLabel: 'Wake',
              actionRoute: `/agent/${agent.id}`,
            }
          );

          notificationService.notifyAgentIdle(agent, idleMinutes);
        }
      } else {
        // Agent is no longer idle, remove from notified set
        notifiedIdleAgents.current.delete(agent.id);
      }
    });
  }, [getAgentList, createEntry]);

  // Start idle checking
  useEffect(() => {
    checkInterval.current = setInterval(checkIdleAgents, CHECK_INTERVAL);

    return () => {
      if (checkInterval.current) {
        clearInterval(checkInterval.current);
      }
    };
  }, [checkIdleAgents]);

  // Handle quest completion and XP grant
  const handleQuestAccepted = useCallback(
    (questId: string) => {
      const xpReward = acceptQuest(questId);

      // Find the agent for this quest
      const activeQuests = getActiveQuests();
      const quest = useQuestStore.getState().getQuest(questId);

      if (quest && xpReward > 0) {
        const result = grantXp(quest.agentId, xpReward);

        if (result.leveledUp) {
          const agent = useAgentStore.getState().getAgent(quest.agentId);
          if (agent) {
            soundService.playSound('quest', 'levelUp');

            createEntry(
              'agent_level_up',
              `${agent.name} reached Level ${agent.level}!`,
              {
                agentId: agent.id,
                agentName: agent.name,
                agentClass: agent.class,
                description: `+${result.levelsGained} Talent Point${result.levelsGained > 1 ? 's' : ''} available`,
                actionLabel: 'Assign',
                actionRoute: `/agent/${agent.id}/talents`,
              }
            );

            notificationService.notifyLevelUp(agent, agent.level);
          }
        }
      }

      return xpReward;
    },
    [acceptQuest, grantXp, getActiveQuests, createEntry]
  );

  // Get agents needing attention
  const getAgentsNeedingAttention = useCallback(() => {
    return getAgentList().filter(
      (agent) =>
        agent.status === 'awaiting' ||
        agent.status === 'error' ||
        agent.status === 'complete'
    );
  }, [getAgentList]);

  // Get agent by status
  const getAgentsByStatus = useCallback(
    (status: AgentStatus) => {
      return getAgentList().filter((agent) => agent.status === status);
    },
    [getAgentList]
  );

  // Calculate total context usage across all agents
  const getTotalContextUsage = useCallback(() => {
    const agentList = getAgentList();
    if (agentList.length === 0) return { used: 0, total: 0 };

    const used = agentList.reduce((sum, agent) => sum + agent.contextUsed, 0);
    const total = agentList.reduce((sum, agent) => sum + agent.contextTotal, 0);

    return { used, total };
  }, [getAgentList]);

  // Get summary stats
  const getStats = useCallback(() => {
    const agentList = getAgentList();
    const context = getTotalContextUsage();

    return {
      totalAgents: agentList.length,
      workingAgents: agentList.filter((a) => a.status === 'channeling').length,
      idleAgents: agentList.filter((a) => a.status === 'dormant').length,
      needingAttention: agentList.filter(
        (a) => a.status === 'awaiting' || a.status === 'error' || a.status === 'complete'
      ).length,
      contextUsage: context.total > 0 ? (context.used / context.total) * 100 : 0,
    };
  }, [getAgentList, getTotalContextUsage]);

  return {
    // Actions
    handleQuestAccepted,

    // Getters
    getAgentsNeedingAttention,
    getAgentsByStatus,
    getTotalContextUsage,
    getStats,
  };
}
