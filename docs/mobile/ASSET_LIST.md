# Arcane Spire: 8-Bit Pixel Art Asset List

## Art Direction

**Style**: 8-bit pixel art inspired by Tiny Tower, Habbo Hotel, and classic RPGs
**Palette**: Vibrant fantasy colors (not muted/desaturated)
**Resolution**: Design at 1x, export at 1x, 2x, 3x for retina
**Format**: PNG with transparency

### Color Palette

| Name | Hex | Usage |
|------|-----|-------|
| Arcane Purple | `#8B5CF6` | Claude agents, magic effects |
| Fel Green | `#22C55E` | OpenAI/Codex agents |
| Frost Blue | `#3B82F6` | Gemini agents |
| Holy Gold | `#F59E0B` | Highlights, achievements, UI accents |
| Fire Orange | `#EF4444` | Errors, alerts, critical states |
| Shadow Black | `#1A1A2E` | Backgrounds, depth |
| Parchment | `#FEF3C7` | Text backgrounds, scrolls |
| Stone Gray | `#6B7280` | Architecture, inactive states |
| Deep Indigo | `#312E81` | Night sky, mystical backgrounds |

---

## 1. Agent Sprites (Per Class)

Each agent class needs a sprite sheet with multiple states. **64x64 pixels** per frame.

### 1.1 Mage (Claude - Purple Theme)
| Asset | Frames | Description |
|-------|--------|-------------|
| `mage_idle.png` | 4 | Standing, subtle breathing animation |
| `mage_working.png` | 6 | Hands raised, casting spell, magic particles |
| `mage_waiting.png` | 4 | Looking around, tapping foot, question mark |
| `mage_complete.png` | 6 | Triumphant pose, sparkles, raised staff |
| `mage_error.png` | 4 | Slumped, worried expression, red aura |
| `mage_sleeping.png` | 4 | Sitting, zzz bubbles (idle timeout) |
| `mage_spawning.png` | 8 | Materializing from portal, fade in |
| `mage_portrait.png` | 1 | Close-up face for UI (32x32) |

### 1.2 Architect (Claude Opus - Royal Purple Theme)
| Asset | Frames | Description |
|-------|--------|-------------|
| `architect_idle.png` | 4 | Standing with blueprints/scroll |
| `architect_working.png` | 6 | Drawing on floating blueprint |
| `architect_waiting.png` | 4 | Examining scroll, pondering |
| `architect_complete.png` | 6 | Presenting finished blueprint |
| `architect_error.png` | 4 | Crumpling paper, frustrated |
| `architect_sleeping.png` | 4 | Dozed off on desk |
| `architect_spawning.png` | 8 | Materializing with scrolls |
| `architect_portrait.png` | 1 | Close-up face (32x32) |

### 1.3 Engineer (OpenAI/Codex - Green Theme)
| Asset | Frames | Description |
|-------|--------|-------------|
| `engineer_idle.png` | 4 | Standing with wrench/gear |
| `engineer_working.png` | 6 | Hammering, sparks flying |
| `engineer_waiting.png` | 4 | Scratching head, looking at schematic |
| `engineer_complete.png` | 6 | Holding up completed device |
| `engineer_error.png` | 4 | Machine exploding, smoke |
| `engineer_sleeping.png` | 4 | Slumped over workbench |
| `engineer_spawning.png` | 8 | Assembling from parts |
| `engineer_portrait.png` | 1 | Close-up face (32x32) |

### 1.4 Scout (Claude - Teal Theme)
| Asset | Frames | Description |
|-------|--------|-------------|
| `scout_idle.png` | 4 | Standing alert, looking around |
| `scout_working.png` | 6 | Running, searching, magnifying glass |
| `scout_waiting.png` | 4 | Crouched, waiting for signal |
| `scout_complete.png` | 6 | Returning with found treasure |
| `scout_error.png` | 4 | Lost, confused, map upside down |
| `scout_sleeping.png` | 4 | Resting against tree |
| `scout_spawning.png` | 8 | Emerging from shadows |
| `scout_portrait.png` | 1 | Close-up face (32x32) |

### 1.5 Guardian (Codex - Silver/Blue Theme)
| Asset | Frames | Description |
|-------|--------|-------------|
| `guardian_idle.png` | 4 | Standing with shield raised |
| `guardian_working.png` | 6 | Defensive stance, scanning |
| `guardian_waiting.png` | 4 | Shield lowered, questioning |
| `guardian_complete.png` | 6 | Saluting, mission complete |
| `guardian_error.png` | 4 | Shield cracked, kneeling |
| `guardian_sleeping.png` | 4 | Sleeping standing up (guard duty) |
| `guardian_spawning.png` | 8 | Materializing in armor |
| `guardian_portrait.png` | 1 | Close-up face (32x32) |

### 1.6 Artisan (Gemini - Blue/Cyan Theme)
| Asset | Frames | Description |
|-------|--------|-------------|
| `artisan_idle.png` | 4 | Holding paintbrush/stylus |
| `artisan_working.png` | 6 | Painting on floating canvas |
| `artisan_waiting.png` | 4 | Stepping back, evaluating |
| `artisan_complete.png` | 6 | Revealing masterpiece |
| `artisan_error.png` | 4 | Paint spilled, frustrated |
| `artisan_sleeping.png` | 4 | Dozed off with brush |
| `artisan_spawning.png` | 8 | Colors swirling into form |
| `artisan_portrait.png` | 1 | Close-up face (32x32) |

---

## 2. Spire Architecture

The tower itself needs distinct visual pieces. **Variable sizes**.

### 2.1 Floor/Chamber Frames
| Asset | Size | Description |
|-------|------|-------------|
| `floor_frame_idle.png` | 320x120 | Stone chamber frame, neutral state |
| `floor_frame_working.png` | 320x120 | Glowing runes, active magical energy |
| `floor_frame_attention.png` | 320x120 | Pulsing border, alert state |
| `floor_frame_complete.png` | 320x120 | Golden glow, celebration state |
| `floor_frame_error.png` | 320x120 | Red cracks, warning state |
| `floor_frame_empty.png` | 320x120 | Vacant chamber, ready for agent |

### 2.2 Spire Structure
| Asset | Size | Description |
|-------|------|-------------|
| `spire_top.png` | 320x160 | Ornate spire peak with crystal |
| `spire_sky_bg.png` | 320x200 | Sky background with clouds, stars |
| `spire_ground.png` | 320x100 | Base/foundation with entrance |
| `spire_connector.png` | 320x20 | Decorative piece between floors |

### 2.3 Chamber Interiors (Background per class)
| Asset | Size | Description |
|-------|------|-------------|
| `chamber_mage.png` | 280x80 | Arcane library, floating books, candles |
| `chamber_architect.png` | 280x80 | Drafting room, blueprints on walls |
| `chamber_engineer.png` | 280x80 | Workshop, gears, steam pipes |
| `chamber_scout.png` | 280x80 | Map room, compass, exploration gear |
| `chamber_guardian.png` | 280x80 | Armory, shields, weapon racks |
| `chamber_artisan.png` | 280x80 | Art studio, easels, color palettes |

---

## 3. UI Elements

### 3.1 Buttons
| Asset | Size | Description |
|-------|------|-------------|
| `btn_primary.png` | 160x48 | Gold/amber main action button |
| `btn_primary_pressed.png` | 160x48 | Pressed state (darker) |
| `btn_secondary.png` | 160x48 | Stone gray secondary button |
| `btn_secondary_pressed.png` | 160x48 | Pressed state |
| `btn_danger.png` | 160x48 | Red danger/cancel button |
| `btn_icon_circle.png` | 48x48 | Circular icon button frame |
| `btn_summon.png` | 200x64 | Large "Summon Agent" button |

### 3.2 Panels & Cards
| Asset | Size | Description |
|-------|------|-------------|
| `panel_stone.9.png` | 9-slice | Stone panel background (stretchable) |
| `panel_parchment.9.png` | 9-slice | Scroll/parchment background |
| `panel_dark.9.png` | 9-slice | Dark mystical panel |
| `panel_gold.9.png` | 9-slice | Golden achievement panel |
| `panel_quest_scroll.9.png` | 9-slice | Quest turn-in scroll frame |
| `panel_loot_chest.9.png` | 9-slice | Treasure vault panel |
| `panel_talent_tree.9.png` | 9-slice | Skill grimoire background |
| `card_agent.9.png` | 9-slice | Agent info card frame |
| `card_file.9.png` | 9-slice | File/loot item card |
| `card_quest.9.png` | 9-slice | Quest entry card |
| `sheet_handle.png` | 48x8 | Bottom sheet drag handle |
| `divider_ornate.png` | 280x8 | Decorative section divider |
| `header_banner.png` | 320x48 | Modal header banner |

### 3.3 Quest Turn-In Elements
| Asset | Size | Description |
|-------|------|-------------|
| `quest_header_complete.png` | 280x64 | "Quest Complete" banner |
| `quest_seal_accept.png` | 64x64 | Wax seal (accept) |
| `quest_seal_revise.png` | 64x64 | Broken seal (revise) |
| `quest_ribbon.png` | 200x32 | Decorative ribbon |
| `quest_scroll_bg.png` | 320x480 | Full scroll background |

### 3.4 Treasure Vault Elements
| Asset | Size | Description |
|-------|------|-------------|
| `vault_header.png` | 280x64 | "Treasure Vault" banner |
| `vault_chest_large.png` | 128x128 | Large chest illustration |
| `vault_item_slot.png` | 64x64 | Item slot frame |
| `vault_glow.png` | 96x96 | Glow effect behind items |

### 3.5 Talent Tree Elements
| Asset | Size | Description |
|-------|------|-------------|
| `talent_node_bg.png` | 64x64 | Talent node background |
| `talent_node_active.png` | 64x64 | Active/selected node |
| `talent_connector.png` | 8x32 | Line between talents |
| `talent_connector_h.png` | 32x8 | Horizontal connector |
| `talent_header.png` | 280x64 | "Skill Grimoire" banner |

### 3.3 Tab Bar
| Asset | Size | Description |
|-------|------|-------------|
| `tab_bar_bg.png` | 320x80 | Stone tab bar background |
| `tab_spire.png` | 32x32 | Tower/spire icon |
| `tab_spire_active.png` | 32x32 | Active state (glowing) |
| `tab_chronicle.png` | 32x32 | Scroll/feed icon |
| `tab_chronicle_active.png` | 32x32 | Active state |
| `tab_quests.png` | 32x32 | Quest log book icon |
| `tab_quests_active.png` | 32x32 | Active state |
| `tab_grimoire.png` | 32x32 | Settings gear/book icon |
| `tab_grimoire_active.png` | 32x32 | Active state |

### 3.4 Progress Bars
| Asset | Size | Description |
|-------|------|-------------|
| `progress_frame.png` | 200x16 | Progress bar frame (stone) |
| `progress_fill_mana.png` | Tileable | Blue mana/context fill |
| `progress_fill_health.png` | Tileable | Green health/usage fill |
| `progress_fill_xp.png` | Tileable | Purple XP fill |
| `progress_fill_gold.png` | Tileable | Gold quest progress fill |

### 3.5 Input Fields
| Asset | Size | Description |
|-------|------|-------------|
| `input_field.9.png` | 9-slice | Text input background |
| `input_field_focus.9.png` | 9-slice | Focused state (glowing) |
| `input_send_btn.png` | 48x48 | Send message button |

---

## 4. Icons

All icons **32x32 pixels** unless noted.

### 4.1 Status Icons
| Asset | Description |
|-------|-------------|
| `icon_status_idle.png` | Moon/sleep symbol |
| `icon_status_working.png` | Sparkle/magic symbol |
| `icon_status_waiting.png` | Question mark bubble |
| `icon_status_complete.png` | Checkmark with sparkle |
| `icon_status_error.png` | Warning triangle |
| `icon_status_spawning.png` | Portal swirl |

### 4.2 Quest Icons
| Asset | Description |
|-------|-------------|
| `icon_quest_active.png` | Yellow exclamation mark |
| `icon_quest_complete.png` | Yellow question mark |
| `icon_quest_failed.png` | Red X mark |
| `icon_quest_pending.png` | Hourglass (pending review) |
| `icon_scroll.png` | Quest scroll |
| `icon_loot.png` | Treasure chest |
| `icon_accept.png` | Green checkmark in circle |
| `icon_revise.png` | Orange return arrow |
| `icon_diff.png` | Split document (view diff) |

### 4.3 Activity Icons (24x24)
| Asset | Description |
|-------|-------------|
| `icon_activity_idle.png` | Zzz / moon |
| `icon_activity_thinking.png` | Thought bubble |
| `icon_activity_researching.png` | Magnifying glass / book |
| `icon_activity_reading.png` | Open book / scroll |
| `icon_activity_writing.png` | Quill pen |
| `icon_activity_testing.png` | Alchemy flask |
| `icon_activity_building.png` | Hammer / anvil |
| `icon_activity_git.png` | Branch / tree |
| `icon_activity_waiting.png` | Speech bubble with "?" |
| `icon_activity_error.png` | Lightning bolt / explosion |

### 4.4 Loot & Treasure Icons
| Asset | Description |
|-------|-------------|
| `icon_chest_closed.png` | Closed treasure chest |
| `icon_chest_open.png` | Open chest with glow |
| `icon_artifact.png` | Glowing gem/artifact |
| `icon_file_modified.png` | Scroll with quill |
| `icon_file_created.png` | Scroll with sparkle |
| `icon_file_deleted.png` | Scroll with X |
| `icon_preview.png` | Eye symbol |
| `icon_share.png` | Outward arrows |

### 4.5 Talent Tree Icons
| Asset | Description |
|-------|-------------|
| `icon_talent_locked.png` | Locked rune (grayed) |
| `icon_talent_available.png` | Glowing rune (can learn) |
| `icon_talent_learned.png` | Bright rune (already learned) |
| `icon_talent_point.png` | Skill point star |
| `icon_talent_haste.png` | Lightning bolt (speed) |
| `icon_talent_lore.png` | Book (knowledge) |
| `icon_talent_focus.png` | Target (precision) |
| `icon_talent_endurance.png` | Shield (stamina) |
| `icon_talent_mastery.png` | Crown (expertise) |

### 4.6 Realm/Zone Icons
| Asset | Description |
|-------|-------------|
| `icon_realm_all.png` | Castle (all projects) |
| `icon_realm_api.png` | Server tower |
| `icon_realm_web.png` | Globe with magic |
| `icon_realm_mobile.png` | Crystal phone |
| `icon_realm_custom.png` | Blank banner |
| `icon_realm_add.png` | Plus in circle |

### 4.7 Action Icons

### 4.3 Action Icons
| Asset | Description |
|-------|-------------|
| `icon_send.png` | Send/submit arrow |
| `icon_close.png` | X close button |
| `icon_expand.png` | Expand/maximize |
| `icon_collapse.png` | Collapse/minimize |
| `icon_menu.png` | Hamburger/dots menu |
| `icon_refresh.png` | Refresh/sync arrows |
| `icon_settings.png` | Gear cog |
| `icon_back.png` | Back arrow |

### 4.4 File Type Icons (24x24)
| Asset | Description |
|-------|-------------|
| `icon_file_code.png` | Code file (scroll with runes) |
| `icon_file_config.png` | Config file (gear on scroll) |
| `icon_file_doc.png` | Document (book) |
| `icon_file_image.png` | Image (crystal/painting) |
| `icon_file_folder.png` | Folder (pouch/chest) |

### 4.5 Provider Icons
| Asset | Description |
|-------|-------------|
| `icon_claude.png` | Claude logo stylized as rune |
| `icon_openai.png` | OpenAI logo stylized |
| `icon_gemini.png` | Gemini logo stylized |

### 4.6 Notification Badges
| Asset | Size | Description |
|-------|------|-------------|
| `badge_count.png` | 24x24 | Red circle for counts |
| `badge_alert.png` | 24x24 | Pulsing alert indicator |
| `badge_new.png` | 24x24 | "New" sparkle badge |

---

## 5. Effects & Animations

Sprite sheets for animated effects. **Variable sizes**.

### 5.1 Magic Effects
| Asset | Frames | Size | Description |
|-------|--------|------|-------------|
| `effect_spawn_portal.png` | 12 | 128x128 | Swirling portal opening |
| `effect_magic_sparkle.png` | 8 | 64x64 | Generic sparkle burst |
| `effect_level_up.png` | 10 | 128x128 | Level up celebration |
| `effect_quest_complete.png` | 10 | 128x128 | Quest turn-in fanfare |
| `effect_error_flash.png` | 6 | 64x64 | Red error pulse |
| `effect_typing.png` | 4 | 32x32 | Typing indicator dots |

### 5.2 Ambient Effects
| Asset | Frames | Size | Description |
|-------|--------|------|-------------|
| `effect_candle_flicker.png` | 4 | 16x24 | Candle flame animation |
| `effect_magic_float.png` | 8 | 32x32 | Floating magic particles |
| `effect_steam.png` | 6 | 32x48 | Steam/smoke rising |
| `effect_rune_glow.png` | 4 | 48x48 | Glowing rune pulse |

### 5.3 Transition Effects
| Asset | Frames | Size | Description |
|-------|--------|------|-------------|
| `transition_fade_magic.png` | 8 | Full screen | Magical fade transition |
| `transition_portal_wipe.png` | 10 | Full screen | Portal swirl wipe |

---

## 6. Backgrounds

### 6.1 Screen Backgrounds
| Asset | Size | Description |
|-------|------|-------------|
| `bg_spire_day.png` | 390x844 | Daytime sky with clouds |
| `bg_spire_night.png` | 390x844 | Night sky with stars |
| `bg_spire_sunset.png` | 390x844 | Sunset gradient |
| `bg_connect_wizard.png` | 390x844 | Mystical connection setup |
| `bg_summon_ritual.png` | 390x844 | Summoning circle background |

### 6.2 Decorative Elements
| Asset | Size | Description |
|-------|------|-------------|
| `deco_cloud_1.png` | 64x32 | Small cloud |
| `deco_cloud_2.png` | 96x48 | Medium cloud |
| `deco_cloud_3.png` | 128x64 | Large cloud |
| `deco_star.png` | 8x8 | Twinkling star |
| `deco_bird.png` | 16x16 | Flying bird (4 frames) |
| `deco_banner.png` | 48x96 | Hanging banner/flag |

---

## 7. Connection & Onboarding

### 7.1 Wizard Illustrations
| Asset | Size | Description |
|-------|------|-------------|
| `onboard_welcome.png` | 280x200 | Wizard welcoming player |
| `onboard_daemon.png` | 280x200 | Computer with magic portal |
| `onboard_connect.png` | 280x200 | Phone and computer linked |
| `onboard_success.png` | 280x200 | Celebration, spire revealed |
| `qr_frame.png` | 200x200 | Decorative QR code frame |

### 7.2 Connection Status
| Asset | Size | Description |
|-------|------|-------------|
| `status_connected.png` | 48x48 | Green portal, connected |
| `status_disconnected.png` | 48x48 | Gray portal, disconnected |
| `status_connecting.png` | 48x48 | Spinning portal, connecting |
| `status_error.png` | 48x48 | Red portal, error |

---

## 8. Empty States

| Asset | Size | Description |
|-------|------|-------------|
| `empty_spire.png` | 200x200 | Empty tower, no agents yet |
| `empty_quests.png` | 200x200 | Empty scroll, no quests |
| `empty_chronicle.png` | 200x200 | Blank book, no activity |
| `empty_loot.png` | 200x200 | Empty treasure chest |

---

## 9. App Icon & Branding

| Asset | Size | Description |
|-------|------|-------------|
| `app_icon.png` | 1024x1024 | App store icon (spire silhouette) |
| `app_icon_ios.png` | Various | iOS icon set (all required sizes) |
| `splash_screen.png` | 390x844 | Launch screen with logo |
| `logo_horizontal.png` | 280x80 | "Arcane Spire" wordmark |
| `logo_vertical.png` | 160x200 | Stacked logo |
| `logo_icon.png` | 64x64 | Just the spire icon |

---

## 10. Sound Effects (Audio Assets)

While not pixel art, these complete the 8-bit experience:

| Asset | Description |
|-------|-------------|
| `sfx_spawn.wav` | Magical summoning whoosh |
| `sfx_complete.wav` | Quest complete fanfare |
| `sfx_error.wav` | Error buzz/alarm |
| `sfx_notification.wav` | Gentle chime |
| `sfx_tap.wav` | UI tap feedback |
| `sfx_swipe.wav` | Swipe/scroll sound |
| `sfx_level_up.wav` | Level up celebration |
| `sfx_typing.wav` | Soft keyboard clicks |
| `sfx_connect.wav` | Connection established |
| `sfx_disconnect.wav` | Connection lost |
| `ambient_spire.wav` | Looping mystical ambience |

---

## Asset Generation Prompt Template

For AI image generation, use this template:

```
Create an 8-bit pixel art [ASSET NAME] for a fantasy mobile game.
Style: Tiny Tower meets World of Warcraft
Colors: Vibrant, saturated fantasy palette
Size: [WIDTH]x[HEIGHT] pixels
Background: Transparent PNG
Details: [SPECIFIC DESCRIPTION]
Must be: Pixel-perfect, no anti-aliasing, clear silhouette
```

---

## Summary Counts

| Category | Count |
|----------|-------|
| Agent Sprites | 48 sprite sheets (6 classes × 8 states) |
| Agent Portraits | 6 |
| Spire Architecture | 12 |
| Chamber Backgrounds | 6 |
| UI Buttons | 7 |
| UI Panels & Cards | 15 |
| Quest Turn-In Elements | 5 |
| Treasure Vault Elements | 4 |
| Talent Tree Elements | 5 |
| Tab Bar | 9 |
| Progress Bars | 5 |
| Input Fields | 3 |
| Status Icons | 6 |
| Quest Icons | 9 |
| Activity Icons | 10 |
| Loot & Treasure Icons | 8 |
| Talent Tree Icons | 9 |
| Realm/Zone Icons | 6 |
| Action Icons | 8 |
| File Icons | 5 |
| Provider Icons | 3 |
| Badges | 3 |
| Magic Effects | 6 sprite sheets |
| Ambient Effects | 4 sprite sheets |
| Transitions | 2 sprite sheets |
| Backgrounds | 5 |
| Decorations | 6 |
| Onboarding | 5 |
| Connection Status | 4 |
| Empty States | 4 |
| Branding | 6 |
| Sound Effects | 11 |

**Total: ~250 unique assets**

---

## Priority Order for MVP

### P0 - Must Have for Demo
1. `mage_idle.png`, `mage_working.png`, `mage_waiting.png`
2. `floor_frame_idle.png`, `floor_frame_working.png`
3. `tab_bar_bg.png` + 4 tab icons
4. `btn_primary.png`, `btn_secondary.png`
5. `panel_stone.9.png`
6. `icon_status_*` (all 6)
7. `app_icon.png`
8. `bg_spire_day.png`

### P1 - Complete Experience
1. All agent classes (idle, working, waiting)
2. All chamber backgrounds
3. All UI elements
4. Effect animations
5. Sound effects

### P2 - Polish
1. Remaining agent states (complete, error, sleeping, spawning)
2. All backgrounds (day/night/sunset)
3. Decorative elements
4. Onboarding illustrations
5. Empty states
