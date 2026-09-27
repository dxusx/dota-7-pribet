// Dedicated Editor Mode Reducer and State Engine (Independent from Gameplay Mode)

import { 
  getInitialEditorObjects, createInstanceFromTemplate, 
  OBJECT_TYPES, OBJECT_TEAMS 
} from '../data/editorTemplates.js';
import { generatePixelDotaMap, TILE_TYPES, GRID_SIZE } from '../data/dotaPixelGrid.js';

export const LOCAL_STORAGE_EDITOR_KEY = 'dota_battle_map_editor_state_v2';

// Check if a cell is valid for placement/movement
export function validateCell(targetX, targetY, currentObjects, excludeId = null, mapGrid = null) {
  // 1. Bounds check
  if (targetX < 0 || targetX >= GRID_SIZE || targetY < 0 || targetY >= GRID_SIZE) {
    return { isValid: false, reason: 'Клетка вне границ карты' };
  }

  // 2. Terrain check (unpassable rocks/dense trees)
  if (mapGrid) {
    const tile = mapGrid[targetY * GRID_SIZE + targetX];
    if (tile === TILE_TYPES.UNPASSABLE) {
      return { isValid: false, reason: 'Непроходимый террейн (скалы/деревья)' };
    }
  }

  // 3. Collision check (another object already on cell)
  const occupier = currentObjects.find(
    o => o.x === targetX && o.y === targetY && o.id !== excludeId
  );
  if (occupier) {
    return { isValid: false, reason: `Клетка занята: ${occupier.name}` };
  }

  return { isValid: true, reason: null };
}

// Find nearest adjacent free cell for duplication
export function findNearestFreeCell(originX, originY, currentObjects, mapGrid = null) {
  const offsets = [
    { dx: 1, dy: 0 },
    { dx: 0, dy: 1 },
    { dx: -1, dy: 0 },
    { dx: 0, dy: -1 },
    { dx: 1, dy: 1 },
    { dx: -1, dy: 1 },
    { dx: 1, dy: -1 },
    { dx: -1, dy: -1 },
    { dx: 2, dy: 0 },
    { dx: 0, dy: 2 },
    { dx: -2, dy: 0 },
    { dx: 0, dy: -2 }
  ];

  for (const { dx, dy } of offsets) {
    const tx = originX + dx;
    const ty = originY + dy;
    const check = validateCell(tx, ty, currentObjects, null, mapGrid);
    if (check.isValid) {
      return { x: tx, y: ty };
    }
  }

  return { x: Math.min(GRID_SIZE - 1, originX + 1), y: originY };
}

// Create initial editor state (loads from localStorage if present)
export function createInitialEditorState() {
  const mapGrid = generatePixelDotaMap();
  let objects = null;
  let camera = { x: 0, y: 0, zoom: 1 };

  try {
    const saved = localStorage.getItem(LOCAL_STORAGE_EDITOR_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed.objects) && parsed.objects.length > 0) {
        objects = parsed.objects;
      }
      if (parsed.camera) {
        camera = parsed.camera;
      }
    }
  } catch (err) {
    console.warn('Failed to parse localStorage editor state:', err);
  }

  if (!objects) {
    objects = getInitialEditorObjects();
  }

  const defaultSelected = objects.find(o => o.templateId === 'axe') || objects[0] || null;

  return {
    objects,
    selectedObjectId: defaultSelected ? defaultSelected.id : null,
    hoveredObjectId: null,
    hoveredCell: null,
    dragState: null,
    camera,
    mapGrid,
    settings: {
      showGrid: true,
      showRanges: true,
      showLabels: true
    },
    notification: null
  };
}

// Master Editor Reducer
export function editorReducer(state, action) {
  switch (action.type) {

    // -------------------------------------------------------------
    // 1. SELECTION
    // -------------------------------------------------------------
    case 'SELECT_OBJECT': {
      return {
        ...state,
        selectedObjectId: action.objectId,
        dragState: null
      };
    }

    case 'DESELECT_OBJECT': {
      return {
        ...state,
        selectedObjectId: null,
        dragState: null
      };
    }

    case 'SET_HOVERED_OBJECT': {
      return {
        ...state,
        hoveredObjectId: action.objectId
      };
    }

    case 'SET_HOVERED_CELL': {
      return {
        ...state,
        hoveredCell: action.cell
      };
    }

    // -------------------------------------------------------------
    // 2. DRAG & DROP PIPELINE (GRID SNAP & VALIDATION)
    // -------------------------------------------------------------
    case 'START_DRAG': {
      const { objectId, source, template, originX, originY, startX, startY } = action;
      const targetX = startX ?? originX ?? 0;
      const targetY = startY ?? originY ?? 0;
      const check = validateCell(targetX, targetY, state.objects, objectId, state.mapGrid);

      return {
        ...state,
        selectedObjectId: objectId || state.selectedObjectId,
        dragState: {
          isDragging: true,
          source: source || 'MAP', // 'MAP' | 'LIBRARY'
          objectId: objectId || null,
          template: template || null,
          originX: originX ?? targetX,
          originY: originY ?? targetY,
          targetX,
          targetY,
          isValid: check.isValid,
          reason: check.reason
        }
      };
    }

    case 'MOVE_DRAG': {
      if (!state.dragState || !state.dragState.isDragging) return state;

      const { targetX, targetY } = action;
      const check = validateCell(
        targetX, 
        targetY, 
        state.objects, 
        state.dragState.objectId, 
        state.mapGrid
      );

      return {
        ...state,
        dragState: {
          ...state.dragState,
          targetX,
          targetY,
          isValid: check.isValid,
          reason: check.reason
        }
      };
    }

    case 'DROP_OBJECT': {
      if (!state.dragState || !state.dragState.isDragging) return state;

      const { source, objectId, template, originX, originY, targetX, targetY, isValid, reason } = state.dragState;

      // If invalid drop cell, revert or cancel
      if (!isValid) {
        return {
          ...state,
          dragState: null,
          notification: `⛔ ${reason || 'Нельзя переместить объект на эту клетку'}`
        };
      }

      // Case A: Dropped existing object from map -> Move it
      if (source === 'MAP' && objectId) {
        const updatedObjects = state.objects.map(o => {
          if (o.id === objectId) {
            return { ...o, x: targetX, y: targetY };
          }
          return o;
        });

        return {
          ...state,
          objects: updatedObjects,
          selectedObjectId: objectId,
          dragState: null,
          notification: `📍 Позиция обновлена: [X: ${targetX}, Y: ${targetY}]`
        };
      }

      // Case B: Dropped new template from Library -> Spawn it
      if (source === 'LIBRARY' && template) {
        const newInstance = createInstanceFromTemplate(template, targetX, targetY);
        return {
          ...state,
          objects: [...state.objects, newInstance],
          selectedObjectId: newInstance.id,
          dragState: null,
          notification: `✨ Создан объект: ${newInstance.name} [X: ${targetX}, Y: ${targetY}]`
        };
      }

      return { ...state, dragState: null };
    }

    case 'CANCEL_DRAG': {
      return {
        ...state,
        dragState: null
      };
    }

    // -------------------------------------------------------------
    // 3. OBJECT CRUD (ADD, DELETE, DUPLICATE, UPDATE)
    // -------------------------------------------------------------
    case 'ADD_OBJECT': {
      const { template, targetX, targetY } = action;
      const x = Math.max(0, Math.min(GRID_SIZE - 1, targetX));
      const y = Math.max(0, Math.min(GRID_SIZE - 1, targetY));

      const check = validateCell(x, y, state.objects, null, state.mapGrid);
      const freeCell = check.isValid ? { x, y } : findNearestFreeCell(x, y, state.objects, state.mapGrid);

      const newInstance = createInstanceFromTemplate(template, freeCell.x, freeCell.y);

      return {
        ...state,
        objects: [...state.objects, newInstance],
        selectedObjectId: newInstance.id,
        notification: `✨ Добавлен объект: ${newInstance.name} [X: ${freeCell.x}, Y: ${freeCell.y}]`
      };
    }

    case 'DELETE_OBJECT': {
      const idToDelete = action.objectId || state.selectedObjectId;
      if (!idToDelete) return state;

      const target = state.objects.find(o => o.id === idToDelete);
      const updatedObjects = state.objects.filter(o => o.id !== idToDelete);

      return {
        ...state,
        objects: updatedObjects,
        selectedObjectId: state.selectedObjectId === idToDelete ? null : state.selectedObjectId,
        notification: `🗑️ Удален: ${target?.name || 'объект'}`
      };
    }

    case 'DUPLICATE_OBJECT': {
      const idToDup = action.objectId || state.selectedObjectId;
      if (!idToDup) return state;

      const sourceObj = state.objects.find(o => o.id === idToDup);
      if (!sourceObj) return state;

      const freeCell = findNearestFreeCell(sourceObj.x, sourceObj.y, state.objects, state.mapGrid);

      const newInstance = {
        ...sourceObj,
        id: `${sourceObj.type}_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
        name: `${sourceObj.name} #2`,
        x: freeCell.x,
        y: freeCell.y
      };

      return {
        ...state,
        objects: [...state.objects, newInstance],
        selectedObjectId: newInstance.id,
        notification: `📋 Дублирован: ${newInstance.name} [X: ${freeCell.x}, Y: ${freeCell.y}]`
      };
    }

    case 'UPDATE_OBJECT': {
      const { objectId, updates } = action;
      const updatedObjects = state.objects.map(o => {
        if (o.id === objectId) {
          return { ...o, ...updates };
        }
        return o;
      });

      return {
        ...state,
        objects: updatedObjects
      };
    }

    // -------------------------------------------------------------
    // 4. CAMERA & SETTINGS
    // -------------------------------------------------------------
    case 'SET_CAMERA': {
      return {
        ...state,
        camera: {
          ...state.camera,
          x: action.x ?? state.camera.x,
          y: action.y ?? state.camera.y,
          zoom: action.zoom ?? state.camera.zoom
        }
      };
    }

    case 'SET_SETTINGS': {
      return {
        ...state,
        settings: {
          ...state.settings,
          ...action.settings
        }
      };
    }

    case 'SET_NOTIFICATION': {
      return {
        ...state,
        notification: action.message
      };
    }

    case 'RESET_MAP': {
      const defaults = getInitialEditorObjects();
      const defaultAxe = defaults.find(o => o.templateId === 'axe') || defaults[0];

      return {
        ...state,
        objects: defaults,
        selectedObjectId: defaultAxe ? defaultAxe.id : null,
        dragState: null,
        notification: '🔄 Карта сброшена к исходной расстановке'
      };
    }

    case 'LOAD_SAVED_MAP': {
      if (!action.payload) return state;
      return {
        ...state,
        objects: action.payload.objects || state.objects,
        camera: action.payload.camera || state.camera,
        selectedObjectId: action.payload.objects?.[0]?.id || null,
        dragState: null,
        notification: '💾 Карта загружена из памяти'
      };
    }

    default:
      return state;
  }
}
