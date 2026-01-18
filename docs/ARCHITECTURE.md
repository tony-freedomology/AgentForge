# AgentForge Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                        FRONTEND (React + PixiJS)                     │
│  ┌──────────────────┐  ┌─────────────┐  ┌───────────────────────┐  │
│  │  Isometric World │  │  UI Panels  │  │    Agent Terminal     │  │
│  │  (PixiJS/@pixi/  │  │  (React +   │  │  (RPG Dialogue Box)   │  │
│  │   react)         │  │   Tailwind) │  │                       │  │
│  └──────────────────┘  └─────────────┘  └───────────────────────┘  │
│                            │                                        │
│         ┌──────────────────┴──────────────────┐                    │
│         │            Zustand Store            │                    │
│         │  (agents, hexGrid, quests, zones)   │                    │
│         └──────────────────┬──────────────────┘                    │
│                            │                                        │
│                     ┌──────┴──────┐                                │
│                     │ AgentBridge │ (WebSocket Client)             │
│                     └──────┬──────┘                                │
└────────────────────────────┼───────────────────────────────────────┘
                             │ WebSocket
                             │
┌────────────────────────────┼───────────────────────────────────────┐
│                     ┌──────┴──────┐                                │
│                     │  WS Server  │                                │
│                     └──────┬──────┘                                │
│                            │                                        │
│  ┌─────────────────────────┼───────────────────────────────────┐  │
│  │              Process Manager (node-pty)                      │  │
│  │  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐        │  │
│  │  │  PTY 1  │  │  PTY 2  │  │  PTY 3  │  │  PTY n  │        │  │
│  │  │ claude  │  │  codex  │  │ gemini  │  │   ...   │        │  │
│  │  └─────────┘  └─────────┘  └─────────┘  └─────────┘        │  │
│  └─────────────────────────────────────────────────────────────┘  │
│                        BACKEND (Node.js)                           │
└────────────────────────────────────────────────────────────────────┘
```

## Core Principle: Real Terminals, Not Simulation

**The backend spawns actual PTY (pseudo-terminal) sessions.** Each agent is a real shell running a real CLI (`claude`, `codex`, `gemini`).

- Uses `node-pty` for proper terminal emulation
- Full ANSI color support, cursor movement, everything
- Input goes directly to the PTY
- Output streams directly from the PTY
- If you can do it in Terminal.app, you can do it here

## Tech Stack

| Layer | Technology |
|-------|------------|
| Rendering | PixiJS v8 + @pixi/react |
| UI Framework | React 18 + TypeScript |
| Styling | Tailwind CSS |
| State Management | Zustand |
| Build Tool | Vite |
| Backend | Node.js + WebSocket + node-pty |

## Key Components

### Isometric World (`src/components/isometric/`)

PixiJS-based isometric game world:

| Component | Purpose |
|-----------|---------|
| `IsometricWorld.tsx` | Main PixiJS Stage, camera, hex grid rendering |
| `IsometricAgent.tsx` | Agent sprite with procedural animations |
| `AnimatedSprite.tsx` | Sprite sheet animation helper |
| `ParticleEffects.tsx` | Visual effects (sparkles, etc.) |

**Coordinate System:**
- Uses axial hex coordinates (q, r)
- Isometric projection: `x = (q - r) * tileWidth/2`, `y = (q + r) * tileHeight/4`
- Camera supports pan (drag) and zoom (scroll wheel)

### UI Components (`src/components/ui/`)

| Component | Purpose |
|-----------|---------|
| `AgentTerminal.tsx` | **RPG Dialogue Box** — terminal I/O for selected agent |
| `PartyFrames.tsx` | WoW-style unit frames (top-left) |
| `ResourceBar.tsx` | Global resource display |
| `QuestLog.tsx` | Track all agent quests |
| `QuestTurnIn.tsx` | Quest completion modal |
| `LootPanel.tsx` | File artifacts as collectible loot |
| `SpawnAgentDialog.tsx` | Class selection, directory input |
| `CommandPalette.tsx` | Quick command access (Cmd+K) |
| `ProjectZones.tsx` | Group hexes into project areas |
| `SessionControls.tsx` | Save/load/clear session |
| `TalentTree.tsx` | Agent talent/skill progression |
| `Minimap.tsx` | Overview of agent positions |

### Backend (`server/index.ts`)

WebSocket server that manages PTY processes:

```typescript
// Core responsibilities:
1. Spawn new PTY processes for each agent
2. Route terminal I/O over WebSocket
3. Track agent status (idle/working/waiting)
4. Provide git info for working directories
```

**Message Types:**
| Message | Direction | Purpose |
|---------|-----------|---------|
| `init` | Server → Client | Initial agent list on connect |
| `agent:spawn` | Client → Server | Create new agent |
| `agent:spawned` | Server → Client | Confirm agent created |
| `agent:input` | Client → Server | Send terminal input |
| `agent:output` | Server → Client | Stream terminal output |
| `agent:status` | Server → Client | Status changed |
| `agent:exit` | Server → Client | Agent process ended |
| `error` | Server → Client | Error message |

### Frontend Bridge (`src/services/agentBridge.ts`)

WebSocket client with:
- Automatic reconnection with exponential backoff
- Message queuing during disconnection
- Type-safe message handling
- Toast notifications for connection events

### State Management (`src/stores/gameStore.ts`)

Zustand store holding:

```typescript
interface GameState {
  // Agents
  agents: Map<string, Agent>;
  selectedAgentIds: Set<string>;
  hoveredAgentId: string | null;

  // World
  hexGrid: Map<string, HexTile>;
  projectZones: Map<string, ProjectZone>;
  camera: CameraState;

  // Resources
  resources: GameResources;

  // UI State
  showSpawnDialog: boolean;
  showCommandPanel: boolean;
  isPaused: boolean;

  // Control Groups (RTS-style)
  controlGroups: Map<number, Set<string>>;
}
```

### Toast System (`src/stores/toastStore.ts`)

Global notification system:
- Success, error, warning, info variants
- Auto-dismiss with configurable duration
- Stacking support

### Sound Manager (`src/services/soundManager.ts`)

Audio feedback system:
- Agent spawn/death sounds
- Selection feedback
- Quest completion chimes
- Ambient sounds
- Volume controls per category

## Agent Data Model

```typescript
interface Agent {
  id: string;
  name: string;
  provider: 'claude' | 'openai' | 'gemini';
  class: AgentClass;
  status: 'spawning' | 'idle' | 'working' | 'error' | 'completed';

  // Position
  position: { q: number; r: number; x: number; y: number };

  // Resources (RPG-style)
  health: number;        // API usage remaining
  mana: number;          // Context window usage
  contextTokens: number;
  contextLimit: number;
  usagePercent: number;

  // Activity Detection
  activity: AgentActivity;
  activityStartedAt: number;
  needsAttention: boolean;
  attentionReason?: AttentionReason;
  idleSince?: number;

  // Progress Tracking
  taskProgress?: TaskProgress;

  // Quest System
  currentQuest?: Quest;
  completedQuests: Quest[];
  producedFiles: FileArtifact[];

  // Terminal
  terminalOutput: string[];
  taskQueue: AgentTask[];

  // Progression
  level: number;
  experience: number;
  talents: AgentTalents;
}
```

## File Structure

```
AgentForge/
├── server/
│   └── index.ts              # WebSocket server, PTY management
├── src/
│   ├── components/
│   │   ├── isometric/        # PixiJS isometric rendering
│   │   │   ├── IsometricWorld.tsx
│   │   │   ├── IsometricAgent.tsx
│   │   │   ├── AnimatedSprite.tsx
│   │   │   └── ParticleEffects.tsx
│   │   └── ui/               # React UI components
│   │       ├── AgentTerminal.tsx
│   │       ├── PartyFrames.tsx
│   │       ├── QuestLog.tsx
│   │       ├── QuestTurnIn.tsx
│   │       ├── LootPanel.tsx
│   │       └── ...
│   ├── config/
│   │   ├── agentClasses.ts   # Class definitions
│   │   └── talents.ts        # Talent tree config
│   ├── constants/
│   │   └── zIndex.ts         # Z-index hierarchy
│   ├── hooks/
│   │   ├── useIdleMonitor.ts # Idle detection
│   │   └── useKeyboardShortcuts.ts
│   ├── services/
│   │   ├── agentBridge.ts    # WebSocket client
│   │   └── soundManager.ts   # Audio system
│   ├── stores/
│   │   ├── gameStore.ts      # Main Zustand store
│   │   └── toastStore.ts     # Notification store
│   ├── types/
│   │   └── agent.ts          # TypeScript types
│   ├── utils/
│   │   └── hexUtils.ts       # Hex grid utilities
│   └── App.tsx               # Main app
├── docs/                     # Documentation
└── public/
    └── assets_isometric/     # Isometric sprites & UI
        ├── agents/           # Agent sprites per provider
        ├── tiles/            # Hex tile textures
        └── ui/               # UI elements
```

## Data Flow: Sending a Prompt

```
1. User types in AgentTerminal input
2. AgentTerminal calls agentBridge.sendInput(agentId, text)
3. AgentBridge sends WebSocket message: { type: 'agent:input', agentId, input }
4. Server receives, finds PTY for that agent
5. Server writes to PTY: pty.write(input + '\r')
6. CLI (claude/codex) receives input, processes
7. CLI writes output to PTY
8. Server's pty.onData fires with output
9. Server broadcasts: { type: 'agent:output', agentId, data }
10. Frontend receives, updates agent's terminalOutput
11. gameStore detects activity from output patterns
12. AgentTerminal re-renders showing new output
13. PartyFrames updates status indicators
```

## Session Persistence

The app supports saving/loading sessions:

```typescript
// Saved data includes:
- Agent positions, levels, talents, completed quests
- Project zones
- Control groups
- Camera position
- Resource state
```

Sessions are stored in `localStorage` under `agentforge_session`.

## Z-Index Hierarchy

Consistent layering defined in `src/constants/zIndex.ts`:

| Layer | Z-Index | Components |
|-------|---------|------------|
| Base UI | 30 | Party frames, resource bar |
| Floating Panel | 40 | Loot button, notifications |
| Agent Terminal | 45 | Dialogue box |
| Modal | 50 | Quest log, settings, dialogs |
| Command Palette | 60 | Quick command access |
| Welcome Screen | 70 | Onboarding |
| Toast | 80 | Notifications |

## Running the System

```bash
# Terminal 1: Start backend
npm run server

# Terminal 2: Start frontend
npm run dev

# Or both together:
npm start
```

Backend runs on `ws://localhost:3001`, frontend on `http://localhost:5173` (Vite default).

## Agent Classes (`src/config/agentClasses.ts`)

Each class defines visual and behavioral properties:

```typescript
interface AgentClassConfig {
  id: AgentClass;
  title: string;
  description: string;
  icon: string;           // Emoji
  color: string;          // Theme color
  provider: AgentProvider;
  modelFlag?: string;     // CLI model flag
  spriteSheet?: string;   // Animation sprite
}
```

Available classes:
- **Mage** (Claude) - General coding wizard
- **Architect** (Claude Opus) - System design specialist
- **Engineer** (OpenAI Codex) - Implementation focused
- **Scout** (Claude) - Research and exploration
- **Guardian** (Codex) - Code review and security
- **Designer** (Gemini) - UI/UX and visual work
