# AgentForge Sound Assets

## Overview
This directory contains sound assets for the AgentForge AI Agent Command Interface.
The game has a fantasy/MMO aesthetic similar to World of Warcraft.

## Sound Categories

### UI Sounds (`ui/`)
Magical interface sounds - clicks, hovers, panels opening/closing.
Style: Fantasy UI, crystal/glass touches, subtle magic sparkles.

### Agent Sounds (`agent/`)
Character-related sounds - spawning, selection, working states.
Style: Magical beings, portal summoning, arcane energy.

### Quest Sounds (`quest/`)
Task/mission related sounds - accepting, completing, approval/rejection.
Style: Adventure game quest sounds, scrolls, achievements.

### Talent Sounds (`talent/`)
Skill tree related sounds - learning abilities, resetting talents.
Style: Power unlocking, skill mastery, magical empowerment.

### Loot Sounds (`loot/`)
File artifact sounds - creation, modification, collection.
Style: Item crafting, treasure, satisfying collection.

### Ambient (`ambient/`)
Background atmosphere - magical workshop, forge sounds.
Style: Immersive, loopable, non-distracting.

### Music (`music/`)
Background music tracks for different game states.
Style: Orchestral fantasy, heroic themes.

## Technical Requirements
- Format: MP3 (primary) or OGG (fallback)
- Sample Rate: 44100 Hz
- Channels: Mono or Stereo
- Normalization: -3dB peak
- File naming: Match the `file` field in manifest.json

## Sound Design Guidelines

1. **Consistency**: All sounds should feel like they belong in the same
   fantasy/magical world.

2. **Non-Harsh**: Even error sounds should be melodic and not jarring.
   This is a productivity tool - sounds should be pleasant.

3. **Satisfying Feedback**: Action sounds (clicks, selections) should
   provide satisfying tactile feedback.

4. **Loopable**: Ambient and music tracks should loop seamlessly.

5. **Volume Balance**: Sounds should be normalized. Relative volumes
   are handled in code.

## Using AI Audio Generation

These sounds can be generated using AI audio tools like:
- ElevenLabs Sound Effects
- Suno AI
- Stable Audio
- Adobe Podcast Sound Effects

Use the descriptions and style guides in manifest.json as prompts.

## Testing

After adding sounds, run the app and verify:
1. No clipping or distortion
2. Proper loop points (no clicks/pops)
3. Appropriate volume relative to other sounds
4. Sounds fit the fantasy aesthetic
