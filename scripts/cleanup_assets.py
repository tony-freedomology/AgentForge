#!/usr/bin/env python3
"""
Asset Cleanup Script for AgentForge

Removes unwanted background colors (green screen, blue, dark backgrounds)
from AI-generated assets to create proper transparent PNGs.

Usage: python scripts/cleanup_assets.py [--dir PATH] [--preview]
"""

import os
import sys
import argparse
from pathlib import Path

try:
    from PIL import Image
    import numpy as np
    HAS_DEPS = True
except ImportError:
    HAS_DEPS = False
    print("ERROR: PIL and numpy required. Install with:")
    print("  pip install Pillow numpy")
    sys.exit(1)

# Project paths
SCRIPT_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = SCRIPT_DIR.parent
DEFAULT_ASSET_DIR = PROJECT_ROOT / "public" / "assets_isometric"

# Colors to remove (HSV ranges for flexibility)
# Format: (hue_min, hue_max, sat_min, sat_max, val_min, val_max)
REMOVE_COLORS = {
    'green_screen': {
        'hue_range': (80, 160),      # Green hues
        'sat_min': 0.2,               # Minimum saturation
        'val_min': 0.2,               # Minimum value/brightness
    },
    'blue_screen': {
        'hue_range': (180, 260),     # Blue hues
        'sat_min': 0.2,
        'val_min': 0.2,
    },
    'near_black': {
        'rgb_max': 20,                # Very dark pixels
    },
    'near_white': {
        'rgb_min': 240,               # Very light pixels
    },
}

# Edge feathering for smoother transparency
FEATHER_RADIUS = 1


def rgb_to_hsv(r: int, g: int, b: int) -> tuple[float, float, float]:
    """Convert RGB (0-255) to HSV (0-360, 0-1, 0-1)."""
    r, g, b = r / 255.0, g / 255.0, b / 255.0
    max_c = max(r, g, b)
    min_c = min(r, g, b)
    diff = max_c - min_c

    # Value
    v = max_c

    # Saturation
    s = 0 if max_c == 0 else diff / max_c

    # Hue
    if diff == 0:
        h = 0
    elif max_c == r:
        h = 60 * ((g - b) / diff % 6)
    elif max_c == g:
        h = 60 * ((b - r) / diff + 2)
    else:
        h = 60 * ((r - g) / diff + 4)

    return h, s, v


def should_remove_pixel(r: int, g: int, b: int) -> tuple[bool, float]:
    """
    Check if a pixel should be made transparent.
    Returns (should_remove, confidence) where confidence is 0-1.
    """
    # Check near-black
    if r <= REMOVE_COLORS['near_black']['rgb_max'] and \
       g <= REMOVE_COLORS['near_black']['rgb_max'] and \
       b <= REMOVE_COLORS['near_black']['rgb_max']:
        return True, 1.0

    # Check near-white
    if r >= REMOVE_COLORS['near_white']['rgb_min'] and \
       g >= REMOVE_COLORS['near_white']['rgb_min'] and \
       b >= REMOVE_COLORS['near_white']['rgb_min']:
        return True, 1.0

    # Check color-based removal (green/blue screen)
    h, s, v = rgb_to_hsv(r, g, b)

    for color_name in ['green_screen', 'blue_screen']:
        config = REMOVE_COLORS[color_name]
        hue_min, hue_max = config['hue_range']

        if hue_min <= h <= hue_max:
            if s >= config['sat_min'] and v >= config['val_min']:
                # Calculate confidence based on saturation
                confidence = min(1.0, s / 0.5)  # Full confidence at 50%+ saturation
                return True, confidence

    return False, 0.0


def remove_background(img: Image.Image, aggressive: bool = False) -> Image.Image:
    """
    Remove background colors from an image.

    Args:
        img: PIL Image (will be converted to RGBA)
        aggressive: If True, be more aggressive with edge cleanup

    Returns:
        PIL Image with transparent background
    """
    # Convert to RGBA
    img = img.convert('RGBA')
    pixels = np.array(img)

    height, width = pixels.shape[:2]

    # Create alpha mask
    new_alpha = np.zeros((height, width), dtype=np.float32)

    for y in range(height):
        for x in range(width):
            r, g, b, a = pixels[y, x]

            # Skip already transparent pixels
            if a == 0:
                new_alpha[y, x] = 0
                continue

            should_remove, confidence = should_remove_pixel(r, g, b)

            if should_remove:
                # Gradual transparency based on confidence
                new_alpha[y, x] = (1.0 - confidence) * (a / 255.0)
            else:
                new_alpha[y, x] = a / 255.0

    # Apply edge feathering if aggressive mode
    if aggressive and FEATHER_RADIUS > 0:
        from scipy import ndimage
        # Slight blur on alpha to smooth edges
        new_alpha = ndimage.uniform_filter(new_alpha, size=FEATHER_RADIUS * 2 + 1)

    # Apply new alpha
    pixels[:, :, 3] = (new_alpha * 255).astype(np.uint8)

    return Image.fromarray(pixels)


def process_image(input_path: Path, output_path: Path = None, preview: bool = False) -> bool:
    """
    Process a single image file.

    Args:
        input_path: Path to input image
        output_path: Path to save output (defaults to overwriting input)
        preview: If True, show before/after comparison

    Returns:
        True if image was modified, False otherwise
    """
    if output_path is None:
        output_path = input_path

    try:
        img = Image.open(input_path)
        original_mode = img.mode

        # Process the image
        processed = remove_background(img)

        if preview:
            # Show side-by-side comparison
            print(f"  Preview: {input_path.name}")
            # In a real implementation, you'd display this
            # For now, just save with _preview suffix
            preview_path = input_path.parent / f"{input_path.stem}_preview.png"
            processed.save(preview_path, 'PNG')
            print(f"    Saved preview to: {preview_path}")
            return False

        # Save the processed image
        processed.save(output_path, 'PNG')
        return True

    except Exception as e:
        print(f"  ERROR processing {input_path.name}: {e}")
        return False


def process_directory(asset_dir: Path, preview: bool = False, recursive: bool = True) -> tuple[int, int]:
    """
    Process all PNG images in a directory.

    Args:
        asset_dir: Directory containing assets
        preview: If True, generate previews instead of modifying
        recursive: If True, process subdirectories

    Returns:
        Tuple of (processed_count, error_count)
    """
    processed = 0
    errors = 0

    pattern = "**/*.png" if recursive else "*.png"
    png_files = list(asset_dir.glob(pattern))

    print(f"\nFound {len(png_files)} PNG files in {asset_dir}")

    for png_path in png_files:
        # Skip already processed preview files
        if '_preview' in png_path.stem:
            continue

        print(f"  Processing: {png_path.relative_to(asset_dir)}")

        if process_image(png_path, preview=preview):
            processed += 1
        else:
            if not preview:
                errors += 1

    return processed, errors


def main():
    parser = argparse.ArgumentParser(
        description="Remove background colors from AI-generated assets"
    )
    parser.add_argument(
        '--dir', '-d',
        type=Path,
        default=DEFAULT_ASSET_DIR,
        help=f"Asset directory to process (default: {DEFAULT_ASSET_DIR})"
    )
    parser.add_argument(
        '--preview', '-p',
        action='store_true',
        help="Generate preview images instead of modifying originals"
    )
    parser.add_argument(
        '--file', '-f',
        type=Path,
        help="Process a single file instead of directory"
    )

    args = parser.parse_args()

    print("=" * 60)
    print("AgentForge Asset Cleanup")
    print("=" * 60)

    if args.file:
        # Process single file
        if not args.file.exists():
            print(f"ERROR: File not found: {args.file}")
            sys.exit(1)

        print(f"\nProcessing single file: {args.file}")
        success = process_image(args.file, preview=args.preview)

        if success:
            print("\nFile processed successfully!")
        else:
            print("\nFile processing failed or skipped.")
    else:
        # Process directory
        if not args.dir.exists():
            print(f"ERROR: Directory not found: {args.dir}")
            sys.exit(1)

        processed, errors = process_directory(args.dir, preview=args.preview)

        print("\n" + "=" * 60)
        print(f"Processed: {processed} files")
        if errors > 0:
            print(f"Errors: {errors} files")
        print("=" * 60)


if __name__ == "__main__":
    main()
