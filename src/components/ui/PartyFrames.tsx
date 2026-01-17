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
    <div className="relative h-3 bg-black/60 rounded-sm overflow-hidden">
      <div
        className="absolute inset-y-0 left-0 transition-all duration-300"
        style={{
          width: `${percent}%`,
          background: `linear-gradient(90deg, ${color}90, ${color})`,
          boxShadow: `0 0 8px ${color}50`,
        }}
      />
      <div className="absolute inset-0 flex items-center justify-between px-1.5 text-[9px] font-mono">
        <span className="text-white/70 uppercase tracking-wider">{label}</span>
        {showPercent && <span className="text-white/90 font-bold">{percent}%</span>}
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

  if (agent.activity === 'idle' && !agent.needsAttention) {
    return (
      <div className="h-4 bg-black/40 rounded-sm flex items-center px-2 text-[10px] text-gray-500">
        <span>Awaiting orders...</span>
      </div>
    );
  }

  return (
    <div
      className="h-5 rounded-sm flex items-center gap-2 px-2 text-[10px] font-medium relative overflow-hidden"
      style={{
        background: `linear-gradient(90deg, ${activityInfo.color}30, ${activityInfo.color}10)`,
        borderLeft: `2px solid ${activityInfo.color}`,
      }}
    >
      {/* Animated progress bar for working states */}
      {agent.status === 'working' && (
        <div
          className="absolute inset-0 opacity-30"
          style={{
            background: `linear-gradient(90deg, transparent, ${activityInfo.color}50, transparent)`,
            animation: 'shimmer 2s infinite',
          }}
        />
      )}

      <span className="relative z-10">{activityInfo.icon}</span>
      <span className="relative z-10 flex-1 truncate" style={{ color: activityInfo.color }}>
        {agent.activityDetails || activityInfo.label}
      </span>
      <span className="relative z-10 text-white/50 font-mono">{formatTime(elapsed)}</span>
    </div>
  );
}

// Single agent frame
function AgentFrame({ agent, isSelected }: { agent: Agent; isSelected: boolean }) {
  const selectAgent = useGameStore((s) => s.selectAgent);
  const classConfig = getAgentClass(agent.class);

  const [attentionPulse, setAttentionPulse] = useState(false);

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
        borderColor: classColor,
        boxShadow: `0 0 15px ${classColor}40`,
      };
    }
    return {
      borderColor: 'rgba(255,255,255,0.1)',
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
        bg-gray-900/90 border-2 backdrop-blur-sm
        hover:bg-gray-800/90 hover:scale-[1.02]
        ${agent.needsAttention ? 'animate-attention' : ''}
      `}
      style={getBorderStyle()}
    >
      {/* Attention indicator */}
      {agent.needsAttention && (
        <div
          className="absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center text-sm animate-bounce"
          style={{
            background: agent.attentionReason === 'error' ? '#ef4444' : '#eab308',
            boxShadow: `0 0 10px ${agent.attentionReason === 'error' ? '#ef4444' : '#eab308'}`,
          }}
        >
          {agent.attentionReason === 'error' ? '!' : agent.attentionReason === 'waiting_input' ? '?' : '✓'}
        </div>
      )}

      {/* Header row */}
      <div className="flex items-center gap-3 mb-2">
        {/* Portrait */}
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center text-xl relative"
          style={{
            background: `linear-gradient(135deg, ${classColor}40, ${classColor}20)`,
            border: `1px solid ${classColor}60`,
          }}
        >
          {classIcon}
          {/* Status dot */}
          <div
            className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-gray-900"
            style={{ background: statusColors[agent.status] || '#6b7280' }}
          />
          {/* Loot indicator */}
          {agent.producedFiles.length > 0 && (
            <div
              className="absolute -top-1 -left-1 w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-bold"
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
            <span className="font-bold text-white truncate">{agent.name}</span>
            <span
              className="text-[10px] px-1.5 py-0.5 rounded uppercase font-bold tracking-wider"
              style={{
                background: `${statusColors[agent.status]}20`,
                color: statusColors[agent.status],
              }}
            >
              {agent.status}
            </span>
          </div>
          <div className="text-[10px] text-gray-500 truncate">
            {classConfig?.title || agent.class} • Lv.{agent.level}
          </div>
        </div>
      </div>

      {/* Resource bars */}
      <div className="space-y-1.5">
        {/* Health = API Usage */}
        <StatusBar
          value={agent.usagePercent}
          max={100}
          color="#22c55e"
          label="Usage"
        />

        {/* Mana = Context */}
        <StatusBar
          value={contextPercent}
          max={100}
          color="#3b82f6"
          label="Context"
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
    <div className="fixed top-20 left-4 w-72 z-40">
      {/* Header */}
      <div className="flex items-center justify-between mb-2 px-1">
        <span className="text-xs font-bold text-cyan-400 uppercase tracking-widest">
          Party ({agentList.length})
        </span>
        {attentionCount > 0 && (
          <span className="text-xs font-bold text-yellow-400 animate-pulse flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-yellow-400" />
            {attentionCount} need attention
          </span>
        )}
      </div>

      {/* Agent frames */}
      <div className="space-y-2 max-h-[calc(100vh-160px)] overflow-y-auto pr-1 scrollbar-thin">
        {sortedAgents.map((agent) => (
          <AgentFrame
            key={agent.id}
            agent={agent}
            isSelected={selectedAgentIds.has(agent.id)}
          />
        ))}
      </div>
    </div>
  );
}
