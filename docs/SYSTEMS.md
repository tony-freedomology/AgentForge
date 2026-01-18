# Supporting Systems

This document covers the supporting systems that enhance the AgentForge experience.

## Session Persistence

### Overview

AgentForge can save and restore sessions, allowing you to close the browser and resume later with your agents in place.

### What Gets Saved

```typescript
interface SessionData {
  version: 1;
  timestamp: number;
  agents: SavedAgentData[];
  projectZones: [string, ProjectZone][];
  controlGroups: [number, string[]][];
  camera: CameraState;
  resources: GameResources;
}

interface SavedAgentData {
  id: string;
  name: string;
  provider: AgentProvider;
  class: AgentClass;
  position: AgentPosition;
  level: number;
  experience: number;
  talents: AgentTalents;
  completedQuests: Quest[];
  controlGroup?: number;
}
```

### Storage

Sessions are stored in `localStorage` under the key `agentforge_session`.

### API

```typescript
// Save current session
saveSession(): boolean

// Load session data (returns saved agents or false)
loadSession(): SavedAgentData[] | false

// Restore agents from saved data
restoreAgents(agents: SavedAgentData[]): void

// Clear saved session
clearSession(): void
```

### Hooks

```typescript
// Auto-save periodically (default: every 60 seconds)
useAutoSave(intervalMs?: number)

// Restore session on mount
useSessionRestore()
```

### UI

The `SessionControls` component provides:
- Save button (manual save)
- Load button (restore from saved)
- Clear button (delete saved data)

---

## Sound Manager

### Overview

The sound system provides audio feedback for game events, enhancing the RPG feel.

### Sound Categories

| Category | Volume Key | Examples |
|----------|------------|----------|
| `ui` | `uiVolume` | Button clicks, menu opens |
| `agent` | `agentVolume` | Spawn, death, level up |
| `ambient` | `ambientVolume` | Background music/atmosphere |
| `notification` | `notificationVolume` | Alerts, attention needed |

### Sound Events

```typescript
// Agent events
soundManager.play('agent_spawn');
soundManager.play('agent_death');
soundManager.play('agent_levelup');
soundManager.play('agent_select');

// Quest events
soundManager.play('quest_complete');
soundManager.play('quest_accept');

// UI events
soundManager.play('ui_click');
soundManager.play('ui_open');
soundManager.play('ui_close');

// Notifications
soundManager.play('notification_attention');
soundManager.play('notification_error');
```

### Volume Control

```typescript
// Get current volumes
const volumes = soundManager.getVolumes();

// Set category volume (0.0 - 1.0)
soundManager.setVolume('agent', 0.5);

// Mute/unmute all
soundManager.setMuted(true);
```

### Configuration

The `SoundSettings` component provides a UI for:
- Master volume
- Per-category volume sliders
- Mute toggle

---

## Toast Notifications

### Overview

Toast notifications provide non-intrusive feedback for system events.

### Toast Types

| Type | Color | Use Case |
|------|-------|----------|
| `success` | Green | Operation completed |
| `error` | Red | Something failed |
| `warning` | Yellow | Potential issue |
| `info` | Blue | General information |

### API

```typescript
import { toast } from '../stores/toastStore';

// Show toasts
toast.success('Title', 'Description message');
toast.error('Error', 'Something went wrong');
toast.warning('Warning', 'Be careful');
toast.info('Info', 'FYI...');

// With custom duration (ms)
toast.success('Quick', 'Gone in 2 seconds', 2000);
```

### Configuration

- Default duration: 5000ms
- Max visible toasts: 5
- Position: Top-right
- Auto-dismiss: Yes
- Click to dismiss: Yes

### Z-Index

Toasts render at `z-80`, above all other UI elements.

---

## Idle Monitoring

### Overview

The idle monitor tracks agents that have been inactive too long, flagging them for attention.

### Configuration

```typescript
// Idle timeout threshold (default: 60 seconds)
const IDLE_TIMEOUT_MS = 60000;

// Check interval (default: 10 seconds)
const CHECK_INTERVAL_MS = 10000;
```

### How It Works

1. `useIdleMonitor` hook runs periodic checks
2. For each idle agent, check `idleSince` timestamp
3. If idle longer than threshold, set `needsAttention = true`
4. Set `attentionReason = 'idle_timeout'`
5. Party Frames shows attention indicator

### Visual Feedback

- Party Frame shows 💤 icon
- Agent sprite wobbles
- Status shows "IDLE_TIMEOUT"

---

## Project Zones

### Overview

Project zones let you group hexes into named areas, useful for organizing agents by project.

### Data Model

```typescript
interface ProjectZone {
  id: string;
  name: string;
  color: string;
  hexes: Array<{ q: number; r: number }>;
  description?: string;
}
```

### API

```typescript
// Create a new zone
createProjectZone(name: string, color: string, hexes: Hex[]): ProjectZone

// Update zone properties
updateProjectZone(zoneId: string, updates: Partial<ProjectZone>): void

// Remove a zone
removeProjectZone(zoneId: string): void

// Find zone for a hex
getZoneForHex(q: number, r: number): ProjectZone | undefined
```

### UI

The `ProjectZones` component provides:
- List of existing zones
- Create new zone button
- Edit zone name/color
- Delete zone

---

## Control Groups

### Overview

RTS-style control groups let you quickly select sets of agents.

### Keyboard Shortcuts

| Keys | Action |
|------|--------|
| `Ctrl+1-9` | Assign selected agents to group |
| `1-9` | Select agents in group |
| `Shift+1-9` | Add group to current selection |

### API

```typescript
// Assign current selection to group
assignControlGroup(groupNumber: number): void

// Select agents in group
selectControlGroup(groupNumber: number): void

// Add group to selection
addControlGroupToSelection(groupNumber: number): void
```

### Persistence

Control groups are saved with sessions, so they persist across browser reloads.

---

## Z-Index Hierarchy

### Overview

A consistent z-index system prevents layering conflicts.

### Constants

Located in `src/constants/zIndex.ts`:

```typescript
export const Z_INDEX = {
  BASE_UI: 30,           // Party frames, resource bar
  FLOATING_PANEL: 40,    // Loot button, notifications
  AGENT_TERMINAL: 45,    // Dialogue box
  MODAL: 50,             // Quest log, settings
  COMMAND_PALETTE: 60,   // Quick commands
  WELCOME_SCREEN: 70,    // Onboarding
  TOAST: 80,             // Notifications
};

export const Z_CLASS = {
  BASE_UI: 'z-30',
  FLOATING_PANEL: 'z-40',
  AGENT_TERMINAL: 'z-[45]',
  MODAL: 'z-50',
  COMMAND_PALETTE: 'z-[60]',
  WELCOME_SCREEN: 'z-[70]',
  TOAST: 'z-[80]',
};
```

### Usage

```tsx
// Using Tailwind classes
<div className={Z_CLASS.MODAL}>...</div>

// Using numeric values
<div style={{ zIndex: Z_INDEX.MODAL }}>...</div>
```

---

## Keyboard Shortcuts

### Global Shortcuts

| Key | Action |
|-----|--------|
| `Cmd/Ctrl+K` | Open command palette |
| `Q` | Toggle quest log |
| `Escape` | Close open modal |
| `Space` | Pause/unpause (when implemented) |

### Selection Shortcuts

| Key | Action |
|-----|--------|
| `1-9` | Select control group |
| `Ctrl+1-9` | Assign control group |
| `Shift+Click` | Add to selection |
| `Ctrl+Click` | Toggle selection |
| `Ctrl+A` | Select all agents |

### Terminal Shortcuts

| Key | Action |
|-----|--------|
| `Enter` | Send input |
| `Escape` | Blur input |
| `Ctrl+C` | Interrupt agent |
| `Up/Down` | Command history |

### Implementation

Keyboard shortcuts are handled by the `useKeyboardShortcuts` hook, which attaches global event listeners and delegates to appropriate handlers.
