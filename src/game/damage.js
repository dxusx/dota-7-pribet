// Combat, Accuracy, and Damage Calculation System
import { rollD20 } from './dice.js';

export const DAMAGE_TYPES = {
  PHYSICAL: 'PHYSICAL',
  MAGIC: 'MAGIC',
  PURE: 'PURE'
};

// Calculate physical damage reduction from Armor
// Using authentic Dota 2 / tactical formula: reduction = (0.05 * armor) / (1 + 0.05 * |armor|)
export function calculatePhysicalDamage(rawDamage, armor = 0) {
  if (armor >= 0) {
    const reduction = (0.05 * armor) / (1 + 0.05 * armor);
    return Math.max(1, Math.round(rawDamage * (1 - reduction)));
  } else {
    // Negative armor amplifies damage
    const amplification = 1 - Math.pow(0.95, -armor);
    return Math.round(rawDamage * (1 + amplification));
  }
}

// Calculate magical damage reduction from Magic Resistance (default 25%)
export function calculateMagicDamage(rawDamage, magicResist = 0.25) {
  const reduction = Math.min(0.9, Math.max(0, magicResist));
  return Math.max(1, Math.round(rawDamage * (1 - reduction)));
}

// Calculate pure damage (unmitigated by armor and magic resist)
export function calculatePureDamage(rawDamage) {
  return Math.max(1, Math.round(rawDamage));
}

// Unified damage mitigation function
export function mitigateDamage(rawDamage, damageType, target) {
  switch (damageType) {
    case DAMAGE_TYPES.PHYSICAL: {
      const armor = parseFloat(target.armor || target.stats?.armor || 0);
      return calculatePhysicalDamage(rawDamage, armor);
    }
    case DAMAGE_TYPES.MAGIC: {
      const magicResist = parseFloat(target.magicResist || target.stats?.magicResist || 0.25);
      return calculateMagicDamage(rawDamage, magicResist);
    }
    case DAMAGE_TYPES.PURE:
    default:
      return calculatePureDamage(rawDamage);
  }
}

// Execute basic attack roll (d20 + attackModifier vs Defense)
export function resolveAttackRoll(attacker, target, options = {}) {
  // Attacker attack modifier (default from stats or level)
  const attackMod = parseInt(attacker.attackMod || attacker.stats?.attackMod || 6, 10);
  
  // Target defense/armor class (default 14 + armor/4)
  const targetArmor = parseFloat(target.armor || target.stats?.armor || 10);
  const targetDefense = Math.round(10 + targetArmor * 0.5);

  const rollResult = rollD20(attackMod, options);
  const { chosenRoll, modifier, total, isCrit, isFail } = rollResult;

  // Natural 20 is always a Critical Hit
  // Natural 1 is always a Critical Miss
  let isHit = false;
  let status = 'MISS';

  if (isCrit) {
    isHit = true;
    status = 'CRIT';
  } else if (isFail) {
    isHit = false;
    status = 'FAIL';
  } else if (total >= targetDefense) {
    isHit = true;
    status = 'HIT';
  } else {
    isHit = false;
    status = 'MISS';
  }

  // Calculate damage on hit
  let baseDamage = 0;
  if (isHit) {
    // Parse damage range like "178 - 186" or base damage 25
    const dmgRange = (attacker.stats?.damage || attacker.damage || '20 - 28').toString();
    const parts = dmgRange.split('-').map(s => parseInt(s.trim(), 10)).filter(n => !isNaN(n));
    const minDmg = parts[0] || 20;
    const maxDmg = parts[1] || minDmg + 8;
    const rolledBase = Math.floor(Math.random() * (maxDmg - minDmg + 1)) + minDmg;

    // Critical hits deal 2x damage!
    baseDamage = isCrit ? rolledBase * 2 : rolledBase;
  }

  const finalDamage = isHit ? mitigateDamage(baseDamage, DAMAGE_TYPES.PHYSICAL, target) : 0;

  return {
    isHit,
    isCrit,
    isFail,
    status,
    roll: chosenRoll,
    modifier,
    total,
    targetDefense,
    rawDamage: baseDamage,
    finalDamage,
    damageType: DAMAGE_TYPES.PHYSICAL
  };
}

// Apply damage to a unit and return new unit state
export function applyDamage(target, amount) {
  const currentHp = target.hp ?? target.maxHp ?? 100;
  const newHp = Math.max(0, currentHp - amount);
  const wasKilled = newHp <= 0;

  return {
    ...target,
    hp: newHp,
    isDead: wasKilled
  };
}

// Apply healing to a unit (cannot exceed maxHp)
export function applyHeal(target, amount) {
  const currentHp = target.hp ?? 0;
  const maxHp = target.maxHp || 100;
  const newHp = Math.min(maxHp, currentHp + amount);

  return {
    ...target,
    hp: newHp
  };
}
