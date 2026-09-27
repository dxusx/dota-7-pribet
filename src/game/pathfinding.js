// Grid Pathfinding and Movement Validation System for 95x95 Dota Map
import { GRID_SIZE, TILE_TYPES } from '../data/dotaPixelGrid.js';

// 8-Directional movement offsets (orthogonal and diagonal)
export const DIRECTIONS = [
  { dr: -1, dc: 0, cost: 1 },    // North
  { dr: 1, dc: 0, cost: 1 },     // South
  { dr: 0, dc: -1, cost: 1 },    // West
  { dr: 0, dc: 1, cost: 1 },     // East
  { dr: -1, dc: -1, cost: 1.4 }, // North-West
  { dr: -1, dc: 1, cost: 1.4 },  // North-East
  { dr: 1, dc: -1, cost: 1.4 },  // South-West
  { dr: 1, dc: 1, cost: 1.4 }    // South-East
];

// Chebyshev Distance (King's movement distance)
export function getDistance(r1, c1, r2, c2) {
  return Math.max(Math.abs(r1 - r2), Math.abs(c1 - c2));
}

// Check if coordinates are within 95x95 bounds
export function isInBounds(r, c) {
  return r >= 0 && r < GRID_SIZE && c >= 0 && c < GRID_SIZE;
}

// Check if a cell is passable terrain
export function isTerrainPassable(r, c, grid) {
  if (!isInBounds(r, c)) return false;
  const tile = grid[r * GRID_SIZE + c];
  return tile !== TILE_TYPES.UNPASSABLE;
}

// Calculate movement cost for entering a cell (Water slows movement by 10%)
export function getCellMoveCost(r, c, grid, baseCost = 1) {
  if (!isInBounds(r, c)) return Infinity;
  const tile = grid[r * GRID_SIZE + c];
  if (tile === TILE_TYPES.UNPASSABLE) return Infinity;
  // Water tile movement cost +10% penalty
  if (tile === TILE_TYPES.WATER) return baseCost * 1.1;
  return baseCost;
}

// BFS Dijkstra to find all reachable cells within movement budget
export function getReachableCells(startR, startC, maxMovement, grid, blockedCells = new Set()) {
  const reachable = new Map(); // key "r,c" -> { r, c, cost, path }
  const startKey = `${startR},${startC}`;
  reachable.set(startKey, { r: startR, c: startC, cost: 0, path: [[startR, startC]] });

  // Priority Queue / Min-Heap approximation with simple sorted array or bucket
  const queue = [{ r: startR, c: startC, cost: 0, path: [[startR, startC]] }];

  while (queue.length > 0) {
    // Sort to pick lowest cost node (Dijkstra)
    queue.sort((a, b) => a.cost - b.cost);
    const current = queue.shift();

    if (current.cost > maxMovement) continue;

    for (const dir of DIRECTIONS) {
      const nr = current.r + dir.dr;
      const nc = current.c + dir.dc;
      const nextKey = `${nr},${nc}`;

      if (!isInBounds(nr, nc)) continue;
      if (!isTerrainPassable(nr, nc, grid)) continue;

      // Obstacle check (units block passing through, except destination check)
      if (blockedCells.has(nextKey)) continue;

      const stepCost = getCellMoveCost(nr, nc, grid, dir.cost);
      const newCost = current.cost + stepCost;

      if (newCost <= maxMovement) {
        const existing = reachable.get(nextKey);
        if (!existing || newCost < existing.cost) {
          const nextNode = {
            r: nr,
            c: nc,
            cost: newCost,
            path: [...current.path, [nr, nc]]
          };
          reachable.set(nextKey, nextNode);
          queue.push(nextNode);
        }
      }
    }
  }

  // Remove the starting cell from destinations where you move to
  reachable.delete(startKey);

  return reachable;
}

// Find path from start to target
export function findPath(startR, startC, targetR, targetC, grid, blockedCells = new Set(), maxMovement = 999) {
  if (startR === targetR && startC === targetC) return [];
  if (!isTerrainPassable(targetR, targetC, grid)) return null;

  const targetKey = `${targetR},${targetC}`;
  // Temporarily remove target from blockedCells if target itself is occupied (for attack/interact checks)
  const isTargetBlocked = blockedCells.has(targetKey);
  const effectiveBlocked = new Set(blockedCells);
  if (isTargetBlocked) {
    effectiveBlocked.delete(targetKey);
  }

  const reachable = getReachableCells(startR, startC, maxMovement, grid, effectiveBlocked);
  const found = reachable.get(targetKey);

  if (found) {
    return found.path;
  }

  return null;
}
