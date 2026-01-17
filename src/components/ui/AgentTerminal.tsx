/**
 * Agent Terminal Panel
 *
 * Shows terminal output and allows sending prompts to selected agents.
 * This is your main interface for interacting with your AI workforce.
 */

import { useState, useRef, useEffect } from 'react';
import { useGameStore } from '../../stores/gameStore';
import { useAgentBridge } from '../../services/agentBridge';
import { X, Send, Minimize2, Maximize2, Terminal, GitBranch, Folder, User } from 'lucide-react';

export function AgentTerminal() {
  const selectedAgentIds = useGameStore((s) => s.selectedAgentIds);
  const agents = useGameStore((s) => s.agents);
  const [input, setInput] = useState('');
  const [isExpanded, setIsExpanded] = useState(true);
  const [isMinimized, setIsMinimized] = useState(false);
  const terminalRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { sendInput } = useAgentBridge();

  // Get selected agent (use first if multiple selected)
  const selectedId = selectedAgentIds.size > 0 ? Array.from(selectedAgentIds)[0] : null;
  const selectedAgent = selectedId ? agents.get(selectedId) : null;

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

  const addTerminalOutput = useGameStore((s) => s.addTerminalOutput);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !selectedId) return;

    // Echo user prompt to terminal first (so user sees what they typed)
    addTerminalOutput(selectedId, `> ${input}`);

    // Send to real agent
    sendInput(selectedId, input);

    // Clear input
    setInput('');
  };

  // Handle keyboard shortcuts
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      inputRef.current?.blur();
    }
  };

  if (!selectedAgent) {
    return (
      <div className="fixed right-4 bottom-4 w-96 fantasy-panel rounded-xl overflow-hidden">
        {/* Corner accents */}
        <div className="corner-accent top-left" />
        <div className="corner-accent top-right" />
        <div className="corner-accent bottom-left" />
        <div className="corner-accent bottom-right" />

        <div className="p-6 border-b border-cyan-700/20 flex items-center gap-3 text-gray-500">
          <Terminal size={18} className="text-cyan-600/50" />
          <span className="text-sm font-medium tracking-wide text-cyan-500/50">Select an agent to view terminal</span>
        </div>
      </div>
    );
  }

  if (isMinimized) {
    return (
      <button
        onClick={() => setIsMinimized(false)}
        className="fixed right-4 bottom-4 px-6 py-4 fantasy-panel rounded-lg flex items-center gap-3 hover:border-cyan-500/40 transition-all group shadow-[0_0_15px_rgba(6,182,212,0.15)]"
      >
        <Terminal size={18} className="text-cyan-400 group-hover:drop-shadow-[0_0_8px_rgba(6,182,212,0.5)]" />
        <span className="text-white font-semibold tracking-wide">{selectedAgent.name}</span>
        {selectedAgent.status === 'working' && (
          <span className="w-2 h-2 rounded-full bg-cyan-400 status-glow-working" />
        )}
      </button>
    );
  }

  const statusColors: Record<string, string> = {
    idle: 'text-green-400',
    working: 'text-amber-400',
    spawning: 'text-blue-400',
    error: 'text-red-400',
    waiting: 'text-purple-400',
    completed: 'text-green-400',
    blocked: 'text-orange-400',
  };
  const statusColor = statusColors[selectedAgent.status] || 'text-gray-400';

  return (
    <div
      className={`fixed right-4 bottom-4 fantasy-panel rounded-xl flex flex-col transition-all overflow-hidden ${isExpanded ? 'w-[600px] h-[500px]' : 'w-96 h-80'
        }`}
    >
      {/* Corner accents */}
      <div className="corner-accent top-left" />
      <div className="corner-accent top-right" />
      <div className="corner-accent bottom-left" />
      <div className="corner-accent bottom-right" />

      {/* Header */}
      <div className="px-5 py-4 border-b border-cyan-800/30 flex items-center justify-between relative z-10 bg-cyan-950/20">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <span className="text-xl drop-shadow-[0_0_8px_rgba(6,182,212,0.5)]">{selectedAgent.provider === 'claude' ? '🧙' : '⚙️'}</span>
            <span className="text-cyan-50 font-semibold tracking-wide font-mono">{selectedAgent.name}</span>
          </div>
          <span className={`text-xs font-medium ${statusColor} capitalize flex items-center gap-1 bg-black/20 px-2 py-0.5 rounded`}>
            {selectedAgent.status}
            {selectedAgent.status === 'working' && (
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 status-glow-working" />
            )}
          </span>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 hover:bg-cyan-500/10 hover:text-cyan-400 rounded transition-all text-cyan-700/70"
            title={isExpanded ? 'Shrink' : 'Expand'}
          >
            {isExpanded ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
          </button>
          <button
            onClick={() => setIsMinimized(true)}
            className="p-1.5 hover:bg-cyan-500/10 hover:text-cyan-400 rounded transition-all text-cyan-700/70"
            title="Minimize"
          >
            <X size={14} />
          </button>
        </div>
      </div>

      {/* Git/Project Info */}
      {(selectedAgent as any).gitBranch && (
        <div className="px-3 py-2 bg-black/40 border-b border-cyan-900/30 flex items-center gap-4 text-xs backdrop-blur-md">
          <div className="flex items-center gap-1.5 text-cyan-600">
            <Folder size={12} />
            <span className="text-cyan-200/70 font-mono truncate max-w-[200px]">
              {(selectedAgent as any).workingDir}
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-cyan-600">
            <GitBranch size={12} />
            <span className="text-green-400 font-mono">{(selectedAgent as any).gitBranch}</span>
          </div>
        </div>
      )}

      {/* Terminal Output */}
      <div
        ref={terminalRef}
        className="flex-1 p-3 overflow-y-auto font-mono text-sm leading-relaxed bg-black/80 terminal-text relative"
      >
        {/* Matrix rain effect overlay (subtle) */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(16,185,129,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(16,185,129,0.03)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none" />

        {selectedAgent.terminalOutput.map((line, i) => {
          // User input lines start with '>'
          const isUserInput = line.startsWith('>');
          const isError = line.startsWith('❌') || line.toLowerCase().includes('error');
          const isSuccess = line.startsWith('✓') || line.toLowerCase().includes('success');
          const isWarning = line.startsWith('⚠');
          const isInfo = line.startsWith('📁') || line.startsWith('🌿') || line.startsWith('[');

          return (
            <div
              key={i}
              className={`whitespace-pre-wrap relative z-10 ${
                isUserInput
                  ? 'text-amber-300 font-semibold py-2 mt-3 mb-1 border-l-2 border-amber-400/50 pl-3 bg-amber-500/5 rounded-r'
                  : isError
                    ? 'text-red-400 drop-shadow-[0_0_8px_rgba(248,113,113,0.3)]'
                    : isSuccess
                      ? 'text-green-400 drop-shadow-[0_0_8px_rgba(74,222,128,0.3)]'
                      : isWarning
                        ? 'text-yellow-400'
                        : isInfo
                          ? 'text-cyan-500/70 text-xs'
                          : 'text-cyan-100/80'
              }`}
            >
              {isUserInput ? (
                <span className="flex items-center gap-2">
                  <User size={14} className="text-amber-400" />
                  <span>{line.slice(2)}</span>
                </span>
              ) : (
                line
              )}
            </div>
          );
        })}

        {selectedAgent.status === 'working' && (
          <div className="text-cyan-400 animate-pulse mt-2 flex items-center gap-2">
            <span className="animate-spin-slow">⟳</span> Processing stream...
          </div>
        )}
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-3 border-t border-cyan-800/30 relative z-10 bg-cyan-950/30 backdrop-blur-md">
        <div className="flex items-center gap-2.5 bg-black/60 rounded-lg px-3 py-2 border border-cyan-800/30 focus-within:border-cyan-500/50 transition-colors shadow-inner">
          <span className="text-cyan-400 text-lg animate-pulse">❯</span>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`Send prompt to ${selectedAgent.name}...`}
            className="flex-1 bg-transparent border-none outline-none text-cyan-50 placeholder-cyan-800/50 font-mono text-sm"
            disabled={selectedAgent.status === 'spawning'}
          />
          <button
            type="submit"
            disabled={!input.trim() || selectedAgent.status === 'spawning'}
            className="p-2 text-cyan-400 hover:text-cyan-200 hover:drop-shadow-[0_0_8px_rgba(6,182,212,0.8)] rounded disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          >
            <Send size={16} />
          </button>
        </div>
      </form>
    </div>
  );
}
