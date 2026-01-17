import { useRef, useMemo, useState, useEffect } from 'react';
import { useTexture, Billboard, Html } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { Vector3, Group } from 'three';
import * as THREE from 'three';
import { hexToPixel } from '../../utils/hexUtils';
import type { Agent } from '../../types/agent';
import { ACTIVITY_ICONS } from '../../types/agent';
import { getAgentClass } from '../../config/agentClasses';

interface AgentUnitProps {
  agent: Agent;
  isSelected?: boolean;
  onClick?: () => void;
}

const CLASS_CONFIG: Record<string, { color: string; texture: string; scale: number }> = {
  architect: {
    color: '#a855f7',
    texture: '/assets/sprites/architect.png',
    scale: 2.5,
  },
  guardian: {
    color: '#3b82f6',
    texture: '/assets/sprites/guardian.png',
    scale: 2.8,
  },
  artisan: {
    color: '#f97316',
    texture: '/assets/sprites/artisan.png',
    scale: 2.4,
  },
  mage: {
    color: '#ef4444',
    texture: '/assets/sprites/mage.png',
    scale: 2.5,
  },
  scout: {
    color: '#22c55e',
    texture: '/assets/sprites/scout.png',
    scale: 2.2,
  },
  engineer: {
    color: '#f97316',
    texture: '/assets/sprites/artisan.png',
    scale: 2.4,
  },
  designer: {
    color: '#f59e0b',
    texture: '/assets/sprites/artisan.png',
    scale: 2.4,
  },
};

// Floating status indicator component
function StatusIndicator({ agent, yOffset }: { agent: Agent; yOffset: number }) {
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

  const getAttentionIcon = () => {
    switch (agent.attentionReason) {
      case 'error': return '!';
      case 'waiting_input': return '?';
      case 'task_complete': return '✓';
      case 'idle_timeout': return '💤';
      default: return '!';
    }
  };

  const getAttentionColor = () => {
    switch (agent.attentionReason) {
      case 'error': return '#ef4444';
      case 'waiting_input': return '#eab308';
      case 'task_complete': return '#22c55e';
      default: return '#f59e0b';
    }
  };

  // Don't show activity badge for idle agents without attention needed
  const showActivityBadge = agent.activity !== 'idle' || agent.needsAttention;

  return (
    <Html
      position={[0, yOffset, 0]}
      center
      style={{ pointerEvents: 'none', userSelect: 'none' }}
    >
      <div className="flex flex-col items-center gap-1">
        {/* Attention beacon */}
        {agent.needsAttention && (
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center text-base font-bold transition-all duration-150"
            style={{
              background: attentionFlash ? getAttentionColor() : `${getAttentionColor()}90`,
              boxShadow: attentionFlash
                ? `0 0 15px ${getAttentionColor()}, 0 0 30px ${getAttentionColor()}80`
                : `0 0 8px ${getAttentionColor()}60`,
              transform: attentionFlash ? 'scale(1.15)' : 'scale(1)',
              color: 'white',
            }}
          >
            {getAttentionIcon()}
          </div>
        )}

        {/* Activity badge */}
        {showActivityBadge && (
          <div
            className="px-2 py-1 rounded-md text-[10px] font-bold flex items-center gap-1 whitespace-nowrap"
            style={{
              background: `linear-gradient(135deg, ${activityInfo.color}50, ${activityInfo.color}30)`,
              border: `1px solid ${activityInfo.color}70`,
              boxShadow: `0 0 8px ${activityInfo.color}40`,
              color: 'white',
            }}
          >
            <span>{activityInfo.icon}</span>
            <span>{activityInfo.label}</span>
          </div>
        )}

        {/* Name plate */}
        <div
          className="px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider"
          style={{
            background: `${classColor}40`,
            border: `1px solid ${classColor}60`,
            color: 'white',
          }}
        >
          {agent.name}
        </div>
      </div>
    </Html>
  );
}

export function AgentUnit({ agent, isSelected, onClick }: AgentUnitProps) {
  const group = useRef<Group>(null);
  const [x, z] = hexToPixel(agent.position.q, agent.position.r);
  const config = CLASS_CONFIG[agent.class] || CLASS_CONFIG.mage;

  // Load textures
  const texture = useTexture(config.texture);
  const selectionTexture = useTexture('/assets/textures/selection_ring.png');

  // Determine if agent needs visual emphasis
  const needsEmphasis = agent.needsAttention || agent.status === 'working';

  // Animation for hovering/floating effect
  useFrame((state) => {
    if (group.current) {
      // Smooth movement to target position
      const targetPos = new Vector3(x, 0.5, z);
      group.current.position.lerp(targetPos, 0.1);

      // Floating animation for sprite - more pronounced when working
      const sprite = group.current.getObjectByName('sprite-group');
      if (sprite) {
        const floatSpeed = agent.status === 'working' ? 3 : 2;
        const floatAmount = agent.status === 'working' ? 0.15 : 0.1;
        sprite.position.y = Math.sin(state.clock.elapsedTime * floatSpeed) * floatAmount + 1.2;
      }

      // Rotate selection ring
      const ring = group.current.getObjectByName('selection-ring');
      if (ring) {
        ring.rotation.z -= isSelected ? 0.03 : 0.02;
      }
    }
  });

  // Selection ring color based on state
  const ringColor = useMemo(() => {
    if (agent.needsAttention) {
      return agent.attentionReason === 'error' ? '#ef4444' : '#eab308';
    }
    return config.color;
  }, [agent.needsAttention, agent.attentionReason, config.color]);

  return (
    <group
      ref={group}
      position={[x, 0.5, z]}
      onClick={(e) => { e.stopPropagation(); onClick?.(); }}
      userData={{ isAgent: true }}
    >
      {/* Selection Ring (Ground) */}
      {(isSelected || agent.needsAttention) && (
        <mesh name="selection-ring" rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.05, 0]}>
          <planeGeometry args={[3.5, 3.5]} />
          <meshBasicMaterial
            map={selectionTexture}
            transparent
            opacity={agent.needsAttention ? 0.9 : 0.7}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
            color={ringColor}
          />
        </mesh>
      )}

      {/* Attention pulse ring */}
      {agent.needsAttention && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, 0]}>
          <ringGeometry args={[1.8, 2.2, 32]} />
          <meshBasicMaterial
            transparent
            opacity={0.6}
            color={agent.attentionReason === 'error' ? '#ef4444' : '#eab308'}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      )}

      {/* Main Sprite Billboard */}
      <group name="sprite-group">
        <Billboard follow={true} lockX={false} lockY={false} lockZ={false}>
          {/* Shadow/Glow behind sprite */}
          <mesh position={[0, 0, -0.1]}>
            <planeGeometry args={[config.scale, config.scale]} />
            <meshBasicMaterial
              map={texture}
              transparent
              opacity={needsEmphasis ? 0.7 : 0.5}
              color={config.color}
              blending={THREE.AdditiveBlending}
            />
          </mesh>

          {/* Actual Sprite */}
          <mesh>
            <planeGeometry args={[config.scale, config.scale]} />
            <meshBasicMaterial
              map={texture}
              transparent
              blending={THREE.AdditiveBlending}
              depthWrite={false}
            />
          </mesh>
        </Billboard>

        {/* Status indicator floating above */}
        <StatusIndicator agent={agent} yOffset={config.scale / 2 + 0.8} />
      </group>
    </group>
  );
}
