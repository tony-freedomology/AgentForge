# The Terminal Experience

## Core Truth

**AgentForge IS a terminal.** Not a terminal emulator. Not a simulation. A real, functional terminal—just wearing a costume.

Every agent you spawn is a real PTY (pseudo-terminal) session. When you type, your keystrokes go to a real shell. When you see output, it's streaming from a real process. If you spawned a Claude agent, you're literally running the `claude` CLI.

## How It Works

### The PTY Layer

We use `node-pty` to create proper pseudo-terminals:

```typescript
const ptyProcess = pty.spawn('bash', [], {
  name: 'xterm-256color',
  cols: 120,
  rows: 30,
  cwd: workingDir,
  env: { ...process.env, TERM: 'xterm-256color' },
});
```

This is the same technology that powers:
- VS Code's integrated terminal
- iTerm2
- Hyper
- Any modern terminal application

### What You Can Do

Because it's a real terminal, you can:

- Run any shell command
- Use tab completion (if the CLI supports it)
- See ANSI colors and formatting
- Interrupt with Ctrl+C
- Use Claude's slash commands (`/help`, `/clear`, etc.)
- Use Codex's full feature set
- Chain commands, use pipes, do anything

### The Dialogue Box Metaphor

The `AgentTerminal` component presents terminal I/O as an RPG dialogue:

```
┌─────────────────────────────────────────┐
│ 🧙 Arcanum                    [working] │
├─────────────────────────────────────────┤
│                                         │
│ [10:42:15] Starting task: fix the bug   │
│ [10:42:16] Analyzing codebase...        │
│ [10:42:18] Found issue in auth.ts:42    │
│ [10:42:20] Applying fix...              │
│ [10:42:22] ✓ Fixed successfully         │
│                                         │
│ Arcanum is channeling...                │
│                                         │
├─────────────────────────────────────────┤
│ ❯ Speak to Arcanum...                   │
└─────────────────────────────────────────┘
```

But this ISN'T a game dialogue system. It's literally:
- **Top section**: Terminal stdout/stderr (styled as speech bubbles)
- **Input field**: Terminal stdin
- **Typing indicator**: Agent is processing

When you type and press Enter, we do:

```typescript
ptyProcess.write(input + '\r');
```

That's it. Direct terminal input.

## Styling Real Output

### Message Type Detection

Output is parsed and styled based on content:

```typescript
const parseMessage = (line: string) => {
  const isUserInput = line.startsWith('[YOU]');
  const isInterrupt = line === '[INTERRUPTED]';
  const isError = line.includes('error') || line.includes('Error');
  const isSuccess = line.includes('success') || line.startsWith('✓');
  const isThinking = line.includes('thinking') || line.startsWith('🤔');
  const isSystem = line.startsWith('[') && !isUserInput;

  return { isUserInput, isInterrupt, isError, isSuccess, isThinking, isSystem };
};
```

### Visual Styling

| Message Type | Style |
|-------------|-------|
| User input | Right-aligned amber speech bubble |
| Agent output | Left-aligned with avatar |
| Error | Red background, red text |
| Success | Green background, green text |
| System | Dimmed, smaller text |
| Interrupt | Centered "Spell Interrupted" badge |

## Input Experience

When you select an agent and start typing:

1. Input field focuses automatically
2. You type your prompt/command
3. Press Enter
4. Input is sent via WebSocket to server
5. Server writes to that agent's PTY
6. PTY receives, CLI processes
7. Output streams back
8. UI updates in real-time

### Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `Enter` | Send input to agent |
| `Escape` | Blur input field |
| `Ctrl+C` | Send interrupt signal (SIGINT) |
| `Up Arrow` | Previous command from history |
| `Down Arrow` | Next command from history |

### Command History

The terminal maintains a history of sent commands (up to 50):

```typescript
// Navigate history with arrow keys
if (e.key === 'ArrowUp') {
  const newIndex = Math.min(historyIndex + 1, commandHistory.length - 1);
  setHistoryIndex(newIndex);
  setInput(commandHistory[newIndex]);
}
```

## Activity Detection

The terminal output is parsed to detect agent activity:

```typescript
const ACTIVITY_PATTERNS = {
  researching: [/search/i, /fetching/i, /looking up/i],
  reading: [/reading/i, /analyzing/i, /file:/i],
  writing: [/writing/i, /creating/i, /editing/i],
  testing: [/test/i, /running tests/i, /pytest/i, /jest/i],
  building: [/build/i, /compile/i, /bundle/i, /vite/i],
  git: [/git/i, /commit/i, /push/i, /pull/i],
  waiting: [/\?$/, /waiting/i, /input/i, /y\/n/i],
  error: [/error/i, /failed/i, /exception/i],
};
```

This feeds into the Party Frames status display and attention system.

## Progress Detection

Test and build progress is parsed from output:

```typescript
const PROGRESS_PATTERNS = {
  tests: /(\d+)\/(\d+)\s*tests?/i,           // "3/10 tests"
  testsPassing: /(\d+)\s+passing/i,          // "5 passing"
  buildPercent: /(\d+)%/,                     // "45%"
  filesProcessed: /(\d+)\/(\d+)\s*files?/i,  // "10/50 files"
};
```

When detected, a progress bar appears in the Party Frames.

## Quest Integration

When you send a command:

1. The input is echoed as `[YOU] command`
2. A quest is automatically started if agent is idle
3. Quest tracks the task description
4. Output is monitored for completion signals
5. When complete, quest becomes "pending_review"

## The Goal

When you interact with an agent, it should feel like:

> "I'm talking to a character in my game who happens to be a genius coder."

But technically, you're just using a terminal with a pretty face.

## Future Enhancements

- [ ] Full ANSI color preservation (ansi-to-html)
- [ ] xterm.js integration for power users
- [ ] Split pane for multiple agents
- [ ] Output search/filter
- [ ] Export conversation history
