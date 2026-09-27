import React, { useState } from 'react';
import { Shield, Swords, Dice5, PlusCircle, BookOpen, Volume2, VolumeX, Printer, Sparkles } from 'lucide-react';
import { toggleSound, isSoundEnabled, playClickSound } from '../utils/sound';

export default function Header({ activeTab, setActiveTab }) {
  const [soundOn, setSoundOn] = useState(isSoundEnabled());

  const handleSoundToggle = () => {
    const newState = toggleSound();
    setSoundOn(newState);
    if (newState) playClickSound();
  };

  const handlePrint = () => {
    playClickSound();
    window.print();
  };

  const navItems = [
    { id: 'dota-map', label: '2D Карта & Интерфейс Доты', icon: Swords, badge: 'HUD Dota 2' },
    { id: 'codex', label: 'Герои (Кодекс)', icon: Shield, badge: '5 героев' },
    { id: 'arena', label: 'Арена Дуэлей', icon: Swords, badge: 'Симулятор' },
    { id: 'dice', label: 'Дайс-роллер', icon: Dice5, badge: 'D&D D20' },
    { id: 'creator', label: 'Конструктор Карт', icon: PlusCircle, badge: 'Новый герой' },
    { id: 'rules', label: 'Правила Игры', icon: BookOpen, badge: '8 сек = 1 ход' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#0f141c]/90 backdrop-blur-md border-b border-amber-900/30 shadow-2xl no-print">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-amber-950/40 via-red-950/40 to-slate-900/40 border-b border-amber-500/10 px-4 py-1 text-center text-xs text-amber-300/80 font-mono tracking-wider flex items-center justify-center gap-2">
        <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
        <span>ПРОТОТИП НАСТОЛЬНОЙ ИГРЫ: DOTA 2 × D&D × MULTIVERSE • СИСТЕМА «8 СЕКУНД = 1 ХОД»</span>
        <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo & Title */}
          <div 
            onClick={() => { playClickSound(); setActiveTab('codex'); }}
            className="flex items-center gap-3.5 cursor-pointer group"
          >
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-600 via-red-600 to-amber-900 p-0.5 shadow-lg shadow-amber-900/40 group-hover:scale-105 transition-transform">
              <div className="w-full h-full bg-[#0d1117] rounded-[10px] flex items-center justify-center">
                <Swords className="w-6 h-6 text-amber-400 group-hover:rotate-12 transition-transform" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-fantasy font-black text-xl sm:text-2xl bg-gradient-to-r from-amber-200 via-amber-400 to-red-400 bg-clip-text text-transparent">
                  CHRONICLES OF CHAOS
                </span>
                <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded bg-red-950/80 text-red-400 border border-red-800/40">
                  DOTA × D&D
                </span>
              </div>
              <p className="text-xs text-slate-400 font-sans">
                Настольная тактическая карточная ролевая игра
              </p>
            </div>
          </div>

          {/* Quick Actions (Audio & Print) */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleSoundToggle}
              title={soundOn ? "Выключить звук" : "Включить звук эффектов"}
              className={`p-2.5 rounded-lg border transition-all ${
                soundOn 
                  ? 'bg-amber-950/30 border-amber-500/40 text-amber-400 hover:bg-amber-900/40' 
                  : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:text-slate-200'
              }`}
            >
              {soundOn ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>

            <button
              onClick={handlePrint}
              title="Распечатать карточки для настольной игры"
              className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-xs text-slate-300 font-medium transition-all"
            >
              <Printer className="w-4 h-4 text-amber-400" />
              <span>Печать карт</span>
            </button>
          </div>

        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-1 sm:space-x-2 overflow-x-auto py-2 border-t border-slate-800/60 no-scrollbar">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  playClickSound();
                  setActiveTab(item.id);
                }}
                className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-gradient-to-r from-amber-600 to-red-600 text-white shadow-lg shadow-amber-900/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-amber-400/80'}`} />
                <span>{item.label}</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono ${
                  isActive ? 'bg-black/30 text-amber-200' : 'bg-slate-800 text-slate-400'
                }`}>
                  {item.badge}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
}
