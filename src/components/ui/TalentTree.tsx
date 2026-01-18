/**
 * Talent Tree - WoW-style talent specialization panel
 *
 * Displays a 5-tier, 3-column talent tree for agent specialization.
 * Click talents to allocate points earned through leveling.
 */

import { useState, useMemo, useEffect } from 'react';
import { useGameStore } from '../../stores/gameStore';
import { getAgentClass } from '../../config/agentClasses';
import { CLASS_TALENTS, canLearnTalent, calculateTalentBonuses } from '../../config/talents';
import type { Agent, Talent, TalentTier } from '../../types/agent';
import { X, Sparkles, Lock, ChevronUp, Zap } from 'lucide-react';
import { useTalentSounds } from '../../hooks/useSound';

interface TalentNodeProps {
  talent: Talent;
  agent: Agent;
  currentRank: number;
  canLearn: boolean;
  reason?: string;
  onAllocate: () => void;
}

// Talent frame asset paths
const TALENT_FRAME_ASSETS = {
  locked: '/assets_isometric/ui/talents/talent_frame_locked.png',
  available: '/assets_isometric/ui/talents/talent_frame_available.png',
  learned: '/assets_isometric/ui/talents/talent_frame_learned.png',
  maxed: '/assets_isometric/ui/talents/talent_frame_maxed.png',
};

function TalentNode({ talent, agent, currentRank, canLearn, reason, onAllocate }: TalentNodeProps) {
  const [isHovered, setIsHovered] = useState(false);
  const classConfig = getAgentClass(agent.class);
  const classColor = classConfig?.color || '#f59e0b';

  const isMaxed = currentRank >= talent.maxRanks;
  const isLocked = currentRank === 0 && !canLearn;
  const isPartial = currentRank > 0 && currentRank < talent.maxRanks;

  // Determine which frame asset to use
  const getFrameAsset = () => {
    if (isMaxed) return TALENT_FRAME_ASSETS.maxed;
    if (isPartial) return TALENT_FRAME_ASSETS.learned;
    if (canLearn) return TALENT_FRAME_ASSETS.available;
    return TALENT_FRAME_ASSETS.locked;
  };

  // Determine node style based on state (fallback + enhancements)
  const getNodeStyle = () => {
    const frameAsset = getFrameAsset();
    const baseStyle = {
      backgroundImage: `url(${frameAsset})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
    };

    if (isMaxed) {
      return {
        ...baseStyle,
        border: `2px solid ${classColor}`,
        boxShadow: `0 0 20px ${classColor}50, inset 0 0 15px ${classColor}30`,
      };
    }
    if (isPartial) {
      return {
        ...baseStyle,
        border: `2px solid ${classColor}80`,
        boxShadow: `0 0 10px ${classColor}30`,
      };
    }
    if (canLearn) {
      return {
        ...baseStyle,
        border: '2px solid rgba(245,158,11,0.5)',
        boxShadow: '0 0 10px rgba(245,158,11,0.2)',
      };
    }
    return {
      ...baseStyle,
      border: '2px solid rgba(255,255,255,0.1)',
      boxShadow: 'none',
    };
  };

  return (
    <div className="relative">
      {/* Talent node button */}
      <button
        onClick={canLearn && !isMaxed ? onAllocate : undefined}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        disabled={isLocked || isMaxed}
        className={`
          relative w-16 h-16 rounded-lg flex items-center justify-center text-2xl
          transition-all duration-200
          ${canLearn && !isMaxed ? 'cursor-pointer hover:scale-110' : 'cursor-default'}
          ${isLocked ? 'grayscale opacity-50' : ''}
        `}
        style={getNodeStyle()}
      >
        {/* Icon */}
        <span className={isMaxed ? 'drop-shadow-lg' : ''}>{talent.icon}</span>

        {/* Lock overlay */}
        {isLocked && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-lg">
            <Lock size={16} className="text-gray-500" />
          </div>
        )}

        {/* Rank indicator */}
        <div
          className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold"
          style={{
            background: isMaxed
              ? `linear-gradient(135deg, ${classColor}, ${classColor}80)`
              : 'rgba(0,0,0,0.8)',
            border: `2px solid ${isMaxed ? classColor : 'rgba(255,255,255,0.2)'}`,
            color: isMaxed ? '#000' : '#fff',
          }}
        >
          {currentRank}/{talent.maxRanks}
        </div>

        {/* Sparkle effect when maxed */}
        {isMaxed && (
          <Sparkles
            size={12}
            className="absolute -top-1 -right-1 animate-pulse"
            style={{ color: classColor }}
          />
        )}
      </button>

      {/* Tooltip */}
      {isHovered && (
        <div
          className="absolute z-50 left-20 top-0 w-64 p-4 rounded-lg fantasy-panel shadow-2xl"
          style={{ borderColor: `${classColor}40` }}
        >
          {/* Header */}
          <div className="flex items-center gap-3 mb-2">
            <span className="text-2xl">{talent.icon}</span>
            <div>
              <h4 className="font-bold text-white">{talent.name}</h4>
              <span className="text-xs text-gray-400">
                Rank {currentRank}/{talent.maxRanks}
              </span>
            </div>
          </div>

          {/* Description */}
          <p className="text-sm text-gray-300 mb-3">{talent.description}</p>

          {/* Effect */}
          <div
            className="text-xs px-2 py-1 rounded mb-2"
            style={{ background: `${classColor}20`, color: classColor }}
          >
            {talent.effect.description}
          </div>

          {/* Requirements/Status */}
          {!canLearn && reason && (
            <div className="text-xs text-red-400 flex items-center gap-1">
              <Lock size={12} />
              {reason}
            </div>
          )}
          {canLearn && !isMaxed && (
            <div className="text-xs text-green-400 flex items-center gap-1">
              <Zap size={12} />
              Click to learn
            </div>
          )}
          {isMaxed && (
            <div className="text-xs flex items-center gap-1" style={{ color: classColor }}>
              <Sparkles size={12} />
              Fully learned
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Connection lines between talents
function TalentConnection({
  fromTier,
  fromCol,
  toTier,
  toCol,
  isActive,
  classColor,
}: {
  fromTier: number;
  fromCol: number;
  toTier: number;
  toCol: number;
  isActive: boolean;
  classColor: string;
}) {
  // Only render vertical connections for now
  if (fromCol !== toCol) return null;
  if (toTier !== fromTier + 1) return null;

  return (
    <div
      className="absolute w-0.5 h-8 left-1/2 -translate-x-1/2 -bottom-8"
      style={{
        background: isActive
          ? `linear-gradient(180deg, ${classColor}, ${classColor}50)`
          : 'rgba(255,255,255,0.1)',
        boxShadow: isActive ? `0 0 8px ${classColor}50` : 'none',
      }}
    />
  );
}

interface TalentTreeProps {
  agent: Agent;
  onClose: () => void;
}

export function TalentTree({ agent, onClose }: TalentTreeProps) {
  const allocateTalent = useGameStore((s) => s.allocateTalent);
  const classConfig = getAgentClass(agent.class);
  const classColor = classConfig?.color || '#f59e0b';
  const talents = CLASS_TALENTS[agent.class] || [];
  const { playAllocate, playMaxed, playTreeOpen, playTreeClose } = useTalentSounds();

  // Play open sound on mount
  useEffect(() => {
    playTreeOpen();
  }, [playTreeOpen]);

  // Group talents by tier
  const talentsByTier = useMemo(() => {
    const grouped: Record<TalentTier, Talent[]> = { 1: [], 2: [], 3: [], 4: [], 5: [] };
    talents.forEach((t) => {
      grouped[t.tier].push(t);
    });
    // Sort by column within each tier
    Object.values(grouped).forEach((tierTalents) => {
      tierTalents.sort((a, b) => a.column - b.column);
    });
    return grouped;
  }, [talents]);

  // Calculate bonuses
  const bonuses = useMemo(
    () => calculateTalentBonuses(agent.class, agent.talents.allocated),
    [agent.class, agent.talents.allocated]
  );

  // Total points spent
  const pointsSpent = Object.values(agent.talents.allocated).reduce((sum, r) => sum + r, 0);

  const handleAllocate = (talentId: string) => {
    const talent = talents.find(t => t.id === talentId);
    const currentRank = agent.talents.allocated[talentId] || 0;

    const success = allocateTalent(agent.id, talentId);
    if (success) {
      // Check if we just maxed the talent
      if (talent && currentRank + 1 >= talent.maxRanks) {
        playMaxed();
      } else {
        playAllocate();
      }
    }
  };

  const handleClose = () => {
    playTreeClose();
    onClose();
  };

  return (
    <div
      className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 backdrop-blur-sm"
      onClick={handleClose}
    >
      <div
        className="fantasy-panel rounded-2xl w-[600px] max-w-[95vw] max-h-[90vh] overflow-hidden flex flex-col shadow-2xl"
        style={{ borderColor: `${classColor}40`, boxShadow: `0 0 60px ${classColor}20` }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Corner accents */}
        <div className="corner-accent top-left" style={{ '--accent-color': classColor } as React.CSSProperties} />
        <div className="corner-accent top-right" style={{ '--accent-color': classColor } as React.CSSProperties} />
        <div className="corner-accent bottom-left" style={{ '--accent-color': classColor } as React.CSSProperties} />
        <div className="corner-accent bottom-right" style={{ '--accent-color': classColor } as React.CSSProperties} />

        {/* Header */}
        <div
          className="px-6 py-5 border-b flex items-center justify-between"
          style={{
            borderColor: `${classColor}30`,
            background: `linear-gradient(180deg, ${classColor}15 0%, transparent 100%)`,
          }}
        >
          <div className="flex items-center gap-4">
            <span className="text-4xl">{classConfig?.icon || '🧙'}</span>
            <div>
              <h2
                className="text-xl font-black uppercase tracking-wider"
                style={{ color: classColor }}
              >
                {classConfig?.title || agent.class} Talents
              </h2>
              <p className="text-gray-400 text-sm">{agent.name} • Level {agent.level}</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Points available */}
            <div
              className="px-4 py-2 rounded-lg text-center"
              style={{ background: `${classColor}20`, border: `1px solid ${classColor}40` }}
            >
              <div className="text-2xl font-black" style={{ color: classColor }}>
                {agent.talents.points}
              </div>
              <div className="text-[10px] text-gray-400 uppercase tracking-wider">Points</div>
            </div>

            <button
              onClick={handleClose}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors text-gray-500 hover:text-white"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Talent Tree */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-4">
            {([5, 4, 3, 2, 1] as TalentTier[]).map((tier) => (
              <div key={tier} className="flex items-center gap-4">
                {/* Tier label */}
                <div
                  className="w-12 h-12 rounded-lg flex items-center justify-center text-xs font-bold uppercase"
                  style={{
                    background: 'rgba(0,0,0,0.4)',
                    border: '1px solid rgba(255,255,255,0.1)',
                  }}
                >
                  Tier
                  <br />
                  {tier}
                </div>

                {/* Talents in tier */}
                <div className="flex-1 flex justify-around">
                  {[0, 1, 2].map((col) => {
                    const talent = talentsByTier[tier].find((t) => t.column === col);
                    if (!talent) {
                      return <div key={col} className="w-16 h-16" />;
                    }

                    const currentRank = agent.talents.allocated[talent.id] || 0;
                    const { canLearn, reason } = canLearnTalent(
                      agent.class,
                      talent.id,
                      agent.talents.allocated,
                      agent.talents.points,
                      agent.level
                    );

                    // Check if connection to next tier should be active
                    const nextTierTalent = talents.find(
                      (t) => t.tier === tier + 1 && t.requires === talent.id
                    );
                    const connectionActive = currentRank >= talent.maxRanks;

                    return (
                      <div key={col} className="relative">
                        <TalentNode
                          talent={talent}
                          agent={agent}
                          currentRank={currentRank}
                          canLearn={canLearn}
                          reason={reason}
                          onAllocate={() => handleAllocate(talent.id)}
                        />
                        {nextTierTalent && (
                          <TalentConnection
                            fromTier={tier}
                            fromCol={col}
                            toTier={tier + 1}
                            toCol={nextTierTalent.column}
                            isActive={connectionActive}
                            classColor={classColor}
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer - Stats */}
        <div
          className="px-6 py-4 border-t flex items-center justify-between text-xs"
          style={{ borderColor: `${classColor}20` }}
        >
          <div className="flex items-center gap-6">
            <span className="text-gray-500">
              {pointsSpent} points spent
            </span>
            {Object.entries(bonuses)
              .filter(([, v]) => v > 0)
              .map(([stat, value]) => (
                <span key={stat} className="flex items-center gap-1" style={{ color: classColor }}>
                  <ChevronUp size={12} />
                  +{value}% {stat}
                </span>
              ))}
          </div>
          <span className="text-gray-500">
            Next point at level {agent.level + 1}
          </span>
        </div>
      </div>
    </div>
  );
}

// Compact talent indicator for agent cards
export function TalentIndicator({ agent }: { agent: Agent }) {
  const pointsSpent = Object.values(agent.talents.allocated).reduce((sum, r) => sum + r, 0);

  if (pointsSpent === 0 && agent.talents.points === 0) return null;

  const classConfig = getAgentClass(agent.class);
  const classColor = classConfig?.color || '#f59e0b';

  return (
    <div
      className="flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold"
      style={{
        background: agent.talents.points > 0 ? `${classColor}30` : 'rgba(0,0,0,0.3)',
        border: `1px solid ${agent.talents.points > 0 ? classColor : 'rgba(255,255,255,0.1)'}`,
        color: agent.talents.points > 0 ? classColor : '#9ca3af',
      }}
    >
      <Sparkles size={10} />
      <span>{pointsSpent}</span>
      {agent.talents.points > 0 && (
        <span className="animate-pulse">+{agent.talents.points}</span>
      )}
    </div>
  );
}
