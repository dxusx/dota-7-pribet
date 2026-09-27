export const HEROES_DATA = [
  {
    id: "axe",
    name: "Axe",
    title: "Mogul Khan, Военачальник Красного Тумана",
    universe: "Dota 2",
    dndRole: "Варвар (Barbarian / Berserker)",
    themeColor: "#b23b3e",
    accentColor: "#ef4444",
    cardImage: "/cards/axe_card.png",
    avatar: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/axe.png",
    quote: "Axe приведет тебя к победе!",
    description: "Несокрушимый танк-инициатор ближнего боя. Провоцирует врагов на атаку, рубит их вихрем секиры и мгновенно казнит добивающим ударом.",
    stats: {
      hp: 100,
      hpRegen: "+1/ход",
      mana: 100,
      manaRegen: "+10/ход",
      damage: 50,
      period: 4,
      crit: 90,
      range: 1,
      penetration: 15,
      accuracy: 50,
      speed: 6,
      armor: 5,
      agility: 1
    },
    skills: [
      {
        id: "berserks-call",
        num: 1,
        name: "Berserks call",
        type: "Активное",
        isUltimate: false,
        castTime: "2 сек (0.25 хода)",
        manaCost: ["25", "50", "75", "100"],
        cooldown: "8 сек (1 ход)",
        description: "Акс провоцирует врагов в радиусе поражения, заставляя атаковать только его.",
        scalingDesc: "Длительность провокации: 4 / 8 / 12 / 16 секунд (0.5 / 1 / 1.5 / 2 хода).",
        scalingValues: [
          { level: 1, duration: "4 сек (0.5 хода)", mana: "25" },
          { level: 2, duration: "8 сек (1 ход)", mana: "50" },
          { level: 3, duration: "12 сек (1.5 хода)", mana: "75" },
          { level: 4, duration: "16 сек (2 хода)", mana: "100" }
        ]
      },
      {
        id: "battle-hunger",
        num: 2,
        name: "Battle Hunger",
        type: "Активное",
        isUltimate: false,
        castTime: "2 сек",
        manaCost: ["25", "50", "75", "100"],
        cooldown: "16 / 12 / 8 / 4 сек",
        description: "Накладывает на противника метку ярости, нанося периодический урон и замедляя его.",
        scalingDesc: "Урон: 10 / 15 / 20 / 25 в секунду в течение 2 / 4 / 6 / 8 сек. Замедление: 5 / 10 / 15 / 20%.",
        scalingValues: [
          { level: 1, dps: 10, duration: "2 сек", slow: "5%", cd: "16 сек" },
          { level: 2, dps: 15, duration: "4 сек", slow: "10%", cd: "12 сек" },
          { level: 3, dps: 20, duration: "6 сек", slow: "15%", cd: "8 сек" },
          { level: 4, dps: 25, duration: "8 сек", slow: "20%", cd: "4 сек" }
        ]
      },
      {
        id: "counter-helix",
        num: 3,
        name: "Counter Helix",
        type: "Пассивное",
        isUltimate: false,
        castTime: "Пассивно",
        manaCost: ["0", "0", "0", "0"],
        cooldown: "Нет",
        description: "Акс совершает сокрушительную круговую контратаку каждый раз, когда накапливает полученные удары.",
        scalingDesc: "Ответный удар за каждые 4 / 3 / 2 / 1 полученных ударов с уроном 50 / 100 / 150 / 200.",
        scalingValues: [
          { level: 1, hitsNeeded: 4, damage: 50 },
          { level: 2, hitsNeeded: 3, damage: 100 },
          { level: 3, hitsNeeded: 2, damage: 150 },
          { level: 4, hitsNeeded: 1, damage: 200 }
        ]
      },
      {
        id: "culling-blade",
        num: 4,
        name: "Calling blade (Culling Blade)",
        type: "Ультимейт (Активное)",
        isUltimate: true,
        castTime: "2 сек",
        manaCost: ["100", "150", "200"],
        cooldown: "80 / 60 / 40 сек",
        description: "Акс наносит смертоносный удар секирой. Если удар добивает цель, способность мгновенно сбрасывает время перезарядки!",
        scalingDesc: "Урон: 100 / 150 / 200 чистого урона. Перезарядка: 80 / 60 / 40 сек (сброс при убийстве).",
        scalingValues: [
          { level: 1, damage: 100, mana: 100, cd: "80 сек" },
          { level: 2, damage: 150, mana: 150, cd: "60 сек" },
          { level: 3, damage: 200, mana: 200, cd: "40 сек" }
        ]
      }
    ],
    basicAttacks: "Рубящий удар секирой ближнего боя (Дальность 1, Базовый урон 50, Крит 90, Пробитие 15)."
  },
  {
    id: "pudge",
    name: "Pudge",
    title: "Мясник из Чёрного Предела",
    universe: "Dota 2",
    dndRole: "Пожиратель / Контролер (Gargantuan Brute / Controller)",
    themeColor: "#566144",
    accentColor: "#84cc16",
    cardImage: "/cards/pudge_card.png",
    avatar: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/pudge.png",
    quote: "Свежее мясо на столе!",
    description: "Сверхживучий монстр с 250 HP, способный притянуть любую цель крюком через поле боя, сжечь её гнилостным газом и заживо сожрать ультой.",
    stats: {
      hp: 250,
      hpRegen: "+5/ход",
      mana: 100,
      manaRegen: "+10/ход",
      damage: 35,
      period: 4,
      crit: 75,
      range: 1,
      penetration: 15,
      accuracy: 50,
      speed: 5,
      armor: 5,
      agility: 1
    },
    skills: [
      {
        id: "meat-hook",
        num: 1,
        name: "Meat hook",
        type: "Активное",
        isUltimate: false,
        castTime: "2 сек",
        manaCost: ["50", "75", "100", "125"],
        cooldown: "16 / 12 / 8 / 4 сек",
        description: "Выбрасывает огромный окровавленный крюк. При попадании притягивает цель вплотную к Пуджу и наносит сокрушительный урон.",
        scalingDesc: "Урон: 50 / 100 / 150 / 200. Перезарядка: 16 / 12 / 8 / 4 сек.",
        scalingValues: [
          { level: 1, damage: 50, cd: "16 сек", mana: "50" },
          { level: 2, damage: 100, cd: "12 сек", mana: "75" },
          { level: 3, damage: 150, cd: "8 сек", mana: "100" },
          { level: 4, damage: 200, cd: "4 сек", mana: "125" }
        ]
      },
      {
        id: "rot",
        num: 2,
        name: "Rot",
        type: "Активное (Аура)",
        isUltimate: false,
        castTime: "0 сек (Мгновенно)",
        manaCost: ["0", "0", "0", "0"],
        cooldown: "Нет",
        description: "Выпускает токсичные ядовитые газы вокруг себя. Наносит 10 урона в секунду самому Пуджу и отравляет находящихся рядом противников.",
        scalingDesc: "Урон противнику рядом: 15 / 30 / 45 / 60 в секунду. Затраты маны: 0. Не кончается сама.",
        scalingValues: [
          { level: 1, enemyDps: 15, selfDps: 10 },
          { level: 2, enemyDps: 30, selfDps: 10 },
          { level: 3, enemyDps: 45, selfDps: 10 },
          { level: 4, enemyDps: 60, selfDps: 10 }
        ]
      },
      {
        id: "meat-shield",
        num: 3,
        name: "Meat shield",
        type: "Активное",
        isUltimate: false,
        castTime: "0 сек",
        manaCost: ["50", "100", "150", "200"],
        cooldown: "40 / 32 / 24 / 16 сек",
        description: "Уплотняет слои жира и плоти, временно давая огромный прирост к показателю брони.",
        scalingDesc: "Добавляет +5 / 10 / 20 / 40 к броне на 4 / 8 / 12 / 16 сек.",
        scalingValues: [
          { level: 1, bonusArmor: 5, duration: "4 сек" },
          { level: 2, bonusArmor: 10, duration: "8 сек" },
          { level: 3, bonusArmor: 20, duration: "12 сек" },
          { level: 4, bonusArmor: 40, duration: "16 сек" }
        ]
      },
      {
        id: "flesh-heap",
        num: 4,
        name: "Flesh Heap",
        type: "Встроенное (Пассивное)",
        isUltimate: false,
        castTime: "Пассивно",
        manaCost: ["0", "0", "0", "0"],
        cooldown: "Нет",
        description: "За каждого убитого соперника Пудж пожирает плоть и получает постоянный бонус: +10% к максимальному запасу HP и к базовому урону.",
        scalingDesc: "+10% HP и Урона за каждый килл.",
        scalingValues: [
          { level: 1, bonusPerKill: "+10% HP & Урон" }
        ]
      },
      {
        id: "dismember",
        num: 5,
        name: "Dismember",
        type: "Ультимейт (Активное)",
        isUltimate: true,
        castTime: "8 сек (1 полный ход)",
        manaCost: ["100", "150", "200"],
        cooldown: "80 / 60 / 40 сек",
        description: "Пудж хватает и заживо пожирает соперника. Цель ПОЛНОСТЬЮ ПРОПУСКАЕТ свой ход! Пудж восстанавливает себе 75% от нанесенного урона + 10% за каждые 50 HP своего текущего запаса.",
        scalingDesc: "Урон: 150 / 300 / 450 + 10% за 50 HP Пуджа. Вампиризм: 75%. Оглушение/Пропуск хода: 1 ход.",
        scalingValues: [
          { level: 1, damage: 150, healRatio: "75%", cd: "80 сек" },
          { level: 2, damage: 300, healRatio: "75%", cd: "60 сек" },
          { level: 3, damage: 450, healRatio: "75%", cd: "40 сек" }
        ]
      }
    ],
    basicAttacks: "Тесак мясника (Дальность 1, Урон 35, Крит 75, Пробитие 15)."
  },
  {
    id: "wesker",
    name: "Albert Wesker",
    title: "Лидер S.T.A.R.S. & Владыка Uroboros",
    universe: "Resident Evil",
    dndRole: "Чернокнижник / Мастер Сверхчеловек (Mutant Bio-Lord)",
    themeColor: "#5a3a44",
    accentColor: "#e11d48",
    cardImage: "/cards/wesker_card.png",
    avatar: "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=400&auto=format&fit=crop&q=80",
    quote: "7 минут — это всё время, что я могу уделить тебе.",
    description: "Хладнокровный гений в черных очках. Переключается между сокрушительным ближним рукопашным боем и точной стрельбой из пистолета. Обладает био-регенерацией Уробороса и абсолютной скоростью.",
    stats: {
      hp: 100,
      hpRegen: "+5/ход",
      mana: 150,
      manaRegen: "+10/ход",
      melee: {
        damage: 5,
        period: 4,
        crit: 20,
        range: 1,
        penetration: 1,
        accuracy: 50
      },
      ranged: {
        damage: 40,
        period: 4,
        crit: 90,
        range: 15,
        penetration: 15,
        accuracy: 25
      },
      speed: 6,
      armor: 0,
      agility: 1
    },
    skills: [
      {
        id: "stars-agent",
        num: 1,
        name: "Agent S.T.A.R.S.",
        type: "Встроенный (Активное)",
        isUltimate: false,
        castTime: "2 сек",
        manaCost: ["0", "0", "0", "0"],
        cooldown: "Нет",
        description: "Вескер меняет стойку боя: переключается между сокрушительным стилем боевых искусств (кулак) и тактическим пистолетом.",
        scalingDesc: "Применение: 2 секунды. Переключает набор базовых характеристик между Ближним и Дальним боем.",
        scalingValues: [
          { level: 1, stance: "Смена стойки (Кулак / Пистолет)" }
        ]
      },
      {
        id: "uroboros",
        num: 2,
        name: "Uroboros",
        type: "Пассивное",
        isUltimate: false,
        castTime: "Пассивно",
        manaCost: ["0", "0", "0", "0"],
        cooldown: "Нет",
        description: "Вирус Уроборос мутирует тело Вескера, увеличивая восстановление тканей, природную броню и сокрушительную силу кулаков.",
        scalingDesc: "+5/10/20/40 к регенерации. +5/10/15/20 к броне. +5/15/35/75 к урону с рук. +4/9/14/19 к пробитию с рук.",
        scalingValues: [
          { level: 1, regen: "+5", armor: "+5", meleeDmg: "+5", meleePen: "+4" },
          { level: 2, regen: "+10", armor: "+10", meleeDmg: "+15", meleePen: "+9" },
          { level: 3, regen: "+20", armor: "+15", meleeDmg: "+35", meleePen: "+14" },
          { level: 4, regen: "+40", armor: "+20", meleeDmg: "+75", meleePen: "+19" }
        ]
      },
      {
        id: "speed",
        num: 3,
        name: "Speed",
        type: "Пассивное",
        isUltimate: false,
        castTime: "Пассивно",
        manaCost: ["0", "0", "0", "0"],
        cooldown: "Нет",
        description: "Сверхчеловеческие рефлексы позволяют Вескеру перемещаться со скоростью телепортации и уклоняться от выстрелов.",
        scalingDesc: "+4 / 9 / 14 / 19 к скорости перемещения. +4 / 9 / 19 / 39 к уклонению.",
        scalingValues: [
          { level: 1, speed: "+4", evasion: "+4%" },
          { level: 2, speed: "+9", evasion: "+9%" },
          { level: 3, speed: "+14", evasion: "+19%" },
          { level: 4, speed: "+19", evasion: "+39%" }
        ]
      },
      {
        id: "mastermind",
        num: 4,
        name: "Mastermind",
        type: "Ультимейт (Активное)",
        isUltimate: true,
        castTime: "0 сек (Мгновенно)",
        manaCost: ["150", "150", "150"],
        cooldown: "100 / 80 / 60 сек (12.5 / 10 / 7.5 ходов)",
        description: "Вескер входит в режим гениального доминирования: получает ПОЛНУЮ НЕУЯЗВИМОСТЬ к направленным атакам и удваивает скорость ВСЕХ своих действий!",
        scalingDesc: "Длительность: 8 / 16 / 24 сек (1 / 2 / 3 хода). Действия ускорены в 2 раза. Кд: 100 / 80 / 60 сек.",
        scalingValues: [
          { level: 1, duration: "8 сек (1 ход)", cd: "100 сек (12.5 ходов)" },
          { level: 2, duration: "16 сек (2 хода)", cd: "80 сек (10 ходов)" },
          { level: 3, duration: "24 сек (3 хода)", cd: "60 сек (7.5 ходов)" }
        ]
      }
    ],
    basicAttacks: "С руки: урон 5 (масштабируется от Уробороса), крит 20. С пистолета: фиксированный урон 40, дальность 15, крит 90."
  },
  {
    id: "monesy",
    name: "Илья M0nesy",
    title: "The AWP Prodigy / Гений Снайперского Искусства",
    universe: "CS:GO / Esports",
    dndRole: "Следопыт-Снайпер (Gunslinger / Master Archer)",
    themeColor: "#3b4d5b",
    accentColor: "#38bdf8",
    cardImage: "/cards/monesy_card.png",
    avatar: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400&auto=format&fit=crop&q=80",
    quote: "Один пик — один труп.",
    description: "Сверхдальнобойный стрелок с колоссальным разовым уроном (90 базовый, 180 крит на дальности 30). Может рискованно стрелять без зума на удвоенной скорости.",
    stats: {
      hp: 100,
      hpRegen: "+1/ход",
      mana: 100,
      manaRegen: "+10/ход",
      damage: 90,
      period: 4,
      crit: 180,
      range: 30,
      penetration: 30,
      accuracy: 30,
      speed: 6,
      armor: 1,
      agility: 1
    },
    skills: [
      {
        id: "scope",
        num: 1,
        name: "Scope",
        type: "Встроенный (Активное)",
        isUltimate: false,
        castTime: "1 сек",
        manaCost: ["0", "0", "0", "0"],
        cooldown: "Нет",
        description: "Стрельба в прицеле (Scope) или навскидку (No-Scope). Стрельба без скопа УДВАИВАЕТ урон (180) и скорость, но базовый шанс попадания составляет лишь 10%.",
        scalingDesc: "No-Scope: х2 урон, х2 скорость, 10% базовой меткости.",
        scalingValues: [
          { level: 1, mode: "Зум (стандарт) / Ноузум (x2 урон, 10% меткость)" }
        ]
      },
      {
        id: "headshot",
        num: 2,
        name: "Headshot",
        type: "Пассивное",
        isUltimate: false,
        castTime: "Пассивно",
        manaCost: ["0", "0", "0", "0"],
        cooldown: "Нет",
        description: "Филигранное наведение на голову: многократно увеличивает вероятность нанесения критического выстрела.",
        scalingDesc: "Шанс критического удара повышен до: 10% / 25% / 35% / 50%.",
        scalingValues: [
          { level: 1, critChance: "10%" },
          { level: 2, critChance: "25%" },
          { level: 3, critChance: "35%" },
          { level: 4, critChance: "50%" }
        ]
      },
      {
        id: "full-focus",
        num: 3,
        name: "Full focus",
        type: "Активное",
        isUltimate: false,
        castTime: "0 сек (Мгновенно)",
        manaCost: ["75", "100", "125", "150"],
        cooldown: "40 сек (5 ходов)",
        description: "Герой мгновенно входит в режим глубокой концентрации, резко увеличивая шанс попадания по цели.",
        scalingDesc: "+5 / 10 / 15 / 20 к меткости на 4 / 8 / 12 / 16 секунд (0.5 / 1 / 1.5 / 2 хода).",
        scalingValues: [
          { level: 1, accuracyBonus: "+5", duration: "4 сек (0.5 хода)", mana: "75" },
          { level: 2, accuracyBonus: "+10", duration: "8 сек (1 ход)", mana: "100" },
          { level: 3, accuracyBonus: "+15", duration: "12 сек (1.5 хода)", mana: "125" },
          { level: 4, accuracyBonus: "+20", duration: "16 сек (2 хода)", mana: "150" }
        ]
      },
      {
        id: "second-zoom",
        num: 4,
        name: "Second zoom",
        type: "Активное",
        isUltimate: false,
        castTime: "0 сек",
        manaCost: ["25", "50", "75", "100"],
        cooldown: "40 сек",
        description: "Максимальное оптическое приближение. Экстремально увеличивает дальность стрельбы ценой снижения подвижности.",
        scalingDesc: "Дальность увеличивается в 1.2 / 1.3 / 1.4 / 1.5 раза. Скорость уменьшается в 2 раза.",
        scalingValues: [
          { level: 1, rangeMul: "x1.2 (36 дальность)", speedMul: "/2" },
          { level: 2, rangeMul: "x1.3 (39 дальность)", speedMul: "/2" },
          { level: 3, rangeMul: "x1.4 (42 дальность)", speedMul: "/2" },
          { level: 4, rangeMul: "x1.5 (45 дальность)", speedMul: "/2" }
        ]
      },
      {
        id: "revenge",
        num: 5,
        name: "Revenge",
        type: "Пассивное",
        isUltimate: false,
        castTime: "Реакция",
        manaCost: ["0", "0", "0", "0"],
        cooldown: "По расходу реакции",
        description: "При получении урона от направленного скилла или удара врага, Монеси тратит свою реакцию и производит немедленный ответный выстрел.",
        scalingDesc: "Тратит реакцию на контратаку базовым ударом.",
        scalingValues: [
          { level: 1, effect: "Ответный выстрел на реакцию" }
        ]
      },
      {
        id: "one-way",
        num: 6,
        name: "One Way",
        type: "Ультимейт (Активное)",
        isUltimate: true,
        castTime: "Мгновенно",
        manaCost: ["150", "200", "250"],
        cooldown: "180 / 150 / 120 сек",
        description: "Легендарный ван-вей прострел сквозь дым. ГАРАНТИРОВАННО поражает противника (100% точность) и умножает критический урон!",
        scalingDesc: "Гарантированное попадание. Урон в 1.5 / 1.75 / 2 раза выше крита (270 / 315 / 360 урона!).",
        scalingValues: [
          { level: 1, damageMul: "1.5x крита (270)", mana: 150, cd: "180 сек" },
          { level: 2, damageMul: "1.75x крита (315)", mana: 200, cd: "150 сек" },
          { level: 3, damageMul: "2.0x крита (360)", mana: 250, cd: "120 сек" }
        ]
      }
    ],
    basicAttacks: "Выстрел из снайперской винтовки AWP: Базовый 90, Крит 180, Дальность 30 клеток, Бронепробитие 30."
  },
  {
    id: "minos",
    name: "Minos Prime",
    title: "Король Вожделения / Дух Абсолютного Возмездия",
    universe: "Ultrakill",
    dndRole: "Монах Пути Астрала (Ascended Astral Monk)",
    themeColor: "#345e68",
    accentColor: "#06b6d4",
    cardImage: "/cards/minos_card.png",
    avatar: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&auto=format&fit=crop&q=80",
    quote: "PREPARE THYSELF! DIE!",
    description: "Ультраскоростной дух ярости. Тратит особую стамину/ману (макс 8). Не имеет перезарядок на комбо-сериях ударов и змеиных атаках!",
    stats: {
      hp: 100,
      hpRegen: "+1/ход",
      mana: "4 / (8 макс)",
      manaRegen: "+1/ход",
      damage: 35,
      period: 4,
      crit: 70,
      range: 1,
      penetration: 5,
      accuracy: 50,
      speed: 6,
      armor: 1,
      agility: 1
    },
    skills: [
      {
        id: "jump",
        num: 1,
        name: "Jump",
        type: "Встроенное (Активное)",
        isUltimate: false,
        castTime: "2 сек",
        manaCost: ["0", "0", "0", "0"],
        cooldown: "Без кд",
        description: "Минос совершает стремительный прыжок в воздух, подготавливая сокрушительное падение на врага.",
        scalingDesc: "Применение: 2 сек. Открывает комбо DIE!/CRUSH!",
        scalingValues: [
          { level: 1, effect: "Взмывает в воздух" }
        ]
      },
      {
        id: "die-crush",
        num: 2,
        name: "Die! / Crush!",
        type: "Активное (Комбо)",
        isUltimate: false,
        castTime: "6 / 4 / 2 сек",
        manaCost: ["2", "2", "2", "2"],
        cooldown: "Без кд",
        description: "После совершенного прыжка с криком 'DIE!' влетает в соперника на сверхзвуковой скорости.",
        scalingDesc: "Урон: 35 / 70 / 140 / 280. Время: 6 / 4 / 2 сек. Стоит 2 маны.",
        scalingValues: [
          { level: 1, damage: 35, time: "6 сек", mana: 2 },
          { level: 2, damage: 70, time: "4 сек", mana: 2 },
          { level: 3, damage: 140, time: "2 сек", mana: 2 },
          { level: 4, damage: 280, time: "2 сек", mana: 2 }
        ]
      },
      {
        id: "prepare-thyself",
        num: 3,
        name: "Prepare thyself!",
        type: "Активное",
        isUltimate: false,
        castTime: "8 сек (1 ход)",
        manaCost: ["4", "4", "4", "4"],
        cooldown: "Без кд",
        description: "Наносит свирепую серию из 2 ударов и выпускает самонаводящуюся спектральную змею.",
        scalingDesc: "Каждая атака наносит 35 / 70 / 105 / 140 урона. Всего 2 удара + змея.",
        scalingValues: [
          { level: 1, dmgPerHit: 35, hits: 3, mana: 4 },
          { level: 2, dmgPerHit: 70, hits: 3, mana: 4 },
          { level: 3, dmgPerHit: 105, hits: 3, mana: 4 },
          { level: 4, dmgPerHit: 140, hits: 3, mana: 4 }
        ]
      },
      {
        id: "thy-end-is-now",
        num: 4,
        name: "Thy end is now!",
        type: "Активное",
        isUltimate: false,
        castTime: "8 сек (1 ход)",
        manaCost: ["6", "6", "6", "6"],
        cooldown: "Без кд",
        description: "Смертельный шквал ударов руками: Минос проводит комбо из 4 ударов подряд.",
        scalingDesc: "Серия из 4 ударов по 35 / 70 / 105 / 140 урона каждый (до 560 суммарного урона!).",
        scalingValues: [
          { level: 1, dmgPerHit: 35, total: 140, mana: 6 },
          { level: 2, dmgPerHit: 70, total: 280, mana: 6 },
          { level: 3, dmgPerHit: 105, total: 420, mana: 6 },
          { level: 4, dmgPerHit: 140, total: 560, mana: 6 }
        ]
      },
      {
        id: "serpent-punch",
        num: 5,
        name: "Serpent punch",
        type: "Активное",
        isUltimate: false,
        castTime: "2 сек",
        manaCost: ["2", "2", "2", "2"],
        cooldown: "Без кд",
        description: "Призывает астральную змею под ногами врага и взмывает с ним в воздух с апперкотом.",
        scalingDesc: "Урон: 35 / 70 / 105 / 140. Время: 2 сек. Стоит 2 маны.",
        scalingValues: [
          { level: 1, damage: 35, mana: 2 },
          { level: 2, damage: 70, mana: 2 },
          { level: 3, damage: 105, mana: 2 },
          { level: 4, damage: 140, mana: 2 }
        ]
      },
      {
        id: "kick",
        num: 6,
        name: "Kick",
        type: "Активное (Контроль)",
        isUltimate: false,
        castTime: "4 сек",
        manaCost: ["2", "2", "2", "2"],
        cooldown: "Без кд",
        description: "Мощный удар ногой сверху вниз. Оглушает врага на 4 секунды (0.5 хода) и наносит 35 урона.",
        scalingDesc: "Оглушение 4 секунды, урон 35, стоит 2 маны.",
        scalingValues: [
          { level: 1, stun: "4 сек", damage: 35, mana: 2 }
        ]
      },
      {
        id: "judgement",
        num: 7,
        name: "Judgement!",
        type: "Ультимейт (Активное)",
        isUltimate: true,
        castTime: "0 сек (Низкий старт)",
        manaCost: ["5", "5", "5"],
        cooldown: "8 / 16 / 24 сек",
        description: "Культовая атака: Минос кричит 'JUDGEMENT!' и на околосветовой скорости взрывает точку нахождения врага!",
        scalingDesc: "Урон: 65 / 130 / 260 урона. Мана: 5. Кд: 8 / 16 / 24 сек.",
        scalingValues: [
          { level: 1, damage: 65, mana: 5, cd: "8 сек" },
          { level: 2, damage: 130, mana: 5, cd: "16 сек" },
          { level: 3, damage: 260, mana: 5, cd: "24 сек" }
        ]
      }
    ],
    basicAttacks: "Рукопашный бой пустоты: Базовый урон 35, Крит 70, Дальность 1, Пробитие 5."
  },
  {
    id: "shadow_fiend",
    name: "Shadow Fiend (Nevermore)",
    title: "Повелитель Душ (Lord of Souls)",
    universe: "Dota 2",
    dndRole: "Колдун / Некромант (Warlock)",
    themeColor: "#3a2228",
    accentColor: "#f97316",
    cardImage: "/avatars/sf_avatar.png",
    avatar: "/avatars/sf_avatar.png",
    quote: "Твоя душа будет питать мою силу.",
    description: "Коварный сборщик душ с дальним боем. Накапливает души за каждое убийство, увеличивая базовый урон, взрывает врагов тремя койлами Shadowraze и высвобождает волны душ в ультимейте.",
    stats: {
      hp: 100,
      hpRegen: "+5/ход",
      mana: 100,
      manaRegen: "+10/ход",
      damage: 30,
      period: 4,
      crit: 60,
      range: 15,
      penetration: 15,
      accuracy: 20,
      speed: 6,
      armor: 1,
      agility: 5
    },
    skills: [
      {
        id: "necromastery",
        num: 1,
        name: "Necromastery",
        type: "Пассивное",
        isUltimate: false,
        castTime: "Пассивно",
        manaCost: ["0", "0", "0", "0"],
        cooldown: "Нет",
        description: "За каждого убитого противника копятся души, дающие +1 к урону. За героя дается 5 душ, которые возвращаются при его возрождении. При смерти Невермор тратит 8 душ и выпускает вокруг себя Requiem Of Souls (35 + кол-во душ урона).",
        scalingDesc: "Души дают +1 урон за штуку (макс. 36 душ).",
        scalingValues: [{ level: 1, soulsMax: 36, dmgPerSoul: 1 }]
      },
      {
        id: "shadowraze",
        num: 2,
        name: "Shadowraze",
        type: "Активное",
        isUltimate: false,
        castTime: "0 сек",
        manaCost: ["30", "45", "60", "75"],
        cooldown: "12 / 10 / 8 / 6 сек",
        description: "Дальняя атака темной магии, бьющая по площади 3 на 3 клетки. Наносит 35/70/105/140 урона + кол-во накопленных душ! При повторном попадании урон увеличивается в 1.25 или 1.5 раза. Имеет ближний, средний и дальний койл.",
        scalingDesc: "Урон: 35 / 70 / 105 / 140 + души. Перезарядка: 12 / 10 / 8 / 6 сек. Мана: 30 / 45 / 60 / 75.",
        scalingValues: [
          { level: 1, damage: 35, cd: "12 сек", mana: "30" },
          { level: 2, damage: 70, cd: "10 сек", mana: "45" },
          { level: 3, damage: 105, cd: "8 сек", mana: "60" },
          { level: 4, damage: 140, cd: "6 сек", mana: "75" }
        ]
      },
      {
        id: "feast-of-souls",
        num: 3,
        name: "Feast of Souls",
        type: "Активное",
        isUltimate: false,
        castTime: "0 сек",
        manaCost: ["20", "35", "50", "65"],
        cooldown: "20 / 16 / 12 / 8 сек",
        description: "Временно отнимает души всех вокруг находящихся существ, ускоряя скорость передвижения и всех действий в 1.25 / 1.5 / 1.75 / 2 раза!",
        scalingDesc: "Ускорение: 1.25x / 1.5x / 1.75x / 2.0x. Длительность: 8 / 12 / 16 / 20 сек. КД: 20 / 16 / 12 / 8 сек.",
        scalingValues: [
          { level: 1, speedMul: "1.25x", duration: "8 сек", cd: "20 сек" },
          { level: 2, speedMul: "1.50x", duration: "12 сек", cd: "16 сек" },
          { level: 3, speedMul: "1.75x", duration: "16 сек", cd: "12 сек" },
          { level: 4, speedMul: "2.00x", duration: "20 сек", cd: "8 сек" }
        ]
      },
      {
        id: "presence-of-dark-lord",
        num: 4,
        name: "Presence of the Dark Lord",
        type: "Пассивное (Аура)",
        isUltimate: false,
        castTime: "Пассивно",
        manaCost: ["0", "0", "0", "0"],
        cooldown: "Нет",
        description: "Ужасающая аура владыки тьмы снижает класс брони всех соперников поблизости.",
        scalingDesc: "Снижение брони цели: -5 / -10 / -15 / -20 единиц.",
        scalingValues: [
          { level: 1, armorRed: -5 },
          { level: 2, armorRed: -10 },
          { level: 3, armorRed: -15 },
          { level: 4, armorRed: -20 }
        ]
      },
      {
        id: "requiem-of-souls",
        num: 5,
        name: "Requiem of Souls",
        type: "Ультимейт (Активное)",
        isUltimate: true,
        castTime: "8 сек (1 полный ход)",
        manaCost: ["150", "200", "250"],
        cooldown: "160 / 120 / 80 сек",
        description: "Невермор выпускает вокруг себя вихри накопленных душ, нанося сокрушительный урон всем врагам на арене.",
        scalingDesc: "Урон: 35 / 70 / 140 урона + кол-во душ. Каст 8 сек. Мана: 150 / 200 / 250. КД: 160 / 120 / 80 сек.",
        scalingValues: [
          { level: 1, baseDamage: 35, cd: "160 сек", mana: "150" },
          { level: 2, baseDamage: 70, cd: "120 сек", mana: "200" },
          { level: 3, baseDamage: 140, cd: "80 сек", mana: "250" }
        ]
      }
    ],
    basicAttacks: "Сгусток темной материи дальнего боя (Дальность 15, Урон 30 + души, Крит 60, Пробитие 15)."
  },
  {
    id: "invoker",
    name: "Invoker",
    title: "The Arsenal Magus / Арсенал Магии",
    universe: "Dota 2",
    dndRole: "Архимаг Мультивселенной (Archmage)",
    themeColor: "#4a3820",
    accentColor: "#eab308",
    cardImage: "/avatars/invoker_avatar.png",
    avatar: "/avatars/invoker_avatar.png",
    quote: "Я помню заклинания, сотворившие этот мир.",
    description: "Величайший волшебник древности. Использует фундаментальные стихийные сферы Quas (лед), Wex (молния) и Exort (огонь), комбинируя их в сокрушительные прокасты.",
    stats: {
      hp: 100,
      hpRegen: "+2/ход",
      mana: 150,
      manaRegen: "+15/ход",
      damage: 45,
      period: 4,
      crit: 75,
      range: 15,
      penetration: 10,
      accuracy: 40,
      speed: 6,
      armor: 2,
      agility: 2
    },
    skills: [
      {
        id: "quas",
        num: 1,
        name: "Quas (Сфера Льда)",
        type: "Встроенное (Сфера)",
        isUltimate: false,
        castTime: "0 сек (Мгновенно)",
        manaCost: ["0", "0", "0", "0"],
        cooldown: "Нет",
        description: "Призывает сферу льда Quas. Каждая активная сфера Quas дает +1/2/3/4 к регенерации HP каждый ход. Необходима для ледяных заклинаний (Cold Snap, Ice Wall, Ghost Walk).",
        scalingDesc: "Дает +1 / +2 / +3 / +4 к регенерации ХП за каждую сферу Quas.",
        scalingValues: [{ level: 1, regenPerOrb: 1 }, { level: 2, regenPerOrb: 2 }, { level: 3, regenPerOrb: 3 }, { level: 4, regenPerOrb: 4 }]
      },
      {
        id: "wex",
        num: 2,
        name: "Wex (Сфера Молнии)",
        type: "Встроенное (Сфера)",
        isUltimate: false,
        castTime: "0 сек (Мгновенно)",
        manaCost: ["0", "0", "0", "0"],
        cooldown: "Нет",
        description: "Призывает сферу молнии Wex. Каждая активная сфера дает +1 к скорости перемещения и +10% к меткости. Необходима для электрических заклинаний (EMP, Tornado, Alacrity).",
        scalingDesc: "+1 к скорости и +10% меткости за сферу.",
        scalingValues: [{ level: 1, speedBonus: 1 }]
      },
      {
        id: "exort",
        num: 3,
        name: "Exort (Сфера Огня)",
        type: "Встроенное (Сфера)",
        isUltimate: false,
        castTime: "0 сек (Мгновенно)",
        manaCost: ["0", "0", "0", "0"],
        cooldown: "Нет",
        description: "Призывает сферу огня Exort. Каждая активная сфера увеличивает базовый урон атак и заклинаний на +5/10/15/20. Необходима для огненных прокастов (Sun Strike, Meteor, Forge Spirit).",
        scalingDesc: "+5 / +10 / +15 / +20 к урону за сферу Exort.",
        scalingValues: [{ level: 1, dmgPerOrb: 5 }, { level: 2, dmgPerOrb: 10 }, { level: 3, dmgPerOrb: 15 }, { level: 4, dmgPerOrb: 20 }]
      },
      {
        id: "invoke",
        num: 4,
        name: "Invoke (Синтез Заклинания)",
        type: "Ультимейт (Синтез)",
        isUltimate: true,
        castTime: "0 сек (Мгновенно)",
        manaCost: ["20", "10", "0"],
        cooldown: "8 / 4 / 1 сек",
        description: "Синтезирует 3 активные сферы в сокрушительное заклинание! (QQQ = Cold Snap, EEE = Sun Strike, EEW = Chaos Meteor, QWE = Deafening Blast, WWQ = Tornado, WWW = EMP, QQE = Ice Wall, QWW = Ghost Walk).",
        scalingDesc: "Перезарядка Invoke: 8 / 4 / 1 секунда.",
        scalingValues: [{ level: 1, cd: "8 сек" }, { level: 2, cd: "4 сек" }, { level: 3, cd: "1 сек" }]
      },
      {
        id: "sun-strike",
        num: 5,
        name: "Sun Strike (EEE)",
        type: "Активное",
        isUltimate: false,
        castTime: "2 сек",
        manaCost: ["100", "150", "200"],
        cooldown: "24 / 20 / 16 сек",
        description: "Сфокусированный луч солнечной энергии бьет в любую точку 2D карты, нанося чистый катастрофический урон, игнорирующий броню цели.",
        scalingDesc: "Урон: 120 / 240 / 360 / 480 чистого урона.",
        scalingValues: [{ level: 1, damage: 120 }, { level: 2, damage: 240 }, { level: 3, damage: 360 }]
      },
      {
        id: "chaos-meteor",
        num: 6,
        name: "Chaos Meteor (EEW)",
        type: "Активное",
        isUltimate: false,
        castTime: "1.5 сек",
        manaCost: ["120", "150", "180"],
        cooldown: "40 / 32 / 24 сек",
        description: "Обрушивает с неба пылающий метеорит, который катится вперед на 8 клеток, нанося колоссальный урон при ударе и поджигая противников.",
        scalingDesc: "Урон: 150 / 250 / 350 + периодическое горение 50/сек на 4 сек.",
        scalingValues: [{ level: 1, damage: 150 }, { level: 2, damage: 250 }, { level: 3, damage: 350 }]
      },
      {
        id: "deafening-blast",
        num: 7,
        name: "Deafening Blast (QWE)",
        type: "Активное",
        isUltimate: false,
        castTime: "1 сек",
        manaCost: ["100", "125", "150"],
        cooldown: "32 / 24 / 16 сек",
        description: "Ударная акустическая волна отталкивает всех врагов на 4 клетки назад, наносит урон и накладывает полное ОБЕЗОРУЖИВАНИЕ (запрет атак на 4-8 сек)!",
        scalingDesc: "Урон: 80 / 160 / 240. Отталкивание: 4 кл. Обезоруживание: 4 / 6 / 8 сек.",
        scalingValues: [{ level: 1, damage: 80 }, { level: 2, damage: 160 }, { level: 3, damage: 240 }]
      }
    ],
    basicAttacks: "Элементальные снаряды из сфер (Дальность 15, Урон 45 + сферы Exort, Крит 75, Пробитие 10)."
  },
  {
    id: "rubick",
    name: "Rubick",
    title: "The Grand Magus / Великий Магистр",
    universe: "Dota 2",
    dndRole: "Чародей Воровства Заклинаний (Sorcerer)",
    themeColor: "#234233",
    accentColor: "#10b981",
    cardImage: "/avatars/rubick_avatar.png",
    avatar: "/avatars/rubick_avatar.png",
    quote: "Какое восхитительное заклинание! Теперь оно моё.",
    description: "Гениальный мистик, способный поднять в воздух любого противника телекинезом, ослабить вражеские атаки цепной молнией и украсть любое заклинание врага.",
    stats: {
      hp: 100,
      hpRegen: "+2/ход",
      mana: 140,
      manaRegen: "+12/ход",
      damage: 40,
      period: 4,
      crit: 70,
      range: 15,
      penetration: 8,
      accuracy: 45,
      speed: 6,
      armor: 2,
      agility: 2
    },
    skills: [
      {
        id: "telekinesis",
        num: 1,
        name: "Telekinesis",
        type: "Активное",
        isUltimate: false,
        castTime: "1 сек",
        manaCost: ["50", "50", "50", "50"],
        cooldown: "16 / 12 / 8 / 4 сек",
        description: "Перемещает противника в воздухе силой мысли, накладывая на него оглушение и бросая на соседнюю клетку.",
        scalingDesc: "Оглушение: 4 / 8 / 12 / 16 секунд (0.5 / 1 / 1.5 / 2 хода). Стоимость: 50 маны.",
        scalingValues: [
          { level: 1, stun: "4 сек (0.5 хода)" },
          { level: 2, stun: "8 сек (1 ход)" },
          { level: 3, stun: "12 сек (1.5 хода)" },
          { level: 4, stun: "16 сек (2 хода)" }
        ]
      },
      {
        id: "fade-bolt",
        num: 2,
        name: "Fade Bolt",
        type: "Активное",
        isUltimate: false,
        castTime: "1 сек",
        manaCost: ["50", "65", "80", "95"],
        cooldown: "12 / 10 / 8 / 6 сек",
        description: "Запускает луч зеленой магии, который отскакивает между целями, наносит урон и ослабляет их физическую атаку.",
        scalingDesc: "Урон: 50 / 100 / 150 / 200 урона (на 20% слабее при отскоке). Ослабление атаки врага: -10% / -15% / -20% / -25%.",
        scalingValues: [
          { level: 1, damage: 50, debuff: "-10%" },
          { level: 2, damage: 100, debuff: "-15%" },
          { level: 3, damage: 150, debuff: "-20%" },
          { level: 4, damage: 200, debuff: "-25%" }
        ]
      },
      {
        id: "spell-steal",
        num: 3,
        name: "Spell Steal",
        type: "Ультимейт (Активное)",
        isUltimate: true,
        castTime: "0 сек (Мгновенно)",
        manaCost: ["50", "75", "100"],
        cooldown: "20 / 12 / 4 сек",
        description: "Крадет последнее примененное заклинание вражеского героя (например, Хук Пуджа, Culling Blade Акса, One Way Монеси или Judgement Миноса) и позволяет Рубику применить его самому!",
        scalingDesc: "Воровство активного заклинания. Перезарядка: 20 / 12 / 4 сек.",
        scalingValues: [
          { level: 1, cd: "20 сек" },
          { level: 2, cd: "12 сек" },
          { level: 3, cd: "4 сек" }
        ]
      }
    ],
    basicAttacks: "Зеленый посох магии (Дальность 15, Урон 40, Крит 70, Пробитие 8)."
  },
  {
    id: "gojo",
    name: "Satoru Gojo",
    title: "Сильнейший Маг Современности (The Honored One)",
    universe: "Jujutsu Kaisen",
    dndRole: "Маг Пространства / Адепт Пустоты (Void Sorcerer)",
    themeColor: "#1e293b",
    accentColor: "#38bdf8",
    cardImage: "/avatars/gojo_avatar.svg",
    avatar: "/avatars/gojo_avatar.svg",
    quote: "Не волнуйся, я ведь сильнейший.",
    description: "Абсолютный гений с Шестью Глазами и техникой Безграничности. Атаки врагов замедляются и поглощаются барьером за счет маны. Притягивает материю Синим, отбрасывает Красным, стирает реальность Фиолетовым и парализует мозг врагов в Необъятной Пустоте.",
    stats: {
      hp: 100,
      hpRegen: "+2/ход",
      mana: 120,
      manaRegen: "+12/ход",
      damage: 40,
      period: 4,
      crit: 80,
      range: 1,
      penetration: 10,
      accuracy: 85,
      speed: 6,
      armor: 2,
      agility: 3
    },
    skills: [
      {
        id: "infinity",
        num: 1,
        name: "Infinity (Бесконечность)",
        type: "Пассивное",
        isUltimate: false,
        castTime: "Пассивно",
        manaCost: ["0", "0", "0", "0"],
        cooldown: "Нет",
        description: "Пространство вокруг Годжо бесконечно делится: при получении удара тратит 15 маны и поглощает 25/35/45/55% входящего урона. Если мана на нуле, барьер спадает!",
        scalingDesc: "Поглощение урона: 25% / 35% / 45% / 55%. Трата маны: 15 за удар.",
        scalingValues: [{ level: 1, dmgRed: "25%" }, { level: 2, dmgRed: "35%" }, { level: 3, dmgRed: "45%" }, { level: 4, dmgRed: "55%" }]
      },
      {
        id: "lapse-blue",
        num: 2,
        name: "Lapse: Blue (Синий: Схождение)",
        type: "Активное",
        isUltimate: false,
        castTime: "1 сек",
        manaCost: ["35", "50", "65", "80"],
        cooldown: "16 / 12 / 8 / 4 сек",
        description: "Создает точку отрицательного пространства до 10 клеток: стягивает всех врагов в радиусе 2 клеток к центру и наносит урон сжатия.",
        scalingDesc: "Урон: 30 / 60 / 90 / 120. Радиус притяжения: 2 клетки.",
        scalingValues: [{ level: 1, damage: 30 }, { level: 2, damage: 60 }, { level: 3, damage: 90 }, { level: 4, damage: 120 }]
      },
      {
        id: "reversal-red",
        num: 3,
        name: "Reversal: Red (Красный: Расхождение)",
        type: "Активное",
        isUltimate: false,
        castTime: "1 сек",
        manaCost: ["40", "55", "70", "85"],
        cooldown: "16 / 12 / 8 / 4 сек",
        description: "Вливает обратную проклятую энергию: создает мощную силу отталкивания, отбрасывая цель на 3 клетки назад (+30 урона при ударе о препятствие).",
        scalingDesc: "Урон: 40 / 75 / 110 / 145 (+30 урон об стену). Отталкивание: 3 клетки.",
        scalingValues: [{ level: 1, damage: 40 }, { level: 2, damage: 75 }, { level: 3, damage: 110 }, { level: 4, damage: 145 }]
      },
      {
        id: "hollow-purple",
        num: 4,
        name: "Hollow Purple (Фиолетовый: Аннигиляция)",
        type: "Активное",
        isUltimate: false,
        castTime: "2 сек",
        manaCost: ["80", "100", "120", "140"],
        cooldown: "32 / 24 / 16 / 12 сек",
        description: "Слияние Синего и Красного: рождает мнимую массу, которая летит прямой линией через 12 клеток поля боя и наносит чистый урон сквозь любые укрытия!",
        scalingDesc: "Чистый урон: 80 / 140 / 200 / 260. Дальность: 12 клеток.",
        scalingValues: [{ level: 1, damage: 80 }, { level: 2, damage: 140 }, { level: 3, damage: 200 }, { level: 4, damage: 260 }]
      },
      {
        id: "unlimited-void",
        num: 5,
        name: "Domain: Unlimited Void (Необъятная Пустота)",
        type: "Ультимейт (Расширение Территории)",
        isUltimate: true,
        castTime: "0 сек (Мгновенно)",
        manaCost: ["120", "120", "120"],
        cooldown: "120 / 90 / 60 сек",
        description: "Разворачивает домен Безграничности на область 3x3 клетки. В мозг всех врагов внутри обрушивается бесконечный поток информации: оглушение на 8/12/16 сек (1/1.5/2 хода).",
        scalingDesc: "Длительность паралича: 8 / 12 / 16 секунд (1 / 1.5 / 2 хода). Область: 3x3 клетки.",
        scalingValues: [{ level: 1, duration: "8 сек (1 ход)" }, { level: 2, duration: "12 сек (1.5 хода)" }, { level: 3, duration: "16 сек (2 хода)" }]
      }
    ],
    basicAttacks: "Удары Черной Вспышки (Black Flash): Ближний бой (дальность 1), Базовый урон 40, Крит 80, Пробитие 10."
  },
  {
    id: "sukuna",
    name: "Ryomen Sukuna",
    title: "Двуликий Призрак / Король Проклятий (King of Curses)",
    universe: "Jujutsu Kaisen",
    dndRole: "Повелитель Разрезов / Боец Разрушения (Cursed Berserker)",
    themeColor: "#450a0a",
    accentColor: "#ef4444",
    cardImage: "/avatars/sukuna_avatar.svg",
    avatar: "/avatars/sukuna_avatar.svg",
    quote: "Знай свое место, ничтожество.",
    description: "Древнейший Король Проклятий с 4 руками и 4 глазами. Невосприимчив к любым ядам. Мгновенно рассекает врагов на части техникой Dismantle, режет сквозь 100% брони ударом Cleave и сжигает божественным пламенем.",
    stats: {
      hp: 110,
      hpRegen: "+3/ход",
      mana: 100,
      manaRegen: "+10/ход",
      damage: 45,
      period: 4,
      crit: 85,
      range: 12,
      penetration: 15,
      accuracy: 55,
      speed: 6,
      armor: 4,
      agility: 2
    },
    skills: [
      {
        id: "king-of-curses",
        num: 1,
        name: "King of Curses (Король Проклятий)",
        type: "Встроенное (Пассивное)",
        isUltimate: false,
        castTime: "Пассивно",
        manaCost: ["0", "0", "0", "0"],
        cooldown: "Нет",
        description: "Тело Сукуны — смертоносный яд: ПОЛНЫЙ ИММУНИТЕТ к ядам, кровотечениям и гниению (Rot Пуджа не наносит урона!). За каждого убитого врага поглощает силу пальца: +5 к максимальному HP и +3 к базовому урону (макс. +50 HP / +30 урона).",
        scalingDesc: "Иммунитет к ядам. +5 HP и +3 урона за убийство героя.",
        scalingValues: [{ level: 1, bonusPerKill: "+5 HP / +3 урона" }]
      },
      {
        id: "dismantle",
        num: 2,
        name: "Dismantle (Рассечение)",
        type: "Активное",
        isUltimate: false,
        castTime: "0 сек (Мгновенно)",
        manaCost: ["30", "40", "50", "60"],
        cooldown: "8 / 6 / 4 / 2 сек",
        description: "Невидимый летящий разрез на расстояние до 12 клеток. Наносит быстрый физический урон с бронепробитием 15.",
        scalingDesc: "Урон: 35 / 70 / 105 / 140. Бронепробитие: 15. КД: 8 / 6 / 4 / 2 сек.",
        scalingValues: [
          { level: 1, damage: 35, cd: "8 сек" },
          { level: 2, damage: 70, cd: "6 сек" },
          { level: 3, damage: 105, cd: "4 сек" },
          { level: 4, damage: 140, cd: "2 сек" }
        ]
      },
      {
        id: "cleave",
        num: 3,
        name: "Cleave (Расщепление)",
        type: "Активное",
        isUltimate: false,
        castTime: "1 сек",
        manaCost: ["45", "60", "75", "90"],
        cooldown: "12 / 10 / 8 / 6 сек",
        description: "Разрез вблизи (дальность 2 клетки), подстраивающийся под плотность цели: ПОЛНОСТЬЮ ИГНОРИРУЕТ 100% БРОНИ цели и наносит чистый урон!",
        scalingDesc: "Чистый урон: 40 / 75 / 110 / 145 (игнорирует всю броню цели). Дальность: 2 клетки.",
        scalingValues: [
          { level: 1, damage: 40 },
          { level: 2, damage: 75 },
          { level: 3, damage: 110 },
          { level: 4, damage: 145 }
        ]
      },
      {
        id: "furnace-open",
        num: 4,
        name: "Furnace: «Open» (Божественное Пламя)",
        type: "Активное",
        isUltimate: false,
        castTime: "2 сек",
        manaCost: ["70", "90", "110", "130"],
        cooldown: "24 / 20 / 16 / 12 сек",
        description: "Сукуна произносит «Откройся» (Fuuga) и выпускает пылающую стрелу, взрывающую область 3x3 клетки шквалом огня.",
        scalingDesc: "Урон по площади: 60 / 110 / 160 / 210. Область: 3x3 клетки. Дальность: 10.",
        scalingValues: [
          { level: 1, damage: 60 },
          { level: 2, damage: 110 },
          { level: 3, damage: 160 },
          { level: 4, damage: 210 }
        ]
      },
      {
        id: "malevolent-shrine",
        num: 5,
        name: "Domain: Malevolent Shrine (Зловещая Гробница)",
        type: "Ультимейт (Открытая Территория)",
        isUltimate: true,
        castTime: "0 сек (Мгновенно)",
        manaCost: ["100", "125", "150"],
        cooldown: "100 / 80 / 60 сек",
        description: "Призывает открытый домен без барьера радиусом 4 клетки. Каждый раунд наносит шквал разрезов Dismantle и Cleave по всем врагам в радиусе поражения!",
        scalingDesc: "Периодический урон территории: 30 / 60 / 90 каждый ход по всем врагам. Длительность: 8 сек (1 ход).",
        scalingValues: [
          { level: 1, dps: 30, cd: "100 сек" },
          { level: 2, dps: 60, cd: "80 сек" },
          { level: 3, dps: 90, cd: "60 сек" }
        ]
      }
    ],
    basicAttacks: "Когти и невидимые удары разрезов: Дальность 12, Базовый урон 45, Крит 85, Пробитие 15."
  }
];


