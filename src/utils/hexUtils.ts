import type { HexTile } from '../types/agent';

// Hex grid constants
export const HEX_SIZE = 1;
export const HEX_HEIGHT = 0.3;

// Convert axial coordinates to pixel position
export function hexToPixel(q: number, r: number, size: number = HEX_SIZE): [number, number] {
  const x = size * (Math.sqrt(3) * q + (Math.sqrt(3) / 2) * r);
  const z = size * ((3 / 2) * r);
  return [x, z];
}

// Convert pixel position to axial coordinates
export function pixelToHex(x: number, z: number, size: number = HEX_SIZE): { q: number; r: number } {
  const q = ((Math.sqrt(3) / 3) * x - (1 / 3) * z) / size;
  const r = ((2 / 3) * z) / size;
  return { q: Math.round(q), r: Math.round(r) };
}

// Get hex key for map storage
export function getHexKey(q: number, r: number): string {
  return `${q},${r}`;
}

// Parse hex key back to coordinates
export function parseHexKey(key: string): { q: number; r: number } {
  const [q, r] = key.split(',').map(Number);
  return { q, r };
}

// Get neighbors of a hex
export function getHexNeighbors(q: number, r: number): Array<{ q: number; r: number }> {
  const directions = [
    { q: 1, r: 0 },
    { q: 1, r: -1 },
    { q: 0, r: -1 },
    { q: -1, r: 0 },
    { q: -1, r: 1 },
    { q: 0, r: 1 },
  ];
  return directions.map((d) => ({ q: q + d.q, r: r + d.r }));
}

// Calculate distance between two hexes
export function hexDistance(q1: number, r1: number, q2: number, r2: number): number {
  return (Math.abs(q1 - q2) + Math.abs(q1 + r1 - q2 - r2) + Math.abs(r1 - r2)) / 2;
}

// Generate hex grid of given radius
export function generateHexGrid(radius: number): Map<string, HexTile> {
  const grid = new Map<string, HexTile>();

  for (let q = -radius; q <= radius; q++) {
    const r1 = Math.max(-radius, -q - radius);
    const r2 = Math.min(radius, -q + radius);
    for (let r = r1; r <= r2; r++) {
      const distFromCenter = hexDistance(q, r, 0, 0);
      const type = getHexType(q, r, distFromCenter, radius);
      const elevation = getHexElevation(type, distFromCenter);

      grid.set(getHexKey(q, r), {
        q,
        r,
        type,
        elevation,
        occupied: false,
        fogOfWar: distFromCenter > 3,
        revealed: distFromCenter <= 3,
      });
    }
  }

  return grid;
}

// Determine hex terrain type
function getHexType(
  q: number,
  r: number,
  distFromCenter: number,
  radius: number
): HexTile['type'] {
  // Center is a portal (spawn point)
  if (q === 0 && r === 0) return 'portal';

  // Create some variety with pseudo-random based on coordinates
  const noise = Math.sin(q * 12.9898 + r * 78.233) * 43758.5453;
  const rand = noise - Math.floor(noise);

  // Edge areas are water
  if (distFromCenter >= radius - 1) return 'water';

  // Some forest patches
  if (rand < 0.15 && distFromCenter > 2) return 'forest';

  // Some stone areas
  if (rand > 0.85 && distFromCenter > 1) return 'stone';

  // Default is grass
  return 'grass';
}

// Get elevation based on terrain type
function getHexElevation(type: HexTile['type'], _distFromCenter: number): number {
  switch (type) {
    case 'portal':
      return 0.2;
    case 'stone':
      return 0.3 + Math.random() * 0.2;
    case 'forest':
      return 0.1;
    case 'water':
      return -0.2;
    case 'grass':
    default:
      return 0.05 + Math.random() * 0.1;
  }
}

// A* pathfinding on hex grid
export function findPath(
  start: { q: number; r: number },
  end: { q: number; r: number },
  grid: Map<string, HexTile>
): Array<{ q: number; r: number }> {
  const openSet = new Set<string>([getHexKey(start.q, start.r)]);
  const cameFrom = new Map<string, string>();
  const gScore = new Map<string, number>();
  const fScore = new Map<string, number>();

  const startKey = getHexKey(start.q, start.r);
  const endKey = getHexKey(end.q, end.r);

  gScore.set(startKey, 0);
  fScore.set(startKey, hexDistance(start.q, start.r, end.q, end.r));

  while (openSet.size > 0) {
    // Find node with lowest fScore
    let current: string | null = null;
    let lowestF = Infinity;
    for (const node of openSet) {
      const f = fScore.get(node) ?? Infinity;
      if (f < lowestF) {
        lowestF = f;
        current = node;
      }
    }

    if (!current) break;
    if (current === endKey) {
      // Reconstruct path
      const path: Array<{ q: number; r: number }> = [];
      let currentKey: string | undefined = current;
      while (currentKey) {
        const coords = parseHexKey(currentKey);
        path.unshift(coords);
        currentKey = cameFrom.get(currentKey);
      }
      return path;
    }

    openSet.delete(current);
    const currentCoords = parseHexKey(current);

    for (const neighbor of getHexNeighbors(currentCoords.q, currentCoords.r)) {
      const neighborKey = getHexKey(neighbor.q, neighbor.r);
      const hex = grid.get(neighborKey);

      // Skip if not in grid, occupied, or water
      if (!hex || hex.occupied || hex.type === 'water') continue;

      const tentativeG = (gScore.get(current) ?? Infinity) + 1;

      if (tentativeG < (gScore.get(neighborKey) ?? Infinity)) {
        cameFrom.set(neighborKey, current);
        gScore.set(neighborKey, tentativeG);
        fScore.set(neighborKey, tentativeG + hexDistance(neighbor.q, neighbor.r, end.q, end.r));

        if (!openSet.has(neighborKey)) {
          openSet.add(neighborKey);
        }
      }
    }
  }

  return []; // No path found
}

// Get hex vertices for mesh geometry
export function getHexVertices(size: number = HEX_SIZE): number[][] {
  const vertices: number[][] = [];
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i - Math.PI / 6;
    vertices.push([size * Math.cos(angle), size * Math.sin(angle)]);
  }
  return vertices;
}

// Create hex shape for Three.js
export function createHexShape(size: number = HEX_SIZE): { positions: number[]; indices: number[] } {
  const vertices = getHexVertices(size);
  const positions: number[] = [];
  const indices: number[] = [];

  // Center vertex
  positions.push(0, 0, 0);

  // Outer vertices
  for (const [x, z] of vertices) {
    positions.push(x, 0, z);
  }

  // Triangles (center to each edge)
  for (let i = 0; i < 6; i++) {
    indices.push(0, i + 1, ((i + 1) % 6) + 1);
  }

  return { positions, indices };
}
