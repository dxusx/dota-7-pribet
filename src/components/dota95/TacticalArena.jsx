import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { TILE_TYPES } from '../../data/dotaPixelGrid';
import { getDistance } from '../../game/pathfinding';
import { getAssetUrl } from '../../utils/assetUrl';
import { playClickSound, playAttackSound, playSpellSound, playCritSound } from '../../utils/sound';
import { Crosshair, Compass, Shield, Zap, ChevronUp, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';

export default function TacticalArena({
  gameState,
  dispatch,
  actionMode,
  setActionMode,
  reachableCells,
  onNotify,
  focusTarget
}) {
  const {
    heroes,
    activeHeroId,
    selectedHeroId,
    towers,
    creeps,
    roshan,
    mapGrid,
    turnActions,
    targetingMode
  } = gameState;

  const activeHero = heroes.find(h => h.id === activeHeroId) || heroes[0];

  // Viewport Center in world grid coordinates (r, c)
  const [viewCenter, setViewCenter] = useState({ r: 49, c: 46 });

  // Floating Damage Indicators on Arena
  const [floatingDamage, setFloatingDamage] = useState([]);

  // Auto-follow active hero when turn changes or hero moves
  useEffect(() => {
    if (activeHero) {
      setViewCenter({ r: activeHero.r, c: activeHero.c });
    }
  }, [activeHeroId, activeHero?.r, activeHero?.c]);

  // Center on cell when timeline hero is clicked
  useEffect(() => {
    if (focusTarget && typeof focusTarget.r === 'number' && typeof focusTarget.c === 'number') {
      setViewCenter({ r: focusTarget.r, c: focusTarget.c });
    }
  }, [focusTarget]);

  // Compute 11x11 clamped window [startR .. startR + 10, startC .. startC + 10]
  const GRID_SPAN = 11;
  const HALF_SPAN = Math.floor(GRID_SPAN / 2); // 5

  const startR = Math.max(0, Math.min(95 - GRID_SPAN, viewCenter.r - HALF_SPAN));
  const startC = Math.max(0, Math.min(95 - GRID_SPAN, viewCenter.c - HALF_SPAN));

  const rows = useMemo(() => Array.from({ length: GRID_SPAN }, (_, i) => startR + i), [startR]);
  const cols = useMemo(() => Array.from({ length: GRID_SPAN }, (_, i) => startC + i), [startC]);

  // Lookups for quick entity retrieval in the 11x11 window
  const heroMap = useMemo(() => {
    const map = new Map();
    heroes.forEach(h => {
      map.set(`${h.r},${h.c}`, h);
    });
    return map;
  }, [heroes]);

  const towerMap = useMemo(() => {
    const map = new Map();
    towers.forEach(t => {
      if (!t.isDead) map.set(`${t.r},${t.c}`, t);
    });
    return map;
  }, [towers]);

  const creepMap = useMemo(() => {
    const map = new Map();
    creeps.forEach(c => {
      if (!c.isDead) map.set(`${c.r},${c.c}`, c);
    });
    return map;
  }, [creeps]);

  // Attack range calculation
  const attackRange = activeHero?.range || 2;

  // Add floating damage popup
  const addFloatingNumber = useCallback((r, c, text, isCrit = false) => {
    const id = `${Date.now()}_${Math.random()}`;
    setFloatingDamage(prev => [...prev, { id, r, c, text, isCrit }]);
    setTimeout(() => {
      setFloatingDamage(prev => prev.filter(f => f.id !== id));
    }, 1300);
  }, []);

  // Handle click on arena cell (r, c)
  const handleCellClick = (r, c) => {
    const coordKey = `${r},${c}`;
    const heroAtCell = heroMap.get(coordKey);
    const towerAtCell = towerMap.get(coordKey);
    const creepAtCell = creepMap.get(coordKey);
    const isRoshanCell = roshan && !roshan.isDead && roshan.r === r && roshan.c === c;

    // -------------------------------------------------------------
    // 1. MOVE MODE
    // -------------------------------------------------------------
    if (actionMode === 'MOVE') {
      if (reachableCells.has(coordKey)) {
        playClickSound();
        dispatch({ type: 'MOVE_HERO', targetR: r, targetC: c });
        setActionMode('NONE');
        addFloatingNumber(r, c, '💨 Шаг', false);
        onNotify(`🏃 ${activeHero.name} сделал шаг на [${r}, ${c}]`);
      } else {
        onNotify('⛔ Эта клетка вне зоны досягаемости хода!');
      }
      return;
    }

    // -------------------------------------------------------------
    // 2. ATTACK MODE
    // -------------------------------------------------------------
    if (actionMode === 'ATTACK' || targetingMode?.mode === 'ATTACK') {
      const dist = getDistance(activeHero.r, activeHero.c, r, c);
      if (dist > attackRange) {
        onNotify(`⛔ Цель слишком далеко! Дальность атаки: ${attackRange} кл.`);
        return;
      }

      // Check for valid enemy target
      let targetEntity = null;
      if (heroAtCell && !heroAtCell.isDead && heroAtCell.team !== activeHero.team) {
        targetEntity = { id: heroAtCell.id, name: heroAtCell.name, type: 'hero' };
      } else if (towerAtCell && towerAtCell.team !== activeHero.team) {
        targetEntity = { id: towerAtCell.id, name: towerAtCell.name, type: 'tower' };
      } else if (creepAtCell && creepAtCell.team !== activeHero.team) {
        targetEntity = { id: creepAtCell.id, name: creepAtCell.name, type: 'creep' };
      } else if (isRoshanCell) {
        targetEntity = { id: 'roshan', name: 'Рошан', type: 'roshan' };
      }

      if (targetEntity) {
        playAttackSound();
        dispatch({ type: 'PERFORM_ATTACK', targetId: targetEntity.id });
        setActionMode('NONE');
        if (targetingMode) dispatch({ type: 'CANCEL_TARGETING' });

        const isCrit = Math.random() < 0.2;
        if (isCrit) playCritSound();
        const estDmg = Math.round((activeHero.averageDamage || 50) * (isCrit ? 2 : 1));
        addFloatingNumber(r, c, isCrit ? `🔥 КРИТ -${estDmg}!` : `⚔️ -${estDmg}`, isCrit);
        onNotify(`⚔️ ${activeHero.name} нанёс ${estDmg} урона по ${targetEntity.name}!`);
      } else {
        onNotify('⛔ Выберите врага в зоне атаки для удара!');
      }
      return;
    }

    // -------------------------------------------------------------
    // 3. ABILITY TARGETING MODE
    // -------------------------------------------------------------
    if (actionMode === 'ABILITY' || targetingMode?.mode === 'ABILITY') {
      playSpellSound();
      dispatch({
        type: 'EXECUTE_ABILITY',
        abilityId: targetingMode?.abilityId || targetingMode?.ability?.id,
        targetPos: { r, c }
      });
      setActionMode('NONE');
      if (targetingMode) dispatch({ type: 'CANCEL_TARGETING' });
      addFloatingNumber(r, c, '🔮 Скилл', false);
      onNotify(`🔮 ${activeHero.name} применил «${targetingMode?.ability?.name || 'способность'}» на [${r}, ${c}]!`);
      return;
    }

    // -------------------------------------------------------------
    // 4. ITEM TARGETING MODE (e.g. Blink Dagger)
    // -------------------------------------------------------------
    if (actionMode === 'ITEM' || targetingMode?.mode === 'ITEM') {
      playSpellSound();
      dispatch({
        type: 'USE_ITEM',
        itemId: targetingMode?.itemId || 'blink',
        targetPos: { r, c }
      });
      setActionMode('NONE');
      if (targetingMode) dispatch({ type: 'CANCEL_TARGETING' });
      addFloatingNumber(r, c, '🗡️ Блинк', false);
      onNotify(`🗡️ ${activeHero.name} совершил прыжок на [${r}, ${c}]!`);
      return;
    }

    // -------------------------------------------------------------
    // 5. DEFAULT MODE: INSPECT / SELECT HERO
    // -------------------------------------------------------------
    if (heroAtCell) {
      playClickSound();
      dispatch({ type: 'SELECT_HERO', heroId: heroAtCell.id });
      onNotify(`Выбран: ${heroAtCell.name} (HP: ${heroAtCell.hp}/${heroAtCell.maxHp})`);
    }
  };

  // Nudge Viewport Directions
  const nudge = (dr, dc) => {
    setViewCenter(prev => ({
      r: Math.max(5, Math.min(89, prev.r + dr)),
      c: Math.max(5, Math.min(89, prev.c + dc))
    }));
  };

  const isCenteredOnActive = viewCenter.r === activeHero?.r && viewCenter.c === activeHero?.c;

  return (
    <div className="relative w-full max-w-[560px] mx-auto flex flex-col items-center justify-center select-none px-2 sm:px-0">
      
      {/* ARENA CONTAINER */}
      <div className="relative w-full aspect-square bg-[#0b0f17]/95 rounded-2xl sm:rounded-3xl border border-slate-800/90 shadow-[0_12px_45px_rgba(0,0,0,0.85)] backdrop-blur-xl p-1.5 sm:p-2.5 flex items-center justify-center">
        
        {/* 11x11 TACTICAL GRID */}
        <div className="grid grid-cols-11 gap-0.5 sm:gap-1 w-full h-full">
          {rows.map(r => 
            cols.map(c => {
              const coordKey = `${r},${c}`;
              const tileType = mapGrid[r * 95 + c] ?? TILE_TYPES.GROUND;
              const isReachableMove = actionMode === 'MOVE' && reachableCells.has(coordKey);
              const distFromActive = getDistance(activeHero.r, activeHero.c, r, c);
              const isReachableAttack = (actionMode === 'ATTACK' || targetingMode?.mode === 'ATTACK') && distFromActive <= attackRange;
              const isReachableSpell = (actionMode === 'ABILITY' || targetingMode?.mode === 'ABILITY') && distFromActive <= (targetingMode?.range || 6);

              // Entities in this cell
              const hero = heroMap.get(coordKey);
              const tower = towerMap.get(coordKey);
              const creep = creepMap.get(coordKey);
              const isRoshan = roshan && !roshan.isDead && roshan.r === r && roshan.c === c;

              // Terrain visual stylings
              let terrainBg = 'bg-[#151b24] border-slate-800/60';
              let terrainIcon = null;

              if (tileType === TILE_TYPES.WATER || tileType === 4) {
                terrainBg = 'bg-[#0c2842] border-sky-900/60 text-sky-400/60';
                terrainIcon = <span className="text-[8px] opacity-50">💧</span>;
              } else if (tileType === TILE_TYPES.UNPASSABLE || tileType === 0) {
                terrainBg = 'bg-[#1e2530] border-slate-700/60 text-slate-500/60';
                terrainIcon = <span className="text-[8px] opacity-35">🪨</span>;
              } else if (tileType === TILE_TYPES.HIGHGROUND) {
                terrainBg = 'bg-[#1e3024] border-emerald-900/60';
                terrainIcon = <span className="text-[7px] text-emerald-500/30">▲</span>;
              } else if (tileType === TILE_TYPES.FOREST) {
                terrainBg = 'bg-[#122316] border-emerald-950/60';
                terrainIcon = <span className="text-[8px] opacity-30">🌲</span>;
              } else if (tileType === TILE_TYPES.FOUNTAIN) {
                terrainBg = r > 50 ? 'bg-[#094132] border-emerald-600/50' : 'bg-[#420d1c] border-rose-600/50';
                terrainIcon = <span className="text-[8px]">⛲</span>;
              }

              return (
                <div
                  key={coordKey}
                  onClick={() => handleCellClick(r, c)}
                  className={`tile relative aspect-square rounded-[4px] sm:rounded-[6px] border flex items-center justify-center overflow-hidden transition-all duration-150 cursor-pointer ${terrainBg} ${
                    isReachableMove 
                      ? 'reachable-move z-20 hover:scale-105' 
                      : isReachableAttack 
                      ? 'reachable-attack z-20 hover:scale-105' 
                      : isReachableSpell
                      ? 'bg-purple-950/70 border-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.4)] z-20 hover:scale-105'
                      : 'hover:border-slate-600/80 hover:bg-slate-800/40'
                  }`}
                  title={`[${r}, ${c}]`}
                >
                  {/* Subtle Background Terrain Marker */}
                  {!hero && !tower && !creep && !isRoshan && terrainIcon}

                  {/* 1. HERO TOKEN */}
                  {hero && (
                    <div className="relative flex flex-col items-center justify-center w-full h-full p-0.5 z-30">
                      {/* Active Indicator Arrow */}
                      {hero.id === activeHeroId && !hero.isDead && (
                        <div className="absolute -top-1 sm:-top-1.5 w-1.5 h-1.5 sm:w-2 sm:h-2 bg-amber-400 rotate-45 animate-pulse z-40" />
                      )}

                      {/* Circular Avatar Token */}
                      <div className={`relative w-[85%] h-[85%] rounded-full overflow-hidden flex items-center justify-center transition-all ${
                        hero.id === activeHeroId && !hero.isDead
                          ? 'border-2 border-amber-400 ring-2 ring-amber-400/60 shadow-[0_0_12px_#f59e0b] scale-105'
                          : hero.isDead
                          ? 'border border-zinc-700 grayscale opacity-40 bg-zinc-900'
                          : hero.team === 'radiant'
                          ? 'border-2 border-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.5)]'
                          : 'border-2 border-rose-500 shadow-[0_0_6px_rgba(244,63,94,0.5)]'
                      }`}>
                        {hero.avatar ? (
                          <img
                            src={getAssetUrl(hero.avatar)}
                            alt={hero.name}
                            className="w-full h-full object-cover pointer-events-none"
                            onError={(e) => { e.target.style.display = 'none'; }}
                          />
                        ) : (
                          <span className="text-[9px] sm:text-xs font-bold text-white uppercase">
                            {hero.name.slice(0, 2)}
                          </span>
                        )}

                        {hero.isDead && (
                          <span className="absolute inset-0 bg-black/60 flex items-center justify-center text-[10px]">
                            💀
                          </span>
                        )}
                      </div>

                      {/* Mini HP Bar directly below token */}
                      {!hero.isDead && (
                        <div className="w-[85%] h-1 sm:h-1.5 bg-black/80 rounded-full border border-black/60 overflow-hidden mt-0.5 shadow-sm">
                          <div
                            className={`h-full rounded-full transition-all duration-300 ${
                              hero.team === 'radiant' ? 'bg-emerald-400' : 'bg-rose-500'
                            }`}
                            style={{ width: `${Math.max(0, Math.min(100, Math.round((hero.hp / hero.maxHp) * 100)))}%` }}
                          />
                        </div>
                      )}
                    </div>
                  )}

                  {/* 2. TOWER TOKEN */}
                  {tower && !hero && (
                    <div className="relative flex flex-col items-center justify-center w-full h-full p-0.5 z-20">
                      <div className={`w-[80%] h-[80%] rounded-lg flex items-center justify-center text-xs border ${
                        tower.team === 'radiant' ? 'border-emerald-500 bg-emerald-950/70' : 'border-rose-500 bg-rose-950/70'
                      }`}>
                        🏰
                      </div>
                      <div className="w-[80%] h-1 bg-black/80 rounded-full overflow-hidden mt-0.5">
                        <div
                          className="h-full bg-amber-400"
                          style={{ width: `${Math.max(0, Math.min(100, Math.round(((tower.currentHp ?? tower.hp) / tower.maxHp) * 100)))}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* 3. CREEP TOKEN */}
                  {creep && !hero && !tower && (
                    <div className="relative flex flex-col items-center justify-center w-full h-full p-0.5 z-20">
                      <div className={`w-[75%] h-[75%] rounded-full flex items-center justify-center text-[10px] border ${
                        creep.team === 'radiant' ? 'border-emerald-400 bg-emerald-950/60' : 'border-rose-500 bg-rose-950/60'
                      }`}>
                        {creep.type === 'ranged' ? '🏹' : '⚔️'}
                      </div>
                      <div className="w-[75%] h-1 bg-black/80 rounded-full overflow-hidden mt-0.5">
                        <div
                          className="h-full bg-emerald-400"
                          style={{ width: `${Math.max(0, Math.min(100, Math.round((creep.hp / creep.maxHp) * 100)))}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* 4. ROSHAN TOKEN */}
                  {isRoshan && !hero && !tower && !creep && (
                    <div className="relative flex flex-col items-center justify-center w-full h-full p-0.5 z-20">
                      <div className="w-[85%] h-[85%] rounded-full flex items-center justify-center text-xs border-2 border-orange-500 bg-orange-950/80 shadow-[0_0_8px_#ea580c]">
                        🐲
                      </div>
                      <div className="w-[85%] h-1 bg-black/80 rounded-full overflow-hidden mt-0.5">
                        <div
                          className="h-full bg-orange-500"
                          style={{ width: `${Math.max(0, Math.min(100, Math.round((roshan.hp / roshan.maxHp) * 100)))}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* FLOATING COMBAT DAMAGE NUMBERS */}
        {floatingDamage.map(item => {
          // If damage position is inside the current 11x11 window, calculate percentage offset
          const rowIdx = item.r - startR;
          const colIdx = item.c - startC;
          if (rowIdx < 0 || rowIdx >= 11 || colIdx < 0 || colIdx >= 11) return null;

          const topPercent = (rowIdx + 0.3) * (100 / 11);
          const leftPercent = (colIdx + 0.5) * (100 / 11);

          return (
            <div
              key={item.id}
              className={`absolute pointer-events-none font-mono font-black text-xs sm:text-sm animate-bounce z-50 transition-all ${
                item.isCrit ? 'text-amber-400 scale-125 drop-shadow-[0_0_8px_#f59e0b]' : 'text-rose-400 drop-shadow-[0_0_6px_#ef4444]'
              }`}
              style={{
                top: `${topPercent}%`,
                left: `${leftPercent}%`,
                transform: 'translate(-50%, -50%)'
              }}
            >
              {item.text}
            </div>
          );
        })}
      </div>

      {/* DISCREET ARENA CONTROLS & COORDINATE BADGE */}
      <div className="w-full flex items-center justify-between px-2 pt-1.5 text-[10px] sm:text-xs font-mono text-slate-400">
        <div className="flex items-center gap-1">
          <Compass className="w-3.5 h-3.5 text-slate-500" />
          <span>Сектор: [{startR}..{startR + 10}, {startC}..{startC + 10}]</span>
        </div>

        {/* Nudge / Recenter Controls */}
        <div className="flex items-center gap-1.5">
          {!isCenteredOnActive && (
            <button
              onClick={() => setViewCenter({ r: activeHero.r, c: activeHero.c })}
              className="px-2 py-0.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded text-[10px] font-bold cursor-pointer transition flex items-center gap-1"
              title="Сфокусировать на текущем герое"
            >
              <Crosshair className="w-3 h-3 text-amber-400" />
              <span>Фокус</span>
            </button>
          )}

          <div className="flex items-center bg-slate-900/80 border border-slate-800 rounded-lg p-0.5">
            <button
              onClick={() => nudge(0, -3)}
              className="px-1.5 py-0.5 hover:bg-slate-800 rounded text-slate-300 hover:text-white cursor-pointer"
              title="Сдвинуть влево"
            >
              ◄
            </button>
            <button
              onClick={() => nudge(-3, 0)}
              className="px-1.5 py-0.5 hover:bg-slate-800 rounded text-slate-300 hover:text-white cursor-pointer"
              title="Сдвинуть вверх"
            >
              ▲
            </button>
            <button
              onClick={() => nudge(3, 0)}
              className="px-1.5 py-0.5 hover:bg-slate-800 rounded text-slate-300 hover:text-white cursor-pointer"
              title="Сдвинуть вниз"
            >
              ▼
            </button>
            <button
              onClick={() => nudge(0, 3)}
              className="px-1.5 py-0.5 hover:bg-slate-800 rounded text-slate-300 hover:text-white cursor-pointer"
              title="Сдвинуть вправо"
            >
              ►
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
