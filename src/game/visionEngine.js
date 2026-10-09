/**
 * Vision Engine & Fog of War for 100x100 Dota Tactical Map
 *
 * Implements Dota 2 vision specifications:
 * - Day / Night vision radii (Day: 16, Night: 8 for heroes; 12 for towers; 12 for wards)
 * - Elevation & High Ground occlusion (Low Ground cannot see into High Ground)
 * - Obstacle raycasting (Cliffs & blocking terrain)
 * - Explored vs Visible masks for fog-of-war rendering
 */

import { ELEVATION, MAP_SIZE } from '../map/dotaMapData.js';

export const HERO_DAY_VISION = 16;
export const HERO_NIGHT_VISION = 8;
export const TOWER_VISION = 12;
export const CREEP_DAY_VISION = 8;
export const CREEP_NIGHT_VISION = 6;
export const OBSERVER_WARD_VISION = 12;
export const SENTRY_WARD_VISION = 10;

/**
 * Checks if a direct ray between (x0, y0) and (x1, y1) has line of sight.
 * Uses bounded step-limited integer Bresenham algorithm to prevent infinite loops.
 */
export function hasLineOfSight(x0, y0, x1, y1, mapData, size, observerElevation) {
  const dx = Math.abs(x1 - x0);
  const dy = Math.abs(y1 - y0);
  const sx = x0 < x1 ? 1 : -1;
  const sy = y0 < y1 ? 1 : -1;
  let err = dx - dy;

  let currX = x0;
  let currY = y0;
  const maxSteps = dx + dy + 1;

  for (let s = 0; s < maxSteps; s++) {
    if (currX === x1 && currY === y1) break;

    const e2 = 2 * err;
    if (e2 > -dy) {
      err -= dy;
      currX += sx;
    }
    if (e2 < dx) {
      err += dx;
      currY += sy;
    }

    if (currX !== x1 || currY !== y1) {
      const tile = mapData?.tiles ? mapData.tiles[currY * size + currX] : null;
      if (tile && (tile.elevation || 0) > observerElevation) {
        return false;
      }
    }
  }

  return true;
}

/**
 * Casts a circular vision cone with High Ground and line-of-sight checks.
 */
export function castVisionSource(cx, cy, radius, mapData, size, visibleMask) {
  if (cx < 0 || cx >= size || cy < 0 || cy >= size) return;
  cx = Math.round(cx);
  cy = Math.round(cy);

  const originTile = mapData?.tiles ? mapData.tiles[cy * size + cx] : null;
  const originElevation = originTile ? (originTile.elevation || 0) : 0;

  const minX = Math.max(0, Math.floor(cx - radius));
  const maxX = Math.min(size - 1, Math.ceil(cx + radius));
  const minY = Math.max(0, Math.floor(cy - radius));
  const maxY = Math.min(size - 1, Math.ceil(cy + radius));

  const rSq = radius * radius;

  for (let y = minY; y <= maxY; y++) {
    for (let x = minX; x <= maxX; x++) {
      const dX = x - cx;
      const dY = y - cy;
      const distSq = dX * dX + dY * dY;
      if (distSq > rSq) continue;

      const idx = y * size + x;
      if (visibleMask[idx] === 1) continue;

      const targetTile = mapData?.tiles ? mapData.tiles[idx] : null;
      const targetElevation = targetTile ? (targetTile.elevation || 0) : 0;

      // Dota 2 High Ground Rule: Low ground cannot see into high ground past 1 tile
      if (originElevation === 0 && targetElevation > 0) {
        if (distSq > 2.5) {
          continue; // Cannot see deep into high ground
        }
      }

      // Check line of sight if higher elevation walls exist between
      if (distSq > 4) {
        if (!hasLineOfSight(cx, cy, x, y, mapData, size, originElevation)) {
          continue;
        }
      }

      visibleMask[idx] = 1;
    }
  }
}

/**
 * Computes complete visible and explored masks for a given faction.
 */
export function computeFactionVision({
  mapData,
  faction = 'radiant',
  heroes = [],
  creeps = [],
  towers = [],
  wards = [],
  isDay = true,
  previousExploredMask = null,
}) {
  const size = (mapData && mapData.size) ? mapData.size : MAP_SIZE;
  const totalTiles = size * size;

  const visibleMask = new Uint8Array(totalTiles);
  const exploredMask = previousExploredMask
    ? new Uint8Array(previousExploredMask)
    : new Uint8Array(totalTiles);

  // 1. Vision from Allied Heroes
  heroes.forEach(hero => {
    if (hero.isDead || hero.faction !== faction) return;
    const radius = hero.visionRadius || (isDay ? HERO_DAY_VISION : HERO_NIGHT_VISION);
    castVisionSource(hero.x, hero.y, radius, mapData, size, visibleMask);
  });

  // 2. Vision from Allied Towers (True Sight & High Vision)
  towers.forEach(tower => {
    if (tower.isDead || tower.faction !== faction) return;
    const radius = tower.visionRadius || TOWER_VISION;
    castVisionSource(tower.x, tower.y, radius, mapData, size, visibleMask);
  });

  // 3. Vision from Allied Creeps
  creeps.forEach(creep => {
    if (creep.isDead || creep.faction !== faction) return;
    const radius = creep.visionRadius || (isDay ? CREEP_DAY_VISION : CREEP_NIGHT_VISION);
    castVisionSource(creep.x, creep.y, radius, mapData, size, visibleMask);
  });

  // 4. Vision from Allied Wards
  wards.forEach(ward => {
    if (ward.isDead || ward.faction !== faction) return;
    const radius = ward.visionRadius || OBSERVER_WARD_VISION;
    castVisionSource(ward.x, ward.y, radius, mapData, size, visibleMask);
  });

  // 5. Update Explored Mask (all currently visible tiles become explored)
  for (let i = 0; i < totalTiles; i++) {
    if (visibleMask[i] === 1) {
      exploredMask[i] = 1;
    }
  }

  return { visibleMask, exploredMask };
}

/**
 * Checks if a unit's position is currently visible to the observing faction.
 */
export function isUnitVisibleToFaction(unit, visibleMask, size = MAP_SIZE) {
  if (!unit || !visibleMask) return true;
  const x = Math.round(unit.x);
  const y = Math.round(unit.y);
  if (x < 0 || x >= size || y < 0 || y >= size) return false;
  return visibleMask[y * size + x] === 1;
}
