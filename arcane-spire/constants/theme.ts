// Arcane Spire Fantasy Theme Constants

export const Colors = {
  // Primary palette
  arcane: {
    purple: '#8B5CF6',
    purpleLight: '#A78BFA',
    purpleDark: '#6D28D9',
  },
  fel: {
    green: '#22C55E',
    greenLight: '#4ADE80',
    greenDark: '#16A34A',
  },
  frost: {
    blue: '#3B82F6',
    blueLight: '#60A5FA',
    blueDark: '#2563EB',
  },
  holy: {
    gold: '#F59E0B',
    goldLight: '#FBBF24',
    goldDark: '#D97706',
  },
  fire: {
    orange: '#EF4444',
    orangeLight: '#F87171',
    orangeDark: '#DC2626',
  },
  shadow: {
    black: '#1A1A2E',
    darker: '#0F0F1A',
    lighter: '#252542',
  },
  parchment: {
    default: '#FEF3C7',
    dark: '#FDE68A',
  },
  stone: {
    default: '#6B7280',
    light: '#9CA3AF',
    dark: '#4B5563',
  },
  indigo: {
    deep: '#312E81',
  },

  // Semantic colors
  background: '#1A1A2E',
  backgroundSecondary: '#252542',
  text: '#FFFFFF',
  textSecondary: '#9CA3AF',
  textMuted: '#6B7280',
  border: '#4B5563',
  success: '#22C55E',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',
} as const;

// Agent class colors
export const AgentColors: Record<string, string> = {
  mage: Colors.arcane.purple,
  architect: Colors.arcane.purpleDark,
  engineer: Colors.fel.green,
  scout: '#14B8A6', // Teal
  guardian: Colors.frost.blue,
  artisan: '#06B6D4', // Cyan
};

// Status colors
export const StatusColors = {
  spawning: Colors.arcane.purple,
  channeling: Colors.fel.green,
  dormant: Colors.stone.default,
  awaiting: Colors.holy.gold,
  complete: Colors.holy.gold,
  error: Colors.fire.orange,
} as const;

// Activity colors
export const ActivityColors = {
  idle: Colors.stone.default,
  thinking: Colors.arcane.purple,
  researching: Colors.frost.blue,
  reading: Colors.frost.blueLight,
  writing: Colors.fel.green,
  testing: Colors.holy.gold,
  building: Colors.fel.greenDark,
  git: Colors.arcane.purpleLight,
  waiting: Colors.holy.goldLight,
  error: Colors.fire.orange,
} as const;

// Spacing scale
export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

// Border radius
export const BorderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  full: 9999,
} as const;

// Font sizes
export const FontSize = {
  xs: 10,
  sm: 12,
  md: 14,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
} as const;

// Animation durations (ms)
export const AnimationDuration = {
  fast: 150,
  normal: 300,
  slow: 500,
  verySlow: 1000,
} as const;

// Common shadows
export const Shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  glow: (color: string) => ({
    shadowColor: color,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 10,
  }),
} as const;
