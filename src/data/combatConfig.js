// Game Combat, Timing, Terrain Advantage, and Creep Configuration
// All parameters are centralized here according to game design specifications

export const TIME_CONFIG = {
  TURN_DURATION_SECONDS: 8,
  ACTION_TIME_COSTS: {
    MOVE: 2.0,    // Strictly 2.0 seconds per MOVE action (not linked to cell count)
    ATTACK: 3.0,  // 3.0 seconds per basic attack
    ABILITY: 4.0, // 4.0 seconds per ability cast
    ITEM: 2.0     // 2.0 seconds per item activation
  },
  MIN_ACTION_TIME_COST: 2.0
};

export const COMBAT_CONFIG = {
  // Damage variance: rolledDamage = averageDamage * random(0.75, 1.25)
  ROLL_DAMAGE_MIN: 0.75,
  ROLL_DAMAGE_MAX: 1.25,

  // Critical Strike: 5% chance, 200% damage multiplier
  CRITICAL_CHANCE: 0.05,
  CRITICAL_MULTIPLIER: 2.0
};

export const TERRAIN_CONFIG = {
  // High Ground rules:
  // 1. Low Ground attacking High Ground:
  //    - Ranged attacks suffer 30% miss chance
  //    - Melee attacks do NOT suffer miss chance uphill
  LOW_TO_HIGH_RANGED_MISS_CHANCE: 0.30,
  LOW_TO_HIGH_MELEE_MISS_CHANCE: 0.0,

  // 2. High Ground attacking Low Ground:
  //    - Superior vantage grant +15% hit chance bonus
  //    - Zero uphill miss penalty
  HIGH_TO_LOW_HIT_BONUS: 0.15,
  HIGH_TO_LOW_MISS_CHANCE: 0.0
};

export const CREEP_CONFIG = {
  // Lane Creeps Timing
  LANE_FIRST_SPAWN_SECONDS: 60,
  LANE_SPAWN_INTERVAL_SECONDS: 60,

  // Lane Formation Cycle:
  // 1: 1 ranged + 4 melee
  // 2: 2 ranged + 3 melee
  // 3: 2 ranged + 5 melee
  // 4: 4 ranged + 5 melee (then repeats)
  LANE_FORMATION_CYCLE: [
    { ranged: 1, melee: 4 },
    { ranged: 2, melee: 3 },
    { ranged: 2, melee: 5 },
    { ranged: 4, melee: 5 }
  ],

  // Neutral Creeps Timing
  NEUTRAL_FIRST_SPAWN_SECONDS: 120,
  NEUTRAL_SPAWN_INTERVAL_SECONDS: 60,
  NEUTRAL_CAMP_SPAWN_RADIUS: 2.5, // Camp radius checked for occupancy

  // Approved Formations and Levels from Game Design (mapped per camp ID / type)
  APPROVED_NEUTRAL_FORMATIONS: {
    // Level 1: Small Camps
    rad_small: {
      tier: 1,
      tierName: 'Малый лагерь (Кобольды)',
      units: [
        { type: 'kobold_foreman', name: 'Кобольд-десятник', count: 1, hp: 140, avgDmg: 16, armor: 2, hit: 14, agi: 10 },
        { type: 'kobold', name: 'Кобольд', count: 3, hp: 70, avgDmg: 12, armor: 1, hit: 12, agi: 8 }
      ]
    },
    dire_small: {
      tier: 1,
      tierName: 'Малый лагерь (Гноллы)',
      units: [
        { type: 'gnoll_assassin', name: 'Гнолл-убийца', count: 3, hp: 90, avgDmg: 18, armor: 2, hit: 15, agi: 12 }
      ]
    },

    // Level 2: Medium Camps
    rad_med_1: {
      tier: 2,
      tierName: 'Средний лагерь (Кентавры)',
      units: [
        { type: 'centaur_khan', name: 'Кентавр-хан', count: 1, hp: 220, avgDmg: 34, armor: 5, hit: 16, agi: 10 },
        { type: 'centaur_runner', name: 'Кентавр-следопыт', count: 1, hp: 160, avgDmg: 24, armor: 4, hit: 14, agi: 10 }
      ]
    },
    rad_med_2: {
      tier: 2,
      tierName: 'Средний лагерь (Огры)',
      units: [
        { type: 'ogre_bruiser', name: 'Огр-громила', count: 1, hp: 240, avgDmg: 36, armor: 5, hit: 15, agi: 6 },
        { type: 'ogre_magi', name: 'Огр-маг', count: 1, hp: 180, avgDmg: 26, armor: 3, hit: 14, agi: 8 }
      ]
    },
    dire_med_1: {
      tier: 2,
      tierName: 'Средний лагерь (Гарпии)',
      units: [
        { type: 'harpy_stormcrafter', name: 'Гарпия-буревестник', count: 1, hp: 180, avgDmg: 30, armor: 3, hit: 16, agi: 14 },
        { type: 'harpy_scout', name: 'Гарпия-разведчица', count: 2, hp: 120, avgDmg: 20, armor: 2, hit: 14, agi: 12 }
      ]
    },
    dire_med_2: {
      tier: 2,
      tierName: 'Средний лагерь (Волки)',
      units: [
        { type: 'alpha_wolf', name: 'Вожак волков', count: 1, hp: 200, avgDmg: 32, armor: 4, hit: 16, agi: 14 },
        { type: 'wolf', name: 'Лютый волк', count: 2, hp: 140, avgDmg: 22, armor: 3, hit: 14, agi: 12 }
      ]
    },

    // Level 3: Hard Camps
    rad_hard_1: {
      tier: 3,
      tierName: 'Большой лагерь (Урсы/Медведи)',
      units: [
        { type: 'hellbear_smasher', name: 'Совух-крушитель', count: 1, hp: 320, avgDmg: 48, armor: 6, hit: 18, agi: 12 },
        { type: 'hellbear', name: 'Совух', count: 1, hp: 240, avgDmg: 38, armor: 5, hit: 16, agi: 10 }
      ]
    },
    rad_hard_2: {
      tier: 3,
      tierName: 'Большой лагерь (Тролли)',
      units: [
        { type: 'dark_troll_warlord', name: 'Тёмный тролль-вождь', count: 1, hp: 310, avgDmg: 45, armor: 5, hit: 18, agi: 12 },
        { type: 'dark_troll', name: 'Тёмный тролль', count: 2, hp: 170, avgDmg: 26, armor: 3, hit: 15, agi: 10 }
      ]
    },
    dire_hard_1: {
      tier: 3,
      tierName: 'Большой лагерь (Сатиры)',
      units: [
        { type: 'satyr_tormentor', name: 'Сатир-мучитель', count: 1, hp: 300, avgDmg: 46, armor: 6, hit: 18, agi: 12 },
        { type: 'satyr_trickster', name: 'Сатир-плут', count: 2, hp: 160, avgDmg: 24, armor: 4, hit: 15, agi: 14 }
      ]
    },
    dire_hard_2: {
      tier: 3,
      tierName: 'Большой лагерь (Урсы)',
      units: [
        { type: 'hellbear_smasher', name: 'Совух-крушитель', count: 1, hp: 320, avgDmg: 48, armor: 6, hit: 18, agi: 12 },
        { type: 'hellbear', name: 'Совух', count: 1, hp: 240, avgDmg: 38, armor: 5, hit: 16, agi: 10 }
      ]
    },

    // Level 4: Ancient Camps
    rad_ancient: {
      tier: 4,
      tierName: 'Древние крипы (Каменные големы)',
      units: [
        { type: 'granite_golem', name: 'Гранитный голем', count: 1, hp: 600, avgDmg: 78, armor: 12, hit: 20, agi: 8 },
        { type: 'rock_golem', name: 'Каменный голем', count: 2, hp: 300, avgDmg: 46, armor: 9, hit: 17, agi: 8 }
      ]
    },
    dire_ancient: {
      tier: 4,
      tierName: 'Древние крипы (Чёрные драконы)',
      units: [
        { type: 'black_dragon', name: 'Чёрный дракон', count: 1, hp: 550, avgDmg: 72, armor: 10, hit: 22, agi: 14 },
        { type: 'black_drake', name: 'Чёрный дракончик', count: 2, hp: 280, avgDmg: 42, armor: 7, hit: 18, agi: 12 }
      ]
    }
  }
};
