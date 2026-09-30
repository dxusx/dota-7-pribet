/**
 * Dota 2 100x100 Map Generator
 * Generates an authentic 100x100 grid representing the Dota 2 battlefield:
 * - River (diagonal NW to SE, low ground elevation 0)
 * - 3 Main Lanes (Top, Mid, Bot)
 * - Extensive Jungle Trail Network (unobstructed corridors connecting all camps to lanes and river)
 * - Radiant Base (SW) & Dire Base (NE) with Ancients, Fountains, Barracks, T4s, T3s
 * - Outer Towers (T1, T2)
 * - Roshan Pit in the river
 * - 7 Neutral Creep Camps per side (Easy pull, Mediums, Hards, Ancients)
 * - Power Runes & Bounty Runes
 * - Outposts & Secret Shops
 * - Ward Cliffs (elevation 2)
 * - Dynamic BFS auto-digger: 100% mathematical guarantee that NO camp is blocked by trees!
 */

export const MAP_SIZE = 100;

export const TERRAIN = {
  WATER: 'WATER',
  GRASS_RADIANT: 'GRASS_RADIANT',
  GRASS_DIRE: 'GRASS_DIRE',
  ROAD: 'ROAD',
  DIRT_PATH: 'DIRT_PATH',
  CLIFF: 'CLIFF',
  ROSHAN_PIT: 'ROSHAN_PIT',
  BASE_RADIANT: 'BASE_RADIANT',
  BASE_DIRE: 'BASE_DIRE',
};

export const ELEVATION = {
  LOW: 0,     // River, water level
  GROUND: 1,  // Normal lanes, jungles
  HIGH: 2,    // Bases, Ward Cliffs
};

export function generateDotaMap() {
  const size = MAP_SIZE;
  const tiles = new Array(size * size);

  // 1. Initial baseline: Radiant (SW) vs Dire (NE) split by diagonal
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const idx = y * size + x;
      // Top-Right is Dire: x is high, y is low (x - y > 0).
      // Bottom-Left is Radiant: x is low, y is high (x - y < 0).
      const isDire = (x - y) > 0;

      tiles[idx] = {
        x,
        y,
        terrain: isDire ? TERRAIN.GRASS_DIRE : TERRAIN.GRASS_RADIANT,
        elevation: ELEVATION.GROUND,
        hasTree: false,
        treeType: null,
        object: null,
        faction: isDire ? 'dire' : 'radiant',
      };
    }
  }

  // 2. River generation: Diagonal running from ~ (15, 10) to (90, 85)
  // River roughly passes through (50, 50), from top-left (15, 15) to bottom-right (85, 85)
  for (let y = 4; y < size - 4; y++) {
    const riverCenterX = Math.round(y + Math.sin(y / 9) * 4);
    const riverWidth = 5;

    for (let dx = -riverWidth; dx <= riverWidth; dx++) {
      const rx = riverCenterX + dx;
      if (rx >= 0 && rx < size) {
        const idx = y * size + rx;
        tiles[idx].terrain = TERRAIN.WATER;
        tiles[idx].elevation = ELEVATION.LOW;
        tiles[idx].faction = 'neutral';
      }
    }
  }

  // Helper to mark road/path with radius
  const markPath = (x, y, radius = 1, terrainType = TERRAIN.ROAD) => {
    for (let dy = -radius; dy <= radius; dy++) {
      for (let dx = -radius; dx <= radius; dx++) {
        const px = Math.round(x + dx);
        const py = Math.round(y + dy);
        if (px >= 0 && px < size && py >= 0 && py < size) {
          const idx = py * size + px;
          if (tiles[idx].terrain !== TERRAIN.WATER) {
            tiles[idx].terrain = terrainType;
            tiles[idx].hasTree = false;
          }
        }
      }
    }
  };

  // Helper to draw a line between two points
  const drawLinePath = (x0, y0, x1, y1, radius = 1, terrainType = TERRAIN.DIRT_PATH) => {
    const dx = Math.abs(x1 - x0);
    const dy = Math.abs(y1 - y0);
    const sx = x0 < x1 ? 1 : -1;
    const sy = y0 < y1 ? 1 : -1;
    let err = dx - dy;

    let cx = x0;
    let cy = y0;

    while (true) {
      markPath(cx, cy, radius, terrainType);
      if (cx === x1 && cy === y1) break;
      const e2 = 2 * err;
      if (e2 > -dy) {
        err -= dy;
        cx += sx;
      }
      if (e2 < dx) {
        err += dx;
        cy += sy;
      }
    }
  };

  // 3. Main Roads / Lanes (Top, Mid, Bot)
  // Top Lane:
  for (let y = 85; y >= 14; y--) markPath(13, y, 1, TERRAIN.ROAD);
  for (let x = 13; x <= 85; x++) markPath(x, 14, 1, TERRAIN.ROAD);

  // Bot Lane:
  for (let x = 15; x <= 86; x++) markPath(x, 86, 1, TERRAIN.ROAD);
  for (let y = 86; y >= 15; y--) markPath(86, y, 1, TERRAIN.ROAD);

  // Mid Lane:
  for (let t = 0; t <= 100; t++) {
    const mx = Math.round(18 + (82 - 18) * (t / 100));
    const my = Math.round(82 + (18 - 82) * (t / 100));
    markPath(mx, my, 1, TERRAIN.ROAD);
  }

  // 4. Bases:
  // Radiant Base: (5..22, 78..95)
  for (let y = 78; y <= 95; y++) {
    for (let x = 5; x <= 22; x++) {
      if ((x - 12) * (x - 12) + (y - 88) * (y - 88) <= 130) {
        const idx = y * size + x;
        tiles[idx].terrain = TERRAIN.BASE_RADIANT;
        tiles[idx].elevation = ELEVATION.HIGH;
        tiles[idx].faction = 'radiant';
      }
    }
  }

  // Dire Base: (78..95, 5..22)
  for (let y = 5; y <= 22; y++) {
    for (let x = 78; x <= 95; x++) {
      if ((x - 88) * (x - 88) + (y - 12) * (y - 12) <= 130) {
        const idx = y * size + x;
        tiles[idx].terrain = TERRAIN.BASE_DIRE;
        tiles[idx].elevation = ELEVATION.HIGH;
        tiles[idx].faction = 'dire';
      }
    }
  }

  // 5. Roshan Pit
  const roshCenter = { x: 37, y: 43 };
  for (let dy = -4; dy <= 4; dy++) {
    for (let dx = -4; dx <= 4; dx++) {
      const dist = Math.sqrt(dx * dx + dy * dy);
      const rx = roshCenter.x + dx;
      const ry = roshCenter.y + dy;
      if (rx >= 0 && rx < size && ry >= 0 && ry < size) {
        const idx = ry * size + rx;
        if (dist <= 3.5) {
          // Entrance faces south-east into river
          if (dist > 2.6 && !(dx >= 1 && dy >= 0)) {
            tiles[idx].terrain = TERRAIN.CLIFF;
            tiles[idx].elevation = ELEVATION.HIGH;
          } else {
            tiles[idx].terrain = TERRAIN.ROSHAN_PIT;
            tiles[idx].elevation = ELEVATION.LOW;
          }
          tiles[idx].faction = 'neutral';
        }
      }
    }
  }

  // 6. Ward Cliffs (Elevation 2)
  const wardCliffs = [
    { x: 38, y: 34, name: 'Top River Cliff' },
    { x: 62, y: 66, name: 'Bot River Cliff' },
    { x: 42, y: 52, name: 'Radiant Mid Cliff' },
    { x: 58, y: 48, name: 'Dire Mid Cliff' },
    { x: 44, y: 72, name: 'Radiant Jungle Cliff' },
    { x: 56, y: 28, name: 'Dire Jungle Cliff' },
    { x: 74, y: 74, name: 'Radiant Safelane Cliff' },
    { x: 26, y: 26, name: 'Dire Safelane Cliff' },
  ];

  wardCliffs.forEach(c => {
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        const px = c.x + dx;
        const py = c.y + dy;
        const idx = py * size + px;
        tiles[idx].terrain = TERRAIN.CLIFF;
        tiles[idx].elevation = ELEVATION.HIGH;
      }
    }
    tiles[c.y * size + c.x].object = {
      type: 'WARD_CLIFF',
      name: c.name,
      symbol: '👁️',
      faction: 'neutral',
    };
  });

  // 7. Define All Neutral Camps (Authentic 7 per side)
  const neutralCamps = [
    // RADIANT MAIN JUNGLE
    { x: 35, y: 80, name: 'Radiant Small Pull Camp', tier: 'Easy', faction: 'radiant', pullTo: { x: 35, y: 86 } },
    { x: 43, y: 74, name: 'Radiant Medium Hill Camp', tier: 'Medium', faction: 'radiant' },
    { x: 54, y: 78, name: 'Radiant Medium River Camp', tier: 'Medium', faction: 'radiant' },
    { x: 48, y: 68, name: 'Radiant Hard Mid Camp', tier: 'Hard', faction: 'radiant' },
    { x: 62, y: 80, name: 'Radiant Hard Pull Camp', tier: 'Hard', faction: 'radiant', pullTo: { x: 62, y: 86 } },

    // RADIANT TRIANGLE
    { x: 27, y: 64, name: 'Radiant Ancient Camp', tier: 'Ancient', faction: 'radiant' },
    { x: 23, y: 56, name: 'Radiant Triangle Medium', tier: 'Medium', faction: 'radiant' },

    // DIRE MAIN JUNGLE
    { x: 65, y: 20, name: 'Dire Small Pull Camp', tier: 'Easy', faction: 'dire', pullTo: { x: 65, y: 14 } },
    { x: 57, y: 26, name: 'Dire Medium Hill Camp', tier: 'Medium', faction: 'dire' },
    { x: 46, y: 22, name: 'Dire Medium River Camp', tier: 'Medium', faction: 'dire' },
    { x: 52, y: 32, name: 'Dire Hard Mid Camp', tier: 'Hard', faction: 'dire' },
    { x: 38, y: 20, name: 'Dire Hard Pull Camp', tier: 'Hard', faction: 'dire', pullTo: { x: 38, y: 14 } },

    // DIRE TRIANGLE
    { x: 73, y: 36, name: 'Dire Ancient Camp', tier: 'Ancient', faction: 'dire' },
    { x: 77, y: 44, name: 'Dire Triangle Medium', tier: 'Medium', faction: 'dire' },
  ];

  // 8. Carve Comprehensive Jungle Trail Network (Dirt Paths)
  // Radiant Jungle Trails:
  // Safelane pull trail from Bot Lane directly through Small Camp
  drawLinePath(35, 86, 35, 78, 1, TERRAIN.DIRT_PATH);
  drawLinePath(35, 78, 43, 74, 1, TERRAIN.DIRT_PATH);
  drawLinePath(43, 74, 48, 68, 1, TERRAIN.DIRT_PATH);
  drawLinePath(48, 68, 44, 58, 1, TERRAIN.DIRT_PATH); // Connect to Mid T1
  drawLinePath(48, 68, 54, 62, 1, TERRAIN.DIRT_PATH); // Connect to River

  // Lower Radiant Jungle trail
  drawLinePath(43, 74, 54, 78, 1, TERRAIN.DIRT_PATH);
  drawLinePath(54, 78, 62, 80, 1, TERRAIN.DIRT_PATH);
  drawLinePath(62, 80, 62, 86, 1, TERRAIN.DIRT_PATH); // Connect to Bot Lane
  drawLinePath(62, 80, 70, 76, 1, TERRAIN.DIRT_PATH); // Connect to River

  // Radiant Triangle Trails
  drawLinePath(18, 76, 27, 64, 1, TERRAIN.DIRT_PATH); // From Radiant Top/Base
  drawLinePath(27, 64, 32, 58, 1, TERRAIN.DIRT_PATH); // To Secret Shop
  drawLinePath(32, 58, 38, 62, 1, TERRAIN.DIRT_PATH); // To Mid Lane
  drawLinePath(27, 64, 23, 56, 1, TERRAIN.DIRT_PATH); // To Triangle Medium
  drawLinePath(23, 56, 22, 45, 1, TERRAIN.DIRT_PATH); // To Top Lane / River

  // Dire Jungle Trails:
  // Safelane pull trail from Top Lane directly through Small Camp
  drawLinePath(65, 14, 65, 22, 1, TERRAIN.DIRT_PATH);
  drawLinePath(65, 22, 57, 26, 1, TERRAIN.DIRT_PATH);
  drawLinePath(57, 26, 52, 32, 1, TERRAIN.DIRT_PATH);
  drawLinePath(52, 32, 56, 42, 1, TERRAIN.DIRT_PATH); // Connect to Mid T1
  drawLinePath(52, 32, 46, 38, 1, TERRAIN.DIRT_PATH); // Connect to River

  // Upper Dire Jungle trail
  drawLinePath(57, 26, 46, 22, 1, TERRAIN.DIRT_PATH);
  drawLinePath(46, 22, 38, 20, 1, TERRAIN.DIRT_PATH);
  drawLinePath(38, 20, 38, 14, 1, TERRAIN.DIRT_PATH); // Connect to Top Lane
  drawLinePath(38, 20, 30, 24, 1, TERRAIN.DIRT_PATH); // Connect to River

  // Dire Triangle Trails
  drawLinePath(82, 24, 73, 36, 1, TERRAIN.DIRT_PATH); // From Dire Bot/Base
  drawLinePath(73, 36, 68, 42, 1, TERRAIN.DIRT_PATH); // To Secret Shop
  drawLinePath(68, 42, 62, 38, 1, TERRAIN.DIRT_PATH); // To Mid Lane
  drawLinePath(73, 36, 77, 44, 1, TERRAIN.DIRT_PATH); // To Triangle Medium
  drawLinePath(77, 44, 78, 55, 1, TERRAIN.DIRT_PATH); // To Bot Lane / River

  // 9. Clear Tree Free Zones for All Objects
  const clearTreeCircle = (cx, cy, r) => {
    for (let dy = -r; dy <= r; dy++) {
      for (let dx = -r; dx <= r; dx++) {
        if (dx * dx + dy * dy <= r * r) {
          const px = Math.round(cx + dx);
          const py = Math.round(cy + dy);
          if (px >= 0 && px < size && py >= 0 && py < size) {
            tiles[py * size + px].hasTree = false;
          }
        }
      }
    }
  };

  // 10. Generate Organic Tree Clusters (Only in between trails and boundaries)
  const pseudoRandom = (seed) => {
    const s = Math.sin(seed) * 10000;
    return s - Math.floor(s);
  };

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const idx = y * size + x;
      const tile = tiles[idx];

      // Never place trees on road, dirt path, water, bases, roshan pit or cliffs
      if (
        tile.terrain === TERRAIN.WATER ||
        tile.terrain === TERRAIN.ROAD ||
        tile.terrain === TERRAIN.DIRT_PATH ||
        tile.terrain === TERRAIN.BASE_RADIANT ||
        tile.terrain === TERRAIN.BASE_DIRE ||
        tile.terrain === TERRAIN.ROSHAN_PIT ||
        tile.terrain === TERRAIN.CLIFF ||
        tile.object
      ) {
        continue;
      }

      // Organic cellular noise for natural tree groves
      const noise =
        Math.sin(x * 0.35) * Math.cos(y * 0.35) +
        Math.sin(x * 0.15 + y * 0.15) * 0.4 +
        pseudoRandom(x * 137 + y * 281) * 0.3;

      // Higher threshold = less tree clutter, creating natural gaps and clearings
      if (noise > 0.30) {
        tile.hasTree = true;
        tile.treeType = tile.faction === 'dire' ? 'spooky' : 'lush';
      }
    }
  }

  // 11. Place Buildings and Landmark Objects

  // Ancients
  tiles[88 * size + 12].object = {
    type: 'ANCIENT',
    name: 'Ancient Tree (Radiant)',
    symbol: '🌳',
    faction: 'radiant',
    size: 3,
  };
  clearTreeCircle(12, 88, 5);

  tiles[12 * size + 88].object = {
    type: 'ANCIENT',
    name: 'Ancient Throne (Dire)',
    symbol: '🌋',
    faction: 'dire',
    size: 3,
  };
  clearTreeCircle(88, 12, 5);

  // Fountains
  tiles[95 * size + 5].object = {
    type: 'FOUNTAIN',
    name: 'Radiant Fountain',
    symbol: '⛲',
    faction: 'radiant',
  };
  tiles[5 * size + 95].object = {
    type: 'FOUNTAIN',
    name: 'Dire Fountain',
    symbol: '♨️',
    faction: 'dire',
  };

  // Roshan
  tiles[roshCenter.y * size + roshCenter.x].object = {
    type: 'ROSHAN',
    name: 'Roshan the Immortal',
    symbol: '👹',
    faction: 'neutral',
  };

  // Runes
  tiles[33 * size + 35].object = {
    type: 'RUNE',
    name: 'Top Power Rune',
    symbol: '🔷',
    faction: 'neutral',
  };
  tiles[67 * size + 65].object = {
    type: 'RUNE',
    name: 'Bot Power Rune',
    symbol: '🔶',
    faction: 'neutral',
  };

  // Bounty Runes
  const bountySpots = [
    { x: 38, y: 78, name: 'Radiant Jungle Bounty' },
    { x: 18, y: 60, name: 'Radiant Triangle Bounty' },
    { x: 62, y: 22, name: 'Dire Jungle Bounty' },
    { x: 82, y: 40, name: 'Dire Triangle Bounty' },
  ];
  bountySpots.forEach(b => {
    clearTreeCircle(b.x, b.y, 3);
    tiles[b.y * size + b.x].object = {
      type: 'BOUNTY_RUNE',
      name: b.name,
      symbol: '🟡',
      faction: 'neutral',
    };
  });

  // Outposts
  const outposts = [
    { x: 25, y: 64, name: 'Radiant Outpost', faction: 'radiant' },
    { x: 75, y: 36, name: 'Dire Outpost', faction: 'dire' },
  ];
  outposts.forEach(o => {
    clearTreeCircle(o.x, o.y, 3);
    tiles[o.y * size + o.x].object = {
      type: 'OUTPOST',
      name: o.name,
      symbol: '🗼',
      faction: o.faction,
    };
  });

  // Secret Shops
  const secretShops = [
    { x: 32, y: 58, name: 'Radiant Secret Shop', faction: 'radiant' },
    { x: 68, y: 42, name: 'Dire Secret Shop', faction: 'dire' },
  ];
  secretShops.forEach(s => {
    clearTreeCircle(s.x, s.y, 3);
    tiles[s.y * size + s.x].object = {
      type: 'SHOP',
      name: s.name,
      symbol: '🛒',
      faction: s.faction,
    };
  });

  // Towers
  const towers = [
    // Radiant Towers
    { x: 13, y: 40, name: 'Radiant T1 Top', tier: 1, faction: 'radiant' },
    { x: 13, y: 58, name: 'Radiant T2 Top', tier: 2, faction: 'radiant' },
    { x: 13, y: 74, name: 'Radiant T3 Top', tier: 3, faction: 'radiant' },

    { x: 42, y: 58, name: 'Radiant T1 Mid', tier: 1, faction: 'radiant' },
    { x: 32, y: 68, name: 'Radiant T2 Mid', tier: 2, faction: 'radiant' },
    { x: 22, y: 78, name: 'Radiant T3 Mid', tier: 3, faction: 'radiant' },

    { x: 62, y: 86, name: 'Radiant T1 Bot', tier: 1, faction: 'radiant' },
    { x: 42, y: 86, name: 'Radiant T2 Bot', tier: 2, faction: 'radiant' },
    { x: 24, y: 86, name: 'Radiant T3 Bot', tier: 3, faction: 'radiant' },

    { x: 15, y: 85, name: 'Radiant T4 Top', tier: 4, faction: 'radiant' },
    { x: 14, y: 87, name: 'Radiant T4 Bot', tier: 4, faction: 'radiant' },

    // Dire Towers
    { x: 38, y: 14, name: 'Dire T1 Top', tier: 1, faction: 'dire' },
    { x: 58, y: 14, name: 'Dire T2 Top', tier: 2, faction: 'dire' },
    { x: 74, y: 14, name: 'Dire T3 Top', tier: 3, faction: 'dire' },

    { x: 58, y: 42, name: 'Dire T1 Mid', tier: 1, faction: 'dire' },
    { x: 68, y: 32, name: 'Dire T2 Mid', tier: 2, faction: 'dire' },
    { x: 78, y: 22, name: 'Dire T3 Mid', tier: 3, faction: 'dire' },

    { x: 86, y: 60, name: 'Dire T1 Bot', tier: 1, faction: 'dire' },
    { x: 86, y: 42, name: 'Dire T2 Bot', tier: 2, faction: 'dire' },
    { x: 86, y: 26, name: 'Dire T3 Bot', tier: 3, faction: 'dire' },

    { x: 85, y: 15, name: 'Dire T4 Top', tier: 4, faction: 'dire' },
    { x: 86, y: 13, name: 'Dire T4 Bot', tier: 4, faction: 'dire' },
  ];

  towers.forEach(t => {
    clearTreeCircle(t.x, t.y, 3);
    tiles[t.y * size + t.x].object = {
      type: 'TOWER',
      name: t.name,
      tier: t.tier,
      faction: t.faction,
      symbol: t.faction === 'radiant' ? '🛡️' : '⚔️',
    };
  });

  // Neutral Camps Placement with Generous 7x7 Clearings
  neutralCamps.forEach(c => {
    clearTreeCircle(c.x, c.y, 3);
    tiles[c.y * size + c.x].object = {
      type: 'NEUTRAL_CAMP',
      name: c.name,
      tier: c.tier,
      faction: 'neutral',
      symbol: '🐺',
    };

    // If camp has a designated pull target, ensure direct 3-tile wide clearing
    if (c.pullTo) {
      drawLinePath(c.x, c.y, c.pullTo.x, c.pullTo.y, 1, TERRAIN.DIRT_PATH);
    }
  });

  // 12. MATHEMATICAL GUARANTEE: BFS Reachability Validation & Auto-Digger
  // We ensure that every single camp, landmark, building, and rune has a 100% clear walkable path
  // from the main lanes and river!
  const isWalkable = (x, y) => {
    if (x < 0 || x >= size || y < 0 || y >= size) return false;
    const t = tiles[y * size + x];
    return !t.hasTree && t.terrain !== TERRAIN.CLIFF;
  };

  const runBFS = (startX, startY) => {
    const visited = new Uint8Array(size * size);
    const queue = [startY * size + startX];
    visited[startY * size + startX] = 1;

    let head = 0;
    while (head < queue.length) {
      const curr = queue[head++];
      const cx = curr % size;
      const cy = Math.floor(curr / size);

      const neighbors = [
        { x: cx + 1, y: cy },
        { x: cx - 1, y: cy },
        { x: cx, y: cy + 1 },
        { x: cx, y: cy - 1 },
      ];

      for (let i = 0; i < neighbors.length; i++) {
        const { x: nx, y: ny } = neighbors[i];
        if (nx >= 0 && nx < size && ny >= 0 && ny < size) {
          const nidx = ny * size + nx;
          if (!visited[nidx] && isWalkable(nx, ny)) {
            visited[nidx] = 1;
            queue.push(nidx);
          }
        }
      }
    }
    return visited;
  };

  // Run BFS starting from the center of Mid Lane (50, 50)
  let visited = runBFS(50, 50);

  // Check every neutral camp and key object:
  const allPOIs = [
    ...neutralCamps,
    ...towers,
    ...bountySpots,
    ...outposts,
    ...secretShops,
    { x: 12, y: 88 },
    { x: 88, y: 12 },
    { x: roshCenter.x, y: roshCenter.y },
  ];

  allPOIs.forEach(poi => {
    const pidx = poi.y * size + poi.x;
    if (!visited[pidx]) {
      // POI is blocked! Find the closest connected tile using Manhattan distance
      let bestDist = Infinity;
      let targetX = 50;
      let targetY = 50;

      for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
          const idx = y * size + x;
          if (visited[idx]) {
            const dist = Math.abs(x - poi.x) + Math.abs(y - poi.y);
            if (dist < bestDist) {
              bestDist = dist;
              targetX = x;
              targetY = y;
            }
          }
        }
      }

      // Dig a clear 3-tile wide path directly to that connected tile!
      drawLinePath(poi.x, poi.y, targetX, targetY, 1, TERRAIN.DIRT_PATH);
      clearTreeCircle(poi.x, poi.y, 3);

      // Re-run BFS to update connected component
      visited = runBFS(50, 50);
    }
  });

  return {
    size,
    tiles,
    landmarks: [
      { name: 'Radiant Ancient', x: 12, y: 88, faction: 'radiant' },
      { name: 'Dire Throne', x: 88, y: 12, faction: 'dire' },
      { name: 'Roshan Pit', x: roshCenter.x, y: roshCenter.y, faction: 'neutral' },
      { name: 'Mid River', x: 50, y: 50, faction: 'neutral' },
      { name: 'Top Rune', x: 33, y: 35, faction: 'neutral' },
      { name: 'Bot Rune', x: 67, y: 65, faction: 'neutral' },
      { name: 'Radiant Small Camp', x: 35, y: 80, faction: 'radiant' },
      { name: 'Dire Small Camp', x: 65, y: 20, faction: 'dire' },
      { name: 'Radiant Ancient Camp', x: 27, y: 64, faction: 'radiant' },
      { name: 'Dire Ancient Camp', x: 73, y: 36, faction: 'dire' },
    ],
  };
}
