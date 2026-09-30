/**
 * Core Game State Manager for 100x100 Dota Tactical Game:
 * - Initiative queue & turn management (8 seconds per turn)
 * - Hero management (position, HP, mana, cooldowns, respawns)
 * - Towers with 4.0s independent attack timer
 * - Lane creep waves (starts at 60s, every 60s) with Top/Mid/Bot waypoint movement
 * - Neutral creep spawns (starts at 120s, every 60s if camp is empty)
 * - Combat log & action resolution
 */

import { TURN_DURATION_SECONDS, deductActionTime, canPerformAction, resolveAttack, getRespawnDelayTurns } from './combatRules.js';
import { TOWER_STATS } from './towerData.js';
import { CREEP_STATS, LANE_WAVE_FORMATIONS, NEUTRAL_CAMP_FORMATIONS } from './creepData.js';
import { HEROES_ROSTER } from './heroesData.js';
import { MAP_SIZE, TERRAIN } from '../map/dotaMapData.js';

// Waypoints for lane creeps on 100x100 grid
export const LANE_WAYPOINTS = {
  top: {
    radiant: [
      { x: 13, y: 80 },
      { x: 13, y: 14 },
      { x: 80, y: 14 },
      { x: 88, y: 12 }, // Dire Ancient
    ],
    dire: [
      { x: 80, y: 14 },
      { x: 13, y: 14 },
      { x: 13, y: 80 },
      { x: 12, y: 88 }, // Radiant Ancient
    ],
  },
  mid: {
    radiant: [
      { x: 22, y: 78 },
      { x: 50, y: 50 },
      { x: 78, y: 22 },
      { x: 88, y: 12 },
    ],
    dire: [
      { x: 78, y: 22 },
      { x: 50, y: 50 },
      { x: 22, y: 78 },
      { x: 12, y: 88 },
    ],
  },
  bot: {
    radiant: [
      { x: 24, y: 86 },
      { x: 86, y: 86 },
      { x: 86, y: 24 },
      { x: 88, y: 12 },
    ],
    dire: [
      { x: 86, y: 24 },
      { x: 86, y: 86 },
      { x: 24, y: 86 },
      { x: 12, y: 88 },
    ],
  },
};

/**
 * Initializes the initial game state.
 */
export function createInitialGameState() {
  // 1. Instantiate 10 active heroes (5 Radiant vs 5 Dire)
  const radiantHeroes = HEROES_ROSTER.filter(h => h.faction === 'radiant').slice(0, 5);
  const direHeroes = HEROES_ROSTER.filter(h => h.faction === 'dire').slice(0, 5);

  const heroInstances = [];

  // Radiant spawn near fountain (12, 88)
  radiantHeroes.forEach((def, i) => {
    heroInstances.push({
      instanceId: `hero_${def.id}`,
      defId: def.id,
      name: def.name,
      title: def.title,
      faction: 'radiant',
      avatarSymbol: def.avatarSymbol,
      themeColor: def.themeColor,
      accentColor: def.accentColor,
      x: 10 + (i % 3) * 2,
      y: 88 + Math.floor(i / 3) * 2,
      level: 1,
      xp: 0,
      hp: def.stats.hp,
      maxHp: def.stats.maxHp,
      mana: def.stats.mana,
      maxMana: def.stats.maxMana,
      speed: def.stats.speed,
      armor: def.stats.armor,
      agility: def.stats.agility,
      damage: def.stats.damage || def.stats.ranged?.damage || 40,
      range: def.stats.range || def.stats.ranged?.range || 1,
      penetration: def.stats.penetration || def.stats.ranged?.penetration || 10,
      hit: def.stats.hit || def.stats.ranged?.hit || 50,
      period: 4.0,
      skills: def.skills.map(s => ({ ...s, currentCooldown: 0 })),
      isDead: false,
      respawnTurnsLeft: 0,
      initiativeRoll: 0,
    });
  });

  // Dire spawn near fountain (88, 12)
  direHeroes.forEach((def, i) => {
    heroInstances.push({
      instanceId: `hero_${def.id}`,
      defId: def.id,
      name: def.name,
      title: def.title,
      faction: 'dire',
      avatarSymbol: def.avatarSymbol,
      themeColor: def.themeColor,
      accentColor: def.accentColor,
      x: 88 - (i % 3) * 2,
      y: 10 + Math.floor(i / 3) * 2,
      level: 1,
      xp: 0,
      hp: def.stats.hp,
      maxHp: def.stats.maxHp,
      mana: def.stats.mana,
      maxMana: def.stats.maxMana,
      speed: def.stats.speed,
      armor: def.stats.armor,
      agility: def.stats.agility,
      damage: def.stats.damage || def.stats.ranged?.damage || 40,
      range: def.stats.range || def.stats.ranged?.range || 1,
      penetration: def.stats.penetration || def.stats.ranged?.penetration || 10,
      hit: def.stats.hit || def.stats.ranged?.hit || 50,
      period: 4.0,
      skills: def.skills.map(s => ({ ...s, currentCooldown: 0 })),
      isDead: false,
      respawnTurnsLeft: 0,
      initiativeRoll: 0,
    });
  });

  // Roll initiative for all heroes (d20 + speed/agility)
  heroInstances.forEach(h => {
    const d20 = Math.floor(Math.random() * 20) + 1;
    h.initiativeRoll = d20 + h.speed;
  });

  // Sort queue by descending initiative
  heroInstances.sort((a, b) => b.initiativeRoll - a.initiativeRoll);
  const queue = heroInstances.map(h => h.instanceId);

  // 2. Initialize Towers with 4s attack periods
  const towers = [
    // Radiant Towers
    { id: 'rad_t1_top', ...TOWER_STATS.T1, faction: 'radiant', x: 13, y: 40, nextAttackTime: 4.0 },
    { id: 'rad_t2_top', ...TOWER_STATS.T2, faction: 'radiant', x: 13, y: 58, nextAttackTime: 4.0 },
    { id: 'rad_t3_top', ...TOWER_STATS.T3, faction: 'radiant', x: 13, y: 74, nextAttackTime: 4.0 },

    { id: 'rad_t1_mid', ...TOWER_STATS.T1, faction: 'radiant', x: 42, y: 58, nextAttackTime: 4.0 },
    { id: 'rad_t2_mid', ...TOWER_STATS.T2, faction: 'radiant', x: 32, y: 68, nextAttackTime: 4.0 },
    { id: 'rad_t3_mid', ...TOWER_STATS.T3, faction: 'radiant', x: 22, y: 78, nextAttackTime: 4.0 },

    { id: 'rad_t1_bot', ...TOWER_STATS.T1, faction: 'radiant', x: 62, y: 86, nextAttackTime: 4.0 },
    { id: 'rad_t2_bot', ...TOWER_STATS.T2, faction: 'radiant', x: 42, y: 86, nextAttackTime: 4.0 },
    { id: 'rad_t3_bot', ...TOWER_STATS.T3, faction: 'radiant', x: 24, y: 86, nextAttackTime: 4.0 },

    { id: 'rad_t4_top', ...TOWER_STATS.T4, faction: 'radiant', x: 15, y: 85, nextAttackTime: 4.0 },
    { id: 'rad_t4_bot', ...TOWER_STATS.T4, faction: 'radiant', x: 14, y: 87, nextAttackTime: 4.0 },
    { id: 'rad_throne', ...TOWER_STATS.THRONE, faction: 'radiant', x: 12, y: 88, nextAttackTime: Infinity },

    // Dire Towers
    { id: 'dire_t1_top', ...TOWER_STATS.T1, faction: 'dire', x: 38, y: 14, nextAttackTime: 4.0 },
    { id: 'dire_t2_top', ...TOWER_STATS.T2, faction: 'dire', x: 58, y: 14, nextAttackTime: 4.0 },
    { id: 'dire_t3_top', ...TOWER_STATS.T3, faction: 'dire', x: 74, y: 14, nextAttackTime: 4.0 },

    { id: 'dire_t1_mid', ...TOWER_STATS.T1, faction: 'dire', x: 58, y: 42, nextAttackTime: 4.0 },
    { id: 'dire_t2_mid', ...TOWER_STATS.T2, faction: 'dire', x: 68, y: 32, nextAttackTime: 4.0 },
    { id: 'dire_t3_mid', ...TOWER_STATS.T3, faction: 'dire', x: 78, y: 22, nextAttackTime: 4.0 },

    { id: 'dire_t1_bot', ...TOWER_STATS.T1, faction: 'dire', x: 86, y: 60, nextAttackTime: 4.0 },
    { id: 'dire_t2_bot', ...TOWER_STATS.T2, faction: 'dire', x: 86, y: 42, nextAttackTime: 4.0 },
    { id: 'dire_t3_bot', ...TOWER_STATS.T3, faction: 'dire', x: 86, y: 26, nextAttackTime: 4.0 },

    { id: 'dire_t4_top', ...TOWER_STATS.T4, faction: 'dire', x: 85, y: 15, nextAttackTime: 4.0 },
    { id: 'dire_t4_bot', ...TOWER_STATS.T4, faction: 'dire', x: 86, y: 13, nextAttackTime: 4.0 },
    { id: 'dire_throne', ...TOWER_STATS.THRONE, faction: 'dire', x: 88, y: 12, nextAttackTime: Infinity },
  ];

  return {
    gameTimeSeconds: 0.0,
    turnNumber: 1,
    roundNumber: 1,
    activeUnitIndex: 0,
    remainingTurnTime: TURN_DURATION_SECONDS, // 8.0 seconds
    initiativeQueue: queue,
    heroes: heroInstances,
    towers,
    creeps: [], // Initial creeps array is [] per spec (first wave at 60s)
    waveCycleIndex: 0,
    nextLaneWaveTime: 60.0, // First wave after 60s
    nextNeutralSpawnTime: 120.0, // First neutral spawn after 120s
    combatLogs: [
      { text: 'Битва началась! Раунд 1. Время хода: 8.0 сек.', time: 0 },
    ],
  };
}

/**
 * End current turn and advance to next alive hero in the initiative queue.
 */
export function endTurn(state) {
  const nextGameTime = state.gameTimeSeconds + (TURN_DURATION_SECONDS - state.remainingTurnTime);

  let nextActiveIndex = (state.activeUnitIndex + 1) % state.initiativeQueue.length;
  let nextRound = state.roundNumber;
  if (nextActiveIndex === 0) {
    nextRound += 1;
  }

  // Find next living hero
  let searchCount = 0;
  while (searchCount < state.initiativeQueue.length) {
    const heroId = state.initiativeQueue[nextActiveIndex];
    const hero = state.heroes.find(h => h.instanceId === heroId);
    if (hero && !hero.isDead) break;
    nextActiveIndex = (nextActiveIndex + 1) % state.initiativeQueue.length;
    searchCount++;
  }

  const activeHeroId = state.initiativeQueue[nextActiveIndex];
  const activeHero = state.heroes.find(h => h.instanceId === activeHeroId);

  // Decrease cooldowns and process regeneration for the newly active hero
  if (activeHero) {
    activeHero.hp = Math.min(activeHero.maxHp, activeHero.hp + (activeHero.hpRegen || 5));
    activeHero.mana = Math.min(activeHero.maxMana, activeHero.mana + (activeHero.manaRegen || 10));
    activeHero.skills.forEach(s => {
      if (s.currentCooldown > 0) {
        s.currentCooldown = Math.max(0, s.currentCooldown - TURN_DURATION_SECONDS);
      }
    });
  }

  // Check if lane creeps wave should spawn (every 60s)
  let updatedCreeps = [...state.creeps];
  let nextWave = state.nextLaneWaveTime;
  let waveIdx = state.waveCycleIndex;

  if (nextGameTime >= state.nextLaneWaveTime) {
    const formation = LANE_WAVE_FORMATIONS[waveIdx % LANE_WAVE_FORMATIONS.length];
    waveIdx += 1;
    nextWave += 60.0;

    // Spawn creeps for Top, Mid, Bot for both Radiant and Dire
    ['top', 'mid', 'bot'].forEach(lane => {
      // Radiant creeps
      for (let m = 0; m < formation.melee; m++) {
        updatedCreeps.push({
          id: `creep_rad_${lane}_m_${Date.now()}_${m}`,
          faction: 'radiant',
          ...CREEP_STATS[1].melee,
          lane,
          waypointIndex: 0,
          x: LANE_WAYPOINTS[lane].radiant[0].x,
          y: LANE_WAYPOINTS[lane].radiant[0].y,
          nextAttackTime: nextGameTime + 4.0,
        });
      }
      for (let r = 0; r < formation.ranged; r++) {
        updatedCreeps.push({
          id: `creep_rad_${lane}_r_${Date.now()}_${r}`,
          faction: 'radiant',
          ...CREEP_STATS[1].ranged,
          lane,
          waypointIndex: 0,
          x: LANE_WAYPOINTS[lane].radiant[0].x,
          y: LANE_WAYPOINTS[lane].radiant[0].y,
          nextAttackTime: nextGameTime + 4.0,
        });
      }

      // Dire creeps
      for (let m = 0; m < formation.melee; m++) {
        updatedCreeps.push({
          id: `creep_dire_${lane}_m_${Date.now()}_${m}`,
          faction: 'dire',
          ...CREEP_STATS[1].melee,
          lane,
          waypointIndex: 0,
          x: LANE_WAYPOINTS[lane].dire[0].x,
          y: LANE_WAYPOINTS[lane].dire[0].y,
          nextAttackTime: nextGameTime + 4.0,
        });
      }
      for (let r = 0; r < formation.ranged; r++) {
        updatedCreeps.push({
          id: `creep_dire_${lane}_r_${Date.now()}_${r}`,
          faction: 'dire',
          ...CREEP_STATS[1].ranged,
          lane,
          waypointIndex: 0,
          x: LANE_WAYPOINTS[lane].dire[0].x,
          y: LANE_WAYPOINTS[lane].dire[0].y,
          nextAttackTime: nextGameTime + 4.0,
        });
      }
    });
  }

  // Move existing lane creeps towards their next waypoint
  updatedCreeps.forEach(creep => {
    if (creep.lane) {
      const waypoints = LANE_WAYPOINTS[creep.lane][creep.faction];
      const targetWp = waypoints[creep.waypointIndex];
      if (targetWp) {
        const dx = targetWp.x - creep.x;
        const dy = targetWp.y - creep.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist <= 2.0) {
          creep.waypointIndex = Math.min(waypoints.length - 1, creep.waypointIndex + 1);
        } else {
          // Step towards waypoint
          const moveStep = Math.min(dist, creep.speed * 0.5);
          creep.x = Math.round(creep.x + (dx / dist) * moveStep);
          creep.y = Math.round(creep.y + (dy / dist) * moveStep);
        }
      }
    }
  });

  return {
    ...state,
    gameTimeSeconds: Number(nextGameTime.toFixed(1)),
    roundNumber: nextRound,
    turnNumber: state.turnNumber + 1,
    activeUnitIndex: nextActiveIndex,
    remainingTurnTime: TURN_DURATION_SECONDS,
    creeps: updatedCreeps,
    nextLaneWaveTime: nextWave,
    waveCycleIndex: waveIdx,
  };
}
