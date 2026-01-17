# Contributing to AgentForge

## For AI Agents Working on This Codebase

Welcome! This document helps you understand what you're working on and how to contribute effectively.

### First, Read These

1. **[VISION.md](./VISION.md)** — What we're building and why
2. **[ARCHITECTURE.md](./ARCHITECTURE.md)** — How the systems work
3. **[TERMINAL.md](./TERMINAL.md)** — The core terminal experience

### The Golden Rule

**This is a terminal skin, not a terminal simulation.**

Every feature you build must work with REAL terminal processes. Never mock terminal behavior. Never simulate output. If it doesn't work with actual `claude`, `codex`, or `gemini` CLI running in a real PTY, it doesn't work.

## Key Principles

### 1. Real Over Simulated

```typescript
// ❌ WRONG: Simulating terminal output
function simulateClaudeResponse() {
  return "I'll help you with that...";
}

// ✅ RIGHT: Sending to real PTY
function sendToAgent(agentId: string, input: string) {
  const pty = agents.get(agentId).pty;
  pty.write(input + '\r');
}
```

### 2. Spatial Organization

The whole point is spatial memory. Features should enhance the user's ability to:
- See where agents are positioned
- Understand what each agent is doing at a glance
- Organize agents in meaningful ways

### 3. Game Feel, Terminal Function

The UI should feel like a game. The functionality should be 100% terminal. Example:

```typescript
// The button looks like a fantasy game element
<button className="fantasy-panel glow-effect">
  ✨ Summon Agent
</button>

// But it spawns a real PTY process
spawnAgent(id, name, classId, workingDir);
```

### 4. Class System = Real Configurations

Agent classes aren't cosmetic. Each class maps to a specific CLI + model:

```typescript
// Adding a new class? It must specify real CLI config:
{
  id: 'newclass',
  cli: 'claude',  // or 'codex' or 'gemini'
  modelFlag: '--model some-model',
  // ... visual properties
}
```

## Common Tasks

### Adding a New Agent Class

1. Add config to `src/config/agentClasses.ts`
2. Add CLI handling to `server/index.ts` (if new CLI type)
3. Add sprite to `public/assets/sprites/`
4. Update `SpawnAgentDialog.tsx` if needed

### Improving Terminal Display

The terminal output is in `AgentTerminal.tsx`. Current approach:
- Strip ANSI codes
- Apply simple pattern-based coloring

To improve:
- Could use `ansi-to-html` for better color preservation
- Could integrate `xterm.js` for full terminal emulation
- Keep the dialogue-box feel regardless

### Adding New UI Panels

1. Create component in `src/components/ui/`
2. Add to `App.tsx`
3. Use `fantasy-panel` class for consistent styling
4. Connect to `gameStore` for state

### Modifying 3D Scene

Components in `src/components/3d/`:
- Use React Three Fiber (`@react-three/fiber`)
- Use drei helpers (`@react-three/drei`)
- Keep performance in mind (many agents = many meshes)

## Tech Stack

| Layer | Technology |
|-------|------------|
| 3D | React Three Fiber, drei |
| UI | React, Tailwind CSS |
| State | Zustand |
| Backend | Node.js, WebSocket (ws), node-pty |
| Build | Vite, TypeScript |

## File Locations

| What | Where |
|------|-------|
| Agent class configs | `src/config/agentClasses.ts` |
| WebSocket server | `server/index.ts` |
| Frontend WS client | `src/services/agentBridge.ts` |
| 3D components | `src/components/3d/` |
| UI components | `src/components/ui/` |
| State store | `src/stores/gameStore.ts` |
| Types | `src/types/agent.ts` |

## Running Locally

```bash
# Install dependencies
npm install

# Start backend (Terminal 1)
npm run server

# Start frontend (Terminal 2)
npm run dev

# Or both at once
npm start
```

## Testing Changes

1. Start both servers
2. Open http://localhost:3000
3. Click "Enter The Forge"
4. Press N to summon an agent
5. Point it at a real directory (e.g., `~/some-project`)
6. Verify the CLI actually starts
7. Send a prompt, verify real response

## Questions to Ask Yourself

Before submitting changes:

1. **Does this work with real terminals?** (Not mocked)
2. **Does this help spatial organization?** (The core value prop)
3. **Does it feel like a game?** (The aesthetic goal)
4. **Does it function like a terminal?** (The technical requirement)

## Future Roadmap

See [VISION.md](./VISION.md) for future ideas:
- Agent collaboration animations
- Git integration
- Project zones
- Session persistence
- Voice commands

Pick something and build it!
