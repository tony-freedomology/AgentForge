// Re-export from shared types for convenience
export { AGENT_CLASSES, CLASS_PROVIDER_MAP } from '../shared/types/agent';
export type { AgentClass, AgentClassInfo, AgentProvider } from '../shared/types/agent';

// Fantasy name generators for each class
const MAGE_NAMES = [
  'Arcanum', 'Mysterion', 'Vexlar', 'Zephyrus', 'Luminos',
  'Shadowmere', 'Crystalis', 'Runebinder', 'Astralus', 'Nethros',
];

const ARCHITECT_NAMES = [
  'Blueprint', 'Foundry', 'Pillar', 'Keystone', 'Archon',
  'Schematics', 'Framework', 'Monolith', 'Bastion', 'Citadel',
];

const ENGINEER_NAMES = [
  'Cogsworth', 'Gearbox', 'Steamwright', 'Forgeheart', 'Boltrick',
  'Piston', 'Crankshaft', 'Sparky', 'Machina', 'Tinkerbell',
];

const SCOUT_NAMES = [
  'Pathfinder', 'Tracker', 'Wanderer', 'Seeker', 'Compass',
  'Horizon', 'Trailblazer', 'Wayfarer', 'Ranger', 'Nomad',
];

const GUARDIAN_NAMES = [
  'Sentinel', 'Warden', 'Aegis', 'Bulwark', 'Protector',
  'Vigilant', 'Defender', 'Shieldbearer', 'Rampart', 'Fortress',
];

const ARTISAN_NAMES = [
  'Palette', 'Canvas', 'Brushstroke', 'Pigment', 'Mosaic',
  'Sculptor', 'Visionary', 'Chromatic', 'Prism', 'Aesthete',
];

const CLASS_NAMES: Record<string, string[]> = {
  mage: MAGE_NAMES,
  architect: ARCHITECT_NAMES,
  engineer: ENGINEER_NAMES,
  scout: SCOUT_NAMES,
  guardian: GUARDIAN_NAMES,
  artisan: ARTISAN_NAMES,
};

// Get a random name for a class
export function getRandomAgentName(agentClass: string): string {
  const names = CLASS_NAMES[agentClass] || MAGE_NAMES;
  return names[Math.floor(Math.random() * names.length)];
}

// Get all names for a class
export function getAgentNamesForClass(agentClass: string): string[] {
  return CLASS_NAMES[agentClass] || MAGE_NAMES;
}

// Floor names based on position (bottom to top)
export const FLOOR_NAMES = [
  'GROUND FLOOR - ENTRANCE HALL',
  'FLOOR 1 - APPRENTICE QUARTERS',
  'FLOOR 2 - CRAFTING CHAMBERS',
  'FLOOR 3 - ARTIFICER LAB',
  'FLOOR 4 - SCHOLAR HALL',
  'FLOOR 5 - ASTRAL PEAK',
  'FLOOR 6 - ARCHMAGE SANCTUM',
  'FLOOR 7 - CELESTIAL SPIRE',
  'FLOOR 8 - ETHEREAL HEIGHTS',
  'FLOOR 9 - INFINITE TOWER',
];

// Get floor name by index
export function getFloorName(index: number): string {
  if (index < FLOOR_NAMES.length) {
    return FLOOR_NAMES[index];
  }
  return `FLOOR ${index} - BEYOND THE VEIL`;
}
