/**
 * Agent Class Configuration
 *
 * Each class corresponds to a specific AI model/tool configuration.
 * This is where fantasy meets function - each class spawns a different
 * type of AI specialist.
 */

export interface AgentClassConfig {
  id: string;
  name: string;
  title: string;        // Fantasy title
  icon: string;
  description: string;
  color: string;        // Theme color

  // CLI Configuration
  cli: 'claude' | 'codex' | 'gemini';
  modelFlag?: string;   // e.g., '--model opus-4-5-20250601'
  extraArgs?: string[]; // Additional CLI arguments
  mcpServers?: string[]; // MCP servers to enable

  // Visual theme
  meshColor: string;    // 3D model color
  glowColor: string;    // Particle/glow effects
}

export const AGENT_CLASSES: AgentClassConfig[] = [
  {
    id: 'architect',
    name: 'Architect',
    title: 'Grand Architect',
    icon: '📐',
    description: 'Strategic planning & system design with Opus 4.5',
    color: '#a855f7',
    cli: 'claude',
    modelFlag: '--model opus-4-5-20250601',
    meshColor: '#7c3aed',
    glowColor: '#c084fc',
  },
  {
    id: 'mage',
    name: 'Mage',
    title: 'Code Mage',
    icon: '🧙',
    description: 'Implementation & problem-solving with Claude',
    color: '#3b82f6',
    cli: 'claude',
    // Uses default model (usually Sonnet)
    meshColor: '#2563eb',
    glowColor: '#60a5fa',
  },
  {
    id: 'guardian',
    name: 'Guardian',
    title: 'Code Guardian',
    icon: '🛡️',
    description: 'Code review & quality assurance with Codex',
    color: '#22c55e',
    cli: 'codex',
    // Codex will use its default model
    meshColor: '#16a34a',
    glowColor: '#4ade80',
  },
  {
    id: 'designer',
    name: 'Artisan',
    title: 'Design Artisan',
    icon: '🎨',
    description: 'UI/UX & visual design with Gemini',
    color: '#f59e0b',
    cli: 'gemini',  // Will use Gemini CLI
    meshColor: '#d97706',
    glowColor: '#fbbf24',
  },
  {
    id: 'scout',
    name: 'Scout',
    title: 'Swift Scout',
    icon: '🔍',
    description: 'Fast research & exploration with Haiku',
    color: '#06b6d4',
    cli: 'claude',
    modelFlag: '--model claude-haiku-4-20250514',
    meshColor: '#0891b2',
    glowColor: '#22d3ee',
  },
  {
    id: 'engineer',
    name: 'Engineer',
    title: 'Build Engineer',
    icon: '⚙️',
    description: 'Focused implementation with Sonnet',
    color: '#64748b',
    cli: 'claude',
    modelFlag: '--model claude-sonnet-4-20250514',
    meshColor: '#475569',
    glowColor: '#94a3b8',
  },
];

// Helper to get class by ID
export function getAgentClass(id: string): AgentClassConfig | undefined {
  return AGENT_CLASSES.find(c => c.id === id);
}

// Helper to get CLI command for a class
export function getCliCommand(classConfig: AgentClassConfig): string {
  const parts: string[] = [classConfig.cli];

  if (classConfig.modelFlag) {
    parts.push(classConfig.modelFlag);
  }

  if (classConfig.extraArgs) {
    parts.push(...classConfig.extraArgs);
  }

  return parts.join(' ');
}
