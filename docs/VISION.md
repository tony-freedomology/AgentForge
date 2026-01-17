# AgentForge Vision

## The Core Idea

AgentForge is a **visual skin for the terminal experience**. Nothing more, nothing less.

When you're running multiple AI coding assistants (Claude Code, Codex, Gemini CLI) across different projects, you end up with 4-6 terminal windows. It becomes impossible to track:
- Which window is working on what feature
- Which commits belong to which session
- What order to review things in
- What each agent is currently doing

**AgentForge solves this by giving you a spatial, visual way to organize your AI agents.**

Instead of terminal tabs, you see characters on a map. Each character IS a real terminal session. You position them in virtual space however makes sense to you—frontend agents on one side, backend on another, reviewers in a corner. Your brain can now use spatial memory to track your work.

## What This Is NOT

- ❌ **Not a mock terminal** — Every agent is a REAL shell session
- ❌ **Not an API wrapper** — We spawn actual CLI processes (`claude`, `codex`, `gemini`)
- ❌ **Not a simulation** — Terminal output is real, streamed live from actual processes
- ❌ **Not a product for others** — This is a personal productivity tool

## What This IS

- ✅ **A literal terminal** — Just presented through a beautiful, gamified interface
- ✅ **A visual organizer** — Spatial layout helps your brain track concurrent work
- ✅ **A PTY wrapper** — Real pseudo-terminal sessions with full shell capabilities
- ✅ **A personal command center** — Your "mission control" for AI-assisted development

## The Experience

Imagine playing an RTS game, but instead of commanding soldiers, you're commanding AI coding assistants:

1. **Summon an Agent** — Choose a class (Architect, Mage, Guardian, etc.), point it at a project directory
2. **See it on the Map** — The agent appears as a character on your hex-grid battlefield
3. **Talk to It** — Click the agent, type in the dialogue box—exactly like terminal input
4. **Watch it Work** — See real terminal output, styled like game dialogue
5. **Organize Spatially** — Position agents wherever makes sense for your mental model

The interaction should feel like talking to a character in a game with a dialogue box. But you're literally seeing terminal input and output, just stylized. When you type a prompt to an agent, it goes to the real Claude CLI. When Claude responds, you see the actual terminal output.

## The Fantasy-Meets-Function Theme

Each "class" isn't just cosmetic—it maps to a real AI configuration:

| Class | CLI | Model | Role |
|-------|-----|-------|------|
| **Architect** | `claude` | Opus 4.5 | Strategic planning, system design |
| **Mage** | `claude` | Sonnet | General implementation |
| **Guardian** | `codex` | Codex | Code review, quality assurance |
| **Artisan** | `gemini` | Gemini Pro | UI/UX design, aesthetics |
| **Scout** | `claude` | Haiku | Fast research, exploration |
| **Engineer** | `claude` | Sonnet | Focused implementation |

The fantasy theming makes it delightful. The class system makes it functional.

## Future Vision

- **Agent Collaboration Animations** — A Claude mage walks over to a Codex guardian to hand off work for review, visualizing your actual workflow
- **Git Integration** — See branch names, commit status, diffs right in the UI
- **Project Zones** — Define areas of the map for different projects
- **Session Persistence** — Resume your agent layout across sessions
- **Voice Commands** — Bark orders at your digital legion

## The Problem We're Solving

When you're a power user running multiple AI agents:

**Before AgentForge:**
```
[Terminal 1] claude - working on auth feature
[Terminal 2] claude - refactoring database
[Terminal 3] codex - reviewing PR #42
[Terminal 4] claude - debugging build
[Terminal 5] ??? - wait, what was this one doing?
```

**After AgentForge:**
```
┌─────────────────────────────────────┐
│                                     │
│    🧙 Auth       🛡️ PR Review      │
│    Feature       (Codex)           │
│                                     │
│         🔍 Research                │
│                                     │
│    ⚙️ Database    🧙 Build         │
│    Refactor       Debug            │
│                                     │
└─────────────────────────────────────┘
```

Your brain instantly knows where everything is.
