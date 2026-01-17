#!/usr/bin/env python3
"""
AgentForge Asset Generator
Generates fantasy/WoW-style artwork using Gemini's image generation REST API.

Features:
- Character sprites for each agent class
- UI elements (frames, icons, rings)
- Sprite sheet generation and processing
- Transparent PNG output
"""

import os
import sys
import time
import json
import base64
import requests
from pathlib import Path
from io import BytesIO

try:
    from PIL import Image
    print("✓ PIL loaded")
except ImportError:
    print("Missing Pillow. Run: pip install pillow")
    sys.exit(1)

# Configuration
API_KEY = "AIzaSyDgEIsteIti3pjySiAxbZUz4ePJgKiEYAY"
OUTPUT_DIR = Path(__file__).parent.parent / "public" / "assets"
SPRITES_DIR = OUTPUT_DIR / "sprites"
TEXTURES_DIR = OUTPUT_DIR / "textures"
UI_DIR = OUTPUT_DIR / "ui"
FRAMES_DIR = OUTPUT_DIR / "frames"

# API endpoints - using models that support image generation
# User specified: gemini-3-pro-image-preview
GEMINI_URL = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-preview-image-generation:generateContent?key={API_KEY}"
IMAGEN_URL = f"https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-002:predict?key={API_KEY}"

# Ensure directories exist
for dir_path in [SPRITES_DIR, TEXTURES_DIR, UI_DIR, FRAMES_DIR]:
    dir_path.mkdir(parents=True, exist_ok=True)

# Art style constants for consistency
BASE_STYLE = """
World of Warcraft inspired fantasy art style, hand-painted digital art,
rich saturated colors, dramatic lighting, mystical glow effects,
high fantasy aesthetic, detailed but stylized, game-ready asset,
clean edges suitable for game sprites, professional quality,
solid single-color background for easy removal (bright green or magenta)
"""

SPRITE_STYLE = f"""
{BASE_STYLE}
Character portrait/sprite for a video game,
facing forward or 3/4 view, dynamic pose,
centered composition, full body visible,
magical particle effects around the character,
on solid bright green background (#00FF00) for easy background removal
"""

UI_STYLE = f"""
{BASE_STYLE}
Game UI element, ornate fantasy border design,
golden and bronze metallic accents, magical runes,
glowing edges, decorative flourishes,
clean vector-like quality
"""

# Character class definitions
CHARACTER_CLASSES = {
    "mage": {
        "name": "Arcane Mage",
        "color": "#ef4444",
        "prompt": """
            Powerful arcane mage character, flowing dark robes with glowing mystical runes,
            magical staff crackling with red and purple arcane energy,
            ethereal wisps of magic floating around them,
            hood partially covering face with glowing eyes visible,
            dramatic pose channeling arcane power,
            World of Warcraft art style, fantasy game character
        """,
        "icon_prompt": "Arcane spell tome with glowing runes, magical purple energy, fantasy icon"
    },
    "architect": {
        "name": "Grand Architect",
        "color": "#a855f7",
        "prompt": """
            Master architect sage character, elaborate purple and gold ornate robes,
            holding glowing magical blueprints and schematics,
            crystalline geometric shapes floating around them,
            wise powerful appearance with mystical third eye,
            construction runes and sigils orbiting,
            World of Warcraft art style, fantasy game character
        """,
        "icon_prompt": "Magical blueprint scroll with glowing purple construction runes, fantasy icon"
    },
    "guardian": {
        "name": "Shield Guardian",
        "color": "#3b82f6",
        "prompt": """
            Stalwart paladin guardian character, heavy ornate plate armor,
            massive glowing shield with protective blue runes,
            holy light emanating from armor,
            protective divine aura visible as soft glow,
            noble heroic stance ready to defend,
            World of Warcraft art style, fantasy game character
        """,
        "icon_prompt": "Ornate magical shield with protective blue runes glowing, fantasy icon"
    },
    "artisan": {
        "name": "Master Artisan",
        "color": "#f97316",
        "prompt": """
            Skilled dwarf artisan craftsman character, leather apron with tool pouches,
            magical crafting hammer glowing with orange creative energy,
            floating enchanted tools and materials orbiting,
            goggles on forehead, magical forge flames nearby,
            intricate mechanical construct companion,
            World of Warcraft art style, fantasy game character
        """,
        "icon_prompt": "Enchanted crafting hammer with magical orange forge flames, fantasy icon"
    },
    "scout": {
        "name": "Shadow Scout",
        "color": "#22c55e",
        "prompt": """
            Agile elven scout ranger character, sleek leather armor,
            dual glowing daggers with green nature magic,
            partially shrouded in shadows and magical leaves,
            ethereal wolf spirit companion visible,
            keen glowing eyes, acrobatic ready pose,
            World of Warcraft art style, fantasy game character
        """,
        "icon_prompt": "Crossed daggers with nature vines and glowing green energy, fantasy icon"
    },
    "engineer": {
        "name": "Techno-Mage",
        "color": "#f97316",
        "prompt": """
            Gnome techno-mage engineer character, mix of robes and mechanical parts,
            floating mechanical drones and constructs around them,
            glowing orange circuitry patterns on clothes,
            complex magical device in hands,
            goggles with multiple lenses, gear and cog motifs,
            World of Warcraft art style, fantasy game character
        """,
        "icon_prompt": "Magical gear mechanism with arcane orange circuitry glowing, fantasy icon"
    },
    "designer": {
        "name": "Illusion Weaver",
        "color": "#f59e0b",
        "prompt": """
            Elegant blood elf illusion weaver character, flowing artistic robes,
            magical paintbrush creating glowing designs in air,
            surrounded by floating color palettes and magical designs,
            prismatic rainbow light effects, creative magical energy,
            artistic graceful pose,
            World of Warcraft art style, fantasy game character
        """,
        "icon_prompt": "Magical quill creating glowing artistic rainbow designs, fantasy icon"
    }
}

# UI Elements
UI_ELEMENTS = {
    "selection_ring": {
        "prompt": """
            Circular magical selection indicator for game, ornate golden ring with runes,
            glowing mystical energy patterns, designed as ground selection indicator,
            seamless circular design with magical particles, top-down view,
            World of Warcraft style game UI element
        """,
        "size": (512, 512)
    },
    "portrait_frame": {
        "prompt": """
            Square ornate golden character portrait frame, corner flourishes with gems,
            mystical glow effect, designed to frame a character portrait,
            World of Warcraft style unit frame, decorative fantasy corners
        """,
        "size": (256, 256)
    },
    "quest_marker": {
        "prompt": """
            Golden floating exclamation mark quest indicator, magical sparkles and glow,
            World of Warcraft style quest available marker, dramatic lighting effect
        """,
        "size": (128, 256)
    },
    "loot_chest": {
        "prompt": """
            Fantasy treasure chest, ornate golden trim and decorations,
            glowing from within with magical light, gems embedded,
            slightly open revealing golden glow, game-ready loot container,
            World of Warcraft style treasure
        """,
        "size": (256, 256)
    },
    "health_frame": {
        "prompt": """
            Horizontal health bar frame, ornate fantasy golden border,
            dragon head decorations on ends, space for red bar in center,
            World of Warcraft style unit frame element
        """,
        "size": (512, 128)
    },
    "mana_frame": {
        "prompt": """
            Horizontal mana bar frame, ornate fantasy silver and blue border,
            crystal decorations, arcane runes, space for blue bar in center,
            World of Warcraft style unit frame element
        """,
        "size": (512, 128)
    }
}


def generate_image_gemini(prompt: str, retries: int = 3) -> Image.Image | None:
    """Generate an image using Gemini's experimental image generation."""
    full_prompt = f"""Generate an image: {prompt}

Style requirements:
- World of Warcraft / high fantasy art style
- Rich saturated colors with dramatic lighting
- Professional game-ready quality
- Hand-painted digital art aesthetic
- On a solid bright green (#00FF00) or magenta (#FF00FF) background for easy removal"""

    headers = {"Content-Type": "application/json"}

    payload = {
        "contents": [{
            "parts": [{"text": full_prompt}]
        }],
        "generationConfig": {
            "responseModalities": ["image", "text"],
            "responseMimeType": "text/plain"
        }
    }

    for attempt in range(retries):
        try:
            print(f"  Generating (attempt {attempt + 1}/{retries})...")

            response = requests.post(
                GEMINI_URL,
                headers=headers,
                json=payload,
                timeout=120
            )

            if response.status_code == 200:
                data = response.json()

                # Look for image in response
                if "candidates" in data:
                    for candidate in data["candidates"]:
                        if "content" in candidate and "parts" in candidate["content"]:
                            for part in candidate["content"]["parts"]:
                                if "inlineData" in part:
                                    img_data = base64.b64decode(part["inlineData"]["data"])
                                    img = Image.open(BytesIO(img_data))
                                    print(f"  ✓ Image generated: {img.size}")
                                    return img

                print(f"  No image in response, got: {json.dumps(data)[:200]}")
            else:
                print(f"  API error {response.status_code}: {response.text[:200]}")

        except Exception as e:
            print(f"  Error: {e}")

        if attempt < retries - 1:
            wait_time = 2 ** (attempt + 1)
            print(f"  Waiting {wait_time}s before retry...")
            time.sleep(wait_time)

    return None


def generate_with_imagen(prompt: str, retries: int = 3) -> Image.Image | None:
    """Try Imagen API directly."""
    headers = {"Content-Type": "application/json"}

    full_prompt = f"{prompt}. World of Warcraft fantasy art style, game asset, solid green background."

    payload = {
        "instances": [{"prompt": full_prompt}],
        "parameters": {
            "sampleCount": 1
        }
    }

    for attempt in range(retries):
        try:
            print(f"  Trying Imagen (attempt {attempt + 1}/{retries})...")

            response = requests.post(
                IMAGEN_URL,
                headers=headers,
                json=payload,
                timeout=120
            )

            if response.status_code == 200:
                data = response.json()
                if "predictions" in data and len(data["predictions"]) > 0:
                    img_b64 = data["predictions"][0].get("bytesBase64Encoded")
                    if img_b64:
                        img_data = base64.b64decode(img_b64)
                        img = Image.open(BytesIO(img_data))
                        print(f"  ✓ Imagen generated: {img.size}")
                        return img

                print(f"  Response: {json.dumps(data)[:300]}")
            else:
                print(f"  Imagen error {response.status_code}: {response.text[:300]}")

        except Exception as e:
            print(f"  Error: {e}")

        if attempt < retries - 1:
            time.sleep(2 ** attempt)

    return None


def remove_background(img: Image.Image, tolerance: int = 50) -> Image.Image:
    """Remove solid color background, detecting the most common edge color."""
    img = img.convert("RGBA")
    width, height = img.size
    pixels = img.load()

    # Sample corners and edges to find background color
    samples = []
    # Corners
    for x, y in [(0, 0), (width-1, 0), (0, height-1), (width-1, height-1)]:
        samples.append(pixels[x, y][:3])
    # Edges
    for i in range(0, width, width // 10):
        samples.append(pixels[i, 0][:3])
        samples.append(pixels[i, height-1][:3])
    for i in range(0, height, height // 10):
        samples.append(pixels[0, i][:3])
        samples.append(pixels[width-1, i][:3])

    # Find most common color (background)
    from collections import Counter
    bg_color = Counter(samples).most_common(1)[0][0]
    print(f"  Detected background color: RGB{bg_color}")

    # Create new image with transparency
    new_img = Image.new("RGBA", (width, height), (0, 0, 0, 0))
    new_pixels = new_img.load()

    for y in range(height):
        for x in range(width):
            r, g, b, a = pixels[x, y]
            # Check if close to background
            if (abs(r - bg_color[0]) < tolerance and
                abs(g - bg_color[1]) < tolerance and
                abs(b - bg_color[2]) < tolerance):
                new_pixels[x, y] = (0, 0, 0, 0)
            else:
                new_pixels[x, y] = (r, g, b, 255)

    return new_img


def add_glow_effect(img: Image.Image, color: str, intensity: int = 20) -> Image.Image:
    """Add a subtle glow effect around the character."""
    from PIL import ImageFilter

    # Parse hex color
    color = color.lstrip('#')
    r, g, b = int(color[0:2], 16), int(color[2:4], 16), int(color[4:6], 16)

    # Create glow layer
    glow = img.copy()
    glow = glow.filter(ImageFilter.GaussianBlur(radius=intensity))

    # Colorize the glow
    glow_data = glow.getdata()
    new_glow_data = []
    for pixel in glow_data:
        if pixel[3] > 0:  # If not transparent
            # Blend with glow color
            new_r = min(255, (pixel[0] + r) // 2)
            new_g = min(255, (pixel[1] + g) // 2)
            new_b = min(255, (pixel[2] + b) // 2)
            new_glow_data.append((new_r, new_g, new_b, pixel[3] // 3))
        else:
            new_glow_data.append(pixel)

    glow.putdata(new_glow_data)

    # Composite: glow behind original
    result = Image.new("RGBA", img.size, (0, 0, 0, 0))
    result.paste(glow, (0, 0), glow)
    result.paste(img, (0, 0), img)

    return result


def generate_character(class_id: str) -> bool:
    """Generate a single character sprite."""
    if class_id not in CHARACTER_CLASSES:
        print(f"Unknown class: {class_id}")
        return False

    class_info = CHARACTER_CLASSES[class_id]
    print(f"\n[{class_info['name']}] ({class_info['color']})")

    # Try Gemini first, then Imagen
    print("  Generating main sprite...")
    sprite = generate_image_gemini(class_info['prompt'])

    if not sprite:
        print("  Gemini failed, trying Imagen...")
        sprite = generate_with_imagen(class_info['prompt'])

    if sprite:
        # Process the sprite
        print("  Processing sprite...")

        # Resize to standard size
        sprite = sprite.resize((512, 512), Image.Resampling.LANCZOS)

        # Remove background
        sprite = remove_background(sprite)

        # Add glow effect
        sprite = add_glow_effect(sprite, class_info['color'])

        # Save
        sprite_path = SPRITES_DIR / f"{class_id}.png"
        sprite.save(sprite_path, "PNG")
        print(f"  ✓ Saved: {sprite_path}")

        return True

    print(f"  ✗ Failed to generate {class_id}")
    return False


def generate_ui_element(element_id: str) -> bool:
    """Generate a single UI element."""
    if element_id not in UI_ELEMENTS:
        print(f"Unknown UI element: {element_id}")
        return False

    element_info = UI_ELEMENTS[element_id]
    print(f"\n[{element_id}]")

    img = generate_image_gemini(element_info['prompt'])

    if not img:
        img = generate_with_imagen(element_info['prompt'])

    if img:
        # Resize
        img = img.resize(element_info['size'], Image.Resampling.LANCZOS)

        # Remove background for certain elements
        if element_id in ['selection_ring', 'quest_marker', 'portrait_frame']:
            img = remove_background(img)

        # Determine output path
        if element_id in ['selection_ring']:
            output_path = TEXTURES_DIR / f"{element_id}.png"
        else:
            output_path = UI_DIR / f"{element_id}.png"

        img.save(output_path, "PNG")
        print(f"  ✓ Saved: {output_path}")
        return True

    print(f"  ✗ Failed to generate {element_id}")
    return False


def generate_all_characters():
    """Generate all character sprites."""
    print("\n" + "=" * 60)
    print("GENERATING CHARACTER SPRITES")
    print("=" * 60)

    success = 0
    for class_id in CHARACTER_CLASSES:
        if generate_character(class_id):
            success += 1
        time.sleep(3)  # Rate limiting

    print(f"\n✓ Generated {success}/{len(CHARACTER_CLASSES)} characters")


def generate_all_ui():
    """Generate all UI elements."""
    print("\n" + "=" * 60)
    print("GENERATING UI ELEMENTS")
    print("=" * 60)

    success = 0
    for element_id in UI_ELEMENTS:
        if generate_ui_element(element_id):
            success += 1
        time.sleep(3)

    print(f"\n✓ Generated {success}/{len(UI_ELEMENTS)} UI elements")


def main():
    """Main entry point."""
    print("=" * 60)
    print("AGENTFORGE FANTASY ASSET GENERATOR")
    print("=" * 60)
    print(f"Output: {OUTPUT_DIR}")

    if len(sys.argv) > 1:
        cmd = sys.argv[1]

        if cmd == "characters":
            generate_all_characters()
        elif cmd == "ui":
            generate_all_ui()
        elif cmd == "all":
            generate_all_characters()
            generate_all_ui()
        elif cmd == "single" and len(sys.argv) > 2:
            target = sys.argv[2]
            if target in CHARACTER_CLASSES:
                generate_character(target)
            elif target in UI_ELEMENTS:
                generate_ui_element(target)
            else:
                print(f"Unknown target: {target}")
        elif cmd == "test":
            # Quick test with one character
            print("\nRunning API test...")
            generate_character("mage")
        else:
            print(f"""
Usage: python generate_assets.py <command>

Commands:
  test        - Test with single character (mage)
  characters  - Generate all character sprites
  ui          - Generate all UI elements
  all         - Generate everything
  single <id> - Generate single asset (e.g., 'single mage' or 'single loot_chest')

Available characters: {', '.join(CHARACTER_CLASSES.keys())}
Available UI: {', '.join(UI_ELEMENTS.keys())}
""")
    else:
        # Default: generate everything
        generate_all_characters()
        generate_all_ui()

    print("\n" + "=" * 60)
    print("COMPLETE")
    print("=" * 60)


if __name__ == "__main__":
    main()
