// Dota 2 95x95 Battlefield Map Data Specification

export const GRID_SIZE = 95; // 95 x 95 = 9,025 cells

// Tower Definitions matching top-down Dota layout
export const TOWERS_DATA = [
  // RADIANT TOWERS
  // Top Lane
  { id: 'rad_t1_top', team: 'radiant', tier: 1, lane: 'top', r: 36, c: 8, name: 'Вышка Radiant T1 (Top)', range: 8, hp: 1800, maxHp: 1800 },
  { id: 'rad_t2_top', team: 'radiant', tier: 2, lane: 'top', r: 56, c: 8, name: 'Вышка Radiant T2 (Top)', range: 8, hp: 2000, maxHp: 2000 },
  { id: 'rad_t3_top', team: 'radiant', tier: 3, lane: 'top', r: 74, c: 8, name: 'Вышка Radiant T3 (Top)', range: 8, hp: 2500, maxHp: 2500 },
  // Mid Lane
  { id: 'rad_t1_mid', team: 'radiant', tier: 1, lane: 'mid', r: 58, c: 36, name: 'Вышка Radiant T1 (Mid)', range: 8, hp: 1800, maxHp: 1800 },
  { id: 'rad_t2_mid', team: 'radiant', tier: 2, lane: 'mid', r: 68, c: 26, name: 'Вышка Radiant T2 (Mid)', range: 8, hp: 2000, maxHp: 2000 },
  { id: 'rad_t3_mid', team: 'radiant', tier: 3, lane: 'mid', r: 76, c: 18, name: 'Вышка Radiant T3 (Mid)', range: 8, hp: 2500, maxHp: 2500 },
  // Bot Lane
  { id: 'rad_t1_bot', team: 'radiant', tier: 1, lane: 'bot', r: 86, c: 60, name: 'Вышка Radiant T1 (Bot)', range: 8, hp: 1800, maxHp: 1800 },
  { id: 'rad_t2_bot', team: 'radiant', tier: 2, lane: 'bot', r: 86, c: 40, name: 'Вышка Radiant T2 (Bot)', range: 8, hp: 2000, maxHp: 2000 },
  { id: 'rad_t3_bot', team: 'radiant', tier: 3, lane: 'bot', r: 86, c: 22, name: 'Вышка Radiant T3 (Bot)', range: 8, hp: 2500, maxHp: 2500 },
  // T4 Throne Towers (Inside Radiant Base)
  { id: 'rad_t4_1', team: 'radiant', tier: 4, lane: 'base', r: 82, c: 10, name: 'Вышка Трона T4 (Верхняя)', range: 8, hp: 2600, maxHp: 2600 },
  { id: 'rad_t4_2', team: 'radiant', tier: 4, lane: 'base', r: 84, c: 12, name: 'Вышка Трона T4 (Нижняя)', range: 8, hp: 2600, maxHp: 2600 },

  // DIRE TOWERS
  // Top Lane
  { id: 'dire_t1_top', team: 'dire', tier: 1, lane: 'top', r: 8, c: 36, name: 'Вышка Dire T1 (Top)', range: 8, hp: 1800, maxHp: 1800 },
  { id: 'dire_t2_top', team: 'dire', tier: 2, lane: 'top', r: 8, c: 56, name: 'Вышка Dire T2 (Top)', range: 8, hp: 2000, maxHp: 2000 },
  { id: 'dire_t3_top', team: 'dire', tier: 3, lane: 'top', r: 8, c: 74, name: 'Вышка Dire T3 (Top)', range: 8, hp: 2500, maxHp: 2500 },
  // Mid Lane
  { id: 'dire_t1_mid', team: 'dire', tier: 1, lane: 'mid', r: 36, c: 58, name: 'Вышка Dire T1 (Mid)', range: 8, hp: 1800, maxHp: 1800 },
  { id: 'dire_t2_mid', team: 'dire', tier: 2, lane: 'mid', r: 26, c: 68, name: 'Вышка Dire T2 (Mid)', range: 8, hp: 2000, maxHp: 2000 },
  { id: 'dire_t3_mid', team: 'dire', tier: 3, lane: 'mid', r: 18, c: 76, name: 'Вышка Dire T3 (Mid)', range: 8, hp: 2500, maxHp: 2500 },
  // Bot Lane
  { id: 'dire_t1_bot', team: 'dire', tier: 1, lane: 'bot', r: 58, c: 86, name: 'Вышка Dire T1 (Bot)', range: 8, hp: 1800, maxHp: 1800 },
  { id: 'dire_t2_bot', team: 'dire', tier: 2, lane: 'bot', r: 38, c: 86, name: 'Вышка Dire T2 (Bot)', range: 8, hp: 2000, maxHp: 2000 },
  { id: 'dire_t3_bot', team: 'dire', tier: 3, lane: 'bot', r: 20, c: 86, name: 'Вышка Dire T3 (Bot)', range: 8, hp: 2500, maxHp: 2500 },
  // T4 Throne Towers (Inside Dire Base)
  { id: 'dire_t4_1', team: 'dire', tier: 4, lane: 'base', r: 10, c: 82, name: 'Вышка Трона T4 (Левая)', range: 8, hp: 2600, maxHp: 2600 },
  { id: 'dire_t4_2', team: 'dire', tier: 4, lane: 'base', r: 12, c: 84, name: 'Вышка Трона T4 (Правая)', range: 8, hp: 2600, maxHp: 2600 },
];

// Creep Camps (Neutral Creep Spawns & Roshan)
export const CREEP_CAMPS_DATA = [
  // Radiant Jungle
  { id: 'rad_small', team: 'radiant', type: 'small', r: 76, c: 28, name: 'Малый лагерь (Кобольды)', color: '#34d399' },
  { id: 'rad_med_1', team: 'radiant', type: 'medium', r: 78, c: 46, name: 'Средний лагерь (Волки/Кентавры)', color: '#60a5fa' },
  { id: 'rad_med_2', team: 'radiant', type: 'medium', r: 64, c: 22, name: 'Средний лагерь (Огры)', color: '#60a5fa' },
  { id: 'rad_hard_1', team: 'radiant', type: 'hard', r: 52, c: 16, name: 'Большой лагерь (Урсы/Сатиры)', color: '#f59e0b' },
  { id: 'rad_hard_2', team: 'radiant', type: 'hard', r: 68, c: 38, name: 'Большой лагерь (Тролли)', color: '#f59e0b' },
  { id: 'rad_ancient', team: 'radiant', type: 'ancient', r: 58, c: 46, name: 'Древние крипы (Драконы/Големы)', color: '#ec4899' },

  // Dire Jungle
  { id: 'dire_small', team: 'dire', type: 'small', r: 18, c: 66, name: 'Малый лагерь (Гноллы)', color: '#f87171' },
  { id: 'dire_med_1', team: 'dire', type: 'medium', r: 16, c: 48, name: 'Средний лагерь (Гарпии)', color: '#60a5fa' },
  { id: 'dire_med_2', team: 'dire', type: 'medium', r: 28, c: 72, name: 'Средний лагерь (Волки)', color: '#60a5fa' },
  { id: 'dire_hard_1', team: 'dire', type: 'hard', r: 36, c: 78, name: 'Большой лагерь (Сатиры)', color: '#f59e0b' },
  { id: 'dire_hard_2', team: 'dire', type: 'hard', r: 24, c: 54, name: 'Большой лагерь (Урсы)', color: '#f59e0b' },
  { id: 'dire_ancient', team: 'dire', type: 'ancient', r: 36, c: 48, name: 'Древние крипы (Черные драконы)', color: '#ec4899' },

  // Roshan Pit (North of River Mid at r=24, c=42)
  { id: 'roshan_pit', team: 'neutral', type: 'roshan', r: 24, c: 42, name: 'Логово Рошана (Aegis of the Immortal)', color: '#ef4444' }
];

// Runes (Power & Bounty in River)
export const RUNES_DATA = [
  { id: 'rune_top', r: 32, c: 38, type: 'water', name: 'Руна Воды / Двойной Урон' },
  { id: 'rune_bot', r: 58, c: 56, type: 'bounty', name: 'Руна Богатства / Хаст' }
];

// Base Ancients & Fountains
export const BASES_DATA = {
  radiant: {
    fountain: { r: 88, c: 6, name: 'Фонтан Radiant' },
    ancient: { r: 85, c: 9, name: 'Древо Жизни (Ancient Radiant)', hp: 4500, maxHp: 4500 }
  },
  dire: {
    fountain: { r: 6, c: 88, name: 'Фонтан Dire' },
    ancient: { r: 9, c: 85, name: 'Ледяной Трон (Ancient Dire)', hp: 4500, maxHp: 4500 }
  }
};

// Key Locations for Quick Navigation
export const LANDMARKS = [
  { name: 'База Radiant', r: 85, c: 9, color: '#34d399' },
  { name: 'База Dire', r: 9, c: 85, color: '#f87171' },
  { name: 'Top Линия', r: 8, c: 20, color: '#60a5fa' },
  { name: 'Mid Линия', r: 47, c: 47, color: '#facc15' },
  { name: 'Bot Линия', r: 86, c: 70, color: '#f43f5e' },
  { name: 'Река (River)', r: 47, c: 47, color: '#38bdf8' },
  { name: 'Логово Рошана', r: 24, c: 42, color: '#ef4444' }
];

// Initial Heroes Placement on 95x95
export const INITIAL_HEROES_95 = [
  // Radiant Heroes
  {
    id: 'gojo',
    name: 'Satoru Gojo',
    avatar: '/avatars/gojo_avatar.png',
    team: 'radiant',
    r: 51,
    c: 43,
    hp: 100,
    maxHp: 100,
    mana: 120,
    maxMana: 120,
    speed: 6,
    range: 2,
    role: 'Маг / Контроль'
  },
  {
    id: 'invoker',
    name: 'Invoker',
    avatar: '/avatars/invoker_avatar.png',
    team: 'radiant',
    r: 52,
    c: 42,
    hp: 100,
    maxHp: 100,
    mana: 150,
    maxMana: 150,
    speed: 6,
    range: 15,
    role: 'Гранд-Маг (10 заклинаний)'
  },
  {
    id: 'axe',
    name: 'Axe',
    avatar: '/avatars/axe_avatar.png',
    team: 'radiant',
    r: 50,
    c: 42,
    hp: 100,
    maxHp: 100,
    mana: 100,
    maxMana: 100,
    speed: 6,
    range: 2,
    role: 'Танк / Инициатор'
  },
  {
    id: 'pudge',
    name: 'Pudge',
    avatar: '/avatars/pudge_avatar.png',
    team: 'radiant',
    r: 52,
    c: 44,
    hp: 110,
    maxHp: 110,
    mana: 100,
    maxMana: 100,
    speed: 5,
    range: 2,
    role: 'Хукер / Ганкер'
  },
  {
    id: 'rubick',
    name: 'Rubick',
    avatar: '/avatars/rubick_avatar.png',
    team: 'radiant',
    r: 53,
    c: 43,
    hp: 90,
    maxHp: 90,
    mana: 140,
    maxMana: 140,
    speed: 6,
    range: 12,
    role: 'Саппорт / Воровство'
  },

  // Dire Heroes
  {
    id: 'sukuna',
    name: 'Ryomen Sukuna',
    avatar: '/avatars/sukuna_avatar.png',
    team: 'dire',
    r: 46,
    c: 48,
    hp: 100,
    maxHp: 100,
    mana: 120,
    maxMana: 120,
    speed: 6,
    range: 2,
    role: 'Король Проклятий / ДПС'
  },
  {
    id: 'sf',
    name: 'Shadow Fiend',
    avatar: '/avatars/sf_avatar.png',
    team: 'dire',
    r: 45,
    c: 49,
    hp: 90,
    maxHp: 90,
    mana: 130,
    maxMana: 130,
    speed: 6,
    range: 14,
    role: 'Керри / Души'
  },
  {
    id: 'monesy',
    name: 'm0NESY',
    avatar: '/avatars/monesy_avatar.png',
    team: 'dire',
    r: 45,
    c: 47,
    hp: 95,
    maxHp: 95,
    mana: 100,
    maxMana: 100,
    speed: 6,
    range: 20,
    role: 'Снайпер AWP'
  },
  {
    id: 'wesker',
    name: 'Albert Wesker',
    avatar: '/avatars/wesker_avatar.png',
    team: 'dire',
    r: 47,
    c: 49,
    hp: 105,
    maxHp: 105,
    mana: 100,
    maxMana: 100,
    speed: 7,
    range: 8,
    role: 'Уроборос / Скорость'
  },
  {
    id: 'minos',
    name: 'Minos Prime',
    avatar: '/avatars/minos_avatar.png',
    team: 'dire',
    r: 46,
    c: 46,
    hp: 100,
    maxHp: 100,
    mana: 140,
    maxMana: 140,
    speed: 8,
    range: 2,
    role: 'Судия / Бурст'
  }
];
