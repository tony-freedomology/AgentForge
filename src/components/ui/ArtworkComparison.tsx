import React, { useState, useEffect, useCallback } from 'react';
import { ArrowLeftRight, Check, ChevronLeft, ChevronRight, Eye, Layers } from 'lucide-react';

type ViewMode = 'side-by-side' | 'toggle' | 'slider';
type AssetSource = 'assets' | 'assets_opus' | 'assets_opus_clean';

interface CharacterSprite {
  id: string;
  name: string;
  file: string;
}

// Character sprites - Agent A uses webp/gif, Agent B (Opus) uses png
const CHARACTERS: CharacterSprite[] = [
  { id: 'mage', name: 'Mage', file: 'mage' },
  { id: 'architect', name: 'Architect', file: 'architect' },
  { id: 'guardian', name: 'Guardian', file: 'guardian' },
  { id: 'artisan', name: 'Artisan', file: 'artisan' },
  { id: 'scout', name: 'Scout', file: 'scout' },
  { id: 'engineer', name: 'Engineer', file: 'engineer' },
  { id: 'designer', name: 'Designer', file: 'designer' },
];

// File extensions by source - Agent A has webp/gif, Agent B has png
const SOURCE_EXTENSIONS: Record<AssetSource, Record<string, string>> = {
  assets: {
    mage: 'webp',
    guardian: 'webp',
    architect: 'png',
    artisan: 'png',
    scout: 'png',
    engineer: 'png',
    designer: 'png',
  },
  assets_opus: {
    mage: 'png',
    guardian: 'png',
    architect: 'png',
    artisan: 'png',
    scout: 'png',
    engineer: 'png',
    designer: 'png',
  },
  assets_opus_clean: {
    mage: 'png',
    guardian: 'png',
    architect: 'png',
    artisan: 'png',
    scout: 'png',
    engineer: 'png',
    designer: 'png',
  }
};

const SOURCE_LABELS: Record<AssetSource, { label: string; description: string; color: string }> = {
  assets: { label: 'Agent A', description: 'Original Assets', color: '#f59e0b' },
  assets_opus: { label: 'Agent B', description: 'Gemini Generated', color: '#8b5cf6' },
  assets_opus_clean: { label: 'Agent B (Clean)', description: 'BG Removed', color: '#10b981' },
};

interface ArtworkComparisonProps {
  onClose?: () => void;
}

export const ArtworkComparison: React.FC<ArtworkComparisonProps> = ({ onClose }) => {
  const [viewMode, setViewMode] = useState<ViewMode>('side-by-side');
  const [selectedCharacter, setSelectedCharacter] = useState<CharacterSprite>(CHARACTERS[0]);
  const [activeSource, setActiveSource] = useState<AssetSource>('assets_opus');
  const [sliderPosition, setSliderPosition] = useState(50);
  const [favorites, setFavorites] = useState<Record<string, AssetSource>>({});
  const [leftSource, setLeftSource] = useState<AssetSource>('assets');
  const [rightSource, setRightSource] = useState<AssetSource>('assets_opus');

  const ALL_SOURCES: AssetSource[] = ['assets', 'assets_opus', 'assets_opus_clean'];

  const getSpritePath = (source: AssetSource, charId: string) => {
    const ext = SOURCE_EXTENSIONS[source][charId] || 'png';
    if (source === 'assets_opus_clean') {
      return `/assets_opus/sprites_clean/${charId}.${ext}`;
    }
    return `/${source}/sprites/${charId}.${ext}`;
  };

  const toggleFavorite = (characterId: string, source: AssetSource) => {
    setFavorites(prev => {
      const newFavorites = { ...prev };
      if (newFavorites[characterId] === source) {
        delete newFavorites[characterId];
      } else {
        newFavorites[characterId] = source;
      }
      return newFavorites;
    });
  };

  const handleNextCharacter = useCallback(() => {
    const currentIndex = CHARACTERS.findIndex(c => c.id === selectedCharacter.id);
    const nextIndex = (currentIndex + 1) % CHARACTERS.length;
    setSelectedCharacter(CHARACTERS[nextIndex]);
  }, [selectedCharacter]);

  const handlePrevCharacterCb = useCallback(() => {
    const currentIndex = CHARACTERS.findIndex(c => c.id === selectedCharacter.id);
    const prevIndex = (currentIndex - 1 + CHARACTERS.length) % CHARACTERS.length;
    setSelectedCharacter(CHARACTERS[prevIndex]);
  }, [selectedCharacter]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handlePrevCharacterCb();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        handleNextCharacter();
      } else if (e.key === ' ' && viewMode === 'toggle') {
        e.preventDefault();
        setActiveSource(prev => prev === 'assets' ? 'assets_opus' : 'assets');
      } else if (e.key === 'Escape' && onClose) {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleNextCharacter, handlePrevCharacterCb, viewMode, onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm">
      <div className="relative w-[1200px] max-w-[95vw] h-[800px] max-h-[90vh] bg-[#0a0f1e] text-white flex flex-col overflow-hidden shadow-2xl border border-white/10 rounded-lg">

        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10 bg-black/20">
          <div className="flex items-center gap-4">
            <Layers className="w-6 h-6 text-purple-400" />
            <h2 className="text-xl font-bold tracking-wide">Artwork A/B Comparison</h2>
          </div>

          {/* View Mode Selector */}
          <div className="flex items-center gap-2 bg-white/5 rounded-lg p-1">
            {(['side-by-side', 'toggle', 'slider'] as ViewMode[]).map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  viewMode === mode
                    ? 'bg-purple-600 text-white'
                    : 'text-white/60 hover:text-white hover:bg-white/10'
                }`}
              >
                {mode === 'side-by-side' && 'Side by Side'}
                {mode === 'toggle' && 'Toggle'}
                {mode === 'slider' && 'Slider'}
              </button>
            ))}
          </div>

          {onClose && (
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors text-white/60 hover:text-white"
            >
              ✕
            </button>
          )}
        </div>

        {/* Main Content */}
        <div className="flex flex-1 overflow-hidden">

          {/* Character List Sidebar */}
          <div className="w-48 border-r border-white/10 bg-black/20 overflow-y-auto">
            <div className="p-3 text-xs text-white/40 uppercase tracking-wider">Characters</div>
            {CHARACTERS.map((char) => (
              <button
                key={char.id}
                onClick={() => setSelectedCharacter(char)}
                className={`w-full px-4 py-3 text-left flex items-center justify-between transition-all ${
                  selectedCharacter.id === char.id
                    ? 'bg-purple-600/20 border-l-2 border-purple-500'
                    : 'hover:bg-white/5'
                }`}
              >
                <span className="font-medium">{char.name}</span>
                {favorites[char.id] && (
                  <Check
                    className="w-4 h-4"
                    style={{ color: SOURCE_LABELS[favorites[char.id]].color }}
                  />
                )}
              </button>
            ))}

            {/* Favorites Summary */}
            <div className="p-4 mt-4 border-t border-white/10">
              <div className="text-xs text-white/40 uppercase tracking-wider mb-3">Favorites</div>
              <div className="space-y-2 text-sm">
                {ALL_SOURCES.map(source => (
                  <div key={source} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: SOURCE_LABELS[source].color }} />
                    <span className="text-white/70">
                      {SOURCE_LABELS[source].label}: {Object.values(favorites).filter(f => f === source).length}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Comparison View */}
          <div className="flex-1 flex flex-col">

            {/* Source Selection */}
            <div className="flex items-center justify-center gap-4 p-3 bg-black/30 border-b border-white/10">
              <div className="flex items-center gap-2">
                <span className="text-xs text-white/50 uppercase">Left:</span>
                <select
                  value={leftSource}
                  onChange={(e) => setLeftSource(e.target.value as AssetSource)}
                  className="bg-white/10 border border-white/20 rounded px-3 py-1.5 text-sm text-white focus:outline-none focus:border-purple-500"
                >
                  {ALL_SOURCES.map(s => (
                    <option key={s} value={s} className="bg-gray-900">{SOURCE_LABELS[s].label}</option>
                  ))}
                </select>
              </div>
              <ArrowLeftRight className="w-4 h-4 text-white/30" />
              <div className="flex items-center gap-2">
                <span className="text-xs text-white/50 uppercase">Right:</span>
                <select
                  value={rightSource}
                  onChange={(e) => setRightSource(e.target.value as AssetSource)}
                  className="bg-white/10 border border-white/20 rounded px-3 py-1.5 text-sm text-white focus:outline-none focus:border-purple-500"
                >
                  {ALL_SOURCES.map(s => (
                    <option key={s} value={s} className="bg-gray-900">{SOURCE_LABELS[s].label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Character Navigation */}
            <div className="flex items-center justify-center gap-4 p-4 border-b border-white/10">
              <button
                onClick={handlePrevCharacterCb}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <h3 className="text-2xl font-bold min-w-[200px] text-center">{selectedCharacter.name}</h3>
              <button
                onClick={handleNextCharacter}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            {/* Image Display Area */}
            <div className="flex-1 p-6 flex items-center justify-center relative overflow-hidden">

              {/* Side by Side View */}
              {viewMode === 'side-by-side' && (
                <div className="flex gap-8 items-center justify-center w-full h-full">
                  {([leftSource, rightSource] as AssetSource[]).map((source) => (
                    <div key={source} className="flex flex-col items-center gap-4">
                      <div
                        className="relative bg-black/40 rounded-lg p-4 border-2 transition-all"
                        style={{
                          borderColor: favorites[selectedCharacter.id] === source
                            ? SOURCE_LABELS[source].color
                            : 'rgba(255,255,255,0.1)'
                        }}
                      >
                        <img
                          src={getSpritePath(source, selectedCharacter.id)}
                          alt={`${selectedCharacter.name} - ${SOURCE_LABELS[source].label}`}
                          className="max-h-[400px] max-w-[350px] object-contain image-pixelated"
                          style={{ imageRendering: 'auto' }}
                        />
                      </div>
                      <div className="text-center">
                        <div
                          className="text-lg font-bold"
                          style={{ color: SOURCE_LABELS[source].color }}
                        >
                          {SOURCE_LABELS[source].label}
                        </div>
                        <div className="text-sm text-white/50">{SOURCE_LABELS[source].description}</div>
                      </div>
                      <button
                        onClick={() => toggleFavorite(selectedCharacter.id, source)}
                        className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all ${
                          favorites[selectedCharacter.id] === source
                            ? 'bg-green-600 text-white'
                            : 'bg-white/10 hover:bg-white/20 text-white/70'
                        }`}
                      >
                        <Check className="w-4 h-4" />
                        {favorites[selectedCharacter.id] === source ? 'Selected' : 'Pick This'}
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Toggle View */}
              {viewMode === 'toggle' && (
                <div className="flex flex-col items-center gap-6">
                  <div
                    className="relative bg-black/40 rounded-lg p-6 border-2"
                    style={{ borderColor: SOURCE_LABELS[activeSource].color }}
                  >
                    <img
                      src={getSpritePath(activeSource, selectedCharacter.id)}
                      alt={`${selectedCharacter.name} - ${SOURCE_LABELS[activeSource].label}`}
                      className="max-h-[450px] max-w-[400px] object-contain"
                      style={{ imageRendering: 'auto' }}
                    />
                  </div>

                  <div className="flex items-center gap-4 flex-wrap justify-center">
                    {ALL_SOURCES.map((source) => (
                      <button
                        key={source}
                        onClick={() => setActiveSource(source)}
                        className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
                          activeSource === source
                            ? 'text-white'
                            : 'bg-white/10 hover:bg-white/20 text-white/70'
                        }`}
                        style={{
                          backgroundColor: activeSource === source ? SOURCE_LABELS[source].color : undefined
                        }}
                      >
                        <Eye className="w-4 h-4" />
                        {SOURCE_LABELS[source].label}
                      </button>
                    ))}
                  </div>

                  <div className="flex gap-4 mt-4 flex-wrap justify-center">
                    {ALL_SOURCES.map((source) => (
                      <button
                        key={source}
                        onClick={() => toggleFavorite(selectedCharacter.id, source)}
                        className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all ${
                          favorites[selectedCharacter.id] === source
                            ? 'bg-green-600 text-white'
                            : 'bg-white/10 hover:bg-white/20 text-white/70'
                        }`}
                      >
                        <Check className="w-4 h-4" />
                        Pick {SOURCE_LABELS[source].label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Slider View */}
              {viewMode === 'slider' && (
                <div className="flex flex-col items-center gap-6 w-full">
                  <div
                    className="relative bg-black/40 rounded-lg overflow-hidden border border-white/10"
                    style={{ width: '500px', height: '450px' }}
                  >
                    {/* Left Source */}
                    <div
                      className="absolute inset-0 flex items-center justify-center"
                      style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
                    >
                      <img
                        src={getSpritePath(leftSource, selectedCharacter.id)}
                        alt={`${selectedCharacter.name} - ${SOURCE_LABELS[leftSource].label}`}
                        className="max-h-full max-w-full object-contain"
                        style={{ imageRendering: 'auto' }}
                      />
                    </div>

                    {/* Right Source */}
                    <div
                      className="absolute inset-0 flex items-center justify-center"
                      style={{ clipPath: `inset(0 0 0 ${sliderPosition}%)` }}
                    >
                      <img
                        src={getSpritePath(rightSource, selectedCharacter.id)}
                        alt={`${selectedCharacter.name} - Agent B`}
                        className="max-h-full max-w-full object-contain"
                        style={{ imageRendering: 'auto' }}
                      />
                    </div>

                    {/* Slider Handle */}
                    <div
                      className="absolute top-0 bottom-0 w-1 bg-white shadow-lg cursor-ew-resize"
                      style={{ left: `${sliderPosition}%` }}
                    >
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg">
                        <ArrowLeftRight className="w-4 h-4 text-gray-800" />
                      </div>
                    </div>
                  </div>

                  {/* Slider Control */}
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={sliderPosition}
                    onChange={(e) => setSliderPosition(Number(e.target.value))}
                    className="w-[500px] accent-purple-500"
                  />

                  <div className="flex items-center justify-between w-[500px] text-sm">
                    <span style={{ color: SOURCE_LABELS[leftSource].color }}>← {SOURCE_LABELS[leftSource].label}</span>
                    <span style={{ color: SOURCE_LABELS[rightSource].color }}>{SOURCE_LABELS[rightSource].label} →</span>
                  </div>

                  <div className="flex gap-4 mt-4 flex-wrap justify-center">
                    {[leftSource, rightSource].map((source) => (
                      <button
                        key={source}
                        onClick={() => toggleFavorite(selectedCharacter.id, source)}
                        className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all ${
                          favorites[selectedCharacter.id] === source
                            ? 'bg-green-600 text-white'
                            : 'bg-white/10 hover:bg-white/20 text-white/70'
                        }`}
                      >
                        <Check className="w-4 h-4" />
                        Pick {SOURCE_LABELS[source].label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer with keyboard hints */}
        <div className="flex items-center justify-between p-3 border-t border-white/10 bg-black/20 text-xs text-white/40">
          <div className="flex gap-4">
            <span><kbd className="px-1.5 py-0.5 bg-white/10 rounded">←</kbd> <kbd className="px-1.5 py-0.5 bg-white/10 rounded">→</kbd> Navigate characters</span>
            <span><kbd className="px-1.5 py-0.5 bg-white/10 rounded">Space</kbd> Toggle source (in toggle mode)</span>
          </div>
          <div>
            Press <kbd className="px-1.5 py-0.5 bg-white/10 rounded">Esc</kbd> to close
          </div>
        </div>
      </div>
    </div>
  );
};
