import React from 'react';
import { 
  Save, RotateCcw, Grid, Shield, Tag, Maximize2, 
  ZoomIn, ZoomOut, Layers, HelpCircle 
} from 'lucide-react';

export default function EditorTopBar({
  objectsCount,
  radiantCount,
  direCount,
  neutralCount,
  zoom,
  onZoomIn,
  onZoomOut,
  onFitMap,
  showGrid,
  onToggleGrid,
  showRanges,
  onToggleRanges,
  showLabels,
  onToggleLabels,
  onSave,
  onReset,
  saveNotice
}) {
  return (
    <header className="relative w-full h-11 bg-[#0b0e14]/95 border-b border-[#242f42] px-3 flex items-center justify-between pointer-events-auto select-none z-40 backdrop-blur-md shadow-xl">
      
      {/* LEFT: TITLE & LOGO */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          {/* Dota Icon Emblem */}
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-red-600 via-rose-800 to-black border border-rose-500/60 flex items-center justify-center shadow-lg">
            <span className="font-fantasy font-black text-white text-xs tracking-wider">D2</span>
          </div>
          <div className="flex flex-col">
            <span className="font-fantasy font-black text-amber-400 text-xs tracking-wider uppercase leading-none">
              DOTA × D&D
            </span>
            <span className="text-[9px] font-mono text-slate-400 uppercase tracking-widest leading-none mt-0.5">
              Battle Map Editor
            </span>
          </div>
        </div>

        <div className="h-4 w-px bg-slate-800"></div>

        {/* TEAM BALANCE SUMMARY */}
        <div className="flex items-center gap-2 text-xs font-mono">
          <div className="flex items-center gap-1 bg-[#064e3b]/40 border border-emerald-500/40 px-2 py-0.5 rounded text-emerald-300">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            <span>Radiant: {radiantCount}</span>
          </div>
          <span className="text-slate-600 font-bold">vs</span>
          <div className="flex items-center gap-1 bg-[#7f1d1d]/40 border border-rose-500/40 px-2 py-0.5 rounded text-rose-300">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span>
            <span>Dire: {direCount}</span>
          </div>
          {neutralCount > 0 && (
            <div className="flex items-center gap-1 bg-amber-950/40 border border-amber-500/40 px-2 py-0.5 rounded text-amber-300">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
              <span>Neut: {neutralCount}</span>
            </div>
          )}
        </div>
      </div>

      {/* CENTER: SAVE STATUS BANNER */}
      {saveNotice && (
        <div className="text-[11px] font-mono font-bold text-amber-300 bg-amber-950/60 border border-amber-500/50 px-3 py-1 rounded-full animate-fade-in shadow">
          {saveNotice}
        </div>
      )}

      {/* RIGHT: CONTROLS & TOGGLES */}
      <div className="flex items-center gap-1.5">
        
        {/* Zoom Controls */}
        <div className="flex items-center bg-[#121620] border border-[#273244] rounded-lg p-0.5 text-xs font-mono text-slate-300">
          <button
            onClick={onZoomOut}
            className="p-1 hover:text-white hover:bg-[#1a2130] rounded cursor-pointer transition-colors"
            title="Отдалить (Zoom Out)"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <span className="px-2 font-bold text-amber-400 text-[11px]">
            {Math.round(zoom * 100)}%
          </span>
          <button
            onClick={onZoomIn}
            className="p-1 hover:text-white hover:bg-[#1a2130] rounded cursor-pointer transition-colors"
            title="Приблизить (Zoom In)"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onFitMap}
            className="p-1 hover:text-white hover:bg-[#1a2130] rounded cursor-pointer border-l border-slate-800 transition-colors ml-0.5"
            title="Вся карта (Fit Screen)"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="h-4 w-px bg-slate-800"></div>

        {/* View Toggles */}
        <div className="flex items-center gap-1 bg-[#121620] border border-[#273244] rounded-lg p-0.5">
          <button
            onClick={onToggleGrid}
            className={`p-1.5 rounded cursor-pointer text-xs transition-colors flex items-center gap-1 ${
              showGrid ? 'bg-amber-500/20 text-amber-400 font-bold' : 'text-slate-400 hover:text-white'
            }`}
            title="Включить/выключить сетку 95x95"
          >
            <Grid className="w-3.5 h-3.5" />
            <span className="text-[10px]">Сетка</span>
          </button>

          <button
            onClick={onToggleRanges}
            className={`p-1.5 rounded cursor-pointer text-xs transition-colors flex items-center gap-1 ${
              showRanges ? 'bg-cyan-500/20 text-cyan-400 font-bold' : 'text-slate-400 hover:text-white'
            }`}
            title="Показывать радиусы вышек"
          >
            <Shield className="w-3.5 h-3.5" />
            <span className="text-[10px]">Радиусы</span>
          </button>

          <button
            onClick={onToggleLabels}
            className={`p-1.5 rounded cursor-pointer text-xs transition-colors flex items-center gap-1 ${
              showLabels ? 'bg-indigo-500/20 text-indigo-400 font-bold' : 'text-slate-400 hover:text-white'
            }`}
            title="Названия локаций и линий"
          >
            <Tag className="w-3.5 h-3.5" />
            <span className="text-[10px]">Названия</span>
          </button>
        </div>

        <div className="h-4 w-px bg-slate-800"></div>

        {/* Save & Reset Actions */}
        <div className="flex items-center gap-1">
          <button
            onClick={onSave}
            className="px-2.5 py-1 rounded-lg bg-emerald-950/70 hover:bg-emerald-900/90 border border-emerald-500/60 hover:border-emerald-400 text-emerald-300 hover:text-white text-xs font-mono font-bold flex items-center gap-1.5 cursor-pointer shadow-md transition-all"
            title="Сохранить карту в память браузера (localStorage)"
          >
            <Save className="w-3.5 h-3.5 text-emerald-400" />
            <span>СОХРАНИТЬ</span>
          </button>

          <button
            onClick={onReset}
            className="px-2.5 py-1 rounded-lg bg-rose-950/60 hover:bg-rose-900/80 border border-rose-600/60 hover:border-rose-400 text-rose-300 hover:text-white text-xs font-mono font-bold flex items-center gap-1.5 cursor-pointer shadow-md transition-all"
            title="Сбросить все объекты к исходной расстановке"
          >
            <RotateCcw className="w-3.5 h-3.5 text-rose-400" />
            <span>СБРОС</span>
          </button>
        </div>

      </div>

    </header>
  );
}
