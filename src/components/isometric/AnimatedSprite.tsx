/**
 * AnimatedSprite Component for Isometric Agents
 *
 * Features:
 * - Directional sprite selection (8 directions)
 * - Animation state machine (idle, walk, cast, celebrate)
 * - Smooth position interpolation for movement
 * - Falls back to placeholder graphics when sprites aren't loaded
 */

import { useEffect, useState, useRef } from 'react';
import { extend, useTick } from '@pixi/react';
import { AnimatedSprite as PixiAnimatedSprite, Graphics, Ticker } from 'pixi.js';
import { assetLoader } from '../../utils/assetLoader';
import { gridToScreen } from '../../utils/isoCoords';

// Register AnimatedSprite for JSX use
extend({ AnimatedSprite: PixiAnimatedSprite, Graphics });

// Animation states
export type AnimationState = 'idle' | 'walk' | 'cast' | 'celebrate';

// 8-direction system
export type Direction = 's' | 'sw' | 'w' | 'nw' | 'n' | 'ne' | 'e' | 'se';

// Agent types
export type AgentType = 'claude' | 'codex' | 'gemini';

// Colors for placeholder rendering
const AGENT_COLORS: Record<AgentType, { primary: number; glow: number }> = {
  claude: { primary: 0x8b5cf6, glow: 0xa855f7 }, // Purple
  codex: { primary: 0x22c55e, glow: 0x4ade80 }, // Green
  gemini: { primary: 0x3b82f6, glow: 0x60a5fa }, // Blue
};

interface AnimatedSpriteProps {
  agentType: AgentType;
  gridX: number;
  gridY: number;
  targetX?: number;
  targetY?: number;
  animationState?: AnimationState;
  direction?: Direction;
  isSelected?: boolean;
  onArrival?: () => void;
}

// Movement speed (grid units per second)
const MOVE_SPEED = 3;

export function AgentSprite({
  agentType,
  gridX,
  gridY,
  targetX,
  targetY,
  animationState = 'idle',
  direction = 's',
  isSelected = false,
  onArrival,
}: AnimatedSpriteProps) {
  // Current interpolated position
  const [currentX, setCurrentX] = useState(gridX);
  const [currentY, setCurrentY] = useState(gridY);
  const [currentDirection, setCurrentDirection] = useState<Direction>(direction);
  const [currentState, setCurrentState] = useState<AnimationState>(animationState);

  // Refs for movement interpolation
  const positionRef = useRef({ x: gridX, y: gridY });
  const targetRef = useRef({ x: targetX ?? gridX, y: targetY ?? gridY });
  const isMoving = useRef(false);

  // Update target when props change
  useEffect(() => {
    if (targetX !== undefined && targetY !== undefined) {
      targetRef.current = { x: targetX, y: targetY };
      isMoving.current = true;
      setCurrentState('walk');

      // Calculate direction towards target
      const dx = targetX - positionRef.current.x;
      const dy = targetY - positionRef.current.y;
      setCurrentDirection(getDirectionFromDelta(dx, dy));
    }
  }, [targetX, targetY]);

  // Movement tick
  useTick((ticker: Ticker) => {
    if (!isMoving.current) return;

    const delta = ticker.deltaTime / 60; // Convert to seconds
    const speed = MOVE_SPEED * delta;

    const dx = targetRef.current.x - positionRef.current.x;
    const dy = targetRef.current.y - positionRef.current.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < speed) {
      // Arrived
      positionRef.current = { ...targetRef.current };
      setCurrentX(targetRef.current.x);
      setCurrentY(targetRef.current.y);
      isMoving.current = false;
      setCurrentState('idle');
      onArrival?.();
    } else {
      // Move towards target
      const nx = dx / distance;
      const ny = dy / distance;
      positionRef.current.x += nx * speed;
      positionRef.current.y += ny * speed;
      setCurrentX(positionRef.current.x);
      setCurrentY(positionRef.current.y);

      // Update direction
      setCurrentDirection(getDirectionFromDelta(dx, dy));
    }
  });

  // Get screen position
  const screenPos = gridToScreen(currentX, currentY);

  // Try to get animation frames from loaded assets
  const spritesheet = assetLoader.getSpritesheet(agentType);
  const animationKey = `${currentState}_${currentDirection}`;
  const frames = spritesheet?.animations?.[animationKey];

  // If we have loaded sprites, use AnimatedSprite
  if (frames && frames.length > 0) {
    return (
      <pixiAnimatedSprite
        textures={frames}
        x={screenPos.x}
        y={screenPos.y - 48} // Offset for sprite height
        anchor={{ x: 0.5, y: 1 }}
        animationSpeed={0.15}
        loop={true}
        autoUpdate={true}
        zIndex={Math.floor(currentX) + Math.floor(currentY) + 100}
      />
    );
  }

  // Fallback to placeholder graphics
  const colors = AGENT_COLORS[agentType];

  return (
    <pixiGraphics
      x={screenPos.x}
      y={screenPos.y}
      zIndex={Math.floor(currentX) + Math.floor(currentY) + 100}
      draw={(g: Graphics) => {
        g.clear();

        // Selection ring
        if (isSelected) {
          g.circle(0, -20, 22);
          g.stroke({ color: 0xf59e0b, width: 2, alpha: 0.8 });
        }

        // Agent body
        g.circle(0, -20, 18);
        g.fill({ color: colors.primary });

        // Inner glow
        g.circle(0, -20, 12);
        g.fill({ color: colors.glow, alpha: 0.6 });

        // Shadow
        g.ellipse(0, 0, 14, 7);
        g.fill({ color: 0x000000, alpha: 0.3 });

        // Direction indicator (eyes looking in movement direction)
        const eyeOffset = getEyeOffset(currentDirection);
        g.circle(-5 + eyeOffset.x, -22 + eyeOffset.y, 3);
        g.circle(5 + eyeOffset.x, -22 + eyeOffset.y, 3);
        g.fill({ color: 0xffffff, alpha: 0.9 });

        // Walking animation indicator
        if (currentState === 'walk') {
          const wobble = Math.sin(Date.now() / 100) * 2;
          g.circle(0, -20 + wobble, 18);
          g.stroke({ color: colors.glow, width: 1, alpha: 0.3 });
        }
      }}
    />
  );
}

/**
 * Calculate direction from movement delta
 */
function getDirectionFromDelta(dx: number, dy: number): Direction {
  const angle = Math.atan2(dy, dx) * (180 / Math.PI);

  // Map angle to 8 directions
  // Note: In isometric, the visual directions are different from cartesian
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
 * Get eye offset based on direction
 */
function getEyeOffset(direction: Direction): { x: number; y: number } {
  const offsets: Record<Direction, { x: number; y: number }> = {
    n: { x: 0, y: -2 },
    ne: { x: 2, y: -1 },
    e: { x: 3, y: 0 },
    se: { x: 2, y: 1 },
    s: { x: 0, y: 2 },
    sw: { x: -2, y: 1 },
    w: { x: -3, y: 0 },
    nw: { x: -2, y: -1 },
  };
  return offsets[direction];
}

export default AgentSprite;
