// Chronicle entry types (activity feed)
export type ChronicleEntryType =
  | 'quest_started'
  | 'quest_complete'
  | 'quest_failed'
  | 'quest_accepted'
  | 'quest_revision'
  | 'agent_spawned'
  | 'agent_dismissed'
  | 'agent_question'
  | 'agent_error'
  | 'agent_level_up'
  | 'agent_idle'
  | 'system';

// Chronicle entry
export interface ChronicleEntry {
  id: string;
  type: ChronicleEntryType;
  agentId?: string;
  agentName?: string;
  agentClass?: string;
  questId?: string;

  // Content
  title: string;
  description?: string;

  // Action button
  actionLabel?: string;
  actionRoute?: string;

  // Timing
  timestamp: Date;

  // Read state
  isRead: boolean;
}

// Create a chronicle entry
export function createChronicleEntry(
  type: ChronicleEntryType,
  title: string,
  options: Partial<Omit<ChronicleEntry, 'id' | 'type' | 'title' | 'timestamp' | 'isRead'>> = {}
): ChronicleEntry {
  return {
    id: `chronicle-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    type,
    title,
    timestamp: new Date(),
    isRead: false,
    ...options,
  };
}

// Chronicle entry presets
export const ChronicleEntries = {
  questComplete: (agentId: string, agentName: string, agentClass: string, questTitle: string, questId: string) =>
    createChronicleEntry('quest_complete', `${agentName} completed a quest!`, {
      agentId,
      agentName,
      agentClass,
      questId,
      description: `"${questTitle}"`,
      actionLabel: 'Review',
      actionRoute: `/quest/${questId}`,
    }),

  agentQuestion: (agentId: string, agentName: string, agentClass: string, question: string) =>
    createChronicleEntry('agent_question', `${agentName} has a question`, {
      agentId,
      agentName,
      agentClass,
      description: `"${question}"`,
      actionLabel: 'Answer',
      actionRoute: `/agent/${agentId}`,
    }),

  agentLevelUp: (agentId: string, agentName: string, agentClass: string, newLevel: number) =>
    createChronicleEntry('agent_level_up', `${agentName} reached Level ${newLevel}!`, {
      agentId,
      agentName,
      agentClass,
      description: '+1 Talent Point available',
      actionLabel: 'Assign',
      actionRoute: `/agent/${agentId}/talents`,
    }),

  agentSpawned: (agentId: string, agentName: string, agentClass: string) =>
    createChronicleEntry('agent_spawned', `${agentName} has arrived!`, {
      agentId,
      agentName,
      agentClass,
      description: 'A new agent joins the Spire',
      actionLabel: 'View',
      actionRoute: `/agent/${agentId}`,
    }),

  agentError: (agentId: string, agentName: string, agentClass: string, error: string) =>
    createChronicleEntry('agent_error', `${agentName} encountered an error`, {
      agentId,
      agentName,
      agentClass,
      description: error,
      actionLabel: 'Investigate',
      actionRoute: `/agent/${agentId}`,
    }),
};
