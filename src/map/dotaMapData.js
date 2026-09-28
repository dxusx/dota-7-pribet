/**
 * Dota 2 100x100 Map Generator
 * Generates an authentic 100x100 grid representing the Dota 2 battlefield:
 * - River (diagonal NW to SE, low ground elevation 0)
 * - 3 Lanes (Top, Mid, Bot)
 * - Radiant Base (SW) & Dire Base (NE) with Ancients, Fountains, Barracks, T4s, T3s
 * - Outer Towers (T1, T2)
 * - Roshan Pit in the river
 * - Neutral Creep Camps (Easy, Medium, Hard, Ancient) in both jungles
 * - Power Runes & Bounty Runes
 * - Outposts & Secret Shops
 * - Ward Cliffs (elevation 2)
 * - Dense tree clusters with juke paths
 */

export const MAP_SIZE = 100;

export const TERRAIN = {
  WATER: 'WATER',
  GRASS_RADIANT: 'GRASS_RADIANT',
  GRASS_DIRE: 'GRASS_DIRE',
  ROAD: 'ROAD',
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
  // Initialize grid
  // tiles[y * size + x]
  const tiles = new Array(size * size);

  // 1. Initial baseline: Radiant (SW) vs Dire (NE) split by diagonal
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const idx = y * size + x;
      // diagonal comparison: x + y < size ? Dire side (NE) : Radiant side (SW)
      // Actually: (0,0) is top-left, (99,99) is bottom-right.
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
  // Equation: y ≈ x + riverOffset
  // River line roughly passes through (50, 50), from top-left (15, 15) to bottom-right (85, 85)
  // Let's create an organic river path with slight sine waves
  for (let y = 5; y < size - 5; y++) {
    // curve river slightly: x = y + sin(y / 8) * 3
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

  // 3. Roads / Lanes (Top, Mid, Bot)
  // Helper to mark road
  const markRoad = (x, y, radius = 1) => {
    for (let dy = -radius; dy <= radius; dy++) {
      for (let dx = -radius; dx <= radius; dx++) {
        const px = x + dx;
        const py = y + dy;
        if (px >= 0 && px < size && py >= 0 && py < size) {
          const idx = py * size + px;
          if (tiles[idx].terrain !== TERRAIN.WATER) {
            tiles[idx].terrain = TERRAIN.ROAD;
          }
        }
      }
    }
  };

  // Top Lane:
  // Starts at Radiant Base (15, 85), goes North along x = 12..14 up to y = 14,
  // then turns East along y = 12..14 up to Dire Base (85, 15).
  for (let y = 85; y >= 14; y--) {
    markRoad(13, y, 1);
  }
  for (let x = 13; x <= 85; x++) {
    markRoad(x, 14, 1);
  }

  // Bot Lane:
  // Starts at Radiant Base (15, 85), goes East along y = 86 up to x = 86,
  // then turns North along x = 86 up to Dire Base (85, 15).
  for (let x = 15; x <= 86; x++) {
    markRoad(x, 86, 1);
  }
  for (let y = 86; y >= 15; y--) {
    markRoad(86, y, 1);
  }

  // Mid Lane:
  // Straight diagonal from Radiant (18, 82) to Dire (82, 18)
  for (let t = 0; t <= 100; t++) {
    const mx = Math.round(18 + (82 - 18) * (t / 100));
    const my = Math.round(82 + (18 - 82) * (t / 100));
    markRoad(mx, my, 1);
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
  // In the upper river bend around (37, 42)
  const roshCenter = { x: 37, y: 43 };
  for (let dy = -4; dy <= 4; dy++) {
    for (let dx = -4; dx <= 4; dx++) {
      const dist = Math.sqrt(dx * dx + dy * dy);
      const rx = roshCenter.x + dx;
      const ry = roshCenter.y + dy;
      if (rx >= 0 && rx < size && ry >= 0 && ry < size) {
        const idx = ry * size + rx;
        if (dist <= 3.5) {
          // Entrance faces south-east into river (dx > 1 && dy > 1 is open)
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

  // 7. Trees generation (Forests & Juke spots)
  // Fill natural areas with clusters of trees, keeping roads, river, bases clear
  const pseudoRandom = (seed) => {
    const s = Math.sin(seed) * 10000;
    return s - Math.floor(s);
  };

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const idx = y * size + x;
      const tile = tiles[idx];

      // Never place trees on water, road, base, roshan pit or cliff
      if (
        tile.terrain === TERRAIN.WATER ||
        tile.terrain === TERRAIN.ROAD ||
        tile.terrain === TERRAIN.BASE_RADIANT ||
        tile.terrain === TERRAIN.BASE_DIRE ||
        tile.terrain === TERRAIN.ROSHAN_PIT ||
        tile.terrain === TERRAIN.CLIFF ||
        tile.object
      ) {
        continue;
      }

      // Cellular forest noise
      const noise =
        Math.sin(x * 0.28) * Math.cos(y * 0.28) +
        Math.sin(x * 0.12 + y * 0.14) * 0.5 +
        pseudoRandom(x * 101 + y * 313) * 0.3;

      if (noise > 0.15) {
        tile.hasTree = true;
        tile.treeType = tile.faction === 'dire' ? 'spooky' : 'lush';
      }
    }
  }

  // Clear trees around key paths to create juke paths and clearings
  const clearTreeCircle = (cx, cy, r) => {
    for (let dy = -r; dy <= r; dy++) {
      for (let dx = -r; dx <= r; dx++) {
        if (dx * dx + dy * dy <= r * r) {
          const px = cx + dx;
          const py = cy + dy;
          if (px >= 0 && px < size && py >= 0 && py < size) {
            tiles[py * size + px].hasTree = false;
          }
        }
      }
    }
  };

  // 8. Place Key Buildings & Objects

  // Ancients
  tiles[88 * size + 12].object = {
    type: 'ANCIENT',
    name: 'Ancient Tree (Radiant)',
    symbol: '🌳',
    faction: 'radiant',
    size: 3,
  };
  clearTreeCircle(12, 88, 4);

  tiles[12 * size + 88].object = {
    type: 'ANCIENT',
    name: 'Ancient Throne (Dire)',
    symbol: '🌋',
    faction: 'dire',
    size: 3,
  };
  clearTreeCircle(88, 12, 4);

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
    { x: 18, y: 60, name: 'Radiant Safelane Bounty' },
    { x: 62, y: 22, name: 'Dire Jungle Bounty' },
    { x: 82, y: 40, name: 'Dire Safelane Bounty' },
  ];
  bountySpots.forEach(b => {
    clearTreeCircle(b.x, b.y, 2);
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
    clearTreeCircle(o.x, o.y, 2);
    tiles[o.y * size + o.x].object = {
      type: 'OUTPOST',
      name: o.name,
      symbol: '🗼',
      faction: o.faction,
    };
  });

  // Secret Shops
  const secretShops = [
    { x: 32, y: 60, name: 'Radiant Secret Shop', faction: 'radiant' },
    { x: 68, y: 40, name: 'Dire Secret Shop', faction: 'dire' },
  ];
  secretShops.forEach(s => {
    clearTreeCircle(s.x, s.y, 2);
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
    clearTreeCircle(t.x, t.y, 2);
    tiles[t.y * size + t.x].object = {
      type: 'TOWER',
      name: t.name,
      tier: t.tier,
      faction: t.faction,
      symbol: t.faction === 'radiant' ? '🛡️' : '⚔️',
    };
  });

  // Neutral Camps
  const neutralCamps = [
    // Radiant Camps
    { x: 34, y: 80, name: 'Radiant Easy Camp', tier: 'Easy', faction: 'radiant' },
    { x: 42, y: 76, name: 'Radiant Medium Camp 1', tier: 'Medium', faction: 'radiant' },
    { x: 50, y: 80, name: 'Radiant Medium Camp 2', tier: 'Medium', faction: 'radiant' },
    { x: 50, y: 70, name: 'Radiant Hard Camp', tier: 'Hard', faction: 'radiant' },
    { x: 28, y: 66, name: 'Radiant Ancient Camp', tier: 'Ancient', faction: 'radiant' },

    // Dire Camps
    { x: 66, y: 20, name: 'Dire Easy Camp', tier: 'Easy', faction: 'dire' },
    { x: 58, y: 24, name: 'Dire Medium Camp 1', tier: 'Medium', faction: 'dire' },
    { x: 50, y: 20, name: 'Dire Medium Camp 2', tier: 'Medium', faction: 'dire' },
    { x: 50, y: 30, name: 'Dire Hard Camp', tier: 'Hard', faction: 'dire' },
    { x: 72, y: 34, name: 'Dire Ancient Camp', tier: 'Ancient', faction: 'dire' },
  ];

  neutralCamps.forEach(c => {
    clearTreeCircle(c.x, c.y, 2);
    tiles[c.y * size + c.x].object = {
      type: 'NEUTRAL_CAMP',
      name: c.name,
      tier: c.tier,
      faction: 'neutral',
      symbol: '🐺',
    };
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
      { name: 'Radiant T1 Mid', x: 42, y: 58, faction: 'radiant' },
      { name: 'Dire T1 Mid', x: 58, y: 42, faction: 'dire' },
      { name: 'Radiant Jungle', x: 44, y: 74, faction: 'radiant' },
      { name: 'Dire Jungle', x: 56, y: 26, faction: 'dire' },
    ],
  };
}
