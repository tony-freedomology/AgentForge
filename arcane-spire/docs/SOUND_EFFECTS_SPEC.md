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
| Filename | Description | Duration | Notes |
|----------|-------------|----------|-------|
| `sfx_tap.wav` | Default tap/button press | 0.1s | Short, satisfying click. Like pressing a stone button. |
| `sfx_tap_secondary.wav` | Secondary/soft tap | 0.1s | Softer version for less important buttons |
| `sfx_swipe.wav` | Swipe gesture | 0.2s | Whoosh sound for card swipes |
| `sfx_toggle_on.wav` | Toggle switch on | 0.15s | Magical activation sound |
| `sfx_toggle_off.wav` | Toggle switch off | 0.15s | Deactivation/power down sound |
| `sfx_expand.wav` | Panel/dock expand | 0.3s | Stone sliding open, arcane reveal |
| `sfx_collapse.wav` | Panel/dock collapse | 0.25s | Stone sliding closed |
| `sfx_scroll_tick.wav` | Scroll snap/tick | 0.05s | Very subtle tick for scroll feedback |

### Navigation
| Filename | Description | Duration | Notes |
|----------|-------------|----------|-------|
| `sfx_nav_tab.wav` | Tab bar navigation | 0.15s | Distinct from regular tap, magical page turn |
| `sfx_nav_back.wav` | Navigate back | 0.2s | Reversed/backwards magical whoosh |
| `sfx_modal_open.wav` | Modal/sheet opening | 0.3s | Mystical portal opening |
| `sfx_modal_close.wav` | Modal/sheet closing | 0.25s | Mystical portal closing |

---

## Agent Sounds

### Status Changes
| Filename | Description | Duration | Notes |
|----------|-------------|----------|-------|
| `sfx_agent_spawn.wav` | Agent spawning/materializing | 1.0s | Magical summoning, arcane energy coalescing |
| `sfx_agent_awaken.wav` | Agent awakening from dormant | 0.5s | Gentle wake-up chime, magic stirring |
| `sfx_agent_channeling.wav` | Start channeling/working | 0.4s | Magical energy building |
| `sfx_agent_dormant.wav` | Agent going dormant | 0.4s | Gentle wind-down, magical settling |
| `sfx_agent_waiting.wav` | Agent needs attention | 0.5s | Question chime, gentle alert |
| `sfx_agent_error.wav` | Agent error state | 0.5s | Discordant magical failure sound |

### Agent Activities (Ambient Loops)
| Filename | Description | Duration | Notes |
|----------|-------------|----------|-------|
| `amb_agent_thinking.wav` | Agent thinking loop | 5s | Subtle magical bubbling, soft chimes |
| `amb_agent_writing.wav` | Agent writing/coding loop | 5s | Quill scratching, keyboard-like taps |
| `amb_agent_reading.wav` | Agent reading/researching | 5s | Page turning, soft magical hum |
| `amb_agent_building.wav` | Agent building/compiling | 5s | Hammering, construction, magical forge |
| `amb_agent_testing.wav` | Agent running tests | 5s | Mechanical clicking, spell checking |

---

## Quest & Progress Sounds

### Quest Events
| Filename | Description | Duration | Notes |
|----------|-------------|----------|-------|
| `sfx_quest_start.wav` | Quest begins | 0.6s | Scroll unfurling, quest accepted fanfare |
| `sfx_quest_complete.wav` | Quest completed | 1.0s | Triumphant fanfare, victory chime |
| `sfx_quest_fail.wav` | Quest failed | 0.7s | Sad trombone, failure sound |
| `sfx_quest_pending.wav` | Quest needs review | 0.5s | Attention bell, review needed |

### Progress & Rewards
| Filename | Description | Duration | Notes |
|----------|-------------|----------|-------|
| `sfx_xp_gain.wav` | XP gained | 0.4s | Coin-like collection sound, sparkle |
| `sfx_level_up.wav` | Agent levels up | 1.5s | Major celebration, fanfare, power-up |
| `sfx_talent_unlock.wav` | Talent point spent | 0.6s | Skill learned, power acquired |
| `sfx_loot_reveal.wav` | Loot/artifact revealed | 0.5s | Treasure chest opening, magical reveal |
| `sfx_loot_collect.wav` | Collecting loot | 0.3s | Item pickup, satisfying collect |

---

## Connection & System Sounds

### Connection Status
| Filename | Description | Duration | Notes |
|----------|-------------|----------|-------|
| `sfx_connect_start.wav` | Initiating connection | 0.4s | Portal activating, dial-up homage |
| `sfx_connect_success.wav` | Connection established | 0.6s | Successful link, magical handshake |
| `sfx_connect_fail.wav` | Connection failed | 0.5s | Disrupted portal, failure beep |
| `sfx_disconnect.wav` | Disconnected | 0.4s | Link severed, portal closing |
| `sfx_reconnect.wav` | Reconnecting | 0.3s | Portal flickering, retry attempt |

### QR & Scanning
| Filename | Description | Duration | Notes |
|----------|-------------|----------|-------|
| `sfx_scan_start.wav` | Camera activated | 0.3s | Scanner powering up |
| `sfx_scan_success.wav` | QR code recognized | 0.4s | Successful scan beep, magical recognition |
| `sfx_scan_fail.wav` | Invalid QR code | 0.3s | Error beep, rejection sound |

---

## Notification Sounds

### Alerts
| Filename | Description | Duration | Notes |
|----------|-------------|----------|-------|
| `sfx_notif_quest.wav` | Quest notification | 0.8s | Scroll unfurl, attention chime |
| `sfx_notif_input.wav` | Agent needs input | 0.6s | Question mark sound, help needed |
| `sfx_notif_error.wav` | Error notification | 0.7s | Warning bell, alert sound |
| `sfx_notif_success.wav` | Success notification | 0.5s | Positive chime, task complete |
| `sfx_notif_level.wav` | Level up notification | 1.0s | Celebration fanfare |

---

## Ambient & Environment Sounds

### Spire Ambience
| Filename | Description | Duration | Notes |
|----------|-------------|----------|-------|
| `amb_spire_day.wav` | Daytime spire ambience | 10s | Birds, gentle wind, magical hum (loop) |
| `amb_spire_night.wav` | Nighttime spire ambience | 10s | Crickets, owl, mystical sounds (loop) |
| `amb_spire_sunset.wav` | Sunset spire ambience | 10s | Evening sounds, magic hour (loop) |

### Chamber Ambience (Per Agent Class)
| Filename | Description | Duration | Notes |
|----------|-------------|----------|-------|
| `amb_chamber_mage.wav` | Mage chamber | 10s | Bubbling potions, magical energy, arcane whispers |
| `amb_chamber_architect.wav` | Architect chamber | 10s | Blueprint rustling, compass clicks, drafting |
| `amb_chamber_engineer.wav` | Engineer chamber | 10s | Gears turning, mechanical sounds, steam |
| `amb_chamber_scout.wav` | Scout chamber | 10s | Maps rustling, compass needle, owl hoots |
| `amb_chamber_guardian.wav` | Guardian chamber | 10s | Armor clanking, sword sharpening, fire crackling |
| `amb_chamber_artisan.wav` | Artisan chamber | 10s | Brush strokes, gem polishing, crafting sounds |

---

## Onboarding Sounds

| Filename | Description | Duration | Notes |
|----------|-------------|----------|-------|
| `sfx_onboard_welcome.wav` | Welcome screen | 0.8s | Grand magical introduction |
| `sfx_onboard_step.wav` | Progress to next step | 0.4s | Page turn, progress sound |
| `sfx_onboard_complete.wav` | Onboarding complete | 1.2s | Celebration, ready to begin |

---

## Special Effects

### Magical Effects
| Filename | Description | Duration | Notes |
|----------|-------------|----------|-------|
| `sfx_magic_sparkle.wav` | Magic sparkle effect | 0.3s | Twinkling, fairy dust |
| `sfx_magic_rune.wav` | Rune activation | 0.4s | Ancient symbol glowing |
| `sfx_magic_portal.wav` | Portal effect | 0.6s | Dimensional gateway |
| `sfx_magic_float.wav` | Floating/levitation | 0.5s | Antigravity, hovering |

### Feedback Sounds
| Filename | Description | Duration | Notes |
|----------|-------------|----------|-------|
| `sfx_success.wav` | General success | 0.3s | Positive confirmation |
| `sfx_error.wav` | General error | 0.3s | Negative/error feedback |
| `sfx_warning.wav` | Warning | 0.4s | Caution, attention needed |
| `sfx_info.wav` | Information | 0.3s | Neutral information chime |

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

### Audio Generation Guidelines for Eleven Labs

When generating these sounds with Eleven Labs API:

1. **Style Prompt Suggestions**:
   - "8-bit retro game sound effect, fantasy RPG style"
   - "Chiptune magical spell casting sound"
   - "Pixel art game UI click sound, stone button press"
   - "NES-era victory fanfare, short celebratory jingle"

2. **Quality Settings**:
   - Use highest available quality
   - Ensure clean start/end (no clicks or pops)
   - Normalize audio levels across all files

3. **Consistency**:
   - All sounds should feel cohesive, like they belong in the same game
   - Maintain consistent volume levels
   - Use similar reverb/processing across related sounds

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
