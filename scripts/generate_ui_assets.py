#!/usr/bin/env python3
"""
UI Asset Generator for AgentForge

Generates additional UI assets for the fantasy-themed interface:
- Talent node frames (various states)
- Panel backgrounds with ornate details
- Quest scroll elements
- Activity icons for agent bubbles
- Decorative elements

Style: Fantasy RPG/MMO UI, ornate gold trim, magical effects.

Usage: python scripts/generate_ui_assets.py
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
    print("⚠ rembg not available, using chroma key removal")

# API Configuration
API_KEY = os.getenv("GEMINI_API_KEY")
if not API_KEY:
    print("ERROR: GEMINI_API_KEY environment variable not set")
    print("Set it with: export GEMINI_API_KEY='your-key-here'")
    sys.exit(1)

GEMINI_URL = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-3-pro-image-preview:generateContent?key={API_KEY}"

# Output directory
SCRIPT_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = SCRIPT_DIR.parent
OUTPUT_BASE = PROJECT_ROOT / "public" / "assets_isometric" / "ui"

# Color palette
COLORS = {
    "arcane_purple": "#8B5CF6",
    "fel_green": "#22C55E",
    "holy_gold": "#F59E0B",
    "frost_blue": "#3B82F6",
    "fire_orange": "#EF4444",
    "shadow_black": "#1A1A2E",
    "parchment": "#FEF3C7",
}

# =============================================================================
# TALENT NODE FRAMES (64x64)
# =============================================================================
TALENT_NODES = [
    ("talent_frame_locked",
     "fantasy RPG skill icon frame, dark stone, locked state with chain and padlock overlay, "
     "grey tones, 64x64 square, ornate border, game UI element, dark background"),

    ("talent_frame_available",
     "fantasy RPG skill icon frame, golden glow ready to learn, shimmering magical border, "
     "64x64 square, pulsing gold and amber light, game UI element, dark background"),

    ("talent_frame_learned",
     "fantasy RPG skill icon frame, partially filled with purple arcane energy, "
     "64x64 square, glowing magical runes on border, game UI element, dark background"),

    ("talent_frame_maxed",
     "fantasy RPG skill icon frame, fully empowered, brilliant gold and purple, "
     "64x64 square, radiating magical power, legendary glow effect, game UI element, dark background"),
]

# =============================================================================
# PANEL BACKGROUNDS (various sizes)
# =============================================================================
PANELS = [
    ("panel_talent_tree", "512x640",
     "ancient magical skill tome page background, aged parchment with arcane symbols, "
     "purple magical energy glowing from edges, ornate gold corner decorations, "
     "fantasy RPG talent tree background, dark mystical atmosphere"),

    ("panel_quest_scroll", "400x500",
     "fantasy quest parchment scroll background, aged paper with burnt edges, "
     "red wax seal at top, ornate header decoration, medieval fantasy style, "
     "space for text, RPG quest log aesthetic"),

    ("panel_loot", "320x400",
     "fantasy treasure chest inventory panel, wooden chest interior view, "
     "velvet lined compartments, gold trim edges, RPG loot window style, "
     "magical sparkles, dark rich wood texture"),

    ("panel_minimap_frame", "200x200",
     "ornate circular fantasy minimap frame, gold and bronze metalwork, "
     "compass rose decoration, magical runes around edge, RPG game UI style, "
     "transparent center for map content"),
]

# =============================================================================
# ACTIVITY ICONS (32x32)
# =============================================================================
ACTIVITY_ICONS = [
    ("activity_thinking",
     "fantasy brain with magical sparkles icon, purple glow, thinking/processing, "
     "32x32 game UI icon, clean simple design, dark background"),

    ("activity_researching",
     "magical magnifying glass with sparkles icon, blue glow, searching/researching, "
     "32x32 game UI icon, fantasy style, dark background"),

    ("activity_reading",
     "open magical tome with floating pages icon, golden glow, reading/analyzing, "
     "32x32 game UI icon, fantasy book, dark background"),

    ("activity_writing",
     "magical quill writing with purple ink icon, arcane sparkles, coding/writing, "
     "32x32 game UI icon, fantasy style, dark background"),

    ("activity_testing",
     "bubbling alchemy flask icon, green liquid, testing/experimenting, "
     "32x32 game UI icon, fantasy potion style, dark background"),

    ("activity_building",
     "magical hammer and anvil icon, orange forge glow, building/compiling, "
     "32x32 game UI icon, fantasy blacksmith style, dark background"),

    ("activity_git",
     "magical tree with branching energy icon, green nature magic, git/version control, "
     "32x32 game UI icon, fantasy world tree style, dark background"),

    ("activity_waiting",
     "hourglass with magical sand icon, golden glow, waiting for input, "
     "32x32 game UI icon, fantasy time magic style, dark background"),

    ("activity_error",
     "cracked red crystal icon, dangerous energy, error/warning state, "
     "32x32 game UI icon, fantasy danger style, dark background"),
]

# =============================================================================
# DECORATIVE ELEMENTS
# =============================================================================
DECORATIONS = [
    ("corner_ornament_gold", "64x64",
     "ornate gold corner decoration, fantasy UI element, filigree metalwork, "
     "curved flourishes, transparent background, game interface corner piece"),

    ("divider_horizontal", "256x16",
     "horizontal ornate gold divider bar, fantasy UI separator, "
     "gem centerpiece, metalwork flourishes, game interface element"),

    ("glow_purple", "128x128",
     "soft purple magical glow effect, radial gradient, arcane energy, "
     "transparent edges, game VFX overlay, ambient magic"),

    ("glow_gold", "128x128",
     "soft golden holy glow effect, radial gradient, divine energy, "
     "transparent edges, game VFX overlay, blessing magic"),
]


def rgb_to_hsv(r: int, g: int, b: int) -> tuple:
    """Convert RGB (0-255) to HSV (0-360, 0-1, 0-1)."""
    r, g, b = r / 255.0, g / 255.0, b / 255.0
    max_c = max(r, g, b)
    min_c = min(r, g, b)
    diff = max_c - min_c
    v = max_c
    s = 0 if max_c == 0 else diff / max_c
    if diff == 0:
        h = 0
    elif max_c == r:
        h = 60 * ((g - b) / diff % 6)
    elif max_c == g:
        h = 60 * ((b - r) / diff + 2)
    else:
        h = 60 * ((r - g) / diff + 4)
    return h, s, v


def should_remove_pixel(r: int, g: int, b: int) -> bool:
    """Check if a pixel should be made transparent."""
    # Near-black
    if r <= 20 and g <= 20 and b <= 20:
        return True
    # Near-white
    if r >= 240 and g >= 240 and b >= 240:
        return True
    # Green screen (HSV-based detection)
    h, s, v = rgb_to_hsv(r, g, b)
    if 80 <= h <= 160 and s >= 0.25 and v >= 0.2:
        return True
    # Blue screen
    if 180 <= h <= 260 and s >= 0.25 and v >= 0.2:
        return True
    return False


def remove_background(image_data: bytes) -> bytes:
    """Remove background from image using rembg or enhanced chroma key."""
    if not HAS_PIL:
        return image_data

    img = Image.open(BytesIO(image_data))

    if HAS_REMBG:
        # Use AI background removal
        result = rembg_remove(img)
        output = BytesIO()
        result.save(output, format='PNG')
        return output.getvalue()
    else:
        # Enhanced chroma key (removes green/blue screens + black/white)
        img = img.convert("RGBA")
        data = img.getdata()
        new_data = []
        for item in data:
            r, g, b, a = item[0], item[1], item[2], item[3] if len(item) > 3 else 255
            if should_remove_pixel(r, g, b):
                new_data.append((r, g, b, 0))
            else:
                new_data.append((r, g, b, a))
        img.putdata(new_data)
        output = BytesIO()
        img.save(output, format='PNG')
        return output.getvalue()


def generate_image(prompt: str, size: str = "64x64") -> bytes | None:
    """Generate an image using Gemini API."""
    width, height = map(int, size.split('x'))

    full_prompt = f"""Generate a game UI asset image:

{prompt}

Technical requirements:
- Exact size: {width}x{height} pixels
- Style: Fantasy RPG/MMO game UI
- Colors: Vibrant, rich (not muted)
- Clean edges suitable for game interface
- Professional quality game asset
"""

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

        data = response.json()

        # Extract image from response
        for candidate in data.get("candidates", []):
            for part in candidate.get("content", {}).get("parts", []):
                if "inlineData" in part:
                    image_data = base64.b64decode(part["inlineData"]["data"])
                    return image_data

        print(f"  ⚠ No image in response")
        return None

    except requests.exceptions.RequestException as e:
        print(f"  ✗ API error: {e}")
        return None


def save_image(image_data: bytes, path: Path, remove_bg: bool = True):
    """Save image to file, optionally removing background."""
    path.parent.mkdir(parents=True, exist_ok=True)

    if remove_bg:
        image_data = remove_background(image_data)

    with open(path, 'wb') as f:
        f.write(image_data)

    print(f"  ✓ Saved: {path.name}")


def generate_talent_nodes():
    """Generate talent node frame assets."""
    print("\n🎯 Generating Talent Node Frames...")
    output_dir = OUTPUT_BASE / "talents"

    for name, prompt in TALENT_NODES:
        print(f"  Generating {name}...")
        image_data = generate_image(prompt, "64x64")
        if image_data:
            save_image(image_data, output_dir / f"{name}.png")
        time.sleep(1)  # Rate limiting


def generate_panels():
    """Generate panel background assets."""
    print("\n📜 Generating Panel Backgrounds...")
    output_dir = OUTPUT_BASE / "panels"

    for name, size, prompt in PANELS:
        print(f"  Generating {name} ({size})...")
        image_data = generate_image(prompt, size)
        if image_data:
            save_image(image_data, output_dir / f"{name}.png", remove_bg=False)
        time.sleep(1)


def generate_activity_icons():
    """Generate activity status icons."""
    print("\n⚡ Generating Activity Icons...")
    output_dir = OUTPUT_BASE / "activities"

    for name, prompt in ACTIVITY_ICONS:
        print(f"  Generating {name}...")
        image_data = generate_image(prompt, "32x32")
        if image_data:
            save_image(image_data, output_dir / f"{name}.png")
        time.sleep(1)


def generate_decorations():
    """Generate decorative UI elements."""
    print("\n✨ Generating Decorations...")
    output_dir = OUTPUT_BASE / "decorations"

    for name, size, prompt in DECORATIONS:
        print(f"  Generating {name} ({size})...")
        image_data = generate_image(prompt, size)
        if image_data:
            save_image(image_data, output_dir / f"{name}.png")
        time.sleep(1)


def update_manifest():
    """Update the asset manifest with new UI assets."""
    manifest_path = OUTPUT_BASE.parent / "manifest.json"

    if manifest_path.exists():
        with open(manifest_path) as f:
            manifest = json.load(f)
    else:
        manifest = {}

    # Add new categories
    manifest["ui"]["talents"] = [name for name, _ in TALENT_NODES]
    manifest["ui"]["panels"] = [name for name, _, _ in PANELS]
    manifest["ui"]["activities"] = [name for name, _ in ACTIVITY_ICONS]
    manifest["ui"]["decorations"] = [name for name, _, _ in DECORATIONS]

    with open(manifest_path, 'w') as f:
        json.dump(manifest, f, indent=2)

    print(f"\n✓ Updated manifest: {manifest_path}")


def main():
    print("=" * 60)
    print("AgentForge UI Asset Generator")
    print("=" * 60)

    # Create output directory
    OUTPUT_BASE.mkdir(parents=True, exist_ok=True)

    # Generate all asset categories
    generate_talent_nodes()
    generate_panels()
    generate_activity_icons()
    generate_decorations()

    # Update manifest
    update_manifest()

    print("\n" + "=" * 60)
    print("✓ UI asset generation complete!")
    print("=" * 60)


if __name__ == "__main__":
    main()
