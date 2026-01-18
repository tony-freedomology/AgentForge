# Arcane Spire Assets

This directory contains all assets for the Arcane Spire mobile app.

## Required Files

### App Icons
- `icon.png` - Main app icon (1024x1024)
- `adaptive-icon.png` - Android adaptive icon foreground (1024x1024)
- `favicon.png` - Web favicon (48x48)
- `splash.png` - Splash screen image (1284x2778)
- `notification-icon.png` - Notification icon (96x96, Android)

### Sounds (8-bit chiptune style)
Place in `sounds/` directory:
- `sfx_spawn.wav` - Agent spawning sound
- `sfx_complete.wav` - Quest/task complete
- `sfx_error.wav` - Error notification
- `sfx_level_up.wav` - Level up fanfare
- `sfx_tap.wav` - UI tap/button press
- `sfx_swipe.wav` - Swipe gesture
- `sfx_notification.wav` - Push notification
- `sfx_typing.wav` - Typing indicator
- `sfx_connect.wav` - Connection established
- `sfx_disconnect.wav` - Connection lost
- `ambient_spire.wav` - Background ambient (optional, looped)

### Pixel Art Assets
See `constants/assets.ts` for the full list of ~250 pixel art assets.

Place in `images/` directory with the following structure:
```
images/
├── agents/
│   ├── mage/
│   │   ├── mage_idle.png
│   │   ├── mage_working.png
│   │   └── ...
│   ├── architect/
│   ├── engineer/
│   ├── scout/
│   ├── guardian/
│   └── artisan/
├── ui/
│   ├── frames/
│   ├── buttons/
│   ├── bars/
│   ├── panels/
│   ├── inputs/
│   ├── tabs/
│   └── decor/
├── backgrounds/
│   ├── spire/
│   ├── chambers/
│   └── screens/
├── icons/
│   ├── status/
│   ├── actions/
│   ├── quests/
│   └── misc/
├── effects/
│   ├── particles/
│   ├── glows/
│   ├── portal/
│   ├── levelup/
│   └── alerts/
└── items/
    ├── code/
    ├── rarity/
    └── files/
```

## Asset Specifications

### Agent Sprites
- Size: 64x64 pixels (base)
- Format: PNG with transparency
- Style: 8-bit pixel art
- States per class:
  - idle, working, thinking, success, error, sleeping
  - Walk animations: down, up, left, right (4-frame each)
  - Special: casting/designing/building/scouting/defending/crafting

### UI Elements
- Format: 9-slice compatible PNGs for frames/buttons
- Style: Fantasy/medieval with pixel art aesthetic
- Color palette: Match theme.ts colors

### Backgrounds
- Chamber backgrounds: 390x844 (fit iPhone screen)
- Spire tiles: 128x128 (tileable)
- Style: Dark dungeon/tower aesthetic

### Icons
- Status icons: 24x24
- Action icons: 24x24
- Quest icons: 32x32
- Style: Clear, readable at small sizes

### Effects
- Particles: 16x16 or 32x32
- Glows: Radial gradient PNGs
- Portal: Animation frames

## Placeholder System

Until real assets are added, the app uses emoji and colored placeholders.
The `PixelAsset` component automatically falls back to these when images are missing.

To enable real assets:
1. Add the image files to the correct directories
2. Update `constants/assets.ts` if paths change
3. In `components/ui/PixelAsset.tsx`, set `showPlaceholder = false` or use dynamic loading
