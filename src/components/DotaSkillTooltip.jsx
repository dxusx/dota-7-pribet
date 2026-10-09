import React from 'react';
import { getSkillDetails } from '../game/heroHudUtils';

export default function DotaSkillTooltip({ skill, hero, skillIconUrl, hotkey }) {
  const details = getSkillDetails(skill, hero);
  if (!details) return null;

  return (
    <div className="w-80 bg-[#121620]/98 border border-[#2d3a4f] rounded-xl p-3 shadow-2xl shadow-black/90 text-xs font-mono backdrop-blur-md pointer-events-none select-none z-50 animate-in fade-in zoom-in-95 duration-100 ring-1 ring-white/5">
      {/* 1. Header with Icon & Names */}
      <div className="flex items-start gap-2.5 pb-2 border-b border-slate-700/60">
        <div className="w-11 h-11 rounded-lg overflow-hidden border border-slate-600/80 shrink-0 relative bg-slate-900 shadow-md">
          {skillIconUrl && (
            <img src={skillIconUrl} alt={details.name} className="w-full h-full object-cover" />
          )}
          {details.isPassive && (
            <div className="absolute inset-0 bg-slate-950/40 border border-slate-500/30 flex items-center justify-center">
              <span className="text-[7px] font-bold text-slate-300 uppercase bg-slate-900/90 px-1 rounded">Пас</span>
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-1">
            <span className="font-bold text-amber-300 text-sm truncate tracking-wide drop-shadow-sm">
              {details.name}
            </span>
            {hotkey && (
              <span className="text-[9px] px-1 py-0.5 rounded bg-slate-800 text-amber-400 font-bold border border-slate-700 shrink-0">
                [{hotkey}]
              </span>
            )}
          </div>
          <div className="flex items-center gap-1.5 mt-0.5 text-[9px] text-slate-400">
            <span className="uppercase tracking-wider text-slate-500 font-semibold">{details.type}</span>
            {details.isStolen && (
              <span className="text-emerald-400 font-bold bg-emerald-950/60 px-1 rounded border border-emerald-500/30">
                ✨ Украдено
              </span>
            )}
          </div>
        </div>
      </div>

      {/* 2. Dota Ability Header Specifications */}
      <div className="grid grid-cols-1 gap-1 py-2 text-[10px] border-b border-slate-700/60 bg-slate-950/40 px-2 rounded-lg my-2">
        <div className="flex justify-between items-center">
          <span className="text-slate-400 font-sans">СПОСОБНОСТЬ:</span>
          <span className="text-slate-200 font-semibold">{details.targetType}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-slate-400 font-sans">ДЕЙСТВУЕТ НА:</span>
          <span className="text-slate-200 font-semibold">{details.affects}</span>
        </div>
        {details.damageType && (
          <div className="flex justify-between items-center">
            <span className="text-slate-400 font-sans">ТИП УРОНА:</span>
            <span
              className={`font-bold ${
                details.damageType === 'Чистый'
                  ? 'text-amber-400'
                  : details.damageType === 'Физический'
                  ? 'text-rose-400'
                  : 'text-sky-400'
              }`}
            >
              {details.damageType}
            </span>
          </div>
        )}
      </div>

      {/* 3. Description Body */}
      <p className="text-[11px] text-slate-200 font-sans leading-relaxed tracking-normal py-1">
        {details.desc}
      </p>

      {/* 4. Attribute Key-Value List */}
      {details.attributes.length > 0 && (
        <div className="py-2 border-t border-slate-700/60 space-y-1 text-[10px]">
          {details.attributes.map((attr, idx) => (
            <div key={idx} className="flex justify-between items-center font-mono">
              <span className="text-slate-400 text-[9px] uppercase tracking-wide">{attr.label}:</span>
              <span className="text-slate-100 font-bold">{attr.value}</span>
            </div>
          ))}
        </div>
      )}

      {/* 5. Footer with Mana, Cooldown, and Action Time */}
      <div className="pt-2 border-t border-slate-700/60 flex items-center justify-between text-[10px] text-slate-300 font-mono">
        {details.isPassive ? (
          <span className="text-slate-400 font-bold text-[9px] uppercase tracking-wider">
            ПАССИВНАЯ СПОСОБНОСТЬ
          </span>
        ) : (
          <>
            <div className="flex items-center gap-2.5">
              {details.manaCost > 0 ? (
                <span className="flex items-center gap-1 text-sky-400 font-bold bg-sky-950/60 px-1.5 py-0.5 rounded border border-sky-500/30">
                  <span className="text-xs">💧</span> {details.manaCost}
                </span>
              ) : (
                <span className="text-slate-500 text-[9px]">0 маны</span>
              )}
              {details.cooldown > 0 && (
                <span className="flex items-center gap-1 text-slate-300 font-semibold bg-slate-800/60 px-1.5 py-0.5 rounded border border-slate-600/40">
                  <span className="text-xs">⏱️</span> {details.cooldown}с
                </span>
              )}
            </div>
            {details.timeCost > 0 && (
              <span className="flex items-center gap-1 text-amber-300 font-semibold bg-amber-950/60 px-1.5 py-0.5 rounded border border-amber-500/30">
                <span className="text-xs">⏳</span> {details.timeCost}с
              </span>
            )}
          </>
        )}
      </div>
    </div>
  );
}
