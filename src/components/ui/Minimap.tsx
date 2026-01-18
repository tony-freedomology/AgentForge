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

// Agent class colors (for class-based coloring)
const CLASS_COLORS: Record<string, string> = {
  mage: '#3b82f6',
  engineer: '#f59e0b',
  scout: '#22c55e',
  guardian: '#ef4444',
  architect: '#a855f7',
};

// Agent provider colors (for provider-based coloring)
const PROVIDER_COLORS: Record<string, string> = {
  claude: '#8b5cf6',
  codex: '#22c55e',
  gemini: '#3b82f6',
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

      // Agent dot - use provider color as fallback
      ctx.fillStyle = CLASS_COLORS[agent.class] || PROVIDER_COLORS[agent.provider] || '#f59e0b';
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fill();

      // Add glow effect
      ctx.shadowColor = ctx.fillStyle;
      ctx.shadowBlur = 6;
      ctx.beginPath();
      ctx.arc(x, y, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

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
    <div
      className="absolute bottom-4 left-4 rounded-xl overflow-hidden shadow-[0_0_25px_rgba(245,158,11,0.2)]"
      style={{
        width: MINIMAP_SIZE + 20,
        height: MINIMAP_SIZE + 20,
      }}
    >
      {/* Fantasy frame background */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: 'url(/assets_isometric/ui/panels/panel_minimap_frame.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />

      {/* Fallback decorative frame */}
      <div className="absolute inset-0 pointer-events-none z-10 rounded-xl border-2 border-amber-600/50">
        {/* Corner ornaments */}
        <div className="absolute -top-0.5 -left-0.5 w-5 h-5 border-t-2 border-l-2 border-amber-400 rounded-tl-lg" />
        <div className="absolute -top-0.5 -right-0.5 w-5 h-5 border-t-2 border-r-2 border-amber-400 rounded-tr-lg" />
        <div className="absolute -bottom-0.5 -left-0.5 w-5 h-5 border-b-2 border-l-2 border-amber-400 rounded-bl-lg" />
        <div className="absolute -bottom-0.5 -right-0.5 w-5 h-5 border-b-2 border-r-2 border-amber-400 rounded-br-lg" />

        {/* Inner glow */}
        <div className="absolute inset-2 rounded-lg border border-amber-500/20" />
      </div>

      {/* Canvas container */}
      <div className="absolute inset-[10px] rounded-lg overflow-hidden">
        <canvas
          ref={canvasRef}
          width={MINIMAP_SIZE}
          height={MINIMAP_SIZE}
          onClick={handleClick}
          className="cursor-pointer"
          style={{
            background: 'linear-gradient(135deg, #0a0a1a 0%, #1a1a2e 100%)',
          }}
        />

        {/* Compass markers */}
        <div className="absolute top-1 left-1/2 -translate-x-1/2 text-[9px] font-bold text-amber-400/70">N</div>
        <div className="absolute bottom-1 left-1/2 -translate-x-1/2 text-[9px] font-bold text-amber-400/70">S</div>
        <div className="absolute left-1 top-1/2 -translate-y-1/2 text-[9px] font-bold text-amber-400/70">W</div>
        <div className="absolute right-1 top-1/2 -translate-y-1/2 text-[9px] font-bold text-amber-400/70">E</div>
      </div>

      {/* Legend with provider colors */}
      <div className="absolute bottom-3 left-3 flex gap-1.5 z-20 bg-black/60 px-2 py-1 rounded-lg backdrop-blur-sm border border-amber-500/20">
        {Object.entries(PROVIDER_COLORS).map(([provider, color]) => (
          <div
            key={provider}
            className="w-2.5 h-2.5 rounded-full"
            style={{ backgroundColor: color, boxShadow: `0 0 4px ${color}` }}
            title={provider}
          />
        ))}
      </div>
    </div>
  );
}
