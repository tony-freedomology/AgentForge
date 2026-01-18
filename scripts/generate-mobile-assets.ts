/**
 * Arcane Spire Mobile Asset Generator
 * Uses Gemini API to generate 8-bit pixel art assets
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || 'AIzaSyAe-1Rd8h3HDySV3ByEC5GuFxR_fHBRavg';
const OUTPUT_DIR = path.join(__dirname, '..', 'mobile-assets');

// Color palette from spec
const COLORS = {
  arcanePurple: '#8B5CF6',
  felGreen: '#22C55E',
  frostBlue: '#3B82F6',
  holyGold: '#F59E0B',
  fireOrange: '#EF4444',
  shadowBlack: '#1A1A2E',
  parchment: '#FEF3C7',
  stoneGray: '#6B7280',
  deepIndigo: '#312E81',
};

// Base prompt template
const BASE_PROMPT = `Create an 8-bit pixel art asset for a fantasy mobile game.
Style: Tiny Tower meets World of Warcraft - vibrant, charming, pixel-perfect
Colors: Vibrant, saturated fantasy palette
Background: Transparent PNG
Must be: Pixel-perfect, no anti-aliasing, clear silhouette, retro 8-bit aesthetic`;

interface AssetSpec {
  name: string;
  width: number;
  height: number;
  description: string;
  category: string;
  subdir: string;
  frames?: number;
  priority: 'P0' | 'P1' | 'P2';
}

// P0 - Must Have for Demo
const P0_ASSETS: AssetSpec[] = [
  // Mage sprites (core states)
  { name: 'mage_idle', width: 64, height: 64, frames: 4, description: 'Purple-robed wizard standing with subtle breathing animation, holding a glowing staff, arcane purple theme (#8B5CF6)', category: 'sprites', subdir: 'sprites/mage', priority: 'P0' },
  { name: 'mage_working', width: 64, height: 64, frames: 6, description: 'Purple-robed wizard with hands raised casting a spell, magic particles swirling, staff glowing bright, arcane purple theme (#8B5CF6)', category: 'sprites', subdir: 'sprites/mage', priority: 'P0' },
  { name: 'mage_waiting', width: 64, height: 64, frames: 4, description: 'Purple-robed wizard looking around curiously, tapping foot, question mark floating above head, arcane purple theme (#8B5CF6)', category: 'sprites', subdir: 'sprites/mage', priority: 'P0' },

  // Floor frames
  { name: 'floor_frame_idle', width: 320, height: 120, description: 'Stone chamber frame for a wizard tower floor, neutral magical state with subtle rune engravings, fantasy RPG style', category: 'spire', subdir: 'spire', priority: 'P0' },
  { name: 'floor_frame_working', width: 320, height: 120, description: 'Stone chamber frame with glowing blue and purple runes, active magical energy flowing, mystical atmosphere', category: 'spire', subdir: 'spire', priority: 'P0' },

  // Tab bar
  { name: 'tab_bar_bg', width: 320, height: 80, description: 'Fantasy stone tab bar background with ornate carved edges, suitable for bottom navigation', category: 'ui', subdir: 'ui/tabs', priority: 'P0' },
  { name: 'tab_spire', width: 32, height: 32, description: 'Pixel art tower/spire icon, magical castle silhouette', category: 'icons', subdir: 'icons/action', priority: 'P0' },
  { name: 'tab_spire_active', width: 32, height: 32, description: 'Pixel art tower/spire icon glowing with magical energy, selected state', category: 'icons', subdir: 'icons/action', priority: 'P0' },
  { name: 'tab_chronicle', width: 32, height: 32, description: 'Pixel art scroll/book icon for activity feed', category: 'icons', subdir: 'icons/action', priority: 'P0' },
  { name: 'tab_chronicle_active', width: 32, height: 32, description: 'Pixel art scroll/book icon glowing, selected state', category: 'icons', subdir: 'icons/action', priority: 'P0' },
  { name: 'tab_quests', width: 32, height: 32, description: 'Pixel art quest log book icon with bookmark', category: 'icons', subdir: 'icons/action', priority: 'P0' },
  { name: 'tab_quests_active', width: 32, height: 32, description: 'Pixel art quest log book icon glowing, selected state', category: 'icons', subdir: 'icons/action', priority: 'P0' },
  { name: 'tab_grimoire', width: 32, height: 32, description: 'Pixel art settings gear/spellbook icon', category: 'icons', subdir: 'icons/action', priority: 'P0' },
  { name: 'tab_grimoire_active', width: 32, height: 32, description: 'Pixel art settings gear/spellbook icon glowing, selected state', category: 'icons', subdir: 'icons/action', priority: 'P0' },

  // Buttons
  { name: 'btn_primary', width: 160, height: 48, description: 'Gold/amber fantasy button with ornate frame, main action style, polished gem look', category: 'ui', subdir: 'ui/buttons', priority: 'P0' },
  { name: 'btn_secondary', width: 160, height: 48, description: 'Stone gray fantasy button with carved frame, secondary action style', category: 'ui', subdir: 'ui/buttons', priority: 'P0' },

  // Panel
  { name: 'panel_stone', width: 100, height: 100, description: 'Stone panel background texture with carved edges, suitable for 9-slice scaling, fantasy RPG style', category: 'ui', subdir: 'ui/panels', priority: 'P0' },

  // Status icons
  { name: 'icon_status_idle', width: 32, height: 32, description: 'Moon and zzz sleep symbol pixel art icon', category: 'icons', subdir: 'icons/status', priority: 'P0' },
  { name: 'icon_status_working', width: 32, height: 32, description: 'Sparkle/magic casting symbol pixel art icon, active state', category: 'icons', subdir: 'icons/status', priority: 'P0' },
  { name: 'icon_status_waiting', width: 32, height: 32, description: 'Question mark in thought bubble pixel art icon', category: 'icons', subdir: 'icons/status', priority: 'P0' },
  { name: 'icon_status_complete', width: 32, height: 32, description: 'Green checkmark with golden sparkles pixel art icon', category: 'icons', subdir: 'icons/status', priority: 'P0' },
  { name: 'icon_status_error', width: 32, height: 32, description: 'Red warning triangle with exclamation pixel art icon', category: 'icons', subdir: 'icons/status', priority: 'P0' },
  { name: 'icon_status_spawning', width: 32, height: 32, description: 'Purple portal swirl pixel art icon, summoning effect', category: 'icons', subdir: 'icons/status', priority: 'P0' },

  // App icon
  { name: 'app_icon', width: 512, height: 512, description: 'App icon featuring a magical spire/tower silhouette against a starry deep indigo sky, glowing purple and gold accents, 8-bit pixel art style', category: 'branding', subdir: 'branding', priority: 'P0' },

  // Background
  { name: 'bg_spire_day', width: 390, height: 844, description: 'Daytime fantasy sky background with fluffy clouds, subtle magical sparkles, gradient from light blue to soft purple, pixel art style', category: 'backgrounds', subdir: 'backgrounds', priority: 'P0' },
];

// P1 - Complete Experience
const P1_ASSETS: AssetSpec[] = [
  // Remaining mage states
  { name: 'mage_complete', width: 64, height: 64, frames: 6, description: 'Purple-robed wizard in triumphant pose with sparkles and raised staff celebrating, arcane purple theme', category: 'sprites', subdir: 'sprites/mage', priority: 'P1' },
  { name: 'mage_error', width: 64, height: 64, frames: 4, description: 'Purple-robed wizard slumped with worried expression, red error aura around them', category: 'sprites', subdir: 'sprites/mage', priority: 'P1' },
  { name: 'mage_sleeping', width: 64, height: 64, frames: 4, description: 'Purple-robed wizard sitting and sleeping with zzz bubbles floating up', category: 'sprites', subdir: 'sprites/mage', priority: 'P1' },
  { name: 'mage_spawning', width: 64, height: 64, frames: 8, description: 'Purple-robed wizard materializing from a magical portal, fade in effect with sparkles', category: 'sprites', subdir: 'sprites/mage', priority: 'P1' },
  { name: 'mage_portrait', width: 32, height: 32, description: 'Close-up face portrait of a purple-robed wizard with wise expression', category: 'sprites', subdir: 'sprites/mage', priority: 'P1' },

  // Architect sprites (all states)
  { name: 'architect_idle', width: 64, height: 64, frames: 4, description: 'Royal purple robed architect standing with blueprints/scroll, scholarly appearance', category: 'sprites', subdir: 'sprites/architect', priority: 'P1' },
  { name: 'architect_working', width: 64, height: 64, frames: 6, description: 'Royal purple architect drawing on floating magical blueprint with quill', category: 'sprites', subdir: 'sprites/architect', priority: 'P1' },
  { name: 'architect_waiting', width: 64, height: 64, frames: 4, description: 'Royal purple architect examining scroll with pondering expression', category: 'sprites', subdir: 'sprites/architect', priority: 'P1' },
  { name: 'architect_complete', width: 64, height: 64, frames: 6, description: 'Royal purple architect proudly presenting finished blueprint with sparkles', category: 'sprites', subdir: 'sprites/architect', priority: 'P1' },
  { name: 'architect_error', width: 64, height: 64, frames: 4, description: 'Royal purple architect crumpling paper with frustrated expression', category: 'sprites', subdir: 'sprites/architect', priority: 'P1' },
  { name: 'architect_sleeping', width: 64, height: 64, frames: 4, description: 'Royal purple architect dozed off on desk with blueprints', category: 'sprites', subdir: 'sprites/architect', priority: 'P1' },
  { name: 'architect_spawning', width: 64, height: 64, frames: 8, description: 'Royal purple architect materializing with scrolls swirling around', category: 'sprites', subdir: 'sprites/architect', priority: 'P1' },
  { name: 'architect_portrait', width: 32, height: 32, description: 'Close-up face portrait of royal purple architect with spectacles', category: 'sprites', subdir: 'sprites/architect', priority: 'P1' },

  // Engineer sprites (all states) - Green theme
  { name: 'engineer_idle', width: 64, height: 64, frames: 4, description: 'Green-clad engineer/artificer standing with wrench and gear, steampunk fantasy style', category: 'sprites', subdir: 'sprites/engineer', priority: 'P1' },
  { name: 'engineer_working', width: 64, height: 64, frames: 6, description: 'Green engineer hammering with sparks flying, building something mechanical', category: 'sprites', subdir: 'sprites/engineer', priority: 'P1' },
  { name: 'engineer_waiting', width: 64, height: 64, frames: 4, description: 'Green engineer scratching head while looking at schematic', category: 'sprites', subdir: 'sprites/engineer', priority: 'P1' },
  { name: 'engineer_complete', width: 64, height: 64, frames: 6, description: 'Green engineer holding up completed glowing device triumphantly', category: 'sprites', subdir: 'sprites/engineer', priority: 'P1' },
  { name: 'engineer_error', width: 64, height: 64, frames: 4, description: 'Green engineer with machine exploding, smoke puffing out', category: 'sprites', subdir: 'sprites/engineer', priority: 'P1' },
  { name: 'engineer_sleeping', width: 64, height: 64, frames: 4, description: 'Green engineer slumped over workbench sleeping', category: 'sprites', subdir: 'sprites/engineer', priority: 'P1' },
  { name: 'engineer_spawning', width: 64, height: 64, frames: 8, description: 'Green engineer assembling from mechanical parts with gears spinning', category: 'sprites', subdir: 'sprites/engineer', priority: 'P1' },
  { name: 'engineer_portrait', width: 32, height: 32, description: 'Close-up face portrait of green engineer with goggles', category: 'sprites', subdir: 'sprites/engineer', priority: 'P1' },

  // Scout sprites (all states) - Teal theme
  { name: 'scout_idle', width: 64, height: 64, frames: 4, description: 'Teal-hooded scout standing alert, looking around with keen eyes', category: 'sprites', subdir: 'sprites/scout', priority: 'P1' },
  { name: 'scout_working', width: 64, height: 64, frames: 6, description: 'Teal scout running and searching with magnifying glass', category: 'sprites', subdir: 'sprites/scout', priority: 'P1' },
  { name: 'scout_waiting', width: 64, height: 64, frames: 4, description: 'Teal scout crouched waiting for signal, alert stance', category: 'sprites', subdir: 'sprites/scout', priority: 'P1' },
  { name: 'scout_complete', width: 64, height: 64, frames: 6, description: 'Teal scout returning with found treasure/scroll, victorious', category: 'sprites', subdir: 'sprites/scout', priority: 'P1' },
  { name: 'scout_error', width: 64, height: 64, frames: 4, description: 'Teal scout lost and confused, holding map upside down', category: 'sprites', subdir: 'sprites/scout', priority: 'P1' },
  { name: 'scout_sleeping', width: 64, height: 64, frames: 4, description: 'Teal scout resting against tree, napping', category: 'sprites', subdir: 'sprites/scout', priority: 'P1' },
  { name: 'scout_spawning', width: 64, height: 64, frames: 8, description: 'Teal scout emerging from shadows with stealth effect', category: 'sprites', subdir: 'sprites/scout', priority: 'P1' },
  { name: 'scout_portrait', width: 32, height: 32, description: 'Close-up face portrait of teal-hooded scout with sharp eyes', category: 'sprites', subdir: 'sprites/scout', priority: 'P1' },

  // Guardian sprites (all states) - Silver/Blue theme
  { name: 'guardian_idle', width: 64, height: 64, frames: 4, description: 'Silver-armored guardian standing with shield raised, vigilant pose', category: 'sprites', subdir: 'sprites/guardian', priority: 'P1' },
  { name: 'guardian_working', width: 64, height: 64, frames: 6, description: 'Silver guardian in defensive stance scanning for threats', category: 'sprites', subdir: 'sprites/guardian', priority: 'P1' },
  { name: 'guardian_waiting', width: 64, height: 64, frames: 4, description: 'Silver guardian with shield lowered, questioning expression', category: 'sprites', subdir: 'sprites/guardian', priority: 'P1' },
  { name: 'guardian_complete', width: 64, height: 64, frames: 6, description: 'Silver guardian saluting, mission complete pose with sparkles', category: 'sprites', subdir: 'sprites/guardian', priority: 'P1' },
  { name: 'guardian_error', width: 64, height: 64, frames: 4, description: 'Silver guardian with cracked shield, kneeling in defeat', category: 'sprites', subdir: 'sprites/guardian', priority: 'P1' },
  { name: 'guardian_sleeping', width: 64, height: 64, frames: 4, description: 'Silver guardian sleeping while standing up on guard duty', category: 'sprites', subdir: 'sprites/guardian', priority: 'P1' },
  { name: 'guardian_spawning', width: 64, height: 64, frames: 8, description: 'Silver guardian materializing in armor piece by piece', category: 'sprites', subdir: 'sprites/guardian', priority: 'P1' },
  { name: 'guardian_portrait', width: 32, height: 32, description: 'Close-up face portrait of silver guardian with helmet', category: 'sprites', subdir: 'sprites/guardian', priority: 'P1' },

  // Artisan sprites (all states) - Blue/Cyan theme
  { name: 'artisan_idle', width: 64, height: 64, frames: 4, description: 'Cyan-robed artisan holding paintbrush and palette, creative pose', category: 'sprites', subdir: 'sprites/artisan', priority: 'P1' },
  { name: 'artisan_working', width: 64, height: 64, frames: 6, description: 'Cyan artisan painting on floating magical canvas with colors swirling', category: 'sprites', subdir: 'sprites/artisan', priority: 'P1' },
  { name: 'artisan_waiting', width: 64, height: 64, frames: 4, description: 'Cyan artisan stepping back evaluating their work thoughtfully', category: 'sprites', subdir: 'sprites/artisan', priority: 'P1' },
  { name: 'artisan_complete', width: 64, height: 64, frames: 6, description: 'Cyan artisan revealing masterpiece with dramatic flourish and sparkles', category: 'sprites', subdir: 'sprites/artisan', priority: 'P1' },
  { name: 'artisan_error', width: 64, height: 64, frames: 4, description: 'Cyan artisan with paint spilled, frustrated expression', category: 'sprites', subdir: 'sprites/artisan', priority: 'P1' },
  { name: 'artisan_sleeping', width: 64, height: 64, frames: 4, description: 'Cyan artisan dozed off with brush still in hand', category: 'sprites', subdir: 'sprites/artisan', priority: 'P1' },
  { name: 'artisan_spawning', width: 64, height: 64, frames: 8, description: 'Cyan artisan forming from swirling colors and paint splashes', category: 'sprites', subdir: 'sprites/artisan', priority: 'P1' },
  { name: 'artisan_portrait', width: 32, height: 32, description: 'Close-up face portrait of cyan artisan with beret', category: 'sprites', subdir: 'sprites/artisan', priority: 'P1' },

  // Chamber backgrounds
  { name: 'chamber_mage', width: 280, height: 80, description: 'Arcane library interior with floating books, candles, mystical shelves, purple magical glow', category: 'chambers', subdir: 'chambers', priority: 'P1' },
  { name: 'chamber_architect', width: 280, height: 80, description: 'Drafting room interior with blueprints on walls, drawing table, compasses, royal purple accents', category: 'chambers', subdir: 'chambers', priority: 'P1' },
  { name: 'chamber_engineer', width: 280, height: 80, description: 'Workshop interior with gears, steam pipes, workbench, anvil, green mechanical theme', category: 'chambers', subdir: 'chambers', priority: 'P1' },
  { name: 'chamber_scout', width: 280, height: 80, description: 'Map room interior with world maps, compass, exploration gear, teal adventure theme', category: 'chambers', subdir: 'chambers', priority: 'P1' },
  { name: 'chamber_guardian', width: 280, height: 80, description: 'Armory interior with shields on walls, weapon racks, training dummy, silver/blue theme', category: 'chambers', subdir: 'chambers', priority: 'P1' },
  { name: 'chamber_artisan', width: 280, height: 80, description: 'Art studio interior with easels, color palettes, canvases, cyan creative theme', category: 'chambers', subdir: 'chambers', priority: 'P1' },

  // More floor frames
  { name: 'floor_frame_attention', width: 320, height: 120, description: 'Stone chamber frame with pulsing golden border, alert state requiring attention', category: 'spire', subdir: 'spire', priority: 'P1' },
  { name: 'floor_frame_complete', width: 320, height: 120, description: 'Stone chamber frame with golden glow and celebration sparkles, success state', category: 'spire', subdir: 'spire', priority: 'P1' },
  { name: 'floor_frame_error', width: 320, height: 120, description: 'Stone chamber frame with red cracks and warning glow, error state', category: 'spire', subdir: 'spire', priority: 'P1' },
  { name: 'floor_frame_empty', width: 320, height: 120, description: 'Stone chamber frame vacant and dim, ready for new agent', category: 'spire', subdir: 'spire', priority: 'P1' },

  // Spire structure
  { name: 'spire_top', width: 320, height: 160, description: 'Ornate magical spire peak with glowing crystal on top, fantasy tower cap', category: 'spire', subdir: 'spire', priority: 'P1' },
  { name: 'spire_ground', width: 320, height: 100, description: 'Tower base/foundation with grand entrance door, stone steps', category: 'spire', subdir: 'spire', priority: 'P1' },
  { name: 'spire_connector', width: 320, height: 20, description: 'Decorative stone piece connecting tower floors, ornate trim', category: 'spire', subdir: 'spire', priority: 'P1' },

  // More UI elements
  { name: 'btn_primary_pressed', width: 160, height: 48, description: 'Gold/amber fantasy button pressed state, darker inset look', category: 'ui', subdir: 'ui/buttons', priority: 'P1' },
  { name: 'btn_secondary_pressed', width: 160, height: 48, description: 'Stone gray fantasy button pressed state, darker inset look', category: 'ui', subdir: 'ui/buttons', priority: 'P1' },
  { name: 'btn_danger', width: 160, height: 48, description: 'Red danger/cancel fantasy button with warning styling', category: 'ui', subdir: 'ui/buttons', priority: 'P1' },
  { name: 'btn_icon_circle', width: 48, height: 48, description: 'Circular icon button frame with stone/gold border', category: 'ui', subdir: 'ui/buttons', priority: 'P1' },
  { name: 'btn_summon', width: 200, height: 64, description: 'Large ornate "Summon Agent" button with magical portal effect', category: 'ui', subdir: 'ui/buttons', priority: 'P1' },

  // Panels
  { name: 'panel_parchment', width: 100, height: 100, description: 'Aged parchment/scroll background texture for 9-slice, fantasy RPG style', category: 'ui', subdir: 'ui/panels', priority: 'P1' },
  { name: 'panel_dark', width: 100, height: 100, description: 'Dark mystical panel background with subtle magical patterns', category: 'ui', subdir: 'ui/panels', priority: 'P1' },
  { name: 'panel_gold', width: 100, height: 100, description: 'Golden achievement panel with ornate border, celebratory', category: 'ui', subdir: 'ui/panels', priority: 'P1' },
  { name: 'card_agent', width: 100, height: 100, description: 'Agent info card frame with character portrait space', category: 'ui', subdir: 'ui/panels', priority: 'P1' },

  // Progress bars
  { name: 'progress_frame', width: 200, height: 16, description: 'Stone progress bar frame with carved edges', category: 'ui', subdir: 'ui/progress', priority: 'P1' },
  { name: 'progress_fill_mana', width: 32, height: 12, description: 'Blue mana/context progress bar fill, tileable, magical glow', category: 'ui', subdir: 'ui/progress', priority: 'P1' },
  { name: 'progress_fill_health', width: 32, height: 12, description: 'Green health/usage progress bar fill, tileable', category: 'ui', subdir: 'ui/progress', priority: 'P1' },
  { name: 'progress_fill_xp', width: 32, height: 12, description: 'Purple XP progress bar fill, tileable, sparkly', category: 'ui', subdir: 'ui/progress', priority: 'P1' },
  { name: 'progress_fill_gold', width: 32, height: 12, description: 'Gold quest progress bar fill, tileable, shiny', category: 'ui', subdir: 'ui/progress', priority: 'P1' },

  // Input fields
  { name: 'input_field', width: 100, height: 48, description: 'Text input field background with stone border for 9-slice', category: 'ui', subdir: 'ui/inputs', priority: 'P1' },
  { name: 'input_field_focus', width: 100, height: 48, description: 'Text input field with glowing magical border, focused state', category: 'ui', subdir: 'ui/inputs', priority: 'P1' },
  { name: 'input_send_btn', width: 48, height: 48, description: 'Send message button with arrow/quill icon', category: 'ui', subdir: 'ui/inputs', priority: 'P1' },

  // Quest icons
  { name: 'icon_quest_active', width: 32, height: 32, description: 'Yellow exclamation mark quest icon, pixel art', category: 'icons', subdir: 'icons/quest', priority: 'P1' },
  { name: 'icon_quest_complete', width: 32, height: 32, description: 'Yellow question mark quest turn-in icon, pixel art', category: 'icons', subdir: 'icons/quest', priority: 'P1' },
  { name: 'icon_quest_failed', width: 32, height: 32, description: 'Red X mark failed quest icon, pixel art', category: 'icons', subdir: 'icons/quest', priority: 'P1' },
  { name: 'icon_quest_pending', width: 32, height: 32, description: 'Hourglass pending review icon, pixel art', category: 'icons', subdir: 'icons/quest', priority: 'P1' },
  { name: 'icon_scroll', width: 32, height: 32, description: 'Rolled quest scroll icon, pixel art', category: 'icons', subdir: 'icons/quest', priority: 'P1' },
  { name: 'icon_loot', width: 32, height: 32, description: 'Treasure chest icon, pixel art', category: 'icons', subdir: 'icons/quest', priority: 'P1' },
  { name: 'icon_accept', width: 32, height: 32, description: 'Green checkmark in circle accept icon, pixel art', category: 'icons', subdir: 'icons/quest', priority: 'P1' },
  { name: 'icon_revise', width: 32, height: 32, description: 'Orange return arrow revise icon, pixel art', category: 'icons', subdir: 'icons/quest', priority: 'P1' },
  { name: 'icon_diff', width: 32, height: 32, description: 'Split document view diff icon, pixel art', category: 'icons', subdir: 'icons/quest', priority: 'P1' },

  // Activity icons (24x24)
  { name: 'icon_activity_idle', width: 24, height: 24, description: 'Zzz/moon idle activity icon, tiny pixel art', category: 'icons', subdir: 'icons/activity', priority: 'P1' },
  { name: 'icon_activity_thinking', width: 24, height: 24, description: 'Thought bubble thinking activity icon, tiny pixel art', category: 'icons', subdir: 'icons/activity', priority: 'P1' },
  { name: 'icon_activity_researching', width: 24, height: 24, description: 'Magnifying glass/book researching icon, tiny pixel art', category: 'icons', subdir: 'icons/activity', priority: 'P1' },
  { name: 'icon_activity_reading', width: 24, height: 24, description: 'Open book/scroll reading icon, tiny pixel art', category: 'icons', subdir: 'icons/activity', priority: 'P1' },
  { name: 'icon_activity_writing', width: 24, height: 24, description: 'Quill pen writing icon, tiny pixel art', category: 'icons', subdir: 'icons/activity', priority: 'P1' },
  { name: 'icon_activity_testing', width: 24, height: 24, description: 'Alchemy flask testing icon, tiny pixel art', category: 'icons', subdir: 'icons/activity', priority: 'P1' },
  { name: 'icon_activity_building', width: 24, height: 24, description: 'Hammer/anvil building icon, tiny pixel art', category: 'icons', subdir: 'icons/activity', priority: 'P1' },
  { name: 'icon_activity_git', width: 24, height: 24, description: 'Branch/tree git icon, tiny pixel art', category: 'icons', subdir: 'icons/activity', priority: 'P1' },
  { name: 'icon_activity_waiting', width: 24, height: 24, description: 'Speech bubble with question mark waiting icon, tiny pixel art', category: 'icons', subdir: 'icons/activity', priority: 'P1' },
  { name: 'icon_activity_error', width: 24, height: 24, description: 'Lightning bolt/explosion error icon, tiny pixel art', category: 'icons', subdir: 'icons/activity', priority: 'P1' },

  // Action icons
  { name: 'icon_send', width: 32, height: 32, description: 'Send/submit arrow icon, pixel art', category: 'icons', subdir: 'icons/action', priority: 'P1' },
  { name: 'icon_close', width: 32, height: 32, description: 'X close button icon, pixel art', category: 'icons', subdir: 'icons/action', priority: 'P1' },
  { name: 'icon_expand', width: 32, height: 32, description: 'Expand/maximize arrows icon, pixel art', category: 'icons', subdir: 'icons/action', priority: 'P1' },
  { name: 'icon_collapse', width: 32, height: 32, description: 'Collapse/minimize arrows icon, pixel art', category: 'icons', subdir: 'icons/action', priority: 'P1' },
  { name: 'icon_menu', width: 32, height: 32, description: 'Hamburger/dots menu icon, pixel art', category: 'icons', subdir: 'icons/action', priority: 'P1' },
  { name: 'icon_refresh', width: 32, height: 32, description: 'Refresh/sync circular arrows icon, pixel art', category: 'icons', subdir: 'icons/action', priority: 'P1' },
  { name: 'icon_settings', width: 32, height: 32, description: 'Gear cog settings icon, pixel art', category: 'icons', subdir: 'icons/action', priority: 'P1' },
  { name: 'icon_back', width: 32, height: 32, description: 'Back arrow navigation icon, pixel art', category: 'icons', subdir: 'icons/action', priority: 'P1' },

  // Magic effects
  { name: 'effect_spawn_portal', width: 128, height: 128, frames: 12, description: 'Swirling purple magical portal opening animation sprite sheet', category: 'effects', subdir: 'effects', priority: 'P1' },
  { name: 'effect_magic_sparkle', width: 64, height: 64, frames: 8, description: 'Generic magical sparkle burst animation sprite sheet', category: 'effects', subdir: 'effects', priority: 'P1' },
  { name: 'effect_quest_complete', width: 128, height: 128, frames: 10, description: 'Quest completion celebration fanfare animation with gold sparkles', category: 'effects', subdir: 'effects', priority: 'P1' },
  { name: 'effect_error_flash', width: 64, height: 64, frames: 6, description: 'Red error pulse flash animation sprite sheet', category: 'effects', subdir: 'effects', priority: 'P1' },
  { name: 'effect_typing', width: 32, height: 32, frames: 4, description: 'Typing indicator dots animation sprite sheet', category: 'effects', subdir: 'effects', priority: 'P1' },
  { name: 'effect_thinking', width: 48, height: 48, frames: 6, description: 'Thought process sparkles animation sprite sheet', category: 'effects', subdir: 'effects', priority: 'P1' },

  // Thought bubbles
  { name: 'bubble_thought', width: 100, height: 80, description: 'Cloud-style thought bubble for 9-slice, comic style', category: 'effects', subdir: 'effects', priority: 'P1' },
  { name: 'bubble_thought_tail', width: 24, height: 32, description: 'Thought bubble tail pointing down, small circles', category: 'effects', subdir: 'effects', priority: 'P1' },
  { name: 'bubble_speech', width: 100, height: 80, description: 'Speech bubble for dialogue, 9-slice ready', category: 'effects', subdir: 'effects', priority: 'P1' },
  { name: 'bubble_speech_tail', width: 16, height: 24, description: 'Speech bubble pointed tail', category: 'effects', subdir: 'effects', priority: 'P1' },
];

// P2 - Polish
const P2_ASSETS: AssetSpec[] = [
  // Loot & Treasure icons
  { name: 'icon_chest_closed', width: 32, height: 32, description: 'Closed treasure chest icon, pixel art', category: 'icons', subdir: 'icons/loot', priority: 'P2' },
  { name: 'icon_chest_open', width: 32, height: 32, description: 'Open treasure chest with golden glow icon, pixel art', category: 'icons', subdir: 'icons/loot', priority: 'P2' },
  { name: 'icon_artifact', width: 32, height: 32, description: 'Glowing magical gem/artifact icon, pixel art', category: 'icons', subdir: 'icons/loot', priority: 'P2' },
  { name: 'icon_file_modified', width: 32, height: 32, description: 'Scroll with quill modified file icon, pixel art', category: 'icons', subdir: 'icons/loot', priority: 'P2' },
  { name: 'icon_file_created', width: 32, height: 32, description: 'Scroll with sparkle new file icon, pixel art', category: 'icons', subdir: 'icons/loot', priority: 'P2' },
  { name: 'icon_file_deleted', width: 32, height: 32, description: 'Scroll with X deleted file icon, pixel art', category: 'icons', subdir: 'icons/loot', priority: 'P2' },
  { name: 'icon_preview', width: 32, height: 32, description: 'Eye symbol preview icon, pixel art', category: 'icons', subdir: 'icons/loot', priority: 'P2' },
  { name: 'icon_share', width: 32, height: 32, description: 'Outward arrows share icon, pixel art', category: 'icons', subdir: 'icons/loot', priority: 'P2' },

  // Talent tree icons
  { name: 'icon_talent_locked', width: 32, height: 32, description: 'Locked rune grayed out talent icon, pixel art', category: 'icons', subdir: 'icons/talent', priority: 'P2' },
  { name: 'icon_talent_available', width: 32, height: 32, description: 'Glowing rune available to learn talent icon, pixel art', category: 'icons', subdir: 'icons/talent', priority: 'P2' },
  { name: 'icon_talent_learned', width: 32, height: 32, description: 'Bright active rune learned talent icon, pixel art', category: 'icons', subdir: 'icons/talent', priority: 'P2' },
  { name: 'icon_talent_point', width: 32, height: 32, description: 'Skill point star icon, pixel art', category: 'icons', subdir: 'icons/talent', priority: 'P2' },
  { name: 'icon_talent_haste', width: 32, height: 32, description: 'Lightning bolt speed talent icon, pixel art', category: 'icons', subdir: 'icons/talent', priority: 'P2' },
  { name: 'icon_talent_lore', width: 32, height: 32, description: 'Book knowledge talent icon, pixel art', category: 'icons', subdir: 'icons/talent', priority: 'P2' },
  { name: 'icon_talent_focus', width: 32, height: 32, description: 'Target precision talent icon, pixel art', category: 'icons', subdir: 'icons/talent', priority: 'P2' },
  { name: 'icon_talent_endurance', width: 32, height: 32, description: 'Shield stamina talent icon, pixel art', category: 'icons', subdir: 'icons/talent', priority: 'P2' },
  { name: 'icon_talent_mastery', width: 32, height: 32, description: 'Crown expertise mastery talent icon, pixel art', category: 'icons', subdir: 'icons/talent', priority: 'P2' },

  // Realm/Zone icons
  { name: 'icon_realm_all', width: 32, height: 32, description: 'Castle all projects realm icon, pixel art', category: 'icons', subdir: 'icons/realm', priority: 'P2' },
  { name: 'icon_realm_api', width: 32, height: 32, description: 'Server tower API realm icon, pixel art', category: 'icons', subdir: 'icons/realm', priority: 'P2' },
  { name: 'icon_realm_web', width: 32, height: 32, description: 'Globe with magic web realm icon, pixel art', category: 'icons', subdir: 'icons/realm', priority: 'P2' },
  { name: 'icon_realm_mobile', width: 32, height: 32, description: 'Crystal phone mobile realm icon, pixel art', category: 'icons', subdir: 'icons/realm', priority: 'P2' },
  { name: 'icon_realm_custom', width: 32, height: 32, description: 'Blank banner custom realm icon, pixel art', category: 'icons', subdir: 'icons/realm', priority: 'P2' },
  { name: 'icon_realm_add', width: 32, height: 32, description: 'Plus in circle add realm icon, pixel art', category: 'icons', subdir: 'icons/realm', priority: 'P2' },

  // File type icons (24x24)
  { name: 'icon_file_code', width: 24, height: 24, description: 'Code file scroll with runes icon, tiny pixel art', category: 'icons', subdir: 'icons/file', priority: 'P2' },
  { name: 'icon_file_config', width: 24, height: 24, description: 'Config file gear on scroll icon, tiny pixel art', category: 'icons', subdir: 'icons/file', priority: 'P2' },
  { name: 'icon_file_doc', width: 24, height: 24, description: 'Document book icon, tiny pixel art', category: 'icons', subdir: 'icons/file', priority: 'P2' },
  { name: 'icon_file_image', width: 24, height: 24, description: 'Image crystal/painting icon, tiny pixel art', category: 'icons', subdir: 'icons/file', priority: 'P2' },
  { name: 'icon_file_folder', width: 24, height: 24, description: 'Folder pouch/chest icon, tiny pixel art', category: 'icons', subdir: 'icons/file', priority: 'P2' },

  // Provider icons
  { name: 'icon_claude', width: 32, height: 32, description: 'Claude logo stylized as purple magical rune, pixel art', category: 'icons', subdir: 'icons/provider', priority: 'P2' },
  { name: 'icon_openai', width: 32, height: 32, description: 'OpenAI logo stylized as green rune, pixel art', category: 'icons', subdir: 'icons/provider', priority: 'P2' },
  { name: 'icon_gemini', width: 32, height: 32, description: 'Gemini logo stylized as blue twin stars rune, pixel art', category: 'icons', subdir: 'icons/provider', priority: 'P2' },

  // Notification badges
  { name: 'badge_count', width: 24, height: 24, description: 'Red circle notification count badge, pixel art', category: 'icons', subdir: 'icons/badges', priority: 'P2' },
  { name: 'badge_alert', width: 24, height: 24, description: 'Pulsing alert indicator badge, pixel art', category: 'icons', subdir: 'icons/badges', priority: 'P2' },
  { name: 'badge_new', width: 24, height: 24, description: 'New sparkle badge, pixel art', category: 'icons', subdir: 'icons/badges', priority: 'P2' },

  // More backgrounds
  { name: 'bg_spire_night', width: 390, height: 844, description: 'Night fantasy sky with stars, moons, and magical aurora, pixel art style', category: 'backgrounds', subdir: 'backgrounds', priority: 'P2' },
  { name: 'bg_spire_sunset', width: 390, height: 844, description: 'Sunset gradient sky with orange and purple clouds, magical atmosphere, pixel art', category: 'backgrounds', subdir: 'backgrounds', priority: 'P2' },
  { name: 'bg_connect_wizard', width: 390, height: 844, description: 'Mystical connection setup background with arcane circles, pixel art', category: 'backgrounds', subdir: 'backgrounds', priority: 'P2' },
  { name: 'bg_summon_ritual', width: 390, height: 844, description: 'Summoning circle background with glowing runes, pixel art', category: 'backgrounds', subdir: 'backgrounds', priority: 'P2' },

  // Decorative elements
  { name: 'deco_cloud_1', width: 64, height: 32, description: 'Small fluffy pixel art cloud', category: 'backgrounds', subdir: 'backgrounds', priority: 'P2' },
  { name: 'deco_cloud_2', width: 96, height: 48, description: 'Medium fluffy pixel art cloud', category: 'backgrounds', subdir: 'backgrounds', priority: 'P2' },
  { name: 'deco_cloud_3', width: 128, height: 64, description: 'Large fluffy pixel art cloud', category: 'backgrounds', subdir: 'backgrounds', priority: 'P2' },
  { name: 'deco_star', width: 8, height: 8, description: 'Tiny twinkling star pixel art', category: 'backgrounds', subdir: 'backgrounds', priority: 'P2' },
  { name: 'deco_bird', width: 16, height: 16, frames: 4, description: 'Flying bird animation sprite sheet, pixel art', category: 'backgrounds', subdir: 'backgrounds', priority: 'P2' },
  { name: 'deco_banner', width: 48, height: 96, description: 'Hanging banner/flag decoration, pixel art', category: 'backgrounds', subdir: 'backgrounds', priority: 'P2' },

  // Onboarding illustrations
  { name: 'onboard_welcome', width: 280, height: 200, description: 'Friendly wizard welcoming player illustration, pixel art', category: 'onboarding', subdir: 'onboarding', priority: 'P2' },
  { name: 'onboard_daemon', width: 280, height: 200, description: 'Computer with magical portal connection illustration, pixel art', category: 'onboarding', subdir: 'onboarding', priority: 'P2' },
  { name: 'onboard_connect', width: 280, height: 200, description: 'Phone and computer magically linked illustration, pixel art', category: 'onboarding', subdir: 'onboarding', priority: 'P2' },
  { name: 'onboard_success', width: 280, height: 200, description: 'Celebration with spire revealed illustration, pixel art', category: 'onboarding', subdir: 'onboarding', priority: 'P2' },
  { name: 'qr_frame', width: 200, height: 200, description: 'Decorative ornate frame for QR code, pixel art', category: 'onboarding', subdir: 'onboarding', priority: 'P2' },

  // Connection status
  { name: 'status_connected', width: 48, height: 48, description: 'Green glowing portal connected status, pixel art', category: 'onboarding', subdir: 'onboarding', priority: 'P2' },
  { name: 'status_disconnected', width: 48, height: 48, description: 'Gray inactive portal disconnected status, pixel art', category: 'onboarding', subdir: 'onboarding', priority: 'P2' },
  { name: 'status_connecting', width: 48, height: 48, description: 'Spinning portal connecting status, pixel art', category: 'onboarding', subdir: 'onboarding', priority: 'P2' },
  { name: 'status_error', width: 48, height: 48, description: 'Red broken portal error status, pixel art', category: 'onboarding', subdir: 'onboarding', priority: 'P2' },

  // Empty states
  { name: 'empty_spire', width: 200, height: 200, description: 'Empty tower with no agents yet, lonely pixel art', category: 'empty-states', subdir: 'empty-states', priority: 'P2' },
  { name: 'empty_quests', width: 200, height: 200, description: 'Empty scroll with no quests, pixel art', category: 'empty-states', subdir: 'empty-states', priority: 'P2' },
  { name: 'empty_chronicle', width: 200, height: 200, description: 'Blank book with no activity, pixel art', category: 'empty-states', subdir: 'empty-states', priority: 'P2' },
  { name: 'empty_loot', width: 200, height: 200, description: 'Empty open treasure chest, pixel art', category: 'empty-states', subdir: 'empty-states', priority: 'P2' },

  // Branding
  { name: 'splash_screen', width: 390, height: 844, description: 'Launch screen with Arcane Spire logo and magical effects, pixel art', category: 'branding', subdir: 'branding', priority: 'P2' },
  { name: 'logo_horizontal', width: 280, height: 80, description: 'Arcane Spire horizontal wordmark logo, pixel art', category: 'branding', subdir: 'branding', priority: 'P2' },
  { name: 'logo_vertical', width: 160, height: 200, description: 'Arcane Spire stacked vertical logo, pixel art', category: 'branding', subdir: 'branding', priority: 'P2' },
  { name: 'logo_icon', width: 64, height: 64, description: 'Just the spire tower icon, pixel art', category: 'branding', subdir: 'branding', priority: 'P2' },

  // Ambient effects
  { name: 'effect_candle_flicker', width: 16, height: 24, frames: 4, description: 'Candle flame flickering animation, tiny pixel art', category: 'effects', subdir: 'effects', priority: 'P2' },
  { name: 'effect_magic_float', width: 32, height: 32, frames: 8, description: 'Floating magic particles animation, pixel art', category: 'effects', subdir: 'effects', priority: 'P2' },
  { name: 'effect_steam', width: 32, height: 48, frames: 6, description: 'Steam/smoke rising animation, pixel art', category: 'effects', subdir: 'effects', priority: 'P2' },
  { name: 'effect_rune_glow', width: 48, height: 48, frames: 4, description: 'Glowing rune pulse animation, pixel art', category: 'effects', subdir: 'effects', priority: 'P2' },
  { name: 'effect_level_up', width: 128, height: 128, frames: 10, description: 'Level up celebration with sparkles and light rays, pixel art', category: 'effects', subdir: 'effects', priority: 'P2' },

  // Quest Turn-In Elements
  { name: 'quest_header_complete', width: 280, height: 64, description: 'Quest Complete ornate banner header, pixel art', category: 'ui', subdir: 'ui/panels', priority: 'P2' },
  { name: 'quest_seal_accept', width: 64, height: 64, description: 'Wax seal for accepting quest, pixel art', category: 'ui', subdir: 'ui/panels', priority: 'P2' },
  { name: 'quest_seal_revise', width: 64, height: 64, description: 'Broken wax seal for revision, pixel art', category: 'ui', subdir: 'ui/panels', priority: 'P2' },
  { name: 'quest_ribbon', width: 200, height: 32, description: 'Decorative ribbon banner, pixel art', category: 'ui', subdir: 'ui/panels', priority: 'P2' },
  { name: 'quest_scroll_bg', width: 320, height: 480, description: 'Full scroll background for quest display, pixel art', category: 'ui', subdir: 'ui/panels', priority: 'P2' },

  // Treasure Vault Elements
  { name: 'vault_header', width: 280, height: 64, description: 'Treasure Vault ornate banner header, pixel art', category: 'ui', subdir: 'ui/panels', priority: 'P2' },
  { name: 'vault_chest_large', width: 128, height: 128, description: 'Large treasure chest illustration, pixel art', category: 'ui', subdir: 'ui/panels', priority: 'P2' },
  { name: 'vault_item_slot', width: 64, height: 64, description: 'Item slot frame for inventory, pixel art', category: 'ui', subdir: 'ui/panels', priority: 'P2' },
  { name: 'vault_glow', width: 96, height: 96, description: 'Glow effect behind valuable items, pixel art', category: 'effects', subdir: 'effects', priority: 'P2' },

  // Talent Tree Elements
  { name: 'talent_node_bg', width: 64, height: 64, description: 'Talent node background stone circle, pixel art', category: 'ui', subdir: 'ui/panels', priority: 'P2' },
  { name: 'talent_node_active', width: 64, height: 64, description: 'Active/selected talent node glowing, pixel art', category: 'ui', subdir: 'ui/panels', priority: 'P2' },
  { name: 'talent_connector', width: 8, height: 32, description: 'Vertical line connecting talents, pixel art', category: 'ui', subdir: 'ui/panels', priority: 'P2' },
  { name: 'talent_connector_h', width: 32, height: 8, description: 'Horizontal line connecting talents, pixel art', category: 'ui', subdir: 'ui/panels', priority: 'P2' },
  { name: 'talent_header', width: 280, height: 64, description: 'Skill Grimoire ornate banner header, pixel art', category: 'ui', subdir: 'ui/panels', priority: 'P2' },

  // Party Dock Elements
  { name: 'dock_bg', width: 390, height: 80, description: 'Party dock background bar, pixel art', category: 'ui', subdir: 'ui/panels', priority: 'P2' },
  { name: 'dock_slot', width: 56, height: 64, description: 'Single agent slot frame in dock, pixel art', category: 'ui', subdir: 'ui/panels', priority: 'P2' },
  { name: 'dock_slot_alert', width: 56, height: 64, description: 'Pulsing alert agent slot frame, pixel art', category: 'ui', subdir: 'ui/panels', priority: 'P2' },
  { name: 'dock_mini_bar', width: 48, height: 6, description: 'Mini health/context bar frame, pixel art', category: 'ui', subdir: 'ui/panels', priority: 'P2' },
  { name: 'dock_expand_handle', width: 48, height: 16, description: 'Pull-down expand handle, pixel art', category: 'ui', subdir: 'ui/panels', priority: 'P2' },

  // Chamber View Elements
  { name: 'chamber_frame', width: 358, height: 400, description: 'Expanded chamber view frame, pixel art', category: 'ui', subdir: 'ui/panels', priority: 'P2' },
  { name: 'chamber_floor', width: 320, height: 120, description: 'Chamber floor surface agents walk on, pixel art', category: 'ui', subdir: 'ui/panels', priority: 'P2' },
  { name: 'thought_history_bg', width: 100, height: 100, description: 'Thought history panel background 9-slice, pixel art', category: 'ui', subdir: 'ui/panels', priority: 'P2' },
  { name: 'chamber_bookshelf', width: 64, height: 96, description: 'Bookshelf prop for mage chamber, pixel art', category: 'ui', subdir: 'ui/panels', priority: 'P2' },
  { name: 'chamber_cauldron', width: 48, height: 64, description: 'Cauldron prop for testing, pixel art', category: 'ui', subdir: 'ui/panels', priority: 'P2' },
  { name: 'chamber_desk', width: 80, height: 48, description: 'Writing desk prop, pixel art', category: 'ui', subdir: 'ui/panels', priority: 'P2' },
  { name: 'chamber_telescope', width: 48, height: 80, description: 'Research telescope prop, pixel art', category: 'ui', subdir: 'ui/panels', priority: 'P2' },
  { name: 'chamber_anvil', width: 64, height: 48, description: 'Engineering anvil prop, pixel art', category: 'ui', subdir: 'ui/panels', priority: 'P2' },

  // Misc UI
  { name: 'sheet_handle', width: 48, height: 8, description: 'Bottom sheet drag handle bar, pixel art', category: 'ui', subdir: 'ui/panels', priority: 'P2' },
  { name: 'divider_ornate', width: 280, height: 8, description: 'Decorative section divider line, pixel art', category: 'ui', subdir: 'ui/panels', priority: 'P2' },
  { name: 'header_banner', width: 320, height: 48, description: 'Modal header banner frame, pixel art', category: 'ui', subdir: 'ui/panels', priority: 'P2' },
];

// All assets combined
const ALL_ASSETS = [...P0_ASSETS, ...P1_ASSETS, ...P2_ASSETS];

// Track progress
interface GenerationProgress {
  total: number;
  completed: number;
  failed: string[];
  current: string;
}

const progress: GenerationProgress = {
  total: ALL_ASSETS.length,
  completed: 0,
  failed: [],
  current: '',
};

// Generate a single image using Gemini API
async function generateImage(asset: AssetSpec): Promise<boolean> {
  const prompt = `${BASE_PROMPT}
Size: ${asset.width}x${asset.height} pixels
${asset.frames ? `Sprite sheet with ${asset.frames} frames arranged horizontally` : ''}
Description: ${asset.description}`;

  try {
    console.log(`Generating: ${asset.name} (${asset.width}x${asset.height})`);

    // Use gemini-2.0-flash-preview-image-generation model
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-preview-image-generation:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }],
          generationConfig: {
            responseModalities: ['TEXT', 'IMAGE'],
          }
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`API Error for ${asset.name}: ${response.status} - ${errorText}`);

      // Try alternative Gemini endpoint
      return await generateImageAlternative(asset, prompt);
    }

    const data = await response.json();

    // Check for inline image data in the response
    if (data.candidates?.[0]?.content?.parts) {
      for (const part of data.candidates[0].content.parts) {
        if (part.inlineData?.data) {
          const imageBuffer = Buffer.from(part.inlineData.data, 'base64');
          const outputPath = path.join(OUTPUT_DIR, asset.subdir, `${asset.name}.png`);

          // Ensure directory exists
          fs.mkdirSync(path.dirname(outputPath), { recursive: true });
          fs.writeFileSync(outputPath, imageBuffer);

          console.log(`✓ Saved: ${outputPath}`);
          return true;
        }
      }
    }

    console.error(`No image data for ${asset.name}`);
    return await generateImageAlternative(asset, prompt);
  } catch (error) {
    console.error(`Error generating ${asset.name}:`, error);
    return await generateImageAlternative(asset, prompt);
  }
}

// Alternative generation using Gemini's generative model with image output
async function generateImageAlternative(asset: AssetSpec, prompt: string): Promise<boolean> {
  try {
    console.log(`Trying Gemini 2.0 Flash for: ${asset.name}`);

    // Use gemini-2.0-flash-exp with image generation capability
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp-image-generation:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }],
          generationConfig: {
            responseModalities: ['TEXT', 'IMAGE'],
          }
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Gemini 2.0 Flash Error for ${asset.name}: ${response.status} - ${errorText}`);

      // Try the regular gemini-2.0-flash-exp model
      return await generateImageWithFlash(asset, prompt);
    }

    const data = await response.json();

    // Check for inline image data in the response
    if (data.candidates?.[0]?.content?.parts) {
      for (const part of data.candidates[0].content.parts) {
        if (part.inlineData?.data) {
          const imageBuffer = Buffer.from(part.inlineData.data, 'base64');
          const outputPath = path.join(OUTPUT_DIR, asset.subdir, `${asset.name}.png`);

          fs.mkdirSync(path.dirname(outputPath), { recursive: true });
          fs.writeFileSync(outputPath, imageBuffer);

          console.log(`✓ Saved: ${outputPath}`);
          return true;
        }
      }
    }

    console.error(`No image in response for ${asset.name}`);
    return false;
  } catch (error) {
    console.error(`Generation failed for ${asset.name}:`, error);
    return false;
  }
}

// Try with standard gemini-2.0-flash-exp model
async function generateImageWithFlash(asset: AssetSpec, prompt: string): Promise<boolean> {
  try {
    console.log(`Trying standard Gemini Flash for: ${asset.name}`);

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }],
          generationConfig: {
            responseModalities: ['TEXT', 'IMAGE'],
          }
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Standard Flash Error for ${asset.name}: ${response.status} - ${errorText}`);
      return false;
    }

    const data = await response.json();

    if (data.candidates?.[0]?.content?.parts) {
      for (const part of data.candidates[0].content.parts) {
        if (part.inlineData?.data) {
          const imageBuffer = Buffer.from(part.inlineData.data, 'base64');
          const outputPath = path.join(OUTPUT_DIR, asset.subdir, `${asset.name}.png`);

          fs.mkdirSync(path.dirname(outputPath), { recursive: true });
          fs.writeFileSync(outputPath, imageBuffer);

          console.log(`✓ Saved: ${outputPath}`);
          return true;
        }
      }
    }

    console.error(`No image in Flash response for ${asset.name}`);
    return false;
  } catch (error) {
    console.error(`Flash generation failed for ${asset.name}:`, error);
    return false;
  }
}

// Rate limiting helper
function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Main generation function
async function generateAllAssets(priorityFilter?: 'P0' | 'P1' | 'P2') {
  const assets = priorityFilter
    ? ALL_ASSETS.filter(a => a.priority === priorityFilter)
    : ALL_ASSETS;

  console.log(`\n${'='.repeat(60)}`);
  console.log(`Arcane Spire Asset Generator`);
  console.log(`${'='.repeat(60)}`);
  console.log(`Total assets to generate: ${assets.length}`);
  console.log(`Output directory: ${OUTPUT_DIR}`);
  console.log(`${'='.repeat(60)}\n`);

  progress.total = assets.length;

  for (let i = 0; i < assets.length; i++) {
    const asset = assets[i];
    progress.current = asset.name;

    console.log(`\n[${i + 1}/${assets.length}] Processing ${asset.name}...`);

    // Check if already exists
    const outputPath = path.join(OUTPUT_DIR, asset.subdir, `${asset.name}.png`);
    if (fs.existsSync(outputPath)) {
      console.log(`⏭ Skipping (already exists): ${asset.name}`);
      progress.completed++;
      continue;
    }

    const success = await generateImage(asset);

    if (success) {
      progress.completed++;
    } else {
      progress.failed.push(asset.name);
    }

    // Rate limiting - wait between requests
    if (i < assets.length - 1) {
      console.log('Waiting before next request...');
      await delay(2000); // 2 second delay between requests
    }
  }

  // Print summary
  console.log(`\n${'='.repeat(60)}`);
  console.log(`Generation Complete!`);
  console.log(`${'='.repeat(60)}`);
  console.log(`Successful: ${progress.completed}/${progress.total}`);

  if (progress.failed.length > 0) {
    console.log(`\nFailed assets (${progress.failed.length}):`);
    progress.failed.forEach(name => console.log(`  - ${name}`));
  }

  console.log(`\nOutput directory: ${OUTPUT_DIR}`);
}

// CLI handling
const args = process.argv.slice(2);
const priorityArg = args.find(a => a.startsWith('--priority='));
const priority = priorityArg?.split('=')[1] as 'P0' | 'P1' | 'P2' | undefined;

// Run
generateAllAssets(priority);
