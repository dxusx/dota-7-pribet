import React, { useState, useMemo, useCallback } from 'react';
import { generateDotaMap, MAP_SIZE, TERRAIN } from './map/dotaMapData';
import DotaMapCanvas from './components/DotaMapCanvas';
import { createInitialGameState, endTurn } from './game/gameState';
import {
  canPerformAction,
  deductActionTime,
  resolveAttack,
  TURN_DURATION_SECONDS,
} from './game/combatRules';
import {
  Compass,
  Grid,
  Trees,
  Layers,
  Maximize2,
  X,
  Target,
  Footprints,
  Swords,
  Sparkles,
  ChevronRight,
  Shield,
  Clock,
  Heart,
  Zap,
} from 'lucide-react';

export default function App() {
  const mapData = useMemo(() => generateDotaMap(), []);
  const [gameState, setGameState] = useState(() => createInitialGameState());

  const [selectedTile, setSelectedTile] = useState(null);
  const [showGrid, setShowGrid] = useState(true);
  const [showIcons, setShowIcons] = useState(true);
  const [showTrees, setShowTrees] = useState(true);
  const [targetPos, setTargetPos] = useState(null);

  // Tactical interaction mode: null | 'move' | 'attack' | 'skill'
  const [actionMode, setActionMode] = useState(null);
  const [selectedSkill, setSelectedSkill] = useState(null);
  const [showSkillsDrawer, setShowSkillsDrawer] = useState(false);
  const [floatingTexts, setFloatingTexts] = useState([]);

  // Active hero
  const activeHeroId = gameState.initiativeQueue[gameState.activeUnitIndex];
  const activeHero = gameState.heroes.find(h => h.instanceId === activeHeroId) || gameState.heroes[0];

  // Helper to add floating combat text
  const addFloatingText = useCallback((x, y, text, color = '#f59e0b') => {
    const id = `${Date.now()}_${Math.random()}`;
    setFloatingTexts(prev => [...prev.slice(-12), { id, x, y, text, color, createdAt: Date.now() }]);
  }, []);

  // Compute Reachable Movement Cells (BFS within speed range)
  const reachableMoveCells = useMemo(() => {
    if (actionMode !== 'move' || !activeHero || activeHero.isDead) return [];
    const maxSteps = activeHero.speed || 6;
    const cells = [];
    const { x: startX, y: startY } = activeHero;

    for (let dy = -maxSteps; dy <= maxSteps; dy++) {
      for (let dx = -maxSteps; dx <= maxSteps; dx++) {
        const dist = Math.abs(dx) + Math.abs(dy); // Manhattan distance
        if (dist > 0 && dist <= maxSteps) {
          const px = startX + dx;
          const py = startY + dy;
          if (px >= 0 && px < MAP_SIZE && py >= 0 && py < MAP_SIZE) {
            const tile = mapData.tiles[py * MAP_SIZE + px];
            if (!tile.hasTree && tile.terrain !== TERRAIN.CLIFF) {
              cells.push({ x: px, y: py });
            }
          }
        }
      }
    }
    return cells;
  }, [actionMode, activeHero, mapData]);

  // Compute Reachable Attack Cells
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

  // Handle cell clicks for tactical actions
  const handleCellClick = useCallback(
    tile => {
      if (!activeHero || activeHero.isDead) return;

      // 1. Move Action
      if (actionMode === 'move') {
        const isReachable = reachableMoveCells.some(c => c.x === tile.x && c.y === tile.y);
        if (isReachable) {
          const moveTimeCost = 1.0;
          if (!canPerformAction(gameState.remainingTurnTime, moveTimeCost)) {
            addFloatingText(activeHero.x, activeHero.y, 'Нет времени!', '#ef4444');
            return;
          }

          setGameState(prev => {
            const updatedHeroes = prev.heroes.map(h => {
              if (h.instanceId === activeHero.instanceId) {
                return { ...h, x: tile.x, y: tile.y };
              }
              return h;
            });
            const newTime = deductActionTime(prev.remainingTurnTime, moveTimeCost);
            return {
              ...prev,
              heroes: updatedHeroes,
              remainingTurnTime: newTime,
              combatLogs: [
                {
                  text: `${activeHero.name} переместился в [${tile.x}, ${tile.y}] (-${moveTimeCost}с)`,
                  time: prev.gameTimeSeconds,
                },
                ...prev.combatLogs.slice(0, 15),
              ],
            };
          });

          addFloatingText(tile.x, tile.y, 'Шаг (-1с)', '#60a5fa');
          setActionMode(null);
          return;
        }
      }

      // 2. Attack Action
      if (actionMode === 'attack') {
        const isWithinRange = reachableAttackCells.some(c => c.x === tile.x && c.y === tile.y);
        if (isWithinRange) {
          const attackTimeCost = activeHero.period || 4.0;
          if (!canPerformAction(gameState.remainingTurnTime, attackTimeCost)) {
            addFloatingText(activeHero.x, activeHero.y, 'Нет времени!', '#ef4444');
            return;
          }

          // Find target enemy hero or tower or creep at this tile
          const targetHero = gameState.heroes.find(
            h => !h.isDead && h.faction !== activeHero.faction && h.x === tile.x && h.y === tile.y
          );

          if (targetHero) {
            const attackerElevation = mapData.tiles[activeHero.y * MAP_SIZE + activeHero.x].elevation;
            const targetElevation = tile.elevation;
            const isRanged = activeHero.range > 2;

            const result = resolveAttack({
              averageDamage: activeHero.damage,
              penetration: activeHero.penetration,
              hit: activeHero.hit,
              targetArmor: targetHero.armor,
              targetAgility: targetHero.agility,
              attackerElevation,
              targetElevation,
              isRanged,
            });

            if (!result.isHit) {
              addFloatingText(targetHero.x, targetHero.y, 'ПРОМАХ!', '#94a3b8');
            } else {
              const text = result.isCrit ? `КРИТ! -${result.damage}` : `-${result.damage}`;
              const color = result.isCrit ? '#f59e0b' : '#ef4444';
              addFloatingText(targetHero.x, targetHero.y, text, color);

              // Apply damage
              setGameState(prev => {
                const updatedHeroes = prev.heroes.map(h => {
                  if (h.instanceId === targetHero.instanceId) {
                    const newHp = Math.max(0, h.hp - result.damage);
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
                      text: `${activeHero.name} атаковал ${targetHero.name}: ${result.damage} урона (${result.reason})`,
                      time: prev.gameTimeSeconds,
                    },
                    ...prev.combatLogs.slice(0, 15),
                  ],
                };
              });
            }

            setActionMode(null);
            return;
          }
        }
      }
    },
    [
      activeHero,
      actionMode,
      reachableMoveCells,
      reachableAttackCells,
      gameState.remainingTurnTime,
      gameState.heroes,
      mapData,
      addFloatingText,
    ]
  );

  // Cast Skill
  const handleCastSkill = skill => {
    if (!activeHero || activeHero.isDead) return;
    if (activeHero.mana < skill.manaCost) {
      addFloatingText(activeHero.x, activeHero.y, 'Мало маны!', '#38bdf8');
      return;
    }
    if (skill.currentCooldown > 0) {
      addFloatingText(activeHero.x, activeHero.y, 'Перезарядка!', '#94a3b8');
      return;
    }
    if (!canPerformAction(gameState.remainingTurnTime, skill.timeCost)) {
      addFloatingText(activeHero.x, activeHero.y, 'Нет времени!', '#ef4444');
      return;
    }

    // Apply skill
    setGameState(prev => {
      const updatedHeroes = prev.heroes.map(h => {
        if (h.instanceId === activeHero.instanceId) {
          const newSkills = h.skills.map(s => {
            if (s.id === skill.id) {
              return { ...s, currentCooldown: s.cooldown || 16.0 };
            }
            return s;
          });
          return {
            ...h,
            mana: h.mana - skill.manaCost,
            skills: newSkills,
          };
        }
        return h;
      });

      const newTime = deductActionTime(prev.remainingTurnTime, skill.timeCost);
      return {
        ...prev,
        heroes: updatedHeroes,
        remainingTurnTime: newTime,
        combatLogs: [
          {
            text: `${activeHero.name} применил [${skill.name}] (-${skill.timeCost}с)`,
            time: prev.gameTimeSeconds,
          },
          ...prev.combatLogs.slice(0, 15),
        ],
      };
    });

    addFloatingText(activeHero.x, activeHero.y, `✨ ${skill.name}`, '#a855f7');
    setShowSkillsDrawer(false);
  };

  // Jump camera
  const handleJumpTo = landmark => {
    setTargetPos({ x: landmark.x, y: landmark.y });
    const idx = landmark.y * mapData.size + landmark.x;
    setSelectedTile(mapData.tiles[idx]);
  };

  // End turn
  const handleEndTurn = () => {
    setGameState(prev => endTurn(prev));
    setActionMode(null);
    setShowSkillsDrawer(false);
  };

  return (
    <div className="flex flex-col w-screen h-screen bg-[#07090e] text-slate-100 overflow-hidden font-sans select-none">
      {/* 1. Header Toolbar & Timeline */}
      <header className="h-16 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 px-4 flex items-center justify-between shrink-0 z-20">
        {/* Left: Round & Turn Info */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-600 to-red-600 flex flex-col items-center justify-center font-bold shadow-lg border border-amber-400/40">
            <span className="text-[9px] uppercase tracking-tighter text-amber-200">Раунд</span>
            <span className="text-sm leading-tight text-white">{gameState.roundNumber}</span>
          </div>

          <div className="hidden sm:block">
            <div className="text-xs font-bold text-slate-200 flex items-center gap-2">
              <span>ХОД {gameState.turnNumber}</span>
              <span className="text-[10px] text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/30 font-mono">
                ⏱️ {gameState.gameTimeSeconds.toFixed(1)}с
              </span>
            </div>
            <div className="text-[10px] text-slate-400 font-mono">
              Волна крипов через: {Math.max(0, Math.round(gameState.nextLaneWaveTime - gameState.gameTimeSeconds))}с
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
                <span
                  className={`w-2 h-2 rounded-full ${
                    isRad ? 'bg-emerald-400' : 'bg-red-400'
                  }`}
                />
              </button>
            );
          })}
        </div>

        {/* Right: Map Toggles */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setShowGrid(!showGrid)}
            title="Сетка 100x100"
            className={`p-2 rounded text-xs border font-mono transition-colors ${
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
            className={`p-2 rounded text-xs border font-mono transition-colors ${
              showTrees
                ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300'
                : 'bg-slate-800/60 border-slate-700 text-slate-400'
            }`}
          >
            <Trees size={14} />
          </button>

          <button
            onClick={() => handleJumpTo({ x: 50, y: 50 })}
            title="Центр карты"
            className="p-2 rounded text-xs border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-200"
          >
            <Maximize2 size={14} />
          </button>
        </div>
      </header>

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
          activeHeroId={activeHero?.instanceId}
          reachableMoveCells={reachableMoveCells}
          reachableAttackCells={reachableAttackCells}
          floatingTexts={floatingTexts}
          onCellClick={handleCellClick}
        />

        {/* Selected Tile Inspector */}
        {selectedTile && (
          <aside className="absolute top-4 right-4 w-72 bg-slate-900/95 backdrop-blur-md border border-slate-700 rounded-xl p-4 shadow-2xl z-10 animate-in fade-in slide-in-from-right duration-200">
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

            <div className="mt-3 space-y-2 text-xs font-mono">
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

        {/* Skills Drawer Modal */}
        {showSkillsDrawer && activeHero && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-30 flex items-end justify-center p-4 animate-in fade-in duration-150">
            <div className="w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-2xl p-5 shadow-2xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{activeHero.avatarSymbol}</span>
                  <div>
                    <h3 className="font-bold text-base text-slate-100">{activeHero.name} — Способности</h3>
                    <p className="text-xs text-slate-400 font-mono">Доступное время: {gameState.remainingTurnTime.toFixed(1)}с</p>
                  </div>
                </div>
                <button onClick={() => setShowSkillsDrawer(false)} className="text-slate-400 hover:text-white p-1 rounded-lg">
                  <X size={18} />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-96 overflow-y-auto pr-1">
                {activeHero.skills.map(skill => {
                  const isPassive = skill.type === 'PASSIVE';
                  const canCast =
                    !isPassive &&
                    skill.currentCooldown === 0 &&
                    activeHero.mana >= skill.manaCost &&
                    gameState.remainingTurnTime >= skill.timeCost;

                  return (
                    <div
                      key={skill.id}
                      className={`p-3 rounded-xl border flex flex-col justify-between transition-colors ${
                        isPassive
                          ? 'bg-slate-950/60 border-slate-800/80 opacity-80'
                          : canCast
                          ? 'bg-slate-800/80 border-slate-700 hover:border-amber-500/50'
                          : 'bg-slate-950/60 border-slate-800/80 opacity-60'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-sm text-slate-200">{skill.name}</span>
                          <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800">
                            {skill.type}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-xs font-mono text-slate-400 mt-1">
                          {skill.manaCost > 0 && <span className="text-blue-400">💧 {skill.manaCost} MP</span>}
                          {skill.timeCost > 0 && <span className="text-amber-400">⏳ {skill.timeCost}с</span>}
                          {skill.cooldown > 0 && <span className="text-slate-400">⏱️ {skill.cooldown}с КД</span>}
                        </div>
                        <p className="text-xs text-slate-300 mt-2 leading-relaxed">{skill.desc}</p>
                      </div>

                      {!isPassive && (
                        <button
                          disabled={!canCast}
                          onClick={() => handleCastSkill(skill)}
                          className={`mt-3 w-full py-2 rounded-lg font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors ${
                            canCast
                              ? 'bg-amber-500 hover:bg-amber-400 text-black shadow-md'
                              : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                          }`}
                        >
                          <Sparkles size={13} /> Применить
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 3. Bottom Deck — Command HUD */}
      {activeHero && (
        <footer className="h-20 bg-slate-950/95 backdrop-blur-md border-t border-slate-800 px-4 flex items-center justify-between shrink-0 z-20">
          {/* Active Hero Status Card */}
          <div className="flex items-center gap-3 w-72">
            <div className="w-12 h-12 rounded-xl bg-slate-900 border-2 border-amber-400/80 flex items-center justify-center text-2xl shadow-lg shrink-0">
              {activeHero.avatarSymbol}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-slate-100 truncate">{activeHero.name}</span>
                <span className="text-[10px] text-amber-400 font-mono">Ур. {activeHero.level}</span>
              </div>

              {/* HP Bar */}
              <div className="relative w-full h-2.5 bg-slate-800 rounded-full overflow-hidden mt-1">
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
                <span>HP: {activeHero.hp}/{activeHero.maxHp}</span>
                <span>MP: {activeHero.mana}/{activeHero.maxMana}</span>
                <span>🛡️ {activeHero.armor}</span>
              </div>
            </div>
          </div>

          {/* Turn Time Budget Progress */}
          <div className="hidden md:flex flex-col items-center gap-1 w-64">
            <div className="flex items-center justify-between w-full text-xs font-mono">
              <span className="text-slate-400 flex items-center gap-1">
                <Clock size={13} className="text-amber-400" /> Время хода:
              </span>
              <span className="font-bold text-amber-400 text-sm">
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

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActionMode(actionMode === 'move' ? null : 'move')}
              className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider border transition-all ${
                actionMode === 'move'
                  ? 'bg-blue-600 border-blue-400 text-white shadow-lg shadow-blue-600/30'
                  : 'bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-800'
              }`}
            >
              <Footprints size={15} />
              <span>Ход</span>
              <span className="text-[10px] opacity-70 font-mono">(-1с)</span>
            </button>

            <button
              onClick={() => setActionMode(actionMode === 'attack' ? null : 'attack')}
              className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider border transition-all ${
                actionMode === 'attack'
                  ? 'bg-red-600 border-red-400 text-white shadow-lg shadow-red-600/30'
                  : 'bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-800'
              }`}
            >
              <Swords size={15} />
              <span>Атака</span>
              <span className="text-[10px] opacity-70 font-mono">(-4с)</span>
            </button>

            <button
              onClick={() => setShowSkillsDrawer(true)}
              className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider border bg-purple-950/60 border-purple-700/80 text-purple-200 hover:bg-purple-900/60 transition-all"
            >
              <Sparkles size={15} />
              <span>Скиллы</span>
            </button>

            <button
              onClick={handleEndTurn}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-black shadow-lg shadow-amber-500/20 transition-all"
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
