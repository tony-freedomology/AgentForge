/**
 * AgentForge Backend Server
 *
 * Manages real AI CLI processes (Claude, Codex, Gemini) and streams
 * their output to the frontend via WebSocket.
 */

import { WebSocketServer, WebSocket } from 'ws';
import * as pty from 'node-pty';
import { spawn } from 'child_process';
import * as path from 'path';
import * as fs from 'fs';
import * as os from 'os';

const PORT = 3001;

// Agent class configurations (mirrored from frontend)
interface AgentClassConfig {
  id: string;
  cli: 'claude' | 'codex' | 'gemini';
  modelFlag?: string;
  extraArgs?: string[];
}

const AGENT_CLASSES: Record<string, AgentClassConfig> = {
  architect: {
    id: 'architect',
    cli: 'claude',
    modelFlag: '--model opus-4-5-20250601',
  },
  mage: {
    id: 'mage',
    cli: 'claude',
  },
  guardian: {
    id: 'guardian',
    cli: 'codex',
  },
  designer: {
    id: 'designer',
    cli: 'gemini',
  },
  scout: {
    id: 'scout',
    cli: 'claude',
    modelFlag: '--model claude-haiku-4-20250514',
  },
  engineer: {
    id: 'engineer',
    cli: 'claude',
    modelFlag: '--model claude-sonnet-4-20250514',
  },
};

// Types
interface AgentProcess {
  id: string;
  name: string;
  classId: string;
  pty: pty.IPty;
  workingDir: string;
  status: 'idle' | 'working' | 'waiting';
  gitBranch?: string;
  gitStatus?: string;
  createdAt: Date;
}

interface GitInfo {
  branch: string;
  status: string;
  recentCommits: string[];
}

// Active agent processes
const agents = new Map<string, AgentProcess>();

// Connected WebSocket clients
const clients = new Set<WebSocket>();

// Broadcast message to all connected clients
function broadcast(message: object) {
  const data = JSON.stringify(message);
  clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(data);
    }
  });
}

// Get git info for a directory
async function getGitInfo(dir: string): Promise<GitInfo | null> {
  try {
    const execPromise = (cmd: string): Promise<string> => {
      return new Promise((resolve, reject) => {
        const proc = spawn('sh', ['-c', cmd], { cwd: dir });
        let stdout = '';
        let stderr = '';
        proc.stdout.on('data', (data) => stdout += data);
        proc.stderr.on('data', (data) => stderr += data);
        proc.on('close', (code) => {
          if (code === 0) resolve(stdout.trim());
          else reject(new Error(stderr));
        });
      });
    };

    const branch = await execPromise('git rev-parse --abbrev-ref HEAD');
    const status = await execPromise('git status --short');
    const commits = await execPromise('git log --oneline -5');

    return {
      branch,
      status: status || 'clean',
      recentCommits: commits.split('\n').filter(Boolean),
    };
  } catch {
    return null;
  }
}

// Spawn a new AI agent with the specified class
async function spawnAgent(
  id: string,
  name: string,
  classId: string,
  workingDir: string,
  initialPrompt?: string
): Promise<AgentProcess> {
  // Expand ~ to home directory
  if (workingDir.startsWith('~')) {
    workingDir = path.join(os.homedir(), workingDir.slice(1));
  }

  // Validate directory exists
  if (!fs.existsSync(workingDir)) {
    throw new Error(`Directory does not exist: ${workingDir}`);
  }

  // Get class configuration
  const classConfig = AGENT_CLASSES[classId] || AGENT_CLASSES['mage'];

  console.log(`[AgentForge] Spawning ${classConfig.cli} agent "${name}" (${classId}) in ${workingDir}`);

  // Build the CLI command based on class
  let cliCommand = classConfig.cli;
  if (classConfig.modelFlag) {
    cliCommand += ` ${classConfig.modelFlag}`;
  }
  if (classConfig.extraArgs) {
    cliCommand += ` ${classConfig.extraArgs.join(' ')}`;
  }

  console.log(`[AgentForge] CLI command: ${cliCommand}`);

  // Spawn CLI in a PTY
  const shell = os.platform() === 'win32' ? 'powershell.exe' : 'bash';
  const ptyProcess = pty.spawn(shell, [], {
    name: 'xterm-256color',
    cols: 120,
    rows: 30,
    cwd: workingDir,
    env: {
      ...process.env,
      TERM: 'xterm-256color',
      COLORTERM: 'truecolor',
    },
  });

  const agent: AgentProcess = {
    id,
    name,
    classId,
    pty: ptyProcess,
    workingDir,
    status: 'idle',
    createdAt: new Date(),
  };

  // Get git info
  const gitInfo = await getGitInfo(workingDir);
  if (gitInfo) {
    agent.gitBranch = gitInfo.branch;
    agent.gitStatus = gitInfo.status;
  }

  // Handle PTY output
  ptyProcess.onData((data) => {
    broadcast({
      type: 'agent:output',
      agentId: id,
      data,
    });

    // Simple heuristics to detect status
    if (data.includes('Thinking') || data.includes('Working') || data.includes('⠋') || data.includes('⠙')) {
      agent.status = 'working';
      broadcast({ type: 'agent:status', agentId: id, status: 'working' });
    } else if (data.includes('?') || data.includes('[Y/n]') || data.includes('(y/n)')) {
      agent.status = 'waiting';
      broadcast({ type: 'agent:status', agentId: id, status: 'waiting' });
    } else if (data.includes('❯') || data.includes('>')) {
      agent.status = 'idle';
      broadcast({ type: 'agent:status', agentId: id, status: 'idle' });
    }
  });

  ptyProcess.onExit(({ exitCode }) => {
    console.log(`[AgentForge] Agent "${name}" exited with code ${exitCode}`);
    agents.delete(id);
    broadcast({
      type: 'agent:exit',
      agentId: id,
      exitCode,
    });
  });

  agents.set(id, agent);

  // Start the appropriate CLI after a brief delay to let shell initialize
  setTimeout(() => {
    ptyProcess.write(`${cliCommand}\r`);

    // If there's an initial prompt, send it after CLI starts
    if (initialPrompt) {
      setTimeout(() => {
        ptyProcess.write(initialPrompt + '\r');
      }, 2000);
    }
  }, 500);

  return agent;
}

// Send input to an agent
function sendInput(agentId: string, input: string) {
  const agent = agents.get(agentId);
  if (!agent) {
    throw new Error(`Agent not found: ${agentId}`);
  }

  console.log(`[AgentForge] Sending to "${agent.name}": ${input.substring(0, 50)}...`);
  agent.pty.write(input + '\r');
  agent.status = 'working';
  broadcast({ type: 'agent:status', agentId, status: 'working' });
}

// Kill an agent
function killAgent(agentId: string) {
  const agent = agents.get(agentId);
  if (!agent) {
    throw new Error(`Agent not found: ${agentId}`);
  }

  console.log(`[AgentForge] Killing agent "${agent.name}"`);
  agent.pty.kill();
  agents.delete(agentId);
}

// Resize agent terminal
function resizeAgent(agentId: string, cols: number, rows: number) {
  const agent = agents.get(agentId);
  if (agent) {
    agent.pty.resize(cols, rows);
  }
}

// Get all agents state
function getAgentsState() {
  return Array.from(agents.values()).map(agent => ({
    id: agent.id,
    name: agent.name,
    classId: agent.classId,
    workingDir: agent.workingDir,
    status: agent.status,
    gitBranch: agent.gitBranch,
    gitStatus: agent.gitStatus,
    createdAt: agent.createdAt,
  }));
}

// Create WebSocket server
const wss = new WebSocketServer({ port: PORT });

console.log(`
╔════════════════════════════════════════════════════════════╗
║                                                            ║
║   🏰 AgentForge Server                                     ║
║                                                            ║
║   WebSocket listening on ws://localhost:${PORT}              ║
║                                                            ║
║   Ready to command your AI legion!                         ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
`);

wss.on('connection', (ws) => {
  console.log('[AgentForge] Client connected');
  clients.add(ws);

  // Send current state to new client
  ws.send(JSON.stringify({
    type: 'init',
    agents: getAgentsState(),
  }));

  ws.on('message', async (message) => {
    try {
      const msg = JSON.parse(message.toString());
      console.log('[AgentForge] Received:', msg.type);

      switch (msg.type) {
        case 'agent:spawn': {
          const agent = await spawnAgent(
            msg.id,
            msg.name,
            msg.classId || 'mage',
            msg.workingDir,
            msg.initialPrompt
          );
          ws.send(JSON.stringify({
            type: 'agent:spawned',
            agent: {
              id: agent.id,
              name: agent.name,
              classId: agent.classId,
              workingDir: agent.workingDir,
              status: agent.status,
              gitBranch: agent.gitBranch,
              gitStatus: agent.gitStatus,
            },
          }));
          break;
        }

        case 'agent:input': {
          sendInput(msg.agentId, msg.input);
          break;
        }

        case 'agent:kill': {
          killAgent(msg.agentId);
          break;
        }

        case 'agent:resize': {
          resizeAgent(msg.agentId, msg.cols, msg.rows);
          break;
        }

        case 'agents:list': {
          ws.send(JSON.stringify({
            type: 'agents:list',
            agents: getAgentsState(),
          }));
          break;
        }

        default:
          console.log('[AgentForge] Unknown message type:', msg.type);
      }
    } catch (error) {
      console.error('[AgentForge] Error:', error);
      ws.send(JSON.stringify({
        type: 'error',
        message: error instanceof Error ? error.message : 'Unknown error',
      }));
    }
  });

  ws.on('close', () => {
    console.log('[AgentForge] Client disconnected');
    clients.delete(ws);
  });
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n[AgentForge] Shutting down...');
  agents.forEach((agent) => {
    agent.pty.kill();
  });
  wss.close();
  process.exit(0);
});
