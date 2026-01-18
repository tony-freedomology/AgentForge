/**
 * Session Controls
 *
 * UI for saving and loading game sessions (agent layouts, zones, etc.)
 */

import { useState } from 'react';
import { useGameStore } from '../../stores/gameStore';
import { Save, Download, Trash2, X } from 'lucide-react';

export function SessionControls() {
  const saveSession = useGameStore((s) => s.saveSession);
  const loadSession = useGameStore((s) => s.loadSession);
  const clearSession = useGameStore((s) => s.clearSession);
  const agents = useGameStore((s) => s.agents);
  const projectZones = useGameStore((s) => s.projectZones);

  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmAction, setConfirmAction] = useState<'load' | 'clear' | null>(null);

  const handleSave = () => {
    saveSession();
  };

  const handleLoad = () => {
    setConfirmAction('load');
    setShowConfirm(true);
  };

  const handleClear = () => {
    setConfirmAction('clear');
    setShowConfirm(true);
  };

  const confirmActionHandler = () => {
    if (confirmAction === 'load') {
      loadSession();
    } else if (confirmAction === 'clear') {
      clearSession();
    }
    setShowConfirm(false);
    setConfirmAction(null);
  };

  return (
    <>
      <div className="flex items-center gap-1">
        {/* Save button */}
        <button
          onClick={handleSave}
          disabled={agents.size === 0}
          className="p-2 rounded-lg bg-stone-800/80 border border-stone-700/50 hover:bg-stone-700/80 hover:border-stone-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all group"
          title="Save Session"
        >
          <Save size={16} className="text-stone-400 group-hover:text-emerald-400 transition-colors" />
        </button>

        {/* Load button */}
        <button
          onClick={handleLoad}
          className="p-2 rounded-lg bg-stone-800/80 border border-stone-700/50 hover:bg-stone-700/80 hover:border-stone-600 transition-all group"
          title="Load Session"
        >
          <Download size={16} className="text-stone-400 group-hover:text-blue-400 transition-colors" />
        </button>

        {/* Clear button */}
        <button
          onClick={handleClear}
          className="p-2 rounded-lg bg-stone-800/80 border border-stone-700/50 hover:bg-stone-700/80 hover:border-red-500/50 transition-all group"
          title="Clear Saved Session"
        >
          <Trash2 size={16} className="text-stone-400 group-hover:text-red-400 transition-colors" />
        </button>

        {/* Session info */}
        <div className="text-[10px] text-stone-500 ml-2 font-mono">
          {agents.size} agents • {projectZones.size} zones
        </div>
      </div>

      {/* Confirmation modal */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-stone-900 border-2 border-amber-900/50 rounded-xl p-6 max-w-sm shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-amber-400 font-serif">
                {confirmAction === 'load' ? 'Load Session?' : 'Clear Session?'}
              </h3>
              <button
                onClick={() => setShowConfirm(false)}
                className="p-1 hover:bg-stone-800 rounded-lg transition-colors"
              >
                <X size={18} className="text-stone-500" />
              </button>
            </div>

            <p className="text-stone-400 text-sm mb-6">
              {confirmAction === 'load'
                ? 'This will restore your previously saved session. Current unsaved changes will be lost.'
                : 'This will permanently delete your saved session data. This action cannot be undone.'}
            </p>

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowConfirm(false)}
                className="px-4 py-2 rounded-lg bg-stone-800 border border-stone-700 text-stone-300 hover:bg-stone-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmActionHandler}
                className={`px-4 py-2 rounded-lg border font-medium transition-colors ${
                  confirmAction === 'clear'
                    ? 'bg-red-900/50 border-red-700 text-red-300 hover:bg-red-800/50'
                    : 'bg-blue-900/50 border-blue-700 text-blue-300 hover:bg-blue-800/50'
                }`}
              >
                {confirmAction === 'load' ? 'Load' : 'Clear'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/**
 * Session Controls Button (compact version for toolbar)
 */
export function SessionControlsButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="p-2 rounded-lg bg-stone-800/80 border border-stone-700/50 hover:bg-stone-700/80 hover:border-stone-600 transition-all group"
      title="Session Controls"
    >
      <Save size={16} className="text-stone-400 group-hover:text-amber-400 transition-colors" />
    </button>
  );
}
