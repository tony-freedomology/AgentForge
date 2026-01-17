import { useRef, useMemo } from 'react';
import { useTexture, Billboard, Text } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { Vector3, Group } from 'three';
import * as THREE from 'three';
import { hexToPixel } from '../../utils/hexUtils';

interface AgentUnitProps {
  id: string;
  type: 'architect' | 'guardian' | 'engineer' | 'mage' | 'scout';
  q: number;
  r: number;
  isSelected?: boolean;
  onClick?: () => void;
  name?: string;
  status: string;
}

const CLASS_CONFIG = {
  architect: {
    color: '#a855f7', // Purple
    texture: '/assets/sprites/architect.png',
    scale: 2.5,
  },
  guardian: {
    color: '#3b82f6', // Blue
    texture: '/assets/sprites/guardian.png',
    scale: 2.8,
  },
  artisan: {
    color: '#f97316', // Orange
    texture: '/assets/sprites/artisan.png',
    scale: 2.4,
  },
  mage: {
    color: '#ef4444', // Red
    texture: '/assets/sprites/mage.png',
    scale: 2.5,
  },
  scout: {
    color: '#22c55e', // Green
    texture: '/assets/sprites/scout.png',
    scale: 2.2,
  },
  engineer: {
    color: '#f97316', // Orange
    texture: '/assets/sprites/artisan.png',
    scale: 2.4,
  },
};

export function AgentUnit({ id, type, q, r, isSelected, onClick, name, status }: AgentUnitProps) {
  const group = useRef<Group>(null);
  const [x, z] = hexToPixel(q, r);
  const config = CLASS_CONFIG[type];

  // Load textures
  const texture = useTexture(config.texture);
  const selectionTexture = useTexture('/assets/textures/selection_ring.png');

  // Animation for hovering/floating effect
  useFrame((state) => {
    if (group.current) {
      // Smooth movement to target position
      const targetPos = new Vector3(x, 0.5, z);
      group.current.position.lerp(targetPos, 0.1);

      // Floating animation for sprite
      const sprite = group.current.getObjectByName('sprite-group');
      if (sprite) {
        sprite.position.y = Math.sin(state.clock.elapsedTime * 2) * 0.1 + 1.2;
      }

      // Rotate selection ring
      const ring = group.current.getObjectByName('selection-ring');
      if (ring) {
        ring.rotation.z -= 0.02;
      }
    }
  });

  return (
    <group ref={group} position={[x, 0.5, z]} onClick={(e) => { e.stopPropagation(); onClick?.(); }} userData={{ isAgent: true }}>
      {/* Selection Ring (Ground) */}
      {isSelected && (
        <mesh name="selection-ring" rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.05, 0]}>
          <planeGeometry args={[3, 3]} />
          <meshBasicMaterial
            map={selectionTexture}
            transparent
            opacity={0.8}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
            color={config.color}
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
              opacity={0.5}
              color={config.color}
              blending={THREE.AdditiveBlending}
            />
          </mesh>

          {/* Actual Sprite */}
          {/* Note: Using a custom shader or alpha test would be better for black backgrounds, 
              but for now using additive blending for a "holographic" look which fits the cyber theme 
              and handles the black background nicely. */}
          <mesh>
            <planeGeometry args={[config.scale, config.scale]} />
            <meshBasicMaterial
              map={texture}
              transparent
              // If the assets have black backgrounds, additive blending or a custom shader is needed
              // Since we generated them on black, let's try AdditiveBlending for a "holo-projection" effect
              // OR use alphaTest if we assume they are mostly black.
              // Let's go with Additive for the cool cyber look.
              blending={THREE.AdditiveBlending}
              depthWrite={false}
            />
          </mesh>

          {/* Name Tag */}
          <Text
            position={[0, config.scale / 2 + 0.3, 0]}
            fontSize={0.3}
            color="white"
            anchorX="center"
            anchorY="middle"
            outlineWidth={0.02}
            outlineColor="black"
          >
            {name || `${type.toUpperCase()} ${id.slice(0, 4)}`}
          </Text>

          {/* Status Text under name */}
          <Text
            position={[0, config.scale / 2, 0]}
            fontSize={0.15}
            color={config.color}
            anchorX="center"
            anchorY="middle"
          >
            {status}
          </Text>

          {/* Health/Energy Bar */}
          <group position={[0, config.scale / 2 + 0.5, 0]}>
            <mesh position={[-0.5, 0, 0]}>
              <planeGeometry args={[1, 0.05]} />
              <meshBasicMaterial color="gray" />
            </mesh>
            <mesh position={[-0.5, 0, 0.01]} scale={[0.8, 1, 1]}> {/* 80% health example */}
              <planeGeometry args={[1, 0.05]} />
              <meshBasicMaterial color={config.color} />
            </mesh>
          </group>

        </Billboard>
      </group>
    </group>
  );
}
