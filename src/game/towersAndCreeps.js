// Towers, Creeps, and Roshan Entities & AI Logic
import { TOWERS_DATA } from '../data/dota95Data.js';
import { getDistance } from './pathfinding.js';
import { mitigateDamage, applyDamage, DAMAGE_TYPES } from './damage.js';
import { applyStatus, STATUS_TYPES } from './statuses.js';

// Initialize Towers state with live HP and combat stats
export function createInitialTowers() {
  return TOWERS_DATA.map(t => ({
    ...t,
    currentHp: t.hp,
    armor: 14,
    attackDamage: 110,
    range: t.range || 8,
    isDead: false
  }));
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
    magicResist: 0.35,
    attackDamage: 75,
    team: 'neutral',
    isDead: false,
    abilities: [
      { id: 'roshan_slam', name: 'Roshan Slam', desc: 'Удар по земле: 150 урона и Замедление вокруг.', damage: 150, area: 3 },
      { id: 'roshan_roar', name: 'Устрашающий Рев', desc: 'Оглушает всех в радиусе 4 клеток на 1 ход.', area: 4 }
    ]
  };
}

// Spawn wave of creeps on 3 lanes
export function spawnCreepWave(waveNumber = 1) {
  const lanes = ['top', 'mid', 'bot'];
  const creeps = [];

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
    // Radiant Melee & Ranged
    creeps.push({
      id: `rad_melee_${lane}_${waveNumber}`,
      name: `Крип-мечник (${lane.toUpperCase()})`,
      team: 'radiant',
      lane,
      type: 'melee',
      r: laneStarts.radiant[lane].r,
      c: laneStarts.radiant[lane].c,
      hp: 60,
      maxHp: 60,
      armor: 4,
      attackDamage: 22,
      range: 1,
      speed: 4,
      isDead: false
    });

    // Dire Melee & Ranged
    creeps.push({
      id: `dire_melee_${lane}_${waveNumber}`,
      name: `Крип-мечник Dire (${lane.toUpperCase()})`,
      team: 'dire',
      lane,
      type: 'melee',
      r: laneStarts.dire[lane].r,
      c: laneStarts.dire[lane].c,
      hp: 60,
      maxHp: 60,
      armor: 4,
      attackDamage: 22,
      range: 1,
      speed: 4,
      isDead: false
    });
  });

  return creeps;
}

// Execute Tower AI attack against nearest enemy unit within range (8 cells)
export function executeTowerAttacks(towers, heroes, creeps) {
  const logs = [];
  const updatedHeroes = [...heroes];
  const updatedCreeps = [...creeps];

  towers.forEach(tower => {
    if (tower.isDead || tower.currentHp <= 0) return;

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
      const finalDmg = mitigateDamage(tower.attackDamage, DAMAGE_TYPES.PHYSICAL, nearestTarget);
      nearestTarget.hp = Math.max(0, nearestTarget.hp - finalDmg);
      if (nearestTarget.hp <= 0) nearestTarget.isDead = true;

      logs.push({
        type: 'TOWER_ATTACK',
        text: `🗼 ${tower.name} выстрелила в ${nearestTarget.name}: ${finalDmg} урона! (Осталось HP: ${nearestTarget.hp})`
      });
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
    // Roshan Slams ground!
    nearbyEnemies.forEach(tgt => {
      const dmg = mitigateDamage(120, DAMAGE_TYPES.PHYSICAL, tgt);
      tgt.hp = Math.max(0, tgt.hp - dmg);
      if (tgt.hp <= 0) tgt.isDead = true;
      applyStatus(tgt, STATUS_TYPES.SLOW, 1);

      logs.push({
        type: 'ROSHAN_ATTACK',
        text: `👹 Рошан наносит сокрушительный удар по ${tgt.name}: ${dmg} урона и Замедление!`
      });
    });
  }

  return { roshan, updatedHeroes, logs };
}
