import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import { MAP_SIZE, TERRAIN, ELEVATION } from '../map/dotaMapData';
import { getHeroCanvasImage } from '../assets/heroPortraits';

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
  roshan = null,
  activeHeroId = null,
  reachableMoveCells = [],
  reachableAttackCells = [],
  skillTargetCells = [],
  hoverPath = [],
  pathTimeCost = null,
  canAffordPath = true,
  maxSteps = 6,
  heroSpeed = 6,
  isMaxCapReached = false,
  floatingTexts = [],
  onCellClick = null,
  onHoverTile = null,
}) {
  const canvasRef = useRef(null);
  const minimapRef = useRef(null);
  const offscreenCanvasRef = useRef(null);
  const portraitImagesRef = useRef(new Map());

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

    // High-fidelity terrain color palette
    const colors = {
      [TERRAIN.WATER]: '#0d324d',
      [TERRAIN.GRASS_RADIANT]: '#1a3c22',
      [TERRAIN.GRASS_DIRE]: '#2a1a25',
      [TERRAIN.ROAD]: '#473d32',
      [TERRAIN.DIRT_PATH]: '#382e23',
      [TERRAIN.CLIFF]: '#323742',
      [TERRAIN.ROSHAN_PIT]: '#1b1322',
      [TERRAIN.BASE_RADIANT]: '#174730',
      [TERRAIN.BASE_DIRE]: '#42171e',
    };

    // Draw base tiles
    for (let i = 0; i < mapData.tiles.length; i++) {
      const tile = mapData.tiles[i];
      const px = tile.x * TILE_SIZE;
      const py = tile.y * TILE_SIZE;

      ctx.fillStyle = colors[tile.terrain] || '#1a1f26';
      ctx.fillRect(px, py, TILE_SIZE, TILE_SIZE);

      // Subtle elevation tint
      if (tile.elevation === ELEVATION.HIGH) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
        ctx.fillRect(px, py, TILE_SIZE, TILE_SIZE);
      } else if (tile.elevation === ELEVATION.LOW) {
        ctx.fillStyle = 'rgba(2, 44, 77, 0.22)';
        ctx.fillRect(px, py, TILE_SIZE, TILE_SIZE);
      }

      // Base borders / tile contour
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.12)';
      ctx.strokeRect(px + 0.5, py + 0.5, TILE_SIZE, TILE_SIZE);
    }

    // 3D Cliff highlights, drop shadows, and river waterline details
    const size = MAP_SIZE;
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const idx = y * size + x;
        const tile = mapData.tiles[idx];
        const px = x * TILE_SIZE;
        const py = y * TILE_SIZE;

        // 3D Cliff highlights and drop shadows
        if (tile.elevation === ELEVATION.HIGH) {
          const tileAbove = y > 0 ? mapData.tiles[(y - 1) * size + x] : null;
          if (!tileAbove || tileAbove.elevation < ELEVATION.HIGH) {
            ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
            ctx.fillRect(px, py, TILE_SIZE, 3);
          }
          const tileBelow = y < size - 1 ? mapData.tiles[(y + 1) * size + x] : null;
          if (tileBelow && tileBelow.elevation < ELEVATION.HIGH) {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.38)';
            ctx.fillRect(px, py + TILE_SIZE - 4, TILE_SIZE, 4);
          }
          const tileLeft = x > 0 ? mapData.tiles[y * size + (x - 1)] : null;
          if (!tileLeft || tileLeft.elevation < ELEVATION.HIGH) {
            ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
            ctx.fillRect(px, py, 2, TILE_SIZE);
          }
          const tileRight = x < size - 1 ? mapData.tiles[y * size + (x + 1)] : null;
          if (tileRight && tileRight.elevation < ELEVATION.HIGH) {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
            ctx.fillRect(px + TILE_SIZE - 2, py, 2, TILE_SIZE);
          }
        }

        // River water ripples and subtle foam shorelines
        if (tile.terrain === TERRAIN.WATER) {
          // Curved ripple line in the center of the water cell
          ctx.strokeStyle = 'rgba(125, 211, 252, 0.16)';
          ctx.lineWidth = 1.2;
          ctx.beginPath();
          ctx.arc(px + TILE_SIZE * 0.5, py + TILE_SIZE * 0.4, TILE_SIZE * 0.3, 0.3, Math.PI - 0.3);
          ctx.stroke();

          // River shoreline foam if bordering land
          const neighbors = [
            { nx: x, ny: y - 1, side: 'top' },
            { nx: x, ny: y + 1, side: 'bottom' },
            { nx: x - 1, ny: y, side: 'left' },
            { nx: x + 1, ny: y, side: 'right' },
          ];
          for (const n of neighbors) {
            if (n.nx >= 0 && n.nx < size && n.ny >= 0 && n.ny < size) {
              const nt = mapData.tiles[n.ny * size + n.nx];
              if (nt.terrain !== TERRAIN.WATER) {
                ctx.fillStyle = 'rgba(186, 230, 253, 0.22)';
                if (n.side === 'top') ctx.fillRect(px, py, TILE_SIZE, 2);
                else if (n.side === 'bottom') ctx.fillRect(px, py + TILE_SIZE - 2, TILE_SIZE, 2);
                else if (n.side === 'left') ctx.fillRect(px, py, 2, TILE_SIZE);
                else if (n.side === 'right') ctx.fillRect(px + TILE_SIZE - 2, py, 2, TILE_SIZE);
              }
            }
          }
        }
      }
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

    // Draw Towers and Ancients on Minimap
    towers.forEach(t => {
      if (t.hp <= 0) return;
      const tx = t.x * TILE_SIZE * scale;
      const ty = t.y * TILE_SIZE * scale;
      const tw = (t.size || 2) * TILE_SIZE * scale;
      mCtx.fillStyle = t.faction === 'radiant' ? '#22c55e' : '#ef4444';
      mCtx.fillRect(tx, ty, Math.max(2, tw), Math.max(2, tw));
    });

    // Draw Roshan Pits on Minimap
    const pits = [
      { id: 'north', x: 26, y: 24 },
      { id: 'south', x: 74, y: 76 },
    ];
    pits.forEach(p => {
      const px = p.x * TILE_SIZE * scale;
      const py = p.y * TILE_SIZE * scale;
      const isActive = roshan && !roshan.isDead && roshan.pitId === p.id;
      mCtx.beginPath();
      mCtx.arc(px, py, 2.5, 0, Math.PI * 2);
      mCtx.fillStyle = isActive ? '#ef4444' : '#64748b';
      mCtx.fill();
    });

    // Draw Heroes on Minimap
    heroes.forEach(h => {
      if (h.isDead) return;
      mCtx.beginPath();
      mCtx.arc(h.x * TILE_SIZE * scale, h.y * TILE_SIZE * scale, 3, 0, Math.PI * 2);
      mCtx.fillStyle = h.faction === 'radiant' ? '#4ade80' : '#f87171';
      mCtx.fill();
      mCtx.strokeStyle = '#ffffff';
      mCtx.lineWidth = 0.5;
      mCtx.stroke();
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
  }, [camera, mapData, heroes, towers, roshan]);

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

      // 6. Draw Objects & Landmarks (Bounty Altars, Neutral Camps, Shops, Outposts, Runes)
      if (showIcons && mapData?.tiles) {
        for (let i = 0; i < mapData.tiles.length; i++) {
          const tile = mapData.tiles[i];
          if (!tile.object) continue;

          // Towers and Ancients are drawn in dedicated multi-tile steps below
          if (tile.object.type === 'TOWER' || tile.object.type === 'ANCIENT') continue;

          const px = tile.x * TILE_SIZE + TILE_SIZE / 2;
          const py = tile.y * TILE_SIZE + TILE_SIZE / 2;

          if (tile.object.type === 'BOUNTY_ALTAR') {
            // Dedicated Bounty Rune Altar Platform (3x3 Dais)
            ctx.beginPath();
            ctx.arc(px, py, TILE_SIZE * 1.05, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(234, 179, 8, 0.22)';
            ctx.fill();
            ctx.strokeStyle = '#eab308';
            ctx.lineWidth = 2 / zoom;
            ctx.stroke();

            // Inner golden runic circle
            ctx.beginPath();
            ctx.arc(px, py, TILE_SIZE * 0.65, 0, Math.PI * 2);
            ctx.strokeStyle = 'rgba(250, 204, 21, 0.7)';
            ctx.lineWidth = 1 / zoom;
            ctx.stroke();

            // Floating golden coin
            ctx.font = `${Math.round(TILE_SIZE * 0.78)}px sans-serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('🪙', px, py);

            // Altar Label
            ctx.font = `bold ${Math.max(8, Math.round(TILE_SIZE * 0.32))}px monospace`;
            ctx.fillStyle = '#fef08a';
            ctx.fillText('АЛТАРЬ', px, py + TILE_SIZE * 0.78);
          } else if (tile.object.type === 'NEUTRAL_CAMP') {
            ctx.beginPath();
            ctx.arc(px, py, TILE_SIZE * 0.65, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(234, 179, 8, 0.2)';
            ctx.fill();
            ctx.strokeStyle = 'rgba(234, 179, 8, 0.6)';
            ctx.lineWidth = 1.5 / zoom;
            ctx.stroke();

            ctx.font = `${Math.round(TILE_SIZE * 0.65)}px sans-serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(tile.object.symbol || '🐺', px, py);
          } else if (tile.object.type === 'SHOP' || tile.object.type === 'OUTPOST') {
            ctx.beginPath();
            ctx.arc(px, py, TILE_SIZE * 0.65, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(56, 189, 248, 0.2)';
            ctx.fill();
            ctx.strokeStyle = 'rgba(56, 189, 248, 0.6)';
            ctx.lineWidth = 1.5 / zoom;
            ctx.stroke();

            ctx.font = `${Math.round(TILE_SIZE * 0.65)}px sans-serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(tile.object.symbol || '🏛️', px, py);
          } else if (tile.object.type === 'RUNE') {
            ctx.beginPath();
            ctx.arc(px, py, TILE_SIZE * 0.55, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(168, 85, 247, 0.3)';
            ctx.fill();
            ctx.strokeStyle = '#c084fc';
            ctx.lineWidth = 1.5 / zoom;
            ctx.stroke();

            ctx.font = `${Math.round(TILE_SIZE * 0.65)}px sans-serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(tile.object.symbol || '💠', px, py);
          } else if (tile.object.type === 'FOUNTAIN') {
            ctx.beginPath();
            ctx.arc(px, py, TILE_SIZE * 0.9, 0, Math.PI * 2);
            ctx.fillStyle = tile.object.faction === 'radiant' ? 'rgba(34, 197, 94, 0.25)' : 'rgba(239, 68, 68, 0.25)';
            ctx.fill();
            ctx.strokeStyle = tile.object.faction === 'radiant' ? '#22c55e' : '#ef4444';
            ctx.lineWidth = 2 / zoom;
            ctx.stroke();

            ctx.font = `${Math.round(TILE_SIZE * 0.8)}px sans-serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(tile.object.symbol || '⛲', px, py);
          }
        }
      }

      // 7. Dedicated 4x4 Ancients (World Tree & Throne of Decay)
      const radThrone = towers.find(t => t.id === 'rad_throne');
      const direThrone = towers.find(t => t.id === 'dire_throne');

      // Radiant World Tree (Center: 12, 88)
      {
        const cx = 12 * TILE_SIZE;
        const cy = 88 * TILE_SIZE;
        const r = TILE_SIZE * 2.2;
        const hp = radThrone ? radThrone.hp : 3000;
        const maxHp = radThrone ? radThrone.maxHp : 3000;
        const hpPct = Math.max(0, hp / maxHp);

        // Outer Consecrated Dais
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(16, 185, 129, 0.28)';
        ctx.fill();
        ctx.strokeStyle = '#10b981';
        ctx.lineWidth = 3 / zoom;
        ctx.stroke();

        // Inner Root Ring
        ctx.beginPath();
        ctx.arc(cx, cy, r * 0.65, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(5, 150, 105, 0.45)';
        ctx.fill();
        ctx.strokeStyle = '#34d399';
        ctx.lineWidth = 2 / zoom;
        ctx.stroke();

        // Grand World Tree Symbol
        ctx.font = `${Math.round(TILE_SIZE * 2.0)}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('🌳', cx, cy - 4);

        // Ancient Title & HP Bar (4x4 width)
        ctx.font = `bold ${Math.max(10, Math.round(TILE_SIZE * 0.42))}px sans-serif`;
        ctx.fillStyle = '#6ee7b7';
        ctx.fillText('ДРЕВО ЖИЗНИ', cx, cy - r - 8);

        const barW = 84;
        const barH = 7;
        ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
        ctx.fillRect(cx - barW / 2, cy + r - 6, barW, barH);
        ctx.fillStyle = hpPct > 0.3 ? '#10b981' : '#ef4444';
        ctx.fillRect(cx - barW / 2, cy + r - 6, barW * hpPct, barH);
        ctx.strokeStyle = '#34d399';
        ctx.lineWidth = 1 / zoom;
        ctx.strokeRect(cx - barW / 2, cy + r - 6, barW, barH);

        ctx.font = `bold ${Math.max(8, Math.round(TILE_SIZE * 0.3))}px monospace`;
        ctx.fillStyle = '#ffffff';
        ctx.fillText(`${hp}/${maxHp} HP`, cx, cy + r + 8);
      }

      // Dire Throne of Decay (Center: 88, 12)
      {
        const cx = 88 * TILE_SIZE;
        const cy = 12 * TILE_SIZE;
        const r = TILE_SIZE * 2.2;
        const hp = direThrone ? direThrone.hp : 3000;
        const maxHp = direThrone ? direThrone.maxHp : 3000;
        const hpPct = Math.max(0, hp / maxHp);

        // Outer Volcanic Dais
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(239, 68, 68, 0.28)';
        ctx.fill();
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 3 / zoom;
        ctx.stroke();

        // Inner Magma Ring
        ctx.beginPath();
        ctx.arc(cx, cy, r * 0.65, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(185, 28, 28, 0.5)';
        ctx.fill();
        ctx.strokeStyle = '#f87171';
        ctx.lineWidth = 2 / zoom;
        ctx.stroke();

        // Grand Throne of Decay Symbol
        ctx.font = `${Math.round(TILE_SIZE * 2.0)}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('🌋', cx, cy - 4);

        // Ancient Title & HP Bar (4x4 width)
        ctx.font = `bold ${Math.max(10, Math.round(TILE_SIZE * 0.42))}px sans-serif`;
        ctx.fillStyle = '#fca5a5';
        ctx.fillText('ТРОН ТЬМЫ', cx, cy - r - 8);

        const barW = 84;
        const barH = 7;
        ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
        ctx.fillRect(cx - barW / 2, cy + r - 6, barW, barH);
        ctx.fillStyle = hpPct > 0.3 ? '#ef4444' : '#991b1b';
        ctx.fillRect(cx - barW / 2, cy + r - 6, barW * hpPct, barH);
        ctx.strokeStyle = '#f87171';
        ctx.lineWidth = 1 / zoom;
        ctx.strokeRect(cx - barW / 2, cy + r - 6, barW, barH);

        ctx.font = `bold ${Math.max(8, Math.round(TILE_SIZE * 0.3))}px monospace`;
        ctx.fillStyle = '#ffffff';
        ctx.fillText(`${hp}/${maxHp} HP`, cx, cy + r + 8);
      }

      // 8. Dedicated 2x2 Towers Rendering (Fortress Walls with Pixel-Perfect Alignment)
      const normalTowers = towers.filter(t => t.id !== 'rad_throne' && t.id !== 'dire_throne');
      normalTowers.forEach(t => {
        if (t.hp <= 0) return;

        const leftX = t.x * TILE_SIZE;
        const topY = t.y * TILE_SIZE;
        const w = 2 * TILE_SIZE;
        const h = 2 * TILE_SIZE;
        const cx = (t.x + 1.0) * TILE_SIZE;
        const cy = (t.y + 1.0) * TILE_SIZE;
        const isRad = t.faction === 'radiant';

        const isHovered = hoveredTile && hoveredTile.x >= t.x && hoveredTile.x <= t.x + 1 && hoveredTile.y >= t.y && hoveredTile.y <= t.y + 1;
        const isSelected = selectedTile && selectedTile.x >= t.x && selectedTile.x <= t.x + 1 && selectedTile.y >= t.y && selectedTile.y <= t.y + 1;

        // Attack Range Circle (10 tiles) on hover / selection
        if (isHovered || isSelected) {
          ctx.beginPath();
          ctx.arc(cx, cy, 10 * TILE_SIZE, 0, Math.PI * 2);
          ctx.fillStyle = isRad ? 'rgba(34, 197, 94, 0.08)' : 'rgba(239, 68, 68, 0.08)';
          ctx.fill();
          ctx.setLineDash([6 / zoom, 4 / zoom]);
          ctx.strokeStyle = isRad ? '#22c55e' : '#ef4444';
          ctx.lineWidth = 1.5 / zoom;
          ctx.stroke();
          ctx.setLineDash([]);
        }

        // 2x2 Fortress Base Plinth
        ctx.fillStyle = isRad ? '#1e382b' : '#3d1e24';
        ctx.strokeStyle = isRad ? '#22c55e' : '#ef4444';
        ctx.lineWidth = 2 / zoom;
        ctx.fillRect(leftX + 2, topY + 2, w - 4, h - 4);
        ctx.strokeRect(leftX + 2, topY + 2, w - 4, h - 4);

        // Fortress Corner Bastions
        const cornerRadius = 3.5;
        const corners = [
          [leftX + 5, topY + 5],
          [leftX + w - 5, topY + 5],
          [leftX + 5, topY + h - 5],
          [leftX + w - 5, topY + h - 5],
        ];
        ctx.fillStyle = isRad ? '#134731' : '#45171d';
        corners.forEach(([kx, ky]) => {
          ctx.beginPath();
          ctx.arc(kx, ky, cornerRadius, 0, Math.PI * 2);
          ctx.fill();
        });

        // Central Tower Turret Circle
        ctx.beginPath();
        ctx.arc(cx, cy, TILE_SIZE * 0.72, 0, Math.PI * 2);
        ctx.fillStyle = isRad ? 'rgba(34, 197, 94, 0.4)' : 'rgba(239, 68, 68, 0.4)';
        ctx.fill();
        ctx.strokeStyle = isRad ? '#4ade80' : '#f87171';
        ctx.lineWidth = 1.8 / zoom;
        ctx.stroke();

        // Centered Faction Crest (Exactly centered at 2x2 origin cx, cy)
        ctx.font = `${Math.round(TILE_SIZE * 0.85)}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(isRad ? '🛡️' : '⚔️', cx, cy - 1);

        // Tier Badge (e.g. T1, T2, T3, T4)
        ctx.font = `bold ${Math.max(8, Math.round(TILE_SIZE * 0.32))}px monospace`;
        ctx.fillStyle = '#f8fafc';
        ctx.fillText(`T${t.tier}`, cx, topY + 9);

        // HP bar for tower (centered under 2x2 structure)
        const hpPct = Math.max(0, t.hp / t.maxHp);
        const barW = 38;
        const barH = 5;
        ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
        ctx.fillRect(cx - barW / 2, topY + h - 6, barW, barH);
        ctx.fillStyle = hpPct > 0.3 ? (isRad ? '#22c55e' : '#ef4444') : '#f59e0b';
        ctx.fillRect(cx - barW / 2, topY + h - 6, barW * hpPct, barH);
        ctx.strokeStyle = '#334155';
        ctx.lineWidth = 0.8 / zoom;
        ctx.strokeRect(cx - barW / 2, topY + h - 6, barW, barH);
      });

      // 9. Dedicated Two Authentic Roshan Pits & Active Titan Rendering
      const roshPits = [
        { pitId: 'north', name: 'Северное логово', x: 26, y: 24, label: 'Ночное логово' },
        { pitId: 'south', name: 'Южное логово', x: 74, y: 76, label: 'Дневное логово' },
      ];

      roshPits.forEach(pit => {
        const px = pit.x * TILE_SIZE + TILE_SIZE / 2;
        const py = pit.y * TILE_SIZE + TILE_SIZE / 2;
        const isActive = roshan && !roshan.isDead && roshan.pitId === pit.pitId;

        // Large Cavern Arena Ring
        ctx.beginPath();
        ctx.arc(px, py, TILE_SIZE * 2.8, 0, Math.PI * 2);
        ctx.fillStyle = isActive ? 'rgba(239, 68, 68, 0.18)' : 'rgba(71, 85, 105, 0.12)';
        ctx.fill();
        ctx.strokeStyle = isActive ? '#ef4444' : '#64748b';
        ctx.lineWidth = 2 / zoom;
        ctx.stroke();

        if (isActive) {
          // Menacing Fiery Aura
          ctx.beginPath();
          ctx.arc(px, py, TILE_SIZE * 1.35, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(185, 28, 28, 0.7)';
          ctx.fill();
          ctx.strokeStyle = '#fca5a5';
          ctx.lineWidth = 2.5 / zoom;
          ctx.stroke();

          // Roshan Titan Boss Icon
          ctx.font = `${Math.round(TILE_SIZE * 1.2)}px sans-serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('👹', px, py - 2);

          // Boss Banner & HP
          ctx.font = `bold ${Math.max(9, Math.round(TILE_SIZE * 0.38))}px sans-serif`;
          ctx.fillStyle = '#fca5a5';
          ctx.fillText('РОШАН БЕССМЕРТНЫЙ', px, py - TILE_SIZE * 1.5);

          const rHpPct = Math.max(0, roshan.hp / roshan.maxHp);
          const rBarW = 60;
          const rBarH = 6;
          ctx.fillStyle = 'rgba(0,0,0,0.85)';
          ctx.fillRect(px - rBarW / 2, py + TILE_SIZE * 1.1, rBarW, rBarH);
          ctx.fillStyle = '#ef4444';
          ctx.fillRect(px - rBarW / 2, py + TILE_SIZE * 1.1, rBarW * rHpPct, rBarH);
          ctx.strokeStyle = '#fca5a5';
          ctx.lineWidth = 1 / zoom;
          ctx.strokeRect(px - rBarW / 2, py + TILE_SIZE * 1.1, rBarW, rBarH);

          ctx.font = `bold ${Math.max(8, Math.round(TILE_SIZE * 0.28))}px monospace`;
          ctx.fillStyle = '#ffffff';
          ctx.fillText(`${roshan.hp}/${roshan.maxHp} HP`, px, py + TILE_SIZE * 1.55);
        } else {
          // Inactive empty pit
          ctx.font = `bold ${Math.max(8, Math.round(TILE_SIZE * 0.32))}px monospace`;
          ctx.fillStyle = '#94a3b8';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(`💤 ${pit.name}`, px, py - 6);
          ctx.font = `${Math.max(7, Math.round(TILE_SIZE * 0.26))}px monospace`;
          ctx.fillStyle = '#64748b';
          ctx.fillText(`(${pit.label} - пустует)`, px, py + 8);
        }
      });

      // 8. Draw Creeps (Melee, Ranged, and Neutrals with Distinct Formations & Visuals)
      creeps.forEach(creep => {
        if (creep.isDead || creep.hp <= 0) return;

        const px = creep.x * TILE_SIZE + TILE_SIZE / 2;
        const py = creep.y * TILE_SIZE + TILE_SIZE / 2;
        const isRad = creep.faction === 'radiant';
        const isNeutral = creep.faction === 'neutral' || creep.isNeutral;
        const isMelee = creep.type === 'MELEE';
        const isHovered = hoveredTile && hoveredTile.x === creep.x && hoveredTile.y === creep.y;
        const isSelected = selectedTile && selectedTile.x === creep.x && selectedTile.y === creep.y;

        // Hover / Selection Reticle
        if (isHovered || isSelected) {
          ctx.beginPath();
          ctx.arc(px, py, TILE_SIZE * 0.52, 0, Math.PI * 2);
          ctx.strokeStyle = isHovered ? '#f59e0b' : '#38bdf8';
          ctx.lineWidth = 2 / zoom;
          ctx.stroke();
        }

        // Distinct colors & icons per unit type
        let fillColor = '#166534';
        let strokeColor = '#4ade80';
        let icon = '⚔️';

        if (isNeutral) {
          fillColor = isMelee ? '#78350f' : '#713f12';
          strokeColor = '#facc15';
          icon = isMelee ? (creep.level >= 4 ? '👹' : '🐺') : '🏹';
        } else if (isRad) {
          fillColor = isMelee ? '#15803d' : '#0f766e';
          strokeColor = isMelee ? '#4ade80' : '#38bdf8';
          icon = isMelee ? '⚔️' : '🏹';
        } else {
          fillColor = isMelee ? '#991b1b' : '#831843';
          strokeColor = isMelee ? '#f87171' : '#fb7185';
          icon = isMelee ? '⚔️' : '🏹';
        }

        const radius = TILE_SIZE * 0.40;

        // Creep Token Circle
        ctx.beginPath();
        ctx.arc(px, py, radius, 0, Math.PI * 2);
        ctx.fillStyle = fillColor;
        ctx.fill();
        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = 1.5 / zoom;
        ctx.stroke();

        // Creep Type Symbol
        ctx.font = `${Math.round(TILE_SIZE * 0.46)}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(icon, px, py + 1);

        // Level Badge
        ctx.font = `bold ${Math.max(7, Math.round(8 / zoom))}px monospace`;
        ctx.fillStyle = '#f8fafc';
        ctx.fillText(`L${creep.level}`, px + radius * 0.65, py - radius * 0.65);

        // High-Contrast Health Bar
        const barW = 20;
        const barH = 3.5;
        const hpPct = Math.max(0, Math.min(1, creep.hp / creep.maxHp));
        ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
        ctx.fillRect(px - barW / 2, py - radius - 6, barW, barH);
        ctx.fillStyle = hpPct > 0.5 ? '#22c55e' : hpPct > 0.25 ? '#f59e0b' : '#ef4444';
        ctx.fillRect(px - barW / 2, py - radius - 6, barW * hpPct, barH);
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

        const radius = TILE_SIZE * 0.55;
        const portraitImg = getHeroCanvasImage(hero.defId || hero.id);

        ctx.save();
        ctx.beginPath();
        ctx.arc(px, py, radius, 0, Math.PI * 2);
        ctx.clip();
        if (portraitImg && portraitImg.complete && portraitImg.naturalWidth > 0) {
          ctx.drawImage(portraitImg, px - radius, py - radius, radius * 2, radius * 2);
        } else {
          ctx.fillStyle = hero.themeColor || (isRad ? '#065f46' : '#7f1d1d');
          ctx.fill();
          ctx.font = `bold ${Math.round(TILE_SIZE * 0.42)}px sans-serif`;
          ctx.fillStyle = '#ffffff';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(hero.avatarSymbol || hero.name.slice(0, 2).toUpperCase(), px, py);
        }
        ctx.restore();

        // High-definition token team/accent border
        ctx.beginPath();
        ctx.arc(px, py, radius, 0, Math.PI * 2);
        ctx.strokeStyle = hero.accentColor || (isRad ? '#34d399' : '#f87171');
        ctx.lineWidth = Math.max(1.8, 2.2 / zoom);
        ctx.stroke();

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
        const destCell = hoverPath.length > 0 ? hoverPath[hoverPath.length - 1] : hoveredTile;
        const hx = destCell.x * TILE_SIZE + TILE_SIZE / 2;
        const hy = destCell.y * TILE_SIZE - 12;

        let badgeText;
        if (!canAffordPath || hoverPath.length === 0) {
          badgeText = `⚠️ Не хватает времени! (-${pathTimeCost}с)`;
        } else if (isMaxCapReached) {
          badgeText = `🚶 ${hoverPath.length} шагов (макс. на ход) • ⏳ -${pathTimeCost}с`;
        } else {
          badgeText = `🚶 ${hoverPath.length} / ${heroSpeed || 6} шагов • ⏳ -${pathTimeCost}с`;
        }

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
