/**
 * Command Palette - Quick action interface (Cmd+K style)
 *
 * Provides fast access to all commands and actions via fuzzy search.
 */

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useGameStore } from '../../stores/gameStore';
import { getAgentClass } from '../../config/agentClasses';
import {
  Zap,
  Users,
  Target,
  Trash2,
  EyeOff,
  Map,
  Pause,
  Play,
  Home,
  Volume2,
  VolumeX,
  HelpCircle,
  Command,
} from 'lucide-react';
import { soundManager } from '../../services/soundManager';

// Platform detection for keyboard shortcuts
const isMac = typeof navigator !== 'undefined' && /Mac|iPod|iPhone|iPad/.test(navigator.platform);
const modKey = isMac ? 'Cmd' : 'Ctrl';

interface CommandItem {
  id: string;
  label: string;
  description?: string;
  icon: React.ReactNode;
  shortcut?: string;
  category: 'agents' | 'navigation' | 'view' | 'system';
  action: () => void;
}

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenSpawnDialog: () => void;
  onOpenHelp: () => void;
}

export function CommandPalette({ isOpen, onClose, onOpenSpawnDialog, onOpenHelp }: CommandPaletteProps) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(() => soundManager.isEnabled());
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const agents = useGameStore((s) => s.agents);
  const selectedAgentIds = useGameStore((s) => s.selectedAgentIds);
  const selectAgent = useGameStore((s) => s.selectAgent);
  const selectAgents = useGameStore((s) => s.selectAgents);
  const deselectAll = useGameStore((s) => s.deselectAll);
  const removeAgent = useGameStore((s) => s.removeAgent);
  const toggleMinimap = useGameStore((s) => s.toggleMinimap);
  const togglePause = useGameStore((s) => s.togglePause);
  const isPaused = useGameStore((s) => s.isPaused);
  const setCameraTarget = useGameStore((s) => s.setCameraTarget);
  const showMinimap = useGameStore((s) => s.showMinimap);

  // Sync sound state when palette opens
  useEffect(() => {
    if (isOpen) {
      setSoundEnabled(soundManager.isEnabled());
    }
  }, [isOpen]);

  // Build command list
  const commands = useMemo<CommandItem[]>(() => {
    const cmds: CommandItem[] = [];

    // System commands
    cmds.push({
      id: 'spawn-agent',
      label: 'Summon New Agent',
      description: 'Open the agent spawn dialog',
      icon: <Zap size={16} />,
      shortcut: 'N',
      category: 'agents',
      action: () => {
        onClose();
        onOpenSpawnDialog();
      },
    });

    cmds.push({
      id: 'help',
      label: 'Show Help',
      description: 'Display keyboard shortcuts',
      icon: <HelpCircle size={16} />,
      shortcut: 'F1',
      category: 'system',
      action: () => {
        onClose();
        onOpenHelp();
      },
    });

    cmds.push({
      id: 'toggle-pause',
      label: isPaused ? 'Resume' : 'Pause',
      description: isPaused ? 'Resume operations' : 'Pause all operations',
      icon: isPaused ? <Play size={16} /> : <Pause size={16} />,
      shortcut: 'Space',
      category: 'system',
      action: () => {
        togglePause();
        onClose();
      },
    });

    cmds.push({
      id: 'toggle-minimap',
      label: showMinimap ? 'Hide Minimap' : 'Show Minimap',
      description: 'Toggle the minimap display',
      icon: <Map size={16} />,
      shortcut: 'M',
      category: 'view',
      action: () => {
        toggleMinimap();
        onClose();
      },
    });

    cmds.push({
      id: 'toggle-sound',
      label: soundEnabled ? 'Mute Sound' : 'Unmute Sound',
      description: soundEnabled ? 'Disable audio' : 'Enable audio',
      icon: soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />,
      category: 'system',
      action: () => {
        const newEnabled = !soundEnabled;
        soundManager.setEnabled(newEnabled);
        setSoundEnabled(newEnabled);
        onClose();
      },
    });

    cmds.push({
      id: 'center-portal',
      label: 'Go to Portal',
      description: 'Center camera on spawn portal',
      icon: <Home size={16} />,
      shortcut: 'H',
      category: 'navigation',
      action: () => {
        setCameraTarget([0, 0, 0]);
        onClose();
      },
    });

    // Agent selection commands
    if (agents.size > 0) {
      cmds.push({
        id: 'select-all',
        label: 'Select All Agents',
        description: `Select all ${agents.size} agents`,
        icon: <Users size={16} />,
        shortcut: `${modKey}+A`,
        category: 'agents',
        action: () => {
          selectAgents(Array.from(agents.keys()));
          onClose();
        },
      });

      cmds.push({
        id: 'deselect-all',
        label: 'Deselect All',
        description: 'Clear current selection',
        icon: <EyeOff size={16} />,
        shortcut: 'Esc',
        category: 'agents',
        action: () => {
          deselectAll();
          onClose();
        },
      });
    }

    // Add commands for each agent
    agents.forEach((agent) => {
      const classConfig = getAgentClass(agent.class);
      cmds.push({
        id: `select-${agent.id}`,
        label: `Select ${agent.name}`,
        description: `${classConfig?.title || agent.class} • Level ${agent.level}`,
        icon: <Target size={16} />,
        category: 'agents',
        action: () => {
          selectAgent(agent.id);
          onClose();
        },
      });
    });

    // Delete selected agents command
    if (selectedAgentIds.size > 0) {
      cmds.push({
        id: 'delete-selected',
        label: `Dismiss ${selectedAgentIds.size} Agent${selectedAgentIds.size > 1 ? 's' : ''}`,
        description: 'Remove selected agents',
        icon: <Trash2 size={16} />,
        shortcut: 'Del',
        category: 'agents',
        action: () => {
          selectedAgentIds.forEach((id) => removeAgent(id));
          onClose();
        },
      });
    }

    return cmds;
  }, [
    agents,
    selectedAgentIds,
    isPaused,
    showMinimap,
    soundEnabled,
    onClose,
    onOpenSpawnDialog,
    onOpenHelp,
    togglePause,
    toggleMinimap,
    setCameraTarget,
    selectAgent,
    selectAgents,
    deselectAll,
    removeAgent,
  ]);

  // Filter commands based on query
  const filteredCommands = useMemo(() => {
    if (!query.trim()) return commands;

    const lowerQuery = query.toLowerCase();
    return commands.filter(
      (cmd) =>
        cmd.label.toLowerCase().includes(lowerQuery) ||
        cmd.description?.toLowerCase().includes(lowerQuery) ||
        cmd.category.toLowerCase().includes(lowerQuery)
    );
  }, [commands, query]);

  // Reset selection when filter changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [filteredCommands]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
      setQuery('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  // Scroll selected item into view
  useEffect(() => {
    if (listRef.current) {
      const selectedItem = listRef.current.children[selectedIndex] as HTMLElement;
      if (selectedItem) {
        selectedItem.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [selectedIndex]);

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex((prev) => Math.min(prev + 1, filteredCommands.length - 1));
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex((prev) => Math.max(prev - 1, 0));
          break;
        case 'Enter':
          e.preventDefault();
          if (filteredCommands[selectedIndex]) {
            filteredCommands[selectedIndex].action();
          }
          break;
        case 'Escape':
          e.preventDefault();
          onClose();
          break;
      }
    },
    [filteredCommands, selectedIndex, onClose]
  );

  if (!isOpen) return null;

  const categoryColors: Record<string, string> = {
    agents: '#a855f7',
    navigation: '#3b82f6',
    view: '#22c55e',
    system: '#f59e0b',
  };

  return (
    <div
      className="fixed inset-0 bg-black/70 flex items-start justify-center z-[60] backdrop-blur-sm pt-[15vh]"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Command palette"
    >
      <div
        className="fantasy-panel rounded-xl w-[560px] max-w-[90vw] shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        style={{ boxShadow: '0 0 60px rgba(245, 158, 11, 0.15)' }}
      >
        {/* Search input */}
        <div className="flex items-center gap-3 px-4 py-4 border-b border-white/10">
          <Command size={20} className="text-amber-400" aria-hidden="true" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a command or search..."
            className="flex-1 bg-transparent outline-none text-white placeholder-gray-500 font-medium"
            aria-label="Search commands"
            aria-autocomplete="list"
            aria-controls="command-list"
          />
          <kbd className="px-2 py-1 bg-white/5 rounded text-[10px] text-gray-500 font-mono" aria-hidden="true">ESC</kbd>
        </div>

        {/* Command list */}
        <div ref={listRef} id="command-list" className="max-h-[400px] overflow-y-auto py-2" role="listbox">
          {filteredCommands.length === 0 ? (
            <div className="px-4 py-8 text-center text-gray-500">
              No commands found for "{query}"
            </div>
          ) : (
            filteredCommands.map((cmd, index) => (
              <button
                key={cmd.id}
                onClick={cmd.action}
                onMouseEnter={() => setSelectedIndex(index)}
                className={`
                  w-full flex items-center gap-3 px-4 py-3 text-left transition-colors
                  ${index === selectedIndex ? 'bg-white/10' : 'hover:bg-white/5'}
                `}
                role="option"
                aria-selected={index === selectedIndex}
              >
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{
                    background: `${categoryColors[cmd.category]}20`,
                    color: categoryColors[cmd.category],
                  }}
                >
                  {cmd.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-white font-medium truncate">{cmd.label}</div>
                  {cmd.description && (
                    <div className="text-xs text-gray-500 truncate">{cmd.description}</div>
                  )}
                </div>
                {cmd.shortcut && (
                  <kbd className="px-2 py-1 bg-white/5 rounded text-[10px] text-gray-400 font-mono flex-shrink-0">
                    {cmd.shortcut}
                  </kbd>
                )}
              </button>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2 border-t border-white/10 flex items-center justify-between text-[10px] text-gray-600">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <kbd className="px-1 bg-white/5 rounded">↑↓</kbd> Navigate
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1 bg-white/5 rounded">↵</kbd> Select
            </span>
          </div>
          <span>{filteredCommands.length} commands</span>
        </div>
      </div>
    </div>
  );
}
