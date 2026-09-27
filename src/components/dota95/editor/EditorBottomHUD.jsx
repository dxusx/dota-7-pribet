import React from 'react';
import { GRID_SIZE } from '../../../data/dota95Data.js';
import { getAssetUrl } from '../../../utils/assetUrl.js';
import { 
  Copy, Trash2, Crosshair, Maximize2 
} from 'lucide-react';

export default function EditorBottomHUD({
  objects,
  selectedObject,
  onCenterOnCell,
  onDuplicate,
  onDelete,
  onFitMap,
  zoom,
  camera
}) {
  const radiantCount = objects.filter(o => o.team === 'radiant').length;
  const direCount = objects.filter(o => o.team === 'dire').length;

  return (
    <footer className="relative w-full h-[135px] flex items-end justify-between pointer-events-auto select-none bg-gradient-to-t from-black via-[#0d0e12] to-transparent px-3 pb-2 z-30">
      
      {/* ------------------------------------------------------------- */}
      {/* A. BOTTOM-LEFT: COMPACT DOTA 2 MINIMAP FRAME */}
      {/* ------------------------------------------------------------- */}
      <div className="relative flex items-end">
        <div className="relative w-[125px] h-[125px] bg-[#07080a] border-2 border-[#2b2d38] overflow-hidden shadow-[0_4px_16px_rgba(0,0,0,0.9)] p-0.5">
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
          
          <div className="absolute top-0.5 left-1 text-[7px] font-mono font-bold text-[#888b99] bg-black/90 px-1 border border-[#2b2d38] pointer-events-none">
            95×95
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* B. BOTTOM-CENTER: DOTA-STYLE TACTICAL HUD CONSOLE */}
      {/* ------------------------------------------------------------- */}
      <div className="flex items-center bg-[#111216] border-t-2 border-x-2 border-[#2b2d38] shadow-[0_-2px_15px_rgba(0,0,0,0.8)] px-3 py-1.5 gap-3">
        {selectedObject ? (
          <div className="flex items-center gap-3">
            {/* Square Portrait */}
            <div className={`w-11 h-11 bg-black border shrink-0 flex items-center justify-center ${
              selectedObject.team === 'radiant' ? 'border-[#1b5e3f]' : selectedObject.team === 'dire' ? 'border-[#8a2424]' : 'border-[#8a681c]'
            }`}>
              {selectedObject.avatar ? (
                <img 
                  src={getAssetUrl(selectedObject.avatar)} 
                  alt={selectedObject.name} 
                  className="w-full h-full object-cover object-top" 
                />
              ) : (
                <span className="text-xl">{selectedObject.icon}</span>
              )}
            </div>

            {/* Quick Details */}
            <div className="flex flex-col min-w-[130px]">
              <div className="text-xs font-fantasy font-black text-white leading-tight truncate">
                {selectedObject.name}
              </div>
              <div className="text-[9px] font-mono text-[#8a8e9e] uppercase">
                {selectedObject.type} • <span className={selectedObject.team === 'radiant' ? 'text-[#34d399] font-bold' : selectedObject.team === 'dire' ? 'text-[#f87171] font-bold' : 'text-[#facc15] font-bold'}>{selectedObject.team.toUpperCase()}</span>
              </div>
              <div className="text-[10px] font-mono text-[#dfb652] font-black mt-0.5">
                CELL: X {selectedObject.x} | Y {selectedObject.y}
              </div>
            </div>

            <div className="h-7 w-px bg-[#262833]"></div>

            {/* Tactical Action Buttons */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => onCenterOnCell(selectedObject.y, selectedObject.x)}
                className="px-2.5 py-1 bg-[#171820] hover:bg-[#20222b] border border-[#2d303d] text-[#b3b7c4] hover:text-white text-[10px] font-mono font-bold flex items-center gap-1 cursor-pointer transition-colors"
                title="Центрировать камеру на объекте"
              >
                <Crosshair className="w-3 h-3 text-[#38bdf8]" />
                <span>FOCUS</span>
              </button>

              <button
                onClick={onDuplicate}
                className="px-2.5 py-1 bg-gradient-to-b from-[#382b13] to-[#201809] hover:from-[#453618] hover:to-[#281f0b] border border-[#a17920] text-[#fce89e] text-[10px] font-mono font-black uppercase flex items-center gap-1 cursor-pointer transition-colors"
                title="Дублировать объект [Ctrl + D]"
              >
                <Copy className="w-3 h-3" />
                <span>DUPLICATE</span>
              </button>

              <button
                onClick={onDelete}
                className="px-2.5 py-1 bg-gradient-to-b from-[#3b1416] to-[#240c0d] hover:from-[#4a1a1c] hover:to-[#2e1011] border border-[#8f2828] text-[#fca5a5] text-[10px] font-mono font-black uppercase flex items-center gap-1 cursor-pointer transition-colors"
                title="Удалить объект [Del]"
              >
                <Trash2 className="w-3 h-3 text-[#ef4444]" />
                <span>DELETE</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3 py-1 px-3 text-[10px] font-mono text-[#767a88]">
            <span className="text-[#dfb652] text-sm">💡</span>
            <span>Кликните по любому объекту для выбора, либо зажмите ЛКМ и перетащите на новую клетку.</span>
          </div>
        )}
      </div>

      {/* ------------------------------------------------------------- */}
      {/* C. BOTTOM-RIGHT: METRICS & CONTROLS */}
      {/* ------------------------------------------------------------- */}
      <div className="flex items-center gap-2 mb-0.5">
        <div className="flex items-center gap-2.5 bg-[#111216] border border-[#2b2d38] px-3 py-1.5 text-[10px] font-mono text-[#8f93a2] shadow-lg">
          <div>
            <span>UNITS: </span>
            <span className="font-bold text-[#dfb652]">{objects.length}</span>
            <span className="text-[#595d6c] ml-1">({radiantCount}R / {direCount}D)</span>
          </div>

          <div className="h-3 w-px bg-[#262833]"></div>

          <button
            onClick={onFitMap}
            className="hover:text-white flex items-center gap-1 text-[10px] cursor-pointer text-[#a2a6b5]"
            title="Показать всю карту"
          >
            <Maximize2 className="w-3 h-3 text-[#38bdf8]" />
            <span>FIT</span>
          </button>
        </div>
      </div>

    </footer>
  );
}
