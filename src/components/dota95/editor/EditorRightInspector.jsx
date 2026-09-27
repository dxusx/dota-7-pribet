import React from 'react';
import { getAssetUrl } from '../../../utils/assetUrl.js';
import { 
  ChevronRight, ChevronLeft, Trash2, Copy, Crosshair, 
  HelpCircle, Info 
} from 'lucide-react';

export default function EditorRightInspector({
  isOpen,
  onToggleOpen,
  selectedObject,
  onUpdateObject,
  onDuplicate,
  onDelete,
  onCenterCamera
}) {
  return (
    <aside 
      className={`absolute top-12 right-2 bottom-44 z-30 transition-all duration-200 pointer-events-auto flex flex-col ${
        isOpen ? 'w-64' : 'w-8'
      }`}
    >
      <div className="relative w-full h-full bg-[#111216] border border-[#2b2d38] shadow-[0_4px_20px_rgba(0,0,0,0.8)] flex flex-col overflow-hidden">
        
        {/* PANEL HEADER */}
        <div className="h-8 bg-[#181920] border-b border-[#2b2d38] px-2 flex items-center justify-between">
          <button
            onClick={onToggleOpen}
            className="w-5 h-5 flex items-center justify-center text-[#7e8392] hover:text-white bg-[#0f1014] border border-[#262832] cursor-pointer"
            title={isOpen ? 'Свернуть инспектор' : 'Развернуть инспектор'}
          >
            {isOpen ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
          </button>

          {isOpen ? (
            <div className="flex items-center gap-1.5">
              <span className="font-fantasy font-black text-[#dfb652] text-[11px] tracking-wider uppercase">
                INSPECTOR
              </span>
              <Info className="w-3.5 h-3.5 text-[#dfb652]" />
            </div>
          ) : (
            <div className="w-full flex justify-center">
              <Info className="w-3.5 h-3.5 text-[#dfb652]" />
            </div>
          )}
        </div>

        {isOpen && (
          <div className="flex-1 overflow-y-auto p-2.5 flex flex-col justify-between bg-[#0e0f13]">
            {selectedObject ? (
              <div className="space-y-3">
                
                {/* 1. OBJECT PREVIEW HEADER */}
                <div className="flex items-center gap-2.5 p-2 bg-[#15161d] border border-[#262833]">
                  {/* Square Frame Portrait */}
                  <div className={`w-12 h-12 bg-black border-2 shrink-0 flex items-center justify-center shadow-inner ${
                    selectedObject.team === 'radiant' 
                      ? 'border-[#1b5e3f]' 
                      : selectedObject.team === 'dire' 
                      ? 'border-[#8a2424]' 
                      : 'border-[#8a681c]'
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

                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-fantasy font-black text-[#f0f2f8] leading-tight truncate">
                      {selectedObject.name}
                    </div>
                    <div className="text-[10px] font-mono text-[#8a8e9e] uppercase mt-0.5">
                      TYPE: <span className="font-bold text-[#dfb652]">{selectedObject.type.toUpperCase()}</span>
                    </div>
                    <div className="text-[9px] font-mono text-[#5b5f6e] truncate">
                      ID: {selectedObject.id}
                    </div>
                  </div>
                </div>

                {/* 2. TEAM SELECTOR */}
                <div className="space-y-1">
                  <div className="text-[9px] font-mono uppercase text-[#737887] font-bold">
                    TEAM
                  </div>
                  <div className="grid grid-cols-3 gap-1 bg-[#0a0b0d] p-0.5 border border-[#22242e]">
                    <button
                      onClick={() => onUpdateObject(selectedObject.id, { team: 'radiant' })}
                      className={`py-1 text-[9px] font-mono font-black uppercase cursor-pointer border ${
                        selectedObject.team === 'radiant' 
                          ? 'bg-[#123824] border-[#228250] text-[#6ee7b7] shadow-[inset_0_1px_0_rgba(255,255,255,0.15)]' 
                          : 'bg-transparent border-transparent text-[#626673] hover:text-[#34d399]'
                      }`}
                    >
                      RADIANT
                    </button>
                    <button
                      onClick={() => onUpdateObject(selectedObject.id, { team: 'dire' })}
                      className={`py-1 text-[9px] font-mono font-black uppercase cursor-pointer border ${
                        selectedObject.team === 'dire' 
                          ? 'bg-[#3b1416] border-[#992a2a] text-[#fca5a5] shadow-[inset_0_1px_0_rgba(255,255,255,0.15)]' 
                          : 'bg-transparent border-transparent text-[#626673] hover:text-[#f87171]'
                      }`}
                    >
                      DIRE
                    </button>
                    <button
                      onClick={() => onUpdateObject(selectedObject.id, { team: 'neutral' })}
                      className={`py-1 text-[9px] font-mono font-black uppercase cursor-pointer border ${
                        selectedObject.team === 'neutral' 
                          ? 'bg-[#382b13] border-[#a17920] text-[#fde047] shadow-[inset_0_1px_0_rgba(255,255,255,0.15)]' 
                          : 'bg-transparent border-transparent text-[#626673] hover:text-[#facc15]'
                      }`}
                    >
                      NEUTRAL
                    </button>
                  </div>
                </div>

                {/* 3. GRID POSITION */}
                <div className="space-y-1">
                  <div className="text-[9px] font-mono uppercase text-[#737887] font-bold">
                    GRID POSITION
                  </div>
                  <div className="grid grid-cols-2 gap-1.5">
                    {/* X (Column) */}
                    <div className="bg-[#15161d] border border-[#252733] p-1.5 flex items-center justify-between">
                      <span className="text-[10px] font-mono text-[#787d8d] font-bold">X (COL)</span>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => onUpdateObject(selectedObject.id, { x: Math.max(0, selectedObject.x - 1) })}
                          className="w-4 h-4 bg-[#20222b] hover:bg-[#2c2f3d] text-white text-[10px] font-mono flex items-center justify-center cursor-pointer border border-[#303342]"
                        >
                          -
                        </button>
                        <span className="w-6 text-center text-xs font-mono font-black text-[#dfb652]">
                          {selectedObject.x}
                        </span>
                        <button
                          onClick={() => onUpdateObject(selectedObject.id, { x: Math.min(94, selectedObject.x + 1) })}
                          className="w-4 h-4 bg-[#20222b] hover:bg-[#2c2f3d] text-white text-[10px] font-mono flex items-center justify-center cursor-pointer border border-[#303342]"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    {/* Y (Row) */}
                    <div className="bg-[#15161d] border border-[#252733] p-1.5 flex items-center justify-between">
                      <span className="text-[10px] font-mono text-[#787d8d] font-bold">Y (ROW)</span>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => onUpdateObject(selectedObject.id, { y: Math.max(0, selectedObject.y - 1) })}
                          className="w-4 h-4 bg-[#20222b] hover:bg-[#2c2f3d] text-white text-[10px] font-mono flex items-center justify-center cursor-pointer border border-[#303342]"
                        >
                          -
                        </button>
                        <span className="w-6 text-center text-xs font-mono font-black text-[#dfb652]">
                          {selectedObject.y}
                        </span>
                        <button
                          onClick={() => onUpdateObject(selectedObject.id, { y: Math.min(94, selectedObject.y + 1) })}
                          className="w-4 h-4 bg-[#20222b] hover:bg-[#2c2f3d] text-white text-[10px] font-mono flex items-center justify-center cursor-pointer border border-[#303342]"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 4. TACTICAL ACTION BUTTONS */}
                <div className="pt-2 space-y-1.5">
                  <button
                    onClick={() => onCenterCamera(selectedObject.y, selectedObject.x)}
                    className="w-full py-1.5 bg-[#171820] hover:bg-[#22242f] border border-[#2d303f] hover:border-[#38bdf8] text-[#a4a9b8] hover:text-white text-[10px] font-mono font-black uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]"
                  >
                    <Crosshair className="w-3 h-3 text-[#38bdf8]" />
                    <span>FOCUS CAMERA</span>
                  </button>

                  <button
                    onClick={onDuplicate}
                    className="w-full py-1.5 bg-gradient-to-b from-[#382b13] to-[#201809] hover:from-[#473718] hover:to-[#2c200c] border border-[#a17920] hover:border-[#dfb652] text-[#fce89e] text-[10px] font-mono font-black uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer shadow-[inset_0_1px_0_rgba(255,255,255,0.15)]"
                    title="Дублировать объект рядом [Ctrl + D]"
                  >
                    <Copy className="w-3 h-3" />
                    <span>DUPLICATE [CTRL+D]</span>
                  </button>

                  <button
                    onClick={onDelete}
                    className="w-full py-1.5 bg-gradient-to-b from-[#3b1416] to-[#240c0d] hover:from-[#4c1a1c] hover:to-[#311012] border border-[#8f2828] hover:border-[#c0392b] text-[#fca5a5] text-[10px] font-mono font-black uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer shadow-[inset_0_1px_0_rgba(255,255,255,0.15)]"
                    title="Удалить объект с карты [Del / Backspace]"
                  >
                    <Trash2 className="w-3 h-3 text-[#ef4444]" />
                    <span>DELETE [DEL]</span>
                  </button>
                </div>

              </div>
            ) : (
              /* EMPTY STATE: NO OBJECT SELECTED */
              <div className="flex flex-col items-center justify-center h-full text-center py-6 px-1">
                <div className="w-10 h-10 bg-[#16171e] border border-[#2a2c36] flex items-center justify-center mb-2">
                  <span className="text-[#646877] text-lg font-mono">∅</span>
                </div>
                <div className="text-[11px] font-fantasy font-black text-[#8a8e9e] uppercase tracking-wider mb-1">
                  NO OBJECT SELECTED
                </div>
                <p className="text-[9px] font-mono text-[#585b68] leading-tight max-w-[180px]">
                  Кликните по любому герою, крипу или вышке на карте для редактирования.
                </p>
              </div>
            )}

            {/* HOTKEYS CHEAT SHEET */}
            <div className="mt-3 pt-2 border-t border-[#22242e] text-[9px] font-mono text-[#6c707f] space-y-0.5">
              <div className="font-bold text-[#8c91a0] uppercase flex items-center gap-1 mb-1">
                <HelpCircle className="w-2.5 h-2.5 text-[#dfb652]" />
                <span>HOTKEYS:</span>
              </div>
              <div className="flex justify-between">
                <span>LMB:</span>
                <span className="text-[#a6abbd]">Select / Drag</span>
              </div>
              <div className="flex justify-between">
                <span>MMB:</span>
                <span className="text-[#a6abbd]">Pan Camera</span>
              </div>
              <div className="flex justify-between">
                <span>Wheel:</span>
                <span className="text-[#a6abbd]">Zoom Map</span>
              </div>
              <div className="flex justify-between">
                <span>Ctrl+D:</span>
                <span className="text-[#a6abbd]">Duplicate</span>
              </div>
              <div className="flex justify-between">
                <span>Delete:</span>
                <span className="text-[#a6abbd]">Remove</span>
              </div>
              <div className="flex justify-between">
                <span>Esc:</span>
                <span className="text-[#a6abbd]">Deselect</span>
              </div>
            </div>

          </div>
        )}

      </div>
    </aside>
  );
}
