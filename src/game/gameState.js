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
import { MAP_SIZE, TERRAIN, NEUTRAL_CAMPS } from '../map/dotaMapData.js';

// Formation offsets so squad members move side-by-side and in ranks, never merging into 1 point
export const SQUAD_FORMATION_OFFSETS = {
  radiant: {
    melee: [
      { ox: 0, oy: 0 },
      { ox: 1, oy: -1 },
      { ox: -1, oy: 1 },
      { ox: 1, oy: 1 },
      { ox: -1, oy: 0 },
    ],
    ranged: [
      { ox: -1, oy: -1 },
      { ox: 0, oy: -2 },
      { ox: -2, oy: 0 },
      { ox: -2, oy: -2 },
    ],
  },
  dire: {
    melee: [
      { ox: 0, oy: 0 },
      { ox: -1, oy: 1 },
      { ox: 1, oy: -1 },
      { ox: -1, oy: -1 },
      { ox: 1, oy: 0 },
    ],
    ranged: [
      { ox: 1, oy: 1 },
      { ox: 0, oy: 2 },
      { ox: 2, oy: 0 },
      { ox: 2, oy: 2 },
    ],
  },
};

export const NEUTRAL_CAMP_OFFSETS = [
  { ox: 0, oy: 0 },
  { ox: 1, oy: 0 },
  { ox: -1, oy: 0 },
  { ox: 0, oy: 1 },
  { ox: 0, oy: -1 },
  { ox: 1, oy: 1 },
  { ox: -1, oy: -1 },
];

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
    { id: 'rad_throne', ...TOWER_STATS.THRONE, name: 'Древо Жизни (World Tree)', faction: 'radiant', x: 10, y: 86, size: 4, nextAttackTime: Infinity },

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
    { id: 'dire_throne', ...TOWER_STATS.THRONE, name: 'Трон Тьмы (Throne of Decay)', faction: 'dire', x: 86, y: 10, size: 4, nextAttackTime: Infinity },
  ];

  // 3. Roshan the Immortal (Starts in South Pit during Day)
  const roshan = {
    id: 'roshan',
    name: 'Рошан Бессмертный',
    pitId: 'south',
    x: 74,
    y: 76,
    hp: 6000,
    maxHp: 6000,
    armor: 20,
    damage: 150,
    penetration: 30,
    hit: 60,
    isDead: false,
    respawnTime: null,
    dayNightPhase: 'day',
  };

  return {
    gameTimeSeconds: 0.0,
    turnNumber: 1,
    roundNumber: 1,
    activeUnitIndex: 0,
    remainingTurnTime: TURN_DURATION_SECONDS, // 8.0 seconds
    initiativeQueue: queue,
    heroes: heroInstances,
    towers,
    roshan,
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
  // Each turn in the initiative queue elapses the full 8.0 seconds of tactical time
  const nextGameTime = Number((state.gameTimeSeconds + TURN_DURATION_SECONDS).toFixed(1));

  let nextActiveIndex = (state.activeUnitIndex + 1) % state.initiativeQueue.length;
  let nextRound = state.roundNumber;
  if (nextActiveIndex === 0) {
    nextRound += 1;
  }

  // 1. Tick respawn timers for dead heroes
  let updatedHeroes = state.heroes.map(hero => {
    if (hero.isDead && hero.respawnTurnsLeft > 0) {
      const left = hero.respawnTurnsLeft - 1;
      if (left <= 0) {
        const fountainX = hero.faction === 'radiant' ? 12 : 88;
        const fountainY = hero.faction === 'radiant' ? 88 : 12;
        return {
          ...hero,
          isDead: false,
          respawnTurnsLeft: 0,
          hp: hero.maxHp,
          mana: hero.maxMana,
          x: fountainX,
          y: fountainY,
        };
      }
      return { ...hero, respawnTurnsLeft: left };
    }
    return hero;
  });

  // 2. Find next living hero
  let searchCount = 0;
  while (searchCount < state.initiativeQueue.length) {
    const heroId = state.initiativeQueue[nextActiveIndex];
    const hero = updatedHeroes.find(h => h.instanceId === heroId);
    if (hero && !hero.isDead) break;
    nextActiveIndex = (nextActiveIndex + 1) % state.initiativeQueue.length;
    searchCount++;
  }

  const activeHeroId = state.initiativeQueue[nextActiveIndex];
  const activeHero = updatedHeroes.find(h => h.instanceId === activeHeroId);

  // 3. Decrease cooldowns and process regeneration for the newly active hero
  if (activeHero) {
    activeHero.hp = Math.min(activeHero.maxHp, activeHero.hp + (activeHero.hpRegen || 5));
    activeHero.mana = Math.min(activeHero.maxMana, activeHero.mana + (activeHero.manaRegen || 10));
    activeHero.skills.forEach(s => {
      if (s.currentCooldown > 0) {
        s.currentCooldown = Math.max(0, s.currentCooldown - TURN_DURATION_SECONDS);
      }
    });
  }

  let updatedCreeps = [...state.creeps];
  let nextWave = state.nextLaneWaveTime;
  let waveIdx = state.waveCycleIndex;
  const newCombatLogs = [];

  // Determine current creep tier level (1 to 5)
  const creepLevel = Math.min(5, 1 + Math.floor(nextGameTime / 300));

  // 4. Check if lane creeps wave should spawn (every 60s)
  if (nextGameTime >= state.nextLaneWaveTime) {
    const formation = LANE_WAVE_FORMATIONS[waveIdx % LANE_WAVE_FORMATIONS.length];
    waveIdx += 1;
    nextWave += 60.0;

    newCombatLogs.push({
      text: `⚔️ Волна крипов #${waveIdx} выдвинулась на линии (${formation.ranged}R ${formation.melee}M, ур.${creepLevel})!`,
      time: nextGameTime,
    });

    ['top', 'mid', 'bot'].forEach(lane => {
      // Radiant creeps
      for (let m = 0; m < formation.melee; m++) {
        const offset = SQUAD_FORMATION_OFFSETS.radiant.melee[m % 5];
        const startWp = LANE_WAYPOINTS[lane].radiant[0];
        updatedCreeps.push({
          id: `creep_rad_${lane}_m_${Date.now()}_${m}`,
          faction: 'radiant',
          ...CREEP_STATS[creepLevel].melee,
          lane,
          waypointIndex: 0,
          slotOffsetX: offset.ox,
          slotOffsetY: offset.oy,
          x: Math.max(0, Math.min(MAP_SIZE - 1, startWp.x + offset.ox)),
          y: Math.max(0, Math.min(MAP_SIZE - 1, startWp.y + offset.oy)),
          nextAttackTime: nextGameTime + 4.0,
        });
      }
      for (let r = 0; r < formation.ranged; r++) {
        const offset = SQUAD_FORMATION_OFFSETS.radiant.ranged[r % 4];
        const startWp = LANE_WAYPOINTS[lane].radiant[0];
        updatedCreeps.push({
          id: `creep_rad_${lane}_r_${Date.now()}_${r}`,
          faction: 'radiant',
          ...CREEP_STATS[creepLevel].ranged,
          lane,
          waypointIndex: 0,
          slotOffsetX: offset.ox,
          slotOffsetY: offset.oy,
          x: Math.max(0, Math.min(MAP_SIZE - 1, startWp.x + offset.ox)),
          y: Math.max(0, Math.min(MAP_SIZE - 1, startWp.y + offset.oy)),
          nextAttackTime: nextGameTime + 4.0,
        });
      }

      // Dire creeps
      for (let m = 0; m < formation.melee; m++) {
        const offset = SQUAD_FORMATION_OFFSETS.dire.melee[m % 5];
        const startWp = LANE_WAYPOINTS[lane].dire[0];
        updatedCreeps.push({
          id: `creep_dire_${lane}_m_${Date.now()}_${m}`,
          faction: 'dire',
          ...CREEP_STATS[creepLevel].melee,
          lane,
          waypointIndex: 0,
          slotOffsetX: offset.ox,
          slotOffsetY: offset.oy,
          x: Math.max(0, Math.min(MAP_SIZE - 1, startWp.x + offset.ox)),
          y: Math.max(0, Math.min(MAP_SIZE - 1, startWp.y + offset.oy)),
          nextAttackTime: nextGameTime + 4.0,
        });
      }
      for (let r = 0; r < formation.ranged; r++) {
        const offset = SQUAD_FORMATION_OFFSETS.dire.ranged[r % 4];
        const startWp = LANE_WAYPOINTS[lane].dire[0];
        updatedCreeps.push({
          id: `creep_dire_${lane}_r_${Date.now()}_${r}`,
          faction: 'dire',
          ...CREEP_STATS[creepLevel].ranged,
          lane,
          waypointIndex: 0,
          slotOffsetX: offset.ox,
          slotOffsetY: offset.oy,
          x: Math.max(0, Math.min(MAP_SIZE - 1, startWp.x + offset.ox)),
          y: Math.max(0, Math.min(MAP_SIZE - 1, startWp.y + offset.oy)),
          nextAttackTime: nextGameTime + 4.0,
        });
      }
    });
  }

  // 5. Check if neutral creeps should spawn (every 60s, starting at 120s)
  let nextNeutral = state.nextNeutralSpawnTime;
  if (nextGameTime >= state.nextNeutralSpawnTime) {
    nextNeutral += 60.0;
    let spawnedCount = 0;

    NEUTRAL_CAMPS.forEach((camp, campIdx) => {
      // Check if camp is blocked by any living hero or living creep within 3 tiles
      const isBlocked =
        updatedHeroes.some(h => !h.isDead && Math.hypot(h.x - camp.x, h.y - camp.y) <= 3.0) ||
        updatedCreeps.some(c => !c.isDead && Math.hypot(c.x - camp.x, c.y - camp.y) <= 3.0);

      if (!isBlocked) {
        spawnedCount++;
        const formationDef = NEUTRAL_CAMP_FORMATIONS[campIdx % NEUTRAL_CAMP_FORMATIONS.length];
        let unitIdx = 0;
        formationDef.units.forEach(unitGroup => {
          for (let u = 0; u < unitGroup.count; u++) {
            const offset = NEUTRAL_CAMP_OFFSETS[unitIdx % NEUTRAL_CAMP_OFFSETS.length];
            unitIdx++;
            const stats = CREEP_STATS[unitGroup.level][unitGroup.type];
            updatedCreeps.push({
              id: `creep_neutral_${camp.id}_${Date.now()}_${unitIdx}`,
              faction: 'neutral',
              isNeutral: true,
              campId: camp.id,
              campName: camp.name,
              campCenter: { x: camp.x, y: camp.y },
              type: unitGroup.type.toUpperCase(),
              level: unitGroup.level,
              ...stats,
              x: Math.max(0, Math.min(MAP_SIZE - 1, camp.x + offset.ox)),
              y: Math.max(0, Math.min(MAP_SIZE - 1, camp.y + offset.oy)),
              nextAttackTime: nextGameTime + 4.0,
            });
          }
        });
      }
    });

    if (spawnedCount > 0) {
      newCombatLogs.push({
        text: `🐺 Лесные крипы возродились в ${spawnedCount} лагерях!`,
        time: nextGameTime,
      });
    }
  }

  // 6. Creep Combat & Movement Phase
  updatedCreeps = updatedCreeps.filter(c => !c.isDead && c.hp > 0);

  updatedCreeps.forEach(creep => {
    let potentialTargets = [];

    if (creep.isNeutral) {
      // Aggro check: if any hero or lane creep is within 3.5 tiles of campCenter
      const nearbyEnemies = [
        ...updatedHeroes.filter(h => !h.isDead && Math.hypot(h.x - creep.campCenter.x, h.y - creep.campCenter.y) <= 3.5),
        ...updatedCreeps.filter(c => !c.isNeutral && !c.isDead && Math.hypot(c.x - creep.campCenter.x, c.y - creep.campCenter.y) <= 3.5),
      ];
      potentialTargets = nearbyEnemies.filter(target => Math.hypot(target.x - creep.x, target.y - creep.y) <= creep.range);
    } else {
      // Lane creeps attack opposing faction
      const oppFaction = creep.faction === 'radiant' ? 'dire' : 'radiant';
      const enemyHeroes = updatedHeroes.filter(h => !h.isDead && h.faction === oppFaction && Math.hypot(h.x - creep.x, h.y - creep.y) <= creep.range);
      const enemyCreeps = updatedCreeps.filter(c => !c.isDead && c.faction === oppFaction && Math.hypot(c.x - creep.x, c.y - creep.y) <= creep.range);
      const enemyTowers = (state.towers || []).filter(t => t.hp > 0 && t.faction === oppFaction && Math.hypot((t.x + 0.5) - creep.x, (t.y + 0.5) - creep.y) <= creep.range + 0.5);

      potentialTargets = [...enemyHeroes, ...enemyCreeps, ...enemyTowers];
    }

    if (potentialTargets.length > 0) {
      // Attack closest target
      const target = potentialTargets[0];
      const res = resolveAttack({
        averageDamage: creep.damage,
        penetration: creep.penetration,
        hit: creep.hit,
        targetArmor: target.armor || 0,
        targetAgility: target.agility || 0,
        attackerElevation: 1,
        targetElevation: 1,
        isRanged: creep.range > 2,
      });

      if (res.isHit) {
        target.hp = Math.max(0, target.hp - res.damage);
        if (target.hp <= 0) {
          target.isDead = true;
          if (target.instanceId) {
            target.respawnTurnsLeft = getRespawnDelayTurns(nextRound);
            newCombatLogs.push({
              text: `💀 [Крип] ${creep.faction} ${creep.type} сразил героя ${target.name}!`,
              time: nextGameTime,
            });
          }
        }
      }
      // Halt movement while attacking
    } else if (creep.lane) {
      // Lane movement towards waypoint with squad offset
      const waypoints = LANE_WAYPOINTS[creep.lane][creep.faction];
      const targetWp = waypoints[creep.waypointIndex];
      if (targetWp) {
        const targetX = Math.max(0, Math.min(MAP_SIZE - 1, targetWp.x + (creep.slotOffsetX || 0)));
        const targetY = Math.max(0, Math.min(MAP_SIZE - 1, targetWp.y + (creep.slotOffsetY || 0)));
        const dx = targetX - creep.x;
        const dy = targetY - creep.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist <= 1.5) {
          creep.waypointIndex = Math.min(waypoints.length - 1, creep.waypointIndex + 1);
        } else {
          const moveStep = Math.min(dist, creep.speed * 0.5);
          creep.x = Math.round(creep.x + (dx / dist) * moveStep);
          creep.y = Math.round(creep.y + (dy / dist) * moveStep);
        }
      }
    }
  });

  // Filter out any creeps that died during combat
  updatedCreeps = updatedCreeps.filter(c => !c.isDead && c.hp > 0);

  // De-clumping: guarantee no two creeps share the exact same tile
  const occupiedTiles = new Set();
  updatedCreeps.forEach(creep => {
    let key = `${creep.x},${creep.y}`;
    if (occupiedTiles.has(key)) {
      const candidates = [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [-1, -1]];
      for (const [cdx, cdy] of candidates) {
        const nx = Math.max(0, Math.min(MAP_SIZE - 1, creep.x + cdx));
        const ny = Math.max(0, Math.min(MAP_SIZE - 1, creep.y + cdy));
        const nKey = `${nx},${ny}`;
        if (!occupiedTiles.has(nKey)) {
          creep.x = nx;
          creep.y = ny;
          key = nKey;
          break;
        }
      }
    }
    occupiedTiles.add(key);
  });

  // 7. Roshan Day/Night Migration between North & South Pits (Patch 7.33+ rules)
  // Day (0-300s, 600-900s): South Pit (74, 76)
  // Night (300-600s, 900-1200s): North Pit (26, 24)
  const isDay = Math.floor(nextGameTime / 300) % 2 === 0;
  const targetPitKey = isDay ? 'south' : 'north';
  let updatedRoshan = state.roshan ? { ...state.roshan } : {
    id: 'roshan',
    name: 'Рошан Бессмертный',
    pitId: 'south',
    x: 74,
    y: 76,
    hp: 6000,
    maxHp: 6000,
    armor: 20,
    damage: 150,
    penetration: 30,
    hit: 60,
    isDead: false,
    respawnTime: null,
    dayNightPhase: 'day',
  };

  if (!updatedRoshan.isDead && updatedRoshan.pitId !== targetPitKey) {
    updatedRoshan.pitId = targetPitKey;
    updatedRoshan.dayNightPhase = isDay ? 'day' : 'night';
    if (targetPitKey === 'north') {
      updatedRoshan.x = 26;
      updatedRoshan.y = 24;
      newCombatLogs.push({
        text: `🌙 Наступила ночь! Рошан перешел в Северное логово (верх реки, [26, 24])!`,
        time: nextGameTime,
      });
    } else {
      updatedRoshan.x = 74;
      updatedRoshan.y = 76;
      newCombatLogs.push({
        text: `☀️ Наступил день! Рошан перешел в Южное логово (низ реки, [74, 76])!`,
        time: nextGameTime,
      });
    }
  }

  return {
    ...state,
    gameTimeSeconds: nextGameTime,
    roundNumber: nextRound,
    turnNumber: state.turnNumber + 1,
    activeUnitIndex: nextActiveIndex,
    remainingTurnTime: TURN_DURATION_SECONDS,
    heroes: updatedHeroes,
    creeps: updatedCreeps,
    roshan: updatedRoshan,
    nextLaneWaveTime: nextWave,
    nextNeutralSpawnTime: nextNeutral,
    waveCycleIndex: waveIdx,
    combatLogs: [...newCombatLogs, ...state.combatLogs].slice(0, 25),
  };
}
