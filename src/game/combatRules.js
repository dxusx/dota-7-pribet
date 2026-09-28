// Pure Standalone Combat, Timing, and Creep Simulation Rules
// Strictly adheres to data-driven config - no hardcoded values

import { COMBAT_CONFIG, TIME_CONFIG, CREEP_CONFIG } from '../data/combatConfig.js';
import { TILE_TYPES } from '../data/dotaPixelGrid.js';

/**
 * 1. Calculate base hit chance based on attacker's hit and target's agility.
 * Rule:
 *   If agility >= hit: dodgeChance = 1 (hitChance = 0)
 *   Else: dodgeChance = agility / hit (hitChance = 1 - dodgeChance)
 * 
 * @param {number} hit - Attacker accuracy / hit rating
 * @param {number} agility - Target evasion / agility rating
 * @returns {number} Hit chance between 0.0 and 1.0
 */
export function calculateHitChance(hit, agility) {
  const safeHit = Number(hit) || 0;
  const safeAgility = Number(agility) || 0;

  if (safeHit <= 0) return 0;

  if (safeAgility >= safeHit) {
    // 100% dodge -> 0% hit chance
    return 0;
  }

  const dodgeChance = safeAgility / safeHit;
  return Math.max(0, Math.min(1, 1 - dodgeChance));
}

/**
 * Determines whether attacker suffers high-ground penalty.
 * Isolated in a dedicated function so rule direction can be easily modified.
 * 
 * @param {Object} attacker - Attacker entity or coordinate { r, c, elevation }
 * @param {Object} target - Target entity or coordinate { r, c, elevation }
 * @param {Uint8Array|Array} [mapGrid] - Optional map terrain grid
 * @returns {boolean} True if low ground is attacking high ground
 */
export function isAttackingFromLowToHighGround(attacker, target, mapGrid) {
  if (!attacker || !target) return false;

  // Grid-based check if map grid is provided
  if (mapGrid && typeof attacker.r === 'number' && typeof target.r === 'number') {
    const attackerTile = mapGrid[attacker.r * 95 + attacker.c];
    const targetTile = mapGrid[target.r * 95 + target.c];
    const isTargetHighGround = targetTile === TILE_TYPES.HIGHGROUND;
    const isAttackerHighGround = attackerTile === TILE_TYPES.HIGHGROUND;

    return isTargetHighGround && !isAttackerHighGround;
  }

  // Explicit elevation property check
  const attackerElev = Number(attacker.elevation) || 0;
  const targetElev = Number(target.elevation) || 0;
  return attackerElev < targetElev;
}

/**
 * 2. Roll Hit check (separate from damage calculation).
 * Evaluates base hit chance, then applies high-ground miss check if disadvantage applies.
 * 
 * @param {number} hitChance - Calculated hit chance (0.0 to 1.0)
 * @param {Object} [options]
 * @param {boolean} [options.hasHighGroundDisadvantage=false]
 * @param {number} [options.highGroundMissChance=COMBAT_CONFIG.HIGH_GROUND_MISS_CHANCE]
 * @param {Function} [options.randomFn=Math.random]
 * @returns {{ isHit: boolean, missedDueToHighGround: boolean, reason: string, roll: number }}
 */
export function rollHit(hitChance, options = {}) {
  const {
    hasHighGroundDisadvantage = false,
    highGroundMissChance = COMBAT_CONFIG.HIGH_GROUND_MISS_CHANCE,
    randomFn = Math.random
  } = options;

  if (hitChance <= 0) {
    return { isHit: false, missedDueToHighGround: false, reason: 'DODGED', roll: 0 };
  }

  const roll = randomFn();

  // Primary hit check: must roll strictly below hitChance
  if (roll >= hitChance) {
    return { isHit: false, missedDueToHighGround: false, reason: 'MISSED', roll };
  }

  // Secondary high ground disadvantage check
  if (hasHighGroundDisadvantage) {
    const hgRoll = randomFn();
    if (hgRoll < highGroundMissChance) {
      return { isHit: false, missedDueToHighGround: true, reason: 'HIGH_GROUND_MISS', roll };
    }
  }

  return { isHit: true, missedDueToHighGround: false, reason: 'HIT', roll };
}

/**
 * 3. Roll attack damage within 75% to 125% of average damage.
 * Formula: rolledDamage = averageDamage * random(0.75, 1.25)
 * 
 * @param {number} averageDamage - Base average damage
 * @param {Function} [randomFn=Math.random]
 * @returns {number} Rolled damage
 */
export function rollDamage(averageDamage, randomFn = Math.random) {
  const avg = Number(averageDamage) || 0;
  const minMult = COMBAT_CONFIG.ROLL_DAMAGE_MIN;
  const maxMult = COMBAT_CONFIG.ROLL_DAMAGE_MAX;
  const randomFactor = minMult + randomFn() * (maxMult - minMult);
  return avg * randomFactor;
}

/**
 * 4. Critical Strike Roll:
 * 5% probability deals 2x damage.
 * 
 * @param {number} rolledDamage
 * @param {number} [critChance=COMBAT_CONFIG.CRITICAL_CHANCE]
 * @param {number} [critMultiplier=COMBAT_CONFIG.CRITICAL_MULTIPLIER]
 * @param {Function} [randomFn=Math.random]
 * @returns {{ damage: number, isCrit: boolean }}
 */
export function rollCritical(
  rolledDamage, 
  critChance = COMBAT_CONFIG.CRITICAL_CHANCE, 
  critMultiplier = COMBAT_CONFIG.CRITICAL_MULTIPLIER, 
  randomFn = Math.random
) {
  const isCrit = randomFn() < critChance;
  const damage = isCrit ? rolledDamage * critMultiplier : rolledDamage;
  return { damage, isCrit };
}

/**
 * 5. Armor / Penetration Multiplier:
 * If penetration >= armor: damageMultiplier = 1
 * Else: damageMultiplier = penetration / armor
 * 
 * @param {number} penetration - Attacker armor penetration
 * @param {number} armor - Target armor
 * @returns {number} Damage multiplier
 */
export function calculateArmorMultiplier(penetration, armor) {
  const pen = Number(penetration) || 0;
  const arm = Number(armor) || 0;

  if (arm <= 0 || pen >= arm) {
    return 1;
  }
  return pen / arm;
}

/**
 * 6. Calculate Final Damage:
 * finalDamage = rolledDamage * damageMultiplier
 * 
 * @param {number} rolledDamage
 * @param {number} damageMultiplier
 * @returns {number} Final integer damage dealt
 */
export function calculateFinalDamage(rolledDamage, damageMultiplier) {
  const d = Number(rolledDamage) || 0;
  const m = Number(damageMultiplier) || 0;
  return Math.max(0, Math.round(d * m));
}

/**
 * 7. Action Validation for Time System:
 * Turn lasts 8 seconds. Action is permitted only if remainingTime >= timeCost.
 * 
 * @param {number} remainingTime - Remaining turn time in seconds
 * @param {number} actionTimeCost - Time cost of the intended action
 * @returns {boolean} True if action can be performed
 */
export function canPerformAction(remainingTime, actionTimeCost) {
  const rTime = Number(remainingTime) || 0;
  const cost = Number(actionTimeCost) || 0;
  return rTime >= cost;
}

/**
 * 8. Lane Creep Wave Formation Generator:
 * First spawn at 60s, then every 60s.
 * Formation cycle:
 *   0: 1 ranged + 4 melee
 *   1: 2 ranged + 3 melee
 *   2: 2 ranged + 5 melee
 *   3: 4 ranged + 5 melee
 *   (then repeats)
 * 
 * @param {number} waveIndex - 0-indexed wave number (0 = first wave at 60s)
 * @returns {{ waveIndex: number, cycleStep: number, rangedCount: number, meleeCount: number }}
 */
export function getNextCreepWave(waveIndex) {
  const cycle = CREEP_CONFIG.LANE_FORMATION_CYCLE;
  const safeIndex = Math.max(0, parseInt(waveIndex, 10) || 0);
  const cycleStep = safeIndex % cycle.length;
  const formation = cycle[cycleStep];

  return {
    waveIndex: safeIndex,
    cycleStep,
    rangedCount: formation.ranged,
    meleeCount: formation.melee
  };
}

/**
 * 9. Neutral Camp Spawn Verification:
 * First spawn at 120s, then every 60s.
 * If camp is occupied by at least one living creature - spawn is cancelled.
 * 
 * @param {Object} camp - Camp object with { r, c }
 * @param {Array} mapObjects - Array of all active entities (heroes, creeps, etc.)
 * @param {number} [campRadius=CREEP_CONFIG.NEUTRAL_CAMP_SPAWN_RADIUS] - Camp radius
 * @returns {boolean} True if camp is empty and can spawn
 */
export function canSpawnNeutralCamp(camp, mapObjects, campRadius = CREEP_CONFIG.NEUTRAL_CAMP_SPAWN_RADIUS) {
  if (!camp || typeof camp.r !== 'number' || typeof camp.c !== 'number') return false;
  if (!Array.isArray(mapObjects)) return true;

  const isOccupied = mapObjects.some(obj => {
    if (!obj || obj.isDead) return false;
    const dist = Math.hypot(obj.r - camp.r, obj.c - camp.c);
    return dist <= campRadius;
  });

  return !isOccupied;
}
