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

  // CLI Configuration - simple commands: claude, codex, gemini
  cli: 'claude' | 'codex' | 'gemini';
  cliDescription: string;  // What CLI is launched

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
    description: 'Strategic planning & system design specialist',
    color: '#a855f7',
    cli: 'claude',
    cliDescription: 'Claude Opus 4.5',
    meshColor: '#7c3aed',
    glowColor: '#c084fc',
  },
  {
    id: 'mage',
    name: 'Mage',
    title: 'Code Mage',
    icon: '🧙',
    description: 'Powerful, versatile problem-solver',
    color: '#3b82f6',
    cli: 'claude',
    cliDescription: 'Claude Opus 4.5',
    meshColor: '#2563eb',
    glowColor: '#60a5fa',
  },
  {
    id: 'guardian',
    name: 'Guardian',
    title: 'Code Guardian',
    icon: '🛡️',
    description: 'Code review & quality assurance',
    color: '#22c55e',
    cli: 'codex',
    cliDescription: 'OpenAI Codex',
    meshColor: '#16a34a',
    glowColor: '#4ade80',
  },
  {
    id: 'designer',
    name: 'Artisan',
    title: 'Design Artisan',
    icon: '🎨',
    description: 'UI/UX & visual design specialist',
    color: '#f59e0b',
    cli: 'gemini',
    cliDescription: 'Google Gemini',
    meshColor: '#d97706',
    glowColor: '#fbbf24',
  },
  {
    id: 'scout',
    name: 'Scout',
    title: 'Swift Scout',
    icon: '🔍',
    description: 'Fast research & exploration',
    color: '#06b6d4',
    cli: 'claude',
    cliDescription: 'Claude Opus 4.5',
    meshColor: '#0891b2',
    glowColor: '#22d3ee',
  },
  {
    id: 'engineer',
    name: 'Engineer',
    title: 'Build Engineer',
    icon: '⚙️',
    description: 'Focused implementation specialist',
    color: '#64748b',
    cli: 'claude',
    cliDescription: 'Claude Opus 4.5',
    meshColor: '#475569',
    glowColor: '#94a3b8',
  },
];

// Helper to get class by ID
export function getAgentClass(id: string): AgentClassConfig | undefined {
  return AGENT_CLASSES.find(c => c.id === id);
}

// Helper to get CLI command for a class (simple: claude, codex, or gemini)
export function getCliCommand(classConfig: AgentClassConfig): string {
  return classConfig.cli;
}
