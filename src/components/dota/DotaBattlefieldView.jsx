import React, { useState, useEffect } from 'react';
import DotaTopBar from './DotaTopBar';
import DotaMap2D from './DotaMap2D';
import DotaHUD from './DotaHUD';
import { INITIAL_HERO_POSITIONS } from '../../data/dotaMapData';
import { INVOKER_SPELLS, resolveInvokerSpell } from '../../data/invokerSpells';
import { playClickSound, playSpellSound, playCritSound, playDiceSound } from '../../utils/sound';
import confetti from 'canvas-confetti';
import { 
  X, Dice5, RotateCcw, Sparkles, AlertTriangle, 
  ScrollText, Trash2, FastForward 
} from 'lucide-react';

export default function DotaBattlefieldView({ heroes }) {
  const [activeHeroId, setActiveHeroId] = useState('invoker');
  const [heroPositions, setHeroPositions] = useState(INITIAL_HERO_POSITIONS);
  const [activeTargetingSkill, setActiveTargetingSkill] = useState(null);
  
  // Runtime turn and clock state
  const [turn, setTurn] = useState(1);
  const [gameSeconds, setGameSeconds] = useState(72);
  const [radiantKills, setRadiantKills] = useState(4);
  const [direKills, setDireKills] = useState(2);

  // UI Drawers / Toggles
  const [showCombatLog, setShowCombatLog] = useState(true);
  const [showDice, setShowDice] = useState(false);
  const [centerTrigger, setCenterTrigger] = useState(0);

  // Tabletop Dice Roller State
  const [diceType, setDiceType] = useState(20);
  const [diceModifier, setDiceModifier] = useState(0);
  const [diceAdvantage, setDiceAdvantage] = useState('normal'); // 'normal' | 'adv' | 'dis'
  const [isRolling, setIsRolling] = useState(false);
  const [lastDiceResult, setLastDiceResult] = useState(null);

  // Skill levels per hero
  const [skillLevels, setSkillLevels] = useState({
    axe: { 0: 1, 1: 1, 2: 1, 3: 1 },
    pudge: { 0: 1, 1: 1, 2: 1, 3: 1 },
    monesy: { 0: 1, 1: 1, 2: 1, 3: 1 },
    wesker: { 0: 1, 1: 1, 2: 1, 3: 1 },
    minos: { 0: 1, 1: 1, 2: 1, 3: 1 },
    shadow_fiend: { 0: 1, 1: 1, 2: 1, 3: 1 },
    rubick: { 0: 1, 1: 1, 2: 1, 3: 1 },
    invoker: { 0: 1, 1: 1, 2: 1, 3: 1, 4: 1, 5: 1 },
    gojo: { 0: 1, 1: 1, 2: 1, 3: 1, 4: 1 },
    sukuna: { 0: 1, 1: 1, 2: 1, 3: 1, 4: 1 },
  });

  // Cooldowns
  const [cooldowns, setCooldowns] = useState({});

  // Invoker Specific State: 3 active orbs & 2 invoked spell slots
  const [invokerOrbs, setInvokerOrbs] = useState(['E', 'E', 'E']);
  const [invokedSpells, setInvokedSpells] = useState([
    INVOKER_SPELLS['EEE'], // Slot D (Sun Strike)
    INVOKER_SPELLS['EEW'], // Slot F (Chaos Meteor)
  ]);

  // Combat Feed
  const [combatEvents, setCombatEvents] = useState([
    '⚔️ Матч начался! 8 секунд = 1 ход. Герои вышли на боевые позиции.',
    '🔮 Инвокер синтезирует 10 комбинаций заклинаний через Quas, Wex, Exort.',
    '🌌 Сатору Годжо и Рёмен Сукуна сошлись в противостоянии!',
    '💡 Используйте колесико мыши для масштаба, зажмите ЛКМ для перемещения карты.'
  ]);

  const activeHero = heroes.find(h => h.id === activeHeroId) || heroes[0];

  const addCombatEvent = (text) => {
    setCombatEvents(prev => [text, ...prev.slice(0, 50)]);
  };

  const handleNextTurn = () => {
    setTurn(t => t + 1);
    setGameSeconds(s => s + 8);

    // Tick cooldowns down by 8 seconds
    setCooldowns(prev => {
      const next = {};
      for (const k in prev) {
        if (prev[k] > 8) next[k] = prev[k] - 8;
      }
      return next;
    });

    // Slight natural regeneration
    setHeroPositions(prev => prev.map(p => ({
      ...p,
      hpRatio: Math.min(1, (p.hpRatio || 1) + 0.05),
      manaRatio: Math.min(1, (p.manaRatio || 1) + 0.1)
    })));

    addCombatEvent(`⏱️ Раунд завершен (+8 сек). Регенерация ХП и маны героев.`);
  };

  const handleActivateSkill = (skill, skillIndex) => {
    setActiveTargetingSkill(skill);
    addCombatEvent(`🎯 Выбрана способность «${skill.name}». Кликните на цель или клетку на карте.`);
  };

  const handleActivateItem = (item) => {
    if (item.id === 'blink_dagger') {
      setActiveTargetingSkill({
        id: 'blink_dagger',
        name: 'Blink Dagger',
        range: 10
      });
      addCombatEvent(`⚡ Выбран Blink Dagger. Укажите клетку для мгновенной телепортации (до 10 кл).`);
    } else {
      addCombatEvent(`🛡️ Активирован предмет: ${item.name}!`);
    }
  };

  const handleLevelUpSkill = (skillIndex) => {
    setSkillLevels(prev => {
      const heroLvl = prev[activeHeroId] || { 0: 1, 1: 1, 2: 1, 3: 1 };
      const current = heroLvl[skillIndex] || 1;
      return {
        ...prev,
        [activeHeroId]: {
          ...heroLvl,
          [skillIndex]: Math.min(4, current + 1)
        }
      };
    });
    addCombatEvent(`⭐ Способность улучшена до уровня ${(skillLevels[activeHeroId]?.[skillIndex] || 1) + 1}!`);
  };

  // Invoker: Add sphere ('Q' | 'W' | 'E')
  const handleAddInvokerOrb = (orbKey) => {
    playSpellSound();
    setInvokerOrbs(prev => [prev[1], prev[2], orbKey]);
    const orbNames = { Q: 'Quas (Лед)', W: 'Wex (Молния)', E: 'Exort (Огонь)' };
    addCombatEvent(`🔮 Инвокер призвал сферу ${orbNames[orbKey] || orbKey}.`);
  };

  // Invoker: Invoke current 3 orbs into spell
  const handleInvoke = () => {
    const resolved = resolveInvokerSpell(invokerOrbs);
    if (!resolved) return;
    
    if (invokedSpells[0]?.id === resolved.id) {
      addCombatEvent(`🔮 «${resolved.name}» (${resolved.combo}) уже в основном слоте [D]!`);
      return;
    }

    playCritSound();
    setInvokedSpells(prev => [resolved, prev[0]]);
    addCombatEvent(`✨ ИНВОКЕР СИНТЕЗИРОВАЛ: «${resolved.name}» [${resolved.combo}]!`);
  };

  // Invoker: Directly pick recipe from cheat book
  const handleQuickInvokeRecipe = (comboKey) => {
    const spell = INVOKER_SPELLS[comboKey];
    if (!spell) return;
    const orbs = comboKey.split('');
    setInvokerOrbs(orbs);
    setInvokedSpells(prev => [spell, prev[0]]);
    playCritSound();
    addCombatEvent(`📖 Синтезировано из Книги Заклинаний: «${spell.name}» [${comboKey}]!`);
  };

  // Minimap Click -> snap camera
  const handleMinimapClick = ({ r, c }) => {
    // If hero is near clicked cell, select that hero
    const nearHero = heroPositions.find(p => Math.abs(p.r - r) <= 2 && Math.abs(p.c - c) <= 2);
    if (nearHero) {
      setActiveHeroId(nearHero.heroId);
    }
    setCenterTrigger(ct => ct + 1);
  };

  // Roll D20 / Tabletop Dice
  const handleRollDice = (sides = diceType) => {
    setIsRolling(true);
    playDiceSound();

    setTimeout(() => {
      let r1 = Math.floor(Math.random() * sides) + 1;
      let r2 = Math.floor(Math.random() * sides) + 1;
      let chosen = r1;

      if (sides === 20 && diceAdvantage === 'adv') {
        chosen = Math.max(r1, r2);
      } else if (sides === 20 && diceAdvantage === 'dis') {
        chosen = Math.min(r1, r2);
      }

      const total = chosen + diceModifier;
      const isNat20 = sides === 20 && chosen === 20;
      const isNat1 = sides === 20 && chosen === 1;

      setLastDiceResult({
        sides,
        rolls: sides === 20 && diceAdvantage !== 'normal' ? [r1, r2] : [chosen],
        chosen,
        modifier: diceModifier,
        total,
        isNat20,
        isNat1
      });

      if (isNat20) {
        playCritSound();
        confetti({ particleCount: 70, spread: 80 });
        addCombatEvent(`🎲 ${activeHero.name} бросил d${sides}: НАТУРАЛЬНАЯ 20! КРИТИЧЕСКИЙ УСПЕХ! Итог: ${total}`, 'crit');
      } else if (isNat1) {
        addCombatEvent(`🎲 ${activeHero.name} бросил d${sides}: НАТУРАЛЬНАЯ 1! КРИТИЧЕСКИЙ ПРОВАЛ!`);
      } else {
        addCombatEvent(`🎲 ${activeHero.name} бросил d${sides}: выпало ${chosen}${diceModifier ? ` (${diceModifier > 0 ? '+' : ''}${diceModifier}) = ${total}` : ''}`);
      }

      setIsRolling(false);
    }, 400);
  };

  // Format time mm:ss
  const formatTime = (secs) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName)) return;

      const key = e.key.toUpperCase();

      if (e.key === 'Escape') {
        setActiveTargetingSkill(null);
        return;
      }

      if (e.key === ' ' || e.code === 'Space') {
        e.preventDefault();
        handleNextTurn();
        return;
      }

      if (activeHeroId === 'invoker') {
        if (key === 'Q') handleAddInvokerOrb('Q');
        else if (key === 'W') handleAddInvokerOrb('W');
        else if (key === 'E') handleAddInvokerOrb('E');
        else if (key === 'R') handleInvoke();
        else if (key === 'D' && invokedSpells[0]) handleActivateSkill(invokedSpells[0], 'd');
        else if (key === 'F' && invokedSpells[1]) handleActivateSkill(invokedSpells[1], 'f');
      } else {
        const keyMap = { 'Q': 0, 'W': 1, 'E': 2, 'R': activeHero.skills.length - 1 };
        if (keyMap[key] !== undefined && activeHero.skills[keyMap[key]]) {
          handleActivateSkill(activeHero.skills[keyMap[key]], keyMap[key]);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeHeroId, invokerOrbs, invokedSpells, activeHero]);

  return (
    <div className="w-screen h-screen flex flex-col bg-[#07090e] overflow-hidden select-none relative">
      
      {/* 1. DOTA TOP BAR */}
      <DotaTopBar
        heroes={heroes}
        activeHeroId={activeHeroId}
        onSelectHero={setActiveHeroId}
        heroPositions={heroPositions}
        radiantKills={radiantKills}
        direKills={direKills}
        gameTime={formatTime(gameSeconds)}
        turn={turn}
        isDay={turn % 4 <= 2}
        onNextTurn={handleNextTurn}
        onToggleDice={() => setShowDice(!showDice)}
        showDice={showDice}
        onToggleCombatLog={() => setShowCombatLog(!showCombatLog)}
        showCombatLog={showCombatLog}
        onCenterCamera={() => setCenterTrigger(ct => ct + 1)}
      />

      {/* 2. CENTER: FULL BATTLEFIELD CANVAS + DRAWERS */}
      <div className="flex-1 relative overflow-hidden flex">
        
        {/* Full Interactive 2D Map Canvas */}
        <div className="w-full h-full relative">
          <DotaMap2D
            heroes={heroes}
            activeHeroId={activeHeroId}
            onSelectHero={setActiveHeroId}
            heroPositions={heroPositions}
            setHeroPositions={setHeroPositions}
            activeTargetingSkill={activeTargetingSkill}
            onCompleteSkillTargeting={() => setActiveTargetingSkill(null)}
            turn={turn}
            onNextTurn={handleNextTurn}
            combatEvents={combatEvents}
            addCombatEvent={addCombatEvent}
            centerTrigger={centerTrigger}
          />
        </div>

        {/* FLOATING COLLAPSIBLE COMBAT FEED (Right Drawer) */}
        {showCombatLog && (
          <aside className="absolute top-3 right-3 bottom-3 w-80 sm:w-96 bg-[#0a0e16]/95 backdrop-blur-md border border-[#202738] rounded-2xl shadow-2xl flex flex-col z-30 overflow-hidden">
            {/* Drawer Header */}
            <div className="px-4 py-2.5 bg-[#0e131d] border-b border-[#202738] flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-mono font-bold text-amber-400">
                <ScrollText className="w-4 h-4 text-amber-400" />
                <span>ЖУРНАЛ БОЯ & ХОДОВ</span>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setCombatEvents([])}
                  className="p-1 text-slate-400 hover:text-rose-400 rounded transition-colors cursor-pointer"
                  title="Очистить журнал"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setShowCombatLog(false)}
                  className="p-1 text-slate-400 hover:text-white rounded transition-colors cursor-pointer"
                  title="Закрыть панель"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Event List */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2 text-xs font-mono pr-2">
              {combatEvents.map((evt, idx) => (
                <div 
                  key={idx} 
                  className={`p-2.5 rounded-xl border leading-snug transition-all ${
                    evt.includes('КРИТ') || evt.includes('HOLLOW') || evt.includes('CULLING')
                      ? 'bg-amber-950/40 border-amber-500/50 text-amber-200'
                      : evt.includes('Урон') || evt.includes('рассек') || evt.includes('HP')
                      ? 'bg-rose-950/30 border-rose-800/40 text-rose-200'
                      : evt.includes('Раунд') || evt.includes('переместился')
                      ? 'bg-[#121722] border-slate-800 text-slate-300'
                      : 'bg-[#10141e] border-slate-800/80 text-slate-300'
                  }`}
                >
                  {evt}
                </div>
              ))}
            </div>

            {/* Drawer Footer Status */}
            <div className="p-3 bg-[#0a0d13] border-t border-[#202738] text-[11px] font-mono text-slate-400 flex items-center justify-between">
              <span>Система: <strong>8с = 1 ход</strong></span>
              <span className="text-amber-400">Пробел = Ход</span>
            </div>
          </aside>
        )}

        {/* FLOATING TABLETOP D20 DICE DRAWER */}
        {showDice && (
          <div className="absolute top-14 left-4 z-40 w-80 bg-[#0d121c]/95 backdrop-blur-md border border-amber-500/40 rounded-2xl shadow-2xl p-4 flex flex-col gap-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="flex items-center gap-2 font-fantasy font-bold text-amber-300 text-sm">
                <Dice5 className="w-4 h-4 text-amber-400" />
                <span>D&D ДАЙС-РОЛЛЕР</span>
              </div>
              <button 
                onClick={() => setShowDice(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Dice Types */}
            <div className="flex items-center justify-between gap-1">
              {[20, 100, 12, 10, 8, 6, 4].map(s => (
                <button
                  key={s}
                  onClick={() => { playClickSound(); setDiceType(s); }}
                  className={`flex-1 py-1 rounded font-mono text-xs font-bold transition-all cursor-pointer ${
                    diceType === s ? 'bg-amber-500 text-black shadow' : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  d{s}
                </button>
              ))}
            </div>

            {/* Advantage & Modifier */}
            {diceType === 20 && (
              <div className="flex items-center justify-between gap-1 text-[11px] font-mono">
                <button
                  onClick={() => setDiceAdvantage('normal')}
                  className={`flex-1 py-1 rounded cursor-pointer ${diceAdvantage === 'normal' ? 'bg-slate-700 text-white' : 'bg-slate-900 text-slate-400'}`}
                >
                  Обычно
                </button>
                <button
                  onClick={() => setDiceAdvantage('adv')}
                  className={`flex-1 py-1 rounded cursor-pointer ${diceAdvantage === 'adv' ? 'bg-emerald-600 text-white' : 'bg-slate-900 text-slate-400'}`}
                >
                  Преимущ.
                </button>
                <button
                  onClick={() => setDiceAdvantage('dis')}
                  className={`flex-1 py-1 rounded cursor-pointer ${diceAdvantage === 'dis' ? 'bg-rose-700 text-white' : 'bg-slate-900 text-slate-400'}`}
                >
                  Помеха
                </button>
              </div>
            )}

            {/* Modifiers (+0, +1, +2, +3, +4, +5) */}
            <div className="flex items-center justify-between gap-1 font-mono text-xs">
              <span className="text-[10px] text-slate-400">Модификатор:</span>
              <div className="flex items-center gap-1">
                {[-2, 0, 1, 2, 3, 5].map(m => (
                  <button
                    key={m}
                    onClick={() => setDiceModifier(m)}
                    className={`px-1.5 py-0.5 rounded cursor-pointer ${diceModifier === m ? 'bg-amber-500 text-black font-bold' : 'bg-slate-800 text-slate-300'}`}
                  >
                    {m > 0 ? `+${m}` : m}
                  </button>
                ))}
              </div>
            </div>

            {/* Big Roll Button */}
            <button
              onClick={() => handleRollDice(diceType)}
              disabled={isRolling}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-600 via-amber-500 to-yellow-500 hover:from-amber-500 hover:to-yellow-400 text-black font-bold text-sm shadow-xl shadow-amber-500/30 transition-all cursor-pointer active:scale-95 disabled:opacity-50"
            >
              {isRolling ? 'Бросаем кубик...' : `Бросить d${diceType}!`}
            </button>

            {/* Result Display */}
            {lastDiceResult && (
              <div className={`p-3 rounded-xl border text-center font-mono ${
                lastDiceResult.isNat20
                  ? 'bg-amber-950/60 border-amber-400 text-amber-200 shadow-lg shadow-amber-400/20'
                  : lastDiceResult.isNat1
                  ? 'bg-red-950/60 border-red-500 text-red-200'
                  : 'bg-[#121620] border-slate-700 text-white'
              }`}>
                <div className="text-2xl font-black">{lastDiceResult.total}</div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  Бросок: {lastDiceResult.rolls.join(', ')} 
                  {lastDiceResult.modifier ? ` (${lastDiceResult.modifier > 0 ? '+' : ''}${lastDiceResult.modifier})` : ''}
                </div>
                {lastDiceResult.isNat20 && (
                  <div className="text-xs font-bold text-amber-400 mt-1 flex items-center justify-center gap-1">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>НАТУРАЛЬНАЯ 20! КРИТ!</span>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

      </div>

      {/* 3. DOTA BOTTOM HUD */}
      <DotaHUD
        hero={activeHero}
        allHeroes={heroes}
        heroPositions={heroPositions}
        onSelectHero={setActiveHeroId}
        onActivateSkill={handleActivateSkill}
        onActivateItem={handleActivateItem}
        onLevelUpSkill={handleLevelUpSkill}
        skillLevels={skillLevels[activeHeroId] || { 0: 1, 1: 1, 2: 1, 3: 1 }}
        cooldowns={cooldowns}
        activeTargetingSkill={activeTargetingSkill}
        onCancelTargeting={() => setActiveTargetingSkill(null)}
        // Invoker props
        invokerOrbs={invokerOrbs}
        onAddInvokerOrb={handleAddInvokerOrb}
        invokedSpells={invokedSpells}
        onInvoke={handleInvoke}
        onQuickInvokeRecipe={handleQuickInvokeRecipe}
        onMinimapClick={handleMinimapClick}
      />

    </div>
  );
}
