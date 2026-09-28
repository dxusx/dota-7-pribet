// Centralized Tactical Game State and Reducer Engine
// Implements 8-Second Time-based turns, Data-driven combat, High-ground modifiers, and Creep waves

import { INITIAL_HEROES_95 } from '../data/dota95Data.js';
import { HERO_ABILITIES_DATA } from '../data/dotaHeroesAbilities.js';
import { TIME_CONFIG, COMBAT_CONFIG, CREEP_CONFIG } from '../data/combatConfig.js';
import { 
  canPerformAction, getNextCreepWave, canSpawnNeutralCamp 
} from './combatRules.js';
import { rollD20 } from './dice.js';
import { getReachableCells, findPath, getDistance } from './pathfinding.js';
import { resolveAttackRoll, applyDamage, applyHeal } from './damage.js';
import { tickStatuses, getUnitSpeed, canUnitAct, canUnitMove, canUnitCast, applyStatus, STATUS_TYPES } from './statuses.js';
import { executeAbility, getValidTargetCells, TARGET_TYPES } from './abilities.js';
import { executeItem } from './items.js';
import { 
  createInitialTowers, createInitialRoshan, spawnCreepWave, 
  spawnNeutralCreeps, executeTowerAttacks, executeRoshanTurn 
} from './towersAndCreeps.js';
import { generatePixelDotaMap, TILE_TYPES } from '../data/dotaPixelGrid.js';

// Create initial heroes with complete RPG and combat stats
export function createInitialHeroes() {
  return INITIAL_HEROES_95.map(h => {
    const data = HERO_ABILITIES_DATA[h.id] || {};
    const baseHp = h.hp || 100;
    const baseMana = h.mana || 100;

    return {
      ...h,
      hp: baseHp,
      maxHp: baseHp,
      mana: baseMana,
      maxMana: baseMana,
      speed: h.speed || 6,
      armor: parseFloat(data.stats?.armor || 12),
      hit: 20,
      agility: parseFloat(data.stats?.agility || 12),
      penetration: 14,
      averageDamage: 55,
      magicResist: 0.25,
      statusEffects: [],
      cooldowns: {},
      isDead: false,
      abilities: data.abilities || [],
      items: data.items || []
    };
  });
}

// Roll initiative for all heroes (d20 + speed)
export function rollInitiative(heroes) {
  const list = heroes.map(h => {
    const mod = Math.floor((h.speed || 6) / 2);
    const roll = rollD20(mod);
    return {
      unitId: h.id,
      name: h.name,
      team: h.team,
      avatar: h.avatar,
      roll: roll.chosenRoll,
      modifier: mod,
      total: roll.total
    };
  });

  // Sort descending by initiative score
  list.sort((a, b) => b.total - a.total);
  return list;
}

// Create complete initial game state
export function createInitialGameState() {
  const mapGrid = generatePixelDotaMap();
  const heroes = createInitialHeroes();
  const initiativeOrder = rollInitiative(heroes);
  const activeHero = heroes.find(h => h.id === initiativeOrder[0]?.unitId) || heroes[0];

  return {
    round: 1,
    phase: 'HERO_TURN', // 'INITIATIVE' | 'HERO_TURN' | 'ROUND_END' | 'VICTORY'
    turnIndex: 0,
    gameTimeSeconds: 0,
    creepWaveIndex: 0,
    lastCreepSpawnTime: 0,
    lastNeutralSpawnTime: 0,
    initiativeOrder,
    activeHeroId: activeHero.id,
    selectedHeroId: activeHero.id,
    // TIME SYSTEM: 8-second turns. Only remainingTime limits actions.
    turnActions: {
      remainingTime: TIME_CONFIG.TURN_DURATION_SECONDS, // 8.0s
      totalTime: TIME_CONFIG.TURN_DURATION_SECONDS,     // 8.0s
      movement: activeHero.speed || 6,
      movementMax: activeHero.speed || 6
    },
    heroes,
    towers: createInitialTowers(),
    creeps: spawnCreepWave(0),
    roshan: createInitialRoshan(),
    mapGrid,
    targetingMode: null,
    latestDiceRoll: null,
    combatLog: [
      {
        id: 'init_start',
        round: 1,
        text: `⚔️ Битва началась! Время хода: ${TIME_CONFIG.TURN_DURATION_SECONDS} сек. Первый ход за ${activeHero.name}!`,
        type: 'SYSTEM'
      }
    ],
    notification: null
  };
}

// Main Game Reducer
export function gameReducer(state, action) {
  switch (action.type) {

    // -------------------------------------------------------------
    // 1. SELECT HERO (Inspecting unit on the board)
    // -------------------------------------------------------------
    case 'SELECT_HERO': {
      return {
        ...state,
        selectedHeroId: action.heroId,
        targetingMode: null
      };
    }

    // -------------------------------------------------------------
    // 2. MOVE ACTIVE HERO (Costs 2.0 seconds of turn time)
    // -------------------------------------------------------------
    case 'MOVE_HERO': {
      const activeHero = state.heroes.find(h => h.id === state.activeHeroId);
      if (!activeHero || activeHero.isDead) return state;

      if (!canUnitMove(activeHero)) {
        return { ...state, notification: '⛔ Персонаж не может двигаться (Оглушение / Опутывание)!' };
      }

      const timeCost = TIME_CONFIG.ACTION_TIME_COSTS.MOVE;
      if (!canPerformAction(state.turnActions.remainingTime, timeCost)) {
        return { 
          ...state, 
          notification: `⛔ Недостаточно времени хода (${state.turnActions.remainingTime.toFixed(1)}s / ${timeCost}s)!` 
        };
      }

      const { targetR, targetC } = action;

      // Obstacles: living heroes, towers, roshan
      const blocked = new Set();
      state.heroes.forEach(h => {
        if (!h.isDead && h.id !== activeHero.id) blocked.add(`${h.r},${h.c}`);
      });
      state.towers.forEach(t => {
        if (!t.isDead) blocked.add(`${t.r},${t.c}`);
      });

      const reachable = getReachableCells(activeHero.r, activeHero.c, state.turnActions.movement, state.mapGrid, blocked);
      const targetNode = reachable.get(`${targetR},${targetC}`);

      if (!targetNode) {
        return { ...state, notification: '⛔ Клетка вне досягаемости или заблокирована!' };
      }

      const remainingMovement = Math.max(0, Math.round(state.turnActions.movement - targetNode.cost));
      const distSteps = targetNode.path.length - 1;

      // Check special fountain tile bonus (+24% HP and MP)
      const targetTile = state.mapGrid[targetR * 95 + targetC];
      let updatedHero = { ...activeHero, r: targetR, c: targetC };

      if (targetTile === TILE_TYPES.FOUNTAIN) {
        const healAmt = Math.round(activeHero.maxHp * 0.24);
        const manaAmt = Math.round(activeHero.maxMana * 0.24);
        updatedHero = applyHeal(updatedHero, healAmt);
        updatedHero.mana = Math.min(updatedHero.maxMana, updatedHero.mana + manaAmt);
      }

      const updatedHeroes = state.heroes.map(h => h.id === activeHero.id ? updatedHero : h);
      const newRemainingTime = Math.max(0, +(state.turnActions.remainingTime - timeCost).toFixed(1));

      const moveLog = {
        id: `move_${Date.now()}`,
        round: state.round,
        text: `🏃 ${activeHero.name} переместился на [${targetR}, ${targetC}] (${distSteps} шагов, -${timeCost}s, осталось: ${newRemainingTime}s)`,
        type: 'MOVE'
      };

      const nextState = {
        ...state,
        heroes: updatedHeroes,
        turnActions: {
          ...state.turnActions,
          remainingTime: newRemainingTime,
          movement: remainingMovement
        },
        targetingMode: null,
        combatLog: [...state.combatLog, moveLog]
      };

      // Auto-end turn when remaining time runs out
      if (newRemainingTime <= 0) {
        return gameReducer(nextState, { type: 'END_TURN' });
      }

      return nextState;
    }

    // -------------------------------------------------------------
    // 3. SET TARGETING MODE
    // -------------------------------------------------------------
    case 'SET_TARGETING': {
      const activeHero = state.heroes.find(h => h.id === state.activeHeroId);
      if (!activeHero || activeHero.isDead || !canUnitAct(activeHero)) return state;

      const { mode, abilityId, itemId } = action;

      if (mode === 'ATTACK') {
        const timeCost = TIME_CONFIG.ACTION_TIME_COSTS.ATTACK;
        if (!canPerformAction(state.turnActions.remainingTime, timeCost)) {
          return { 
            ...state, 
            notification: `⛔ Недостаточно времени для атаки (требуется ${timeCost}s, осталось ${state.turnActions.remainingTime.toFixed(1)}s)!` 
          };
        }

        // Basic attack range (default 2 for melee, up to range for ranged)
        const attackRange = activeHero.range || 2;
        const validCells = [];
        // Enemy heroes
        state.heroes.forEach(h => {
          if (!h.isDead && h.team !== activeHero.team) {
            const dist = getDistance(activeHero.r, activeHero.c, h.r, h.c);
            if (dist <= attackRange) {
              validCells.push({ r: h.r, c: h.c, unitId: h.id, type: 'hero' });
            }
          }
        });

        // Enemy towers
        state.towers.forEach(t => {
          if (!t.isDead && t.team !== activeHero.team) {
            const dist = getDistance(activeHero.r, activeHero.c, t.r, t.c);
            if (dist <= attackRange) {
              validCells.push({ r: t.r, c: t.c, unitId: t.id, type: 'tower' });
            }
          }
        });

        // Enemy creeps
        state.creeps.forEach(c => {
          if (!c.isDead && c.team !== activeHero.team) {
            const dist = getDistance(activeHero.r, activeHero.c, c.r, c.c);
            if (dist <= attackRange) {
              validCells.push({ r: c.r, c: c.c, unitId: c.id, type: 'creep' });
            }
          }
        });

        // Also allow targeting Roshan if in range
        if (state.roshan && !state.roshan.isDead) {
          const dist = getDistance(activeHero.r, activeHero.c, state.roshan.r, state.roshan.c);
          if (dist <= attackRange) {
            validCells.push({ r: state.roshan.r, c: state.roshan.c, unitId: 'roshan', type: 'roshan' });
          }
        }

        const notif = validCells.length === 0 
          ? `⚔️ Режим атаки [Дальность: ${attackRange} кл, 3.0s] — врагов рядом нет. Подойдите ближе!`
          : `⚔️ Выберите цель для атаки (Дальность: ${attackRange} кл, расход: 3.0s)`;

        return {
          ...state,
          notification: notif,
          targetingMode: {
            mode: 'ATTACK',
            range: attackRange,
            validCells
          }
        };
      }

      if (mode === 'ABILITY') {
        const ability = (activeHero.abilities || []).find(a => a.id === abilityId);
        if (!ability) return state;

        const timeCost = ability.timeCost || TIME_CONFIG.ACTION_TIME_COSTS.ABILITY;
        if (!canPerformAction(state.turnActions.remainingTime, timeCost)) {
          return { 
            ...state, 
            notification: `⛔ Недостаточно времени для заклинания (требуется ${timeCost}s, осталось ${state.turnActions.remainingTime.toFixed(1)}s)!` 
          };
        }
        if (!canUnitCast(activeHero)) {
          return { ...state, notification: '🤐 Герой под Безмолвием (Silence) — заклинания заблокированы!' };
        }
        if (activeHero.mana < (ability.manaCost || 0)) {
          return { ...state, notification: '⛔ Недостаточно маны для заклинания!' };
        }
        if ((activeHero.cooldowns || {})[ability.id] > 0) {
          return { ...state, notification: `⏳ Заклинание еще на перезарядке (${activeHero.cooldowns[ability.id]} ходов)!` };
        }

        const validCells = getValidTargetCells(ability, activeHero, state.mapGrid, state.heroes);

        // If SELF target, immediately cast
        if (ability.targetType === 'SELF') {
          return gameReducer(state, {
            type: 'EXECUTE_ABILITY',
            abilityId,
            targetPos: { r: activeHero.r, c: activeHero.c }
          });
        }

        return {
          ...state,
          targetingMode: {
            mode: 'ABILITY',
            ability,
            range: ability.range || 4,
            validCells
          }
        };
      }

      if (mode === 'ITEM') {
        const timeCost = TIME_CONFIG.ACTION_TIME_COSTS.ITEM;
        if (!canPerformAction(state.turnActions.remainingTime, timeCost)) {
          return { 
            ...state, 
            notification: `⛔ Недостаточно времени для предмета (требуется ${timeCost}s, осталось ${state.turnActions.remainingTime.toFixed(1)}s)!` 
          };
        }

        if (itemId === 'blink') {
          const validCells = [];
          for (let dr = -12; dr <= 12; dr++) {
            for (let dc = -12; dc <= 12; dc++) {
              const tr = activeHero.r + dr;
              const tc = activeHero.c + dc;
              if (getDistance(activeHero.r, activeHero.c, tr, tc) <= 12 && state.mapGrid[tr * 95 + tc] !== TILE_TYPES.UNPASSABLE) {
                validCells.push({ r: tr, c: tc });
              }
            }
          }
          return {
            ...state,
            targetingMode: {
              mode: 'ITEM',
              itemId,
              range: 12,
              validCells
            }
          };
        } else {
          return gameReducer(state, { type: 'USE_ITEM', itemId });
        }
      }

      return state;
    }

    case 'CANCEL_TARGETING': {
      return { ...state, targetingMode: null };
    }

    // -------------------------------------------------------------
    // 4. PERFORM BASIC ATTACK (Time Cost: 3.0s, Multi-attack permitted)
    // -------------------------------------------------------------
    case 'PERFORM_ATTACK': {
      const activeHero = state.heroes.find(h => h.id === state.activeHeroId);
      if (!activeHero || activeHero.isDead) return state;

      const timeCost = TIME_CONFIG.ACTION_TIME_COSTS.ATTACK;
      if (!canPerformAction(state.turnActions.remainingTime, timeCost)) {
        return { 
          ...state, 
          notification: `⛔ Недостаточно времени для атаки (требуется ${timeCost}s, осталось ${state.turnActions.remainingTime.toFixed(1)}s)!` 
        };
      }

      const { targetId } = action;
      const newRemainingTime = Math.max(0, +(state.turnActions.remainingTime - timeCost).toFixed(1));

      // Handle Roshan target
      if (targetId === 'roshan' && state.roshan && !state.roshan.isDead) {
        const attackResult = resolveAttackRoll(activeHero, state.roshan, { mapGrid: state.mapGrid });
        const updatedRoshan = applyDamage(state.roshan, attackResult.finalDamage);

        const atkLog = {
          id: `atk_${Date.now()}`,
          round: state.round,
          text: `⚔️ ${activeHero.name} атакует Рошана: Точность ${attackResult.hitChance}% → ${attackResult.status}! (${attackResult.finalDamage} физ. урона [броня: x${attackResult.armorMultiplier}], -${timeCost}s, осталось: ${newRemainingTime}s)`,
          type: 'ATTACK'
        };

        const nextState = {
          ...state,
          roshan: updatedRoshan,
          turnActions: { ...state.turnActions, remainingTime: newRemainingTime },
          targetingMode: null,
          combatLog: [...state.combatLog, atkLog]
        };

        if (newRemainingTime <= 0) return gameReducer(nextState, { type: 'END_TURN' });
        return nextState;
      }

      // Handle Tower target
      const targetTower = state.towers.find(t => t.id === targetId);
      if (targetTower && !targetTower.isDead) {
        const attackResult = resolveAttackRoll(activeHero, targetTower, { mapGrid: state.mapGrid });
        const newHp = Math.max(0, (targetTower.currentHp ?? targetTower.hp) - attackResult.finalDamage);
        const isDead = newHp <= 0;
        const updatedTowers = state.towers.map(t => t.id === targetTower.id ? { ...t, currentHp: newHp, isDead } : t);

        const atkLog = {
          id: `atk_${Date.now()}`,
          round: state.round,
          text: `⚔️ ${activeHero.name} атакует ${targetTower.name}: Точность ${attackResult.hitChance}% → ${attackResult.status}! (${attackResult.finalDamage} физ. урона, HP вышки: ${newHp}, -${timeCost}s, осталось: ${newRemainingTime}s)`,
          type: 'ATTACK'
        };

        const nextState = {
          ...state,
          towers: updatedTowers,
          turnActions: { ...state.turnActions, remainingTime: newRemainingTime },
          targetingMode: null,
          combatLog: [
            ...state.combatLog, 
            atkLog,
            ...(isDead ? [{
              id: `tw_kill_${Date.now()}`,
              round: state.round,
              text: `💥 ${targetTower.name} разрушена героем ${activeHero.name}!`,
              type: 'DEATH'
            }] : [])
          ]
        };

        if (newRemainingTime <= 0) return gameReducer(nextState, { type: 'END_TURN' });
        return nextState;
      }

      // Handle Creep target
      const targetCreep = state.creeps.find(c => c.id === targetId);
      if (targetCreep && !targetCreep.isDead) {
        const attackResult = resolveAttackRoll(activeHero, targetCreep, { mapGrid: state.mapGrid });
        const newHp = Math.max(0, targetCreep.hp - attackResult.finalDamage);
        const isDead = newHp <= 0;
        const updatedCreeps = state.creeps.map(c => c.id === targetCreep.id ? { ...c, hp: newHp, isDead } : c);

        const atkLog = {
          id: `atk_${Date.now()}`,
          round: state.round,
          text: `⚔️ ${activeHero.name} атакует ${targetCreep.name}: Точность ${attackResult.hitChance}% → ${attackResult.status}! (${attackResult.finalDamage} физ. урона, -${timeCost}s, осталось: ${newRemainingTime}s)`,
          type: 'ATTACK'
        };

        const nextState = {
          ...state,
          creeps: updatedCreeps,
          turnActions: { ...state.turnActions, remainingTime: newRemainingTime },
          targetingMode: null,
          combatLog: [
            ...state.combatLog, 
            atkLog,
            ...(isDead ? [{
              id: `creep_kill_${Date.now()}`,
              round: state.round,
              text: `💀 ${targetCreep.name} погиб!`,
              type: 'DEATH'
            }] : [])
          ]
        };

        if (newRemainingTime <= 0) return gameReducer(nextState, { type: 'END_TURN' });
        return nextState;
      }

      // Handle Hero target
      const targetHero = state.heroes.find(h => h.id === targetId);
      if (!targetHero || targetHero.isDead) return state;

      const attackResult = resolveAttackRoll(activeHero, targetHero, { mapGrid: state.mapGrid });
      const updatedTarget = applyDamage(targetHero, attackResult.finalDamage);

      const updatedHeroes = state.heroes.map(h => {
        if (h.id === targetHero.id) return updatedTarget;
        return h;
      });

      const atkLog = {
        id: `atk_${Date.now()}`,
        round: state.round,
        text: `⚔️ ${activeHero.name} атакует ${targetHero.name}: Точность ${attackResult.hitChance}% → ${attackResult.status}! (${attackResult.finalDamage} физ. урона, HP: ${targetHero.hp} → ${updatedTarget.hp}, -${timeCost}s, осталось: ${newRemainingTime}s)`,
        type: 'ATTACK'
      };

      const nextState = {
        ...state,
        heroes: updatedHeroes,
        turnActions: { ...state.turnActions, remainingTime: newRemainingTime },
        targetingMode: null,
        combatLog: [
          ...state.combatLog,
          atkLog,
          ...(updatedTarget.isDead ? [{
            id: `kill_${Date.now()}`,
            round: state.round,
            text: `💀 ${targetHero.name} погибает в бою от руки ${activeHero.name}!`,
            type: 'DEATH'
          }] : [])
        ]
      };

      if (newRemainingTime <= 0) return gameReducer(nextState, { type: 'END_TURN' });
      return nextState;
    }

    // -------------------------------------------------------------
    // 5. EXECUTE ABILITY (Costs 4.0 seconds of turn time)
    // -------------------------------------------------------------
    case 'EXECUTE_ABILITY': {
      const activeHero = state.heroes.find(h => h.id === state.activeHeroId);
      if (!activeHero || activeHero.isDead) return state;

      const ability = (activeHero.abilities || []).find(a => a.id === action.abilityId);
      if (!ability) return state;

      const timeCost = ability.timeCost || TIME_CONFIG.ACTION_TIME_COSTS.ABILITY;
      if (!canPerformAction(state.turnActions.remainingTime, timeCost)) {
        return { 
          ...state, 
          notification: `⛔ Недостаточно времени для заклинания (требуется ${timeCost}s, осталось ${state.turnActions.remainingTime.toFixed(1)}s)!` 
        };
      }

      const result = executeAbility(ability, activeHero, action.targetPos, state);
      if (!result.success) {
        return { ...state, notification: result.reason };
      }

      const newRemainingTime = Math.max(0, +(state.turnActions.remainingTime - timeCost).toFixed(1));

      // Map updated units
      const targetMap = new Map();
      result.updatedTargets.forEach(u => targetMap.set(u.id, u));

      const updatedHeroes = state.heroes.map(h => {
        if (h.id === result.updatedCaster.id) return result.updatedCaster;
        if (targetMap.has(h.id)) return targetMap.get(h.id);
        return h;
      });

      const nextState = {
        ...state,
        heroes: updatedHeroes,
        turnActions: {
          ...state.turnActions,
          remainingTime: newRemainingTime
        },
        targetingMode: null,
        combatLog: [
          ...state.combatLog,
          ...result.logs.map((l, i) => ({ 
            id: `ab_${Date.now()}_${i}`, 
            round: state.round, 
            ...l,
            text: `${l.text} (-${timeCost}s, осталось: ${newRemainingTime}s)`
          }))
        ]
      };

      if (newRemainingTime <= 0) return gameReducer(nextState, { type: 'END_TURN' });
      return nextState;
    }

    // -------------------------------------------------------------
    // 6. USE ITEM (Costs 2.0 seconds of turn time)
    // -------------------------------------------------------------
    case 'USE_ITEM': {
      const activeHero = state.heroes.find(h => h.id === state.activeHeroId);
      if (!activeHero || activeHero.isDead) return state;

      const timeCost = TIME_CONFIG.ACTION_TIME_COSTS.ITEM;
      if (!canPerformAction(state.turnActions.remainingTime, timeCost)) {
        return { 
          ...state, 
          notification: `⛔ Недостаточно времени для предмета (требуется ${timeCost}s, осталось ${state.turnActions.remainingTime.toFixed(1)}s)!` 
        };
      }

      const itemRes = executeItem(action.itemId, activeHero, action.targetPos);
      if (!itemRes.success) return { ...state, notification: itemRes.reason };

      const newRemainingTime = Math.max(0, +(state.turnActions.remainingTime - timeCost).toFixed(1));
      const updatedHeroes = state.heroes.map(h => h.id === activeHero.id ? itemRes.updatedCaster : h);

      const nextState = {
        ...state,
        heroes: updatedHeroes,
        turnActions: {
          ...state.turnActions,
          remainingTime: newRemainingTime
        },
        targetingMode: null,
        combatLog: [
          ...state.combatLog,
          {
            id: `item_${Date.now()}`,
            round: state.round,
            text: `${itemRes.log} (-${timeCost}s, осталось: ${newRemainingTime}s)`,
            type: 'ITEM'
          }
        ]
      };

      if (newRemainingTime <= 0) return gameReducer(nextState, { type: 'END_TURN' });
      return nextState;
    }

    // -------------------------------------------------------------
    // 7. END TURN & CYCLE INITIATIVE (Resets 8-second timer & checks spawns)
    // -------------------------------------------------------------
    case 'END_TURN': {
      // Decrement cooldowns of the hero finishing turn
      const currentHero = state.heroes.find(h => h.id === state.activeHeroId);
      const decrementedCooldowns = {};
      if (currentHero && currentHero.cooldowns) {
        Object.entries(currentHero.cooldowns).forEach(([k, v]) => {
          if (v > 1) decrementedCooldowns[k] = v - 1;
        });
      }

      let nextIndex = state.turnIndex + 1;
      let nextRound = state.round;
      let towerLogs = [];
      let roshanLogs = [];
      let spawnLogs = [];
      let nextTowers = state.towers;
      let nextCreeps = state.creeps;
      let nextRoshan = state.roshan;
      let workingHeroes = state.heroes.map(h => h.id === state.activeHeroId ? { ...h, cooldowns: decrementedCooldowns } : h);

      // Advance game clock: each turn adds 8 seconds to match 8s turn system
      const newGameTimeSeconds = (state.gameTimeSeconds || 0) + TIME_CONFIG.TURN_DURATION_SECONDS;
      let nextCreepWaveIndex = state.creepWaveIndex || 0;
      let nextLastCreepSpawnTime = state.lastCreepSpawnTime || 0;
      let nextLastNeutralSpawnTime = state.lastNeutralSpawnTime || 0;

      // Check Lane Creep spawn (First spawn after 60s, then every 60s)
      if (newGameTimeSeconds >= CREEP_CONFIG.LANE_FIRST_SPAWN_SECONDS &&
          (nextLastCreepSpawnTime === 0 || (newGameTimeSeconds - nextLastCreepSpawnTime) >= CREEP_CONFIG.LANE_SPAWN_INTERVAL_SECONDS)) {
        const wave = spawnCreepWave(nextCreepWaveIndex);
        nextCreeps = [...nextCreeps.filter(c => !c.isDead), ...wave];
        const { rangedCount, meleeCount } = getNextCreepWave(nextCreepWaveIndex);
        spawnLogs.push({
          id: `creep_wave_${Date.now()}`,
          round: nextRound,
          text: `⚔️ ВОЛНА КРИПОВ #${nextCreepWaveIndex + 1} (${newGameTimeSeconds}s): ${meleeCount} мечников + ${rangedCount} магов вышли на линии!`,
          type: 'SYSTEM'
        });
        nextCreepWaveIndex++;
        nextLastCreepSpawnTime = newGameTimeSeconds;
      }

      // Check Neutral Creep spawn (First spawn after 120s, then every 60s)
      if (newGameTimeSeconds >= CREEP_CONFIG.NEUTRAL_FIRST_SPAWN_SECONDS &&
          (nextLastNeutralSpawnTime === 0 || (newGameTimeSeconds - nextLastNeutralSpawnTime) >= CREEP_CONFIG.NEUTRAL_SPAWN_INTERVAL_SECONDS)) {
        const allLivingUnits = [
          ...workingHeroes.filter(h => !h.isDead),
          ...nextCreeps.filter(c => !c.isDead),
          ...(nextRoshan && !nextRoshan.isDead ? [nextRoshan] : [])
        ];
        const newNeutrals = spawnNeutralCreeps(nextCreeps, allLivingUnits);
        if (newNeutrals.length > 0) {
          nextCreeps = [...nextCreeps, ...newNeutrals];
          spawnLogs.push({
            id: `neutrals_${Date.now()}`,
            round: nextRound,
            text: `🌲 НЕЙТРАЛЬНЫЕ КРИПЫ (${newGameTimeSeconds}s): Лагеря леса возродились!`,
            type: 'SYSTEM'
          });
        }
        nextLastNeutralSpawnTime = newGameTimeSeconds;
      }

      // If full round completed, execute Towers, Roshan
      if (nextIndex >= state.initiativeOrder.length) {
        nextIndex = 0;
        nextRound += 1;

        // Towers attack nearest enemies
        const towerRes = executeTowerAttacks(nextTowers, workingHeroes, nextCreeps, { mapGrid: state.mapGrid });
        workingHeroes = towerRes.updatedHeroes;
        nextCreeps = towerRes.updatedCreeps;
        towerLogs = towerRes.logs;

        // Roshan attacks near pit
        const roshanRes = executeRoshanTurn(nextRoshan, workingHeroes);
        nextRoshan = roshanRes.roshan;
        workingHeroes = roshanRes.updatedHeroes;
        roshanLogs = roshanRes.logs;
      }

      // Find next living hero in initiative
      let attempts = 0;
      while (attempts < state.initiativeOrder.length) {
        const nextOrderEntry = state.initiativeOrder[nextIndex];
        const candidateHero = workingHeroes.find(h => h.id === nextOrderEntry.unitId);

        if (candidateHero && !candidateHero.isDead && candidateHero.hp > 0) {
          // Tick statuses for next hero
          const { unit: tickedHero, tickDamageList } = tickStatuses(candidateHero);
          workingHeroes = workingHeroes.map(h => h.id === tickedHero.id ? tickedHero : h);

          const effectiveSpeed = getUnitSpeed(tickedHero);

          const statusLogs = tickDamageList.map(td => ({
            id: `tick_${Date.now()}`,
            round: nextRound,
            text: `🩸 ${tickedHero.name} получает ${td.damage} ${td.damageType} урона от ${td.statusType}!`,
            type: 'DAMAGE'
          }));

          return {
            ...state,
            round: nextRound,
            turnIndex: nextIndex,
            gameTimeSeconds: newGameTimeSeconds,
            creepWaveIndex: nextCreepWaveIndex,
            lastCreepSpawnTime: nextLastCreepSpawnTime,
            lastNeutralSpawnTime: nextLastNeutralSpawnTime,
            activeHeroId: tickedHero.id,
            selectedHeroId: tickedHero.id,
            heroes: workingHeroes,
            towers: nextTowers,
            creeps: nextCreeps,
            roshan: nextRoshan,
            targetingMode: null,
            // Reset to 8.0s
            turnActions: {
              remainingTime: TIME_CONFIG.TURN_DURATION_SECONDS,
              totalTime: TIME_CONFIG.TURN_DURATION_SECONDS,
              movement: effectiveSpeed,
              movementMax: effectiveSpeed
            },
            combatLog: [
              ...state.combatLog,
              ...spawnLogs,
              ...towerLogs.map(l => ({ id: `tw_${Date.now()}_${Math.random()}`, round: nextRound, ...l })),
              ...roshanLogs.map(l => ({ id: `ro_${Date.now()}_${Math.random()}`, round: nextRound, ...l })),
              ...statusLogs,
              {
                id: `turn_${Date.now()}`,
                round: nextRound,
                text: `▶️ Ход [${nextRound}]: Очередь героя ${tickedHero.name} (${tickedHero.team.toUpperCase()})! Время хода: ${TIME_CONFIG.TURN_DURATION_SECONDS}.0 сек.`,
                type: 'TURN'
              }
            ]
          };
        }

        nextIndex = (nextIndex + 1) % state.initiativeOrder.length;
        attempts++;
      }

      return state;
    }

    case 'RESET_BATTLE': {
      return createInitialGameState();
    }

    default:
      return state;
  }
}
