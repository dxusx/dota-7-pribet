import React, { useState, useEffect, useRef, useCallback, useReducer, useMemo } from 'react';
import Dota2HUD from './Dota2HUD';
import { 
  GRID_SIZE, TILE_TYPES, TILE_INFO, 
  getLaneAt, isBridgeCell 
} from '../../data/dotaPixelGrid';
import { 
  CREEP_CAMPS_DATA, RUNES_DATA, BASES_DATA, LANDMARKS 
} from '../../data/dota95Data';
import { gameReducer, createInitialGameState } from '../../game/gameState';
import { getReachableCells, getDistance } from '../../game/pathfinding';
import { getAssetUrl } from '../../utils/assetUrl';
import { 
  playClickSound, playSpellSound, playAttackSound, 
  playCritSound, playDiceSound 
} from '../../utils/sound';

export default function Dota95Map() {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const terrainCanvasRef = useRef(null);

  // Central Tactical Game State Engine
  const [gameState, dispatch] = useReducer(gameReducer, undefined, createInitialGameState);

  const {
    heroes,
    activeHeroId,
    selectedHeroId,
    turnActions,
    round,
    turnIndex,
    initiativeOrder,
    targetingMode,
    latestDiceRoll,
    combatLog,
    towers,
    creeps,
    roshan,
    mapGrid,
    notification: stateNotification
  } = gameState;

  // Active Hero (Whose turn it currently is)
  const activeHero = heroes.find(h => h.id === activeHeroId) || heroes[0];
  // Selected Hero (Inspected in console)
  const selectedHero = heroes.find(h => h.id === selectedHeroId) || activeHero;

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

  // Hover & Local Notifications
  const [hoveredCell, setHoveredCell] = useState(null);
  const [hoveredEntity, setHoveredEntity] = useState(null);
  const [notification, setNotification] = useState(null);

  // Floating Combat Texts (damage numbers / crits floating up)
  const [floatingTexts, setFloatingTexts] = useState([]);

  // Cached Avatar Images for Hero Tokens
  const avatarImagesRef = useRef({});

  // Cell size in world coordinates (px)
  const CELL_PX = 24; 
  const MAP_TOTAL_PX = GRID_SIZE * CELL_PX; // 95 * 24 = 2280px

  // Sync state notifications with local banner
  useEffect(() => {
    if (stateNotification) {
      setNotification(stateNotification);
      const timer = setTimeout(() => setNotification(null), 3500);
      return () => clearTimeout(timer);
    }
  }, [stateNotification]);

  // Play dice sound on new dice roll
  useEffect(() => {
    if (latestDiceRoll) {
      playDiceSound();
      if (latestDiceRoll.isCrit) {
        setTimeout(playCritSound, 300);
      }
    }
  }, [latestDiceRoll]);

  // Load avatar images into cache with base URL support
  useEffect(() => {
    heroes.forEach(h => {
      if (!avatarImagesRef.current[h.id]) {
        const img = new Image();
        img.src = getAssetUrl(h.avatar);
        avatarImagesRef.current[h.id] = img;
      }
    });
  }, [heroes]);

  const notify = useCallback((msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  }, []);

  // Compute Reachable Movement Cells for active hero (BFS)
  const reachableCells = useMemo(() => {
    if (!activeHero || activeHero.isDead || turnActions.movement <= 0) {
      return new Map();
    }

    const blocked = new Set();
    heroes.forEach(h => {
      if (!h.isDead && h.id !== activeHero.id) {
        blocked.add(`${h.r},${h.c}`);
      }
    });
    towers.forEach(t => {
      if (!t.isDead) blocked.add(`${t.r},${t.c}`);
    });
    if (roshan && !roshan.isDead) {
      blocked.add(`${roshan.r},${roshan.c}`);
    }

    return getReachableCells(activeHero.r, activeHero.c, turnActions.movement, mapGrid, blocked);
  }, [activeHero, turnActions.movement, heroes, towers, roshan, mapGrid]);

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

  // ---------------------------------------------------------------------------
  // REQUIREMENT #24: OFFSCREEN TERRAIN CANVAS CACHING
  // Renders the 9,025 cells, lanes, bridges, ancients, labels, camps, runes ONCE.
  // ---------------------------------------------------------------------------
  useEffect(() => {
    let offscreen = terrainCanvasRef.current;
    if (!offscreen) {
      offscreen = document.createElement('canvas');
      offscreen.width = MAP_TOTAL_PX;
      offscreen.height = MAP_TOTAL_PX;
      terrainCanvasRef.current = offscreen;
    }
    const offCtx = offscreen.getContext('2d');

    // 1. Clear background
    offCtx.fillStyle = '#080a0f';
    offCtx.fillRect(0, 0, MAP_TOTAL_PX, MAP_TOTAL_PX);

    // 2. 95 x 95 Cells with Friend's Palette
    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE; c++) {
        const type = mapGrid[r * GRID_SIZE + c];
        const info = TILE_INFO[type] || TILE_INFO[TILE_TYPES.GROUND];
        const x = c * CELL_PX;
        const y = r * CELL_PX;

        const isLane = getLaneAt(r, c);
        const isBridge = isBridgeCell(r, c);

        if (isBridge) {
          offCtx.fillStyle = '#636b7b';
        } else if (isLane && type === TILE_TYPES.GROUND) {
          offCtx.fillStyle = '#537a56';
        } else {
          offCtx.fillStyle = info.color;
        }
        offCtx.fillRect(x, y, CELL_PX, CELL_PX);

        // 3D edge highlight for Highground
        if (type === TILE_TYPES.HIGHGROUND) {
          offCtx.fillStyle = 'rgba(255, 255, 255, 0.08)';
          offCtx.fillRect(x, y, CELL_PX, 2);
          offCtx.fillStyle = 'rgba(0, 0, 0, 0.15)';
          offCtx.fillRect(x, y + CELL_PX - 2, CELL_PX, 2);
        }

        // Bridge planks
        if (isBridge) {
          offCtx.strokeStyle = '#474f5d';
          offCtx.lineWidth = 1;
          offCtx.beginPath();
          offCtx.moveTo(x, y + CELL_PX / 2);
          offCtx.lineTo(x + CELL_PX, y + CELL_PX / 2);
          offCtx.stroke();
        }

        // Highlight filtered tile if selected in legend
        if (highlightTileType !== null && type === highlightTileType) {
          offCtx.fillStyle = 'rgba(250, 204, 21, 0.35)';
          offCtx.fillRect(x, y, CELL_PX, CELL_PX);
        }

        // Grid lines
        if (showGrid) {
          offCtx.strokeStyle = info.gridBorder;
          offCtx.lineWidth = 0.5;
          offCtx.strokeRect(x, y, CELL_PX, CELL_PX);
        }
      }
    }

    // 3. Ancients & Bases
    // Radiant Ancient (85, 9)
    const radAncientX = (BASES_DATA.radiant.ancient.c + 0.5) * CELL_PX;
    const radAncientY = (BASES_DATA.radiant.ancient.r + 0.5) * CELL_PX;
    offCtx.save();
    offCtx.fillStyle = '#065f46';
    offCtx.strokeStyle = '#34d399';
    offCtx.lineWidth = 3;
    offCtx.fillRect(radAncientX - 2.2 * CELL_PX, radAncientY - 2.2 * CELL_PX, 4.4 * CELL_PX, 4.4 * CELL_PX);
    offCtx.strokeRect(radAncientX - 2.2 * CELL_PX, radAncientY - 2.2 * CELL_PX, 4.4 * CELL_PX, 4.4 * CELL_PX);
    offCtx.fillStyle = '#10b981';
    offCtx.beginPath();
    offCtx.arc(radAncientX, radAncientY, 1.3 * CELL_PX, 0, Math.PI * 2);
    offCtx.fill();
    offCtx.font = `bold 20px sans-serif`;
    offCtx.fillStyle = '#ffffff';
    offCtx.textAlign = 'center';
    offCtx.textBaseline = 'middle';
    offCtx.fillText('💎', radAncientX, radAncientY);
    offCtx.font = `bold 11px 'Cinzel', serif`;
    offCtx.fillStyle = '#6ee7b7';
    offCtx.fillText('ДРЕВО ЖИЗНИ (Ancient)', radAncientX, radAncientY + 3.2 * CELL_PX);
    offCtx.restore();

    // Dire Ancient (9, 85)
    const direAncientX = (BASES_DATA.dire.ancient.c + 0.5) * CELL_PX;
    const direAncientY = (BASES_DATA.dire.ancient.r + 0.5) * CELL_PX;
    offCtx.save();
    offCtx.fillStyle = '#881337';
    offCtx.strokeStyle = '#f43f5e';
    offCtx.lineWidth = 3;
    offCtx.fillRect(direAncientX - 2.2 * CELL_PX, direAncientY - 2.2 * CELL_PX, 4.4 * CELL_PX, 4.4 * CELL_PX);
    offCtx.strokeRect(direAncientX - 2.2 * CELL_PX, direAncientY - 2.2 * CELL_PX, 4.4 * CELL_PX, 4.4 * CELL_PX);
    offCtx.fillStyle = '#e11d48';
    offCtx.beginPath();
    offCtx.arc(direAncientX, direAncientY, 1.3 * CELL_PX, 0, Math.PI * 2);
    offCtx.fill();
    offCtx.font = `bold 20px sans-serif`;
    offCtx.fillStyle = '#ffffff';
    offCtx.textAlign = 'center';
    offCtx.textBaseline = 'middle';
    offCtx.fillText('🌋', direAncientX, direAncientY);
    offCtx.font = `bold 11px 'Cinzel', serif`;
    offCtx.fillStyle = '#fda4af';
    offCtx.fillText('ЛЕДЯНОЙ ТРОН (Ancient)', direAncientX, direAncientY + 3.2 * CELL_PX);
    offCtx.restore();

    // 4. Landmarks & Labels
    if (showLabels) {
      LANDMARKS.forEach(lm => {
        const lx = (lm.c + 0.5) * CELL_PX;
        const ly = (lm.r + 0.5) * CELL_PX;
        offCtx.save();
        offCtx.font = `900 13px 'Cinzel', sans-serif`;
        offCtx.fillStyle = lm.color;
        offCtx.textAlign = 'center';
        offCtx.textBaseline = 'middle';
        offCtx.shadowColor = 'rgba(0, 0, 0, 0.95)';
        offCtx.shadowBlur = 8;
        offCtx.shadowOffsetX = 0;
        offCtx.shadowOffsetY = 2;
        offCtx.fillText(lm.name, lx, ly);
        offCtx.restore();
      });
    }

    // 5. Creep Camps & Roshan
    if (showCamps) {
      CREEP_CAMPS_DATA.forEach(camp => {
        const cx = (camp.c + 0.5) * CELL_PX;
        const cy = (camp.r + 0.5) * CELL_PX;
        if (camp.type === 'roshan') {
          offCtx.save();
          offCtx.fillStyle = '#7f1d1d';
          offCtx.strokeStyle = '#ef4444';
          offCtx.lineWidth = 3;
          offCtx.beginPath();
          offCtx.arc(cx, cy, 2.2 * CELL_PX, 0, Math.PI * 2);
          offCtx.fill();
          offCtx.stroke();
          offCtx.font = `bold 20px sans-serif`;
          offCtx.fillStyle = '#ffffff';
          offCtx.textAlign = 'center';
          offCtx.textBaseline = 'middle';
          offCtx.fillText('👹', cx, cy - 2);
          offCtx.font = `900 11px monospace`;
          offCtx.fillStyle = '#fca5a5';
          offCtx.shadowColor = '#000000';
          offCtx.shadowBlur = 4;
          offCtx.fillText('РОШАН', cx, cy + 2.8 * CELL_PX);
          offCtx.restore();
        } else {
          offCtx.save();
          offCtx.fillStyle = '#0f172a';
          offCtx.strokeStyle = camp.color;
          offCtx.lineWidth = 2.5;
          offCtx.beginPath();
          offCtx.arc(cx, cy, 1.3 * CELL_PX, 0, Math.PI * 2);
          offCtx.fill();
          offCtx.stroke();
          offCtx.font = `bold 12px monospace`;
          offCtx.fillStyle = camp.color;
          offCtx.textAlign = 'center';
          offCtx.textBaseline = 'middle';
          const icon = camp.type === 'ancient' ? '🐉' : camp.type === 'hard' ? '🐻' : camp.type === 'medium' ? '🐺' : '🐗';
          offCtx.fillText(icon, cx, cy);
          offCtx.restore();
        }
      });
    }

    // 6. Runes in River
    RUNES_DATA.forEach(rn => {
      const rx = (rn.c + 0.5) * CELL_PX;
      const ry = (rn.r + 0.5) * CELL_PX;
      offCtx.save();
      offCtx.fillStyle = rn.type === 'water' ? '#38bdf8' : '#f59e0b';
      offCtx.strokeStyle = '#ffffff';
      offCtx.lineWidth = 2;
      offCtx.beginPath();
      offCtx.moveTo(rx, ry - 1.3 * CELL_PX);
      offCtx.lineTo(rx + 1.3 * CELL_PX, ry);
      offCtx.lineTo(rx, ry + 1.3 * CELL_PX);
      offCtx.lineTo(rx - 1.3 * CELL_PX, ry);
      offCtx.closePath();
      offCtx.fill();
      offCtx.stroke();
      offCtx.font = `bold 10px monospace`;
      offCtx.fillStyle = '#ffffff';
      offCtx.textAlign = 'center';
      offCtx.textBaseline = 'middle';
      offCtx.fillText('◆', rx, ry);
      offCtx.restore();
    });
  }, [mapGrid, showGrid, showLabels, showCamps, highlightTileType, CELL_PX, MAP_TOTAL_PX]);

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

  // Keyboard Hotkeys
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Don't trigger if typing in an input
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

      if (e.code === 'Space') {
        e.preventDefault();
        playClickSound();
        dispatch({ type: 'END_TURN' });
      } else if (e.code === 'Escape') {
        e.preventDefault();
        dispatch({ type: 'CANCEL_TARGETING' });
      } else if (e.code === 'KeyA') {
        e.preventDefault();
        playClickSound();
        dispatch({ type: 'SET_TARGETING', mode: 'ATTACK' });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Mouse / Touch Event Handlers
  const handleMouseDown = (e) => {
    if (e.button === 0 || e.button === 1) {
      setIsDragging(true);
      setHasDragged(false);
      setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    } else if (e.button === 2) {
      // Right click cancels targeting
      if (targetingMode) {
        dispatch({ type: 'CANCEL_TARGETING' });
      }
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
      const tower = towers.find(t => Math.abs(t.r - cell.r) <= 1 && Math.abs(t.c - cell.c) <= 1);
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

      // 5. Default tile info
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

    // -------------------------------------------------------------
    // 1. TARGETING MODE INTERACTION (ATTACK / ABILITY / ITEM)
    // -------------------------------------------------------------
    if (targetingMode) {
      if (targetingMode.mode === 'ATTACK') {
        // Find matching valid target on this cell
        const matched = targetingMode.validCells.find(v => v.r === cell.r && v.c === cell.c);
        if (matched) {
          playAttackSound();
          dispatch({ type: 'PERFORM_ATTACK', targetId: matched.unitId });
          return;
        } else {
          notify('⛔ Выберите допустимую цель в красной зоне!');
          return;
        }
      }

      if (targetingMode.mode === 'ABILITY') {
        const matched = (targetingMode.validCells || []).find(v => v.r === cell.r && v.c === cell.c);
        if (matched || targetingMode.ability.targetType === 'GROUND' || targetingMode.ability.targetType === 'AREA') {
          playSpellSound();
          dispatch({ 
            type: 'EXECUTE_ABILITY', 
            abilityId: targetingMode.ability.id, 
            targetPos: { r: cell.r, c: cell.c, unitId: matched?.unitId } 
          });
          return;
        } else {
          notify('⛔ Неверная цель для способности!');
          return;
        }
      }

      if (targetingMode.mode === 'ITEM') {
        playSpellSound();
        dispatch({
          type: 'USE_ITEM',
          itemId: targetingMode.itemId,
          targetPos: { r: cell.r, c: cell.c }
        });
        return;
      }
    }

    // -------------------------------------------------------------
    // 2. HERO INSPECTION CLICK
    // -------------------------------------------------------------
    const clickedHero = heroes.find(h => h.r === cell.r && h.c === cell.c);
    if (clickedHero) {
      playClickSound();
      dispatch({ type: 'SELECT_HERO', heroId: clickedHero.id });
      notify(`Выбран: ${clickedHero.name} [HP: ${clickedHero.hp}/${clickedHero.maxHp}]`);
      return;
    }

    // -------------------------------------------------------------
    // 3. MOVEMENT CLICK FOR ACTIVE HERO
    // -------------------------------------------------------------
    if (activeHero && !activeHero.isDead) {
      if (reachableCells.has(`${cell.r},${cell.c}`)) {
        playClickSound();
        dispatch({ type: 'MOVE_HERO', targetR: cell.r, targetC: cell.c });
      } else {
        const targetTile = mapGrid[cell.r * GRID_SIZE + cell.c];
        if (targetTile === TILE_TYPES.UNPASSABLE) {
          notify(`⛔ Клетка [${cell.r}, ${cell.c}] непроходима!`);
        } else if (turnActions.movement <= 0) {
          notify('⛔ Очки движения исчерпаны! Нажмите Space для завершения хода.');
        } else {
          notify('⛔ Клетка вне радиуса движения!');
        }
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

  // ===========================================================================
  // MAIN CANVAS RENDERING LOOP (Blits Cached Terrain + Draws Dynamic Units)
  // ===========================================================================
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

    // Clear background
    ctx.fillStyle = '#080a0f';
    ctx.fillRect(0, 0, width, height);

    // Apply Camera Transform
    ctx.save();
    ctx.translate(pan.x, pan.y);
    ctx.scale(zoom, zoom);

    // 1. BLIT PRE-RENDERED STATIC TERRAIN CANVAS (60 FPS OPTIMIZATION)
    if (terrainCanvasRef.current) {
      ctx.drawImage(terrainCanvasRef.current, 0, 0);
    }

    // 2. DRAW REACHABLE MOVEMENT CELLS (WHEN NOT TARGETING)
    if (!targetingMode && turnActions.movement > 0 && activeHero && !activeHero.isDead) {
      reachableCells.forEach((node, key) => {
        const [r, c] = key.split(',').map(Number);
        const x = c * CELL_PX;
        const y = r * CELL_PX;

        ctx.fillStyle = 'rgba(234, 179, 8, 0.16)';
        ctx.strokeStyle = 'rgba(234, 179, 8, 0.35)';
        ctx.lineWidth = 0.8;
        ctx.fillRect(x, y, CELL_PX, CELL_PX);
        ctx.strokeRect(x, y, CELL_PX, CELL_PX);
      });
    }

    // 3. DRAW TARGETING OVERLAY (ATTACK / ABILITY / ITEM)
    if (targetingMode && activeHero) {
      const ax = (activeHero.c + 0.5) * CELL_PX;
      const ay = (activeHero.r + 0.5) * CELL_PX;
      const rangePx = (targetingMode.range || 2) * CELL_PX;

      // Range dashed circle
      const strokeColor = targetingMode.mode === 'ATTACK' 
        ? 'rgba(239, 68, 68, 0.7)' 
        : targetingMode.mode === 'ABILITY' 
        ? 'rgba(56, 189, 248, 0.7)' 
        : 'rgba(168, 85, 247, 0.7)';

      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = 2;
      ctx.setLineDash([6, 4]);
      ctx.beginPath();
      ctx.arc(ax, ay, rangePx, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);

      // Highlight valid target cells
      (targetingMode.validCells || []).forEach(vc => {
        const vx = vc.c * CELL_PX;
        const vy = vc.r * CELL_PX;

        ctx.fillStyle = targetingMode.mode === 'ATTACK' ? 'rgba(239, 68, 68, 0.35)' : 'rgba(56, 189, 248, 0.35)';
        ctx.strokeStyle = targetingMode.mode === 'ATTACK' ? '#ef4444' : '#38bdf8';
        ctx.lineWidth = 2;
        ctx.fillRect(vx, vy, CELL_PX, CELL_PX);
        ctx.strokeRect(vx, vy, CELL_PX, CELL_PX);
      });
    }

    // 4. DRAW TOWERS WITH HEALTH BARS & ATTACK RANGES
    towers.forEach(tower => {
      const tx = (tower.c + 0.5) * CELL_PX;
      const ty = (tower.r + 0.5) * CELL_PX;
      const isRadiant = tower.team === 'radiant';
      const isAlive = !tower.isDead && (tower.currentHp || tower.hp) > 0;

      // Attack range circle
      if (showRanges && isAlive) {
        ctx.strokeStyle = isRadiant ? 'rgba(52, 211, 153, 0.22)' : 'rgba(248, 113, 113, 0.22)';
        ctx.lineWidth = 1.2;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.arc(tx, ty, (tower.range || 8) * CELL_PX, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // Tower Base
      ctx.save();
      ctx.fillStyle = !isAlive ? '#27272a' : isRadiant ? '#064e3b' : '#7f1d1d';
      ctx.strokeStyle = !isAlive ? '#52525b' : isRadiant ? '#34d399' : '#f87171';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(tx, ty, 1.4 * CELL_PX, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Tower Core Icon & Tier
      ctx.font = `bold 11px monospace`;
      ctx.fillStyle = !isAlive ? '#71717a' : '#ffffff';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(isAlive ? `T${tower.tier}` : '✕', tx, ty);

      // Tower Health Bar
      if (isAlive) {
        const hp = tower.currentHp || tower.hp;
        const maxHp = tower.maxHp || 2000;
        const hpPercent = Math.max(0, Math.min(1, hp / maxHp));
        const barW = 28;
        const barH = 4;
        const barX = tx - barW / 2;
        const barY = ty - 1.8 * CELL_PX;

        ctx.fillStyle = '#09090b';
        ctx.fillRect(barX - 1, barY - 1, barW + 2, barH + 2);
        ctx.fillStyle = isRadiant ? '#10b981' : '#f43f5e';
        ctx.fillRect(barX, barY, barW * hpPercent, barH);
      }
      ctx.restore();
    });

    // 5. DRAW CREEP UNITS
    creeps.forEach(creep => {
      if (creep.isDead || creep.hp <= 0) return;
      const cx = (creep.c + 0.5) * CELL_PX;
      const cy = (creep.r + 0.5) * CELL_PX;
      const isRadiant = creep.team === 'radiant';

      ctx.save();
      ctx.fillStyle = isRadiant ? '#065f46' : '#881337';
      ctx.strokeStyle = isRadiant ? '#34d399' : '#f43f5e';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(cx, cy, 0.8 * CELL_PX, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Mini Creep Health Bar
      const hpPercent = creep.hp / (creep.maxHp || 60);
      const barW = 16;
      const barX = cx - barW / 2;
      const barY = cy - 1.2 * CELL_PX;
      ctx.fillStyle = '#000000';
      ctx.fillRect(barX - 1, barY - 1, barW + 2, 3);
      ctx.fillStyle = isRadiant ? '#10b981' : '#f43f5e';
      ctx.fillRect(barX, barY, barW * hpPercent, 2);
      ctx.restore();
    });

    // 6. DRAW ROSHAN HEALTH BAR (IF ALIVE)
    if (roshan && !roshan.isDead) {
      const rx = (roshan.c + 0.5) * CELL_PX;
      const ry = (roshan.r + 0.5) * CELL_PX;
      const hpPercent = roshan.hp / roshan.maxHp;
      const barW = 44;
      const barX = rx - barW / 2;
      const barY = ry - 2.8 * CELL_PX;

      ctx.save();
      ctx.fillStyle = '#000000';
      ctx.fillRect(barX - 1, barY - 1, barW + 2, 6);
      ctx.fillStyle = '#ea580c';
      ctx.fillRect(barX, barY, barW * hpPercent, 4);

      ctx.font = 'bold 8px monospace';
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.fillText(`${roshan.hp}/${roshan.maxHp}`, rx, barY - 3);
      ctx.restore();
    }

    // 7. DRAW HOVERED CELL / TRAJECTORY / PATH
    if (hoveredCell) {
      const hx = hoveredCell.c * CELL_PX;
      const hy = hoveredCell.r * CELL_PX;
      const isReachable = reachableCells.has(`${hoveredCell.r},${hoveredCell.c}`);

      ctx.fillStyle = isReachable ? 'rgba(250, 204, 21, 0.45)' : 'rgba(255, 255, 255, 0.15)';
      ctx.strokeStyle = isReachable ? '#facc15' : '#94a3b8';
      ctx.lineWidth = 2;
      ctx.fillRect(hx, hy, CELL_PX, CELL_PX);
      ctx.strokeRect(hx, hy, CELL_PX, CELL_PX);

      // Trajectory line from active hero to hovered cell
      if (activeHero) {
        const fromX = (activeHero.c + 0.5) * CELL_PX;
        const fromY = (activeHero.r + 0.5) * CELL_PX;
        const toX = (hoveredCell.c + 0.5) * CELL_PX;
        const toY = (hoveredCell.r + 0.5) * CELL_PX;

        // If hovering over reachable cell, draw complete BFS path!
        const node = reachableCells.get(`${hoveredCell.r},${hoveredCell.c}`);
        if (node && node.path) {
          ctx.strokeStyle = '#facc15';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.moveTo(fromX, fromY);
          for (let i = 1; i < node.path.length; i++) {
            ctx.lineTo((node.path[i].c + 0.5) * CELL_PX, (node.path[i].r + 0.5) * CELL_PX);
          }
          ctx.stroke();

          // Step count badge
          ctx.fillStyle = '#000000';
          ctx.beginPath();
          ctx.arc(toX, toY, 9, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#facc15';
          ctx.lineWidth = 1.5;
          ctx.stroke();

          ctx.font = 'bold 10px monospace';
          ctx.fillStyle = '#facc15';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(node.path.length - 1, toX, toY);
        } else {
          // Straight targeting dashed line
          ctx.strokeStyle = targetingMode ? '#ef4444' : 'rgba(250, 204, 21, 0.5)';
          ctx.lineWidth = 2;
          ctx.setLineDash([6, 4]);
          ctx.beginPath();
          ctx.moveTo(fromX, fromY);
          ctx.lineTo(toX, toY);
          ctx.stroke();
          ctx.setLineDash([]);
        }
      }
    }

    // 8. DRAW HERO TOKENS (AVATARS, HP/MP BARS, ACTIVE TURN AURA, STATUSES)
    heroes.forEach(hero => {
      const hx = (hero.c + 0.5) * CELL_PX;
      const hy = (hero.r + 0.5) * CELL_PX;
      const tokenRadius = 1.5 * CELL_PX; // ~36px diameter
      const isActive = hero.id === activeHeroId;
      const isSelected = hero.id === selectedHeroId;
      const isRadiant = hero.team === 'radiant';
      const isDead = hero.isDead || hero.hp <= 0;

      // Active Turn Golden Pulsing Aura
      if (isActive && !isDead) {
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

      // Selected hero secondary ring
      if (isSelected && !isActive && !isDead) {
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(hx, hy, tokenRadius + 4, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Token background circle
      ctx.fillStyle = isDead ? '#18181b' : isRadiant ? '#064e3b' : '#450a0a';
      ctx.strokeStyle = isDead 
        ? '#3f3f46' 
        : isActive 
        ? '#fbbf24' 
        : isRadiant 
        ? '#10b981' 
        : '#ef4444';
      ctx.lineWidth = isActive ? 4 : 3;
      ctx.beginPath();
      ctx.arc(hx, hy, tokenRadius, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Render cached image avatar or fallback
      if (!isDead) {
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
          ctx.font = `bold ${Math.round(tokenRadius * 0.9)}px sans-serif`;
          ctx.fillStyle = '#ffffff';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(hero.name.charAt(0), hx, hy);
        }
      } else {
        // Dead Hero Skull marker
        ctx.font = 'bold 22px sans-serif';
        ctx.fillStyle = '#ef4444';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('💀', hx, hy);
      }

      // Hero Health Bar (above token)
      if (!isDead) {
        const hpPercent = Math.max(0, Math.min(1, hero.hp / hero.maxHp));
        const manaPercent = Math.max(0, Math.min(1, (hero.mana || 0) / (hero.maxMana || 100)));
        const barW = 34;
        const barX = hx - barW / 2;
        const barY = hy - tokenRadius - 6;

        // HP Background
        ctx.fillStyle = '#000000';
        ctx.fillRect(barX - 1, barY - 1, barW + 2, 5);
        // HP Fill
        ctx.fillStyle = isRadiant ? '#10b981' : '#f43f5e';
        ctx.fillRect(barX, barY, barW * hpPercent, 3);

        // Mana Bar
        ctx.fillStyle = '#000000';
        ctx.fillRect(barX - 1, barY + 3, barW + 2, 3);
        ctx.fillStyle = '#38bdf8';
        ctx.fillRect(barX, barY + 4, barW * manaPercent, 2);

        // Status Effects Badges above Health Bar
        if (hero.statusEffects && hero.statusEffects.length > 0) {
          const statusIcons = hero.statusEffects.map(s => {
            if (s.type === 'STUN') return '💫';
            if (s.type === 'SILENCE') return '🤐';
            if (s.type === 'ROOT') return '🕸️';
            if (s.type === 'SLOW') return '❄️';
            if (s.type === 'MAGIC_IMMUNE') return '🛡️';
            return '⚡';
          }).join('');

          ctx.font = '10px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(statusIcons, hx, barY - 3);
        }
      }

      // Hero Nameplate below token
      ctx.save();
      ctx.font = `bold 11px 'Cinzel', sans-serif`;
      ctx.fillStyle = isDead ? '#71717a' : '#ffffff';
      ctx.shadowColor = '#000000';
      ctx.shadowBlur = 6;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillText(hero.name, hx, hy + tokenRadius + 4);
      ctx.restore();
    });

    ctx.restore();
  }, [
    pan, zoom, activeHeroId, selectedHeroId, activeHero, 
    heroes, towers, creeps, roshan, targetingMode, turnActions.movement, 
    reachableCells, hoveredCell, showRanges, showGrid
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

      {/* 2. TOP BANNER NOTIFICATION */}
      {notification && (
        <div className="absolute top-18 left-1/2 -translate-x-1/2 z-50 bg-amber-500 text-black font-mono text-xs font-black px-6 py-2 rounded-full shadow-2xl animate-bounce pointer-events-none border border-black/20">
          {notification}
        </div>
      )}

      {/* 3. D20 DICE ROLL BANNER (CRIT / HIT / MISS) */}
      {latestDiceRoll && (
        <div className="absolute top-28 left-1/2 -translate-x-1/2 z-40 bg-[#121620]/95 backdrop-blur-md border-2 border-amber-500/80 px-5 py-2.5 rounded-2xl shadow-2xl flex items-center gap-3 animate-in fade-in zoom-in-95 pointer-events-auto">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-mono font-black text-lg shadow-inner ${
            latestDiceRoll.isCrit 
              ? 'bg-amber-500 text-black animate-pulse' 
              : latestDiceRoll.isFail 
              ? 'bg-rose-700 text-white' 
              : 'bg-[#1e293b] text-amber-400 border border-amber-400/50'
          }`}>
            {latestDiceRoll.rolls?.[0] ?? latestDiceRoll.total}
          </div>
          <div>
            <div className="text-[10px] uppercase font-mono font-bold text-slate-400">
              {latestDiceRoll.reason} [{latestDiceRoll.notation}]
            </div>
            <div className="text-xs font-fantasy font-black flex items-center gap-1.5">
              <span className={latestDiceRoll.isCrit ? 'text-amber-400' : latestDiceRoll.isFail ? 'text-rose-400' : 'text-emerald-400'}>
                {latestDiceRoll.isCrit ? '🔥 КРИТИЧЕСКИЙ УСПЕХ (20!)' : latestDiceRoll.isFail ? '❌ КРИТИЧЕСКИЙ ПРОМАХ (1!)' : 'ИТОГО: ' + latestDiceRoll.total}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* 4. TARGETING MODE BANNER */}
      {targetingMode && (
        <div className="absolute bottom-52 left-1/2 -translate-x-1/2 z-40 bg-rose-950/90 border-2 border-rose-500 text-white px-5 py-2 rounded-xl shadow-2xl flex items-center gap-3 pointer-events-auto backdrop-blur-sm animate-pulse">
          <span className="text-base">🎯</span>
          <span className="font-mono text-xs font-bold">
            РЕЖИМ ПРИЦЕЛИВАНИЯ: {targetingMode.mode === 'ATTACK' ? 'БАЗОВАЯ АТАКА' : targetingMode.ability?.name || targetingMode.itemId} (Дальность: {targetingMode.range} кл)
          </span>
          <button 
            onClick={() => dispatch({ type: 'CANCEL_TARGETING' })}
            className="px-2 py-0.5 bg-rose-800 hover:bg-rose-700 rounded text-[10px] font-mono font-black uppercase cursor-pointer"
          >
            Отмена [Esc]
          </button>
        </div>
      )}

      {/* 5. AUTHENTIC DOTA 2 HUD WITH PLAYABLE COMBAT CONTROLS */}
      <Dota2HUD
        gameState={gameState}
        dispatch={dispatch}
        pan={pan}
        zoom={zoom}
        onCenterOnCell={centerOnCell}
        onFitMap={fitMapToScreen}
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
