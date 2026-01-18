# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

AgentForge is a spatial, game-inspired interface for orchestrating multiple AI coding agents. Each on-screen "agent" corresponds to a real shell/CLI session (Claude, Codex, Gemini) running in a PTY on the backend. The frontend is a React + React Three Fiber (and isometric Pixi) experience; the backend is a Node WebSocket server that manages PTYs and streams terminal I/O.

Key reference docs (read for deeper context):
- `README.md` — quickstart and high-level concept
- `docs/ARCHITECTURE.md` — detailed system diagram and component roles
- `docs/TERMINAL.md` — PTY/terminal behavior and constraints
- `docs/VISION.md` — product/UX vision and game metaphors

## Common Commands

All commands are run from the repository root.

### Install dependencies

```bash
npm install
```

### Run the app during development

_Backend and frontend are separate processes; you can run them together or individually._

```bash
# Start only the backend WebSocket + PTY server (ws://localhost:3001)
npm run server

# Start only the Vite dev server for the React frontend (http://localhost:3000)
npm run dev

# Start both backend and frontend concurrently
npm start
```

The default frontend entry point is `src/main.tsx` → `src/App.tsx`. When running, open `http://localhost:3000` in a browser, click "Enter The Forge", then press `N` to summon an agent.

### Build and preview

```bash
# Type-check and build frontend assets
npm run build

# Preview the built app locally (uses Vite preview)
npm run preview
```

`npm run build` runs TypeScript in project mode (`tsc -b`) and then `vite build`.

### Linting

ESLint is configured via `eslint.config.js` using the flat config style.

```bash
# Lint the entire project
npm run lint
```

### Tests

There is currently **no test script or test framework configured** in `package.json`. If you introduce tests, ensure you add an appropriate `"test"` (and, ideally, `"test:watch"`) script so future agents can run them directly.

## Runtime Architecture (Big Picture)

AgentForge is a classic client–server app with a game-style frontend and a PTY-based backend. The most important flows for Warp to understand are: spawning agents, streaming terminal I/O, and mapping backend agents to frontend entities.

### Backend server (`server/index.ts`)

The backend exposes a WebSocket API on `ws://localhost:3001` and manages one PTY per agent.

Core responsibilities:
- Maintain a `WebSocketServer` and broadcast messages to all connected clients.
- Manage `AgentProcess` instances in an in-memory `Map` keyed by agent ID.
- Spawn PTYs using `node-pty` and attach them to real CLI commands.
- Track basic git context for each agent's working directory.

Important details:
- **Agent classes and CLIs** are defined in `AGENT_CLASSES` (e.g. `mage`, `architect`, `scout`, `guardian`, `designer`). Each class maps to a CLI string: `'claude' | 'codex' | 'gemini'`.
- `spawnAgent(...)`:
  - Expands `~` in the requested `workingDir` using `os.homedir()`.
  - Validates the directory exists (throws if not).
  - Spawns a PTY shell (`bash` on Unix, `powershell.exe` on Windows) with `cwd` = `workingDir` and terminal env (`TERM=xterm-256color`, `COLORTERM=truecolor`).
  - After a short delay, writes the CLI command to the PTY (`claude`, `codex`, or `gemini`), and optionally an initial prompt.
- `getGitInfo(dir)` runs `git` commands via `child_process.spawn` to populate `gitBranch`, `gitStatus`, and recent commits.
- PTY `onData` handler:
  - Broadcasts `{ type: 'agent:output', agentId, data }` to all clients.
  - Updates `agent.status` heuristically based on output content (`'working'`, `'waiting'`, `'idle'`) and broadcasts `agent:status` messages.
- WebSocket message protocol (server-side handlers):
  - `agent:spawn` → call `spawnAgent(...)`, then respond with `agent:spawned` (initial agent metadata).
  - `agent:input` → call `sendInput(agentId, input)` (writes `input + '\r'` to the PTY and sets status to `working`).
  - `agent:kill` → `killAgent(agentId)` (kills PTY, removes from map).
  - `agent:resize` → resize PTY columns/rows.
  - `agents:list` → respond with current agents state.

**Operational requirement:** the CLIs `claude`, `codex`, and `gemini` must be available on the system `PATH` for each corresponding agent class to function as designed.

### Frontend shell (`src/main.tsx`, `src/App.tsx`)

- `src/main.tsx` is a minimal entry that mounts `<App />` into `#root`.
- `src/App.tsx` orchestrates:
  - View mode (3D R3F scene vs. isometric Pixi scene) via `useIsometric` state.
  - Global overlays: welcome screen, help overlay, command palette, spawn dialog.
  - Connection lifecycle to the backend via `agentBridge.connect()` / `disconnect()` and the `connectionStatus` state machine (`connecting | connected | disconnected`).
  - Keyboard shortcuts (`useKeyboardShortcuts` + manual `keydown` listener) for:
    - `F1` → help overlay
    - `N` → spawn agent dialog (when connected and not focused in an input)
    - `Cmd/Ctrl+K` → command palette
  - The 3D/isometric world (`Scene` in `src/components/3d/Scene.tsx` and `IsometricWorld` in `src/components/isometric/IsometricWorld.tsx`).
  - UI overlays: `ResourceBar`, `Minimap`, `CommandPanel`, `AgentTerminal`, `PartyFrames`, `LootPanel`, `PendingQuestsNotification`, `ToastContainer`, `SoundToggle`.

The `App` component is the place to wire new global UI elements, connection logic, or top-level stateful behavior.

### Agent state and game systems (`src/stores/gameStore.ts`)

The central game/agent state lives in a Zustand store with `subscribeWithSelector` middleware. This is the authoritative frontend representation of the "world" and individual agents.

High-level structure:
- `agents: Map<string, Agent>` — full agent objects, defined in `src/types/agent.ts`.
- `selectedAgentIds`, `hoveredAgentId` — UI selection state.
- `hexGrid: Map<string, HexTile>` and `mapSize` — world tiles, generated via `generateHexGrid` from `src/utils/hexUtils.ts`.
- `resources: GameResources` — token/gold/mana/souls resource bars for the RTS/MMO metaphor.
- `selectionBox` — drag-rectangle selection UI.
- `camera: CameraState` — position/target/zoom for 3D camera.
- `controlGroups: Map<number, Set<string>>` — RTS-style numbered unit groups.
- Quest, talent, and attention systems (quests, produced files, talents, `needsAttention`, `attentionReason`, etc.).

Important responsibilities:
- **Agent lifecycle**:
  - `spawnAgent(provider, agentClass, name, position, workingDir?)`:
    - Generates an ID via `uuidv4`.
    - Uses `agentBridge.spawnAgent` to request the backend PTY.
    - Creates a new `Agent` entry with initial terminal output and game stats.
    - Marks the corresponding hex as occupied and increments `souls`.
    - After a delay, transitions status/activity to `idle`.
  - `removeAgent(agentId)`:
    - Calls `agentBridge.killAgent`.
    - Frees the occupied hex tile, updates `souls`, and removes selection.
- **Terminal output and activity detection**:
  - `addTerminalOutput(agentId, output)` appends output (capped at last 100 lines) and calls `detectActivityFromOutput`.
  - `detectActivityFromOutput` uses `ACTIVITY_PATTERNS` from `src/types/agent.ts` to infer activities like `waiting`, `error`, etc., and updates both `activity` and `status` accordingly.
  - Also triggers `detectFileArtifacts` and `detectQuestCompletion` to map natural-language output into quests and file artifacts.
- **Quest system**:
  - `startQuest`, `completeQuest`, `approveQuest`, `rejectQuest` manage a mini workflow with `Quest` objects, toast notifications, and XP/level/talent point progression.
- **Talent system**:
  - Uses `canLearnTalent` from `src/config/talents.ts` to validate and mutate `talents` on an `Agent`.
- **Hex grid and camera helpers** for movement and minimap/3D coordination.

Most UI components that display or manipulate agents (party frames, minimap, terminal, quest panels) should rely on this store, not their own duplicated state.

### WebSocket bridge (`src/services/agentBridge.ts`)

`AgentBridge` is a singleton responsible for speaking the backend WebSocket protocol and translating it into store updates.

Key behaviors:
- Maintains a single `WebSocket` connection to `ws://localhost:3001`.
- Handles reconnection attempts with exponential-like backoff (`maxReconnectAttempts`, `reconnectDelay`).
- Queues outbound messages while the socket is not open and flushes them on connect.
- Strips ANSI codes from incoming `agent:output` using `stripAnsi` before storing.

Message handling:
- `init` — initial list of agents; `syncAgentToStore` is called for each.
- `agent:spawned` — adds a new agent; `syncAgentToStore` handles mapping into the game store.
- `agent:output` — splits output on newlines and feeds each line into `store.addTerminalOutput`.
- `agent:status` — calls `store.updateAgentStatus`.
- `agent:exit` — logs and delegates removal to `store.removeAgent`.

`syncAgentToStore` currently:
- Derives a free hex tile via `findEmptyHexPosition`.
- Infers an `AgentClass` (mage/guardian/etc.) via simple string heuristics on `name` and `workingDir`.
- Chooses `provider` based on the name (e.g. names with `codex` become `guardian`/Codex agents).
- Calls `store.spawnAgent(...)` to create the visual agent and then appends working directory and git branch information as terminal output.

Public API:
- `spawnAgent(id, name, classId, workingDir, initialPrompt?)` → sends `agent:spawn`.
- `sendInput(agentId, input)` → sends `agent:input`.
- `killAgent(agentId)` → sends `agent:kill`.
- `resizeAgent(agentId, cols, rows)` → sends `agent:resize`.
- `connect()` / `disconnect()` / `isConnected()` for lifecycle control.

When adding new WebSocket message types, update both `server/index.ts` and `AgentBridge.handleMessage`, and ensure the relevant store actions exist.

### Orchestrator (simulated agent behavior) (`src/services/agentOrchestrator.ts`)

The `AgentOrchestrator` provides a **simulated** agent execution layer separate from the PTY-based backend. It is useful for demos and non-terminal-driven experiences.

Important points:
- `simulateAgentWork(...)` streams canned log lines from `DEMO_RESPONSES` based on the prompt (`fix`, `create`, `test`, `review`, or default) with random delays and occasional simulated errors.
- While streaming, it updates agent mana and global token resources.
- `AgentOrchestrator.executeTask(agentId, task)`:
  - Ensures the agent exists and is not already `working`; otherwise queues via `store.addAgentTask`.
  - Manages an `AbortController` per agent to support cancellation.
  - Updates status to `working` → `completed` → `idle` over time.
- `useOrchestrator()` exposes convenient hooks for React components to submit tasks and cancel them.

If you add real API-based orchestration (e.g., calling Claude APIs directly), this is the place to extend or replace logic.

## Important Files and Directories (Non-Exhaustive)

- `server/index.ts` — WebSocket server and PTY + git integration.
- `src/main.tsx` — React entry point.
- `src/App.tsx` — top-level application shell and layout.
- `src/components/3d/` — React Three Fiber scene, camera, agents, selection box.
- `src/components/isometric/IsometricWorld.tsx` — isometric Pixi-based world.
- `src/components/ui/` — UI overlay components (terminal, minimap, party frames, loot, quests, command palette, sound, etc.).
- `src/stores/gameStore.ts` — primary game/agent state store and behaviors.
- `src/types/agent.ts` — shared types and activity patterns for agents.
- `src/services/agentBridge.ts` — WebSocket client to backend.
- `src/services/agentOrchestrator.ts` — simulated agent orchestrator.
- `src/config/agentClasses.ts` — visual/semantic configuration for agent classes.
- `src/config/talents.ts` — talent tree configuration and rules.
- `src/utils/hexUtils.ts` — hex grid generation and helpers.
- `src/utils/isoCoords.ts` — coordinate utilities for the isometric view.

## Notes for Future Warp Usage

- When modifying how agents behave or appear, check **all three layers**:
  1. Backend PTY + WebSocket protocol (`server/index.ts`).
  2. WebSocket bridge (`src/services/agentBridge.ts`).
  3. Game state and UI mapping (`src/stores/gameStore.ts` and `src/components/**`).
- For features that depend on git information, reuse or extend `getGitInfo` rather than shelling out ad hoc from the frontend.
- If you add new message types or semantics to the agent protocol (e.g., richer status, structured logs, artifact metadata), define them explicitly in `server/index.ts` and keep the bridge and store in sync.
- Before relying on PTY-based CLIs in development, ensure the relevant CLIs (`claude`, `codex`, `gemini`) are installed and reachable on the PATH of the environment running `npm run server`.