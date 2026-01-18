/**
 * Project Zones Panel
 *
 * Manage project zones - colored areas of the map for organizing work.
 */

import { useState } from 'react';
import { useGameStore } from '../../stores/gameStore';
import { X, Plus, Trash2, Edit2, MapPin, Layers } from 'lucide-react';
import type { ProjectZone } from '../../types/agent';

const ZONE_COLORS = [
  { name: 'Blue', value: '#3b82f6' },
  { name: 'Green', value: '#22c55e' },
  { name: 'Purple', value: '#a855f7' },
  { name: 'Orange', value: '#f97316' },
  { name: 'Pink', value: '#ec4899' },
  { name: 'Cyan', value: '#06b6d4' },
  { name: 'Yellow', value: '#eab308' },
  { name: 'Red', value: '#ef4444' },
];

interface ProjectZonesPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ProjectZonesPanel({ isOpen, onClose }: ProjectZonesPanelProps) {
  const projectZones = useGameStore((s) => s.projectZones);
  const createProjectZone = useGameStore((s) => s.createProjectZone);
  const removeProjectZone = useGameStore((s) => s.removeProjectZone);
  const updateProjectZone = useGameStore((s) => s.updateProjectZone);
  const hexGrid = useGameStore((s) => s.hexGrid);

  const [showCreate, setShowCreate] = useState(false);
  const [editingZone, setEditingZone] = useState<ProjectZone | null>(null);
  const [newZoneName, setNewZoneName] = useState('');
  const [newZoneColor, setNewZoneColor] = useState(ZONE_COLORS[0].value);
  const [selectedHexes, setSelectedHexes] = useState<Array<{ q: number; r: number }>>([]);

  if (!isOpen) return null;

  const zones = Array.from(projectZones.values());

  const handleCreateZone = () => {
    if (!newZoneName.trim()) return;
    if (selectedHexes.length === 0) return;

    createProjectZone(newZoneName.trim(), newZoneColor, selectedHexes);
    setNewZoneName('');
    setNewZoneColor(ZONE_COLORS[0].value);
    setSelectedHexes([]);
    setShowCreate(false);
  };

  const handleUpdateZone = () => {
    if (!editingZone || !newZoneName.trim()) return;

    updateProjectZone(editingZone.id, {
      name: newZoneName.trim(),
      color: newZoneColor,
      hexes: selectedHexes.length > 0 ? selectedHexes : editingZone.hexes,
    });
    setEditingZone(null);
    setNewZoneName('');
    setNewZoneColor(ZONE_COLORS[0].value);
    setSelectedHexes([]);
  };

  const startEditing = (zone: ProjectZone) => {
    setEditingZone(zone);
    setNewZoneName(zone.name);
    setNewZoneColor(zone.color);
    setSelectedHexes([...zone.hexes]);
    setShowCreate(true);
  };

  // Get available hexes (not water, not already in a zone)
  const availableHexes = Array.from(hexGrid.values()).filter(
    (hex) =>
      hex.type !== 'water' &&
      !zones.some((z) =>
        z.id !== editingZone?.id && z.hexes.some((h) => h.q === hex.q && h.r === hex.r)
      )
  );

  const toggleHex = (q: number, r: number) => {
    setSelectedHexes((prev) => {
      const exists = prev.some((h) => h.q === q && h.r === r);
      if (exists) {
        return prev.filter((h) => !(h.q === q && h.r === r));
      }
      return [...prev, { q, r }];
    });
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-stone-900 border-2 border-amber-900/50 rounded-xl w-[500px] max-h-[80vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-stone-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-900/30 border border-purple-700/50 flex items-center justify-center">
              <Layers size={20} className="text-purple-400" />
            </div>
            <div>
              <h2 className="font-bold text-lg text-amber-400 font-serif">Project Zones</h2>
              <p className="text-xs text-stone-500">Organize your workspace into areas</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-stone-800 rounded-lg transition-colors"
          >
            <X size={20} className="text-stone-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto max-h-[calc(80vh-140px)]">
          {/* Zone list */}
          {zones.length === 0 && !showCreate ? (
            <div className="text-center py-8">
              <MapPin size={32} className="mx-auto text-stone-600 mb-3" />
              <p className="text-stone-500 text-sm">No project zones defined</p>
              <p className="text-stone-600 text-xs mt-1">
                Create zones to organize different projects on your map
              </p>
            </div>
          ) : (
            <div className="space-y-2 mb-4">
              {zones.map((zone) => (
                <div
                  key={zone.id}
                  className="flex items-center gap-3 p-3 rounded-lg bg-stone-800/50 border border-stone-700/50 hover:border-stone-600 transition-colors"
                >
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm"
                    style={{ backgroundColor: zone.color }}
                  >
                    {zone.hexes.length}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-stone-200">{zone.name}</div>
                    <div className="text-xs text-stone-500">
                      {zone.hexes.length} hex{zone.hexes.length !== 1 ? 'es' : ''}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => startEditing(zone)}
                      className="p-2 hover:bg-stone-700 rounded-lg transition-colors"
                      title="Edit zone"
                    >
                      <Edit2 size={14} className="text-stone-400" />
                    </button>
                    <button
                      onClick={() => removeProjectZone(zone.id)}
                      className="p-2 hover:bg-red-900/30 rounded-lg transition-colors"
                      title="Delete zone"
                    >
                      <Trash2 size={14} className="text-red-400" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Create/Edit form */}
          {showCreate ? (
            <div className="p-4 rounded-lg bg-stone-800/30 border border-stone-700/50 space-y-4">
              <h3 className="font-medium text-stone-300">
                {editingZone ? 'Edit Zone' : 'Create New Zone'}
              </h3>

              {/* Name input */}
              <div>
                <label className="text-xs text-stone-500 block mb-1">Zone Name</label>
                <input
                  type="text"
                  value={newZoneName}
                  onChange={(e) => setNewZoneName(e.target.value)}
                  placeholder="e.g., Frontend, API, Database"
                  className="w-full px-3 py-2 rounded-lg bg-stone-900 border border-stone-700 text-stone-200 placeholder-stone-600 focus:border-amber-600 focus:outline-none"
                />
              </div>

              {/* Color picker */}
              <div>
                <label className="text-xs text-stone-500 block mb-2">Zone Color</label>
                <div className="flex flex-wrap gap-2">
                  {ZONE_COLORS.map((color) => (
                    <button
                      key={color.value}
                      onClick={() => setNewZoneColor(color.value)}
                      className={`w-8 h-8 rounded-lg transition-all ${
                        newZoneColor === color.value
                          ? 'ring-2 ring-white ring-offset-2 ring-offset-stone-900 scale-110'
                          : 'hover:scale-105'
                      }`}
                      style={{ backgroundColor: color.value }}
                      title={color.name}
                    />
                  ))}
                </div>
              </div>

              {/* Hex selection (simplified - just show count) */}
              <div>
                <label className="text-xs text-stone-500 block mb-2">
                  Selected Hexes: {selectedHexes.length}
                </label>
                <div className="grid grid-cols-8 gap-1 max-h-32 overflow-y-auto p-2 bg-stone-900 rounded-lg">
                  {availableHexes.slice(0, 50).map((hex) => {
                    const isSelected = selectedHexes.some(
                      (h) => h.q === hex.q && h.r === hex.r
                    );
                    return (
                      <button
                        key={`${hex.q},${hex.r}`}
                        onClick={() => toggleHex(hex.q, hex.r)}
                        className={`w-6 h-6 rounded text-[8px] font-mono transition-all ${
                          isSelected
                            ? 'text-white'
                            : 'bg-stone-800 text-stone-500 hover:bg-stone-700'
                        }`}
                        style={isSelected ? { backgroundColor: newZoneColor } : undefined}
                        title={`(${hex.q}, ${hex.r})`}
                      >
                        {hex.q},{hex.r}
                      </button>
                    );
                  })}
                </div>
                <p className="text-[10px] text-stone-600 mt-1">
                  Click hexes to select/deselect. Showing first 50 available hexes.
                </p>
              </div>

              {/* Actions */}
              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => {
                    setShowCreate(false);
                    setEditingZone(null);
                    setNewZoneName('');
                    setSelectedHexes([]);
                  }}
                  className="px-4 py-2 rounded-lg bg-stone-800 border border-stone-700 text-stone-300 hover:bg-stone-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={editingZone ? handleUpdateZone : handleCreateZone}
                  disabled={!newZoneName.trim() || selectedHexes.length === 0}
                  className="px-4 py-2 rounded-lg bg-amber-900/50 border border-amber-700 text-amber-300 hover:bg-amber-800/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {editingZone ? 'Save Changes' : 'Create Zone'}
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowCreate(true)}
              className="w-full p-3 rounded-lg border-2 border-dashed border-stone-700 text-stone-500 hover:border-amber-600 hover:text-amber-400 transition-colors flex items-center justify-center gap-2"
            >
              <Plus size={16} />
              <span>Create New Zone</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Project Zones Button (for toolbar)
 */
export function ProjectZonesButton({ onClick }: { onClick: () => void }) {
  const projectZones = useGameStore((s) => s.projectZones);

  return (
    <button
      onClick={onClick}
      className="relative p-2 rounded-lg bg-stone-800/80 border border-stone-700/50 hover:bg-stone-700/80 hover:border-purple-500/50 transition-all group"
      title="Project Zones"
    >
      <Layers size={16} className="text-stone-400 group-hover:text-purple-400 transition-colors" />
      {projectZones.size > 0 && (
        <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-purple-500 text-white text-[10px] font-bold flex items-center justify-center">
          {projectZones.size}
        </span>
      )}
    </button>
  );
}
