# AgentForge Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        FRONTEND (React)                         │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐ │
│  │   3D Scene  │  │  UI Panels  │  │     Agent Terminal      │ │
│  │  (R3F/drei) │  │  (React)    │  │  (Dialogue Interface)   │ │
│  └─────────────┘  └─────────────┘  └─────────────────────────┘ │
│                            │                                     │
│                     ┌──────┴──────┐                             │
│                     │ AgentBridge │ (WebSocket Client)          │
│                     └──────┬──────┘                             │
└────────────────────────────┼────────────────────────────────────┘
                             │ WebSocket
                             │
┌────────────────────────────┼────────────────────────────────────┐
│                     ┌──────┴──────┐                             │
│                     │  WS Server  │                             │
│                     └──────┬──────┘                             │
│                            │                                     │
│  ┌─────────────────────────┼─────────────────────────────────┐ │
│  │              Process Manager (node-pty)                    │ │
│  │  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐      │ │
│  │  │  PTY 1  │  │  PTY 2  │  │  PTY 3  │  │  PTY n  │      │ │
│  │  │ claude  │  │  codex  │  │ gemini  │  │   ...   │      │ │
│  │  └─────────┘  └─────────┘  └─────────┘  └─────────┘      │ │
│  └───────────────────────────────────────────────────────────┘ │
│                        BACKEND (Node.js)                        │
└─────────────────────────────────────────────────────────────────┘
```

## Core Principle: Real Terminals, Not Simulation

**The backend spawns actual PTY (pseudo-terminal) sessions.** Each agent is a real shell running a real CLI (`claude`, `codex`, `gemini`).

- Uses `node-pty` for proper terminal emulation
- Full ANSI color support, cursor movement, everything
- Input goes directly to the PTY
- Output streams directly from the PTY
- If you can do it in Terminal.app, you can do it here

## Key Components

### Backend (`server/index.ts`)

The backend is a WebSocket server that manages PTY processes:

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
| `agent:spawn` | Client → Server | Create new agent with class, directory |
| `agent:input` | Client → Server | Send terminal input to agent |
| `agent:output` | Server → Client | Stream terminal output from agent |
| `agent:status` | Server → Client | Agent status changed |
| `agent:kill` | Client → Server | Terminate agent process |

### Frontend Bridge (`src/services/agentBridge.ts`)

WebSocket client that connects frontend to backend:

```typescript
// Singleton that manages WebSocket connection
// Provides methods: spawnAgent, sendInput, killAgent
// Handles reconnection, message queuing
```

### 3D Scene (`src/components/3d/`)

React Three Fiber scene with:

| Component | Purpose |
|-----------|---------|
| `Scene.tsx` | Main scene composition |
| `Environment.tsx` | Hex grid, lighting, atmosphere |
| `AgentUnit.tsx` | 3D agent character visualization |
| `SelectionBox.tsx` | RTS-style drag selection |

### UI Components (`src/components/ui/`)

| Component | Purpose |
|-----------|---------|
| `AgentTerminal.tsx` | **THE DIALOGUE BOX** — shows terminal I/O for selected agent |
| `SpawnAgentDialog.tsx` | Class selection, directory input |
| `CommandPanel.tsx` | Quick actions |
| `Minimap.tsx` | Overview of agent positions |
| `ResourceBar.tsx` | Token usage, etc. |

### State Management (`src/stores/gameStore.ts`)

Zustand store holding:
- Active agents (Map)
- Selected agent IDs (Set)
- Hex grid state
- Camera position
- UI state

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
10. Frontend receives, adds to agent's terminalOutput
11. AgentTerminal re-renders showing new output
```

## Agent Classes (`src/config/agentClasses.ts`)

Each class defines:

```typescript
interface AgentClassConfig {
  id: string;           // 'architect', 'mage', etc.
  name: string;         // Display name
  cli: 'claude' | 'codex' | 'gemini';  // Which CLI to spawn
  modelFlag?: string;   // e.g., '--model opus-4-5-20250601'
  color: string;        // Theme color for UI
  // ... visual properties
}
```

The server reads `classId` and constructs the appropriate CLI command:

```bash
# Architect spawns:
claude --model opus-4-5-20250601

# Guardian spawns:
codex

# Artisan spawns:
gemini
```

## File Structure

```
AgentForge/
├── server/
│   └── index.ts          # WebSocket server, PTY management
├── src/
│   ├── components/
│   │   ├── 3d/           # Three.js components
│   │   └── ui/           # React UI components
│   ├── config/
│   │   └── agentClasses.ts  # Class definitions
│   ├── services/
│   │   └── agentBridge.ts   # WebSocket client
│   ├── stores/
│   │   └── gameStore.ts     # Zustand state
│   ├── types/
│   │   └── agent.ts         # TypeScript types
│   └── App.tsx              # Main app
├── docs/                     # You are here
└── public/
    └── assets/              # Sprites, textures
```

## Running the System

```bash
# Terminal 1: Start backend
npm run server

# Terminal 2: Start frontend
npm run dev

# Or both:
npm start
```

Backend runs on `ws://localhost:3001`, frontend on `http://localhost:3000`.
