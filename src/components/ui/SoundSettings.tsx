/**
 * Sound Settings - Audio control panel
 *
 * Allows users to control volume levels for different sound categories
 * and toggle audio on/off.
 */

import { useState, useCallback } from 'react';
import { soundManager } from '../../services/soundManager';
import type { SoundCategory } from '../../services/soundManager';
import { Volume2, VolumeX, Music, Sword, Wand2, ScrollText, Settings, Sparkles, Waves } from 'lucide-react';

interface VolumeSliderProps {
  label: string;
  icon: React.ReactNode;
  value: number;
  onChange: (value: number) => void;
  color: string;
}

function VolumeSlider({ label, icon, value, onChange, color }: VolumeSliderProps) {
  return (
    <div className="flex items-center gap-3">
      <div
        className="w-8 h-8 rounded flex items-center justify-center"
        style={{ background: `${color}20`, color }}
      >
        {icon}
      </div>
      <div className="flex-1">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-gray-400 uppercase tracking-wider">{label}</span>
          <span className="text-xs font-mono text-gray-500">{Math.round(value * 100)}%</span>
        </div>
        <input
          type="range"
          min="0"
          max="100"
          value={value * 100}
          onChange={(e) => onChange(parseInt(e.target.value) / 100)}
          className="w-full h-2 rounded-lg appearance-none cursor-pointer"
          style={{
            background: `linear-gradient(to right, ${color} 0%, ${color} ${value * 100}%, rgba(255,255,255,0.1) ${value * 100}%, rgba(255,255,255,0.1) 100%)`,
          }}
        />
      </div>
    </div>
  );
}

interface SoundSettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SoundSettings({ isOpen, onClose }: SoundSettingsProps) {
  const [masterVolume, setMasterVolume] = useState(0.8);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [categoryVolumes, setCategoryVolumes] = useState<Record<SoundCategory, number>>({
    ui: 0.7,
    agent: 0.8,
    quest: 0.9,
    talent: 0.8,
    combat: 0.9,
    ambient: 0.4,
    music: 0.5,
  });

  const handleMasterVolumeChange = useCallback((volume: number) => {
    setMasterVolume(volume);
    soundManager.setMasterVolume(volume);
  }, []);

  const handleCategoryVolumeChange = useCallback((category: SoundCategory, volume: number) => {
    setCategoryVolumes((prev) => ({ ...prev, [category]: volume }));
    soundManager.setCategoryVolume(category, volume);
  }, []);

  const handleToggleSound = useCallback(() => {
    const newEnabled = !soundEnabled;
    setSoundEnabled(newEnabled);
    soundManager.setEnabled(newEnabled);
  }, [soundEnabled]);

  if (!isOpen) return null;

  const categories: { key: SoundCategory; label: string; icon: React.ReactNode; color: string }[] = [
    { key: 'ui', label: 'Interface', icon: <Settings size={16} />, color: '#3b82f6' },
    { key: 'agent', label: 'Agents', icon: <Wand2 size={16} />, color: '#8b5cf6' },
    { key: 'quest', label: 'Quests', icon: <ScrollText size={16} />, color: '#f59e0b' },
    { key: 'talent', label: 'Talents', icon: <Sparkles size={16} />, color: '#ec4899' },
    { key: 'combat', label: 'Alerts', icon: <Sword size={16} />, color: '#ef4444' },
    { key: 'ambient', label: 'Ambient', icon: <Waves size={16} />, color: '#06b6d4' },
    { key: 'music', label: 'Music', icon: <Music size={16} />, color: '#22c55e' },
  ];

  return (
    <div
      className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="fantasy-panel rounded-xl w-96 p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
              <Volume2 className="text-amber-400" size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Sound Settings</h2>
              <p className="text-xs text-gray-500">Adjust audio levels</p>
            </div>
          </div>

          {/* Master toggle */}
          <button
            onClick={handleToggleSound}
            className={`
              p-2 rounded-lg transition-all
              ${soundEnabled
                ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                : 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
              }
            `}
          >
            {soundEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
          </button>
        </div>

        {/* Master volume */}
        <div className="mb-6 pb-6 border-b border-white/10">
          <VolumeSlider
            label="Master Volume"
            icon={<Volume2 size={16} />}
            value={masterVolume}
            onChange={handleMasterVolumeChange}
            color="#f59e0b"
          />
        </div>

        {/* Category volumes */}
        <div className="space-y-4">
          {categories.map(({ key, label, icon, color }) => (
            <VolumeSlider
              key={key}
              label={label}
              icon={icon}
              value={categoryVolumes[key]}
              onChange={(v) => handleCategoryVolumeChange(key, v)}
              color={color}
            />
          ))}
        </div>

        {/* Footer note */}
        <p className="mt-6 text-[10px] text-gray-600 text-center">
          Sounds will play when audio files are available
        </p>
      </div>
    </div>
  );
}

// Compact sound toggle button for the toolbar
export function SoundToggle() {
  const [isOpen, setIsOpen] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const handleToggle = useCallback(() => {
    const newEnabled = !soundEnabled;
    setSoundEnabled(newEnabled);
    soundManager.setEnabled(newEnabled);
  }, [soundEnabled]);

  return (
    <>
      <div className="flex items-center gap-1">
        <button
          onClick={handleToggle}
          className={`
            p-2 rounded-lg transition-all
            ${soundEnabled
              ? 'bg-amber-500/20 text-amber-400 hover:bg-amber-500/30'
              : 'bg-gray-700/50 text-gray-500 hover:bg-gray-700'
            }
          `}
          title={soundEnabled ? 'Sound On' : 'Sound Off'}
        >
          {soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
        </button>

        <button
          onClick={() => setIsOpen(true)}
          className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
          title="Sound Settings"
        >
          <Settings size={18} />
        </button>
      </div>

      <SoundSettings isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}
