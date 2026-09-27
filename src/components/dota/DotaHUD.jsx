import React, { useState } from 'react';
import { 
  Shield, Swords, Footprints, Heart, Zap, Sparkles, 
  Plus, Clock, Target, AlertCircle, Compass, BookOpen, 
  Flame, Snowflake, CloudLightning, Eye, ZapOff 
} from 'lucide-react';
import DotaMinimap from './DotaMinimap';
import DotaInventory from './DotaInventory';
import { INVOKER_SPELLS } from '../../data/invokerSpells';
import { playClickSound, playSpellSound, playCritSound } from '../../utils/sound';

export default function DotaHUD({
  hero,
  allHeroes,
  heroPositions,
  onSelectHero,
  onActivateSkill,
  onActivateItem,
  onLevelUpSkill,
  skillLevels = { 0: 1, 1: 1, 2: 1, 3: 1 },
  cooldowns = {},
  runtimeHp,
  runtimeMana,
  activeTargetingSkill,
  onCancelTargeting,
  // Invoker specific props
  invokerOrbs = ['E', 'E', 'E'],
  onAddInvokerOrb,
  invokedSpells = [],
  onInvoke,
  onQuickInvokeRecipe,
  onMinimapClick
}) {
  const [showTalents, setShowTalents] = useState(false);
  const [showSpellbook, setShowSpellbook] = useState(false);

  if (!hero) return null;

  const currentHp = runtimeHp !== undefined ? runtimeHp : hero.stats.hp;
  const maxHp = hero.stats.hp;
  const currentMana = runtimeMana !== undefined ? runtimeMana : (typeof hero.stats.mana === 'number' ? hero.stats.mana : 100);
  const maxMana = typeof hero.stats.mana === 'number' ? hero.stats.mana : 100;

  // Attributes based on hero class
  const isStrength = hero.id === 'axe' || hero.id === 'pudge' || hero.id === 'sukuna';
  const isAgility = hero.id === 'monesy' || hero.id === 'wesker' || hero.id === 'shadow_fiend';
  const isIntelligence = hero.id === 'minos' || hero.id === 'rubick' || hero.id === 'invoker' || hero.id === 'gojo';

  const isInvoker = hero.id === 'invoker';

  // Orb helper styling
  const getOrbInfo = (orbKey) => {
    switch (orbKey) {
      case 'Q':
        return { name: 'Quas', color: '#38bdf8', bg: 'bg-sky-500', glow: 'shadow-sky-400/80', icon: '❄️', desc: '+Реген ХП' };
      case 'W':
        return { name: 'Wex', color: '#c084fc', bg: 'bg-purple-500', glow: 'shadow-purple-400/80', icon: '⚡', desc: '+Скорость/Меткость' };
      case 'E':
      default:
        return { name: 'Exort', color: '#f97316', bg: 'bg-orange-500', glow: 'shadow-orange-400/80', icon: '🔥', desc: '+Урон атак/магии' };
    }
  };

  return (
    <div className="w-full bg-gradient-to-t from-[#06080d] via-[#0b0e14] to-[#111722] border-t-2 border-[#2b3548] shadow-2xl select-none relative z-30">
      
      {/* Active Targeting Banner */}
      {activeTargetingSkill && (
        <div className="bg-amber-500/20 border-b border-amber-500/50 py-1 px-4 text-center flex items-center justify-center gap-3 text-xs text-amber-300 font-mono animate-pulse">
          <Target className="w-4 h-4 text-amber-400" />
          <span>РЕЖИМ ПРИЦЕЛИВАНИЯ: Выберите цель или клетку на 2D карте для «{activeTargetingSkill.name}»!</span>
          <button 
            onClick={onCancelTargeting}
            className="px-2 py-0.5 rounded bg-black/60 hover:bg-black/90 text-[10px] text-white border border-white/20 cursor-pointer"
          >
            Отмена (ESC)
          </button>
        </div>
      )}

      {/* Main HUD Container */}
      <div className="max-w-[1600px] mx-auto flex items-end justify-between px-1 sm:px-4 py-1.5 gap-2 overflow-x-auto">
        
        {/* 1. Minimap (Bottom-Left) */}
        <div className="flex-shrink-0">
          <DotaMinimap 
            heroes={allHeroes}
            heroPositions={heroPositions}
            activeHeroId={hero.id}
            onSelectHero={onSelectHero}
            onMinimapClick={onMinimapClick}
          />
        </div>

        {/* 2. Hero Portrait & Attributes Panel */}
        <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0 bg-[#0e121a] p-2 rounded-t-lg border-t border-x border-[#2b3548]">
          
          {/* Portrait Frame */}
          <div className="relative">
            <div className="w-16 h-20 sm:w-20 sm:h-24 bg-black rounded border-2 border-[#475569] overflow-hidden shadow-2xl relative">
              <img 
                src={hero.avatar} 
                alt={hero.name} 
                className="w-full h-full object-cover object-top hover:scale-105 transition-transform"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />
              <div className="absolute bottom-1 left-1 right-1 text-[10px] font-bold text-center text-white truncate font-fantasy">
                {hero.name}
              </div>
            </div>

            {/* Hero Level Badge */}
            <div className="absolute -bottom-2 -left-2 w-6 h-6 rounded-full bg-emerald-700 text-emerald-100 font-bold border-2 border-emerald-400 text-xs flex items-center justify-center shadow-lg font-stat">
              {skillLevels[0] || 1}
            </div>
          </div>

          {/* Core Stats */}
          <div className="flex flex-col justify-between h-20 sm:h-24 text-xs font-stat py-0.5 min-w-[70px]">
            {/* Attack Damage */}
            <div className="flex items-center gap-1.5 text-slate-200" title="Базовый урон атаки">
              <Swords className="w-3.5 h-3.5 text-rose-500" />
              <span className="font-bold">{hero.stats.damage || hero.stats.melee?.damage || 50}</span>
            </div>

            {/* Armor */}
            <div className="flex items-center gap-1.5 text-slate-200" title="Физическая броня">
              <Shield className="w-3.5 h-3.5 text-purple-400" />
              <span className="font-bold">{hero.stats.armor}</span>
            </div>

            {/* Movement Speed */}
            <div className="flex items-center gap-1.5 text-slate-200" title="Скорость перемещения (клеток за ход)">
              <Footprints className="w-3.5 h-3.5 text-amber-400" />
              <span className="font-bold">{hero.stats.speed}</span>
            </div>

            {/* Attributes Circle Indicators */}
            <div className="flex items-center gap-1 pt-1 border-t border-slate-800 text-[10px] font-mono">
              <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center font-bold ${
                isStrength ? 'bg-red-600 text-white ring-1 ring-red-300' : 'bg-red-950 text-red-400 opacity-60'
              }`} title="Сила (Strength)">S</span>
              <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center font-bold ${
                isAgility ? 'bg-emerald-600 text-white ring-1 ring-emerald-300' : 'bg-emerald-950 text-emerald-400 opacity-60'
              }`} title="Ловкость (Agility)">A</span>
              <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center font-bold ${
                isIntelligence ? 'bg-blue-600 text-white ring-1 ring-blue-300' : 'bg-blue-950 text-blue-400 opacity-60'
              }`} title="Интеллект / Проклятая Энергия (Intelligence)">I</span>
            </div>
          </div>

          {/* Side Buttons: Talent Tree & Invoker Spellbook */}
          <div className="flex flex-col gap-1.5">
            <div 
              onClick={() => { playClickSound(); setShowTalents(!showTalents); }}
              className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full border-2 cursor-pointer flex items-center justify-center transition-all ${
                showTalents 
                  ? 'bg-amber-500 border-yellow-200 text-black shadow-lg shadow-amber-500/50' 
                  : 'bg-[#18202d] border-[#475569] hover:border-amber-400 text-amber-400'
              }`}
              title="Дерево Талантов"
            >
              <Sparkles className="w-4 h-4" />
            </div>

            {isInvoker && (
              <div 
                onClick={() => { playClickSound(); setShowSpellbook(!showSpellbook); }}
                className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full border-2 cursor-pointer flex items-center justify-center transition-all ${
                  showSpellbook 
                    ? 'bg-purple-600 border-purple-300 text-white shadow-lg shadow-purple-500/50' 
                    : 'bg-[#18202d] border-[#475569] hover:border-purple-400 text-purple-300'
                }`}
                title="Книга Заклинаний Инвокера (Все 10 комбинаций)"
              >
                <BookOpen className="w-4 h-4" />
              </div>
            )}
          </div>

        </div>

        {/* 3. Center: HP / Mana Bars & Abilities Row */}
        <div className="flex-1 max-w-2xl flex flex-col gap-1.5 px-2">
          
          {/* Health Bar (Segmented Green Bar) */}
          <div className="relative w-full h-6 sm:h-7 bg-[#0f141d] rounded-xs border border-[#1e2533] overflow-hidden shadow-inner">
            <div 
              className="h-full bg-gradient-to-r from-emerald-600 via-green-500 to-emerald-400 transition-all duration-300"
              style={{ width: `${Math.min(100, (currentHp / maxHp) * 100)}%` }}
            />
            <div className="absolute inset-0 flex items-center justify-between px-3 text-xs font-stat font-bold text-white tracking-wider pointer-events-none drop-shadow">
              <span>{currentHp} / {maxHp}</span>
              <span className="text-[10px] text-emerald-200 font-mono">{hero.stats.hpRegen}</span>
            </div>
          </div>

          {/* Mana / Cursed Energy Bar */}
          <div className="relative w-full h-5 sm:h-6 bg-[#0f141d] rounded-xs border border-[#1e2533] overflow-hidden shadow-inner">
            <div 
              className={`h-full bg-gradient-to-r transition-all duration-300 ${
                hero.universe === 'Jujutsu Kaisen'
                  ? 'from-indigo-700 via-blue-600 to-cyan-400' 
                  : 'from-blue-700 via-blue-500 to-cyan-400'
              }`}
              style={{ width: `${Math.min(100, (currentMana / maxMana) * 100)}%` }}
            />
            <div className="absolute inset-0 flex items-center justify-between px-3 text-xs font-stat font-bold text-white tracking-wider pointer-events-none drop-shadow">
              <span>{currentMana} / {maxMana} {hero.universe === 'Jujutsu Kaisen' ? 'ПЭ' : 'МАНА'}</span>
              <span className="text-[10px] text-blue-200 font-mono">{hero.stats.manaRegen}</span>
            </div>
          </div>

          {/* INVOKER ORB ROW (Quas / Wex / Exort active queue) */}
          {isInvoker && (
            <div className="flex items-center justify-center gap-3 pt-0.5">
              <div className="flex items-center gap-2 bg-[#090c13]/90 px-3 py-1 rounded-full border border-slate-700/60 shadow-inner">
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Сферы:</span>
                <div className="flex items-center gap-2">
                  {invokerOrbs.map((orb, oIdx) => {
                    const info = getOrbInfo(orb);
                    return (
                      <div 
                        key={oIdx}
                        className={`w-6 h-6 rounded-full ${info.bg} flex items-center justify-center text-xs font-black shadow-md ${info.glow} ring-1 ring-white/40 transition-transform hover:scale-125 cursor-pointer`}
                        title={`${info.name} (${info.desc})`}
                        onClick={() => onAddInvokerOrb && onAddInvokerOrb(orb)}
                      >
                        <span className="text-black text-[10px] drop-shadow">{orb}</span>
                      </div>
                    );
                  })}
                </div>
                
                {/* Current Combination helper tag */}
                <div className="text-[10px] font-mono font-bold text-amber-300 pl-1 border-l border-slate-700">
                  {INVOKER_SPELLS[[...invokerOrbs].sort().join('')]?.name || 'Синтез'}
                </div>
              </div>
            </div>
          )}

          {/* ABILITIES ROW */}
          <div className="flex items-center justify-center gap-1.5 sm:gap-2.5 pt-0.5">
            
            {/* --- CASE A: INVOKER (Q: Quas, W: Wex, E: Exort, D: Spell1, F: Spell2, R: Invoke) --- */}
            {isInvoker ? (
              <>
                {/* 1. Quas (Q) */}
                <div className="flex flex-col items-center group relative">
                  <div className="h-4 flex items-center justify-center mb-0.5">
                    <button
                      onClick={() => onLevelUpSkill && onLevelUpSkill(0)}
                      className="w-3.5 h-3.5 rounded-full bg-sky-500 hover:bg-sky-400 text-black flex items-center justify-center text-[9px] font-black cursor-pointer shadow"
                      title="Прокачать Quas (+1 к регену ХП)"
                    >
                      <Plus className="w-2.5 h-2.5 stroke-[3]" />
                    </button>
                  </div>
                  <div
                    onClick={() => onAddInvokerOrb && onAddInvokerOrb('Q')}
                    className="w-11 h-11 sm:w-13 sm:h-13 bg-gradient-to-br from-sky-950 to-slate-900 rounded-sm relative border-2 border-sky-400/80 hover:border-sky-300 flex items-center justify-center cursor-pointer shadow-lg transition-transform hover:scale-105"
                  >
                    <span className="text-xl">❄️</span>
                    <span className="absolute top-0.5 left-0.5 bg-black/80 px-1 rounded-xs text-[9px] font-mono font-bold text-sky-300">Q</span>
                    <span className="absolute bottom-0 text-[8px] font-mono text-sky-200">Quas</span>
                  </div>
                </div>

                {/* 2. Wex (W) */}
                <div className="flex flex-col items-center group relative">
                  <div className="h-4 flex items-center justify-center mb-0.5">
                    <button
                      onClick={() => onLevelUpSkill && onLevelUpSkill(1)}
                      className="w-3.5 h-3.5 rounded-full bg-purple-500 hover:bg-purple-400 text-black flex items-center justify-center text-[9px] font-black cursor-pointer shadow"
                      title="Прокачать Wex (+1 к скорости перемещения)"
                    >
                      <Plus className="w-2.5 h-2.5 stroke-[3]" />
                    </button>
                  </div>
                  <div
                    onClick={() => onAddInvokerOrb && onAddInvokerOrb('W')}
                    className="w-11 h-11 sm:w-13 sm:h-13 bg-gradient-to-br from-purple-950 to-slate-900 rounded-sm relative border-2 border-purple-400/80 hover:border-purple-300 flex items-center justify-center cursor-pointer shadow-lg transition-transform hover:scale-105"
                  >
                    <span className="text-xl">⚡</span>
                    <span className="absolute top-0.5 left-0.5 bg-black/80 px-1 rounded-xs text-[9px] font-mono font-bold text-purple-300">W</span>
                    <span className="absolute bottom-0 text-[8px] font-mono text-purple-200">Wex</span>
                  </div>
                </div>

                {/* 3. Exort (E) */}
                <div className="flex flex-col items-center group relative">
                  <div className="h-4 flex items-center justify-center mb-0.5">
                    <button
                      onClick={() => onLevelUpSkill && onLevelUpSkill(2)}
                      className="w-3.5 h-3.5 rounded-full bg-orange-500 hover:bg-orange-400 text-black flex items-center justify-center text-[9px] font-black cursor-pointer shadow"
                      title="Прокачать Exort (+5 к урону)"
                    >
                      <Plus className="w-2.5 h-2.5 stroke-[3]" />
                    </button>
                  </div>
                  <div
                    onClick={() => onAddInvokerOrb && onAddInvokerOrb('E')}
                    className="w-11 h-11 sm:w-13 sm:h-13 bg-gradient-to-br from-orange-950 to-slate-900 rounded-sm relative border-2 border-orange-500/80 hover:border-orange-400 flex items-center justify-center cursor-pointer shadow-lg transition-transform hover:scale-105"
                  >
                    <span className="text-xl">🔥</span>
                    <span className="absolute top-0.5 left-0.5 bg-black/80 px-1 rounded-xs text-[9px] font-mono font-bold text-orange-300">E</span>
                    <span className="absolute bottom-0 text-[8px] font-mono text-orange-200">Exort</span>
                  </div>
                </div>

                {/* 4. Invoked Spell 1 (Slot D) */}
                {invokedSpells[0] && (
                  <div className="flex flex-col items-center group relative">
                    <div className="h-4 flex items-center justify-center mb-0.5">
                      <span className="text-[9px] font-mono text-amber-400 font-bold">[{invokedSpells[0].combo}]</span>
                    </div>
                    <div
                      onClick={() => {
                        playClickSound();
                        onActivateSkill && onActivateSkill(invokedSpells[0], 'd');
                      }}
                      className={`w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-[#1e2638] to-[#0f1420] rounded-sm relative border-2 cursor-pointer flex flex-col items-center justify-center p-1 text-center transition-all ${
                        activeTargetingSkill?.id === invokedSpells[0].id
                          ? 'border-yellow-300 ring-2 ring-yellow-400 shadow-lg scale-105'
                          : 'border-amber-400 hover:border-amber-200 shadow-md'
                      }`}
                    >
                      <span className="text-[10px] font-bold text-white line-clamp-2 leading-tight">
                        {invokedSpells[0].name}
                      </span>
                      <span className="absolute top-0.5 left-0.5 bg-black/80 px-1 rounded-xs text-[9px] font-mono font-bold text-white">D</span>
                      <span className="absolute bottom-0 right-0 bg-[#0f2e54]/90 px-1 text-[8px] font-mono text-cyan-300">{invokedSpells[0].manaCost}</span>
                    </div>
                  </div>
                )}

                {/* 5. Invoked Spell 2 (Slot F) */}
                {invokedSpells[1] && (
                  <div className="flex flex-col items-center group relative">
                    <div className="h-4 flex items-center justify-center mb-0.5">
                      <span className="text-[9px] font-mono text-slate-400 font-bold">[{invokedSpells[1].combo}]</span>
                    </div>
                    <div
                      onClick={() => {
                        playClickSound();
                        onActivateSkill && onActivateSkill(invokedSpells[1], 'f');
                      }}
                      className={`w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-[#1e2638] to-[#0f1420] rounded-sm relative border-2 cursor-pointer flex flex-col items-center justify-center p-1 text-center transition-all ${
                        activeTargetingSkill?.id === invokedSpells[1].id
                          ? 'border-yellow-300 ring-2 ring-yellow-400 shadow-lg scale-105'
                          : 'border-slate-500 hover:border-slate-300 shadow-md'
                      }`}
                    >
                      <span className="text-[10px] font-bold text-white line-clamp-2 leading-tight">
                        {invokedSpells[1].name}
                      </span>
                      <span className="absolute top-0.5 left-0.5 bg-black/80 px-1 rounded-xs text-[9px] font-mono font-bold text-white">F</span>
                      <span className="absolute bottom-0 right-0 bg-[#0f2e54]/90 px-1 text-[8px] font-mono text-cyan-300">{invokedSpells[1].manaCost}</span>
                    </div>
                  </div>
                )}

                {/* 6. Invoke (R) */}
                <div className="flex flex-col items-center group relative">
                  <div className="h-4 flex items-center justify-center mb-0.5">
                    <button
                      onClick={() => onLevelUpSkill && onLevelUpSkill(3)}
                      className="w-3.5 h-3.5 rounded-full bg-amber-500 hover:bg-amber-400 text-black flex items-center justify-center text-[9px] font-black cursor-pointer shadow"
                      title="Прокачать Invoke (снижает кд 8с -> 4с -> 1с)"
                    >
                      <Plus className="w-2.5 h-2.5 stroke-[3]" />
                    </button>
                  </div>
                  <div
                    onClick={() => onInvoke && onInvoke()}
                    className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-amber-700 via-yellow-600 to-amber-900 rounded-sm relative border-2 border-amber-300 hover:border-yellow-200 flex flex-col items-center justify-center cursor-pointer shadow-lg shadow-amber-900/50 transition-transform hover:scale-105"
                    title="Синтезировать текущие 3 сферы в заклинание!"
                  >
                    <Sparkles className="w-5 h-5 text-white animate-spin-slow" />
                    <span className="text-[9px] font-extrabold text-white tracking-wider">INVOKE</span>
                    <span className="absolute top-0.5 left-0.5 bg-black/80 px-1 rounded-xs text-[9px] font-mono font-bold text-yellow-300">R</span>
                  </div>
                </div>
              </>
            ) : (
              /* --- CASE B: ALL OTHER HEROES (Gojo, Sukuna, Axe, Pudge, etc.) --- */
              hero.skills.map((skill, idx) => {
                const isPassive = skill.type?.toLowerCase().includes('пассив');
                const isUlt = skill.isUltimate;
                let hotkey = 'Q';
                if (isPassive) hotkey = 'P';
                else if (isUlt) hotkey = 'R';
                else if (idx === 1) hotkey = 'W';
                else if (idx === 2) hotkey = 'E';
                else if (idx === 3) hotkey = 'D';

                const skillLevel = skillLevels[idx] || 1;
                const maxLvl = isUlt ? 3 : 4;
                const cd = cooldowns[skill.id] || 0;
                const isTargeting = activeTargetingSkill?.id === skill.id;

                return (
                  <div key={skill.id} className="flex flex-col items-center group relative">
                    
                    {/* Level Up Button */}
                    <div className="h-4 sm:h-5 flex items-center justify-center mb-0.5">
                      {skillLevel < maxLvl && !isPassive ? (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            playSpellSound();
                            onLevelUpSkill && onLevelUpSkill(idx);
                          }}
                          className="w-4 h-4 rounded-full bg-amber-500 hover:bg-amber-400 text-black flex items-center justify-center text-[10px] font-black shadow-md cursor-pointer transition-transform hover:scale-110"
                          title="Прокачать способность (+1 уровень)"
                        >
                          <Plus className="w-3 h-3 stroke-[3]" />
                        </button>
                      ) : (
                        <div className="w-1.5 h-1.5 rounded-full bg-amber-400/40" />
                      )}
                    </div>

                    {/* Level Pips */}
                    <div className="flex items-center gap-0.5 mb-1">
                      {Array.from({ length: maxLvl }).map((_, pIdx) => (
                        <div 
                          key={pIdx} 
                          className={`w-2.5 sm:w-3.5 h-1 rounded-xs transition-colors ${
                            pIdx < skillLevel ? 'bg-amber-400 shadow-sm shadow-amber-400/50' : 'bg-slate-700/80'
                          }`}
                        />
                      ))}
                    </div>

                    {/* Skill Frame */}
                    <div
                      onClick={() => {
                        if (!isPassive && cd === 0) {
                          playClickSound();
                          onActivateSkill && onActivateSkill(skill, idx);
                        }
                      }}
                      className={`w-12 h-12 sm:w-14 sm:h-14 bg-[#141b26] rounded-sm relative border-2 flex items-center justify-center cursor-pointer transition-all overflow-hidden ${
                        isTargeting 
                          ? 'border-yellow-300 ring-2 ring-yellow-400 shadow-lg shadow-yellow-500/50 scale-105' 
                          : isUlt 
                          ? 'border-amber-500/80 shadow-md shadow-amber-900/40 hover:border-amber-300' 
                          : isPassive
                          ? 'border-slate-600/60 cursor-default opacity-90'
                          : 'border-[#3b475f] hover:border-slate-300'
                      }`}
                    >
                      <div className="w-full h-full flex flex-col items-center justify-center p-1 text-center bg-gradient-to-br from-[#1e2638] to-[#0f1420]">
                        <span className="text-[10px] font-bold text-slate-100 font-sans leading-tight line-clamp-2">
                          {skill.name}
                        </span>
                      </div>

                      <div className="absolute top-0.5 left-0.5 bg-black/75 px-1 rounded-xs text-[9px] font-mono font-bold text-white border border-white/10 pointer-events-none">
                        {hotkey}
                      </div>

                      {skill.manaCost && skill.manaCost[0] !== '0' && (
                        <div className="absolute bottom-0 right-0 bg-[#0f2e54]/90 px-1 rounded-tl-xs text-[9px] font-mono font-bold text-cyan-300 pointer-events-none">
                          {skill.manaCost[Math.min(skillLevel - 1, skill.manaCost.length - 1)]}
                        </div>
                      )}

                      {cd > 0 && (
                        <div className="absolute inset-0 bg-black/85 flex flex-col items-center justify-center pointer-events-none">
                          <span className="font-stat text-sm font-black text-white">{cd}</span>
                          <span className="text-[8px] text-slate-400 font-mono">сек</span>
                        </div>
                      )}
                    </div>

                    {/* Skill Tooltip */}
                    <div className="hidden group-hover:block absolute bottom-full mb-3 left-1/2 -translate-x-1/2 w-64 p-3 bg-[#0d121c] border border-amber-500/60 rounded-xl shadow-2xl z-50 pointer-events-none text-left">
                      <div className="flex items-center justify-between border-b border-slate-800 pb-1 mb-1.5">
                        <span className="font-bold text-xs text-amber-300 font-fantasy">{skill.name}</span>
                        <span className="text-[10px] text-slate-400 font-mono">Ур. {skillLevel}</span>
                      </div>
                      <p className="text-[11px] text-slate-200 leading-snug mb-2">{skill.description}</p>
                      {skill.scalingDesc && (
                        <div className="p-1.5 rounded bg-black/50 border border-white/5 text-[10px] text-amber-200 font-mono mb-2">
                          {skill.scalingDesc}
                        </div>
                      )}
                      <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 pt-1 border-t border-slate-800">
                        <span>Время: <strong className="text-white">{skill.castTime || '0 сек'}</strong></span>
                        <span>КД: <strong className="text-white">{skill.cooldown || '0'}</strong></span>
                      </div>
                    </div>

                  </div>
                );
              })
            )}

          </div>

        </div>

        {/* 4. Right: Inventory (6 Slots, TP, Gold) */}
        <div className="flex-shrink-0">
          <DotaInventory onActivateItem={onActivateItem} />
        </div>

      </div>

      {/* Invoker Spellbook Modal (All 10 Spells Cheat Sheet) */}
      {showSpellbook && isInvoker && (
        <div className="absolute bottom-full mb-3 right-10 p-4 bg-[#0f1422] border-2 border-purple-500/80 rounded-2xl shadow-2xl z-50 w-96 max-h-[500px] overflow-y-auto animate-in fade-in">
          <div className="flex items-center justify-between border-b border-purple-500/30 pb-2 mb-3">
            <div className="flex items-center gap-2 text-purple-300 font-bold font-fantasy">
              <BookOpen className="w-4 h-4" />
              <span>Гримуар Инвокера (10 заклинаний)</span>
            </div>
            <button 
              onClick={() => setShowSpellbook(false)} 
              className="text-xs text-slate-400 hover:text-white cursor-pointer px-1 py-0.5 rounded bg-black/40"
            >
              ✕
            </button>
          </div>

          <div className="space-y-2 text-xs font-mono">
            {Object.entries(INVOKER_SPELLS).map(([combo, spell]) => (
              <div 
                key={combo}
                onClick={() => {
                  onQuickInvokeRecipe && onQuickInvokeRecipe(combo);
                  setShowSpellbook(false);
                }}
                className="p-2 rounded bg-black/50 hover:bg-purple-950/60 border border-slate-700/60 hover:border-purple-400 transition-colors flex items-center justify-between cursor-pointer group"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-1.5 py-0.5 rounded bg-purple-900/80 text-purple-200 font-black text-[11px] border border-purple-400/40">
                      {combo}
                    </span>
                    <span className="font-bold text-amber-200 font-fantasy">{spell.name}</span>
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1 line-clamp-1">
                    {spell.description}
                  </div>
                </div>

                <button 
                  className="px-2 py-1 rounded bg-amber-500/20 group-hover:bg-amber-500 text-amber-300 group-hover:text-black text-[10px] font-bold border border-amber-500/40 transition-colors whitespace-nowrap ml-2"
                >
                  Синтез
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Talent Tree Modal */}
      {showTalents && (
        <div className="absolute bottom-full mb-3 left-48 p-4 bg-[#0f1420] border-2 border-amber-500/70 rounded-2xl shadow-2xl z-50 w-72 animate-in fade-in">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3">
            <span className="font-fantasy text-sm font-bold text-amber-300">Дерево Талантов</span>
            <button onClick={() => setShowTalents(false)} className="text-xs text-slate-400 hover:text-white cursor-pointer">✕</button>
          </div>
          <div className="space-y-2 text-xs font-mono">
            <div className="p-2 rounded bg-slate-800/60 flex justify-between items-center text-amber-200">
              <span>+20% урона от способностей</span>
              <span className="text-[10px] text-slate-500">Ур. 25</span>
            </div>
            <div className="p-2 rounded bg-slate-800/60 flex justify-between items-center text-amber-200">
              <span>+15 к скорости перемещения</span>
              <span className="text-[10px] text-slate-500">Ур. 20</span>
            </div>
            <div className="p-2 rounded bg-slate-800/60 flex justify-between items-center text-amber-200">
              <span>+250 к запасу здоровья (ХП)</span>
              <span className="text-[10px] text-slate-500">Ур. 15</span>
            </div>
            <div className="p-2 rounded bg-slate-800/60 flex justify-between items-center text-amber-200">
              <span>+3 к регенерации маны</span>
              <span className="text-[10px] text-slate-500">Ур. 10</span>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
