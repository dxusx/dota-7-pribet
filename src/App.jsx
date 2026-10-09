import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { generateDotaMap, MAP_SIZE, TERRAIN } from './map/dotaMapData';
import DotaMapCanvas from './components/DotaMapCanvas';
import DotaHeroConsole from './components/DotaHeroConsole';
import DotaSkillTooltip from './components/DotaSkillTooltip';
import { getHeroPortrait } from './assets/heroPortraits';
import { getSkillIcon } from './assets/skillIcons';
import { createInitialGameState, endTurn, swapHeroInGameState } from './game/gameState';
import { HEROES_ROSTER } from './game/heroesData';
import {
  canPerformAction,
  deductActionTime,
  resolveAttack,
  applyClassLevelUp,
  canCastSkills,
  TURN_DURATION_SECONDS,
} from './game/combatRules';
import { executeSkill } from './game/skillEngine';
import { decideBotAction } from './game/botAI';
import { createSkillVfx, createAttackVfx } from './game/vfxRules';
import {
  Grid,
  Trees,
  Maximize2,
  X,
  Footprints,
  Swords,
  ChevronLeft,
  ChevronRight,
  Clock,
  Target,
  Sparkles,
  Info,
  Users,
  Bot,
} from 'lucide-react';

export default function App() {
  const mapData = useMemo(() => generateDotaMap(), []);
  const [gameState, setGameState] = useState(() => createInitialGameState());

  const [selectedTile, setSelectedTile] = useState(null);
  const [hoveredTile, setHoveredTile] = useState(null);
  const [showGrid, setShowGrid] = useState(true);
  const [showTrees, setShowTrees] = useState(true);
  const [showIcons, setShowIcons] = useState(true);
  const [targetPos, setTargetPos] = useState(null);

  // Tactical interaction mode: null | 'move' | 'attack' | 'skill'
  const [actionMode, setActionMode] = useState('move'); // Default to move mode for smooth 1-click navigation
  const [targetingSkill, setTargetingSkill] = useState(null);
  const [hoveredSkillTooltip, setHoveredSkillTooltip] = useState(null);
  const [floatingTexts, setFloatingTexts] = useState([]);
  const [weskerMode, setWeskerMode] = useState('ranged');
  const [showRosterModal, setShowRosterModal] = useState(false);
  const [botAiEnabled, setBotAiEnabled] = useState(false);

  // Active hero
  const activeHeroId = gameState.initiativeQueue[gameState.activeUnitIndex];
  const activeHero = gameState.heroes.find(h => h.instanceId === activeHeroId) || gameState.heroes[0];

  useEffect(() => {
    if (activeHero?.defId === 'wesker') {
      setWeskerMode(activeHero.weaponMode || (activeHero.range > 1 ? 'ranged' : 'melee'));
    }
  }, [activeHero]);

  const toggleWeskerMode = useCallback(() => {
    if (activeHero?.defId !== 'wesker') return;
    const nextMode = weskerMode === 'ranged' ? 'melee' : 'ranged';
    setWeskerMode(nextMode);
    setGameState(prev => ({
      ...prev,
      heroes: prev.heroes.map(hero =>
        hero.instanceId === activeHero.instanceId
          ? { ...hero, weaponMode: nextMode, damage: nextMode === 'ranged' ? 40 : 5, range: nextMode === 'ranged' ? 5 : 1 }
          : hero
      ),
    }));
  }, [activeHero, weskerMode]);

  // Helper to add floating combat text
  const addFloatingText = useCallback((x, y, text, color = '#f59e0b') => {
    const id = `${Date.now()}_${Math.random()}`;
    setFloatingTexts(prev => [...prev.slice(-15), { id, x, y, text, color, createdAt: Date.now() }]);
  }, []);

  const [vfxList, setVfxList] = useState([]);

  // Helper to add visual effect
  const addVfx = useCallback(vfx => {
    if (!vfx) return;
    setVfxList(prev => [...prev.slice(-25), vfx]);
    setTimeout(() => {
      setVfxList(prev => prev.filter(item => item.id !== vfx.id));
    }, (vfx.durationMs || 1000) + 100);
  }, []);

  // Flush pending turn VFX (such as autonomous tower defense shots) and floating texts
  useEffect(() => {
    if (gameState.pendingVfx && gameState.pendingVfx.length > 0) {
      gameState.pendingVfx.forEach(v => addVfx(v));
    }
    if (gameState.pendingFloatingTexts && gameState.pendingFloatingTexts.length > 0) {
      gameState.pendingFloatingTexts.forEach(ft => addFloatingText(ft.x, ft.y, ft.text, ft.color));
    }
  }, [gameState.turnNumber, addVfx, addFloatingText]);

  const timelineRef = useRef(null);

  const handleTimelineWheel = useCallback(e => {
    if (timelineRef.current) {
      timelineRef.current.scrollLeft += e.deltaY;
    }
  }, []);

  const scrollTimeline = useCallback(offset => {
    if (timelineRef.current) {
      timelineRef.current.scrollBy({ left: offset, behavior: 'smooth' });
    }
  }, []);

  // Auto-scroll active hero into view when turn changes
  useEffect(() => {
    if (timelineRef.current) {
      const activeEl = timelineRef.current.querySelector('[data-active="true"]');
      if (activeEl) {
        activeEl.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }
    }
  }, [gameState.activeUnitIndex]);

  // Helper to check if a tile is walkable (not tree, not cliff, inside bounds)
  const isCellWalkable = useCallback(
    (x, y) => {
      if (x < 0 || x >= MAP_SIZE || y < 0 || y >= MAP_SIZE) return false;
      const tile = mapData?.tiles?.[y * MAP_SIZE + x];
      if (!tile || tile.hasTree || tile.terrain === TERRAIN.CLIFF) return false;
      return true;
    },
    [mapData]
  );

  // Active hero speed and max reachable steps for the remaining turn time
  const heroSpeed = activeHero?.speed || 6;
  const maxSteps = useMemo(() => {
    if (!activeHero || activeHero.isDead || gameState.remainingTurnTime <= 0) return 0;
    return Math.floor((gameState.remainingTurnTime * heroSpeed) / TURN_DURATION_SECONDS + 0.001);
  }, [activeHero, heroSpeed, gameState.remainingTurnTime]);

  // Compute Reachable Movement Range Cells using BFS
  const reachableMoveCells = useMemo(() => {
    if (actionMode !== 'move' || !activeHero || activeHero.isDead || maxSteps <= 0) return [];

    const queue = [{ x: activeHero.x, y: activeHero.y, dist: 0 }];
    const visited = new Set();
    const startKey = activeHero.y * MAP_SIZE + activeHero.x;
    visited.add(startKey);
    const reachable = [];

    while (queue.length > 0) {
      const { x, y, dist } = queue.shift();
      if (dist > 0) {
        reachable.push({ x, y, dist });
      }
      if (dist >= maxSteps) continue;

      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          if (dx === 0 && dy === 0) continue;
          const nx = x + dx;
          const ny = y + dy;
          const key = ny * MAP_SIZE + nx;
          if (!visited.has(key) && isCellWalkable(nx, ny)) {
            visited.add(key);
            queue.push({ x: nx, y: ny, dist: dist + 1 });
          }
        }
      }
    }
    return reachable;
  }, [actionMode, activeHero, maxSteps, isCellWalkable]);

  // BFS Pathfinding from start to target
  const findWalkPath = useCallback(
    (startX, startY, targetX, targetY) => {
      if (startX === targetX && startY === targetY) return [];
      if (!isCellWalkable(targetX, targetY)) return [];

      const queue = [{ x: startX, y: startY }];
      const cameFrom = new Map();
      const startKey = startY * MAP_SIZE + startX;
      const targetKey = targetY * MAP_SIZE + targetX;
      cameFrom.set(startKey, null);

      let found = false;
      let limit = 2500;

      while (queue.length > 0 && limit-- > 0) {
        const current = queue.shift();
        const currKey = current.y * MAP_SIZE + current.x;
        if (currKey === targetKey) {
          found = true;
          break;
        }

        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            if (dx === 0 && dy === 0) continue;
            const nx = current.x + dx;
            const ny = current.y + dy;
            const nKey = ny * MAP_SIZE + nx;
            if (!cameFrom.has(nKey) && isCellWalkable(nx, ny)) {
              cameFrom.set(nKey, current);
              queue.push({ x: nx, y: ny });
            }
          }
        }
      }

      if (!found) return [];

      const path = [];
      let curr = { x: targetX, y: targetY };
      while (curr) {
        const key = curr.y * MAP_SIZE + curr.x;
        const prev = cameFrom.get(key);
        if (prev) {
          path.unshift(curr);
          curr = prev;
        } else {
          break;
        }
      }
      return path;
    },
    [isCellWalkable]
  );

  // Compute 1-Click Hover Path and Time Cost
  const { hoverPath, pathTimeCost, canAffordPath, pctOfTurn, isMaxCapReached } = useMemo(() => {
    if (!hoveredTile || !activeHero || activeHero.isDead || actionMode !== 'move' || targetingSkill) {
      return { hoverPath: [], pathTimeCost: null, canAffordPath: true, pctOfTurn: 0, isMaxCapReached: false };
    }

    if (hoveredTile.x === activeHero.x && hoveredTile.y === activeHero.y) {
      return { hoverPath: [], pathTimeCost: null, canAffordPath: true, pctOfTurn: 0, isMaxCapReached: false };
    }

    if (!isCellWalkable(hoveredTile.x, hoveredTile.y)) {
      return { hoverPath: [], pathTimeCost: null, canAffordPath: false, pctOfTurn: 0, isMaxCapReached: false };
    }

    const fullPath = findWalkPath(activeHero.x, activeHero.y, hoveredTile.x, hoveredTile.y);
    if (fullPath.length === 0) {
      return { hoverPath: [], pathTimeCost: null, canAffordPath: false, pctOfTurn: 0, isMaxCapReached: false };
    }

    // Hero walks up to maxSteps for this turn
    const isExceeding = fullPath.length > maxSteps;
    const effectiveSteps = Math.min(fullPath.length, maxSteps);
    const path = fullPath.slice(0, effectiveSteps);

    const cost = Number(((effectiveSteps * TURN_DURATION_SECONDS) / heroSpeed).toFixed(1));
    const canAfford = effectiveSteps > 0 && cost <= gameState.remainingTurnTime;
    const pct = Math.min(100, Math.round((cost / TURN_DURATION_SECONDS) * 100));

    return {
      hoverPath: path,
      pathTimeCost: cost,
      canAffordPath: canAfford,
      pctOfTurn: pct,
      isMaxCapReached: isExceeding,
    };
  }, [hoveredTile, activeHero, actionMode, targetingSkill, maxSteps, heroSpeed, gameState.remainingTurnTime, isCellWalkable, findWalkPath]);

  // Current game time in match (including fractional seconds used in current turn)
  const currentMatchTime = useMemo(() => {
    return Number((gameState.gameTimeSeconds + (TURN_DURATION_SECONDS - gameState.remainingTurnTime)).toFixed(1));
  }, [gameState.gameTimeSeconds, gameState.remainingTurnTime]);

  // Compute Skill Target Range Cells
  const skillTargetCells = useMemo(() => {
    if (!targetingSkill || !activeHero) return [];
    const range = targetingSkill.range || targetingSkill.radius || 4;
    const cells = [];
    const { x: startX, y: startY } = activeHero;

    for (let dy = -range; dy <= range; dy++) {
      for (let dx = -range; dx <= range; dx++) {
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist <= range + 0.5) {
          const px = startX + dx;
          const py = startY + dy;
          if (px >= 0 && px < MAP_SIZE && py >= 0 && py < MAP_SIZE) {
            cells.push({ x: px, y: py });
          }
        }
      }
    }
    return cells;
  }, [targetingSkill, activeHero]);

  // Compute Attack Range Cells
  const reachableAttackCells = useMemo(() => {
    if (actionMode !== 'attack' || !activeHero || activeHero.isDead) return [];
    const range = activeHero.range || 1;
    const cells = [];
    const { x: startX, y: startY } = activeHero;

    for (let dy = -range; dy <= range; dy++) {
      for (let dx = -range; dx <= range; dx++) {
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist <= range + 0.5) {
          const px = startX + dx;
          const py = startY + dy;
          if (px >= 0 && px < MAP_SIZE && py >= 0 && py < MAP_SIZE) {
            cells.push({ x: px, y: py });
          }
        }
      }
    }
    return cells;
  }, [actionMode, activeHero]);

  // Handle Cell Click (Move in 1 click, or Attack, or Cast Skill)
  const handleCellClick = useCallback(
    tile => {
      if (!activeHero || activeHero.isDead) return;

      // 1. Cast Targeted Skill
      if (targetingSkill) {
        const isWithinRange = skillTargetCells.some(c => c.x === tile.x && c.y === tile.y);
        if (!isWithinRange) {
          addFloatingText(tile.x, tile.y, 'Вне радиуса!', '#ef4444');
          return;
        }

        const targetHero = gameState.heroes.find(
          h => !h.isDead && h.faction !== activeHero.faction && h.x === tile.x && h.y === tile.y
        );

        const targetCreep = !targetHero && (gameState.creeps || []).find(
          c => !c.isDead && c.faction !== activeHero.faction && c.x === tile.x && c.y === tile.y
        );

        const result = executeSkill({
          skill: targetingSkill,
          caster: activeHero,
          targetTile: tile,
          targetHero,
          targetCreep,
          gameState,
          mapData,
        });

        if (!result.success) {
          addFloatingText(tile.x, tile.y, result.reason, '#ef4444');
          return;
        }

        addVfx(createSkillVfx(targetingSkill.id, { x: activeHero.x, y: activeHero.y }, { x: tile.x, y: tile.y }));

        setGameState(prev => ({
          ...prev,
          heroes: result.updatedHeroes,
          creeps: result.updatedCreeps || prev.creeps,
          remainingTurnTime: result.newRemainingTime,
          combatLogs: [{ text: result.logMessage, time: prev.gameTimeSeconds }, ...prev.combatLogs.slice(0, 15)],
        }));

        result.floatingTexts.forEach(ft => addFloatingText(ft.x, ft.y, ft.text, ft.color));
        setTargetingSkill(null);
        return;
      }

      // 2. Attack Mode
      if (actionMode === 'attack') {
        const isWithinRange = reachableAttackCells.some(c => c.x === tile.x && c.y === tile.y);
        if (isWithinRange) {
          const attackTimeCost = activeHero.period || 4.0;
          if (!canPerformAction(gameState.remainingTurnTime, attackTimeCost)) {
            addFloatingText(activeHero.x, activeHero.y, 'Нет времени на атаку!', '#ef4444');
            return;
          }

          // Target Hero
          const targetHero = gameState.heroes.find(
            h => !h.isDead && h.faction !== activeHero.faction && h.x === tile.x && h.y === tile.y
          );

          // Target Creep (Lane or Neutral)
          const targetCreep = !targetHero && (gameState.creeps || []).find(
            c => !c.isDead && c.faction !== activeHero.faction && c.x === tile.x && c.y === tile.y
          );

          // Target Tower (2x2) or Ancient (4x4)
          const targetTower = !targetHero && !targetCreep && (gameState.towers || []).find(t => {
            if (t.hp <= 0 || t.faction === activeHero.faction) return false;
            const sz = t.size || 2;
            return tile.x >= t.x && tile.x < t.x + sz && tile.y >= t.y && tile.y < t.y + sz;
          });

          const attackerElevation = mapData.tiles[activeHero.y * MAP_SIZE + activeHero.x]?.elevation || 1;
          const targetElevation = tile.elevation || 1;
          const isRanged = (activeHero.range || 1) > 2;

          if (targetHero) {
            addVfx(createAttackVfx({ x: activeHero.x, y: activeHero.y }, { x: targetHero.x, y: targetHero.y }, isRanged, activeHero.faction));
            const res = resolveAttack({
              averageDamage: activeHero.damage,
              penetration: activeHero.penetration,
              hit: activeHero.hit,
              targetArmor: targetHero.armor,
              targetAgility: targetHero.agility,
              attackerElevation,
              targetElevation,
              isRanged,
            });

            if (!res.isHit) {
              addFloatingText(targetHero.x, targetHero.y, 'ПРОМАХ!', '#94a3b8');
            } else {
              const text = res.isCrit ? `КРИТ! -${res.damage}` : `-${res.damage}`;
              const color = res.isCrit ? '#f59e0b' : '#ef4444';
              addFloatingText(targetHero.x, targetHero.y, text, color);

              setGameState(prev => {
                const updatedHeroes = prev.heroes.map(h => {
                  if (h.instanceId === targetHero.instanceId) {
                    const newHp = Math.max(0, h.hp - res.damage);
                    return { ...h, hp: newHp, isDead: newHp <= 0 };
                  }
                  return h;
                });
                const newTime = deductActionTime(prev.remainingTurnTime, attackTimeCost);
                return {
                  ...prev,
                  heroes: updatedHeroes,
                  remainingTurnTime: newTime,
                  combatLogs: [
                    {
                      text: `${activeHero.name} атаковал ${targetHero.name}: ${res.damage} урона (${res.reason}) [-${attackTimeCost}с]`,
                      time: prev.gameTimeSeconds,
                    },
                    ...prev.combatLogs.slice(0, 15),
                  ],
                };
              });
            }
            return;
          }

          if (targetCreep) {
            addVfx(createAttackVfx({ x: activeHero.x, y: activeHero.y }, { x: targetCreep.x, y: targetCreep.y }, isRanged, activeHero.faction));
            const res = resolveAttack({
              averageDamage: activeHero.damage,
              penetration: activeHero.penetration,
              hit: activeHero.hit,
              targetArmor: targetCreep.armor || 0,
              targetAgility: targetCreep.agility || 0,
              attackerElevation,
              targetElevation,
              isRanged,
            });

            if (!res.isHit) {
              addFloatingText(targetCreep.x, targetCreep.y, 'ПРОМАХ!', '#94a3b8');
            } else {
              const text = res.isCrit ? `КРИТ! -${res.damage}` : `-${res.damage}`;
              const color = res.isCrit ? '#f59e0b' : '#ef4444';
              addFloatingText(targetCreep.x, targetCreep.y, text, color);

              const willDie = targetCreep.hp - res.damage <= 0;
              const xpReward = 30 + targetCreep.level * 15;

              if (willDie) {
                setTimeout(() => {
                  addFloatingText(targetCreep.x, targetCreep.y, `💀 КРИП УБИТ! +${xpReward} XP`, '#eab308');
                }, 300);
              }

              setGameState(prev => {
                const updatedCreeps = prev.creeps.map(c => {
                  if (c.id === targetCreep.id) {
                    const newHp = Math.max(0, c.hp - res.damage);
                    return { ...c, hp: newHp, isDead: newHp <= 0 };
                  }
                  return c;
                }).filter(c => !c.isDead && c.hp > 0);

                const updatedHeroes = prev.heroes.map(h => {
                  if (h.instanceId === activeHero.instanceId && willDie) {
                    const newXp = h.xp + xpReward;
                    const nextLvlXp = h.level * 100;
                    if (newXp >= nextLvlXp && h.level < 18) {
                      const leveled = applyClassLevelUp(h);
                      return {
                        ...leveled,
                        xp: newXp - nextLvlXp,
                      };
                    }
                    return { ...h, xp: newXp };
                  }
                  return h;
                });

                const newTime = deductActionTime(prev.remainingTurnTime, attackTimeCost);
                const creepName = targetCreep.isNeutral
                  ? `Лесного крипа (${targetCreep.type} ур.${targetCreep.level})`
                  : `Крипа (${targetCreep.faction === 'radiant' ? 'Radiant' : 'Dire'} ${targetCreep.type} ур.${targetCreep.level})`;

                return {
                  ...prev,
                  creeps: updatedCreeps,
                  heroes: updatedHeroes,
                  remainingTurnTime: newTime,
                  combatLogs: [
                    {
                      text: `${activeHero.name} атаковал ${creepName}: ${res.damage} урона (${res.reason})${willDie ? ' [УБИТ]' : ` [${Math.max(0, targetCreep.hp - res.damage)}/${targetCreep.maxHp} HP]`} [-${attackTimeCost}с]`,
                      time: prev.gameTimeSeconds,
                    },
                    ...prev.combatLogs.slice(0, 15),
                  ],
                };
              });
            }
            return;
          }

          if (targetTower) {
            addVfx(createAttackVfx({ x: activeHero.x, y: activeHero.y }, { x: tile.x, y: tile.y }, isRanged, activeHero.faction));
            const res = resolveAttack({
              averageDamage: activeHero.damage,
              penetration: activeHero.penetration,
              hit: activeHero.hit,
              targetArmor: targetTower.armor,
              targetAgility: 0,
              attackerElevation,
              targetElevation,
              isRanged,
            });

            if (!res.isHit) {
              addFloatingText(tile.x, tile.y, 'ПРОМАХ!', '#94a3b8');
            } else {
              const text = res.isCrit ? `КРИТ! -${res.damage}` : `-${res.damage}`;
              const color = res.isCrit ? '#f59e0b' : '#ef4444';
              addFloatingText(tile.x, tile.y, text, color);

              const willDestroy = targetTower.hp - res.damage <= 0;
              if (willDestroy) {
                setTimeout(() => {
                  addFloatingText(tile.x, tile.y, '💥 БАШНЯ УНИЧТОЖЕНА!', '#f97316');
                }, 300);
              }

              setGameState(prev => {
                const updatedTowers = prev.towers.map(t => {
                  if (t.id === targetTower.id) {
                    const newHp = Math.max(0, t.hp - res.damage);
                    return { ...t, hp: newHp };
                  }
                  return t;
                });

                const newTime = deductActionTime(prev.remainingTurnTime, attackTimeCost);
                return {
                  ...prev,
                  towers: updatedTowers,
                  remainingTurnTime: newTime,
                  combatLogs: [
                    {
                      text: `${activeHero.name} атаковал башню [${targetTower.id}]: ${res.damage} урона (${res.reason})${willDestroy ? ' [УНИЧТОЖЕНА]' : ` [${Math.max(0, targetTower.hp - res.damage)}/${targetTower.maxHp} HP]`} [-${attackTimeCost}с]`,
                      time: prev.gameTimeSeconds,
                    },
                    ...prev.combatLogs.slice(0, 15),
                  ],
                };
              });
            }
            return;
          }
        }
      }

      // 3. Move in One Click
      if (actionMode === 'move' && hoverPath.length > 0 && pathTimeCost !== null) {
        if (!canAffordPath || hoverPath.length === 0) {
          addFloatingText(tile.x, tile.y, 'Не хватает времени!', '#ef4444');
          return;
        }

        const destinationCell = hoverPath[hoverPath.length - 1];

        setGameState(prev => {
          const updatedHeroes = prev.heroes.map(h => {
            if (h.instanceId === activeHero.instanceId) {
              return { ...h, x: destinationCell.x, y: destinationCell.y };
            }
            return h;
          });
          const newTime = deductActionTime(prev.remainingTurnTime, pathTimeCost);
          return {
            ...prev,
            heroes: updatedHeroes,
            remainingTurnTime: newTime,
            combatLogs: [
              {
                text: `${activeHero.name} прошел ${hoverPath.length} шагов до [${destinationCell.x}, ${destinationCell.y}] (-${pathTimeCost}с, ${pctOfTurn}% хода)`,
                time: prev.gameTimeSeconds,
              },
              ...prev.combatLogs.slice(0, 15),
            ],
          };
        });

        addFloatingText(destinationCell.x, destinationCell.y, `🚶 -${pathTimeCost}с (${hoverPath.length} ш.)`, '#38bdf8');
      }
    },
    [
      activeHero,
      targetingSkill,
      skillTargetCells,
      actionMode,
      reachableAttackCells,
      hoverPath,
      pathTimeCost,
      canAffordPath,
      pctOfTurn,
      gameState,
      mapData,
      addFloatingText,
      addVfx,
    ]
  );

  // Skill click from bottom bar
  const handleSkillClick = skill => {
    if (!activeHero || activeHero.isDead) return;
    if (skill.type === 'PASSIVE') return;

    if (!canCastSkills(activeHero)) {
      addFloatingText(activeHero.x, activeHero.y, 'Безмолвие / Контроль!', '#ef4444');
      return;
    }

    if (activeHero.mana < skill.manaCost) {
      addFloatingText(activeHero.x, activeHero.y, 'Недостаточно маны!', '#38bdf8');
      return;
    }
    if (skill.currentCooldown > 0) {
      addFloatingText(activeHero.x, activeHero.y, 'Перезарядка!', '#94a3b8');
      return;
    }
    if (!canPerformAction(gameState.remainingTurnTime, skill.timeCost)) {
      addFloatingText(activeHero.x, activeHero.y, `Мало времени! Нужно ${skill.timeCost}с`, '#ef4444');
      return;
    }

    // If instant/self skill (timeCost 0 or self buff or weapon toggle or self AoE)
    const isSelfCast =
      skill.id === 'stars-agent' ||
      skill.id === 'mastermind' ||
      skill.id === 'preparation' ||
      skill.id === 'divine-regen' ||
      skill.id === 'rot' ||
      skill.id === 'clutch-master' ||
      skill.id === 'angel-power' ||
      skill.id === 'last-cat-live' ||
      skill.id === 'prion' ||
      skill.id === 'cromwell-seal-1' ||
      skill.id === 'cromwell-seal-2' ||
      skill.id === 'cromwell-seal-0' ||
      skill.id === 'berserkers-call' ||
      skill.id === 'unlimited-void' ||
      skill.id === 'infinity' ||
      skill.id === 'requiem-of-souls' ||
      skill.id === 'whirlwind-slash' ||
      skill.id === 'malevolent-shrine' ||
      skill.id === 'blade-dance' ||
      skill.id === 'holy-barrier';

    if (isSelfCast) {
      const res = executeSkill({
        skill,
        caster: activeHero,
        gameState,
        mapData,
      });

      if (res.success) {
        addVfx(createSkillVfx(skill.id, { x: activeHero.x, y: activeHero.y }, { x: activeHero.x, y: activeHero.y }));
        setGameState(prev => ({
          ...prev,
          heroes: res.updatedHeroes,
          remainingTurnTime: res.newRemainingTime,
          combatLogs: [{ text: res.logMessage, time: prev.gameTimeSeconds }, ...prev.combatLogs.slice(0, 15)],
        }));
        res.floatingTexts.forEach(ft => addFloatingText(ft.x, ft.y, ft.text, ft.color));
      }
      return;
    }

    // Otherwise, enter targeting mode!
    setTargetingSkill(skill);
    setActionMode('skill');
  };

  // End turn
  const handleEndTurn = useCallback(() => {
    setGameState(prev => endTurn(prev));
    setTargetingSkill(null);
    setActionMode('move');
  }, []);

  // Autonomous Dire Bot AI Turn Loop
  useEffect(() => {
    if (!botAiEnabled || !activeHero || activeHero.faction !== 'dire') {
      return;
    }

    if (activeHero.isDead || gameState.remainingTurnTime <= 0) {
      const timer = setTimeout(() => {
        handleEndTurn();
      }, 350);
      return () => clearTimeout(timer);
    }

    const timer = setTimeout(() => {
      const decision = decideBotAction(activeHero, gameState, mapData);

      if (decision.action === 'END_TURN') {
        handleEndTurn();
        return;
      }

      if (decision.action === 'MOVE') {
        const dest = decision.destination;
        const isOccupied = gameState.heroes.some(h => !h.isDead && h.x === dest.x && h.y === dest.y);
        if (!isCellWalkable(dest.x, dest.y) || isOccupied) {
          handleEndTurn();
          return;
        }

        setGameState(prev => {
          const updatedHeroes = prev.heroes.map(h =>
            h.instanceId === activeHero.instanceId ? { ...h, x: dest.x, y: dest.y } : h
          );
          const newTime = deductActionTime(prev.remainingTurnTime, decision.stepCost);
          return {
            ...prev,
            heroes: updatedHeroes,
            remainingTurnTime: newTime,
            combatLogs: [
              {
                text: `[ИИ] ${activeHero.name} переместился на [${dest.x}, ${dest.y}] (-${decision.stepCost}с)`,
                time: prev.gameTimeSeconds,
              },
              ...prev.combatLogs.slice(0, 15),
            ],
          };
        });
        addFloatingText(dest.x, dest.y, `🚶 -${decision.stepCost}с`, '#38bdf8');
        return;
      }

      if (decision.action === 'ATTACK') {
        const target = decision.target;
        const attackTimeCost = activeHero.period || 4.0;
        const attackerElevation = mapData?.tiles?.[activeHero.y * MAP_SIZE + activeHero.x]?.elevation || 1;
        const targetElevation = mapData?.tiles?.[target.y * MAP_SIZE + target.x]?.elevation || 1;
        const isRanged = (activeHero.range || 1) > 2;

        addVfx(createAttackVfx({ x: activeHero.x, y: activeHero.y }, { x: target.x, y: target.y }, isRanged, activeHero.faction));

        const res = resolveAttack({
          averageDamage: activeHero.damage,
          penetration: activeHero.penetration,
          hit: activeHero.hit,
          targetArmor: target.armor || 0,
          targetAgility: target.agility || 0,
          attackerElevation,
          targetElevation,
          isRanged,
        });

        if (!res.isHit) {
          addFloatingText(target.x, target.y, 'ПРОМАХ!', '#94a3b8');
        } else {
          const text = res.isCrit ? `КРИТ! -${res.damage}` : `-${res.damage}`;
          const color = res.isCrit ? '#f59e0b' : '#ef4444';
          addFloatingText(target.x, target.y, text, color);
        }

        setGameState(prev => {
          const newTime = deductActionTime(prev.remainingTurnTime, attackTimeCost);
          if (target.instanceId) {
            const updatedHeroes = prev.heroes.map(h => {
              if (h.instanceId === target.instanceId && res.isHit) {
                const newHp = Math.max(0, h.hp - res.damage);
                return { ...h, hp: newHp, isDead: newHp <= 0 };
              }
              return h;
            });
            return {
              ...prev,
              heroes: updatedHeroes,
              remainingTurnTime: newTime,
              combatLogs: [
                {
                  text: `[ИИ] ${activeHero.name} атаковал ${target.name}: ${res.isHit ? `${res.damage} ур.` : 'промах'} [-${attackTimeCost}с]`,
                  time: prev.gameTimeSeconds,
                },
                ...prev.combatLogs.slice(0, 15),
              ],
            };
          } else {
            const updatedCreeps = prev.creeps
              .map(c => {
                if (c.id === target.id && res.isHit) {
                  const newHp = Math.max(0, c.hp - res.damage);
                  return { ...c, hp: newHp, isDead: newHp <= 0 };
                }
                return c;
              })
              .filter(c => !c.isDead && c.hp > 0);
            return {
              ...prev,
              creeps: updatedCreeps,
              remainingTurnTime: newTime,
              combatLogs: [
                {
                  text: `[ИИ] ${activeHero.name} атаковал крипа: ${res.isHit ? `${res.damage} ур.` : 'промах'} [-${attackTimeCost}с]`,
                  time: prev.gameTimeSeconds,
                },
                ...prev.combatLogs.slice(0, 15),
              ],
            };
          }
        });
        return;
      }

      if (decision.action === 'SKILL') {
        const res = executeSkill({
          skill: decision.skill,
          caster: activeHero,
          targetCell: decision.target ? { x: decision.target.x, y: decision.target.y } : null,
          targetHero: decision.target?.instanceId ? decision.target : null,
          gameState,
          mapData,
        });

        if (res.success) {
          const targetPos = decision.target ? { x: decision.target.x, y: decision.target.y } : { x: activeHero.x, y: activeHero.y };
          addVfx(createSkillVfx(decision.skill.id, { x: activeHero.x, y: activeHero.y }, targetPos));
          setGameState(prev => ({
            ...prev,
            heroes: res.updatedHeroes,
            remainingTurnTime: res.newRemainingTime,
            combatLogs: [{ text: `[ИИ] ${res.logMessage}`, time: prev.gameTimeSeconds }, ...prev.combatLogs.slice(0, 15)],
          }));
          res.floatingTexts?.forEach(ft => addFloatingText(ft.x, ft.y, ft.text, ft.color));
        } else {
          handleEndTurn();
        }
        return;
      }
    }, 450);

    return () => clearTimeout(timer);
  }, [
    botAiEnabled,
    activeHero,
    gameState,
    isCellWalkable,
    handleEndTurn,
    mapData,
    addFloatingText,
    addVfx,
  ]);

  // Keyboard Hotkeys
  useEffect(() => {
    const handleKeyDown = e => {
      if (!activeHero || activeHero.isDead) return;

      if (e.key === 'Escape') {
        setTargetingSkill(null);
        setActionMode('move');
        return;
      }
      if (e.code === 'Space') {
        e.preventDefault();
        handleEndTurn();
        return;
      }
      if (e.key === '1' || e.key.toLowerCase() === 'm') {
        setActionMode('move');
        setTargetingSkill(null);
        return;
      }
      if (e.key === '2' || e.key.toLowerCase() === 'a') {
        setActionMode('attack');
        setTargetingSkill(null);
        return;
      }

      // Skills: Q, W, E, R, D
      const hotkeys = ['q', 'w', 'e', 'r', 'd'];
      const keyIndex = hotkeys.indexOf(e.key.toLowerCase());
      if (keyIndex !== -1 && activeHero.skills[keyIndex]) {
        handleSkillClick(activeHero.skills[keyIndex]);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeHero, gameState, handleEndTurn]);

  return (
    <div className="flex flex-col w-screen h-screen bg-[#07090e] text-slate-100 overflow-hidden font-sans select-none">
      {/* 1. Header Toolbar & Timeline */}
      <header className="h-14 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 px-4 flex items-center justify-between shrink-0 z-20">
        {/* Left: Round & Turn Info */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-gradient-to-br from-amber-600 to-red-600 flex flex-col items-center justify-center font-bold shadow-md border border-amber-400/40">
            <span className="text-[8px] uppercase tracking-tighter text-amber-200">Рнд</span>
            <span className="text-xs leading-none text-white">{gameState.roundNumber}</span>
          </div>

          <div className="hidden sm:block">
            <div className="text-xs font-bold text-slate-200 flex items-center gap-2">
              <span>ХОД {gameState.turnNumber}</span>
              <span className="text-[10px] text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/30 font-mono">
                ⏱️ {currentMatchTime.toFixed(1)}с
              </span>
              {(() => {
                const isDay = Math.floor(currentMatchTime / 300) % 2 === 0;
                const nextCycleSec = 300 - (Math.floor(currentMatchTime) % 300);
                const cycleMin = Math.floor(nextCycleSec / 60);
                const cycleSec = String(nextCycleSec % 60).padStart(2, '0');
                return (
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-bold border flex items-center gap-1 ${
                      isDay
                        ? 'bg-amber-950/60 border-amber-500/40 text-amber-300'
                        : 'bg-indigo-950/60 border-indigo-500/40 text-indigo-300'
                    }`}
                    title={isDay ? 'День: Рошан в Южном логове (74, 76)' : 'Ночь: Рошан в Северном логове (26, 24)'}
                  >
                    <span>{isDay ? '☀️ День' : '🌙 Ночь'}</span>
                    <span>({cycleMin}:{cycleSec})</span>
                    <span className="text-slate-400">• Рошан: {isDay ? 'Юг' : 'Сев.'}</span>
                  </span>
                );
              })()}
            </div>
            <div className="text-[10px] text-slate-400 font-mono flex items-center gap-2">
              <span>⚔️ Крипы: {Math.max(0, Math.round(gameState.nextLaneWaveTime - currentMatchTime))}с</span>
              <span className="text-slate-600">•</span>
              <span>🐺 Лес: {Math.max(0, Math.round(gameState.nextNeutralSpawnTime - currentMatchTime))}с</span>
            </div>
          </div>
        </div>

        {/* Center: Initiative Timeline with Left/Right arrows and horizontal wheel scroll */}
        <div className="flex items-center gap-1 max-w-xl lg:max-w-2xl px-1">
          <button
            onClick={() => scrollTimeline(-120)}
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors shrink-0"
            title="Прокрутить очередь влево"
          >
            <ChevronLeft size={16} />
          </button>

          <div
            ref={timelineRef}
            onWheel={handleTimelineWheel}
            className="flex items-center gap-1.5 overflow-x-auto py-1 px-1.5 bg-slate-950/80 rounded-xl border border-slate-800 custom-scrollbar scroll-smooth"
          >
            {gameState.initiativeQueue.map((heroId, idx) => {
              const hero = gameState.heroes.find(h => h.instanceId === heroId);
              if (!hero) return null;
              const isActive = idx === gameState.activeUnitIndex;
              const isRad = hero.faction === 'radiant';

              return (
                <button
                  key={hero.instanceId}
                  data-active={isActive ? 'true' : undefined}
                  onClick={() => setTargetPos({ x: hero.x, y: hero.y })}
                  title={`${hero.name} (Инициатива: ${hero.initiativeRoll})`}
                  className={`relative px-2 py-1 rounded-lg flex items-center gap-1.5 transition-all shrink-0 cursor-pointer ${
                    isActive
                      ? 'bg-amber-500/25 border-2 border-amber-400 shadow-md scale-105'
                      : hero.isDead
                      ? 'opacity-40 bg-slate-900 border border-slate-800'
                      : 'bg-slate-900/80 border border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className={`relative w-6 h-6 rounded-full overflow-hidden border ${isRad ? 'border-emerald-400' : 'border-rose-400'} shrink-0 ${isActive ? 'ring-2 ring-amber-400 animate-pulse shadow-md shadow-amber-400/50' : ''}`}>
                    <img src={getHeroPortrait(hero.defId || hero.id)} alt={hero.name} className="w-full h-full object-cover" />
                  </div>
                  <span className={`text-xs font-bold font-mono ${isActive ? 'text-amber-300' : 'text-slate-300'}`}>
                    {hero.name.split(' ')[0]}
                  </span>
                  <span className={`w-2 h-2 rounded-full ${isRad ? 'bg-emerald-400' : 'bg-red-400'}`} />
                </button>
              );
            })}
          </div>

          <button
            onClick={() => scrollTimeline(120)}
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors shrink-0"
            title="Прокрутить очередь вправо"
          >
            <ChevronRight size={16} />
          </button>
        </div>

        {/* Right: Map Toggles & Roster */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setBotAiEnabled(prev => !prev)}
            title={botAiEnabled ? 'ИИ ботов Dire включен (автоматический ход)' : 'ИИ ботов Dire выключен'}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs border font-semibold transition-colors cursor-pointer ${
              botAiEnabled
                ? 'bg-rose-950/80 border-rose-500/50 text-rose-300 hover:bg-rose-900'
                : 'bg-slate-800/80 border-slate-700 text-slate-400 hover:bg-slate-700'
            }`}
          >
            <Bot size={14} />
            <span>{botAiEnabled ? '🤖 ИИ: ВКЛ' : '🤖 ИИ: ВЫКЛ'}</span>
          </button>

          <button
            onClick={() => setShowRosterModal(true)}
            title="Все 15 героев (Выбрать в матч)"
            className="flex items-center gap-1.5 px-2.5 py-1 rounded text-xs border font-semibold bg-indigo-950/80 border-indigo-500/50 text-indigo-300 hover:bg-indigo-900 transition-colors cursor-pointer"
          >
            <Users size={14} />
            <span>Ростер (15)</span>
          </button>

          <button
            onClick={() => setShowGrid(!showGrid)}
            title="Сетка 100x100"
            className={`p-1.5 rounded text-xs border font-mono transition-colors ${
              showGrid
                ? 'bg-amber-500/20 border-amber-500/50 text-amber-300'
                : 'bg-slate-800/60 border-slate-700 text-slate-400'
            }`}
          >
            <Grid size={14} />
          </button>

          <button
            onClick={() => setShowTrees(!showTrees)}
            title="Лес"
            className={`p-1.5 rounded text-xs border font-mono transition-colors ${
              showTrees
                ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300'
                : 'bg-slate-800/60 border-slate-700 text-slate-400'
            }`}
          >
            <Trees size={14} />
          </button>

          <button
            onClick={() => setShowIcons(!showIcons)}
            title="Значки и объекты"
            className={`p-1.5 rounded text-xs border font-mono transition-colors ${
              showIcons
                ? 'bg-indigo-500/20 border-indigo-500/50 text-indigo-300'
                : 'bg-slate-800/60 border-slate-700 text-slate-400'
            }`}
          >
            <Sparkles size={14} />
          </button>

          <button
            onClick={() => setTargetPos({ x: 50, y: 50 })}
            title="Центр карты"
            className="p-1.5 rounded text-xs border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-200"
          >
            <Maximize2 size={14} />
          </button>
        </div>
      </header>

      {/* 2. Main Battlefield Viewport */}
      <div className="relative flex-1 w-full h-full overflow-hidden">
        {/* Targeting Banner if targeting skill (Floating HUD overlay - prevents canvas layout shift) */}
        {targetingSkill && (
          <div className="absolute top-3 left-1/2 -translate-x-1/2 bg-purple-950/95 border border-purple-500/70 py-1.5 px-4 rounded-xl shadow-2xl text-center text-xs font-mono font-bold text-purple-200 flex items-center justify-center gap-3 z-30 animate-in fade-in duration-150 backdrop-blur-md">
            <Sparkles size={14} className="text-purple-300 animate-spin" />
            <span>
              🎯 Выберите {
                ['spell-steal', 'mind-control', 'divine-rapier', 'prion'].includes(targetingSkill.id)
                  ? 'вражеского героя'
                  : ['meat-hook', 'shunpo', 'barrier-seal', 'sun-strike', 'chaos-meteor', 'shadowraze-near', 'shadowraze-medium', 'shadowraze-far', 'awp-wallbang', 'oneway-smoke', 'flashbang', 'furnace-open', 'hollow-purple', 'everywhere-nowhere', 'light-speed', 'prepare-thyself', 'crush'].includes(targetingSkill.id)
                  ? 'точку на карте'
                  : 'цель (вражеского героя или крипа)'
              } для [{targetingSkill.name}] (Дальность: {targetingSkill.range || targetingSkill.radius || 4})
            </span>
            <button
              onClick={() => {
                setTargetingSkill(null);
                setActionMode('move');
              }}
              className="px-2.5 py-0.5 rounded bg-purple-900 hover:bg-purple-800 text-[10px] uppercase border border-purple-400/50 text-white cursor-pointer ml-1 transition-colors"
            >
              Отмена [Esc]
            </button>
          </div>
        )}

        <DotaMapCanvas
          mapData={mapData}
          selectedTile={selectedTile}
          onSelectTile={setSelectedTile}
          showGrid={showGrid}
          showIcons={showIcons}
          showTrees={showTrees}
          targetPos={targetPos}
          heroes={gameState.heroes}
          creeps={gameState.creeps}
          towers={gameState.towers}
          roshan={gameState.roshan}
          reachableMoveCells={reachableMoveCells}
          reachableAttackCells={reachableAttackCells}
          skillTargetCells={skillTargetCells}
          hoverPath={hoverPath}
          pathTimeCost={pathTimeCost}
          canAffordPath={canAffordPath}
          maxSteps={maxSteps}
          heroSpeed={heroSpeed}
          isMaxCapReached={isMaxCapReached}
          floatingTexts={floatingTexts}
          vfxList={vfxList}
          onCellClick={handleCellClick}
          onHoverTile={setHoveredTile}
        />

        {/* Selected Tile Inspector */}
        {selectedTile && (() => {
          const tileHero = gameState.heroes.find(h => !h.isDead && h.x === selectedTile.x && h.y === selectedTile.y);
          const tileCreep = !tileHero && (gameState.creeps || []).find(c => !c.isDead && c.x === selectedTile.x && c.y === selectedTile.y);
          const tileAncient = !tileHero && !tileCreep && (gameState.towers || []).find(t =>
            (t.id === 'rad_throne' || t.id === 'dire_throne') &&
            selectedTile.x >= t.x && selectedTile.x <= t.x + 3 &&
            selectedTile.y >= t.y && selectedTile.y <= t.y + 3
          );
          const tileTower = !tileHero && !tileCreep && !tileAncient && (gameState.towers || []).find(t =>
            t.id !== 'rad_throne' && t.id !== 'dire_throne' && t.hp > 0 &&
            selectedTile.x >= t.x && selectedTile.x <= t.x + 1 &&
            selectedTile.y >= t.y && selectedTile.y <= t.y + 1
          );
          const tileRoshan = !tileHero && !tileCreep && !tileAncient && !tileTower && gameState.roshan && (
            Math.hypot(selectedTile.x - gameState.roshan.x, selectedTile.y - gameState.roshan.y) <= 2.8 ||
            (selectedTile.object && selectedTile.object.type === 'ROSHAN_PIT')
          );
          const tileBounty = selectedTile.object && selectedTile.object.type === 'BOUNTY_ALTAR';

          return (
            <aside className="absolute top-4 right-4 w-72 bg-slate-900/95 backdrop-blur-md border border-slate-700 rounded-xl p-3.5 shadow-2xl z-10 animate-in fade-in slide-in-from-right duration-200 max-h-[80vh] overflow-y-auto custom-scrollbar">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="text-amber-400 font-mono font-bold text-sm">
                    [{selectedTile.x}, {selectedTile.y}]
                  </span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded font-mono font-bold uppercase bg-slate-800 text-slate-300 border border-slate-700">
                    {selectedTile.faction}
                  </span>
                </div>
                <button onClick={() => setSelectedTile(null)} className="text-slate-400 hover:text-white p-1 rounded">
                  <X size={14} />
                </button>
              </div>

              {/* Unit Card: Ancient Sanctuary (4x4) */}
              {tileAncient && (
                <div className={`mt-2.5 p-3 rounded-lg bg-slate-950 border space-y-2.5 ${
                  tileAncient.faction === 'radiant' ? 'border-emerald-500/50 shadow-emerald-950/40 shadow-lg' : 'border-red-500/50 shadow-red-950/40 shadow-lg'
                }`}>
                  <div className="flex items-center gap-2.5">
                    <span className="text-3xl">{tileAncient.faction === 'radiant' ? '🌳' : '🌋'}</span>
                    <div>
                      <div className={`font-bold text-sm ${tileAncient.faction === 'radiant' ? 'text-emerald-300' : 'text-rose-300'}`}>
                        {tileAncient.faction === 'radiant' ? 'Древо Жизни' : 'Трон Тьмы'}
                      </div>
                      <div className="text-[10px] text-amber-400 font-mono font-bold uppercase">
                        Главная Святыня • Размер 4x4
                      </div>
                    </div>
                  </div>

                  {/* HP Bar */}
                  <div>
                    <div className="flex justify-between text-[11px] font-mono text-slate-300 mb-1">
                      <span>Прочность:</span>
                      <span className={`font-bold ${tileAncient.faction === 'radiant' ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {tileAncient.hp} / {tileAncient.maxHp} HP
                      </span>
                    </div>
                    <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
                      <div
                        className={`h-full transition-all duration-200 ${tileAncient.faction === 'radiant' ? 'bg-emerald-500' : 'bg-rose-500'}`}
                        style={{ width: `${Math.max(0, (tileAncient.hp / tileAncient.maxHp) * 100)}%` }}
                      />
                    </div>
                  </div>

                  <div className="bg-slate-900/80 p-2 rounded text-[10px] text-slate-300 border border-slate-800 leading-relaxed font-sans">
                    ⚔️ <span className="font-bold text-amber-300">Цель матча:</span> Уничтожение трона врага приносит немедленную победу!
                  </div>
                </div>
              )}

              {/* Unit Card: Roshan the Immortal */}
              {tileRoshan && gameState.roshan && (
                <div className="mt-2.5 p-3 rounded-lg bg-slate-950 border border-purple-500/50 shadow-purple-950/40 shadow-lg space-y-2.5">
                  <div className="flex items-center gap-2.5">
                    <span className="text-3xl">👹</span>
                    <div>
                      <div className="font-bold text-sm text-purple-300">
                        {gameState.roshan.name}
                      </div>
                      <div className="text-[10px] text-amber-400 font-mono font-bold uppercase">
                        Древний Титан • Босс
                      </div>
                    </div>
                  </div>

                  {/* HP Bar */}
                  <div>
                    <div className="flex justify-between text-[11px] font-mono text-slate-300 mb-1">
                      <span>Здоровье:</span>
                      <span className="font-bold text-rose-400">
                        {gameState.roshan.hp} / {gameState.roshan.maxHp} HP
                      </span>
                    </div>
                    <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
                      <div
                        className="h-full bg-rose-600 transition-all duration-200"
                        style={{ width: `${Math.max(0, (gameState.roshan.hp / gameState.roshan.maxHp) * 100)}%` }}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-1 text-[10px] font-mono">
                    <div className="bg-slate-900 p-1.5 rounded text-center">
                      <span className="text-slate-400 block text-[8px]">УРОН</span>
                      <span className="text-amber-400 font-bold">{gameState.roshan.damage}</span>
                    </div>
                    <div className="bg-slate-900 p-1.5 rounded text-center">
                      <span className="text-slate-400 block text-[8px]">БРОНЯ</span>
                      <span className="text-blue-400 font-bold">{gameState.roshan.armor}</span>
                    </div>
                  </div>

                  <div className="bg-purple-950/40 p-2 rounded text-[10px] text-purple-200 border border-purple-800/50 leading-relaxed font-mono">
                    📍 Текущее логово: <span className="font-bold text-amber-300">{gameState.roshan.pitId === 'north' ? 'Север (Ночь, 26, 24)' : 'Юг (День, 74, 76)'}</span>
                    <br />
                    🔄 Каждые 5 минут (300с) меняет логово (День/Ночь)!
                  </div>
                </div>
              )}

              {/* Unit Card: Bounty Altar */}
              {tileBounty && (
                <div className="mt-2.5 p-3 rounded-lg bg-slate-950 border border-amber-500/50 shadow-amber-950/40 shadow-lg space-y-2">
                  <div className="flex items-center gap-2.5">
                    <span className="text-2xl">🪙</span>
                    <div>
                      <div className="font-bold text-xs text-amber-300">
                        {selectedTile.object.name}
                      </div>
                      <div className="text-[10px] text-amber-400 font-mono">
                        Святилище руны золота
                      </div>
                    </div>
                  </div>
                  <div className="bg-amber-950/30 p-2 rounded text-[10px] text-amber-200 border border-amber-800/50 leading-relaxed font-sans">
                    🪙 Дарует <span className="font-bold text-amber-300">+40 золота</span> каждому герою союзной фракции!
                  </div>
                </div>
              )}

              {/* Unit Card: Creep */}
              {tileCreep && (
                <div className="mt-2.5 p-2.5 rounded-lg bg-slate-950 border border-amber-500/30 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">
                        {tileCreep.type === 'MELEE' ? '⚔️' : tileCreep.type === 'RANGED' ? '🏹' : '🐺'}
                      </span>
                      <div>
                        <div className="font-bold text-xs text-amber-300">
                          {tileCreep.isNeutral
                            ? `Лесной ${tileCreep.type === 'MELEE' ? 'Мечник' : 'Стрелок'}`
                            : `${tileCreep.faction === 'radiant' ? 'Radiant' : 'Dire'} ${tileCreep.type === 'MELEE' ? 'Мечник' : 'Стрелок'}`}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          Уровень {tileCreep.level} • {tileCreep.lane ? `Линия: ${tileCreep.lane.toUpperCase()}` : tileCreep.campName || 'Лагерь'}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* HP Bar */}
                  <div>
                    <div className="flex justify-between text-[10px] font-mono text-slate-300 mb-1">
                      <span>Здоровье:</span>
                      <span className="font-bold text-emerald-400">{tileCreep.hp} / {tileCreep.maxHp} HP</span>
                    </div>
                    <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 transition-all duration-200"
                        style={{ width: `${Math.max(0, (tileCreep.hp / tileCreep.maxHp) * 100)}%` }}
                      />
                    </div>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-3 gap-1 text-[10px] font-mono pt-1 border-t border-slate-800/80">
                    <div className="bg-slate-900 p-1 rounded text-center">
                      <span className="text-slate-400 block text-[8px]">УРОН</span>
                      <span className="text-amber-400 font-bold">{tileCreep.damage}</span>
                    </div>
                    <div className="bg-slate-900 p-1 rounded text-center">
                      <span className="text-slate-400 block text-[8px]">БРОНЯ</span>
                      <span className="text-blue-400 font-bold">{tileCreep.armor}</span>
                    </div>
                    <div className="bg-slate-900 p-1 rounded text-center">
                      <span className="text-slate-400 block text-[8px]">ЛОВКОСТЬ</span>
                      <span className="text-emerald-400 font-bold">{tileCreep.agility}</span>
                    </div>
                    <div className="bg-slate-900 p-1 rounded text-center">
                      <span className="text-slate-400 block text-[8px]">ДАЛЬНОСТЬ</span>
                      <span className="text-purple-400 font-bold">{tileCreep.range}</span>
                    </div>
                    <div className="bg-slate-900 p-1 rounded text-center">
                      <span className="text-slate-400 block text-[8px]">ПРОБИТИЕ</span>
                      <span className="text-rose-400 font-bold">{tileCreep.penetration}</span>
                    </div>
                    <div className="bg-slate-900 p-1 rounded text-center">
                      <span className="text-slate-400 block text-[8px]">СКОРОСТЬ</span>
                      <span className="text-cyan-400 font-bold">{tileCreep.speed}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Unit Card: Hero */}
              {tileHero && (
                <div className={`mt-2.5 p-2.5 rounded-lg bg-slate-950 border space-y-2 ${
                  tileHero.faction === 'radiant' ? 'border-emerald-500/40 shadow-emerald-950/30' : 'border-rose-500/40 shadow-rose-950/30'
                } shadow-lg`}>
                  <div className="flex items-center gap-2">
                    <img
                      src={getHeroPortrait(tileHero.defId || tileHero.id)}
                      alt={tileHero.name}
                      className={`w-12 h-12 rounded-lg object-cover border-2 shrink-0 ${
                        tileHero.faction === 'radiant' ? 'border-emerald-400' : 'border-rose-400'
                      }`}
                    />
                    <div className="min-w-0">
                      <div className="font-bold text-xs text-slate-100 truncate">{tileHero.name}</div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        Ур. {tileHero.level} • {tileHero.title} ({tileHero.faction.toUpperCase()})
                      </div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-[10px] font-mono text-slate-300 mb-1">
                      <span>HP: {tileHero.hp}/{tileHero.maxHp}</span>
                      <span>MP: {tileHero.mana}/{tileHero.maxMana}</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden mb-1">
                      <div className="h-full bg-emerald-500" style={{ width: `${(tileHero.hp / tileHero.maxHp) * 100}%` }} />
                    </div>
                    <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500" style={{ width: `${(tileHero.mana / tileHero.maxMana) * 100}%` }} />
                    </div>
                  </div>
                  {/* Hero Stats Grid */}
                  <div className="grid grid-cols-3 gap-1 text-[10px] font-mono pt-1 border-t border-slate-800/80">
                    <div className="bg-slate-900 p-1 rounded text-center" title="Урон">
                      <span className="text-slate-400 block text-[8px]">⚔️ УРОН</span>
                      <span className="text-red-400 font-bold">{tileHero.damage}</span>
                    </div>
                    <div className="bg-slate-900 p-1 rounded text-center" title="Броня">
                      <span className="text-slate-400 block text-[8px]">🛡️ БРОНЯ</span>
                      <span className="text-blue-400 font-bold">{tileHero.armor}</span>
                    </div>
                    <div className="bg-slate-900 p-1 rounded text-center" title="Ловкость">
                      <span className="text-slate-400 block text-[8px]">⚡ ЛОВК</span>
                      <span className="text-emerald-400 font-bold">{tileHero.agility || 15}</span>
                    </div>
                    <div className="bg-slate-900 p-1 rounded text-center" title="Скорость">
                      <span className="text-slate-400 block text-[8px]">🦶 СКОР</span>
                      <span className="text-amber-300 font-bold">{tileHero.speed}</span>
                    </div>
                    <div className="bg-slate-900 p-1 rounded text-center" title="Дальность атаки">
                      <span className="text-slate-400 block text-[8px]">🎯 ДАЛЬ</span>
                      <span className="text-purple-400 font-bold">{tileHero.range}</span>
                    </div>
                    <div className="bg-slate-900 p-1 rounded text-center" title="Пробитие брони">
                      <span className="text-slate-400 block text-[8px]">🏹 ПРОБ</span>
                      <span className="text-rose-400 font-bold">{tileHero.penetration || 0}</span>
                    </div>
                  </div>

                  {/* Inspected Hero Skills */}
                  {tileHero.skills && tileHero.skills.length > 0 && (
                    <div className="pt-2 border-t border-slate-800/80">
                      <div className="text-[10px] font-mono text-slate-400 mb-1">Способности героя:</div>
                      <div className="flex flex-wrap gap-1">
                        {tileHero.skills.map((s) => (
                          <div key={s.id} className="relative group/skill">
                            <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 hover:border-amber-400/80 rounded px-1.5 py-0.5 cursor-help transition-all">
                              <img src={getSkillIcon(s.id)} alt={s.name} className="w-3.5 h-3.5 rounded-sm object-cover" />
                              <span className="text-[9px] font-mono text-slate-300 font-bold">{s.name}</span>
                            </div>
                            <div className="hidden group-hover/skill:block absolute bottom-full mb-1 right-0 z-50 pointer-events-none">
                              <DotaSkillTooltip
                                skill={s}
                                hero={tileHero}
                                skillIconUrl={getSkillIcon(s.id)}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Unit Card: Tower (2x2) */}
              {tileTower && (
                <div className="mt-2.5 p-2.5 rounded-lg bg-slate-950 border border-red-500/30 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{tileTower.faction === 'radiant' ? '🛡️' : '⚔️'}</span>
                    <div>
                      <div className="font-bold text-xs text-red-300">{tileTower.name || `Башня ${tileTower.id}`}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{tileTower.faction.toUpperCase()} • T{tileTower.tier || 1} • РАЗМЕР 2x2</div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-[10px] font-mono text-slate-300 mb-1">
                      <span>Прочность:</span>
                      <span className="font-bold text-red-400">{tileTower.hp} / {tileTower.maxHp} HP</span>
                    </div>
                    <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-red-500" style={{ width: `${(tileTower.hp / tileTower.maxHp) * 100}%` }} />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-1 text-[10px] font-mono pt-1 border-t border-slate-800/80">
                    <div className="bg-slate-900 p-1 rounded text-center">
                      <span className="text-slate-400 block text-[8px]">УРОН</span>
                      <span className="text-amber-400 font-bold">{tileTower.damage}</span>
                    </div>
                    <div className="bg-slate-900 p-1 rounded text-center">
                      <span className="text-slate-400 block text-[8px]">БРОНЯ</span>
                      <span className="text-blue-400 font-bold">{tileTower.armor}</span>
                    </div>
                    <div className="bg-slate-900 p-1 rounded text-center">
                      <span className="text-slate-400 block text-[8px]">ДАЛЬНОСТЬ</span>
                      <span className="text-purple-400 font-bold">10 кл.</span>
                    </div>
                  </div>
                </div>
              )}

              <div className="mt-2.5 space-y-2 text-xs font-mono">
                <div className="flex justify-between items-center bg-slate-950/60 p-2 rounded border border-slate-800/80">
                  <span className="text-slate-400">Террейн:</span>
                  <span className="font-semibold text-slate-200">{selectedTile.terrain.replace('_', ' ')}</span>
                </div>

                <div className="flex justify-between items-center bg-slate-950/60 p-2 rounded border border-slate-800/80">
                  <span className="text-slate-400">Высота:</span>
                  <span
                    className={`font-semibold ${
                      selectedTile.elevation === 2
                        ? 'text-amber-400'
                        : selectedTile.elevation === 0
                        ? 'text-blue-400'
                        : 'text-slate-200'
                    }`}
                  >
                    {selectedTile.elevation === 2 ? 'High Ground (+15% Hit)' : selectedTile.elevation === 0 ? 'Низина (-30% Miss)' : 'Базовый'}
                  </span>
                </div>

                {selectedTile.object && (
                  <div className="p-2 rounded bg-amber-950/30 border border-amber-800/50 text-amber-200">
                    <div className="font-bold flex items-center gap-1.5">
                      <span>{selectedTile.object.symbol}</span>
                      <span>{selectedTile.object.name}</span>
                    </div>
                  </div>
                )}
              </div>
            </aside>
          );
        })()}
      </div>

      {/* 3. Bottom Deck — Unified Dota 2 Command Console & Skills Bar */}
      {activeHero && (
        <footer className="h-28 bg-[#080b11]/95 backdrop-blur-md border-t border-slate-800/80 px-2 flex items-center justify-center shrink-0 z-20 relative">
          <div className="flex items-center justify-center gap-2.5 max-w-7xl w-full">
            {/* 1. Left Panel: Dota-Style Active Hero Console */}
            <DotaHeroConsole
              hero={activeHero}
              onCenterCamera={() => setTargetPos({ x: activeHero.x, y: activeHero.y })}
              onToggleWeskerMode={
                activeHero.id === 'wesker' || activeHero.defId === 'wesker' ? toggleWeskerMode : null
              }
              getHeroPortrait={getHeroPortrait}
            />

            {/* 2. Center Panel: Abilities Console */}
            <div className="h-[98px] flex items-center gap-2 px-3 bg-[#0d121c]/90 border border-slate-800/80 rounded-2xl shadow-xl relative backdrop-blur-md shrink-0">
              {activeHero.skills.map((skill, sIdx) => {
                const hotkeys = ['Q', 'W', 'E', 'R', 'D', 'F'];
                const hotkey = hotkeys[sIdx] || `${sIdx + 1}`;
                const isPassive = skill.type === 'PASSIVE';
                const isUltimate = skill.type === 'ULTIMATE';
                const onCooldown = skill.currentCooldown > 0;
                const hasMana = activeHero.mana >= (skill.manaCost || 0);
                const hasTime = canPerformAction(gameState.remainingTurnTime, skill.timeCost || 0);
                const isTargetingThis = targetingSkill?.id === skill.id;

                return (
                  <div key={skill.id} className="relative group">
                    <button
                      disabled={isPassive || onCooldown || !hasMana || !hasTime}
                      onClick={() => handleSkillClick(skill)}
                      onMouseEnter={() => setHoveredSkillTooltip({ skill, hotkey })}
                      onMouseLeave={() => setHoveredSkillTooltip(null)}
                      className={`h-16 w-16 rounded-xl border flex flex-col items-center justify-between p-1 transition-all text-left relative overflow-hidden shrink-0 cursor-pointer ${
                        isTargetingThis
                          ? 'border-purple-300 shadow-xl shadow-purple-500/50 scale-105 ring-2 ring-purple-400'
                          : isUltimate
                          ? 'border-amber-400/90 shadow-lg shadow-amber-500/25 hover:border-amber-300 hover:scale-105 ring-1 ring-amber-400/50'
                          : isPassive
                          ? 'border-slate-800 opacity-80 cursor-default ring-1 ring-slate-700/50'
                          : onCooldown || !hasMana || !hasTime
                          ? 'border-slate-800 opacity-55 cursor-not-allowed'
                          : 'border-slate-700 hover:border-amber-400 hover:scale-105 shadow-md'
                      }`}
                    >
                      {/* Background SVG Skill Icon */}
                      <img
                        src={getSkillIcon(skill.id)}
                        alt={skill.name}
                        className="absolute inset-0 w-full h-full object-cover -z-0 opacity-85 group-hover:opacity-100 transition-opacity"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-black/60 -z-0" />

                      {/* Top row: Hotkey & Mana */}
                      <div className="w-full flex items-center justify-between z-10">
                        <span className="text-[10px] font-mono font-bold px-1 rounded bg-slate-950/90 text-amber-400 border border-slate-800 shadow-sm">
                          [{hotkey}]
                        </span>
                        {skill.manaCost > 0 && (
                          <span className="text-[9px] font-mono text-sky-300 font-bold bg-sky-950/90 px-1 rounded border border-sky-500/30 shadow-sm">
                            💧{skill.manaCost}
                          </span>
                        )}
                      </div>

                      {/* Skill Name */}
                      <span className="text-[9px] font-bold text-slate-100 truncate w-full text-center leading-tight z-10 px-0.5 drop-shadow">
                        {skill.name}
                      </span>

                      {/* Bottom: Time Cost / Passive Indicator */}
                      <div className="w-full text-center z-10">
                        {isPassive ? (
                          <span className="text-[8px] text-slate-300 uppercase font-mono font-bold bg-slate-900/90 px-1 py-0.2 rounded border border-slate-700/50">
                            Пассив
                          </span>
                        ) : (
                          <span className="text-[9px] font-mono font-bold text-amber-300 bg-amber-950/90 px-1 rounded border border-amber-500/30">
                            ⏳{skill.timeCost}с
                          </span>
                        )}
                      </div>

                      {/* Insufficient Mana Warning */}
                      {!isPassive && !onCooldown && !hasMana && (
                        <div className="absolute inset-0 bg-blue-950/85 backdrop-blur-[1px] flex flex-col items-center justify-center text-blue-200 font-mono font-bold text-[9px] z-20">
                          <span>💧 МАНА</span>
                        </div>
                      )}

                      {/* Insufficient Turn Time Warning */}
                      {!isPassive && !onCooldown && hasMana && !hasTime && (
                        <div className="absolute inset-0 bg-red-950/85 backdrop-blur-[1px] flex flex-col items-center justify-center text-red-200 font-mono font-bold text-[9px] z-20">
                          <span>⏳ ВРЕМЯ</span>
                        </div>
                      )}

                      {/* Cooldown Overlay */}
                      {onCooldown && (
                        <div className="absolute inset-0 bg-black/85 flex flex-col items-center justify-center text-amber-400 font-mono font-bold text-xs z-20">
                          <span className="text-[10px]">⏱️</span>
                          <span>{skill.currentCooldown.toFixed(0)}с</span>
                        </div>
                      )}
                    </button>
                  </div>
                );
              })}

              {/* Floating Dota 2 Skill Tooltip (Anchored above ability bar) */}
              {hoveredSkillTooltip && (
                <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-50 pointer-events-none">
                  <DotaSkillTooltip
                    skill={hoveredSkillTooltip.skill}
                    hero={activeHero}
                    skillIconUrl={getSkillIcon(hoveredSkillTooltip.skill.id)}
                    hotkey={hoveredSkillTooltip.hotkey}
                  />
                </div>
              )}
            </div>

            {/* 3. Right Panel: Actions, Turn Budget & End Turn */}
            <div className="h-[98px] flex items-center gap-3 bg-[#0d121c]/90 border border-slate-800/80 rounded-2xl px-3 py-2 shadow-xl backdrop-blur-md shrink-0">
              {/* Action buttons (Move & Attack) */}
              <div className="flex flex-col gap-1.5">
                <button
                  onClick={() => {
                    setActionMode(actionMode === 'move' ? null : 'move');
                    setTargetingSkill(null);
                  }}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold font-mono border transition-all ${
                    actionMode === 'move' && !targetingSkill
                      ? 'bg-blue-600 border-blue-400 text-white shadow-md'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  <Footprints size={13} />
                  <span>Ход [M]</span>
                </button>

                <button
                  onClick={() => {
                    setActionMode(actionMode === 'attack' ? null : 'attack');
                    setTargetingSkill(null);
                  }}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold font-mono border transition-all ${
                    actionMode === 'attack' && !targetingSkill
                      ? 'bg-red-600 border-red-400 text-white shadow-md'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  <Swords size={13} />
                  <span>Атака [A]</span>
                </button>
              </div>

              {/* Turn Time Display */}
              <div className="flex flex-col items-center justify-center gap-1.5 w-32">
                <div className="flex items-center justify-between w-full text-xs font-mono">
                  <span className="text-slate-400 flex items-center gap-1 text-[11px]">
                    <Clock size={12} className="text-amber-400" /> Ход:
                  </span>
                  <span className="font-bold text-amber-400 text-[11px]">
                    {gameState.remainingTurnTime.toFixed(1)} / 8.0s
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-950 rounded-full border border-slate-800 overflow-hidden shadow-inner">
                  <div
                    className="h-full bg-gradient-to-r from-amber-500 to-red-500 transition-all duration-200"
                    style={{ width: `${(gameState.remainingTurnTime / TURN_DURATION_SECONDS) * 100}%` }}
                  />
                </div>
              </div>

              {/* End Turn Golden Button */}
              <button
                onClick={handleEndTurn}
                className="h-16 px-4 rounded-xl font-bold text-xs uppercase tracking-wider bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-black shadow-lg shadow-amber-500/20 flex items-center gap-1.5 transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
              >
                <span>Конец хода</span>
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </footer>
      )}

      {/* Roster Modal (All 15 Heroes from Google Doc) */}
      {showRosterModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-5xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-600/30 border border-indigo-500/50 flex items-center justify-center text-indigo-400">
                  <Users size={20} />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">Ростер героев (15 персонажей)</h2>
                  <p className="text-xs text-slate-400">
                    Активный герой: <span className="text-amber-300 font-bold">{activeHero?.name}</span>. Выберите героя для просмотра или замены в бою.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowRosterModal(false)}
                className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body: Cards Grid */}
            <div className="p-6 overflow-y-auto custom-scrollbar grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {HEROES_ROSTER.map(hero => {
                const isInCombat = gameState.heroes.some(h => h.id === hero.id);
                const isRad = hero.faction === 'radiant';
                return (
                  <div
                    key={hero.id}
                    className={`p-4 rounded-xl border flex flex-col justify-between transition-all ${
                      isInCombat
                        ? 'bg-slate-950/90 border-slate-700'
                        : 'bg-slate-900/60 border-slate-800 hover:border-slate-600 hover:bg-slate-800/40'
                    }`}
                  >
                    <div>
                      <div className="flex items-start gap-3">
                        <div className={`relative w-14 h-14 rounded-xl overflow-hidden border-2 shrink-0 ${isRad ? 'border-emerald-500/60' : 'border-rose-500/60'}`}>
                          <img src={getHeroPortrait(hero.id)} alt={hero.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1">
                            <span className="font-bold text-sm text-white truncate">{hero.name}</span>
                            <span className={`text-[10px] uppercase font-mono px-1.5 py-0.5 rounded font-bold ${
                              hero.heroClass === 'STRENGTH' ? 'bg-red-950 text-red-300 border border-red-800/50' :
                              hero.heroClass === 'AGILITY' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800/50' :
                              'bg-sky-950 text-sky-300 border border-sky-800/50'
                            }`}>
                              {hero.heroClass === 'STRENGTH' ? 'Сила' : hero.heroClass === 'AGILITY' ? 'Ловкость' : 'Интеллект'}
                            </span>
                          </div>
                          <p className="text-xs text-slate-400 truncate mt-0.5">{hero.title}</p>
                          <div className="flex items-center gap-2 mt-2 text-[11px] font-mono text-slate-300">
                            <span>❤️ {hero.stats.hp}</span>
                            <span>💧 {hero.stats.mana}</span>
                            <span>⚔️ {hero.stats.damage || hero.stats.ranged?.damage || 40}</span>
                            <span>🚶 {hero.stats.speed}</span>
                          </div>
                        </div>
                      </div>

                      <div className="mt-3 pt-3 border-t border-slate-800/80">
                        <div className="text-[11px] font-semibold text-slate-400 mb-1.5">Способности:</div>
                        <div className="flex flex-wrap gap-1">
                          {hero.skills.map(s => (
                            <div key={s.id} className="relative group/rosterSkill">
                              <div className="flex items-center gap-1 text-[10px] font-mono bg-slate-950 px-2 py-0.5 rounded border border-slate-800 hover:border-amber-400 text-slate-300 cursor-help transition-all">
                                <img src={getSkillIcon(s.id)} alt={s.name} className="w-3.5 h-3.5 rounded-sm object-cover" />
                                <span>{s.name}</span>
                              </div>
                              <div className="hidden group-hover/rosterSkill:block absolute bottom-full mb-1 left-0 z-50 pointer-events-none">
                                <DotaSkillTooltip
                                  skill={s}
                                  hero={hero}
                                  skillIconUrl={getSkillIcon(s.id)}
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 pt-2">
                      {isInCombat ? (
                        <div className="w-full py-1.5 rounded-lg text-center text-xs font-mono font-bold bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                          ⚔️ В бою
                        </div>
                      ) : (
                        <button
                          onClick={() => {
                            if (activeHero) {
                              setGameState(prev => swapHeroInGameState(prev, activeHero.instanceId, hero.id));
                              addFloatingText(activeHero.x, activeHero.y, `⚡ ${hero.name} вступил в бой!`, '#38bdf8');
                              setShowRosterModal(false);
                            }
                          }}
                          className="w-full py-1.5 rounded-lg text-xs font-bold font-mono bg-indigo-600 hover:bg-indigo-500 text-white transition-all shadow-md cursor-pointer flex items-center justify-center gap-1.5"
                        >
                          <span>Выбрать вместо {activeHero?.name.split(' ')[0]}</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
