/**
 * Party Frames - WoW-style unit frames for all agents
 *
 * Displays health (API usage), mana (context), and current activity
 * for each agent. Click to select, flashes when attention needed.
 */

import { useEffect, useState } from 'react';
import { useGameStore } from '../../stores/gameStore';
import { getAgentClass } from '../../config/agentClasses';
import { ACTIVITY_ICONS } from '../../types/agent';
import type { Agent } from '../../types/agent';
import { TalentTree } from './TalentTree';
import { Sparkles } from 'lucide-react';

// Status bar component
function StatusBar({
  value,
  max,
  color,
  label,
  showPercent = true,
}: {
  value: number;
  max: number;
  color: string;
  label: string;
  showPercent?: boolean;
}) {
  const percent = Math.round((value / max) * 100);

  return (
    <div className="relative h-3 bg-stone-950/80 border border-stone-800 rounded-sm overflow-hidden">
      <div
        className="absolute inset-y-0 left-0 transition-all duration-300"
        style={{
          width: `${percent}%`,
          background: `linear-gradient(180deg, ${color} 0%, ${color}cc 100%)`,
          boxShadow: `inset 0 1px 0 rgba(255,255,255,0.2)`,
        }}
      />
      <div className="absolute inset-0 flex items-center justify-between px-1.5 text-[9px] font-mono z-10">
        <span className="text-stone-200 uppercase tracking-wider font-bold drop-shadow-md">{label}</span>
        {showPercent && <span className="text-white font-bold drop-shadow-md">{percent}%</span>}
      </div>
    </div>
  );
}

// Progress bar with specific progress (e.g., 3/10 tests)
function ProgressBar({
  current,
  total,
  color,
  label,
}: {
  current: number;
  total: number;
  color: string;
  label: string;
}) {
  const percent = total > 0 ? Math.round((current / total) * 100) : 0;

  return (
    <div className="h-5 rounded-sm relative overflow-hidden border border-stone-700/50 bg-stone-950/80">
      {/* Progress fill */}
      <div
        className="absolute inset-y-0 left-0 transition-all duration-300"
        style={{
          width: `${percent}%`,
          background: `linear-gradient(180deg, ${color}, ${color}cc)`,
          boxShadow: `0 0 10px ${color}40`,
        }}
      />
      {/* Label and count */}
      <div className="absolute inset-0 flex items-center justify-between px-2 text-[10px] font-medium z-10">
        <span className="text-white drop-shadow-md truncate font-serif">{label}</span>
        <span className="text-white font-mono font-bold drop-shadow-md">
          {current}/{total}
        </span>
      </div>
    </div>
  );
}

// Activity/Cast bar component
function ActivityBar({ agent }: { agent: Agent }) {
  const [elapsed, setElapsed] = useState(0);
  const activityInfo = ACTIVITY_ICONS[agent.activity];

  // Update elapsed time
  useEffect(() => {
    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - agent.activityStartedAt) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [agent.activityStartedAt]);

  const formatTime = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  // Show specific progress bar if available
  if (agent.taskProgress) {
    const progressColors: Record<string, string> = {
      tests: '#f59e0b',   // Amber for tests
      build: '#ef4444',   // Red for build
      lint: '#8b5cf6',    // Purple for lint
      files: '#3b82f6',   // Blue for files
      generic: '#22c55e', // Green for generic
    };

    return (
      <ProgressBar
        current={agent.taskProgress.current}
        total={agent.taskProgress.total}
        color={progressColors[agent.taskProgress.type] || '#22c55e'}
        label={agent.taskProgress.label || `${agent.taskProgress.type}...`}
      />
    );
  }

  if (agent.activity === 'idle' && !agent.needsAttention) {
    return (
      <div className="h-4 bg-black/40 border border-stone-800/50 rounded-sm flex items-center px-2 text-[10px] text-stone-500 font-serif italic">
        <span>Awaiting command...</span>
      </div>
    );
  }

  return (
    <div
      className="h-5 rounded-sm flex items-center gap-2 px-2 text-[10px] font-medium relative overflow-hidden border border-stone-700/50"
      style={{
        background: `linear-gradient(90deg, ${activityInfo.color}20, ${activityInfo.color}05)`,
        borderLeft: `2px solid ${activityInfo.color}`,
      }}
    >
      {/* Animated progress bar for working states */}
      {agent.status === 'working' && (
        <div
          className="absolute inset-0 opacity-20"
          style={{
            background: `linear-gradient(90deg, transparent, ${activityInfo.color}50, transparent)`,
            animation: 'shimmer 2s infinite',
          }}
        />
      )}

      <span className="relative z-10">{activityInfo.icon}</span>
      <span className="relative z-10 flex-1 truncate font-serif" style={{ color: activityInfo.color }}>
        {agent.activityDetails || activityInfo.label}
      </span>
      <span className="relative z-10 text-stone-400 font-mono">{formatTime(elapsed)}</span>
    </div>
  );
}

// Single agent frame
function AgentFrame({
  agent,
  isSelected,
  onOpenTalents,
}: {
  agent: Agent;
  isSelected: boolean;
  onOpenTalents: () => void;
}) {
  const selectAgent = useGameStore((s) => s.selectAgent);
  const classConfig = getAgentClass(agent.class);

  const [attentionPulse, setAttentionPulse] = useState(false);
  const [isSpawning, setIsSpawning] = useState(agent.status === 'spawning');
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [prevLevel, setPrevLevel] = useState(agent.level);

  // Detect level up
  useEffect(() => {
    if (agent.level > prevLevel) {
      setShowLevelUp(true);
      const timer = setTimeout(() => setShowLevelUp(false), 2000);
      setPrevLevel(agent.level);
      return () => clearTimeout(timer);
    }
  }, [agent.level, prevLevel]);

  // Handle spawn animation
  useEffect(() => {
    if (agent.status === 'spawning') {
      setIsSpawning(true);
    } else if (isSpawning) {
      // Keep the animation class briefly after spawning completes
      const timer = setTimeout(() => setIsSpawning(false), 300);
      return () => clearTimeout(timer);
    }
  }, [agent.status, isSpawning]);

  // Escalating attention animation
  useEffect(() => {
    if (!agent.needsAttention) {
      setAttentionPulse(false);
      return;
    }

    const timeSinceAttention = agent.attentionSince ? Date.now() - agent.attentionSince : 0;
    const pulseSpeed = timeSinceAttention > 30000 ? 300 : timeSinceAttention > 10000 ? 600 : 1000;

    const interval = setInterval(() => {
      setAttentionPulse((p) => !p);
    }, pulseSpeed);

    return () => clearInterval(interval);
  }, [agent.needsAttention, agent.attentionSince]);

  const classColor = classConfig?.color || '#06b6d4';
  const classIcon = classConfig?.icon || '🤖';

  // Context percentage (mana analog)
  const contextPercent = agent.contextLimit > 0
    ? Math.round((agent.contextTokens / agent.contextLimit) * 100)
    : 0;

  // Determine border/glow based on state
  const getBorderStyle = () => {
    if (agent.needsAttention && attentionPulse) {
      return {
        borderColor: agent.attentionReason === 'error' ? '#ef4444' : '#eab308',
        boxShadow: `0 0 20px ${agent.attentionReason === 'error' ? '#ef444450' : '#eab30850'}`,
      };
    }
    if (isSelected) {
      return {
        borderColor: '#f59e0b', // Gold border for selection
        boxShadow: `0 0 15px rgba(245, 158, 11, 0.4)`,
        backgroundColor: 'rgba(28, 25, 23, 0.95)', // Darker stone when selected
      };
    }
    return {
      borderColor: 'rgba(120, 113, 108, 0.3)', // Stone border
      boxShadow: 'none',
    };
  };

  const statusColors: Record<string, string> = {
    idle: '#22c55e',
    working: '#f59e0b',
    waiting: '#eab308',
    error: '#ef4444',
    completed: '#22c55e',
    spawning: '#3b82f6',
    blocked: '#f97316',
  };

  return (
    <div
      onClick={() => selectAgent(agent.id)}
      className={`
        relative p-3 rounded-lg cursor-pointer transition-all duration-200
        bg-stone-900/90 border-2 backdrop-blur-sm
        hover:bg-stone-800/90 hover:scale-[1.02] hover:border-stone-500
        ${agent.needsAttention ? 'animate-attention' : ''}
        ${isSpawning ? 'animate-spawn-emerge' : ''}
      `}
      style={getBorderStyle()}
    >
      {/* Level up effect */}
      {showLevelUp && (
        <div className="absolute inset-0 pointer-events-none">
          <div
            className="absolute inset-0 animate-[level-up-burst_1s_ease-out]"
            style={{ background: `radial-gradient(circle, ${classColor}40 0%, transparent 70%)` }}
          />
          <div
            className="absolute inset-0 rounded-lg border-2 animate-[level-up-ring_1.5s_ease-out]"
            style={{ borderColor: classColor }}
          />
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 font-display font-black text-lg uppercase tracking-wider animate-[level-up-text_1.5s_ease-out] drop-shadow-lg"
            style={{ color: '#fbbf24', textShadow: `0 0 20px #fbbf24` }}
          >
            Ascension!
          </div>
        </div>
      )}

      {/* Attention indicator */}
      {agent.needsAttention && (
        <div
          className="absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center text-sm animate-bounce border-2 border-black"
          style={{
            background: agent.attentionReason === 'error' ? '#ef4444' : '#eab308',
            boxShadow: `0 0 10px ${agent.attentionReason === 'error' ? '#ef4444' : '#eab308'}`,
          }}
        >
          {agent.attentionReason === 'error' ? '!' :
           agent.attentionReason === 'waiting_input' ? '?' :
           agent.attentionReason === 'idle_timeout' ? '💤' : '✓'}
        </div>
      )}

      {/* Header row */}
      <div className="flex items-center gap-3 mb-2">
        {/* Portrait */}
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center text-xl relative bg-black/40"
          style={{
            border: `1px solid ${classColor}60`,
            boxShadow: `inset 0 0 10px ${classColor}20`,
          }}
        >
          {classIcon}
          {/* Status dot */}
          <div
            className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-stone-900"
            style={{ background: statusColors[agent.status] || '#6b7280' }}
          />
          {/* Loot indicator */}
          {agent.producedFiles.length > 0 && (
            <div
              className="absolute -top-1 -left-1 w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-bold border border-amber-900"
              style={{
                background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                boxShadow: '0 0 6px rgba(245,158,11,0.5)',
                color: '#78350f',
              }}
              title={`${agent.producedFiles.length} files produced`}
            >
              {agent.producedFiles.length > 9 ? '9+' : agent.producedFiles.length}
            </div>
          )}
        </div>

        {/* Name and status */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-bold text-stone-200 truncate font-serif tracking-wide">{agent.name}</span>
            <span
              className="text-[10px] px-1.5 py-0.5 rounded uppercase font-bold tracking-wider"
              style={{
                background: `${statusColors[agent.status]}20`,
                color: statusColors[agent.status],
                border: `1px solid ${statusColors[agent.status]}40`
              }}
            >
              {agent.status}
            </span>
          </div>
          <div className="flex items-center gap-2 text-[10px] text-stone-500">
            <span className="truncate">{classConfig?.title || agent.class} • Lv.{agent.level}</span>
            {/* Talent indicator */}
            {(agent.talents.points > 0 || Object.keys(agent.talents.allocated).length > 0) && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenTalents();
                }}
                className={`
                  flex items-center gap-1 px-1.5 py-0.5 rounded
                  transition-all duration-200 hover:scale-105
                  ${agent.talents.points > 0
                    ? 'bg-amber-500/30 border border-amber-500/50 text-amber-400 animate-pulse'
                    : 'bg-white/5 border border-white/10 text-stone-400 hover:text-white'
                  }
                `}
                title={`${agent.talents.points} talent points available`}
              >
                <Sparkles size={10} />
                {agent.talents.points > 0 && <span className="font-bold">{agent.talents.points}</span>}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Resource bars */}
      <div className="space-y-1.5">
        {/* Health = API Usage = Energy */}
        <StatusBar
          value={agent.usagePercent}
          max={100}
          color="#22c55e"
          label="Energy"
        />

        {/* Mana = Context */}
        <StatusBar
          value={contextPercent}
          max={100}
          color="#3b82f6"
          label="Mana"
        />

        {/* Activity/Cast bar */}
        <ActivityBar agent={agent} />
      </div>
    </div>
  );
}

// Main Party Frames component
export function PartyFrames() {
  const agents = useGameStore((s) => s.agents);
  const selectedAgentIds = useGameStore((s) => s.selectedAgentIds);
  const [talentTreeAgent, setTalentTreeAgent] = useState<Agent | null>(null);

  const agentList = Array.from(agents.values());

  // Sort: attention needed first, then by name
  const sortedAgents = [...agentList].sort((a, b) => {
    if (a.needsAttention && !b.needsAttention) return -1;
    if (!a.needsAttention && b.needsAttention) return 1;
    return a.name.localeCompare(b.name);
  });

  if (agentList.length === 0) {
    return null;
  }

  // Count agents needing attention
  const attentionCount = agentList.filter((a) => a.needsAttention).length;

  return (
    <div className="fixed top-24 left-4 w-72 z-40">
      {/* Header */}
      <div className="flex items-center justify-between mb-2 px-1">
        <span className="text-xs font-bold text-amber-400 uppercase tracking-widest font-serif drop-shadow-sm">
          Warband ({agentList.length})
        </span>
        {attentionCount > 0 && (
          <span className="text-xs font-bold text-red-400 animate-pulse flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-red-400" />
            {attentionCount} need aid
          </span>
        )}
      </div>

      {/* Agent frames */}
      <div className="space-y-2 max-h-[calc(100vh-180px)] overflow-y-auto pr-1 scrollbar-thin">
        {sortedAgents.map((agent) => (
          <AgentFrame
            key={agent.id}
            agent={agent}
            isSelected={selectedAgentIds.has(agent.id)}
            onOpenTalents={() => setTalentTreeAgent(agent)}
          />
        ))}
      </div>

      {/* Talent Tree Modal */}
      {talentTreeAgent && (
        <TalentTree
          agent={talentTreeAgent}
          onClose={() => setTalentTreeAgent(null)}
        />
      )}
    </div>
  );
}
