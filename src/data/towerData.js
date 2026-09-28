// Data-driven Tower & Ancient (Throne) Configurations
// Specifications match exact approved game design numbers

export const TOWER_COMMON_SPECS = {
  size: { width: 2, height: 2 },
  immobile: true,
  vision: 11,
  attackPeriod: 4 // seconds
};

export const TOWER_TIER_CONFIGS = {
  // T1: 1000 HP / 50 armor / 11 vision / 30 damage / 60 crit / 10 range / 20 penetration / 15 hit / 4 sec
  1: {
    tier: 1,
    name: 'Башня T1',
    hp: 1000,
    maxHp: 1000,
    armor: 50,
    vision: 11,
    averageDamage: 30,
    critDamage: 60,
    range: 10,
    penetration: 20,
    hit: 15,
    attackPeriod: 4,
    size: { width: 2, height: 2 },
    immobile: true
  },

  // T2: 1500 / 75 / 11 / 60 / 120 / 10 / 40 / 30 / 4 sec
  2: {
    tier: 2,
    name: 'Башня T2',
    hp: 1500,
    maxHp: 1500,
    armor: 75,
    vision: 11,
    averageDamage: 60,
    critDamage: 120,
    range: 10,
    penetration: 40,
    hit: 30,
    attackPeriod: 4,
    size: { width: 2, height: 2 },
    immobile: true
  },

  // T3: 2000 / 75 / 11 / 90 / 180 / 10 / 60 / 45 / 4 sec
  3: {
    tier: 3,
    name: 'Башня T3',
    hp: 2000,
    maxHp: 2000,
    armor: 75,
    vision: 11,
    averageDamage: 90,
    critDamage: 180,
    range: 10,
    penetration: 60,
    hit: 45,
    attackPeriod: 4,
    size: { width: 2, height: 2 },
    immobile: true
  },

  // T4: 2500 / 75 / 11 / 90 / 180 / 10 / 60 / 45 / 4 sec
  4: {
    tier: 4,
    name: 'Башня Трона T4',
    hp: 2500,
    maxHp: 2500,
    armor: 75,
    vision: 11,
    averageDamage: 90,
    critDamage: 180,
    range: 10,
    penetration: 60,
    hit: 45,
    attackPeriod: 4,
    size: { width: 2, height: 2 },
    immobile: true
  },

  // Throne: 3000 HP / 50 armor
  throne: {
    tier: 'throne',
    name: 'Древний Трон',
    hp: 3000,
    maxHp: 3000,
    armor: 50,
    vision: 11,
    averageDamage: 120,
    critDamage: 240,
    range: 10,
    penetration: 60,
    hit: 45,
    attackPeriod: 4,
    size: { width: 2, height: 2 },
    immobile: true
  }
};

// Tower Placements on the 95x95 Dota Map
export const TOWER_PLACEMENTS = [
  // RADIANT TOWERS
  // Top Lane
  { id: 'rad_t1_top', team: 'radiant', tier: 1, lane: 'top', r: 36, c: 8, name: 'Вышка Radiant T1 (Top)' },
  { id: 'rad_t2_top', team: 'radiant', tier: 2, lane: 'top', r: 56, c: 8, name: 'Вышка Radiant T2 (Top)' },
  { id: 'rad_t3_top', team: 'radiant', tier: 3, lane: 'top', r: 74, c: 8, name: 'Вышка Radiant T3 (Top)' },
  // Mid Lane
  { id: 'rad_t1_mid', team: 'radiant', tier: 1, lane: 'mid', r: 58, c: 36, name: 'Вышка Radiant T1 (Mid)' },
  { id: 'rad_t2_mid', team: 'radiant', tier: 2, lane: 'mid', r: 68, c: 26, name: 'Вышка Radiant T2 (Mid)' },
  { id: 'rad_t3_mid', team: 'radiant', tier: 3, lane: 'mid', r: 76, c: 18, name: 'Вышка Radiant T3 (Mid)' },
  // Bot Lane
  { id: 'rad_t1_bot', team: 'radiant', tier: 1, lane: 'bot', r: 86, c: 60, name: 'Вышка Radiant T1 (Bot)' },
  { id: 'rad_t2_bot', team: 'radiant', tier: 2, lane: 'bot', r: 86, c: 40, name: 'Вышка Radiant T2 (Bot)' },
  { id: 'rad_t3_bot', team: 'radiant', tier: 3, lane: 'bot', r: 86, c: 22, name: 'Вышка Radiant T3 (Bot)' },
  // T4 Throne Towers
  { id: 'rad_t4_1', team: 'radiant', tier: 4, lane: 'base', r: 82, c: 10, name: 'Вышка Трона Radiant T4-1' },
  { id: 'rad_t4_2', team: 'radiant', tier: 4, lane: 'base', r: 84, c: 12, name: 'Вышка Трона Radiant T4-2' },

  // DIRE TOWERS
  // Top Lane
  { id: 'dire_t1_top', team: 'dire', tier: 1, lane: 'top', r: 8, c: 36, name: 'Вышка Dire T1 (Top)' },
  { id: 'dire_t2_top', team: 'dire', tier: 2, lane: 'top', r: 8, c: 56, name: 'Вышка Dire T2 (Top)' },
  { id: 'dire_t3_top', team: 'dire', tier: 3, lane: 'top', r: 8, c: 74, name: 'Вышка Dire T3 (Top)' },
  // Mid Lane
  { id: 'dire_t1_mid', team: 'dire', tier: 1, lane: 'mid', r: 36, c: 58, name: 'Вышка Dire T1 (Mid)' },
  { id: 'dire_t2_mid', team: 'dire', tier: 2, lane: 'mid', r: 26, c: 68, name: 'Вышка Dire T2 (Mid)' },
  { id: 'dire_t3_mid', team: 'dire', tier: 3, lane: 'mid', r: 18, c: 76, name: 'Вышка Dire T3 (Mid)' },
  // Bot Lane
  { id: 'dire_t1_bot', team: 'dire', tier: 1, lane: 'bot', r: 58, c: 86, name: 'Вышка Dire T1 (Bot)' },
  { id: 'dire_t2_bot', team: 'dire', tier: 2, lane: 'bot', r: 38, c: 86, name: 'Вышка Dire T2 (Bot)' },
  { id: 'dire_t3_bot', team: 'dire', tier: 3, lane: 'bot', r: 20, c: 86, name: 'Вышка Dire T3 (Bot)' },
  // T4 Throne Towers
  { id: 'dire_t4_1', team: 'dire', tier: 4, lane: 'base', r: 10, c: 82, name: 'Вышка Трона Dire T4-1' },
  { id: 'dire_t4_2', team: 'dire', tier: 4, lane: 'base', r: 12, c: 84, name: 'Вышка Трона Dire T4-2' }
];

// Helper to generate initial towers with nextAttackTime tracking for continuous time system
export function generateInitialTowers() {
  return TOWER_PLACEMENTS.map(placement => {
    const config = TOWER_TIER_CONFIGS[placement.tier] || TOWER_TIER_CONFIGS[1];
    return {
      ...config,
      ...placement,
      currentHp: config.hp,
      isDead: false,
      nextAttackTime: config.attackPeriod // First attack ready after 4 seconds of game time
    };
  });
}

// Ancients / Thrones
export const ANCIENTS_CONFIG = {
  radiant: {
    id: 'rad_ancient_throne',
    team: 'radiant',
    name: 'Древо Жизни (Ancient Radiant)',
    r: 85,
    c: 9,
    ...TOWER_TIER_CONFIGS.throne,
    nextAttackTime: 4
  },
  dire: {
    id: 'dire_ancient_throne',
    team: 'dire',
    name: 'Ледяной Трон (Ancient Dire)',
    r: 9,
    c: 85,
    ...TOWER_TIER_CONFIGS.throne,
    nextAttackTime: 4
  }
};
