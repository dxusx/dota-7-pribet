// Combat, Accuracy, and Damage Calculation System
// Powered by modular, data-driven combatRules engine

import {
  calculateHitChance,
  isAttackingFromLowToHighGround,
  rollHit,
  rollDamage,
  rollCritical,
  calculateArmorMultiplier,
  calculateFinalDamage
} from './combatRules.js';
import { COMBAT_CONFIG } from '../data/combatConfig.js';

export const DAMAGE_TYPES = {
  PHYSICAL: 'PHYSICAL',
  MAGIC: 'MAGIC',
  PURE: 'PURE'
};

// Calculate physical damage reduction from Armor & Penetration
export function calculatePhysicalDamage(rawDamage, armor = 10, penetration = 10) {
  const mult = calculateArmorMultiplier(penetration, armor);
  return calculateFinalDamage(rawDamage, mult);
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
export function mitigateDamage(rawDamage, damageType, target, attacker = {}) {
  switch (damageType) {
    case DAMAGE_TYPES.PHYSICAL: {
      const armor = parseFloat(target.armor ?? target.stats?.armor ?? 10);
      const pen = parseFloat(attacker.penetration ?? attacker.stats?.penetration ?? 10);
      return calculatePhysicalDamage(rawDamage, armor, pen);
    }
    case DAMAGE_TYPES.MAGIC: {
      const magicResist = parseFloat(target.magicResist ?? target.stats?.magicResist ?? 0.25);
      return calculateMagicDamage(rawDamage, magicResist);
    }
    case DAMAGE_TYPES.PURE:
    default:
      return calculatePureDamage(rawDamage);
  }
}

/**
 * Execute tactical attack roll according to game design specifications:
 * 1. Checks hit (Agility / Hit formula)
 * 2. If miss -> 0 damage
 * 3. Checks high ground miss modifier (0.30)
 * 4. If hit -> rolledDamage = averageDamage * random(0.75, 1.25)
 * 5. 5% critical strike -> 2x damage
 * 6. Applies armor/penetration multiplier
 * 7. Applies final damage
 */
export function resolveAttackRoll(attacker, target, options = {}) {
  // 1. Resolve Hit / Accuracy vs Agility
  const attackerHit = parseFloat(
    attacker.hit ?? 
    attacker.stats?.hit ?? 
    (attacker.attackMod ? attacker.attackMod * 2.5 : 18)
  );

  const targetAgility = parseFloat(
    target.agility ?? 
    target.stats?.agility ?? 
    (target.armor ? target.armor * 0.75 : 10)
  );

  const hitChance = calculateHitChance(attackerHit, targetAgility);

  // 2. High Ground Directional check
  const hasHighGroundDisadvantage = isAttackingFromLowToHighGround(attacker, target, options.mapGrid);

  // 3. Roll Hit (does not mix with damage calculation)
  const hitResult = rollHit(hitChance, {
    hasHighGroundDisadvantage,
    highGroundMissChance: COMBAT_CONFIG.HIGH_GROUND_MISS_CHANCE
  });

  // If Miss -> 0 damage
  if (!hitResult.isHit) {
    const status = hitResult.reason === 'HIGH_GROUND_MISS' 
      ? 'MISS (High Ground 30%)' 
      : hitResult.reason === 'DODGED' 
      ? 'DODGED' 
      : 'MISS';

    return {
      isHit: false,
      isCrit: false,
      status,
      hitChance: Math.round(hitChance * 100),
      hasHighGroundDisadvantage,
      rawDamage: 0,
      finalDamage: 0,
      damageType: DAMAGE_TYPES.PHYSICAL
    };
  }

  // 4. Resolve Base Damage (75% to 125% of average damage)
  let averageDmg = 45;
  if (attacker.averageDamage) {
    averageDmg = attacker.averageDamage;
  } else if (attacker.attackDamage) {
    averageDmg = attacker.attackDamage;
  } else if (attacker.stats?.damage || attacker.damage) {
    const dmgRange = (attacker.stats?.damage || attacker.damage).toString();
    const parts = dmgRange.split('-').map(s => parseInt(s.trim(), 10)).filter(n => !isNaN(n));
    if (parts.length >= 2) averageDmg = (parts[0] + parts[1]) / 2;
    else if (parts.length === 1) averageDmg = parts[0];
  }

  const rolledDamage = rollDamage(averageDmg);

  // 5. Critical Strike check (5% chance -> 2x)
  const critResult = rollCritical(rolledDamage);

  // 6. Armor & Penetration multiplier
  const attackerPen = parseFloat(attacker.penetration ?? attacker.stats?.penetration ?? 12);
  const targetArmor = parseFloat(target.armor ?? target.stats?.armor ?? 12);
  const armorMultiplier = calculateArmorMultiplier(attackerPen, targetArmor);

  // 7. Calculate Final Damage
  const finalDamage = calculateFinalDamage(critResult.damage, armorMultiplier);

  const status = critResult.isCrit ? 'CRIT' : 'HIT';

  return {
    isHit: true,
    isCrit: critResult.isCrit,
    status,
    hitChance: Math.round(hitChance * 100),
    hasHighGroundDisadvantage,
    averageDamage: Math.round(averageDmg),
    rolledDamage: Math.round(rolledDamage),
    critDamage: Math.round(critResult.damage),
    armorMultiplier: +armorMultiplier.toFixed(2),
    finalDamage,
    damageType: DAMAGE_TYPES.PHYSICAL
  };
}

// Apply damage to a unit and return new unit state
export function applyDamage(target, amount) {
  const currentHp = target.hp ?? target.currentHp ?? target.maxHp ?? 100;
  const newHp = Math.max(0, currentHp - amount);
  const wasKilled = newHp <= 0;

  return {
    ...target,
    hp: newHp,
    currentHp: newHp,
    isDead: wasKilled
  };
}

// Apply healing to a unit (cannot exceed maxHp)
export function applyHeal(target, amount) {
  const currentHp = target.hp ?? target.currentHp ?? 0;
  const maxHp = target.maxHp || 100;
  const newHp = Math.min(maxHp, currentHp + amount);

  return {
    ...target,
    hp: newHp,
    currentHp: newHp
  };
}
