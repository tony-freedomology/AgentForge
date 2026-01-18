#!/usr/bin/env python3
"""
Isometric Asset Generator for AgentForge

Generates all isometric assets for the PixiJS 2D pivot:
- Tiles (64x32 isometric)
- Agent sprites (64x96)
- Props and decorations
- UI elements
- Effects and particles
- Minimap assets

Style: Vibrant fantasy/Warcraft themed, rich colors, NOT muted tones.

Usage: python scripts/generate_isometric_assets.py
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

# API Configuration - load from environment
API_KEY = os.getenv("GEMINI_API_KEY")
if not API_KEY:
    print("ERROR: GEMINI_API_KEY environment variable not set")
    print("Set it with: export GEMINI_API_KEY='your-key-here'")
    sys.exit(1)

GEMINI_URL = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-3-pro-image-preview:generateContent?key={API_KEY}"

# Output base directory - relative to script location for consistency
SCRIPT_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = SCRIPT_DIR.parent
OUTPUT_BASE = PROJECT_ROOT / "public" / "assets_isometric"

# Color palette for reference
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
# TILE DEFINITIONS (64x32 isometric)
# =============================================================================
TILES = {
    "ground": [
        ("tile_stone_base", "isometric stone floor tile, grey cobblestone, fantasy dungeon style"),
        ("tile_stone_mossy", "isometric stone floor with green moss growing between cracks"),
        ("tile_stone_cracked", "isometric weathered cracked stone floor tile"),
        ("tile_grass", "isometric lush green grass tile, vibrant fantasy meadow"),
        ("tile_dirt", "isometric brown dirt earth tile, packed soil"),
        ("tile_water", "isometric crystal clear blue water tile, magical sparkles"),
        ("tile_lava", "isometric glowing orange lava tile, molten rock"),
        ("tile_void", "isometric dark purple void tile, magical darkness with stars"),
        ("tile_arcane", "isometric purple glowing arcane magic tile, runic patterns"),
        ("tile_gold", "isometric golden treasure room tile, shimmering gold"),
    ],
    "special": [
        ("tile_portal_base", "isometric circular portal spawn point, magical stone ring"),
        ("tile_portal_glow", "isometric swirling purple portal energy, magical vortex"),
        ("tile_highlight_move", "isometric blue movement highlight overlay, soft glow"),
        ("tile_highlight_attack", "isometric red attack highlight overlay, danger glow"),
        ("tile_highlight_select", "isometric golden selection highlight, holy glow"),
    ]
}

# =============================================================================
# AGENT SPRITE DEFINITIONS (64x96)
# =============================================================================
AGENTS = {
    "claude": {
        "color": "purple arcane",
        "theme": "mystical purple robed mage, glowing purple eyes, arcane symbols",
        "animations": ["idle", "walk", "cast", "celebrate"]
    },
    "codex": {
        "color": "green nature",
        "theme": "emerald green hooded ranger, fel green energy, nature magic",
        "animations": ["idle", "walk", "cast", "celebrate"]
    },
    "gemini": {
        "color": "blue frost",
        "theme": "ice blue armored knight, frost aura, crystalline elements",
        "animations": ["idle", "walk", "cast", "celebrate"]
    }
}

DIRECTIONS = ["s", "sw", "w", "nw"]  # East-facing mirrored from west

# =============================================================================
# PROPS DEFINITIONS
# =============================================================================
PROPS = {
    "portal": [
        ("portal_frame", "stone archway portal frame, ancient runes, 128x160 pixels", (128, 160)),
        ("portal_swirl", "swirling magical purple energy vortex, mystical portal", (128, 128)),
        ("portal_particles", "floating magical particles, sparkles and motes", (64, 64)),
    ],
    "decorative": [
        ("crystal_purple", "purple arcane crystal cluster, glowing magical", (64, 96)),
        ("crystal_green", "green nature crystal cluster, fel energy", (64, 96)),
        ("crystal_blue", "blue frost crystal cluster, ice magic", (64, 96)),
        ("torch_wall", "wall mounted burning torch, fantasy style flames", (32, 64)),
        ("banner_guild", "hanging guild banner, ornate fantasy design", (48, 96)),
        ("chest_closed", "wooden treasure chest closed, iron bands", (64, 48)),
        ("chest_open", "wooden treasure chest open with golden glow inside", (64, 64)),
        ("bookshelf", "magical bookshelf with glowing tomes, mystical library", (64, 96)),
        ("cauldron", "bubbling green potion cauldron, magical brew", (64, 64)),
        ("tree_magical", "glowing magical tree, purple leaves, fantasy flora", (96, 128)),
        ("mushroom_cluster", "fantasy glowing mushrooms, bioluminescent fungi", (48, 48)),
    ]
}

# =============================================================================
# UI ELEMENTS DEFINITIONS
# =============================================================================
UI_ELEMENTS = {
    "frames": [
        ("panel_stone", "stone panel background texture, fantasy UI, seamless", (64, 64)),
        ("panel_parchment", "old parchment paper texture, yellowed, seamless", (64, 64)),
        ("panel_dark", "dark shadowy panel texture, mystical, seamless", (64, 64)),
        ("frame_portrait", "ornate golden portrait frame, 80x80, fantasy RPG style", (80, 80)),
        ("frame_portrait_selected", "golden portrait frame with magical glow selected state", (80, 80)),
        ("healthbar_frame", "ornate health bar frame, fantasy UI, horizontal", (128, 24)),
        ("healthbar_fill_hp", "green health bar fill segment, smooth gradient", (126, 20)),
        ("healthbar_fill_xp", "purple experience bar fill segment, magical", (126, 20)),
        ("healthbar_fill_mana", "blue mana bar fill segment, mystical energy", (126, 20)),
    ],
    "icons": [
        ("icon_quest_available", "yellow exclamation mark, quest available, fantasy style", (32, 32)),
        ("icon_quest_complete", "yellow question mark, quest complete, fantasy style", (32, 32)),
        ("icon_quest_progress", "hourglass icon, quest in progress, golden sand", (32, 32)),
        ("icon_level_up", "golden star burst, level up celebration icon", (32, 32)),
        ("icon_gold", "shiny gold coin, treasure currency icon", (32, 32)),
        ("icon_xp", "purple glowing experience orb, magical", (32, 32)),
        ("icon_artifact", "glowing magical scroll or file artifact icon", (32, 32)),
        ("icon_talent_point", "golden talent point star, skill tree", (32, 32)),
    ],
    "buttons": [
        ("btn_primary", "golden primary action button, ornate fantasy style", (96, 32)),
        ("btn_secondary", "stone secondary button, subtle fantasy style", (96, 32)),
        ("btn_danger", "red danger delete button, warning style", (96, 32)),
        ("btn_close", "ornate X close button, fantasy UI", (24, 24)),
    ]
}

# =============================================================================
# EFFECTS DEFINITIONS
# =============================================================================
EFFECTS = [
    ("effect_spawn", "magical spawn burst effect, purple energy explosion, 16 frames horizontal", (1024, 64)),
    ("effect_levelup", "level up celebration burst, golden sparkles stars, 12 frames", (768, 64)),
    ("effect_quest_complete", "quest complete sparkles fireworks, golden, 12 frames", (768, 64)),
    ("effect_teleport", "teleport swirl effect, purple magic vortex, 8 frames", (512, 64)),
    ("effect_magic_purple", "purple arcane magic particles, floating sparkles", (256, 64)),
    ("effect_magic_green", "green nature magic particles, leaves and sparkles", (256, 64)),
    ("effect_magic_blue", "blue frost magic particles, ice crystals", (256, 64)),
    ("effect_magic_gold", "golden holy magic particles, divine light", (256, 64)),
]

# =============================================================================
# MINIMAP DEFINITIONS
# =============================================================================
MINIMAP = [
    ("minimap_frame", "ornate minimap border frame, fantasy map style", (200, 200)),
    ("minimap_agent_claude", "purple dot marker for minimap, glowing", (8, 8)),
    ("minimap_agent_codex", "green dot marker for minimap, glowing", (8, 8)),
    ("minimap_agent_gemini", "blue dot marker for minimap, glowing", (8, 8)),
    ("minimap_portal", "portal icon for minimap, swirling purple", (12, 12)),
    ("minimap_quest", "quest objective marker for minimap, golden star", (10, 10)),
]


def remove_background_chroma(img: Image.Image, green_threshold: int = 180, other_threshold: int = 120) -> Image.Image:
    """Remove green-screen style background using chroma key.

    Targets opaque pixels where green channel is high and red/blue are low.
    Preserves existing transparency (pixels with alpha=0 are skipped).

    Note: This is a slow fallback for when rembg is unavailable.
    Acceptable for small icons (128x128) but not recommended for large images.

    Args:
        img: PIL Image to process
        green_threshold: Min green value (inclusive) to treat as background
        other_threshold: Max red/blue values (inclusive) to treat as background

    Returns:
        RGBA image with green background pixels made transparent
    """
    if img is None:
        return img

    img = img.convert("RGBA")
    pixels = img.load()
    width, height = img.size

    for y in range(height):
        for x in range(width):
            r, g, b, a = pixels[x, y]
            # Skip already transparent pixels to preserve existing alpha
            if a == 0:
                continue
            # Remove green-screen background
            if g >= green_threshold and r <= other_threshold and b <= other_threshold:
                pixels[x, y] = (0, 0, 0, 0)

    return img


def remove_background(img: Image.Image) -> Image.Image:
    """Remove background - uses AI (rembg) if available, falls back to chroma key.

    Returns:
        RGBA image with background removed
    """
    if img is None:
        return img

    if HAS_REMBG:
        try:
            result = rembg_remove(img)
            # Handle case where rembg returns bytes instead of Image
            if isinstance(result, bytes):
                result = Image.open(BytesIO(result))
            # Fully load the image data before conversion (avoid lazy loading issues)
            result.load()
            return result.convert("RGBA")
        except Exception as e:
            print(f"    Warning: rembg failed ({e}), using chroma key fallback")
            return remove_background_chroma(img)
    else:
        return remove_background_chroma(img)


def generate_image(prompt: str, filename: str, output_dir: Path, size: tuple = (64, 64), remove_bg: bool = True):
    """Generate an image using Gemini API"""

    output_dir.mkdir(parents=True, exist_ok=True)
    output_path = output_dir / f"{filename}.png"

    # Skip if already exists
    if output_path.exists():
        print(f"  ⏭ Skipping {filename} (exists)")
        return True

    width, height = size

    # Build the full prompt with style guidelines
    full_prompt = f"""Generate an image: Create a {width}x{height} pixel game asset.
Style: Vibrant fantasy RPG, World of Warcraft inspired, rich saturated colors, NOT muted tones.
Colors: Use rich purples (#8B5CF6), greens (#22C55E), golds (#F59E0B), blues (#3B82F6).
Background: Solid bright green (#00FF00) for easy removal.
Subject: {prompt}
Requirements:
- Pixel art or painterly style appropriate for isometric RPG
- Clear silhouette and good contrast
- Magical glow effects where appropriate
- Professional game UI quality
- No text or letters
- Centered composition on bright green background"""

    payload = {
        "contents": [{"parts": [{"text": full_prompt}]}],
        "generationConfig": {
            "responseModalities": ["image", "text"],
            "responseMimeType": "text/plain"
        }
    }

    try:
        response = requests.post(GEMINI_URL, json=payload, timeout=90)
        response.raise_for_status()

        result = response.json()

        for candidate in result.get("candidates", []):
            for part in candidate.get("content", {}).get("parts", []):
                if "inlineData" in part:
                    image_data = base64.b64decode(part["inlineData"]["data"])

                    if HAS_PIL:
                        img = Image.open(BytesIO(image_data))

                        # Remove background
                        if remove_bg:
                            img = remove_background(img)

                        # Resize to target size
                        img = img.resize(size, Image.Resampling.LANCZOS)
                        img.save(output_path, "PNG")
                        print(f"  ✓ {filename}")
                    else:
                        with open(output_path, "wb") as f:
                            f.write(image_data)
                        print(f"  ✓ {filename} (raw)")

                    return True

        print(f"  ✗ No image in response for {filename}")
        return False

    except requests.exceptions.RequestException as e:
        print(f"  ✗ Error generating {filename}: {e}")
        return False


def generate_tiles():
    """Generate all isometric tile assets"""
    print("\n" + "="*60)
    print("GENERATING TILES (64x32 isometric)")
    print("="*60)

    tiles_dir = OUTPUT_BASE / "tiles"
    total = 0
    success = 0

    for category, tiles in TILES.items():
        print(f"\n[{category.upper()}]")
        for tile_id, description in tiles:
            total += 1
            prompt = f"isometric 64x32 pixel tile, {description}, 2:1 dimetric projection"
            if generate_image(prompt, tile_id, tiles_dir, size=(64, 32)):
                success += 1
            time.sleep(2)  # Rate limiting

    print(f"\nTiles: {success}/{total} generated")
    return success, total


def generate_agent_sprites():
    """Generate agent character sprites"""
    print("\n" + "="*60)
    print("GENERATING AGENT SPRITES (64x96)")
    print("="*60)

    agents_dir = OUTPUT_BASE / "agents"
    total = 0
    success = 0

    for agent_name, agent_data in AGENTS.items():
        print(f"\n[{agent_name.upper()}]")
        agent_dir = agents_dir / agent_name

        color = agent_data["color"]
        theme = agent_data["theme"]

        for animation in agent_data["animations"]:
            for direction in DIRECTIONS:
                total += 1
                filename = f"{agent_name}_{animation}_{direction}"

                dir_desc = {
                    "s": "facing south (toward viewer)",
                    "sw": "facing southwest (3/4 view)",
                    "w": "facing west (side view)",
                    "nw": "facing northwest (3/4 back view)"
                }[direction]

                anim_desc = {
                    "idle": "standing idle pose, subtle breathing motion",
                    "walk": "mid-stride walking pose",
                    "cast": "casting spell pose, hands raised with magic",
                    "celebrate": "victory celebration pose, arms raised"
                }[animation]

                prompt = f"isometric {color} fantasy character sprite, {theme}, {anim_desc}, {dir_desc}, 64x96 pixels, chibi proportions, vibrant colors"

                if generate_image(prompt, filename, agent_dir, size=(64, 96)):
                    success += 1
                time.sleep(2)

    # Generate level badges
    print("\n[LEVEL BADGES]")
    badges_dir = agents_dir / "badges"
    badge_tiers = [
        ("level_badge_bronze", "bronze level badge, ranks 1-10"),
        ("level_badge_silver", "silver level badge, ranks 11-20"),
        ("level_badge_gold", "gold level badge, ranks 21-30"),
        ("level_badge_platinum", "platinum level badge, ranks 31-40"),
        ("level_badge_diamond", "diamond level badge, ranks 41-50, sparkling"),
    ]

    for badge_id, description in badge_tiers:
        total += 1
        prompt = f"fantasy RPG {description}, ornate design, glowing, 32x32 icon"
        if generate_image(prompt, badge_id, badges_dir, size=(32, 32)):
            success += 1
        time.sleep(2)

    print(f"\nAgent sprites: {success}/{total} generated")
    return success, total


def generate_props():
    """Generate environment props"""
    print("\n" + "="*60)
    print("GENERATING PROPS")
    print("="*60)

    props_dir = OUTPUT_BASE / "props"
    total = 0
    success = 0

    for category, props in PROPS.items():
        print(f"\n[{category.upper()}]")
        for prop_id, description, size in props:
            total += 1
            prompt = f"isometric fantasy game prop, {description}, vibrant colors, magical atmosphere"
            if generate_image(prompt, prop_id, props_dir, size=size):
                success += 1
            time.sleep(2)

    print(f"\nProps: {success}/{total} generated")
    return success, total


def generate_ui():
    """Generate UI elements"""
    print("\n" + "="*60)
    print("GENERATING UI ELEMENTS")
    print("="*60)

    ui_dir = OUTPUT_BASE / "ui"
    total = 0
    success = 0

    for category, elements in UI_ELEMENTS.items():
        print(f"\n[{category.upper()}]")
        for elem_id, description, size in elements:
            total += 1
            prompt = f"fantasy RPG UI element, {description}, World of Warcraft style, ornate details"
            if generate_image(prompt, elem_id, ui_dir / category, size=size, remove_bg=False):
                success += 1
            time.sleep(2)

    print(f"\nUI elements: {success}/{total} generated")
    return success, total


def generate_effects():
    """Generate effect sprite sheets"""
    print("\n" + "="*60)
    print("GENERATING EFFECTS")
    print("="*60)

    effects_dir = OUTPUT_BASE / "effects"
    total = 0
    success = 0

    for effect_id, description, size in EFFECTS:
        total += 1
        prompt = f"sprite sheet horizontal strip, {description}, fantasy magical effect, vibrant glowing"
        if generate_image(prompt, effect_id, effects_dir, size=size):
            success += 1
        time.sleep(2)

    print(f"\nEffects: {success}/{total} generated")
    return success, total


def generate_minimap():
    """Generate minimap assets"""
    print("\n" + "="*60)
    print("GENERATING MINIMAP ASSETS")
    print("="*60)

    minimap_dir = OUTPUT_BASE / "minimap"
    total = 0
    success = 0

    for item_id, description, size in MINIMAP:
        total += 1
        prompt = f"fantasy RPG minimap element, {description}, clean simple design"
        if generate_image(prompt, item_id, minimap_dir, size=size):
            success += 1
        time.sleep(2)

    print(f"\nMinimap: {success}/{total} generated")
    return success, total


def create_manifest():
    """Create a manifest of all generated assets"""
    manifest = {
        "tiles": [],
        "agents": {},
        "props": [],
        "ui": {},
        "effects": [],
        "minimap": []
    }

    # Scan tiles
    tiles_dir = OUTPUT_BASE / "tiles"
    if tiles_dir.exists():
        manifest["tiles"] = [f.stem for f in tiles_dir.glob("*.png")]

    # Scan agents
    agents_dir = OUTPUT_BASE / "agents"
    if agents_dir.exists():
        for agent_dir in agents_dir.iterdir():
            if agent_dir.is_dir():
                manifest["agents"][agent_dir.name] = [f.stem for f in agent_dir.glob("*.png")]

    # Scan props
    props_dir = OUTPUT_BASE / "props"
    if props_dir.exists():
        manifest["props"] = [f.stem for f in props_dir.glob("*.png")]

    # Scan UI
    ui_dir = OUTPUT_BASE / "ui"
    if ui_dir.exists():
        for category_dir in ui_dir.iterdir():
            if category_dir.is_dir():
                manifest["ui"][category_dir.name] = [f.stem for f in category_dir.glob("*.png")]

    # Scan effects
    effects_dir = OUTPUT_BASE / "effects"
    if effects_dir.exists():
        manifest["effects"] = [f.stem for f in effects_dir.glob("*.png")]

    # Scan minimap
    minimap_dir = OUTPUT_BASE / "minimap"
    if minimap_dir.exists():
        manifest["minimap"] = [f.stem for f in minimap_dir.glob("*.png")]

    # Write manifest
    manifest_path = OUTPUT_BASE / "manifest.json"
    with open(manifest_path, "w") as f:
        json.dump(manifest, f, indent=2)

    print(f"\n✓ Manifest written to {manifest_path}")


def main():
    print("="*60)
    print("AGENTFORGE ISOMETRIC ASSET GENERATOR")
    print("="*60)
    print(f"Output directory: {OUTPUT_BASE}")
    print(f"Style: Vibrant Fantasy/Warcraft")
    print("="*60)

    if API_KEY == "YOUR_API_KEY_HERE":
        print("\n✗ Please set your Gemini API key in this script")
        return

    # Track totals
    results = []

    # Generate all asset categories
    results.append(("Tiles", generate_tiles()))
    results.append(("Agents", generate_agent_sprites()))
    results.append(("Props", generate_props()))
    results.append(("UI", generate_ui()))
    results.append(("Effects", generate_effects()))
    results.append(("Minimap", generate_minimap()))

    # Create manifest
    create_manifest()

    # Print summary
    print("\n" + "="*60)
    print("GENERATION COMPLETE")
    print("="*60)

    total_success = 0
    total_count = 0

    for name, (success, count) in results:
        total_success += success
        total_count += count
        status = "✓" if success == count else "⚠"
        print(f"  {status} {name}: {success}/{count}")

    print("-"*60)
    print(f"  TOTAL: {total_success}/{total_count} assets generated")
    print("="*60)


if __name__ == "__main__":
    main()
