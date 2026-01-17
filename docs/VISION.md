# AgentForge Vision

## The Core Idea

AgentForge is a **visual skin for the terminal experience**. Nothing more, nothing less.

When you're running multiple AI coding assistants (Claude Code, Codex, Gemini CLI) across different projects, you end up with 4-6 terminal windows. It becomes impossible to track:
- Which window is working on what feature
- Which commits belong to which session
- What order to review things in
- What each agent is currently doing
- **Which agents are idle and waiting for instructions**
- **Which agents need your attention RIGHT NOW**

**AgentForge solves this by giving you a spatial, visual way to organize your AI agents—with game-proven UX patterns that make status instantly readable.**

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
- ✅ **A cognitive load reducer** — Game-like status systems prevent "idle villager" syndrome

---

## The RTS/MMO Inspiration

AgentForge draws heavily from proven game UX patterns:

### From RTS Games (Age of Empires, StarCraft)
- **Unit Selection** — Click agents, drag-select groups
- **Status Indicators** — See at a glance what each unit is doing
- **Idle Unit Detection** — Never forget about agents waiting for orders
- **Spatial Organization** — Position units where they make sense

### From MMORPGs (World of Warcraft)
- **Party Frames** — Health/mana bars for your entire party at a glance
- **Cast Bars** — See what action is being performed and progress
- **Buff/Debuff Icons** — Status effects clearly visible
- **Quest System** — Track objectives, turn in completed work

### The "Idle Villager" Problem

In Age of Empires, a common frustration: you'd have villagers who finished chopping trees but you forgot about them. They'd stand idle while you focused on battle. AgentForge's #1 UX goal is **preventing this with AI agents**.

When an agent:
- Finishes a task → **Visual alert**
- Asks a question → **Flashing indicator**
- Errors out → **Red warning**
- Sits idle too long → **Escalating attention grab**

---

## The Experience

Imagine playing an RTS game, but instead of commanding soldiers, you're commanding AI coding assistants:

1. **Summon an Agent** — Choose a class (Architect, Mage, Guardian, etc.), point it at a project directory
2. **See it on the Map** — The agent appears as a character on your hex-grid battlefield
3. **Monitor via Party Frames** — WoW-style unit frames show all agents' status at a glance
4. **Talk to It** — Click the agent, type in the dialogue box—exactly like terminal input
5. **Watch it Work** — See real terminal output, styled like game dialogue
6. **See Activity Indicators** — Icons above agents show what they're doing (researching, coding, testing)
7. **Respond to Alerts** — Agents needing attention flash and pulse until addressed
8. **Accept Quest Turn-ins** — When an agent completes work, review and approve/reject
9. **Collect Artifacts** — Files produced become "loot" you can access

The interaction should feel like talking to a character in a game with a dialogue box. But you're literally seeing terminal input and output, just stylized.

---

## Party Frames: Your Agent Dashboard

In the top-left corner, WoW-style unit frames show all active agents:

```
┌─────────────────────────────────────┐
│ 🧙 Arcanum              ⚡ WORKING  │
│ ████████████████░░░░░░░░ 72% CTX   │  ← Context window (mana)
│ ██████████████████████░░ 89% USE   │  ← API usage (health)
│ ▓▓▓▓▓▓▓▓▓▓░░░░░░░░ Researching...  │  ← Current activity (cast bar)
└─────────────────────────────────────┘
┌─────────────────────────────────────┐
│ 📐 Blueprint            ❓ WAITING  │  ← FLASHING - needs attention!
│ ████████████░░░░░░░░░░░░ 45% CTX   │
│ ██████████████████░░░░░░ 78% USE   │
│ Awaiting your response...           │
└─────────────────────────────────────┘
```

**Data Mappings:**
| Game Concept | AgentForge Meaning |
|--------------|-------------------|
| Health Bar | API usage remaining (Claude Max credits, etc.) |
| Mana Bar | Context window remaining (before compaction) |
| Cast Bar | Current activity with progress |
| Status Icon | Agent state (working, idle, waiting, error) |
| Threat/Aggro | Needs your attention NOW |

---

## Visual Status Indicators

Above each agent in the 3D space, floating indicators show:

```
        ❓           ← Attention needed (flashing)
   ┌───────────┐
   │ 🔍 Research│     ← Current activity
   └───────────┘
       🧙            ← Agent character
```

**Activity Icons:**
| Activity | Icon | Fantasy Alternative |
|----------|------|---------------------|
| Researching | 🔍 | 📚 Open tome |
| Reading files | 📖 | 📜 Scroll |
| Writing code | ✍️ | ⚡ Casting |
| Running tests | 🧪 | ⚗️ Alchemy |
| Building | 🔨 | ⚒️ Forge |
| Git operations | 🌿 | 🌳 Tree |
| Waiting for input | ❓ | 💬 Speech bubble |
| Error | ❌ | 🔥 Flames |
| Idle | 💤 | ☁️ Sleeping |

---

## Quest System: Task Completion Flow

When an agent completes a task, it becomes a "quest turn-in":

```
┌────────────────────────────────────────────┐
│  📜 QUEST COMPLETE                         │
│  ─────────────────────────────────────────│
│  🧙 Arcanum has completed:                 │
│  "Fix the authentication bug"              │
│                                            │
│  📁 Files Modified:                        │
│     • src/auth/login.ts                    │
│     • src/auth/session.ts                  │
│                                            │
│  📁 Files Created:                         │
│     • src/auth/__tests__/login.test.ts     │
│                                            │
│  ┌─────────────┐  ┌─────────────────────┐ │
│  │ ✓ Accept    │  │ ✗ Request Changes   │ │
│  └─────────────┘  └─────────────────────┘ │
└────────────────────────────────────────────┘
```

- **Accept**: Mark complete, agent returns to idle, files become "loot"
- **Request Changes**: Provide feedback, agent continues work

---

## File Artifacts as Loot

Files produced by agents become collectible items:

```
┌──────────────────┐
│    🎁 REWARDS    │
├──────────────────┤
│ 📜 auth.ts       │  ← Click to open
│ 🧪 auth.test.ts  │
│ 📖 README.md     │
└──────────────────┘
```

File types get fantasy names:
| Extension | Icon | Fantasy Name |
|-----------|------|--------------|
| .ts/.js | 📜 | Spell Scroll |
| .tsx/.jsx | ⚡ | Enchanted Scroll |
| .css | 🎨 | Glamour Rune |
| .test.ts | 🧪 | Alchemist's Notes |
| .md | 📖 | Tome Page |
| .pdf | 📕 | Bound Tome |

---

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

---

## Attention Escalation System

Agents needing attention use escalating visual urgency:

| Time Idle | Visual Treatment |
|-----------|------------------|
| 0-10 sec | Normal status indicator |
| 10-30 sec | Gentle pulse animation |
| 30-60 sec | Faster pulse + glow effect |
| 60+ sec | Aggressive flash + screen edge glow |

This ensures you **never forget about an agent** waiting for input.

---

## Future Vision

### Near-term
- **Agent Collaboration Animations** — A Claude mage walks over to a Codex guardian to hand off work for review
- **Git Integration** — See branch names, commit status, diffs right in the UI
- **Project Zones** — Define areas of the map for different projects
- **Session Persistence** — Resume your agent layout across sessions

### Long-term
- **Voice Commands** — Bark orders at your digital legion
- **AI-Generated Sprites** — Use Gemini Imagen to create custom agent poses
- **Spatial Workstations** — Agents walk to library for research, forge for coding
- **Audio Feedback** — Subtle chimes and sounds for status changes
- **Multi-Agent Quests** — Collaborative tasks across multiple agents

---

## The Problem We're Solving

When you're a power user running multiple AI agents:

**Before AgentForge:**
```
[Terminal 1] claude - working on auth feature
[Terminal 2] claude - refactoring database... wait, is it done?
[Terminal 3] codex - reviewing PR #42... asked me something 5 min ago
[Terminal 4] claude - debugging build... errored out, didn't notice
[Terminal 5] ??? - completely forgot this existed
```

**After AgentForge:**
```
┌─ Party Frames ──────────────────────────────┐
│ 🧙 Auth       ⚡ WORKING  ████████ 65% CTX  │
│ 📐 Database   ✓ COMPLETE ████░░░░ 40% CTX  │ ← Quest ready!
│ 🛡️ PR Review  ❓ WAITING  ██████░░ 55% CTX  │ ← FLASHING!
│ ⚙️ Build      ❌ ERROR    ████████ 80% CTX  │ ← Needs attention
│ 🔍 Research   💤 IDLE     ██░░░░░░ 20% CTX  │
└─────────────────────────────────────────────┘

   Map View:
   ┌───────────────────────────────────────┐
   │                                       │
   │    🧙 Auth      🛡️❓PR Review        │
   │    [working]    [WAITING!]            │
   │                                       │
   │         🔍💤                          │
   │         [idle]                        │
   │                                       │
   │    📐✓ Database   ⚙️❌ Build          │
   │    [COMPLETE!]    [ERROR!]            │
   │                                       │
   └───────────────────────────────────────┘
```

Your brain instantly knows:
1. Who needs attention (flashing)
2. Who has completed work (quest icon)
3. Who is working (activity indicator)
4. Who is available for new tasks (idle)
5. How much capacity each has (context bars)

**No more idle villagers. No more forgotten agents. No more cognitive overload.**
