import React, { useState, useEffect, useRef, useCallback } from 'react';
import Dota2HUD from './Dota2HUD';
import { 
  GRID_SIZE, TILE_TYPES, TILE_INFO, generatePixelDotaMap, 
  getLaneAt, isBridgeCell 
} from '../../data/dotaPixelGrid';
import { 
  TOWERS_DATA, CREEP_CAMPS_DATA, RUNES_DATA, BASES_DATA, 
  INITIAL_HEROES_95, LANDMARKS 
} from '../../data/dota95Data';
import { 
  ZoomIn, ZoomOut, Maximize2, Crosshair, Eye, EyeOff, 
  Sparkles, Swords, Shield, Heart, Zap, MapPin, Compass, Navigation, 
  Layers, Volume2, VolumeX, Move, Target, CheckCircle2
} from 'lucide-react';
import { playClickSound, playSpellSound } from '../../utils/sound';

export default function Dota95Map() {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);

  // 95x95 Pixel Grid Data (Uint8Array)
  const [mapGrid] = useState(() => generatePixelDotaMap());

  // Heroes State
  const [heroes, setHeroes] = useState(INITIAL_HEROES_95);
  const [selectedHeroId, setSelectedHeroId] = useState('gojo');

  // Camera State: pan offset (px) and zoom scale
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [hasDragged, setHasDragged] = useState(false);

  // Settings Toggles
  const [showGrid, setShowGrid] = useState(true);
  const [showRanges, setShowRanges] = useState(true);
  const [showLabels, setShowLabels] = useState(true);
  const [showCamps, setShowCamps] = useState(true);
  const [highlightTileType, setHighlightTileType] = useState(null);
  const [showLegend, setShowLegend] = useState(false);

  // Hover & Notification
  const [hoveredCell, setHoveredCell] = useState(null);
  const [hoveredEntity, setHoveredEntity] = useState(null);
  const [notification, setNotification] = useState(null);

  // Cached Avatar Images for Hero Tokens
  const avatarImagesRef = useRef({});

  // Cell size in world coordinates (px)
  const CELL_PX = 24; 
  const MAP_TOTAL_PX = GRID_SIZE * CELL_PX; // 95 * 24 = 2280px

  const selectedHero = heroes.find(h => h.id === selectedHeroId);

  // Load avatar images into cache
  useEffect(() => {
    heroes.forEach(h => {
      if (!avatarImagesRef.current[h.id]) {
        const img = new Image();
        img.src = h.avatar;
        avatarImagesRef.current[h.id] = img;
      }
    });
  }, [heroes]);

  const notify = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  };

  // Center camera on a specific grid cell (r, c)
  const centerOnCell = useCallback((targetR, targetC, customZoom = zoom) => {
    if (!containerRef.current) return;
    const w = containerRef.current.clientWidth;
    const h = containerRef.current.clientHeight;

    const cellWorldX = (targetC + 0.5) * CELL_PX;
    const cellWorldY = (targetR + 0.5) * CELL_PX;

    const newPanX = (w / 2) - (cellWorldX * customZoom);
    const newPanY = (h / 2) - (cellWorldY * customZoom);

    setPan({ x: Math.round(newPanX), y: Math.round(newPanY) });
    setZoom(customZoom);
  }, [zoom, CELL_PX]);

  // Fit entire 95x95 map onto current viewport
  const fitMapToScreen = useCallback(() => {
    if (!containerRef.current) return;
    const w = containerRef.current.clientWidth;
    const h = containerRef.current.clientHeight;

    const availW = w - 80;
    const availH = h - 220;

    const fitZoom = Math.max(0.25, Math.min(availW / MAP_TOTAL_PX, availH / MAP_TOTAL_PX));
    
    const newPanX = (w - MAP_TOTAL_PX * fitZoom) / 2;
    const newPanY = ((h - MAP_TOTAL_PX * fitZoom) / 2) + 30;

    setZoom(fitZoom);
    setPan({ x: Math.round(newPanX), y: Math.round(newPanY) });
  }, [MAP_TOTAL_PX]);

  // Initial fit
  useEffect(() => {
    fitMapToScreen();
    const handleResize = () => fitMapToScreen();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [fitMapToScreen]);

  // Coordinate Conversion: Viewport -> Grid (r, c)
  const viewportToGrid = useCallback((clientX, clientY) => {
    if (!containerRef.current) return null;
    const rect = containerRef.current.getBoundingClientRect();
    const mouseX = clientX - rect.left;
    const mouseY = clientY - rect.top;

    const worldX = (mouseX - pan.x) / zoom;
    const worldY = (mouseY - pan.y) / zoom;

    const c = Math.floor(worldX / CELL_PX);
    const r = Math.floor(worldY / CELL_PX);

    if (r >= 0 && r < GRID_SIZE && c >= 0 && c < GRID_SIZE) {
      return { r, c };
    }
    return null;
  }, [pan, zoom, CELL_PX]);

  // Mouse / Touch Event Handlers
  const handleMouseDown = (e) => {
    if (e.button === 0 || e.button === 1) {
      setIsDragging(true);
      setHasDragged(false);
      setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  };

  const handleMouseMove = (e) => {
    if (isDragging) {
      const dx = Math.abs(e.clientX - (dragStart.x + pan.x));
      const dy = Math.abs(e.clientY - (dragStart.y + pan.y));
      if (dx > 4 || dy > 4) {
        setHasDragged(true);
      }
      setPan({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }

    // Hover detection
    const cell = viewportToGrid(e.clientX, e.clientY);
    setHoveredCell(cell);

    if (cell) {
      // 1. Check if hero on cell
      const hero = heroes.find(h => h.r === cell.r && h.c === cell.c);
      if (hero) {
        setHoveredEntity({ type: 'hero', data: hero });
        return;
      }

      // 2. Check if tower on cell
      const tower = TOWERS_DATA.find(t => Math.abs(t.r - cell.r) <= 1 && Math.abs(t.c - cell.c) <= 1);
      if (tower) {
        setHoveredEntity({ type: 'tower', data: tower });
        return;
      }

      // 3. Check if camp on cell
      const camp = CREEP_CAMPS_DATA.find(c => Math.abs(c.r - cell.r) <= 1 && Math.abs(c.c - cell.c) <= 1);
      if (camp) {
        setHoveredEntity({ type: 'camp', data: camp });
        return;
      }

      // 4. Check if rune on cell
      const rune = RUNES_DATA.find(rn => Math.abs(rn.r - cell.r) <= 1 && Math.abs(rn.c - cell.c) <= 1);
      if (rune) {
        setHoveredEntity({ type: 'rune', data: rune });
        return;
      }

      // 5. Check if Ancient throne
      if (Math.abs(BASES_DATA.radiant.ancient.r - cell.r) <= 2 && Math.abs(BASES_DATA.radiant.ancient.c - cell.c) <= 2) {
        setHoveredEntity({ type: 'ancient', data: BASES_DATA.radiant.ancient, team: 'radiant' });
        return;
      }
      if (Math.abs(BASES_DATA.dire.ancient.r - cell.r) <= 2 && Math.abs(BASES_DATA.dire.ancient.c - cell.c) <= 2) {
        setHoveredEntity({ type: 'ancient', data: BASES_DATA.dire.ancient, team: 'dire' });
        return;
      }

      // 6. Default tile info
      const tileType = mapGrid[cell.r * GRID_SIZE + cell.c];
      const lane = getLaneAt(cell.r, cell.c);
      const isBridge = isBridgeCell(cell.r, cell.c);
      setHoveredEntity({ 
        type: 'tile', 
        tileType, 
        info: TILE_INFO[tileType], 
        lane, 
        isBridge 
      });
    } else {
      setHoveredEntity(null);
    }
  };

  const handleMouseUp = (e) => {
    setIsDragging(false);

    // If dragged significantly, don't trigger cell click action
    if (hasDragged) return;

    const cell = viewportToGrid(e.clientX, e.clientY);
    if (!cell) return;

    // 1. Check if clicking an existing hero
    const clickedHero = heroes.find(h => h.r === cell.r && h.c === cell.c);
    if (clickedHero) {
      playClickSound();
      setSelectedHeroId(clickedHero.id);
      notify(`Выбран герой: ${clickedHero.name} [${cell.r}, ${cell.c}]`);
      return;
    }

    // 2. If a hero is selected, check if target cell is passable
    const targetTile = mapGrid[cell.r * GRID_SIZE + cell.c];
    if (targetTile === TILE_TYPES.UNPASSABLE) {
      notify(`⛔ Клетка [${cell.r}, ${cell.c}] непроходима (скалы/деревья)!`);
      return;
    }

    if (selectedHeroId) {
      playClickSound();
      const currentHero = heroes.find(h => h.id === selectedHeroId);
      const dist = currentHero ? Math.max(Math.abs(currentHero.r - cell.r), Math.abs(currentHero.c - cell.c)) : 0;
      
      setHeroes(prev => prev.map(h => {
        if (h.id === selectedHeroId) {
          return { ...h, r: cell.r, c: cell.c };
        }
        return h;
      }));

      // Check special tile bonuses
      if (targetTile === TILE_TYPES.WATER) {
        notify(`🏃 ${currentHero?.name} зашел в Воду [${cell.r}, ${cell.c}] (-10% к скорости)`);
      } else if (targetTile === TILE_TYPES.FOUNTAIN) {
        notify(`✨ ${currentHero?.name} зашел на Фонтан (+24% HP/Мана за ход)`);
      } else {
        notify(`🏃 ${currentHero?.name} переместился на клетку [${cell.r}, ${cell.c}] (${dist} шагов)`);
      }
    }
  };

  // Wheel Zoom
  const handleWheel = (e) => {
    e.preventDefault();
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const zoomFactor = e.deltaY < 0 ? 1.15 : 0.87;
    const newZoom = Math.max(0.2, Math.min(3.5, zoom * zoomFactor));

    const newPanX = mouseX - (mouseX - pan.x) * (newZoom / zoom);
    const newPanY = mouseY - (mouseY - pan.y) * (newZoom / zoom);

    setZoom(newZoom);
    setPan({ x: Math.round(newPanX), y: Math.round(newPanY) });
  };

  // Main Canvas Rendering Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !containerRef.current) return;
    const ctx = canvas.getContext('2d');

    const dpr = window.devicePixelRatio || 1;
    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    // 1. Clear background
    ctx.fillStyle = '#080a0f';
    ctx.fillRect(0, 0, width, height);

    // Apply Camera Transform
    ctx.save();
    ctx.translate(pan.x, pan.y);
    ctx.scale(zoom, zoom);

    // -------------------------------------------------------------
    // A. 95 x 95 PIXEL GRID CELLS (Exact Friend Palette)
    // -------------------------------------------------------------
    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE; c++) {
        const type = mapGrid[r * GRID_SIZE + c];
        const info = TILE_INFO[type] || TILE_INFO[TILE_TYPES.GROUND];
        const x = c * CELL_PX;
        const y = r * CELL_PX;

        const isLane = getLaneAt(r, c);
        const isBridge = isBridgeCell(r, c);

        // Fill cell with exact friend color
        if (isBridge) {
          // Stone bridge crossing
          ctx.fillStyle = '#636b7b';
        } else if (isLane && type === TILE_TYPES.GROUND) {
          // Subtle, elegant tone for lanes to make them crystal clear
          ctx.fillStyle = '#537a56';
        } else {
          ctx.fillStyle = info.color;
        }
        ctx.fillRect(x, y, CELL_PX, CELL_PX);

        // Subtle 3D edge highlight for Highground
        if (type === TILE_TYPES.HIGHGROUND) {
          ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
          ctx.fillRect(x, y, CELL_PX, 2);
          ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
          ctx.fillRect(x, y + CELL_PX - 2, CELL_PX, 2);
        }

        // Bridge wooden plank lines
        if (isBridge) {
          ctx.strokeStyle = '#474f5d';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(x, y + CELL_PX / 2);
          ctx.lineTo(x + CELL_PX, y + CELL_PX / 2);
          ctx.stroke();
        }

        // Highlight filtered tile if selected in legend
        if (highlightTileType !== null && type === highlightTileType) {
          ctx.fillStyle = 'rgba(250, 204, 21, 0.35)';
          ctx.fillRect(x, y, CELL_PX, CELL_PX);
        }

        // Draw crisp cell border if grid enabled
        if (showGrid) {
          ctx.strokeStyle = info.gridBorder;
          ctx.lineWidth = 0.5;
          ctx.strokeRect(x, y, CELL_PX, CELL_PX);
        }
      }
    }

    // -------------------------------------------------------------
    // B. ANCIENTS & BASES (WORLD TREE & FROZEN THRONE)
    // -------------------------------------------------------------
    // Radiant Ancient: (85, 9)
    const radAncientX = (BASES_DATA.radiant.ancient.c + 0.5) * CELL_PX;
    const radAncientY = (BASES_DATA.radiant.ancient.r + 0.5) * CELL_PX;
    ctx.save();
    ctx.fillStyle = '#065f46';
    ctx.strokeStyle = '#34d399';
    ctx.lineWidth = 3;
    ctx.fillRect(radAncientX - 2.2 * CELL_PX, radAncientY - 2.2 * CELL_PX, 4.4 * CELL_PX, 4.4 * CELL_PX);
    ctx.strokeRect(radAncientX - 2.2 * CELL_PX, radAncientY - 2.2 * CELL_PX, 4.4 * CELL_PX, 4.4 * CELL_PX);
    
    // Ancient Crystal Core
    ctx.fillStyle = '#10b981';
    ctx.beginPath();
    ctx.arc(radAncientX, radAncientY, 1.3 * CELL_PX, 0, Math.PI * 2);
    ctx.fill();
    ctx.font = `bold ${Math.round(20)}px sans-serif`;
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('💎', radAncientX, radAncientY);

    // Ancient Nameplate
    ctx.font = `bold ${Math.round(11)}px 'Cinzel', serif`;
    ctx.fillStyle = '#6ee7b7';
    ctx.fillText('ДРЕВО ЖИЗНИ (Ancient)', radAncientX, radAncientY + 3.2 * CELL_PX);
    ctx.restore();

    // Dire Ancient: (9, 85)
    const direAncientX = (BASES_DATA.dire.ancient.c + 0.5) * CELL_PX;
    const direAncientY = (BASES_DATA.dire.ancient.r + 0.5) * CELL_PX;
    ctx.save();
    ctx.fillStyle = '#881337';
    ctx.strokeStyle = '#f43f5e';
    ctx.lineWidth = 3;
    ctx.fillRect(direAncientX - 2.2 * CELL_PX, direAncientY - 2.2 * CELL_PX, 4.4 * CELL_PX, 4.4 * CELL_PX);
    ctx.strokeRect(direAncientX - 2.2 * CELL_PX, direAncientY - 2.2 * CELL_PX, 4.4 * CELL_PX, 4.4 * CELL_PX);
    
    // Ancient Crystal Core
    ctx.fillStyle = '#e11d48';
    ctx.beginPath();
    ctx.arc(direAncientX, direAncientY, 1.3 * CELL_PX, 0, Math.PI * 2);
    ctx.fill();
    ctx.font = `bold ${Math.round(20)}px sans-serif`;
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('🌋', direAncientX, direAncientY);

    // Ancient Nameplate
    ctx.font = `bold ${Math.round(11)}px 'Cinzel', serif`;
    ctx.fillStyle = '#fda4af';
    ctx.fillText('ЛЕДЯНОЙ ТРОН (Ancient)', direAncientX, direAncientY + 3.2 * CELL_PX);
    ctx.restore();

    // -------------------------------------------------------------
    // C. LANDMARKS & REGION LABELS
    // -------------------------------------------------------------
    if (showLabels) {
      LANDMARKS.forEach(lm => {
        const lx = (lm.c + 0.5) * CELL_PX;
        const ly = (lm.r + 0.5) * CELL_PX;

        ctx.save();
        ctx.font = `900 ${Math.round(13)}px 'Cinzel', sans-serif`;
        ctx.fillStyle = lm.color;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.shadowColor = 'rgba(0, 0, 0, 0.95)';
        ctx.shadowBlur = 8;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 2;
        ctx.fillText(lm.name, lx, ly);
        ctx.restore();
      });
    }

    // -------------------------------------------------------------
    // D. CREEP CAMPS & ROSHAN
    // -------------------------------------------------------------
    if (showCamps) {
      CREEP_CAMPS_DATA.forEach(camp => {
        const cx = (camp.c + 0.5) * CELL_PX;
        const cy = (camp.r + 0.5) * CELL_PX;

        if (camp.type === 'roshan') {
          // Roshan Pit Cave Marker
          ctx.save();
          ctx.fillStyle = '#7f1d1d';
          ctx.strokeStyle = '#ef4444';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.arc(cx, cy, 2.2 * CELL_PX, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();

          ctx.font = `bold ${Math.round(20)}px sans-serif`;
          ctx.fillStyle = '#ffffff';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('👹', cx, cy - 2);

          // Roshan Label
          ctx.font = `900 ${Math.round(11)}px monospace`;
          ctx.fillStyle = '#fca5a5';
          ctx.shadowColor = '#000000';
          ctx.shadowBlur = 4;
          ctx.fillText('РОШАН', cx, cy + 2.8 * CELL_PX);
          ctx.restore();
        } else {
          // Creep Camp Clearing Badge
          ctx.save();
          ctx.fillStyle = '#0f172a';
          ctx.strokeStyle = camp.color;
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.arc(cx, cy, 1.3 * CELL_PX, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();

          ctx.font = `bold ${Math.round(12)}px monospace`;
          ctx.fillStyle = camp.color;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          const icon = camp.type === 'ancient' ? '🐉' : camp.type === 'hard' ? '🐻' : camp.type === 'medium' ? '🐺' : '🐗';
          ctx.fillText(icon, cx, cy);
          ctx.restore();
        }
      });
    }

    // -------------------------------------------------------------
    // E. RUNES IN RIVER
    // -------------------------------------------------------------
    RUNES_DATA.forEach(rn => {
      const rx = (rn.c + 0.5) * CELL_PX;
      const ry = (rn.r + 0.5) * CELL_PX;
      ctx.save();
      ctx.fillStyle = rn.type === 'water' ? '#38bdf8' : '#f59e0b';
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(rx, ry - 1.3 * CELL_PX);
      ctx.lineTo(rx + 1.3 * CELL_PX, ry);
      ctx.lineTo(rx, ry + 1.3 * CELL_PX);
      ctx.lineTo(rx - 1.3 * CELL_PX, ry);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      ctx.font = `bold ${Math.round(10)}px monospace`;
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('◆', rx, ry);
      ctx.restore();
    });

    // -------------------------------------------------------------
    // F. TOWERS WITH ATTACK RANGES
    // -------------------------------------------------------------
    TOWERS_DATA.forEach(tower => {
      const tx = (tower.c + 0.5) * CELL_PX;
      const ty = (tower.r + 0.5) * CELL_PX;
      const isRadiant = tower.team === 'radiant';

      // Attack range circle
      if (showRanges) {
        ctx.strokeStyle = isRadiant ? 'rgba(52, 211, 153, 0.28)' : 'rgba(248, 113, 113, 0.28)';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.arc(tx, ty, tower.range * CELL_PX, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // Fortified Tower Sprite Base
      ctx.save();
      ctx.fillStyle = isRadiant ? '#064e3b' : '#7f1d1d';
      ctx.strokeStyle = isRadiant ? '#34d399' : '#f87171';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(tx, ty, 1.4 * CELL_PX, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Tower Core Icon & Tier
      ctx.font = `bold ${Math.round(11)}px monospace`;
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(`T${tower.tier}`, tx, ty);
      ctx.restore();
    });

    // -------------------------------------------------------------
    // G. HOVERED CELL & MOVEMENT RANGE
    // -------------------------------------------------------------
    if (selectedHero) {
      const hx = (selectedHero.c + 0.5) * CELL_PX;
      const hy = (selectedHero.r + 0.5) * CELL_PX;
      
      // Movement speed circle
      ctx.strokeStyle = 'rgba(250, 204, 21, 0.55)';
      ctx.setLineDash([6, 4]);
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(hx, hy, selectedHero.speed * CELL_PX, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    if (hoveredCell) {
      const hx = hoveredCell.c * CELL_PX;
      const hy = hoveredCell.r * CELL_PX;
      const targetTile = mapGrid[hoveredCell.r * GRID_SIZE + hoveredCell.c];
      const isPassable = targetTile !== TILE_TYPES.UNPASSABLE;

      ctx.fillStyle = isPassable ? 'rgba(250, 204, 21, 0.35)' : 'rgba(239, 68, 68, 0.45)';
      ctx.strokeStyle = isPassable ? '#facc15' : '#ef4444';
      ctx.lineWidth = 2.5;
      ctx.fillRect(hx, hy, CELL_PX, CELL_PX);
      ctx.strokeRect(hx, hy, CELL_PX, CELL_PX);

      // Trajectory line from selected hero to hovered cell
      if (selectedHero) {
        const fromX = (selectedHero.c + 0.5) * CELL_PX;
        const fromY = (selectedHero.r + 0.5) * CELL_PX;
        const toX = (hoveredCell.c + 0.5) * CELL_PX;
        const toY = (hoveredCell.r + 0.5) * CELL_PX;

        ctx.strokeStyle = isPassable ? '#facc15' : '#ef4444';
        ctx.lineWidth = 2.5;
        ctx.setLineDash([8, 4]);
        ctx.beginPath();
        ctx.moveTo(fromX, fromY);
        ctx.lineTo(toX, toY);
        ctx.stroke();
        ctx.setLineDash([]);

        // Destination dot
        ctx.fillStyle = isPassable ? '#facc15' : '#ef4444';
        ctx.beginPath();
        ctx.arc(toX, toY, 5, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // -------------------------------------------------------------
    // H. HERO TOKENS (Large, Crisp, with Avatars)
    // -------------------------------------------------------------
    heroes.forEach(hero => {
      const hx = (hero.c + 0.5) * CELL_PX;
      const hy = (hero.r + 0.5) * CELL_PX;
      const tokenRadius = 1.5 * CELL_PX; // ~36px diameter
      const isSelected = hero.id === selectedHeroId;
      const isRadiant = hero.team === 'radiant';

      // Selected hero glowing pulsing ring
      if (isSelected) {
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(hx, hy, tokenRadius + 6, 0, Math.PI * 2);
        ctx.stroke();

        // Bouncing arrow indicator above hero
        ctx.fillStyle = '#f59e0b';
        ctx.beginPath();
        ctx.moveTo(hx, hy - tokenRadius - 8);
        ctx.lineTo(hx - 7, hy - tokenRadius - 18);
        ctx.lineTo(hx + 7, hy - tokenRadius - 18);
        ctx.closePath();
        ctx.fill();
      }

      // Token background circle
      ctx.fillStyle = isRadiant ? '#064e3b' : '#450a0a';
      ctx.strokeStyle = isSelected ? '#fbbf24' : isRadiant ? '#10b981' : '#ef4444';
      ctx.lineWidth = isSelected ? 4 : 3;
      ctx.beginPath();
      ctx.arc(hx, hy, tokenRadius, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Render cached image avatar or fallback
      const img = avatarImagesRef.current[hero.id];
      if (img && img.complete && img.naturalWidth > 0) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(hx, hy, tokenRadius - 2, 0, Math.PI * 2);
        ctx.clip();
        ctx.drawImage(
          img, 
          hx - (tokenRadius - 2), 
          hy - (tokenRadius - 2), 
          (tokenRadius - 2) * 2, 
          (tokenRadius - 2) * 2
        );
        ctx.restore();
      } else {
        // Fallback text symbol
        ctx.font = `bold ${Math.round(tokenRadius * 0.9)}px sans-serif`;
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(hero.name.charAt(0), hx, hy);
      }

      // Hero Nameplate below token
      ctx.save();
      ctx.font = `bold ${Math.round(11)}px 'Cinzel', sans-serif`;
      ctx.fillStyle = '#ffffff';
      ctx.shadowColor = '#000000';
      ctx.shadowBlur = 6;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillText(hero.name, hx, hy + tokenRadius + 4);
      ctx.restore();
    });

    ctx.restore();
  }, [
    mapGrid, heroes, selectedHeroId, selectedHero, pan, zoom, 
    showGrid, showRanges, showLabels, showCamps, highlightTileType, 
    hoveredCell
  ]);

  return (
    <div 
      ref={containerRef}
      className="relative w-screen h-screen overflow-hidden select-none bg-[#07090e] font-sans"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onWheel={handleWheel}
      onContextMenu={(e) => e.preventDefault()}
    >
      {/* 1. MAIN CANVAS */}
      <canvas ref={canvasRef} className="absolute inset-0 cursor-crosshair" />

      {/* 2. NOTIFICATION BANNER */}
      {notification && (
        <div className="absolute top-18 left-1/2 -translate-x-1/2 z-50 bg-amber-500 text-black font-mono text-xs font-black px-5 py-2 rounded-full shadow-2xl animate-bounce pointer-events-none border border-black/20">
          {notification}
        </div>
      )}

      {/* 3. AUTHENTIC DOTA 2 HUD */}
      <Dota2HUD
        heroes={heroes}
        selectedHeroId={selectedHeroId}
        onSelectHero={setSelectedHeroId}
        pan={pan}
        zoom={zoom}
        onCenterOnCell={centerOnCell}
        onFitMap={fitMapToScreen}
        mapGrid={mapGrid}
        hoveredCell={hoveredCell}
        hoveredEntity={hoveredEntity}
        showGrid={showGrid}
        onToggleGrid={() => setShowGrid(!showGrid)}
        showRanges={showRanges}
        onToggleRanges={() => setShowRanges(!showRanges)}
        showLegend={showLegend}
        onToggleLegend={() => setShowLegend(!showLegend)}
        onNotify={notify}
      />
    </div>
  );
}
