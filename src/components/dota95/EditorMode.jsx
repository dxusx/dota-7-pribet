import React, { useReducer, useEffect, useRef, useCallback, useMemo, useState } from 'react';
import { 
  editorReducer, createInitialEditorState, 
  LOCAL_STORAGE_EDITOR_KEY, validateCell 
} from '../../game/editorReducer.js';
import { 
  GRID_SIZE, TILE_TYPES, TILE_INFO, 
  getLaneAt, isBridgeCell 
} from '../../data/dotaPixelGrid.js';
import { 
  CREEP_CAMPS_DATA, RUNES_DATA, BASES_DATA, LANDMARKS 
} from '../../data/dota95Data.js';
import { OBJECT_TYPES } from '../../data/editorTemplates.js';
import { getAssetUrl } from '../../utils/assetUrl.js';
import { playClickSound, playSpellSound } from '../../utils/sound.js';

import EditorTopBar from './editor/EditorTopBar.jsx';
import EditorLeftLibrary from './editor/EditorLeftLibrary.jsx';
import EditorRightInspector from './editor/EditorRightInspector.jsx';
import EditorBottomHUD from './editor/EditorBottomHUD.jsx';
import EditorContextMenu from './editor/EditorContextMenu.jsx';

export default function EditorMode({ onSwitchMode }) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const terrainCanvasRef = useRef(null);

  // 1. DEDICATED EDITOR STATE ENGINE (INDEPENDENT FROM GAME ENGINE)
  const [state, dispatch] = useReducer(editorReducer, null, createInitialEditorState);
  const { 
    objects, 
    selectedObjectId, 
    hoveredObjectId, 
    hoveredCell, 
    dragState, 
    camera, 
    mapGrid, 
    settings, 
    notification 
  } = state;

  // Local UI State
  const [isLibraryOpen, setIsLibraryOpen] = useState(true);
  const [isInspectorOpen, setIsInspectorOpen] = useState(true);
  const [contextMenu, setContextMenu] = useState(null);
  const [isSpacePressed, setIsSpacePressed] = useState(false);
  const [saveNotice, setSaveNotice] = useState(null);

  // Drag candidate ref before movement threshold (4-6px threshold)
  const dragCandidateRef = useRef(null);
  const isPanningRef = useRef(false);
  const panStartRef = useRef({ x: 0, y: 0 });
  const libraryDragTemplateRef = useRef(null);
  const avatarImagesRef = useRef({});

  // Cell dimensions in world coordinates (px)
  const CELL_PX = 24; 
  const MAP_TOTAL_PX = GRID_SIZE * CELL_PX; // 2280px

  const selectedObject = useMemo(() => {
    return objects.find(o => o.id === selectedObjectId) || null;
  }, [objects, selectedObjectId]);

  // Load avatar images into cache
  useEffect(() => {
    objects.forEach(obj => {
      if (obj.avatar && !avatarImagesRef.current[obj.id]) {
        const img = new Image();
        img.src = getAssetUrl(obj.avatar);
        avatarImagesRef.current[obj.id] = img;
      }
    });
  }, [objects]);

  // Auto-save to LocalStorage with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        const payload = {
          objects,
          camera,
          updatedAt: Date.now()
        };
        localStorage.setItem(LOCAL_STORAGE_EDITOR_KEY, JSON.stringify(payload));
      } catch (err) {
        console.warn('Failed to auto-save editor state:', err);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [objects, camera]);

  // Save Banner Helper
  const handleSave = useCallback(() => {
    try {
      const payload = {
        objects,
        camera,
        updatedAt: Date.now()
      };
      localStorage.setItem(LOCAL_STORAGE_EDITOR_KEY, JSON.stringify(payload));
      setSaveNotice('💾 КАРТА СОХРАНЕНА');
      setTimeout(() => setSaveNotice(null), 3000);
      playClickSound();
    } catch (err) {
      console.error('Save failed:', err);
    }
  }, [objects, camera]);

  // Coordinate Conversion: Viewport -> Grid (x, y)
  const viewportToGrid = useCallback((clientX, clientY) => {
    if (!containerRef.current) return null;
    const rect = containerRef.current.getBoundingClientRect();
    const mouseX = clientX - rect.left;
    const mouseY = clientY - rect.top;

    const worldX = (mouseX - camera.x) / camera.zoom;
    const worldY = (mouseY - camera.y) / camera.zoom;

    const x = Math.floor(worldX / CELL_PX); // column
    const y = Math.floor(worldY / CELL_PX); // row

    if (x >= 0 && x < GRID_SIZE && y >= 0 && y < GRID_SIZE) {
      return { x, y, worldX, worldY };
    }
    return null;
  }, [camera, CELL_PX]);

  // Center camera on grid cell (targetY = row, targetX = col)
  const centerOnCell = useCallback((targetY, targetX, customZoom = camera.zoom) => {
    if (!containerRef.current) return;
    const w = containerRef.current.clientWidth;
    const h = containerRef.current.clientHeight;

    const cellWorldX = (targetX + 0.5) * CELL_PX;
    const cellWorldY = (targetY + 0.5) * CELL_PX;

    const newX = (w / 2) - (cellWorldX * customZoom);
    const newY = (h / 2) - (cellWorldY * customZoom);

    dispatch({
      type: 'SET_CAMERA',
      x: Math.round(newX),
      y: Math.round(newY),
      zoom: customZoom
    });
  }, [camera.zoom, CELL_PX]);

  // Fit entire 95x95 map onto current viewport
  const fitMapToScreen = useCallback(() => {
    if (!containerRef.current) return;
    const w = containerRef.current.clientWidth;
    const h = containerRef.current.clientHeight;

    const availW = w - 80;
    const availH = h - 180;

    const fitZoom = Math.max(0.25, Math.min(availW / MAP_TOTAL_PX, availH / MAP_TOTAL_PX));
    const newX = (w - MAP_TOTAL_PX * fitZoom) / 2;
    const newY = ((h - MAP_TOTAL_PX * fitZoom) / 2) + 20;

    dispatch({
      type: 'SET_CAMERA',
      x: Math.round(newX),
      y: Math.round(newY),
      zoom: fitZoom
    });
  }, [MAP_TOTAL_PX]);

  // Initial fit on mount
  useEffect(() => {
    if (camera.x === 0 && camera.y === 0) {
      fitMapToScreen();
    }
    const handleResize = () => fitMapToScreen();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [fitMapToScreen, camera.x, camera.y]);

  // -------------------------------------------------------------
  // 2. PRE-RENDER STATIC TERRAIN TO OFFSCREEN CANVAS (60 FPS)
  // -------------------------------------------------------------
  useEffect(() => {
    let offscreen = terrainCanvasRef.current;
    if (!offscreen) {
      offscreen = document.createElement('canvas');
      offscreen.width = MAP_TOTAL_PX;
      offscreen.height = MAP_TOTAL_PX;
      terrainCanvasRef.current = offscreen;
    }
    const offCtx = offscreen.getContext('2d');

    // Bedrock
    offCtx.fillStyle = '#080a0f';
    offCtx.fillRect(0, 0, MAP_TOTAL_PX, MAP_TOTAL_PX);

    // 95 x 95 Cells with authentic friend's 5-color palette
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

        // Grid lines
        if (settings.showGrid) {
          offCtx.strokeStyle = info.gridBorder;
          offCtx.lineWidth = 0.5;
          offCtx.strokeRect(x, y, CELL_PX, CELL_PX);
        }
      }
    }

    // Base Ancients & Bases
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
    offCtx.font = 'bold 20px sans-serif';
    offCtx.fillStyle = '#ffffff';
    offCtx.textAlign = 'center';
    offCtx.textBaseline = 'middle';
    offCtx.fillText('💎', radAncientX, radAncientY);
    offCtx.font = "bold 11px 'Cinzel', serif";
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
    offCtx.font = 'bold 20px sans-serif';
    offCtx.fillStyle = '#ffffff';
    offCtx.textAlign = 'center';
    offCtx.textBaseline = 'middle';
    offCtx.fillText('🌋', direAncientX, direAncientY);
    offCtx.font = "bold 11px 'Cinzel', serif";
    offCtx.fillStyle = '#fda4af';
    offCtx.fillText('ЛЕДЯНОЙ ТРОН (Ancient)', direAncientX, direAncientY + 3.2 * CELL_PX);
    offCtx.restore();

    // Landmarks & Labels
    if (settings.showLabels) {
      LANDMARKS.forEach(lm => {
        const lx = (lm.c + 0.5) * CELL_PX;
        const ly = (lm.r + 0.5) * CELL_PX;
        offCtx.save();
        offCtx.font = "900 13px 'Cinzel', sans-serif";
        offCtx.fillStyle = lm.color;
        offCtx.textAlign = 'center';
        offCtx.textBaseline = 'middle';
        offCtx.shadowColor = 'rgba(0, 0, 0, 0.95)';
        offCtx.shadowBlur = 8;
        offCtx.fillText(lm.name, lx, ly);
        offCtx.restore();
      });
    }

    // Creep Camps & Roshan Pit cave marker
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
        offCtx.font = 'bold 20px sans-serif';
        offCtx.fillStyle = '#ffffff';
        offCtx.textAlign = 'center';
        offCtx.textBaseline = 'middle';
        offCtx.fillText('👹', cx, cy - 2);
        offCtx.font = '900 11px monospace';
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
        offCtx.font = 'bold 12px monospace';
        offCtx.fillStyle = camp.color;
        offCtx.textAlign = 'center';
        offCtx.textBaseline = 'middle';
        const icon = camp.type === 'ancient' ? '🐉' : camp.type === 'hard' ? '🐻' : camp.type === 'medium' ? '🐺' : '🐗';
        offCtx.fillText(icon, cx, cy);
        offCtx.restore();
      }
    });

    // Runes
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
      offCtx.font = 'bold 10px monospace';
      offCtx.fillStyle = '#ffffff';
      offCtx.textAlign = 'center';
      offCtx.textBaseline = 'middle';
      offCtx.fillText('◆', rx, ry);
      offCtx.restore();
    });
  }, [mapGrid, settings.showGrid, settings.showLabels, CELL_PX, MAP_TOTAL_PX]);

  // -------------------------------------------------------------
  // 3. KEYBOARD SHORTCUTS (Ctrl+D, Delete, Esc, Space)
  // -------------------------------------------------------------
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

      // Duplicate: Ctrl + D
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'd') {
        e.preventDefault();
        dispatch({ type: 'DUPLICATE_OBJECT' });
        playClickSound();
        return;
      }

      // Delete: Delete or Backspace
      if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault();
        dispatch({ type: 'DELETE_OBJECT' });
        playClickSound();
        return;
      }

      // Deselect: Escape
      if (e.key === 'Escape') {
        e.preventDefault();
        dispatch({ type: 'DESELECT_OBJECT' });
        setContextMenu(null);
        return;
      }

      // Space for Pan
      if (e.code === 'Space' && !e.repeat) {
        setIsSpacePressed(true);
      }
    };

    const handleKeyUp = (e) => {
      if (e.code === 'Space') {
        setIsSpacePressed(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // -------------------------------------------------------------
  // 4. MOUSE EVENT HANDLERS (SEPARATE CLICK VS DRAG THRESHOLD)
  // -------------------------------------------------------------
  const handleMouseDown = (e) => {
    // RMB (Context menu)
    if (e.button === 2) {
      e.preventDefault();
      const gridPos = viewportToGrid(e.clientX, e.clientY);
      if (gridPos) {
        const obj = objects.find(o => Math.abs(o.x - gridPos.x) <= 1 && Math.abs(o.y - gridPos.y) <= 1);
        if (obj) {
          dispatch({ type: 'SELECT_OBJECT', objectId: obj.id });
          setContextMenu({ x: e.clientX, y: e.clientY, object: obj });
          return;
        }
      }
      setContextMenu(null);
      return;
    }

    // MMB (button 1) or Space+LMB -> Camera Pan
    if (e.button === 1 || isSpacePressed) {
      isPanningRef.current = true;
      panStartRef.current = { x: e.clientX - camera.x, y: e.clientY - camera.y };
      return;
    }

    // LMB (button 0)
    if (e.button === 0) {
      setContextMenu(null);
      const gridPos = viewportToGrid(e.clientX, e.clientY);

      if (gridPos) {
        // Check if clicking an existing object
        const clickedObj = objects.find(o => {
          const radius = o.type === OBJECT_TYPES.HERO ? 1.5 : 1.2;
          const dist = Math.hypot(o.x - gridPos.x, o.y - gridPos.y);
          return dist <= radius;
        });

        if (clickedObj) {
          // Record candidate for drag (4-6px threshold check)
          dragCandidateRef.current = {
            objectId: clickedObj.id,
            startClientX: e.clientX,
            startClientY: e.clientY,
            originX: clickedObj.x,
            originY: clickedObj.y
          };
          return;
        }
      }

      // If clicked empty map ground, start camera panning
      isPanningRef.current = true;
      panStartRef.current = { x: e.clientX - camera.x, y: e.clientY - camera.y };
    }
  };

  const handleMouseMove = (e) => {
    // 1. Camera Panning
    if (isPanningRef.current) {
      dispatch({
        type: 'SET_CAMERA',
        x: e.clientX - panStartRef.current.x,
        y: e.clientY - panStartRef.current.y
      });
      return;
    }

    const gridPos = viewportToGrid(e.clientX, e.clientY);
    if (gridPos) {
      dispatch({ type: 'SET_HOVERED_CELL', cell: { x: gridPos.x, y: gridPos.y } });
    }

    // 2. Drag threshold check (4-6 px movement before starting drag)
    if (dragCandidateRef.current && !dragState) {
      const dist = Math.hypot(
        e.clientX - dragCandidateRef.current.startClientX,
        e.clientY - dragCandidateRef.current.startClientY
      );

      if (dist >= 5 && gridPos) {
        // Exceeded threshold: START DRAG!
        dispatch({
          type: 'START_DRAG',
          objectId: dragCandidateRef.current.objectId,
          source: 'MAP',
          originX: dragCandidateRef.current.originX,
          originY: dragCandidateRef.current.originY,
          startX: gridPos.x,
          startY: gridPos.y
        });
      }
      return;
    }

    // 3. Update Drag State during drag
    if (dragState && dragState.isDragging && gridPos) {
      dispatch({
        type: 'MOVE_DRAG',
        targetX: gridPos.x,
        targetY: gridPos.y
      });
      return;
    }

    // 4. Update Hovered Object
    if (gridPos) {
      const obj = objects.find(o => Math.abs(o.x - gridPos.x) <= 1 && Math.abs(o.y - gridPos.y) <= 1);
      dispatch({ type: 'SET_HOVERED_OBJECT', objectId: obj?.id || null });
    } else {
      dispatch({ type: 'SET_HOVERED_OBJECT', objectId: null });
    }
  };

  const handleMouseUp = (e) => {
    // End camera panning
    if (isPanningRef.current) {
      isPanningRef.current = false;
      return;
    }

    // End Object Drag & Drop
    if (dragState && dragState.isDragging) {
      dispatch({ type: 'DROP_OBJECT' });
      playClickSound();
      dragCandidateRef.current = null;
      return;
    }

    // If was clicked without dragging (regular SELECT action)
    if (dragCandidateRef.current) {
      dispatch({ type: 'SELECT_OBJECT', objectId: dragCandidateRef.current.objectId });
      playClickSound();
      dragCandidateRef.current = null;
    }
  };

  // Zoom with Wheel
  const handleWheel = (e) => {
    e.preventDefault();
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const zoomFactor = e.deltaY < 0 ? 1.15 : 0.87;
    const newZoom = Math.max(0.25, Math.min(3.5, camera.zoom * zoomFactor));

    const newX = mouseX - (mouseX - camera.x) * (newZoom / camera.zoom);
    const newY = mouseY - (mouseY - camera.y) * (newZoom / camera.zoom);

    dispatch({
      type: 'SET_CAMERA',
      x: Math.round(newX),
      y: Math.round(newY),
      zoom: newZoom
    });
  };

  // HTML5 Drag & Drop from Left Library to Canvas
  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
    const gridPos = viewportToGrid(e.clientX, e.clientY);
    if (gridPos) {
      if (!dragState) {
        dispatch({
          type: 'START_DRAG',
          source: 'LIBRARY',
          template: libraryDragTemplateRef.current,
          startX: gridPos.x,
          startY: gridPos.y
        });
      } else {
        dispatch({
          type: 'MOVE_DRAG',
          targetX: gridPos.x,
          targetY: gridPos.y
        });
      }
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    dispatch({ type: 'DROP_OBJECT' });
    playSpellSound();
    libraryDragTemplateRef.current = null;
  };

  // ===========================================================================
  // 5. MAIN CANVAS RENDERING LOOP (Blits Cached Terrain + Draws Dynamic Objects)
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

    // Clear
    ctx.fillStyle = '#080a0f';
    ctx.fillRect(0, 0, width, height);

    ctx.save();
    ctx.translate(camera.x, camera.y);
    ctx.scale(camera.zoom, camera.zoom);

    // 1. Blit static offscreen terrain
    if (terrainCanvasRef.current) {
      ctx.drawImage(terrainCanvasRef.current, 0, 0);
    }

    // 2. Highlight selected object's cell
    if (selectedObject) {
      const sx = selectedObject.x * CELL_PX;
      const sy = selectedObject.y * CELL_PX;
      ctx.fillStyle = 'rgba(223, 182, 82, 0.22)';
      ctx.strokeStyle = '#dfb652';
      ctx.lineWidth = 1.5;
      ctx.fillRect(sx, sy, CELL_PX, CELL_PX);
      ctx.strokeRect(sx, sy, CELL_PX, CELL_PX);
    }

    // 3. Highlight Drag Destination Cell
    if (dragState && dragState.isDragging) {
      const dx = dragState.targetX * CELL_PX;
      const dy = dragState.targetY * CELL_PX;
      const isValid = dragState.isValid;

      ctx.fillStyle = isValid ? 'rgba(56, 189, 248, 0.3)' : 'rgba(239, 68, 68, 0.45)';
      ctx.strokeStyle = isValid ? '#38bdf8' : '#ef4444';
      ctx.lineWidth = 2;
      ctx.fillRect(dx, dy, CELL_PX, CELL_PX);
      ctx.strokeRect(dx, dy, CELL_PX, CELL_PX);

      // Trajectory dashed line from original position to current drag position
      if (dragState.source === 'MAP' && dragState.objectId) {
        const draggedObj = objects.find(o => o.id === dragState.objectId);
        if (draggedObj) {
          ctx.strokeStyle = isValid ? '#38bdf8' : '#ef4444';
          ctx.lineWidth = 2;
          ctx.setLineDash([5, 4]);
          ctx.beginPath();
          ctx.moveTo((draggedObj.x + 0.5) * CELL_PX, (draggedObj.y + 0.5) * CELL_PX);
          ctx.lineTo((dragState.targetX + 0.5) * CELL_PX, (dragState.targetY + 0.5) * CELL_PX);
          ctx.stroke();
          ctx.setLineDash([]);
        }
      }
    }

    // 4. Draw Towers Attack Range (if enabled)
    if (settings.showRanges) {
      objects.filter(o => o.type === OBJECT_TYPES.TOWER).forEach(t => {
        const tx = (t.x + 0.5) * CELL_PX;
        const ty = (t.y + 0.5) * CELL_PX;
        const isRadiant = t.team === 'radiant';
        ctx.strokeStyle = isRadiant ? 'rgba(52, 211, 153, 0.25)' : 'rgba(248, 113, 113, 0.25)';
        ctx.lineWidth = 1.2;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.arc(tx, ty, 8 * CELL_PX, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);
      });
    }

    // 5. Draw All Placed Map Objects
    objects.forEach(obj => {
      const isBeingDragged = dragState?.isDragging && dragState?.source === 'MAP' && dragState?.objectId === obj.id;
      // If being dragged, draw at the target cell preview
      const ox = ((isBeingDragged ? dragState.targetX : obj.x) + 0.5) * CELL_PX;
      const oy = ((isBeingDragged ? dragState.targetY : obj.y) + 0.5) * CELL_PX;

      const isSelected = selectedObjectId === obj.id;
      const isHovered = hoveredObjectId === obj.id;
      const isRadiant = obj.team === 'radiant';
      const isDire = obj.team === 'dire';

      const isHero = obj.type === OBJECT_TYPES.HERO;
      const isTower = obj.type === OBJECT_TYPES.TOWER;
      const tokenRadius = isHero ? 1.5 * CELL_PX : isTower ? 1.4 * CELL_PX : 1.1 * CELL_PX;

      ctx.save();
      if (isBeingDragged) {
        ctx.globalAlpha = 0.85;
      }

      // Hard Rectangular / Beveled Selection Ring
      if (isSelected) {
        ctx.strokeStyle = '#dfb652';
        ctx.lineWidth = 3.5;
        ctx.beginPath();
        ctx.arc(ox, oy, tokenRadius + 4, 0, Math.PI * 2);
        ctx.stroke();

        // Arrow indicator above
        ctx.fillStyle = '#dfb652';
        ctx.beginPath();
        ctx.moveTo(ox, oy - tokenRadius - 6);
        ctx.lineTo(ox - 6, oy - tokenRadius - 14);
        ctx.lineTo(ox + 6, oy - tokenRadius - 14);
        ctx.closePath();
        ctx.fill();
      } else if (isHovered) {
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(ox, oy, tokenRadius + 2, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Base Circle Token with hard border
      ctx.fillStyle = isRadiant ? '#0c2417' : isDire ? '#301213' : '#1a1b22';
      ctx.strokeStyle = isSelected 
        ? '#dfb652' 
        : isRadiant 
        ? '#1b5e3f' 
        : isDire 
        ? '#8a2424' 
        : '#8a681c';
      ctx.lineWidth = isSelected ? 3 : 2;
      ctx.beginPath();
      ctx.arc(ox, oy, tokenRadius, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Avatar Image or Emoji Icon
      const img = avatarImagesRef.current[obj.id];
      if (img && img.complete && img.naturalWidth > 0) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(ox, oy, tokenRadius - 2, 0, Math.PI * 2);
        ctx.clip();
        ctx.drawImage(
          img, 
          ox - (tokenRadius - 2), 
          oy - (tokenRadius - 2), 
          (tokenRadius - 2) * 2, 
          (tokenRadius - 2) * 2
        );
        ctx.restore();
      } else {
        ctx.font = `bold ${Math.round(tokenRadius * 0.9)}px sans-serif`;
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(obj.icon || obj.name.charAt(0), ox, oy);
      }

      // Tier badge for towers
      if (isTower && obj.tier) {
        ctx.font = 'bold 10px monospace';
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`T${obj.tier}`, ox, oy);
      }

      // Nameplate below token
      ctx.font = "bold 9px 'Cinzel', sans-serif";
      ctx.fillStyle = isSelected ? '#fde047' : '#e0e2ec';
      ctx.shadowColor = '#000000';
      ctx.shadowBlur = 4;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillText(obj.name, ox, oy + tokenRadius + 2);

      ctx.restore();
    });

    ctx.restore();
  }, [
    camera, objects, selectedObjectId, selectedObject, 
    dragState, hoveredObjectId, settings
  ]);

  // Counts for Top Bar
  const radiantCount = objects.filter(o => o.team === 'radiant').length;
  const direCount = objects.filter(o => o.team === 'dire').length;
  const neutralCount = objects.filter(o => o.team === 'neutral').length;

  return (
    <div 
      ref={containerRef}
      className={`relative w-screen h-screen overflow-hidden select-none bg-[#090a0d] font-sans ${
        isSpacePressed ? 'cursor-grab' : 'cursor-default'
      }`}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onWheel={handleWheel}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onContextMenu={(e) => e.preventDefault()}
    >
      {/* 1. TOP BAR */}
      <EditorTopBar
        mode="EDITOR"
        onSwitchMode={onSwitchMode}
        objectsCount={objects.length}
        radiantCount={radiantCount}
        direCount={direCount}
        neutralCount={neutralCount}
        zoom={camera.zoom}
        onZoomIn={() => dispatch({ type: 'SET_CAMERA', zoom: Math.min(3.5, camera.zoom * 1.2) })}
        onZoomOut={() => dispatch({ type: 'SET_CAMERA', zoom: Math.max(0.25, camera.zoom * 0.83) })}
        onFitMap={fitMapToScreen}
        showGrid={settings.showGrid}
        onToggleGrid={() => dispatch({ type: 'SET_SETTINGS', settings: { showGrid: !settings.showGrid } })}
        showRanges={settings.showRanges}
        onToggleRanges={() => dispatch({ type: 'SET_SETTINGS', settings: { showRanges: !settings.showRanges } })}
        showLabels={settings.showLabels}
        onToggleLabels={() => dispatch({ type: 'SET_SETTINGS', settings: { showLabels: !settings.showLabels } })}
        onSave={handleSave}
        onReset={() => {
          if (window.confirm('Сбросить карту к исходной расстановке?')) {
            dispatch({ type: 'RESET_MAP' });
          }
        }}
        saveNotice={saveNotice}
      />

      {/* 2. NOTIFICATION BANNER */}
      {notification && (
        <div className="absolute top-12 left-1/2 -translate-x-1/2 z-50 bg-[#16171f] border-2 border-[#dfb652] text-[#fce89e] font-mono text-[11px] font-black px-4 py-1.5 shadow-[0_4px_20px_rgba(0,0,0,0.9)] animate-fade-in pointer-events-none">
          {notification}
        </div>
      )}

      {/* 3. MAIN CANVAS */}
      <canvas ref={canvasRef} className="absolute inset-0" />

      {/* 4. LEFT OBJECT LIBRARY */}
      <EditorLeftLibrary
        isOpen={isLibraryOpen}
        onToggleOpen={() => setIsLibraryOpen(!isLibraryOpen)}
        onAddObjectToCenter={(tpl) => {
          const w = containerRef.current?.clientWidth || 800;
          const h = containerRef.current?.clientHeight || 600;
          const cell = viewportToGrid(w / 2, h / 2) || { x: 47, y: 47 };
          dispatch({ type: 'ADD_OBJECT', template: tpl, targetX: cell.x, targetY: cell.y });
          playSpellSound();
        }}
        onStartLibraryDrag={(tpl) => {
          libraryDragTemplateRef.current = tpl;
        }}
      />

      {/* 5. RIGHT INSPECTOR */}
      <EditorRightInspector
        isOpen={isInspectorOpen}
        onToggleOpen={() => setIsInspectorOpen(!isInspectorOpen)}
        selectedObject={selectedObject}
        onUpdateObject={(id, updates) => dispatch({ type: 'UPDATE_OBJECT', objectId: id, updates })}
        onDuplicate={() => {
          dispatch({ type: 'DUPLICATE_OBJECT' });
          playClickSound();
        }}
        onDelete={() => {
          dispatch({ type: 'DELETE_OBJECT' });
          playClickSound();
        }}
        onCenterCamera={centerOnCell}
      />

      {/* 6. BOTTOM HUD & MINIMAP */}
      <EditorBottomHUD
        objects={objects}
        selectedObject={selectedObject}
        onCenterOnCell={centerOnCell}
        onDuplicate={() => {
          dispatch({ type: 'DUPLICATE_OBJECT' });
          playClickSound();
        }}
        onDelete={() => {
          dispatch({ type: 'DELETE_OBJECT' });
          playClickSound();
        }}
        onFitMap={fitMapToScreen}
        zoom={camera.zoom}
        camera={camera}
      />

      {/* 7. CONTEXT MENU (RMB) */}
      {contextMenu && (
        <EditorContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          object={contextMenu.object}
          onClose={() => setContextMenu(null)}
          onDuplicate={() => {
            dispatch({ type: 'DUPLICATE_OBJECT', objectId: contextMenu.object.id });
            playClickSound();
          }}
          onDelete={() => {
            dispatch({ type: 'DELETE_OBJECT', objectId: contextMenu.object.id });
            playClickSound();
          }}
          onToggleTeam={() => {
            const nextTeam = contextMenu.object.team === 'radiant' ? 'dire' : contextMenu.object.team === 'dire' ? 'neutral' : 'radiant';
            dispatch({ type: 'UPDATE_OBJECT', objectId: contextMenu.object.id, updates: { team: nextTeam } });
          }}
          onCenterCamera={centerOnCell}
        />
      )}
    </div>
  );
}
