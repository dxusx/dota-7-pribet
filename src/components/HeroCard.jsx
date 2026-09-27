import React, { useState } from 'react';
import { 
  Heart, Zap, Shield, Target, Crosshair, Footprints, 
  Sparkles, Clock, Swords, Eye, FileText, ChevronRight, ZapOff
} from 'lucide-react';
import { playClickSound } from '../utils/sound';

export default function HeroCard({ 
  hero, 
  onViewOriginal, 
  onViewDetails, 
  onSelectForDuel 
}) {
  const [level, setLevel] = useState(1);
  const [weskerStance, setWeskerStance] = useState('melee'); // 'melee' | 'ranged'

  // Dynamic stat calculation for Wesker
  const isWesker = hero.id === 'wesker';
  const currentDamage = isWesker 
    ? (weskerStance === 'melee' ? hero.stats.melee.damage : hero.stats.melee.ranged || hero.stats.ranged.damage)
    : hero.stats.damage;

  const currentCrit = isWesker 
    ? (weskerStance === 'melee' ? hero.stats.melee.crit : hero.stats.ranged.crit)
    : hero.stats.crit;

  const currentRange = isWesker 
    ? (weskerStance === 'melee' ? hero.stats.melee.range : hero.stats.ranged.range)
    : hero.stats.range;

  const currentPenetration = isWesker 
    ? (weskerStance === 'melee' ? hero.stats.melee.penetration : hero.stats.ranged.penetration)
    : hero.stats.penetration;

  const currentAccuracy = isWesker 
    ? (weskerStance === 'melee' ? hero.stats.melee.accuracy : hero.stats.ranged.accuracy)
    : hero.stats.accuracy;

  // Helper to highlight active level in scaling texts (e.g., "5/10/20/40")
  const formatScalingText = (text, currentLvl) => {
    // Check if contains slash-separated numbers
    const parts = text.split('/');
    if (parts.length >= 3 && parts.length <= 5) {
      return (
        <span className="inline-flex items-center gap-1 font-mono">
          {parts.map((p, idx) => {
            const isMatch = (idx + 1) === currentLvl || (parts.length === 3 && currentLvl === 4 && idx === 2);
            return (
              <span key={idx} className="flex items-center">
                <span className={`px-1 py-0.5 rounded text-xs transition-all ${
                  isMatch 
                    ? 'bg-amber-400 text-black font-extrabold shadow-sm scale-110' 
                    : 'text-slate-300'
                }`}>
                  {p.trim()}
                </span>
                {idx < parts.length - 1 && <span className="text-slate-500 text-xs">/</span>}
              </span>
            );
          })}
        </span>
      );
    }
    return text;
  };

  return (
    <div 
      className="tabletop-card-shadow print-card rounded-2xl border transition-all duration-300 hover:-translate-y-1 relative flex flex-col justify-between overflow-hidden"
      style={{
        backgroundColor: hero.themeColor || '#1f2937',
        borderColor: `${hero.accentColor || '#eab308'}40`,
      }}
    >
      {/* Top Header with Level Selector Badge */}
      <div className="p-4 sm:p-5 pb-3">
        <div className="flex items-start justify-between gap-3">
          
          {/* Avatar & Title */}
          <div className="flex items-center gap-3.5">
            <div className="relative">
              <img 
                src={hero.avatar} 
                alt={hero.name} 
                className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl object-cover border-2 border-white/20 shadow-md bg-black/40"
              />
              {/* Level Circle indicator (Faithful to friend's image design) */}
              <button 
                onClick={() => {
                  playClickSound();
                  setLevel(l => l >= 4 ? 1 : l + 1);
                }}
                title="Нажмите, чтобы повысить уровень карточки (1-4)"
                className="absolute -bottom-2 -left-2 w-7 h-7 rounded-full bg-emerald-700 hover:bg-emerald-600 text-emerald-100 font-bold border-2 border-emerald-400 text-xs flex items-center justify-center shadow-lg transition-transform hover:scale-110 cursor-pointer"
              >
                {level}
              </button>
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-black/40 text-amber-300 border border-white/10">
                  {hero.universe}
                </span>
                <span className="text-[10px] text-slate-300 font-mono">
                  {hero.dndRole}
                </span>
              </div>
              <h3 className="font-fantasy text-xl sm:text-2xl font-black text-white tracking-wide mt-0.5">
                {hero.name}
              </h3>
              <p className="text-xs text-white/80 line-clamp-1 italic font-serif">
                "{hero.quote}"
              </p>
            </div>
          </div>

          {/* Level Switcher (Interactive) */}
          <div className="flex flex-col items-end gap-1">
            <span className="text-[10px] uppercase text-white/60 font-semibold tracking-wider">
              Уровень
            </span>
            <div className="flex bg-black/50 p-1 rounded-lg border border-white/10">
              {[1, 2, 3, 4].map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => { playClickSound(); setLevel(lvl); }}
                  className={`w-6 h-6 rounded text-xs font-bold transition-all ${
                    level === lvl 
                      ? 'bg-amber-400 text-black shadow-md scale-105' 
                      : 'text-white/60 hover:text-white'
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Wesker Special Stance Selector */}
        {isWesker && (
          <div className="mt-3 flex items-center justify-between bg-black/40 p-2 rounded-xl border border-white/10">
            <span className="text-xs text-white/80 font-medium">Стойка S.T.A.R.S.:</span>
            <div className="flex gap-1.5">
              <button
                onClick={() => { playClickSound(); setWeskerStance('melee'); }}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  weskerStance === 'melee' 
                    ? 'bg-rose-600 text-white shadow' 
                    : 'bg-black/30 text-white/60 hover:text-white'
                }`}
              >
                👊 Кулак (Ближний)
              </button>
              <button
                onClick={() => { playClickSound(); setWeskerStance('ranged'); }}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  weskerStance === 'ranged' 
                    ? 'bg-sky-600 text-white shadow' 
                    : 'bg-black/30 text-white/60 hover:text-white'
                }`}
              >
                🔫 Пистолет (Дальний)
              </button>
            </div>
          </div>
        )}

        {/* Base Stats Bar (Authentic to handwritten card stats) */}
        <div className="mt-3.5 grid grid-cols-4 sm:grid-cols-6 gap-1.5 bg-black/45 p-2.5 rounded-xl border border-white/10 text-center font-stat">
          
          <div className="bg-white/5 p-1 rounded">
            <div className="text-[10px] text-white/60 uppercase">ХП</div>
            <div className="text-sm font-bold text-emerald-400">{hero.stats.hp}</div>
            <div className="text-[9px] text-emerald-300/80">{hero.stats.hpRegen}</div>
          </div>

          <div className="bg-white/5 p-1 rounded">
            <div className="text-[10px] text-white/60 uppercase">Мана</div>
            <div className="text-sm font-bold text-blue-400">{hero.stats.mana}</div>
            <div className="text-[9px] text-blue-300/80">{hero.stats.manaRegen}</div>
          </div>

          <div className="bg-white/5 p-1 rounded">
            <div className="text-[10px] text-white/60 uppercase">Урон</div>
            <div className="text-sm font-bold text-rose-400">{currentDamage}</div>
            <div className="text-[9px] text-slate-300">пер: {isWesker ? hero.stats.melee.period : hero.stats.period}</div>
          </div>

          <div className="bg-white/5 p-1 rounded">
            <div className="text-[10px] text-white/60 uppercase">Крит</div>
            <div className="text-sm font-bold text-amber-400">{currentCrit}</div>
            <div className="text-[9px] text-slate-300">урон</div>
          </div>

          <div className="bg-white/5 p-1 rounded">
            <div className="text-[10px] text-white/60 uppercase">Дальность</div>
            <div className="text-sm font-bold text-cyan-400">{currentRange} кл.</div>
            <div className="text-[9px] text-slate-300">проб: {currentPenetration}</div>
          </div>

          <div className="bg-white/5 p-1 rounded">
            <div className="text-[10px] text-white/60 uppercase">Попадание</div>
            <div className="text-sm font-bold text-purple-400">{currentAccuracy}%</div>
            <div className="text-[9px] text-slate-300">броня: {hero.stats.armor}</div>
          </div>

        </div>
      </div>

      {/* Skills & Ultimate Section */}
      <div className="p-4 sm:p-5 pt-0 space-y-2.5 flex-1">
        <div className="text-[11px] uppercase tracking-wider text-white/70 font-semibold flex items-center justify-between border-b border-white/10 pb-1">
          <span>Способности и Ульта:</span>
          <span className="text-[10px] text-amber-300 font-mono">
            Квант времени: 8 сек = 1 ход
          </span>
        </div>

        <div className="space-y-2 text-xs">
          {hero.skills.map((skill) => {
            const isUlt = skill.isUltimate;
            return (
              <div 
                key={skill.id}
                className={`p-2.5 rounded-xl border transition-all ${
                  isUlt 
                    ? 'bg-amber-950/40 border-amber-500/50 shadow-sm' 
                    : 'bg-black/35 border-white/10 hover:border-white/20'
                }`}
              >
                {/* Skill Title & Meta */}
                <div className="flex items-center justify-between gap-2 flex-wrap mb-1">
                  <div className="flex items-center gap-1.5">
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                      isUlt ? 'bg-amber-500 text-black' : 'bg-white/20 text-white'
                    }`}>
                      {isUlt ? '★' : skill.num}
                    </span>
                    <span className={`font-bold ${isUlt ? 'text-amber-300' : 'text-white'}`}>
                      {skill.name}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-[10px] font-mono text-white/70">
                    <span className="bg-white/10 px-1.5 py-0.5 rounded">
                      {skill.type}
                    </span>
                    {skill.castTime && (
                      <span className="flex items-center gap-0.5 text-amber-200">
                        <Clock className="w-3 h-3" />
                        {skill.castTime}
                      </span>
                    )}
                  </div>
                </div>

                {/* Description */}
                <p className="text-white/90 text-[11px] leading-relaxed">
                  {skill.description}
                </p>

                {/* Scaling details (dynamically highlights current level) */}
                {skill.scalingDesc && (
                  <div className="mt-1.5 p-1.5 rounded-lg bg-black/40 border border-white/5 text-[10px] text-amber-200/90 font-mono">
                    <span className="text-white/50 mr-1">Прокачка:</span>
                    {formatScalingText(skill.scalingDesc, level)}
                  </div>
                )}

                {/* Cooldown and Mana Footer */}
                {(skill.cooldown || (skill.manaCost && skill.manaCost[0] !== "0")) && (
                  <div className="mt-1 flex items-center justify-between text-[10px] text-white/60 font-mono">
                    {skill.manaCost && skill.manaCost[0] !== "0" && (
                      <span className="flex items-center gap-1 text-blue-300">
                        <Zap className="w-3 h-3" />
                        Мана: {skill.manaCost.join('/')}
                      </span>
                    )}
                    {skill.cooldown && (
                      <span className="text-slate-300 ml-auto">
                        КД: {skill.cooldown}
                      </span>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Basic Attacks Footer */}
        <div className="p-2 rounded-xl bg-black/30 border border-white/5 text-[10px] text-white/70 italic">
          <span className="font-semibold not-italic text-amber-300">Базовый стиль: </span>
          {hero.basicAttacks}
        </div>
      </div>

      {/* Card Footer Actions (Interactive Buttons) */}
      <div className="p-3 bg-black/60 border-t border-white/10 flex items-center justify-between gap-2 no-print">
        <button
          onClick={() => { playClickSound(); onViewOriginal(hero); }}
          className="flex-1 flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-medium transition-all"
          title="Посмотреть оригинальный снимок карточки от друга"
        >
          <Eye className="w-3.5 h-3.5 text-amber-300" />
          <span>Оригинал</span>
        </button>

        <button
          onClick={() => { playClickSound(); onViewDetails(hero); }}
          className="flex-1 flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-medium transition-all"
          title="Открыть полный лист персонажа DnD"
        >
          <FileText className="w-3.5 h-3.5 text-cyan-300" />
          <span>Лист DnD</span>
        </button>

        <button
          onClick={() => { playClickSound(); onSelectForDuel(hero); }}
          className="flex-1 flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white text-xs font-bold shadow-md transition-all"
          title="Выбрать этого героя для поединка на боевой арене"
        >
          <Swords className="w-3.5 h-3.5" />
          <span>В бой!</span>
        </button>
      </div>
    </div>
  );
}
