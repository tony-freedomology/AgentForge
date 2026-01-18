/**
 * Particle Effects for Isometric World
 *
 * Provides visual feedback effects:
 * - Spawn/teleport particles
 * - Level-up celebration
 * - Magic casting effects
 */

import { useState, useEffect, useRef } from 'react';
import { extend, useTick } from '@pixi/react';
import { Graphics, Ticker } from 'pixi.js';

extend({ Graphics });

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: number;
  size: number;
}

interface ParticleEffectProps {
  x: number;
  y: number;
  type: 'spawn' | 'levelup' | 'teleport' | 'magic';
  color?: number;
  onComplete?: () => void;
}

const EFFECT_CONFIGS = {
  spawn: {
    particleCount: 20,
    colors: [0x8b5cf6, 0xa855f7, 0xc084fc],
    speed: 2,
    life: 60,
    spread: Math.PI * 2,
    gravity: 0.05,
  },
  levelup: {
    particleCount: 40,
    colors: [0xf59e0b, 0xfbbf24, 0xfcd34d, 0xfef3c7],
    speed: 4,
    life: 90,
    spread: Math.PI * 2,
    gravity: -0.03,
  },
  teleport: {
    particleCount: 30,
    colors: [0x3b82f6, 0x60a5fa, 0x93c5fd],
    speed: 3,
    life: 45,
    spread: Math.PI * 2,
    gravity: -0.1,
  },
  magic: {
    particleCount: 15,
    colors: [0x22c55e, 0x4ade80, 0x86efac],
    speed: 1.5,
    life: 40,
    spread: Math.PI * 0.5,
    gravity: 0,
  },
};

export function ParticleEffect({ x, y, type, color, onComplete }: ParticleEffectProps) {
  const [particles, setParticles] = useState<Particle[]>([]);
  const initialized = useRef(false);
  const config = EFFECT_CONFIGS[type];

  // Initialize particles on mount
  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    const newParticles: Particle[] = [];
    for (let i = 0; i < config.particleCount; i++) {
      const angle = (i / config.particleCount) * config.spread - config.spread / 2;
      const speed = config.speed * (0.5 + Math.random() * 0.5);
      const particleColor = color || config.colors[Math.floor(Math.random() * config.colors.length)];

      newParticles.push({
        x: 0,
        y: 0,
        vx: Math.cos(angle - Math.PI / 2) * speed,
        vy: Math.sin(angle - Math.PI / 2) * speed,
        life: config.life * (0.7 + Math.random() * 0.3),
        maxLife: config.life,
        color: particleColor,
        size: 2 + Math.random() * 4,
      });
    }
    setParticles(newParticles);
  }, [config, color]);

  // Update particles
  useTick((ticker: Ticker) => {
    setParticles((prev) => {
      const updated = prev
        .map((p) => ({
          ...p,
          x: p.x + p.vx * ticker.deltaTime * 0.5,
          y: p.y + p.vy * ticker.deltaTime * 0.5,
          vy: p.vy + config.gravity * ticker.deltaTime,
          life: p.life - ticker.deltaTime,
        }))
        .filter((p) => p.life > 0);

      if (updated.length === 0 && prev.length > 0) {
        onComplete?.();
      }

      return updated;
    });
  });

  if (particles.length === 0) return null;

  return (
    <pixiGraphics
      x={x}
      y={y}
      draw={(g: Graphics) => {
        g.clear();
        for (const p of particles) {
          const alpha = Math.max(0, p.life / p.maxLife);
          g.circle(p.x, p.y, p.size * alpha);
          g.fill({ color: p.color, alpha: alpha * 0.8 });
        }
      }}
    />
  );
}

// Hook to manage multiple effects
export function useParticleEffects() {
  const [effects, setEffects] = useState<
    Array<{ id: number; x: number; y: number; type: ParticleEffectProps['type']; color?: number }>
  >([]);
  const nextId = useRef(0);

  const spawnEffect = (
    x: number,
    y: number,
    type: ParticleEffectProps['type'],
    color?: number
  ) => {
    const id = nextId.current++;
    setEffects((prev) => [...prev, { id, x, y, type, color }]);
    return id;
  };

  const removeEffect = (id: number) => {
    setEffects((prev) => prev.filter((e) => e.id !== id));
  };

  const EffectsRenderer = () => (
    <>
      {effects.map((effect) => (
        <ParticleEffect
          key={effect.id}
          x={effect.x}
          y={effect.y}
          type={effect.type}
          color={effect.color}
          onComplete={() => removeEffect(effect.id)}
        />
      ))}
    </>
  );

  return { spawnEffect, EffectsRenderer };
}

export default ParticleEffect;
