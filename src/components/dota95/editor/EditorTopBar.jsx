import React from 'react';
import { 
  Save, RotateCcw, Grid, Shield, Tag, Maximize2, 
  ZoomIn, ZoomOut, Layers, Check 
} from 'lucide-react';

export default function EditorTopBar({
  mode,
  onSwitchMode,
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
    <header className="relative w-full h-10 bg-[#111216] border-b-2 border-[#262832] px-3 flex items-center justify-between select-none z-40 shadow-[0_2px_10px_rgba(0,0,0,0.8)]">
      
      {/* LEFT: LOGO, APP MODE SWITCHER, MAP NAME */}
      <div className="flex items-center gap-3">
        {/* Dota Emblem */}
        <div className="flex items-center gap-2 pr-2 border-r border-[#262832]">
          <div className="w-6 h-6 bg-[#8a1c1c] border border-[#d93838] flex items-center justify-center shadow-[inset_0_1px_0_rgba(255,255,255,0.2)]">
            <span className="font-fantasy font-black text-white text-[10px] tracking-wider">D2</span>
          </div>
          <span className="font-fantasy font-black text-[#dfb652] text-xs tracking-wider uppercase">
            DOTA × D&D
          </span>
        </div>

        {/* MODE SWITCHER: [ EDITOR ] [ GAME ] */}
        <div className="flex items-center bg-[#0a0b0d] p-0.5 border border-[#262832]">
          <button
            onClick={() => onSwitchMode('EDITOR')}
            className={`px-3 py-0.5 text-[11px] font-mono font-black uppercase tracking-wider transition-colors cursor-pointer border ${
              mode === 'EDITOR'
                ? 'bg-gradient-to-b from-[#3a2c10] to-[#241a08] border-[#dfb652] text-[#fce89e] shadow-[inset_0_1px_0_rgba(255,255,255,0.2)]'
                : 'bg-[#15161b] border-transparent text-[#7e8392] hover:text-[#d3d6e0]'
            }`}
          >
            EDITOR
          </button>
          <button
            onClick={() => onSwitchMode('GAME')}
            className={`px-3 py-0.5 text-[11px] font-mono font-black uppercase tracking-wider transition-colors cursor-pointer border ${
              mode === 'GAME'
                ? 'bg-gradient-to-b from-[#3a2c10] to-[#241a08] border-[#dfb652] text-[#fce89e] shadow-[inset_0_1px_0_rgba(255,255,255,0.2)]'
                : 'bg-[#15161b] border-transparent text-[#7e8392] hover:text-[#d3d6e0]'
            }`}
          >
            GAME
          </button>
        </div>

        {/* MAP BADGE */}
        <div className="hidden md:flex items-center gap-1.5 px-2 py-0.5 bg-[#17181f] border border-[#2a2c36] text-[10px] font-mono text-[#9da1b0]">
          <span className="text-[#dfb652]">MAP:</span>
          <span>95×95 DOTA BATTLEFIELD</span>
        </div>

        {/* OBJECTS COUNT BADGE */}
        <div className="flex items-center gap-1.5 px-2.5 py-0.5 bg-[#171820] border border-[#2d303d] text-[10px] font-mono">
          <span className="text-[#8e93a4] font-bold">OBJECTS:</span>
          <span className="text-[#dfb652] font-black">{objectsCount}</span>
        </div>
      </div>

      {/* CENTER: SAVE STATUS BANNER */}
      {saveNotice && (
        <div className="flex items-center gap-1.5 text-[10px] font-mono font-bold text-[#dfb652] bg-[#221c0e] border border-[#dfb652]/70 px-3 py-0.5 shadow">
          <Check className="w-3 h-3 text-[#dfb652]" />
          <span>{saveNotice}</span>
        </div>
      )}

      {/* RIGHT: TOGGLES, ZOOM & SAVE/RESET */}
      <div className="flex items-center gap-2">
        
        {/* VIEW TOGGLES */}
        <div className="flex items-center bg-[#0a0b0d] p-0.5 border border-[#262832]">
          <button
            onClick={onToggleGrid}
            className={`px-2 py-0.5 text-[10px] font-mono font-bold uppercase transition-colors cursor-pointer border ${
              showGrid 
                ? 'bg-[#1e2029] border-[#dfb652]/60 text-[#dfb652]' 
                : 'bg-transparent border-transparent text-[#6e7280] hover:text-[#c4c7d4]'
            }`}
            title="Переключить сетку"
          >
            GRID
          </button>
          <button
            onClick={onToggleRanges}
            className={`px-2 py-0.5 text-[10px] font-mono font-bold uppercase transition-colors cursor-pointer border ${
              showRanges 
                ? 'bg-[#1e2029] border-[#38bdf8]/60 text-[#38bdf8]' 
                : 'bg-transparent border-transparent text-[#6e7280] hover:text-[#c4c7d4]'
            }`}
            title="Радиусы вышек"
          >
            RANGES
          </button>
          <button
            onClick={onToggleLabels}
            className={`px-2 py-0.5 text-[10px] font-mono font-bold uppercase transition-colors cursor-pointer border ${
              showLabels 
                ? 'bg-[#1e2029] border-[#a78bfa]/60 text-[#a78bfa]' 
                : 'bg-transparent border-transparent text-[#6e7280] hover:text-[#c4c7d4]'
            }`}
            title="Названия локаций"
          >
            LABELS
          </button>
        </div>

        {/* ZOOM CONTROLS */}
        <div className="flex items-center bg-[#0a0b0d] p-0.5 border border-[#262832] text-xs font-mono text-[#9da1b0]">
          <button
            onClick={onZoomOut}
            className="w-5 h-5 flex items-center justify-center hover:bg-[#1f2029] hover:text-white cursor-pointer"
            title="Отдалить"
          >
            -
          </button>
          <span className="w-10 text-center font-bold text-[#dfb652] text-[10px]">
            {Math.round(zoom * 100)}%
          </span>
          <button
            onClick={onZoomIn}
            className="w-5 h-5 flex items-center justify-center hover:bg-[#1f2029] hover:text-white cursor-pointer"
            title="Приблизить"
          >
            +
          </button>
          <button
            onClick={onFitMap}
            className="px-1.5 h-5 flex items-center justify-center border-l border-[#262832] text-[9px] hover:bg-[#1f2029] hover:text-white cursor-pointer"
            title="Вся карта"
          >
            FIT
          </button>
        </div>

        {/* SAVE & RESET BUTTONS */}
        <div className="flex items-center gap-1">
          <button
            onClick={onSave}
            className="px-3 py-1 bg-gradient-to-b from-[#1b432a] to-[#11291b] hover:from-[#235536] hover:to-[#173824] border border-[#2a7a49] text-[#7ee7a5] text-[10px] font-mono font-black uppercase tracking-wider cursor-pointer shadow-[inset_0_1px_0_rgba(255,255,255,0.15)] flex items-center gap-1"
            title="Сохранить карту в память браузера"
          >
            <Save className="w-3 h-3" />
            <span>SAVE</span>
          </button>

          <button
            onClick={onReset}
            className="px-2.5 py-1 bg-gradient-to-b from-[#381a1c] to-[#241112] hover:from-[#4a2225] hover:to-[#311718] border border-[#7a2e33] text-[#fca5a5] text-[10px] font-mono font-black uppercase tracking-wider cursor-pointer shadow-[inset_0_1px_0_rgba(255,255,255,0.15)] flex items-center gap-1"
            title="Сбросить все объекты к исходной расстановке"
          >
            <RotateCcw className="w-3 h-3" />
            <span>RESET</span>
          </button>
        </div>

      </div>

    </header>
  );
}
