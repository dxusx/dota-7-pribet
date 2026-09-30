import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { generateDotaMap, MAP_SIZE, TERRAIN } from './map/dotaMapData';
import DotaMapCanvas from './components/DotaMapCanvas';
import { createInitialGameState, endTurn } from './game/gameState';
import {
  canPerformAction,
  deductActionTime,
  resolveAttack,
  TURN_DURATION_SECONDS,
} from './game/combatRules';
import { executeSkill } from './game/skillEngine';
import {
  Grid,
  Trees,
  Maximize2,
  X,
  Footprints,
  Swords,
  ChevronRight,
  Clock,
  Target,
  Sparkles,
  Info,
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

  // Active hero
  const activeHeroId = gameState.initiativeQueue[gameState.activeUnitIndex];
  const activeHero = gameState.heroes.find(h => h.instanceId === activeHeroId) || gameState.heroes[0];

  // Helper to add floating combat text
  const addFloatingText = useCallback((x, y, text, color = '#f59e0b') => {
    const id = `${Date.now()}_${Math.random()}`;
    setFloatingTexts(prev => [...prev.slice(-15), { id, x, y, text, color, createdAt: Date.now() }]);
  }, []);

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

        const result = executeSkill({
          skill: targetingSkill,
          caster: activeHero,
          targetTile: tile,
          targetHero,
          gameState,
          mapData,
        });

        if (!result.success) {
          addFloatingText(activeHero.x, activeHero.y, result.reason, '#ef4444');
          return;
        }

        setGameState(prev => ({
          ...prev,
          heroes: result.updatedHeroes,
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

          const targetHero = gameState.heroes.find(
            h => !h.isDead && h.faction !== activeHero.faction && h.x === tile.x && h.y === tile.y
          );

          if (targetHero) {
            const attackerElevation = mapData.tiles[activeHero.y * MAP_SIZE + activeHero.x].elevation;
            const targetElevation = tile.elevation;
            const isRanged = activeHero.range > 2;

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
    ]
  );

  // Skill click from bottom bar
  const handleSkillClick = skill => {
    if (!activeHero || activeHero.isDead) return;
    if (skill.type === 'PASSIVE') return;

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

    // If instant/self skill (timeCost 0 or self buff or weapon toggle)
    const isSelfCast =
      skill.id === 'stars-agent' ||
      skill.id === 'mastermind' ||
      skill.id === 'preparation' ||
      skill.id === 'divine-regen' ||
      skill.id === 'rot' ||
      skill.id === 'clutch-master';

    if (isSelfCast) {
      const res = executeSkill({
        skill,
        caster: activeHero,
        gameState,
        mapData,
      });

      if (res.success) {
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
                ⏱️ {gameState.gameTimeSeconds.toFixed(1)}с
              </span>
            </div>
            <div className="text-[10px] text-slate-400 font-mono">
              Крипы: {Math.max(0, Math.round(gameState.nextLaneWaveTime - gameState.gameTimeSeconds))}с
            </div>
          </div>
        </div>

        {/* Center: Initiative Timeline */}
        <div className="flex items-center gap-1.5 overflow-x-auto max-w-xl py-1 px-2 bg-slate-950/70 rounded-xl border border-slate-800">
          {gameState.initiativeQueue.map((heroId, idx) => {
            const hero = gameState.heroes.find(h => h.instanceId === heroId);
            if (!hero) return null;
            const isActive = idx === gameState.activeUnitIndex;
            const isRad = hero.faction === 'radiant';

            return (
              <button
                key={hero.instanceId}
                onClick={() => setTargetPos({ x: hero.x, y: hero.y })}
                title={`${hero.name} (Инициатива: ${hero.initiativeRoll})`}
                className={`relative px-2 py-1 rounded-lg flex items-center gap-1.5 transition-all shrink-0 ${
                  isActive
                    ? 'bg-amber-500/25 border-2 border-amber-400 shadow-md scale-105'
                    : hero.isDead
                    ? 'opacity-40 bg-slate-900 border border-slate-800'
                    : 'bg-slate-900/80 border border-slate-800 hover:border-slate-700'
                }`}
              >
                <span className="text-base">{hero.avatarSymbol}</span>
                <span className={`text-xs font-bold font-mono ${isActive ? 'text-amber-300' : 'text-slate-300'}`}>
                  {hero.name.split(' ')[0]}
                </span>
                <span className={`w-2 h-2 rounded-full ${isRad ? 'bg-emerald-400' : 'bg-red-400'}`} />
              </button>
            );
          })}
        </div>

        {/* Right: Map Toggles */}
        <div className="flex items-center gap-1.5">
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

      {/* Targeting Banner if targeting skill */}
      {targetingSkill && (
        <div className="bg-purple-900/90 border-b border-purple-500/50 py-1.5 px-4 text-center text-xs font-mono font-bold text-purple-200 flex items-center justify-center gap-3 z-20 animate-in fade-in duration-150">
          <Sparkles size={14} className="text-purple-300 animate-spin" />
          <span>🎯 Выберите цель для способности: {targetingSkill.name} (Дальность: {targetingSkill.range || 4})</span>
          <button
            onClick={() => {
              setTargetingSkill(null);
              setActionMode('move');
            }}
            className="px-2 py-0.5 rounded bg-purple-950 hover:bg-purple-800 text-[10px] uppercase border border-purple-400/50 text-white"
          >
            Отмена [Esc]
          </button>
        </div>
      )}

      {/* 2. Main Battlefield Viewport */}
      <div className="relative flex-1 w-full h-full overflow-hidden">
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
          onCellClick={handleCellClick}
          onHoverTile={setHoveredTile}
        />

        {/* Selected Tile Inspector */}
        {selectedTile && (
          <aside className="absolute top-4 right-4 w-72 bg-slate-900/95 backdrop-blur-md border border-slate-700 rounded-xl p-3.5 shadow-2xl z-10 animate-in fade-in slide-in-from-right duration-200">
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
        )}
      </div>

      {/* 3. Bottom Deck — Permanent Command Console & Skills Bar */}
      {activeHero && (
        <footer className="h-24 bg-slate-950/95 backdrop-blur-md border-t border-slate-800 px-4 flex items-center justify-between shrink-0 z-20 relative">
          {/* Left Column: Active Hero Profile */}
          <div className="flex items-center gap-3 w-64 shrink-0">
            <div className="w-12 h-12 rounded-xl bg-slate-900 border-2 border-amber-400/80 flex items-center justify-center text-2xl shadow-lg shrink-0">
              {activeHero.avatarSymbol}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-slate-100 truncate">{activeHero.name}</span>
                <span className="text-[10px] text-amber-400 font-mono">Ур. {activeHero.level}</span>
              </div>

              {/* HP Bar */}
              <div className="relative w-full h-2 bg-slate-800 rounded-full overflow-hidden mt-1">
                <div
                  className="h-full bg-emerald-500 transition-all duration-300 rounded-full"
                  style={{ width: `${Math.max(0, (activeHero.hp / activeHero.maxHp) * 100)}%` }}
                />
              </div>

              {/* Mana Bar */}
              <div className="relative w-full h-1.5 bg-slate-800 rounded-full overflow-hidden mt-0.5">
                <div
                  className="h-full bg-blue-500 transition-all duration-300 rounded-full"
                  style={{ width: `${Math.max(0, (activeHero.mana / activeHero.maxMana) * 100)}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 mt-1">
                <span className="text-emerald-400 font-bold">HP: {activeHero.hp}/{activeHero.maxHp}</span>
                <span className="text-blue-400 font-bold">MP: {activeHero.mana}/{activeHero.maxMana}</span>
                <span>🛡️ {activeHero.armor}</span>
                <span className="text-amber-300 font-bold bg-amber-500/10 px-1 rounded border border-amber-500/20" title="Скорость героя (клеток в ход) и доступно шагов">
                  🦶 {activeHero.speed} кл/ход ({maxSteps} ш.)
                </span>
              </div>
            </div>
          </div>

          {/* Center Column: Direct Skills Bar (Always visible!) */}
          <div className="flex items-center gap-2 overflow-x-auto px-2 py-1 max-w-2xl">
            {activeHero.skills.map((skill, sIdx) => {
              const hotkeys = ['Q', 'W', 'E', 'R', 'D'];
              const hotkey = hotkeys[sIdx] || `${sIdx + 1}`;
              const isPassive = skill.type === 'PASSIVE';
              const onCooldown = skill.currentCooldown > 0;
              const hasMana = activeHero.mana >= (skill.manaCost || 0);
              const hasTime = canPerformAction(gameState.remainingTurnTime, skill.timeCost || 0);
              const isTargetingThis = targetingSkill?.id === skill.id;

              return (
                <div key={skill.id} className="relative group">
                  <button
                    disabled={isPassive || onCooldown || !hasMana || !hasTime}
                    onClick={() => handleSkillClick(skill)}
                    onMouseEnter={() => setHoveredSkillTooltip(skill)}
                    onMouseLeave={() => setHoveredSkillTooltip(null)}
                    className={`h-16 w-20 rounded-xl border flex flex-col items-center justify-between p-1.5 transition-all text-left relative overflow-hidden ${
                      isTargetingThis
                        ? 'bg-purple-600 border-purple-300 shadow-lg shadow-purple-500/40 scale-105 ring-2 ring-purple-400'
                        : isPassive
                        ? 'bg-slate-900/60 border-slate-800 opacity-60 cursor-default'
                        : onCooldown || !hasMana || !hasTime
                        ? 'bg-slate-900/80 border-slate-800 opacity-50 cursor-not-allowed'
                        : 'bg-slate-900/90 border-slate-700 hover:border-amber-400 hover:bg-slate-800'
                    }`}
                  >
                    {/* Top row: Hotkey & Mana */}
                    <div className="w-full flex items-center justify-between">
                      <span className="text-[10px] font-mono font-bold px-1 rounded bg-slate-950 text-amber-400 border border-slate-800">
                        [{hotkey}]
                      </span>
                      {skill.manaCost > 0 && (
                        <span className="text-[9px] font-mono text-blue-400 font-bold">
                          💧{skill.manaCost}
                        </span>
                      )}
                    </div>

                    {/* Skill Name */}
                    <span className="text-[10px] font-bold text-slate-100 truncate w-full text-center leading-tight">
                      {skill.name.split(' ')[0]}
                    </span>

                    {/* Bottom: Time Cost */}
                    <div className="w-full text-center">
                      {isPassive ? (
                        <span className="text-[8px] text-slate-400 uppercase font-mono">Пассивно</span>
                      ) : (
                        <span className="text-[9px] font-mono text-amber-300">
                          ⏳{skill.timeCost}с
                        </span>
                      )}
                    </div>

                    {/* Cooldown Overlay */}
                    {onCooldown && (
                      <div className="absolute inset-0 bg-black/85 flex flex-col items-center justify-center text-amber-400 font-mono font-bold text-xs">
                        <span>⏱️</span>
                        <span>{skill.currentCooldown.toFixed(0)}с</span>
                      </div>
                    )}
                  </button>

                  {/* Tooltip on Hover */}
                  {hoveredSkillTooltip?.id === skill.id && (
                    <div className="absolute bottom-20 left-1/2 -translate-x-1/2 w-64 bg-slate-900/95 border border-slate-700 rounded-xl p-3 shadow-2xl text-xs font-mono pointer-events-none z-30 space-y-1.5">
                      <div className="flex items-center justify-between border-b border-slate-800 pb-1">
                        <span className="font-bold text-amber-300">{skill.name}</span>
                        <span className="text-[9px] uppercase px-1 rounded bg-slate-800 text-slate-300">
                          {skill.type}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-[10px] text-slate-400">
                        {skill.timeCost > 0 && <span className="text-amber-400">⏳ Время: {skill.timeCost}с</span>}
                        {skill.manaCost > 0 && <span className="text-blue-400">💧 Мана: {skill.manaCost}</span>}
                        {skill.cooldown > 0 && <span>⏱️ КД: {skill.cooldown}с</span>}
                      </div>
                      <p className="text-[11px] text-slate-300 font-sans leading-relaxed">{skill.desc}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Right Column: Time Budget, Actions & End Turn */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Action buttons (Move & Attack) */}
            <div className="flex flex-col gap-1">
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
            <div className="flex flex-col items-center gap-1 w-36">
              <div className="flex items-center justify-between w-full text-xs font-mono">
                <span className="text-slate-400 flex items-center gap-1">
                  <Clock size={12} className="text-amber-400" /> Ход:
                </span>
                <span className="font-bold text-amber-400">
                  {gameState.remainingTurnTime.toFixed(1)} / 8.0s
                </span>
              </div>
              <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-amber-500 to-red-500 transition-all duration-200"
                  style={{ width: `${(gameState.remainingTurnTime / TURN_DURATION_SECONDS) * 100}%` }}
                />
              </div>
            </div>

            {/* End Turn Golden Button */}
            <button
              onClick={handleEndTurn}
              className="h-14 px-4 rounded-xl font-bold text-xs uppercase tracking-wider bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-black shadow-lg shadow-amber-500/20 flex items-center gap-1.5 transition-all"
            >
              <span>Конец хода</span>
              <ChevronRight size={16} />
            </button>
          </div>
        </footer>
      )}
    </div>
  );
}
