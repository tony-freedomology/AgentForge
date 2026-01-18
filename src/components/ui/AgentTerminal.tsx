/**
 * Agent Grimoire (Terminal) Panel
 *
 * Shows historical output and allows sending decrees to selected agents.
 * Designed to feel like a magical tome or scroll.
 */

import { useState, useRef, useEffect, useCallback } from 'react';
import { useGameStore } from '../../stores/gameStore';
import { useAgentBridge } from '../../services/agentBridge';
import { getAgentClass } from '../../config/agentClasses';
import { X, Send, Minimize2, Maximize2, BookOpen, GitBranch, Folder, User, AlertCircle, Scroll } from 'lucide-react';

export function AgentTerminal() {
  const selectedAgentIds = useGameStore((s) => s.selectedAgentIds);
  const agents = useGameStore((s) => s.agents);
  const [input, setInput] = useState('');
  const [isExpanded, setIsExpanded] = useState(true);
  const [isMinimized, setIsMinimized] = useState(false);
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const terminalRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { sendInput } = useAgentBridge();

  // Get selected agent (use first if multiple selected)
  const selectedId = selectedAgentIds.size > 0 ? Array.from(selectedAgentIds)[0] : null;
  const selectedAgent = selectedId ? agents.get(selectedId) : null;

  // Get agent class config for theming
  const agentClass = selectedAgent ? getAgentClass(selectedAgent.class) : null;
  const classColor = agentClass?.color || '#06b6d4';
  const classIcon = agentClass?.icon || '🤖';
  const classTitle = agentClass?.title || 'AI Agent';

  // Auto-scroll terminal
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [selectedAgent?.terminalOutput]);

  // Focus input when agent selected
  useEffect(() => {
    if (selectedAgent && inputRef.current) {
      inputRef.current.focus();
    }
  }, [selectedAgent?.id]);

  // Reset history index when agent changes
  useEffect(() => {
    setHistoryIndex(-1);
  }, [selectedId]);

  const addTerminalOutput = useGameStore((s) => s.addTerminalOutput);
  const startQuest = useGameStore((s) => s.startQuest);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !selectedId) return;

    // Add to command history
    setCommandHistory(prev => {
      const newHistory = [input, ...prev.filter(cmd => cmd !== input)].slice(0, 50);
      return newHistory;
    });
    setHistoryIndex(-1);

    // Echo user prompt to terminal first (so user sees what they typed)
    addTerminalOutput(selectedId, `> ${input}`);

    // Start a quest for this task (if not already on one)
    const agent = agents.get(selectedId);
    if (agent && !agent.currentQuest) {
      startQuest(selectedId, input.trim());
    }

    // Send to real agent
    sendInput(selectedId, input);

    // Clear input
    setInput('');
  }, [input, selectedId, addTerminalOutput, sendInput, agents, startQuest]);

  // Handle keyboard shortcuts including command history
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    // Escape - blur input
    if (e.key === 'Escape') {
      inputRef.current?.blur();
      return;
    }

    // Ctrl+C - send interrupt signal
    if (e.ctrlKey && e.key === 'c') {
      e.preventDefault();
      if (selectedId) {
        // Send Ctrl+C (ASCII 3) to the terminal
        sendInput(selectedId, '\x03');
        addTerminalOutput(selectedId, '^C');
      }
      return;
    }

    // Up arrow - previous command
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (commandHistory.length > 0) {
        const newIndex = Math.min(historyIndex + 1, commandHistory.length - 1);
        setHistoryIndex(newIndex);
        setInput(commandHistory[newIndex]);
      }
      return;
    }

    // Down arrow - next command
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1;
        setHistoryIndex(newIndex);
        setInput(commandHistory[newIndex]);
      } else if (historyIndex === 0) {
        setHistoryIndex(-1);
        setInput('');
      }
      return;
    }
  }, [selectedId, commandHistory, historyIndex, sendInput, addTerminalOutput]);

  if (!selectedAgent) {
    return (
      <div
        className="!fixed right-4 bottom-4 w-[420px] bg-stone-900/95 border-2 border-stone-800 rounded-2xl overflow-hidden shadow-2xl z-50 backdrop-blur-sm"
        style={{ maxWidth: 'calc(100vw - 340px)' }}
      >
        {/* Corner accents */}
        <div className="corner-accent top-left" style={{ borderColor: '#d97706' }} />
        <div className="corner-accent top-right" style={{ borderColor: '#d97706' }} />
        <div className="corner-accent bottom-left" style={{ borderColor: '#d97706' }} />
        <div className="corner-accent bottom-right" style={{ borderColor: '#d97706' }} />

        <div className="px-8 py-8 flex flex-col items-center justify-center gap-4 text-center">
          <div className="w-16 h-16 rounded-full bg-stone-950/50 border border-stone-700/50 flex items-center justify-center">
            <BookOpen size={28} className="text-stone-500" />
          </div>
          <div>
            <p className="text-stone-400 font-bold tracking-wide font-serif">No Unit Selected</p>
            <p className="text-stone-600 text-sm mt-1 font-serif italic">Select a unit on the field to reveal its secrets.</p>
          </div>
        </div>
      </div>
    );
  }

  if (isMinimized) {
    return (
      <button
        onClick={() => setIsMinimized(false)}
        className="!fixed right-4 bottom-4 px-6 py-5 bg-stone-900/95 border-2 rounded-xl flex items-center gap-4 hover:border-amber-500/40 transition-all group shadow-[0_0_20px_rgba(0,0,0,0.5)] backdrop-blur-sm"
        style={{ borderColor: `${classColor}40` }}
      >
        <span className="text-2xl drop-shadow-lg">{classIcon}</span>
        <div className="text-left">
          <span className="text-stone-200 font-bold tracking-wide block font-serif">{selectedAgent.name}</span>
          <span className="text-xs opacity-60 font-serif" style={{ color: classColor }}>{classTitle}</span>
        </div>
        {selectedAgent.status === 'working' && (
          <span className="w-2.5 h-2.5 rounded-full bg-amber-400 status-glow-working ml-2 animate-pulse" />
        )}
      </button>
    );
  }

  const statusColors: Record<string, string> = {
    idle: 'text-emerald-400',
    working: 'text-amber-400',
    spawning: 'text-blue-400',
    error: 'text-red-400',
    waiting: 'text-purple-400',
    completed: 'text-emerald-400',
    blocked: 'text-orange-400',
  };
  const statusColor = statusColors[selectedAgent.status] || 'text-stone-400';

  const statusBgColors: Record<string, string> = {
    idle: 'bg-emerald-900/20 border-emerald-900/40',
    working: 'bg-amber-900/20 border-amber-900/40',
    spawning: 'bg-blue-900/20 border-blue-900/40',
    error: 'bg-red-900/20 border-red-900/40',
    waiting: 'bg-purple-900/20 border-purple-900/40',
    completed: 'bg-emerald-900/20 border-emerald-900/40',
    blocked: 'bg-orange-900/20 border-orange-900/40',
  };
  const statusBgColor = statusBgColors[selectedAgent.status] || 'bg-stone-800/20 border-stone-800/40';

  return (
    <div
      className={`!fixed right-4 bottom-4 bg-stone-900/95 border-2 rounded-2xl flex flex-col transition-all overflow-hidden shadow-2xl z-50 backdrop-blur-md ${isExpanded ? 'w-[650px] h-[550px]' : 'w-[420px] h-[380px]'
        }`}
      style={{
        borderColor: `${classColor}40`,
        boxShadow: `0 0 40px rgba(0,0,0,0.5)`,
        maxWidth: 'calc(100vw - 340px)'
      }}
    >
      {/* Corner accents with class color */}
      <div className="corner-accent top-left" style={{ '--accent-color': classColor } as React.CSSProperties} />
      <div className="corner-accent top-right" style={{ '--accent-color': classColor } as React.CSSProperties} />
      <div className="corner-accent bottom-left" style={{ '--accent-color': classColor } as React.CSSProperties} />
      <div className="corner-accent bottom-right" style={{ '--accent-color': classColor } as React.CSSProperties} />

      {/* Character Header - Game Dialogue Style */}
      <div
        className="px-6 py-5 border-b flex items-center justify-between relative z-10"
        style={{
          borderColor: `${classColor}30`,
          background: `linear-gradient(180deg, ${classColor}10 0%, transparent 100%)`
        }}
      >
        <div className="flex items-center gap-5">
          {/* Character Portrait */}
          <div
            className="w-14 h-14 rounded-xl flex items-center justify-center text-3xl relative"
            style={{
              background: `linear-gradient(135deg, ${classColor}30, ${classColor}10)`,
              border: `2px solid ${classColor}50`,
              boxShadow: `inset 0 0 20px ${classColor}20`
            }}
          >
            {classIcon}
            {/* Status indicator on portrait */}
            <div
              className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-stone-900 ${selectedAgent.status === 'working' ? 'bg-amber-400 animate-pulse' :
                selectedAgent.status === 'idle' ? 'bg-emerald-400' :
                  selectedAgent.status === 'error' ? 'bg-red-400' : 'bg-blue-400'
                }`}
            />
          </div>

          {/* Character Info */}
          <div>
            <div className="flex items-center gap-3">
              <span className="text-stone-100 font-bold text-lg tracking-wide font-serif">{selectedAgent.name}</span>
              <span
                className={`text-xs font-semibold px-3 py-1 rounded-full border ${statusBgColor} ${statusColor} uppercase tracking-wider font-serif`}
              >
                {selectedAgent.status}
              </span>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-sm font-medium tracking-wide font-serif" style={{ color: classColor }}>
                {classTitle}
              </span>
              <span className="text-stone-600">•</span>
              <span className="text-stone-500 text-xs font-serif">Level {selectedAgent.level || 1}</span>
            </div>
          </div>
        </div>

        {/* Window Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-2.5 hover:bg-stone-800 rounded-lg transition-all text-stone-500 hover:text-stone-300"
            title={isExpanded ? 'Shrink' : 'Expand'}
          >
            {isExpanded ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
          </button>
          <button
            onClick={() => setIsMinimized(true)}
            className="p-2.5 hover:bg-stone-800 rounded-lg transition-all text-stone-500 hover:text-stone-300"
            title="Minimize"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Git/Project Info Bar */}
      {(selectedAgent as any).gitBranch && (
        <div className="px-5 py-3 bg-black/60 border-b border-stone-800/50 flex items-center gap-6 text-xs font-serif">
          <div className="flex items-center gap-2 text-stone-500">
            <Folder size={14} />
            <span className="text-stone-400 font-mono truncate max-w-[200px]">
              {(selectedAgent as any).workingDir}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <GitBranch size={14} className="text-emerald-600" />
            <span className="text-emerald-500 font-mono font-semibold">{(selectedAgent as any).gitBranch}</span>
          </div>
        </div>
      )}

      {/* Terminal Output - Dialogue Area */}
      <div
        ref={terminalRef}
        className="flex-1 px-5 py-4 overflow-y-auto font-mono text-sm leading-relaxed bg-black/80 terminal-text relative custom-scrollbar"
      >
        {/* Subtle texture overlay */}
        <div className="absolute inset-0 bg-[url('/assets/textures/paper-texture.png')] opacity-10 pointer-events-none mix-blend-overlay" />

        {selectedAgent.terminalOutput.map((line, i) => {
          // User input lines start with '>'
          const isUserInput = line.startsWith('>');
          const isError = line.startsWith('❌') || line.toLowerCase().includes('error');
          const isSuccess = line.startsWith('✓') || line.toLowerCase().includes('success');
          const isWarning = line.startsWith('⚠');
          const isInfo = line.startsWith('📁') || line.startsWith('🌿') || line.startsWith('[');
          const isInterrupt = line === '^C';

          return (
            <div
              key={i}
              className={`whitespace-pre-wrap relative z-10 ${isUserInput
                ? 'py-3 mt-4 mb-2 border-l-3 pl-4 rounded-r-lg font-serif italic'
                : isInterrupt
                  ? 'text-red-400 font-bold py-1'
                  : isError
                    ? 'text-red-400 drop-shadow-[0_0_8px_rgba(248,113,113,0.3)]'
                    : isSuccess
                      ? 'text-emerald-400 drop-shadow-[0_0_8px_rgba(74,222,128,0.3)]'
                      : isWarning
                        ? 'text-amber-400'
                        : isInfo
                          ? 'text-cyan-600/70 text-xs py-1'
                          : 'text-stone-300 py-0.5'
                }`}
              style={isUserInput ? {
                borderColor: classColor,
                backgroundColor: `${classColor}10`,
                color: classColor
              } : undefined}
            >
              {isUserInput ? (
                <span className="flex items-center gap-3">
                  <User size={16} style={{ color: classColor }} />
                  <span className="font-semibold">{line.slice(2)}</span>
                </span>
              ) : isInterrupt ? (
                <span className="flex items-center gap-2">
                  <AlertCircle size={14} />
                  <span>Disrupted</span>
                </span>
              ) : (
                line
              )}
            </div>
          );
        })}

        {selectedAgent.status === 'working' && (
          <div className="mt-4 flex items-center gap-3 py-2" style={{ color: classColor }}>
            <span className="animate-spin-slow text-lg">⟳</span>
            <span className="animate-pulse font-medium tracking-wide font-serif">{selectedAgent.name} is casting...</span>
          </div>
        )}
      </div>

      {/* Input Area - Dialogue Input Style */}
      <form
        onSubmit={handleSubmit}
        className="p-4 border-t relative z-10 bg-stone-900"
        style={{
          borderColor: `${classColor}20`
        }}
      >
        <div
          className="flex items-center gap-3 bg-black/60 rounded-xl px-4 py-3 border transition-all shadow-inner focus-within:shadow-lg"
          style={{
            borderColor: input ? `${classColor}50` : 'rgba(255,255,255,0.1)',
            boxShadow: input ? `0 0 20px ${classColor}10` : undefined
          }}
        >
          <span className="text-xl" style={{ color: classColor }}>❯</span>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`What shall ${selectedAgent.name} undertake?`}
            className="flex-1 bg-transparent border-none outline-none text-stone-200 placeholder-stone-600 font-serif text-base tracking-wide"
            disabled={selectedAgent.status === 'spawning'}
          />
          <div className="flex items-center gap-2 text-stone-600 text-xs font-mono">
            <span className="opacity-50">↑↓</span>
            <span className="opacity-30">|</span>
            <span className="opacity-50">^C</span>
          </div>
          <button
            type="submit"
            disabled={!input.trim() || selectedAgent.status === 'spawning'}
            className="p-2.5 rounded-lg transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            style={{
              color: input.trim() ? classColor : 'gray',
              backgroundColor: input.trim() ? `${classColor}20` : 'transparent'
            }}
          >
            <Scroll size={18} />
          </button>
        </div>
      </form>
    </div>
  );
}
