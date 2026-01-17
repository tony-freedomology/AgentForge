# Isometric Pivot Implementation Plan

## Overview

AgentForge is pivoting from Three.js 3D rendering to a **PixiJS 2D isometric** style inspired by classic games like Habbo Hotel and modern pixel art isometric games. The visual direction is **vibrant fantasy/Warcraft themed** with rich colors and detailed pixel art.

## Technology Stack

- **Renderer**: PixiJS v8 with `@pixi/react` bindings
- **Isometric Engine**: Custom implementation (Traviso.js concepts)
- **State Management**: Zustand (existing)
- **Backend**: Express + WebSocket + PTY (unchanged)

## Art Direction

### Color Palette

| Name | Hex | Usage |
|------|-----|-------|
| Arcane Purple | `#8B5CF6` | Claude agents, magical effects |
| Fel Green | `#22C55E` | Codex agents, nature/growth |
| Holy Gold | `#F59E0B` | UI highlights, achievements |
| Frost Blue | `#3B82F6` | Gemini agents, water/ice |
| Fire Orange | `#EF4444` | Alerts, combat, errors |
| Shadow Black | `#1A1A2E` | Backgrounds, depth |
| Parchment | `#FEF3C7` | Text backgrounds, tooltips |

### Visual Style

- **Isometric Projection**: 2:1 dimetric (standard isometric)
- **Tile Size**: 64x32 pixels (standard isometric tile)
- **Sprite Size**: 64x96 pixels for agent characters
- **Resolution**: Pixel-perfect rendering at 1x, 2x, 3x scales
- **Aesthetic**: Vibrant fantasy, Warcraft-inspired, NOT muted tones

---

## Asset Requirements

### 1. Tile Assets (`/public/assets/tiles/`)

All tiles should be **64x32 pixels** in isometric projection.

#### Ground Tiles
| Filename | Description |
|----------|-------------|
| `tile_stone_base.png` | Default stone floor tile |
| `tile_stone_mossy.png` | Mossy stone variant |
| `tile_stone_cracked.png` | Weathered/cracked stone |
| `tile_grass.png` | Grass tile for outdoor areas |
| `tile_dirt.png` | Dirt/earth tile |
| `tile_water.png` | Animated water (4 frames) |
| `tile_lava.png` | Animated lava (4 frames) |
| `tile_void.png` | Dark magical void tile |
| `tile_arcane.png` | Purple glowing arcane tile |
| `tile_gold.png` | Golden treasure room tile |

#### Special Tiles
| Filename | Description |
|----------|-------------|
| `tile_portal_base.png` | Portal spawn point base |
| `tile_portal_glow.png` | Portal glow overlay (animated, 8 frames) |
| `tile_highlight_move.png` | Movement range highlight (blue) |
| `tile_highlight_attack.png` | Attack range highlight (red) |
| `tile_highlight_select.png` | Selection highlight (gold) |

### 2. Agent Sprites (`/public/assets/agents/`)

All agent sprites should be **64x96 pixels** (64 wide, 96 tall for head room).

#### Claude Agent (Purple Theme)
| Filename | Description |
|----------|-------------|
| `claude_idle_s.png` | Idle facing south (4 frames) |
| `claude_idle_sw.png` | Idle facing southwest (4 frames) |
| `claude_idle_w.png` | Idle facing west (4 frames) |
| `claude_idle_nw.png` | Idle facing northwest (4 frames) |
| `claude_walk_s.png` | Walking south (8 frames) |
| `claude_walk_sw.png` | Walking southwest (8 frames) |
| `claude_walk_w.png` | Walking west (8 frames) |
| `claude_walk_nw.png` | Walking northwest (8 frames) |
| `claude_cast_s.png` | Casting spell south (6 frames) |
| `claude_cast_sw.png` | Casting spell southwest (6 frames) |
| `claude_cast_w.png` | Casting spell west (6 frames) |
| `claude_cast_nw.png` | Casting spell northwest (6 frames) |
| `claude_celebrate.png` | Quest complete celebration (8 frames) |

*Note: East-facing sprites can be mirrored from west-facing ones.*

#### Codex Agent (Green Theme)
Same animation set as Claude with `codex_` prefix and green color scheme.

#### Gemini Agent (Blue Theme)
Same animation set as Claude with `gemini_` prefix and blue color scheme.

#### Level Indicators
| Filename | Description |
|----------|-------------|
| `level_badge_1-10.png` | Bronze level badge |
| `level_badge_11-20.png` | Silver level badge |
| `level_badge_21-30.png` | Gold level badge |
| `level_badge_31-40.png` | Platinum level badge |
| `level_badge_41-50.png` | Diamond level badge |

### 3. Environment Props (`/public/assets/props/`)

All props should fit within isometric grid cells.

#### Portal Structure
| Filename | Description |
|----------|-------------|
| `portal_frame.png` | Stone archway frame (128x160px) |
| `portal_swirl.png` | Swirling energy (animated, 12 frames) |
| `portal_particles.png` | Floating particles sprite sheet |

#### Decorative Props
| Filename | Description |
|----------|-------------|
| `crystal_purple.png` | Arcane crystal cluster |
| `crystal_green.png` | Nature crystal cluster |
| `crystal_blue.png` | Frost crystal cluster |
| `torch_wall.png` | Wall-mounted torch (animated, 4 frames) |
| `banner_guild.png` | Guild banner (customizable) |
| `chest_closed.png` | Treasure chest closed |
| `chest_open.png` | Treasure chest open |
| `bookshelf.png` | Magical bookshelf |
| `cauldron.png` | Bubbling cauldron (animated, 4 frames) |
| `tree_magical.png` | Glowing magical tree |
| `mushroom_cluster.png` | Fantasy mushrooms |

### 4. UI Elements (`/public/assets/ui/`)

#### Frames and Panels
| Filename | Description |
|----------|-------------|
| `panel_stone.9.png` | 9-slice stone panel background |
| `panel_parchment.9.png` | 9-slice parchment panel |
| `panel_dark.9.png` | 9-slice dark panel |
| `frame_portrait.png` | Agent portrait frame (80x80px) |
| `frame_portrait_selected.png` | Selected agent frame (glowing) |
| `healthbar_frame.png` | Health/XP bar frame |
| `healthbar_fill_hp.png` | Health bar fill (green) |
| `healthbar_fill_xp.png` | XP bar fill (purple) |
| `healthbar_fill_mana.png` | Mana bar fill (blue) |

#### Icons (32x32 pixels)
| Filename | Description |
|----------|-------------|
| `icon_quest_available.png` | Yellow exclamation mark |
| `icon_quest_complete.png` | Yellow question mark |
| `icon_quest_progress.png` | Hourglasses/in-progress |
| `icon_level_up.png` | Level up star burst |
| `icon_gold.png` | Gold coin |
| `icon_xp.png` | Experience orb |
| `icon_artifact.png` | File/artifact icon |
| `icon_talent_point.png` | Talent point star |

#### Buttons
| Filename | Description |
|----------|-------------|
| `btn_primary.9.png` | Primary action button (gold) |
| `btn_secondary.9.png` | Secondary button (stone) |
| `btn_danger.9.png` | Danger/delete button (red) |
| `btn_close.png` | Close/X button |

### 5. Effects (`/public/assets/effects/`)

Particle and spell effects sprite sheets.

| Filename | Description |
|----------|-------------|
| `effect_spawn.png` | Agent spawn effect (16 frames) |
| `effect_levelup.png` | Level up burst (12 frames) |
| `effect_quest_complete.png` | Quest complete sparkles (12 frames) |
| `effect_teleport.png` | Teleport swirl (8 frames) |
| `effect_magic_purple.png` | Purple magic particles |
| `effect_magic_green.png` | Green magic particles |
| `effect_magic_blue.png` | Blue magic particles |
| `effect_magic_gold.png` | Gold/holy particles |

### 6. Minimap Assets (`/public/assets/minimap/`)

| Filename | Description |
|----------|-------------|
| `minimap_frame.png` | Ornate minimap border |
| `minimap_agent_claude.png` | Purple dot for Claude |
| `minimap_agent_codex.png` | Green dot for Codex |
| `minimap_agent_gemini.png` | Blue dot for Gemini |
| `minimap_portal.png` | Portal icon |
| `minimap_quest.png` | Quest objective marker |

---

## Sprite Sheet Format

All animated sprites should use horizontal sprite sheets:

```
[Frame1][Frame2][Frame3][Frame4]...
```

Include a JSON metadata file for each sprite sheet:

```json
{
  "frames": {
    "claude_idle_s_0": { "x": 0, "y": 0, "w": 64, "h": 96 },
    "claude_idle_s_1": { "x": 64, "y": 0, "w": 64, "h": 96 },
    "claude_idle_s_2": { "x": 128, "y": 0, "w": 64, "h": 96 },
    "claude_idle_s_3": { "x": 192, "y": 0, "w": 64, "h": 96 }
  },
  "animations": {
    "idle_s": ["claude_idle_s_0", "claude_idle_s_1", "claude_idle_s_2", "claude_idle_s_3"]
  },
  "meta": {
    "frameDuration": 200
  }
}
```

---

## Implementation Phases

### Phase 0: Proof of Concept (Current)
- [x] Install PixiJS and @pixi/react
- [ ] Create basic IsometricWorld.tsx component
- [ ] Render 10x10 placeholder tile grid
- [ ] Add clickable test sprite
- [ ] Verify integration with React UI

### Phase 1: Core Isometric Engine
- [ ] Implement tile rendering system
- [ ] Create coordinate conversion (screen ↔ iso)
- [ ] Add camera pan/zoom controls
- [ ] Implement tile hover highlighting
- [ ] Create asset loading system

### Phase 2: Agent Sprites
- [ ] Create AnimatedSprite component
- [ ] Implement directional sprite selection
- [ ] Add walking animations with pathfinding
- [ ] Create idle animation loops
- [ ] Add selection indicators

### Phase 3: Environment
- [ ] Render central portal structure
- [ ] Add decorative props
- [ ] Implement lighting/shadows
- [ ] Create particle effects system
- [ ] Add ambient animations

### Phase 4: UI Integration
- [ ] Restyle Party Frames with new assets
- [ ] Update Quest Log UI
- [ ] Modernize Talent Tree panel
- [ ] Create pixel-art styled tooltips
- [ ] Add new minimap renderer

### Phase 5: Polish
- [ ] Add spawn/despawn effects
- [ ] Implement level-up celebrations
- [ ] Create quest completion animations
- [ ] Add ambient sound triggers
- [ ] Performance optimization

---

## File Structure

```
src/
├── components/
│   ├── isometric/
│   │   ├── IsometricWorld.tsx      # Main PixiJS canvas
│   │   ├── TileMap.tsx             # Tile grid renderer
│   │   ├── AgentSprite.tsx         # Agent character sprite
│   │   ├── Portal.tsx              # Spawn portal
│   │   ├── PropSprite.tsx          # Environment props
│   │   ├── EffectLayer.tsx         # Particle effects
│   │   └── IsometricCamera.tsx     # Camera controls
│   └── ui/                         # (existing, will be restyled)
├── utils/
│   ├── isoCoords.ts                # Isometric math utilities
│   ├── spriteLoader.ts             # Asset loading helpers
│   └── hexUtils.ts                 # (existing, may be adapted)
└── assets/                         # Asset type definitions
```

---

## Notes for Asset Generation

1. **Consistency**: All assets should share the same vibrant, fantasy art style
2. **Outline**: Use 1-2px dark outlines for sprite definition
3. **Shading**: Use cel-shading style with 3-4 color levels per material
4. **Animation**: Smooth, exaggerated animations (fantasy style, not realistic)
5. **Format**: PNG with transparency, optimized for web
6. **Naming**: Follow the exact filenames listed above for automatic loading
7. **Scale**: Design at 1x, provide 2x versions for retina displays

---

## Reference Style

The visual style should evoke:
- World of Warcraft's vibrant color palette
- Habbo Hotel's isometric clarity
- Modern pixel art games (Eastward, Octopath Traveler)
- Fantasy MMO UI aesthetics (ornate frames, glowing effects)

**NOT**: Muted/desaturated colors, realistic proportions, or minimalist UI.
