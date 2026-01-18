# AgentForge Feature Roadmap

## Vision Summary

AgentForge transforms multi-agent AI workflow management into an intuitive, game-like experience. Drawing inspiration from RTS games (Age of Empires, StarCraft) and MMORPGs (World of Warcraft), we provide visual feedback systems that make managing multiple AI agents as natural as commanding units in a game.

**Core Problem We're Solving**: Cognitive overload when managing multiple parallel AI agents. Users lose track of which agents are idle, which need attention, and what each is working on.

**Solution**: Game-proven UX patterns that humans already understand intuitively.

---

## Implementation Status

### Phase 1: Party Frames & Activity Detection - COMPLETE

- [x] Party Frames component (`PartyFrames.tsx`)
- [x] Activity detection system with pattern matching
- [x] Attention state tracking (needsAttention, attentionReason)
- [x] Idle timeout detection with visual indicators
- [x] Context/API usage tracking from CLI output
- [x] Progress bar parsing (e.g., "3/10 tests")
- [x] CSS animations for status changes

### Phase 2: Isometric Visual World - COMPLETE

- [x] PixiJS isometric rendering (`IsometricWorld.tsx`)
- [x] Hex grid with terrain types
- [x] Agent sprites with provider-specific visuals
- [x] Procedural animations (breathing, bobbing, wobble)
- [x] Selection indicators and hover effects
- [x] Camera pan and zoom controls
- [x] Particle effects system

### Phase 3: Quest Turn-in System - COMPLETE

- [x] Quest state machine (none → in_progress → pending_review → approved/rejected)
- [x] Quest completion detection from output patterns
- [x] Quest turn-in modal (`QuestTurnIn.tsx`)
- [x] Quest log panel (`QuestLog.tsx`)
- [x] Agent notes display

### Phase 4: File Artifacts as Loot - COMPLETE

- [x] File tracking from agent output
- [x] Loot panel (`LootPanel.tsx`)
- [x] File type icons and categorization
- [x] Click to open in VS Code
- [x] Per-agent file grouping

### Phase 5: Supporting Systems - COMPLETE

- [x] Session persistence (save/load/restore)
- [x] Project zones system
- [x] Sound manager with categories
- [x] Toast notification system
- [x] Z-index hierarchy constants
- [x] Keyboard shortcuts
- [x] Control groups (RTS-style Ctrl+1-9)
- [x] Command palette (Cmd+K)
- [x] Talent tree system

---

## Feature Details

### Party Frames (WoW-Style Unit Frames)

**Location**: Top-left of screen

**Visual Design**:
```
┌─────────────────────────────────────┐
│ 🧙 Arcanum              ⚡ WORKING  │
│ ████████████████░░░░░░░░ 72% CTX   │  ← Context (Mana)
│ ██████████████████████░░ 89% USE   │  ← Usage (Health)
│ ▓▓▓▓▓▓▓▓▓▓░░░░░░░░ 3/10 tests     │  ← Progress Bar
└─────────────────────────────────────┘
┌─────────────────────────────────────┐
│ 📐 Blueprint         💤 IDLE_TIMEOUT│  ← Attention needed!
│ ████████████░░░░░░░░░░░░ 45% CTX   │
│ ██████████████████░░░░░░ 78% USE   │
│ Idle for 2m 30s                     │
└─────────────────────────────────────┘
```

**Data Mappings**:
| WoW Concept | AgentForge Equivalent | Data Source |
|-------------|----------------------|-------------|
| Health Bar | API usage remaining | Parsed from CLI output |
| Mana Bar | Context window usage | Token count estimation |
| Cast Bar | Current activity progress | Activity detection |
| Status Icon | Agent state | State machine |
| Aggro/Threat | Needs attention | Pattern detection |

**Interactions**:
- Click frame → Select that agent
- Hover → Show detailed tooltip
- Flash/pulse when agent needs attention

### Activity Detection System

**Activity Types**:
```typescript
type AgentActivity =
  | 'idle'           // Not doing anything
  | 'thinking'       // Processing, no specific action
  | 'researching'    // Web search, reading docs
  | 'reading'        // Reading files
  | 'writing'        // Writing/editing code
  | 'testing'        // Running tests
  | 'building'       // Compiling, bundling
  | 'git'            // Git operations
  | 'waiting'        // Waiting for user input
  | 'error';         // Something went wrong
```

**Attention Reasons**:
```typescript
type AttentionReason =
  | 'waiting_input'  // Agent asked a question
  | 'error'          // Something went wrong
  | 'idle_timeout'   // Idle too long (configurable)
  | 'task_complete'; // Quest ready for review
```

### Quest System

**Quest States**:
```typescript
type QuestStatus =
  | 'none'           // No active quest
  | 'in_progress'    // Working on it
  | 'pending_review' // Done, awaiting user review
  | 'approved'       // User accepted
  | 'rejected';      // User sent back for revision
```

**Quest Turn-in Dialog**:
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
│  💬 Agent's Notes:                         │
│  "Fixed the token refresh logic and added  │
│   tests. Ready for review."                │
│                                            │
│  ┌─────────────┐  ┌─────────────────────┐ │
│  │ ✓ Accept    │  │ ✗ Request Changes   │ │
│  └─────────────┘  └─────────────────────┘ │
└────────────────────────────────────────────┘
```

### Session Persistence

**Saved Data**:
- Agent positions, names, classes
- Level, experience, talents
- Completed quests history
- Project zones configuration
- Control group assignments
- Camera position
- Resource state

**API**:
```typescript
saveSession(): void      // Save to localStorage
loadSession(): SavedAgentData[] | false
restoreAgents(agents: SavedAgentData[]): void
clearSession(): void
```

### Project Zones

Group hexes into named project areas:

```typescript
interface ProjectZone {
  id: string;
  name: string;
  color: string;
  hexes: Array<{ q: number; r: number }>;
  description?: string;
}
```

### Sound System

**Sound Categories**:
- `ui` - Interface clicks, selections
- `agent` - Spawn, completion, error sounds
- `ambient` - Background atmosphere
- `notification` - Alerts and attention sounds

**Volume Controls**: Per-category volume adjustment

---

## Future Enhancements

### Near-term

- [ ] Animated sprite sheets per agent class
- [ ] Workstation areas (agents move to library/forge/lab)
- [ ] Multi-agent collaboration visuals
- [ ] Hand-off animations between agents

### Medium-term

- [ ] AI-generated custom portraits
- [ ] Environmental art variations
- [ ] Weather/time-of-day effects
- [ ] Achievement system

### Long-term

- [ ] Multiplayer/shared sessions
- [ ] Plugin system for custom agents
- [ ] Mobile companion app
- [ ] Voice commands

---

## Data Model

### Agent Type

```typescript
interface Agent {
  // Identity
  id: string;
  name: string;
  provider: AgentProvider;
  class: AgentClass;
  status: AgentStatus;

  // Position
  position: AgentPosition;

  // Resources
  health: number;
  mana: number;
  contextTokens: number;
  contextLimit: number;
  usagePercent: number;

  // Activity
  activity: AgentActivity;
  activityStartedAt: number;
  needsAttention: boolean;
  attentionReason?: AttentionReason;
  idleSince?: number;
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
  controlGroup?: number;
}
```

### Progress Tracking

```typescript
interface TaskProgress {
  type: 'tests' | 'build' | 'lint' | 'files' | 'generic';
  current: number;
  total: number;
  label?: string;
  startedAt: number;
}

// Patterns detected from output:
// "3/10 tests" → { type: 'tests', current: 3, total: 10 }
// "Building... 45%" → { type: 'build', current: 45, total: 100 }
```

---

## Success Metrics

1. **Reduced cognitive load**: User can glance at Party Frames and know status of all agents
2. **No idle agents forgotten**: Attention system ensures user notices when agents need input
3. **Clear task handoff**: Quest system makes accepting/rejecting work explicit
4. **File discoverability**: Produced files are easy to find and access
5. **Session continuity**: Work persists across browser sessions

---

*This roadmap is a living document. Update as features are implemented and new ideas emerge.*
