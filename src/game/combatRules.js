/**
 * Combat Rules & Math Engine according to Google Docs Specification:
 * - 8-second turn time budget
 * - Random damage variance (75% - 125%)
 * - 5% Critical hit chance (2x damage)
 * - Armor vs Penetration (x/n when x < n, 100% when x >= n)
 * - Agility vs Hit evasion (n/x evasion chance, guaranteed evade when n >= x)
 * - High ground advantage (30% miss chance for ranged attacking up)
 * - Fountain respawn timing (1 turn per 15 game turns)
 */

export const TURN_DURATION_SECONDS = 8.0;

/**
 * Checks if a unit has enough remaining time to perform an action.
 */
export function canPerformAction(remainingTime, timeCost) {
  return remainingTime >= timeCost;
}

/**
 * Deducts time cost from remaining turn time.
 */
export function deductActionTime(remainingTime, timeCost) {
  return Math.max(0, Number((remainingTime - timeCost).toFixed(2)));
}

/**
 * Roll damage with 75% - 125% variance.
 */
export function rollDamage(averageDamage, rng = Math.random) {
  const variance = 0.75 + rng() * 0.5; // 0.75 to 1.25
  return averageDamage * variance;
}

/**
 * Calculate Armor / Penetration damage multiplier.
 * n = armor, x = penetration.
 * "Броня коэффициентом n защищает от пробития x, пропуская x/n долю урона.
 * Если x >= n, то получаемый урон полноразмерный без увеличения или уменьшения."
 */
export function calculateArmorMultiplier(armor, penetration) {
  if (armor <= 0) return 1.0;
  if (penetration >= armor) return 1.0;
  return Math.max(0, penetration / armor);
}

/**
 * Calculate Hit chance between Attacker's Hit and Defender's Agility.
 * n = agility, x = hit.
 * "Ловкость коэффициентом n позволяет уклониться от попадания x, позволяя уклониться
 * с шансом n/x, не получая урона. Если n >= x то уклонение гарантированно."
 */
export function calculateHitChance(hit, agility) {
  if (hit <= 0) return 0.0;
  if (agility >= hit) return 0.0; // Guaranteed evasion
  const evasionChance = agility / hit;
  return Math.max(0, Math.min(1.0, 1.0 - evasionChance));
}

/**
 * High Ground Modifier:
 * "Противник, находящийся на уровень ниже своего противника по местности,
 * получает штраф в виде 30% шанса на промах. Действует в обратную сторону для бойцов ближнего боя."
 */
export function getTerrainAccuracyModifier(attackerElevation, targetElevation, isRanged = true) {
  if (attackerElevation < targetElevation) {
    // Attacking up hill
    return isRanged ? 0.70 : 1.0; // 30% penalty for ranged
  }
  if (attackerElevation > targetElevation) {
    // Attacking down hill
    return isRanged ? 1.15 : 1.20; // Advantage
  }
  return 1.0; // Same level
}

/**
 * Full Combat Resolution for a single attack.
 */
export function resolveAttack({
  averageDamage,
  penetration = 0,
  hit = 50,
  targetArmor = 0,
  targetAgility = 0,
  attackerElevation = 1,
  targetElevation = 1,
  isRanged = false,
  critMultiplier = 2.0,
  customCritChance = 0.05,
  rng = Math.random,
}) {
  // 1. Check Hit / Evasion
  const baseHitChance = calculateHitChance(hit, targetAgility);
  const terrainMod = getTerrainAccuracyModifier(attackerElevation, targetElevation, isRanged);
  const finalHitChance = Math.min(1.0, baseHitChance * terrainMod);

  const isHit = rng() < finalHitChance;
  if (!isHit) {
    return {
      isHit: false,
      isCrit: false,
      damage: 0,
      reason: 'MISS',
    };
  }

  // 2. Roll Damage
  const rolled = rollDamage(averageDamage, rng);

  // 3. Check Critical Hit (5% default)
  const isCrit = rng() < customCritChance;
  const damageWithCrit = isCrit ? rolled * critMultiplier : rolled;

  // 4. Apply Armor vs Penetration
  const armorMultiplier = calculateArmorMultiplier(targetArmor, penetration);
  const finalDamage = Math.max(1, Math.round(damageWithCrit * armorMultiplier));

  return {
    isHit: true,
    isCrit,
    damage: finalDamage,
    rawRolled: Math.round(rolled),
    armorMultiplier: Number(armorMultiplier.toFixed(3)),
    reason: isCrit ? 'CRIT' : 'HIT',
  };
}

/**
 * Calculate Respawn Turn delay based on current game turn:
 * - 1 turn (turns 1..15)
 * - 2 turns (turns 16..30)
 * - 3 turns (turns 31..45)
 */
export function getRespawnDelayTurns(gameTurn) {
  if (gameTurn <= 0) return 1;
  return Math.floor((gameTurn - 1) / 15) + 1;
}

/**
 * Experience & Level Up system:
 * - Level 1 -> 2: 100 xp
 * - Level 2 -> 3: 200 xp (+100 per level)
 */
export function getRequiredXpForNextLevel(currentLevel) {
  return currentLevel * 100;
}

/**
 * Lane Creep Level Calculation based on destroyed towers:
 * "Уровень линейных крипов повышается, как только сносится башня такого же уровня, что и уровень крипов."
 * T1 destroyed -> Level 2
 * T2 destroyed -> Level 3
 * T3 destroyed -> Level 4
 * T4 destroyed -> Level 5
 */
export function calculateLaneCreepLevel(towers = []) {
  const isTierDestroyed = tier =>
    towers.some(t => (t.tier === tier || t.id?.includes(`_t${tier}_`)) && (t.isDestroyed || (t.hp !== undefined && t.hp <= 0)));

  if (isTierDestroyed(4)) return 5;
  if (isTierDestroyed(3)) return 4;
  if (isTierDestroyed(2)) return 3;
  if (isTierDestroyed(1)) return 2;
  return 1;
}

/**
 * Class-Based Hero Stat Growth per Level according to Google Docs Specification:
 * - STRENGTH: HP +50%, HP regen +25%, Mana +10%, Mana regen +10%, Dmg +25%, Crit +25%, Pen +25%, Hit +10%, Armor +25%
 * - AGILITY: HP +25%, HP regen +10%, Mana +10%, Mana regen +10%, Dmg +10%, Crit +20%, Pen +10%, Hit +30%, Agi +25%
 * - INTELLIGENCE: HP +10%, HP regen +10%, Mana +50%, Mana regen +25%, Dmg +25%, Crit +25%, Pen +25%, Hit +25%, Armor +10%, Agi +10%
 */
export function applyClassLevelUp(hero) {
  const cls = (hero.heroClass || 'STRENGTH').toUpperCase();
  const nextLvl = (hero.level || 1) + 1;

  if (cls === 'STRENGTH') {
    const nextMaxHp = Math.round(hero.maxHp * 1.50);
    const hpDiff = nextMaxHp - hero.maxHp;
    return {
      ...hero,
      level: nextLvl,
      maxHp: nextMaxHp,
      hp: hero.hp + hpDiff,
      hpRegen: Math.round(hero.hpRegen * 1.25),
      maxMana: Math.round(hero.maxMana * 1.10),
      mana: Math.round(hero.mana * 1.10),
      manaRegen: Math.round(hero.manaRegen * 1.10),
      damage: Math.round(hero.damage * 1.25),
      critDamage: Math.round((hero.critDamage || hero.damage * 2) * 1.25),
      penetration: Math.round(hero.penetration * 1.25),
      hit: Math.round(hero.hit * 1.10),
      armor: Math.round(hero.armor * 1.25),
    };
  }

  if (cls === 'AGILITY') {
    const nextMaxHp = Math.round(hero.maxHp * 1.25);
    const hpDiff = nextMaxHp - hero.maxHp;
    return {
      ...hero,
      level: nextLvl,
      maxHp: nextMaxHp,
      hp: hero.hp + hpDiff,
      hpRegen: Math.round(hero.hpRegen * 1.10),
      maxMana: Math.round(hero.maxMana * 1.10),
      mana: Math.round(hero.mana * 1.10),
      manaRegen: Math.round(hero.manaRegen * 1.10),
      damage: Math.round(hero.damage * 1.10),
      critDamage: Math.round((hero.critDamage || hero.damage * 2) * 1.20),
      penetration: Math.round(hero.penetration * 1.10),
      hit: Math.round(hero.hit * 1.30),
      agility: Math.round(hero.agility * 1.25),
    };
  }

  // INTELLIGENCE
  const nextMaxHp = Math.round(hero.maxHp * 1.10);
  const hpDiff = nextMaxHp - hero.maxHp;
  return {
    ...hero,
    level: nextLvl,
    maxHp: nextMaxHp,
    hp: hero.hp + hpDiff,
    hpRegen: Math.round(hero.hpRegen * 1.10),
    maxMana: Math.round(hero.maxMana * 1.50),
    mana: Math.round(hero.mana * 1.50),
    manaRegen: Math.round(hero.manaRegen * 1.25),
    damage: Math.round(hero.damage * 1.25),
    critDamage: Math.round((hero.critDamage || hero.damage * 2) * 1.25),
    penetration: Math.round(hero.penetration * 1.25),
    hit: Math.round(hero.hit * 1.25),
    armor: Math.round(hero.armor * 1.10),
    agility: Math.round(hero.agility * 1.10),
  };
}

/**
 * Status Effects & Control Mechanics:
 * - Silence: prevents casting skills
 * - Fear: prevents casting skills, reduces speed by 50%
 * - Taunt: prevents casting skills, forces basic attack
 * - Grievous Wounds: reduces healing and regeneration by x%
 */
export function canCastSkills(unit) {
  if (!unit || !unit.statuses) return true;
  if (unit.statuses.silence && unit.statuses.silence.duration > 0) return false;
  if (unit.statuses.fear && unit.statuses.fear.duration > 0) return false;
  if (unit.statuses.taunt && unit.statuses.taunt.duration > 0) return false;
  return true;
}

export function getEffectiveSpeed(unit) {
  const base = unit?.speed || 6;
  if (unit?.statuses?.fear && unit.statuses.fear.duration > 0) {
    return Math.max(1, Math.round(base * 0.5));
  }
  return base;
}

export function calculateHealing(baseHeal, unit) {
  if (!unit || !unit.statuses?.grievous_wounds) return baseHeal;
  const reduction = unit.statuses.grievous_wounds.reduction ?? 0.40;
  return Math.max(0, Math.round(baseHeal * (1 - reduction)));
}

