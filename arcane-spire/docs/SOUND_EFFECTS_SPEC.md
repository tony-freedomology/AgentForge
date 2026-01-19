# Arcane Spire Sound Effects Specification

This document specifies all sound effects needed for the Arcane Spire mobile app.
These sounds should be generated as 8-bit/chiptune style audio files to match the pixel art aesthetic.

## Audio Format Requirements

- **Format**: WAV or MP3 (prefer WAV for quality, MP3 for size optimization)
- **Sample Rate**: 44.1kHz
- **Bit Depth**: 16-bit
- **Duration**: Most effects should be 0.1-1.0 seconds, ambient loops 5-10 seconds
- **Style**: 8-bit/chiptune/retro fantasy RPG aesthetic

---

## UI Interaction Sounds

### Basic Interactions

| Filename | Description | Duration | Generation Prompt |
|----------|-------------|----------|-------------------|
| `sfx_tap.wav` | Default tap/button press | 0.1s | "8-bit stone button click sound, like pressing a carved rune on ancient stone. Short, tactile, satisfying click with slight magical resonance. Think Legend of Zelda menu selection meets dungeon stone mechanism." |
| `sfx_tap_secondary.wav` | Secondary/soft tap | 0.1s | "Soft 8-bit tap sound, gentler version of stone button. Like touching a magical scroll or parchment. Muted, papery, with subtle arcane undertone." |
| `sfx_swipe.wav` | Swipe gesture | 0.2s | "Retro whoosh sound for card swiping, like a wizard quickly flipping through spell cards. Airy 8-bit sweep with magical trail, ascending pitch." |
| `sfx_toggle_on.wav` | Toggle switch on | 0.15s | "Magical activation chime, 8-bit style. Like lighting a magical crystal or activating a rune. Rising two-note chime with sparkle, bright and affirmative." |
| `sfx_toggle_off.wav` | Toggle switch off | 0.15s | "Magical deactivation sound, 8-bit. Like a crystal dimming or rune going dormant. Descending two-note tone, softer and settling, slight fade." |
| `sfx_expand.wav` | Panel/dock expand | 0.3s | "Stone panel sliding open with magical reveal. 8-bit grinding stone sound transitioning to arcane shimmer. Like a secret passage opening in a wizard's tower." |
| `sfx_collapse.wav` | Panel/dock collapse | 0.25s | "Stone panel sliding closed, 8-bit. Reverse of expand - arcane shimmer fading into stone settling. Solid, final 'thunk' at end." |
| `sfx_scroll_tick.wav` | Scroll snap/tick | 0.05s | "Extremely short 8-bit tick, like a magical clockwork mechanism. Single click of an enchanted gear or rune alignment. Barely perceptible but satisfying." |

### Navigation

| Filename | Description | Duration | Generation Prompt |
|----------|-------------|----------|-------------------|
| `sfx_nav_tab.wav` | Tab bar navigation | 0.15s | "Magical page turn combined with location shift. 8-bit sound like teleporting between rooms in a tower. Spatial whoosh with destination chime, distinct from regular tap." |
| `sfx_nav_back.wav` | Navigate back | 0.2s | "Reversed magical whoosh, 8-bit. Like stepping back through a portal or rewinding a spell. Descending pitch sweep with slight rewind quality." |
| `sfx_modal_open.wav` | Modal/sheet opening | 0.3s | "Mystical portal opening, 8-bit style. Swirling energy coalescing into view. Rising pitch with crystalline shimmer, like a magical window materializing." |
| `sfx_modal_close.wav` | Modal/sheet closing | 0.25s | "Mystical portal closing, 8-bit. Energy dispersing and fading. Descending crystalline tones dissolving into silence, gentle conclusion." |

---

## Agent Sounds

### Status Changes

| Filename | Description | Duration | Generation Prompt |
|----------|-------------|----------|-------------------|
| `sfx_agent_spawn.wav` | Agent spawning/materializing | 1.0s | "Epic 8-bit summoning sequence. Magical energy gathering from multiple points, swirling together, then crystallizing into form. Start ethereal and scattered, build to solid materialization with triumphant final note. Like summoning a familiar in a classic RPG." |
| `sfx_agent_awaken.wav` | Agent awakening from dormant | 0.5s | "Gentle magical awakening, 8-bit. Like eyes opening with inner light, energy slowly flowing back. Soft rising tones, yawning quality, building to alert readiness. Dawn-like quality." |
| `sfx_agent_channeling.wav` | Start channeling/working | 0.4s | "Magical energy building and focusing, 8-bit. Like a wizard beginning to cast a complex spell. Power gathering, humming intensity increasing, ready-to-work energy." |
| `sfx_agent_dormant.wav` | Agent going dormant | 0.4s | "Magical wind-down, 8-bit. Energy settling, like a golem gently powering down. Descending peaceful tones, soft landing, dreamy fade. Cozy sleep quality." |
| `sfx_agent_waiting.wav` | Agent needs attention | 0.5s | "Curious questioning chime, 8-bit. Like a familiar tilting its head and chirping for guidance. Gentle but attention-getting, rising inflection like a question mark, friendly not urgent." |
| `sfx_agent_error.wav` | Agent error state | 0.5s | "Discordant magical disruption, 8-bit. Like a spell fizzling or enchantment breaking. Crackling energy, off-key notes, slight alarm quality but not harsh. Concerned, not catastrophic." |

### Agent Activities (Ambient Loops)

| Filename | Description | Duration | Generation Prompt |
|----------|-------------|----------|-------------------|
| `amb_agent_thinking.wav` | Agent thinking loop | 5s | "Contemplative magical ambience, 8-bit loop. Soft bubbling like a witch's cauldron of ideas, occasional sparkle chimes like lightbulb moments, gentle humming undertone of concentration. Peaceful intellectual energy, seamlessly loopable." |
| `amb_agent_writing.wav` | Agent writing/coding loop | 5s | "Productive magical scribing, 8-bit loop. Rhythmic quill-scratch patterns mixed with soft keyboard-like taps, occasional scroll unfurling sounds, ink-flow magic. Steady productive cadence, loopable." |
| `amb_agent_reading.wav` | Agent reading/researching | 5s | "Studious magical ambience, 8-bit loop. Page turning sounds, soft 'aha' chimes, magnifying glass focusing sounds, ancient tome energy. Library-like contemplative mood, loopable." |
| `amb_agent_building.wav` | Agent building/compiling | 5s | "Constructive magical workshop, 8-bit loop. Rhythmic hammering on enchanted anvil, gears clicking, magical welding sparks, assembling sounds. Industrious forge energy, loopable." |
| `amb_agent_testing.wav` | Agent running tests | 5s | "Quality-checking magical sounds, 8-bit loop. Spell-verification clicks, checkmark chimes, occasional 'scanning' sweeps, methodical testing rhythm. Laboratory precision energy, loopable." |

---

## Quest & Progress Sounds

### Quest Events

| Filename | Description | Duration | Generation Prompt |
|----------|-------------|----------|-------------------|
| `sfx_quest_start.wav` | Quest begins | 0.6s | "Adventure beginning fanfare, 8-bit. Royal scroll unfurling combined with 'quest accepted' trumpet call. Heroic but brief, exciting anticipation, the call to adventure. Classic RPG quest acceptance sound." |
| `sfx_quest_complete.wav` | Quest completed | 1.0s | "Triumphant victory fanfare, 8-bit. Full celebration - ascending notes building to glorious resolution, sparkles and stars, treasure-found joy. The feeling of defeating a boss, shorter but equally satisfying." |
| `sfx_quest_fail.wav` | Quest failed | 0.7s | "Sympathetic failure sound, 8-bit. Not harsh game-over, more 'try again' encouraging. Descending notes with slight wobble, magical fizzle, but gentle landing. Disappointment without devastation." |
| `sfx_quest_pending.wav` | Quest needs review | 0.5s | "Attention-needed bell, 8-bit. Like a magical assistant politely clearing throat. Gentle chime sequence that says 'when you have a moment', not urgent but noticeable. Scroll-ready-for-review energy." |

### Progress & Rewards

| Filename | Description | Duration | Generation Prompt |
|----------|-------------|----------|-------------------|
| `sfx_xp_gain.wav` | XP gained | 0.4s | "Experience points collection, 8-bit. Satisfying coin-like pickup combined with growth sparkle. Rising pitch indicating accumulation, like collecting glowing orbs that absorb into you. Addictively satisfying." |
| `sfx_level_up.wav` | Agent levels up | 1.5s | "Major level-up celebration, 8-bit. Full power-up sequence - energy building, breakthrough moment, new power surging, triumphant resolution. Classic RPG level-up with magical flair, memorable and exciting." |
| `sfx_talent_unlock.wav` | Talent point spent | 0.6s | "New ability learned, 8-bit. Skill tree node activating, knowledge crystallizing, power pathway opening. Enlightenment combined with empowerment, magical 'click' of understanding." |
| `sfx_loot_reveal.wav` | Loot/artifact revealed | 0.5s | "Treasure discovery, 8-bit. Chest creaking open with golden light spilling out, magical items gleaming. Wonder and excitement, 'ooh what did I get' anticipation." |
| `sfx_loot_collect.wav` | Collecting loot | 0.3s | "Item pickup, 8-bit. Satisfying grab-and-pocket sound, magical item absorbed into inventory. Quick but rewarding, the 'got it' confirmation." |

---

## Connection & System Sounds

### Connection Status

| Filename | Description | Duration | Generation Prompt |
|----------|-------------|----------|-------------------|
| `sfx_connect_start.wav` | Initiating connection | 0.4s | "Portal dialing sequence, 8-bit. Playful homage to dial-up modems but magical - crystal frequencies aligning, searching for destination. Anticipatory connection-seeking energy." |
| `sfx_connect_success.wav` | Connection established | 0.6s | "Successful magical link, 8-bit. Two points connecting with energy bridge forming, handshake complete, stable connection confirmed. Satisfying 'locked in' feeling, portal stabilized." |
| `sfx_connect_fail.wav` | Connection failed | 0.5s | "Portal connection disrupted, 8-bit. Energy reaching but not connecting, fizzling out, static-like magical interference. Frustrating but not harsh, 'try again' quality." |
| `sfx_disconnect.wav` | Disconnected | 0.4s | "Link severed, 8-bit. Energy bridge collapsing, portal winking out, connection thread snapping gently. Clean disconnection, not violent - controlled shutdown." |
| `sfx_reconnect.wav` | Reconnecting | 0.3s | "Portal flickering back, 8-bit. Quick re-establishment attempt, hopeful energy rebuilding, retry in progress. Determined reconnection effort." |

### QR & Scanning

| Filename | Description | Duration | Generation Prompt |
|----------|-------------|----------|-------------------|
| `sfx_scan_start.wav` | Camera activated | 0.3s | "Magical scanner powering up, 8-bit. Crystal lens focusing, scanning field activating, ready-to-read energy. Technical magic combining with ancient runes." |
| `sfx_scan_success.wav` | QR code recognized | 0.4s | "Pattern recognized, 8-bit. Magical 'match found' confirmation, runes aligning and glowing, successful decode. Triumphant recognition beep with magical flair." |
| `sfx_scan_fail.wav` | Invalid QR code | 0.3s | "Pattern rejected, 8-bit. Runes not matching, confused scanning energy, gentle rejection tone. 'That's not quite right' but encouraging retry." |

---

## Notification Sounds

### Alerts

| Filename | Description | Duration | Generation Prompt |
|----------|-------------|----------|-------------------|
| `sfx_notif_quest.wav` | Quest notification | 0.8s | "New quest available alert, 8-bit. Scroll materializing with magical seal, adventure calling, urgent but exciting. 'A new task awaits!' energy, impossible to ignore but pleasant." |
| `sfx_notif_input.wav` | Agent needs input | 0.6s | "Help requested chime, 8-bit. Gentle but persistent, like a familiar chirping for attention. Question mark energy, 'I need your guidance' quality, friendly not demanding." |
| `sfx_notif_error.wav` | Error notification | 0.7s | "Problem alert, 8-bit. Warning bell with concerned quality, something needs attention. Not scary, more 'heads up' - concerned friend tapping shoulder." |
| `sfx_notif_success.wav` | Success notification | 0.5s | "Good news chime, 8-bit. Quick positive confirmation, celebration sparkle, 'all is well' energy. Brief but clearly happy, green checkmark sound." |
| `sfx_notif_level.wav` | Level up notification | 1.0s | "Achievement unlocked fanfare, 8-bit. Celebratory trumpets, stars and sparkles, power-up acknowledgment. Exciting news delivery, 'something great happened!' energy." |

---

## Ambient & Environment Sounds

### Spire Ambience

| Filename | Description | Duration | Generation Prompt |
|----------|-------------|----------|-------------------|
| `amb_spire_day.wav` | Daytime spire ambience | 10s | "Peaceful magical tower by day, 8-bit loop. Gentle wind through enchanted windows, distant bird chirps (chiptune birds), soft magical hum of the tower's energy, occasional wind chime. Serene, productive daytime energy, seamlessly loopable." |
| `amb_spire_night.wav` | Nighttime spire ambience | 10s | "Mystical tower at night, 8-bit loop. Crickets (chiptune style), occasional owl hoot, stars twinkling musically, deep magical resonance, mysterious but safe. Cozy nighttime study session energy, loopable." |
| `amb_spire_sunset.wav` | Sunset spire ambience | 10s | "Golden hour at the tower, 8-bit loop. Transition energy - day creatures settling, evening magic awakening, warm glowing tones, peaceful transition time. Magic hour wonder, loopable." |

### Chamber Ambience (Per Agent Class)

| Filename | Description | Duration | Generation Prompt |
|----------|-------------|----------|-------------------|
| `amb_chamber_mage.wav` | Mage chamber | 10s | "Arcane wizard's study, 8-bit loop. Bubbling potion cauldrons, crackling magical energy, ancient tome pages rustling, occasional spell spark. Purple magical energy, mysterious scholarly vibes, loopable." |
| `amb_chamber_architect.wav` | Architect chamber | 10s | "Blueprint drafting room, 8-bit loop. Compass clicks, ruler sliding, paper rustling, thoughtful 'hmm' tones, building planning energy. Creative design space, organized thinking sounds, loopable." |
| `amb_chamber_engineer.wav` | Engineer chamber | 10s | "Mechanical workshop, 8-bit loop. Gears turning, steam hissing, wrench clinks, machinery humming, inventive energy. Steampunk-adjacent magical engineering, productive mechanical sounds, loopable." |
| `amb_chamber_scout.wav` | Scout chamber | 10s | "Explorer's navigation room, 8-bit loop. Maps unfurling, compass needle spinning, distant adventure calls, owl familiar hooting, world-discovery energy. Adventure planning ambience, loopable." |
| `amb_chamber_guardian.wav` | Guardian chamber | 10s | "Knight's armory, 8-bit loop. Sword sharpening, armor clinking, fire crackling in hearth, vigilant protective energy. Noble guardian's quarters, strength and honor vibes, loopable." |
| `amb_chamber_artisan.wav` | Artisan chamber | 10s | "Magical craftsperson's studio, 8-bit loop. Brush strokes, gem polishing, delicate enchanting work, creative magical crafting sounds. Artistic creation space, beauty-making energy, loopable." |

---

## Onboarding Sounds

| Filename | Description | Duration | Generation Prompt |
|----------|-------------|----------|-------------------|
| `sfx_onboard_welcome.wav` | Welcome screen | 0.8s | "Grand magical welcome, 8-bit. Castle gates opening, fanfare of introduction, 'welcome to the adventure' energy. Impressive first impression, exciting beginning, inviting and warm." |
| `sfx_onboard_step.wav` | Progress to next step | 0.4s | "Tutorial progression, 8-bit. Page turning combined with progress chime, moving forward in the journey. 'Good job, next chapter' energy, encouraging advancement." |
| `sfx_onboard_complete.wav` | Onboarding complete | 1.2s | "Tutorial completion celebration, 8-bit. 'You're ready!' fanfare, graduation ceremony energy, adventure truly beginning now. Triumphant sendoff into the real experience, exciting launch moment." |

---

## Special Effects

### Magical Effects

| Filename | Description | Duration | Generation Prompt |
|----------|-------------|----------|-------------------|
| `sfx_magic_sparkle.wav` | Magic sparkle effect | 0.3s | "Fairy dust twinkle, 8-bit. Brief magical shimmer, stars glinting, pixie energy. Quick decorative magic, 'ooh pretty' quality, light and delightful." |
| `sfx_magic_rune.wav` | Rune activation | 0.4s | "Ancient symbol glowing to life, 8-bit. Stone carving filling with light, old magic awakening, power circuit completing. Mysterious activation, ancient meeting modern." |
| `sfx_magic_portal.wav` | Portal effect | 0.6s | "Dimensional gateway opening, 8-bit. Reality bending, energy swirling, passage between realms. Impressive transportation magic, wonder and slight vertigo." |
| `sfx_magic_float.wav` | Floating/levitation | 0.5s | "Antigravity activation, 8-bit. Weightlessness achieved, gentle hovering, defying physics magically. Floaty dreamlike quality, serene suspension." |

### Feedback Sounds

| Filename | Description | Duration | Generation Prompt |
|----------|-------------|----------|-------------------|
| `sfx_success.wav` | General success | 0.3s | "Universal positive confirmation, 8-bit. Quick green checkmark energy, 'yes that worked', satisfying completion. Brief but clear approval tone." |
| `sfx_error.wav` | General error | 0.3s | "Universal gentle error, 8-bit. Quick red X energy, 'that didn't work', but not harsh. Informative negative, encouraging retry." |
| `sfx_warning.wav` | Warning | 0.4s | "Caution alert, 8-bit. Yellow warning triangle energy, 'be careful here', attention-getting but not alarming. Prudent heads-up notification." |
| `sfx_info.wav` | Information | 0.3s | "Neutral information chime, 8-bit. Blue info circle energy, 'FYI', no positive or negative charge. Just 'here's something to know' notification." |

---

## File Organization

All sound files should be placed in:
```
arcane-spire/assets/sounds/
├── ui/                    # UI interaction sounds
│   ├── sfx_tap.wav
│   ├── sfx_toggle_on.wav
│   └── ...
├── agents/                # Agent-related sounds
│   ├── sfx_agent_spawn.wav
│   ├── amb_agent_thinking.wav
│   └── ...
├── quests/                # Quest & progress sounds
│   ├── sfx_quest_complete.wav
│   ├── sfx_xp_gain.wav
│   └── ...
├── connection/            # Connection sounds
│   ├── sfx_connect_success.wav
│   ├── sfx_scan_success.wav
│   └── ...
├── notifications/         # Notification sounds
│   ├── sfx_notif_quest.wav
│   └── ...
├── ambient/               # Ambient loops
│   ├── amb_spire_day.wav
│   ├── amb_chamber_mage.wav
│   └── ...
├── onboarding/            # Onboarding sounds
│   └── ...
└── effects/               # Special effects
    ├── sfx_magic_sparkle.wav
    └── ...
```

---

## Implementation Notes

### Sound Service Integration

The app already has a `soundService` in `arcane-spire/services/sound.ts` that should be extended to support these sounds. Current implementation uses:

```typescript
soundService.play('tap');        // Play tap sound
soundService.play('spawn');      // Play spawn sound
soundService.playHaptic('medium'); // Play haptic feedback
```

### Global Style Direction for AI Generation

When generating ALL sounds, maintain these consistent qualities:

1. **Bit Depth Feel**: Classic 8-bit/16-bit era sound chips (NES, SNES, Game Boy). Not modern "chiptune" that's too clean - aim for warm, slightly fuzzy retro character.

2. **Fantasy RPG Tone**: Think classic JRPGs (Final Fantasy, Chrono Trigger, Dragon Quest) meets Western fantasy games (Zelda, Ultima). Magical, medieval, adventurous.

3. **Emotional Warmth**: These sounds accompany a friendly AI companion app. Even error sounds should feel helpful, not punishing. The overall vibe is "cozy magical productivity."

4. **Cohesive Sound World**: All sounds should feel like they exist in the same magical tower. Similar reverb characteristics, related tonal palettes, consistent "room" feel.

5. **Satisfying Physicality**: UI sounds especially should feel tactile - stone buttons, parchment scrolls, crystal chimes. Real materials enchanted with magic.

### Priority Order for Implementation

1. **High Priority** (Core UX):
   - `sfx_tap.wav` - Used everywhere
   - `sfx_agent_spawn.wav` - Agent creation
   - `sfx_quest_complete.wav` - Quest completion
   - `sfx_connect_success.wav` - Connection established
   - `sfx_level_up.wav` - Level up celebration
   - `sfx_notif_input.wav` - Agent needs attention

2. **Medium Priority** (Enhanced UX):
   - All navigation sounds
   - Quest-related sounds
   - Agent status change sounds
   - XP and loot sounds

3. **Lower Priority** (Polish):
   - Ambient loops
   - Chamber-specific ambience
   - Magical effect sounds

---

## Total Sound Count

| Category | Count |
|----------|-------|
| UI Interaction | 12 |
| Navigation | 4 |
| Agent Status | 6 |
| Agent Activities (Ambient) | 5 |
| Quest & Progress | 9 |
| Connection & System | 8 |
| Notifications | 5 |
| Spire Ambience | 3 |
| Chamber Ambience | 6 |
| Onboarding | 3 |
| Special Effects | 8 |
| **Total** | **69** |
