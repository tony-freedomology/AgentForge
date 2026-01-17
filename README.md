# 🏰 AgentForge

**A spatial, visual interface for managing multiple AI coding assistants.**

![AgentForge](https://img.shields.io/badge/status-alpha-orange) ![License](https://img.shields.io/badge/license-MIT-blue)

---

## What Is This?

AgentForge is a **visual skin for the terminal experience**. When you're running multiple AI agents (Claude, Codex, Gemini) across different projects, terminal tabs become chaos. AgentForge gives you a spatial way to organize them—like an RTS game, but for your AI workforce.

**Each agent is a real terminal session.** Not a simulation. When you type to an agent, you're typing to a real CLI. When you see output, it's streaming from a real process.

```
Before: 6 terminal tabs, no idea which is which
After:  A map where you can see all your agents at once
```

## Quick Start

```bash
# Install dependencies
npm install

# Start backend server
npm run server

# Start frontend (separate terminal)
npm run dev

# Or run both at once
npm start
```

Open http://localhost:3000, click "Enter The Forge", press `N` to summon an agent.

## Agent Classes

| Class | CLI | Model | Role |
|-------|-----|-------|------|
| 🏗️ **Architect** | claude | Opus 4.5 | Strategic planning |
| 🧙 **Mage** | claude | Sonnet | Implementation |
| 🛡️ **Guardian** | codex | Codex | Code review |
| 🎨 **Artisan** | gemini | Gemini Pro | Design |
| 🔍 **Scout** | claude | Haiku | Research |
| ⚙️ **Engineer** | claude | Sonnet | Focused builds |

## Controls

| Key | Action |
|-----|--------|
| `N` | Summon new agent |
| Click | Select agent |
| Drag | Selection box |
| `Option/Alt` + Drag | Rotate camera |
| Scroll | Zoom |

## Documentation

- **[VISION.md](./docs/VISION.md)** — What we're building and why
- **[ARCHITECTURE.md](./docs/ARCHITECTURE.md)** — How the systems work
- **[TERMINAL.md](./docs/TERMINAL.md)** — The terminal experience
- **[CONTRIBUTING.md](./docs/CONTRIBUTING.md)** — For developers/agents

## Tech Stack

- **Frontend**: React, React Three Fiber, Zustand, Tailwind
- **Backend**: Node.js, WebSocket, node-pty
- **Build**: Vite, TypeScript

## The Vision

> Imagine playing an RTS game, but instead of soldiers, you're commanding AI coding assistants. Position them spatially. See what they're doing. Talk to them like characters in a game—but get real terminal output.

This is a personal productivity tool for power users who run multiple concurrent AI sessions.

---

*Built with Claude Opus 4.5*
