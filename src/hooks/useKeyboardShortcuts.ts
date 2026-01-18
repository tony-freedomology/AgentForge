import { useEffect, useCallback } from 'react';
import { useGameStore } from '../stores/gameStore';
import { hexToPixel } from '../utils/hexUtils';

export function useKeyboardShortcuts() {
  const setControlGroup = useGameStore((s) => s.setControlGroup);
  const selectControlGroup = useGameStore((s) => s.selectControlGroup);
  const deselectAll = useGameStore((s) => s.deselectAll);
  const selectedAgentIds = useGameStore((s) => s.selectedAgentIds);
  const agents = useGameStore((s) => s.agents);
  const removeAgent = useGameStore((s) => s.removeAgent);
  const toggleMinimap = useGameStore((s) => s.toggleMinimap);
  const toggleCommandPanel = useGameStore((s) => s.toggleCommandPanel);
  const togglePause = useGameStore((s) => s.togglePause);
  const setCameraTarget = useGameStore((s) => s.setCameraTarget);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      // Ignore if typing in input
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      const key = e.key.toLowerCase();
      const isCtrl = e.ctrlKey || e.metaKey;

      // Control groups: Ctrl+1-9 to set, 1-9 to select
      if (key >= '1' && key <= '9') {
        const groupNum = parseInt(key);
        if (isCtrl) {
          // Set control group
          if (selectedAgentIds.size > 0) {
            setControlGroup(groupNum);
          }
        } else {
          // Select control group
          selectControlGroup(groupNum);
        }
        e.preventDefault();
        return;
      }

      switch (key) {
        case 'escape':
          deselectAll();
          break;

        case 'delete':
        case 'backspace':
          // Delete selected agents
          if (selectedAgentIds.size > 0 && !isCtrl) {
            selectedAgentIds.forEach((id) => removeAgent(id));
          }
          break;

        case 'm':
          // Toggle minimap
          toggleMinimap();
          break;

        case 'p':
          // Pause/unpause
          if (!isCtrl) {
            togglePause();
          }
          break;

        case 'c':
          // Center on selected
          if (!isCtrl && selectedAgentIds.size > 0) {
            const selectedAgents = Array.from(selectedAgentIds)
              .map((id) => agents.get(id))
              .filter(Boolean);

            if (selectedAgents.length > 0) {
              // Calculate center of selection
              let totalX = 0;
              let totalZ = 0;
              selectedAgents.forEach((agent) => {
                if (agent) {
                  const [x, z] = hexToPixel(agent.position.q, agent.position.r);
                  totalX += x;
                  totalZ += z;
                }
              });
              setCameraTarget([
                totalX / selectedAgents.length,
                0,
                totalZ / selectedAgents.length,
              ]);
            }
          }
          break;

        case 'a':
          // Select all agents
          if (isCtrl) {
            const allIds = Array.from(agents.keys());
            useGameStore.getState().selectAgents(allIds);
            e.preventDefault();
          }
          break;

        case ' ':
          // Space to toggle pause
          togglePause();
          e.preventDefault();
          break;

        case 'h':
          // Home - center camera on portal
          setCameraTarget([0, 0, 0]);
          break;

        case 'tab':
          // Cycle through agents
          e.preventDefault();
          const agentList = Array.from(agents.values());
          if (agentList.length > 0) {
            const currentSelected = Array.from(selectedAgentIds)[0];
            const currentIndex = agentList.findIndex((a) => a.id === currentSelected);
            const nextIndex = (currentIndex + 1) % agentList.length;
            useGameStore.getState().selectAgent(agentList[nextIndex].id);

            // Center on new selection
            const agent = agentList[nextIndex];
            const [x, z] = hexToPixel(agent.position.q, agent.position.r);
            setCameraTarget([x, 0, z]);
          }
          break;
      }
    },
    [
      setControlGroup,
      selectControlGroup,
      deselectAll,
      selectedAgentIds,
      agents,
      removeAgent,
      toggleMinimap,
      toggleCommandPanel,
      togglePause,
      setCameraTarget,
    ]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
}

// Detect if user is on Mac
const isMac = typeof navigator !== 'undefined' && /Mac|iPod|iPhone|iPad/.test(navigator.platform);
const modKey = isMac ? 'Cmd' : 'Ctrl';

// Display keyboard shortcuts
export const KEYBOARD_SHORTCUTS = [
  { key: `${modKey}+K`, description: 'Command palette' },
  { key: 'N', description: 'Summon new agent' },
  { key: 'Q', description: 'Quest log' },
  { key: 'Z', description: 'Project zones' },
  { key: '1-9', description: 'Select control group' },
  { key: `${modKey}+1-9`, description: 'Assign control group' },
  { key: 'Escape', description: 'Deselect all' },
  { key: 'Delete', description: 'Remove selected agents' },
  { key: 'M', description: 'Toggle minimap' },
  { key: 'Space', description: 'Pause/Resume' },
  { key: 'C', description: 'Center on selection' },
  { key: 'H', description: 'Center on portal' },
  { key: `${modKey}+A`, description: 'Select all agents' },
  { key: 'Tab', description: 'Cycle through agents' },
];
