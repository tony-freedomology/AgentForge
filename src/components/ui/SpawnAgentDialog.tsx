import React, { useState } from 'react';
import { useGameStore } from '../../stores/gameStore';
import type { AgentClassConfig } from '../../config/agentClasses';
import { AGENT_CLASSES } from '../../config/agentClasses';
import type { AgentClass, AgentProvider } from '../../types/agent';
import { Sparkles, X, Hexagon, Shield, Zap, Hammer, Pencil, Crosshair, Cpu } from 'lucide-react';

interface SpawnAgentDialogProps {
  onClose: () => void;
}

// Map class IDs to sprite images (Updated to use WEBP for transparency)
const CLASS_SPRITES: Record<string, string> = {
  architect: '/assets/sprites/architect.png',
  mage: '/assets/sprites/mage.webp',
  guardian: '/assets/sprites/guardian.webp',
  designer: '/assets/sprites/artisan.png',
  scout: '/assets/sprites/scout.png',
  engineer: '/assets/sprites/artisan.png',
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
  const [hoveredClassId, setHoveredClassId] = useState<string | null>(null);

  const activeClass = hoveredClassId
    ? AGENT_CLASSES.find(c => c.id === hoveredClassId) || selectedClass
    : selectedClass;

  const activeId = activeClass.id;
  const activeColor = activeClass.color;
  const activeSprite = CLASS_SPRITES[activeId];

  const handleSpawn = () => {
    if (selectedClass) {
      // Default spawn position (center or random offset)
      const position = { q: 0, r: 0, y: 0.5 };

      const provider = selectedClass.cli as AgentProvider;
      // Cast the string ID to the AgentClass union type
      const agentClassType = selectedClass.id as AgentClass;
      const agentName = name || selectedClass.name;

      spawnAgent(provider, agentClassType, agentName, position);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      {/* Main Container - Tech Border Clip */}
      <div
        className="relative w-[1100px] h-[700px] max-h-[90vh] bg-[#0a0f1e] text-white flex overflow-hidden shadow-2xl clip-tech-border"
        style={{
          border: `1px solid ${activeColor}60`,
          boxShadow: `0 0 40px ${activeColor}20`
        }}
      >
        {/* Animated Scanline Overlay */}
        <div className="absolute inset-0 scanlines z-0 pointer-events-none" />

        {/* -- LEFT COLUMN: CONTROLS -- */}
        <div className="w-[40%] p-8 flex flex-col gap-8 border-r border-white/10 relative z-10 bg-black/20">

          {/* Header */}
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-2xl font-display uppercase tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400 font-bold">
              Summon Agent
            </h2>
            <button
              onClick={onClose}
              className="p-1 hover:text-red-500 transition-colors text-white/50"
            >
              <X size={24} />
            </button>
          </div>

          {/* Class Selection Grid */}
          <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
            <div className="text-xs font-tech tracking-widest text-[#06b6d4] mb-3 uppercase opacity-80 flex items-center gap-2">
              <Cpu size={12} /> Select Unit Class
            </div>

            <div className="grid grid-cols-1 gap-3">
              {AGENT_CLASSES.map((agentClass) => {
                const isSelected = selectedClass?.id === agentClass.id;

                return (
                  <button
                    key={agentClass.id}
                    onClick={() => setSelectedClass(agentClass)}
                    onMouseEnter={() => setHoveredClassId(agentClass.id)}
                    onMouseLeave={() => setHoveredClassId(null)}
                    className={`
                      relative group p-6 border transition-all duration-300 text-left
                      ${isSelected ? 'bg-white/5' : 'bg-transparent hover:bg-white/5'}
                    `}
                    style={{
                      borderColor: isSelected ? agentClass.color : 'rgba(255,255,255,0.1)',
                      clipPath: 'polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px)'
                    }}
                  >
                    {/* Active Indicator Strip */}
                    {isSelected && (
                      <div
                        className="absolute top-0 left-0 w-1 h-full animate-pulse"
                        style={{ backgroundColor: agentClass.color }}
                      />
                    )}

                    <div className="flex items-center gap-4 pl-3">
                      <div
                        className={`p-2 rounded-sm transition-all duration-300 ${isSelected ? 'scale-110' : 'grayscale opacity-70 group-hover:grayscale-0 group-hover:opacity-100'}`}
                        style={{
                          backgroundColor: isSelected ? `${agentClass.color}20` : 'transparent',
                          color: agentClass.color
                        }}
                      >
                        {CLASS_ICONS[agentClass.id] || <Sparkles size={20} />}
                      </div>

                      <div>
                        <div
                          className="font-display font-bold text-sm tracking-wide uppercase transition-colors"
                          style={{ color: isSelected ? 'white' : 'rgba(255,255,255,0.7)' }}
                        >
                          {agentClass.name}
                        </div>
                        <div className="text-[10px] font-mono text-white/40 uppercase tracking-wider">
                          {agentClass.description.split(' ')[0]} Unit
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Configuration Inputs */}
          <div className="space-y-4 pt-4 border-t border-white/10">
            <div>
              <label className="text-[10px] font-tech text-[#06b6d4] uppercase tracking-widest pl-1 mb-1 block">
                Designation ID
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={selectedClass?.name || 'Enter Designation...'}
                className="input-tech w-full px-4 py-3 text-sm text-white focus:text-[#06b6d4] placeholder-white/20 uppercase"
                style={{ borderColor: `${activeColor}40` }}
              />
            </div>

            <button
              onClick={handleSpawn}
              disabled={!selectedClass}
              className="w-full h-16 relative group overflow-hidden clip-tech-button mt-6 cursor-pointer"
              style={{
                background: `linear-gradient(90deg, ${activeColor}20, ${activeColor}40)`,
                border: `1px solid ${activeColor}`,
              }}
            >
              <span className="relative z-10 flex items-center justify-center gap-2 font-display font-bold tracking-widest text-lg uppercase text-white group-hover:text-black transition-colors">
                <Zap size={18} className={!selectedClass ? '' : 'fill-current'} />
                Initialize
              </span>
              {/* Hover Fill Effect */}
              <div
                className="absolute inset-0 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-300 ease-out z-0"
                style={{ backgroundColor: activeColor }}
              />
            </button>
          </div>
        </div>

        {/* -- RIGHT COLUMN: VISUAL PREVIEW -- */}
        <div className="w-[60%] relative bg-[#050510] flex flex-col items-center justify-center overflow-hidden">
          {/* Grid Background */}
          <div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: `
                    linear-gradient(to right, ${activeColor}20 1px, transparent 1px),
                    linear-gradient(to bottom, ${activeColor}20 1px, transparent 1px)
                  `,
              backgroundSize: '40px 40px',
              maskImage: 'radial-gradient(circle at center, black 40%, transparent 100%)'
            }}
          />

          {/* Ambient Environment Glow */}
          <div
            className="absolute inset-0 opacity-30 transition-colors duration-700"
            style={{
              background: `radial-gradient(circle at 50% 60%, ${activeColor}40 0%, transparent 70%)`
            }}
          />

          {/* Holo Pedestal */}
          <div className="holo-pedestal" style={{ borderColor: `${activeColor}40` }} />

          {/* Character Sprite Display */}
          {activeSprite && (
            <div className="relative z-10 transform scale-150 transition-all duration-500 ease-out hover:scale-[1.6] mb-10">
              <img
                src={activeSprite}
                alt={activeClass?.name}
                className="w-64 h-64 object-contain image-pixelated drop-shadow-[0_0_15px_rgba(0,0,0,0.8)]"
              />
              {/* Reflection/Grounding Shadow */}
              <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-32 h-4 bg-black/50 blur-lg rounded-full" />
            </div>
          )}

          {/* Character Data Overlay */}
          <div className="absolute bottom-10 left-10 right-10 z-20">
            <div className="flex items-end justify-between border-b border-white/20 pb-4">
              <div>
                <h1
                  className="text-6xl font-display font-black uppercase text-transparent bg-clip-text bg-gradient-to-br from-white to-gray-400 drop-shadow-lg"
                  style={{ filter: `drop-shadow(0 0 10px ${activeColor}60)` }}
                >
                  {activeClass?.name || 'Unknown'}
                </h1>
                <div className="flex items-center gap-3 mt-2">
                  <span
                    className="px-2 py-1 text-[10px] font-mono uppercase bg-white/10 border border-white/20 rounded text-white/80"
                  >
                    {activeId.toUpperCase()} UNIT
                  </span>
                  <span className="text-sm font-tech text-white/60 tracking-wider">
                    Level 1
                  </span>
                </div>
              </div>

              {/* Decorative Tech Elements */}
              <div className="flex gap-1 items-end opacity-50">
                <div className="w-2 h-8 bg-current" style={{ backgroundColor: activeColor }} />
                <div className="w-2 h-12 bg-current" style={{ backgroundColor: activeColor }} />
                <div className="w-2 h-6 bg-current" style={{ backgroundColor: activeColor }} />
              </div>
            </div>

            <p className="mt-4 font-tech text-xl text-white/80 max-w-lg leading-relaxed drop-shadow-md">
              {activeClass?.description}
            </p>
          </div>

          {/* Top Right Decorative Tag */}
          <div className="absolute top-6 right-6 flex items-center gap-2 opacity-50 font-mono text-xs">
            <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: activeColor }} />
            STATUS: ONLINE
          </div>
        </div>
      </div>
    </div>
  );
};
