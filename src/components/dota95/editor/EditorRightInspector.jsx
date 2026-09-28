import React from 'react';
import { getAssetUrl } from '../../../utils/assetUrl.js';
import { 
  ChevronRight, ChevronLeft, Trash2, Copy, Crosshair, 
  Info, Shield, Swords
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
      className={`absolute top-12 right-2 bottom-40 z-30 transition-all duration-200 pointer-events-auto flex flex-col select-none ${
        isOpen ? 'w-60' : 'w-8'
      }`}
    >
      <div className="relative w-full h-full bg-[#0e1015] border border-[#2b2d39] shadow-[0_4px_24px_rgba(0,0,0,0.85)] flex flex-col overflow-hidden">
        
        {/* PANEL HEADER */}
        <div className="h-8 bg-[#14161f] border-b border-[#2b2d39] px-2 flex items-center justify-between shrink-0 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
          <button
            onClick={onToggleOpen}
            className="w-5 h-5 flex items-center justify-center text-[#7e8392] hover:text-white bg-[#0a0b0e] border border-[#262832] cursor-pointer"
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
          <div className="flex-1 overflow-y-auto p-2 flex flex-col justify-between bg-[#0b0c10] space-y-2.5">
            {selectedObject ? (
              <div className="space-y-2.5">
                
                {/* 1. OBJECT PREVIEW HEADER */}
                <div className="flex items-center gap-2 p-1.5 bg-[#12141c] border border-[#232634]">
                  {/* Square Frame Portrait */}
                  <div className={`w-12 h-12 bg-black border-2 shrink-0 flex items-center justify-center shadow-inner relative overflow-hidden ${
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
                    <div className="text-[9px] font-mono text-[#8a8e9e] uppercase mt-0.5">
                      TYPE: <span className="font-bold text-[#dfb652]">{selectedObject.type.toUpperCase()}</span>
                    </div>
                    <div className="text-[8px] font-mono text-[#5b5f6e] truncate">
                      ID: {selectedObject.id}
                    </div>
                  </div>
                </div>

                {/* 2. TEAM SELECTOR */}
                <div className="space-y-1">
                  <div className="text-[8px] font-mono uppercase text-[#737887] font-bold">
                    TEAM
                  </div>
                  <div className="grid grid-cols-3 gap-1 bg-[#08090d] p-0.5 border border-[#20222c]">
                    <button
                      onClick={() => onUpdateObject(selectedObject.id, { team: 'radiant' })}
                      className={`py-1 text-[8px] font-mono font-black uppercase cursor-pointer border ${
                        selectedObject.team === 'radiant' 
                          ? 'bg-[#123824] border-[#228250] text-[#6ee7b7] shadow-[inset_0_1px_0_rgba(255,255,255,0.12)]' 
                          : 'bg-transparent border-transparent text-[#626673] hover:text-[#34d399]'
                      }`}
                    >
                      RAD
                    </button>
                    <button
                      onClick={() => onUpdateObject(selectedObject.id, { team: 'dire' })}
                      className={`py-1 text-[8px] font-mono font-black uppercase cursor-pointer border ${
                        selectedObject.team === 'dire' 
                          ? 'bg-[#3b1416] border-[#992a2a] text-[#fca5a5] shadow-[inset_0_1px_0_rgba(255,255,255,0.12)]' 
                          : 'bg-transparent border-transparent text-[#626673] hover:text-[#f87171]'
                      }`}
                    >
                      DIRE
                    </button>
                    <button
                      onClick={() => onUpdateObject(selectedObject.id, { team: 'neutral' })}
                      className={`py-1 text-[8px] font-mono font-black uppercase cursor-pointer border ${
                        selectedObject.team === 'neutral' 
                          ? 'bg-[#382b13] border-[#a17920] text-[#fde047] shadow-[inset_0_1px_0_rgba(255,255,255,0.12)]' 
                          : 'bg-transparent border-transparent text-[#626673] hover:text-[#facc15]'
                      }`}
                    >
                      NEUT
                    </button>
                  </div>
                </div>

                {/* 3. GRID POSITION STEPPERS */}
                <div className="space-y-1">
                  <div className="text-[8px] font-mono uppercase text-[#737887] font-bold">
                    GRID COORDINATES
                  </div>
                  <div className="grid grid-cols-2 gap-1.5">
                    {/* X (Column) */}
                    <div className="bg-[#12141c] border border-[#232634] p-1.5 flex items-center justify-between">
                      <span className="text-[9px] font-mono text-[#787d8d] font-bold">X (COL)</span>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => onUpdateObject(selectedObject.id, { x: Math.max(0, selectedObject.x - 1) })}
                          className="w-4 h-4 bg-[#1c1f2b] hover:bg-[#282c3d] text-white text-[9px] font-mono flex items-center justify-center cursor-pointer border border-[#2d3142]"
                        >
                          -
                        </button>
                        <span className="w-5 text-center text-[10px] font-mono font-bold text-[#dfb652]">
                          {selectedObject.x}
                        </span>
                        <button
                          onClick={() => onUpdateObject(selectedObject.id, { x: Math.min(94, selectedObject.x + 1) })}
                          className="w-4 h-4 bg-[#1c1f2b] hover:bg-[#282c3d] text-white text-[9px] font-mono flex items-center justify-center cursor-pointer border border-[#2d3142]"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    {/* Y (Row) */}
                    <div className="bg-[#12141c] border border-[#232634] p-1.5 flex items-center justify-between">
                      <span className="text-[9px] font-mono text-[#787d8d] font-bold">Y (ROW)</span>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => onUpdateObject(selectedObject.id, { y: Math.max(0, selectedObject.y - 1) })}
                          className="w-4 h-4 bg-[#1c1f2b] hover:bg-[#282c3d] text-white text-[9px] font-mono flex items-center justify-center cursor-pointer border border-[#2d3142]"
                        >
                          -
                        </button>
                        <span className="w-5 text-center text-[10px] font-mono font-bold text-[#dfb652]">
                          {selectedObject.y}
                        </span>
                        <button
                          onClick={() => onUpdateObject(selectedObject.id, { y: Math.min(94, selectedObject.y + 1) })}
                          className="w-4 h-4 bg-[#1c1f2b] hover:bg-[#282c3d] text-white text-[9px] font-mono flex items-center justify-center cursor-pointer border border-[#2d3142]"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 4. ACTIONS */}
                <div className="space-y-1.5 pt-1 border-t border-[#20222c]">
                  <button
                    onClick={() => onCenterCamera(selectedObject.y, selectedObject.x)}
                    className="w-full py-1.5 bg-[#161822] hover:bg-[#202433] border border-[#2c3042] text-[#b3b7c4] hover:text-white text-[10px] font-mono font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-colors shadow"
                  >
                    <Crosshair className="w-3.5 h-3.5 text-[#38bdf8]" />
                    <span>FOCUS CAMERA [F]</span>
                  </button>

                  <button
                    onClick={onDuplicate}
                    className="w-full py-1.5 bg-gradient-to-b from-[#382b13] to-[#201809] hover:from-[#453618] hover:to-[#281f0b] border border-[#a17920] text-[#fce89e] text-[10px] font-mono font-black uppercase flex items-center justify-center gap-1.5 cursor-pointer transition-all shadow"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>DUPLICATE [Ctrl+D]</span>
                  </button>

                  <button
                    onClick={onDelete}
                    className="w-full py-1.5 bg-gradient-to-b from-[#3b1416] to-[#240c0d] hover:from-[#4a1a1c] hover:to-[#2e1011] border border-[#8f2828] text-[#fca5a5] text-[10px] font-mono font-black uppercase flex items-center justify-center gap-1.5 cursor-pointer transition-all shadow"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-[#ef4444]" />
                    <span>DELETE [Del]</span>
                  </button>
                </div>

              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-3 space-y-2 text-[#585c6d]">
                <Info className="w-8 h-8 text-[#2b2d39]" />
                <div className="text-[10px] font-mono leading-tight">
                  ОБЪЕКТ НЕ ВЫБРАН
                </div>
                <div className="text-[9px] font-mono text-[#434653]">
                  Кликните по любому герою, крипу или вышке для редактирования.
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </aside>
  );
}
