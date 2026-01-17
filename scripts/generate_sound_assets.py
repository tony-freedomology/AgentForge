#!/usr/bin/env python3
"""
Sound Asset Generator for AgentForge

This script documents all required sound effects for the game.
Since AI can't generate audio directly, this creates:
1. A manifest of all needed sounds with descriptions
2. Placeholder silent audio files
3. A guide for sound designers or AI audio generation services

Run this script to generate the sound manifest and directory structure.
Usage: python scripts/generate_sound_assets.py
"""

import os
import json
import struct
import wave
from pathlib import Path

# Output directory
OUTPUT_DIR = Path("public/assets/sounds")

# Sound definitions (matching soundManager.ts)
SOUND_DEFINITIONS = [
    # UI Sounds
    {
        "file": "ui/click",
        "category": "ui",
        "description": "Soft magical click, like a rune activating",
        "duration": 0.2,
        "style": "Fantasy UI, crystal/glass touch, subtle magic sparkle",
        "variations": 3
    },
    {
        "file": "ui/hover",
        "category": "ui",
        "description": "Subtle shimmer, hovering over enchanted UI element",
        "duration": 0.15,
        "style": "Very soft whoosh, magical whisper, barely audible sparkle"
    },
    {
        "file": "ui/panel_open",
        "category": "ui",
        "description": "Ancient tome opening, pages rustling with magic",
        "duration": 0.5,
        "style": "Book opening + magical resonance, paper rustling, arcane hum"
    },
    {
        "file": "ui/panel_close",
        "category": "ui",
        "description": "Tome closing, magical seal forming",
        "duration": 0.4,
        "style": "Book closing thud + magical seal sound, energy dissipating"
    },
    {
        "file": "ui/error",
        "category": "ui",
        "description": "Dark chord, spell fizzle, warning tone",
        "duration": 0.6,
        "style": "Minor chord, sparking/fizzle effect, ominous but not harsh"
    },
    {
        "file": "ui/success",
        "category": "ui",
        "description": "Triumphant chime, golden sparkle sound",
        "duration": 0.5,
        "style": "Bright ascending notes, crystalline, satisfying completion"
    },
    {
        "file": "ui/notification",
        "category": "ui",
        "description": "Crystal bell, gentle alert chime",
        "duration": 0.4,
        "style": "Single clear bell tone, magical resonance, attention-getting"
    },

    # Agent Sounds
    {
        "file": "agent/spawn",
        "category": "agent",
        "description": "Magical summoning, portal opening, energy coalescing",
        "duration": 1.5,
        "style": "Whooshing portal, energy building, crystallization, 'being formed' feeling"
    },
    {
        "file": "agent/select",
        "category": "agent",
        "description": "Unit acknowledgement, 'Ready', magical affirmation",
        "duration": 0.5,
        "style": "Confident chime, magical ping, 'selected' feedback",
        "variations": 3
    },
    {
        "file": "agent/deselect",
        "category": "agent",
        "description": "Soft magical release, selection fading",
        "duration": 0.3,
        "style": "Soft fade-out sound, gentle release, energy dispersing"
    },
    {
        "file": "agent/working",
        "category": "agent",
        "description": "Typing on magical keyboard, soft arcane humming",
        "duration": 4.0,
        "style": "Loopable ambient, soft clicks and hums, productive energy",
        "loop": True
    },
    {
        "file": "agent/idle",
        "category": "agent",
        "description": "Ambient breathing, occasional movement",
        "duration": 6.0,
        "style": "Loopable very soft ambient, subtle magical presence",
        "loop": True
    },
    {
        "file": "agent/death",
        "category": "agent",
        "description": "Dramatic departure, energy dispersing",
        "duration": 1.2,
        "style": "Sad descending notes, energy scattering, farewell tone"
    },
    {
        "file": "agent/attention",
        "category": "agent",
        "description": "Urgent ping, crystal alarm, attention required",
        "duration": 0.8,
        "style": "Urgent but not harsh, pulsing crystal ping, 'look at me'"
    },
    {
        "file": "agent/level_up",
        "category": "agent",
        "description": "Triumphant fanfare, power surge, achievement unlocked",
        "duration": 2.0,
        "style": "Epic ascending fanfare, golden energy burst, celebration"
    },

    # Quest Sounds
    {
        "file": "quest/start",
        "category": "quest",
        "description": "Quest accepted, scroll unrolling, commitment made",
        "duration": 0.8,
        "style": "Scroll unfurling, magical seal breaking, adventure beginning"
    },
    {
        "file": "quest/complete",
        "category": "quest",
        "description": "Quest finished, achievement sound, ready for review",
        "duration": 1.0,
        "style": "Satisfying completion chime, quest log update, 'done' feeling"
    },
    {
        "file": "quest/turn_in",
        "category": "quest",
        "description": "Presenting work, quest giver interaction",
        "duration": 0.6,
        "style": "Items being placed, magical inspection, anticipation"
    },
    {
        "file": "quest/approved",
        "category": "quest",
        "description": "Glorious approval, golden fanfare, success celebration",
        "duration": 1.5,
        "style": "Triumphant brass fanfare, golden sparkles, joy and achievement"
    },
    {
        "file": "quest/rejected",
        "category": "quest",
        "description": "Rejection tone, sent back, try again",
        "duration": 0.8,
        "style": "Disappointed tone, scroll re-rolling, 'not quite' feeling"
    },

    # Talent Sounds
    {
        "file": "talent/allocate",
        "category": "talent",
        "description": "Power unlocked, skill learned, magical empowerment",
        "duration": 0.8,
        "style": "Energy flowing into character, power surge, skill unlocking"
    },
    {
        "file": "talent/reset",
        "category": "talent",
        "description": "Talents unwinding, power refund, reset complete",
        "duration": 1.0,
        "style": "Energy reversing, skills dissipating, clean slate sound"
    },
    {
        "file": "talent/tree_open",
        "category": "talent",
        "description": "Ancient skill book opening, talents revealed",
        "duration": 0.6,
        "style": "Magical book opening, glowing pages, knowledge revealing"
    },
    {
        "file": "talent/tree_close",
        "category": "talent",
        "description": "Skill book closing, talents stored",
        "duration": 0.5,
        "style": "Book closing, energy settling, talents secured"
    },
    {
        "file": "talent/maxed",
        "category": "talent",
        "description": "Talent mastered, golden completion, ultimate power",
        "duration": 1.2,
        "style": "Epic mastery fanfare, golden glow, maximum power achieved"
    },

    # Loot Sounds
    {
        "file": "loot/created",
        "category": "loot",
        "description": "Item crafted, scroll appearing, artifact created",
        "duration": 0.6,
        "style": "Crafting completion, item materializing, creation sound"
    },
    {
        "file": "loot/modified",
        "category": "loot",
        "description": "Item enhanced, gentle modification sound",
        "duration": 0.4,
        "style": "Subtle enhancement, update sound, file edited"
    },
    {
        "file": "loot/deleted",
        "category": "loot",
        "description": "Item destroyed, dissipating, removal",
        "duration": 0.5,
        "style": "Item fading away, gentle destruction, removal sound"
    },
    {
        "file": "loot/drop",
        "category": "loot",
        "description": "Treasure drop, coins falling, loot available",
        "duration": 0.8,
        "style": "Exciting loot drop, treasure revealing, gold coins"
    },
    {
        "file": "loot/pickup",
        "category": "loot",
        "description": "Loot collected, item obtained, satisfying grab",
        "duration": 0.4,
        "style": "Satisfying pickup, item collected, into inventory"
    },

    # Ambient/Music
    {
        "file": "ambient/forge",
        "category": "ambient",
        "description": "Distant forge sounds, magical workshop ambience, crackling energy",
        "duration": 60.0,
        "style": "Loopable ambient, forge hammering in distance, magical energy hum, workshop atmosphere",
        "loop": True
    },
    {
        "file": "music/main_theme",
        "category": "music",
        "description": "Epic orchestral theme, heroic and inspiring, fantasy adventure",
        "duration": 180.0,
        "style": "Orchestral, inspiring, heroic, fantasy RPG main menu music",
        "loop": True
    },
    {
        "file": "music/battle",
        "category": "music",
        "description": "Intense battle music, driving percussion, urgent strings",
        "duration": 120.0,
        "style": "Intense orchestral, driving drums, action music, deadline energy",
        "loop": True
    },
    {
        "file": "music/victory",
        "category": "music",
        "description": "Victory fanfare, triumphant brass, celebration",
        "duration": 8.0,
        "style": "Triumphant fanfare, brass section, victory celebration"
    },
]


def create_silent_wav(filepath: Path, duration: float, sample_rate: int = 44100):
    """Create a silent WAV file as placeholder"""
    filepath.parent.mkdir(parents=True, exist_ok=True)

    num_samples = int(duration * sample_rate)
    silent_data = b'\x00\x00' * num_samples  # 16-bit silence

    with wave.open(str(filepath), 'wb') as wav_file:
        wav_file.setnchannels(1)  # Mono
        wav_file.setsampwidth(2)  # 16-bit
        wav_file.setframerate(sample_rate)
        wav_file.writeframes(silent_data)


def generate_placeholders():
    """Generate silent placeholder audio files"""
    print("\n=== Generating Placeholder Audio Files ===\n")

    for sound in SOUND_DEFINITIONS:
        file_path = sound["file"]
        duration = sound.get("duration", 1.0)
        variations = sound.get("variations", 0)

        if variations:
            for i in range(1, variations + 1):
                output_path = OUTPUT_DIR / f"{file_path}_{i}.wav"
                create_silent_wav(output_path, duration)
                print(f"  Created: {file_path}_{i}.wav ({duration}s)")
        else:
            output_path = OUTPUT_DIR / f"{file_path}.wav"
            create_silent_wav(output_path, duration)
            print(f"  Created: {file_path}.wav ({duration}s)")


def generate_manifest():
    """Generate a manifest JSON for sound designers"""
    manifest = {
        "version": "1.0",
        "description": "AgentForge Sound Asset Requirements",
        "format": "MP3 or OGG, 44100Hz, Mono or Stereo",
        "sounds": []
    }

    for sound in SOUND_DEFINITIONS:
        entry = {
            "file": sound["file"],
            "category": sound["category"],
            "description": sound["description"],
            "duration_seconds": sound.get("duration", 1.0),
            "style_guide": sound.get("style", ""),
            "loops": sound.get("loop", False),
            "variations": sound.get("variations", 0)
        }
        manifest["sounds"].append(entry)

    manifest_path = OUTPUT_DIR / "manifest.json"
    with open(manifest_path, "w") as f:
        json.dump(manifest, f, indent=2)

    print(f"\nManifest written to: {manifest_path}")


def generate_readme():
    """Generate a README for sound production"""
    readme = """# AgentForge Sound Assets

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
"""

    readme_path = OUTPUT_DIR / "README.md"
    with open(readme_path, "w") as f:
        f.write(readme)

    print(f"README written to: {readme_path}")


def main():
    print("=" * 50)
    print("AgentForge Sound Asset Generator")
    print("=" * 50)

    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    # Generate placeholder files
    generate_placeholders()

    # Generate manifest
    generate_manifest()

    # Generate README
    generate_readme()

    print("\n" + "=" * 50)
    print("Sound asset generation complete!")
    print(f"Output directory: {OUTPUT_DIR}")
    print("\nNext steps:")
    print("1. Review manifest.json for sound requirements")
    print("2. Generate or source sounds matching descriptions")
    print("3. Replace .wav placeholders with .mp3 or .ogg files")
    print("=" * 50)


if __name__ == "__main__":
    main()
