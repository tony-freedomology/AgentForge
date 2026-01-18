import React, { useState } from 'react';
import { useGameStore } from '../../stores/gameStore';
import type { AgentClassConfig } from '../../config/agentClasses';
import { AGENT_CLASSES } from '../../config/agentClasses';
import type { AgentClass, AgentProvider } from '../../types/agent';
import { Sparkles, X, Hexagon, Shield, Zap, Hammer, Pencil, Crosshair, FolderOpen, Scroll } from 'lucide-react';
import { cn } from '../../utils/cn';
import { PixelButton } from './PixelButton';

interface SpawnAgentDialogProps {
  onClose: () => void;
}

// Map class IDs to sprite images
const CLASS_SPRITES: Record<string, string> = {
  architect: '/assets/sprites/architect.png',
  mage: '/assets/sprites/mage.png',
  guardian: '/assets/sprites/guardian.png',
  designer: '/assets/sprites/designer.png',
  scout: '/assets/sprites/scout.png',
  engineer: '/assets/sprites/engineer.png',
};

// Map classes to Lucide icons
const CLASS_ICONS: Record<string, React.ReactNode> = {
  architect: <Hexagon className="w-5 h-5" />,
  mage: <Zap className="w-5 h-5" />,
  guardian: <Shield className="w-5 h-5" />,
  designer: <Pencil className="w-5 h-5" />,
  scout: <Crosshair className="w-5 h-5" />,
  engineer: <Hammer className="w-5 h-5" />,
};

export const SpawnAgentDialog: React.FC<SpawnAgentDialogProps> = ({ onClose }) => {
  const { spawnAgent } = useGameStore();

  const [selectedClass, setSelectedClass] = useState<AgentClassConfig>(AGENT_CLASSES[0]);
  const [name, setName] = useState('');
  const [workingDir, setWorkingDir] = useState('~');

  const activeId = selectedClass.id;
  const activeSprite = CLASS_SPRITES[activeId];

  const handleSpawn = () => {
    if (selectedClass) {
      const position = { q: 0, r: 0, y: 0.5 };
      const provider = selectedClass.cli as AgentProvider;
      const agentClassType = selectedClass.id as AgentClass;
      const agentName = name || selectedClass.name;
      spawnAgent(provider, agentClassType, agentName, position, workingDir || '~');
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-5xl h-[700px] flex rounded-xl overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.8)] border-4 border-stone-800 bg-stone-900 pixel-box">

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-50 p-2 text-stone-400 hover:text-white bg-stone-800/80 hover:bg-red-900/80 rounded border-2 border-stone-600 hover:border-red-700 transition-colors"
        >
          <X size={20} />
        </button>

        {/* --- LEFT COLUMN: CLASS SELECTION --- */}
        <div className="w-1/3 border-r-4 border-stone-800 bg-stone-900 flex flex-col">
          <div className="p-6 border-b-4 border-stone-800 bg-stone-950">
            <h2 className="font-serif text-xl text-amber-500 drop-shadow-[0_2px_0_rgba(0,0,0,0.8)] tracking-wide uppercase font-bold">
              Select Archetype
            </h2>
            <p className="font-serif text-stone-400 text-sm mt-1 italic">
              Choose your champion's path
            </p>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar bg-stone-900">
            {AGENT_CLASSES.map((agentClass) => {
              const isSelected = selectedClass.id === agentClass.id;
              return (
                <button
                  key={agentClass.id}
                  onClick={() => setSelectedClass(agentClass)}
                  className={cn(
                    "w-full text-left p-4 border-2 transition-all duration-200 relative overflow-hidden group rounded-lg",
                    isSelected
                      ? "bg-stone-800 border-amber-600 shadow-[0_4px_0_rgba(0,0,0,0.5)] translate-y-[-2px]"
                      : "bg-stone-900 border-stone-700 hover:bg-stone-800 hover:border-stone-500"
                  )}
                >
                  <div className="flex items-center gap-3 relative z-10">
                    <div className={cn(
                      "p-2 rounded border-2",
                      isSelected
                        ? "bg-amber-900/30 border-amber-600 text-amber-500"
                        : "bg-stone-950 border-stone-800 text-stone-600 group-hover:text-stone-400"
                    )}>
                      {CLASS_ICONS[agentClass.id] || <Sparkles size={16} />}
                    </div>
                    <div>
                      <div className={cn(
                        "font-serif font-bold text-sm mb-1 uppercase tracking-wide",
                        isSelected ? "text-amber-100" : "text-stone-500 group-hover:text-stone-300"
                      )}>
                        {agentClass.name}
                      </div>
                      <div className="font-serif text-xs text-stone-600 uppercase">
                        {agentClass.description.split(' ')[0]} Unit
                      </div>
                    </div>
                  </div>

                  {/* Selection Indicator */}
                  {isSelected && (
                    <div className="absolute inset-0 border-2 border-amber-500/20 pointer-events-none animate-pulse-slow rounded-lg" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* --- MIDDLE COLUMN: PREVIEW --- */}
        <div className="w-1/3 bg-stone-950 relative flex flex-col items-center justify-center p-8 border-r-4 border-stone-800 overflow-hidden">
          {/* Background Grid */}
          <div className="absolute inset-0 opacity-10 bg-[url('/assets/textures/grid.png')] bg-repeat pixel-art" style={{ backgroundSize: '64px' }} />

          {/* Spotlight */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-gradient-to-b from-amber-500/10 via-transparent to-transparent pointer-events-none" />

          {/* Character */}
          <div className="relative z-10 group">
            {/* Character Sprite */}
            {activeSprite ? (
              <img
                src={activeSprite}
                alt={selectedClass.name}
                className="w-48 h-48 object-contain pixel-art drop-shadow-[0_10px_20px_rgba(0,0,0,0.8)] transform transition-transform duration-500 group-hover:scale-110"
              />
            ) : (
              <div className="w-32 h-48 bg-stone-900/50 rounded flex items-center justify-center border-2 border-dashed border-stone-700">
                <span className="text-stone-600 font-serif text-[10px] uppercase">No Visage</span>
              </div>
            )}

            {/* Pedestal/Shadow */}
            <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-32 h-8 bg-black/60 rounded-[100%] blur-md" />
          </div>

          <div className="mt-12 text-center relative z-10">
            <h3 className="font-serif text-2xl text-amber-100 mb-2 drop-shadow-md tracking-wide">
              {selectedClass.name}
            </h3>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-stone-900 border border-stone-700 rounded-full">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-serif text-emerald-400 text-sm uppercase tracking-widest font-bold">
                Ready
              </span>
            </div>
          </div>
        </div>

        {/* --- RIGHT COLUMN: CONFIG --- */}
        <div className="w-1/3 bg-stone-900 p-8 flex flex-col">
          <div className="mb-8">
            <h3 className="font-serif text-sm text-stone-500 mb-6 uppercase tracking-widest border-b-2 border-stone-800 pb-2 font-bold">
              Champion Identity
            </h3>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="font-serif text-xs text-amber-600 uppercase font-bold tracking-wide">
                  True Name
                </label>
                <div className="relative">
                  <Scroll className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-600" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={selectedClass.name}
                    className="w-full bg-stone-950 border-2 border-stone-700 px-4 pl-10 py-3 font-serif text-lg text-amber-100 focus:border-amber-600 focus:outline-none placeholder-stone-700 transition-colors rounded-lg"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="font-serif text-xs text-amber-600 uppercase font-bold tracking-wide">
                  Realm Dominion (Path)
                </label>
                <div className="relative">
                  <FolderOpen className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-600" />
                  <input
                    type="text"
                    value={workingDir}
                    onChange={(e) => setWorkingDir(e.target.value)}
                    placeholder="~/projects/..."
                    className="w-full bg-stone-950 border-2 border-stone-700 px-4 pl-10 py-3 font-mono text-sm text-stone-300 focus:border-amber-600 focus:outline-none placeholder-stone-700 transition-colors rounded-lg"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-auto space-y-4">
            <div className="p-4 bg-stone-950/50 border border-stone-800 rounded-lg text-center">
              <p className="font-serif text-stone-500 text-sm italic leading-relaxed">
                "{selectedClass.description}"
              </p>
            </div>

            <PixelButton
              size="lg"
              className="w-full py-4 text-lg border-2 shadow-[0_4px_0_rgba(0,0,0,0.5)] active:translate-y-1 active:shadow-none bg-amber-700 hover:bg-amber-600 border-amber-900 text-amber-50"
              onClick={handleSpawn}
            >
              <Zap className="mr-2 w-5 h-5" />
              SUMMON CHAMPION
            </PixelButton>
          </div>
        </div>

      </div>
    </div>
  );
};
