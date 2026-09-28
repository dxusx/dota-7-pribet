// Game Combat & Simulation Configuration
// All gameplay parameters are centralized here - NOT hardcoded in UI or logic

export const TIME_CONFIG = {
  TURN_DURATION_SECONDS: 8,
  ACTION_TIME_COSTS: {
    MOVE: 2.0,    // 2.0 seconds per movement action
    ATTACK: 3.0,  // 3.0 seconds per basic attack
    ABILITY: 4.0, // 4.0 seconds per standard ability cast
    ITEM: 2.0     // 2.0 seconds per item activation
  },
  MIN_ACTION_TIME_COST: 2.0 // Minimum time required to perform any basic action
};

export const COMBAT_CONFIG = {
  // Damage variance: rolledDamage = averageDamage * random(0.75, 1.25)
  ROLL_DAMAGE_MIN: 0.75,
  ROLL_DAMAGE_MAX: 1.25,

  // Critical Strike: 5% chance, 200% damage multiplier
  CRITICAL_CHANCE: 0.05,
  CRITICAL_MULTIPLIER: 2.0,

  // High Ground miss modifier: low-ground attacking high-ground has 30% miss chance
  HIGH_GROUND_MISS_CHANCE: 0.30
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

  // Neutral Formation Templates (Randomly selected per camp type)
  NEUTRAL_FORMATION_TEMPLATES: {
    small: [
      { name: 'Лагерь кобольдов', units: [{ type: 'kobold_foreman', name: 'Кобольд-десятник', count: 1, hp: 50, avgDmg: 16, armor: 2, hit: 12, agi: 10 }, { type: 'kobold', name: 'Кобольд', count: 3, hp: 35, avgDmg: 12, armor: 1, hit: 10, agi: 8 }] },
      { name: 'Лагерь гноллов', units: [{ type: 'gnoll_assassin', name: 'Гнолл-убийца', count: 3, hp: 45, avgDmg: 18, armor: 2, hit: 14, agi: 12 }] }
    ],
    medium: [
      { name: 'Волчья стая', units: [{ type: 'alpha_wolf', name: 'Вожак волков', count: 1, hp: 90, avgDmg: 32, armor: 4, hit: 16, agi: 14 }, { type: 'wolf', name: 'Лютый волк', count: 2, hp: 60, avgDmg: 22, armor: 3, hit: 14, agi: 12 }] },
      { name: 'Лагерь огров', units: [{ type: 'ogre_bruiser', name: 'Огр-громила', count: 1, hp: 120, avgDmg: 36, armor: 5, hit: 14, agi: 6 }, { type: 'ogre_magi', name: 'Огр-маг', count: 1, hp: 85, avgDmg: 24, armor: 3, hit: 14, agi: 8 }] },
      { name: 'Лагерь кентавров', units: [{ type: 'centaur_khan', name: 'Кентавр-хан', count: 1, hp: 110, avgDmg: 34, armor: 5, hit: 15, agi: 8 }, { type: 'centaur_runner', name: 'Кентавр-следопыт', count: 1, hp: 75, avgDmg: 22, armor: 4, hit: 13, agi: 10 }] }
    ],
    hard: [
      { name: 'Берлога медведей', units: [{ type: 'hellbear_smasher', name: 'Совух-крушитель', count: 1, hp: 160, avgDmg: 48, armor: 6, hit: 18, agi: 10 }, { type: 'hellbear', name: 'Совух', count: 1, hp: 120, avgDmg: 38, armor: 5, hit: 16, agi: 10 }] },
      { name: 'Лагерь сатиров', units: [{ type: 'satyr_tormentor', name: 'Сатир-мучитель', count: 1, hp: 150, avgDmg: 46, armor: 6, hit: 18, agi: 12 }, { type: 'satyr_trickster', name: 'Сатир-плут', count: 2, hp: 70, avgDmg: 24, armor: 3, hit: 15, agi: 14 }] },
      { name: 'Лагерь троллей', units: [{ type: 'dark_troll_warlord', name: 'Тёмный тролль-вождь', count: 1, hp: 155, avgDmg: 45, armor: 5, hit: 18, agi: 12 }, { type: 'dark_troll', name: 'Тёмный тролль', count: 2, hp: 75, avgDmg: 26, armor: 3, hit: 14, agi: 10 }] }
    ],
    ancient: [
      { name: 'Драконье логово', units: [{ type: 'black_dragon', name: 'Чёрный дракон', count: 1, hp: 280, avgDmg: 72, armor: 10, hit: 22, agi: 14 }, { type: 'black_drake', name: 'Чёрный дракончик', count: 2, hp: 140, avgDmg: 42, armor: 7, hit: 18, agi: 12 }] },
      { name: 'Каменные големы', units: [{ type: 'granite_golem', name: 'Гранитный голем', count: 1, hp: 320, avgDmg: 78, armor: 12, hit: 20, agi: 6 }, { type: 'rock_golem', name: 'Каменный голем', count: 2, hp: 160, avgDmg: 46, armor: 9, hit: 17, agi: 6 }] }
    ]
  }
};
