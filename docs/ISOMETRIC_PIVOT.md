# Isometric 2D Implementation

## Overview

AgentForge uses a **PixiJS 2D isometric** rendering system inspired by classic games like Habbo Hotel, Age of Empires, and modern pixel art isometric games. The visual direction is **vibrant fantasy/Warcraft themed** with rich colors and detailed sprites.

## Technology Stack

| Component | Technology |
|-----------|------------|
| Renderer | PixiJS v8 |
| React Integration | @pixi/react |
| Coordinate System | Axial hex grid |
| Animations | Procedural + sprite sheets |
| State Management | Zustand |

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
- **Resolution**: Pixel-perfect rendering at multiple scales
- **Aesthetic**: Vibrant fantasy, Warcraft-inspired

---

## Implementation Status

### Phase 0: Core Setup - COMPLETE
- [x] Install PixiJS and @pixi/react
- [x] Create IsometricWorld.tsx component
- [x] Render hex tile grid
- [x] Verify integration with React UI

### Phase 1: Core Isometric Engine - COMPLETE
- [x] Implement tile rendering system
- [x] Create coordinate conversion (screen ↔ hex)
- [x] Add camera pan/zoom controls
- [x] Implement tile hover highlighting
- [x] Create asset loading system with fallbacks

### Phase 2: Agent Sprites - COMPLETE
- [x] Create IsometricAgent component
- [x] Provider-specific sprites (Claude, Codex, Gemini)
- [x] Procedural animations (breathing, bobbing, wobble)
- [x] Selection indicators and highlighting
- [x] Status-based visual effects

### Phase 3: Environment - COMPLETE
- [x] Hex grid with terrain types (grass, stone, water, portal)
- [x] Portal spawn points
- [x] Particle effects system
- [x] Ambient animations

### Phase 4: UI Integration - COMPLETE
- [x] Party Frames with new styling
- [x] Quest Log and Turn-in modals
- [x] Talent Tree panel
- [x] RPG-styled tooltips
- [x] Resource bars and status indicators

### Phase 5: Polish - COMPLETE
- [x] Agent spawn effects
- [x] Status change animations
- [x] Attention indicators (wobble)
- [x] Working/casting sway animation
- [x] Toast notification system

### Future Enhancements
- [ ] Animated sprite sheets (walk cycles)
- [ ] Weather effects
- [ ] Day/night cycle
- [ ] Workstation areas (library, forge, lab)
- [ ] Path visualization for agent movement

---

## Architecture

### Component Structure

```
src/components/isometric/
├── IsometricWorld.tsx      # Main PixiJS Stage and camera
├── IsometricAgent.tsx      # Agent sprite with animations
├── AnimatedSprite.tsx      # Sprite sheet animation helper
└── ParticleEffects.tsx     # Visual effects system
```

### IsometricWorld.tsx

Main rendering component responsibilities:
- Creates PixiJS Stage with proper dimensions
- Manages camera state (pan, zoom)
- Renders hex grid tiles
- Coordinates agent sprite rendering
- Handles mouse/touch input for selection

```typescript
// Camera controls
interface CameraState {
  x: number;      // Pan offset X
  y: number;      // Pan offset Y
  zoom: number;   // Scale factor (0.5 - 2.0)
}

// Input handling
- Click + Drag: Pan camera
- Scroll wheel: Zoom in/out
- Click agent: Select
- Shift+Click: Add to selection
```

### IsometricAgent.tsx

Individual agent rendering with procedural animations:

```typescript
// Animation types tied to agent state
const animations = {
  breathing: always,        // Subtle scale pulse
  bobbing: always,          // Gentle vertical motion
  wobble: needsAttention,   // Side-to-side shake
  castingSway: working,     // Rhythmic movement
};
```

### Hex Grid System

Uses axial coordinates (q, r) for positioning:

```typescript
// Hex to screen conversion
function hexToScreen(q: number, r: number): { x: number; y: number } {
  const x = (q - r) * (TILE_WIDTH / 2);
  const y = (q + r) * (TILE_HEIGHT / 4);
  return { x, y };
}
```

**Tile Types**:
| Type | Description |
|------|-------------|
| `grass` | Standard walkable terrain |
| `stone` | Elevated/special areas |
| `water` | Decorative, impassable |
| `portal` | Agent spawn points |

---

## Asset Structure

```
public/assets_isometric/
├── agents/
│   ├── claude/
│   │   ├── claude_idle_s.png
│   │   └── claude_work_s.png
│   ├── codex/
│   │   └── codex_idle_s.png
│   └── gemini/
│       └── gemini_idle_s.png
├── tiles/
│   ├── hex_grass.png
│   ├── hex_stone.png
│   └── hex_water.png
└── ui/
    ├── panels/
    │   ├── panel_stone.png
    │   └── panel_quest_scroll.png
    └── decorations/
        └── divider_horizontal.png
```

### Sprite Naming Convention

```
{provider}_{state}_{direction}.png

Providers: claude, codex, gemini
States: idle, work, cast, walk
Directions: n, ne, e, se, s, sw, w, nw
```

Currently using south-facing (`_s`) sprites with procedural animations.

---

## Procedural Animations

Instead of sprite sheet animations, we use PixiJS ticker-driven procedural animations:

### Breathing Animation
```typescript
// Subtle scale pulse on all agents
const breathScale = 1 + Math.sin(time * 2) * 0.02;
sprite.scale.set(breathScale);
```

### Bobbing Animation
```typescript
// Gentle vertical movement
const bobOffset = Math.sin(time * 1.5) * 2;
sprite.y = baseY + bobOffset;
```

### Attention Wobble
```typescript
// Side-to-side shake when needsAttention
if (agent.needsAttention) {
  const wobble = Math.sin(time * 10) * 3;
  sprite.x = baseX + wobble;
}
```

### Casting Sway
```typescript
// Rhythmic movement while working
if (agent.status === 'working') {
  const sway = Math.sin(time * 3) * 4;
  sprite.rotation = sway * 0.05;
}
```

---

## Performance Considerations

1. **Texture Caching**: PixiJS Assets system caches loaded textures
2. **Culling**: Only render hexes/agents within viewport
3. **Batching**: PixiJS automatically batches similar sprites
4. **Shared Ticker**: All animations use single PixiJS ticker
5. **React Integration**: @pixi/react minimizes re-renders

---

## Migration from 3D

The original design used React Three Fiber (R3F) for 3D rendering. We pivoted to 2D isometric because:

1. **Simpler Asset Pipeline** - 2D sprites vs 3D models
2. **Better Performance** - Especially on lower-end devices
3. **Classic Aesthetic** - Matches RTS/RPG inspiration
4. **Easier Animations** - Procedural + eventual sprite sheets
5. **Faster Iteration** - Quick to add new visual elements

Component mapping from old to new:
| 3D (old) | Isometric (new) |
|----------|-----------------|
| `Scene.tsx` | `IsometricWorld.tsx` |
| `AgentUnit.tsx` | `IsometricAgent.tsx` |
| `Environment.tsx` | Integrated into IsometricWorld |
| `SelectionBox.tsx` | Selection logic in IsometricWorld |

---

## Reference Style

The visual style evokes:
- World of Warcraft's vibrant color palette
- Habbo Hotel's isometric clarity
- Age of Empires' RTS interface patterns
- Modern pixel art games (Eastward, Octopath Traveler)
- Fantasy MMO UI aesthetics (ornate frames, glowing effects)

**NOT**: Muted/desaturated colors, realistic proportions, or minimalist UI.
