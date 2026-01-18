# Arcane Spire: Mobile Agent Manager

## Vision

A mobile-first application for managing AI coding agents, inspired by the delightful UX of [Tiny Tower](https://en.wikipedia.org/wiki/Tiny_Tower) but reimagined as a high-fantasy **Arcane Spire** where your agents are wizards, artificers, and scholars working on real code in real terminals.

**The core promise**: Check on your fleet of AI agents from anywhere, give them new tasks, review their work, and feel the satisfaction of watching your magical tower of productivity grow—all while real work gets done on your actual codebase.

---

## Technical Architecture

### The Connection Challenge

The fundamental challenge: How do we get a mobile app to control real terminals running on your development machine?

#### Solution: AgentForge Daemon + WebSocket Relay

```
┌─────────────────────────────────────────────────────────────────┐
│                     YOUR DEVELOPMENT MACHINE                     │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │                   AgentForge Daemon                          ││
│  │  ┌─────────┐  ┌─────────┐  ┌─────────┐                     ││
│  │  │  PTY 1  │  │  PTY 2  │  │  PTY 3  │  (Real terminals)   ││
│  │  │ claude  │  │  codex  │  │ gemini  │                     ││
│  │  └────┬────┘  └────┬────┘  └────┬────┘                     ││
│  │       └───────────┬┴───────────┘                            ││
│  │              WebSocket Server                                ││
│  │                   │ :3001                                    ││
│  └───────────────────┼─────────────────────────────────────────┘│
│                      │                                           │
│  ┌───────────────────┼─────────────────────────────────────────┐│
│  │              ngrok / Cloudflare Tunnel                       ││
│  │         (or Tailscale for private networking)                ││
│  └───────────────────┼─────────────────────────────────────────┘│
└──────────────────────┼──────────────────────────────────────────┘
                       │ Secure WebSocket (wss://)
                       │
┌──────────────────────┼──────────────────────────────────────────┐
│                      │                                           │
│  ┌───────────────────┴─────────────────────────────────────────┐│
│  │              Arcane Spire Mobile App                         ││
│  │                                                              ││
│  │   ┌────────────┐  ┌────────────┐  ┌────────────┐           ││
│  │   │ Agent View │  │ Quest Feed │  │  Grimoire  │           ││
│  │   └────────────┘  └────────────┘  └────────────┘           ││
│  └──────────────────────────────────────────────────────────────┘│
│                     MOBILE DEVICE                                │
└──────────────────────────────────────────────────────────────────┘
```

### Connection Options

| Method | Pros | Cons | Best For |
|--------|------|------|----------|
| **ngrok** | Easy setup, free tier | Public URL changes, latency | Quick demos |
| **Cloudflare Tunnel** | Stable URLs, fast | Requires CF account | Production use |
| **Tailscale** | Private network, no exposure | Requires Tailscale on both | Security-focused |
| **Direct SSH** | No relay needed | Complex setup, iOS limits | Power users |

**Recommended**: Tailscale for security + simplicity. Your phone and dev machine join the same private network. No public exposure.

### Persistent Sessions with tmux

To handle mobile connection drops gracefully, each agent runs inside a [tmux session](https://www.linode.com/docs/guides/persistent-terminal-sessions-with-tmux/):

```bash
# Agent spawning (daemon side)
tmux new-session -d -s "agent-${agentId}" "claude --model opus"
```

Benefits:
- Agent keeps running if mobile app disconnects
- Reconnect and pick up where you left off
- View scrollback history
- Multiple mobile devices can observe same agent

---

## App Structure

### Tech Stack

| Layer | Technology | Rationale |
|-------|------------|-----------|
| Framework | **Expo** (React Native) | Fastest path to iOS + Android |
| Styling | **NativeWind** (Tailwind) | Familiar, fast iteration |
| State | **Zustand** | Same as desktop, can share types |
| WebSocket | **socket.io-client** | Handles reconnection gracefully |
| Animations | **Reanimated 3** | 60fps native animations |
| Navigation | **Expo Router** | File-based routing |

### Screen Architecture

```
app/
├── (tabs)/
│   ├── _layout.tsx           # Tab bar with fantasy styling
│   ├── spire.tsx             # Main tower view (home)
│   ├── feed.tsx              # Activity feed (BitBook equivalent)
│   ├── grimoire.tsx          # Settings, connections, docs
│   └── quests.tsx            # Quest log
├── agent/
│   └── [id].tsx              # Agent detail sheet
├── summon.tsx                # Spawn new agent modal
└── connect.tsx               # Connection setup wizard
```

---

## The Spire: Main Interface

### Visual Design

The spire is a vertical tower rendered as a scrollable list. Each "floor" is an agent chamber.

```
╔═══════════════════════════════════╗
║  ☁️ ═══════ ARCANE SPIRE ═══════ ☁️ ║
╠═══════════════════════════════════╣
║  ┌─────────────────────────────┐  ║
║  │ 🌟 FLOOR 5 - ASTRAL PEAK    │  ║  ← Newest/highest
║  │ ┌─────┐                     │  ║
║  │ │ 🧙‍♂️  │ Arcanum            │  ║
║  │ │     │ ⚡ CHANNELING       │  ║
║  │ └─────┘ ████████░░ 80%     │  ║
║  │ "Refactoring auth module..." │  ║
║  └─────────────────────────────┘  ║
╠───────────────────────────────────╣
║  ┌─────────────────────────────┐  ║
║  │ 🏛️ FLOOR 4 - SCHOLAR HALL   │  ║
║  │ ┌─────┐                     │  ║
║  │ │ 📐  │ Blueprint           │  ║
║  │ │     │ 💤 DORMANT (5m)    │  ║  ← Needs attention
║  │ └─────┘                     │  ║
║  │ Tap to awaken...            │  ║
║  └─────────────────────────────┘  ║
╠───────────────────────────────────╣
║  ┌─────────────────────────────┐  ║
║  │ ⚗️ FLOOR 3 - ARTIFICER LAB  │  ║
║  │ ┌─────┐                     │  ║
║  │ │ 🛡️  │ Sentinel            │  ║
║  │ │     │ ❓ AWAITING         │  ║  ← Question pending
║  │ └─────┘                     │  ║
║  │ "Should I deploy to prod?"  │  ║
║  └─────────────────────────────┘  ║
╠───────────────────────────────────╣
║       ┌─────────────────┐         ║
║       │ ⊕ SUMMON AGENT  │         ║  ← Ground floor
║       └─────────────────┘         ║
╚═══════════════════════════════════╝
      [🏰]  [📜]  [📖]  [⚙️]
       Spire Feed  Quests Settings
```

### Interaction Patterns

| Gesture | Action |
|---------|--------|
| **Tap floor** | Expand inline OR slide up detail sheet |
| **Long press** | Quick actions menu (pause, dismiss, priority) |
| **Swipe left** | Reveal action buttons |
| **Swipe right** | Mark as reviewed / acknowledge |
| **Pull down** | Refresh connection status |
| **Scroll** | Navigate spire floors |

### Floor States & Visuals

| State | Visual Treatment | Sound |
|-------|-----------------|-------|
| `channeling` (working) | Glowing border, animated particles | Subtle magic hum |
| `dormant` (idle) | Dim, sleepy animation | None |
| `awaiting` (needs input) | Pulsing "?" icon, highlight | Gentle chime |
| `complete` | Golden glow, "!" icon | Triumphant flourish |
| `error` | Red tint, warning icon | Alert tone |
| `spawning` | Summoning circle animation | Arcane whoosh |

---

## Party Dock: At-a-Glance Status

A persistent mini-dashboard at the top of the Spire view showing all agents without scrolling.

```
┌─────────────────────────────────────┐
│ ┌───┐ ┌───┐ ┌───┐ ┌───┐ ┌───┐     │
│ │🧙‍♂️│ │📐│ │🛡️│ │⚗️│ │🎨│     │  ← Tap to jump
│ │ ⚡ │ │ 💤 │ │ ❓ │ │ ⚡ │ │ ✓ │     │  ← Status icon
│ │▓▓░│ │▓░░│ │▓▓▓│ │▓▓░│ │▓▓▓│     │  ← Mini context bar
│ └───┘ └───┘ └───┘ └───┘ └───┘     │
│      ↑ pulsing (needs attention)   │
└─────────────────────────────────────┘
```

### Party Dock Features

- **Always visible** at top of Spire screen
- **Horizontally scrollable** if many agents (5+ visible at once)
- **Mini status indicators**:
  - Agent portrait/icon
  - Status badge (⚡ working, 💤 idle, ❓ waiting, ✓ complete, ⚠️ error)
  - Thin context bar (mana remaining)
- **Tap to jump** directly to that agent's floor
- **Pulsing animation** for agents needing attention
- **Long-press** for quick actions menu (pause, kill, priority)

### Collapsed vs Expanded

```
┌─ COLLAPSED (default) ────────────────┐
│ [🧙‍♂️⚡] [📐💤] [🛡️❓] [⚗️⚡] [🎨✓]    │  ← Just icons
└──────────────────────────────────────┘

┌─ EXPANDED (pull down) ───────────────┐
│ ┌─────────────────────────────────┐  │
│ │ 🧙‍♂️ Arcanum      ⚡ CHANNELING   │  │
│ │ ██████████░░ 78% • 3/10 tests  │  │
│ └─────────────────────────────────┘  │
│ ┌─────────────────────────────────┐  │
│ │ 📐 Blueprint    💤 DORMANT 5m   │  │
│ │ ████░░░░░░░░ 32%               │  │
│ └─────────────────────────────────┘  │
│           ... more agents ...        │
│         [ Collapse ▲ ]               │
└──────────────────────────────────────┘
```

- **Pull down** on dock to expand to full party frames
- **Tap anywhere** or scroll spire to collapse back
- Shows all agents with full status in expanded mode

---

## Agent Chamber: Chain of Thought View

When you scroll to an agent's floor or tap to focus, the floor expands into an **immersive chamber view** showing the agent actively working with their thoughts visible.

```
┌─────────────────────────────────────────────┐
│ ═══ ARCANUM'S CHAMBER ═══                   │
│                                             │
│    ┌─────────────────────────────────┐     │
│    │ 💭 "Hmm, this auth bug looks    │     │
│    │ like a race condition. Let me   │     │
│    │ check the token refresh..."     │     │
│    └───────────────┬─────────────────┘     │
│                    │                        │
│         ┌──────────▼──────────┐            │
│         │                      │            │
│         │    🧙‍♂️ *walking*      │            │
│         │    ← → ← →          │            │  ← Agent sprite
│         │                      │            │     moving around
│         └──────────────────────┘            │
│    ┌─────────────────────────────────┐     │
│    │ 📚 Reading: src/auth/login.ts   │     │  ← Current action
│    │ ████████████░░░░ Line 142/300   │     │
│    └─────────────────────────────────┘     │
│                                             │
│ ─────────────────────────────────────────── │
│ Recent thoughts:                            │
│ • "Found the issue - missing await"         │
│ • "Testing fix now..."                      │
│ • "3/10 tests passing, investigating..."   │
│                                             │
│ ┌─────────────────────────────────────────┐ │
│ │ 💬 Redirect Arcanum...                  │ │
│ └─────────────────────────────────────────┘ │
└─────────────────────────────────────────────┘
```

### Chain of Thought Features

**Thought Bubbles**:
- Parse agent's `thinking` output (Claude's extended thinking, etc.)
- Show as comic-style speech/thought bubbles
- Bubbles float and fade, replaced by new thoughts
- Tap bubble to pin/expand full thought

**Agent Animation**:
- Agent sprite walks around their chamber
- Different animations based on activity:
  - 📚 Reading → Walking to bookshelf, examining scroll
  - ✍️ Writing → At desk, quill moving
  - 🧪 Testing → At cauldron, mixing potions
  - 🔍 Researching → Looking through telescope/crystal ball
  - 🤔 Thinking → Pacing, hand on chin
  - ❓ Waiting → Standing still, looking at player

**Thought History**:
- Recent thoughts shown below the chamber
- Scroll to see full chain of thought
- Helps understand agent's reasoning

**Steering Input**:
- Input field always visible at bottom
- Type to redirect: "Actually, focus on the API first"
- Agent responds and adjusts course

### Entering Chamber View

Three ways to enter:
1. **Tap** agent floor in spire → Expand inline
2. **Tap** agent in party dock → Jump & expand
3. **Long-press** floor → Full-screen chamber

### Exit Chamber View

- **Scroll up/down** past the chamber
- **Tap** outside the chamber area
- **Swipe down** on chamber header

---

## Agent Detail View

When tapping a floor, a bottom sheet slides up (60-80% of screen):

```
┌─────────────────────────────────────┐
│ ═══ ARCANUM - Archmage ═══         │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │  🧙‍♂️ Level 12 Mage              │ │
│ │  Claude Opus • claude/main      │ │
│ │  ████████████░░ 78% context     │ │
│ └─────────────────────────────────┘ │
│                                     │
│ ┌─ SCRYING POOL (output) ─────────┐ │
│ │                                 │ │
│ │ > Reading src/auth/login.ts... │ │
│ │ > Found 3 issues               │ │
│ │ > Applying fixes...            │ │
│ │ > ✓ Fixed null check on L42    │ │
│ │ > ✓ Added error boundary       │ │
│ │ > Testing changes...           │ │
│ │ > Running 12 tests...          │ │
│ │ > ████████░░░░ 8/12 passing    │ │
│ │                                 │ │
│ └─────────────────────────────────┘ │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ 💬 Speak to Arcanum...         │ │
│ └─────────────────────────────────┘ │
│                                     │
│ [📜 Quest] [📦 Loot] [🌳 Talents]  │
└─────────────────────────────────────┘
```

### Quick Replies

For common responses, show tappable quick-reply bubbles:

```
┌─────────────────────────────────┐
│ "Should I proceed with deploy?" │
├─────────────────────────────────┤
│  [✅ Yes, proceed]              │
│  [⏸️ Wait, let me check]        │
│  [❌ No, roll back]             │
│  [💬 Custom reply...]           │
└─────────────────────────────────┘
```

---

## Activity Feed (The Chronicle)

A reverse-chronological feed of all agent activity, like Tiny Tower's BitBook:

```
┌─────────────────────────────────────┐
│ ═══ THE CHRONICLE ═══               │
├─────────────────────────────────────┤
│ 🧙‍♂️ Arcanum completed a quest!      │
│ "Fix authentication bugs"           │
│ → 3 files modified                  │
│ 2 minutes ago              [Review] │
├─────────────────────────────────────┤
│ 📐 Blueprint has a question         │
│ "Which database should I use?"      │
│ 5 minutes ago              [Answer] │
├─────────────────────────────────────┤
│ 🛡️ Sentinel reached Level 8!        │
│ +1 Talent Point available           │
│ 12 minutes ago             [Assign] │
├─────────────────────────────────────┤
│ ⚗️ Cogsworth began channeling       │
│ "Building Docker containers..."     │
│ 15 minutes ago              [Watch] │
└─────────────────────────────────────┘
```

---

## Summoning (Agent Spawn)

A mystical full-screen interface for spawning new agents with rich class selection.

### Agent Classes

Each class has unique art, color theme, and specialization:

| Class | Provider | Color | Icon | Specialty |
|-------|----------|-------|------|-----------|
| **Mage** | Claude | Purple | 🧙‍♂️ | General coding, complex reasoning |
| **Architect** | Claude Opus | Royal Purple | 📐 | System design, architecture |
| **Engineer** | OpenAI Codex | Green | ⚗️ | Implementation, building |
| **Scout** | Claude | Teal | 🔍 | Research, exploration, discovery |
| **Guardian** | Codex | Silver/Blue | 🛡️ | Code review, security, testing |
| **Artisan** | Gemini | Cyan | 🎨 | UI/UX, design, visual work |

### Summoning Flow

**Step 1: Class Selection (Carousel)**
```
┌─────────────────────────────────────────────┐
│ ═══ SUMMON NEW AGENT ═══                    │
│                                             │
│           Choose your champion              │
│                                             │
│    ┌─────┐   ┌───────────┐   ┌─────┐      │
│    │ 📐  │   │    🧙‍♂️     │   │ ⚗️  │      │
│    │     │   │           │   │     │      │
│    │ dim │   │  ✨ BIG ✨ │   │ dim │      │
│    └─────┘   │           │   └─────┘      │
│              │   MAGE    │                 │
│   ← swipe    └───────────┘    swipe →     │
│                                             │
│ ┌─────────────────────────────────────────┐ │
│ │ 🟣 MAGE                     Claude Opus │ │
│ │                                         │ │
│ │ Master of arcane code arts. Excels at   │ │
│ │ complex reasoning, refactoring, and     │ │
│ │ solving difficult bugs with elegance.   │ │
│ │                                         │ │
│ │ ✦ Complex problem solving              │ │
│ │ ✦ Architecture decisions               │ │
│ │ ✦ Code refactoring                     │ │
│ └─────────────────────────────────────────┘ │
│                                             │
│              [ Select Mage ]                │
└─────────────────────────────────────────────┘
```

- **Swipe horizontally** through class cards
- **Large centered card** for selected class
- **Dimmed cards** on sides preview other classes
- **Class details** show provider, specialty, strengths

**Step 2: Configuration**
```
┌─────────────────────────────────────────────┐
│ ═══ CONFIGURE YOUR MAGE ═══                 │
│                                             │
│ ┌───────────────────────────────────────┐   │
│ │ Name: (auto-generated or custom)      │   │
│ │ ┌─────────────────────────────────┐   │   │
│ │ │ Arcanum                    [🎲] │   │   │
│ │ └─────────────────────────────────┘   │   │
│ └───────────────────────────────────────┘   │
│                                             │
│ ┌───────────────────────────────────────┐   │
│ │ Working Directory:                    │   │
│ │ ┌─────────────────────────────────┐   │   │
│ │ │ ~/projects/my-app          [📁] │   │   │
│ │ └─────────────────────────────────┘   │   │
│ │                                       │   │
│ │ Recent:                               │   │
│ │ • ~/projects/api                      │   │
│ │ • ~/projects/web-app                  │   │
│ │ • ~/dotfiles                          │   │
│ └───────────────────────────────────────┘   │
│                                             │
│ ┌───────────────────────────────────────┐   │
│ │ Initial Quest (optional):             │   │
│ │ ┌─────────────────────────────────┐   │   │
│ │ │ Fix the login redirect bug      │   │   │
│ │ │ that happens after OAuth...     │   │   │
│ │ └─────────────────────────────────┘   │   │
│ └───────────────────────────────────────┘   │
│                                             │
│ ┌─────────────────────────────────────────┐ │
│ │         🌟 BEGIN SUMMONING 🌟           │ │
│ └─────────────────────────────────────────┘ │
└─────────────────────────────────────────────┘
```

**Step 3: Summoning Animation**
```
┌─────────────────────────────────────────────┐
│                                             │
│                                             │
│            ╭─────────────────╮              │
│           ╱  ✨ ✨ ✨ ✨ ✨  ╲             │
│          │    *SWIRLING*     │              │
│          │                   │              │
│          │    🧙‍♂️             │              │ ← Portal effect
│          │    materializing  │              │
│          │                   │              │
│           ╲  ✨ ✨ ✨ ✨ ✨  ╱             │
│            ╰─────────────────╯              │
│                                             │
│        Summoning Arcanum the Mage...        │
│                                             │
│              ████████░░░░ 67%               │
│                                             │
└─────────────────────────────────────────────┘
```

- Full-screen summoning portal animation
- Agent materializes from the portal
- Progress bar for spawn process
- Auto-navigates to new agent's floor when complete

---

## Connection Setup

First-time setup wizard:

### Step 1: Install Daemon

```
┌─────────────────────────────────────┐
│ ═══ CONNECT YOUR FORGE ═══          │
│                                     │
│ To command your agents remotely,    │
│ you need the AgentForge daemon      │
│ running on your dev machine.        │
│                                     │
│ On your computer, run:              │
│ ┌─────────────────────────────────┐ │
│ │ npx agentforge daemon            │ │
│ │                          [Copy] │ │
│ └─────────────────────────────────┘ │
│                                     │
│ This will:                          │
│ • Start the agent server            │
│ • Generate a connection code        │
│ • Set up secure tunneling           │
│                                     │
│            [Next →]                 │
└─────────────────────────────────────┘
```

### Step 2: Scan or Enter Code

```
┌─────────────────────────────────────┐
│ ═══ LINK YOUR SPIRE ═══             │
│                                     │
│ Scan the QR code shown in your      │
│ terminal, or enter the code:        │
│                                     │
│        ┌───────────────┐            │
│        │ ▓▓▓▓▓▓▓▓▓▓▓▓▓ │            │
│        │ ▓▓▓▓▓▓▓▓▓▓▓▓▓ │            │
│        │ ▓▓▓▓▓▓▓▓▓▓▓▓▓ │            │
│        │ ▓▓▓▓▓▓▓▓▓▓▓▓▓ │            │
│        └───────────────┘            │
│          [📷 Scan QR]               │
│                                     │
│ Or enter manually:                  │
│ ┌─────────────────────────────────┐ │
│ │ spire-xxxx-yyyy-zzzz            │ │
│ └─────────────────────────────────┘ │
│                                     │
│            [Connect →]              │
└─────────────────────────────────────┘
```

### Step 3: Connected!

```
┌─────────────────────────────────────┐
│                                     │
│            🏰 ✨ 🏰                 │
│                                     │
│     YOUR SPIRE IS CONNECTED!        │
│                                     │
│ MacBook Pro "Tony's MBP"            │
│ 3 agents already running            │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │      Enter the Spire →          │ │
│ └─────────────────────────────────┘ │
│                                     │
└─────────────────────────────────────┘
```

---

## Notifications Strategy

### Push Notification Types

| Event | Priority | Sound | Action |
|-------|----------|-------|--------|
| Agent needs input | High | Chime | Open agent |
| Quest complete | Medium | Fanfare | Open review |
| Agent error | High | Alert | Open agent |
| Agent idle 5+ min | Low | None | Badge only |
| Level up | Low | None | Badge only |

### Smart Batching

Don't spam. Group notifications:
- "3 agents need your attention"
- "2 quests ready for review"

### Quiet Hours

Respect system quiet hours. Optionally set app-specific quiet hours.

---

## Offline & Background Behavior

### When App Backgrounded

- WebSocket stays connected for ~3 minutes (iOS limit)
- After disconnect, rely on push notifications
- On foreground, reconnect and sync state

### When Offline

- Show cached state with "Last updated X ago"
- Queue commands to send when reconnected
- Visual indicator of offline status

### Sync Strategy

On reconnect:
1. Fetch full agent list
2. Diff against local cache
3. Animate any state changes (quest completed while away!)
4. Show "While you were away..." summary if significant changes

---

## Data Models

### Shared with Desktop

We can share TypeScript types between desktop and mobile:

```typescript
// shared/types/agent.ts
export interface Agent {
  id: string;
  name: string;
  class: AgentClass;
  provider: AgentProvider;
  status: AgentStatus;
  // ...
}

export interface Quest {
  id: string;
  description: string;
  status: QuestStatus;
  // ...
}
```

### Mobile-Specific

```typescript
// mobile/types/connection.ts
export interface SpireConnection {
  id: string;
  name: string;           // "Tony's MacBook"
  url: string;            // wss://xxx.tailscale.net
  lastConnected: Date;
  agents: string[];       // Agent IDs
}

export interface NotificationPrefs {
  questComplete: boolean;
  needsInput: boolean;
  errors: boolean;
  levelUp: boolean;
  quietHoursStart?: string;
  quietHoursEnd?: string;
}
```

---

## Feature Parity with Desktop

Every feature from the desktop AgentForge isometric app has a mobile equivalent:

### Party Frames → Spire Floors

| Desktop | Mobile |
|---------|--------|
| WoW-style unit frames (top-left) | Vertical scrollable floor cards |
| Health/Mana bars | Context/Usage bars on each floor |
| Status icons | Status badges on floor cards |
| Click to select | Tap to expand/select |
| Hover tooltip | Long-press for details |

### Quest System → Quest Scrolls

**Quest Turn-In Flow (Mobile)**:
```
┌─────────────────────────────────────┐
│ 📜 QUEST COMPLETE                   │
│ ═══════════════════════════════════ │
│                                     │
│ 🧙 Arcanum has finished:            │
│ "Fix authentication bugs"           │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ 📁 Files Modified               │ │
│ │   • src/auth/login.ts           │ │
│ │   • src/auth/session.ts         │ │
│ │                                 │ │
│ │ 📁 Files Created                │ │
│ │   • src/auth/__tests__/login.ts │ │
│ └─────────────────────────────────┘ │
│                                     │
│ 💬 "Fixed token refresh and added   │
│    tests. Ready for review."        │
│                                     │
│ ┌───────────────┐ ┌───────────────┐ │
│ │  ✓ ACCEPT     │ │  ↩ REVISE     │ │
│ └───────────────┘ └───────────────┘ │
│                                     │
│        [View Diff] [Skip]           │
└─────────────────────────────────────┘
```

- Swipe right on notification to quick-accept
- Tap to open full review modal
- "Request Changes" opens reply input

### Loot Panel → Treasure Vault

**File Artifacts as Loot**:
```
┌─────────────────────────────────────┐
│ 💎 TREASURE VAULT                   │
│ ═══════════════════════════════════ │
│                                     │
│ Recent Artifacts:                   │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ 📜 login.ts              [Open] │ │
│ │ Modified by Arcanum • 2m ago    │ │
│ └─────────────────────────────────┘ │
│ ┌─────────────────────────────────┐ │
│ │ 📜 session.ts            [Open] │ │
│ │ Modified by Arcanum • 2m ago    │ │
│ └─────────────────────────────────┘ │
│ ┌─────────────────────────────────┐ │
│ │ ⚗️ login.test.ts         [Open] │ │
│ │ Created by Arcanum • 2m ago     │ │
│ └─────────────────────────────────┘ │
│                                     │
│ Tap to preview • Long-press to share│
└─────────────────────────────────────┘
```

- Tap file → Preview in-app (syntax highlighted)
- Long-press → Share sheet (AirDrop to Mac, copy path)
- Badge count on tab shows uncollected loot
- Files grouped by agent or by time

### Status Indicators

| Desktop Visual | Mobile Equivalent |
|----------------|-------------------|
| Animated sprite state | Floor card glow + icon |
| Particle effects | Subtle animations (Reanimated) |
| Progress bar (3/10 tests) | Progress bar on floor card |
| Attention wobble | Pulsing border + haptic |
| Idle timeout (💤) | Dimmed floor + "Dormant" badge |

**Mobile Status Display**:
```
┌─────────────────────────────────────┐
│ ⚡ CHANNELING                       │  ← Status badge
│ ████████████░░░░ 8/12 tests        │  ← Progress bar
│ Context: ██████████░░ 78%          │  ← Resource bars
│ "Running test suite..."             │  ← Activity text
└─────────────────────────────────────┘
```

### Activity Detection

Same pattern matching from desktop, displayed as:
- Activity icon on floor card (🔍 researching, ✍️ writing, 🧪 testing)
- Activity text below agent name
- Chronicle feed entries

### Progress Bars

Parsed from output, shown on floor cards:
- `3/10 tests` → Test progress bar
- `Building... 45%` → Build progress bar
- Files processed count
- Elapsed time for indeterminate tasks

### Attention System

| Trigger | Mobile Response |
|---------|-----------------|
| Waiting for input | Push notification + pulsing floor |
| Error state | Push notification + red floor tint |
| Idle timeout | Badge + dimmed floor |
| Quest complete | Push notification + golden glow |

### Talent Tree → Skill Grimoire

```
┌─────────────────────────────────────┐
│ 🌳 SKILL GRIMOIRE                   │
│ ═══════════════════════════════════ │
│ Arcanum • Level 12 • 3 points       │
│                                     │
│      ┌─────┐                        │
│      │ ⚡  │ Haste                  │
│      │ 2/3 │ Faster responses       │
│      └──┬──┘                        │
│    ┌────┴────┐                      │
│ ┌──┴──┐   ┌──┴──┐                   │
│ │ 📚  │   │ 🎯  │                   │
│ │ 0/3 │   │ 1/3 │                   │
│ │Lore │   │Focus│                   │
│ └─────┘   └─────┘                   │
│                                     │
│ Tap talent to learn • Pinch to zoom │
└─────────────────────────────────────┘
```

- Simplified tree view (vertical scroll)
- Tap to allocate points
- Long-press for talent description

### Session Persistence

- Auto-save agent state locally
- Sync with daemon on reconnect
- "Continue where you left off" on app launch

### Project Zones → Realms

Group agents by project:
```
┌─────────────────────────────────────┐
│ Filter by Realm:                    │
│ ┌─────────┐ ┌─────────┐ ┌────────┐ │
│ │🏰 All   │ │🌲 API   │ │⚔️ Web  │ │
│ └─────────┘ └─────────┘ └────────┘ │
└─────────────────────────────────────┘
```

- Horizontal scroll of realm filters
- Tap to filter spire view
- Create/edit realms in Grimoire (settings)

### Control Groups → Favorites

- Star agents to pin to top
- Quick-access from Chronicle
- No keyboard shortcuts (mobile), but swipe gestures

### Sound System

Same sound events, mobile-optimized:
- Haptic feedback accompanies sounds
- Respects iOS silent mode
- Per-category volume in Grimoire

### Toast Notifications → Mystical Alerts

In-app toasts styled as floating scrolls:
```
┌─────────────────────────────────┐
│ 📜 Arcanum completed a quest!   │
│    Tap to review                │
└─────────────────────────────────┘
```

---

## File Structure

```
arcane-spire/
├── app/                          # Expo Router screens
│   ├── (tabs)/
│   │   ├── _layout.tsx
│   │   ├── spire.tsx            # Main tower view
│   │   ├── feed.tsx             # Activity chronicle
│   │   ├── quests.tsx           # Quest log
│   │   └── grimoire.tsx         # Settings
│   ├── agent/
│   │   └── [id].tsx             # Agent detail
│   ├── summon.tsx               # Spawn agent
│   ├── connect.tsx              # Connection wizard
│   └── _layout.tsx              # Root layout
├── components/
│   ├── spire/
│   │   ├── SpireView.tsx        # Scrollable tower
│   │   ├── FloorCard.tsx        # Single agent floor
│   │   ├── FloorAnimations.tsx  # Animated effects
│   │   └── SummonPortal.tsx     # Spawn button
│   ├── agent/
│   │   ├── AgentSheet.tsx       # Bottom sheet detail
│   │   ├── ScryingPool.tsx      # Terminal output
│   │   ├── QuickReplies.tsx     # Tap-to-respond
│   │   └── AgentStats.tsx       # Level, XP, etc.
│   ├── feed/
│   │   ├── ChronicleList.tsx    # Activity feed
│   │   └── ChronicleEntry.tsx   # Single entry
│   └── ui/
│       ├── FantasyButton.tsx
│       ├── FantasyCard.tsx
│       ├── FantasyInput.tsx
│       └── LoadingRune.tsx
├── services/
│   ├── spireConnection.ts       # WebSocket manager
│   ├── notifications.ts         # Push notification handler
│   └── storage.ts               # AsyncStorage wrapper
├── stores/
│   ├── agentStore.ts            # Zustand agent state
│   ├── connectionStore.ts       # Connection state
│   └── prefsStore.ts            # User preferences
├── hooks/
│   ├── useSpireConnection.ts    # WebSocket hook
│   ├── useAgentSync.ts          # Real-time sync
│   └── useNotifications.ts      # Push setup
├── constants/
│   ├── theme.ts                 # Fantasy color palette
│   ├── sounds.ts                # Sound effect refs
│   └── agentClasses.ts          # Class definitions
├── assets/
│   ├── sprites/                 # Pixel art agents
│   ├── ui/                      # Fantasy UI elements
│   ├── sounds/                  # Audio effects
│   └── fonts/                   # Fantasy typography
└── shared/                      # Shared with desktop
    └── types/
        ├── agent.ts
        └── quest.ts
```

---

## Implementation Phases

### Phase 1: Foundation (Week 1-2)

**Goal**: Basic working connection to desktop daemon

- [ ] Set up Expo project with TypeScript
- [ ] Create connection wizard UI
- [ ] Implement WebSocket service with reconnection
- [ ] Basic agent list display (no animations)
- [ ] Simple agent detail view
- [ ] Send input to agent, see output

**Deliverable**: Can connect to running AgentForge and send/receive messages

### Phase 2: Core UX (Week 3-4)

**Goal**: The spire comes alive

- [ ] Design and implement FloorCard component
- [ ] Spire vertical scroll view
- [ ] Agent detail bottom sheet
- [ ] Scrying pool (terminal output display)
- [ ] Quick reply bubbles
- [ ] Basic spawn flow

**Deliverable**: App feels like a real product, not a prototype

### Phase 3: Delight (Week 5-6)

**Goal**: Make it magical

- [ ] Pixel art sprites for each class
- [ ] Floor state animations (Reanimated)
- [ ] Sound effects integration
- [ ] Summoning animation
- [ ] Quest completion celebration
- [ ] Level up effects

**Deliverable**: App is genuinely delightful to use

### Phase 4: Robustness (Week 7-8)

**Goal**: Production-ready

- [ ] Push notifications (Expo Notifications)
- [ ] Offline mode and sync
- [ ] Background connection handling
- [ ] Error states and recovery
- [ ] Multiple spire connections
- [ ] Settings and preferences

**Deliverable**: Reliable for daily use

### Phase 5: Polish (Week 9-10)

**Goal**: Ship it

- [ ] App store assets (screenshots, descriptions)
- [ ] Onboarding flow refinement
- [ ] Performance optimization
- [ ] Accessibility pass
- [ ] Beta testing
- [ ] Launch prep

**Deliverable**: Ready for App Store / Play Store

---

## Open Questions

1. **Daemon distribution**: npm package? Homebrew? Docker?
2. **Tunneling default**: ngrok, Cloudflare, or Tailscale?
3. **Auth model**: How do we secure the connection? Token? OAuth?
4. **Multi-device**: Can two phones connect to same daemon?
5. **File browsing**: How much file system access from mobile?
6. **Pricing model**: Free with daemon? Subscription for cloud relay?

---

## Success Metrics

1. **Connection success rate** > 95% first-time setup
2. **Time to first agent** < 2 minutes from install
3. **Daily active usage** - Users check at least 3x/day
4. **Session length** - Average 30-90 seconds (quick check-ins)
5. **Task completion via mobile** > 30% of all tasks

---

## References

- [Tiny Tower - Wikipedia](https://en.wikipedia.org/wiki/Tiny_Tower)
- [Blink Shell - GitHub](https://github.com/blinksh/blink)
- [Termius](https://termius.com/)
- [tmux Persistent Sessions](https://www.linode.com/docs/guides/persistent-terminal-sessions-with-tmux/)
- [WebSocket React Native Best Practices](https://www.videosdk.live/developer-hub/websocket/websocket-react-native)
- [react-native-ssh-sftp](https://github.com/shaqian/react-native-ssh-sftp)
- [Expo Documentation](https://docs.expo.dev/)

---

*This document is the north star for the Arcane Spire mobile experience. Update as we learn and iterate.*
