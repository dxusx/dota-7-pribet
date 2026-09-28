// Pure Standalone Combat, Timing, Terrain Advantage, and Creep Simulation Rules
// Strictly adheres to data-driven config - no hardcoded values

import { COMBAT_CONFIG, TIME_CONFIG, CREEP_CONFIG, TERRAIN_CONFIG } from '../data/combatConfig.js';
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
 * 2. Dedicated Terrain Advantage Function (High Ground Mechanics).
 * Implements both sides of the terrain rule and differentiates between ranged and melee:
 *   - Low Ground -> High Ground:
 *       Ranged attacks suffer 30% miss chance (LOW_TO_HIGH_RANGED_MISS_CHANCE = 0.30).
 *       Melee attacks do NOT suffer miss chance uphill (0%).
 *   - High Ground -> Low Ground:
 *       Attacker gains +15% hit chance bonus (HIGH_TO_LOW_HIT_BONUS = 0.15) and 0% miss penalty.
 *   - Equal ground: No modifier.
 * 
 * @param {Object} attacker - Attacker entity { r, c, range, creepRole, elevation }
 * @param {Object} target - Target entity { r, c, elevation }
 * @param {Uint8Array|Array} [mapGrid] - Map tile grid
 * @returns {{
 *   relation: 'LOW_TO_HIGH' | 'HIGH_TO_LOW' | 'EQUAL',
 *   isRanged: boolean,
 *   missChance: number,
 *   hitBonus: number,
 *   hasDisadvantage: boolean,
 *   hasAdvantage: boolean
 * }}
 */
export function calculateTerrainAdvantage(attacker, target, mapGrid) {
  if (!attacker || !target) {
    return {
      relation: 'EQUAL',
      isRanged: false,
      missChance: 0,
      hitBonus: 0,
      hasDisadvantage: false,
      hasAdvantage: false
    };
  }

  // Determine elevations
  let attackerIsHighGround = false;
  let targetIsHighGround = false;

  if (mapGrid && typeof attacker.r === 'number' && typeof target.r === 'number') {
    const attackerTile = mapGrid[attacker.r * 95 + attacker.c];
    const targetTile = mapGrid[target.r * 95 + target.c];
    attackerIsHighGround = (attackerTile === TILE_TYPES.HIGHGROUND);
    targetIsHighGround = (targetTile === TILE_TYPES.HIGHGROUND);
  } else {
    const attackerElev = Number(attacker.elevation) || 0;
    const targetElev = Number(target.elevation) || 0;
    attackerIsHighGround = (attackerElev > targetElev);
    targetIsHighGround = (targetElev > attackerElev);
  }

  // Determine if attack is Ranged or Melee
  const range = Number(attacker.range ?? attacker.stats?.range ?? (attacker.creepRole === 'ranged' ? 4 : 1));
  const isRanged = attacker.isRanged !== undefined
    ? Boolean(attacker.isRanged)
    : (attacker.attackType ? attacker.attackType === 'ranged' : (range > 1.5 || attacker.creepRole === 'ranged'));

  // Both sides of the rule:
  if (!attackerIsHighGround && targetIsHighGround) {
    // 1. Low Ground attacking High Ground (Disadvantage)
    const missChance = isRanged 
      ? TERRAIN_CONFIG.LOW_TO_HIGH_RANGED_MISS_CHANCE 
      : TERRAIN_CONFIG.LOW_TO_HIGH_MELEE_MISS_CHANCE;

    return {
      relation: 'LOW_TO_HIGH',
      isRanged,
      missChance,
      hitBonus: 0,
      hasDisadvantage: missChance > 0,
      hasAdvantage: false
    };
  } else if (attackerIsHighGround && !targetIsHighGround) {
    // 2. High Ground attacking Low Ground (Advantage)
    return {
      relation: 'HIGH_TO_LOW',
      isRanged,
      missChance: TERRAIN_CONFIG.HIGH_TO_LOW_MISS_CHANCE || 0,
      hitBonus: TERRAIN_CONFIG.HIGH_TO_LOW_HIT_BONUS || 0.15,
      hasDisadvantage: false,
      hasAdvantage: true
    };
  }

  // 3. Equal elevation
  return {
    relation: 'EQUAL',
    isRanged,
    missChance: 0,
    hitBonus: 0,
    hasDisadvantage: false,
    hasAdvantage: false
  };
}

/**
 * Backward-compatible helper for low-to-high check.
 */
export function isAttackingFromLowToHighGround(attacker, target, mapGrid) {
  const advantage = calculateTerrainAdvantage(attacker, target, mapGrid);
  return advantage.relation === 'LOW_TO_HIGH';
}

/**
 * 3. Roll Hit check (separate from damage calculation).
 * Evaluates hit chance with terrain advantage / disadvantage.
 * 
 * @param {number} baseHitChance - Calculated hit chance (0.0 to 1.0)
 * @param {Object} [options]
 * @param {Object} [options.terrainAdvantage] - Object from calculateTerrainAdvantage
 * @param {Function} [options.randomFn=Math.random]
 * @returns {{ isHit: boolean, missedDueToHighGround: boolean, reason: string, roll: number }}
 */
export function rollHit(baseHitChance, options = {}) {
  const {
    terrainAdvantage = null,
    hasHighGroundDisadvantage = false,
    highGroundMissChance = TERRAIN_CONFIG.LOW_TO_HIGH_RANGED_MISS_CHANCE,
    randomFn = Math.random
  } = options;

  // Apply terrain hit bonus if attacking downhill
  const hitBonus = terrainAdvantage?.hitBonus || 0;
  const effectiveHitChance = Math.min(1.0, Math.max(0.0, baseHitChance + hitBonus));

  if (effectiveHitChance <= 0) {
    return { isHit: false, missedDueToHighGround: false, reason: 'DODGED', roll: 0 };
  }

  const roll = randomFn();

  // Primary hit check: must roll strictly below effectiveHitChance
  if (roll >= effectiveHitChance) {
    return { isHit: false, missedDueToHighGround: false, reason: 'MISSED', roll };
  }

  // Secondary high ground uphill miss check
  const missUphillChance = terrainAdvantage !== null 
    ? terrainAdvantage.missChance 
    : (hasHighGroundDisadvantage ? highGroundMissChance : 0);

  if (missUphillChance > 0) {
    const hgRoll = randomFn();
    if (hgRoll < missUphillChance) {
      return { isHit: false, missedDueToHighGround: true, reason: 'HIGH_GROUND_MISS', roll };
    }
  }

  return { isHit: true, missedDueToHighGround: false, reason: 'HIT', roll };
}

/**
 * 4. Roll attack damage within 75% to 125% of average damage.
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
 * 5. Critical Strike Roll:
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
 * 6. Armor / Penetration Multiplier:
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
 * 7. Calculate Final Damage:
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
 * 8. Action Validation for Time System:
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
 * 9. Lane Creep Wave Formation Generator:
 * First spawn after 60s, then every 60s.
 * Formation cycle:
 *   0: 1 ranged + 4 melee
 *   1: 2 ranged + 3 melee
 *   2: 2 ranged + 5 melee
 *   3: 4 ranged + 5 melee
 *   (then repeats)
 * 
 * @param {number} waveIndex - 0-indexed wave number
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
 * 10. Neutral Camp Spawn Verification:
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
