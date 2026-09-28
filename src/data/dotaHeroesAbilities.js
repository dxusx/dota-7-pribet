// Authentic Dota 2 Abilities, Stats, and Items Loadouts for all 10 heroes

export const HERO_ABILITIES_DATA = {
  gojo: {
    title: 'Сильнейший Маг',
    primaryAttr: 'all', // Universal
    level: 18,
    stats: {
      str: 78,
      strGain: 2.8,
      agi: 74,
      agiGain: 2.6,
      int: 114,
      intGain: 4.2,
      damage: '178 - 186',
      armor: '15.4',
      speed: 340,
      hpRegen: '+18.6',
      mpRegen: '+14.2'
    },
    abilities: [
      {
        id: 'gojo_blue',
        hotkey: 'Q',
        name: 'Синий (Lapse: Blue)',
        desc: 'Притягивает пространство в радиусе 6 клеток, стягивая врагов и нанося 320 маг. урона.',
        icon: '🌀',
        manaCost: 110,
        cooldown: 8,
        level: 4,
        maxLevel: 4
      },
      {
        id: 'gojo_red',
        hotkey: 'W',
        name: 'Красный (Reversal: Red)',
        desc: 'Генерирует мощную отталкивающую волну чистой обратной энергии, отбрасывая цели на 4 клетки.',
        icon: '🔴',
        manaCost: 140,
        cooldown: 12,
        level: 4,
        maxLevel: 4
      },
      {
        id: 'gojo_infinity',
        hotkey: 'E',
        name: 'Бесконечность (Infinity)',
        desc: 'Пассивная способность. Замедляет все приближающиеся вражеские атаки и снаряды на 85%.',
        icon: '♾️',
        manaCost: 0,
        cooldown: 0,
        level: 4,
        maxLevel: 4,
        isPassive: true
      },
      {
        id: 'gojo_purple',
        hotkey: 'R',
        name: 'Фиолетовый (Hollow Purple)',
        desc: 'Слияние Синего и Красного: стирает все на прямой линии длиной 16 клеток. 850 чистого урона.',
        icon: '🟣',
        manaCost: 350,
        cooldown: 75,
        level: 3,
        maxLevel: 3,
        isUltimate: true
      },
      {
        id: 'gojo_domain',
        hotkey: 'D',
        name: 'Необъятная Пустота (Domain)',
        desc: 'Расширение территории: парализует всех противников в радиусе 8 клеток потоком бесконечной информации.',
        icon: '🌌',
        manaCost: 400,
        cooldown: 110,
        level: 1,
        maxLevel: 1
      }
    ],
    items: [
      { id: 'blink', name: 'Blink Dagger', icon: '🗡️', cost: 2250, cd: 15 },
      { id: 'bkb', name: 'Black King Bar', icon: '🛡️', cost: 4050, cd: 90 },
      { id: 'octarine', name: 'Octarine Core', icon: '🔮', cost: 5275, cd: 0 },
      { id: 'refresher', name: 'Refresher Orb', icon: '🔄', cost: 5000, cd: 180 },
      { id: 'hex', name: 'Scythe of Vyse', icon: '🐑', cost: 5675, cd: 20 },
      { id: 'travels', name: 'Boots of Travel II', icon: '👢', cost: 4500, cd: 40 }
    ],
    backpack: [
      { id: 'bottle', name: 'Bottle', icon: '🧴' },
      { id: 'wards', name: 'Observer Ward', icon: '👁️' },
      { id: 'smoke', name: 'Smoke of Deceit', icon: '💨' }
    ],
    neutralItem: { id: 'apex', name: 'Apex', tier: 5, icon: '👑', bonus: '+70 к характеристикам' },
    tpScroll: { id: 'tp', name: 'Town Portal Scroll', count: 2, cd: 80 }
  },

  sukuna: {
    title: 'Король Проклятий',
    primaryAttr: 'str',
    level: 18,
    stats: {
      str: 112,
      strGain: 4.0,
      agi: 80,
      agiGain: 2.8,
      int: 68,
      intGain: 2.2,
      damage: '194 - 208',
      armor: '18.2',
      speed: 345,
      hpRegen: '+22.4',
      mpRegen: '+8.6'
    },
    abilities: [
      {
        id: 'sukuna_dismantle',
        hotkey: 'Q',
        name: 'Демонический Разрез (Dismantle)',
        desc: 'Невидимый рассекающий взмах лезвием, наносящий 280 физ. урона по цели и зданиям.',
        icon: '🗡️',
        manaCost: 80,
        cooldown: 4,
        level: 4,
        maxLevel: 4
      },
      {
        id: 'sukuna_cleave',
        hotkey: 'W',
        name: 'Рассечение (Cleave)',
        desc: 'Адаптируется под прочность цели. Наносит процентный урон от текущего HP жертвы.',
        icon: '⚔️',
        manaCost: 110,
        cooldown: 9,
        level: 4,
        maxLevel: 4
      },
      {
        id: 'sukuna_furnace',
        hotkey: 'E',
        name: 'Пламя: Камино (Furnace)',
        desc: 'Стрела из концентрированного термоядерного огня. Взрывается в радиусе 5 клеток на 550 урона.',
        icon: '🔥',
        manaCost: 180,
        cooldown: 18,
        level: 4,
        maxLevel: 4
      },
      {
        id: 'sukuna_shrine',
        hotkey: 'R',
        name: 'Гробница Зла (Malevolent Shrine)',
        desc: 'Открытая территория радиусом 12 клеток. Непрерывно шинкует все живое тысячами разрезов.',
        icon: '⛩️',
        manaCost: 350,
        cooldown: 80,
        level: 3,
        maxLevel: 3,
        isUltimate: true
      }
    ],
    items: [
      { id: 'daedalus', name: 'Daedalus', icon: '🏹', cost: 5100, cd: 0 },
      { id: 'satanic', name: 'Satanic', icon: '🩸', cost: 5050, cd: 35 },
      { id: 'bkb', name: 'Black King Bar', icon: '🛡️', cost: 4050, cd: 90 },
      { id: 'abyssal', name: 'Abyssal Blade', icon: '🗡️', cost: 6250, cd: 35 },
      { id: 'assault', name: 'Assault Cuirass', icon: '🎽', cost: 5125, cd: 0 },
      { id: 'phase', name: 'Phase Boots', icon: '👢', cost: 1500, cd: 8 }
    ],
    backpack: [
      { id: 'dust', name: 'Dust of Appearance', icon: '✨' },
      { id: 'clarity', name: 'Clarity', icon: '🧪' },
      { id: 'salve', name: 'Healing Salve', icon: '🩹' }
    ],
    neutralItem: { id: 'deso2', name: 'Stygian Desolator', tier: 5, icon: '⚔️', bonus: '+60 урона, -10 брони' },
    tpScroll: { id: 'tp', name: 'Town Portal Scroll', count: 1, cd: 80 }
  },

  invoker: {
    title: 'Гранд-Маг (10 Заклинаний)',
    primaryAttr: 'int',
    level: 18,
    stats: {
      str: 65,
      strGain: 2.4,
      agi: 60,
      agiGain: 2.0,
      int: 120,
      intGain: 4.6,
      damage: '162 - 170',
      armor: '11.8',
      speed: 330,
      hpRegen: '+12.5',
      mpRegen: '+18.4'
    },
    abilities: [
      { id: 'quas', hotkey: 'Q', name: 'Quas (Лед)', desc: 'Сфера льда. Дает регенерацию здоровья и силу льда.', icon: '❄️', manaCost: 0, cooldown: 0, level: 7, maxLevel: 7 },
      { id: 'wex', hotkey: 'W', name: 'Wex (Молния)', desc: 'Сфера молнии. Дает скорость бега и атаки.', icon: '⚡', manaCost: 0, cooldown: 0, level: 7, maxLevel: 7 },
      { id: 'exort', hotkey: 'E', name: 'Exort (Огонь)', desc: 'Сфера огня. Дает огромный бонус к урону заклинаний.', icon: '🔥', manaCost: 0, cooldown: 0, level: 7, maxLevel: 7 },
      { id: 'coldsnap', hotkey: 'Y', name: 'Cold Snap (QQQ)', desc: 'Замораживает противника, нанося периодический урон и оглушая при каждом ударе.', icon: '🧊', manaCost: 100, cooldown: 15, level: 4, maxLevel: 4 },
      { id: 'sunstrike', hotkey: 'D', name: 'Sun Strike (Катаклизм)', desc: 'Глобальный солнечный луч в любую точку карты.', icon: '☀️', manaCost: 175, cooldown: 25, level: 4, maxLevel: 4 },
      { id: 'meteor', hotkey: 'F', name: 'Chaos Meteor', desc: 'Призывает пылающий метеорит с небес.', icon: '☄️', manaCost: 200, cooldown: 45, level: 4, maxLevel: 4 },
      { id: 'invoke', hotkey: 'R', name: 'Invoke', desc: 'Комбинирует сферы для создания одного из 10 заклинаний.', icon: '✨', manaCost: 30, cooldown: 5, level: 4, maxLevel: 4, isUltimate: true }
    ],
    items: [
      { id: 'aghanim', name: "Aghanim's Scepter", icon: '🪄', cost: 4200, cd: 0 },
      { id: 'blink', name: 'Blink Dagger', icon: '🗡️', cost: 2250, cd: 15 },
      { id: 'refresher', name: 'Refresher Orb', icon: '🔄', cost: 5000, cd: 180 },
      { id: 'shiva', name: "Shiva's Guard", icon: '❄️', cost: 5175, cd: 30 },
      { id: 'octarine', name: 'Octarine Core', icon: '🔮', cost: 5275, cd: 0 },
      { id: 'travels', name: 'Boots of Travel', icon: '👢', cost: 2500, cd: 40 }
    ],
    backpack: [],
    neutralItem: { id: 'timeless', name: 'Timeless Relic', tier: 4, icon: '⏳', bonus: '+25% длительности дебаффов' },
    tpScroll: { id: 'tp', name: 'Town Portal Scroll', count: 3, cd: 80 }
  },

  axe: {
    title: 'Могучий Воин',
    primaryAttr: 'str',
    level: 16,
    stats: {
      str: 110,
      strGain: 3.8,
      agi: 70,
      agiGain: 2.2,
      int: 55,
      intGain: 1.6,
      damage: '155 - 165',
      armor: '22.4',
      speed: 335,
      hpRegen: '+25.2',
      mpRegen: '+5.4'
    },
    abilities: [
      { id: 'call', hotkey: 'Q', name: "Berserker's Call", desc: 'Провоцирует всех врагов вокруг атаковать Акса. Дает +30 брони.', icon: '📢', manaCost: 100, cooldown: 12, level: 4, maxLevel: 4 },
      { id: 'hunger', hotkey: 'W', name: 'Battle Hunger', desc: 'Замедляет цель и наносит периодический урон.', icon: '🩸', manaCost: 80, cooldown: 10, level: 4, maxLevel: 4 },
      { id: 'helix', hotkey: 'E', name: 'Counter Helix', desc: 'Пассивно: при получении удара контратакует вертушкой на 200 урона.', icon: '🪓', manaCost: 0, cooldown: 0, level: 4, maxLevel: 4, isPassive: true },
      { id: 'culling', hotkey: 'R', name: 'Culling Blade', desc: 'Мгновенно казнит цель с низким здоровьем.', icon: '💀', manaCost: 150, cooldown: 60, level: 3, maxLevel: 3, isUltimate: true }
    ],
    items: [
      { id: 'blink', name: 'Blink Dagger', icon: '🗡️', cost: 2250, cd: 15 },
      { id: 'blademail', name: 'Blade Mail', icon: '🛡️', cost: 2100, cd: 25 },
      { id: 'vanguard', name: 'Crimson Guard', icon: '🔴', cost: 3600, cd: 40 },
      { id: 'heart', name: 'Heart of Tarrasque', icon: '💚', cost: 5000, cd: 0 },
      { id: 'bkb', name: 'Black King Bar', icon: '🛡️', cost: 4050, cd: 90 },
      { id: 'phase', name: 'Phase Boots', icon: '👢', cost: 1500, cd: 8 }
    ],
    backpack: [],
    neutralItem: { id: 'mirror', name: 'Mirror Shield', tier: 5, icon: '🪞', bonus: 'Отражает заклинания' },
    tpScroll: { id: 'tp', name: 'Town Portal Scroll', count: 1, cd: 80 }
  },

  pudge: {
    title: 'Мясник',
    primaryAttr: 'str',
    level: 16,
    stats: {
      str: 115,
      strGain: 3.9,
      agi: 50,
      agiGain: 1.5,
      int: 60,
      intGain: 1.8,
      damage: '160 - 172',
      armor: '8.4',
      speed: 310,
      hpRegen: '+32.0',
      mpRegen: '+6.2'
    },
    abilities: [
      { id: 'hook', hotkey: 'Q', name: 'Meat Hook', desc: 'Бросает окровавленный крюк на 12 клеток, притягивая жертву.', icon: '🪝', manaCost: 140, cooldown: 11, level: 4, maxLevel: 4 },
      { id: 'rot', hotkey: 'W', name: 'Rot', desc: 'Выпускает облако гнили: замедляет врагов и наносит урон себе и им.', icon: '☣️', manaCost: 0, cooldown: 0, level: 4, maxLevel: 4 },
      { id: 'flesh', hotkey: 'E', name: 'Flesh Heap', desc: 'Пассивно: накапливает силу и сопротивление магии за каждое убийство.', icon: '🥩', manaCost: 0, cooldown: 0, level: 4, maxLevel: 4, isPassive: true },
      { id: 'dismember', hotkey: 'R', name: 'Dismember', desc: 'Заживо пожирает цель, оглушая ее и восстанавливая свое HP.', icon: '🩸', manaCost: 170, cooldown: 24, level: 3, maxLevel: 3, isUltimate: true }
    ],
    items: [
      { id: 'aether', name: 'Aether Lens', icon: '🔭', cost: 2275, cd: 0 },
      { id: 'blink', name: 'Blink Dagger', icon: '🗡️', cost: 2250, cd: 15 },
      { id: 'aghanim', name: "Aghanim's Scepter", icon: '🪄', cost: 4200, cd: 0 },
      { id: 'heart', name: 'Heart of Tarrasque', icon: '💚', cost: 5000, cd: 0 },
      { id: 'shiva', name: "Shiva's Guard", icon: '❄️', cost: 5175, cd: 30 },
      { id: 'tranquil', name: 'Tranquil Boots', icon: '👢', cost: 925, cd: 13 }
    ],
    backpack: [],
    neutralItem: { id: 'giant', name: "Giant's Ring", tier: 5, icon: '💍', bonus: '+60 силы, хождение сквозь скалы' },
    tpScroll: { id: 'tp', name: 'Town Portal Scroll', count: 2, cd: 80 }
  },

  rubick: {
    title: 'Великий Маг',
    primaryAttr: 'int',
    level: 16,
    stats: {
      str: 68,
      strGain: 2.0,
      agi: 65,
      agiGain: 2.2,
      int: 110,
      intGain: 3.7,
      damage: '138 - 148',
      armor: '9.2',
      speed: 330,
      hpRegen: '+11.0',
      mpRegen: '+16.5'
    },
    abilities: [
      { id: 'telekinesis', hotkey: 'Q', name: 'Telekinesis', desc: 'Поднимает врага в воздух и бросает в указанную клетку.', icon: '🖐️', manaCost: 110, cooldown: 16, level: 4, maxLevel: 4 },
      { id: 'fadebolt', hotkey: 'W', name: 'Fade Bolt', desc: 'Цепная магическая молния: снижает урон противников.', icon: '⚡', manaCost: 120, cooldown: 10, level: 4, maxLevel: 4 },
      { id: 'supremacy', hotkey: 'E', name: 'Arcane Supremacy', desc: 'Увеличивает дальность применения заклинаний и их силу.', icon: '✨', manaCost: 0, cooldown: 0, level: 4, maxLevel: 4, isPassive: true },
      { id: 'steal', hotkey: 'R', name: 'Spell Steal', desc: 'Ворует последнее использованное заклинание вражеского героя.', icon: '🎭', manaCost: 25, cooldown: 4, level: 3, maxLevel: 3, isUltimate: true }
    ],
    items: [
      { id: 'blink', name: 'Blink Dagger', icon: '🗡️', cost: 2250, cd: 15 },
      { id: 'aether', name: 'Aether Lens', icon: '🔭', cost: 2275, cd: 0 },
      { id: 'aghanim', name: "Aghanim's Scepter", icon: '🪄', cost: 4200, cd: 0 },
      { id: 'glimmer', name: 'Glimmer Cape', icon: '🧥', cost: 2150, cd: 14 },
      { id: 'force', name: 'Force Staff', icon: '🦯', cost: 2200, cd: 19 },
      { id: 'arcane', name: 'Arcane Boots', icon: '👢', cost: 1300, cd: 55 }
    ],
    backpack: [],
    neutralItem: { id: 'telescope', name: 'Telescope', tier: 4, icon: '🔭', bonus: '+125 дальности заклинаний команде' },
    tpScroll: { id: 'tp', name: 'Town Portal Scroll', count: 2, cd: 80 }
  },

  sf: {
    title: 'Shadow Fiend',
    primaryAttr: 'agi',
    level: 17,
    stats: {
      str: 72,
      strGain: 2.3,
      agi: 108,
      agiGain: 3.6,
      int: 70,
      intGain: 2.2,
      damage: '188 - 198',
      armor: '16.5',
      speed: 340,
      hpRegen: '+14.2',
      mpRegen: '+9.0'
    },
    abilities: [
      { id: 'raze_near', hotkey: 'Q', name: 'Shadowraze (Близко)', desc: 'Темный взрыв перед героем (2 клетки). 350 урона.', icon: '💀', manaCost: 90, cooldown: 9, level: 4, maxLevel: 4 },
      { id: 'raze_mid', hotkey: 'W', name: 'Shadowraze (Средне)', desc: 'Темный взрыв на средней дистанции (5 клеток). 350 урона.', icon: '💀', manaCost: 90, cooldown: 9, level: 4, maxLevel: 4 },
      { id: 'raze_far', hotkey: 'E', name: 'Shadowraze (Далеко)', desc: 'Темный взрыв на дальней дистанции (8 клеток). 350 урона.', icon: '💀', manaCost: 90, cooldown: 9, level: 4, maxLevel: 4 },
      { id: 'requiem', hotkey: 'R', name: 'Requiem of Souls', desc: 'Высвобождает поглощенные души во все стороны. Наносит сокрушительный урон и накладывает страх.', icon: '🌪️', manaCost: 200, cooldown: 90, level: 3, maxLevel: 3, isUltimate: true }
    ],
    items: [
      { id: 'shadow_blade', name: 'Shadow Blade', icon: '🗡️', cost: 3000, cd: 25 },
      { id: 'bkb', name: 'Black King Bar', icon: '🛡️', cost: 4050, cd: 90 },
      { id: 'dragon_lance', name: 'Hurricane Pike', icon: '🏹', cost: 4450, cd: 19 },
      { id: 'butterfly', name: 'Butterfly', icon: '🦋', cost: 4975, cd: 0 },
      { id: 'daedalus', name: 'Daedalus', icon: '🏹', cost: 5100, cd: 0 },
      { id: 'power_treads', name: 'Power Treads', icon: '👢', cost: 1400, cd: 0 }
    ],
    backpack: [],
    neutralItem: { id: 'mind_breaker', name: 'Mind Breaker', tier: 3, icon: '⚔️', bonus: '+25 урона, безмолвие' },
    tpScroll: { id: 'tp', name: 'Town Portal Scroll', count: 1, cd: 80 }
  },

  monesy: {
    title: 'Снайпер AWP',
    primaryAttr: 'agi',
    level: 18,
    stats: {
      str: 65,
      strGain: 2.1,
      agi: 115,
      agiGain: 3.8,
      int: 60,
      intGain: 1.8,
      damage: '210 - 225',
      armor: '14.0',
      speed: 335,
      hpRegen: '+11.5',
      mpRegen: '+7.8'
    },
    abilities: [
      { id: 'awp_shot', hotkey: 'Q', name: 'AWP Wallbang', desc: 'Стреляет бронебойной пулей сквозь скалы и деревья на 20 клеток.', icon: '🎯', manaCost: 90, cooldown: 6, level: 4, maxLevel: 4 },
      { id: 'one_way', hotkey: 'W', name: 'One Way (Ван-Вей)', desc: 'Легендарный снайперский прострел сквозь дым с гарантированным критическим попаданием.', icon: '🎯', manaCost: 110, cooldown: 14, level: 4, maxLevel: 4 },
      { id: 'flashbang', hotkey: 'E', name: 'Flashbang', desc: 'Ослепляет всех в радиусе 6 клеток, накладывая 100% промахов.', icon: '💥', manaCost: 75, cooldown: 12, level: 4, maxLevel: 4 },
      { id: 'smoke_nade', hotkey: 'D', name: 'Smoke Cloud', desc: 'Создает дымовую завесу, делая союзников внутри невидимыми.', icon: '💨', manaCost: 80, cooldown: 18, level: 4, maxLevel: 4 },
      { id: 'clutch_god', hotkey: 'R', name: '1v5 Clutch Master', desc: 'Включает режим бога: 100% криты и мгновенный прыжок.', icon: '🏆', manaCost: 150, cooldown: 65, level: 3, maxLevel: 3, isUltimate: true }
    ],
    items: [
      { id: 'deso', name: 'Desolator', icon: '⚔️', cost: 3500, cd: 0 },
      { id: 'daedalus', name: 'Daedalus', icon: '🏹', cost: 5100, cd: 0 },
      { id: 'bkb', name: 'Black King Bar', icon: '🛡️', cost: 4050, cd: 90 },
      { id: 'silver_edge', name: 'Silver Edge', icon: '🗡️', cost: 5450, cd: 20 },
      { id: 'satanic', name: 'Satanic', icon: '🩸', cost: 5050, cd: 35 },
      { id: 'travels', name: 'Boots of Travel', icon: '👢', cost: 2500, cd: 40 }
    ],
    backpack: [],
    neutralItem: { id: 'ballista', name: 'Ballista', tier: 5, icon: '🏹', bonus: '+250 дальности, отталкивание' },
    tpScroll: { id: 'tp', name: 'Town Portal Scroll', count: 2, cd: 80 }
  },

  wesker: {
    title: 'Уроборос',
    primaryAttr: 'agi',
    level: 18,
    stats: {
      str: 82,
      strGain: 2.9,
      agi: 110,
      agiGain: 3.5,
      int: 75,
      intGain: 2.3,
      damage: '185 - 195',
      armor: '17.2',
      speed: 355,
      hpRegen: '+20.5',
      mpRegen: '+9.4'
    },
    abilities: [
      { id: 'cobra_dash', hotkey: 'Q', name: 'Cobra Strike', desc: 'Мгновенный рывок сквозь пространство со скоростью звука.', icon: '⚡', manaCost: 80, cooldown: 5, level: 4, maxLevel: 4 },
      { id: 'uroboros_lash', hotkey: 'W', name: 'Ouroboros Tendrils', desc: 'Черные щупальца заражения связывают цель на 3 секунды.', icon: '🐙', manaCost: 110, cooldown: 11, level: 4, maxLevel: 4 },
      { id: 'superhuman', hotkey: 'E', name: 'Viral Reflexes', desc: 'Пассивно: 40% шанс уклониться от любой атаки или заклинания.', icon: '🕶️', manaCost: 0, cooldown: 0, level: 4, maxLevel: 4, isPassive: true },
      { id: 'complete_saturation', hotkey: 'R', name: 'Total Global Saturation', desc: 'Выпускает вирус Уроборос на всю карту, нанося урон всем врагам.', icon: '☣️', manaCost: 250, cooldown: 85, level: 3, maxLevel: 3, isUltimate: true }
    ],
    items: [
      { id: 'diffusal', name: 'Disperser', icon: '⚡', cost: 5700, cd: 15 },
      { id: 'manta', name: 'Manta Style', icon: '🗡️', cost: 4600, cd: 30 },
      { id: 'skadi', name: 'Eye of Skadi', icon: '❄️', cost: 5300, cd: 0 },
      { id: 'butterfly', name: 'Butterfly', icon: '🦋', cost: 4975, cd: 0 },
      { id: 'bkb', name: 'Black King Bar', icon: '🛡️', cost: 4050, cd: 90 },
      { id: 'phase', name: 'Phase Boots', icon: '👢', cost: 1500, cd: 8 }
    ],
    backpack: [],
    neutralItem: { id: 'apex', name: 'Apex', tier: 5, icon: '👑', bonus: '+70 характеристик' },
    tpScroll: { id: 'tp', name: 'Town Portal Scroll', count: 1, cd: 80 }
  },

  minos: {
    title: 'Судия Ультракилла',
    primaryAttr: 'all',
    level: 18,
    stats: {
      str: 88,
      strGain: 3.2,
      agi: 95,
      agiGain: 3.3,
      int: 95,
      intGain: 3.3,
      damage: '190 - 200',
      armor: '16.0',
      speed: 360,
      hpRegen: '+24.0',
      mpRegen: '+12.0'
    },
    abilities: [
      { id: 'judgement', hotkey: 'Q', name: 'JUDGEMENT!', desc: 'Мгновенный сокрушительный дроп-кик с неба, вызывающий взрыв 400 урона.', icon: '⚖️', manaCost: 120, cooldown: 6, level: 4, maxLevel: 4 },
      { id: 'thy_end', hotkey: 'W', name: 'THY END IS NOW!', desc: 'Серия из 4 молниеносных ударов кулаками с нокдауном.', icon: '👊', manaCost: 100, cooldown: 9, level: 4, maxLevel: 4 },
      { id: 'prepare', hotkey: 'E', name: 'PREPARE THYSELF!', desc: 'Прыжок змеей вперед с запуском взрывного снаряда чистой души.', icon: '🐍', manaCost: 90, cooldown: 8, level: 4, maxLevel: 4 },
      { id: 'die', hotkey: 'R', name: 'CRUSH! (DIE!)', desc: 'Падает на землю как метеор, разрушая клетки и оглушая на 3 хода.', icon: '💥', manaCost: 280, cooldown: 70, level: 3, maxLevel: 3, isUltimate: true }
    ],
    items: [
      { id: 'abyssal', name: 'Abyssal Blade', icon: '🗡️', cost: 6250, cd: 35 },
      { id: 'daedalus', name: 'Daedalus', icon: '🏹', cost: 5100, cd: 0 },
      { id: 'bkb', name: 'Black King Bar', icon: '🛡️', cost: 4050, cd: 90 },
      { id: 'satanic', name: 'Satanic', icon: '🩸', cost: 5050, cd: 35 },
      { id: 'heart', name: 'Heart of Tarrasque', icon: '💚', cost: 5000, cd: 0 },
      { id: 'travels', name: 'Boots of Travel', icon: '👢', cost: 2500, cd: 40 }
    ],
    backpack: [],
    neutralItem: { id: 'ex_machina', name: 'Ex Machina', tier: 5, icon: '⚙️', bonus: '+25 брони, сброс перезарядок' },
    tpScroll: { id: 'tp', name: 'Town Portal Scroll', count: 1, cd: 80 }
  }
};
