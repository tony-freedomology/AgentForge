import { useGameStore } from '../../stores/gameStore';
import { Box, Layers } from 'lucide-react';

function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
}

interface ResourceDisplayProps {
  icon: string;
  name: string;
  current: number;
  max: number;
  color: string;
}

function ResourceDisplay({ icon, current, max, color }: ResourceDisplayProps) {
  const percentage = (current / max) * 100;
  const isLow = percentage < 20;

  return (
    <div className="flex items-center gap-3 px-6 py-3 bg-gradient-to-b from-stone-900/90 to-stone-950/90 rounded-lg border border-amber-900/40 shadow-lg relative overflow-hidden group">
      {/* Subtle inner glow */}
      <div
        className="absolute inset-0 opacity-10 transition-opacity group-hover:opacity-20"
        style={{ background: `radial-gradient(ellipse at 50% 0%, ${color}40, transparent 70%)` }}
      />

      <span className="text-xl relative z-10 drop-shadow-lg">{icon}</span>
      <div className="flex flex-col min-w-[65px] relative z-10">
        <div className="flex items-baseline gap-1">
          <span
            className={`font-bold text-sm tracking-tight ${isLow ? 'text-red-400 animate-pulse' : ''}`}
            style={{ color: isLow ? undefined : color, textShadow: isLow ? 'none' : `0 0 10px ${color}60` }}
          >
            {formatNumber(current)}
          </span>
          <span className="text-stone-500 text-xs font-medium">/ {formatNumber(max)}</span>
        </div>
        <div className="w-full h-1.5 bg-black/60 rounded-full overflow-hidden shadow-inner border border-stone-800">
          <div
            className="h-full transition-all duration-500 ease-out resource-bar-fill rounded-full"
            style={{
              width: `${percentage}%`,
              background: isLow
                ? 'linear-gradient(90deg, #ef4444, #dc2626)'
                : `linear-gradient(90deg, ${color}, ${color}cc)`,
              boxShadow: `0 0 8px ${isLow ? '#ef4444' : color}80`,
            }}
          />
        </div>
      </div>
    </div>
  );
}

interface ResourceBarProps {
  useIsometric?: boolean;
  onToggleView?: (isIsometric: boolean) => void;
}

export function ResourceBar({ useIsometric = true, onToggleView }: ResourceBarProps) {
  const resources = useGameStore((s) => s.resources);
  const agents = useGameStore((s) => s.agents);
  const isPaused = useGameStore((s) => s.isPaused);
  const togglePause = useGameStore((s) => s.togglePause);

  const workingCount = Array.from(agents.values()).filter((a) => a.status === 'working').length;
  const idleCount = Array.from(agents.values()).filter((a) => a.status === 'idle').length;
  const errorCount = Array.from(agents.values()).filter((a) => a.status === 'error').length;

  return (
    <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-stone-950 via-stone-900/80 to-transparent z-50 border-b border-amber-900/20">
      {/* Main resource bar */}
      <div className="flex items-center justify-between px-5 py-3">
        {/* Logo / Title */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="text-2xl font-black tracking-tight bg-gradient-to-br from-amber-300 via-amber-500 to-yellow-600 bg-clip-text text-transparent drop-shadow-md font-serif"
                style={{ textShadow: '0 0 15px rgba(245, 158, 11, 0.3)' }}>
                AgentForge
              </div>
              {/* Subtle glow behind logo */}
              <div className="absolute inset-0 blur-xl bg-amber-500/10 -z-10" />
            </div>
            <div className="text-xs text-amber-700/70 border-l border-amber-900/30 pl-4 tracking-wide uppercase font-medium hidden xl:block font-serif">
              Command Your Arcane Legion
            </div>
          </div>

          {/* View Toggles */}
          {onToggleView && (
            <div className="flex items-center gap-1 bg-black/40 p-1 rounded-lg border border-amber-900/30">
              <button
                onClick={() => onToggleView(false)}
                className={`p-1.5 rounded-md transition-all ${!useIsometric
                  ? 'bg-amber-600/30 text-amber-300 shadow-[0_0_10px_rgba(245,158,11,0.2)] border border-amber-500/30'
                  : 'text-stone-600 hover:text-stone-400 hover:bg-white/5'
                  }`}
                title="3D View"
              >
                <Box size={14} />
              </button>
              <button
                onClick={() => onToggleView(true)}
                className={`p-1.5 rounded-md transition-all ${useIsometric
                  ? 'bg-purple-600/30 text-purple-300 shadow-[0_0_10px_rgba(168,85,247,0.2)] border border-purple-500/30'
                  : 'text-stone-600 hover:text-stone-400 hover:bg-white/5'
                  }`}
                title="Isometric View"
              >
                <Layers size={14} />
              </button>
            </div>
          )}
        </div>

        {/* Resources */}
        <div className="flex items-center gap-5">
          <ResourceDisplay
            icon={resources.tokens.icon}
            name="Runes" // Renamed from Tokens
            current={resources.tokens.current}
            max={resources.tokens.max}
            color={resources.tokens.color}
          />
          <ResourceDisplay
            icon={resources.gold.icon}
            name={resources.gold.name}
            current={resources.gold.current}
            max={resources.gold.max}
            color={resources.gold.color}
          />
          <ResourceDisplay
            icon={resources.mana.icon}
            name={resources.mana.name}
            current={resources.mana.current}
            max={resources.mana.max}
            color={resources.mana.color}
          />
          <ResourceDisplay
            icon={resources.souls.icon}
            name={resources.souls.name}
            current={resources.souls.current}
            max={resources.souls.max}
            color={resources.souls.color}
          />
        </div>

        {/* Status indicators */}
        <div className="flex items-center gap-5">
          {/* Agent status summary */}
          <div className="flex items-center gap-4 text-xs font-medium">
            {workingCount > 0 && (
              <div className="flex items-center gap-1.5 text-amber-400">
                <div className="w-2 h-2 rounded-full bg-amber-400 status-glow-working animate-pulse" />
                <span className="tracking-wide font-serif">{workingCount} casting</span>
              </div>
            )}
            {idleCount > 0 && (
              <div className="flex items-center gap-1.5 text-emerald-400">
                <div className="w-2 h-2 rounded-full bg-emerald-400 status-glow-idle" />
                <span className="tracking-wide font-serif">{idleCount} idle</span>
              </div>
            )}
            {errorCount > 0 && (
              <div className="flex items-center gap-1.5 text-red-500">
                <div className="w-2 h-2 rounded-full bg-red-500 status-glow-error animate-bounce" />
                <span className="tracking-wide font-serif">{errorCount} distrupted</span>
              </div>
            )}
          </div>

          {/* Pause button */}
          <button
            onClick={togglePause}
            className={`arcane-button rounded-md transition-all border ${isPaused
              ? 'bg-red-900/30 border-red-500 text-red-300 shadow-[0_0_15px_rgba(239,68,68,0.3)]'
              : 'bg-stone-800/50 hover:bg-stone-700/50 border-stone-600 text-stone-300'
              } px-6 py-2.5 font-bold tracking-widest text-xs flex items-center justify-center min-w-[120px] font-serif uppercase`}
          >
            {isPaused ? '▶ RESUME' : '⏸ PAUSE'}
          </button>
        </div>
      </div>

      {/* Decorative border with glow */}
      <div className="glow-line bg-gradient-to-r from-transparent via-amber-500/50 to-transparent h-[1px] w-full absolute bottom-0" />
    </div>
  );
}
