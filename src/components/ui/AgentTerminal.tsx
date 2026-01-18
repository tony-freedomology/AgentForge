/**
 * Agent Dialogue Panel
 *
 * An immersive RPG-style dialogue interface for communicating with agents.
 * Designed to feel like conversing with an NPC in a fantasy game.
 */

import { useState, useRef, useEffect, useCallback } from 'react';
import { useGameStore } from '../../stores/gameStore';
import { useAgentBridge } from '../../services/agentBridge';
import { getAgentClass } from '../../config/agentClasses';
import { X, Send, Minimize2, Maximize2, GitBranch, Folder, ChevronRight, Sparkles, MessageCircle } from 'lucide-react';

// Provider to sprite mapping
const PROVIDER_SPRITES: Record<string, string> = {
  claude: '/assets_isometric/agents/claude/claude_idle_s.png',
  anthropic: '/assets_isometric/agents/claude/claude_idle_s.png',
  openai: '/assets_isometric/agents/codex/codex_idle_s.png',
  codex: '/assets_isometric/agents/codex/codex_idle_s.png',
  gemini: '/assets_isometric/agents/gemini/gemini_idle_s.png',
  google: '/assets_isometric/agents/gemini/gemini_idle_s.png',
};

// Class-specific dialogue flavor text
const CLASS_GREETINGS: Record<string, string[]> = {
  mage: ['What arcane knowledge do you seek?', 'The mystical arts await your command.', 'Speak, and I shall weave the code.'],
  engineer: ['Systems online. Awaiting directives.', 'Ready to construct and optimize.', 'Engineering solutions at your service.'],
  scout: ['Reconnaissance complete. Orders?', 'The path ahead is clear. What now?', 'Swift and silent, I await.'],
  guardian: ['Standing watch. How may I protect?', 'Defense protocols ready.', 'Your fortress stands strong.'],
  architect: ['Blueprints ready. What shall we design?', 'The grand vision awaits form.', 'Let us build something magnificent.'],
};

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
  const classColor = agentClass?.color || '#f59e0b';
  const classIcon = agentClass?.icon || '🤖';
  const classTitle = agentClass?.title || 'Agent';

  // Get agent sprite
  const agentSprite = selectedAgent ? (PROVIDER_SPRITES[selectedAgent.provider] || PROVIDER_SPRITES.claude) : null;

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

    // Echo user prompt to terminal first
    addTerminalOutput(selectedId, `[YOU] ${input}`);

    // Start a quest for this task
    const agent = agents.get(selectedId);
    if (agent && !agent.currentQuest) {
      startQuest(selectedId, input.trim());
    }

    // Send to real agent
    sendInput(selectedId, input);
    setInput('');
  }, [input, selectedId, addTerminalOutput, sendInput, agents, startQuest]);

  // Handle keyboard shortcuts
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      inputRef.current?.blur();
      return;
    }

    if (e.ctrlKey && e.key === 'c') {
      e.preventDefault();
      if (selectedId) {
        sendInput(selectedId, '\x03');
        addTerminalOutput(selectedId, '[INTERRUPTED]');
      }
      return;
    }

    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (commandHistory.length > 0) {
        const newIndex = Math.min(historyIndex + 1, commandHistory.length - 1);
        setHistoryIndex(newIndex);
        setInput(commandHistory[newIndex]);
      }
      return;
    }

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

  // No agent selected state
  if (!selectedAgent) {
    return (
      <div
        className="!fixed right-4 bottom-4 w-[450px] overflow-hidden z-50"
        style={{ maxWidth: 'calc(100vw - 340px)' }}
      >
        {/* Ornate frame */}
        <div className="relative bg-gradient-to-b from-stone-900 via-stone-950 to-stone-900 rounded-2xl border-2 border-amber-900/50 shadow-[0_0_40px_rgba(0,0,0,0.8)]">
          {/* Decorative top bar */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-1 bg-gradient-to-r from-transparent via-amber-600 to-transparent" />

          {/* Corner ornaments */}
          <div className="absolute top-2 left-2 w-6 h-6 border-t-2 border-l-2 border-amber-600/60 rounded-tl-lg" />
          <div className="absolute top-2 right-2 w-6 h-6 border-t-2 border-r-2 border-amber-600/60 rounded-tr-lg" />
          <div className="absolute bottom-2 left-2 w-6 h-6 border-b-2 border-l-2 border-amber-600/60 rounded-bl-lg" />
          <div className="absolute bottom-2 right-2 w-6 h-6 border-b-2 border-r-2 border-amber-600/60 rounded-br-lg" />

          <div className="px-8 py-10 flex flex-col items-center justify-center gap-4 text-center">
            <div className="w-20 h-20 rounded-full bg-stone-950/80 border-2 border-amber-900/40 flex items-center justify-center relative">
              <MessageCircle size={32} className="text-amber-900/60" />
              <div className="absolute inset-0 rounded-full border border-amber-600/20 animate-pulse" />
            </div>
            <div>
              <p className="text-amber-200/80 font-bold tracking-wide text-lg" style={{ fontFamily: 'Georgia, serif' }}>
                No Champion Selected
              </p>
              <p className="text-stone-500 text-sm mt-2" style={{ fontFamily: 'Georgia, serif' }}>
                Select a unit to begin your discourse
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Minimized state
  if (isMinimized) {
    return (
      <button
        onClick={() => setIsMinimized(false)}
        className="!fixed right-4 bottom-4 overflow-hidden rounded-xl z-50 group transition-all hover:scale-105"
        style={{ maxWidth: 'calc(100vw - 340px)' }}
      >
        <div
          className="relative px-5 py-4 flex items-center gap-4 bg-gradient-to-r from-stone-900 to-stone-950 border-2 rounded-xl"
          style={{ borderColor: `${classColor}50` }}
        >
          {/* Agent portrait mini */}
          <div
            className="w-12 h-12 rounded-lg overflow-hidden border-2 relative"
            style={{
              borderColor: `${classColor}60`,
              background: `linear-gradient(135deg, ${classColor}20, transparent)`
            }}
          >
            {agentSprite ? (
              <img src={agentSprite} alt={selectedAgent.name} className="w-full h-full object-cover scale-150" />
            ) : (
              <span className="text-2xl absolute inset-0 flex items-center justify-center">{classIcon}</span>
            )}
            {selectedAgent.status === 'working' && (
              <div className="absolute inset-0 bg-amber-500/20 animate-pulse" />
            )}
          </div>

          <div className="text-left">
            <span className="text-stone-100 font-bold block" style={{ fontFamily: 'Georgia, serif' }}>
              {selectedAgent.name}
            </span>
            <span className="text-xs" style={{ color: classColor, fontFamily: 'Georgia, serif' }}>
              {selectedAgent.status === 'working' ? 'Casting...' : classTitle}
            </span>
          </div>

          <ChevronRight size={20} className="text-stone-500 group-hover:text-stone-300 transition-colors ml-2" />
        </div>
      </button>
    );
  }

  // Parse message type
  const parseMessage = (line: string) => {
    const isUserInput = line.startsWith('[YOU]');
    const isInterrupt = line === '[INTERRUPTED]';
    const isError = line.includes('error') || line.includes('Error') || line.startsWith('❌');
    const isSuccess = line.includes('success') || line.includes('Success') || line.startsWith('✓') || line.startsWith('✅');
    const isThinking = line.includes('thinking') || line.includes('Thinking') || line.startsWith('🤔');
    const isSystem = line.startsWith('[') && !isUserInput;

    return { isUserInput, isInterrupt, isError, isSuccess, isThinking, isSystem };
  };

  return (
    <div
      className={`!fixed right-4 bottom-4 overflow-hidden z-50 transition-all ${isExpanded ? 'w-[680px]' : 'w-[480px]'}`}
      style={{ maxWidth: 'calc(100vw - 340px)' }}
    >
      {/* Main dialogue box */}
      <div
        className="relative bg-gradient-to-b from-stone-900 via-stone-950 to-stone-900 rounded-2xl border-2 shadow-[0_0_60px_rgba(0,0,0,0.9)]"
        style={{ borderColor: `${classColor}40` }}
      >
        {/* Decorative elements */}
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-1 rounded-full"
          style={{ background: `linear-gradient(90deg, transparent, ${classColor}, transparent)` }}
        />
        <div
          className="absolute bottom-0 left-1/2 -translate-x-1/2 w-32 h-0.5 rounded-full"
          style={{ background: `linear-gradient(90deg, transparent, ${classColor}60, transparent)` }}
        />

        {/* Corner ornaments */}
        <div className="absolute top-3 left-3 w-8 h-8 border-t-2 border-l-2 rounded-tl-lg" style={{ borderColor: `${classColor}50` }} />
        <div className="absolute top-3 right-3 w-8 h-8 border-t-2 border-r-2 rounded-tr-lg" style={{ borderColor: `${classColor}50` }} />
        <div className="absolute bottom-3 left-3 w-8 h-8 border-b-2 border-l-2 rounded-bl-lg" style={{ borderColor: `${classColor}50` }} />
        <div className="absolute bottom-3 right-3 w-8 h-8 border-b-2 border-r-2 rounded-br-lg" style={{ borderColor: `${classColor}50` }} />

        {/* Header with portrait */}
        <div
          className="relative px-6 py-4 flex items-center gap-5 border-b"
          style={{
            borderColor: `${classColor}30`,
            background: `linear-gradient(180deg, ${classColor}15 0%, transparent 100%)`
          }}
        >
          {/* Large character portrait */}
          <div className="relative">
            <div
              className="w-20 h-20 rounded-xl overflow-hidden border-3 relative"
              style={{
                borderColor: classColor,
                background: `linear-gradient(135deg, ${classColor}30, ${classColor}10)`,
                boxShadow: `0 0 30px ${classColor}30, inset 0 0 20px ${classColor}20`
              }}
            >
              {agentSprite ? (
                <img
                  src={agentSprite}
                  alt={selectedAgent.name}
                  className="w-full h-full object-cover scale-[1.8] translate-y-2"
                  style={{ imageRendering: 'pixelated' }}
                />
              ) : (
                <span className="text-4xl absolute inset-0 flex items-center justify-center">{classIcon}</span>
              )}

              {/* Animated overlay when working */}
              {selectedAgent.status === 'working' && (
                <div className="absolute inset-0 bg-gradient-to-t from-amber-500/30 to-transparent animate-pulse" />
              )}
            </div>

            {/* Status gem */}
            <div
              className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-stone-900 shadow-lg ${
                selectedAgent.status === 'working' ? 'bg-amber-400 animate-pulse shadow-amber-400/50' :
                selectedAgent.status === 'idle' ? 'bg-emerald-400 shadow-emerald-400/50' :
                selectedAgent.status === 'error' ? 'bg-red-400 shadow-red-400/50' :
                'bg-blue-400 shadow-blue-400/50'
              }`}
            />

            {/* Sparkle effect when working */}
            {selectedAgent.status === 'working' && (
              <Sparkles
                size={16}
                className="absolute -top-1 -right-1 text-amber-400 animate-pulse"
              />
            )}
          </div>

          {/* Character name and info */}
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h3
                className="text-xl font-bold text-stone-100 tracking-wide"
                style={{ fontFamily: 'Georgia, serif' }}
              >
                {selectedAgent.name}
              </h3>
              <span
                className="text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider"
                style={{
                  backgroundColor: `${classColor}20`,
                  color: classColor,
                  border: `1px solid ${classColor}40`
                }}
              >
                {selectedAgent.status}
              </span>
            </div>

            <div className="flex items-center gap-3 mt-1">
              <span
                className="text-sm font-medium"
                style={{ color: classColor, fontFamily: 'Georgia, serif' }}
              >
                {classTitle}
              </span>
              <span className="text-stone-600">•</span>
              <span className="text-stone-500 text-sm" style={{ fontFamily: 'Georgia, serif' }}>
                Level {selectedAgent.level || 1}
              </span>
            </div>

            {/* Git info if available */}
            {selectedAgent.gitBranch && (
              <div className="flex items-center gap-4 mt-2 text-xs">
                <div className="flex items-center gap-1.5 text-stone-500">
                  <Folder size={12} />
                  <span className="font-mono truncate max-w-[150px]">{selectedAgent.workingDir || '~'}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <GitBranch size={12} className="text-emerald-500" />
                  <span className="text-emerald-400 font-mono font-semibold">{selectedAgent.gitBranch}</span>
                </div>
              </div>
            )}
          </div>

          {/* Window controls */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-2.5 hover:bg-stone-800/60 rounded-lg transition-all text-stone-500 hover:text-stone-300"
              title={isExpanded ? 'Compact' : 'Expand'}
            >
              {isExpanded ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
            </button>
            <button
              onClick={() => setIsMinimized(true)}
              className="p-2.5 hover:bg-stone-800/60 rounded-lg transition-all text-stone-500 hover:text-stone-300"
              title="Minimize"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Dialogue history */}
        <div
          ref={terminalRef}
          className={`overflow-y-auto px-6 py-4 space-y-3 custom-scrollbar ${isExpanded ? 'h-[350px]' : 'h-[250px]'}`}
          style={{ background: 'linear-gradient(180deg, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.6) 100%)' }}
        >
          {/* Welcome message if empty */}
          {selectedAgent.terminalOutput.length === 0 && (
            <div className="flex gap-4 items-start">
              <div
                className="w-10 h-10 rounded-lg shrink-0 flex items-center justify-center text-lg border"
                style={{
                  borderColor: `${classColor}40`,
                  background: `linear-gradient(135deg, ${classColor}20, transparent)`
                }}
              >
                {classIcon}
              </div>
              <div
                className="flex-1 p-4 rounded-xl rounded-tl-sm relative"
                style={{
                  background: `linear-gradient(135deg, ${classColor}15, ${classColor}05)`,
                  border: `1px solid ${classColor}30`
                }}
              >
                <p className="text-stone-300 italic" style={{ fontFamily: 'Georgia, serif' }}>
                  "{CLASS_GREETINGS[selectedAgent.class]?.[0] || 'Awaiting your command...'}"
                </p>
              </div>
            </div>
          )}

          {/* Message history */}
          {selectedAgent.terminalOutput.map((line, i) => {
            const { isUserInput, isInterrupt, isError, isSuccess, isSystem } = parseMessage(line);

            if (isUserInput) {
              // User message - right aligned speech bubble
              return (
                <div key={i} className="flex justify-end">
                  <div
                    className="max-w-[80%] p-4 rounded-xl rounded-br-sm"
                    style={{
                      background: 'linear-gradient(135deg, rgba(245,158,11,0.2), rgba(245,158,11,0.1))',
                      border: '1px solid rgba(245,158,11,0.3)'
                    }}
                  >
                    <p className="text-amber-100 font-medium" style={{ fontFamily: 'Georgia, serif' }}>
                      {line.replace('[YOU] ', '')}
                    </p>
                  </div>
                </div>
              );
            }

            if (isInterrupt) {
              // Interrupt indicator
              return (
                <div key={i} className="flex justify-center">
                  <span className="text-xs text-red-400/60 px-4 py-1 rounded-full bg-red-900/20 border border-red-900/30">
                    — Spell Interrupted —
                  </span>
                </div>
              );
            }

            // Agent message - left aligned with avatar
            return (
              <div key={i} className="flex gap-3 items-start">
                {/* Mini avatar for first message in sequence or every 5th */}
                {(i === 0 || i % 5 === 0) && (
                  <div
                    className="w-8 h-8 rounded-lg shrink-0 overflow-hidden border"
                    style={{
                      borderColor: `${classColor}40`,
                      background: `linear-gradient(135deg, ${classColor}20, transparent)`
                    }}
                  >
                    {agentSprite ? (
                      <img
                        src={agentSprite}
                        alt=""
                        className="w-full h-full object-cover scale-150"
                        style={{ imageRendering: 'pixelated' }}
                      />
                    ) : (
                      <span className="text-sm flex items-center justify-center h-full">{classIcon}</span>
                    )}
                  </div>
                )}
                {(i !== 0 && i % 5 !== 0) && <div className="w-8 shrink-0" />}

                <div
                  className={`flex-1 p-3 rounded-xl rounded-tl-sm font-mono text-sm leading-relaxed ${
                    isError ? 'bg-red-900/20 border-red-800/40 text-red-300' :
                    isSuccess ? 'bg-emerald-900/20 border-emerald-800/40 text-emerald-300' :
                    isSystem ? 'bg-stone-800/30 border-stone-700/30 text-stone-500 text-xs' :
                    'bg-stone-800/40 border-stone-700/30 text-stone-300'
                  }`}
                  style={{ border: '1px solid' }}
                >
                  <p className="whitespace-pre-wrap break-words">{line}</p>
                </div>
              </div>
            );
          })}

          {/* Typing indicator when working */}
          {selectedAgent.status === 'working' && (
            <div className="flex gap-3 items-start">
              <div
                className="w-8 h-8 rounded-lg shrink-0 overflow-hidden border animate-pulse"
                style={{
                  borderColor: `${classColor}40`,
                  background: `linear-gradient(135deg, ${classColor}20, transparent)`
                }}
              >
                {agentSprite ? (
                  <img
                    src={agentSprite}
                    alt=""
                    className="w-full h-full object-cover scale-150"
                    style={{ imageRendering: 'pixelated' }}
                  />
                ) : (
                  <span className="text-sm flex items-center justify-center h-full">{classIcon}</span>
                )}
              </div>
              <div
                className="p-4 rounded-xl rounded-tl-sm"
                style={{
                  background: `linear-gradient(135deg, ${classColor}10, transparent)`,
                  border: `1px solid ${classColor}30`
                }}
              >
                <div className="flex items-center gap-2">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 rounded-full bg-current animate-bounce" style={{ color: classColor, animationDelay: '0ms' }} />
                    <span className="w-2 h-2 rounded-full bg-current animate-bounce" style={{ color: classColor, animationDelay: '150ms' }} />
                    <span className="w-2 h-2 rounded-full bg-current animate-bounce" style={{ color: classColor, animationDelay: '300ms' }} />
                  </div>
                  <span className="text-sm italic" style={{ color: classColor, fontFamily: 'Georgia, serif' }}>
                    {selectedAgent.name} is channeling...
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input area */}
        <form
          onSubmit={handleSubmit}
          className="p-4 border-t"
          style={{
            borderColor: `${classColor}20`,
            background: 'linear-gradient(180deg, transparent, rgba(0,0,0,0.3))'
          }}
        >
          <div
            className="flex items-center gap-3 rounded-xl px-4 py-3 transition-all"
            style={{
              background: 'rgba(0,0,0,0.4)',
              border: `2px solid ${input ? `${classColor}50` : 'rgba(255,255,255,0.1)'}`,
              boxShadow: input ? `0 0 20px ${classColor}15` : undefined
            }}
          >
            <ChevronRight
              size={20}
              style={{ color: input ? classColor : '#6b7280' }}
              className="transition-colors"
            />
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={`Speak to ${selectedAgent.name}...`}
              className="flex-1 bg-transparent border-none outline-none text-stone-200 placeholder-stone-600 text-base"
              style={{ fontFamily: 'Georgia, serif' }}
              disabled={selectedAgent.status === 'spawning'}
            />

            {/* Keyboard hints */}
            <div className="flex items-center gap-2 text-stone-600 text-xs font-mono">
              <span className="opacity-50">↑↓</span>
            </div>

            <button
              type="submit"
              disabled={!input.trim() || selectedAgent.status === 'spawning'}
              className="p-2.5 rounded-lg transition-all disabled:opacity-30 disabled:cursor-not-allowed hover:scale-105 active:scale-95"
              style={{
                color: input.trim() ? classColor : '#6b7280',
                background: input.trim() ? `${classColor}20` : 'transparent',
                border: input.trim() ? `1px solid ${classColor}40` : '1px solid transparent'
              }}
            >
              <Send size={18} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
