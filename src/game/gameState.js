// Centralized Tactical Game State and Reducer Engine
// Implements 8-Second Player Turns, Continuous Tower Attack Timing (4s),
// Lane Creep March, and Approved Neutral Formations

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
  spawnNeutralCreeps, advanceCreepsAlongLanes,
  processContinuousTowerAttacks, executeRoshanTurn 
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
    phase: 'HERO_TURN',
    turnIndex: 0,
    // CONTINUOUS GAME TIME (Seconds)
    gameTimeSeconds: 0,
    creepWaveIndex: 0,
    lastCreepSpawnTime: 0,
    lastNeutralSpawnTime: 0,
    initiativeOrder,
    activeHeroId: activeHero.id,
    selectedHeroId: activeHero.id,
    // TIME SYSTEM: 8-second player turns. Only remainingTime limits actions.
    turnActions: {
      remainingTime: TIME_CONFIG.TURN_DURATION_SECONDS, // 8.0s
      totalTime: TIME_CONFIG.TURN_DURATION_SECONDS,     // 8.0s
      movement: activeHero.speed || 6,
      movementMax: activeHero.speed || 6
    },
    heroes,
    towers: createInitialTowers(),
    // 1. LANE CREEPS: NO initial spawn at 0s! First wave spawns strictly after 60s.
    creeps: [],
    roshan: createInitialRoshan(),
    mapGrid,
    targetingMode: null,
    latestDiceRoll: null,
    combatLog: [
      {
        id: 'init_start',
        round: 1,
        text: `⚔️ Битва началась! Ход героя: 8.0 сек. Первый ход за ${activeHero.name}. Крипы выйдут на линии через 60 сек!`,
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
    // 2. MOVE ACTIVE HERO (Costs strictly 2.0s per action, not linked to cell count)
    // -------------------------------------------------------------
    case 'MOVE_HERO': {
      const activeHero = state.heroes.find(h => h.id === state.activeHeroId);
      if (!activeHero || activeHero.isDead) return state;

      if (!canUnitMove(activeHero)) {
        return { ...state, notification: '⛔ Персонаж не может двигаться (Оглушение / Опутывание)!' };
      }

      // Movement time: 2.0s per MOVE action from config
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

      let updatedHeroes = state.heroes.map(h => h.id === activeHero.id ? updatedHero : h);
      const newRemainingTime = Math.max(0, +(state.turnActions.remainingTime - timeCost).toFixed(1));
      const newGameTimeSeconds = state.gameTimeSeconds + timeCost;

      // 5. Continuous Tower Attacks Check: fire whenever gameTime >= nextAttackTime
      const towerRes = processContinuousTowerAttacks(state.towers, updatedHeroes, state.creeps, newGameTimeSeconds, { mapGrid: state.mapGrid });
      updatedHeroes = towerRes.updatedHeroes;

      const moveLog = {
        id: `move_${Date.now()}`,
        round: state.round,
        text: `🏃 ${activeHero.name} переместился на [${targetR}, ${targetC}] (${distSteps} шагов, -${timeCost}s, осталось: ${newRemainingTime}s)`,
        type: 'MOVE'
      };

      const nextState = {
        ...state,
        gameTimeSeconds: newGameTimeSeconds,
        heroes: updatedHeroes,
        towers: towerRes.updatedTowers,
        creeps: towerRes.updatedCreeps,
        turnActions: {
          ...state.turnActions,
          remainingTime: newRemainingTime,
          movement: remainingMovement
        },
        targetingMode: null,
        combatLog: [...state.combatLog, moveLog, ...towerRes.logs]
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

        // Roshan if in range
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
      const newGameTimeSeconds = state.gameTimeSeconds + timeCost;

      // 5. Continuous Tower Attacks Check
      let workingTowers = state.towers;
      let workingCreeps = state.creeps;
      let workingHeroes = [...state.heroes];
      let workingRoshan = state.roshan;
      let atkLogs = [];

      // Handle Roshan target
      if (targetId === 'roshan' && workingRoshan && !workingRoshan.isDead) {
        const attackResult = resolveAttackRoll(activeHero, workingRoshan, { mapGrid: state.mapGrid });
        workingRoshan = applyDamage(workingRoshan, attackResult.finalDamage);

        atkLogs.push({
          id: `atk_${Date.now()}`,
          round: state.round,
          text: `⚔️ ${activeHero.name} атакует Рошана: Точность ${attackResult.hitChance}% → ${attackResult.status}! (${attackResult.finalDamage} физ. урона [броня: x${attackResult.armorMultiplier}], -${timeCost}s, осталось: ${newRemainingTime}s)`,
          type: 'ATTACK'
        });
      }

      // Handle Tower target
      const targetTower = workingTowers.find(t => t.id === targetId);
      if (targetTower && !targetTower.isDead) {
        const attackResult = resolveAttackRoll(activeHero, targetTower, { mapGrid: state.mapGrid });
        const newHp = Math.max(0, (targetTower.currentHp ?? targetTower.hp) - attackResult.finalDamage);
        const isDead = newHp <= 0;
        workingTowers = workingTowers.map(t => t.id === targetTower.id ? { ...t, currentHp: newHp, isDead } : t);

        atkLogs.push({
          id: `atk_${Date.now()}`,
          round: state.round,
          text: `⚔️ ${activeHero.name} атакует ${targetTower.name}: Точность ${attackResult.hitChance}% → ${attackResult.status}! (${attackResult.finalDamage} физ. урона, HP вышки: ${newHp}, -${timeCost}s, осталось: ${newRemainingTime}s)`,
          type: 'ATTACK'
        });
        if (isDead) {
          atkLogs.push({
            id: `tw_kill_${Date.now()}`,
            round: state.round,
            text: `💥 ${targetTower.name} разрушена героем ${activeHero.name}!`,
            type: 'DEATH'
          });
        }
      }

      // Handle Creep target
      const targetCreep = workingCreeps.find(c => c.id === targetId);
      if (targetCreep && !targetCreep.isDead) {
        const attackResult = resolveAttackRoll(activeHero, targetCreep, { mapGrid: state.mapGrid });
        const newHp = Math.max(0, targetCreep.hp - attackResult.finalDamage);
        const isDead = newHp <= 0;
        workingCreeps = workingCreeps.map(c => c.id === targetCreep.id ? { ...c, hp: newHp, isDead } : c);

        atkLogs.push({
          id: `atk_${Date.now()}`,
          round: state.round,
          text: `⚔️ ${activeHero.name} атакует ${targetCreep.name}: Точность ${attackResult.hitChance}% → ${attackResult.status}! (${attackResult.finalDamage} физ. урона, -${timeCost}s, осталось: ${newRemainingTime}s)`,
          type: 'ATTACK'
        });
        if (isDead) {
          atkLogs.push({
            id: `creep_kill_${Date.now()}`,
            round: state.round,
            text: `💀 ${targetCreep.name} погиб!`,
            type: 'DEATH'
          });
        }
      }

      // Handle Hero target
      const targetHero = workingHeroes.find(h => h.id === targetId);
      if (targetHero && !targetHero.isDead) {
        const attackResult = resolveAttackRoll(activeHero, targetHero, { mapGrid: state.mapGrid });
        const updatedTarget = applyDamage(targetHero, attackResult.finalDamage);
        workingHeroes = workingHeroes.map(h => h.id === targetHero.id ? updatedTarget : h);

        atkLogs.push({
          id: `atk_${Date.now()}`,
          round: state.round,
          text: `⚔️ ${activeHero.name} атакует ${targetHero.name}: Точность ${attackResult.hitChance}% → ${attackResult.status}! (${attackResult.finalDamage} физ. урона, HP: ${targetHero.hp} → ${updatedTarget.hp}, -${timeCost}s, осталось: ${newRemainingTime}s)`,
          type: 'ATTACK'
        });
        if (updatedTarget.isDead) {
          atkLogs.push({
            id: `kill_${Date.now()}`,
            round: state.round,
            text: `💀 ${targetHero.name} погибает в бою от руки ${activeHero.name}!`,
            type: 'DEATH'
          });
        }
      }

      // Check continuous tower attacks during this elapsed action time
      const towerRes = processContinuousTowerAttacks(workingTowers, workingHeroes, workingCreeps, newGameTimeSeconds, { mapGrid: state.mapGrid });

      const nextState = {
        ...state,
        gameTimeSeconds: newGameTimeSeconds,
        roshan: workingRoshan,
        towers: towerRes.updatedTowers,
        creeps: towerRes.updatedCreeps,
        heroes: towerRes.updatedHeroes,
        turnActions: { ...state.turnActions, remainingTime: newRemainingTime },
        targetingMode: null,
        combatLog: [...state.combatLog, ...atkLogs, ...towerRes.logs]
      };

      if (newRemainingTime <= 0) return gameReducer(nextState, { type: 'END_TURN' });
      return nextState;
    }

    // -------------------------------------------------------------
    // 5. EXECUTE ABILITY (Costs 4.0s of turn time)
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
      const newGameTimeSeconds = state.gameTimeSeconds + timeCost;

      // Map updated units
      const targetMap = new Map();
      result.updatedTargets.forEach(u => targetMap.set(u.id, u));

      let updatedHeroes = state.heroes.map(h => {
        if (h.id === result.updatedCaster.id) return result.updatedCaster;
        if (targetMap.has(h.id)) return targetMap.get(h.id);
        return h;
      });

      // Check continuous tower attacks during this elapsed action time
      const towerRes = processContinuousTowerAttacks(state.towers, updatedHeroes, state.creeps, newGameTimeSeconds, { mapGrid: state.mapGrid });

      const nextState = {
        ...state,
        gameTimeSeconds: newGameTimeSeconds,
        heroes: towerRes.updatedHeroes,
        towers: towerRes.updatedTowers,
        creeps: towerRes.updatedCreeps,
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
          })),
          ...towerRes.logs
        ]
      };

      if (newRemainingTime <= 0) return gameReducer(nextState, { type: 'END_TURN' });
      return nextState;
    }

    // -------------------------------------------------------------
    // 6. USE ITEM (Costs 2.0s of turn time)
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
      const newGameTimeSeconds = state.gameTimeSeconds + timeCost;
      let updatedHeroes = state.heroes.map(h => h.id === activeHero.id ? itemRes.updatedCaster : h);

      // Check continuous tower attacks during this elapsed action time
      const towerRes = processContinuousTowerAttacks(state.towers, updatedHeroes, state.creeps, newGameTimeSeconds, { mapGrid: state.mapGrid });

      const nextState = {
        ...state,
        gameTimeSeconds: newGameTimeSeconds,
        heroes: towerRes.updatedHeroes,
        towers: towerRes.updatedTowers,
        creeps: towerRes.updatedCreeps,
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
          },
          ...towerRes.logs
        ]
      };

      if (newRemainingTime <= 0) return gameReducer(nextState, { type: 'END_TURN' });
      return nextState;
    }

    // -------------------------------------------------------------
    // 7. END TURN & CYCLE INITIATIVE
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
      let roshanLogs = [];
      let spawnLogs = [];
      let nextTowers = state.towers;
      let nextCreeps = state.creeps;
      let nextRoshan = state.roshan;
      let workingHeroes = state.heroes.map(h => h.id === state.activeHeroId ? { ...h, cooldowns: decrementedCooldowns } : h);

      // Advance game clock: add unused turn time so player turn completes its 8.0s window
      const unusedTime = Math.max(0, +(state.turnActions.remainingTime || 0).toFixed(1));
      const newGameTimeSeconds = state.gameTimeSeconds + unusedTime;
      let nextCreepWaveIndex = state.creepWaveIndex || 0;
      let nextLastCreepSpawnTime = state.lastCreepSpawnTime || 0;
      let nextLastNeutralSpawnTime = state.lastNeutralSpawnTime || 0;

      // 1. LANE CREEPS: First wave spawns after 60s, then every 60s
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

      // 1. LANE CREEPS MOVEMENT: Advance creeps along lanes towards enemy base
      const creepMoveRes = advanceCreepsAlongLanes(nextCreeps, workingHeroes, nextTowers, { mapGrid: state.mapGrid });
      nextCreeps = creepMoveRes.updatedCreeps;

      // 3. NEUTRAL CREEPS: First spawn after 120s, then every 60s with approved formations
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
            text: `🌲 НЕЙТРАЛЬНЫЕ КРИПЫ (${newGameTimeSeconds}s): Лагеря леса возродились по утверждённым уровням!`,
            type: 'SYSTEM'
          });
        }
        nextLastNeutralSpawnTime = newGameTimeSeconds;
      }

      // 5. CONTINUOUS TOWER ATTACKS: Fire whenever gameTime >= nextAttackTime
      const towerRes = processContinuousTowerAttacks(nextTowers, workingHeroes, nextCreeps, newGameTimeSeconds, { mapGrid: state.mapGrid });
      nextTowers = towerRes.updatedTowers;
      workingHeroes = towerRes.updatedHeroes;
      nextCreeps = towerRes.updatedCreeps;

      // If full round completed, execute Roshan
      if (nextIndex >= state.initiativeOrder.length) {
        nextIndex = 0;
        nextRound += 1;

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
            // Reset player turn time to 8.0s
            turnActions: {
              remainingTime: TIME_CONFIG.TURN_DURATION_SECONDS,
              totalTime: TIME_CONFIG.TURN_DURATION_SECONDS,
              movement: effectiveSpeed,
              movementMax: effectiveSpeed
            },
            combatLog: [
              ...state.combatLog,
              ...spawnLogs,
              ...towerRes.logs,
              ...roshanLogs.map(l => ({ id: `ro_${Date.now()}_${Math.random()}`, round: nextRound, ...l })),
              ...statusLogs,
              {
                id: `turn_${Date.now()}`,
                round: nextRound,
                text: `▶️ Ход [${nextRound}]: Очередь героя ${tickedHero.name} (${tickedHero.team.toUpperCase()})! Время хода: 8.0 сек. [Время боя: ${Math.floor(newGameTimeSeconds / 60)}:${String(Math.floor(newGameTimeSeconds % 60)).padStart(2, '0')}]`,
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
