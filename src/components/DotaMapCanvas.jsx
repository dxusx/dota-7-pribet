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
  heroes = [],
  creeps = [],
  towers = [],
  activeHeroId = null,
  reachableMoveCells = [],
  reachableAttackCells = [],
  skillTargetCells = [],
  hoverPath = [],
  pathTimeCost = null,
  canAffordPath = true,
  floatingTexts = [],
  onCellClick = null,
  onHoverTile = null,
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

  // Handle external camera focus (e.g. from landmark quick jump or hero click)
  useEffect(() => {
    if (!targetPos || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const targetWorldX = targetPos.x * TILE_SIZE + TILE_SIZE / 2;
    const targetWorldY = targetPos.y * TILE_SIZE + TILE_SIZE / 2;

    const zoom = Math.max(camera.zoom, 0.85);
    setCamera({
      x: canvas.width / 2 - targetWorldX * zoom,
      y: canvas.height / 2 - targetWorldY * zoom,
      zoom,
    });
  }, [targetPos]);

  // Minimap Rendering
  const renderMinimap = useCallback(() => {
    const mCanvas = minimapRef.current;
    const vCanvas = canvasRef.current;
    if (!mCanvas || !vCanvas || !mapData) return;
    const mCtx = mCanvas.getContext('2d');
    const mWidth = mCanvas.width;
    const mHeight = mCanvas.height;

    mCtx.clearRect(0, 0, mWidth, mHeight);

    if (offscreenCanvasRef.current) {
      mCtx.drawImage(offscreenCanvasRef.current, 0, 0, mWidth, mHeight);
    }

    const scale = mWidth / WORLD_SIZE;
    heroes.forEach(h => {
      if (h.isDead) return;
      mCtx.beginPath();
      mCtx.arc(h.x * TILE_SIZE * scale, h.y * TILE_SIZE * scale, 3, 0, Math.PI * 2);
      mCtx.fillStyle = h.faction === 'radiant' ? '#22c55e' : '#ef4444';
      mCtx.fill();
    });

    const { x: camX, y: camY, zoom } = camera;
    const safeZoom = Math.max(zoom || 0.45, 0.15);
    const viewWorldX = -camX / safeZoom;
    const viewWorldY = -camY / safeZoom;
    const viewWorldW = vCanvas.width / safeZoom;
    const viewWorldH = vCanvas.height / safeZoom;

    mCtx.strokeStyle = '#f59e0b';
    mCtx.lineWidth = 1.5;
    mCtx.strokeRect(viewWorldX * scale, viewWorldY * scale, viewWorldW * scale, viewWorldH * scale);
    mCtx.fillStyle = 'rgba(245, 158, 11, 0.1)';
    mCtx.fillRect(viewWorldX * scale, viewWorldY * scale, viewWorldW * scale, viewWorldH * scale);
  }, [camera, mapData, heroes]);

  // Center initial view to middle of map on mount
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const updateCanvasSize = () => {
      const parent = canvas.parentElement;
      const rect = parent ? parent.getBoundingClientRect() : null;
      const width = Math.max(rect?.width || 0, window.innerWidth || 800);
      const height = Math.max(rect?.height || 0, (window.innerHeight - 150) || 600);

      canvas.width = width;
      canvas.height = height;

      const fitZoom = Math.max(Math.min(width / WORLD_SIZE, height / WORLD_SIZE) * 1.05, 0.35);

      setCamera(prev => {
        const hasValidZoom = prev.zoom && prev.zoom > 0.1;
        const currentZoom = hasValidZoom ? prev.zoom : fitZoom;
        return {
          x: prev.x !== 0 ? prev.x : (width - WORLD_SIZE * currentZoom) / 2,
          y: prev.y !== 0 ? prev.y : (height - WORLD_SIZE * currentZoom) / 2,
          zoom: currentZoom,
        };
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
      const { x: camX, y: camY } = camera;
      const zoom = Math.max(camera.zoom || 0.45, 0.15);

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

      // 2. Tactical Range Overlays (Skill Target Cells)
      if (skillTargetCells.length > 0) {
        ctx.fillStyle = 'rgba(168, 85, 247, 0.28)';
        ctx.strokeStyle = '#a855f7';
        ctx.lineWidth = 1.5 / zoom;
        skillTargetCells.forEach(cell => {
          const px = cell.x * TILE_SIZE;
          const py = cell.y * TILE_SIZE;
          ctx.fillRect(px, py, TILE_SIZE, TILE_SIZE);
          ctx.strokeRect(px + 0.5, py + 0.5, TILE_SIZE - 1, TILE_SIZE - 1);
        });
      }

      // Move Cells
      if (reachableMoveCells.length > 0) {
        ctx.fillStyle = 'rgba(59, 130, 246, 0.22)';
        ctx.strokeStyle = '#3b82f6';
        ctx.lineWidth = 1.5 / zoom;
        reachableMoveCells.forEach(cell => {
          const px = cell.x * TILE_SIZE;
          const py = cell.y * TILE_SIZE;
          ctx.fillRect(px, py, TILE_SIZE, TILE_SIZE);
          ctx.strokeRect(px + 0.5, py + 0.5, TILE_SIZE - 1, TILE_SIZE - 1);
        });
      }

      // Attack Cells
      if (reachableAttackCells.length > 0) {
        ctx.fillStyle = 'rgba(239, 68, 68, 0.25)';
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 1.5 / zoom;
        reachableAttackCells.forEach(cell => {
          const px = cell.x * TILE_SIZE;
          const py = cell.y * TILE_SIZE;
          ctx.fillRect(px, py, TILE_SIZE, TILE_SIZE);
          ctx.strokeRect(px + 0.5, py + 0.5, TILE_SIZE - 1, TILE_SIZE - 1);
        });
      }

      // 3. Hover Path Preview (One-Click Walking Line)
      if (hoverPath.length > 0) {
        ctx.fillStyle = canAffordPath ? 'rgba(56, 189, 248, 0.35)' : 'rgba(239, 68, 68, 0.35)';
        ctx.strokeStyle = canAffordPath ? '#38bdf8' : '#ef4444';
        ctx.lineWidth = 2 / zoom;

        hoverPath.forEach(cell => {
          const px = cell.x * TILE_SIZE;
          const py = cell.y * TILE_SIZE;
          ctx.fillRect(px, py, TILE_SIZE, TILE_SIZE);
          ctx.strokeRect(px + 0.5, py + 0.5, TILE_SIZE - 1, TILE_SIZE - 1);
        });

        // Draw dotted path line
        ctx.beginPath();
        ctx.setLineDash([4 / zoom, 3 / zoom]);
        ctx.strokeStyle = canAffordPath ? '#38bdf8' : '#ef4444';
        ctx.lineWidth = 2.5 / zoom;
        hoverPath.forEach((cell, idx) => {
          const cx = cell.x * TILE_SIZE + TILE_SIZE / 2;
          const cy = cell.y * TILE_SIZE + TILE_SIZE / 2;
          if (idx === 0) ctx.moveTo(cx, cy);
          else ctx.lineTo(cx, cy);
        });
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // 4. Grid lines
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

      // 5. Draw Trees
      if (showTrees && mapData?.tiles) {
        for (let i = 0; i < mapData.tiles.length; i++) {
          const tile = mapData.tiles[i];
          if (tile.hasTree) {
            const px = tile.x * TILE_SIZE + TILE_SIZE / 2;
            const py = tile.y * TILE_SIZE + TILE_SIZE / 2;
            const r = TILE_SIZE * 0.40;

            ctx.beginPath();
            ctx.arc(px, py, r, 0, Math.PI * 2);
            ctx.fillStyle = tile.treeType === 'spooky' ? '#472b38' : '#1f542a';
            ctx.fill();

            ctx.beginPath();
            ctx.arc(px - 1.5, py - 1.5, r * 0.5, 0, Math.PI * 2);
            ctx.fillStyle = tile.treeType === 'spooky' ? '#693e53' : '#2e7a3d';
            ctx.fill();
          }
        }
      }

      // 6. Draw Objects & Buildings
      if (showIcons && mapData?.tiles) {
        ctx.font = `${Math.round(TILE_SIZE * 0.8)}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        for (let i = 0; i < mapData.tiles.length; i++) {
          const tile = mapData.tiles[i];
          if (tile.object) {
            const px = tile.x * TILE_SIZE + TILE_SIZE / 2;
            const py = tile.y * TILE_SIZE + TILE_SIZE / 2;

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

            ctx.fillText(tile.object.symbol || '📍', px, py + 1);
          }
        }
      }

      // 7. Draw Towers
      towers.forEach(t => {
        const px = t.x * TILE_SIZE + TILE_SIZE;
        const py = t.y * TILE_SIZE + TILE_SIZE;
        const isRad = t.faction === 'radiant';

        ctx.beginPath();
        ctx.arc(px, py, TILE_SIZE * 0.85, 0, Math.PI * 2);
        ctx.fillStyle = isRad ? 'rgba(34, 197, 94, 0.35)' : 'rgba(239, 68, 68, 0.35)';
        ctx.fill();
        ctx.strokeStyle = isRad ? '#22c55e' : '#ef4444';
        ctx.lineWidth = 2 / zoom;
        ctx.stroke();

        ctx.font = `${Math.round(TILE_SIZE * 0.8)}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(isRad ? '🛡️' : '⚔️', px, py);

        // HP bar for tower
        const hpPct = Math.max(0, t.hp / t.maxHp);
        ctx.fillStyle = 'rgba(0,0,0,0.7)';
        ctx.fillRect(px - 14, py + 14, 28, 4);
        ctx.fillStyle = hpPct > 0.3 ? '#22c55e' : '#ef4444';
        ctx.fillRect(px - 14, py + 14, 28 * hpPct, 4);
      });

      // 8. Draw Lane Creeps
      creeps.forEach(creep => {
        const px = creep.x * TILE_SIZE + TILE_SIZE / 2;
        const py = creep.y * TILE_SIZE + TILE_SIZE / 2;
        const isRad = creep.faction === 'radiant';

        ctx.beginPath();
        ctx.arc(px, py, TILE_SIZE * 0.38, 0, Math.PI * 2);
        ctx.fillStyle = isRad ? '#15803d' : '#991b1b';
        ctx.fill();
        ctx.strokeStyle = isRad ? '#4ade80' : '#f87171';
        ctx.lineWidth = 1 / zoom;
        ctx.stroke();

        // Mini HP Bar
        const hpPct = Math.max(0, creep.hp / creep.maxHp);
        ctx.fillStyle = 'rgba(0,0,0,0.6)';
        ctx.fillRect(px - 8, py - 12, 16, 3);
        ctx.fillStyle = isRad ? '#4ade80' : '#f87171';
        ctx.fillRect(px - 8, py - 12, 16 * hpPct, 3);
      });

      // 9. Draw Heroes
      const timeMs = Date.now();
      heroes.forEach(hero => {
        if (hero.isDead) return;
        const px = hero.x * TILE_SIZE + TILE_SIZE / 2;
        const py = hero.y * TILE_SIZE + TILE_SIZE / 2;
        const isActive = hero.instanceId === activeHeroId;
        const isRad = hero.faction === 'radiant';

        if (isActive) {
          const pulse = Math.sin(timeMs / 200) * 0.2 + 0.8;
          ctx.beginPath();
          ctx.arc(px, py, TILE_SIZE * 0.75 * pulse, 0, Math.PI * 2);
          ctx.strokeStyle = '#f59e0b';
          ctx.lineWidth = 3 / zoom;
          ctx.stroke();
          ctx.fillStyle = 'rgba(245, 158, 11, 0.2)';
          ctx.fill();
        }

        ctx.beginPath();
        ctx.arc(px, py, TILE_SIZE * 0.55, 0, Math.PI * 2);
        ctx.fillStyle = hero.themeColor || (isRad ? '#065f46' : '#7f1d1d');
        ctx.fill();
        ctx.strokeStyle = hero.accentColor || (isRad ? '#34d399' : '#f87171');
        ctx.lineWidth = 2 / zoom;
        ctx.stroke();

        ctx.font = `${Math.round(TILE_SIZE * 0.7)}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(hero.avatarSymbol || '👤', px, py);

        if (zoom > 0.55) {
          ctx.font = `bold ${Math.round(TILE_SIZE * 0.32)}px sans-serif`;
          ctx.fillStyle = '#ffffff';
          ctx.fillText(hero.name, px, py - TILE_SIZE * 0.7);
        }

        const hpPct = Math.max(0, hero.hp / hero.maxHp);
        const manaPct = Math.max(0, hero.mana / hero.maxMana);

        ctx.fillStyle = 'rgba(0,0,0,0.7)';
        ctx.fillRect(px - 12, py + TILE_SIZE * 0.55, 24, 3.5);
        ctx.fillStyle = '#10b981';
        ctx.fillRect(px - 12, py + TILE_SIZE * 0.55, 24 * hpPct, 3.5);

        ctx.fillStyle = 'rgba(0,0,0,0.7)';
        ctx.fillRect(px - 12, py + TILE_SIZE * 0.55 + 4, 24, 2);
        ctx.fillStyle = '#3b82f6';
        ctx.fillRect(px - 12, py + TILE_SIZE * 0.55 + 4, 24 * manaPct, 2);
      });

      // 10. Floating Combat Texts
      const now = Date.now();
      floatingTexts.forEach(ft => {
        const elapsed = (now - ft.createdAt) / 1000;
        if (elapsed < 1.5) {
          const alpha = 1.0 - elapsed / 1.5;
          const px = ft.x * TILE_SIZE + TILE_SIZE / 2;
          const py = ft.y * TILE_SIZE - elapsed * 20;

          ctx.font = `bold ${Math.round(TILE_SIZE * 0.65)}px sans-serif`;
          ctx.fillStyle = ft.color || '#f59e0b';
          ctx.globalAlpha = alpha;
          ctx.textAlign = 'center';
          ctx.fillText(ft.text, px, py);
          ctx.globalAlpha = 1.0;
        }
      });

      // 11. Move Badge on Hovered Destination Cell
      if (hoveredTile && pathTimeCost !== null) {
        const hx = hoveredTile.x * TILE_SIZE + TILE_SIZE / 2;
        const hy = hoveredTile.y * TILE_SIZE - 12;

        const badgeText = canAffordPath
          ? `🚶 ${hoverPath.length} шагов • ⏳ -${pathTimeCost}с`
          : `⚠️ Мало времени! (-${pathTimeCost}с)`;

        ctx.font = `bold ${Math.round(11 / zoom)}px monospace`;
        const textWidth = ctx.measureText(badgeText).width;

        ctx.fillStyle = canAffordPath ? 'rgba(15, 23, 42, 0.9)' : 'rgba(69, 10, 10, 0.95)';
        ctx.strokeStyle = canAffordPath ? '#38bdf8' : '#ef4444';
        ctx.lineWidth = 1.5 / zoom;
        ctx.beginPath();
        if (typeof ctx.roundRect === 'function') {
          ctx.roundRect(
            hx - textWidth / 2 - 6 / zoom,
            hy - 14 / zoom,
            textWidth + 12 / zoom,
            18 / zoom,
            4 / zoom
          );
        } else {
          ctx.rect(
            hx - textWidth / 2 - 6 / zoom,
            hy - 14 / zoom,
            textWidth + 12 / zoom,
            18 / zoom
          );
        }
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = canAffordPath ? '#38bdf8' : '#f87171';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(badgeText, hx, hy - 5 / zoom);
      }

      // 12. Hovered & Selected Cell
      if (hoveredTile) {
        const hx = hoveredTile.x * TILE_SIZE;
        const hy = hoveredTile.y * TILE_SIZE;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.fillRect(hx, hy, TILE_SIZE, TILE_SIZE);
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 2 / zoom;
        ctx.strokeRect(hx, hy, TILE_SIZE, TILE_SIZE);
      }

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

      // Render Minimap
      renderMinimap();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [
    camera,
    showGrid,
    showIcons,
    showTrees,
    hoveredTile,
    selectedTile,
    mapData,
    heroes,
    creeps,
    towers,
    activeHeroId,
    reachableMoveCells,
    reachableAttackCells,
    skillTargetCells,
    hoverPath,
    pathTimeCost,
    canAffordPath,
    floatingTexts,
    renderMinimap,
  ]);

  // Pointer & Mouse interactions
  const handleMouseDown = e => {
    if (e.button === 0) {
      isDraggingRef.current = true;
      lastMousePosRef.current = { x: e.clientX, y: e.clientY };
    }
  };

  const handleMouseMove = e => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    if (isDraggingRef.current) {
      const dx = e.clientX - lastMousePosRef.current.x;
      const dy = e.clientY - lastMousePosRef.current.y;
      lastMousePosRef.current = { x: e.clientX, y: e.clientY };

      setCamera(prev => ({
        ...prev,
        x: prev.x + dx,
        y: prev.y + dy,
      }));
    } else {
      const rect = canvas.getBoundingClientRect();
      const mouseCanvasX = e.clientX - rect.left;
      const mouseCanvasY = e.clientY - rect.top;

      const worldX = (mouseCanvasX - camera.x) / camera.zoom;
      const worldY = (mouseCanvasY - camera.y) / camera.zoom;

      const tileX = Math.floor(worldX / TILE_SIZE);
      const tileY = Math.floor(worldY / TILE_SIZE);

      if (tileX >= 0 && tileX < MAP_SIZE && tileY >= 0 && tileY < MAP_SIZE) {
        const idx = tileY * MAP_SIZE + tileX;
        const tile = mapData.tiles[idx];
        setHoveredTile(tile);
        if (onHoverTile) onHoverTile(tile);
      } else {
        setHoveredTile(null);
        if (onHoverTile) onHoverTile(null);
      }
    }
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
  };

  const handleClick = () => {
    if (hoveredTile) {
      onSelectTile(hoveredTile);
      if (onCellClick) {
        onCellClick(hoveredTile);
      }
    }
  };

  const handleWheel = e => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;

    const zoomFactor = e.deltaY < 0 ? 1.15 : 0.87;
    const newZoom = Math.min(Math.max(camera.zoom * zoomFactor, 0.15), 3.0);

    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    setCamera(prev => ({
      x: mouseX - (mouseX - prev.x) * (newZoom / prev.zoom),
      y: mouseY - (mouseY - prev.y) * (newZoom / prev.zoom),
      zoom: newZoom,
    }));
  };

  const handleMinimapClick = e => {
    const mCanvas = minimapRef.current;
    const vCanvas = canvasRef.current;
    if (!mCanvas || !vCanvas) return;

    const rect = mCanvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    const worldX = (clickX / mCanvas.width) * WORLD_SIZE;
    const worldY = (clickY / mCanvas.height) * WORLD_SIZE;

    setCamera(prev => ({
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
          if (onHoverTile) onHoverTile(null);
        }}
        onClick={handleClick}
        onWheel={handleWheel}
      />

      {/* Floating Hover Readout */}
      {hoveredTile && (
        <div className="absolute top-4 left-4 bg-slate-900/90 backdrop-blur-md border border-slate-700/80 px-3 py-2 rounded-lg shadow-xl text-xs font-mono pointer-events-none flex items-center gap-3 z-10">
          <span className="text-amber-400 font-bold">
            [{hoveredTile.x}, {hoveredTile.y}]
          </span>
          <span className="text-slate-300">{hoveredTile.terrain.replace('_', ' ')}</span>
          <span className="text-blue-400">
            {hoveredTile.elevation === 2 ? 'High Ground' : hoveredTile.elevation === 0 ? 'River' : 'Ground'}
          </span>
          {hoveredTile.hasTree && <span className="text-emerald-400">🌲 Лес</span>}
          {hoveredTile.object && (
            <span className="text-yellow-300 font-semibold">
              {hoveredTile.object.symbol} {hoveredTile.object.name}
            </span>
          )}
        </div>
      )}

      {/* Minimap Box in Bottom-Right */}
      <div className="absolute bottom-28 right-4 bg-slate-900/90 backdrop-blur-md p-2 rounded-xl border border-slate-700 shadow-2xl flex flex-col items-center z-10">
        <div className="text-[10px] text-slate-400 font-mono font-semibold uppercase tracking-wider mb-1 flex items-center justify-between w-full">
          <span>Minimap (100×100)</span>
          <span className="text-amber-500">Radar</span>
        </div>
        <canvas
          ref={minimapRef}
          width={150}
          height={150}
          onClick={handleMinimapClick}
          className="rounded border border-slate-800 cursor-crosshair shadow-inner"
        />
      </div>
    </div>
  );
}
