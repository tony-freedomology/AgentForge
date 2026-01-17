import sys
import os
from PIL import Image
import numpy as np

def remove_background_chroma(img, key_color=(255, 0, 255), tolerance=60, fade=15):
    """
    Removes background using chroma keying with edge smoothing.
    """
    img = img.convert("RGBA")
    data = np.array(img)
    
    # Extract channels (transposed for easier access, but standard HxWx4 is data)
    # data is (Height, Width, 4)
    r = data[:, :, 0].astype(np.int32)
    g = data[:, :, 1].astype(np.int32)
    b = data[:, :, 2].astype(np.int32)
    
    # Calculate distance from key color
    diff_r = r - key_color[0]
    diff_g = g - key_color[1]
    diff_b = b - key_color[2]
    
    # Euclidean distance
    dist = np.sqrt(diff_r**2 + diff_g**2 + diff_b**2)
    
    # Create new alpha channel
    # Default to opaque
    new_alpha = np.ones_like(dist) * 255
    
    # 1. Full Transparency: distance < tolerance
    new_alpha[dist < tolerance] = 0
    
    # 2. Semi-Transparency (Smoothing): tolerance <= distance < tolerance + fade
    if fade > 0:
        mask_edge = (dist >= tolerance) & (dist < (tolerance + fade))
        # Linear fade from 0 to 255
        # (dist - tolerance) / fade -> 0 to 1
        factor = (dist[mask_edge] - tolerance) / fade
        new_alpha[mask_edge] = factor * 255
        
    # Update RGBA array
    data[:, :, 3] = new_alpha.astype(np.uint8)
    
    return Image.fromarray(data)

def process_sprite_sheet(image_path, output_path, rows=3, cols=3, duration=100):
    try:
        if not os.path.exists(image_path):
            print(f"Error: Image not found at {image_path}")
            return

        print(f"Processing {image_path}...")
        img = Image.open(image_path)
        
        # Remove background using custom chroma key
        print("Removing background (NumPy Chroma Key)...")
        img_transparent = remove_background_chroma(img)
        
        width, height = img_transparent.size
        print(f"Image Size: {width}x{height}")
        
        cell_width = width // cols
        cell_height = height // rows
        print(f"Cell Size: {cell_width}x{cell_height}")
        
        frames = []
        for r in range(rows):
            for c in range(cols):
                left = c * cell_width
                top = r * cell_height
                right = left + cell_width
                bottom = top + cell_height
                
                frame = img_transparent.crop((left, top, right, bottom))
                frames.append(frame)
        
        # Save as Animated WEBP
        frames[0].save(
            output_path,
            save_all=True,
            append_images=frames[1:],
            duration=duration,
            loop=0,
            format='WEBP',
            quality=90,
            method=6
        )
        
        print(f"Successfully saved transparent animation to {output_path}")

    except Exception as e:
        print(f"Error processing sprite sheet: {e}")

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python process_sprites.py <input_image> <output_webp>")
    else:
        input_file = sys.argv[1]
        output_file = sys.argv[2]
        process_sprite_sheet(input_file, output_file)
