#!/usr/bin/env npx tsx
/**
 * Sound Effects Generator for Arcane Spire
 * Uses ElevenLabs API to generate all 69 sound effects from the spec
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const API_KEY = 'sk_5999e50152801c05be657b4f7519efe7e7a183eb6b9e07ab';
const API_URL = 'https://api.elevenlabs.io/v1/sound-generation';
const OUTPUT_BASE = path.join(__dirname, '../arcane-spire/assets/sounds');

interface SoundSpec {
  filename: string;
  category: string;
  description: string;
  duration: number;
  prompt: string;
  loop?: boolean;
}

// All 69 sounds from the spec
const SOUNDS: SoundSpec[] = [
  // ============================================
  // UI INTERACTION SOUNDS (12)
  // ============================================
  {
    filename: 'sfx_tap.wav',
    category: 'ui',
    description: 'Default tap/button press',
    duration: 0.5,
    prompt: '8-bit stone button click sound, like pressing a carved rune on ancient stone. Short, tactile, satisfying click with slight magical resonance. Think Legend of Zelda menu selection meets dungeon stone mechanism.',
  },
  {
    filename: 'sfx_tap_secondary.wav',
    category: 'ui',
    description: 'Secondary/soft tap',
    duration: 0.5,
    prompt: 'Soft 8-bit tap sound, gentler version of stone button. Like touching a magical scroll or parchment. Muted, papery, with subtle arcane undertone.',
  },
  {
    filename: 'sfx_swipe.wav',
    category: 'ui',
    description: 'Swipe gesture',
    duration: 0.5,
    prompt: 'Retro whoosh sound for card swiping, like a wizard quickly flipping through spell cards. Airy 8-bit sweep with magical trail, ascending pitch.',
  },
  {
    filename: 'sfx_toggle_on.wav',
    category: 'ui',
    description: 'Toggle switch on',
    duration: 0.5,
    prompt: 'Magical activation chime, 8-bit style. Like lighting a magical crystal or activating a rune. Rising two-note chime with sparkle, bright and affirmative.',
  },
  {
    filename: 'sfx_toggle_off.wav',
    category: 'ui',
    description: 'Toggle switch off',
    duration: 0.5,
    prompt: 'Magical deactivation sound, 8-bit. Like a crystal dimming or rune going dormant. Descending two-note tone, softer and settling, slight fade.',
  },
  {
    filename: 'sfx_expand.wav',
    category: 'ui',
    description: 'Panel/dock expand',
    duration: 0.5,
    prompt: 'Stone panel sliding open with magical reveal. 8-bit grinding stone sound transitioning to arcane shimmer. Like a secret passage opening in a wizard\'s tower.',
  },
  {
    filename: 'sfx_collapse.wav',
    category: 'ui',
    description: 'Panel/dock collapse',
    duration: 0.5,
    prompt: 'Stone panel sliding closed, 8-bit. Reverse of expand - arcane shimmer fading into stone settling. Solid, final thunk at end.',
  },
  {
    filename: 'sfx_scroll_tick.wav',
    category: 'ui',
    description: 'Scroll snap/tick',
    duration: 0.5,
    prompt: 'Extremely short 8-bit tick, like a magical clockwork mechanism. Single click of an enchanted gear or rune alignment. Barely perceptible but satisfying.',
  },
  {
    filename: 'sfx_nav_tab.wav',
    category: 'ui',
    description: 'Tab bar navigation',
    duration: 0.5,
    prompt: 'Magical page turn combined with location shift. 8-bit sound like teleporting between rooms in a tower. Spatial whoosh with destination chime, distinct from regular tap.',
  },
  {
    filename: 'sfx_nav_back.wav',
    category: 'ui',
    description: 'Navigate back',
    duration: 0.5,
    prompt: 'Reversed magical whoosh, 8-bit. Like stepping back through a portal or rewinding a spell. Descending pitch sweep with slight rewind quality.',
  },
  {
    filename: 'sfx_modal_open.wav',
    category: 'ui',
    description: 'Modal/sheet opening',
    duration: 0.5,
    prompt: 'Mystical portal opening, 8-bit style. Swirling energy coalescing into view. Rising pitch with crystalline shimmer, like a magical window materializing.',
  },
  {
    filename: 'sfx_modal_close.wav',
    category: 'ui',
    description: 'Modal/sheet closing',
    duration: 0.5,
    prompt: 'Mystical portal closing, 8-bit. Energy dispersing and fading. Descending crystalline tones dissolving into silence, gentle conclusion.',
  },

  // ============================================
  // AGENT STATUS SOUNDS (6)
  // ============================================
  {
    filename: 'sfx_agent_spawn.wav',
    category: 'agents',
    description: 'Agent spawning/materializing',
    duration: 1.5,
    prompt: 'Epic 8-bit summoning sequence. Magical energy gathering from multiple points, swirling together, then crystallizing into form. Start ethereal and scattered, build to solid materialization with triumphant final note. Like summoning a familiar in a classic RPG.',
  },
  {
    filename: 'sfx_agent_awaken.wav',
    category: 'agents',
    description: 'Agent awakening from dormant',
    duration: 0.7,
    prompt: 'Gentle magical awakening, 8-bit. Like eyes opening with inner light, energy slowly flowing back. Soft rising tones, yawning quality, building to alert readiness. Dawn-like quality.',
  },
  {
    filename: 'sfx_agent_channeling.wav',
    category: 'agents',
    description: 'Start channeling/working',
    duration: 0.6,
    prompt: 'Magical energy building and focusing, 8-bit. Like a wizard beginning to cast a complex spell. Power gathering, humming intensity increasing, ready-to-work energy.',
  },
  {
    filename: 'sfx_agent_dormant.wav',
    category: 'agents',
    description: 'Agent going dormant',
    duration: 0.6,
    prompt: 'Magical wind-down, 8-bit. Energy settling, like a golem gently powering down. Descending peaceful tones, soft landing, dreamy fade. Cozy sleep quality.',
  },
  {
    filename: 'sfx_agent_waiting.wav',
    category: 'agents',
    description: 'Agent needs attention',
    duration: 0.7,
    prompt: 'Curious questioning chime, 8-bit. Like a familiar tilting its head and chirping for guidance. Gentle but attention-getting, rising inflection like a question mark, friendly not urgent.',
  },
  {
    filename: 'sfx_agent_error.wav',
    category: 'agents',
    description: 'Agent error state',
    duration: 0.7,
    prompt: 'Discordant magical disruption, 8-bit. Like a spell fizzling or enchantment breaking. Crackling energy, off-key notes, slight alarm quality but not harsh. Concerned, not catastrophic.',
  },

  // ============================================
  // AGENT ACTIVITY AMBIENT LOOPS (5)
  // ============================================
  {
    filename: 'amb_agent_thinking.wav',
    category: 'agents',
    description: 'Agent thinking loop',
    duration: 5,
    prompt: 'Contemplative magical ambience, 8-bit loop. Soft bubbling like a witch\'s cauldron of ideas, occasional sparkle chimes like lightbulb moments, gentle humming undertone of concentration. Peaceful intellectual energy, seamlessly loopable.',
    loop: true,
  },
  {
    filename: 'amb_agent_writing.wav',
    category: 'agents',
    description: 'Agent writing/coding loop',
    duration: 5,
    prompt: 'Productive magical scribing, 8-bit loop. Rhythmic quill-scratch patterns mixed with soft keyboard-like taps, occasional scroll unfurling sounds, ink-flow magic. Steady productive cadence, loopable.',
    loop: true,
  },
  {
    filename: 'amb_agent_reading.wav',
    category: 'agents',
    description: 'Agent reading/researching',
    duration: 5,
    prompt: 'Studious magical ambience, 8-bit loop. Page turning sounds, soft aha chimes, magnifying glass focusing sounds, ancient tome energy. Library-like contemplative mood, loopable.',
    loop: true,
  },
  {
    filename: 'amb_agent_building.wav',
    category: 'agents',
    description: 'Agent building/compiling',
    duration: 5,
    prompt: 'Constructive magical workshop, 8-bit loop. Rhythmic hammering on enchanted anvil, gears clicking, magical welding sparks, assembling sounds. Industrious forge energy, loopable.',
    loop: true,
  },
  {
    filename: 'amb_agent_testing.wav',
    category: 'agents',
    description: 'Agent running tests',
    duration: 5,
    prompt: 'Quality-checking magical sounds, 8-bit loop. Spell-verification clicks, checkmark chimes, occasional scanning sweeps, methodical testing rhythm. Laboratory precision energy, loopable.',
    loop: true,
  },

  // ============================================
  // QUEST & PROGRESS SOUNDS (9)
  // ============================================
  {
    filename: 'sfx_quest_start.wav',
    category: 'quests',
    description: 'Quest begins',
    duration: 0.8,
    prompt: 'Adventure beginning fanfare, 8-bit. Royal scroll unfurling combined with quest accepted trumpet call. Heroic but brief, exciting anticipation, the call to adventure. Classic RPG quest acceptance sound.',
  },
  {
    filename: 'sfx_quest_complete.wav',
    category: 'quests',
    description: 'Quest completed',
    duration: 1.2,
    prompt: 'Triumphant victory fanfare, 8-bit. Full celebration - ascending notes building to glorious resolution, sparkles and stars, treasure-found joy. The feeling of defeating a boss, shorter but equally satisfying.',
  },
  {
    filename: 'sfx_quest_fail.wav',
    category: 'quests',
    description: 'Quest failed',
    duration: 0.9,
    prompt: 'Sympathetic failure sound, 8-bit. Not harsh game-over, more try again encouraging. Descending notes with slight wobble, magical fizzle, but gentle landing. Disappointment without devastation.',
  },
  {
    filename: 'sfx_quest_pending.wav',
    category: 'quests',
    description: 'Quest needs review',
    duration: 0.7,
    prompt: 'Attention-needed bell, 8-bit. Like a magical assistant politely clearing throat. Gentle chime sequence that says when you have a moment, not urgent but noticeable. Scroll-ready-for-review energy.',
  },
  {
    filename: 'sfx_xp_gain.wav',
    category: 'quests',
    description: 'XP gained',
    duration: 0.6,
    prompt: 'Experience points collection, 8-bit. Satisfying coin-like pickup combined with growth sparkle. Rising pitch indicating accumulation, like collecting glowing orbs that absorb into you. Addictively satisfying.',
  },
  {
    filename: 'sfx_level_up.wav',
    category: 'quests',
    description: 'Agent levels up',
    duration: 2.0,
    prompt: 'Major level-up celebration, 8-bit. Full power-up sequence - energy building, breakthrough moment, new power surging, triumphant resolution. Classic RPG level-up with magical flair, memorable and exciting.',
  },
  {
    filename: 'sfx_talent_unlock.wav',
    category: 'quests',
    description: 'Talent point spent',
    duration: 0.8,
    prompt: 'New ability learned, 8-bit. Skill tree node activating, knowledge crystallizing, power pathway opening. Enlightenment combined with empowerment, magical click of understanding.',
  },
  {
    filename: 'sfx_loot_reveal.wav',
    category: 'quests',
    description: 'Loot/artifact revealed',
    duration: 0.7,
    prompt: 'Treasure discovery, 8-bit. Chest creaking open with golden light spilling out, magical items gleaming. Wonder and excitement, ooh what did I get anticipation.',
  },
  {
    filename: 'sfx_loot_collect.wav',
    category: 'quests',
    description: 'Collecting loot',
    duration: 0.5,
    prompt: 'Item pickup, 8-bit. Satisfying grab-and-pocket sound, magical item absorbed into inventory. Quick but rewarding, the got it confirmation.',
  },

  // ============================================
  // CONNECTION & SYSTEM SOUNDS (8)
  // ============================================
  {
    filename: 'sfx_connect_start.wav',
    category: 'connection',
    description: 'Initiating connection',
    duration: 0.6,
    prompt: 'Portal dialing sequence, 8-bit. Playful homage to dial-up modems but magical - crystal frequencies aligning, searching for destination. Anticipatory connection-seeking energy.',
  },
  {
    filename: 'sfx_connect_success.wav',
    category: 'connection',
    description: 'Connection established',
    duration: 0.8,
    prompt: 'Successful magical link, 8-bit. Two points connecting with energy bridge forming, handshake complete, stable connection confirmed. Satisfying locked in feeling, portal stabilized.',
  },
  {
    filename: 'sfx_connect_fail.wav',
    category: 'connection',
    description: 'Connection failed',
    duration: 0.7,
    prompt: 'Portal connection disrupted, 8-bit. Energy reaching but not connecting, fizzling out, static-like magical interference. Frustrating but not harsh, try again quality.',
  },
  {
    filename: 'sfx_disconnect.wav',
    category: 'connection',
    description: 'Disconnected',
    duration: 0.6,
    prompt: 'Link severed, 8-bit. Energy bridge collapsing, portal winking out, connection thread snapping gently. Clean disconnection, not violent - controlled shutdown.',
  },
  {
    filename: 'sfx_reconnect.wav',
    category: 'connection',
    description: 'Reconnecting',
    duration: 0.5,
    prompt: 'Portal flickering back, 8-bit. Quick re-establishment attempt, hopeful energy rebuilding, retry in progress. Determined reconnection effort.',
  },
  {
    filename: 'sfx_scan_start.wav',
    category: 'connection',
    description: 'Camera activated',
    duration: 0.5,
    prompt: 'Magical scanner powering up, 8-bit. Crystal lens focusing, scanning field activating, ready-to-read energy. Technical magic combining with ancient runes.',
  },
  {
    filename: 'sfx_scan_success.wav',
    category: 'connection',
    description: 'QR code recognized',
    duration: 0.6,
    prompt: 'Pattern recognized, 8-bit. Magical match found confirmation, runes aligning and glowing, successful decode. Triumphant recognition beep with magical flair.',
  },
  {
    filename: 'sfx_scan_fail.wav',
    category: 'connection',
    description: 'Invalid QR code',
    duration: 0.5,
    prompt: 'Pattern rejected, 8-bit. Runes not matching, confused scanning energy, gentle rejection tone. That is not quite right but encouraging retry.',
  },

  // ============================================
  // NOTIFICATION SOUNDS (5)
  // ============================================
  {
    filename: 'sfx_notif_quest.wav',
    category: 'notifications',
    description: 'Quest notification',
    duration: 1.0,
    prompt: 'New quest available alert, 8-bit. Scroll materializing with magical seal, adventure calling, urgent but exciting. A new task awaits energy, impossible to ignore but pleasant.',
  },
  {
    filename: 'sfx_notif_input.wav',
    category: 'notifications',
    description: 'Agent needs input',
    duration: 0.8,
    prompt: 'Help requested chime, 8-bit. Gentle but persistent, like a familiar chirping for attention. Question mark energy, I need your guidance quality, friendly not demanding.',
  },
  {
    filename: 'sfx_notif_error.wav',
    category: 'notifications',
    description: 'Error notification',
    duration: 0.9,
    prompt: 'Problem alert, 8-bit. Warning bell with concerned quality, something needs attention. Not scary, more heads up - concerned friend tapping shoulder.',
  },
  {
    filename: 'sfx_notif_success.wav',
    category: 'notifications',
    description: 'Success notification',
    duration: 0.7,
    prompt: 'Good news chime, 8-bit. Quick positive confirmation, celebration sparkle, all is well energy. Brief but clearly happy, green checkmark sound.',
  },
  {
    filename: 'sfx_notif_level.wav',
    category: 'notifications',
    description: 'Level up notification',
    duration: 1.2,
    prompt: 'Achievement unlocked fanfare, 8-bit. Celebratory trumpets, stars and sparkles, power-up acknowledgment. Exciting news delivery, something great happened energy.',
  },

  // ============================================
  // SPIRE AMBIENCE (3)
  // ============================================
  {
    filename: 'amb_spire_day.wav',
    category: 'ambient',
    description: 'Daytime spire ambience',
    duration: 10,
    prompt: 'Peaceful magical tower by day, 8-bit loop. Gentle wind through enchanted windows, distant bird chirps in chiptune style, soft magical hum of the tower energy, occasional wind chime. Serene, productive daytime energy, seamlessly loopable.',
    loop: true,
  },
  {
    filename: 'amb_spire_night.wav',
    category: 'ambient',
    description: 'Nighttime spire ambience',
    duration: 10,
    prompt: 'Mystical tower at night, 8-bit loop. Crickets in chiptune style, occasional owl hoot, stars twinkling musically, deep magical resonance, mysterious but safe. Cozy nighttime study session energy, loopable.',
    loop: true,
  },
  {
    filename: 'amb_spire_sunset.wav',
    category: 'ambient',
    description: 'Sunset spire ambience',
    duration: 10,
    prompt: 'Golden hour at the tower, 8-bit loop. Transition energy - day creatures settling, evening magic awakening, warm glowing tones, peaceful transition time. Magic hour wonder, loopable.',
    loop: true,
  },

  // ============================================
  // CHAMBER AMBIENCE (6)
  // ============================================
  {
    filename: 'amb_chamber_mage.wav',
    category: 'ambient',
    description: 'Mage chamber',
    duration: 10,
    prompt: 'Arcane wizard study, 8-bit loop. Bubbling potion cauldrons, crackling magical energy, ancient tome pages rustling, occasional spell spark. Purple magical energy, mysterious scholarly vibes, loopable.',
    loop: true,
  },
  {
    filename: 'amb_chamber_architect.wav',
    category: 'ambient',
    description: 'Architect chamber',
    duration: 10,
    prompt: 'Blueprint drafting room, 8-bit loop. Compass clicks, ruler sliding, paper rustling, thoughtful hmm tones, building planning energy. Creative design space, organized thinking sounds, loopable.',
    loop: true,
  },
  {
    filename: 'amb_chamber_engineer.wav',
    category: 'ambient',
    description: 'Engineer chamber',
    duration: 10,
    prompt: 'Mechanical workshop, 8-bit loop. Gears turning, steam hissing, wrench clinks, machinery humming, inventive energy. Steampunk-adjacent magical engineering, productive mechanical sounds, loopable.',
    loop: true,
  },
  {
    filename: 'amb_chamber_scout.wav',
    category: 'ambient',
    description: 'Scout chamber',
    duration: 10,
    prompt: 'Explorer navigation room, 8-bit loop. Maps unfurling, compass needle spinning, distant adventure calls, owl familiar hooting, world-discovery energy. Adventure planning ambience, loopable.',
    loop: true,
  },
  {
    filename: 'amb_chamber_guardian.wav',
    category: 'ambient',
    description: 'Guardian chamber',
    duration: 10,
    prompt: 'Knight armory, 8-bit loop. Sword sharpening, armor clinking, fire crackling in hearth, vigilant protective energy. Noble guardian quarters, strength and honor vibes, loopable.',
    loop: true,
  },
  {
    filename: 'amb_chamber_artisan.wav',
    category: 'ambient',
    description: 'Artisan chamber',
    duration: 10,
    prompt: 'Magical craftsperson studio, 8-bit loop. Brush strokes, gem polishing, delicate enchanting work, creative magical crafting sounds. Artistic creation space, beauty-making energy, loopable.',
    loop: true,
  },

  // ============================================
  // ONBOARDING SOUNDS (3)
  // ============================================
  {
    filename: 'sfx_onboard_welcome.wav',
    category: 'onboarding',
    description: 'Welcome screen',
    duration: 1.0,
    prompt: 'Grand magical welcome, 8-bit. Castle gates opening, fanfare of introduction, welcome to the adventure energy. Impressive first impression, exciting beginning, inviting and warm.',
  },
  {
    filename: 'sfx_onboard_step.wav',
    category: 'onboarding',
    description: 'Progress to next step',
    duration: 0.6,
    prompt: 'Tutorial progression, 8-bit. Page turning combined with progress chime, moving forward in the journey. Good job next chapter energy, encouraging advancement.',
  },
  {
    filename: 'sfx_onboard_complete.wav',
    category: 'onboarding',
    description: 'Onboarding complete',
    duration: 1.5,
    prompt: 'Tutorial completion celebration, 8-bit. You are ready fanfare, graduation ceremony energy, adventure truly beginning now. Triumphant sendoff into the real experience, exciting launch moment.',
  },

  // ============================================
  // SPECIAL EFFECTS (8)
  // ============================================
  {
    filename: 'sfx_magic_sparkle.wav',
    category: 'effects',
    description: 'Magic sparkle effect',
    duration: 0.5,
    prompt: 'Fairy dust twinkle, 8-bit. Brief magical shimmer, stars glinting, pixie energy. Quick decorative magic, ooh pretty quality, light and delightful.',
  },
  {
    filename: 'sfx_magic_rune.wav',
    category: 'effects',
    description: 'Rune activation',
    duration: 0.6,
    prompt: 'Ancient symbol glowing to life, 8-bit. Stone carving filling with light, old magic awakening, power circuit completing. Mysterious activation, ancient meeting modern.',
  },
  {
    filename: 'sfx_magic_portal.wav',
    category: 'effects',
    description: 'Portal effect',
    duration: 0.8,
    prompt: 'Dimensional gateway opening, 8-bit. Reality bending, energy swirling, passage between realms. Impressive transportation magic, wonder and slight vertigo.',
  },
  {
    filename: 'sfx_magic_float.wav',
    category: 'effects',
    description: 'Floating/levitation',
    duration: 0.7,
    prompt: 'Antigravity activation, 8-bit. Weightlessness achieved, gentle hovering, defying physics magically. Floaty dreamlike quality, serene suspension.',
  },
  {
    filename: 'sfx_success.wav',
    category: 'effects',
    description: 'General success',
    duration: 0.5,
    prompt: 'Universal positive confirmation, 8-bit. Quick green checkmark energy, yes that worked, satisfying completion. Brief but clear approval tone.',
  },
  {
    filename: 'sfx_error.wav',
    category: 'effects',
    description: 'General error',
    duration: 0.5,
    prompt: 'Universal gentle error, 8-bit. Quick red X energy, that did not work, but not harsh. Informative negative, encouraging retry.',
  },
  {
    filename: 'sfx_warning.wav',
    category: 'effects',
    description: 'Warning',
    duration: 0.6,
    prompt: 'Caution alert, 8-bit. Yellow warning triangle energy, be careful here, attention-getting but not alarming. Prudent heads-up notification.',
  },
  {
    filename: 'sfx_info.wav',
    category: 'effects',
    description: 'Information',
    duration: 0.5,
    prompt: 'Neutral information chime, 8-bit. Blue info circle energy, FYI, no positive or negative charge. Just here is something to know notification.',
  },
];

// Create directory structure
function createDirectories() {
  const categories = ['ui', 'agents', 'quests', 'connection', 'notifications', 'ambient', 'onboarding', 'effects'];

  for (const category of categories) {
    const dir = path.join(OUTPUT_BASE, category);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`Created directory: ${dir}`);
    }
  }
}

// Generate a single sound
async function generateSound(sound: SoundSpec): Promise<boolean> {
  const outputPath = path.join(OUTPUT_BASE, sound.category, sound.filename);

  // Skip if already exists
  if (fs.existsSync(outputPath)) {
    console.log(`⏭️  Skipping ${sound.filename} (already exists)`);
    return true;
  }

  console.log(`🎵 Generating: ${sound.filename} (${sound.description})`);

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'xi-api-key': API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: sound.prompt,
        duration_seconds: sound.duration,
        prompt_influence: 0.5,
        model_id: 'eleven_text_to_sound_v2',
        ...(sound.loop ? { loop: true } : {}),
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ Failed to generate ${sound.filename}: ${response.status} - ${errorText}`);
      return false;
    }

    const audioBuffer = await response.arrayBuffer();
    fs.writeFileSync(outputPath, Buffer.from(audioBuffer));
    console.log(`✅ Generated: ${sound.filename}`);
    return true;
  } catch (error) {
    console.error(`❌ Error generating ${sound.filename}:`, error);
    return false;
  }
}

// Rate limiting helper
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Main execution
async function main() {
  console.log('🏰 Arcane Spire Sound Generator');
  console.log('================================\n');
  console.log(`Total sounds to generate: ${SOUNDS.length}\n`);

  createDirectories();

  let successCount = 0;
  let failCount = 0;
  let skipCount = 0;

  for (let i = 0; i < SOUNDS.length; i++) {
    const sound = SOUNDS[i];
    console.log(`\n[${i + 1}/${SOUNDS.length}] Processing ${sound.category}/${sound.filename}`);

    const outputPath = path.join(OUTPUT_BASE, sound.category, sound.filename);
    if (fs.existsSync(outputPath)) {
      skipCount++;
      console.log(`⏭️  Skipping (already exists)`);
      continue;
    }

    const success = await generateSound(sound);
    if (success) {
      successCount++;
    } else {
      failCount++;
    }

    // Rate limiting - wait 1 second between requests to avoid hitting API limits
    if (i < SOUNDS.length - 1) {
      await sleep(1000);
    }
  }

  console.log('\n================================');
  console.log('🎉 Sound Generation Complete!');
  console.log(`✅ Generated: ${successCount}`);
  console.log(`⏭️  Skipped: ${skipCount}`);
  console.log(`❌ Failed: ${failCount}`);
  console.log(`📁 Output: ${OUTPUT_BASE}`);
}

main().catch(console.error);
