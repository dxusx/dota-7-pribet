// 95x95 Pixel Dota Battlefield Grid Generator
// Matches the exact 5-tile system defined by the user and friend:
// 0: Непроходимое (#1a1a1c) - Unpassable (dense woods, rocky cliffs, border walls)
// 1: Фонтан (#384457) - Fountain (+24% HP/MP per turn, status cleanse)
// 2: Хайграунд (#8b8788) - Highground (Elevation, bases, vision ramps, ward cliffs)
// 3: Граунд (#4d7150) - Ground (Playable lowground, lanes, jungle clearings)
// 4: Вода (#8294b6) - Water (River, -10% movement speed)

export const GRID_SIZE = 95;

export const TILE_TYPES = {
  UNPASSABLE: 0,
  FOUNTAIN: 1,
  HIGHGROUND: 2,
  GROUND: 3,
  WATER: 4
};

export const TILE_INFO = {
  [TILE_TYPES.UNPASSABLE]: {
    name: 'Непроходимое',
    color: '#1a1a1c',
    gridBorder: '#28282c',
    desc: 'Непроходимо (скалы, густые деревья, край карты)',
    passable: false,
    speedMod: 0
  },
  [TILE_TYPES.FOUNTAIN]: {
    name: 'Фонтан',
    color: '#384457',
    gridBorder: '#4a5b75',
    desc: '+24% хп/ход, +24% мана/ход, очищение от негативных эффектов',
    passable: true,
    speedMod: 0
  },
  [TILE_TYPES.HIGHGROUND]: {
    name: 'Хайграунд',
    color: '#8b8788',
    gridBorder: '#9d999a',
    desc: 'Возвышенность (Хайграунд): тактический обзор, база, рампы',
    passable: true,
    speedMod: 0
  },
  [TILE_TYPES.GROUND]: {
    name: 'Граунд',
    color: '#4d7150',
    gridBorder: '#5b825f',
    desc: 'Обычная земля (Граунд): стандартное перемещение',
    passable: true,
    speedMod: 0
  },
  [TILE_TYPES.WATER]: {
    name: 'Вода',
    color: '#8294b6',
    gridBorder: '#98a9cc',
    desc: 'Вода (Река): -10% к скорости перемещения',
    passable: true,
    speedMod: -0.1
  }
};

// Check if a cell belongs to Top, Mid, or Bot Lane
export function getLaneAt(r, c) {
  // Top Lane: Vertical segment (c: 6..10, r: 8..80) & Horizontal segment (r: 6..10, c: 8..80)
  if ((c >= 6 && c <= 10 && r >= 8 && r <= 80) || (r >= 6 && r <= 10 && c >= 8 && c <= 80)) {
    return 'top';
  }
  // Bot Lane: Horizontal segment (r: 84..88, c: 16..86) & Vertical segment (c: 84..88, r: 16..86)
  if ((r >= 84 && r <= 88 && c >= 16 && c <= 86) || (c >= 84 && c <= 88 && r >= 16 && r <= 86)) {
    return 'bot';
  }
  // Mid Lane: Diagonal corridor
  if (Math.abs(r + c - 94) <= 3 && r >= 14 && r <= 80 && c >= 14 && c <= 80) {
    return 'mid';
  }
  return null;
}

// Check if cell is a stone river bridge
export function isBridgeCell(r, c) {
  // Top Lane stone bridge
  if (r >= 6 && r <= 10 && c >= 27 && c <= 31) return true;
  // Bot Lane stone bridge
  if (r >= 64 && r <= 68 && c >= 84 && c <= 88) return true;
  return false;
}

// Procedural generator for authentic 95x95 Dota Map in pixel grid
export function generatePixelDotaMap() {
  const grid = new Uint8Array(GRID_SIZE * GRID_SIZE);

  const setCell = (r, c, type) => {
    if (r >= 0 && r < GRID_SIZE && c >= 0 && c < GRID_SIZE) {
      grid[r * GRID_SIZE + c] = type;
    }
  };

  // 1. Fill entire map with GROUND (playable lowground green)
  for (let i = 0; i < GRID_SIZE * GRID_SIZE; i++) {
    grid[i] = TILE_TYPES.GROUND;
  }

  // 2. Outer boundary borders (2 cells thick, impassable bedrock cliffs)
  for (let c = 0; c < GRID_SIZE; c++) {
    for (let r = 0; r < 2; r++) setCell(r, c, TILE_TYPES.UNPASSABLE);
    for (let r = GRID_SIZE - 2; r < GRID_SIZE; r++) setCell(r, c, TILE_TYPES.UNPASSABLE);
  }
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < 2; c++) setCell(r, c, TILE_TYPES.UNPASSABLE);
    for (let c = GRID_SIZE - 2; c < GRID_SIZE; c++) setCell(r, c, TILE_TYPES.UNPASSABLE);
  }

  // Border forests outside the lanes (giving the map clean margins)
  // Outside Top Lane (left of c=6 and above r=6)
  for (let r = 2; r < 78; r++) {
    for (let c = 2; c < 6; c++) setCell(r, c, TILE_TYPES.UNPASSABLE);
  }
  for (let r = 2; r < 6; r++) {
    for (let c = 2; c < 78; c++) setCell(r, c, TILE_TYPES.UNPASSABLE);
  }
  // Outside Bot Lane (below r=88 and right of c=88)
  for (let r = 16; r < GRID_SIZE - 2; r++) {
    for (let c = 89; c < GRID_SIZE - 2; c++) setCell(r, c, TILE_TYPES.UNPASSABLE);
  }
  for (let r = 89; r < GRID_SIZE - 2; r++) {
    for (let c = 16; c < GRID_SIZE - 2; c++) setCell(r, c, TILE_TYPES.UNPASSABLE);
  }

  // 3. RIVER (Water, -10% speed)
  // S-curved diagonal polyline cutting across the map from NW to SE
  const riverPoints = [
    { r: 2, c: 26 },
    { r: 8, c: 29 },   // Top bridge
    { r: 18, c: 33 },
    { r: 32, c: 38 },  // Top rune / near Roshan
    { r: 47, c: 47 },  // Mid lane crossing (center)
    { r: 58, c: 56 },  // Bot rune
    { r: 65, c: 72 },
    { r: 66, c: 86 },  // Bot bridge
    { r: 68, c: 92 }
  ];

  function distToSegment(pr, pc, ar, ac, br, bc) {
    const l2 = (br - ar) * (br - ar) + (bc - ac) * (bc - ac);
    if (l2 === 0) return Math.hypot(pr - ar, pc - ac);
    let t = ((pr - ar) * (br - ar) + (pc - ac) * (bc - ac)) / l2;
    t = Math.max(0, Math.min(1, t));
    return Math.hypot(pr - (ar + t * (br - ar)), pc - (ac + t * (bc - ac)));
  }

  for (let r = 2; r < GRID_SIZE - 2; r++) {
    for (let c = 2; c < GRID_SIZE - 2; c++) {
      let minDist = 999;
      for (let i = 0; i < riverPoints.length - 1; i++) {
        const d = distToSegment(r, c, riverPoints[i].r, riverPoints[i].c, riverPoints[i+1].r, riverPoints[i+1].c);
        if (d < minDist) minDist = d;
      }
      // River width ~ 4.5 cells
      if (minDist <= 2.3) {
        setCell(r, c, TILE_TYPES.WATER);
      }
    }
  }

  // 4. FORESTS & CLIFFS (Creating distinct lanes and jungle paths)
  // Massif 1: Radiant Offlane / Secret Shop massif (between Top Lane and Mid Lane)
  for (let r = 13; r <= 38; r++) {
    for (let c = 13; c <= 38; c++) {
      if (r + c <= 60 && Math.hypot(r - 28, c - 20) > 4) {
        setCell(r, c, TILE_TYPES.UNPASSABLE);
      }
    }
  }

  // Massif 2: Radiant Main Jungle (between Mid Lane, Bot Lane, and Base)
  for (let r = 58; r <= 81; r++) {
    for (let c = 18; c <= 48; c++) {
      if (r + c >= 100 && r <= 81) {
        // Camp clearings: Small (76, 28), Med 1 (78, 46), Med 2 (64, 22), Hard (68, 38)
        const dSmall = Math.hypot(r - 76, c - 28);
        const dMed1 = Math.hypot(r - 78, c - 46);
        const dMed2 = Math.hypot(r - 64, c - 22);
        const dHard = Math.hypot(r - 68, c - 38);
        if (dSmall > 3.2 && dMed1 > 3.2 && dMed2 > 3.2 && dHard > 3.2) {
          if ((r + c) % 3 === 0 || (r * c) % 4 === 0) {
            setCell(r, c, TILE_TYPES.UNPASSABLE);
          }
        }
      }
    }
  }

  // Radiant Ancient Camp Highground Plateau: (58, 46)
  for (let dr = -3; dr <= 3; dr++) {
    for (let dc = -3; dc <= 3; dc++) {
      if (Math.hypot(dr, dc) <= 3) {
        setCell(58 + dr, 46 + dc, TILE_TYPES.HIGHGROUND);
      }
    }
  }

  // Massif 3: Dire Main Jungle (between Top Lane, Mid Lane, and Base)
  for (let r = 13; r <= 38; r++) {
    for (let c = 48; c <= 78; c++) {
      if (r + c <= 90 && r >= 13) {
        // Camp clearings: Small (18, 66), Med 1 (16, 48), Med 2 (28, 72), Hard (24, 54)
        const dSmall = Math.hypot(r - 18, c - 66);
        const dMed1 = Math.hypot(r - 16, c - 48);
        const dMed2 = Math.hypot(r - 28, c - 72);
        const dHard = Math.hypot(r - 24, c - 54);
        if (dSmall > 3.2 && dMed1 > 3.2 && dMed2 > 3.2 && dHard > 3.2) {
          if ((r + c) % 3 === 0 || (r * c) % 4 === 0) {
            setCell(r, c, TILE_TYPES.UNPASSABLE);
          }
        }
      }
    }
  }

  // Dire Ancient Camp Highground Plateau: (36, 48)
  for (let dr = -3; dr <= 3; dr++) {
    for (let dc = -3; dc <= 3; dc++) {
      if (Math.hypot(dr, dc) <= 3) {
        setCell(36 + dr, 48 + dc, TILE_TYPES.HIGHGROUND);
      }
    }
  }

  // Massif 4: Dire Offlane (between Mid Lane and Bot Lane)
  for (let r = 56; r <= 81; r++) {
    for (let c = 56; c <= 81; c++) {
      if (r + c >= 130 && Math.hypot(r - 68, c - 74) > 4) {
        setCell(r, c, TILE_TYPES.UNPASSABLE);
      }
    }
  }

  // 5. ELEVATED WARD CLIFFS (Iconic Dota vision pillars)
  const wardCliffs = [
    { r: 30, c: 28 }, // Top river ward cliff
    { r: 64, c: 64 }, // Bot river ward cliff
    { r: 68, c: 34 }, // Radiant jungle ward cliff
    { r: 26, c: 60 }  // Dire jungle ward cliff
  ];
  wardCliffs.forEach(wc => {
    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        setCell(wc.r + dr, wc.c + dc, TILE_TYPES.HIGHGROUND);
      }
    }
  });

  // 6. ROSHAN PIT (North of River Mid at r=24, c=42)
  for (let dr = -4; dr <= 4; dr++) {
    for (let dc = -4; dc <= 4; dc++) {
      const d = Math.hypot(dr, dc);
      const pr = 24 + dr;
      const pc = 42 + dc;
      if (d >= 2.2 && d <= 3.8) {
        // Horseshoe opening facing South-East towards river (dr >= 1 && dc >= 1)
        if (!(dr >= 1 && dc >= 1)) {
          setCell(pr, pc, TILE_TYPES.UNPASSABLE);
        }
      } else if (d < 2.2) {
        setCell(pr, pc, TILE_TYPES.GROUND);
      }
    }
  }

  // 7. BASES: HIGHGROUND & FOUNTAINS (Exact Match to Friend's Geometry)
  // Radiant Base (Bottom-Left: 94, 0)
  for (let r = 74; r < GRID_SIZE; r++) {
    for (let c = 0; c <= 22; c++) {
      const d = Math.hypot(r - 94, c);
      if (d <= 17) {
        setCell(r, c, TILE_TYPES.HIGHGROUND);
      }
      if (d <= 6) {
        setCell(r, c, TILE_TYPES.FOUNTAIN);
      }
      // Outer cliff border with 3 ramps
      if (d > 17 && d <= 18.5) {
        const isTopRamp = (c >= 6 && c <= 10 && r >= 75 && r <= 78);
        const isMidRamp = (Math.abs(r + c - 94) <= 3 && d >= 16.5 && d <= 19);
        const isBotRamp = (r >= 84 && r <= 88 && c >= 16 && c <= 19);
        if (!isTopRamp && !isMidRamp && !isBotRamp) {
          setCell(r, c, TILE_TYPES.UNPASSABLE);
        }
      }
    }
  }

  // Dire Base (Top-Right: 0, 94)
  for (let r = 0; r <= 22; r++) {
    for (let c = 72; c < GRID_SIZE; c++) {
      const d = Math.hypot(r, c - 94);
      if (d <= 17) {
        setCell(r, c, TILE_TYPES.HIGHGROUND);
      }
      if (d <= 6) {
        setCell(r, c, TILE_TYPES.FOUNTAIN);
      }
      // Outer cliff border with 3 ramps
      if (d > 17 && d <= 18.5) {
        const isTopRamp = (r >= 6 && r <= 10 && c >= 75 && c <= 78);
        const isMidRamp = (Math.abs(r + c - 94) <= 3 && d >= 16.5 && d <= 19);
        const isBotRamp = (c >= 84 && c <= 88 && r >= 16 && r <= 19);
        if (!isTopRamp && !isMidRamp && !isBotRamp) {
          setCell(r, c, TILE_TYPES.UNPASSABLE);
        }
      }
    }
  }

  // 8. GUARANTEE THE 3 LANES ARE COMPLETELY OPEN, CLEAR GROUND
  // Top Lane
  for (let r = 6; r <= 80; r++) {
    for (let c = 6; c <= 10; c++) setCell(r, c, TILE_TYPES.GROUND);
  }
  for (let c = 6; c <= 80; c++) {
    for (let r = 6; r <= 10; r++) setCell(r, c, TILE_TYPES.GROUND);
  }
  // Bot Lane
  for (let c = 16; c <= 88; c++) {
    for (let r = 84; r <= 88; r++) setCell(r, c, TILE_TYPES.GROUND);
  }
  for (let r = 16; r <= 88; r++) {
    for (let c = 84; c <= 88; c++) setCell(r, c, TILE_TYPES.GROUND);
  }
  // Mid Lane
  for (let r = 14; r <= 80; r++) {
    for (let c = 14; c <= 80; c++) {
      if (Math.abs(r + c - 94) <= 3) {
        // Keep river in center as water
        if (Math.hypot(r - 47, c - 47) <= 2.5) {
          setCell(r, c, TILE_TYPES.WATER);
        } else {
          setCell(r, c, TILE_TYPES.GROUND);
        }
      }
    }
  }

  // 9. STONE BRIDGES OVER RIVER
  // Top Lane Stone Bridge
  for (let r = 6; r <= 10; r++) {
    for (let c = 27; c <= 31; c++) {
      setCell(r, c, TILE_TYPES.GROUND);
    }
  }
  // Bot Lane Stone Bridge
  for (let r = 64; r <= 68; r++) {
    for (let c = 84; c <= 88; c++) {
      setCell(r, c, TILE_TYPES.GROUND);
    }
  }

  return grid;
}
