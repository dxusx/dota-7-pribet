import React from 'react';
import { DOTA_ITEMS } from '../../data/dotaItems';
import { playClickSound, playSpellSound } from '../../utils/sound';

export default function DotaInventory({ 
  items = DOTA_ITEMS, 
  gold = 2450, 
  kda = '4 / 1 / 7',
  onActivateItem 
}) {
  return (
    <div className="flex items-center gap-2 select-none">
      
      {/* 6 Main Inventory Slots */}
      <div className="grid grid-cols-3 gap-1 bg-[#0a0d13] p-1 rounded-sm border border-[#2b3548]">
        {Array.from({ length: 6 }).map((_, idx) => {
          const item = items[idx];
          return (
            <div
              key={idx}
              onClick={() => {
                if (item && item.type === 'active') {
                  playSpellSound();
                  onActivateItem && onActivateItem(item);
                } else if (item) {
                  playClickSound();
                }
              }}
              className={`w-11 h-9 sm:w-12 sm:h-10 bg-[#121620] border relative group rounded-xs flex items-center justify-center transition-all ${
                item 
                  ? 'border-[#3b475f] hover:border-amber-400/80 cursor-pointer shadow-inner' 
                  : 'border-[#1e2430]'
              }`}
            >
              {item ? (
                <>
                  <img 
                    src={item.image} 
                    alt={item.name} 
                    className="w-full h-full object-cover rounded-xs"
                  />
                  {/* Active Border Glow */}
                  {item.type === 'active' && (
                    <div className="absolute top-0.5 right-0.5 w-1.5 h-1.5 rounded-full bg-cyan-400"></div>
                  )}

                  {/* Item Tooltip */}
                  <div className="hidden group-hover:block absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-48 p-2 bg-[#0d121c] border border-amber-500/50 rounded-lg shadow-2xl z-50 text-left pointer-events-none">
                    <div className="text-xs font-bold text-amber-300 font-fantasy">{item.name}</div>
                    <div className="text-[10px] text-cyan-300 font-mono">
                      {item.type === 'active' ? '⚡ Активный предмет' : '🛡️ Пассивный бонус'}
                    </div>
                    <p className="text-[10px] text-slate-300 mt-1 leading-snug">{item.description}</p>
                    {item.manaCost > 0 && (
                      <div className="text-[9px] text-blue-400 font-mono mt-1">Мана: {item.manaCost}</div>
                    )}
                  </div>
                </>
              ) : (
                <div className="w-2 h-2 rounded-full bg-slate-800/40"></div>
              )}
            </div>
          );
        })}
      </div>

      {/* TP Scroll & Neutral Slot */}
      <div className="flex flex-col gap-1">
        {/* TP Scroll */}
        <div 
          onClick={() => { playSpellSound(); }}
          className="w-8 h-7 sm:w-9 sm:h-8 bg-[#121620] border border-[#3b475f] hover:border-amber-400 rounded-xs flex items-center justify-center cursor-pointer group relative"
          title="Town Portal Scroll (Телепортация на фонтан)"
        >
          <img 
            src="https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/tpscroll.png" 
            alt="TP Scroll" 
            className="w-full h-full object-cover rounded-xs"
          />
        </div>

        {/* Neutral Item Slot */}
        <div 
          className="w-8 h-7 sm:w-9 sm:h-8 bg-[#121620] border border-dashed border-[#3b475f] rounded-xs flex items-center justify-center"
          title="Слот нейтрального предмета"
        >
          <span className="text-[9px] text-slate-500 font-mono">NEU</span>
        </div>
      </div>

      {/* Gold & KDA Info */}
      <div className="hidden xl:flex flex-col justify-between py-0.5 text-right font-mono">
        <div className="flex items-center justify-end gap-1 text-amber-400 font-bold text-xs sm:text-sm">
          <span>{gold}</span>
          <span className="text-yellow-500">🪙</span>
        </div>
        <div className="text-[10px] text-slate-400">
          KDA: <strong className="text-slate-200">{kda}</strong>
        </div>
        <div className="text-[9px] text-emerald-400">
          Выкуп: готов
        </div>
      </div>

    </div>
  );
}
