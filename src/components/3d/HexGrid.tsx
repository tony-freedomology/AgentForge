import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameStore } from '../../stores/gameStore';
import { hexToPixel, HEX_SIZE } from '../../utils/hexUtils';
import type { HexTile } from '../../types/agent';

// Terrain colors (Warcraft-inspired)
const TERRAIN_COLORS: Record<HexTile['type'], string> = {
  grass: '#2d5a27',
  stone: '#5a5a5a',
  water: '#1a4a6e',
  forest: '#1a3d1a',
  portal: '#6b21a8',
};

const TERRAIN_EMISSIVE: Record<HexTile['type'], string> = {
  grass: '#000000',
  stone: '#000000',
  water: '#0a2a4e',
  forest: '#000000',
  portal: '#9333ea',
};

interface HexMeshProps {
  tile: HexTile;
  onClick?: () => void;
}

function HexMesh({ tile, onClick }: HexMeshProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [x, z] = hexToPixel(tile.q, tile.r);

  const isSelected = useGameStore((s) => {
    if (!tile.occupiedBy) return false;
    return s.selectedAgentIds.has(tile.occupiedBy);
  });

  const isHovered = useGameStore((s) => s.hoveredAgentId === tile.occupiedBy);

  // Create hex geometry (rotated to lay flat)
  const geometry = useMemo(() => {
    const shape = new THREE.Shape();
    const size = HEX_SIZE * 0.95; // Slight gap between hexes

    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI / 3) * i - Math.PI / 6;
      const px = size * Math.cos(angle);
      const py = size * Math.sin(angle);
      if (i === 0) {
        shape.moveTo(px, py);
      } else {
        shape.lineTo(px, py);
      }
    }
    shape.closePath();

    const extrudeSettings = {
      depth: 0.1 + tile.elevation * 0.5,
      bevelEnabled: true,
      bevelThickness: 0.05,
      bevelSize: 0.05,
      bevelSegments: 2,
    };

    const geo = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    geo.rotateX(-Math.PI / 2); // Rotate to lay flat
    return geo;
  }, [tile.elevation]);

  // Animate portal
  useFrame((state) => {
    if (tile.type === 'portal' && meshRef.current) {
      const material = meshRef.current.material as THREE.MeshStandardMaterial;
      material.emissiveIntensity = 0.5 + Math.sin(state.clock.elapsedTime * 2) * 0.3;
    }
  });

  const baseColor = TERRAIN_COLORS[tile.type];
  const emissiveColor = TERRAIN_EMISSIVE[tile.type];

  // Apply fog of war
  const fogMultiplier = tile.fogOfWar ? 0.3 : tile.revealed ? 1 : 0.5;

  return (
    <mesh
      ref={meshRef}
      geometry={geometry}
      position={[x, tile.type === 'water' ? -0.2 : 0, z]}
      onClick={onClick}
      receiveShadow
      castShadow
    >
      <meshStandardMaterial
        color={baseColor}
        emissive={emissiveColor}
        emissiveIntensity={tile.type === 'portal' ? 0.5 : 0}
        roughness={tile.type === 'water' ? 0.1 : 0.8}
        metalness={tile.type === 'stone' ? 0.3 : 0.1}
        opacity={fogMultiplier}
        transparent={tile.fogOfWar}
      />
      {/* Selection ring */}
      {(isSelected || isHovered) && (
        <mesh position={[0, 0.15, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[HEX_SIZE * 0.8, HEX_SIZE * 0.9, 6]} />
          <meshBasicMaterial
            color={isSelected ? '#22c55e' : '#fbbf24'}
            side={THREE.DoubleSide}
            transparent
            opacity={0.6}
          />
        </mesh>
      )}
    </mesh>
  );
}

// Trees for forest tiles
function ForestDecoration({ tile }: { tile: HexTile }) {
  const [x, z] = hexToPixel(tile.q, tile.r);
  const trees = useMemo(() => {
    const positions: [number, number, number][] = [];
    const count = 2 + Math.floor(Math.random() * 3);
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const dist = Math.random() * HEX_SIZE * 0.5;
      positions.push([
        x + Math.cos(angle) * dist,
        0.3 + Math.random() * 0.3,
        z + Math.sin(angle) * dist,
      ]);
    }
    return positions;
  }, [x, z]);

  return (
    <group>
      {trees.map((pos, i) => (
        <group key={i} position={pos}>
          {/* Trunk */}
          <mesh position={[0, 0.3, 0]} castShadow>
            <cylinderGeometry args={[0.05, 0.08, 0.6, 6]} />
            <meshStandardMaterial color="#4a3728" roughness={0.9} />
          </mesh>
          {/* Foliage */}
          <mesh position={[0, 0.8, 0]} castShadow>
            <coneGeometry args={[0.3, 0.8, 6]} />
            <meshStandardMaterial color="#1a4a1a" roughness={0.8} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

// Rocks for stone tiles
function StoneDecoration({ tile }: { tile: HexTile }) {
  const [x, z] = hexToPixel(tile.q, tile.r);
  const rocks = useMemo(() => {
    const positions: { pos: [number, number, number]; scale: number; rotation: number }[] = [];
    const count = 1 + Math.floor(Math.random() * 3);
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const dist = Math.random() * HEX_SIZE * 0.4;
      positions.push({
        pos: [
          x + Math.cos(angle) * dist,
          0.15 + tile.elevation * 0.5,
          z + Math.sin(angle) * dist,
        ],
        scale: 0.15 + Math.random() * 0.2,
        rotation: Math.random() * Math.PI,
      });
    }
    return positions;
  }, [x, z, tile.elevation]);

  return (
    <group>
      {rocks.map((rock, i) => (
        <mesh
          key={i}
          position={rock.pos}
          rotation={[0, rock.rotation, 0]}
          scale={rock.scale}
          castShadow
        >
          <dodecahedronGeometry args={[1, 0]} />
          <meshStandardMaterial color="#6b6b6b" roughness={0.9} />
        </mesh>
      ))}
    </group>
  );
}

// Portal effect
function PortalEffect({ tile }: { tile: HexTile }) {
  const [x, z] = hexToPixel(tile.q, tile.r);
  const ringRef = useRef<THREE.Mesh>(null);
  const particlesRef = useRef<THREE.Points>(null);

  useFrame((state) => {
    if (ringRef.current) {
      ringRef.current.rotation.z = state.clock.elapsedTime * 0.5;
    }
    if (particlesRef.current) {
      particlesRef.current.rotation.y = state.clock.elapsedTime * 0.3;
      const positions = particlesRef.current.geometry.attributes.position;
      for (let i = 0; i < positions.count; i++) {
        const y = positions.getY(i);
        positions.setY(i, y + 0.01);
        if (y > 2) {
          positions.setY(i, 0);
        }
      }
      positions.needsUpdate = true;
    }
  });

  // Particle positions
  const particlePositions = useMemo(() => {
    const positions = new Float32Array(50 * 3);
    for (let i = 0; i < 50; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = 0.3 + Math.random() * 0.4;
      positions[i * 3] = Math.cos(angle) * radius;
      positions[i * 3 + 1] = Math.random() * 2;
      positions[i * 3 + 2] = Math.sin(angle) * radius;
    }
    return positions;
  }, []);

  return (
    <group position={[x, 0.3, z]}>
      {/* Glowing ring */}
      <mesh ref={ringRef} rotation={[-Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.6, 0.08, 16, 32]} />
        <meshStandardMaterial
          color="#9333ea"
          emissive="#9333ea"
          emissiveIntensity={1}
          transparent
          opacity={0.8}
        />
      </mesh>

      {/* Inner glow */}
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.5, 32]} />
        <meshBasicMaterial color="#c084fc" transparent opacity={0.4} />
      </mesh>

      {/* Particles */}
      <points ref={particlesRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[particlePositions, 3]}
          />
        </bufferGeometry>
        <pointsMaterial size={0.05} color="#e879f9" transparent opacity={0.8} />
      </points>

      {/* Light */}
      <pointLight color="#9333ea" intensity={2} distance={5} />
    </group>
  );
}

export function HexGrid() {
  const hexGrid = useGameStore((s) => s.hexGrid);

  const tiles = useMemo(() => Array.from(hexGrid.values()), [hexGrid]);

  return (
    <group>
      {/* Base hexes */}
      {tiles.map((tile) => (
        <HexMesh key={`${tile.q},${tile.r}`} tile={tile} />
      ))}

      {/* Decorations */}
      {tiles.map((tile) => {
        if (tile.type === 'forest') {
          return <ForestDecoration key={`forest-${tile.q},${tile.r}`} tile={tile} />;
        }
        if (tile.type === 'stone') {
          return <StoneDecoration key={`stone-${tile.q},${tile.r}`} tile={tile} />;
        }
        if (tile.type === 'portal') {
          return <PortalEffect key={`portal-${tile.q},${tile.r}`} tile={tile} />;
        }
        return null;
      })}

      {/* Water plane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.15, 0]}>
        <planeGeometry args={[50, 50]} />
        <meshStandardMaterial
          color="#0a2a4e"
          transparent
          opacity={0.6}
          roughness={0.1}
          metalness={0.3}
        />
      </mesh>
    </group>
  );
}
