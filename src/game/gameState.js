// Centralized Tactical Game State and Reducer Engine
import { INITIAL_HEROES_95 } from '../data/dota95Data.js';
import { HERO_ABILITIES_DATA } from '../data/dotaHeroesAbilities.js';
import { rollD20 } from './dice.js';
import { getReachableCells, findPath, getDistance } from './pathfinding.js';
import { resolveAttackRoll, applyDamage, applyHeal } from './damage.js';
import { tickStatuses, getUnitSpeed, canUnitAct, canUnitMove, canUnitCast, applyStatus, STATUS_TYPES } from './statuses.js';
import { executeAbility, getValidTargetCells, TARGET_TYPES } from './abilities.js';
import { executeItem } from './items.js';
import { createInitialTowers, createInitialRoshan, spawnCreepWave, executeTowerAttacks, executeRoshanTurn } from './towersAndCreeps.js';
import { generatePixelDotaMap, TILE_TYPES } from '../data/dotaPixelGrid.js';

// Create initial heroes with complete RPG stats
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
      attackMod: 7, // d20 + 7 to hit
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
    initiativeOrder,
    activeHeroId: activeHero.id,
    selectedHeroId: activeHero.id,
    turnActions: {
      movement: activeHero.speed || 6,
      movementMax: activeHero.speed || 6,
      hasAction: true,
      hasBonusAction: true,
      hasReaction: true
    },
    heroes,
    towers: createInitialTowers(),
    creeps: spawnCreepWave(1),
    roshan: createInitialRoshan(),
    mapGrid,
    targetingMode: null, // null | { type: 'ATTACK' | 'ABILITY' | 'ITEM', abilityId, itemId, validCells }
    latestDiceRoll: null,
    combatLog: [
      {
        id: 'init_start',
        round: 1,
        text: '⚔️ Битва началась! Инициатива брошена. Первый ход за ' + activeHero.name + '!',
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
    // 2. MOVE ACTIVE HERO
    // -------------------------------------------------------------
    case 'MOVE_HERO': {
      const activeHero = state.heroes.find(h => h.id === state.activeHeroId);
      if (!activeHero || activeHero.isDead) return state;

      if (!canUnitMove(activeHero)) {
        return { ...state, notification: '⛔ Персонаж не может двигаться (Оглушение / Опутывание)!' };
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

      return {
        ...state,
        heroes: updatedHeroes,
        turnActions: {
          ...state.turnActions,
          movement: remainingMovement
        },
        targetingMode: null,
        combatLog: [
          ...state.combatLog,
          {
            id: `move_${Date.now()}`,
            round: state.round,
            text: `🏃 ${activeHero.name} переместился на [${targetR}, ${targetC}] (${distSteps} шагов, осталось: ${remainingMovement})`,
            type: 'MOVE'
          }
        ]
      };
    }

    // -------------------------------------------------------------
    // 3. SET TARGETING MODE
    // -------------------------------------------------------------
    case 'SET_TARGETING': {
      const activeHero = state.heroes.find(h => h.id === state.activeHeroId);
      if (!activeHero || activeHero.isDead || !canUnitAct(activeHero)) return state;

      const { mode, abilityId, itemId } = action;

      if (mode === 'ATTACK') {
        if (!state.turnActions.hasAction) {
          return { ...state, notification: '⛔ Основное действие уже использовано в этом ходу!' };
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
          ? `⚔️ Режим атаки [Дальность: ${attackRange} кл] — врагов рядом нет. Подойдите ближе!`
          : `⚔️ Выберите цель для атаки (Дальность: ${attackRange} кл)`;

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

        if (!state.turnActions.hasAction && !ability.isBonusAction) {
          return { ...state, notification: '⛔ Основное действие уже использовано!' };
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
        // Handle Item targeting (e.g. Blink Dagger ground targeting)
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
          // Instant self item
          return gameReducer(state, { type: 'USE_ITEM', itemId });
        }
      }

      return state;
    }

    case 'CANCEL_TARGETING': {
      return { ...state, targetingMode: null };
    }

    // -------------------------------------------------------------
    // 4. PERFORM BASIC ATTACK (D20 ROLL VS ARMOR)
    // -------------------------------------------------------------
    case 'PERFORM_ATTACK': {
      const activeHero = state.heroes.find(h => h.id === state.activeHeroId);
      if (!activeHero || activeHero.isDead || !state.turnActions.hasAction) return state;

      const { targetId } = action;

      // Handle Roshan target
      if (targetId === 'roshan' && state.roshan && !state.roshan.isDead) {
        const attackResult = resolveAttackRoll(activeHero, state.roshan);
        const updatedRoshan = applyDamage(state.roshan, attackResult.finalDamage);

        return {
          ...state,
          roshan: updatedRoshan,
          turnActions: { ...state.turnActions, hasAction: false },
          targetingMode: null,
          latestDiceRoll: {
            notation: '1d20+' + attackResult.modifier,
            rolls: [attackResult.roll],
            total: attackResult.total,
            isCrit: attackResult.isCrit,
            isFail: attackResult.isFail,
            reason: `${activeHero.name} атакует Рошана`
          },
          combatLog: [
            ...state.combatLog,
            {
              id: `atk_${Date.now()}`,
              round: state.round,
              text: `⚔️ ${activeHero.name} атакует Рошана: d20 [${attackResult.roll}] + ${attackResult.modifier} = ${attackResult.total} vs Защита ${attackResult.targetDefense} → ${attackResult.status}! (${attackResult.finalDamage} физ. урона, HP Рошана: ${updatedRoshan.hp})`,
              type: 'ATTACK'
            }
          ]
        };
      }

      // Handle Tower target
      const targetTower = state.towers.find(t => t.id === targetId);
      if (targetTower && !targetTower.isDead) {
        const attackResult = resolveAttackRoll(activeHero, targetTower);
        const newHp = Math.max(0, (targetTower.currentHp || targetTower.hp) - attackResult.finalDamage);
        const isDead = newHp <= 0;
        const updatedTowers = state.towers.map(t => t.id === targetTower.id ? { ...t, currentHp: newHp, isDead } : t);

        return {
          ...state,
          towers: updatedTowers,
          turnActions: { ...state.turnActions, hasAction: false },
          targetingMode: null,
          latestDiceRoll: {
            notation: '1d20+' + attackResult.modifier,
            rolls: [attackResult.roll],
            total: attackResult.total,
            isCrit: attackResult.isCrit,
            isFail: attackResult.isFail,
            reason: `${activeHero.name} атакует ${targetTower.name}`
          },
          combatLog: [
            ...state.combatLog,
            {
              id: `atk_${Date.now()}`,
              round: state.round,
              text: `⚔️ ${activeHero.name} атакует ${targetTower.name}: d20 [${attackResult.roll}] + ${attackResult.modifier} = ${attackResult.total} → ${attackResult.status}! (${attackResult.finalDamage} физ. урона, HP вышки: ${newHp})`,
              type: 'ATTACK'
            },
            ...(isDead ? [{
              id: `tw_kill_${Date.now()}`,
              round: state.round,
              text: `💥 ${targetTower.name} разрушена героем ${activeHero.name}!`,
              type: 'DEATH'
            }] : [])
          ]
        };
      }

      // Handle Creep target
      const targetCreep = state.creeps.find(c => c.id === targetId);
      if (targetCreep && !targetCreep.isDead) {
        const attackResult = resolveAttackRoll(activeHero, targetCreep);
        const newHp = Math.max(0, targetCreep.hp - attackResult.finalDamage);
        const isDead = newHp <= 0;
        const updatedCreeps = state.creeps.map(c => c.id === targetCreep.id ? { ...c, hp: newHp, isDead } : c);

        return {
          ...state,
          creeps: updatedCreeps,
          turnActions: { ...state.turnActions, hasAction: false },
          targetingMode: null,
          latestDiceRoll: {
            notation: '1d20+' + attackResult.modifier,
            rolls: [attackResult.roll],
            total: attackResult.total,
            isCrit: attackResult.isCrit,
            isFail: attackResult.isFail,
            reason: `${activeHero.name} атакует ${targetCreep.name}`
          },
          combatLog: [
            ...state.combatLog,
            {
              id: `atk_${Date.now()}`,
              round: state.round,
              text: `⚔️ ${activeHero.name} атакует ${targetCreep.name}: d20 [${attackResult.roll}] + ${attackResult.modifier} = ${attackResult.total} → ${attackResult.status}! (${attackResult.finalDamage} физ. урона)`,
              type: 'ATTACK'
            },
            ...(isDead ? [{
              id: `creep_kill_${Date.now()}`,
              round: state.round,
              text: `💀 ${targetCreep.name} погиб!`,
              type: 'DEATH'
            }] : [])
          ]
        };
      }

      // Handle Hero target
      const targetHero = state.heroes.find(h => h.id === targetId);
      if (!targetHero || targetHero.isDead) return state;

      const attackResult = resolveAttackRoll(activeHero, targetHero);
      const updatedTarget = applyDamage(targetHero, attackResult.finalDamage);

      const updatedHeroes = state.heroes.map(h => {
        if (h.id === targetHero.id) return updatedTarget;
        return h;
      });

      return {
        ...state,
        heroes: updatedHeroes,
        turnActions: { ...state.turnActions, hasAction: false },
        targetingMode: null,
        latestDiceRoll: {
          notation: '1d20+' + attackResult.modifier,
          rolls: [attackResult.roll],
          total: attackResult.total,
          isCrit: attackResult.isCrit,
          isFail: attackResult.isFail,
          reason: `${activeHero.name} атакует ${targetHero.name}`
        },
        combatLog: [
          ...state.combatLog,
          {
            id: `atk_${Date.now()}`,
            round: state.round,
            text: `⚔️ ${activeHero.name} атакует ${targetHero.name}: d20 [${attackResult.roll}] + ${attackResult.modifier} = ${attackResult.total} vs Защита ${attackResult.targetDefense} → ${attackResult.status}! (${attackResult.finalDamage} физ. урона, HP ${targetHero.name}: ${targetHero.hp} → ${updatedTarget.hp})`,
            type: 'ATTACK'
          },
          ...(updatedTarget.isDead ? [{
            id: `kill_${Date.now()}`,
            round: state.round,
            text: `💀 ${targetHero.name} погибает в бою от руки ${activeHero.name}!`,
            type: 'DEATH'
          }] : [])
        ]
      };
    }

    // -------------------------------------------------------------
    // 5. EXECUTE ABILITY
    // -------------------------------------------------------------
    case 'EXECUTE_ABILITY': {
      const activeHero = state.heroes.find(h => h.id === state.activeHeroId);
      if (!activeHero || activeHero.isDead) return state;

      const ability = (activeHero.abilities || []).find(a => a.id === action.abilityId);
      if (!ability) return state;

      const result = executeAbility(ability, activeHero, action.targetPos, state);
      if (!result.success) {
        return { ...state, notification: result.reason };
      }

      // Map updated units
      const targetMap = new Map();
      result.updatedTargets.forEach(u => targetMap.set(u.id, u));

      const updatedHeroes = state.heroes.map(h => {
        if (h.id === result.updatedCaster.id) return result.updatedCaster;
        if (targetMap.has(h.id)) return targetMap.get(h.id);
        return h;
      });

      return {
        ...state,
        heroes: updatedHeroes,
        turnActions: {
          ...state.turnActions,
          hasAction: false
        },
        targetingMode: null,
        combatLog: [
          ...state.combatLog,
          ...result.logs.map((l, i) => ({ id: `ab_${Date.now()}_${i}`, round: state.round, ...l }))
        ]
      };
    }

    // -------------------------------------------------------------
    // 6. USE ITEM
    // -------------------------------------------------------------
    case 'USE_ITEM': {
      const activeHero = state.heroes.find(h => h.id === state.activeHeroId);
      if (!activeHero || activeHero.isDead) return state;

      const itemRes = executeItem(action.itemId, activeHero, action.targetPos);
      if (!itemRes.success) return { ...state, notification: itemRes.reason };

      const updatedHeroes = state.heroes.map(h => h.id === activeHero.id ? itemRes.updatedCaster : h);

      return {
        ...state,
        heroes: updatedHeroes,
        turnActions: {
          ...state.turnActions,
          hasBonusAction: false
        },
        targetingMode: null,
        combatLog: [
          ...state.combatLog,
          {
            id: `item_${Date.now()}`,
            round: state.round,
            text: itemRes.log,
            type: 'ITEM'
          }
        ]
      };
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
      let towerLogs = [];
      let roshanLogs = [];
      let nextTowers = state.towers;
      let nextCreeps = state.creeps;
      let nextRoshan = state.roshan;
      let workingHeroes = state.heroes.map(h => h.id === state.activeHeroId ? { ...h, cooldowns: decrementedCooldowns } : h);

      // If full round completed, execute Towers, Creeps, Roshan
      if (nextIndex >= state.initiativeOrder.length) {
        nextIndex = 0;
        nextRound += 1;

        // Towers attack nearest enemies
        const towerRes = executeTowerAttacks(nextTowers, workingHeroes, nextCreeps);
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
            activeHeroId: tickedHero.id,
            selectedHeroId: tickedHero.id,
            heroes: workingHeroes,
            towers: nextTowers,
            creeps: nextCreeps,
            roshan: nextRoshan,
            targetingMode: null,
            turnActions: {
              movement: effectiveSpeed,
              movementMax: effectiveSpeed,
              hasAction: canUnitAct(tickedHero),
              hasBonusAction: canUnitAct(tickedHero),
              hasReaction: true
            },
            combatLog: [
              ...state.combatLog,
              ...towerLogs.map(l => ({ id: `tw_${Date.now()}_${Math.random()}`, round: nextRound, ...l })),
              ...roshanLogs.map(l => ({ id: `ro_${Date.now()}_${Math.random()}`, round: nextRound, ...l })),
              ...statusLogs,
              {
                id: `turn_${Date.now()}`,
                round: nextRound,
                text: `▶️ Ход [${nextRound}]: Очередь героя ${tickedHero.name} (${tickedHero.team.toUpperCase()})! Скорость: ${effectiveSpeed} кл.`,
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
