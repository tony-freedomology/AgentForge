/**
 * AgentForge Daemon Server
 *
 * The backend server that manages AI CLI processes (Claude, Codex, Gemini)
 * and streams their output to the Arcane Spire mobile app via Socket.IO.
 */

import { Server as SocketIOServer, Socket } from 'socket.io';
import { createServer } from 'http';
import * as pty from 'node-pty';
import { spawn, execSync } from 'child_process';
import * as path from 'path';
import * as fs from 'fs';
import * as os from 'os';
import * as crypto from 'crypto';
import QRCode from 'qrcode';

const PORT = parseInt(process.env.PORT || '3001', 10);
const HOST = process.env.HOST || '0.0.0.0';

// =============================================================================
// Types
// =============================================================================

type AgentStatus = 'spawning' | 'dormant' | 'channeling' | 'awaiting' | 'complete' | 'error';
type AgentActivity = 'idle' | 'thinking' | 'writing' | 'reading' | 'building' | 'testing' | 'searching';

interface AgentClassConfig {
  id: string;
  cli: string;
  model?: string;
  description: string;
}

interface AgentProcess {
  id: string;
  name: string;
  class: string;
  pty: pty.IPty;
  workingDirectory: string;
  status: AgentStatus;
  activity: AgentActivity;
  contextUsed: number;
  level: number;
  xp: number;
  gitBranch?: string;
  createdAt: Date;
  lastActivityAt: Date;
  outputBuffer: string;
  currentThought?: string;
  currentQuestion?: string;
  quickReplies?: string[];
}

interface Quest {
  id: string;
  agentId: string;
  title: string;
  description: string;
  status: 'active' | 'complete' | 'accepted' | 'revision';
  artifacts: string[];
  xpReward: number;
  startedAt: Date;
  completedAt?: Date;
}

interface MachineInfo {
  hostname: string;
  platform: string;
  username: string;
  workspaces: string[];
}

interface ConnectionCode {
  code: string;
  expiresAt: Date;
  url: string;
}

// =============================================================================
// Configuration
// =============================================================================

// Get CLI binary paths
const NPM_GLOBAL_BIN = path.join(os.homedir(), 'npmglobal', 'bin');
const LOCAL_BIN = '/usr/local/bin';

function findCLI(name: string): string {
  const paths = [
    path.join(NPM_GLOBAL_BIN, name),
    path.join(LOCAL_BIN, name),
    name, // fallback to PATH
  ];

  for (const p of paths) {
    try {
      if (fs.existsSync(p)) return p;
    } catch {}
  }
  return name;
}

const AGENT_CLASSES: Record<string, AgentClassConfig> = {
  mage: {
    id: 'mage',
    cli: findCLI('claude'),
    description: 'Claude - Powerful, versatile AI mage',
  },
  architect: {
    id: 'architect',
    cli: findCLI('claude'),
    model: 'opus',
    description: 'Claude Opus - System design specialist',
  },
  scout: {
    id: 'scout',
    cli: findCLI('claude'),
    model: 'haiku',
    description: 'Claude Haiku - Fast exploration agent',
  },
  engineer: {
    id: 'engineer',
    cli: findCLI('claude'),
    description: 'Claude - Code specialist',
  },
  guardian: {
    id: 'guardian',
    cli: findCLI('codex'),
    description: 'Codex - Security/review specialist',
  },
  artisan: {
    id: 'artisan',
    cli: findCLI('gemini'),
    description: 'Gemini - UI/UX specialist',
  },
};

// =============================================================================
// State
// =============================================================================

const agents = new Map<string, AgentProcess>();
const quests = new Map<string, Quest>();
let connectionCode: ConnectionCode | null = null;

// =============================================================================
// Activity Detection Patterns
// =============================================================================

const ACTIVITY_PATTERNS = {
  thinking: [
    /thinking/i,
    /analyzing/i,
    /considering/i,
    /processing/i,
    /\blet me\b/i,
    /\bi('ll| will)\b.*\b(check|look|analyze|think)\b/i,
  ],
  writing: [
    /writing/i,
    /creating/i,
    /generating/i,
    /edit(ing)?/i,
    /\bwrote\b/i,
    /\bcreated\b/i,
    /file.*created/i,
    /saved/i,
  ],
  reading: [
    /reading/i,
    /examining/i,
    /looking at/i,
    /reviewing/i,
    /\bread\b.*file/i,
    /contents of/i,
  ],
  building: [
    /building/i,
    /compiling/i,
    /bundling/i,
    /npm (run |)build/i,
    /yarn build/i,
    /tsc/i,
  ],
  testing: [
    /testing/i,
    /running tests/i,
    /npm test/i,
    /jest/i,
    /vitest/i,
    /pytest/i,
    /\btest(s)? (passed|failed)/i,
  ],
  searching: [
    /searching/i,
    /looking for/i,
    /finding/i,
    /grep/i,
    /ripgrep/i,
    /\bfind\b/i,
  ],
};

const STATUS_PATTERNS = {
  awaiting: [
    /\?$/,
    /\[Y\/n\]/i,
    /\(y\/n\)/i,
    /press enter/i,
    /waiting for/i,
    /your (response|input|answer)/i,
    /what would you like/i,
    /should i/i,
    /do you want/i,
  ],
  complete: [
    /task complete/i,
    /done!/i,
    /finished/i,
    /completed successfully/i,
    /all tests pass/i,
  ],
  error: [
    /error:/i,
    /failed/i,
    /exception/i,
    /fatal/i,
    /\berr\b/i,
    /permission denied/i,
  ],
};

const THOUGHT_PATTERNS = {
  thinking: [
    /<thinking>([\s\S]*?)<\/thinking>/,
    /💭\s*(.+)/,
    /\[thinking\]\s*(.+)/i,
  ],
  action: [
    /⚡\s*(.+)/,
    /\[action\]\s*(.+)/i,
    /executing:\s*(.+)/i,
    /running:\s*(.+)/i,
  ],
};

const QUESTION_PATTERNS = [
  /^(.+\?)\s*$/m,
  /should i (.+)\?/i,
  /do you want me to (.+)\?/i,
  /would you like (.+)\?/i,
  /which (.+) should/i,
];

const QUICK_REPLY_PATTERNS = [
  /\[([^\]]+)\]/g, // [option1] [option2]
  /\((\d+)\)\s*([^\n]+)/g, // (1) option1
  /^-\s+(.+)$/gm, // - option
];

// =============================================================================
// Helper Functions
// =============================================================================

function generateId(): string {
  return crypto.randomBytes(8).toString('hex');
}

function generateConnectionCode(): ConnectionCode {
  const code = `spire-${crypto.randomBytes(2).toString('hex')}-${crypto.randomBytes(2).toString('hex')}-${crypto.randomBytes(2).toString('hex')}`;
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

  // Determine URL
  let url = `ws://localhost:${PORT}`;

  // Check for ngrok tunnel
  try {
    const ngrokUrl = execSync('curl -s http://localhost:4040/api/tunnels 2>/dev/null | grep -o "https://[^\"]*"', { encoding: 'utf8' }).trim();
    if (ngrokUrl) {
      url = ngrokUrl.replace('https://', 'wss://');
    }
  } catch {}

  return { code, expiresAt, url };
}

function detectActivity(output: string): AgentActivity {
  for (const [activity, patterns] of Object.entries(ACTIVITY_PATTERNS)) {
    for (const pattern of patterns) {
      if (pattern.test(output)) {
        return activity as AgentActivity;
      }
    }
  }
  return 'idle';
}

function detectStatus(output: string, currentStatus: AgentStatus): AgentStatus {
  // Check for awaiting input
  for (const pattern of STATUS_PATTERNS.awaiting) {
    if (pattern.test(output)) return 'awaiting';
  }

  // Check for error
  for (const pattern of STATUS_PATTERNS.error) {
    if (pattern.test(output)) return 'error';
  }

  // Check for complete
  for (const pattern of STATUS_PATTERNS.complete) {
    if (pattern.test(output)) return 'complete';
  }

  // If we see activity, agent is working
  if (detectActivity(output) !== 'idle') {
    return 'channeling';
  }

  // Default: keep current status or go dormant
  if (currentStatus === 'spawning') return 'dormant';
  return currentStatus;
}

function extractThought(output: string): { type: 'thinking' | 'action'; content: string } | null {
  for (const pattern of THOUGHT_PATTERNS.thinking) {
    const match = output.match(pattern);
    if (match) {
      return { type: 'thinking', content: match[1].trim() };
    }
  }

  for (const pattern of THOUGHT_PATTERNS.action) {
    const match = output.match(pattern);
    if (match) {
      return { type: 'action', content: match[1].trim() };
    }
  }

  return null;
}

function extractQuestion(output: string): { question: string; quickReplies: string[] } | null {
  for (const pattern of QUESTION_PATTERNS) {
    const match = output.match(pattern);
    if (match) {
      const question = match[0].trim();
      const quickReplies: string[] = [];

      // Try to extract quick reply options
      for (const replyPattern of QUICK_REPLY_PATTERNS) {
        let replyMatch;
        while ((replyMatch = replyPattern.exec(output)) !== null) {
          quickReplies.push(replyMatch[1] || replyMatch[2]);
        }
      }

      // Default quick replies for y/n questions
      if (quickReplies.length === 0 && /\[Y\/n\]|\(y\/n\)/i.test(output)) {
        quickReplies.push('Yes', 'No');
      }

      return { question, quickReplies };
    }
  }
  return null;
}

function estimateContextUsage(outputBuffer: string): number {
  // Rough estimate: ~4 chars per token, 200k context window
  const estimatedTokens = outputBuffer.length / 4;
  const maxTokens = 200000;
  return Math.min(100, Math.round((estimatedTokens / maxTokens) * 100));
}

async function getGitBranch(dir: string): Promise<string | undefined> {
  try {
    const result = execSync('git rev-parse --abbrev-ref HEAD 2>/dev/null', {
      cwd: dir,
      encoding: 'utf8'
    });
    return result.trim();
  } catch {
    return undefined;
  }
}

function getMachineInfo(): MachineInfo {
  // Find common project directories
  const home = os.homedir();
  const workspaces: string[] = [];

  const commonDirs = ['projects', 'code', 'dev', 'workspace', 'repos', 'src'];
  for (const dir of commonDirs) {
    const fullPath = path.join(home, dir);
    if (fs.existsSync(fullPath)) {
      workspaces.push(fullPath);
    }
  }

  // Add home directory
  workspaces.push(home);

  return {
    hostname: os.hostname(),
    platform: os.platform(),
    username: os.userInfo().username,
    workspaces,
  };
}

function agentToJSON(agent: AgentProcess) {
  return {
    id: agent.id,
    name: agent.name,
    class: agent.class,
    workingDirectory: agent.workingDirectory,
    status: agent.status,
    activity: agent.activity,
    contextUsed: agent.contextUsed,
    level: agent.level,
    xp: agent.xp,
    gitBranch: agent.gitBranch,
    createdAt: agent.createdAt.toISOString(),
    lastActivityAt: agent.lastActivityAt.toISOString(),
    currentThought: agent.currentThought,
    currentQuestion: agent.currentQuestion,
    quickReplies: agent.quickReplies,
  };
}

// =============================================================================
// Agent Management
// =============================================================================

async function spawnAgent(
  socket: Socket,
  io: SocketIOServer,
  name: string,
  agentClass: string,
  workingDirectory: string,
  initialTask?: string
): Promise<AgentProcess> {
  const id = generateId();

  // Expand ~ to home directory
  if (workingDirectory.startsWith('~')) {
    workingDirectory = path.join(os.homedir(), workingDirectory.slice(1));
  }

  // Validate directory
  if (!fs.existsSync(workingDirectory)) {
    throw new Error(`Directory does not exist: ${workingDirectory}`);
  }

  const classConfig = AGENT_CLASSES[agentClass] || AGENT_CLASSES.mage;

  console.log(`[Daemon] Spawning ${classConfig.cli} agent "${name}" (${agentClass}) in ${workingDirectory}`);

  // Spawn PTY
  const shell = os.platform() === 'win32' ? 'powershell.exe' : process.env.SHELL || '/bin/bash';
  const ptyProcess = pty.spawn(shell, [], {
    name: 'xterm-256color',
    cols: 120,
    rows: 30,
    cwd: workingDirectory,
    env: {
      ...process.env,
      TERM: 'xterm-256color',
      COLORTERM: 'truecolor',
      PATH: `${NPM_GLOBAL_BIN}:${LOCAL_BIN}:${process.env.PATH}`,
    },
  });

  const gitBranch = await getGitBranch(workingDirectory);

  const agent: AgentProcess = {
    id,
    name,
    class: agentClass,
    pty: ptyProcess,
    workingDirectory,
    status: 'spawning',
    activity: 'idle',
    contextUsed: 0,
    level: 1,
    xp: 0,
    gitBranch,
    createdAt: new Date(),
    lastActivityAt: new Date(),
    outputBuffer: '',
  };

  // Handle PTY output
  ptyProcess.onData((data) => {
    agent.outputBuffer += data;
    agent.lastActivityAt = new Date();

    // Emit raw output
    io.emit('agent_output', {
      agentId: id,
      output: data,
      timestamp: Date.now(),
    });

    // Detect activity changes
    const newActivity = detectActivity(data);
    if (newActivity !== agent.activity) {
      agent.activity = newActivity;
      io.emit('agent_activity_change', {
        agentId: id,
        activity: newActivity,
      });
    }

    // Detect status changes
    const newStatus = detectStatus(data, agent.status);
    if (newStatus !== agent.status) {
      agent.status = newStatus;
      io.emit('agent_status_change', {
        agentId: id,
        status: newStatus,
        activity: agent.activity,
      });
    }

    // Extract thoughts
    const thought = extractThought(data);
    if (thought) {
      agent.currentThought = thought.content;
      io.emit('agent_thought', {
        agentId: id,
        thought: thought.content,
        type: thought.type,
        timestamp: Date.now(),
      });
    }

    // Extract questions
    const questionData = extractQuestion(data);
    if (questionData && agent.status === 'awaiting') {
      agent.currentQuestion = questionData.question;
      agent.quickReplies = questionData.quickReplies;
      io.emit('agent_question', {
        agentId: id,
        question: questionData.question,
        quickReplies: questionData.quickReplies,
      });
    }

    // Update context usage
    agent.contextUsed = estimateContextUsage(agent.outputBuffer);

    // Emit updates periodically (debounced by client)
    io.emit('agent_update', {
      agentId: id,
      updates: {
        contextUsed: agent.contextUsed,
        lastActivityAt: agent.lastActivityAt.toISOString(),
      },
    });
  });

  ptyProcess.onExit(({ exitCode }) => {
    console.log(`[Daemon] Agent "${name}" exited with code ${exitCode}`);
    agents.delete(id);
    io.emit('agent_killed', { agentId: id });
  });

  agents.set(id, agent);

  // Start the CLI after shell initializes
  setTimeout(() => {
    let cliCmd = classConfig.cli;

    // Add model flag if specified
    if (classConfig.model) {
      cliCmd += ` --model ${classConfig.model}`;
    }

    // Add dangerously-skip-permissions for claude
    if (classConfig.cli.includes('claude')) {
      cliCmd += ' --dangerously-skip-permissions';
    }

    console.log(`[Daemon] Starting CLI: ${cliCmd}`);
    ptyProcess.write(`${cliCmd}\r`);

    // Send initial task if provided
    if (initialTask) {
      setTimeout(() => {
        console.log(`[Daemon] Sending initial task to "${name}"`);
        ptyProcess.write(initialTask + '\r');

        // Create quest for initial task
        const quest: Quest = {
          id: generateId(),
          agentId: id,
          title: initialTask.substring(0, 50) + (initialTask.length > 50 ? '...' : ''),
          description: initialTask,
          status: 'active',
          artifacts: [],
          xpReward: 100,
          startedAt: new Date(),
        };
        quests.set(quest.id, quest);
        io.emit('quest_started', quest);
      }, 3000);
    }

    agent.status = 'dormant';
    io.emit('agent_status_change', { agentId: id, status: 'dormant' });
  }, 1000);

  return agent;
}

function sendInput(io: SocketIOServer, agentId: string, input: string) {
  const agent = agents.get(agentId);
  if (!agent) {
    throw new Error(`Agent not found: ${agentId}`);
  }

  console.log(`[Daemon] Sending to "${agent.name}": ${input.substring(0, 50)}...`);
  agent.pty.write(input + '\r');
  agent.status = 'channeling';
  agent.currentQuestion = undefined;
  agent.quickReplies = undefined;

  io.emit('agent_status_change', { agentId, status: 'channeling' });
}

function killAgent(io: SocketIOServer, agentId: string) {
  const agent = agents.get(agentId);
  if (!agent) {
    throw new Error(`Agent not found: ${agentId}`);
  }

  console.log(`[Daemon] Killing agent "${agent.name}"`);
  agent.pty.kill();
  agents.delete(agentId);
  io.emit('agent_killed', { agentId });
}

// =============================================================================
// Socket.IO Server
// =============================================================================

const httpServer = createServer();
const io = new SocketIOServer(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
  transports: ['websocket', 'polling'],
});

// Generate initial connection code
connectionCode = generateConnectionCode();

io.on('connection', (socket) => {
  console.log(`[Daemon] Client connected: ${socket.id}`);

  // Authentication
  socket.on('auth', (payload: { connectionCode?: string; token?: string }) => {
    // For now, accept all connections (can add token validation later)
    if (payload.connectionCode && connectionCode) {
      if (payload.connectionCode !== connectionCode.code || new Date() > connectionCode.expiresAt) {
        socket.emit('auth_error', 'Invalid or expired connection code');
        return;
      }
    }

    socket.emit('auth_success');
    console.log(`[Daemon] Client authenticated: ${socket.id}`);
  });

  // Heartbeat
  socket.on('heartbeat', () => {
    socket.emit('heartbeat_ack', { timestamp: Date.now() });
  });

  // Agent list
  socket.on('agent_list', () => {
    const agentList = Array.from(agents.values()).map(agentToJSON);
    socket.emit('agent_list', agentList);
  });

  // Spawn agent
  socket.on('agent_spawn', async (payload: {
    name: string;
    class: string;
    workingDirectory: string;
    initialTask?: string;
  }) => {
    try {
      const agent = await spawnAgent(
        socket,
        io,
        payload.name,
        payload.class,
        payload.workingDirectory,
        payload.initialTask
      );
      socket.emit('agent_spawned', agentToJSON(agent));
    } catch (error) {
      socket.emit('error', error instanceof Error ? error.message : 'Spawn failed');
    }
  });

  // Agent input
  socket.on('agent_input', (payload: { agentId: string; input: string }) => {
    try {
      sendInput(io, payload.agentId, payload.input);
    } catch (error) {
      socket.emit('error', error instanceof Error ? error.message : 'Input failed');
    }
  });

  // Agent answer (same as input, but clears question state)
  socket.on('agent_answer', (payload: { agentId: string; answer: string }) => {
    try {
      sendInput(io, payload.agentId, payload.answer);
    } catch (error) {
      socket.emit('error', error instanceof Error ? error.message : 'Answer failed');
    }
  });

  // Kill agent
  socket.on('agent_kill', (payload: { agentId: string }) => {
    try {
      killAgent(io, payload.agentId);
    } catch (error) {
      socket.emit('error', error instanceof Error ? error.message : 'Kill failed');
    }
  });

  // Quest review
  socket.on('quest_review', (payload: { questId: string; action: 'accept' | 'reject' | 'revise'; note?: string }) => {
    const quest = quests.get(payload.questId);
    if (!quest) {
      socket.emit('error', 'Quest not found');
      return;
    }

    if (payload.action === 'accept') {
      quest.status = 'accepted';
      io.emit('quest_accepted', quest);

      // Award XP to agent
      const agent = agents.get(quest.agentId);
      if (agent) {
        agent.xp += quest.xpReward;
        // Level up every 500 XP
        const newLevel = Math.floor(agent.xp / 500) + 1;
        if (newLevel > agent.level) {
          agent.level = newLevel;
          io.emit('agent_level_up', { agentId: agent.id, level: newLevel });
        }
        io.emit('agent_update', {
          agentId: agent.id,
          updates: { xp: agent.xp, level: agent.level },
        });
      }
    } else if (payload.action === 'revise') {
      quest.status = 'revision';
      io.emit('quest_revision', { quest, note: payload.note });

      // Send revision note to agent
      const agent = agents.get(quest.agentId);
      if (agent && payload.note) {
        sendInput(io, agent.id, `Revision requested: ${payload.note}`);
      }
    }
  });

  // Get machine info
  socket.on('machine_info', () => {
    socket.emit('machine_info', getMachineInfo());
  });

  // Get connection code
  socket.on('get_connection_code', () => {
    if (!connectionCode || new Date() > connectionCode.expiresAt) {
      connectionCode = generateConnectionCode();
    }
    socket.emit('connection_code', connectionCode);
  });

  socket.on('disconnect', () => {
    console.log(`[Daemon] Client disconnected: ${socket.id}`);
  });
});

// =============================================================================
// Startup
// =============================================================================

httpServer.listen(PORT, HOST, async () => {
  // Generate QR code for terminal display
  let qrText = '';
  try {
    qrText = await QRCode.toString(connectionCode!.code, { type: 'terminal', small: true });
  } catch {}

  console.log(`
╔════════════════════════════════════════════════════════════════════╗
║                                                                    ║
║   🏰 AgentForge Daemon                                             ║
║                                                                    ║
║   Socket.IO listening on http://${HOST}:${PORT}                        ║
║                                                                    ║
║   Connection Code: ${connectionCode!.code}                   ║
║   Expires: ${connectionCode!.expiresAt.toLocaleTimeString()}                                           ║
║                                                                    ║
║   Ready to command your AI legion!                                 ║
║                                                                    ║
╚════════════════════════════════════════════════════════════════════╝
`);

  if (qrText) {
    console.log('Scan this QR code with Arcane Spire:');
    console.log(qrText);
  }

  console.log('\nAvailable agent classes:');
  for (const [id, config] of Object.entries(AGENT_CLASSES)) {
    console.log(`  • ${id}: ${config.description}`);
  }
  console.log('');
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n[Daemon] Shutting down...');
  agents.forEach((agent) => {
    agent.pty.kill();
  });
  io.close();
  httpServer.close();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n[Daemon] Received SIGTERM, shutting down...');
  agents.forEach((agent) => {
    agent.pty.kill();
  });
  io.close();
  httpServer.close();
  process.exit(0);
});
