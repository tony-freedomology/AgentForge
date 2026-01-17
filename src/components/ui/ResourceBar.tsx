import { useGameStore } from '../../stores/gameStore';

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
    <div className="flex items-center gap-3 px-6 py-3 bg-gradient-to-b from-gray-800/90 to-gray-900/90 rounded-lg border border-gray-700/60 shadow-lg relative overflow-hidden group">
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
          <span className="text-gray-500 text-xs font-medium">/ {formatNumber(max)}</span>
        </div>
        <div className="w-full h-1.5 bg-gray-950/60 rounded-full overflow-hidden shadow-inner">
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

export function ResourceBar() {
  const resources = useGameStore((s) => s.resources);
  const agents = useGameStore((s) => s.agents);
  const isPaused = useGameStore((s) => s.isPaused);
  const togglePause = useGameStore((s) => s.togglePause);

  const workingCount = Array.from(agents.values()).filter((a) => a.status === 'working').length;
  const idleCount = Array.from(agents.values()).filter((a) => a.status === 'idle').length;
  const errorCount = Array.from(agents.values()).filter((a) => a.status === 'error').length;

  return (
    <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-black/90 via-blue-950/50 to-transparent">
      {/* Main resource bar */}
      <div className="flex items-center justify-between px-5 py-3">
        {/* Logo / Title */}
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="text-2xl font-black tracking-tight bg-gradient-to-br from-cyan-300 via-cyan-400 to-blue-600 bg-clip-text text-transparent drop-shadow-lg"
              style={{ textShadow: '0 0 30px rgba(6, 182, 212, 0.3)' }}>
              AgentForge
            </div>
            {/* Subtle glow behind logo */}
            <div className="absolute inset-0 blur-xl bg-cyan-500/20 -z-10" />
          </div>
          <div className="text-xs text-cyan-400/70 border-l border-cyan-700/30 pl-4 tracking-wide uppercase font-medium">
            Command Your AI Legion
          </div>
        </div>

        {/* Resources */}
        <div className="flex items-center gap-5">
          <ResourceDisplay
            icon={resources.tokens.icon}
            name={resources.tokens.name}
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
              <div className="flex items-center gap-1.5 text-cyan-400">
                <div className="w-2 h-2 rounded-full bg-cyan-400 status-glow-working" />
                <span className="tracking-wide">{workingCount} working</span>
              </div>
            )}
            {idleCount > 0 && (
              <div className="flex items-center gap-1.5 text-purple-400">
                <div className="w-2 h-2 rounded-full bg-purple-400 status-glow-idle" />
                <span className="tracking-wide">{idleCount} idle</span>
              </div>
            )}
            {errorCount > 0 && (
              <div className="flex items-center gap-1.5 text-red-500">
                <div className="w-2 h-2 rounded-full bg-red-500 status-glow-error" />
                <span className="tracking-wide">{errorCount} error</span>
              </div>
            )}
          </div>

          {/* Pause button */}
          <button
            onClick={togglePause}
            className={`arcane-button rounded-md transition-all ${isPaused
              ? 'bg-red-900/30 border-red-500 text-red-300 shadow-[0_0_15px_rgba(239,68,68,0.3)]'
              : 'hover:bg-cyan-900/30'
              } px-6 py-2.5 font-bold tracking-widest text-xs flex items-center justify-center min-w-[120px]`}
          >
            {isPaused ? '▶ RESUME' : '⏸ PAUSE'}
          </button>
        </div>
      </div>

      {/* Decorative border with glow */}
      <div className="glow-line" />
    </div>
  );
}
