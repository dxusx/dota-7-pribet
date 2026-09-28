import React, { useState, useEffect, useRef } from 'react';
import { HERO_ABILITIES_DATA } from '../../data/dotaHeroesAbilities';
import { ITEM_DEFINITIONS } from '../../game/items';
import { getAssetUrl } from '../../utils/assetUrl';
import { playClickSound, playSpellSound, playAttackSound } from '../../utils/sound';
import { 
  Footprints, Swords, Sparkles, ShoppingBag, 
  ChevronRight, Shield, Zap, Heart, X, Award,
  RotateCcw, History, ArrowRight
} from 'lucide-react';

export default function TacticalHUD({
  gameState,
  dispatch,
  actionMode,
  setActionMode,
  onCenterOnCell,
  onNotify,
  onSwitchMode
}) {
  const {
    heroes,
    activeHeroId,
    selectedHeroId,
    turnActions,
    round,
    turnIndex,
    initiativeOrder,
    targetingMode,
    combatLog
  } = gameState;

  // Active Hero (whose turn it currently is)
  const activeHero = heroes.find(h => h.id === activeHeroId) || heroes[0];
  const isRadiant = activeHero?.team === 'radiant';

  // Drawers and Modals State
  const [showSkillDrawer, setShowSkillDrawer] = useState(false);
  const [showShopDrawer, setShowShopDrawer] = useState(false);
  const [showLogDrawer, setShowLogDrawer] = useState(false);

  // Retrieve abilities of active hero
  const heroAbilitiesData = HERO_ABILITIES_DATA[activeHero?.id];
  const heroAbilities = heroAbilitiesData?.abilities || activeHero?.abilities || [];

  // Close drawers when active hero changes (turn ends)
  useEffect(() => {
    setShowSkillDrawer(false);
    setShowShopDrawer(false);
    setShowLogDrawer(false);
  }, [activeHeroId]);

  // Last Combat Log Message for Toast Bar
  const lastLog = combatLog && combatLog.length > 0 ? combatLog[combatLog.length - 1] : null;

  // 1. Move Mode Button Handler
  const handleToggleMove = () => {
    playClickSound();
    setShowSkillDrawer(false);
    setShowShopDrawer(false);

    if (targetingMode) {
      dispatch({ type: 'CANCEL_TARGETING' });
    }

    if (actionMode === 'MOVE') {
      setActionMode('NONE');
      onNotify('Режим движения отключен');
    } else {
      setActionMode('MOVE');
      onNotify(`🦶 Режим перемещения: выберите синюю клетку (${turnActions.movement} шагов)`);
    }
  };

  // 2. Attack Mode Button Handler
  const handleToggleAttack = () => {
    playClickSound();
    setShowSkillDrawer(false);
    setShowShopDrawer(false);

    if (targetingMode?.mode === 'ATTACK' || actionMode === 'ATTACK') {
      dispatch({ type: 'CANCEL_TARGETING' });
      setActionMode('NONE');
      onNotify('Режим атаки отменен');
    } else {
      setActionMode('ATTACK');
      dispatch({ type: 'START_TARGETING', mode: 'ATTACK' });
      onNotify(`⚔️ Режим атаки: выберите цель в красной зоне (дальность: ${activeHero.range || 2})`);
    }
  };

  // 3. Ability Selection Handler
  const handleCastAbility = (ability) => {
    playSpellSound();
    setShowSkillDrawer(false);

    if ((activeHero.mana || 0) < (ability.manaCost || 0)) {
      onNotify(`⛔ Недостаточно маны! Требуется ${ability.manaCost} MP`);
      return;
    }

    // Direct cast or targeting
    if (ability.targetType === 'SELF') {
      dispatch({ type: 'EXECUTE_ABILITY', abilityId: ability.id });
      onNotify(`🔮 ${activeHero.name} применил «${ability.name}»!`);
    } else {
      setActionMode('ABILITY');
      dispatch({ 
        type: 'START_TARGETING', 
        mode: 'ABILITY', 
        abilityId: ability.id,
        ability 
      });
      onNotify(`🎯 Прицеливание: «${ability.name}»`);
    }
  };

  // 4. Shop Item Buy / Use Handler
  const handleUseItem = (itemKey) => {
    const item = ITEM_DEFINITIONS[itemKey];
    if (!item) return;

    playSpellSound();
    setShowShopDrawer(false);

    if (item.targetType === 'GROUND') {
      setActionMode('ITEM');
      dispatch({
        type: 'START_TARGETING',
        mode: 'ITEM',
        itemId: item.id,
        range: item.range || 12
      });
      onNotify(`🗡️ Выберите точку для прыжка ${item.name}!`);
    } else {
      dispatch({ type: 'USE_ITEM', itemId: item.id });
      onNotify(`🎒 Использован предмет: ${item.name}!`);
    }
  };

  // 5. End Turn Handler
  const handleEndTurn = () => {
    playClickSound();
    setActionMode('NONE');
    setShowSkillDrawer(false);
    setShowShopDrawer(false);
    setShowLogDrawer(false);
    
    dispatch({ type: 'END_TURN' });

    // Focus camera on next hero in queue
    const nextIdx = (turnIndex + 1) % (initiativeOrder.length || 1);
    const nextUnitId = initiativeOrder[nextIdx]?.unitId;
    const nextHero = heroes.find(h => h.id === nextUnitId);
    if (nextHero) {
      onCenterOnCell(nextHero.r, nextHero.c);
    }
  };

  // HP and Mana percentage calculations
  const hpPercent = Math.max(0, Math.min(100, Math.round(((activeHero?.hp || 0) / (activeHero?.maxHp || 100)) * 100)));
  const manaPercent = Math.max(0, Math.min(100, Math.round(((activeHero?.mana || 0) / (activeHero?.maxMana || 100)) * 100)));

  return (
    <>
      {/* ========================================================= */}
      {/* 1. TOP TIMELINE: HORIZONTAL TURN ORDER RIBBON             */}
      {/* ========================================================= */}
      <header className="fixed top-3 left-1/2 -translate-x-1/2 z-40 max-w-[96vw] w-auto">
        <div className="bg-[#121622]/95 backdrop-blur-xl border border-slate-700/80 rounded-2xl px-3 py-2 shadow-2xl flex items-center gap-2 sm:gap-3 overflow-x-auto no-scrollbar">
          {/* Round Indicator Badge */}
          <div className="bg-amber-500/20 text-amber-300 border border-amber-500/50 px-2.5 sm:px-3 py-1 rounded-xl text-[11px] sm:text-xs font-mono font-black tracking-wider whitespace-nowrap flex items-center gap-1 shadow-inner">
            <Award className="w-3.5 h-3.5 text-amber-400" />
            <span>РАУНД {round}</span>
          </div>

          <div className="h-6 w-px bg-slate-700/70" />

          {/* Turn Order Chain of Hero Tokens */}
          <div className="flex items-center gap-2 sm:gap-3 overflow-x-auto no-scrollbar py-1">
            {initiativeOrder.map((entry, idx) => {
              const hero = heroes.find(h => h.id === entry.unitId);
              if (!hero) return null;

              const isActive = hero.id === activeHeroId;
              const isHeroDead = hero.isDead || hero.hp <= 0;
              const isHeroRadiant = hero.team === 'radiant';

              return (
                <button
                  key={`${hero.id}_${idx}`}
                  onClick={() => {
                    playClickSound();
                    dispatch({ type: 'SELECT_HERO', heroId: hero.id });
                    onCenterOnCell(hero.r, hero.c);
                  }}
                  title={`${hero.name} (Инициатива: ${entry.total})`}
                  className={`relative flex flex-col items-center group transition-all duration-200 cursor-pointer ${
                    isActive ? 'scale-110 -translate-y-0.5' : 'hover:scale-105 opacity-80 hover:opacity-100'
                  }`}
                >
                  <div
                    className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full overflow-hidden flex items-center justify-center transition-all ${
                      isActive
                        ? 'border-2 border-amber-400 shadow-[0_0_14px_#f59e0b] ring-2 ring-amber-400/40'
                        : isHeroDead
                        ? 'border border-zinc-600 grayscale opacity-40 bg-zinc-900'
                        : isHeroRadiant
                        ? 'border-2 border-emerald-500 bg-emerald-950/60'
                        : 'border-2 border-rose-500 bg-rose-950/60'
                    }`}
                  >
                    {hero.avatar ? (
                      <img
                        src={getAssetUrl(hero.avatar)}
                        alt={hero.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    ) : (
                      <span className="text-xs font-bold text-white uppercase">
                        {hero.name.slice(0, 2)}
                      </span>
                    )}

                    {isHeroDead && (
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-xs">
                        💀
                      </div>
                    )}
                  </div>

                  {/* Active Indicator Arrow */}
                  {isActive && (
                    <div className="absolute -top-1.5 w-2 h-2 bg-amber-400 rotate-45 animate-pulse" />
                  )}

                  {/* Hero Short Name */}
                  <span className={`text-[9px] sm:text-[10px] font-sans font-bold max-w-[56px] truncate mt-0.5 ${
                    isActive ? 'text-amber-300' : 'text-slate-300'
                  }`}>
                    {hero.name.split(' ')[0]}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Quick Switch to Editor Button */}
          {onSwitchMode && (
            <>
              <div className="h-6 w-px bg-slate-700/70" />
              <button
                onClick={() => {
                  playClickSound();
                  onSwitchMode('EDITOR');
                }}
                className="px-2 sm:px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg text-[10px] sm:text-xs font-mono font-bold whitespace-nowrap transition cursor-pointer"
                title="Переключиться в Редактор Карты"
              >
                ✏️ Редактор
              </button>
            </>
          )}
        </div>
      </header>

      {/* ========================================================= */}
      {/* 2. FLOATING TOAST BAR (SHORT COMBAT LOGS)                 */}
      {/* ========================================================= */}
      {lastLog && (
        <div className="fixed top-18 sm:top-20 left-1/2 -translate-x-1/2 z-30 pointer-events-auto">
          <button
            onClick={() => setShowLogDrawer(!showLogDrawer)}
            className="bg-[#10141f]/90 hover:bg-[#151a28] backdrop-blur-md border border-slate-700/70 text-slate-200 text-xs font-mono px-4 py-1.5 rounded-full shadow-lg flex items-center gap-2 cursor-pointer transition hover:border-amber-500/50"
          >
            <History className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span className="truncate max-w-[280px] sm:max-w-md">{lastLog.text}</span>
          </button>
        </div>
      )}

      {/* ========================================================= */}
      {/* 3. BOTTOM COMMAND DECK (VITALS & ACTION BAR)              */}
      {/* ========================================================= */}
      <footer className="fixed bottom-3 left-1/2 -translate-x-1/2 z-40 w-[96vw] max-w-4xl">
        <div className="bg-[#121622]/95 backdrop-blur-2xl border border-slate-700/80 rounded-2xl p-3 sm:p-4 shadow-[0_8px_32px_rgba(0,0,0,0.85)] flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          
          {/* LEFT: VITALS SECTION */}
          <div className="flex items-center gap-3 min-w-[240px] sm:min-w-[290px]">
            {/* Active Hero Portrait */}
            <div className={`relative w-12 h-12 sm:w-14 sm:h-14 rounded-full overflow-hidden shrink-0 border-2 ${
              isRadiant ? 'border-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.4)]' : 'border-rose-500 shadow-[0_0_12px_rgba(244,63,94,0.4)]'
            }`}>
              <img
                src={getAssetUrl(activeHero.avatar)}
                alt={activeHero.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            </div>

            {/* Hero Name, Mini Stats & Dual Progress Bars */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <h2 className="text-sm sm:text-base font-black text-white truncate font-sans tracking-wide">
                  {activeHero.name}
                </h2>
                {/* Tactical Stats Pills */}
                <div className="flex items-center gap-2 text-[10px] font-mono text-slate-400">
                  <span title="Оставшиеся шаги">🦶 {turnActions.movement}/{activeHero.speed || 6}</span>
                  <span title="Броня">🛡️ {activeHero.armor ?? 5}</span>
                  <span title="Урон">⚔️ {activeHero.averageDamage ?? activeHero.damage ?? 50}</span>
                </div>
              </div>

              {/* Health Progress Bar */}
              <div className="mt-1">
                <div className="flex items-center justify-between text-[10px] font-mono font-bold text-emerald-400 mb-0.5">
                  <span>HP</span>
                  <span>{activeHero.hp} / {activeHero.maxHp}</span>
                </div>
                <div className="h-2 w-full bg-slate-900/90 rounded-full overflow-hidden border border-emerald-950">
                  <div
                    className="h-full bg-emerald-500 rounded-full transition-all duration-300 shadow-[0_0_8px_#10b981]"
                    style={{ width: `${hpPercent}%` }}
                  />
                </div>
              </div>

              {/* Mana Progress Bar */}
              <div className="mt-1">
                <div className="flex items-center justify-between text-[10px] font-mono font-bold text-sky-400 mb-0.5">
                  <span>MP</span>
                  <span>{activeHero.mana ?? 100} / {activeHero.maxMana ?? 100}</span>
                </div>
                <div className="h-1.5 w-full bg-slate-900/90 rounded-full overflow-hidden border border-sky-950">
                  <div
                    className="h-full bg-sky-500 rounded-full transition-all duration-300 shadow-[0_0_6px_#38bdf8]"
                    style={{ width: `${manaPercent}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="hidden md:block h-12 w-px bg-slate-700/60" />

          {/* CENTER & RIGHT: ACTION BAR */}
          <div className="flex items-center justify-between sm:justify-end gap-2 flex-wrap sm:flex-nowrap">
            {/* Button 1: [ 🦶 Ход ] */}
            <button
              onClick={handleToggleMove}
              className={`flex-1 sm:flex-initial min-h-[44px] px-3 sm:px-4 py-2 rounded-xl font-sans font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all cursor-pointer border ${
                actionMode === 'MOVE'
                  ? 'bg-cyan-950/80 text-[#00f0ff] border-[#00f0ff] shadow-[0_0_14px_rgba(0,240,255,0.45)]'
                  : 'bg-slate-800/90 hover:bg-slate-700 text-slate-200 border-slate-700'
              }`}
            >
              <Footprints className="w-4 h-4" />
              <span>Ход</span>
            </button>

            {/* Button 2: [ ⚔️ Удар ] */}
            <button
              onClick={handleToggleAttack}
              className={`flex-1 sm:flex-initial min-h-[44px] px-3 sm:px-4 py-2 rounded-xl font-sans font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all cursor-pointer border ${
                actionMode === 'ATTACK' || targetingMode?.mode === 'ATTACK'
                  ? 'bg-rose-950/80 text-[#ef4444] border-[#ef4444] shadow-[0_0_14px_rgba(239,68,68,0.45)]'
                  : 'bg-slate-800/90 hover:bg-slate-700 text-slate-200 border-slate-700'
              }`}
            >
              <Swords className="w-4 h-4" />
              <span>Удар</span>
            </button>

            {/* Button 3: [ 🔮 Скиллы ] */}
            <button
              onClick={() => {
                playClickSound();
                setShowShopDrawer(false);
                setShowSkillDrawer(!showSkillDrawer);
              }}
              className={`flex-1 sm:flex-initial min-h-[44px] px-3 sm:px-4 py-2 rounded-xl font-sans font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all cursor-pointer border ${
                showSkillDrawer
                  ? 'bg-purple-950/80 text-purple-300 border-purple-500 shadow-[0_0_14px_rgba(168,85,247,0.4)]'
                  : 'bg-slate-800/90 hover:bg-slate-700 text-slate-200 border-slate-700'
              }`}
            >
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span>Скиллы</span>
              {heroAbilities.length > 0 && (
                <span className="text-[10px] bg-purple-500/30 text-purple-300 px-1.5 py-0.5 rounded-full">
                  {heroAbilities.length}
                </span>
              )}
            </button>

            {/* Button 4: [ 🎒 Лавка ] */}
            <button
              onClick={() => {
                playClickSound();
                setShowSkillDrawer(false);
                setShowShopDrawer(!showShopDrawer);
              }}
              className={`flex-1 sm:flex-initial min-h-[44px] px-3 sm:px-4 py-2 rounded-xl font-sans font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all cursor-pointer border ${
                showShopDrawer
                  ? 'bg-amber-950/80 text-amber-300 border-amber-500 shadow-[0_0_14px_rgba(245,158,11,0.4)]'
                  : 'bg-slate-800/90 hover:bg-slate-700 text-slate-200 border-slate-700'
              }`}
            >
              <ShoppingBag className="w-4 h-4 text-amber-400" />
              <span>Лавка</span>
            </button>

            {/* Button 5: [ КОНЕЦ ХОДА ➔ ] */}
            <button
              onClick={handleEndTurn}
              className="flex-1 sm:flex-initial min-h-[44px] px-5 sm:px-6 py-2 rounded-xl font-sans font-black text-xs sm:text-sm tracking-wider uppercase bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 text-black shadow-[0_0_16px_rgba(245,158,11,0.5)] active:scale-95 transition flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap"
            >
              <span>Конец хода</span>
              <ArrowRight className="w-4 h-4 stroke-[3]" />
            </button>
          </div>
        </div>
      </footer>

      {/* ========================================================= */}
      {/* 4. SKILL DRAWER (SLIDE-UP ABILITIES LIST)                 */}
      {/* ========================================================= */}
      {showSkillDrawer && (
        <div className="fixed bottom-24 sm:bottom-28 left-1/2 -translate-x-1/2 w-[95vw] max-w-xl z-50 bg-[#121622]/98 backdrop-blur-2xl border border-slate-700/90 rounded-2xl p-4 shadow-2xl animate-in slide-in-from-bottom-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-400" />
              <h3 className="font-bold text-white text-sm sm:text-base font-sans">
                Способности — {activeHero.name}
              </h3>
            </div>
            <button
              onClick={() => setShowSkillDrawer(false)}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="mt-3 space-y-2.5 max-h-[50vh] overflow-y-auto pr-1">
            {heroAbilities.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-4">У этого героя нет доступных способностей.</p>
            ) : (
              heroAbilities.map((ability) => {
                const canAfford = (activeHero.mana || 0) >= (ability.manaCost || 0);

                return (
                  <div
                    key={ability.id}
                    className="p-3 bg-slate-900/80 hover:bg-slate-800/90 border border-slate-800 hover:border-purple-500/50 rounded-xl flex items-center justify-between gap-3 transition"
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-lg bg-purple-950/70 border border-purple-500/40 flex items-center justify-center text-lg shrink-0">
                        {ability.icon || '🌀'}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-white text-xs sm:text-sm font-sans truncate">
                            {ability.name}
                          </h4>
                          <span className="text-[10px] font-mono text-sky-400 bg-sky-950/60 px-1.5 py-0.2 rounded border border-sky-800">
                            💧 {ability.manaCost || 0} MP
                          </span>
                          <span className="text-[10px] font-mono text-amber-400 bg-amber-950/60 px-1.5 py-0.2 rounded border border-amber-800">
                            ⏳ {ability.cooldown || 0}s
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-300 mt-1 line-clamp-1 font-sans">
                          {ability.desc || ability.description || 'Наносит тактический урон и накладывает эффект.'}
                        </p>
                      </div>
                    </div>

                    <button
                      disabled={!canAfford}
                      onClick={() => handleCastAbility(ability)}
                      className={`min-h-[36px] px-3.5 py-1.5 rounded-lg text-xs font-bold shrink-0 transition cursor-pointer ${
                        canAfford
                          ? 'bg-purple-600 hover:bg-purple-500 text-white shadow-[0_0_10px_rgba(168,85,247,0.4)]'
                          : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                      }`}
                    >
                      {canAfford ? 'Применить' : 'Мало MP'}
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 5. SHOP DRAWER (TACTICAL ARTIFACTS LIST)                 */}
      {/* ========================================================= */}
      {showShopDrawer && (
        <div className="fixed bottom-24 sm:bottom-28 left-1/2 -translate-x-1/2 w-[95vw] max-w-xl z-50 bg-[#121622]/98 backdrop-blur-2xl border border-slate-700/90 rounded-2xl p-4 shadow-2xl animate-in slide-in-from-bottom-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-amber-400" />
              <h3 className="font-bold text-white text-sm sm:text-base font-sans">
                Лавка тактических артефактов
              </h3>
            </div>
            <button
              onClick={() => setShowShopDrawer(false)}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="mt-3 space-y-2.5 max-h-[50vh] overflow-y-auto pr-1">
            {Object.entries(ITEM_DEFINITIONS).map(([itemKey, item]) => (
              <div
                key={itemKey}
                className="p-3 bg-slate-900/80 hover:bg-slate-800/90 border border-slate-800 hover:border-amber-500/50 rounded-xl flex items-center justify-between gap-3 transition"
              >
                <div className="flex items-start gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-lg bg-amber-950/70 border border-amber-500/40 flex items-center justify-center text-lg shrink-0">
                    {item.icon || '🎒'}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-white text-xs sm:text-sm font-sans truncate">
                        {item.name}
                      </h4>
                      <span className="text-[10px] font-mono text-amber-400 bg-amber-950/60 px-1.5 py-0.2 rounded border border-amber-800">
                        🪙 {item.cost}g
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-300 mt-1 line-clamp-1 font-sans">
                      {item.desc || 'Мощный артефакт, дающий тактическое преимущество.'}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => handleUseItem(itemKey)}
                  className="min-h-[36px] px-3.5 py-1.5 rounded-lg text-xs font-bold bg-amber-500 hover:bg-amber-400 text-black shadow-[0_0_10px_rgba(245,158,11,0.4)] shrink-0 transition cursor-pointer"
                >
                  Купить
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 6. COMBAT LOG HISTORY POPUP                              */}
      {/* ========================================================= */}
      {showLogDrawer && (
        <div className="fixed top-28 left-1/2 -translate-x-1/2 w-[95vw] max-w-lg z-50 bg-[#121622]/98 backdrop-blur-2xl border border-slate-700/90 rounded-2xl p-4 shadow-2xl animate-in fade-in">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <h4 className="font-bold text-xs sm:text-sm text-slate-200 font-mono flex items-center gap-1.5">
              <History className="w-4 h-4 text-amber-400" />
              Журнал боя (последние события)
            </h4>
            <button
              onClick={() => setShowLogDrawer(false)}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="mt-2 space-y-1.5 max-h-48 overflow-y-auto text-xs font-mono text-slate-300">
            {combatLog.slice(-10).reverse().map((log, i) => (
              <div key={log.id || i} className="p-1.5 bg-slate-900/60 rounded border border-slate-800/60">
                {log.text}
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
