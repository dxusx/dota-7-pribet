import React, { useState } from 'react';
import { 
  X, Shield, Heart, Zap, Swords, Target, Crosshair, 
  Sparkles, Award, BookOpen, Layers, Printer, Check 
} from 'lucide-react';
import { playClickSound } from '../utils/sound';

export default function HeroDetailModal({ hero, onClose, onSelectForDuel }) {
  const [selectedLvl, setSelectedLvl] = useState(1);
  const [inventory, setInventory] = useState([
    { id: 1, name: 'Blink Dagger (Кинжал телепортации)', slot: 'Артефакт', desc: 'Телепортация на 12 клеток вперед (0 сек)' },
    { id: 2, name: 'Healing Salve (Флакон исцеления)', slot: 'Расходник', desc: 'Восстанавливает 40 ХП за 8 сек' },
    { id: 3, name: 'Boots of Speed (Сапоги скорости)', slot: 'Обувь', desc: '+2 к скорости перемещения' }
  ]);

  if (!hero) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-5xl bg-[#101520] border border-amber-500/30 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-[#0c1017]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center">
              <Award className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-fantasy text-xl font-bold text-white">
                  {hero.name}
                </h3>
                <span className="text-xs px-2 py-0.5 rounded bg-amber-950/80 text-amber-300 border border-amber-800/40">
                  {hero.universe}
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  {hero.dndRole}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {hero.title}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => { playClickSound(); window.print(); }}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
              title="Распечатать лист персонажа"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              onClick={() => { playClickSound(); onClose(); }}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* Top Hero Banner & Lore */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-[#141b29] to-slate-900 border border-slate-800">
            <div className="flex flex-col items-center justify-center">
              <img 
                src={hero.avatar} 
                alt={hero.name} 
                className="w-32 h-32 rounded-2xl object-cover border-2 border-amber-500/40 shadow-xl"
              />
              <div className="mt-3 text-center">
                <span className="text-xs font-mono text-emerald-400 bg-emerald-950/50 px-2.5 py-1 rounded-full border border-emerald-800/30">
                  Базовый уровень: 1
                </span>
              </div>
            </div>

            <div className="md:col-span-2 space-y-3 flex flex-col justify-center">
              <blockquote className="text-sm italic text-amber-200/90 font-serif border-l-2 border-amber-500 pl-3">
                "{hero.quote}"
              </blockquote>
              <p className="text-xs text-slate-300 leading-relaxed">
                {hero.description}
              </p>
              <div className="flex items-center gap-3 pt-2 text-xs font-mono text-slate-400">
                <span className="flex items-center gap-1 text-emerald-400">
                  <Heart className="w-3.5 h-3.5" /> HP: {hero.stats.hp} ({hero.stats.hpRegen})
                </span>
                <span className="flex items-center gap-1 text-blue-400">
                  <Zap className="w-3.5 h-3.5" /> Мана: {hero.stats.mana} ({hero.stats.manaRegen})
                </span>
                <span className="flex items-center gap-1 text-purple-400">
                  <Shield className="w-3.5 h-3.5" /> Броня: {hero.stats.armor}
                </span>
              </div>
            </div>
          </div>

          {/* Detailed Skill Progression Matrix */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-fantasy text-sm font-bold text-amber-300 uppercase tracking-wider flex items-center gap-2">
                <Layers className="w-4 h-4 text-amber-400" />
                Сводная матрица прокачки навыков (Lvl 1 – 4)
              </h4>
              <div className="flex items-center gap-1 text-xs font-mono bg-slate-900 p-1 rounded-lg border border-slate-800">
                <span className="text-slate-400 mr-1">Просмотр уровня:</span>
                {[1, 2, 3, 4].map(lvl => (
                  <button
                    key={lvl}
                    onClick={() => { playClickSound(); setSelectedLvl(lvl); }}
                    className={`w-6 h-6 rounded font-bold transition-all ${
                      selectedLvl === lvl 
                        ? 'bg-amber-400 text-black shadow' 
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {hero.skills.map((skill) => (
                <div 
                  key={skill.id}
                  className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 font-bold text-xs flex items-center justify-center">
                          {skill.isUltimate ? '★' : skill.num}
                        </span>
                        <h5 className="text-sm font-bold text-white">
                          {skill.name}
                        </h5>
                      </div>
                      <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                        {skill.type}
                      </span>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed mb-3">
                      {skill.description}
                    </p>

                    {skill.scalingDesc && (
                      <div className="p-2.5 rounded-lg bg-black/40 border border-amber-900/30 text-xs font-mono text-amber-300/90 mb-3">
                        <div className="text-[10px] text-slate-400 mb-1">Прогрессия по уровням:</div>
                        {skill.scalingDesc}
                      </div>
                    )}
                  </div>

                  <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono text-slate-400">
                    <span>Время: <strong className="text-slate-200">{skill.castTime || 'Мгновенно'}</strong></span>
                    <span>КД: <strong className="text-slate-200">{skill.cooldown || '0'}</strong></span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* D&D Inventory & Equipment Slots */}
          <div className="p-5 rounded-2xl bg-slate-900/40 border border-slate-800">
            <h4 className="font-fantasy text-sm font-bold text-slate-200 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Swords className="w-4 h-4 text-amber-400" />
              Экипировка и Артефакты Настольной Партии
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {inventory.map((item) => (
                <div key={item.id} className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/60">
                  <div className="flex items-center justify-between text-[11px] font-mono text-amber-400 mb-1">
                    <span>{item.slot}</span>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  </div>
                  <div className="text-xs font-bold text-white mb-1">{item.name}</div>
                  <div className="text-[11px] text-slate-400 leading-tight">{item.desc}</div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-800 bg-[#0c1017] flex items-center justify-between">
          <span className="text-xs text-slate-400 font-mono">
            Система ходов: 8 секунд = 1 ход
          </span>
          <div className="flex gap-3">
            <button
              onClick={() => { playClickSound(); onClose(); }}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-lg transition-colors"
            >
              Закрыть
            </button>
            <button
              onClick={() => {
                playClickSound();
                onSelectForDuel(hero);
                onClose();
              }}
              className="px-4 py-2 bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white text-xs font-bold rounded-lg shadow-lg transition-all flex items-center gap-2"
            >
              <Swords className="w-4 h-4" />
              <span>Выбрать на Арену Дуэлей</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
