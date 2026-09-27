import React, { useState } from 'react';
import { Sun, Moon, Swords, Shield, Skull, Dice5, ScrollText, Volume2, VolumeX, Crosshair, FastForward } from 'lucide-react';
import { playClickSound, toggleSound, isSoundEnabled } from '../../utils/sound';

export default function DotaTopBar({ 
  heroes, 
  activeHeroId, 
  onSelectHero, 
  heroPositions = [],
  radiantKills = 4, 
  direKills = 2,
  gameTime = '04:16',
  turn = 1,
  isDay = true,
  onNextTurn,
  onToggleDice,
  showDice,
  onToggleCombatLog,
  showCombatLog,
  onCenterCamera
}) {
  const [soundOn, setSoundOn] = useState(isSoundEnabled());

  const handleSoundToggle = () => {
    const next = toggleSound();
    setSoundOn(next);
    if (next) playClickSound();
  };

  const radiantHeroes = heroes.filter(h => h.id === 'axe' || h.id === 'pudge' || h.id === 'rubick' || h.id === 'invoker' || h.id === 'gojo');
  const direHeroes = heroes.filter(h => h.id === 'shadow_fiend' || h.id === 'monesy' || h.id === 'wesker' || h.id === 'minos' || h.id === 'sukuna');

  const getHpRatio = (heroId) => {
    const pos = heroPositions.find(p => p.heroId === heroId);
    return pos && pos.hpRatio !== undefined ? Math.max(0, Math.min(1, pos.hpRatio)) : 1;
  };

  return (
    <header className="w-full bg-[#070a10]/95 backdrop-blur-md border-b border-[#202738] shadow-2xl px-2 sm:px-4 py-1 select-none flex items-center justify-between relative z-40">
      
      {/* 1. RADIANT TEAM (Left) */}
      <div className="flex items-center gap-1.5 sm:gap-3">
        <div className="hidden lg:flex items-center gap-1.5 text-xs font-bold text-emerald-400 font-mono tracking-wider pr-1">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/80 animate-pulse"></span>
          <span>RADIANT</span>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2">
          {radiantHeroes.map((hero) => {
            const isSelected = hero.id === activeHeroId;
            const hpRatio = getHpRatio(hero.id);
            return (
              <div
                key={hero.id}
                onClick={() => { playClickSound(); onSelectHero(hero.id); }}
                className={`relative cursor-pointer group transition-all ${
                  isSelected ? 'scale-110 -translate-y-0.5' : 'hover:scale-105 opacity-80 hover:opacity-100'
                }`}
                title={`${hero.name} (Radiant) — Нажмите, чтобы выбрать`}
              >
                {/* Hero Top Portrait */}
                <div className={`w-9 h-7 sm:w-12 sm:h-9 rounded overflow-hidden bg-black border-2 transition-all ${
                  isSelected ? 'border-amber-400 shadow-lg shadow-amber-500/40 ring-2 ring-amber-400/50' : 'border-emerald-800/80 hover:border-emerald-500'
                }`}>
                  <img 
                    src={hero.avatar} 
                    alt={hero.name} 
                    className="w-full h-full object-cover object-top"
                  />
                </div>

                {/* Overhead Health Bar */}
                <div className="w-full h-1 bg-black/80 overflow-hidden mt-0.5 rounded-full">
                  <div 
                    className={`h-full transition-all duration-300 ${
                      hpRatio > 0.5 ? 'bg-emerald-500' : hpRatio > 0.25 ? 'bg-amber-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${Math.round(hpRatio * 100)}%` }}
                  ></div>
                </div>

                {/* Active hero glow indicator */}
                {isSelected && (
                  <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-amber-400 shadow-md shadow-amber-400"></div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. CENTER: Score, Clock, Turn, Next Turn Action */}
      <div className="flex items-center gap-2 sm:gap-4">
        
        {/* Score & Clock Block */}
        <div className="flex items-center gap-2 sm:gap-4 bg-[#0e131d]/90 px-3 sm:px-4 py-1 rounded-xl border border-[#263147] shadow-inner">
          {/* Radiant Score */}
          <span className="font-stat text-lg sm:text-2xl font-black text-emerald-400">
            {radiantKills}
          </span>

          {/* Clock & Turn */}
          <div className="flex flex-col items-center min-w-[70px]">
            <div className="flex items-center gap-1 text-xs text-amber-300 font-mono font-bold">
              {isDay ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-cyan-300" />}
              <span>{gameTime}</span>
            </div>
            <span className="text-[9px] uppercase tracking-wider text-slate-400 font-mono font-semibold">
              ХОД {turn} (8с)
            </span>
          </div>

          {/* Dire Score */}
          <span className="font-stat text-lg sm:text-2xl font-black text-red-500">
            {direKills}
          </span>
        </div>

        {/* End Turn (Next Turn) Button */}
        <button
          onClick={() => { playClickSound(); onNextTurn && onNextTurn(); }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-600 via-amber-500 to-yellow-500 hover:from-amber-500 hover:to-yellow-400 text-black font-bold text-xs shadow-lg shadow-amber-500/20 active:scale-95 transition-all cursor-pointer"
          title="Завершить текущий ход (+8 секунд). Регенерация ХП и маны, откат способностей."
        >
          <FastForward className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">ХОД</span>
          <span className="text-[10px] font-mono px-1 py-0.2 rounded bg-black/20 text-black">Space</span>
        </button>

      </div>

      {/* 3. DIRE TEAM & UTILITY BUTTONS (Right) */}
      <div className="flex items-center gap-1.5 sm:gap-3">
        
        {/* Dire Heroes Portraits */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {direHeroes.map((hero) => {
            const isSelected = hero.id === activeHeroId;
            const hpRatio = getHpRatio(hero.id);
            return (
              <div
                key={hero.id}
                onClick={() => { playClickSound(); onSelectHero(hero.id); }}
                className={`relative cursor-pointer group transition-all ${
                  isSelected ? 'scale-110 -translate-y-0.5' : 'hover:scale-105 opacity-80 hover:opacity-100'
                }`}
                title={`${hero.name} (Dire) — Нажмите, чтобы выбрать`}
              >
                {/* Hero Top Portrait */}
                <div className={`w-9 h-7 sm:w-12 sm:h-9 rounded overflow-hidden bg-black border-2 transition-all ${
                  isSelected ? 'border-amber-400 shadow-lg shadow-amber-500/40 ring-2 ring-amber-400/50' : 'border-rose-900/80 hover:border-rose-600'
                }`}>
                  <img 
                    src={hero.avatar} 
                    alt={hero.name} 
                    className="w-full h-full object-cover object-top"
                  />
                </div>

                {/* Overhead Health Bar */}
                <div className="w-full h-1 bg-black/80 overflow-hidden mt-0.5 rounded-full">
                  <div 
                    className={`h-full transition-all duration-300 ${
                      hpRatio > 0.5 ? 'bg-rose-500' : hpRatio > 0.25 ? 'bg-amber-500' : 'bg-red-600'
                    }`}
                    style={{ width: `${Math.round(hpRatio * 100)}%` }}
                  ></div>
                </div>

                {/* Active indicator */}
                {isSelected && (
                  <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-amber-400 shadow-md shadow-amber-400"></div>
                )}
              </div>
            );
          })}
        </div>

        <div className="hidden lg:flex items-center gap-1.5 text-xs font-bold text-red-400 font-mono tracking-wider pl-1">
          <span>DIRE</span>
          <span className="w-2.5 h-2.5 rounded-full bg-red-600 shadow-sm shadow-red-600/80 animate-pulse"></span>
        </div>

        {/* Separator */}
        <div className="h-6 w-px bg-slate-800 mx-1 hidden sm:block"></div>

        {/* Quick Utility Buttons */}
        <div className="flex items-center gap-1">
          {/* Center camera on active hero */}
          <button
            onClick={() => { playClickSound(); onCenterCamera && onCenterCamera(); }}
            className="p-1.5 sm:p-2 rounded-lg bg-[#111722] hover:bg-[#1a2333] border border-slate-700/80 text-slate-300 hover:text-amber-400 transition-all cursor-pointer"
            title="Сфокусировать камеру на выбранном герое"
          >
            <Crosshair className="w-3.5 h-3.5" />
          </button>

          {/* Tabletop D20 Dice drawer toggle */}
          <button
            onClick={() => { playClickSound(); onToggleDice && onToggleDice(); }}
            className={`p-1.5 sm:p-2 rounded-lg border transition-all cursor-pointer ${
              showDice 
                ? 'bg-amber-500 text-black border-amber-400 shadow-md shadow-amber-500/30' 
                : 'bg-[#111722] hover:bg-[#1a2333] border-slate-700/80 text-slate-300 hover:text-white'
            }`}
            title="Открыть дайсы D20 для бросков в настолке"
          >
            <Dice5 className="w-3.5 h-3.5" />
          </button>

          {/* Combat Log drawer toggle */}
          <button
            onClick={() => { playClickSound(); onToggleCombatLog && onToggleCombatLog(); }}
            className={`p-1.5 sm:p-2 rounded-lg border transition-all cursor-pointer ${
              showCombatLog 
                ? 'bg-cyan-600 text-white border-cyan-400 shadow-md shadow-cyan-500/30' 
                : 'bg-[#111722] hover:bg-[#1a2333] border-slate-700/80 text-slate-300 hover:text-white'
            }`}
            title="Открыть/закрыть ленту событий боя"
          >
            <ScrollText className="w-3.5 h-3.5" />
          </button>

          {/* Audio Mute/Unmute */}
          <button
            onClick={handleSoundToggle}
            className="p-1.5 sm:p-2 rounded-lg bg-[#111722] hover:bg-[#1a2333] border border-slate-700/80 text-slate-300 hover:text-white transition-all cursor-pointer"
            title={soundOn ? "Выключить звук" : "Включить звук"}
          >
            {soundOn ? <Volume2 className="w-3.5 h-3.5 text-amber-400" /> : <VolumeX className="w-3.5 h-3.5 text-slate-500" />}
          </button>
        </div>

      </div>

    </header>
  );
}
