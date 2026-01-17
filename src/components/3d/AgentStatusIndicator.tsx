/**
 * Agent Status Indicator - Floating status above 3D agents
 *
 * Uses @react-three/drei's Html component to render DOM elements
 * in 3D space above each agent.
 */

import { Html } from '@react-three/drei';
import { useEffect, useState } from 'react';
import type { Agent } from '../../types/agent';
import { ACTIVITY_ICONS } from '../../types/agent';
import { getAgentClass } from '../../config/agentClasses';

interface AgentStatusIndicatorProps {
  agent: Agent;
  position: [number, number, number];
}

export function AgentStatusIndicator({ agent, position }: AgentStatusIndicatorProps) {
  const [attentionFlash, setAttentionFlash] = useState(false);
  const activityInfo = ACTIVITY_ICONS[agent.activity];
  const classConfig = getAgentClass(agent.class);
  const classColor = classConfig?.color || '#06b6d4';

  // Attention flash animation
  useEffect(() => {
    if (!agent.needsAttention) {
      setAttentionFlash(false);
      return;
    }

    const timeSinceAttention = agent.attentionSince ? Date.now() - agent.attentionSince : 0;
    const flashSpeed = timeSinceAttention > 30000 ? 200 : timeSinceAttention > 10000 ? 400 : 800;

    const interval = setInterval(() => {
      setAttentionFlash((f) => !f);
    }, flashSpeed);

    return () => clearInterval(interval);
  }, [agent.needsAttention, agent.attentionSince]);

  // Calculate position above the agent
  const indicatorPosition: [number, number, number] = [
    position[0],
    position[1] + 2.5, // Float above the agent
    position[2],
  ];

  const getAttentionIcon = () => {
    switch (agent.attentionReason) {
      case 'error':
        return '❌';
      case 'waiting_input':
        return '❓';
      case 'task_complete':
        return '✓';
      case 'idle_timeout':
        return '💤';
      default:
        return '!';
    }
  };

  const getAttentionColor = () => {
    switch (agent.attentionReason) {
      case 'error':
        return '#ef4444';
      case 'waiting_input':
        return '#eab308';
      case 'task_complete':
        return '#22c55e';
      default:
        return '#f59e0b';
    }
  };

  return (
    <Html
      position={indicatorPosition}
      center
      style={{
        pointerEvents: 'none',
        userSelect: 'none',
      }}
    >
      <div className="flex flex-col items-center gap-1 animate-float-status">
        {/* Attention beacon (if needed) */}
        {agent.needsAttention && (
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-lg font-bold transition-all duration-200"
            style={{
              background: attentionFlash ? getAttentionColor() : `${getAttentionColor()}80`,
              boxShadow: attentionFlash
                ? `0 0 20px ${getAttentionColor()}, 0 0 40px ${getAttentionColor()}80`
                : `0 0 10px ${getAttentionColor()}50`,
              transform: attentionFlash ? 'scale(1.2)' : 'scale(1)',
            }}
          >
            {getAttentionIcon()}
          </div>
        )}

        {/* Activity badge */}
        <div
          className="px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 whitespace-nowrap"
          style={{
            background: `linear-gradient(135deg, ${activityInfo.color}40, ${activityInfo.color}20)`,
            border: `1px solid ${activityInfo.color}60`,
            boxShadow: `0 0 10px ${activityInfo.color}30`,
            color: activityInfo.color,
          }}
        >
          <span className="text-sm">{activityInfo.icon}</span>
          <span>{activityInfo.label}</span>
        </div>

        {/* Agent name plate */}
        <div
          className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider"
          style={{
            background: `${classColor}30`,
            border: `1px solid ${classColor}50`,
            color: classColor,
          }}
        >
          {agent.name}
        </div>
      </div>
    </Html>
  );
}

/**
 * Minimal status indicator for when agent is idle and doesn't need attention
 * Just shows the agent name to reduce visual clutter
 */
export function AgentNameplate({ agent, position }: AgentStatusIndicatorProps) {
  const classConfig = getAgentClass(agent.class);
  const classColor = classConfig?.color || '#06b6d4';

  const nameplatePosition: [number, number, number] = [
    position[0],
    position[1] + 1.8,
    position[2],
  ];

  return (
    <Html
      position={nameplatePosition}
      center
      style={{
        pointerEvents: 'none',
        userSelect: 'none',
      }}
    >
      <div
        className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider opacity-60 hover:opacity-100 transition-opacity"
        style={{
          background: `${classColor}20`,
          border: `1px solid ${classColor}30`,
          color: classColor,
        }}
      >
        {agent.name}
      </div>
    </Html>
  );
}
