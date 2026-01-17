/**
 * Loot Panel - File Artifacts as Fantasy Loot
 *
 * Displays files produced by agents in an inventory-style panel.
 * Files are shown as collectible items with fantasy names and icons.
 * Click to "collect" (open) the file.
 */

import { useState, useMemo } from 'react';
import { useGameStore } from '../../stores/gameStore';
import { getAgentClass } from '../../config/agentClasses';
import { FILE_TYPE_ICONS } from '../../types/agent';
import type { Agent, FileArtifact } from '../../types/agent';
import { Package, ChevronDown, ChevronUp, ExternalLink, Sparkles, Scroll, X } from 'lucide-react';

// Get file icon and fantasy name based on extension
function getFileInfo(path: string): { icon: string; name: string; rarity: 'common' | 'uncommon' | 'rare' | 'epic' } {
  // Check for test files first
  if (path.includes('.test.') || path.includes('.spec.')) {
    return { ...FILE_TYPE_ICONS['.test.ts'] || { icon: '🧪', name: "Alchemist's Notes" }, rarity: 'uncommon' };
  }

  // Get extension
  const ext = path.substring(path.lastIndexOf('.')).toLowerCase();
  const info = FILE_TYPE_ICONS[ext] || { icon: '📄', name: 'Document' };

  // Assign rarity based on file type
  let rarity: 'common' | 'uncommon' | 'rare' | 'epic' = 'common';
  if (['.tsx', '.jsx'].includes(ext)) rarity = 'rare';
  else if (['.ts', '.js'].includes(ext)) rarity = 'uncommon';
  else if (['.css', '.scss'].includes(ext)) rarity = 'uncommon';
  else if (['.json', '.md'].includes(ext)) rarity = 'common';
  else if (['.png', '.jpg', '.svg'].includes(ext)) rarity = 'rare';

  return { ...info, rarity };
}

// Rarity colors
const RARITY_COLORS = {
  common: { border: '#9ca3af', bg: '#9ca3af20', glow: 'none', text: '#9ca3af' },
  uncommon: { border: '#22c55e', bg: '#22c55e20', glow: '0 0 10px #22c55e40', text: '#22c55e' },
  rare: { border: '#3b82f6', bg: '#3b82f620', glow: '0 0 15px #3b82f640', text: '#3b82f6' },
  epic: { border: '#a855f7', bg: '#a855f720', glow: '0 0 20px #a855f740', text: '#a855f7' },
};

// Single loot item component
function LootItem({
  file,
  agentName,
  onCollect
}: {
  file: FileArtifact;
  agentName?: string;
  onCollect: (path: string) => void;
}) {
  const [isHovered, setIsHovered] = useState(false);
  const fileName = file.path.split('/').pop() || file.path;
  const fileInfo = getFileInfo(file.path);
  const rarityStyle = RARITY_COLORS[fileInfo.rarity];

  const typeLabel = file.type === 'created' ? 'NEW' : file.type === 'modified' ? 'MOD' : 'DEL';
  const typeColor = file.type === 'created' ? '#22c55e' : file.type === 'modified' ? '#f59e0b' : '#ef4444';

  return (
    <button
      onClick={() => onCollect(file.path)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group relative w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200"
      style={{
        background: isHovered ? rarityStyle.bg : 'rgba(0,0,0,0.3)',
        border: `1px solid ${isHovered ? rarityStyle.border : 'rgba(255,255,255,0.1)'}`,
        boxShadow: isHovered ? rarityStyle.glow : 'none',
      }}
    >
      {/* Item icon */}
      <div
        className="w-10 h-10 rounded-lg flex items-center justify-center text-xl relative"
        style={{
          background: `linear-gradient(135deg, ${rarityStyle.bg}, transparent)`,
          border: `1px solid ${rarityStyle.border}50`,
        }}
      >
        {fileInfo.icon}
        {isHovered && (
          <Sparkles
            size={12}
            className="absolute -top-1 -right-1 animate-pulse"
            style={{ color: rarityStyle.border }}
          />
        )}
      </div>

      {/* Item info */}
      <div className="flex-1 min-w-0 text-left">
        <div className="flex items-center gap-2">
          <span
            className="font-bold text-sm truncate"
            style={{ color: isHovered ? rarityStyle.text : 'white' }}
          >
            {fileName}
          </span>
          <span
            className="text-[9px] font-bold px-1.5 py-0.5 rounded uppercase"
            style={{ background: `${typeColor}30`, color: typeColor }}
          >
            {typeLabel}
          </span>
        </div>
        <div className="flex items-center gap-2 text-[10px] text-gray-500">
          <span className="truncate">{fileInfo.name}</span>
          {agentName && (
            <>
              <span>•</span>
              <span className="text-gray-600">by {agentName}</span>
            </>
          )}
        </div>
      </div>

      {/* Collect indicator */}
      <div
        className="opacity-0 group-hover:opacity-100 transition-opacity"
        style={{ color: rarityStyle.text }}
      >
        <ExternalLink size={14} />
      </div>

      {/* Rarity indicator */}
      <div
        className="absolute top-0 right-0 w-2 h-2 rounded-full transform translate-x-1 -translate-y-1"
        style={{ background: rarityStyle.border, boxShadow: rarityStyle.glow }}
      />
    </button>
  );
}

// Agent loot section
function AgentLootSection({
  agent,
  isExpanded,
  onToggle,
  onCollect
}: {
  agent: Agent;
  isExpanded: boolean;
  onToggle: () => void;
  onCollect: (path: string) => void;
}) {
  const classConfig = getAgentClass(agent.class);
  const classIcon = classConfig?.icon || '🤖';
  const classColor = classConfig?.color || '#06b6d4';

  // Combine produced files and completed quest files
  const allFiles = useMemo(() => {
    const files: FileArtifact[] = [...agent.producedFiles];
    agent.completedQuests.forEach(quest => {
      quest.producedFiles.forEach(file => {
        if (!files.some(f => f.path === file.path)) {
          files.push(file);
        }
      });
    });
    return files.sort((a, b) => b.timestamp - a.timestamp);
  }, [agent.producedFiles, agent.completedQuests]);

  if (allFiles.length === 0) return null;

  return (
    <div className="rounded-xl overflow-hidden" style={{ border: `1px solid ${classColor}30` }}>
      {/* Agent header */}
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-3 px-4 py-3 transition-colors hover:bg-white/5"
        style={{ background: `linear-gradient(90deg, ${classColor}15, transparent)` }}
      >
        <span className="text-xl">{classIcon}</span>
        <div className="flex-1 text-left">
          <span className="font-bold text-white">{agent.name}</span>
          <span className="text-xs text-gray-500 ml-2">Level {agent.level}</span>
        </div>
        <div className="flex items-center gap-2">
          <span
            className="text-xs font-bold px-2 py-1 rounded-full"
            style={{ background: `${classColor}30`, color: classColor }}
          >
            {allFiles.length} items
          </span>
          {isExpanded ? <ChevronUp size={16} className="text-gray-500" /> : <ChevronDown size={16} className="text-gray-500" />}
        </div>
      </button>

      {/* Loot items */}
      {isExpanded && (
        <div className="p-3 space-y-2 bg-black/20">
          {allFiles.map((file, i) => (
            <LootItem
              key={`${file.path}-${i}`}
              file={file}
              onCollect={onCollect}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// Main Loot Panel component
export function LootPanel() {
  const agents = useGameStore((s) => s.agents);
  const [isOpen, setIsOpen] = useState(false);
  const [expandedAgents, setExpandedAgents] = useState<Set<string>>(new Set());

  // Get all agents with loot
  const agentsWithLoot = useMemo(() => {
    return Array.from(agents.values()).filter(agent => {
      const hasCurrentLoot = agent.producedFiles.length > 0;
      const hasQuestLoot = agent.completedQuests.some(q => q.producedFiles.length > 0);
      return hasCurrentLoot || hasQuestLoot;
    });
  }, [agents]);

  // Total loot count
  const totalLoot = useMemo(() => {
    return agentsWithLoot.reduce((total, agent) => {
      let count = agent.producedFiles.length;
      agent.completedQuests.forEach(q => {
        count += q.producedFiles.length;
      });
      return total + count;
    }, 0);
  }, [agentsWithLoot]);

  const handleToggleAgent = (agentId: string) => {
    setExpandedAgents(prev => {
      const next = new Set(prev);
      if (next.has(agentId)) {
        next.delete(agentId);
      } else {
        next.add(agentId);
      }
      return next;
    });
  };

  const handleCollect = (filePath: string) => {
    // In a real implementation, this would open the file
    // For now, we'll just log it
    console.log('Collecting loot:', filePath);
    // Could integrate with VS Code or system file opener
  };

  if (agentsWithLoot.length === 0) return null;

  return (
    <>
      {/* Toggle button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 left-4 z-40 group fantasy-panel rounded-xl px-4 py-3 flex items-center gap-3 hover:border-amber-500/40 transition-all shadow-lg hover:shadow-[0_0_20px_rgba(245,158,11,0.3)]"
      >
        <div className="relative">
          <Package size={24} className="text-amber-400" />
          {totalLoot > 0 && (
            <span className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-amber-500 text-[10px] font-bold text-black flex items-center justify-center animate-pulse">
              {totalLoot > 99 ? '99+' : totalLoot}
            </span>
          )}
        </div>
        <div className="text-left">
          <div className="text-sm font-bold text-amber-400 uppercase tracking-wider">Loot</div>
          <div className="text-[10px] text-gray-500">{totalLoot} artifacts</div>
        </div>
      </button>

      {/* Loot panel modal */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        >
          <div
            className="fantasy-panel rounded-2xl w-[500px] max-w-[95vw] max-h-[80vh] overflow-hidden flex flex-col shadow-2xl"
            style={{
              borderColor: '#f59e0b40',
              boxShadow: '0 0 60px rgba(245,158,11,0.2)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Corner accents */}
            <div className="corner-accent top-left" style={{ '--accent-color': '#f59e0b' } as React.CSSProperties} />
            <div className="corner-accent top-right" style={{ '--accent-color': '#f59e0b' } as React.CSSProperties} />
            <div className="corner-accent bottom-left" style={{ '--accent-color': '#f59e0b' } as React.CSSProperties} />
            <div className="corner-accent bottom-right" style={{ '--accent-color': '#f59e0b' } as React.CSSProperties} />

            {/* Header */}
            <div
              className="px-6 py-5 border-b flex items-center justify-between"
              style={{
                borderColor: '#f59e0b30',
                background: 'linear-gradient(180deg, rgba(245,158,11,0.1) 0%, transparent 100%)'
              }}
            >
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Package size={32} className="text-amber-400 drop-shadow-[0_0_10px_rgba(245,158,11,0.5)]" />
                  <Sparkles size={14} className="absolute -top-1 -right-1 text-amber-300 animate-pulse" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-yellow-500 uppercase tracking-wider">
                    Treasure Vault
                  </h2>
                  <p className="text-amber-600/60 text-xs mt-0.5">{totalLoot} artifacts collected</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors text-gray-500 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {agentsWithLoot.map(agent => (
                <AgentLootSection
                  key={agent.id}
                  agent={agent}
                  isExpanded={expandedAgents.has(agent.id)}
                  onToggle={() => handleToggleAgent(agent.id)}
                  onCollect={handleCollect}
                />
              ))}
            </div>

            {/* Footer */}
            <div
              className="px-6 py-4 border-t flex items-center justify-between text-xs"
              style={{ borderColor: '#f59e0b20' }}
            >
              <div className="flex items-center gap-2 text-gray-500">
                <Scroll size={14} />
                <span>Click items to open in editor</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full" style={{ background: RARITY_COLORS.common.border }} />
                  <span className="text-gray-500">Common</span>
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full" style={{ background: RARITY_COLORS.uncommon.border }} />
                  <span className="text-gray-500">Uncommon</span>
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full" style={{ background: RARITY_COLORS.rare.border }} />
                  <span className="text-gray-500">Rare</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// Compact loot indicator for agents (shows on agent portrait in PartyFrames)
export function AgentLootIndicator({ agent }: { agent: Agent }) {
  const lootCount = agent.producedFiles.length;

  if (lootCount === 0) return null;

  return (
    <div
      className="absolute -bottom-1 -left-1 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold animate-pulse"
      style={{
        background: 'linear-gradient(135deg, #f59e0b, #d97706)',
        boxShadow: '0 0 10px rgba(245,158,11,0.5)',
        color: '#78350f',
      }}
    >
      {lootCount > 9 ? '9+' : lootCount}
    </div>
  );
}
