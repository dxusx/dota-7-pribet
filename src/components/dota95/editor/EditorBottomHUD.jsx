import React from 'react';
import { GRID_SIZE } from '../../../data/dota95Data.js';
import { getAssetUrl } from '../../../utils/assetUrl.js';
import { 
  Copy, Trash2, Crosshair, Maximize2, ZoomIn, ZoomOut, 
  ChevronUp, ChevronDown, Compass, Shield, Swords, Layers
} from 'lucide-react';

export default function EditorBottomHUD({
  objects,
  selectedObject,
  onCenterOnCell,
  onUpdateObject,
  onDuplicate,
  onDelete,
  onFitMap,
  zoom,
  onZoomIn,
  onZoomOut,
  camera
}) {
  const radiantCount = objects.filter(o => o.team === 'radiant').length;
  const direCount = objects.filter(o => o.team === 'dire').length;
  const neutralCount = objects.filter(o => o.team === 'neutral').length;

  return (
    <footer className="relative w-full h-[145px] bg-[#0c0d12] border-t-2 border-[#2b2d39] flex items-stretch select-none pointer-events-auto z-30 shadow-[0_-8px_30px_rgba(0,0,0,0.95)]">
      
      {/* ----------------------------------------------------------------- */}
      {/* MODULE 1: DOTA 2 MINIMAP (INTEGRATED BOTTOM-LEFT ANCHOR) */}
      {/* ----------------------------------------------------------------- */}
      <div className="w-[145px] h-full bg-[#07080a] border-r-2 border-[#252834] p-1 flex flex-col justify-between relative shrink-0">
        <div 
          className="w-full flex-1 relative cursor-pointer overflow-hidden border border-[#1e2029]"
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const clickX = e.clientX - rect.left;
            const clickY = e.clientY - rect.top;
            const targetC = Math.round((clickX / rect.width) * (GRID_SIZE - 1));
            const targetR = Math.round((clickY / rect.height) * (GRID_SIZE - 1));
            onCenterOnCell(targetR, targetC);
          }}
          title="Кликните на миникарту для перехода"
        >
          <svg className="w-full h-full" viewBox="0 0 95 95">
            {/* Bedrock & Ground */}
            <rect x="0" y="0" width="95" height="95" fill="#15171e" />
            <rect x="2" y="2" width="91" height="91" fill="#3e5942" />

            {/* Lanes */}
            <rect x="6" y="6" width="5" height="74" fill="#4d6f51" />
            <rect x="6" y="6" width="74" height="5" fill="#4d6f51" />
            <rect x="16" y="84" width="72" height="5" fill="#4d6f51" />
            <rect x="84" y="16" width="5" height="73" fill="#4d6f51" />
            <line x1="16" y1="78" x2="78" y2="16" stroke="#4d6f51" strokeWidth="6" />

            {/* River */}
            <path 
              d="M 2 26 L 8 29 L 18 33 L 32 38 L 47 47 L 58 56 L 65 72 L 66 86 L 68 92" 
              fill="none" 
              stroke="#6b86a8" 
              strokeWidth="5" 
              strokeLinecap="round" 
            />

            {/* Bases */}
            <circle cx="0" cy="94" r="17" fill="#6f727c" />
            <circle cx="0" cy="94" r="6" fill="#1b5e3f" />
            <circle cx="94" cy="0" r="17" fill="#6f727c" />
            <circle cx="94" cy="0" r="6" fill="#8a2424" />

            {/* Roshan Pit */}
            <circle cx="42" cy="24" r="3.5" fill="#5c1616" stroke="#ef4444" strokeWidth="0.8" />

            {/* Camera Viewport Rect on Minimap */}
            {camera && (
              <rect
                x={Math.max(0, Math.min(95, -camera.x / (24 * camera.zoom)))}
                y={Math.max(0, Math.min(95, -camera.y / (24 * camera.zoom)))}
                width={Math.max(8, Math.min(95, (window.innerWidth || 1200) / (24 * camera.zoom)))}
                height={Math.max(8, Math.min(95, ((window.innerHeight || 800) - 180) / (24 * camera.zoom)))}
                fill="none"
                stroke="#dfb652"
                strokeWidth="0.9"
                opacity="0.7"
              />
            )}

            {/* Dynamic Objects on Minimap */}
            {objects.map(obj => {
              const isSelected = selectedObject?.id === obj.id;
              const isHero = obj.type === 'hero';
              const isRadiant = obj.team === 'radiant';
              const isDire = obj.team === 'dire';
              const color = isRadiant ? '#34d399' : isDire ? '#f87171' : '#dfb652';

              return (
                <g key={obj.id}>
                  {isSelected && (
                    <circle cx={obj.x} cy={obj.y} r="5.5" fill="none" stroke="#fde047" strokeWidth="1.2" className="animate-ping" />
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

          {/* Minimap Label Overlay */}
          <div className="absolute top-0.5 left-1 text-[7px] font-mono font-bold text-[#888b99] bg-black/85 px-1 border border-[#252834] pointer-events-none">
            MINIMAP 95×95
          </div>
        </div>
      </div>

      {/* ----------------------------------------------------------------- */}
      {/* MODULE 2: DOTA 2 CENTRAL CONSOLE (HERO / OBJECT HUD) */}
      {/* ----------------------------------------------------------------- */}
      <div className="flex-1 min-w-0 bg-[#0f1117] border-r-2 border-[#252834] p-3 flex items-center justify-between relative shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
        {selectedObject ? (
          <div className="w-full flex items-center justify-between gap-4">
            
            {/* LEFT PART: PORTRAIT + NAME + BADGES */}
            <div className="flex items-center gap-3.5 min-w-0">
              {/* Beveled Square Portrait */}
              <div className={`relative w-[68px] h-[68px] bg-black border-2 shrink-0 flex items-center justify-center shadow-lg ${
                selectedObject.team === 'radiant' 
                  ? 'border-[#1b5e3f] shadow-[0_0_10px_rgba(27,94,63,0.4)]' 
                  : selectedObject.team === 'dire' 
                  ? 'border-[#8a2424] shadow-[0_0_10px_rgba(138,36,36,0.4)]' 
                  : 'border-[#8a681c] shadow-[0_0_10px_rgba(138,104,28,0.4)]'
              }`}>
                {selectedObject.avatar ? (
                  <img 
                    src={getAssetUrl(selectedObject.avatar)} 
                    alt={selectedObject.name} 
                    className="w-full h-full object-cover object-top" 
                  />
                ) : (
                  <span className="text-3xl">{selectedObject.icon}</span>
                )}
                {/* Team Notch */}
                <div className={`absolute -bottom-1.5 left-1/2 -translate-x-1/2 text-[7px] font-mono font-black uppercase px-1.5 border ${
                  selectedObject.team === 'radiant' 
                    ? 'bg-[#0f291c] border-[#1b5e3f] text-[#34d399]' 
                    : selectedObject.team === 'dire' 
                    ? 'bg-[#301213] border-[#8a2424] text-[#f87171]' 
                    : 'bg-[#2b220d] border-[#8a681c] text-[#dfb652]'
                }`}>
                  {selectedObject.team === 'radiant' ? 'RAD' : selectedObject.team === 'dire' ? 'DIRE' : 'NEUT'}
                </div>
              </div>

              {/* Identity & Team Selector */}
              <div className="flex flex-col min-w-0 gap-1">
                <div className="text-base font-fantasy font-black text-[#f0f2f8] leading-tight truncate tracking-wide">
                  {selectedObject.name}
                </div>
                
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono font-bold text-[#dfb652] uppercase bg-[#181a24] px-1.5 py-0.5 border border-[#2b2d3d]">
                    {selectedObject.type}
                  </span>
                  
                  {/* Quick Team Switcher in HUD */}
                  {onUpdateObject && (
                    <div className="flex items-center bg-[#090a0d] p-0.5 border border-[#252834]">
                      <button
                        onClick={() => onUpdateObject(selectedObject.id, { team: 'radiant' })}
                        className={`px-1.5 py-0.5 text-[8px] font-mono font-black uppercase cursor-pointer border ${
                          selectedObject.team === 'radiant'
                            ? 'bg-[#123824] border-[#228250] text-[#6ee7b7]'
                            : 'bg-transparent border-transparent text-[#626673] hover:text-[#34d399]'
                        }`}
                      >
                        RAD
                      </button>
                      <button
                        onClick={() => onUpdateObject(selectedObject.id, { team: 'dire' })}
                        className={`px-1.5 py-0.5 text-[8px] font-mono font-black uppercase cursor-pointer border ${
                          selectedObject.team === 'dire'
                            ? 'bg-[#3b1416] border-[#992a2a] text-[#fca5a5]'
                            : 'bg-transparent border-transparent text-[#626673] hover:text-[#f87171]'
                        }`}
                      >
                        DIRE
                      </button>
                      <button
                        onClick={() => onUpdateObject(selectedObject.id, { team: 'neutral' })}
                        className={`px-1.5 py-0.5 text-[8px] font-mono font-black uppercase cursor-pointer border ${
                          selectedObject.team === 'neutral'
                            ? 'bg-[#382b13] border-[#a17920] text-[#fde047]'
                            : 'bg-transparent border-transparent text-[#626673] hover:text-[#facc15]'
                        }`}
                      >
                        NEUT
                      </button>
                    </div>
                  )}
                </div>

                {/* Coordinate Steppers */}
                <div className="flex items-center gap-3 mt-0.5 text-[10px] font-mono text-[#a0a4b4]">
                  <div className="flex items-center gap-1 bg-[#141620] px-2 py-0.5 border border-[#262836]">
                    <span className="text-[#848897]">X (COL):</span>
                    <span className="font-bold text-[#dfb652]">{selectedObject.x}</span>
                    {onUpdateObject && (
                      <div className="flex items-center ml-1">
                        <button 
                          onClick={() => onUpdateObject(selectedObject.id, { x: Math.max(0, selectedObject.x - 1) })}
                          className="w-3.5 h-3.5 bg-[#1f2230] hover:bg-[#2e3246] text-white flex items-center justify-center cursor-pointer border border-[#373b50]"
                        >
                          -
                        </button>
                        <button 
                          onClick={() => onUpdateObject(selectedObject.id, { x: Math.min(94, selectedObject.x + 1) })}
                          className="w-3.5 h-3.5 bg-[#1f2230] hover:bg-[#2e3246] text-white flex items-center justify-center cursor-pointer border border-[#373b50] ml-0.5"
                        >
                          +
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-1 bg-[#141620] px-2 py-0.5 border border-[#262836]">
                    <span className="text-[#848897]">Y (ROW):</span>
                    <span className="font-bold text-[#dfb652]">{selectedObject.y}</span>
                    {onUpdateObject && (
                      <div className="flex items-center ml-1">
                        <button 
                          onClick={() => onUpdateObject(selectedObject.id, { y: Math.max(0, selectedObject.y - 1) })}
                          className="w-3.5 h-3.5 bg-[#1f2230] hover:bg-[#2e3246] text-white flex items-center justify-center cursor-pointer border border-[#373b50]"
                        >
                          -
                        </button>
                        <button 
                          onClick={() => onUpdateObject(selectedObject.id, { y: Math.min(94, selectedObject.y + 1) })}
                          className="w-3.5 h-3.5 bg-[#1f2230] hover:bg-[#2e3246] text-white flex items-center justify-center cursor-pointer border border-[#373b50] ml-0.5"
                        >
                          +
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT PART: ACTION BUTTONS */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => onCenterOnCell(selectedObject.y, selectedObject.x)}
                className="px-3 py-2 bg-[#171922] hover:bg-[#222533] border border-[#2d3142] text-[#b3b7c4] hover:text-white text-[11px] font-mono font-bold flex items-center gap-1.5 cursor-pointer transition-colors shadow"
                title="Центрировать камеру на объекте [F]"
              >
                <Crosshair className="w-3.5 h-3.5 text-[#38bdf8]" />
                <span>FOCUS [F]</span>
              </button>

              <button
                onClick={onDuplicate}
                className="px-3.5 py-2 bg-gradient-to-b from-[#382b13] to-[#201809] hover:from-[#453618] hover:to-[#281f0b] border border-[#a17920] text-[#fce89e] text-[11px] font-mono font-black uppercase flex items-center gap-1.5 cursor-pointer transition-all shadow"
                title="Дублировать объект [Ctrl + D]"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>DUPLICATE [Ctrl+D]</span>
              </button>

              <button
                onClick={onDelete}
                className="px-3.5 py-2 bg-gradient-to-b from-[#3b1416] to-[#240c0d] hover:from-[#4a1a1c] hover:to-[#2e1011] border border-[#8f2828] text-[#fca5a5] text-[11px] font-mono font-black uppercase flex items-center gap-1.5 cursor-pointer transition-all shadow"
                title="Удалить объект [Del]"
              >
                <Trash2 className="w-3.5 h-3.5 text-[#ef4444]" />
                <span>DELETE [Del]</span>
              </button>
            </div>

          </div>
        ) : (
          <div className="w-full flex items-center justify-between px-3 text-[#767a88]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#161720] border border-[#2b2d3d] flex items-center justify-center text-[#dfb652] text-lg font-black font-fantasy">
                D2
              </div>
              <div>
                <div className="text-xs font-fantasy font-black text-[#d0d3de] tracking-wider uppercase">
                  DOTA TACTICAL MAP CONSOLE
                </div>
                <div className="text-[10px] font-mono text-[#7e8292]">
                  Выберите объект на поле или перетащите нового персонажа из левой библиотеки.
                </div>
              </div>
            </div>

            <div className="hidden lg:flex items-center gap-4 text-[9px] font-mono text-[#8a8e9e] border-l border-[#252834] pl-4">
              <div><span className="text-[#dfb652] font-bold">[ЛКМ]</span> Выбрать / Тянуть</div>
              <div><span className="text-[#dfb652] font-bold">[Ctrl+D]</span> Дублировать</div>
              <div><span className="text-[#dfb652] font-bold">[Del]</span> Удалить</div>
              <div><span className="text-[#dfb652] font-bold">[Space/СКМ]</span> Панорама</div>
            </div>
          </div>
        )}
      </div>

      {/* ----------------------------------------------------------------- */}
      {/* MODULE 3: METRICS & ZOOM CONTROLS (INTEGRATED RIGHT FLANK) */}
      {/* ----------------------------------------------------------------- */}
      <div className="w-[190px] h-full bg-[#0a0b0e] p-2.5 flex flex-col justify-between shrink-0">
        
        {/* TOTAL OBJECTS & BALANCE */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-[10px] font-mono">
            <span className="text-[#838898] font-bold">TOTAL OBJECTS:</span>
            <span className="text-[#dfb652] font-black">{objects.length}</span>
          </div>

          <div className="grid grid-cols-3 gap-1 text-[8px] font-mono text-center">
            <div className="bg-[#0b1a13] border border-[#1b5e3f] text-[#34d399] py-0.5 font-bold">
              RAD: {radiantCount}
            </div>
            <div className="bg-[#240c0e] border border-[#8a2424] text-[#f87171] py-0.5 font-bold">
              DIRE: {direCount}
            </div>
            <div className="bg-[#21190a] border border-[#8a681c] text-[#dfb652] py-0.5 font-bold">
              NEUT: {neutralCount}
            </div>
          </div>
        </div>

        {/* ZOOM & FIT CONTROLS */}
        <div className="space-y-1">
          <div className="flex items-center justify-between bg-[#13151d] p-1 border border-[#252735]">
            <button
              onClick={onZoomOut}
              className="w-5 h-5 bg-[#1c1f2b] hover:bg-[#282c3d] text-white text-xs font-mono flex items-center justify-center cursor-pointer border border-[#33374b]"
              title="Уменьшить масштаб"
            >
              -
            </button>

            <span className="text-[10px] font-mono font-black text-[#dfb652]">
              {Math.round(zoom * 100)}%
            </span>

            <button
              onClick={onZoomIn}
              className="w-5 h-5 bg-[#1c1f2b] hover:bg-[#282c3d] text-white text-xs font-mono flex items-center justify-center cursor-pointer border border-[#33374b]"
              title="Увеличить масштаб"
            >
              +
            </button>

            <button
              onClick={onFitMap}
              className="px-2 py-0.5 bg-[#1c1f2b] hover:bg-[#282c3d] text-[#38bdf8] text-[9px] font-mono font-bold flex items-center gap-1 cursor-pointer border border-[#33374b] ml-1"
              title="Показать всю карту"
            >
              <Maximize2 className="w-2.5 h-2.5" />
              <span>FIT</span>
            </button>
          </div>

          <div className="text-[8px] font-mono text-[#545766] text-center tracking-wider uppercase">
            DOTA × D&D MAP ENGINE
          </div>
        </div>

      </div>

    </footer>
  );
}
