import React, { useState } from 'react';
import { 
  BookOpen, Clock, ShieldAlert, Activity, Flame, 
  HelpCircle, ChevronDown, ChevronUp, Sparkles, CheckCircle2 
} from 'lucide-react';
import { GAME_RULES } from '../data/rules';
import { playClickSound } from '../utils/sound';

export default function Rulebook() {
  const [openSection, setOpenSection] = useState('time-economy');

  const icons = {
    Clock: Clock,
    ShieldAlert: ShieldAlert,
    Activity: Activity,
    Flame: Flame,
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      {/* Banner */}
      <div className="p-5 rounded-2xl bg-[#121722] border border-amber-900/30 text-center">
        <h2 className="font-fantasy text-xl sm:text-2xl font-black text-amber-200 flex items-center justify-center gap-2">
          <BookOpen className="w-6 h-6 text-amber-400" />
          Справочник Правил и Боевой Механики
        </h2>
        <p className="text-xs text-slate-400 mt-1 max-w-2xl mx-auto">
          Официальный свод правил настольной игры: квантование времени по 8 секунд, расчет урона и взаимодействия способностей.
        </p>
      </div>

      {/* Accordion Sections */}
      <div className="space-y-4">
        {GAME_RULES.sections.map((section) => {
          const Icon = icons[section.icon] || Activity;
          const isOpen = openSection === section.id;

          return (
            <div 
              key={section.id}
              className={`rounded-2xl border transition-all overflow-hidden ${
                isOpen 
                  ? 'bg-[#101520] border-amber-500/40 shadow-xl' 
                  : 'bg-[#0d1117] border-slate-800 hover:border-slate-700'
              }`}
            >
              {/* Header Toggle */}
              <button
                onClick={() => {
                  playClickSound();
                  setOpenSection(isOpen ? null : section.id);
                }}
                className="w-full p-4 sm:p-5 flex items-center justify-between text-left cursor-pointer"
              >
                <div className="flex items-center gap-3.5">
                  <div className={`p-2.5 rounded-xl border ${
                    isOpen 
                      ? 'bg-amber-500/20 border-amber-500/40 text-amber-300' 
                      : 'bg-slate-800 border-slate-700 text-slate-400'
                  }`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-fantasy text-base sm:text-lg font-bold text-white">
                      {section.title}
                    </h3>
                  </div>
                </div>

                <div className="p-1 rounded-lg bg-slate-800 text-slate-400">
                  {isOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </div>
              </button>

              {/* Collapsible Body */}
              {isOpen && (
                <div className="p-5 pt-0 border-t border-slate-800/80 space-y-4 animate-in fade-in duration-200">
                  {section.content.map((item, idx) => (
                    <div key={idx} className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-2">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 font-mono flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                        {item.heading}
                      </h4>

                      {item.text && (
                        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans">
                          {item.text}
                        </p>
                      )}

                      {item.list && (
                        <ul className="space-y-1.5 pt-1">
                          {item.list.map((li, lIdx) => (
                            <li key={lIdx} className="text-xs text-slate-300 flex items-start gap-2">
                              <span className="text-amber-400 font-bold">›</span>
                              <span>{li}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Quick Summary Card for Master */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-amber-950/40 via-red-950/40 to-slate-900/40 border border-amber-600/30 text-xs text-slate-300 space-y-2">
        <div className="font-fantasy font-bold text-sm text-amber-300 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-400" />
          Памятка для Игроков за Столом:
        </div>
        <p className="leading-relaxed">
          Карточки можно распечатать прямо из браузера (кнопка «Печать карт» в шапке сайта). Каждый игрок держит карточку перед собой, отмечая текущее ХП, ману и перезарядку кубиками или жетонами. 
        </p>
      </div>

    </div>
  );
}
