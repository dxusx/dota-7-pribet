// Towers, Creeps, and Roshan Entities & AI Logic
// Driven by exact specifications from towerData.js, combatConfig.js, and combatRules.js

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
 * Lane Waypoints defining the trajectory towards enemy base for each lane.
 */
export const LANE_WAYPOINTS = {
  radiant: {
    top: [
      { r: 76, c: 8 },
      { r: 8, c: 8 },
      { r: 8, c: 74 }
    ],
    mid: [
      { r: 76, c: 18 },
      { r: 47, c: 47 },
      { r: 18, c: 76 }
    ],
    bot: [
      { r: 86, c: 24 },
      { r: 86, c: 86 },
      { r: 24, c: 86 }
    ]
  },
  dire: {
    top: [
      { r: 8, c: 74 },
      { r: 8, c: 8 },
      { r: 76, c: 8 }
    ],
    mid: [
      { r: 18, c: 76 },
      { r: 47, c: 47 },
      { r: 76, c: 18 }
    ],
    bot: [
      { r: 24, c: 86 },
      { r: 86, c: 86 },
      { r: 86, c: 24 }
    ]
  }
};

/**
 * Move creeps along their lane waypoints towards the enemy base.
 * If an enemy is in attack range, the creep stops to fight.
 */
export function advanceCreepsAlongLanes(creeps, heroes, towers, options = {}) {
  const updatedCreeps = [];
  const logs = [];

  const allEnemies = (team) => [
    ...heroes.filter(h => h.team !== team && !h.isDead),
    ...creeps.filter(c => c.team !== team && !c.isDead),
    ...towers.filter(t => t.team !== team && !t.isDead)
  ];

  creeps.forEach(creep => {
    if (creep.isDead || creep.team === 'neutral') {
      updatedCreeps.push(creep);
      return;
    }

    const enemies = allEnemies(creep.team);
    const attackRange = creep.range || (creep.creepRole === 'ranged' ? 4 : 1);

    // 1. Check if any enemy is currently in attack range
    let nearestEnemy = null;
    let minEnemyDist = 999;
    enemies.forEach(en => {
      const dist = getDistance(creep.r, creep.c, en.r, en.c);
      if (dist <= attackRange && dist < minEnemyDist) {
        minEnemyDist = dist;
        nearestEnemy = en;
      }
    });

    if (nearestEnemy) {
      // Fight enemy in range!
      const atkRes = resolveAttackRoll(creep, nearestEnemy, options);
      if (atkRes.isHit) {
        nearestEnemy.hp = Math.max(0, nearestEnemy.hp - atkRes.finalDamage);
        if (nearestEnemy.hp <= 0) nearestEnemy.isDead = true;
      }
      updatedCreeps.push(creep);
      return;
    }

    // 2. No enemy in range: advance along lane waypoints
    const waypoints = LANE_WAYPOINTS[creep.team]?.[creep.lane];
    if (!waypoints) {
      updatedCreeps.push(creep);
      return;
    }

    // Determine current target waypoint
    let wpIdx = creep.waypointIndex || 0;
    if (wpIdx >= waypoints.length) {
      updatedCreeps.push(creep);
      return;
    }

    let currentWp = waypoints[wpIdx];
    let distToWp = getDistance(creep.r, creep.c, currentWp.r, currentWp.c);

    while (distToWp <= 1 && wpIdx < waypoints.length - 1) {
      wpIdx++;
      currentWp = waypoints[wpIdx];
      distToWp = getDistance(creep.r, creep.c, currentWp.r, currentWp.c);
    }

    const dr = Math.sign(currentWp.r - creep.r);
    const dc = Math.sign(currentWp.c - creep.c);

    // Step forward towards enemy base waypoint using creep speed
    const stepSize = creep.speed || 3;
    let nextR = creep.r;
    let nextC = creep.c;

    if (dr !== 0 && Math.abs(currentWp.r - creep.r) >= Math.abs(currentWp.c - creep.c)) {
      nextR += dr * Math.min(stepSize, Math.abs(currentWp.r - creep.r));
    } else if (dc !== 0) {
      nextC += dc * Math.min(stepSize, Math.abs(currentWp.c - creep.c));
    } else if (dr !== 0) {
      nextR += dr * Math.min(stepSize, Math.abs(currentWp.r - creep.r));
    }

    updatedCreeps.push({
      ...creep,
      r: nextR,
      c: nextC,
      waypointIndex: wpIdx
    });
  });

  return { updatedCreeps, logs };
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

  const { rangedCount, meleeCount } = getNextCreepWave(waveIndex);

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
        r: laneStarts.radiant[lane].r + (i > 1 ? 1 : 0),
        c: laneStarts.radiant[lane].c + (i % 2 === 0 ? 0 : 1),
        hp: 60,
        maxHp: 60,
        armor: 4,
        penetration: 6,
        hit: 14,
        averageDamage: 24,
        agility: 8,
        range: 1,
        speed: 3,
        waypointIndex: 0,
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
        r: laneStarts.radiant[lane].r + (i + 1),
        c: laneStarts.radiant[lane].c,
        hp: 45,
        maxHp: 45,
        armor: 2,
        penetration: 8,
        hit: 16,
        averageDamage: 28,
        agility: 10,
        range: 4,
        speed: 3,
        waypointIndex: 0,
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
        r: laneStarts.dire[lane].r - (i > 1 ? 1 : 0),
        c: laneStarts.dire[lane].c - (i % 2 === 0 ? 0 : 1),
        hp: 60,
        maxHp: 60,
        armor: 4,
        penetration: 6,
        hit: 14,
        averageDamage: 24,
        agility: 8,
        range: 1,
        speed: 3,
        waypointIndex: 0,
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
        r: laneStarts.dire[lane].r - (i + 1),
        c: laneStarts.dire[lane].c,
        hp: 45,
        maxHp: 45,
        armor: 2,
        penetration: 8,
        hit: 16,
        averageDamage: 28,
        agility: 10,
        range: 4,
        speed: 3,
        waypointIndex: 0,
        isDead: false
      });
    }
  });

  return creeps;
}

/**
 * Spawn neutral creeps in unoccupied camps using APPROVED formations and levels from game design.
 * If camp is occupied by any creature, spawn is cancelled for that camp.
 */
export function spawnNeutralCreeps(existingNeutrals, allMapObjects) {
  const newNeutrals = [];
  const approvedFormations = CREEP_CONFIG.APPROVED_NEUTRAL_FORMATIONS;

  CREEP_CAMPS_DATA.forEach(camp => {
    if (camp.type === 'roshan') return;

    // Check if camp is currently occupied
    const canSpawn = canSpawnNeutralCamp(camp, allMapObjects);
    if (!canSpawn) return;

    // Use approved formation for this specific camp
    const formation = approvedFormations[camp.id];
    if (!formation) return;

    let offsetIdx = 0;
    formation.units.forEach(unitDef => {
      for (let i = 0; i < unitDef.count; i++) {
        const offsetR = (offsetIdx % 2 === 0 ? 0 : 1) * (i > 1 ? -1 : 1);
        const offsetC = (offsetIdx % 2 === 1 ? 0 : 1) * (i > 0 ? 1 : 0);
        offsetIdx++;

        newNeutrals.push({
          id: `neutral_${camp.id}_${unitDef.type}_${Date.now()}_${i}`,
          name: unitDef.name,
          team: 'neutral',
          isNeutral: true,
          campId: camp.id,
          campType: camp.type,
          campTier: formation.tier,
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
 * Continuous Game Time Tower AI Attack Processor.
 * Towers have attackPeriod = 4 seconds and attack whenever gameTime >= nextAttackTime.
 * Separated from player turn 8-second time.
 */
export function processContinuousTowerAttacks(towers, heroes, creeps, currentGameTime, options = {}) {
  const logs = [];
  const updatedHeroes = [...heroes];
  const updatedCreeps = [...creeps];
  const updatedTowers = towers.map(tower => {
    if (tower.isDead || (tower.currentHp ?? tower.hp) <= 0) return tower;

    let currentNextAttack = tower.nextAttackTime ?? tower.attackPeriod;
    let towerClone = { ...tower };

    // Fire attack for every 4-second period elapsed
    while (currentGameTime >= currentNextAttack) {
      // Find nearest living enemy hero or creep within 10 cells
      const enemyHeroes = updatedHeroes.filter(h => h.team !== tower.team && !h.isDead);
      const enemyCreeps = updatedCreeps.filter(c => c.team !== tower.team && !c.isDead);
      const potentialTargets = [...enemyHeroes, ...enemyCreeps];

      let nearestTarget = null;
      let minDistance = 999;

      potentialTargets.forEach(tgt => {
        const dist = getDistance(tower.r, tower.c, tgt.r, tgt.c);
        if (dist <= (tower.range || 10) && dist < minDistance) {
          minDistance = dist;
          nearestTarget = tgt;
        }
      });

      if (nearestTarget) {
        const attackRes = resolveAttackRoll(towerClone, nearestTarget, options);
        if (attackRes.isHit) {
          nearestTarget.hp = Math.max(0, nearestTarget.hp - attackRes.finalDamage);
          if (nearestTarget.hp <= 0) nearestTarget.isDead = true;

          const critText = attackRes.isCrit ? ' 💥 КРИТИЧЕСКИЙ ВЫСТРЕЛ (2x)!' : '';
          logs.push({
            type: 'TOWER_ATTACK',
            text: `🗼 ${tower.name} атакует ${nearestTarget.name} [t=${currentNextAttack}s]: ${attackRes.finalDamage} физ. урона${critText} (HP цели: ${nearestTarget.hp})`
          });
        } else {
          logs.push({
            type: 'TOWER_ATTACK',
            text: `🗼 ${tower.name} промахнулась по ${nearestTarget.name} [t=${currentNextAttack}s] (${attackRes.status})!`
          });
        }
      }

      currentNextAttack += tower.attackPeriod;
    }

    towerClone.nextAttackTime = currentNextAttack;
    return towerClone;
  });

  return { updatedTowers, updatedHeroes, updatedCreeps, logs };
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

/**
 * Check and execute timed creep spawns (Lane creeps at 60s + every 60s, Neutrals at 120s + every 60s)
 */
export function checkTimedSpawns(currentCreeps, currentHeroes, currentRoshan, currentGameTime, lastCreepSpawnTime, lastNeutralSpawnTime, creepWaveIndex, round = 1) {
  let creeps = [...currentCreeps];
  let lastCreep = lastCreepSpawnTime;
  let lastNeutral = lastNeutralSpawnTime;
  let waveIdx = creepWaveIndex;
  let logs = [];

  // 1. Lane Creeps: First wave spawns after 60s, then every 60s
  if (currentGameTime >= CREEP_CONFIG.LANE_FIRST_SPAWN_SECONDS &&
      (lastCreep === 0 || (currentGameTime - lastCreep) >= CREEP_CONFIG.LANE_SPAWN_INTERVAL_SECONDS)) {
    const wave = spawnCreepWave(waveIdx);
    creeps = [...creeps.filter(c => !c.isDead), ...wave];
    const { rangedCount, meleeCount } = getNextCreepWave(waveIdx);
    logs.push({
      id: `creep_wave_${Date.now()}`,
      round,
      text: `⚔️ ВОЛНА КРИПОВ #${waveIdx + 1} (${currentGameTime}s): ${meleeCount} мечников + ${rangedCount} магов вышли на линии!`,
      type: 'SYSTEM'
    });
    waveIdx++;
    lastCreep = currentGameTime;
  }

  // 2. Neutral Creeps: First spawn after 120s, then every 60s
  if (currentGameTime >= CREEP_CONFIG.NEUTRAL_FIRST_SPAWN_SECONDS &&
      (lastNeutral === 0 || (currentGameTime - lastNeutral) >= CREEP_CONFIG.NEUTRAL_SPAWN_INTERVAL_SECONDS)) {
    const allLivingUnits = [
      ...currentHeroes.filter(h => !h.isDead),
      ...creeps.filter(c => !c.isDead),
      ...(currentRoshan && !currentRoshan.isDead ? [currentRoshan] : [])
    ];
    const newNeutrals = spawnNeutralCreeps(creeps, allLivingUnits);
    if (newNeutrals.length > 0) {
      creeps = [...creeps, ...newNeutrals];
      logs.push({
        id: `neutrals_${Date.now()}`,
        round,
        text: `🌲 НЕЙТРАЛЬНЫЕ КРИПЫ (${currentGameTime}s): Лагеря леса возродились по утверждённым уровням!`,
        type: 'SYSTEM'
      });
    }
    lastNeutral = currentGameTime;
  }

  return {
    creeps,
    lastCreepSpawnTime: lastCreep,
    lastNeutralSpawnTime: lastNeutral,
    creepWaveIndex: waveIdx,
    logs
  };
}
