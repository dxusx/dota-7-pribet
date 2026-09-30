import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import { MAP_SIZE, TERRAIN, ELEVATION } from '../map/dotaMapData';

const TILE_SIZE = 28; // Base pixel size per tile in the world
const WORLD_SIZE = MAP_SIZE * TILE_SIZE; // 2800 x 2800 px

export default function DotaMapCanvas({
  mapData,
  selectedTile,
  onSelectTile,
  showGrid,
  showIcons,
  showTrees,
  targetPos,
}) {
  const canvasRef = useRef(null);
  const minimapRef = useRef(null);
  const offscreenCanvasRef = useRef(null);

  // Viewport camera state (pan offset and zoom scale)
  const [camera, setCamera] = useState({ x: 0, y: 0, zoom: 0.45 });
  const [hoveredTile, setHoveredTile] = useState(null);
  const isDraggingRef = useRef(false);
  const lastMousePosRef = useRef({ x: 0, y: 0 });

  // 1. Bake base terrain into Offscreen Canvas
  useEffect(() => {
    if (!mapData || !mapData.tiles) return;

    const offscreen = document.createElement('canvas');
    offscreen.width = WORLD_SIZE;
    offscreen.height = WORLD_SIZE;
    const ctx = offscreen.getContext('2d');

    // Color palette
    const colors = {
      [TERRAIN.WATER]: '#133a52',
      [TERRAIN.GRASS_RADIANT]: '#1c3822',
      [TERRAIN.GRASS_DIRE]: '#291b22',
      [TERRAIN.ROAD]: '#42372c',
      [TERRAIN.DIRT_PATH]: '#352c23',
      [TERRAIN.CLIFF]: '#383d47',
      [TERRAIN.ROSHAN_PIT]: '#19131d',
      [TERRAIN.BASE_RADIANT]: '#1a4731',
      [TERRAIN.BASE_DIRE]: '#421a1f',
    };

    // Draw tiles
    for (let i = 0; i < mapData.tiles.length; i++) {
      const tile = mapData.tiles[i];
      const px = tile.x * TILE_SIZE;
      const py = tile.y * TILE_SIZE;

      ctx.fillStyle = colors[tile.terrain] || '#1a1f26';
      ctx.fillRect(px, py, TILE_SIZE, TILE_SIZE);

      // Subtle texture / elevation tint
      if (tile.elevation === ELEVATION.HIGH) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
        ctx.fillRect(px, py, TILE_SIZE, TILE_SIZE);
      } else if (tile.elevation === ELEVATION.LOW) {
        ctx.fillStyle = 'rgba(0, 50, 100, 0.15)';
        ctx.fillRect(px, py, TILE_SIZE, TILE_SIZE);
      }

      // Base borders / tile contour
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.15)';
      ctx.strokeRect(px + 0.5, py + 0.5, TILE_SIZE, TILE_SIZE);
    }

    offscreenCanvasRef.current = offscreen;
  }, [mapData]);

  // Handle external camera focus (e.g. from landmark quick jump)
  useEffect(() => {
    if (!targetPos || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const targetWorldX = targetPos.x * TILE_SIZE + TILE_SIZE / 2;
    const targetWorldY = targetPos.y * TILE_SIZE + TILE_SIZE / 2;

    const zoom = Math.max(camera.zoom, 0.8);
    setCamera({
      x: canvas.width / 2 - targetWorldX * zoom,
      y: canvas.height / 2 - targetWorldY * zoom,
      zoom,
    });
  }, [targetPos]);

  // Center initial view to middle of map on mount
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const updateCanvasSize = () => {
      const rect = canvas.parentElement.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;

      // Fit map initially
      const initialZoom = Math.min(rect.width / WORLD_SIZE, rect.height / WORLD_SIZE) * 1.1;
      setCamera({
        x: (rect.width - WORLD_SIZE * initialZoom) / 2,
        y: (rect.height - WORLD_SIZE * initialZoom) / 2,
        zoom: initialZoom,
      });
    };

    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);
    return () => window.removeEventListener('resize', updateCanvasSize);
  }, []);

  // Main Render Loop
  useEffect(() => {
    let animId;
    const render = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      const { x: camX, y: camY, zoom } = camera;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.save();

      // Background void
      ctx.fillStyle = '#0a0d14';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Transform world
      ctx.translate(camX, camY);
      ctx.scale(zoom, zoom);

      // 1. Draw baked terrain
      if (offscreenCanvasRef.current) {
        ctx.drawImage(offscreenCanvasRef.current, 0, 0);
      }

      // 2. Grid lines
      if (showGrid) {
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.07)';
        ctx.lineWidth = 1 / zoom;
        ctx.beginPath();
        for (let i = 0; i <= MAP_SIZE; i++) {
          const pos = i * TILE_SIZE;
          ctx.moveTo(pos, 0);
          ctx.lineTo(pos, WORLD_SIZE);
          ctx.moveTo(0, pos);
          ctx.lineTo(WORLD_SIZE, pos);
        }
        ctx.stroke();

        // 5-tile major grid lines
        ctx.strokeStyle = 'rgba(255, 215, 0, 0.12)';
        ctx.lineWidth = 2 / zoom;
        ctx.beginPath();
        for (let i = 0; i <= MAP_SIZE; i += 5) {
          const pos = i * TILE_SIZE;
          ctx.moveTo(pos, 0);
          ctx.lineTo(pos, WORLD_SIZE);
          ctx.moveTo(0, pos);
          ctx.lineTo(WORLD_SIZE, pos);
        }
        ctx.stroke();
      }

      // 3. Draw Trees
      if (showTrees && mapData?.tiles) {
        for (let i = 0; i < mapData.tiles.length; i++) {
          const tile = mapData.tiles[i];
          if (tile.hasTree) {
            const px = tile.x * TILE_SIZE + TILE_SIZE / 2;
            const py = tile.y * TILE_SIZE + TILE_SIZE / 2;
            const r = TILE_SIZE * 0.42;

            ctx.beginPath();
            ctx.arc(px, py, r, 0, Math.PI * 2);
            ctx.fillStyle = tile.treeType === 'spooky' ? '#472b38' : '#1f542a';
            ctx.fill();

            // Tree inner highlight
            ctx.beginPath();
            ctx.arc(px - 2, py - 2, r * 0.5, 0, Math.PI * 2);
            ctx.fillStyle = tile.treeType === 'spooky' ? '#693e53' : '#2e7a3d';
            ctx.fill();
          }
        }
      }

      // 4. Draw Objects & Buildings
      if (showIcons && mapData?.tiles) {
        ctx.font = `${Math.round(TILE_SIZE * 0.8)}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        for (let i = 0; i < mapData.tiles.length; i++) {
          const tile = mapData.tiles[i];
          if (tile.object) {
            const px = tile.x * TILE_SIZE + TILE_SIZE / 2;
            const py = tile.y * TILE_SIZE + TILE_SIZE / 2;

            // Highlight ring around key buildings
            if (tile.object.type === 'ANCIENT' || tile.object.type === 'ROSHAN') {
              ctx.beginPath();
              ctx.arc(px, py, TILE_SIZE * 1.2, 0, Math.PI * 2);
              ctx.fillStyle =
                tile.object.faction === 'radiant'
                  ? 'rgba(34, 197, 94, 0.25)'
                  : tile.object.faction === 'dire'
                  ? 'rgba(239, 68, 68, 0.25)'
                  : 'rgba(168, 85, 247, 0.25)';
              ctx.fill();
              ctx.strokeStyle =
                tile.object.faction === 'radiant' ? '#22c55e' : tile.object.faction === 'dire' ? '#ef4444' : '#a855f7';
              ctx.lineWidth = 2 / zoom;
              ctx.stroke();
            } else if (tile.object.type === 'TOWER') {
              ctx.beginPath();
              ctx.arc(px, py, TILE_SIZE * 0.6, 0, Math.PI * 2);
              ctx.fillStyle =
                tile.object.faction === 'radiant' ? 'rgba(34, 197, 94, 0.3)' : 'rgba(239, 68, 68, 0.3)';
              ctx.fill();
            } else if (tile.object.type === 'NEUTRAL_CAMP') {
              ctx.beginPath();
              ctx.arc(px, py, TILE_SIZE * 0.65, 0, Math.PI * 2);
              ctx.fillStyle = 'rgba(234, 179, 8, 0.2)';
              ctx.fill();
              ctx.strokeStyle = 'rgba(234, 179, 8, 0.6)';
              ctx.lineWidth = 1.5 / zoom;
              ctx.stroke();
            } else if (tile.object.type === 'SHOP' || tile.object.type === 'OUTPOST') {
              ctx.beginPath();
              ctx.arc(px, py, TILE_SIZE * 0.65, 0, Math.PI * 2);
              ctx.fillStyle = 'rgba(56, 189, 248, 0.2)';
              ctx.fill();
              ctx.strokeStyle = 'rgba(56, 189, 248, 0.6)';
              ctx.lineWidth = 1.5 / zoom;
              ctx.stroke();
            }

            // Draw Symbol
            ctx.fillText(tile.object.symbol || '📍', px, py + 1);

            // Tier or small label for towers
            if (tile.object.tier && zoom > 0.7) {
              ctx.font = `bold ${Math.round(TILE_SIZE * 0.35)}px sans-serif`;
              ctx.fillStyle = '#ffffff';
              ctx.fillText(`T${tile.object.tier}`, px, py + TILE_SIZE * 0.6);
              ctx.font = `${Math.round(TILE_SIZE * 0.8)}px sans-serif`;
            }
          }
        }
      }

      // 5. Hovered Tile Highlight
      if (hoveredTile) {
        const hx = hoveredTile.x * TILE_SIZE;
        const hy = hoveredTile.y * TILE_SIZE;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
        ctx.fillRect(hx, hy, TILE_SIZE, TILE_SIZE);
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 2 / zoom;
        ctx.strokeRect(hx, hy, TILE_SIZE, TILE_SIZE);
      }

      // 6. Selected Tile Highlight
      if (selectedTile) {
        const sx = selectedTile.x * TILE_SIZE;
        const sy = selectedTile.y * TILE_SIZE;
        ctx.fillStyle = 'rgba(245, 158, 11, 0.35)';
        ctx.fillRect(sx, sy, TILE_SIZE, TILE_SIZE);
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 3 / zoom;
        ctx.strokeRect(sx, sy, TILE_SIZE, TILE_SIZE);
      }

      ctx.restore();

      // 7. Render Minimap
      renderMinimap();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [camera, showGrid, showIcons, showTrees, hoveredTile, selectedTile, mapData]);

  // Minimap Rendering
  const renderMinimap = useCallback(() => {
    const mCanvas = minimapRef.current;
    const vCanvas = canvasRef.current;
    if (!mCanvas || !vCanvas || !mapData) return;
    const mCtx = mCanvas.getContext('2d');
    const mWidth = mCanvas.width;
    const mHeight = mCanvas.height;

    mCtx.clearRect(0, 0, mWidth, mHeight);

    // Draw offscreen preview scaled
    if (offscreenCanvasRef.current) {
      mCtx.drawImage(offscreenCanvasRef.current, 0, 0, mWidth, mHeight);
    }

    // Draw Viewport Camera Box on Minimap
    const { x: camX, y: camY, zoom } = camera;
    const scale = mWidth / WORLD_SIZE;

    // Invert camera transform to find viewport rect in world coordinates
    const viewWorldX = -camX / zoom;
    const viewWorldY = -camY / zoom;
    const viewWorldW = vCanvas.width / zoom;
    const viewWorldH = vCanvas.height / zoom;

    mCtx.strokeStyle = '#f59e0b';
    mCtx.lineWidth = 1.5;
    mCtx.strokeRect(
      viewWorldX * scale,
      viewWorldY * scale,
      viewWorldW * scale,
      viewWorldH * scale
    );
    mCtx.fillStyle = 'rgba(245, 158, 11, 0.1)';
    mCtx.fillRect(
      viewWorldX * scale,
      viewWorldY * scale,
      viewWorldW * scale,
      viewWorldH * scale
    );
  }, [camera, mapData]);

  // Pointer & Mouse interactions
  const handleMouseDown = (e) => {
    if (e.button === 0) {
      isDraggingRef.current = true;
      lastMousePosRef.current = { x: e.clientX, y: e.clientY };
    }
  };

  const handleMouseMove = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    if (isDraggingRef.current) {
      const dx = e.clientX - lastMousePosRef.current.x;
      const dy = e.clientY - lastMousePosRef.current.y;
      lastMousePosRef.current = { x: e.clientX, y: e.clientY };

      setCamera((prev) => ({
        ...prev,
        x: prev.x + dx,
        y: prev.y + dy,
      }));
    } else {
      // Calculate tile under mouse
      const rect = canvas.getBoundingClientRect();
      const mouseCanvasX = e.clientX - rect.left;
      const mouseCanvasY = e.clientY - rect.top;

      const worldX = (mouseCanvasX - camera.x) / camera.zoom;
      const worldY = (mouseCanvasY - camera.y) / camera.zoom;

      const tileX = Math.floor(worldX / TILE_SIZE);
      const tileY = Math.floor(worldY / TILE_SIZE);

      if (tileX >= 0 && tileX < MAP_SIZE && tileY >= 0 && tileY < MAP_SIZE) {
        const idx = tileY * MAP_SIZE + tileX;
        setHoveredTile(mapData.tiles[idx]);
      } else {
        setHoveredTile(null);
      }
    }
  };

  const handleMouseUp = (e) => {
    isDraggingRef.current = false;
  };

  const handleClick = (e) => {
    // Check if clicked to select tile
    if (hoveredTile) {
      onSelectTile(hoveredTile);
    }
  };

  const handleWheel = (e) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;

    const zoomFactor = e.deltaY < 0 ? 1.15 : 0.87;
    const newZoom = Math.min(Math.max(camera.zoom * zoomFactor, 0.15), 3.0);

    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // Zoom centered on mouse
    setCamera((prev) => ({
      x: mouseX - (mouseX - prev.x) * (newZoom / prev.zoom),
      y: mouseY - (mouseY - prev.y) * (newZoom / prev.zoom),
      zoom: newZoom,
    }));
  };

  // Minimap Click Navigation
  const handleMinimapClick = (e) => {
    const mCanvas = minimapRef.current;
    const vCanvas = canvasRef.current;
    if (!mCanvas || !vCanvas) return;

    const rect = mCanvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    const worldX = (clickX / mCanvas.width) * WORLD_SIZE;
    const worldY = (clickY / mCanvas.height) * WORLD_SIZE;

    setCamera((prev) => ({
      ...prev,
      x: vCanvas.width / 2 - worldX * prev.zoom,
      y: vCanvas.height / 2 - worldY * prev.zoom,
    }));
  };

  return (
    <div className="relative w-full h-full select-none overflow-hidden bg-[#0a0d14]">
      {/* Main Map Canvas */}
      <canvas
        ref={canvasRef}
        className="w-full h-full cursor-grab active:cursor-grabbing block"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={() => {
          isDraggingRef.current = false;
          setHoveredTile(null);
        }}
        onClick={handleClick}
        onWheel={handleWheel}
      />

      {/* Floating Hover Readout */}
      {hoveredTile && (
        <div className="absolute top-4 left-4 bg-slate-900/90 backdrop-blur-md border border-slate-700/80 px-3 py-2 rounded-lg shadow-xl text-xs font-mono pointer-events-none flex items-center gap-3">
          <span className="text-amber-400 font-bold">
            [{hoveredTile.x}, {hoveredTile.y}]
          </span>
          <span className="text-slate-300">
            {hoveredTile.terrain.replace('_', ' ')}
          </span>
          <span className="text-blue-400">
            {hoveredTile.elevation === 2 ? 'High Ground' : hoveredTile.elevation === 0 ? 'River' : 'Ground'}
          </span>
          {hoveredTile.hasTree && <span className="text-emerald-400">🌲 Tree</span>}
          {hoveredTile.object && (
            <span className="text-yellow-300 font-semibold">
              {hoveredTile.object.symbol} {hoveredTile.object.name}
            </span>
          )}
        </div>
      )}

      {/* Minimap Box in Bottom-Right */}
      <div className="absolute bottom-4 right-4 bg-slate-900/90 backdrop-blur-md p-2 rounded-xl border border-slate-700 shadow-2xl flex flex-col items-center">
        <div className="text-[10px] text-slate-400 font-mono font-semibold uppercase tracking-wider mb-1 flex items-center justify-between w-full">
          <span>Minimap (100×100)</span>
          <span className="text-amber-500">Radar</span>
        </div>
        <canvas
          ref={minimapRef}
          width={160}
          height={160}
          onClick={handleMinimapClick}
          className="rounded border border-slate-800 cursor-crosshair shadow-inner"
        />
      </div>
    </div>
  );
}
