import React, { useState } from 'react';
import { getHeroDerivedStats } from '../game/heroHudUtils';

export default function DotaHeroConsole({ hero, onCenterCamera, onToggleWeskerMode, getHeroPortrait }) {
  const [hoveredStat, setHoveredStat] = useState(null);

  if (!hero) return null;
  const derived = getHeroDerivedStats(hero);

  const statsList = [
    {
      id: 'damage',
      icon: '⚔️',
      label: 'АТК',
      value: derived.damage,
      color: 'text-red-400',
      title: 'Урон атаки',
      tooltip: `Базовый урон: ${derived.damage}. Крит. урон: ~${derived.damage * 2}. Период атаки: ${(hero.period || 4.0).toFixed(1)}с.`,
    },
    {
      id: 'armor',
      icon: '🛡️',
      label: 'БРО',
      value: derived.armor,
      color: 'text-blue-400',
      title: 'Физическая броня',
      tooltip: `Броня: ${derived.armor}. Снижение физ. урона: -${derived.armorReductionPercent}%.`,
    },
    {
      id: 'agility',
      icon: '⚡',
      label: 'ЛОВ',
      value: derived.agility,
      color: 'text-emerald-400',
      title: 'Ловкость и уклонение',
      tooltip: `Ловкость: ${derived.agility}. Шанс уклонения от атак: +${derived.evasionPercent}%.`,
    },
    {
      id: 'penetration',
      icon: '🏹',
      label: 'ПРОБ',
      value: derived.penetration,
      color: 'text-rose-400',
      title: 'Пробитие брони',
      tooltip: `Пробитие брони: ${derived.penetration}. Игнорирует сопротивление вражеской защиты.`,
    },
    {
      id: 'range',
      icon: '🎯',
      label: 'ДАЛЬ',
      value: derived.range,
      color: 'text-purple-400',
      title: 'Дальность обычной атаки',
      tooltip: `Дальность атаки: ${derived.range} клеток (${derived.range > 2 ? 'Дальний бой' : 'Ближний бой'}).`,
    },
    {
      id: 'speed',
      icon: '👟',
      label: 'СКОР',
      value: derived.speed,
      color: 'text-amber-300',
      title: 'Скорость перемещения',
      tooltip: `Скорость: ${derived.speed} клеток/ход (${derived.stepTimeCost}с на один шаг).`,
    },
  ];

  const statuses = [];
  if (hero.statuses?.silence) statuses.push({ text: 'Безмолвие', icon: '🤐', color: 'bg-purple-900/80 text-purple-200 border-purple-500/50' });
  if (hero.statuses?.stun) statuses.push({ text: 'Оглушение', icon: '💫', color: 'bg-amber-900/80 text-amber-200 border-amber-500/50' });
  if (hero.isTaunted) statuses.push({ text: 'Провокация', icon: '🪓', color: 'bg-orange-900/80 text-orange-200 border-orange-500/50' });
  if (hero.isInvulnerable) statuses.push({ text: 'Неуязвимость', icon: '⚡', color: 'bg-yellow-900/80 text-yellow-200 border-yellow-500/50' });
  if (hero.grievousWounds) statuses.push({ text: 'Страшные раны (-40% хила)', icon: '🩸', color: 'bg-red-900/80 text-red-200 border-red-500/50' });

  return (
    <div className="flex items-center gap-3 w-[430px] shrink-0 bg-[#0d121c]/90 border border-slate-800/80 rounded-2xl p-2.5 shadow-xl relative backdrop-blur-md h-[98px]">
      {/* 1. Hero Avatar Portrait & Level Badge */}
      <div
        onClick={onCenterCamera}
        title="Нажмите, чтобы центрировать камеру на герое"
        className={`w-[78px] h-[78px] rounded-xl overflow-hidden border-2 shrink-0 relative bg-slate-900 cursor-pointer transition-all group ${
          hero.faction === 'radiant'
            ? 'border-emerald-400/90 shadow-lg shadow-emerald-500/25 hover:border-emerald-300 ring-1 ring-emerald-500/30'
            : 'border-rose-400/90 shadow-lg shadow-rose-500/25 hover:border-rose-300 ring-1 ring-rose-500/30'
        }`}
      >
        <img
          src={getHeroPortrait(hero.defId || hero.id)}
          alt={hero.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />

        {/* Level Badge (Bottom-Right Metallic Ring) */}
        <div className="absolute bottom-1 right-1 w-5 h-5 rounded-full bg-gradient-to-b from-slate-900 to-black border border-amber-400/90 flex items-center justify-center text-[10px] font-mono font-bold text-amber-300 shadow-md">
          {derived.level}
        </div>
      </div>

      {/* 2. Hero Information, Bars & Stats */}
      <div className="flex-1 min-w-0 flex flex-col justify-between h-full">
        {/* Header: Name, Attribute Badge & Title */}
        <div>
          <div className="flex items-center justify-between gap-1.5">
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="font-bold text-sm text-slate-100 truncate block leading-tight">
                {hero.name}
              </span>
              {/* Primary Attribute Badge */}
              <span
                className="px-1.5 py-0.2 rounded text-[8px] font-mono font-bold border shadow-sm shrink-0 flex items-center gap-1"
                style={{
                  backgroundColor: `${derived.classMeta.color}22`,
                  borderColor: `${derived.classMeta.color}66`,
                  color: derived.classMeta.color,
                }}
                title={`Основной атрибут: ${derived.classMeta.label}. ${derived.classMeta.desc}`}
              >
                <span>{derived.classMeta.symbol}</span>
                <span className="text-[7.5px] uppercase tracking-wide">{derived.classMeta.label}</span>
              </span>
            </div>

            {/* Wesker Weapon Toggle Button (if Wesker) */}
            {hero.id === 'wesker' && onToggleWeskerMode && (
              <button
                onClick={onToggleWeskerMode}
                className="px-1.5 py-0.5 rounded text-[8.5px] font-mono font-bold bg-cyan-950/70 border border-cyan-500/50 text-cyan-300 hover:bg-cyan-900/80 transition-all flex items-center gap-1 shrink-0 cursor-pointer shadow"
                title="Переключить стойку Вескера: Пистолет (дальний) / Кулаки (ближний)"
              >
                {hero.stats?.weaponMode === 'ranged' ? '🔫 Пистолет' : '👊 Кулаки'}
              </button>
            )}
          </div>

          {/* XP Progress Bar */}
          <div
            className="w-full h-1 bg-slate-800/90 rounded-full overflow-hidden mt-1 cursor-help"
            title={`Опыт: ${derived.xp} / ${derived.nextLvlXp} XP (${derived.xpPercent}% до Ур. ${derived.level + 1})`}
          >
            <div
              className="h-full bg-gradient-to-r from-purple-500 to-indigo-400 transition-all duration-300"
              style={{ width: `${derived.xpPercent}%` }}
            />
          </div>
        </div>

        {/* HP Bar (Dota 2 Emerald Bevel) */}
        <div className="relative w-full h-4 bg-[#050806] rounded-[3px] border border-emerald-950/90 overflow-hidden shadow-[inset_0_1px_2px_rgba(0,0,0,0.9)]">
          <div
            className="h-full bg-gradient-to-r from-[#177833] via-[#24a844] to-[#177833] transition-all duration-300 rounded-[2px]"
            style={{ width: `${derived.hpPercent}%` }}
          />
          <div className="absolute inset-0 flex items-center justify-between px-2 text-[10px] font-mono font-bold text-white drop-shadow-[0_1px_2px_rgba(0,0,0,1)]">
            <span>{derived.hp} / {derived.maxHp}</span>
            <span className="text-[9px] text-emerald-200">{derived.hpRegenText}</span>
          </div>
        </div>

        {/* Mana Bar (Dota 2 Deep Blue) */}
        <div className="relative w-full h-3.5 bg-[#040609] rounded-[3px] border border-blue-950/90 overflow-hidden shadow-[inset_0_1px_2px_rgba(0,0,0,0.9)]">
          <div
            className="h-full bg-gradient-to-r from-[#135a96] via-[#1d7ed4] to-[#135a96] transition-all duration-300 rounded-[2px]"
            style={{ width: `${derived.manaPercent}%` }}
          />
          <div className="absolute inset-0 flex items-center justify-between px-2 text-[9px] font-mono font-bold text-white drop-shadow-[0_1px_2px_rgba(0,0,0,1)]">
            <span>{derived.mana} / {derived.maxMana}</span>
            <span className="text-[8px] text-sky-200">{derived.manaRegenText}</span>
          </div>
        </div>

        {/* Active Status Effects Row */}
        {statuses.length > 0 && (
          <div className="flex items-center gap-1 mt-0.5 overflow-x-auto no-scrollbar">
            {statuses.map((st, sIdx) => (
              <span
                key={sIdx}
                className={`text-[8px] font-mono font-bold px-1.5 py-0.2 rounded border flex items-center gap-1 shrink-0 ${st.color}`}
              >
                <span>{st.icon}</span>
                <span>{st.text}</span>
              </span>
            ))}
          </div>
        )}

        {/* 6 Interactive Stat Badges with Detailed Tooltip on Hover */}
        <div className="grid grid-cols-6 gap-1 text-[9px] font-mono text-center relative mt-0.5">
          {statsList.map(st => (
            <div
              key={st.id}
              onMouseEnter={() => setHoveredStat(st)}
              onMouseLeave={() => setHoveredStat(null)}
              className="bg-[#080d14]/90 hover:bg-[#121926] border border-slate-800/80 hover:border-slate-600 rounded-md py-0.5 px-0.5 transition-colors cursor-help shadow-sm"
            >
              <span className="text-slate-400 block text-[7.5px] leading-none flex items-center justify-center gap-0.5">
                <span>{st.icon}</span>
                <span>{st.label}</span>
              </span>
              <span className={`${st.color} font-bold text-[10.5px] block leading-tight mt-0.5`}>{st.value}</span>
            </div>
          ))}

          {/* Stat Hover Tooltip Card */}
          {hoveredStat && (
            <div className="absolute bottom-9 left-0 right-0 bg-[#161c28] border border-slate-700 p-2 rounded-xl text-left shadow-2xl z-50 text-[10px] font-sans text-slate-200 pointer-events-none animate-in fade-in duration-100">
              <div className="font-bold text-amber-300 font-mono flex items-center gap-1.5 pb-0.5 border-b border-slate-700/60 mb-1">
                <span>{hoveredStat.icon}</span>
                <span>{hoveredStat.title}</span>
              </div>
              <p className="leading-tight text-slate-300 text-[10px]">{hoveredStat.tooltip}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
