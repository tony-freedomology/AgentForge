/**
 * Quest Turn-In Modal - WoW-style quest completion interface
 *
 * Shows when an agent has completed a task and awaits user review.
 * Displays produced files, agent notes, and allows accept/reject.
 */

import { useState } from 'react';
import { useGameStore } from '../../stores/gameStore';
import { getAgentClass } from '../../config/agentClasses';
import { FILE_TYPE_ICONS } from '../../types/agent';
import type { Agent, FileArtifact } from '../../types/agent';
import { X, Check, RotateCcw, FileText, FilePlus, FileX, ScrollText } from 'lucide-react';

// Get file icon and name based on extension
function getFileInfo(path: string): { icon: string; name: string } {
  // Check for test files first
  if (path.includes('.test.') || path.includes('.spec.')) {
    return FILE_TYPE_ICONS['.test.ts'] || { icon: '📄', name: 'File' };
  }

  // Get extension
  const ext = path.substring(path.lastIndexOf('.')).toLowerCase();
  return FILE_TYPE_ICONS[ext] || { icon: '📄', name: 'Document' };
}

// File artifact display component
function FileArtifactItem({ file }: { file: FileArtifact }) {
  const fileInfo = getFileInfo(file.path);
  const fileName = file.path.split('/').pop() || file.path;
  const dirPath = file.path.substring(0, file.path.lastIndexOf('/'));

  const typeColors = {
    created: { bg: 'bg-green-500/20', border: 'border-green-500/40', text: 'text-green-400', icon: FilePlus },
    modified: { bg: 'bg-amber-500/20', border: 'border-amber-500/40', text: 'text-amber-400', icon: FileText },
    deleted: { bg: 'bg-red-500/20', border: 'border-red-500/40', text: 'text-red-400', icon: FileX },
  };

  const typeStyle = typeColors[file.type];
  const TypeIcon = typeStyle.icon;

  return (
    <div
      className={`flex items-center gap-3 px-4 py-3 rounded-lg ${typeStyle.bg} border ${typeStyle.border} group hover:scale-[1.01] transition-transform cursor-pointer`}
      title={file.path}
    >
      <span className="text-2xl drop-shadow-lg">{fileInfo.icon}</span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-bold text-white truncate">{fileName}</span>
          <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded ${typeStyle.bg} ${typeStyle.text}`}>
            {file.type}
          </span>
        </div>
        <div className="text-xs text-gray-500 truncate font-mono">{dirPath || '/'}</div>
      </div>
      <TypeIcon size={16} className={typeStyle.text} />
    </div>
  );
}

interface QuestTurnInProps {
  agent: Agent;
  onClose: () => void;
}

export function QuestTurnIn({ agent, onClose }: QuestTurnInProps) {
  const [feedback, setFeedback] = useState('');
  const [showFeedbackInput, setShowFeedbackInput] = useState(false);

  const approveQuest = useGameStore((s) => s.approveQuest);
  const rejectQuest = useGameStore((s) => s.rejectQuest);

  const quest = agent.currentQuest;
  const classConfig = getAgentClass(agent.class);
  const classColor = classConfig?.color || '#06b6d4';
  const classIcon = classConfig?.icon || '🤖';

  if (!quest) return null;

  const handleApprove = () => {
    approveQuest(agent.id);
    onClose();
  };

  const handleReject = () => {
    if (showFeedbackInput) {
      rejectQuest(agent.id, feedback);
      onClose();
    } else {
      setShowFeedbackInput(true);
    }
  };

  const handleCancel = () => {
    if (showFeedbackInput) {
      setShowFeedbackInput(false);
      setFeedback('');
    } else {
      onClose();
    }
  };

  // Get files for this quest (or all produced files if quest doesn't track them)
  const files = quest.producedFiles.length > 0 ? quest.producedFiles : agent.producedFiles;

  // Separate by type
  const createdFiles = files.filter(f => f.type === 'created');
  const modifiedFiles = files.filter(f => f.type === 'modified');
  const deletedFiles = files.filter(f => f.type === 'deleted');

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 backdrop-blur-md" onClick={onClose}>
      <div
        className="fantasy-panel rounded-2xl w-[600px] max-w-[95vw] max-h-[90vh] overflow-hidden flex flex-col shadow-2xl"
        style={{
          borderColor: `${classColor}40`,
          boxShadow: `0 0 60px ${classColor}20`,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Corner accents */}
        <div className="corner-accent top-left" style={{ '--accent-color': classColor } as React.CSSProperties} />
        <div className="corner-accent top-right" style={{ '--accent-color': classColor } as React.CSSProperties} />
        <div className="corner-accent bottom-left" style={{ '--accent-color': classColor } as React.CSSProperties} />
        <div className="corner-accent bottom-right" style={{ '--accent-color': classColor } as React.CSSProperties} />

        {/* Header */}
        <div
          className="px-8 py-6 border-b relative"
          style={{
            borderColor: `${classColor}30`,
            background: `linear-gradient(180deg, ${classColor}15 0%, transparent 100%)`,
          }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="text-4xl animate-bounce" style={{ animationDuration: '2s' }}>📜</div>
              <div>
                <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-yellow-500 uppercase tracking-wider">
                  Quest Complete
                </h2>
                <p className="text-amber-600/60 text-sm mt-1">Review and accept the work</p>
              </div>
            </div>
            <button
              onClick={handleCancel}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors text-gray-500 hover:text-white"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-8 py-6 space-y-6">
          {/* Agent info */}
          <div className="flex items-center gap-4 p-4 rounded-xl bg-black/30 border border-gray-800/50">
            <div
              className="w-14 h-14 rounded-xl flex items-center justify-center text-3xl"
              style={{
                background: `linear-gradient(135deg, ${classColor}30, ${classColor}10)`,
                border: `2px solid ${classColor}50`,
              }}
            >
              {classIcon}
            </div>
            <div className="flex-1">
              <div className="font-bold text-lg text-white">{agent.name}</div>
              <div className="text-sm" style={{ color: classColor }}>{classConfig?.title || agent.class}</div>
            </div>
            <div className="text-right text-xs text-gray-500">
              <div>Started: {new Date(quest.startedAt).toLocaleTimeString()}</div>
              {quest.completedAt && (
                <div>Completed: {new Date(quest.completedAt).toLocaleTimeString()}</div>
              )}
            </div>
          </div>

          {/* Quest description */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-bold text-amber-400 uppercase tracking-wider">
              <ScrollText size={14} />
              <span>Quest Objective</span>
            </div>
            <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/20 text-white">
              "{quest.description}"
            </div>
          </div>

          {/* Files produced */}
          {files.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-bold text-cyan-400 uppercase tracking-wider">
                <FileText size={14} />
                <span>Artifacts Produced ({files.length})</span>
              </div>

              <div className="space-y-2 max-h-[200px] overflow-y-auto pr-2">
                {createdFiles.length > 0 && (
                  <div className="space-y-1">
                    <div className="text-xs text-green-400 font-bold uppercase tracking-wider px-1">
                      Created ({createdFiles.length})
                    </div>
                    {createdFiles.map((file, i) => (
                      <FileArtifactItem key={`created-${i}`} file={file} />
                    ))}
                  </div>
                )}

                {modifiedFiles.length > 0 && (
                  <div className="space-y-1">
                    <div className="text-xs text-amber-400 font-bold uppercase tracking-wider px-1">
                      Modified ({modifiedFiles.length})
                    </div>
                    {modifiedFiles.map((file, i) => (
                      <FileArtifactItem key={`modified-${i}`} file={file} />
                    ))}
                  </div>
                )}

                {deletedFiles.length > 0 && (
                  <div className="space-y-1">
                    <div className="text-xs text-red-400 font-bold uppercase tracking-wider px-1">
                      Deleted ({deletedFiles.length})
                    </div>
                    {deletedFiles.map((file, i) => (
                      <FileArtifactItem key={`deleted-${i}`} file={file} />
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Agent notes */}
          {quest.agentNotes && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-bold text-purple-400 uppercase tracking-wider">
                <span>💬</span>
                <span>Agent's Notes</span>
              </div>
              <div className="p-4 rounded-xl bg-purple-500/5 border border-purple-500/20 text-gray-300 text-sm italic">
                "{quest.agentNotes}"
              </div>
            </div>
          )}

          {/* Feedback input (shown when rejecting) */}
          {showFeedbackInput && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-bold text-orange-400 uppercase tracking-wider">
                <RotateCcw size={14} />
                <span>Revision Feedback</span>
              </div>
              <textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="What changes would you like the agent to make?"
                className="w-full h-24 bg-black/50 border border-orange-500/30 rounded-xl p-4 text-white placeholder-gray-600 resize-none focus:outline-none focus:border-orange-500/60 transition-colors"
                autoFocus
              />
            </div>
          )}
        </div>

        {/* Actions */}
        <div
          className="px-8 py-6 border-t flex gap-4"
          style={{
            borderColor: `${classColor}20`,
            background: `linear-gradient(0deg, ${classColor}08 0%, transparent 100%)`,
          }}
        >
          <button
            onClick={handleReject}
            className="flex-1 py-4 px-6 rounded-xl font-bold text-lg uppercase tracking-wider transition-all flex items-center justify-center gap-3 bg-orange-500/10 border-2 border-orange-500/40 text-orange-400 hover:bg-orange-500/20 hover:border-orange-500/60 hover:shadow-[0_0_20px_rgba(249,115,22,0.2)]"
          >
            <RotateCcw size={20} />
            {showFeedbackInput ? 'Send Feedback' : 'Request Changes'}
          </button>

          <button
            onClick={handleApprove}
            disabled={showFeedbackInput}
            className="flex-1 py-4 px-6 rounded-xl font-bold text-lg uppercase tracking-wider transition-all flex items-center justify-center gap-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white shadow-[0_0_25px_rgba(34,197,94,0.3)] hover:shadow-[0_0_35px_rgba(34,197,94,0.5)] hover:scale-[1.02] active:scale-[0.98] disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            <Check size={20} />
            Accept Quest
          </button>
        </div>
      </div>
    </div>
  );
}

// Component to show pending quests notification
export function PendingQuestsNotification() {
  const agents = useGameStore((s) => s.agents);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);

  // Find agents with pending review quests
  const pendingAgents = Array.from(agents.values()).filter(
    (a) => a.currentQuest?.status === 'pending_review'
  );

  if (pendingAgents.length === 0 && !selectedAgent) return null;

  return (
    <>
      {/* Notification badge */}
      {pendingAgents.length > 0 && (
        <div className="fixed top-44 left-4 z-40">
          <div className="fantasy-panel rounded-xl p-4 border-amber-500/40 shadow-[0_0_30px_rgba(245,158,11,0.2)]">
            <div className="corner-accent top-left" style={{ '--accent-color': '#f59e0b' } as React.CSSProperties} />
            <div className="corner-accent top-right" style={{ '--accent-color': '#f59e0b' } as React.CSSProperties} />

            <div className="flex items-center gap-3 mb-3">
              <span className="text-2xl animate-bounce">📜</span>
              <span className="text-amber-400 font-bold text-sm uppercase tracking-wider">
                Quests Ready ({pendingAgents.length})
              </span>
            </div>

            <div className="space-y-2">
              {pendingAgents.map((agent) => (
                <button
                  key={agent.id}
                  onClick={() => setSelectedAgent(agent)}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg bg-amber-500/10 border border-amber-500/30 hover:bg-amber-500/20 hover:border-amber-500/50 transition-all text-left"
                >
                  <span className="text-xl">{getAgentClass(agent.class)?.icon || '🤖'}</span>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-white text-sm truncate">{agent.name}</div>
                    <div className="text-xs text-gray-500 truncate">
                      {agent.currentQuest?.description.slice(0, 30)}...
                    </div>
                  </div>
                  <span className="text-amber-400 text-lg">!</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Quest turn-in modal */}
      {selectedAgent && (
        <QuestTurnIn agent={selectedAgent} onClose={() => setSelectedAgent(null)} />
      )}
    </>
  );
}
