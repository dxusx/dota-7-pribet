import React, { useState, useRef, useEffect } from 'react';
import { 
  TOWERS_DATA, CREEP_CAMPS_DATA, BASES_DATA, RUNES_DATA, LANDMARKS, GRID_SIZE 
} from '../../data/dota95Data';
import { HERO_ABILITIES_DATA } from '../../data/dotaHeroesAbilities';
import { playClickSound, playSpellSound } from '../../utils/sound';
import { getAssetUrl } from '../../utils/assetUrl';
import { 
  Shield, Zap, Swords, Heart, Sparkles, Compass, 
  HelpCircle, Settings, FileText, BarChart3, Pause, 
  Volume2, VolumeX, Eye, Radio, ShoppingCart, 
  RotateCcw, Package, Send, CornerDownLeft, Maximize2,
  ChevronRight, ChevronLeft, Skull, Flame, Crosshair
} from 'lucide-react';

export default function Dota2HUD({
  gameState,
  dispatch,
  pan,
  zoom,
  onCenterOnCell,
  onFitMap,
  hoveredCell,
  hoveredEntity,
  showGrid,
  onToggleGrid,
  showRanges,
  onToggleRanges,
  showLegend,
  onToggleLegend,
  onNotify,
  onSwitchMode
}) {
  const {
    heroes,
    activeHeroId,
    selectedHeroId,
    turnActions,
    round,
    initiativeOrder,
    targetingMode,
    combatLog,
    towers,
    creeps,
    roshan
  } = gameState;

  const activeHero = heroes.find(h => h.id === activeHeroId) || heroes[0];
  const selectedHero = heroes.find(h => h.id === selectedHeroId) || activeHero;
  const heroData = HERO_ABILITIES_DATA[selectedHero?.id] || HERO_ABILITIES_DATA.gojo;

  // Local UI State
  const [glyphCooldown, setGlyphCooldown] = useState(0);
  const [scanCooldown, setScanCooldown] = useState(0);
  const [gold, setGold] = useState(3850);
  const [showCombatLog, setShowCombatLog] = useState(false);
  const [isDay, setIsDay] = useState(true);

  // Auto-scroll combat log to bottom
  const combatLogEndRef = useRef(null);
  useEffect(() => {
    if (showCombatLog && combatLogEndRef.current) {
      combatLogEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [combatLog, showCombatLog]);

  // Kill Counts
  const radiantKills = heroes.filter(h => h.team === 'dire' && h.isDead).length;
  const direKills = heroes.filter(h => h.team === 'radiant' && h.isDead).length;

  // Glyph activation
  const handleGlyph = () => {
    if (glyphCooldown > 0) return;
    playSpellSound();
    setGlyphCooldown(300);
    onNotify('🛡️ УКРЕПЛЕНИЕ ПОСТРОЕК АКТИВИРОВАНО! (Вышки неуязвимы 6 сек)');
    const timer = setInterval(() => {
      setGlyphCooldown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // Scan activation
  const handleScan = () => {
    if (scanCooldown > 0) return;
    playSpellSound();
    setScanCooldown(210);
    onNotify('👁️ СКАНЕР ТЕРРИТОРИИ АКТИВИРОВАН! (Проверка вражеских героев в области)');
    const timer = setInterval(() => {
      setScanCooldown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // Cast Ability from HUD Slot
  const handleCastAbility = (ab) => {
    if (ab.isPassive) {
      onNotify(`ℹ️ ${ab.name} — пассивная способность`);
      return;
    }

    // Check if the inspected hero is the active hero
    if (selectedHero.id !== activeHero.id) {
      onNotify(`⛔ Сейчас ход героя ${activeHero.name}, а не ${selectedHero.name}!`);
      return;
    }

    const timeCost = ab.timeCost || 4.0;
    if ((turnActions.remainingTime ?? 8) < timeCost) {
      onNotify(`⛔ Недостаточно времени хода (требуется ${timeCost}s, осталось ${(turnActions.remainingTime ?? 8).toFixed(1)}s)!`);
      return;
    }

    if ((activeHero.cooldowns || {})[ab.id] > 0) {
      onNotify(`⏳ Способность ${ab.name} перезаряжается (${activeHero.cooldowns[ab.id]} ходов)!`);
      return;
    }

    if (activeHero.mana < (ab.manaCost || 0)) {
      onNotify(`⛔ Недостаточно маны (${activeHero.mana}/${ab.manaCost})!`);
      return;
    }

    playClickSound();
    dispatch({ type: 'SET_TARGETING', mode: 'ABILITY', abilityId: ab.id });
  };

  // Use Item from HUD Slot
  const handleUseItem = (it) => {
    if (selectedHero.id !== activeHero.id) {
      onNotify(`⛔ Сейчас ход героя ${activeHero.name}!`);
      return;
    }

    const timeCost = 2.0;
    if ((turnActions.remainingTime ?? 8) < timeCost) {
      onNotify(`⛔ Недостаточно времени для предмета (требуется ${timeCost}s, осталось ${(turnActions.remainingTime ?? 8).toFixed(1)}s)!`);
      return;
    }

    playClickSound();

    if (it.id === 'blink') {
      dispatch({ type: 'SET_TARGETING', mode: 'ITEM', itemId: 'blink' });
      onNotify('🗡️ Выберите клетку для Blink Dagger (Дальность: 12 кл)!');
    } else if (it.id === 'bkb' || it.id === 'satanic' || it.id === 'salve' || it.id === 'tp') {
      dispatch({ type: 'USE_ITEM', itemId: it.id });
    } else {
      onNotify(`🎒 Предмет ${it.name} активен!`);
    }
  };

  return (
    <div className="absolute inset-0 pointer-events-none select-none flex flex-col justify-between z-30 font-sans">
      
      {/* ========================================================================= */}
      {/* 1. TOP BAR: DOTA 2 SCOREBOARD, GAME TIME, AND 5v5 HERO ROSTER */}
      {/* ========================================================================= */}
      <header className="relative w-full px-2 pt-1 flex items-start justify-between pointer-events-auto">
        
        {/* TOP LEFT: 5 RADIANT HEROES */}
        <div className="flex items-center gap-1 bg-[#12161f]/95 border-b-2 border-emerald-600/80 px-2 py-1 rounded-bl-xl shadow-2xl backdrop-blur-md">
          <div className="text-[10px] font-black uppercase text-emerald-400 tracking-widest pr-1">
            RAD
          </div>
          {heroes.filter(h => h.team === 'radiant').map(h => {
            const isSelected = h.id === selectedHeroId;
            const isActive = h.id === activeHeroId;
            const isDead = h.isDead || h.hp <= 0;
            const hpPercent = Math.max(0, Math.min(100, (h.hp / h.maxHp) * 100));

            return (
              <div 
                key={h.id}
                onClick={() => {
                  dispatch({ type: 'SELECT_HERO', heroId: h.id });
                  onCenterOnCell(h.r, h.c, 1.4);
                  playClickSound();
                }}
                className={`relative group cursor-pointer flex flex-col items-center transition-all ${
                  isDead ? 'opacity-40 grayscale' : isSelected ? 'scale-105 z-10' : 'opacity-85 hover:opacity-100'
                }`}
                title={`${h.name} (${h.role}) [HP: ${h.hp}/${h.maxHp}]`}
              >
                {/* Active turn indicator diamond */}
                {isActive && !isDead && (
                  <div className="w-2.5 h-2.5 rotate-45 bg-amber-400 border border-black shadow -mb-1 z-10 animate-bounce"></div>
                )}
                
                {/* Hero Portrait */}
                <div className={`relative w-11 h-12 rounded-sm overflow-hidden border-2 bg-black shadow-lg ${
                  isActive ? 'border-amber-400 ring-2 ring-amber-400/50' : isSelected ? 'border-cyan-400' : 'border-[#2d3a4f] group-hover:border-emerald-500'
                }`}>
                  <img src={getAssetUrl(h.avatar)} alt={h.name} className="w-full h-full object-cover object-top" />
                  {isDead && (
                    <div className="absolute inset-0 bg-black/75 flex items-center justify-center text-xs font-bold text-rose-500">
                      💀
                    </div>
                  )}
                </div>

                {/* Health & Mana mini bars */}
                <div className="w-full h-1 bg-slate-900 rounded-b-xs overflow-hidden">
                  <div className="h-full bg-emerald-500" style={{ width: `${hpPercent}%` }}></div>
                </div>
                <div className="w-full h-0.5 bg-blue-500"></div>
              </div>
            );
          })}
        </div>

        {/* TOP CENTER: SCOREBOARD & INITIATIVE ORDER STRIP */}
        <div className="flex flex-col items-center gap-1">
          {/* Main Scoreboard Pill */}
          <div className="flex items-center bg-[#10141d]/95 border-x-2 border-b-2 border-[#38465e] px-4 py-1 rounded-b-2xl shadow-2xl backdrop-blur-md">
            {/* Radiant Kills */}
            <div className="text-xl font-fantasy font-black text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.6)] px-2">
              {radiantKills}
            </div>

            {/* Time & Round */}
            <div className="flex flex-col items-center px-3 border-x border-slate-700/60">
              <div className="flex items-center gap-1.5 text-amber-400 text-xs font-mono font-bold">
                <span>{isDay ? '☀️' : '🌙'}</span>
                <span className="text-sm text-white tracking-wider">РАУНД {round}</span>
                <span className="text-[11px] text-amber-300 font-mono ml-1">
                  [{Math.floor((gameState.gameTimeSeconds || 0) / 60)}:{String((gameState.gameTimeSeconds || 0) % 60).padStart(2, '0')}]
                </span>
              </div>
              <div className="text-[9px] uppercase font-bold text-amber-300/80 tracking-widest">
                ХОД: {activeHero.name} ({(turnActions.remainingTime ?? 8).toFixed(1)}s)
              </div>
            </div>

            {/* Dire Kills */}
            <div className="text-xl font-fantasy font-black text-rose-500 drop-shadow-[0_0_8px_rgba(244,63,94,0.6)] px-2">
              {direKills}
            </div>
          </div>

          {/* Initiative Turn Order Queue */}
          <div className="flex items-center gap-1 bg-[#0b0e14]/90 border border-[#2b3548] px-2 py-0.5 rounded-full shadow-lg backdrop-blur-sm">
            <span className="text-[9px] font-mono font-bold text-slate-400 uppercase mr-1">
              Очередь:
            </span>
            {initiativeOrder.map((entry, idx) => {
              const hero = heroes.find(h => h.id === entry.unitId);
              const isCurrent = hero?.id === activeHeroId;
              const isDead = hero?.isDead;

              return (
                <div
                  key={entry.unitId}
                  onClick={() => {
                    if (hero) {
                      dispatch({ type: 'SELECT_HERO', heroId: hero.id });
                      onCenterOnCell(hero.r, hero.c, 1.4);
                    }
                  }}
                  className={`relative w-6 h-6 rounded-full overflow-hidden border cursor-pointer transition-transform ${
                    isCurrent 
                      ? 'border-amber-400 ring-2 ring-amber-400 scale-110 z-10' 
                      : isDead 
                      ? 'border-slate-700 opacity-30 grayscale' 
                      : hero?.team === 'radiant' 
                      ? 'border-emerald-500/80 opacity-80 hover:opacity-100' 
                      : 'border-rose-500/80 opacity-80 hover:opacity-100'
                  }`}
                  title={`${entry.name} (Инициатива: ${entry.total})`}
                >
                  <img src={getAssetUrl(entry.avatar)} alt={entry.name} className="w-full h-full object-cover object-top" />
                  {isDead && (
                    <div className="absolute inset-0 bg-black/70 flex items-center justify-center text-[8px]">
                      💀
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* TOP RIGHT: 5 DIRE HEROES & DOTA 2 MENU CONTROLS */}
        <div className="flex items-center gap-2">
          
          {/* 5 Dire Heroes */}
          <div className="flex items-center gap-1 bg-[#12161f]/95 border-b-2 border-rose-600/80 px-2 py-1 rounded-br-xl shadow-2xl backdrop-blur-md">
            {heroes.filter(h => h.team === 'dire').map(h => {
              const isSelected = h.id === selectedHeroId;
              const isActive = h.id === activeHeroId;
              const isDead = h.isDead || h.hp <= 0;
              const hpPercent = Math.max(0, Math.min(100, (h.hp / h.maxHp) * 100));

              return (
                <div 
                  key={h.id}
                  onClick={() => {
                    dispatch({ type: 'SELECT_HERO', heroId: h.id });
                    onCenterOnCell(h.r, h.c, 1.4);
                    playClickSound();
                  }}
                  className={`relative group cursor-pointer flex flex-col items-center transition-all ${
                    isDead ? 'opacity-40 grayscale' : isSelected ? 'scale-105 z-10' : 'opacity-85 hover:opacity-100'
                  }`}
                  title={`${h.name} (${h.role}) [HP: ${h.hp}/${h.maxHp}]`}
                >
                  {/* Active turn indicator diamond */}
                  {isActive && !isDead && (
                    <div className="w-2.5 h-2.5 rotate-45 bg-amber-400 border border-black shadow -mb-1 z-10 animate-bounce"></div>
                  )}
                  
                  {/* Hero Portrait */}
                  <div className={`relative w-11 h-12 rounded-sm overflow-hidden border-2 bg-black shadow-lg ${
                    isActive ? 'border-amber-400 ring-2 ring-amber-400/50' : isSelected ? 'border-cyan-400' : 'border-[#2d3a4f] group-hover:border-rose-500'
                  }`}>
                    <img src={getAssetUrl(h.avatar)} alt={h.name} className="w-full h-full object-cover object-top" />
                    {isDead && (
                      <div className="absolute inset-0 bg-black/75 flex items-center justify-center text-xs font-bold text-rose-500">
                        💀
                      </div>
                    )}
                  </div>

                  {/* Health & Mana mini bars */}
                  <div className="w-full h-1 bg-slate-900 rounded-b-xs overflow-hidden">
                    <div className="h-full bg-rose-500" style={{ width: `${hpPercent}%` }}></div>
                  </div>
                  <div className="w-full h-0.5 bg-blue-500"></div>
                </div>
              );
            })}
            <div className="text-[10px] font-black uppercase text-rose-400 tracking-widest pl-1">
              DIRE
            </div>
          </div>

          {/* Mode Switcher: [ EDITOR ] [ GAME ] */}
          {onSwitchMode && (
            <div className="flex items-center bg-[#0a0b0d] p-0.5 border border-[#262832] shadow-lg">
              <button
                onClick={() => {
                  playClickSound();
                  onSwitchMode('EDITOR');
                }}
                className="px-2.5 py-1 text-[10px] font-mono font-black uppercase tracking-wider transition-colors cursor-pointer border bg-[#15161b] border-transparent text-[#7e8392] hover:text-[#d3d6e0]"
                title="Переключиться в Редактор карты"
              >
                EDITOR
              </button>
              <button
                onClick={() => {
                  playClickSound();
                  onSwitchMode('GAME');
                }}
                className="px-2.5 py-1 text-[10px] font-mono font-black uppercase tracking-wider transition-colors cursor-pointer border bg-gradient-to-b from-[#3a2c10] to-[#241a08] border-[#dfb652] text-[#fce89e] shadow-[inset_0_1px_0_rgba(255,255,255,0.2)]"
                title="Боевой тактический режим"
              >
                GAME
              </button>
            </div>
          )}

          {/* DOTA 2 Menu buttons */}
          <div className="flex items-center gap-1 bg-[#10141d]/95 border border-[#2b3548] p-1.5 rounded-xl shadow-xl">
            <button
              onClick={() => setShowCombatLog(!showCombatLog)}
              className={`px-2 py-1 rounded-lg text-xs font-bold cursor-pointer transition-colors flex items-center gap-1 ${
                showCombatLog ? 'bg-amber-500 text-black' : 'bg-[#18202d] text-amber-400 hover:bg-[#222c3d]'
              }`}
              title="Журнал боя (Лог кубиков и урона)"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Лог</span>
            </button>
            <button
              onClick={onToggleLegend}
              className={`px-2 py-1 rounded-lg text-xs font-bold cursor-pointer transition-colors flex items-center gap-1 ${
                showLegend ? 'bg-amber-500 text-black' : 'bg-[#18202d] text-amber-400 hover:bg-[#222c3d]'
              }`}
              title="Открыть легенду тайлов (палитра друга)"
            >
              <span>🗺️</span>
            </button>
            <button
              onClick={onToggleGrid}
              className={`p-1.5 rounded-lg text-xs cursor-pointer transition-colors ${
                showGrid ? 'bg-amber-500/20 text-amber-400' : 'text-slate-400 hover:text-white'
              }`}
              title="Сетка 95x95"
            >
              #
            </button>
            <button
              onClick={onToggleRanges}
              className={`p-1.5 rounded-lg text-xs cursor-pointer transition-colors ${
                showRanges ? 'bg-cyan-500/20 text-cyan-400' : 'text-slate-400 hover:text-white'
              }`}
              title="Радиусы вышек"
            >
              <Shield className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={onFitMap}
              className="p-1.5 rounded-lg text-xs text-slate-300 hover:text-white cursor-pointer"
              title="Сбросить камеру (Вся карта)"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => {
                if (window.confirm('Начать тактическую битву заново?')) {
                  dispatch({ type: 'RESET_BATTLE' });
                  onNotify('🔄 Битва перезапущена! Инициатива переброшена.');
                }
              }}
              className="p-1.5 rounded-lg text-xs text-rose-400 hover:bg-rose-500/20 cursor-pointer"
              title="Сбросить бой (Перезапуск)"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>

      </header>

      {/* ========================================================================= */}
      {/* 2. COMBAT LOG DRAWER (EXPANDABLE PANEL) */}
      {/* ========================================================================= */}
      {showCombatLog && (
        <aside className="absolute top-18 right-3 z-40 w-96 max-h-[70vh] bg-[#0c1018]/95 border-2 border-[#2f3d56] rounded-2xl shadow-2xl p-3 flex flex-col pointer-events-auto backdrop-blur-md animate-in slide-in-from-right-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-700">
            <div className="flex items-center gap-1.5 text-xs font-fantasy font-black text-amber-400 uppercase tracking-wider">
              <FileText className="w-4 h-4" />
              <span>Журнал тактического боя</span>
            </div>
            <button 
              onClick={() => setShowCombatLog(false)}
              className="text-slate-400 hover:text-white text-xs px-1.5 py-0.5 rounded bg-slate-800"
            >
              ✕
            </button>
          </div>

          <div className="flex-1 overflow-y-auto space-y-1.5 py-2 pr-1 font-mono text-[11px]">
            {combatLog.map((log) => {
              const isAtk = log.type === 'ATTACK';
              const isAb = log.type === 'ABILITY_CAST' || log.type === 'DAMAGE';
              const isDeath = log.type === 'DEATH';
              const isMove = log.type === 'MOVE';
              const isTurn = log.type === 'TURN';

              return (
                <div 
                  key={log.id}
                  className={`p-1.5 rounded border leading-tight ${
                    isDeath 
                      ? 'bg-rose-950/80 border-rose-600 text-rose-200' 
                      : isAtk 
                      ? 'bg-amber-950/40 border-amber-600/60 text-amber-200' 
                      : isAb 
                      ? 'bg-cyan-950/40 border-cyan-600/60 text-cyan-200' 
                      : isTurn 
                      ? 'bg-indigo-950/40 border-indigo-600/60 text-indigo-200 font-bold' 
                      : 'bg-slate-900/60 border-slate-800 text-slate-300'
                  }`}
                >
                  <span className="text-[9px] text-slate-500 mr-1.5">R{log.round}</span>
                  {log.text}
                </div>
              );
            })}
            <div ref={combatLogEndRef} />
          </div>
        </aside>
      )}

      {/* ========================================================================= */}
      {/* 3. FRIEND'S 5-COLOR TILE LEGEND OVERLAY */}
      {/* ========================================================================= */}
      {showLegend && (
        <div className="absolute top-18 left-1/2 -translate-x-1/2 z-40 bg-[#121620]/95 backdrop-blur-md border-2 border-[#364259] p-3 rounded-2xl shadow-2xl pointer-events-auto flex items-center gap-4 animate-in fade-in zoom-in-95">
          <div className="flex items-center gap-1.5 pr-3 border-r border-slate-700">
            <span className="font-fantasy font-black text-amber-400 text-xs uppercase tracking-wider">
              Легенда Карты
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded bg-[#1a1a1c] border border-slate-600 shadow"></div>
              <div>
                <div className="text-xs font-bold text-white leading-tight">Непроходимое</div>
                <div className="text-[10px] text-slate-400 font-mono">Непроходимо</div>
              </div>
            </div>

            <div className="h-5 w-px bg-slate-800"></div>

            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded bg-[#384457] border border-slate-500 shadow"></div>
              <div>
                <div className="text-xs font-bold text-white leading-tight">Фонтан</div>
                <div className="text-[10px] text-cyan-300 font-mono">+24% хп/ход, +24% мана/ход</div>
              </div>
            </div>

            <div className="h-5 w-px bg-slate-800"></div>

            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded bg-[#8b8788] border border-slate-400 shadow"></div>
              <div>
                <div className="text-xs font-bold text-white leading-tight">Хайграунд</div>
                <div className="text-[10px] text-slate-300 font-mono">Возвышенность (базы)</div>
              </div>
            </div>

            <div className="h-5 w-px bg-slate-800"></div>

            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded bg-[#4d7150] border border-emerald-500 shadow"></div>
              <div>
                <div className="text-xs font-bold text-white leading-tight">Граунд</div>
                <div className="text-[10px] text-emerald-400 font-mono">Земля / Линии</div>
              </div>
            </div>

            <div className="h-5 w-px bg-slate-800"></div>

            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded bg-[#8294b6] border border-indigo-400 shadow"></div>
              <div>
                <div className="text-xs font-bold text-white leading-tight">Вода</div>
                <div className="text-[10px] text-amber-300 font-mono">-10% к скорости</div>
              </div>
            </div>
          </div>

          <button 
            onClick={onToggleLegend}
            className="ml-2 px-2 py-0.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-400 hover:text-white cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. TACTICAL ACTION ECONOMY BAR (TIME-BASED 8-SECOND TURN SYSTEM) */}
      {/* ========================================================================= */}
      <div className="relative w-full flex items-center justify-center mb-1 pointer-events-auto">
        <div className="flex items-center gap-3 bg-[#0e121a]/95 border border-[#334155] px-4 py-1.5 rounded-full shadow-2xl backdrop-blur-md">
          {/* Active Unit Indicator */}
          <div className="flex items-center gap-1.5 pr-3 border-r border-slate-700">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
            <span className="text-xs font-fantasy font-black text-amber-300">
              ХОД: {activeHero.name}
            </span>
          </div>

          {/* 8-Second Turn Time System */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 bg-[#141824] border border-amber-500/50 px-3 py-1 rounded-md">
              <span className="text-sm">⏳</span>
              <div className="flex flex-col">
                <div className="flex items-center justify-between gap-3 text-[10px] font-mono leading-none">
                  <span className="text-slate-400 font-bold uppercase">Время хода:</span>
                  <span className={`font-black ${
                    (turnActions.remainingTime ?? 8) > 4 
                      ? 'text-emerald-400' 
                      : (turnActions.remainingTime ?? 8) > 2 
                      ? 'text-amber-400' 
                      : 'text-rose-400'
                  }`}>
                    {(turnActions.remainingTime ?? 8).toFixed(1)} / 8.0s
                  </span>
                </div>
                {/* Visual Progress Bar */}
                <div className="w-28 h-1.5 bg-slate-800 rounded-full overflow-hidden mt-1">
                  <div 
                    className={`h-full transition-all duration-300 ${
                      (turnActions.remainingTime ?? 8) > 4 
                        ? 'bg-emerald-500' 
                        : (turnActions.remainingTime ?? 8) > 2 
                        ? 'bg-amber-500' 
                        : 'bg-rose-500'
                    }`}
                    style={{ width: `${Math.max(0, Math.min(100, ((turnActions.remainingTime ?? 8) / 8) * 100))}%` }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Movement */}
            <div className="flex items-center gap-1 bg-[#161c28] border border-cyan-500/40 px-2.5 py-1 rounded-md text-cyan-300 text-xs font-mono" title="Расход: 2.0s за ход">
              <span>👟</span>
              <span className="font-bold">{turnActions.movement} / {turnActions.movementMax} кл (-2.0s)</span>
            </div>
          </div>

          <div className="h-4 w-px bg-slate-700 mx-1"></div>

          {/* Attack Action Button */}
          <button
            onClick={() => {
              playClickSound();
              dispatch({ type: 'SET_TARGETING', mode: 'ATTACK' });
            }}
            disabled={(turnActions.remainingTime ?? 8) < 3.0}
            className={`px-3 py-1 rounded-lg text-xs font-fantasy font-black flex items-center gap-1 transition-all cursor-pointer ${
              targetingMode?.mode === 'ATTACK'
                ? 'bg-rose-600 text-white ring-2 ring-rose-400'
                : (turnActions.remainingTime ?? 8) >= 3.0
                ? 'bg-gradient-to-r from-rose-700 to-red-600 hover:from-rose-600 hover:to-red-500 text-white shadow-lg'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed'
            }`}
            title="Базовая атака [A] (Расход: 3.0s)"
          >
            <Swords className="w-3.5 h-3.5" />
            <span>АТАКА (3.0s) [A]</span>
          </button>

          {/* End Turn Button */}
          <button
            onClick={() => {
              playClickSound();
              dispatch({ type: 'END_TURN' });
            }}
            className="px-3 py-1 rounded-lg text-xs font-fantasy font-black bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-black shadow-lg flex items-center gap-1 cursor-pointer transition-transform hover:scale-105"
            title="Завершить ход и передать управление следующему герою [Пробел]"
          >
            <span>⏩ ЗАВЕРШИТЬ ХОД [Space]</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 5. BOTTOM HUD CONSOLE (1 В 1 DOTA 2 MAIN HUD) */}
      {/* ========================================================================= */}
      <footer className="relative w-full h-[180px] flex items-end justify-between pointer-events-auto select-none bg-gradient-to-t from-black via-[#080b11] to-transparent pt-2">
        
        {/* ------------------------------------------------------------- */}
        {/* A. BOTTOM-LEFT: DOTA 2 MINIMAP FRAME */}
        {/* ------------------------------------------------------------- */}
        <div className="relative flex items-end ml-1 mb-1">
          
          {/* Glyph & Radar Scan Buttons */}
          <div className="flex flex-col gap-1.5 mr-1 mb-2 z-10">
            <button
              onClick={handleGlyph}
              disabled={glyphCooldown > 0}
              className={`relative w-8 h-8 rounded-lg border-2 flex items-center justify-center cursor-pointer transition-all ${
                glyphCooldown > 0 
                  ? 'bg-slate-900 border-slate-700 opacity-60' 
                  : 'bg-gradient-to-b from-amber-600 to-amber-900 border-amber-400 hover:scale-105 shadow-[0_0_10px_rgba(251,191,36,0.5)]'
              }`}
              title="Укрепление построек (Glyph of Fortification)"
            >
              <Shield className="w-4 h-4 text-white" />
              {glyphCooldown > 0 && (
                <span className="absolute inset-0 flex items-center justify-center text-[9px] font-mono font-bold text-amber-300 bg-black/75 rounded-md">
                  {glyphCooldown}
                </span>
              )}
            </button>

            <button
              onClick={handleScan}
              disabled={scanCooldown > 0}
              className={`relative w-8 h-8 rounded-lg border-2 flex items-center justify-center cursor-pointer transition-all ${
                scanCooldown > 0 
                  ? 'bg-slate-900 border-slate-700 opacity-60' 
                  : 'bg-gradient-to-b from-cyan-600 to-cyan-900 border-cyan-400 hover:scale-105 shadow-[0_0_10px_rgba(34,211,238,0.5)]'
              }`}
              title="Радар сканирования (Scan)"
            >
              <Radio className="w-4 h-4 text-white" />
              {scanCooldown > 0 && (
                <span className="absolute inset-0 flex items-center justify-center text-[9px] font-mono font-bold text-cyan-300 bg-black/75 rounded-md">
                  {scanCooldown}
                </span>
              )}
            </button>
          </div>

          {/* Minimap Box with Dota 2 Stone Bevel */}
          <div className="relative w-[175px] h-[175px] bg-[#07090e] border-2 border-[#2b3548] rounded-xl overflow-hidden shadow-2xl p-0.5">
            <div 
              className="w-full h-full relative cursor-pointer"
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const clickX = e.clientX - rect.left;
                const clickY = e.clientY - rect.top;
                const targetC = Math.round((clickX / rect.width) * (GRID_SIZE - 1));
                const targetR = Math.round((clickY / rect.height) * (GRID_SIZE - 1));
                onCenterOnCell(targetR, targetC);
              }}
            >
              <svg className="w-full h-full" viewBox="0 0 95 95">
                <rect x="0" y="0" width="95" height="95" fill="#1a1a1c" />
                <rect x="2" y="2" width="91" height="91" fill="#4d7150" />
                <rect x="6" y="6" width="5" height="74" fill="#5b825f" />
                <rect x="6" y="6" width="74" height="5" fill="#5b825f" />
                <rect x="16" y="84" width="72" height="5" fill="#5b825f" />
                <rect x="84" y="16" width="5" height="73" fill="#5b825f" />
                <line x1="16" y1="78" x2="78" y2="16" stroke="#5b825f" strokeWidth="6" />
                <path 
                  d="M 2 26 L 8 29 L 18 33 L 32 38 L 47 47 L 58 56 L 65 72 L 66 86 L 68 92" 
                  fill="none" 
                  stroke="#8294b6" 
                  strokeWidth="5" 
                  strokeLinecap="round"
                />
                <circle cx="0" cy="94" r="17" fill="#8b8788" />
                <circle cx="0" cy="94" r="6" fill="#384457" />
                <circle cx="94" cy="0" r="17" fill="#8b8788" />
                <circle cx="94" cy="0" r="6" fill="#384457" />
                <circle cx="42" cy="24" r="3.5" fill="#7f1d1d" stroke="#ef4444" strokeWidth="0.8" />

                {/* Living Towers on Minimap */}
                {towers.filter(t => !t.isDead).map(t => (
                  <circle 
                    key={t.id} 
                    cx={t.c} 
                    cy={t.r} 
                    r="2.2" 
                    fill={t.team === 'radiant' ? '#10b981' : '#ef4444'} 
                    stroke="#000000"
                    strokeWidth="0.8"
                  />
                ))}

                {/* Living Heroes on Minimap */}
                {heroes.filter(h => !h.isDead).map(h => (
                  <g key={h.id}>
                    {h.id === activeHeroId && (
                      <circle cx={h.c} cy={h.r} r="6" fill="none" stroke="#fbbf24" strokeWidth="1.2" className="animate-ping" />
                    )}
                    <circle 
                      cx={h.c} 
                      cy={h.r} 
                      r={h.id === activeHeroId ? "4" : "2.6"} 
                      fill={h.team === 'radiant' ? '#34d399' : '#f87171'} 
                      stroke={h.id === activeHeroId ? "#fbbf24" : "#000000"}
                      strokeWidth="1"
                    />
                  </g>
                ))}
              </svg>
            </div>
            
            <div className="absolute top-1 left-1.5 text-[8px] font-mono font-bold text-slate-400 bg-black/80 px-1 rounded pointer-events-none">
              95×95
            </div>
          </div>
        </div>

        {/* ------------------------------------------------------------- */}
        {/* B. BOTTOM-CENTER: HERO CONSOLE (STATS, HP/MP, SPELLS, ITEMS) */}
        {/* ------------------------------------------------------------- */}
        <div className="flex items-end bg-[#0e121a]/95 border-t-2 border-x-2 border-[#2b364a] rounded-t-2xl shadow-2xl backdrop-blur-md px-3 py-2 gap-3 mb-0">
          
          {/* 1. HERO PORTRAIT & LEVEL */}
          <div className="flex flex-col items-center">
            <div className="relative w-20 h-22 rounded-lg overflow-hidden border-2 border-[#3d4c66] bg-black shadow-inner">
              <img src={getAssetUrl(selectedHero.avatar)} alt={selectedHero.name} className="w-full h-full object-cover object-top" />
              
              {/* Level Circle Badge */}
              <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-gradient-to-b from-amber-500 to-amber-800 border-2 border-amber-300 flex items-center justify-center text-[10px] font-black text-black shadow-lg">
                {heroData.level}
              </div>

              {/* Primary Attr Icon */}
              <div className="absolute top-1 left-1 text-[10px]" title="Основной атрибут">
                {heroData.primaryAttr === 'str' ? '🔴' : heroData.primaryAttr === 'agi' ? '🟢' : heroData.primaryAttr === 'int' ? '🔵' : '🟣'}
              </div>
            </div>

            {/* Hero Nameplate */}
            <div className="text-center mt-1">
              <div className="text-xs font-fantasy font-black text-white leading-tight">
                {selectedHero.name}
              </div>
              <div className="text-[9px] text-amber-400 font-mono">
                {heroData.title}
              </div>
            </div>
          </div>

          {/* 2. STATS & ATTRIBUTES COLUMN */}
          <div className="flex flex-col justify-between h-24 py-0.5 text-[11px] font-mono text-slate-300 min-w-[125px] border-r border-slate-800 pr-2">
            <div className="flex items-center justify-between">
              <span className="text-slate-400 flex items-center gap-1">⚔️ Урон:</span>
              <span className="font-bold text-white">{heroData.stats.damage}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400 flex items-center gap-1">🛡️ Броня:</span>
              <span className="font-bold text-white">{heroData.stats.armor}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400 flex items-center gap-1">👢 Скорость:</span>
              <span className="font-bold text-white">{heroData.stats.speed} ({selectedHero.speed} кл)</span>
            </div>

            {/* STR / AGI / INT */}
            <div className="flex items-center justify-between pt-1 border-t border-slate-800/80 text-[10px]">
              <span className="text-rose-400 font-bold">🔴 {heroData.stats.str}</span>
              <span className="text-emerald-400 font-bold">🟢 {heroData.stats.agi}</span>
              <span className="text-blue-400 font-bold">🔵 {heroData.stats.int}</span>
            </div>
          </div>

          {/* 3. HEALTH & MANA BARS + TALENT TREE + ABILITIES */}
          <div className="flex flex-col gap-1.5">
            
            {/* HEALTH BAR (REAL LIVE HP FROM STATE) */}
            <div className="relative w-[340px] h-6 bg-[#0f1710] rounded border border-emerald-950 overflow-hidden shadow-inner flex items-center justify-between px-2">
              <div 
                className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-emerald-500 transition-all duration-300"
                style={{ width: `${Math.max(0, Math.min(100, (selectedHero.hp / selectedHero.maxHp) * 100))}%` }}
              ></div>
              <div className="absolute inset-0 flex justify-between pointer-events-none opacity-25">
                {[...Array(12)].map((_, i) => (
                  <div key={i} className="w-px h-full bg-black"></div>
                ))}
              </div>
              <span className="relative z-10 text-[11px] font-black text-white drop-shadow tracking-wider">
                {selectedHero.hp * 25} / {selectedHero.maxHp * 25}
              </span>
              <span className="relative z-10 text-[10px] font-mono font-bold text-emerald-200">
                {heroData.stats.hpRegen}
              </span>
            </div>

            {/* MANA BAR (REAL LIVE MANA FROM STATE) */}
            <div className="relative w-[340px] h-5 bg-[#0b121e] rounded border border-blue-950 overflow-hidden shadow-inner flex items-center justify-between px-2">
              <div 
                className="absolute inset-0 bg-gradient-to-r from-blue-600 to-cyan-500 transition-all duration-300"
                style={{ width: `${Math.max(0, Math.min(100, (selectedHero.mana / selectedHero.maxMana) * 100))}%` }}
              ></div>
              <div className="absolute inset-0 flex justify-between pointer-events-none opacity-20">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="w-px h-full bg-black"></div>
                ))}
              </div>
              <span className="relative z-10 text-[10px] font-black text-white drop-shadow tracking-wider">
                {selectedHero.mana * 15} / {selectedHero.maxMana * 15}
              </span>
              <span className="relative z-10 text-[9px] font-mono font-bold text-cyan-200">
                {heroData.stats.mpRegen}
              </span>
            </div>

            {/* ABILITY SLOTS ROW + TALENT TREE */}
            <div className="flex items-center gap-1.5 mt-0.5">
              
              {/* Talent Tree Branch Icon */}
              <button 
                className="w-10 h-10 rounded-full border-2 border-amber-500/60 bg-[#161b26] flex items-center justify-center text-amber-400 hover:border-amber-400 cursor-pointer shadow-lg group"
                title="Древо Талантов (Все таланты активны)"
                onClick={() => onNotify('🌳 Древо Талантов: Все таланты прокачаны на максимум!')}
              >
                <Sparkles className="w-5 h-5 group-hover:rotate-45 transition-transform" />
              </button>

              {/* 4 to 6 Abilities */}
              {heroData.abilities.map(ab => {
                const cooldown = (selectedHero.cooldowns || {})[ab.id] || 0;
                const isTargetingThis = targetingMode?.mode === 'ABILITY' && targetingMode?.ability?.id === ab.id;

                return (
                  <button
                    key={ab.id}
                    onClick={() => handleCastAbility(ab)}
                    disabled={cooldown > 0}
                    className={`relative w-12 h-12 rounded-lg border-2 bg-[#121620] overflow-hidden flex flex-col justify-between p-0.5 cursor-pointer transition-transform hover:scale-105 shadow-md ${
                      isTargetingThis
                        ? 'border-cyan-400 ring-2 ring-cyan-400/80 animate-pulse'
                        : ab.isUltimate 
                        ? 'border-amber-500' 
                        : 'border-[#2d3a4f] hover:border-cyan-400'
                    }`}
                    title={`${ab.name} [${ab.hotkey}]: ${ab.desc}`}
                  >
                    {/* Hotkey Letter */}
                    <div className="text-[9px] font-mono font-black text-amber-300 leading-none">
                      {ab.hotkey}
                    </div>

                    {/* Icon */}
                    <div className="text-center text-lg leading-none -my-1">
                      {ab.icon}
                    </div>

                    {/* Mana Cost */}
                    {ab.manaCost > 0 ? (
                      <div className="text-right text-[8px] font-mono font-black text-cyan-300 leading-none">
                        {ab.manaCost}
                      </div>
                    ) : (
                      <div></div>
                    )}

                    {/* Cooldown Overlay */}
                    {cooldown > 0 && (
                      <div className="absolute inset-0 bg-black/85 flex items-center justify-center text-sm font-black font-mono text-amber-400">
                        {cooldown}
                      </div>
                    )}

                    {/* Level Pips */}
                    <div className="absolute bottom-0 inset-x-0 flex justify-center gap-0.5 pb-0.5 pointer-events-none">
                      {[...Array(ab.maxLevel || 4)].map((_, i) => (
                        <div key={i} className="w-1.5 h-0.5 bg-amber-400 rounded-full"></div>
                      ))}
                    </div>
                  </button>
                );
              })}

            </div>

          </div>

          {/* 4. 6-SLOT INVENTORY + BACKPACK + NEUTRAL ITEM */}
          <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
            
            {/* 6 Main Items Grid */}
            <div className="grid grid-cols-3 gap-1">
              {heroData.items.map((it, idx) => (
                <button
                  key={idx}
                  onClick={() => handleUseItem(it)}
                  className="relative w-10 h-9 rounded bg-[#10141d] border border-[#2d3b52] hover:border-amber-400 flex flex-col items-center justify-center cursor-pointer transition-colors shadow-inner"
                  title={`${it.name} (${it.cost} 🪙)`}
                >
                  <span className="text-base leading-none">{it.icon}</span>
                  <span className="text-[7px] font-mono text-slate-400 truncate max-w-[36px]">{it.name.split(' ')[0]}</span>
                </button>
              ))}
            </div>

            {/* Neutral Item & TP Scroll */}
            <div className="flex flex-col gap-1">
              {/* Neutral Item */}
              <div 
                className="w-9 h-9 rounded-full bg-gradient-to-b from-purple-900 to-black border-2 border-purple-500 flex items-center justify-center shadow-lg cursor-pointer"
                title={`${heroData.neutralItem.name} (Tier ${heroData.neutralItem.tier}): ${heroData.neutralItem.bonus}`}
                onClick={() => onNotify(`👑 Нейтральный предмет: ${heroData.neutralItem.name}`)}
              >
                <span className="text-sm">{heroData.neutralItem.icon}</span>
              </div>

              {/* TP Scroll */}
              <button 
                onClick={() => handleUseItem({ id: 'tp', name: 'TP Scroll' })}
                className="relative w-9 h-9 rounded bg-[#1c1813] border-2 border-amber-600/80 hover:border-amber-400 flex items-center justify-center cursor-pointer shadow-lg"
                title="Свиток телепортации на фонтан родной базы"
              >
                <span className="text-sm">📜</span>
                <span className="absolute bottom-0.5 right-1 text-[8px] font-mono font-black text-amber-300">
                  {heroData.tpScroll.count}
                </span>
              </button>
            </div>

          </div>

        </div>

        {/* ------------------------------------------------------------- */}
        {/* C. BOTTOM-RIGHT: SHOP, COURIER & GOLD PANEL */}
        {/* ------------------------------------------------------------- */}
        <div className="flex flex-col items-end mr-3 mb-2 gap-1.5">
          
          {/* Gold & Buyback Status */}
          <div className="flex items-center gap-2 bg-[#10141d]/95 border border-[#2b3548] px-3 py-1.5 rounded-xl shadow-xl">
            <div className="flex items-center gap-1 text-amber-400 font-mono font-black text-xs">
              <span>🪙</span>
              <span>{gold.toLocaleString()}</span>
            </div>
            <div className="h-3 w-px bg-slate-700"></div>
            <div className="text-[10px] text-emerald-400 font-bold font-mono flex items-center gap-1">
              <span>🛡️ Выкуп: ГОТОВ</span>
            </div>
          </div>

          {/* Courier & Shop Row */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => onNotify('🐴 Курьер доставляет предметы вашему герою!')}
              className="px-2.5 py-1.5 rounded-xl bg-[#161c28] hover:bg-[#20293a] border border-[#2d3a4f] text-xs font-mono font-bold text-slate-200 cursor-pointer flex items-center gap-1 shadow-lg"
              title="Курьер: Доставить предметы [F3]"
            >
              <span>🐴</span>
              <span>F3</span>
            </button>

            <button
              onClick={() => onNotify('🛒 Лавка открыта! Все предметы доступны для покупки.')}
              className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-600 via-amber-500 to-yellow-600 hover:from-amber-500 hover:to-yellow-500 text-black font-fantasy font-black text-xs tracking-wider border border-amber-300 shadow-xl cursor-pointer flex items-center gap-1.5"
              title="Магазин [F4]"
            >
              <ShoppingCart className="w-3.5 h-3.5" />
              <span>МАГАЗИН</span>
            </button>
          </div>

        </div>

      </footer>

    </div>
  );
}
