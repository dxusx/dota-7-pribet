import React from 'react';
import { getAssetUrl } from '../../utils/assetUrl.js';
import { 
  ChevronRight, ChevronLeft, Trash2, Copy, Crosshair, 
  MapPin, Shield, Swords, Info, HelpCircle 
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
      className={`absolute top-13 right-2 bottom-48 z-30 transition-all duration-300 pointer-events-auto flex flex-col ${
        isOpen ? 'w-72' : 'w-10'
      }`}
    >
      <div className="relative w-full h-full bg-[#0c1017]/95 border-2 border-[#263348] rounded-xl shadow-2xl flex flex-col overflow-hidden backdrop-blur-md">
        
        {/* PANEL HEADER WITH TOGGLE BUTTON */}
        <div className="h-10 bg-gradient-to-r from-[#141b26] to-[#0f141e] border-b border-[#263348] px-2.5 flex items-center justify-between">
          <button
            onClick={onToggleOpen}
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer transition-colors"
            title={isOpen ? 'Свернуть панель инспектора' : 'Развернуть панель инспектора'}
          >
            {isOpen ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>

          {isOpen ? (
            <div className="flex items-center gap-2">
              <span className="font-fantasy font-black text-amber-400 text-xs tracking-wider uppercase">
                ИНСПЕКТОР
              </span>
              <Info className="w-4 h-4 text-amber-400" />
            </div>
          ) : (
            <div className="w-full flex justify-center">
              <Info className="w-4 h-4 text-amber-400" />
            </div>
          )}
        </div>

        {isOpen && (
          <div className="flex-1 overflow-y-auto p-3 flex flex-col justify-between">
            {selectedObject ? (
              <div className="space-y-4">
                
                {/* 1. OBJECT HEADER & PORTRAIT */}
                <div className="flex items-center gap-3 p-2 rounded-xl bg-[#111722] border border-[#273449]">
                  <div className={`relative w-14 h-14 rounded-lg overflow-hidden border-2 bg-black flex items-center justify-center shrink-0 shadow-lg ${
                    selectedObject.team === 'radiant' 
                      ? 'border-emerald-500' 
                      : selectedObject.team === 'dire' 
                      ? 'border-rose-500' 
                      : 'border-amber-500'
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

                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-fantasy font-black text-white leading-tight truncate">
                      {selectedObject.name}
                    </div>
                    <div className="text-[10px] font-mono text-slate-400 uppercase mt-0.5">
                      Тип: <span className="font-bold text-amber-400">{selectedObject.type}</span>
                    </div>
                    <div className="text-[9px] font-mono text-slate-500 truncate">
                      ID: {selectedObject.id}
                    </div>
                  </div>
                </div>

                {/* 2. TEAM SELECTOR */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono uppercase text-slate-400 font-bold block">
                    Команда / Сторона:
                  </label>
                  <div className="grid grid-cols-3 gap-1 bg-[#090d14] p-1 rounded-lg border border-[#222d3f]">
                    <button
                      onClick={() => onUpdateObject(selectedObject.id, { team: 'radiant' })}
                      className={`py-1 rounded text-[10px] font-mono font-bold cursor-pointer transition-colors ${
                        selectedObject.team === 'radiant' 
                          ? 'bg-emerald-600 text-white shadow' 
                          : 'text-slate-400 hover:text-emerald-300'
                      }`}
                    >
                      Radiant
                    </button>
                    <button
                      onClick={() => onUpdateObject(selectedObject.id, { team: 'dire' })}
                      className={`py-1 rounded text-[10px] font-mono font-bold cursor-pointer transition-colors ${
                        selectedObject.team === 'dire' 
                          ? 'bg-rose-600 text-white shadow' 
                          : 'text-slate-400 hover:text-rose-300'
                      }`}
                    >
                      Dire
                    </button>
                    <button
                      onClick={() => onUpdateObject(selectedObject.id, { team: 'neutral' })}
                      className={`py-1 rounded text-[10px] font-mono font-bold cursor-pointer transition-colors ${
                        selectedObject.team === 'neutral' 
                          ? 'bg-amber-600 text-white shadow' 
                          : 'text-slate-400 hover:text-amber-300'
                      }`}
                    >
                      Neutral
                    </button>
                  </div>
                </div>

                {/* 3. GRID COORDINATES */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono uppercase text-slate-400 font-bold block">
                    Позиция на сетке 95×95:
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {/* X (Column) */}
                    <div className="bg-[#111722] border border-[#253247] rounded-lg p-2 flex items-center justify-between">
                      <div className="text-[11px] font-mono text-slate-400 font-bold">X (Кол):</div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => onUpdateObject(selectedObject.id, { x: Math.max(0, selectedObject.x - 1) })}
                          className="w-5 h-5 rounded bg-slate-800 hover:bg-slate-700 text-white text-xs font-mono font-bold flex items-center justify-center cursor-pointer"
                        >
                          -
                        </button>
                        <span className="w-8 text-center text-xs font-mono font-black text-amber-400">
                          {selectedObject.x}
                        </span>
                        <button
                          onClick={() => onUpdateObject(selectedObject.id, { x: Math.min(94, selectedObject.x + 1) })}
                          className="w-5 h-5 rounded bg-slate-800 hover:bg-slate-700 text-white text-xs font-mono font-bold flex items-center justify-center cursor-pointer"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    {/* Y (Row) */}
                    <div className="bg-[#111722] border border-[#253247] rounded-lg p-2 flex items-center justify-between">
                      <div className="text-[11px] font-mono text-slate-400 font-bold">Y (Стр):</div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => onUpdateObject(selectedObject.id, { y: Math.max(0, selectedObject.y - 1) })}
                          className="w-5 h-5 rounded bg-slate-800 hover:bg-slate-700 text-white text-xs font-mono font-bold flex items-center justify-center cursor-pointer"
                        >
                          -
                        </button>
                        <span className="w-8 text-center text-xs font-mono font-black text-amber-400">
                          {selectedObject.y}
                        </span>
                        <button
                          onClick={() => onUpdateObject(selectedObject.id, { y: Math.min(94, selectedObject.y + 1) })}
                          className="w-5 h-5 rounded bg-slate-800 hover:bg-slate-700 text-white text-xs font-mono font-bold flex items-center justify-center cursor-pointer"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 4. ACTIONS COLUMN */}
                <div className="pt-2 space-y-2">
                  {/* Focus Camera Button */}
                  <button
                    onClick={() => onCenterCamera(selectedObject.y, selectedObject.x)}
                    className="w-full py-1.5 rounded-lg bg-[#182130] hover:bg-[#202c40] border border-[#2b3a52] text-xs font-mono font-bold text-slate-200 flex items-center justify-center gap-1.5 cursor-pointer shadow transition-colors"
                  >
                    <Crosshair className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Центрировать камеру</span>
                  </button>

                  {/* Duplicate Button */}
                  <button
                    onClick={onDuplicate}
                    className="w-full py-1.5 rounded-lg bg-[#1e2738] hover:bg-amber-500 hover:text-black border border-[#354866] text-xs font-mono font-bold text-amber-300 flex items-center justify-center gap-1.5 cursor-pointer shadow transition-all"
                    title="Дублировать объект рядом [Ctrl + D]"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>ДУБЛИРОВАТЬ [Ctrl+D]</span>
                  </button>

                  {/* Delete Button */}
                  <button
                    onClick={onDelete}
                    className="w-full py-1.5 rounded-lg bg-rose-950/70 hover:bg-rose-900 border border-rose-600/70 text-xs font-mono font-bold text-rose-300 hover:text-white flex items-center justify-center gap-1.5 cursor-pointer shadow transition-colors"
                    title="Удалить объект с карты [Del / Backspace]"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                    <span>УДАЛИТЬ [Del]</span>
                  </button>
                </div>

              </div>
            ) : (
              /* EMPTY STATE: NO OBJECT SELECTED */
              <div className="flex flex-col items-center justify-center h-full text-center py-6 px-2">
                <div className="w-12 h-12 rounded-full bg-[#121622] border border-[#253247] flex items-center justify-center mb-3">
                  <MapPin className="w-6 h-6 text-slate-500" />
                </div>
                <div className="text-xs font-fantasy font-black text-slate-300 uppercase tracking-wider mb-1">
                  Объект не выбран
                </div>
                <p className="text-[11px] font-mono text-slate-500 leading-relaxed max-w-[200px]">
                  Кликните по любому герою, крипу или вышке на карте для просмотра и редактирования.
                </p>
              </div>
            )}

            {/* KEYBOARD SHORTCUTS HINTS */}
            <div className="mt-4 pt-3 border-t border-[#202a3c] text-[10px] font-mono text-slate-400 space-y-1">
              <div className="font-bold text-slate-300 uppercase flex items-center gap-1 mb-1.5">
                <HelpCircle className="w-3 h-3 text-amber-400" />
                <span>Управление:</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">ЛКМ:</span>
                <span className="text-slate-200">Выбор / Drag объекта</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Колесо:</span>
                <span className="text-slate-200">Приближение карты</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">СКМ / Space:</span>
                <span className="text-slate-200">Перемещение карты</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Ctrl + D:</span>
                <span className="text-slate-200">Дублировать объект</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Del:</span>
                <span className="text-slate-200">Удалить объект</span>
              </div>
            </div>

          </div>
        )}

      </div>
    </aside>
  );
}
