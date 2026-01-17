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

- ✅ Run any shell command
- ✅ Use tab completion (if the CLI supports it)
- ✅ See ANSI colors and formatting
- ✅ Interrupt with Ctrl+C
- ✅ Use Claude's slash commands (`/help`, `/clear`, etc.)
- ✅ Use Codex's full feature set
- ✅ Chain commands, use pipes, do anything

### The Dialogue Box Metaphor

The `AgentTerminal` component presents terminal I/O as a dialogue:

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
│ Processing...                           │
│                                         │
├─────────────────────────────────────────┤
│ ❯ review the changes you just made_     │
└─────────────────────────────────────────┘
```

But this ISN'T a game dialogue system. It's literally:
- **Top section**: Terminal stdout/stderr
- **Input field**: Terminal stdin

When you type and press Enter, we do:

```typescript
ptyProcess.write(input + '\r');
```

That's it. Direct terminal input.

## Styling Real Output

The challenge is making real terminal output look good. Approaches:

### 1. Strip ANSI, Apply Custom Styles

```typescript
function stripAnsi(str: string): string {
  return str.replace(/\x1B\[[0-9;]*[a-zA-Z]/g, '');
}
```

Then apply CSS classes based on content patterns:
- Lines starting with `✓` → green
- Lines starting with `❌` → red
- Lines with timestamps → dimmed

### 2. Parse ANSI, Convert to HTML (Future)

Use a library like `ansi-to-html` to preserve colors:

```typescript
import AnsiToHtml from 'ansi-to-html';
const convert = new AnsiToHtml();
const html = convert.toHtml(ansiOutput);
```

### 3. Full Terminal Emulation (Future)

Use `xterm.js` for complete terminal rendering:

```typescript
import { Terminal } from 'xterm';
const term = new Terminal();
term.open(containerElement);
// Pipe PTY output directly to xterm
```

## Current Implementation

Right now we:

1. **Strip ANSI codes** for clean text display
2. **Parse simple patterns** (✓, ❌, timestamps) for coloring
3. **Stream line-by-line** to the UI

This works but loses some terminal richness. Future iterations could preserve more formatting.

## The Input Experience

When you select an agent and start typing:

1. Input field focuses automatically
2. You type your prompt/command
3. Press Enter
4. Input is sent via WebSocket to server
5. Server writes to that agent's PTY
6. PTY receives, CLI processes
7. Output streams back

### Keyboard Shortcuts in Terminal

The AgentTerminal captures keystrokes. Special handling:

| Key | Action |
|-----|--------|
| `Enter` | Send input to agent |
| `Escape` | Blur input field |
| `Ctrl+C` | (TODO) Send interrupt signal |
| `Up/Down` | (TODO) Command history |

## Why Not Use xterm.js Directly?

We could embed full `xterm.js` terminals for each agent. Reasons we didn't (yet):

1. **Aesthetic control** — We want the dialogue-box feel, not a terminal feel
2. **Simplicity** — Line-by-line is easier to style
3. **Performance** — Multiple xterm instances can be heavy

But xterm.js integration is a valid future path for users who want full terminal power.

## The Goal

When you interact with an agent, it should feel like:

> "I'm talking to a character in my game who happens to be a genius coder."

But technically, you're just using a terminal with a pretty face.
