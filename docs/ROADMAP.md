# AgentForge Feature Roadmap

## Vision Summary

AgentForge transforms multi-agent AI workflow management into an intuitive, game-like experience. Drawing inspiration from RTS games (Age of Empires, StarCraft) and MMORPGs (World of Warcraft), we provide visual feedback systems that make managing multiple AI agents as natural as commanding units in a game.

**Core Problem We're Solving**: Cognitive overload when managing multiple parallel AI agents. Users lose track of which agents are idle, which need attention, and what each is working on.

**Solution**: Game-proven UX patterns that humans already understand intuitively.

---

## Feature Categories

### 1. Party Frames (WoW-Style Unit Frames)
### 2. Visual Status Indicators (RTS-Style)
### 3. Activity Detection System
### 4. Quest/Task Turn-in System
### 5. File Artifacts as Loot

---

## Phase 1: Party Frames & Activity Detection

### 1.1 Party Frames Component

**Location**: Top-left of screen (like WoW raid frames)

**Visual Design**:
```
┌─────────────────────────────────────┐
│ 🧙 Arcanum              ⚡ WORKING  │
│ ████████████████░░░░░░░░ 72% CTX   │  ← Context (Mana)
│ ██████████████████████░░ 89% USE   │  ← Usage (Health)
│ ▓▓▓▓▓▓▓▓▓▓░░░░░░░░ Researching...  │  ← Cast Bar
└─────────────────────────────────────┘
┌─────────────────────────────────────┐
│ 📐 Blueprint            ❓ WAITING  │  ← FLASHING!
│ ████████████░░░░░░░░░░░░ 45% CTX   │
│ ██████████████████░░░░░░ 78% USE   │
│ Awaiting your response...           │
└─────────────────────────────────────┘
```

**Data Mappings**:
| WoW Concept | AgentForge Equivalent | Data Source |
|-------------|----------------------|-------------|
| Health Bar | API usage remaining | Parsed from CLI output / API |
| Mana Bar | Context window usage | Token count estimation |
| Cast Bar | Current activity progress | Activity detection |
| Status Icon | Agent state | State machine |
| Aggro/Threat | Needs attention | Pattern detection |

**Interactions**:
- Click frame → Select that agent
- Hover → Show detailed tooltip
- Flash/pulse when agent needs attention

**Implementation**:
- New component: `src/components/ui/PartyFrames.tsx`
- Positioned fixed top-left
- Subscribes to gameStore for agent data
- Shows max 5-8 agents (scrollable for more)

### 1.2 Activity Detection System

**Purpose**: Determine what each agent is currently doing by parsing terminal output.

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

**Detection Patterns**:
```typescript
const ACTIVITY_PATTERNS = {
  researching: [/search/i, /fetching/i, /looking up/i, /researching/i],
  reading: [/reading/i, /analyzing/i, /examining/i, /file:/i],
  writing: [/writing/i, /creating/i, /editing/i, /updating/i],
  testing: [/test/i, /running tests/i, /pytest/i, /jest/i, /npm test/i],
  building: [/build/i, /compile/i, /bundle/i, /webpack/i, /vite/i],
  git: [/git/i, /commit/i, /push/i, /pull/i, /branch/i],
  waiting: [/\?$/, /waiting/i, /input/i, /confirm/i, /y\/n/i],
  error: [/error/i, /failed/i, /exception/i, /crash/i],
};
```

**State Machine**:
```
SPAWNING → IDLE ←→ WORKING
              ↓        ↓
          WAITING   ERROR
              ↓
         COMPLETED (quest ready)
```

**Implementation**:
- Add `activity` field to Agent type
- Add `parseActivityFromOutput()` function
- Update activity on each terminal output line
- Track `lastActivityChange` timestamp for duration

### 1.3 Attention Detection

**Critical States** (require immediate visual feedback):
1. **Waiting for Input**: Agent asked a question or needs confirmation
2. **Error State**: Something went wrong
3. **Task Complete**: Agent finished and is idle
4. **Idle Too Long**: Agent has been idle for X seconds

**Visual Escalation**:
```
0-10 seconds:  Normal indicator
10-30 seconds: Gentle pulse
30-60 seconds: Faster pulse + glow
60+ seconds:   Aggressive flash + sound option
```

**Implementation**:
- Add `needsAttention` boolean to Agent
- Add `attentionReason` string
- Add `idleSince` timestamp
- Visual treatment in both PartyFrames and 3D scene

---

## Phase 2: 3D Visual Status Indicators

### 2.1 Floating Status Above Agents

**Design**: HTML overlay positioned above each agent in 3D space using `@react-three/drei`'s `<Html>` component.

**Visual Elements**:
```
        ❓          ← Attention icon (if needed)
   ┌──────────┐
   │🔍 Research│     ← Activity badge
   └──────────┘
       🧙           ← Agent character
```

**Activity Icons**:
| Activity | Icon | Fantasy Alternative |
|----------|------|---------------------|
| Researching | 🔍 | 📚 Open tome |
| Reading | 📖 | 📜 Scroll |
| Writing | ✍️ | ⚡ Casting |
| Testing | 🧪 | ⚗️ Alchemy |
| Building | 🔨 | ⚒️ Forge |
| Git | 🌿 | 🌳 Tree |
| Waiting | ❓ | 💬 Speech bubble |
| Error | ❌ | 🔥 Flames |
| Idle | 💤 | ☁️ Cloud |

**Implementation**:
- New component: `src/components/3d/AgentStatusIndicator.tsx`
- Rendered inside AgentUnit component
- Uses Html from @react-three/drei for DOM overlay
- Animated with CSS

### 2.2 Progress Indicators

For actions where progress is estimable:
- **Test runs**: "3/10 tests" → progress bar
- **File operations**: Show count of files processed
- **Time elapsed**: For indeterminate tasks

For indeterminate actions:
- Animated "working" indicator (spinning, pulsing)
- Time elapsed counter

---

## Phase 3: Quest Turn-in System

### 3.1 Task Completion Detection

**Triggers**:
- Agent output contains completion phrases ("Done", "Completed", "Finished")
- Agent goes idle after working
- Agent explicitly says task is complete

**Quest States**:
```typescript
type QuestState =
  | 'none'           // No active quest
  | 'in_progress'    // Working on it
  | 'pending_review' // Done, awaiting user review
  | 'approved'       // User accepted
  | 'rejected';      // User sent back for revision
```

### 3.2 Quest Turn-in UI

**Visual Indicator**: Yellow "?" or "!" above agent (WoW-style)

**Turn-in Dialog**:
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

**Actions**:
- **Accept**: Mark complete, files become "loot", agent goes idle
- **Request Changes**: Opens input for feedback, agent continues

### 3.3 Implementation

- Add `quest` field to Agent type
- New component: `src/components/ui/QuestTurnIn.tsx`
- Track modified/created files per agent
- Parse agent output for completion signals

---

## Phase 4: File Artifacts as Loot

### 4.1 File Tracking

**Detect files produced by agents**:
- Parse output for "Created:", "Modified:", "Wrote to:"
- Track file paths and types
- Associate with completing agent

**File Types & Icons**:
| Extension | Icon | Fantasy Name |
|-----------|------|--------------|
| .ts/.js | 📜 | Spell Scroll |
| .tsx/.jsx | ⚡ | Enchanted Scroll |
| .css | 🎨 | Glamour Rune |
| .json | 📋 | Data Tablet |
| .md | 📖 | Tome Page |
| .pdf | 📕 | Bound Tome |
| .png/.jpg | 🖼️ | Vision Crystal |
| .zip | 📦 | Treasure Chest |

### 4.2 Loot Display Options

**Option A: Treasure Chest**
- Each agent has a "loot chest" that fills with produced files
- Click to open, see items inside
- Click item to open/preview

**Option B: Agent Holds Item**
- Completed work shows as glowing item above agent
- Click to claim/open

**Option C: Inventory Panel**
- Separate UI panel showing all produced files
- Organized by agent or by time

### 4.3 Implementation

- Add `producedFiles` array to Agent type
- New component: `src/components/ui/LootPanel.tsx`
- File preview integration (open in system viewer)
- Click handlers to open files

---

## Phase 5: Future Enhancements

### 5.1 Spatial Workstations
- Agents walk to different areas based on activity
- Research corner (library), Forge (coding), Lab (testing)
- Visual variety and spatial memory

### 5.2 AI-Generated Sprites
- Use Gemini Imagen to generate activity-specific poses
- Custom agent portraits
- Environmental art

### 5.3 Audio Feedback
- Subtle chimes for attention needed
- Completion sounds
- Ambient "working" sounds

### 5.4 Multi-Agent Collaboration
- Visual connection lines between collaborating agents
- "Hand-off" animations when passing work
- Shared quest objectives

---

## Technical Implementation Order

### Immediate (Phase 1)
1. ✅ Extend Agent type with new fields
2. ✅ Create PartyFrames component
3. ✅ Implement activity detection
4. ✅ Add attention state tracking
5. ✅ Add CSS animations

### Short-term (Phase 2)
6. Add 3D floating status indicators
7. Implement progress tracking where possible
8. Add visual escalation for attention

### Medium-term (Phase 3-4)
9. Quest completion detection
10. Quest turn-in UI
11. File tracking system
12. Loot panel

### Long-term (Phase 5)
13. Spatial workstations
14. AI sprite generation
15. Audio system
16. Collaboration visuals

---

## Data Model Changes

### Agent Type Extensions

```typescript
interface Agent {
  // Existing fields...

  // New: Activity tracking
  activity: AgentActivity;
  activityStartedAt: number;
  activityDetails?: string;

  // New: Attention system
  needsAttention: boolean;
  attentionReason?: 'waiting_input' | 'error' | 'idle' | 'complete';
  attentionSince?: number;

  // New: Resource tracking
  contextTokens: number;
  contextLimit: number;
  usagePercent: number; // API usage (0-100)

  // New: Quest system
  currentQuest?: {
    description: string;
    startedAt: number;
    status: QuestState;
  };

  // New: File artifacts
  producedFiles: Array<{
    path: string;
    type: 'created' | 'modified';
    timestamp: number;
  }>;
}
```

---

## Success Metrics

1. **Reduced cognitive load**: User can glance at Party Frames and know status of all agents
2. **No idle agents forgotten**: Attention system ensures user notices when agents need input
3. **Clear task handoff**: Quest system makes accepting/rejecting work explicit
4. **File discoverability**: Produced files are easy to find and access

---

*This roadmap is a living document. Update as features are implemented and new ideas emerge.*
