/**
 * Isometric Coordinate Utilities
 *
 * Handles conversion between screen coordinates and isometric grid coordinates.
 * Uses standard 2:1 dimetric projection (isometric).
 */

// Tile dimensions in pixels
export const TILE_WIDTH = 64;
export const TILE_HEIGHT = 32;

// Half dimensions for calculations
const HALF_TILE_WIDTH = TILE_WIDTH / 2;
const HALF_TILE_HEIGHT = TILE_HEIGHT / 2;

/**
 * Convert grid (tile) coordinates to screen (pixel) coordinates
 * Returns the center point of the tile on screen
 */
export function gridToScreen(gridX: number, gridY: number): { x: number; y: number } {
  return {
    x: (gridX - gridY) * HALF_TILE_WIDTH,
    y: (gridX + gridY) * HALF_TILE_HEIGHT,
  };
}

/**
 * Convert screen (pixel) coordinates to grid (tile) coordinates
 * Returns the tile that contains the given screen point
 */
export function screenToGrid(screenX: number, screenY: number): { x: number; y: number } {
  // Inverse of the gridToScreen transformation
  const gridX = (screenX / HALF_TILE_WIDTH + screenY / HALF_TILE_HEIGHT) / 2;
  const gridY = (screenY / HALF_TILE_HEIGHT - screenX / HALF_TILE_WIDTH) / 2;

  return {
    x: Math.floor(gridX),
    y: Math.floor(gridY),
  };
}

/**
 * Get the four corner points of a tile in screen coordinates
 */
export function getTileCorners(
  gridX: number,
  gridY: number
): { top: { x: number; y: number }; right: { x: number; y: number }; bottom: { x: number; y: number }; left: { x: number; y: number } } {
  const center = gridToScreen(gridX, gridY);

  return {
    top: { x: center.x, y: center.y - HALF_TILE_HEIGHT },
    right: { x: center.x + HALF_TILE_WIDTH, y: center.y },
    bottom: { x: center.x, y: center.y + HALF_TILE_HEIGHT },
    left: { x: center.x - HALF_TILE_WIDTH, y: center.y },
  };
}

/**
 * Check if a screen point is inside a specific tile
 */
export function isPointInTile(screenX: number, screenY: number, gridX: number, gridY: number): boolean {
  const center = gridToScreen(gridX, gridY);

  // Diamond/rhombus hit test
  // The tile is a diamond shape, so we use the diamond inequality
  const dx = Math.abs(screenX - center.x);
  const dy = Math.abs(screenY - center.y);

  // Point is inside if it satisfies the diamond equation
  return dx / HALF_TILE_WIDTH + dy / HALF_TILE_HEIGHT <= 1;
}

/**
 * Calculate the depth (z-order) for a tile or object at grid position
 * Higher values should be rendered on top
 */
export function getDepth(gridX: number, gridY: number): number {
  return gridX + gridY;
}

/**
 * Get the bounding box for a grid of tiles
 */
export function getGridBounds(
  gridWidth: number,
  gridHeight: number
): { minX: number; minY: number; maxX: number; maxY: number; width: number; height: number } {
  // Calculate screen positions of the four corners of the grid
  const topLeft = gridToScreen(0, 0);
  const topRight = gridToScreen(gridWidth - 1, 0);
  const bottomLeft = gridToScreen(0, gridHeight - 1);
  const bottomRight = gridToScreen(gridWidth - 1, gridHeight - 1);

  const minX = bottomLeft.x - HALF_TILE_WIDTH;
  const maxX = topRight.x + HALF_TILE_WIDTH;
  const minY = topLeft.y - HALF_TILE_HEIGHT;
  const maxY = bottomRight.y + HALF_TILE_HEIGHT;

  return {
    minX,
    minY,
    maxX,
    maxY,
    width: maxX - minX,
    height: maxY - minY,
  };
}
