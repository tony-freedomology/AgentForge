
import os
import sys
import glob
import shutil
import numpy as np
from pathlib import Path
from PIL import Image, ImageFilter

# Configuration
ARTIFACT_DIR = "/Users/tony/.gemini/antigravity/brain/dbccd8a7-50bc-4bf9-a91f-1163aa7a907b"
PROJECT_ROOT = Path(__file__).parent.parent
PUBLIC_ASSETS_DIR = PROJECT_ROOT / "public" / "assets"

# Ensure output directories exist
(PUBLIC_ASSETS_DIR / "sprites").mkdir(parents=True, exist_ok=True)
(PUBLIC_ASSETS_DIR / "ui").mkdir(parents=True, exist_ok=True)
(PUBLIC_ASSETS_DIR / "textures").mkdir(parents=True, exist_ok=True)

# Asset Definitions
# (name, type, glow_color, is_ui)
ASSETS = [
    ("mage_sprite", "sprites/mage.png", "#ef4444", False),
    ("architect_sprite", "sprites/architect.png", "#a855f7", False),
    ("guardian_sprite", "sprites/guardian.png", "#3b82f6", False),
    ("artisan_sprite", "sprites/artisan.png", "#f97316", False),
    ("scout_sprite", "sprites/scout.png", "#22c55e", False),
    ("engineer_sprite", "sprites/engineer.png", "#f97316", False),
    ("designer_sprite", "sprites/designer.png", "#f59e0b", False),
    ("selection_ring", "textures/selection_ring.png", None, True),
    ("portrait_frame", "ui/portrait_frame.png", None, True),
    ("quest_marker", "ui/quest_marker.png", None, True),
    ("loot_chest", "ui/loot_chest.png", None, True),
    ("health_frame", "ui/health_frame.png", None, True),
    ("mana_frame", "ui/mana_frame.png", None, True),
]

def get_latest_file(base_name):
    """Find the latest file matching the base name in artifacts."""
    pattern = os.path.join(ARTIFACT_DIR, f"{base_name}_*.png")
    files = glob.glob(pattern)
    if not files:
        return None
    return max(files, key=os.path.getctime)

def remove_background_chroma(img, bg_color=(0, 255, 0), tolerance=40):
    """Remove background using chroma key (green or specified)."""
    img = img.convert("RGBA")
    data = np.array(img)

    r, g, b, a = data.T
    
    # Calculate difference from background color
    diff = np.sqrt(
        (r - bg_color[0]) ** 2 + 
        (g - bg_color[1]) ** 2 + 
        (b - bg_color[2]) ** 2
    )
    
    # Create alpha mask
    mask = diff > tolerance
    
    data[..., 3] = np.where(mask, 255, 0).astype(np.uint8)
    
    return Image.fromarray(data)

def remove_black_background(img, tolerance=30):
    """Remove black background common in UI generation."""
    return remove_background_chroma(img, bg_color=(0, 0, 0), tolerance=tolerance)

def add_glow_effect(img, color_hex, intensity=15):
    """Add a glow behind the image."""
    if not color_hex:
        return img
        
    color = color_hex.lstrip('#')
    r, g, b = int(color[0:2], 16), int(color[2:4], 16), int(color[4:6], 16)
    
    # Create glow layer
    glow = img.copy()
    alpha = glow.split()[-1]
    
    # Create solid color image with same alpha
    glow_fill = Image.new("RGBA", glow.size, (r, g, b, 0))
    glow_fill.paste(Image.new("RGBA", glow.size, (r, g, b, 255)), mask=alpha)
    
    # Blur
    glow_blurred = glow_fill.filter(ImageFilter.GaussianBlur(radius=intensity))
    
    # Composite: glow behind original
    result = Image.new("RGBA", img.size, (0, 0, 0, 0))
    result.paste(glow_blurred, (0, 0))
    result.paste(img, (0, 0), img)
    
    return result

def main():
    print("Starting asset finalization...")
    
    for base_name, target_rel_path, glow_color, is_ui in ASSETS:
        print(f"Processing {base_name}...")
        
        source_file = get_latest_file(base_name)
        if not source_file:
            print(f"  Warning: No source file found for {base_name}")
            continue
            
        print(f"  Source: {os.path.basename(source_file)}")
        
        try:
            img = Image.open(source_file)
            
            if is_ui:
                img = remove_black_background(img)
            else:
                img = remove_background_chroma(img, bg_color=(0, 255, 0))
                if img.size != (512, 512):
                    img = img.resize((512, 512), Image.Resampling.LANCZOS)
                if glow_color:
                    img = add_glow_effect(img, glow_color)
            
            target_path = PUBLIC_ASSETS_DIR / target_rel_path
            img.save(target_path, "PNG")
            print(f"  ✓ Saved to {target_rel_path}")
            
        except Exception as e:
            print(f"  Error processing {base_name}: {e}")

    print("Done!")

if __name__ == "__main__":
    main()
