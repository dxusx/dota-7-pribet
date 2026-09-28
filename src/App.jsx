import React, { useState, useMemo } from 'react';
import { generateDotaMap } from './map/dotaMapData';
import DotaMapCanvas from './components/DotaMapCanvas';
import {
  Compass,
  Grid,
  Trees,
  Layers,
  MapPin,
  Shield,
  Swords,
  Maximize2,
  Eye,
  Info,
  X,
  Target
} from 'lucide-react';

export default function App() {
  const mapData = useMemo(() => generateDotaMap(), []);
  const [selectedTile, setSelectedTile] = useState(null);
  const [showGrid, setShowGrid] = useState(true);
  const [showIcons, setShowIcons] = useState(true);
  const [showTrees, setShowTrees] = useState(true);
  const [targetPos, setTargetPos] = useState(null);

  // Jump camera to landmark
  const handleJumpTo = (landmark) => {
    setTargetPos({ x: landmark.x, y: landmark.y });
    const idx = landmark.y * mapData.size + landmark.x;
    setSelectedTile(mapData.tiles[idx]);
  };

  return (
    <div className="flex flex-col w-screen h-screen bg-[#07090e] text-slate-100 overflow-hidden font-sans select-none">
      {/* 1. Header Toolbar */}
      <header className="h-14 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-4 flex items-center justify-between shrink-0 z-20">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-gradient-to-br from-red-600 to-amber-600 flex items-center justify-center font-bold text-sm shadow-md">
            D2
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-wider text-slate-100 flex items-center gap-2">
              DOTA 2 TACTICAL MAP <span className="text-xs text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/30">100×100</span>
            </h1>
            <p className="text-[10px] text-slate-400 font-mono">10 000 интерактивных клеток • Lanes • River • High Ground</p>
          </div>
        </div>

        {/* Quick Landmarks Jump */}
        <div className="hidden lg:flex items-center gap-1.5 bg-slate-950/60 p-1 rounded-lg border border-slate-800/80">
          <span className="text-[11px] text-slate-400 px-2 font-mono flex items-center gap-1">
            <Compass size={12} className="text-amber-400" /> Точки:
          </span>
          {mapData.landmarks.slice(0, 6).map((lm, i) => (
            <button
              key={i}
              onClick={() => handleJumpTo(lm)}
              className="text-xs px-2.5 py-1 rounded bg-slate-800/80 hover:bg-amber-600/30 hover:border-amber-500/50 hover:text-amber-200 border border-slate-700/60 transition-colors"
            >
              {lm.name}
            </button>
          ))}
        </div>

        {/* Layer Toggles */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowGrid(!showGrid)}
            title="Сетка 100x100"
            className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs border font-mono transition-colors ${
              showGrid
                ? 'bg-amber-500/20 border-amber-500/50 text-amber-300'
                : 'bg-slate-800/60 border-slate-700 text-slate-400'
            }`}
          >
            <Grid size={13} />
            <span className="hidden sm:inline">Сетка</span>
          </button>

          <button
            onClick={() => setShowTrees(!showTrees)}
            title="Деревья"
            className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs border font-mono transition-colors ${
              showTrees
                ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300'
                : 'bg-slate-800/60 border-slate-700 text-slate-400'
            }`}
          >
            <Trees size={13} />
            <span className="hidden sm:inline">Лес</span>
          </button>

          <button
            onClick={() => setShowIcons(!showIcons)}
            title="Постройки и Руны"
            className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs border font-mono transition-colors ${
              showIcons
                ? 'bg-blue-500/20 border-blue-500/50 text-blue-300'
                : 'bg-slate-800/60 border-slate-700 text-slate-400'
            }`}
          >
            <Layers size={13} />
            <span className="hidden sm:inline">Иконки</span>
          </button>

          <button
            onClick={() => handleJumpTo({ x: 50, y: 50, name: 'Центр' })}
            title="В центр карты"
            className="flex items-center gap-1 px-2.5 py-1 rounded text-xs border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-200"
          >
            <Maximize2 size={13} />
            <span className="hidden sm:inline">Центр</span>
          </button>
        </div>
      </header>

      {/* 2. Main Viewport & Canvas */}
      <div className="relative flex-1 w-full h-full overflow-hidden">
        <DotaMapCanvas
          mapData={mapData}
          selectedTile={selectedTile}
          onSelectTile={setSelectedTile}
          showGrid={showGrid}
          showIcons={showIcons}
          showTrees={showTrees}
          targetPos={targetPos}
        />

        {/* 3. Selected Tile Inspector Panel (Floating) */}
        {selectedTile && (
          <aside className="absolute top-4 right-4 w-72 bg-slate-900/95 backdrop-blur-md border border-slate-700 rounded-xl p-4 shadow-2xl z-10 animate-in fade-in slide-in-from-right duration-200">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="text-amber-400 font-mono font-bold text-sm">
                  Клетка [{selectedTile.x}, {selectedTile.y}]
                </span>
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-bold uppercase ${
                    selectedTile.faction === 'radiant'
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-700'
                      : selectedTile.faction === 'dire'
                      ? 'bg-rose-950 text-rose-300 border border-rose-700'
                      : 'bg-slate-800 text-slate-300 border border-slate-700'
                  }`}
                >
                  {selectedTile.faction}
                </span>
              </div>
              <button
                onClick={() => setSelectedTile(null)}
                className="text-slate-400 hover:text-white p-1 rounded"
              >
                <X size={14} />
              </button>
            </div>

            <div className="mt-3 space-y-2.5 text-xs font-mono">
              <div className="flex justify-between items-center bg-slate-950/60 p-2 rounded border border-slate-800/80">
                <span className="text-slate-400">Тип местности:</span>
                <span className="font-semibold text-slate-200">
                  {selectedTile.terrain.replace('_', ' ')}
                </span>
              </div>

              <div className="flex justify-between items-center bg-slate-950/60 p-2 rounded border border-slate-800/80">
                <span className="text-slate-400">Возвышенность:</span>
                <span
                  className={`font-semibold ${
                    selectedTile.elevation === 2
                      ? 'text-amber-400'
                      : selectedTile.elevation === 0
                      ? 'text-blue-400'
                      : 'text-slate-200'
                  }`}
                >
                  {selectedTile.elevation === 2
                    ? 'Высота (High Ground, +15% Hit)'
                    : selectedTile.elevation === 0
                    ? 'Низина (Река, -30% Miss снизу)'
                    : 'Базовый уровень'}
                </span>
              </div>

              {selectedTile.hasTree && (
                <div className="p-2 rounded bg-emerald-950/30 border border-emerald-800/50 text-emerald-300 flex items-center gap-2">
                  <Trees size={14} />
                  <span>Густой лес (блокирует путь и обзор)</span>
                </div>
              )}

              {selectedTile.object && (
                <div className="p-2.5 rounded bg-amber-950/30 border border-amber-800/50 text-amber-200 space-y-1">
                  <div className="font-bold flex items-center gap-1.5 text-sm">
                    <span>{selectedTile.object.symbol}</span>
                    <span>{selectedTile.object.name}</span>
                  </div>
                  {selectedTile.object.tier && (
                    <div className="text-[11px] text-amber-400/80">
                      Tier: {selectedTile.object.tier}
                    </div>
                  )}
                  {selectedTile.object.type === 'ROSHAN' && (
                    <div className="text-[10px] text-slate-300">
                      Логово Рошана. Блокирует видимость снаружи.
                    </div>
                  )}
                </div>
              )}

              <div className="pt-2 flex gap-2">
                <button
                  onClick={() => setTargetPos({ x: selectedTile.x, y: selectedTile.y })}
                  className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded bg-amber-600 hover:bg-amber-500 text-black font-bold text-xs transition-colors"
                >
                  <Target size={13} /> Центрировать
                </button>
              </div>
            </div>
          </aside>
        )}
      </div>

      {/* 4. Bottom Status Bar */}
      <footer className="h-7 bg-slate-950 border-t border-slate-800 px-4 flex items-center justify-between text-[11px] font-mono text-slate-500 shrink-0">
        <div className="flex items-center gap-4">
          <span>Сетка: 100 × 100</span>
          <span>Разрешение мира: 2800 × 2800 px</span>
        </div>
        <div className="flex items-center gap-4">
          <span>🖱️ Перетаскивание: ЛКМ</span>
          <span>🔍 Масштабирование: Колёсико мыши</span>
          <span>🎯 Выбор клетки: Клик</span>
        </div>
      </footer>
    </div>
  );
}
