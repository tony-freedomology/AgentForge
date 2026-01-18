/**
 * Z-Index hierarchy constants
 *
 * Use these constants to maintain consistent layering across the app.
 * Higher numbers appear on top of lower numbers.
 */

export const Z_INDEX = {
  // Base UI elements (party frames, resource bar, minimap)
  BASE_UI: 30,

  // Floating panels (loot button, quest notification)
  FLOATING_PANEL: 40,

  // Agent terminal / dialogue box
  AGENT_TERMINAL: 45,

  // Standard modals (quest log, talent tree, loot panel, etc.)
  MODAL: 50,

  // Command palette (quick access, should appear above modals)
  COMMAND_PALETTE: 60,

  // Welcome screen / onboarding (covers everything initially)
  WELCOME_SCREEN: 70,

  // Toast notifications (should appear above everything)
  TOAST: 80,
} as const;

// Tailwind class mappings
export const Z_CLASS = {
  BASE_UI: 'z-30',
  FLOATING_PANEL: 'z-40',
  AGENT_TERMINAL: 'z-[45]',
  MODAL: 'z-50',
  COMMAND_PALETTE: 'z-[60]',
  WELCOME_SCREEN: 'z-[70]',
  TOAST: 'z-[80]',
} as const;
