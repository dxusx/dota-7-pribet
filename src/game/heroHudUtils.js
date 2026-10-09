/**
 * Hero HUD & Ability Tooltip Utilities for Dota 7 Pribet
 * Modeled after Dota 2 interface specifications:
 * - Detailed skill breakdown: Target Type, Affects, Damage Type, Attributes
 * - Hero derived stats: Armor reduction, Evasion, HP/MP regen, Action time
 */

import { TURN_DURATION_SECONDS } from './combatRules.js';

export const HERO_CLASS_METADATA = {
  STRENGTH: {
    label: 'СИЛА',
    symbol: '✊',
    color: '#ef4444',
    bg: 'bg-rose-950/40',
    border: 'border-rose-500/50',
    desc: 'Увеличивает живучесть и устойчивость к физ. урону',
  },
  AGILITY: {
    label: 'ЛОВКОСТЬ',
    symbol: '⚡',
    color: '#10b981',
    bg: 'bg-emerald-950/40',
    border: 'border-emerald-500/50',
    desc: 'Увеличивает уклонение, скорость шагов и точность',
  },
  INTELLIGENCE: {
    label: 'ИНТЕЛЛЕКТ',
    symbol: '🔮',
    color: '#38bdf8',
    bg: 'bg-sky-950/40',
    border: 'border-sky-500/50',
    desc: 'Увеличивает запас и регенерацию маны, силу заклинаний',
  },
};

const PURE_DAMAGE_SKILLS = new Set([
  'counter-helix',
  'cleave',
  'sun-strike',
  'hollow-purple',
  'divine-axe',
]);

const PHYSICAL_DAMAGE_SKILLS = new Set([
  'culling-blade',
  'bouncing-blade',
  'bayonet-throw',
  'whirlwind-slash',
  'awp-wallbang',
  'thy-end-is-now',
  'dismantle',
]);

const ENEMY_HERO_ONLY_SKILLS = new Set([
  'spell-steal',
  'mind-control',
  'divine-rapier',
  'prion',
]);

const POINT_SKILLS = new Set([
  'meat-hook',
  'shunpo',
  'barrier-seal',
  'sun-strike',
  'chaos-meteor',
  'shadowraze-near',
  'shadowraze-medium',
  'shadowraze-far',
  'awp-wallbang',
  'oneway-smoke',
  'flashbang',
  'furnace-open',
  'hollow-purple',
  'everywhere-nowhere',
  'light-speed',
  'prepare-thyself',
  'crush',
]);

const SELF_OR_AOE_SKILLS = new Set([
  'stars-agent',
  'mastermind',
  'ouroboros',
  'wesker-speed',
  'berserkers-call',
  'counter-helix',
  'voracity',
  'preparation',
  'death-lotus',
  'superhuman',
  'whirlwind-slash',
  'divine-regen',
  'infinity-shield',
  'unlimited-void',
  'king-of-curses',
  'malevolent-shrine',
  'rot',
  'flesh-heap',
  'requiem-of-souls',
  'clutch-master',
  'dead-alive',
  'last-cat-live',
  'army-of-souls',
  'cromwell-seal-2',
  'cromwell-seal-1',
  'cromwell-seal-0',
  'angel-rage',
  'angel-power',
]);

/**
 * Returns comprehensive, structured Dota-style tooltip metadata for an ability.
 */
export function getSkillDetails(skill, hero = null) {
  if (!skill) return null;

  const isPassive = skill.type === 'PASSIVE';
  let targetType = 'Направленная на юнита';
  let affects = 'Вражеские юниты';

  if (isPassive) {
    targetType = 'Пассивная';
    affects = 'Герой';
  } else if (ENEMY_HERO_ONLY_SKILLS.has(skill.id)) {
    targetType = 'Направленная на вражеского героя';
    affects = 'Вражеские герои';
  } else if (POINT_SKILLS.has(skill.id)) {
    targetType = 'Направленная на область / точку';
    affects = 'Враги в области';
  } else if (SELF_OR_AOE_SKILLS.has(skill.id)) {
    targetType = skill.radius ? 'Ненаправленная (по площади вокруг)' : 'Ненаправленная (на себя)';
    affects = skill.radius ? 'Все враги в радиусе' : 'Герой';
  }

  // Damage type
  let damageType = null;
  if (PURE_DAMAGE_SKILLS.has(skill.id)) {
    damageType = 'Чистый';
  } else if (PHYSICAL_DAMAGE_SKILLS.has(skill.id)) {
    damageType = 'Физический';
  } else if (
    skill.damage ||
    skill.damagePercent ||
    skill.id === 'telekinesis' ||
    skill.id === 'fade-bolt' ||
    skill.id === 'cold-snap' ||
    skill.id === 'dismember' ||
    (!isPassive && (skill.manaCost > 0 || skill.range > 0))
  ) {
    damageType = 'Магический';
  }

  // Attributes list
  const attributes = [];

  if (skill.damage) {
    attributes.push({ label: 'Урон', value: `${skill.damage}` });
  }
  if (skill.damagePercent) {
    attributes.push({ label: 'Урон от текущего HP', value: `${Math.round(skill.damagePercent * 100)}%` });
  }
  if (skill.range) {
    attributes.push({ label: 'Дальность применения', value: `${skill.range} кл.` });
  }
  if (skill.radius) {
    attributes.push({ label: 'Радиус действия', value: `${skill.radius} кл.` });
  }
  if (skill.duration) {
    attributes.push({ label: 'Длительность эффекта', value: `${skill.duration} сек` });
  }
  if (!isPassive && skill.timeCost !== undefined) {
    attributes.push({ label: 'Время применения', value: `${skill.timeCost} сек` });
  }

  // Skill-specific mechanic highlights
  if (skill.id === 'culling-blade') {
    attributes.push({ label: 'Порог добивания', value: 'При убийстве сброс КД' });
  } else if (skill.id === 'fade-bolt') {
    attributes.push({ label: 'Снижение урона цели', value: '-15%' });
  } else if (skill.id === 'telekinesis') {
    attributes.push({ label: 'Оглушение цели', value: '2.0 сек' });
  } else if (skill.id === 'dismember') {
    attributes.push({ label: 'Исцеление заклинателя', value: '+60 HP' });
    attributes.push({ label: 'Безмолвие цели', value: '3.0 сек' });
  } else if (skill.id === 'cold-snap') {
    attributes.push({ label: 'Заморозка цели', value: '1.0 сек' });
  } else if (skill.id === 'battle-hunger') {
    attributes.push({ label: 'Замедление цели', value: '-2 скорости' });
  } else if (skill.id === 'spell-steal') {
    attributes.push({ label: 'Тип кражи', value: 'Активная способность цели' });
  } else if (skill.id === 'mind-control') {
    attributes.push({ label: 'Безмолвие', value: '8.0 сек' });
  } else if (skill.id === 'divine-axe') {
    attributes.push({ label: 'Пробитие брони', value: '100 (Абсолютное)' });
  } else if (skill.id === 'blood-drain') {
    attributes.push({ label: 'Исцеление', value: '20 HP (+3 за душу)' });
  }

  return {
    id: skill.id,
    name: skill.name,
    type: skill.type,
    isPassive,
    targetType,
    affects,
    damageType,
    attributes,
    desc: skill.desc || '',
    timeCost: skill.timeCost || 0,
    manaCost: skill.manaCost || 0,
    cooldown: skill.cooldown || 0,
    currentCooldown: skill.currentCooldown || 0,
    isStolen: Boolean(skill.isStolen),
  };
}

/**
 * Computes derived statistics, percentage scalings, and tooltips for hero HUD.
 */
export function getHeroDerivedStats(hero) {
  if (!hero) return null;

  const level = hero.level || 1;
  const xp = hero.xp || 0;
  const nextLvlXp = level * 100;
  const xpPercent = Math.min(100, Math.round((xp / nextLvlXp) * 100));

  const armor = hero.armor || 0;
  // Dota armor formula: damage reduction = (0.06 * armor) / (1 + 0.06 * |armor|)
  const armorReductionRatio = (0.06 * armor) / (1 + 0.06 * Math.abs(armor));
  const armorReductionPercent = Number((armorReductionRatio * 100).toFixed(1));

  const agility = hero.agility || 1;
  // Agility evasion formula: up to 50% max
  const evasionRatio = Math.min(0.5, agility * 0.01);
  const evasionPercent = Number((evasionRatio * 100).toFixed(1));

  const speed = hero.speed || 6;
  const stepTimeCost = Number(((TURN_DURATION_SECONDS) / speed).toFixed(2));

  const hpRegen = hero.hpRegen || 5;
  const manaRegen = hero.manaRegen || 10;

  const heroClass = hero.heroClass || 'STRENGTH';
  const classMeta = HERO_CLASS_METADATA[heroClass] || HERO_CLASS_METADATA.STRENGTH;

  return {
    level,
    xp,
    nextLvlXp,
    xpPercent,
    armor,
    armorReductionPercent,
    agility,
    evasionPercent,
    damage: hero.damage || 0,
    penetration: hero.penetration || 0,
    range: hero.range || 1,
    speed,
    stepTimeCost,
    hp: hero.hp,
    maxHp: hero.maxHp,
    hpPercent: Math.max(0, Math.min(100, Math.round((hero.hp / hero.maxHp) * 100))),
    hpRegen,
    hpRegenText: `+${hpRegen.toFixed(1)} HP/с`,
    mana: hero.mana,
    maxMana: hero.maxMana,
    manaPercent: Math.max(0, Math.min(100, Math.round((hero.mana / hero.maxMana) * 100))),
    manaRegen,
    manaRegenText: `+${manaRegen.toFixed(1)} MP/с`,
    heroClass,
    classMeta,
  };
}
