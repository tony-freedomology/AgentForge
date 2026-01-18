import { Canvas } from '@react-three/fiber';
import { Scene } from './components/3d/Scene';
import { SelectionBoxOverlay } from './components/3d/SelectionBox';
import { ResourceBar } from './components/ui/ResourceBar';
import { Minimap } from './components/ui/Minimap';
import { CommandPanel } from './components/ui/CommandPanel';
import { AgentTerminal } from './components/ui/AgentTerminal';
import { SpawnAgentDialog } from './components/ui/SpawnAgentDialog';
import { PartyFrames } from './components/ui/PartyFrames';
import { LootPanel } from './components/ui/LootPanel';
import { PendingQuestsNotification } from './components/ui/QuestTurnIn';
import { QuestLog, QuestLogButton } from './components/ui/QuestLog';
import { ToastContainer } from './components/ui/Toast';
import { SoundToggle } from './components/ui/SoundSettings';
import { CommandPalette } from './components/ui/CommandPalette';
import { IsometricWorld } from './components/isometric/IsometricWorld';
import { useKeyboardShortcuts, KEYBOARD_SHORTCUTS } from './hooks/useKeyboardShortcuts';
import { agentBridge } from './services/agentBridge';
import { ChevronRight, Zap, Crosshair, Cpu, Layers, Box } from 'lucide-react';
import { useState, useEffect } from 'react';

// Help overlay component
function HelpOverlay({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/85 flex items-center justify-center z-50 backdrop-blur-md" onClick={onClose}>
      <div
        className="fantasy-panel rounded-2xl px-10 py-10 max-w-2xl w-full mx-4 relative overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Corner accents */}
        <div className="corner-accent top-left" />
        <div className="corner-accent top-right" />
        <div className="corner-accent bottom-left" />
        <div className="corner-accent bottom-right" />

        {/* Header */}
        <div className="mb-8 pb-6 border-b border-cyan-800/30">
          <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-blue-400 flex items-center gap-4 tracking-wide uppercase">
            <span className="text-4xl drop-shadow-[0_0_15px_rgba(6,182,212,0.5)]">⌘</span>
            <span>Neural Uplink Controls</span>
          </h2>
          <p className="text-cyan-600/60 text-sm mt-2 tracking-wide">
            Master your digital legion with these commands
          </p>
        </div>

        {/* Keyboard shortcuts grid */}
        <div className="grid grid-cols-2 gap-4 text-sm relative z-10">
          {KEYBOARD_SHORTCUTS.map(({ key, description }) => (
            <div
              key={key}
              className="flex items-center gap-4 px-5 py-4 rounded-xl bg-cyan-950/30 border border-cyan-800/40 hover:border-cyan-600/50 hover:bg-cyan-900/20 transition-all group"
            >
              <kbd className="px-4 py-2 bg-black/40 rounded-lg border border-cyan-500/40 text-cyan-300 font-mono text-sm font-bold shadow-[0_0_15px_rgba(6,182,212,0.15)] group-hover:shadow-[0_0_20px_rgba(6,182,212,0.25)] group-hover:border-cyan-400/60 transition-all min-w-[50px] text-center">
                {key}
              </kbd>
              <span className="text-gray-300 group-hover:text-white transition-colors">{description}</span>
            </div>
          ))}
        </div>

        {/* Close button */}
        <button
          onClick={onClose}
          className="mt-10 w-full py-5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 rounded-xl text-white font-black text-lg tracking-widest uppercase transition-all shadow-[0_0_25px_rgba(6,182,212,0.35)] hover:shadow-[0_0_40px_rgba(6,182,212,0.5)] hover:scale-[1.02] active:scale-[0.98] border border-cyan-400/30"
        >
          Initialize Uplink
        </button>
      </div>
    </div>
  );
}

// Welcome overlay for first-time users
function WelcomeOverlay({ onStart }: { onStart: () => void }) {
  return (
    <div className="fixed inset-0 bg-[#050510]/95 flex items-center justify-center z-50 backdrop-blur-xl">
      <div className="relative w-full max-w-4xl px-8 flex flex-col items-center text-center">

        {/* Background Ambient Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-gradient-radial from-cyan-500/10 to-transparent blur-[120px] -z-10 rounded-full animate-pulse-slow" />

        {/* --- HEADER SECTION --- */}
        <div className="mb-20 relative">
          <h1 className="text-7xl md:text-8xl font-black font-display tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white via-cyan-100 to-cyan-900 drop-shadow-[0_0_50px_rgba(6,182,212,0.4)]">
            AGENT FORGE
          </h1>
          <div className="text-lg md:text-xl font-tech text-cyan-400 tracking-[0.3em] uppercase mt-2 opacity-80">
            Immersive Command Interface
          </div>

          {/* Decorative Lines */}
          <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-32 h-1 bg-gradient-to-r from-transparent via-cyan-500 to-transparent" />
        </div>

        {/* --- DESCRIPTION --- */}
        <div className="max-w-3xl mx-auto mb-20 space-y-6">
          <p className="text-2xl text-white font-light leading-relaxed">
            Orchestrate your <span className="font-bold text-cyan-300">Digital Legion</span> in real-time.
          </p>
          <p className="text-gray-400 text-lg leading-relaxed font-tech">
            Deploy specialized units like <span className="text-purple-400 font-bold">Architects</span>, <span className="text-blue-400 font-bold">Mages</span>, <span className="text-amber-400 font-bold">Artisans</span>, and <span className="text-green-400 font-bold">Guardians</span> to manifest your vision.
          </p>
        </div>

        {/* --- FEATURE GRID --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-6xl mb-32">
          {[
            {
              icon: <Zap size={32} />,
              title: "SUMMON",
              desc: "Deploy AI Agents (N)",
              color: "text-amber-400",
              border: "border-amber-500/30",
              bg: "bg-amber-500/5"
            },
            {
              icon: <Crosshair size={32} />,
              title: "COMMAND",
              desc: "Assign Tasks (T)",
              color: "text-cyan-400",
              border: "border-cyan-500/30",
              bg: "bg-cyan-500/5"
            },
            {
              icon: <Cpu size={32} />,
              title: "OBSERVE",
              desc: "Monitor Output",
              color: "text-purple-400",
              border: "border-purple-500/30",
              bg: "bg-purple-500/5"
            }
          ].map((feature, idx) => (
            <div
              key={idx}
              className={`
                relative group py-10 px-8 rounded-xl border ${feature.border} ${feature.bg}
                backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:bg-opacity-20
                flex flex-col items-center gap-4
              `}
            >
              <div className={`${feature.color} drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]`}>
                {feature.icon}
              </div>
              <div className={`font-display font-bold tracking-widest text-sm ${feature.color}`}>
                {feature.title}
              </div>
              <div className="text-white/40 font-mono text-xs uppercase tracking-wide">
                {feature.desc}
              </div>
            </div>
          ))}
        </div>

        {/* --- ENTER BUTTON --- */}
        <button
          onClick={onStart}
          className="group relative px-20 py-8 bg-transparent overflow-hidden clip-tech-button transition-all duration-300 hover:scale-[1.02] mt-8"
        >
          {/* Button Background & Glow */}
          <div className="absolute inset-0 bg-cyan-600/20 group-hover:bg-cyan-500/30 transition-colors" />
          <div className="absolute inset-0 border border-cyan-500/50 group-hover:border-cyan-400 clip-tech-button" />

          <div className="relative z-10 flex items-center gap-4">
            <span className="text-xl md:text-2xl font-display font-black text-white uppercase tracking-[0.2em] group-hover:text-cyan-100 transition-colors drop-shadow-lg">
              Enter The Forge
            </span>
            <ChevronRight className="w-6 h-6 text-cyan-400 animate-pulse group-hover:translate-x-1 transition-transform" />
          </div>

          {/* Shine Effect */}
          <div className="absolute top-0 -left-[100%] w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-12 group-hover:animate-shine" />
        </button>

        {/* --- FOOTER STATUS --- */}
        <div className="mt-12 flex items-center gap-2 text-cyan-900/40 font-mono text-[10px] uppercase tracking-[0.2em]">
          <div className="w-1.5 h-1.5 bg-cyan-500/20 rounded-full animate-pulse" />
          System Version 2.0.4 // Ready for Uplink
        </div>

      </div>
    </div>
  );
}

// SSR-safe window dimensions helper
const getWindowDimensions = () => {
  if (typeof window === 'undefined') {
    return { width: 1920, height: 1080 }; // SSR fallback
  }
  return { width: window.innerWidth, height: window.innerHeight };
};

function App() {
  const [showWelcome, setShowWelcome] = useState(true);
  const [showHelp, setShowHelp] = useState(false);
  const [showSpawnDialog, setShowSpawnDialog] = useState(false);
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [showQuestLog, setShowQuestLog] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected'>('disconnected');
  const [useIsometric, setUseIsometric] = useState(true); // Phase 0: Default to isometric for testing
  const [dimensions, setDimensions] = useState(getWindowDimensions);

  // Initialize keyboard shortcuts
  useKeyboardShortcuts();

  // Handle window resize for isometric canvas
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleResize = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };

    // Set initial dimensions (in case SSR fallback was used)
    handleResize();

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Connect to backend server
  useEffect(() => {
    if (!showWelcome) {
      setConnectionStatus('connecting');
      agentBridge.connect()
        .then(() => setConnectionStatus('connected'))
        .catch(() => setConnectionStatus('disconnected'));
    }

    return () => {
      agentBridge.disconnect();
    };
  }, [showWelcome]);

  // F1 for help, N for new agent, Cmd+K for command palette
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isInInput = document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA';

      // Cmd+K / Ctrl+K for command palette (works even in input if not welcome screen)
      if ((e.metaKey || e.ctrlKey) && e.key === 'k' && !showWelcome) {
        e.preventDefault();
        setShowCommandPalette((prev) => !prev);
        return;
      }

      if (e.key === 'F1') {
        e.preventDefault();
        setShowHelp((prev) => !prev);
      }

      if (e.key === 'n' && !showWelcome && !showSpawnDialog && !showCommandPalette && connectionStatus === 'connected') {
        // Check if we're not in an input field
        if (!isInInput) {
          e.preventDefault();
          setShowSpawnDialog(true);
        }
      }

      // Q for quest log
      if (e.key === 'q' && !showWelcome && !showSpawnDialog && !showCommandPalette && !isInInput) {
        e.preventDefault();
        setShowQuestLog((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showWelcome, showSpawnDialog, showCommandPalette, connectionStatus]);

  const handleStart = () => {
    setShowWelcome(false);
  };

  return (
    <div className="w-screen h-screen bg-gray-950 overflow-hidden">
      {/* Render Mode Toggle */}
      <div className="fixed top-4 left-4 z-50 flex gap-2">
        <button
          onClick={() => setUseIsometric(false)}
          className={`p-2 rounded-lg transition-all ${
            !useIsometric
              ? 'bg-cyan-500/30 text-cyan-300 border border-cyan-400/50'
              : 'bg-black/50 text-gray-500 border border-gray-700 hover:border-gray-500'
          }`}
          title="3D View"
        >
          <Box size={18} />
        </button>
        <button
          onClick={() => setUseIsometric(true)}
          className={`p-2 rounded-lg transition-all ${
            useIsometric
              ? 'bg-purple-500/30 text-purple-300 border border-purple-400/50'
              : 'bg-black/50 text-gray-500 border border-gray-700 hover:border-gray-500'
          }`}
          title="Isometric View (Phase 0 PoC)"
        >
          <Layers size={18} />
        </button>
      </div>

      {/* 3D Canvas or Isometric World */}
      {useIsometric ? (
        <div className="w-full h-full">
          <IsometricWorld width={dimensions.width} height={dimensions.height} />
        </div>
      ) : (
        <Canvas
          shadows
          camera={{ position: [0, 25, 25], fov: 50 }}
          gl={{ antialias: true, alpha: false }}
          dpr={[1, 2]}
        >
          <color attach="background" args={['#0a0a1a']} />
          <Scene />
        </Canvas>
      )}

      {/* 2D Overlays */}
      {!useIsometric && <SelectionBoxOverlay />}
      <ResourceBar />
      <Minimap />
      <CommandPanel />
      <AgentTerminal />
      <PartyFrames />
      <LootPanel />
      <PendingQuestsNotification />

      {/* Connection status */}
      <div className="fixed top-20 right-4 flex items-center gap-3">
        <div className={`relative flex items-center gap-4 px-8 py-5 fantasy-panel rounded-xl text-sm font-bold tracking-widest uppercase backdrop-blur-xl transition-all duration-300 ${connectionStatus === 'connected'
          ? 'text-green-400 border-green-500/50 shadow-[0_0_25px_rgba(74,222,128,0.25)]'
          : connectionStatus === 'connecting'
            ? 'text-cyan-400 border-cyan-500/50 shadow-[0_0_25px_rgba(6,182,212,0.25)]'
            : 'text-red-400 border-red-500/50 shadow-[0_0_25px_rgba(248,113,113,0.25)]'
          }`}>
          <div className="corner-accent top-left" />
          <div className="corner-accent top-right" />
          <div className="corner-accent bottom-left" />
          <div className="corner-accent bottom-right" />
          <span className={`w-3 h-3 rounded-full ${connectionStatus === 'connected'
            ? 'bg-green-400 shadow-[0_0_12px_rgba(74,222,128,0.7)]'
            : connectionStatus === 'connecting'
              ? 'bg-cyan-400 animate-pulse shadow-[0_0_12px_rgba(6,182,212,0.7)]'
              : 'bg-red-400 shadow-[0_0_12px_rgba(248,113,113,0.7)]'
            }`} />
          <span className="relative z-10">
            {connectionStatus === 'connected' ? 'Uplink Established' :
              connectionStatus === 'connecting' ? 'Establishing Uplink...' : 'Uplink Offline'}
          </span>
        </div>
        <button
          onClick={() => setShowHelp(true)}
          className="px-5 py-4 fantasy-panel hover:bg-cyan-900/30 rounded-lg text-cyan-400 hover:text-white text-sm font-bold tracking-wider transition-all hover:shadow-[0_0_15px_rgba(6,182,212,0.4)] hover:border-cyan-400/50"
        >
          F1
        </button>
      </div>

      {/* Spawn agent button (when connected) */}
      {connectionStatus === 'connected' && (
        <button
          onClick={() => setShowSpawnDialog(true)}
          className="fixed top-44 right-4 group relative overflow-hidden rounded-xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
        >
          {/* Background layers */}
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-600/90 to-blue-600/90 rounded-xl" />
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          {/* Border glow */}
          <div className="absolute inset-0 rounded-xl border-2 border-cyan-400/60 group-hover:border-cyan-300/80 transition-colors" />
          <div className="absolute inset-0 rounded-xl shadow-[0_0_30px_rgba(6,182,212,0.4)] group-hover:shadow-[0_0_40px_rgba(6,182,212,0.6)] transition-shadow" />

          {/* Content */}
          <div className="relative z-10 flex items-center gap-4 px-10 py-6">
            <span className="text-2xl group-hover:rotate-12 group-hover:scale-110 transition-transform duration-300 drop-shadow-lg">✨</span>
            <span className="text-white font-black text-lg tracking-widest uppercase drop-shadow-md">
              Summon Agent
            </span>
            <span className="text-cyan-200/80 text-sm font-mono bg-black/30 px-3 py-1.5 rounded-md border border-cyan-400/30 tracking-wider">
              N
            </span>
          </div>

          {/* Shine effect */}
          <div className="absolute top-0 -left-[100%] w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12 group-hover:animate-shine" />
        </button>
      )}

      {/* Toast notifications */}
      <ToastContainer />

      {/* Sound controls and Quest Log button */}
      <div className="fixed bottom-4 right-4 z-40 flex items-center gap-2">
        <QuestLogButton onClick={() => setShowQuestLog(true)} />
        <SoundToggle />
      </div>

      {/* Modals */}
      {showWelcome && <WelcomeOverlay onStart={handleStart} />}
      {showHelp && <HelpOverlay onClose={() => setShowHelp(false)} />}
      {showSpawnDialog && <SpawnAgentDialog onClose={() => setShowSpawnDialog(false)} />}
      {showQuestLog && <QuestLog onClose={() => setShowQuestLog(false)} />}
      <CommandPalette
        isOpen={showCommandPalette}
        onClose={() => setShowCommandPalette(false)}
        onOpenSpawnDialog={() => setShowSpawnDialog(true)}
        onOpenHelp={() => setShowHelp(true)}
      />
    </div>
  );
}

export default App;
