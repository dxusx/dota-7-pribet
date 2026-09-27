import React from 'react';
import { X, ExternalLink, Image as ImageIcon } from 'lucide-react';
import { playClickSound } from '../utils/sound';

export default function OriginalCardModal({ hero, onClose }) {
  if (!hero) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-4xl bg-[#131924] border border-amber-500/30 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-[#0c1017]">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/30">
              <ImageIcon className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h3 className="font-fantasy text-lg font-bold text-slate-100 flex items-center gap-2">
                Оригинал карточки: {hero.name}
              </h3>
              <p className="text-xs text-slate-400">
                Исходный черновик вашего друга из переписки
              </p>
            </div>
          </div>
          <button
            onClick={() => { playClickSound(); onClose(); }}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          {/* Card Image */}
          <div className="bg-black/60 rounded-xl p-3 border border-slate-800 flex flex-col items-center justify-center">
            <div className="text-xs font-mono text-slate-400 mb-2 flex items-center gap-1.5 self-start">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              Файл: {hero.cardImage}
            </div>
            <img 
              src={hero.cardImage} 
              alt={`Оригинальная карточка ${hero.name}`} 
              className="max-h-[580px] w-auto object-contain rounded-lg shadow-2xl border border-slate-700/50"
            />
          </div>

          {/* Side by side digitized details */}
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
              <h4 className="text-xs uppercase tracking-wider text-amber-400 font-semibold mb-2">
                Сравнение с оригиналом
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Мы бережно оцифровали все характеристики, тайминги в секундах/ходах, затраты маны и уровни прокачки из черновика. В веб-версии вы можете интерактивно переключать уровни (1–4) для просмотра точных скейлов урона и времени перезарядки.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
              <h4 className="text-xs uppercase tracking-wider text-slate-400 font-semibold mb-3">
                Оцифрованные базовые статы (Lvl 1):
              </h4>
              <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                <div className="bg-slate-800/60 p-2 rounded flex justify-between">
                  <span className="text-slate-400">ХП:</span>
                  <span className="text-emerald-400 font-bold">{hero.stats.hp}</span>
                </div>
                <div className="bg-slate-800/60 p-2 rounded flex justify-between">
                  <span className="text-slate-400">Реген:</span>
                  <span className="text-emerald-400">{hero.stats.hpRegen}</span>
                </div>
                <div className="bg-slate-800/60 p-2 rounded flex justify-between">
                  <span className="text-slate-400">Мана:</span>
                  <span className="text-blue-400 font-bold">{hero.stats.mana}</span>
                </div>
                <div className="bg-slate-800/60 p-2 rounded flex justify-between">
                  <span className="text-slate-400">Восст:</span>
                  <span className="text-blue-400">{hero.stats.manaRegen}</span>
                </div>
                <div className="bg-slate-800/60 p-2 rounded flex justify-between">
                  <span className="text-slate-400">Урон:</span>
                  <span className="text-red-400 font-bold">
                    {hero.stats.damage || `${hero.stats.melee?.damage} (бл.) / ${hero.stats.ranged?.damage} (дл.)`}
                  </span>
                </div>
                <div className="bg-slate-800/60 p-2 rounded flex justify-between">
                  <span className="text-slate-400">Крит:</span>
                  <span className="text-amber-400 font-bold">
                    {hero.stats.crit || `${hero.stats.melee?.crit} / ${hero.stats.ranged?.crit}`}
                  </span>
                </div>
                <div className="bg-slate-800/60 p-2 rounded flex justify-between">
                  <span className="text-slate-400">Дальность:</span>
                  <span className="text-cyan-400 font-bold">
                    {hero.stats.range || `${hero.stats.melee?.range} / ${hero.stats.ranged?.range}`}
                  </span>
                </div>
                <div className="bg-slate-800/60 p-2 rounded flex justify-between">
                  <span className="text-slate-400">Броня / Проб:</span>
                  <span className="text-purple-400 font-bold">{hero.stats.armor} / {hero.stats.penetration || hero.stats.melee?.penetration}</span>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
              <h4 className="text-xs uppercase tracking-wider text-slate-400 font-semibold mb-2">
                Базовые удары и особенности:
              </h4>
              <p className="text-xs text-slate-300 italic">
                {hero.basicAttacks}
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-[#0c1017] flex justify-end">
          <button
            onClick={() => { playClickSound(); onClose(); }}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg transition-colors"
          >
            Закрыть просмотр
          </button>
        </div>
      </div>
    </div>
  );
}
