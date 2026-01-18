import { useState, useCallback, useMemo } from 'react';
import { useGameStore } from '../../stores/gameStore';
import type { Agent, AgentClass, AgentProvider, Command } from '../../types/agent';
import {
  Wand2,
  Wrench,
  Search,
  Shield,
  Building2,
  Zap,
  Users,
  Eye,
  Scroll,
  BookOpen,
  Hand
} from 'lucide-react';

const CLASS_ICONS: Record<AgentClass, React.ReactNode> = {
  mage: <Wand2 className="w-5 h-5" />,
  engineer: <Wrench className="w-5 h-5" />,
  scout: <Search className="w-5 h-5" />,
  guardian: <Shield className="w-5 h-5" />,
  architect: <Building2 className="w-5 h-5" />,
  designer: <Wand2 className="w-5 h-5" />,
};

const CLASS_DESCRIPTIONS: Record<AgentClass, string> = {
  mage: 'Claude Mage - Versatile spellcaster',
  engineer: 'Codex Engineer - Rune scribe',
  scout: 'Swift explorer agent',
  guardian: 'Sentinel of the realm',
  architect: 'Grand builder',
  designer: 'Artisan illusionist',
};

const COMMANDS: Command[] = [
  {
    id: 'task',
    name: 'Issue Decree',
    icon: 'MessageSquare',
    hotkey: 'T',
    description: 'Command selected units',
    requiresSelection: true,
    action: 'task',
  },
  {
    id: 'stop',
    name: 'Halt',
    icon: 'Square',
    hotkey: 'S',
    description: 'Cease all actions',
    requiresSelection: true,
    action: 'stop',
  },
  {
    id: 'focus',
    name: 'Scry',
    icon: 'Eye',
    hotkey: 'F',
    description: 'Focus vision on unit',
    requiresSelection: true,
    action: 'focus',
  },
  {
    id: 'terminal',
    name: 'Chronicle',
    icon: 'Terminal',
    hotkey: 'V',
    description: 'Read unit history',
    requiresSelection: true,
    action: 'terminal',
  },
  {
    id: 'dismiss',
    name: 'Banish',
    icon: 'Trash2',
    hotkey: 'Delete',
    description: 'Dismiss unit from realm',
    requiresSelection: true,
    action: 'dismiss',
  },
];

const ICON_MAP: Record<string, React.ReactNode> = {
  MessageSquare: <Scroll className="w-5 h-5" />,
  Square: <Hand className="w-5 h-5" />,
  Eye: <Eye className="w-5 h-5" />,
  Terminal: <BookOpen className="w-5 h-5" />,
  Trash2: <Zap className="w-5 h-5" />,
};

interface SpawnMenuProps {
  onSpawn: (provider: AgentProvider, agentClass: AgentClass) => void;
  onClose: () => void;
}

function SpawnMenu({ onSpawn, onClose }: SpawnMenuProps) {
  const resources = useGameStore((s) => s.resources);

  const spawnOptions: { provider: AgentProvider; class: AgentClass; name: string; cost: number }[] = [
    { provider: 'claude', class: 'mage', name: 'Claude Mage', cost: 5 },
    { provider: 'codex', class: 'engineer', name: 'Codex Engineer', cost: 3 },
    { provider: 'claude', class: 'scout', name: 'Claude Scout', cost: 2 },
    { provider: 'claude', class: 'guardian', name: 'Claude Guardian', cost: 4 },
    { provider: 'claude', class: 'architect', name: 'Claude Architect', cost: 6 },
  ];

  return (
    <div className="absolute bottom-full left-0 mb-2 bg-stone-900/95 border-2 border-amber-900/50 rounded-xl p-4 min-w-[300px] overflow-hidden shadow-2xl">
      {/* Corner accents */}
      <div className="corner-accent top-left" style={{ borderColor: '#d97706' }} />
      <div className="corner-accent top-right" style={{ borderColor: '#d97706' }} />
      <div className="corner-accent bottom-left" style={{ borderColor: '#d97706' }} />
      <div className="corner-accent bottom-right" style={{ borderColor: '#d97706' }} />

      <div className="text-amber-500 font-bold mb-3 text-sm uppercase tracking-wider flex items-center gap-2 relative z-10 font-serif drop-shadow-sm">
        <Zap className="w-4 h-4" />
        Summon Unit
      </div>
      <div className="space-y-1.5 relative z-10">
        {spawnOptions.map((opt) => {
          const canAfford = resources.gold.current >= opt.cost && resources.souls.current < resources.souls.max;
          return (
            <button
              key={`${opt.provider}-${opt.class}`}
              onClick={() => canAfford && onSpawn(opt.provider, opt.class)}
              disabled={!canAfford}
              className={`w-full flex items-center gap-3 p-2.5 rounded-lg transition-all border ${canAfford
                ? 'hover:bg-amber-900/20 hover:border-amber-600/50 border-transparent text-amber-50'
                : 'opacity-40 cursor-not-allowed text-stone-500 border-transparent'
                }`}
            >
              <div className="text-amber-400 drop-shadow-[0_0_6px_rgba(251,191,36,0.4)]">{CLASS_ICONS[opt.class]}</div>
              <div className="flex-1 text-left">
                <div className="font-semibold text-sm font-serif tracking-wide">{opt.name}</div>
                <div className="text-xs text-stone-400 italic">{CLASS_DESCRIPTIONS[opt.class]}</div>
              </div>
              <div className="text-amber-400 text-sm flex items-center gap-1 font-bold">
                <span>{opt.cost}</span>
                <span className="text-base">💰</span>
              </div>
            </button>
          );
        })}
      </div>
      <button
        onClick={onClose}
        className="mt-3 w-full text-center text-xs text-stone-500 hover:text-amber-400 transition-colors relative z-10 font-serif"
      >
        Withdraw (Esc)
      </button>
    </div>
  );
}

interface TaskDialogProps {
  agents: Agent[];
  onSubmit: (prompt: string) => void;
  onClose: () => void;
}

function TaskDialog({ agents, onSubmit, onClose }: TaskDialogProps) {
  const [prompt, setPrompt] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim()) {
      onSubmit(prompt.trim());
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-stone-900/95 border-2 border-amber-900/60 rounded-xl p-5 w-[520px] max-w-[90vw] overflow-hidden shadow-2xl relative">
        {/* Corner accents */}
        <div className="corner-accent top-left" style={{ borderColor: '#d97706' }} />
        <div className="corner-accent top-right" style={{ borderColor: '#d97706' }} />
        <div className="corner-accent bottom-left" style={{ borderColor: '#d97706' }} />
        <div className="corner-accent bottom-right" style={{ borderColor: '#d97706' }} />

        <div className="flex items-center gap-2.5 mb-4 relative z-10">
          <Scroll className="w-5 h-5 text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]" />
          <span className="text-amber-400 font-bold uppercase tracking-wider font-serif">
            Issue Decree
          </span>
        </div>

        <div className="mb-4 flex items-center gap-2 text-sm text-stone-400 relative z-10">
          <Users className="w-4 h-4" />
          <span className="font-serif">
            To: <span className="text-amber-200">{agents.map((a) => a.name).join(', ')}</span>
          </span>
        </div>

        <form onSubmit={handleSubmit} className="relative z-10">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Inscribe your command here..."
            className="w-full h-32 bg-black/40 border border-stone-700/60 rounded-lg p-3.5 text-amber-50 placeholder-stone-600 resize-none focus:outline-none focus:border-amber-500/50 transition-colors font-serif"
            autoFocus
          />

          <div className="flex justify-end gap-3 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-stone-400 hover:text-amber-200 transition-colors font-medium font-serif"
            >
              Withdraw
            </button>
            <button
              type="submit"
              disabled={!prompt.trim()}
              className="px-6 py-2 bg-amber-700 hover:bg-amber-600 text-white rounded-lg disabled:opacity-30 disabled:cursor-not-allowed font-bold uppercase tracking-wide shadow-lg border border-amber-500/30"
            >
              ⚡ Cast Spell
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

interface TerminalViewProps {
  agent: Agent;
  onClose: () => void;
}

function TerminalView({ agent, onClose }: TerminalViewProps) {
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-stone-900 border-2 border-amber-700/50 rounded-lg w-[700px] max-w-[90vw] max-h-[80vh] flex flex-col shadow-2xl">
        <div className="flex items-center justify-between p-3 border-b border-stone-800 bg-stone-950/50">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-amber-400" />
            <span className="text-amber-400 font-bold font-serif tracking-wide">
              {agent.name}'s Chronicle
            </span>
            <span
              className={`px-2 py-0.5 rounded text-xs uppercase font-bold tracking-wider ${agent.status === 'working'
                ? 'bg-amber-900/50 text-amber-200 border border-amber-700'
                : agent.status === 'error'
                  ? 'bg-red-900/50 text-red-200 border border-red-700'
                  : 'bg-emerald-900/50 text-emerald-200 border border-emerald-700'
                }`}
            >
              {agent.status}
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-stone-500 hover:text-amber-200"
          >
            ×
          </button>
        </div>

        <div className="flex-1 overflow-auto p-4 font-mono text-sm bg-black/90 text-stone-300">
          {agent.terminalOutput.map((line, i) => (
            <div key={i} className="whitespace-pre-wrap mb-1">
              <span className="text-stone-600 mr-2 opacity-50">Build {i + 100} ::</span>
              <span className={line.startsWith('>') ? 'text-amber-400 font-bold' : 'text-stone-300'}>{line}</span>
            </div>
          ))}
          {agent.terminalOutput.length === 0 && (
            <div className="text-stone-600 italic font-serif">The pages are blank...</div>
          )}
        </div>
      </div>
    </div>
  );
}

export function CommandPanel() {
  const [showSpawnMenu, setShowSpawnMenu] = useState(false);
  const [showTaskDialog, setShowTaskDialog] = useState(false);
  const [showTerminal, setShowTerminal] = useState(false);

  const showCommandPanel = useGameStore((s) => s.showCommandPanel);
  const selectedAgentIds = useGameStore((s) => s.selectedAgentIds);
  const agents = useGameStore((s) => s.agents);
  const spawnAgent = useGameStore((s) => s.spawnAgent);
  const removeAgent = useGameStore((s) => s.removeAgent);
  const addAgentTask = useGameStore((s) => s.addAgentTask);
  const updateAgentStatus = useGameStore((s) => s.updateAgentStatus);
  const addTerminalOutput = useGameStore((s) => s.addTerminalOutput);
  const hexGrid = useGameStore((s) => s.hexGrid);

  const selectedAgents = useMemo(() => {
    return Array.from(selectedAgentIds)
      .map((id) => agents.get(id))
      .filter(Boolean) as Agent[];
  }, [selectedAgentIds, agents]);

  const hasSelection = selectedAgents.length > 0;

  // Find empty hex near portal for spawning
  const findSpawnPosition = useCallback(() => {
    const portal = Array.from(hexGrid.values()).find((h) => h.type === 'portal');
    if (!portal) return { q: 0, r: 0, y: 0 };

    // Find empty neighboring hex
    const neighbors = [
      { q: 1, r: 0 },
      { q: 1, r: -1 },
      { q: 0, r: -1 },
      { q: -1, r: 0 },
      { q: -1, r: 1 },
      { q: 0, r: 1 },
    ];

    for (const dir of neighbors) {
      const q = portal.q + dir.q;
      const r = portal.r + dir.r;
      const hex = hexGrid.get(`${q},${r}`);
      if (hex && !hex.occupied && hex.type !== 'water') {
        return { q, r, y: 0 };
      }
    }

    // Expand search
    for (let _dist = 2; _dist <= 4; _dist++) {
      for (const [, hex] of hexGrid.entries()) {
        if (!hex.occupied && hex.type !== 'water' && hex.type !== 'portal') {
          return { q: hex.q, r: hex.r, y: 0 };
        }
      }
    }

    return { q: 1, r: 0, y: 0 };
  }, [hexGrid]);

  const handleSpawn = useCallback(
    (provider: AgentProvider, agentClass: AgentClass) => {
      const position = findSpawnPosition();
      spawnAgent(provider, agentClass, '', position);
      setShowSpawnMenu(false);
    },
    [spawnAgent, findSpawnPosition]
  );

  const handleCommand = useCallback(
    (command: Command) => {
      switch (command.action) {
        case 'task':
          setShowTaskDialog(true);
          break;
        case 'stop':
          selectedAgents.forEach((agent) => {
            updateAgentStatus(agent.id, 'idle');
            addTerminalOutput(agent.id, `[${new Date().toLocaleTimeString()}] Decree halted by commander`);
          });
          break;
        case 'focus':
          // Camera focus handled by store
          break;
        case 'terminal':
          if (selectedAgents.length === 1) {
            setShowTerminal(true);
          }
          break;
        case 'dismiss':
          selectedAgents.forEach((agent) => {
            removeAgent(agent.id);
          });
          break;
      }
    },
    [selectedAgents, updateAgentStatus, addTerminalOutput, removeAgent]
  );

  const handleTaskSubmit = useCallback(
    (prompt: string) => {
      selectedAgents.forEach((agent) => {
        addAgentTask(agent.id, { prompt });
        updateAgentStatus(agent.id, 'working');
        addTerminalOutput(agent.id, `[${new Date().toLocaleTimeString()}] New decree received: ${prompt}`);
      });
      setShowTaskDialog(false);
    },
    [selectedAgents, addAgentTask, updateAgentStatus, addTerminalOutput]
  );

  if (!showCommandPanel) return null;

  return (
    <>
      <div className="absolute bottom-4 right-4 flex gap-3">
        {/* Selected agent info */}
        {hasSelection && (
          <div className="bg-stone-900/90 border-2 border-amber-900/50 rounded-xl p-3.5 min-w-[220px] overflow-hidden shadow-xl backdrop-blur-sm">
            <div className="corner-accent top-left" style={{ borderColor: '#d97706', opacity: 0.5 }} />
            <div className="corner-accent top-right" style={{ borderColor: '#d97706', opacity: 0.5 }} />
            <div className="corner-accent bottom-left" style={{ borderColor: '#d97706', opacity: 0.5 }} />
            <div className="corner-accent bottom-right" style={{ borderColor: '#d97706', opacity: 0.5 }} />

            <div className="text-amber-500 font-bold text-sm uppercase tracking-wider mb-2.5 relative z-10 flex items-center gap-2 font-serif drop-shadow-sm">
              <span className="animate-pulse">●</span> Selected ({selectedAgents.length})
            </div>
            <div className="space-y-2.5 max-h-[150px] overflow-auto relative z-10 custom-scrollbar">
              {selectedAgents.slice(0, 5).map((agent) => (
                <div key={agent.id} className="flex items-center gap-2.5">
                  <div className="text-amber-400 drop-shadow-[0_0_4px_rgba(251,191,36,0.3)]">{CLASS_ICONS[agent.class]}</div>
                  <div className="flex-1">
                    <div className="text-stone-200 text-sm font-medium font-serif tracking-wide">{agent.name}</div>
                    <div className="text-xs text-stone-500 capitalize">{agent.status}</div>
                  </div>
                  <div className="text-right">
                    <div className="w-16 h-1.5 bg-black/60 rounded-full overflow-hidden shadow-inner border border-stone-800">
                      <div
                        className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 rounded-full"
                        style={{ width: `${agent.health}%`, boxShadow: '0 0 6px rgba(16, 185, 129, 0.4)' }}
                      />
                    </div>
                    <div className="w-16 h-1.5 bg-black/60 rounded-full overflow-hidden mt-1 shadow-inner border border-stone-800">
                      <div
                        className="h-full bg-gradient-to-r from-blue-600 to-cyan-400 rounded-full"
                        style={{ width: `${agent.mana}%`, boxShadow: '0 0 6px rgba(6, 182, 212, 0.4)' }}
                      />
                    </div>
                  </div>
                </div>
              ))}
              {selectedAgents.length > 5 && (
                <div className="text-xs text-stone-500 italic">
                  +{selectedAgents.length - 5} more
                </div>
              )}
            </div>
          </div>
        )}

        {/* Command buttons */}
        <div className="bg-stone-900/90 border-2 border-amber-900/50 rounded-xl p-2.5 overflow-hidden shadow-xl backdrop-blur-sm">
          <div className="corner-accent top-left" style={{ borderColor: '#d97706', opacity: 0.5 }} />
          <div className="corner-accent top-right" style={{ borderColor: '#d97706', opacity: 0.5 }} />
          <div className="corner-accent bottom-left" style={{ borderColor: '#d97706', opacity: 0.5 }} />
          <div className="corner-accent bottom-right" style={{ borderColor: '#d97706', opacity: 0.5 }} />

          <div className="grid grid-cols-3 gap-1.5 relative z-10">
            {/* Spawn button */}
            <div className="relative">
              <button
                onClick={() => setShowSpawnMenu(!showSpawnMenu)}
                className="w-14 h-14 bg-gradient-to-b from-amber-900/40 to-orange-900/40 hover:from-amber-800/50 hover:to-orange-800/50 border border-amber-500/40 rounded-lg flex flex-col items-center justify-center text-amber-400 transition-all hover:shadow-[0_0_12px_rgba(245,158,11,0.25)]"
                title="Summon Unit (N)"
              >
                <Zap className="w-5 h-5 drop-shadow-[0_0_4px_rgba(251,191,36,0.5)]" />
                <span className="text-[10px] mt-0.5 font-bold">N</span>
              </button>
              {showSpawnMenu && (
                <SpawnMenu
                  onSpawn={handleSpawn}
                  onClose={() => setShowSpawnMenu(false)}
                />
              )}
            </div>

            {/* Command buttons */}
            {COMMANDS.map((cmd) => (
              <button
                key={cmd.id}
                onClick={() => handleCommand(cmd)}
                disabled={cmd.requiresSelection && !hasSelection}
                className={`w-14 h-14 border rounded-lg flex flex-col items-center justify-center transition-all ${cmd.requiresSelection && !hasSelection
                  ? 'bg-black/40 border-stone-800/30 text-stone-700 cursor-not-allowed'
                  : 'bg-black/20 hover:bg-amber-900/30 border-stone-700/40 text-stone-400 hover:text-amber-400 hover:border-amber-500/30 hover:shadow-[0_0_8px_rgba(245,158,11,0.15)]'
                  }`}
                title={`${cmd.description} (${cmd.hotkey})`}
              >
                {ICON_MAP[cmd.icon]}
                <span className="text-[10px] mt-0.5 font-medium">{cmd.hotkey}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Dialogs */}
      {showTaskDialog && selectedAgents.length > 0 && (
        <TaskDialog
          agents={selectedAgents}
          onSubmit={handleTaskSubmit}
          onClose={() => setShowTaskDialog(false)}
        />
      )}

      {showTerminal && selectedAgents.length === 1 && (
        <TerminalView
          agent={selectedAgents[0]}
          onClose={() => setShowTerminal(false)}
        />
      )}
    </>
  );
}
