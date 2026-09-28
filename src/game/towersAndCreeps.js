// Towers, Creeps, and Roshan Entities & AI Logic
// Driven by data configurations from towerData.js and combatRules.js

import { generateInitialTowers } from '../data/towerData.js';
import { CREEP_CAMPS_DATA } from '../data/dota95Data.js';
import { CREEP_CONFIG } from '../data/combatConfig.js';
import { getNextCreepWave, canSpawnNeutralCamp } from './combatRules.js';
import { getDistance } from './pathfinding.js';
import { resolveAttackRoll, applyDamage, DAMAGE_TYPES } from './damage.js';
import { applyStatus, STATUS_TYPES } from './statuses.js';

// Initialize Towers state from data-driven towerData config
export function createInitialTowers() {
  return generateInitialTowers();
}

// Initialize Roshan state
export function createInitialRoshan() {
  return {
    id: 'roshan',
    name: 'Рошан (Бессмертный)',
    r: 24,
    c: 42,
    hp: 850,
    maxHp: 850,
    armor: 16,
    penetration: 16,
    hit: 22,
    averageDamage: 85,
    team: 'neutral',
    isDead: false,
    abilities: [
      { id: 'roshan_slam', name: 'Roshan Slam', desc: 'Удар по земле: 150 урона и Замедление вокруг.', damage: 150, area: 3 },
      { id: 'roshan_roar', name: 'Устрашающий Рев', desc: 'Оглушает всех в радиусе 4 клеток на 1 ход.', area: 4 }
    ]
  };
}

/**
 * Spawn wave of lane creeps matching the exact required formation cycle:
 * Cycle:
 *   1: 1 ranged + 4 melee
 *   2: 2 ranged + 3 melee
 *   3: 2 ranged + 5 melee
 *   4: 4 ranged + 5 melee
 *   (Repeats every 60 seconds)
 * 
 * @param {number} [waveIndex=0] - 0-indexed wave count
 * @returns {Array} Array of spawned creep entities
 */
export function spawnCreepWave(waveIndex = 0) {
  const lanes = ['top', 'mid', 'bot'];
  const creeps = [];

  const { rangedCount, meleeCount, cycleStep } = getNextCreepWave(waveIndex);

  const laneStarts = {
    radiant: {
      top: { r: 76, c: 8 },
      mid: { r: 76, c: 18 },
      bot: { r: 86, c: 24 }
    },
    dire: {
      top: { r: 8, c: 74 },
      mid: { r: 18, c: 76 },
      bot: { r: 24, c: 86 }
    }
  };

  lanes.forEach(lane => {
    // 1. Radiant Creeps
    for (let i = 0; i < meleeCount; i++) {
      creeps.push({
        id: `rad_melee_${lane}_w${waveIndex}_${i}`,
        name: `Мечник Radiant (${lane.toUpperCase()})`,
        team: 'radiant',
        lane,
        creepRole: 'melee',
        r: laneStarts.radiant[lane].r,
        c: laneStarts.radiant[lane].c,
        hp: 60,
        maxHp: 60,
        armor: 4,
        penetration: 6,
        hit: 14,
        averageDamage: 24,
        agility: 8,
        range: 1,
        speed: 4,
        isDead: false
      });
    }
    for (let i = 0; i < rangedCount; i++) {
      creeps.push({
        id: `rad_ranged_${lane}_w${waveIndex}_${i}`,
        name: `Маг Radiant (${lane.toUpperCase()})`,
        team: 'radiant',
        lane,
        creepRole: 'ranged',
        r: laneStarts.radiant[lane].r,
        c: laneStarts.radiant[lane].c,
        hp: 45,
        maxHp: 45,
        armor: 2,
        penetration: 8,
        hit: 16,
        averageDamage: 28,
        agility: 10,
        range: 4,
        speed: 4,
        isDead: false
      });
    }

    // 2. Dire Creeps
    for (let i = 0; i < meleeCount; i++) {
      creeps.push({
        id: `dire_melee_${lane}_w${waveIndex}_${i}`,
        name: `Мечник Dire (${lane.toUpperCase()})`,
        team: 'dire',
        lane,
        creepRole: 'melee',
        r: laneStarts.dire[lane].r,
        c: laneStarts.dire[lane].c,
        hp: 60,
        maxHp: 60,
        armor: 4,
        penetration: 6,
        hit: 14,
        averageDamage: 24,
        agility: 8,
        range: 1,
        speed: 4,
        isDead: false
      });
    }
    for (let i = 0; i < rangedCount; i++) {
      creeps.push({
        id: `dire_ranged_${lane}_w${waveIndex}_${i}`,
        name: `Маг Dire (${lane.toUpperCase()})`,
        team: 'dire',
        lane,
        creepRole: 'ranged',
        r: laneStarts.dire[lane].r,
        c: laneStarts.dire[lane].c,
        hp: 45,
        maxHp: 45,
        armor: 2,
        penetration: 8,
        hit: 16,
        averageDamage: 28,
        agility: 10,
        range: 4,
        speed: 4,
        isDead: false
      });
    }
  });

  return creeps;
}

/**
 * Spawn neutral creeps in unoccupied camps.
 * If camp is occupied by any creature, spawn is cancelled for that camp.
 * Formation is randomly chosen from formation templates.
 */
export function spawnNeutralCreeps(existingNeutrals, allMapObjects) {
  const newNeutrals = [];
  const templates = CREEP_CONFIG.NEUTRAL_FORMATION_TEMPLATES;

  CREEP_CAMPS_DATA.forEach(camp => {
    if (camp.type === 'roshan') return; // Roshan has independent spawn

    // Check if camp is currently occupied
    const canSpawn = canSpawnNeutralCamp(camp, allMapObjects);
    if (!canSpawn) return;

    // Pick random formation template for this camp type
    const campTemplates = templates[camp.type] || templates.medium;
    const selectedTemplate = campTemplates[Math.floor(Math.random() * campTemplates.length)];

    let offsetIdx = 0;
    selectedTemplate.units.forEach(unitDef => {
      for (let i = 0; i < unitDef.count; i++) {
        const offsetR = (offsetIdx % 2 === 0 ? 0 : 1) * (i > 1 ? -1 : 1);
        const offsetC = (offsetIdx % 2 === 1 ? 0 : 1) * (i > 0 ? 1 : 0);
        offsetIdx++;

        newNeutrals.push({
          id: `neutral_${camp.id}_${unitDef.type}_${Date.now()}_${i}`,
          name: unitDef.name,
          team: 'neutral',
          campId: camp.id,
          campType: camp.type,
          r: camp.r + offsetR,
          c: camp.c + offsetC,
          hp: unitDef.hp,
          maxHp: unitDef.hp,
          armor: unitDef.armor,
          penetration: unitDef.hit ? Math.round(unitDef.hit * 0.7) : 8,
          hit: unitDef.hit || 14,
          averageDamage: unitDef.avgDmg,
          agility: unitDef.agi || 10,
          range: 1,
          speed: 3,
          isDead: false
        });
      }
    });
  });

  return newNeutrals;
}

/**
 * Execute Tower AI attack against nearest enemy unit within range
 * Powered by resolveAttackRoll (hit, damage roll, crits, armor penetration).
 */
export function executeTowerAttacks(towers, heroes, creeps, options = {}) {
  const logs = [];
  const updatedHeroes = [...heroes];
  const updatedCreeps = [...creeps];

  towers.forEach(tower => {
    if (tower.isDead || (tower.currentHp ?? tower.hp) <= 0) return;

    // Find nearest living enemy hero or creep
    const enemyHeroes = updatedHeroes.filter(h => h.team !== tower.team && !h.isDead);
    const enemyCreeps = updatedCreeps.filter(c => c.team !== tower.team && !c.isDead);
    const potentialTargets = [...enemyHeroes, ...enemyCreeps];

    let nearestTarget = null;
    let minDistance = 999;

    potentialTargets.forEach(tgt => {
      const dist = getDistance(tower.r, tower.c, tgt.r, tgt.c);
      if (dist <= tower.range && dist < minDistance) {
        minDistance = dist;
        nearestTarget = tgt;
      }
    });

    if (nearestTarget) {
      const attackRes = resolveAttackRoll(tower, nearestTarget, options);
      if (attackRes.isHit) {
        nearestTarget.hp = Math.max(0, nearestTarget.hp - attackRes.finalDamage);
        if (nearestTarget.hp <= 0) nearestTarget.isDead = true;

        const critText = attackRes.isCrit ? ' 💥 КРИТИЧЕСКИЙ УДАР!' : '';
        logs.push({
          type: 'TOWER_ATTACK',
          text: `🗼 ${tower.name} атакует ${nearestTarget.name}: ${attackRes.finalDamage} урона${critText}! (HP: ${nearestTarget.hp})`
        });
      } else {
        logs.push({
          type: 'TOWER_ATTACK',
          text: `🗼 ${tower.name} промахнулась по ${nearestTarget.name} (${attackRes.status})!`
        });
      }
    }
  });

  return { updatedHeroes, updatedCreeps, logs };
}

// Execute Roshan retaliation when approached or attacked
export function executeRoshanTurn(roshan, heroes) {
  if (!roshan || roshan.isDead || roshan.hp <= 0) return { roshan, updatedHeroes: heroes, logs: [] };

  const logs = [];
  const updatedHeroes = [...heroes];

  // Find heroes near Roshan Pit (within 4 cells)
  const nearbyEnemies = updatedHeroes.filter(h => !h.isDead && getDistance(roshan.r, roshan.c, h.r, h.c) <= 4);

  if (nearbyEnemies.length > 0) {
    nearbyEnemies.forEach(tgt => {
      const attackRes = resolveAttackRoll(roshan, tgt);
      if (attackRes.isHit) {
        tgt.hp = Math.max(0, tgt.hp - attackRes.finalDamage);
        if (tgt.hp <= 0) tgt.isDead = true;
        applyStatus(tgt, STATUS_TYPES.SLOW, 1);

        logs.push({
          type: 'ROSHAN_ATTACK',
          text: `👹 Рошан наносит сокрушительный удар по ${tgt.name}: ${attackRes.finalDamage} физ. урона и Замедление!`
        });
      }
    });
  }

  return { roshan, updatedHeroes, logs };
}
