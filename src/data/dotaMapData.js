// 20x20 2D Dota 2 Map Grid Definition
export const MAP_SIZE = 20;

export function generateDotaMap() {
  const grid = [];

  for (let r = 0; r < MAP_SIZE; r++) {
    const row = [];
    for (let c = 0; c < MAP_SIZE; c++) {
      let type = 'grass';

      // 1. Radiant vs Dire Half (diagonal split)
      if (r + c < 18) {
        type = 'dire'; // Top-Right half is Dire
      } else {
        type = 'grass'; // Bottom-Left half is Radiant
      }

      // 2. River Diagonal (crossing from (0, 10) to (19, 9))
      const riverCenter = 19 - Math.floor((r + c) / 2);
      if (Math.abs(r - c) <= 1 && r >= 3 && r <= 16) {
        type = 'river';
      }

      // 3. Middle Lane (Diagonal from (18, 1) to (1, 18))
      if (Math.abs(r + c - 19) <= 1) {
        type = (type === 'river') ? 'river' : 'lane';
      }

      // 4. Top Lane (From (18, 1) -> (2, 1) -> (1, 18))
      if ((c <= 2 && r >= 2 && r <= 18) || (r <= 2 && c >= 2 && c <= 18)) {
        type = 'lane';
      }

      // 5. Bot Lane (From (18, 1) -> (18, 18) -> (1, 18))
      if ((r >= 17 && c >= 1 && c <= 18) || (c >= 17 && r >= 1 && r <= 18)) {
        type = 'lane';
      }

      // 6. Trees in Jungles (Obstacles)
      // Radiant Jungle
      if (r >= 12 && r <= 16 && c >= 4 && c <= 8 && type === 'grass' && (r + c) % 2 === 0) {
        type = 'tree';
      }
      if (r >= 8 && r <= 11 && c >= 11 && c <= 15 && type === 'dire' && (r * c) % 3 === 0) {
        type = 'tree';
      }

      // 7. Roshan Pit
      if (r === 7 && c === 7) {
        type = 'roshan';
      }

      // 8. Runes in River
      if ((r === 5 && c === 5) || (r === 14 && c === 14)) {
        type = 'rune';
      }

      // 9. Ancients and Fountains
      if (r === 18 && c === 1) type = 'fountain_radiant';
      if (r === 17 && c === 2) type = 'ancient_radiant';
      if (r === 1 && c === 18) type = 'fountain_dire';
      if (r === 2 && c === 17) type = 'ancient_dire';

      // 10. Key Towers
      // Radiant Towers
      if (r === 14 && c === 5) type = 'tower_radiant'; // Mid T1
      if (r === 10 && c === 1) type = 'tower_radiant'; // Top T1
      if (r === 18 && c === 10) type = 'tower_radiant'; // Bot T1

      // Dire Towers
      if (r === 5 && c === 14) type = 'tower_dire'; // Mid T1
      if (r === 1 && c === 10) type = 'tower_dire'; // Top T1
      if (r === 10 && c === 18) type = 'tower_dire'; // Bot T1

      row.push({
        r,
        c,
        type,
        highlight: null // 'move' | 'attack' | 'skill' | 'target'
      });
    }
    grid.push(row);
  }

  return grid;
}

export const INITIAL_HERO_POSITIONS = [
  // Radiant Team (5 Heroes)
  { heroId: 'axe', r: 14, c: 4, team: 'radiant', hpRatio: 1, manaRatio: 1 },
  { heroId: 'pudge', r: 15, c: 6, team: 'radiant', hpRatio: 1, manaRatio: 1 },
  { heroId: 'rubick', r: 16, c: 3, team: 'radiant', hpRatio: 1, manaRatio: 1 },
  { heroId: 'invoker', r: 13, c: 5, team: 'radiant', hpRatio: 1, manaRatio: 1 },
  { heroId: 'gojo', r: 12, c: 7, team: 'radiant', hpRatio: 1, manaRatio: 1 },
  // Dire Team (5 Heroes)
  { heroId: 'shadow_fiend', r: 7, c: 13, team: 'dire', hpRatio: 1, manaRatio: 1 },
  { heroId: 'monesy', r: 4, c: 14, team: 'dire', hpRatio: 1, manaRatio: 1 },
  { heroId: 'wesker', r: 6, c: 15, team: 'dire', hpRatio: 1, manaRatio: 1 },
  { heroId: 'minos', r: 5, c: 12, team: 'dire', hpRatio: 1, manaRatio: 1 },
  { heroId: 'sukuna', r: 8, c: 10, team: 'dire', hpRatio: 1, manaRatio: 1 },
];
