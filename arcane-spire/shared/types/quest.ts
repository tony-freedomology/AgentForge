// Quest status
export type QuestStatus =
  | 'active'      // Currently being worked on
  | 'complete'    // Finished, awaiting review
  | 'accepted'    // Reviewed and accepted
  | 'revising'    // Sent back for changes
  | 'failed';     // Could not complete

// Quest priority levels
export type QuestPriority = 'low' | 'normal' | 'high' | 'critical';

// File modification types
export type FileChangeType = 'created' | 'modified' | 'deleted';

// A file that was changed during a quest
export interface QuestArtifact {
  id: string;
  path: string;
  changeType: FileChangeType;
  linesChanged?: number;
  preview?: string;  // First few lines or summary
}

// Quest interface
export interface Quest {
  id: string;
  agentId: string;
  agentName: string;
  agentClass: string;

  // Quest details
  title: string;
  description: string;
  status: QuestStatus;
  priority: QuestPriority;

  // Artifacts/Loot
  artifacts: QuestArtifact[];

  // Summary from agent
  completionSummary?: string;

  // Timing
  startedAt: Date;
  completedAt?: Date;
  reviewedAt?: Date;

  // XP reward
  xpReward: number;

  // If revision was requested
  revisionNotes?: string;
}

// Create a new quest
export function createQuest(
  agentId: string,
  agentName: string,
  agentClass: string,
  title: string,
  description: string,
  priority: QuestPriority = 'normal'
): Quest {
  return {
    id: `quest-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    agentId,
    agentName,
    agentClass,
    title,
    description,
    status: 'active',
    priority,
    artifacts: [],
    startedAt: new Date(),
    xpReward: calculateXpReward(priority),
  };
}

// Calculate XP reward based on priority
function calculateXpReward(priority: QuestPriority): number {
  const rewards: Record<QuestPriority, number> = {
    low: 25,
    normal: 50,
    high: 100,
    critical: 200,
  };
  return rewards[priority];
}

// Loot item (file artifact displayed in Treasure Vault)
export interface LootItem {
  id: string;
  questId: string;
  agentId: string;
  agentName: string;
  artifact: QuestArtifact;
  collectedAt?: Date;
  isNew: boolean;
}

// Convert quest artifacts to loot items
export function questArtifactsToLoot(quest: Quest): LootItem[] {
  return quest.artifacts.map(artifact => ({
    id: `loot-${artifact.id}`,
    questId: quest.id,
    agentId: quest.agentId,
    agentName: quest.agentName,
    artifact,
    isNew: true,
  }));
}
