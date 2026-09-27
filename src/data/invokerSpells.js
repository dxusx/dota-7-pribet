// Full Invoker Spells Dictionary & Combination Resolver
export const INVOKER_SPELLS = {
  "QQQ": {
    id: "cold-snap",
    name: "Cold Snap",
    combo: "QQQ",
    castTime: "0 сек (Мгновенно)",
    manaCost: 75,
    cooldown: 12,
    description: "Замораживает врага ледяной хваткой. При получении любого урона цель повторно оглушается на 0.4 сек и получает дополнительный урон.",
    scalingDesc: "Длительность: 4 / 6 / 8 / 10 секунд. Оглушение при каждом ударе. Замедление 10%.",
    damage: 60,
    range: 15,
    type: "Контроль / Заморозка"
  },
  "QQW": {
    id: "ghost-walk",
    name: "Ghost Walk",
    combo: "QQW",
    castTime: "0 сек",
    manaCost: 100,
    cooldown: 24,
    description: "Инвокер манипулирует льдом и электричеством, становясь полностью невидимым. Все противники вокруг замедляются на 20-40%.",
    scalingDesc: "Невидимость на 16-32 сек. Замедление врагов вокруг до 40%.",
    damage: 0,
    range: 0,
    type: "Невидимость / Побег"
  },
  "QQE": {
    id: "ice-wall",
    name: "Ice Wall",
    combo: "QQE",
    castTime: "1 сек",
    manaCost: 125,
    cooldown: 16,
    description: "Воздвигает непроходимую стену вечного льда прямо перед собой шириной в 5 клеток. Враги, коснувшиеся стены, замедляются на 80% и получают периодический урон.",
    scalingDesc: "Замедление: 40% / 60% / 80% / 100%. Урон: 20/30/40 в секунду. Длительность: 8 сек.",
    damage: 80,
    range: 6,
    type: "Зональный контроль"
  },
  "WWW": {
    id: "emp",
    name: "EMP",
    combo: "WWW",
    castTime: "2 сек",
    manaCost: 125,
    cooldown: 24,
    description: "Накапливает электромагнитный заряд и взрывает область радиусом 4 клетки: сжигает 100 маны у всех противников и наносит чистый урон, равный сожженной мане!",
    scalingDesc: "Сжигание маны: 50 / 100 / 150 / 200. Урон = сожженная мана. Восстанавливает 50% маны Инвокеру.",
    damage: 150,
    range: 15,
    type: "Сжигание маны"
  },
  "WWQ": {
    id: "tornado",
    name: "Tornado",
    combo: "WWQ",
    castTime: "1 сек",
    manaCost: 125,
    cooldown: 20,
    description: "Запускает стремительный вихрь через клетки поля боя. Поднимает всех задетых врагов в воздух (делая неуязвимыми и обездвиженными), а при приземлении наносит урон и развеивает баффы.",
    scalingDesc: "Дальность: 12 / 16 / 20 / 24 клетки. Время в воздухе: 2 / 3 / 4 сек. Урон: 80 / 140 / 200.",
    damage: 180,
    range: 20,
    type: "Дизейбл / Развеивание"
  },
  "WWE": {
    id: "alacrity",
    name: "Alacrity",
    combo: "WWE",
    castTime: "0 сек",
    manaCost: 60,
    cooldown: 12,
    description: "Наполняет тело невероятным электрическим зарядом и яростью: увеличивает скорость атаки на 50% и добавляет +40 к урону каждого удара на 8 секунд.",
    scalingDesc: "+20 / 40 / 60 / 80 к базовому урону и +50% к скорости атак.",
    damage: 0,
    range: 10,
    type: "Бафф урона и скорости"
  },
  "EEE": {
    id: "sun-strike",
    name: "Sun Strike",
    combo: "EEE",
    castTime: "2 сек",
    manaCost: 150,
    cooldown: 20,
    description: "Призывает катастрофический столб солнечного света в абсолютно ЛЮБУЮ клетку 2D карты! Наносит чистый смертоносный урон, игнорирующий броню.",
    scalingDesc: "Урон: 120 / 240 / 360 / 480 чистого урона (делится поровну между целями в клетке).",
    damage: 360,
    range: 99,
    type: "Глобальный чистый урон"
  },
  "EEQ": {
    id: "forge-spirit",
    name: "Forge Spirit",
    combo: "EEQ",
    castTime: "1 сек",
    manaCost: 75,
    cooldown: 24,
    description: "Материализует огненного элементаля, который атакует с дистанции. Каждая атака духа снижает броню цели на 1 единицу.",
    scalingDesc: "ХП духа: 100 / 150 / 200. Урон духа: 30 / 45 / 60. Снижение брони цели до -10.",
    damage: 50,
    range: 10,
    type: "Призыв питомца"
  },
  "EEW": {
    id: "chaos-meteor",
    name: "Chaos Meteor",
    combo: "EEW",
    castTime: "1.5 сек",
    manaCost: 175,
    cooldown: 40,
    description: "Обрушивает с неба пылающий метеорит, который катится вперед на 8 клеток, оставляя огненный след. Наносит чудовищный первоначальный урон и поджигает врагов.",
    scalingDesc: "Урон удара: 150 / 250 / 350. Периодический урон горения: 30 / 50 / 70/сек на 4 сек.",
    damage: 320,
    range: 12,
    type: "Катастрофический урон"
  },
  "QWE": {
    id: "deafening-blast",
    name: "Deafening Blast",
    combo: "QWE",
    castTime: "1 сек",
    manaCost: 150,
    cooldown: 32,
    description: "Выпускает звуковую ударную волну во все стороны. Наносит урон, отталкивает всех врагов на 4 клетки назад и ПОЛНОСТЬЮ ОБЕЗОРУЖИВАЕТ их (запрет атак на 4-8 сек)!",
    scalingDesc: "Урон: 80 / 160 / 240 / 320. Отталкивание: 4 клетки. Обезоруживание: 4 / 6 / 8 сек.",
    damage: 220,
    range: 10,
    type: "Ударная волна / Обезоруживание"
  }
};

export function resolveInvokerSpell(orbs) {
  if (!orbs || orbs.length !== 3) return null;
  // Sort orbs alphabetically: E, Q, W -> e.g. "EQW" or count
  const sorted = [...orbs].sort().join('');
  // Map sorted strings to keys in INVOKER_SPELLS
  const map = {
    "QQQ": "QQQ",
    "QQW": "QQW",
    "EQQ": "QQE",
    "WWW": "WWW",
    "QWW": "WWQ",
    "EWW": "WWE",
    "EEE": "EEE",
    "EEQ": "EEQ",
    "EEW": "EEW",
    "EQW": "QWE"
  };
  const key = map[sorted] || "QQQ";
  return INVOKER_SPELLS[key];
}
