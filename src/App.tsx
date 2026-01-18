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
import { SessionControls } from './components/ui/SessionControls';
import { ProjectZonesPanel, ProjectZonesButton } from './components/ui/ProjectZones';

import { SoundToggle } from './components/ui/SoundSettings';
import { CommandPalette } from './components/ui/CommandPalette';
import { WelcomeScreen } from './components/ui/WelcomeScreen';
import { IsometricWorld } from './components/isometric/IsometricWorld';
import { useKeyboardShortcuts, KEYBOARD_SHORTCUTS } from './hooks/useKeyboardShortcuts';
import { useIdleMonitor } from './hooks/useIdleMonitor';
import { agentBridge } from './services/agentBridge';
import { useState, useEffect } from 'react';

function HelpOverlay({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/85 flex items-center justify-center z-50 backdrop-blur-md" onClick={onClose}>
      <div
        className="fantasy-panel rounded-2xl px-10 py-10 max-w-2xl w-full mx-4 relative overflow-hidden shadow-2xl border-2 border-amber-900/50 bg-stone-950"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Corner accents */}
        <div className="corner-accent top-left" style={{ borderColor: '#d97706' }} />
        <div className="corner-accent top-right" style={{ borderColor: '#d97706' }} />
        <div className="corner-accent bottom-left" style={{ borderColor: '#d97706' }} />
        <div className="corner-accent bottom-right" style={{ borderColor: '#d97706' }} />

        {/* Header */}
        <div className="mb-8 pb-6 border-b border-amber-800/30">
          <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-600 flex items-center gap-4 tracking-wide uppercase drop-shadow-sm">
            <span className="text-4xl drop-shadow-[0_0_15px_rgba(245,158,11,0.5)]">⌘</span>
            <span>Arcane Control Bindings</span>
          </h2>
          <p className="text-amber-700/80 text-sm mt-2 tracking-wide font-medium">
            Master your magical legion with these incantations
          </p>
        </div>

        {/* Keyboard shortcuts grid */}
        <div className="grid grid-cols-2 gap-4 text-sm relative z-10">
          {KEYBOARD_SHORTCUTS.map(({ key, description }) => (
            <div
              key={key}
              className="flex items-center gap-4 px-5 py-4 rounded-xl bg-stone-900/40 border border-amber-900/20 hover:border-amber-600/40 hover:bg-stone-800/40 transition-all group"
            >
              <kbd className="px-4 py-2 bg-black/40 rounded-lg border border-amber-700/40 text-amber-400 font-mono text-sm font-bold shadow-[0_0_10px_rgba(245,158,11,0.1)] group-hover:shadow-[0_0_15px_rgba(245,158,11,0.2)] group-hover:border-amber-500/60 transition-all min-w-[50px] text-center">
                {key}
              </kbd>
              <span className="text-stone-400 group-hover:text-amber-100 transition-colors font-medium">{description}</span>
            </div>
          ))}
        </div>

        {/* Close button */}
        <button
          onClick={onClose}
          className="mt-10 w-full py-5 bg-gradient-to-r from-amber-700 to-yellow-700 hover:from-amber-600 hover:to-yellow-600 rounded-xl text-amber-50 font-black text-lg tracking-widest uppercase transition-all shadow-[0_0_20px_rgba(245,158,11,0.2)] hover:shadow-[0_0_30px_rgba(245,158,11,0.4)] hover:scale-[1.02] active:scale-[0.98] border border-amber-400/30"
        >
          Attune to Realm
        </button>
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
  const [showProjectZones, setShowProjectZones] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected'>('disconnected');
  const [useIsometric, setUseIsometric] = useState(true); // Phase 0: Default to isometric for testing
  const [dimensions, setDimensions] = useState(getWindowDimensions);

  // Initialize keyboard shortcuts
  useKeyboardShortcuts();

  // Initialize idle timeout monitoring
  useIdleMonitor();

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

      // Z for project zones
      if (e.key === 'z' && !showWelcome && !showSpawnDialog && !showCommandPalette && !isInInput) {
        e.preventDefault();
        setShowProjectZones((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showWelcome, showSpawnDialog, showCommandPalette, connectionStatus]);

  const handleStart = () => {
    setShowWelcome(false);
  };

  return (
    <div className="w-screen h-screen bg-stone-950 overflow-hidden">
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
          <color attach="background" args={['#0c0a09']} />
          <Scene />
        </Canvas>
      )}

      {/* 2D Overlays */}
      {!useIsometric && <SelectionBoxOverlay />}
      <ResourceBar useIsometric={useIsometric} onToggleView={setUseIsometric} />
      <Minimap />
      <CommandPanel />
      <AgentTerminal />
      <PartyFrames />
      <LootPanel />
      <PendingQuestsNotification />

      {/* Connection status */}
      <div className="fixed top-20 right-4 flex items-center gap-3">
        <div className={`relative flex items-center gap-4 px-8 py-5 fantasy-panel rounded-xl text-sm font-bold tracking-widest uppercase backdrop-blur-xl transition-all duration-300 border-2 ${connectionStatus === 'connected'
          ? 'text-emerald-400 border-emerald-600/50 shadow-[0_0_20px_rgba(16,185,129,0.2)] bg-stone-900/80'
          : connectionStatus === 'connecting'
            ? 'text-amber-400 border-amber-600/50 shadow-[0_0_20px_rgba(245,158,11,0.2)] bg-stone-900/80'
            : 'text-red-400 border-red-600/50 shadow-[0_0_20px_rgba(239,68,68,0.2)] bg-stone-900/80'
          }`}>
          <div className="corner-accent top-left" style={{ borderColor: 'currentColor', opacity: 0.5 }} />
          <div className="corner-accent top-right" style={{ borderColor: 'currentColor', opacity: 0.5 }} />
          <div className="corner-accent bottom-left" style={{ borderColor: 'currentColor', opacity: 0.5 }} />
          <div className="corner-accent bottom-right" style={{ borderColor: 'currentColor', opacity: 0.5 }} />
          <span className={`w-3 h-3 rounded-full ${connectionStatus === 'connected'
            ? 'bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.7)]'
            : connectionStatus === 'connecting'
              ? 'bg-amber-500 animate-pulse shadow-[0_0_12px_rgba(245,158,11,0.7)]'
              : 'bg-red-500 shadow-[0_0_12px_rgba(239,68,68,0.7)]'
            }`} />
          <span className="relative z-10 font-serif tracking-widest">
            {connectionStatus === 'connected' ? 'Realm Connected' :
              connectionStatus === 'connecting' ? 'Channeling Realm...' : 'Realm Severed'}
          </span>
        </div>
        <button
          onClick={() => setShowHelp(true)}
          className="px-5 py-4 fantasy-panel hover:bg-amber-900/30 rounded-lg text-amber-400 hover:text-amber-100 text-sm font-bold tracking-wider transition-all hover:shadow-[0_0_15px_rgba(245,158,11,0.4)] border border-amber-700/50 bg-stone-900/80"
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
          <div className="absolute inset-0 bg-gradient-to-r from-amber-700/90 to-orange-700/90 rounded-xl" />
          <div className="absolute inset-0 bg-gradient-to-r from-amber-600 to-orange-600 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          {/* Border glow */}
          <div className="absolute inset-0 rounded-xl border-2 border-amber-400/60 group-hover:border-amber-300/80 transition-colors" />
          <div className="absolute inset-0 rounded-xl shadow-[0_0_30px_rgba(245,158,11,0.4)] group-hover:shadow-[0_0_40px_rgba(245,158,11,0.6)] transition-shadow" />

          {/* Content */}
          <div className="relative z-10 flex items-center gap-4 px-10 py-6">
            <span className="text-2xl group-hover:rotate-12 group-hover:scale-110 transition-transform duration-300 drop-shadow-lg">✨</span>
            <span className="text-amber-50 font-black text-lg tracking-widest uppercase drop-shadow-md font-serif">
              Summon Agent
            </span>
            <span className="text-amber-200/80 text-sm font-mono bg-black/30 px-3 py-1.5 rounded-md border border-amber-400/30 tracking-wider">
              N
            </span>
          </div>

          {/* Shine effect */}
          <div className="absolute top-0 -left-[100%] w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12 group-hover:animate-shine" />
        </button>
      )}

      {/* Toast notifications */}
      <ToastContainer />

      {/* Sound controls, session controls, and panel buttons */}
      <div className="fixed bottom-4 right-4 z-40 flex items-center gap-2">
        <SessionControls />
        <div className="w-px h-6 bg-stone-700/50" /> {/* Divider */}
        <ProjectZonesButton onClick={() => setShowProjectZones(true)} />
        <QuestLogButton onClick={() => setShowQuestLog(true)} />
        <SoundToggle />
      </div>

      {/* Modals */}
      {showWelcome && <WelcomeScreen onStart={handleStart} />}
      {showHelp && <HelpOverlay onClose={() => setShowHelp(false)} />}
      {showSpawnDialog && <SpawnAgentDialog onClose={() => setShowSpawnDialog(false)} />}
      {showQuestLog && <QuestLog onClose={() => setShowQuestLog(false)} />}
      <ProjectZonesPanel isOpen={showProjectZones} onClose={() => setShowProjectZones(false)} />
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
