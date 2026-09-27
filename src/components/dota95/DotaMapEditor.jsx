import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { 
  GRID_SIZE, TILE_TYPES, TILE_INFO, generatePixelDotaMap, 
  getLaneAt, isBridgeCell 
} from '../../data/dotaPixelGrid.js';
import { 
  CREEP_CAMPS_DATA, RUNES_DATA, BASES_DATA, LANDMARKS 
} from '../../data/dota95Data.js';
import { 
  getInitialEditorObjects, createInstanceFromTemplate, 
  HERO_TEMPLATES, CREEP_TEMPLATES, TOWER_TEMPLATES, OBJECT_TYPES 
} from '../../data/editorTemplates.js';
import { getAssetUrl } from '../../utils/assetUrl.js';
import { playClickSound, playSpellSound } from '../../utils/sound.js';

import EditorTopBar from './EditorTopBar.jsx';
import EditorLeftLibrary from './EditorLeftLibrary.jsx';
import EditorRightInspector from './EditorRightInspector.jsx';
import EditorBottomHUD from './EditorBottomHUD.jsx';
import EditorContextMenu from './EditorContextMenu.jsx';

const LOCAL_STORAGE_KEY = 'dota_battle_map_editor_v1';

export default function DotaMapEditor() {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const terrainCanvasRef = useRef(null);

  // 95x95 Static Terrain Map Grid (Uint8Array)
  const [mapGrid] = useState(() => generatePixelDotaMap());

  // -------------------------------------------------------------
  // 1. OBJECTS STATE (INSTANCES ON THE MAP)
  // -------------------------------------------------------------
  const [objects, setObjects] = useState(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed.objects) && parsed.objects.length > 0) {
          return parsed.objects;
        }
      }
    } catch (e) {
      console.warn('Failed to load from localStorage:', e);
    }
    return getInitialEditorObjects();
  });

  const [selectedObjectId, setSelectedObjectId] = useState(() => {
    // Default select Axe or first hero
    const firstHero = getInitialEditorObjects().find(o => o.templateId === 'axe');
    return firstHero ? firstHero.id : null;
  });

  // -------------------------------------------------------------
  // 2. CAMERA STATE (PAN & ZOOM)
  // -------------------------------------------------------------
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [isSpacePressed, setIsSpacePressed] = useState(false);

  // Dragging camera (pan)
  const isPanningRef = useRef(false);
  const panStartRef = useRef({ x: 0, y: 0 });

  // -------------------------------------------------------------
  // 3. OBJECT DRAG & DROP STATE
  // -------------------------------------------------------------
  // candidate before moving past threshold
  const dragCandidateRef = useRef(null); 
  const [dragState, setDragState] = useState(null); 
  // { isDragging: true, objectId: string, currentGridX: number, currentGridY: number, mouseWorldX: number, mouseWorldY: number }

  // Dragging from library template
  const libraryDragTemplateRef = useRef(null);

  // -------------------------------------------------------------
  // 4. UI SETTINGS & CONTEXT MENU
  // -------------------------------------------------------------
  const [isLibraryOpen, setIsLibraryOpen] = useState(true);
  const [isInspectorOpen, setIsInspectorOpen] = useState(true);
  const [showGrid, setShowGrid] = useState(true);
  const [showRanges, setShowRanges] = useState(true);
  const [showLabels, setShowLabels] = useState(true);
  const [contextMenu, setContextMenu] = useState(null);
  const [hoveredCell, setHoveredCell] = useState(null);
  const [hoveredObject, setHoveredObject] = useState(null);
  const [saveNotice, setSaveNotice] = useState(null);

  // Cached Avatar Images
  const avatarImagesRef = useRef({});

  // Cell dimensions in world coordinates
  const CELL_PX = 24; 
  const MAP_TOTAL_PX = GRID_SIZE * CELL_PX; // 2280px

  const selectedObject = useMemo(() => {
    return objects.find(o => o.id === selectedObjectId) || null;
  }, [objects, selectedObjectId]);

  // Save notice banner helper
  const showSaveBanner = useCallback((msg = '💾 Карта сохранена локально') => {
    setSaveNotice(msg);
    setTimeout(() => setSaveNotice(null), 3000);
  }, []);

  // Save to LocalStorage
  const saveMapToStorage = useCallback((customObjects = objects) => {
    try {
      const payload = {
        objects: customObjects,
        pan,
        zoom,
        updatedAt: Date.now()
      };
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(payload));
      showSaveBanner();
    } catch (e) {
      console.error('Failed to save to localStorage:', e);
    }
  }, [objects, pan, zoom, showSaveBanner]);

  // Reset to default layout
  const resetMapToDefault = useCallback(() => {
    if (window.confirm('Сбросить карту к исходной расстановке героев, вышек и крипов?')) {
      const defaults = getInitialEditorObjects();
      setObjects(defaults);
      const defaultAxe = defaults.find(o => o.templateId === 'axe');
      setSelectedObjectId(defaultAxe ? defaultAxe.id : defaults[0]?.id || null);
      saveMapToStorage(defaults);
      showSaveBanner('🔄 Карта сброшена к исходной расстановке');
    }
  }, [saveMapToStorage, showSaveBanner]);

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

  // Coordinate Conversion: Viewport (clientX, clientY) -> Grid (x, y)
  const viewportToGrid = useCallback((clientX, clientY) => {
    if (!containerRef.current) return null;
    const rect = containerRef.current.getBoundingClientRect();
    const mouseX = clientX - rect.left;
    const mouseY = clientY - rect.top;

    const worldX = (mouseX - pan.x) / zoom;
    const worldY = (mouseY - pan.y) / zoom;

    const x = Math.floor(worldX / CELL_PX); // column
    const y = Math.floor(worldY / CELL_PX); // row

    if (x >= 0 && x < GRID_SIZE && y >= 0 && y < GRID_SIZE) {
      return { x, y, worldX, worldY };
    }
    return null;
  }, [pan, zoom, CELL_PX]);

  // Center camera on grid cell (r, c)
  const centerOnCell = useCallback((targetY, targetX, customZoom = zoom) => {
    if (!containerRef.current) return;
    const w = containerRef.current.clientWidth;
    const h = containerRef.current.clientHeight;

    const cellWorldX = (targetX + 0.5) * CELL_PX;
    const cellWorldY = (targetY + 0.5) * CELL_PX;

    const newPanX = (w / 2) - (cellWorldX * customZoom);
    const newPanY = (h / 2) - (cellWorldY * customZoom);

    setPan({ x: Math.round(newPanX), y: Math.round(newPanY) });
    setZoom(customZoom);
  }, [zoom, CELL_PX]);

  // Fit entire map on screen
  const fitMapToScreen = useCallback(() => {
    if (!containerRef.current) return;
    const w = containerRef.current.clientWidth;
    const h = containerRef.current.clientHeight;

    const availW = w - 80;
    const availH = h - 180;

    const fitZoom = Math.max(0.25, Math.min(availW / MAP_TOTAL_PX, availH / MAP_TOTAL_PX));
    const newPanX = (w - MAP_TOTAL_PX * fitZoom) / 2;
    const newPanY = ((h - MAP_TOTAL_PX * fitZoom) / 2) + 20;

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

  // -------------------------------------------------------------
  // 5. OBJECT ACTIONS: ADD, DUPLICATE, DELETE, UPDATE
  // -------------------------------------------------------------
  const handleAddObjectAt = useCallback((template, gridX, gridY) => {
    const newInstance = createInstanceFromTemplate(template, gridX, gridY);
    setObjects(prev => [...prev, newInstance]);
    setSelectedObjectId(newInstance.id);
    playSpellSound();
    showSaveBanner(`✨ Добавлен объект: ${template.name}`);
  }, [showSaveBanner]);

  const handleAddObjectToCenter = useCallback((template) => {
    if (!containerRef.current) return;
    const w = containerRef.current.clientWidth / 2;
    const h = containerRef.current.clientHeight / 2;
    const cell = viewportToGrid(w, h) || { x: 47, y: 47 };
    handleAddObjectAt(template, cell.x, cell.y);
  }, [viewportToGrid, handleAddObjectAt]);

  const handleDuplicate = useCallback(() => {
    if (!selectedObject) return;
    const newInstance = {
      ...selectedObject,
      id: `${selectedObject.type}_${Date.now()}_copy`,
      name: `${selectedObject.name} (Копия)`,
      x: Math.min(94, selectedObject.x + 1),
      y: selectedObject.y
    };
    setObjects(prev => [...prev, newInstance]);
    setSelectedObjectId(newInstance.id);
    playClickSound();
    showSaveBanner(`📋 Дублирован: ${selectedObject.name}`);
  }, [selectedObject, showSaveBanner]);

  const handleDelete = useCallback(() => {
    if (!selectedObjectId) return;
    const target = objects.find(o => o.id === selectedObjectId);
    setObjects(prev => prev.filter(o => o.id !== selectedObjectId));
    setSelectedObjectId(null);
    playClickSound();
    showSaveBanner(`🗑️ Удален объект: ${target?.name || ''}`);
  }, [selectedObjectId, objects, showSaveBanner]);

  const handleUpdateObject = useCallback((objectId, updates) => {
    setObjects(prev => prev.map(o => o.id === objectId ? { ...o, ...updates } : o));
  }, []);

  const handleToggleTeam = useCallback(() => {
    if (!selectedObject) return;
    const nextTeam = selectedObject.team === 'radiant' ? 'dire' : selectedObject.team === 'dire' ? 'neutral' : 'radiant';
    handleUpdateObject(selectedObject.id, { team: nextTeam });
  }, [selectedObject, handleUpdateObject]);

  // -------------------------------------------------------------
  // 6. KEYBOARD SHORTCUTS (Ctrl+D, Delete, Esc, Space)
  // -------------------------------------------------------------
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

      // Duplicate: Ctrl + D
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'd') {
        e.preventDefault();
        handleDuplicate();
        return;
      }

      // Delete: Delete or Backspace
      if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault();
        handleDelete();
        return;
      }

      // Deselect: Escape
      if (e.key === 'Escape') {
        e.preventDefault();
        setSelectedObjectId(null);
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
  }, [handleDuplicate, handleDelete]);

  // -------------------------------------------------------------
  // 7. PRE-RENDER STATIC TERRAIN TO OFFSCREEN CANVAS (60 FPS)
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
        if (showGrid) {
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
    if (showLabels) {
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
  }, [mapGrid, showGrid, showLabels, CELL_PX, MAP_TOTAL_PX]);

  // -------------------------------------------------------------
  // 8. MOUSE EVENT HANDLERS (SEPARATE CLICK VS DRAG THRESHOLD)
  // -------------------------------------------------------------
  const handleMouseDown = (e) => {
    // If Right Click (button 2)
    if (e.button === 2) {
      e.preventDefault();
      const gridPos = viewportToGrid(e.clientX, e.clientY);
      if (gridPos) {
        // Find object under cursor
        const obj = objects.find(o => Math.abs(o.x - gridPos.x) <= 1 && Math.abs(o.y - gridPos.y) <= 1);
        if (obj) {
          setSelectedObjectId(obj.id);
          setContextMenu({ x: e.clientX, y: e.clientY, object: obj });
          return;
        }
      }
      setContextMenu(null);
      return;
    }

    // Left Click (button 0) or Middle Click (button 1)
    if (e.button === 1 || isSpacePressed) {
      // Pan camera immediately
      isPanningRef.current = true;
      panStartRef.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
      return;
    }

    if (e.button === 0) {
      setContextMenu(null);
      const gridPos = viewportToGrid(e.clientX, e.clientY);

      if (gridPos) {
        // Check if clicked an existing object
        const clickedObj = objects.find(o => {
          const radius = o.type === 'hero' ? 1.5 : 1.2;
          const dist = Math.hypot(o.x - gridPos.x, o.y - gridPos.y);
          return dist <= radius;
        });

        if (clickedObj) {
          // Record candidate for drag (threshold check)
          dragCandidateRef.current = {
            objectId: clickedObj.id,
            startClientX: e.clientX,
            startClientY: e.clientY,
            originGridX: clickedObj.x,
            originGridY: clickedObj.y
          };
          return;
        }
      }

      // If clicked empty map space, allow panning camera with left mouse!
      isPanningRef.current = true;
      panStartRef.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
    }
  };

  const handleMouseMove = (e) => {
    // 1. Camera Panning
    if (isPanningRef.current) {
      setPan({
        x: e.clientX - panStartRef.current.x,
        y: e.clientY - panStartRef.current.y
      });
      return;
    }

    const gridPos = viewportToGrid(e.clientX, e.clientY);
    setHoveredCell(gridPos);

    // 2. Check threshold for Drag Candidate (4-6px threshold)
    if (dragCandidateRef.current && !dragState) {
      const dist = Math.hypot(
        e.clientX - dragCandidateRef.current.startClientX,
        e.clientY - dragCandidateRef.current.startClientY
      );

      if (dist >= 5) {
        // Exceeded threshold: START DRAG!
        setSelectedObjectId(dragCandidateRef.current.objectId);
        setDragState({
          isDragging: true,
          objectId: dragCandidateRef.current.objectId,
          currentGridX: gridPos ? gridPos.x : dragCandidateRef.current.originGridX,
          currentGridY: gridPos ? gridPos.y : dragCandidateRef.current.originGridY
        });
      }
      return;
    }

    // 3. Update Drag State
    if (dragState && gridPos) {
      setDragState(prev => ({
        ...prev,
        currentGridX: gridPos.x,
        currentGridY: gridPos.y
      }));
      return;
    }

    // 4. Hover detection when not dragging
    if (gridPos) {
      const obj = objects.find(o => Math.abs(o.x - gridPos.x) <= 1 && Math.abs(o.y - gridPos.y) <= 1);
      setHoveredObject(obj || null);
    } else {
      setHoveredObject(null);
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
      const targetX = dragState.currentGridX;
      const targetY = dragState.currentGridY;

      // Update object's permanent position (Snaps to grid cell center!)
      setObjects(prev => prev.map(o => {
        if (o.id === dragState.objectId) {
          return { ...o, x: targetX, y: targetY };
        }
        return o;
      }));

      playClickSound();
      showSaveBanner(`📍 Объекту задана клетка [${targetX}, ${targetY}]`);
      setDragState(null);
      dragCandidateRef.current = null;
      return;
    }

    // If was only clicked without dragging (regular SELECT action)
    if (dragCandidateRef.current) {
      setSelectedObjectId(dragCandidateRef.current.objectId);
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
    const newZoom = Math.max(0.25, Math.min(3.5, zoom * zoomFactor));

    const newPanX = mouseX - (mouseX - pan.x) * (newZoom / zoom);
    const newPanY = mouseY - (mouseY - pan.y) * (newZoom / zoom);

    setZoom(newZoom);
    setPan({ x: Math.round(newPanX), y: Math.round(newPanY) });
  };

  // HTML5 Drag & Drop from Object Library to Canvas
  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
    const gridPos = viewportToGrid(e.clientX, e.clientY);
    if (gridPos) setHoveredCell(gridPos);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const gridPos = viewportToGrid(e.clientX, e.clientY);
    const tpl = libraryDragTemplateRef.current;

    if (gridPos && tpl) {
      handleAddObjectAt(tpl, gridPos.x, gridPos.y);
    }
    libraryDragTemplateRef.current = null;
  };

  // ===========================================================================
  // 9. MAIN CANVAS RENDERING LOOP (Blits Cached Terrain + Draws Dynamic Objects)
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
    ctx.translate(pan.x, pan.y);
    ctx.scale(zoom, zoom);

    // 1. Blit static offscreen terrain
    if (terrainCanvasRef.current) {
      ctx.drawImage(terrainCanvasRef.current, 0, 0);
    }

    // 2. Highlight selected object's cell
    if (selectedObject) {
      const sx = selectedObject.x * CELL_PX;
      const sy = selectedObject.y * CELL_PX;
      ctx.fillStyle = 'rgba(250, 204, 21, 0.25)';
      ctx.strokeStyle = '#facc15';
      ctx.lineWidth = 1.5;
      ctx.fillRect(sx, sy, CELL_PX, CELL_PX);
      ctx.strokeRect(sx, sy, CELL_PX, CELL_PX);
    }

    // 3. Highlight Drag Destination Cell
    if (dragState && dragState.isDragging) {
      const dx = dragState.currentGridX * CELL_PX;
      const dy = dragState.currentGridY * CELL_PX;
      ctx.fillStyle = 'rgba(56, 189, 248, 0.35)';
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2.5;
      ctx.fillRect(dx, dy, CELL_PX, CELL_PX);
      ctx.strokeRect(dx, dy, CELL_PX, CELL_PX);

      // Trajectory dashed line from original position to current drag position
      const draggedObj = objects.find(o => o.id === dragState.objectId);
      if (draggedObj) {
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 2;
        ctx.setLineDash([6, 4]);
        ctx.beginPath();
        ctx.moveTo((draggedObj.x + 0.5) * CELL_PX, (draggedObj.y + 0.5) * CELL_PX);
        ctx.lineTo((dragState.currentGridX + 0.5) * CELL_PX, (dragState.currentGridY + 0.5) * CELL_PX);
        ctx.stroke();
        ctx.setLineDash([]);
      }
    }

    // 4. Draw Towers Attack Range (if enabled)
    if (showRanges) {
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
      const isBeingDragged = dragState?.isDragging && dragState?.objectId === obj.id;
      // If being dragged, draw at the target cell preview
      const ox = ((isBeingDragged ? dragState.currentGridX : obj.x) + 0.5) * CELL_PX;
      const oy = ((isBeingDragged ? dragState.currentGridY : obj.y) + 0.5) * CELL_PX;

      const isSelected = selectedObjectId === obj.id;
      const isHovered = hoveredObject?.id === obj.id;
      const isRadiant = obj.team === 'radiant';
      const isDire = obj.team === 'dire';

      const isHero = obj.type === OBJECT_TYPES.HERO;
      const isTower = obj.type === OBJECT_TYPES.TOWER;
      const tokenRadius = isHero ? 1.5 * CELL_PX : isTower ? 1.4 * CELL_PX : 1.1 * CELL_PX;

      ctx.save();
      if (isBeingDragged) {
        ctx.globalAlpha = 0.85;
      }

      // Pulsing Selection Ring
      if (isSelected) {
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(ox, oy, tokenRadius + 5, 0, Math.PI * 2);
        ctx.stroke();

        // Arrow indicator above
        ctx.fillStyle = '#f59e0b';
        ctx.beginPath();
        ctx.moveTo(ox, oy - tokenRadius - 6);
        ctx.lineTo(ox - 6, oy - tokenRadius - 14);
        ctx.lineTo(ox + 6, oy - tokenRadius - 14);
        ctx.closePath();
        ctx.fill();
      } else if (isHovered) {
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(ox, oy, tokenRadius + 3, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Base Circle Token
      ctx.fillStyle = isRadiant ? '#064e3b' : isDire ? '#7f1d1d' : '#1c2436';
      ctx.strokeStyle = isSelected 
        ? '#fbbf24' 
        : isRadiant 
        ? '#10b981' 
        : isDire 
        ? '#ef4444' 
        : '#f59e0b';
      ctx.lineWidth = isSelected ? 3.5 : 2.5;
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
      ctx.font = "bold 10px 'Cinzel', sans-serif";
      ctx.fillStyle = isSelected ? '#fde047' : '#ffffff';
      ctx.shadowColor = '#000000';
      ctx.shadowBlur = 5;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillText(obj.name, ox, oy + tokenRadius + 3);

      ctx.restore();
    });

    ctx.restore();
  }, [
    pan, zoom, objects, selectedObjectId, selectedObject, 
    dragState, hoveredObject, showGrid, showRanges
  ]);

  // Counts for Top Bar
  const radiantCount = objects.filter(o => o.team === 'radiant').length;
  const direCount = objects.filter(o => o.team === 'dire').length;
  const neutralCount = objects.filter(o => o.team === 'neutral').length;

  return (
    <div 
      ref={containerRef}
      className={`relative w-screen h-screen overflow-hidden select-none bg-[#07090e] font-sans ${
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
        objectsCount={objects.length}
        radiantCount={radiantCount}
        direCount={direCount}
        neutralCount={neutralCount}
        zoom={zoom}
        onZoomIn={() => setZoom(z => Math.min(3.5, z * 1.2))}
        onZoomOut={() => setZoom(z => Math.max(0.25, z * 0.83))}
        onFitMap={fitMapToScreen}
        showGrid={showGrid}
        onToggleGrid={() => setShowGrid(!showGrid)}
        showRanges={showRanges}
        onToggleRanges={() => setShowRanges(!showRanges)}
        showLabels={showLabels}
        onToggleLabels={() => setShowLabels(!showLabels)}
        onSave={() => saveMapToStorage()}
        onReset={resetMapToDefault}
        saveNotice={saveNotice}
      />

      {/* 2. MAIN CANVAS */}
      <canvas ref={canvasRef} className="absolute inset-0" />

      {/* 3. LEFT OBJECT LIBRARY PANEL */}
      <EditorLeftLibrary
        isOpen={isLibraryOpen}
        onToggleOpen={() => setIsLibraryOpen(!isLibraryOpen)}
        onAddObjectToCenter={handleAddObjectToCenter}
        onStartLibraryDrag={(tpl) => {
          libraryDragTemplateRef.current = tpl;
        }}
      />

      {/* 4. RIGHT INSPECTOR PANEL */}
      <EditorRightInspector
        isOpen={isInspectorOpen}
        onToggleOpen={() => setIsInspectorOpen(!isInspectorOpen)}
        selectedObject={selectedObject}
        onUpdateObject={handleUpdateObject}
        onDuplicate={handleDuplicate}
        onDelete={handleDelete}
        onCenterCamera={centerOnCell}
      />

      {/* 5. BOTTOM HUD CONSOLE WITH MINIMAP */}
      <EditorBottomHUD
        objects={objects}
        selectedObject={selectedObject}
        onCenterOnCell={centerOnCell}
        onDuplicate={handleDuplicate}
        onDelete={handleDelete}
        onFitMap={fitMapToScreen}
        totalObjectsCount={objects.length}
      />

      {/* 6. CONTEXT MENU (RMB) */}
      {contextMenu && (
        <EditorContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          object={contextMenu.object}
          onClose={() => setContextMenu(null)}
          onDuplicate={handleDuplicate}
          onDelete={handleDelete}
          onToggleTeam={handleToggleTeam}
          onCenterCamera={centerOnCell}
        />
      )}
    </div>
  );
}
