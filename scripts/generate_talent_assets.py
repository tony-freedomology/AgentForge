#!/usr/bin/env python3
"""
Talent Tree Asset Generator

Generates fantasy-style icons for the talent tree system using Gemini/Imagen.
Each class has unique visual styles for their talent icons.

Run this script locally where the Gemini API is accessible.
Usage: python scripts/generate_talent_assets.py
"""

import os
import sys
import json
import time
import base64
import requests
from pathlib import Path
from io import BytesIO

try:
    from PIL import Image
    HAS_PIL = True
except ImportError:
    HAS_PIL = False
    print("⚠ PIL not available, images won't be post-processed")

try:
    from rembg import remove as rembg_remove
    HAS_REMBG = True
    print("✓ rembg loaded for AI background removal")
except ImportError:
    HAS_REMBG = False
    print("⚠ rembg not available, using raw images")

# API Configuration
API_KEY = "AIzaSyBLWDR40WPHP8zuZbukdjn-oF9Nncy_avE"
GEMINI_URL = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-3-pro-image-preview:generateContent?key={API_KEY}"

# Output directories - use assets_opus to keep separate from other agent
OUTPUT_DIR = Path("public/assets_opus/talents")
UI_DIR = Path("public/assets_opus/ui")

# Talent icon definitions by class
TALENT_ICONS = {
    "mage": {
        "style": "arcane magical purple and blue glowing energy, crystal formations, mystical runes",
        "talents": [
            ("arcane_intellect", "glowing brain with arcane symbols floating around it"),
            ("quick_casting", "lightning bolt striking through an hourglass"),
            ("spell_focus", "magical crosshair target with arcane circles"),
            ("pyroblast", "massive fireball with trailing flames"),
            ("arcane_missiles", "three glowing purple magical projectiles in formation"),
            ("frost_nova", "ice crystal explosion pattern"),
            ("presence_of_mind", "ethereal head silhouette with glowing thoughts"),
            ("arcane_power", "swirling vortex of purple magical energy"),
            ("ice_barrier", "crystalline ice shield with frost particles"),
            ("combustion", "volcanic explosion with molten energy"),
            ("evocation", "spiral of regenerating magical energy"),
            ("deep_freeze", "frozen crystal prison"),
            ("time_warp", "clock face shattering with time distortion effects"),
        ]
    },
    "guardian": {
        "style": "holy golden light, divine protection, shields and armor, paladin aesthetic",
        "talents": [
            ("divine_shield", "golden tower shield radiating holy light"),
            ("vigilance", "watchful eye surrounded by golden rays"),
            ("code_armor", "knight armor made of glowing code lines"),
            ("consecration", "holy ground circle with divine runes"),
            ("blessing_of_protection", "golden hands cupping a protective sphere"),
            ("righteous_fury", "flaming sword with holy symbols"),
            ("lay_on_hands", "glowing healing hands with golden light"),
            ("aura_of_devotion", "radiating golden aura circles"),
            ("holy_wrath", "divine lightning strike from above"),
            ("guardian_spirit", "ethereal golden guardian figure"),
            ("last_stand", "broken shield reforming with golden light"),
            ("shield_wall", "interlocked shields forming barrier"),
            ("divine_intervention", "beam of holy light from the heavens"),
        ]
    },
    "architect": {
        "style": "cosmic wisdom, blueprint patterns, third eye, construction and planning",
        "talents": [
            ("systems_thinking", "interconnected nodes forming a brain shape"),
            ("pattern_recognition", "geometric pattern with highlighted matches"),
            ("structural_analysis", "building schematic with analysis markers"),
            ("modular_design", "interlocking puzzle pieces"),
            ("dependency_injection", "flowing streams connecting modules"),
            ("event_driven", "lightning bolt connecting event nodes"),
            ("big_picture", "eagle eye view of vast landscape"),
            ("scalable_architecture", "ascending building blocks getting larger"),
            ("load_balancing", "scales balancing multiple weights"),
            ("microservices", "constellation of small connected services"),
            ("caching_mastery", "memory crystal storing data"),
            ("distributed_systems", "network of connected nodes across globe"),
            ("grand_architect", "cosmic figure drawing reality blueprints"),
        ]
    },
    "scout": {
        "style": "nature magic, elven aesthetic, forest spirits, tracking and speed",
        "talents": [
            ("swift_reading", "eyes with speed lines reading scroll"),
            ("keen_eye", "sharp elven eye with targeting reticle"),
            ("light_footed", "winged boots leaving no footprints"),
            ("tracking", "glowing footprints leading through forest"),
            ("camouflage", "figure blending into foliage"),
            ("mark_target", "glowing mark on target silhouette"),
            ("rapid_assessment", "quick scan lines over document"),
            ("evasion", "dodging figure leaving afterimages"),
            ("critical_strike", "dagger hitting precise point"),
            ("shadow_step", "figure stepping through shadow portal"),
            ("hunters_mark", "wolf head howling with tracking runes"),
            ("killing_blow", "fatal strike with energy explosion"),
            ("master_scout", "ranger figure with spirit animal companions"),
        ]
    },
    "artisan": {
        "style": "crafting aesthetic, forge fires, runes, dwarven craftsmanship, tools",
        "talents": [
            ("craftsmanship", "ornate hammer on anvil"),
            ("efficiency", "gear system running smoothly"),
            ("resourcefulness", "recycling symbol with magical energy"),
            ("enchanting", "magical runes being inscribed"),
            ("mass_production", "assembly line of glowing items"),
            ("salvaging", "broken item being reclaimed"),
            ("masterwork", "glowing perfect crafted item"),
            ("assembly_line", "automated crafting stations"),
            ("transmutation", "item transforming into another"),
            ("legendary_craft", "legendary weapon with epic aura"),
            ("automation", "self-working magical machinery"),
            ("philosophers_stone", "glowing red alchemical stone"),
            ("grand_master", "master crafter with legendary tools"),
        ]
    }
}

# UI Elements needed
UI_ELEMENTS = [
    ("talent_frame_gold", "ornate golden frame border for talent icons, fantasy RPG style, intricate details"),
    ("talent_frame_locked", "dark iron frame with chains, locked talent icon border"),
    ("talent_frame_maxed", "brilliant golden frame with sparkles, mastered talent border"),
    ("talent_point_orb", "glowing golden orb with sparkles, talent point indicator"),
    ("talent_connection_active", "golden glowing line, energy flowing through"),
    ("talent_connection_inactive", "dark muted line, dormant connection"),
    ("talent_tree_background", "dark parchment with faint arcane symbols, talent tree backdrop"),
    ("reset_button", "swirling vortex with undo symbol, talent reset button"),
]


def generate_image(prompt: str, filename: str, output_dir: Path):
    """Generate an image using Gemini API"""

    output_dir.mkdir(parents=True, exist_ok=True)
    output_path = output_dir / f"{filename}.png"

    # Skip if already exists
    if output_path.exists():
        print(f"  Skipping {filename} (already exists)")
        return True

    full_prompt = f"""Generate an image: Create a 128x128 pixel icon for a fantasy RPG game.
Style: World of Warcraft inspired, painterly, vibrant colors, slight glow effects.
Background: Solid bright green (#00FF00) background for easy removal.
Subject: {prompt}
Requirements:
- Centered composition
- Clear silhouette
- Rich colors with magical glow
- Professional game UI quality
- No text or letters
- On solid bright green background"""

    payload = {
        "contents": [{
            "parts": [{"text": full_prompt}]
        }],
        "generationConfig": {
            "responseModalities": ["image", "text"],
            "responseMimeType": "text/plain"
        }
    }

    try:
        response = requests.post(GEMINI_URL, json=payload, timeout=60)
        response.raise_for_status()

        result = response.json()

        # Extract image from response
        for candidate in result.get("candidates", []):
            for part in candidate.get("content", {}).get("parts", []):
                if "inlineData" in part:
                    image_data = base64.b64decode(part["inlineData"]["data"])

                    # Post-process with rembg if available
                    if HAS_PIL and HAS_REMBG:
                        try:
                            img = Image.open(BytesIO(image_data))
                            img = rembg_remove(img)
                            # Resize to 128x128
                            img = img.resize((128, 128), Image.Resampling.LANCZOS)
                            img.save(output_path, "PNG")
                            print(f"  ✓ Generated with AI bg removal: {filename}")
                        except Exception as e:
                            print(f"  ⚠ Post-processing failed, saving raw: {e}")
                            with open(output_path, "wb") as f:
                                f.write(image_data)
                    else:
                        with open(output_path, "wb") as f:
                            f.write(image_data)
                        print(f"  Generated: {filename}")
                    return True

        print(f"  No image in response for {filename}")
        return False

    except requests.exceptions.RequestException as e:
        print(f"  Error generating {filename}: {e}")
        return False


def generate_talent_icons():
    """Generate all talent icons for each class"""

    print("\n=== Generating Talent Icons ===\n")

    for class_name, class_data in TALENT_ICONS.items():
        print(f"\n[{class_name.upper()}]")
        class_dir = OUTPUT_DIR / class_name
        style = class_data["style"]

        for talent_id, description in class_data["talents"]:
            prompt = f"{description}. Style: {style}"
            generate_image(prompt, talent_id, class_dir)
            time.sleep(2)  # Rate limiting


def generate_ui_elements():
    """Generate UI elements for talent system"""

    print("\n=== Generating UI Elements ===\n")

    for element_id, description in UI_ELEMENTS:
        generate_image(description, element_id, UI_DIR / "talents")


def create_manifest():
    """Create a manifest of all generated assets"""

    manifest = {
        "talents": {},
        "ui": []
    }

    # Scan talent directories
    for class_name in TALENT_ICONS.keys():
        class_dir = OUTPUT_DIR / class_name
        if class_dir.exists():
            manifest["talents"][class_name] = [
                f.stem for f in class_dir.glob("*.png")
            ]

    # Scan UI directory
    ui_dir = UI_DIR / "talents"
    if ui_dir.exists():
        manifest["ui"] = [f.stem for f in ui_dir.glob("*.png")]

    # Write manifest
    manifest_path = OUTPUT_DIR / "manifest.json"
    with open(manifest_path, "w") as f:
        json.dump(manifest, f, indent=2)

    print(f"\nManifest written to {manifest_path}")


def main():
    print("=" * 50)
    print("AgentForge Talent Asset Generator")
    print("=" * 50)

    if API_KEY == "YOUR_GEMINI_API_KEY_HERE":
        print("\n[!] Please set your Gemini API key in this script")
        print("    Edit the API_KEY variable at the top of the file")
        return

    # Generate all assets
    generate_talent_icons()
    generate_ui_elements()
    create_manifest()

    print("\n" + "=" * 50)
    print("Asset generation complete!")
    print("=" * 50)


if __name__ == "__main__":
    main()
