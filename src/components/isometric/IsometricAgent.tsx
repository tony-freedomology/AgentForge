/**
 * IsometricAgent - Renders an individual agent in the isometric world
 *
 * Features:
 * - Directional sprites with east-west mirroring
 * - Activity status bubble above agent
 * - Selection ring when selected
 * - Smooth position interpolation
 */

import { useState, useRef, useEffect } from 'react';
import { extend, useTick } from '@pixi/react';
import { Graphics, Text, TextStyle, Ticker, Sprite, Texture } from 'pixi.js';
import { gridToScreen, TILE_HEIGHT } from '../../utils/isoCoords';
import { assetLoader } from '../../utils/assetLoader';
import { soundManager } from '../../services/soundManager';
import type { Agent, AgentActivity } from '../../types/agent';

extend({ Graphics, Text, Sprite });

// Map activity to asset id
const ACTIVITY_ASSET_MAP: Record<AgentActivity, string> = {
  idle: 'activity_waiting',
  thinking: 'activity_thinking',
  researching: 'activity_researching',
  reading: 'activity_reading',
  writing: 'activity_writing',
  testing: 'activity_testing',
  building: 'activity_building',
  git: 'activity_git',
  waiting: 'activity_waiting',
  error: 'activity_error',
};

// Activity labels for text display
const ACTIVITY_LABELS: Record<AgentActivity, string> = {
  idle: 'Idle',
  thinking: 'Thinking',
  researching: 'Researching',
  reading: 'Reading',
  writing: 'Writing',
  testing: 'Testing',
  building: 'Building',
  git: 'Git',
  waiting: 'Waiting',
  error: 'Error',
};

// Movement configuration
const MOVE_SPEED = 4; // Grid units per second

// Map agent provider to sprite type
const PROVIDER_SPRITE_MAP: Record<string, 'claude' | 'codex' | 'gemini'> = {
  claude: 'claude',
  codex: 'codex',
  gemini: 'gemini',
};

// Activity colors for bubble background
const ACTIVITY_COLORS: Record<AgentActivity, number> = {
  idle: 0x6b7280,
  thinking: 0x8b5cf6,
  researching: 0x06b6d4,
  reading: 0x3b82f6,
  writing: 0x10b981,
  testing: 0xf59e0b,
  building: 0xef4444,
  git: 0x22c55e,
  waiting: 0xeab308,
  error: 0xef4444,
};

interface IsometricAgentProps {
  agent: Agent;
  isSelected: boolean;
  onSelect: (agentId: string) => void;
  onSpawnEffect?: (x: number, y: number, type: 'spawn' | 'teleport') => void;
}

// Direction type including mirrored directions
type Direction = 's' | 'sw' | 'w' | 'nw' | 'n' | 'ne' | 'e' | 'se';
type SpriteDirection = 's' | 'sw' | 'w' | 'nw';

export function IsometricAgent({ agent, isSelected, onSelect, onSpawnEffect }: IsometricAgentProps) {
  // Convert hex coordinates to isometric grid position
  const targetX = agent.position.q + 5; // Center on grid
  const targetY = agent.position.r + 5;

  // Handle agent click
  const handleClick = () => {
    onSelect(agent.id);
    soundManager.play('agent_select');
  };

  // Play attention sound periodically when agent needs attention
  const lastAttentionSound = useRef(0);
  useEffect(() => {
    if (!agent.needsAttention) return;

    const interval = setInterval(() => {
      const now = Date.now();
      if (now - lastAttentionSound.current > 5000) { // Every 5 seconds
        soundManager.play('agent_attention', { volume: 0.6 });
        lastAttentionSound.current = now;
      }
    }, 1000);

    // Play immediately on first attention
    if (lastAttentionSound.current === 0) {
      soundManager.play('agent_attention');
      lastAttentionSound.current = Date.now();
    }

    return () => clearInterval(interval);
  }, [agent.needsAttention]);

  const [currentPosition, setCurrentPosition] = useState({ x: targetX, y: targetY });
  const [direction, setDirection] = useState<Direction>('s');
  const [isMoving, setIsMoving] = useState(false);
  const wasMoving = useRef(false);
  const hasSpawned = useRef(false);

  // Trigger spawn effect on first render
  useEffect(() => {
    if (!hasSpawned.current && onSpawnEffect) {
      const screenPos = gridToScreen(targetX, targetY);
      onSpawnEffect(screenPos.x, screenPos.y - 30, 'spawn');
      hasSpawned.current = true;
    }
  }, [targetX, targetY, onSpawnEffect]);

  // Animate movement
  useTick((ticker: Ticker) => {
    const dx = targetX - currentPosition.x;
    const dy = targetY - currentPosition.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance > 0.01) {
      const speed = MOVE_SPEED * (ticker.deltaTime / 60);

      if (distance < speed) {
        setCurrentPosition({ x: targetX, y: targetY });
        setIsMoving(false);

        // Trigger arrival effect
        if (wasMoving.current && onSpawnEffect) {
          const arrivalPos = gridToScreen(targetX, targetY);
          onSpawnEffect(arrivalPos.x, arrivalPos.y - 30, 'teleport');
          wasMoving.current = false;
        }
      } else {
        const nx = dx / distance;
        const ny = dy / distance;
        setCurrentPosition((prev) => ({
          x: prev.x + nx * speed,
          y: prev.y + ny * speed,
        }));
        setIsMoving(true);
        wasMoving.current = true;
        setDirection(getDirectionFromDelta(dx, dy));
      }
    }
  });

  const screenPos = gridToScreen(currentPosition.x, currentPosition.y);
  const zIndex = Math.floor(currentPosition.x + currentPosition.y) + 100;

  // Get sprite direction and whether to flip
  const { spriteDirection, flipX } = getSpriteDirectionAndFlip(direction);
  const animation = isMoving || agent.activity === 'writing' ? 'walk' : 'idle';
  const spriteType = PROVIDER_SPRITE_MAP[agent.provider] || 'claude';
  const spriteId = `${spriteType}_${animation}_${spriteDirection}`;
  const agentTexture = assetLoader.getTexture(spriteId);

  // Activity bubble info
  const activityAssetId = ACTIVITY_ASSET_MAP[agent.activity];
  const activityTexture = assetLoader.getTexture(activityAssetId);
  const activityLabel = ACTIVITY_LABELS[agent.activity];
  const showActivityBubble = agent.activity !== 'idle' || agent.needsAttention;

  return (
    <pixiContainer
      x={screenPos.x}
      y={screenPos.y}
      zIndex={zIndex}
      eventMode="static"
      cursor="pointer"
      onClick={handleClick}
    >
      {/* Selection ring */}
      {isSelected && (
        <pixiGraphics
          draw={(g: Graphics) => {
            g.clear();
            g.circle(0, -48, 30);
            g.stroke({ color: 0xf59e0b, width: 3, alpha: 0.8 });
          }}
        />
      )}

      {/* Agent sprite */}
      {agentTexture && agentTexture !== Texture.WHITE ? (
        <pixiSprite
          texture={agentTexture}
          anchor={{ x: 0.5, y: 1 }}
          y={TILE_HEIGHT / 2}
          scale={{ x: flipX ? -1 : 1, y: 1 }}
        />
      ) : (
        <pixiGraphics
          draw={(g: Graphics) => {
            g.clear();
            // Agent body
            const color = getProviderColor(agent.provider);
            g.circle(0, -20, 18);
            g.fill({ color });
            g.circle(0, -20, 12);
            g.fill({ color: lightenColor(color), alpha: 0.6 });
            // Shadow
            g.ellipse(0, 0, 14, 7);
            g.fill({ color: 0x000000, alpha: 0.3 });
            // Eyes
            g.circle(-5, -22, 3);
            g.circle(5, -22, 3);
            g.fill({ color: 0xffffff, alpha: 0.9 });
          }}
        />
      )}

      {/* Activity bubble */}
      {showActivityBubble && (
        <pixiContainer y={-85}>
          {/* Bubble background */}
          <pixiGraphics
            draw={(g: Graphics) => {
              g.clear();
              const bubbleColor = agent.needsAttention ? 0xef4444 : ACTIVITY_COLORS[agent.activity];
              // Rounded rectangle bubble
              g.roundRect(-40, -15, 80, 30, 8);
              g.fill({ color: 0x1a1a2e, alpha: 0.95 });
              g.stroke({ color: bubbleColor, width: 2 });
              // Pointer triangle
              g.moveTo(-5, 15);
              g.lineTo(0, 22);
              g.lineTo(5, 15);
              g.fill({ color: 0x1a1a2e });
              g.stroke({ color: bubbleColor, width: 2 });
            }}
          />
          {/* Activity icon sprite */}
          {activityTexture && activityTexture !== Texture.WHITE && !agent.needsAttention && (
            <pixiSprite
              texture={activityTexture}
              anchor={{ x: 0.5, y: 0.5 }}
              x={-22}
              scale={{ x: 0.5, y: 0.5 }}
            />
          )}
          {/* Activity text */}
          <pixiText
            text={agent.needsAttention ? '❓ Input' : activityLabel}
            x={activityTexture && activityTexture !== Texture.WHITE && !agent.needsAttention ? 8 : 0}
            anchor={{ x: 0.5, y: 0.5 }}
            style={new TextStyle({
              fontFamily: 'monospace',
              fontSize: 11,
              fontWeight: 'bold',
              fill: agent.needsAttention ? 0xef4444 : ACTIVITY_COLORS[agent.activity],
            })}
          />
        </pixiContainer>
      )}

      {/* Agent name label */}
      <pixiText
        text={agent.name}
        y={-60}
        anchor={{ x: 0.5, y: 0.5 }}
        style={new TextStyle({
          fontFamily: 'monospace',
          fontSize: 10,
          fontWeight: 'bold',
          fill: 0xffffff,
          stroke: { color: 0x000000, width: 2 },
        })}
      />

      {/* Attention pulse effect */}
      {agent.needsAttention && (
        <pixiGraphics
          draw={(g: Graphics) => {
            g.clear();
            const pulse = (Date.now() % 1000) / 1000;
            const alpha = 0.3 + Math.sin(pulse * Math.PI * 2) * 0.2;
            g.circle(0, -30, 35 + pulse * 10);
            g.stroke({ color: 0xef4444, width: 2, alpha });
          }}
        />
      )}
    </pixiContainer>
  );
}

/**
 * Calculate 8-direction from movement delta
 */
function getDirectionFromDelta(dx: number, dy: number): Direction {
  const angle = Math.atan2(dy, dx) * (180 / Math.PI);

  // 8 directions, 45 degrees each
  if (angle >= -22.5 && angle < 22.5) return 'e';
  if (angle >= 22.5 && angle < 67.5) return 'se';
  if (angle >= 67.5 && angle < 112.5) return 's';
  if (angle >= 112.5 && angle < 157.5) return 'sw';
  if (angle >= 157.5 || angle < -157.5) return 'w';
  if (angle >= -157.5 && angle < -112.5) return 'nw';
  if (angle >= -112.5 && angle < -67.5) return 'n';
  return 'ne';
}

/**
 * Get sprite direction and whether to flip for 8-direction support
 * We only have s, sw, w, nw sprites - mirror for n, ne, e, se
 */
function getSpriteDirectionAndFlip(direction: Direction): { spriteDirection: SpriteDirection; flipX: boolean } {
  switch (direction) {
    case 's': return { spriteDirection: 's', flipX: false };
    case 'sw': return { spriteDirection: 'sw', flipX: false };
    case 'w': return { spriteDirection: 'w', flipX: false };
    case 'nw': return { spriteDirection: 'nw', flipX: false };
    case 'n': return { spriteDirection: 's', flipX: false }; // Use south, no flip (facing away)
    case 'ne': return { spriteDirection: 'sw', flipX: true }; // Mirror southwest
    case 'e': return { spriteDirection: 'w', flipX: true };  // Mirror west
    case 'se': return { spriteDirection: 'sw', flipX: true }; // Mirror southwest
    default: return { spriteDirection: 's', flipX: false };
  }
}

/**
 * Get color for agent provider
 */
function getProviderColor(provider: string): number {
  switch (provider) {
    case 'claude': return 0x8b5cf6; // Purple
    case 'codex': return 0x22c55e;  // Green
    case 'gemini': return 0x3b82f6; // Blue
    default: return 0x8b5cf6;
  }
}

/**
 * Lighten a color for glow effect
 */
function lightenColor(color: number): number {
  const r = Math.min(255, ((color >> 16) & 0xff) + 40);
  const g = Math.min(255, ((color >> 8) & 0xff) + 40);
  const b = Math.min(255, (color & 0xff) + 40);
  return (r << 16) | (g << 8) | b;
}

export default IsometricAgent;
