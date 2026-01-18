/**
 * Quest Log - Fantasy-styled quest tracking panel
 *
 * Shows all active and completed quests across agents.
 * Uses the panel_quest_scroll asset for authentic RPG feel.
 */

import { useState, useMemo } from 'react';
import { useGameStore } from '../../stores/gameStore';
import { getAgentClass } from '../../config/agentClasses';
import type { Agent, Quest, QuestStatus } from '../../types/agent';
import {
  ScrollText,
  X,
  ChevronDown,
  ChevronRight,
  Clock,
  CheckCircle2,
  XCircle,
  Loader2,
  AlertCircle,
  Sparkles,
} from 'lucide-react';

// Quest status configuration
const QUEST_STATUS_CONFIG: Record<QuestStatus, {
  label: string;
  icon: typeof Clock;
  color: string;
  bgColor: string;
}> = {
  none: {
    label: 'None',
    icon: XCircle,
    color: '#6b7280',
    bgColor: 'rgba(107, 114, 128, 0.1)',
  },
  in_progress: {
    label: 'In Progress',
    icon: Loader2,
    color: '#3b82f6',
    bgColor: 'rgba(59, 130, 246, 0.1)',
  },
  pending_review: {
    label: 'Awaiting Review',
    icon: AlertCircle,
    color: '#f59e0b',
    bgColor: 'rgba(245, 158, 11, 0.1)',
  },
  approved: {
    label: 'Approved',
    icon: CheckCircle2,
    color: '#22c55e',
    bgColor: 'rgba(34, 197, 94, 0.1)',
  },
  rejected: {
    label: 'Rejected',
    icon: XCircle,
    color: '#ef4444',
    bgColor: 'rgba(239, 68, 68, 0.1)',
  },
};

interface QuestItemProps {
  quest: Quest;
  agent: Agent;
  isExpanded: boolean;
  onToggle: () => void;
}

function QuestItem({ quest, agent, isExpanded, onToggle }: QuestItemProps) {
  const classConfig = getAgentClass(agent.class);
  const classColor = classConfig?.color || '#f59e0b';
  const statusConfig = QUEST_STATUS_CONFIG[quest.status];
  const StatusIcon = statusConfig.icon;

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDuration = (start: number, end?: number) => {
    const duration = (end || Date.now()) - start;
    const minutes = Math.floor(duration / 60000);
    const seconds = Math.floor((duration % 60000) / 1000);
    return minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`;
  };

  return (
    <div
      className="rounded-lg overflow-hidden transition-all duration-200"
      style={{
        background: statusConfig.bgColor,
        border: `1px solid ${statusConfig.color}30`,
      }}
    >
      {/* Quest header */}
      <button
        onClick={onToggle}
        className="w-full px-4 py-3 flex items-center gap-3 text-left hover:bg-white/5 transition-colors"
      >
        {/* Expand/collapse indicator */}
        <div className="text-gray-500">
          {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        </div>

        {/* Agent icon */}
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center text-lg shrink-0"
          style={{
            background: `linear-gradient(135deg, ${classColor}30, ${classColor}10)`,
            border: `1px solid ${classColor}40`,
          }}
        >
          {classConfig?.icon || '🤖'}
        </div>

        {/* Quest info */}
        <div className="flex-1 min-w-0">
          <div className="font-bold text-white text-sm truncate">
            {quest.description.length > 50
              ? quest.description.slice(0, 50) + '...'
              : quest.description}
          </div>
          <div className="text-xs text-gray-500">
            {agent.name} • Started {formatTime(quest.startedAt)}
          </div>
        </div>

        {/* Status badge */}
        <div
          className="flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-bold shrink-0"
          style={{
            background: `${statusConfig.color}20`,
            color: statusConfig.color,
          }}
        >
          <StatusIcon
            size={12}
            className={quest.status === 'in_progress' ? 'animate-spin' : ''}
          />
          {statusConfig.label}
        </div>
      </button>

      {/* Expanded details */}
      {isExpanded && (
        <div className="px-4 pb-4 pt-1 border-t border-white/5">
          {/* Full description */}
          <div className="text-sm text-gray-300 mb-3 p-3 rounded-lg bg-black/20">
            "{quest.description}"
          </div>

          {/* Stats row */}
          <div className="flex items-center gap-4 text-xs text-gray-500">
            <div className="flex items-center gap-1">
              <Clock size={12} />
              Duration: {formatDuration(quest.startedAt, quest.completedAt)}
            </div>
            {quest.producedFiles.length > 0 && (
              <div className="flex items-center gap-1">
                <ScrollText size={12} />
                {quest.producedFiles.length} file(s)
              </div>
            )}
          </div>

          {/* Agent notes */}
          {quest.agentNotes && (
            <div className="mt-3 p-3 rounded-lg bg-purple-500/10 border border-purple-500/20">
              <div className="text-xs text-purple-400 font-bold mb-1">
                Agent Notes:
              </div>
              <div className="text-sm text-gray-300 italic">
                "{quest.agentNotes}"
              </div>
            </div>
          )}

          {/* Files list */}
          {quest.producedFiles.length > 0 && (
            <div className="mt-3">
              <div className="text-xs text-gray-500 font-bold mb-2">
                Produced Files:
              </div>
              <div className="space-y-1">
                {quest.producedFiles.slice(0, 5).map((file, i) => (
                  <div
                    key={i}
                    className="text-xs font-mono text-gray-400 truncate"
                  >
                    • {file.path}
                  </div>
                ))}
                {quest.producedFiles.length > 5 && (
                  <div className="text-xs text-gray-600">
                    +{quest.producedFiles.length - 5} more...
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

interface QuestLogProps {
  onClose: () => void;
}

export function QuestLog({ onClose }: QuestLogProps) {
  const agents = useGameStore((s) => s.agents);
  const [expandedQuests, setExpandedQuests] = useState<Set<string>>(new Set());
  const [showCompleted, setShowCompleted] = useState(true);

  // Collect all quests from all agents
  const { activeQuests, completedQuests } = useMemo(() => {
    const active: { quest: Quest; agent: Agent }[] = [];
    const completed: { quest: Quest; agent: Agent }[] = [];

    Array.from(agents.values()).forEach((agent) => {
      // Current quest
      if (agent.currentQuest && agent.currentQuest.status !== 'none') {
        // Approved quests go to completed section
        if (agent.currentQuest.status === 'approved') {
          completed.push({ quest: agent.currentQuest, agent });
        } else {
          // in_progress, pending_review, rejected go to active
          active.push({ quest: agent.currentQuest, agent });
        }
      }

      // Historical completed quests
      agent.completedQuests.forEach((quest) => {
        completed.push({ quest, agent });
      });
    });

    // Sort by time (newest first)
    active.sort((a, b) => b.quest.startedAt - a.quest.startedAt);
    completed.sort((a, b) => (b.quest.completedAt || 0) - (a.quest.completedAt || 0));

    return { activeQuests: active, completedQuests: completed };
  }, [agents]);

  const toggleQuest = (questId: string) => {
    setExpandedQuests((prev) => {
      const next = new Set(prev);
      if (next.has(questId)) {
        next.delete(questId);
      } else {
        next.add(questId);
      }
      return next;
    });
  };

  const totalQuests = activeQuests.length + completedQuests.length;

  return (
    <div
      className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="fantasy-panel rounded-2xl w-[550px] max-w-[95vw] max-h-[85vh] overflow-hidden flex flex-col shadow-2xl"
        style={{
          borderColor: 'rgba(245, 158, 11, 0.3)',
          boxShadow: '0 0 60px rgba(245, 158, 11, 0.15)',
          backgroundImage: 'url(/assets_isometric/ui/panels/panel_quest_scroll.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Semi-transparent overlay for readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/80 to-black/70 rounded-2xl" />

        {/* Corner accents */}
        <div
          className="corner-accent top-left"
          style={{ '--accent-color': '#f59e0b' } as React.CSSProperties}
        />
        <div
          className="corner-accent top-right"
          style={{ '--accent-color': '#f59e0b' } as React.CSSProperties}
        />
        <div
          className="corner-accent bottom-left"
          style={{ '--accent-color': '#f59e0b' } as React.CSSProperties}
        />
        <div
          className="corner-accent bottom-right"
          style={{ '--accent-color': '#f59e0b' } as React.CSSProperties}
        />

        {/* Content wrapper */}
        <div className="relative z-10 flex flex-col h-full">
          {/* Header */}
          <div
            className="px-6 py-5 border-b flex items-center justify-between shrink-0"
            style={{ borderColor: 'rgba(245, 158, 11, 0.2)' }}
          >
            <div className="flex items-center gap-4">
              <div className="relative">
                <ScrollText size={32} className="text-amber-400" />
                <Sparkles
                  size={12}
                  className="absolute -top-1 -right-1 text-amber-300 animate-pulse"
                />
              </div>
              <div>
                <h2 className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-yellow-500 uppercase tracking-wider">
                  Quest Log
                </h2>
                <p className="text-amber-600/60 text-xs mt-0.5">
                  {totalQuests} total quest{totalQuests !== 1 ? 's' : ''} recorded
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors text-gray-500 hover:text-white"
            >
              <X size={20} />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Active Quests */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Loader2 size={16} className="text-blue-400 animate-spin" />
                <h3 className="text-sm font-bold text-blue-400 uppercase tracking-wider">
                  Active Quests ({activeQuests.length})
                </h3>
              </div>

              {activeQuests.length === 0 ? (
                <div className="text-center py-8 text-gray-500 text-sm">
                  No active quests. Assign a task to an agent to begin.
                </div>
              ) : (
                <div className="space-y-2">
                  {activeQuests.map(({ quest, agent }) => (
                    <QuestItem
                      key={quest.id}
                      quest={quest}
                      agent={agent}
                      isExpanded={expandedQuests.has(quest.id)}
                      onToggle={() => toggleQuest(quest.id)}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Divider with ornament */}
            <div className="flex items-center gap-4">
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-amber-500/30 to-transparent" />
              <img
                src="/assets_isometric/ui/decorations/divider_horizontal.png"
                alt=""
                className="w-16 h-4 object-contain opacity-60"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-amber-500/30 to-transparent" />
            </div>

            {/* Completed Quests */}
            <div>
              <button
                onClick={() => setShowCompleted(!showCompleted)}
                className="flex items-center gap-2 mb-3 hover:opacity-80 transition-opacity"
              >
                {showCompleted ? (
                  <ChevronDown size={16} className="text-green-400" />
                ) : (
                  <ChevronRight size={16} className="text-green-400" />
                )}
                <CheckCircle2 size={16} className="text-green-400" />
                <h3 className="text-sm font-bold text-green-400 uppercase tracking-wider">
                  Completed Quests ({completedQuests.length})
                </h3>
              </button>

              {showCompleted && (
                <>
                  {completedQuests.length === 0 ? (
                    <div className="text-center py-8 text-gray-500 text-sm">
                      No completed quests yet.
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {completedQuests.slice(0, 10).map(({ quest, agent }) => (
                        <QuestItem
                          key={quest.id}
                          quest={quest}
                          agent={agent}
                          isExpanded={expandedQuests.has(quest.id)}
                          onToggle={() => toggleQuest(quest.id)}
                        />
                      ))}
                      {completedQuests.length > 10 && (
                        <div className="text-center text-xs text-gray-500 py-2">
                          +{completedQuests.length - 10} more completed quests...
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Footer */}
          <div
            className="px-6 py-4 border-t text-center text-xs text-gray-500 shrink-0"
            style={{ borderColor: 'rgba(245, 158, 11, 0.15)' }}
          >
            Press <kbd className="px-1.5 py-0.5 rounded bg-black/50 text-gray-400">Q</kbd> to toggle Quest Log
          </div>
        </div>
      </div>
    </div>
  );
}

// Compact quest log button for toolbar
export function QuestLogButton({ onClick }: { onClick: () => void }) {
  const agents = useGameStore((s) => s.agents);

  // Count active quests
  const activeCount = useMemo(() => {
    let count = 0;
    Array.from(agents.values()).forEach((agent) => {
      if (agent.currentQuest && ['in_progress', 'pending_review'].includes(agent.currentQuest.status)) {
        count++;
      }
    });
    return count;
  }, [agents]);

  return (
    <button
      onClick={onClick}
      className="relative p-2 rounded-lg bg-black/40 border border-amber-500/30 hover:border-amber-500/50 hover:bg-amber-500/10 transition-all group"
      title="Quest Log (Q)"
    >
      <ScrollText size={20} className="text-amber-400 group-hover:text-amber-300" />
      {activeCount > 0 && (
        <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-500 text-black text-[10px] font-bold flex items-center justify-center">
          {activeCount}
        </span>
      )}
    </button>
  );
}

export default QuestLog;
