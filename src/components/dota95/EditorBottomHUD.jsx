import React from 'react';
import { GRID_SIZE, TOWERS_DATA } from '../../data/dota95Data.js';
import { getAssetUrl } from '../../utils/assetUrl.js';
import { 
  Copy, Trash2, Crosshair, Move, Maximize2, 
  MapPin, Shield, Layers, HelpCircle 
} from 'lucide-react';

export default function EditorBottomHUD({
  objects,
  selectedObject,
  onCenterOnCell,
  onDuplicate,
  onDelete,
  onFitMap,
  totalObjectsCount
}) {
  return (
    <footer className="relative w-full h-[150px] flex items-end justify-between pointer-events-auto select-none bg-gradient-to-t from-black via-[#080b12] to-transparent px-3 pb-2 z-30">
      
      {/* ------------------------------------------------------------- */}
      {/* A. BOTTOM-LEFT: COMPACT DOTA 2 MINIMAP FRAME */}
      {/* ------------------------------------------------------------- */}
      <div className="relative flex items-end">
        <div className="relative w-[140px] h-[140px] bg-[#07090e] border-2 border-[#2b3548] rounded-xl overflow-hidden shadow-2xl p-0.5">
          <div 
            className="w-full h-full relative cursor-pointer"
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const clickX = e.clientX - rect.left;
              const clickY = e.clientY - rect.top;
              const targetC = Math.round((clickX / rect.width) * (GRID_SIZE - 1));
              const targetR = Math.round((clickY / rect.height) * (GRID_SIZE - 1));
              onCenterOnCell(targetR, targetC);
            }}
          >
            <svg className="w-full h-full" viewBox="0 0 95 95">
              {/* Bedrock & Ground */}
              <rect x="0" y="0" width="95" height="95" fill="#1a1a1c" />
              <rect x="2" y="2" width="91" height="91" fill="#4d7150" />

              {/* Lanes */}
              <rect x="6" y="6" width="5" height="74" fill="#5b825f" />
              <rect x="6" y="6" width="74" height="5" fill="#5b825f" />
              <rect x="16" y="84" width="72" height="5" fill="#5b825f" />
              <rect x="84" y="16" width="5" height="73" fill="#5b825f" />
              <line x1="16" y1="78" x2="78" y2="16" stroke="#5b825f" strokeWidth="6" />

              {/* River */}
              <path 
                d="M 2 26 L 8 29 L 18 33 L 32 38 L 47 47 L 58 56 L 65 72 L 66 86 L 68 92" 
                fill="none" 
                stroke="#8294b6" 
                strokeWidth="5" 
                strokeLinecap="round" 
              />

              {/* Bases */}
              <circle cx="0" cy="94" r="17" fill="#8b8788" />
              <circle cx="0" cy="94" r="6" fill="#384457" />
              <circle cx="94" cy="0" r="17" fill="#8b8788" />
              <circle cx="94" cy="0" r="6" fill="#384457" />

              {/* Roshan Pit */}
              <circle cx="42" cy="24" r="3.5" fill="#7f1d1d" stroke="#ef4444" strokeWidth="0.8" />

              {/* Dynamic Objects on Minimap */}
              {objects.map(obj => {
                const isSelected = selectedObject?.id === obj.id;
                const isHero = obj.type === 'hero';
                const isRadiant = obj.team === 'radiant';
                const isDire = obj.team === 'dire';
                const color = isRadiant ? '#34d399' : isDire ? '#f87171' : '#f59e0b';

                return (
                  <g key={obj.id}>
                    {isSelected && (
                      <circle cx={obj.x} cy={obj.y} r="5" fill="none" stroke="#fbbf24" strokeWidth="1.2" className="animate-ping" />
                    )}
                    <circle
                      cx={obj.x}
                      cy={obj.y}
                      r={isHero ? (isSelected ? '3.5' : '2.5') : '1.8'}
                      fill={color}
                      stroke={isSelected ? '#ffffff' : '#000000'}
                      strokeWidth="0.7"
                    />
                  </g>
                );
              })}
            </svg>
          </div>
          
          <div className="absolute top-1 left-1.5 text-[8px] font-mono font-bold text-slate-400 bg-black/80 px-1 rounded pointer-events-none">
            95×95
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* B. BOTTOM-CENTER: SELECTED OBJECT HUD CONSOLE */}
      {/* ------------------------------------------------------------- */}
      <div className="flex items-center bg-[#0d121b]/95 border-t-2 border-x-2 border-[#2b374c] rounded-t-2xl shadow-2xl backdrop-blur-md px-4 py-2 gap-4">
        {selectedObject ? (
          <div className="flex items-center gap-4">
            {/* Portrait */}
            <div className={`relative w-14 h-14 rounded-lg overflow-hidden border-2 bg-black flex items-center justify-center shrink-0 shadow-inner ${
              selectedObject.team === 'radiant' ? 'border-emerald-500' : selectedObject.team === 'dire' ? 'border-rose-500' : 'border-amber-500'
            }`}>
              {selectedObject.avatar ? (
                <img 
                  src={getAssetUrl(selectedObject.avatar)} 
                  alt={selectedObject.name} 
                  className="w-full h-full object-cover object-top" 
                />
              ) : (
                <span className="text-2xl">{selectedObject.icon}</span>
              )}
            </div>

            {/* Info */}
            <div className="flex flex-col min-w-[140px]">
              <div className="text-sm font-fantasy font-black text-white leading-tight">
                {selectedObject.name}
              </div>
              <div className="text-[10px] font-mono text-slate-400 uppercase mt-0.5">
                {selectedObject.type} • <span className={selectedObject.team === 'radiant' ? 'text-emerald-400 font-bold' : selectedObject.team === 'dire' ? 'text-rose-400 font-bold' : 'text-amber-400 font-bold'}>{selectedObject.team.toUpperCase()}</span>
              </div>
              <div className="text-[11px] font-mono text-amber-300 font-bold mt-1">
                Клетка: X: {selectedObject.x}, Y: {selectedObject.y}
              </div>
            </div>

            <div className="h-8 w-px bg-slate-800"></div>

            {/* Quick Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => onCenterOnCell(selectedObject.y, selectedObject.x)}
                className="px-3 py-1.5 rounded-lg bg-[#161d2a] hover:bg-[#202b3c] border border-[#2c3b52] text-xs font-mono font-bold text-slate-200 flex items-center gap-1.5 cursor-pointer shadow transition-colors"
                title="Центрировать камеру на объекте"
              >
                <Crosshair className="w-3.5 h-3.5 text-cyan-400" />
                <span>КАМЕРА</span>
              </button>

              <button
                onClick={onDuplicate}
                className="px-3 py-1.5 rounded-lg bg-[#182232] hover:bg-amber-500 hover:text-black border border-[#2f4059] text-xs font-mono font-bold text-amber-300 flex items-center gap-1.5 cursor-pointer shadow transition-all"
                title="Дублировать объект [Ctrl + D]"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>ДУБЛИРОВАТЬ</span>
              </button>

              <button
                onClick={onDelete}
                className="px-3 py-1.5 rounded-lg bg-rose-950/70 hover:bg-rose-900 border border-rose-600/70 text-xs font-mono font-bold text-rose-300 hover:text-white flex items-center gap-1.5 cursor-pointer shadow transition-colors"
                title="Удалить объект с карты [Del]"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>УДАЛИТЬ</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3 py-2 px-4 text-xs font-mono text-slate-400">
            <span className="text-amber-400 text-base">💡</span>
            <span>Кликните по любому герою, крипу или вышке для выбора, либо зажмите ЛКМ для перемещения.</span>
          </div>
        )}
      </div>

      {/* ------------------------------------------------------------- */}
      {/* C. BOTTOM-RIGHT: QUICK TOOLS & METRICS */}
      {/* ------------------------------------------------------------- */}
      <div className="flex items-center gap-2 mb-1">
        <div className="flex items-center gap-3 bg-[#0d121b]/95 border border-[#2b374c] px-3 py-2 rounded-xl shadow-xl text-xs font-mono text-slate-300">
          <div>
            <span className="text-slate-400">Всего: </span>
            <span className="font-bold text-amber-400">{totalObjectsCount}</span>
          </div>

          <div className="h-3 w-px bg-slate-800"></div>

          <button
            onClick={onFitMap}
            className="hover:text-white flex items-center gap-1 text-[11px] cursor-pointer"
            title="Показать всю карту"
          >
            <Maximize2 className="w-3 h-3 text-cyan-400" />
            <span>Вся карта</span>
          </button>
        </div>
      </div>

    </footer>
  );
}
