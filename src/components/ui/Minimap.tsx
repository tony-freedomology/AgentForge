import { useMemo, useRef, useEffect } from 'react';
import { useGameStore } from '../../stores/gameStore';
import { hexToPixel } from '../../utils/hexUtils';
import type { HexTile } from '../../types/agent';

const MINIMAP_SIZE = 180;
const SCALE = 8; // How much to scale down the world

const TERRAIN_COLORS: Record<HexTile['type'], string> = {
  grass: '#2d5a27',
  stone: '#5a5a5a',
  water: '#1a4a6e',
  forest: '#1a3d1a',
  portal: '#9333ea',
};

const CLASS_COLORS: Record<string, string> = {
  mage: '#3b82f6',
  engineer: '#f59e0b',
  scout: '#22c55e',
  guardian: '#ef4444',
  architect: '#a855f7',
};

export function Minimap() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const hexGrid = useGameStore((s) => s.hexGrid);
  const agents = useGameStore((s) => s.agents);
  const camera = useGameStore((s) => s.camera);
  const selectedAgentIds = useGameStore((s) => s.selectedAgentIds);
  const showMinimap = useGameStore((s) => s.showMinimap);
  const setCameraTarget = useGameStore((s) => s.setCameraTarget);

  const tiles = useMemo(() => Array.from(hexGrid.values()), [hexGrid]);
  const agentList = useMemo(() => Array.from(agents.values()), [agents]);

  // Draw minimap
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, MINIMAP_SIZE, MINIMAP_SIZE);

    const centerX = MINIMAP_SIZE / 2;
    const centerY = MINIMAP_SIZE / 2;

    // Draw hexes
    tiles.forEach((tile) => {
      const [worldX, worldZ] = hexToPixel(tile.q, tile.r);
      const x = centerX + worldX * SCALE;
      const y = centerY + worldZ * SCALE;

      // Apply fog of war
      const alpha = tile.fogOfWar ? 0.3 : tile.revealed ? 1 : 0.5;

      ctx.globalAlpha = alpha;
      ctx.fillStyle = TERRAIN_COLORS[tile.type];

      // Draw hex as small circle for simplicity
      ctx.beginPath();
      ctx.arc(x, y, SCALE * 0.8, 0, Math.PI * 2);
      ctx.fill();
    });

    ctx.globalAlpha = 1;

    // Draw agents
    agentList.forEach((agent) => {
      const [worldX, worldZ] = hexToPixel(agent.position.q, agent.position.r);
      const x = centerX + worldX * SCALE;
      const y = centerY + worldZ * SCALE;

      // Agent dot
      ctx.fillStyle = CLASS_COLORS[agent.class] || '#ffffff';
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fill();

      // Selection ring
      if (selectedAgentIds.has(agent.id)) {
        ctx.strokeStyle = '#22c55e';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(x, y, 6, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Working indicator (pulsing)
      if (agent.status === 'working') {
        const pulse = Math.sin(Date.now() / 200) * 0.3 + 0.7;
        ctx.globalAlpha = pulse;
        ctx.strokeStyle = '#3b82f6';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(x, y, 8, 0, Math.PI * 2);
        ctx.stroke();
        ctx.globalAlpha = 1;
      }
    });

    // Draw camera viewport
    const camX = centerX + camera.target[0] * SCALE;
    const camY = centerY + camera.target[2] * SCALE;
    const viewportSize = 30; // Approximate viewport size

    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1;
    ctx.strokeRect(
      camX - viewportSize / 2,
      camY - viewportSize / 2,
      viewportSize,
      viewportSize
    );
  }, [tiles, agentList, camera, selectedAgentIds]);

  // Handle minimap clicks
  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = MINIMAP_SIZE / 2;
    const centerY = MINIMAP_SIZE / 2;

    const worldX = (x - centerX) / SCALE;
    const worldZ = (y - centerY) / SCALE;

    setCameraTarget([worldX, 0, worldZ]);
  };

  if (!showMinimap) return null;

  return (
    <div className="absolute bottom-4 left-4 rounded-lg overflow-hidden border-2 border-cyan-700/50 shadow-[0_0_15px_rgba(6,182,212,0.2)] fantasy-panel">
      {/* Decorative frame */}
      <div className="absolute inset-0 pointer-events-none z-10">
        <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-cyan-500" />
        <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-cyan-500" />
        <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-cyan-500" />
        <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-cyan-500" />

        {/* Scanline overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-500/5 to-transparent opacity-30 pointer-events-none" />
      </div>

      <canvas
        ref={canvasRef}
        width={MINIMAP_SIZE}
        height={MINIMAP_SIZE}
        onClick={handleClick}
        className="cursor-pointer bg-black/80"
      />

      {/* Legend */}
      <div className="absolute bottom-2 left-2 flex gap-1.5 z-20 bg-black/40 p-1 rounded backdrop-blur-sm">
        {Object.entries(CLASS_COLORS).map(([cls, color]) => (
          <div
            key={cls}
            className="w-2 h-2 rounded-full shadow-sm"
            style={{ backgroundColor: color, boxShadow: `0 0 4px ${color}` }}
            title={cls}
          />
        ))}
      </div>
    </div>
  );
}
