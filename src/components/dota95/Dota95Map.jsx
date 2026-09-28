import React, { useState, useEffect, useReducer, useMemo, useCallback } from 'react';
import TacticalHUD from './TacticalHUD';
import TacticalArena from './TacticalArena';
import { gameReducer, createInitialGameState } from '../../game/gameState';
import { getReachableCells } from '../../game/pathfinding';
import { playDiceSound, playCritSound } from '../../utils/sound';

export default function Dota95Map({ onSwitchMode }) {
  // Central Tactical Game State Engine
  const [gameState, dispatch] = useReducer(gameReducer, undefined, createInitialGameState);

  const {
    heroes,
    activeHeroId,
    turnActions,
    targetingMode,
    latestDiceRoll,
    towers,
    roshan,
    mapGrid,
    notification: stateNotification
  } = gameState;

  // Active Action Mode: 'NONE' | 'MOVE' | 'ATTACK' | 'ABILITY' | 'ITEM'
  const [actionMode, setActionMode] = useState('NONE');

  // Active Hero (Whose turn it currently is)
  const activeHero = heroes.find(h => h.id === activeHeroId) || heroes[0];

  // Hover & Local Notifications
  const [notification, setNotification] = useState(null);

  // Focus target for arena centering (e.g. when clicking hero in timeline)
  const [focusTarget, setFocusTarget] = useState(null);

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
  const centerOnCell = useCallback((targetR, targetC) => {
    setFocusTarget({ r: targetR, c: targetC, timestamp: Date.now() });
  }, []);

  return (
    <div className="relative w-screen h-screen overflow-hidden select-none bg-[#07090e] font-sans flex flex-col justify-between">
      
      {/* 1. TOP NOTIFICATION BANNER (IF ACTIVE) */}
      {notification && (
        <div className="fixed top-18 sm:top-20 left-1/2 -translate-x-1/2 z-50 bg-amber-500 text-black font-mono text-xs font-black px-6 py-2 rounded-full shadow-2xl animate-bounce pointer-events-none border border-black/20">
          {notification}
        </div>
      )}

      {/* 2. D20 DICE ROLL BANNER (CRIT / HIT / MISS) */}
      {latestDiceRoll && (
        <div className="fixed top-28 left-1/2 -translate-x-1/2 z-40 bg-[#121620]/95 backdrop-blur-md border-2 border-amber-500/80 px-5 py-2 rounded-2xl shadow-2xl flex items-center gap-3 animate-in fade-in zoom-in-95 pointer-events-auto">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-mono font-black text-base shadow-inner ${
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

      {/* 3. TARGETING MODE ACTIVE BANNER */}
      {targetingMode && (
        <div className="fixed bottom-52 sm:bottom-44 left-1/2 -translate-x-1/2 z-40 bg-rose-950/95 border-2 border-rose-500 text-white px-4 py-2 rounded-xl shadow-2xl flex items-center gap-2.5 pointer-events-auto backdrop-blur-md animate-pulse">
          <span className="text-base">🎯</span>
          <span className="font-mono text-xs font-bold truncate max-w-[240px] sm:max-w-none">
            ПРИЦЕЛИВАНИЕ: {targetingMode.mode === 'ATTACK' ? 'АТАКА' : targetingMode.ability?.name || targetingMode.itemId} ({targetingMode.range || 2} кл)
          </span>
          <button 
            onClick={() => {
              dispatch({ type: 'CANCEL_TARGETING' });
              setActionMode('NONE');
            }}
            className="px-2 py-0.5 bg-rose-800 hover:bg-rose-700 rounded text-[10px] font-mono font-black uppercase cursor-pointer"
          >
            Отмена
          </button>
        </div>
      )}

      {/* 4. CENTER LAYER: STRICTLY CENTERED FOCUSED TACTICAL ARENA */}
      <main className="flex-1 w-full flex items-center justify-center pt-16 sm:pt-20 pb-36 sm:pb-28 overflow-hidden px-2">
        <TacticalArena
          gameState={gameState}
          dispatch={dispatch}
          actionMode={actionMode}
          setActionMode={setActionMode}
          reachableCells={reachableCells}
          onNotify={notify}
          focusTarget={focusTarget}
        />
      </main>

      {/* 5. 3-LAYER TACTICAL HUD (TIMELINE BAR, COMBAT TOAST, COMMAND DECK) */}
      <TacticalHUD
        gameState={gameState}
        dispatch={dispatch}
        actionMode={actionMode}
        setActionMode={setActionMode}
        onCenterOnCell={centerOnCell}
        onNotify={notify}
        onSwitchMode={onSwitchMode}
      />
    </div>
  );
}
