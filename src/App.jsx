import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { 
  Footprints, Swords, Sparkles, ShoppingBag, 
  ArrowRight, RotateCcw, Shield, Heart, Zap, History, X 
} from 'lucide-react';

// =============================================================================
// 1. GAME CONSTANTS & INITIAL DATA
// =============================================================================
const GRID_SIZE = 9; // 9x9 tactical battlefield

// Initial 10 Heroes (5 Radiant vs 5 Dire)
const INITIAL_HEROES = [
  // Radiant Team
  {
    id: 'gojo',
    name: 'Gojo',
    team: 'radiant',
    avatar: '👁️',
    r: 7,
    c: 2,
    hp: 120,
    maxHp: 120,
    mana: 100,
    maxMana: 100,
    speed: 3,
    range: 2,
    damage: 40,
    armor: 4,
    skill: { name: 'Lapse: Blue', cost: 35, damage: 45, range: 4, desc: 'Притягивает и наносит 45 урона' }
  },
  {
    id: 'pudge',
    name: 'Pudge',
    team: 'radiant',
    avatar: '🪝',
    r: 7,
    c: 4,
    hp: 140,
    maxHp: 140,
    mana: 80,
    maxMana: 80,
    speed: 2,
    range: 1,
    damage: 35,
    armor: 3,
    skill: { name: 'Meat Hook', cost: 40, damage: 50, range: 4, desc: 'Крюк: 50 чистого урона цели' }
  },
  {
    id: 'invoker',
    name: 'Invoker',
    team: 'radiant',
    avatar: '⚡',
    r: 8,
    c: 3,
    hp: 95,
    maxHp: 95,
    mana: 150,
    maxMana: 150,
    speed: 3,
    range: 3,
    damage: 32,
    armor: 2,
    skill: { name: 'Cold Snap (QQQ)', cost: 45, damage: 40, range: 4, desc: 'Заморозка и 40 маг. урона' }
  },
  {
    id: 'axe',
    name: 'Axe',
    team: 'radiant',
    avatar: '🪓',
    r: 6,
    c: 3,
    hp: 150,
    maxHp: 150,
    mana: 75,
    maxMana: 75,
    speed: 2,
    range: 1,
    damage: 42,
    armor: 6,
    skill: { name: "Berserker's Call", cost: 30, damage: 35, range: 2, desc: 'Провокация и вихрь топоров' }
  },
  {
    id: 'rubick',
    name: 'Rubick',
    team: 'radiant',
    avatar: '🔮',
    r: 8,
    c: 5,
    hp: 90,
    maxHp: 90,
    mana: 130,
    maxMana: 130,
    speed: 3,
    range: 3,
    damage: 30,
    armor: 2,
    skill: { name: 'Fade Bolt', cost: 40, damage: 38, range: 3, desc: 'Цепная молния, снижающая урон' }
  },

  // Dire Team
  {
    id: 'sukuna',
    name: 'Sukuna',
    team: 'dire',
    avatar: '👹',
    r: 1,
    c: 6,
    hp: 130,
    maxHp: 130,
    mana: 110,
    maxMana: 110,
    speed: 3,
    range: 2,
    damage: 46,
    armor: 4,
    skill: { name: 'Dismantle', cost: 40, damage: 55, range: 3, desc: 'Невидимый разрез: 55 урона' }
  },
  {
    id: 'wesker',
    name: 'Wesker',
    team: 'dire',
    avatar: '🕶️',
    r: 2,
    c: 5,
    hp: 115,
    maxHp: 115,
    mana: 90,
    maxMana: 90,
    speed: 4,
    range: 2,
    damage: 38,
    armor: 3,
    skill: { name: 'Uroboros', cost: 35, damage: 42, range: 3, desc: 'Щупальца Уробороса: 42 урона' }
  },
  {
    id: 'minos',
    name: 'Minos',
    team: 'dire',
    avatar: '👑',
    r: 1,
    c: 4,
    hp: 125,
    maxHp: 125,
    mana: 120,
    maxMana: 120,
    speed: 3,
    range: 1,
    damage: 50,
    armor: 5,
    skill: { name: 'JUDGEMENT!', cost: 50, damage: 65, range: 3, desc: 'Сокрушительный дроп-кик с небес' }
  },
  {
    id: 'monesy',
    name: 'm0NESY',
    team: 'dire',
    avatar: '🎯',
    r: 0,
    c: 5,
    hp: 95,
    maxHp: 95,
    mana: 90,
    maxMana: 90,
    speed: 3,
    range: 4,
    damage: 52,
    armor: 2,
    skill: { name: 'One Way', cost: 45, damage: 60, range: 5, desc: 'Ван-вей прострел: 60 крит. урона' }
  },
  {
    id: 'sf',
    name: 'SF',
    team: 'dire',
    avatar: '💀',
    r: 0,
    c: 3,
    hp: 95,
    maxHp: 95,
    mana: 120,
    maxMana: 120,
    speed: 3,
    range: 3,
    damage: 40,
    armor: 3,
    skill: { name: 'Shadowraze', cost: 35, damage: 48, range: 3, desc: 'Темный взрыв: 48 урона' }
  }
];

// Tactical Shop Items
const SHOP_ITEMS = [
  { id: 'blink', name: 'Blink Dagger', icon: '🗡️', cost: 2250, desc: 'Мгновенный телепорт в любую клетку на 4 шага' },
  { id: 'bkb', name: 'Black King Bar', icon: '🛡️', cost: 4050, desc: 'Дает +10 брони и восстанавливает 30 HP' },
  { id: 'rapier', name: 'Divine Rapier', icon: '⚡', cost: 5600, desc: 'Дарует +40 к физическому урону' },
  { id: 'satanic', name: 'Satanic', icon: '🩸', cost: 5050, desc: 'Мгновенно восстанавливает 60 HP' }
];

// Chebyshev Distance
function getDist(r1, c1, r2, c2) {
  return Math.max(Math.abs(r1 - r2), Math.abs(c1 - c2));
}

export default function App() {
  // Game State
  const [heroes, setHeroes] = useState(INITIAL_HEROES);
  const [turnIndex, setTurnIndex] = useState(0);
  const [round, setRound] = useState(1);
  const [movesLeft, setMovesLeft] = useState(3);
  const [hasAttacked, setHasAttacked] = useState(false);
  const [actionMode, setActionMode] = useState('NONE'); // 'NONE' | 'MOVE' | 'ATTACK' | 'SKILL' | 'BLINK'

  // Drawers
  const [showSkillDrawer, setShowSkillDrawer] = useState(false);
  const [showShopModal, setShowShopModal] = useState(false);

  // Floating messages
  const [toast, setToast] = useState('⚔️ Битва началась! Первый ход за Radiant.');
  const [damageFloats, setDamageFloats] = useState([]);

  // Active Hero
  const livingHeroes = useMemo(() => heroes.filter(h => h.hp > 0), [heroes]);
  const activeHero = livingHeroes[turnIndex % livingHeroes.length] || heroes[0];

  // Reset turn-specific values when active hero changes
  useEffect(() => {
    if (activeHero) {
      setMovesLeft(activeHero.speed || 3);
      setHasAttacked(false);
      setActionMode('NONE');
      setShowSkillDrawer(false);
      setShowShopModal(false);
    }
  }, [activeHero?.id, round]);

  const notify = (msg) => {
    setToast(msg);
  };

  const spawnFloat = (r, c, text, color = 'text-rose-400') => {
    const id = `${Date.now()}_${Math.random()}`;
    setDamageFloats(prev => [...prev, { id, r, c, text, color }]);
    setTimeout(() => {
      setDamageFloats(prev => prev.filter(f => f.id !== id));
    }, 1200);
  };

  // Terrain generation: River on row 4, Rocks on flanks
  const getTileType = (r, c) => {
    if (r === 4 && c !== 4) return 'WATER'; // River with a middle bridge at (4,4)
    if ((r === 2 && c === 2) || (r === 2 && c === 6) || (r === 6 && c === 2) || (r === 6 && c === 6)) {
      return 'ROCK';
    }
    return 'GROUND';
  };

  // Compute Reachable Move Cells (Chebyshev distance within movesLeft, not blocked by obstacles/heroes)
  const reachableMoveCells = useMemo(() => {
    if (actionMode !== 'MOVE' || movesLeft <= 0 || !activeHero) return new Set();
    const set = new Set();
    const occupied = new Set(heroes.filter(h => h.hp > 0).map(h => `${h.r},${h.c}`));

    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE; c++) {
        const key = `${r},${c}`;
        if (occupied.has(key)) continue;
        if (getTileType(r, c) === 'ROCK') continue;
        if (getDist(activeHero.r, activeHero.c, r, c) <= movesLeft) {
          set.add(key);
        }
      }
    }
    return set;
  }, [actionMode, movesLeft, activeHero, heroes]);

  // Compute Reachable Attack Cells
  const reachableAttackCells = useMemo(() => {
    if (actionMode !== 'ATTACK' || !activeHero || hasAttacked) return new Set();
    const set = new Set();
    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE; c++) {
        if (getDist(activeHero.r, activeHero.c, r, c) <= activeHero.range) {
          set.add(`${r},${c}`);
        }
      }
    }
    return set;
  }, [actionMode, activeHero, hasAttacked]);

  // Compute Skill Cells
  const reachableSkillCells = useMemo(() => {
    if (actionMode !== 'SKILL' || !activeHero) return new Set();
    const set = new Set();
    const range = activeHero.skill?.range || 3;
    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE; c++) {
        if (getDist(activeHero.r, activeHero.c, r, c) <= range) {
          set.add(`${r},${c}`);
        }
      }
    }
    return set;
  }, [actionMode, activeHero]);

  // Compute Blink Cells
  const reachableBlinkCells = useMemo(() => {
    if (actionMode !== 'BLINK' || !activeHero) return new Set();
    const set = new Set();
    const occupied = new Set(heroes.filter(h => h.hp > 0).map(h => `${h.r},${h.c}`));
    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE; c++) {
        const key = `${r},${c}`;
        if (occupied.has(key)) continue;
        if (getTileType(r, c) === 'ROCK') continue;
        if (getDist(activeHero.r, activeHero.c, r, c) <= 4) {
          set.add(key);
        }
      }
    }
    return set;
  }, [actionMode, activeHero, heroes]);

  // Handle Cell Click on the Battlefield
  const handleCellClick = (r, c) => {
    const key = `${r},${c}`;
    const targetHero = heroes.find(h => h.hp > 0 && h.r === r && h.c === c);

    // 1. MOVE ACTION
    if (actionMode === 'MOVE') {
      if (reachableMoveCells.has(key)) {
        const dist = getDist(activeHero.r, activeHero.c, r, c);
        setHeroes(prev => prev.map(h => h.id === activeHero.id ? { ...h, r, c } : h));
        setMovesLeft(prev => Math.max(0, prev - dist));
        setActionMode('NONE');
        spawnFloat(r, c, '💨 Шаг', 'text-sky-300');
        notify(`🏃 ${activeHero.name} переместился на [${r}, ${c}]`);
      } else {
        notify('⛔ Клетка недосягаема для перемещения');
      }
      return;
    }

    // 2. ATTACK ACTION
    if (actionMode === 'ATTACK') {
      if (!targetHero) {
        notify('⛔ Выберите вражеского героя в красной зоне!');
        return;
      }
      if (targetHero.team === activeHero.team) {
        notify('⛔ Нельзя атаковать союзника!');
        return;
      }
      if (reachableAttackCells.has(key)) {
        const isCrit = Math.random() < 0.2;
        const rawDmg = activeHero.damage + (isCrit ? Math.round(activeHero.damage * 0.8) : 0);
        const actualDmg = Math.max(10, rawDmg - (targetHero.armor || 0));

        setHeroes(prev => prev.map(h => {
          if (h.id === targetHero.id) {
            const nextHp = Math.max(0, h.hp - actualDmg);
            return { ...h, hp: nextHp };
          }
          return h;
        }));

        setHasAttacked(true);
        setActionMode('NONE');
        spawnFloat(r, c, isCrit ? `🔥 КРИТ -${actualDmg}!` : `⚔️ -${actualDmg}`, isCrit ? 'text-amber-400 font-black' : 'text-rose-400');
        notify(`⚔️ ${activeHero.name} нанес ${actualDmg} урона по ${targetHero.name}!`);
      } else {
        notify('⛔ Враг вне радиуса атаки!');
      }
      return;
    }

    // 3. SKILL ACTION
    if (actionMode === 'SKILL') {
      if (!targetHero) {
        notify('⛔ Выберите цель для способности!');
        return;
      }
      if (targetHero.team === activeHero.team) {
        notify('⛔ Способность применяется по врагу!');
        return;
      }
      if (reachableSkillCells.has(key)) {
        const skill = activeHero.skill;
        if (activeHero.mana < skill.cost) {
          notify('⛔ Недостаточно маны!');
          return;
        }

        setHeroes(prev => prev.map(h => {
          if (h.id === activeHero.id) {
            return { ...h, mana: h.mana - skill.cost };
          }
          if (h.id === targetHero.id) {
            return { ...h, hp: Math.max(0, h.hp - skill.damage) };
          }
          return h;
        }));

        setActionMode('NONE');
        spawnFloat(r, c, `🔮 -${skill.damage}`, 'text-purple-400 font-black');
        notify(`🔮 ${activeHero.name} применил «${skill.name}» по ${targetHero.name} (-${skill.damage} HP)!`);
      }
      return;
    }

    // 4. BLINK ACTION
    if (actionMode === 'BLINK') {
      if (reachableBlinkCells.has(key)) {
        setHeroes(prev => prev.map(h => h.id === activeHero.id ? { ...h, r, c } : h));
        setActionMode('NONE');
        spawnFloat(r, c, '🗡️ Blink!', 'text-amber-300 font-bold');
        notify(`🗡️ ${activeHero.name} совершил Blink на [${r}, ${c}]!`);
      }
      return;
    }

    // Default inspect
    if (targetHero) {
      notify(`Инфо: ${targetHero.name} (${targetHero.team === 'radiant' ? 'Radiant' : 'Dire'}) — HP: ${targetHero.hp}/${targetHero.maxHp}, Броня: ${targetHero.armor}`);
    }
  };

  // End Turn Handler
  const handleEndTurn = () => {
    const nextIdx = turnIndex + 1;
    setTurnIndex(nextIdx);
    if (nextIdx % livingHeroes.length === 0) {
      setRound(prev => prev + 1);
    }
    const nextHero = livingHeroes[nextIdx % livingHeroes.length];
    notify(`👉 Ход переходит к: ${nextHero?.name || 'бойцу'}`);
  };

  // Restart Battle
  const handleRestart = () => {
    setHeroes(INITIAL_HEROES);
    setTurnIndex(0);
    setRound(1);
    setActionMode('NONE');
    notify('🔄 Игра сброшена. Новый бой начался!');
  };

  // Use Shop Item
  const handleBuyItem = (item) => {
    setShowShopModal(false);
    if (item.id === 'blink') {
      setActionMode('BLINK');
      notify('🗡️ Выберите свободную клетку в радиусе 4 для прыжка!');
    } else if (item.id === 'bkb') {
      setHeroes(prev => prev.map(h => h.id === activeHero.id ? { ...h, armor: h.armor + 10, hp: Math.min(h.maxHp, h.hp + 30) } : h));
      notify(`🛡️ ${activeHero.name} активировал BKB (+10 брони, +30 HP)!`);
    } else if (item.id === 'rapier') {
      setHeroes(prev => prev.map(h => h.id === activeHero.id ? { ...h, damage: h.damage + 40 } : h));
      notify(`⚡ ${activeHero.name} экипировал Divine Rapier (+40 к урону)!`);
    } else if (item.id === 'satanic') {
      setHeroes(prev => prev.map(h => h.id === activeHero.id ? { ...h, hp: Math.min(h.maxHp, h.hp + 60) } : h));
      notify(`🩸 ${activeHero.name} активировал Satanic (+60 HP)!`);
    }
  };

  // Check Game Over
  const radiantAlive = heroes.filter(h => h.team === 'radiant' && h.hp > 0).length;
  const direAlive = heroes.filter(h => h.team === 'dire' && h.hp > 0).length;
  const isGameOver = radiantAlive === 0 || direAlive === 0;

  return (
    <div className="relative w-screen h-screen overflow-hidden select-none bg-[#07090e] text-slate-100 flex flex-col justify-between font-sans">
      
      {/* ===================================================================== */}
      {/* 1. TOP BAR — ОЧЕРЕДЬ ХОДОВ (TIMELINE BAR)                             */}
      {/* ===================================================================== */}
      <header className="fixed top-2 left-1/2 -translate-x-1/2 z-40 max-w-[98vw] w-auto">
        <div className="h-[56px] min-h-[56px] bg-[#121622]/90 backdrop-blur-[10px] border border-slate-700/80 rounded-2xl px-3 py-1 shadow-2xl flex items-center gap-2 sm:gap-3 overflow-x-auto no-scrollbar">
          {/* Round Indicator Badge */}
          <div className="bg-amber-500/20 text-amber-300 border border-amber-500/50 px-2.5 sm:px-3 py-1 rounded-xl text-xs font-mono font-black whitespace-nowrap flex items-center gap-1 shadow-inner">
            <span>РАУНД {round}</span>
          </div>

          <div className="h-6 w-px bg-slate-700/70" />

          {/* Turn Order Chain of Hero Tokens */}
          <div className="flex items-center gap-2 sm:gap-3 overflow-x-auto no-scrollbar py-1">
            {livingHeroes.map((hero, idx) => {
              const isActive = hero.id === activeHero?.id;
              const isRadiant = hero.team === 'radiant';

              return (
                <div
                  key={hero.id}
                  className={`relative flex flex-col items-center transition-all duration-200 ${
                    isActive ? 'scale-[1.08] -translate-y-0.5' : 'opacity-80'
                  }`}
                  title={`${hero.name} (${isRadiant ? 'Radiant' : 'Dire'})`}
                >
                  <div
                    className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-sm sm:text-base font-bold shadow-md transition-all ${
                      isActive
                        ? 'border-2 border-amber-400 shadow-[0_0_12px_#f59e0b] ring-2 ring-amber-400/50 bg-slate-800'
                        : isRadiant
                        ? 'border-2 border-emerald-500 bg-emerald-950/60'
                        : 'border-2 border-rose-500 bg-rose-950/60'
                    }`}
                  >
                    <span>{hero.avatar}</span>
                  </div>

                  {/* Active Indicator Arrow */}
                  {isActive && (
                    <div className="absolute -top-1 w-1.5 h-1.5 bg-amber-400 rotate-45 animate-pulse" />
                  )}

                  <span className={`text-[9px] font-sans font-bold max-w-[50px] truncate mt-0.5 ${
                    isActive ? 'text-amber-300' : 'text-slate-300'
                  }`}>
                    {hero.name}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Reset Game Button */}
          <div className="h-6 w-px bg-slate-700/70" />
          <button
            onClick={handleRestart}
            className="p-1.5 text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-700 rounded-lg cursor-pointer transition"
            title="Перезапустить бой"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* ===================================================================== */}
      {/* 2. COMBAT TOAST LOG (TOP CENTER)                                      */}
      {/* ===================================================================== */}
      <div className="fixed top-18 sm:top-20 left-1/2 -translate-x-1/2 z-30 pointer-events-auto">
        <div className="bg-[#10141f]/85 backdrop-blur-[10px] border border-slate-700/80 text-slate-100 text-xs sm:text-sm font-sans font-medium px-5 py-1.5 rounded-full shadow-2xl flex items-center gap-2">
          <History className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span className="truncate max-w-[280px] sm:max-w-md">{toast}</span>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* 3. CENTER — ТАКТИЧЕСКАЯ АРЕНА (9x9 GRID)                              */}
      {/* ===================================================================== */}
      <main className="flex-1 w-full flex items-center justify-center pt-24 pb-40 sm:pb-32 px-2 overflow-hidden">
        <div className="relative w-full max-w-[500px] aspect-square bg-[#0b0f17]/95 rounded-2xl sm:rounded-3xl border border-slate-800/90 shadow-[0_12px_45px_rgba(0,0,0,0.85)] backdrop-blur-xl p-2 sm:p-3 flex items-center justify-center">
          
          {/* Grid */}
          <div className="grid grid-cols-9 gap-1 sm:gap-1.5 w-full h-full">
            {Array.from({ length: GRID_SIZE }).map((_, r) =>
              Array.from({ length: GRID_SIZE }).map((_, c) => {
                const key = `${r},${c}`;
                const hero = heroes.find(h => h.hp > 0 && h.r === r && h.c === c);
                const tileType = getTileType(r, c);

                const isReachableMove = reachableMoveCells.has(key);
                const isReachableAttack = reachableAttackCells.has(key);
                const isReachableSkill = reachableSkillCells.has(key);
                const isReachableBlink = reachableBlinkCells.has(key);

                // Terrain Colors
                let terrainClass = 'bg-[#151b24] border-slate-800/60';
                let tileIcon = null;

                if (tileType === 'WATER') {
                  terrainClass = 'bg-[#0c2842] border-sky-900/60 text-sky-400/50';
                  tileIcon = <span className="text-[9px] opacity-40">💧</span>;
                } else if (tileType === 'ROCK') {
                  terrainClass = 'bg-[#1e2530] border-slate-700/60 text-slate-500/50';
                  tileIcon = <span className="text-[9px] opacity-40">🪨</span>;
                }

                return (
                  <button
                    key={key}
                    onClick={() => handleCellClick(r, c)}
                    className={`tile relative aspect-square rounded-[5px] sm:rounded-[6px] border flex flex-col items-center justify-center transition-all duration-150 cursor-pointer overflow-hidden ${terrainClass} ${
                      isReachableMove
                        ? 'reachable-move z-20 hover:scale-105'
                        : isReachableAttack
                        ? 'reachable-attack z-20 hover:scale-105'
                        : isReachableSkill
                        ? 'bg-purple-950/70 border-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.4)] z-20 hover:scale-105'
                        : isReachableBlink
                        ? 'bg-amber-950/70 border-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.4)] z-20 hover:scale-105'
                        : 'hover:border-slate-600/80 hover:bg-slate-800/40'
                    }`}
                  >
                    {/* Background Terrain Marker */}
                    {!hero && tileIcon}

                    {/* HERO TOKEN ON TILE */}
                    {hero && (
                      <div className="relative flex flex-col items-center justify-center w-full h-full p-0.5 z-30">
                        {/* Active Arrow Indicator */}
                        {hero.id === activeHero?.id && (
                          <div className="absolute -top-1 w-1.5 h-1.5 bg-amber-400 rotate-45 animate-pulse z-40" />
                        )}

                        {/* Avatar Circle */}
                        <div
                          className={`w-[85%] h-[85%] rounded-full flex items-center justify-center text-xs sm:text-base font-bold shadow-md transition-all ${
                            hero.id === activeHero?.id
                              ? 'border-2 border-amber-400 ring-2 ring-amber-400/60 shadow-[0_0_12px_#f59e0b] scale-105 bg-slate-800'
                              : hero.team === 'radiant'
                              ? 'border-2 border-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.5)] bg-emerald-950/80'
                              : 'border-2 border-rose-500 shadow-[0_0_6px_rgba(244,63,94,0.5)] bg-rose-950/80'
                          }`}
                        >
                          <span>{hero.avatar}</span>
                        </div>

                        {/* Mini HP bar directly under token */}
                        <div className="w-[85%] h-1 sm:h-1.5 bg-black/80 rounded-full border border-black/60 overflow-hidden mt-0.5 shadow-sm">
                          <div
                            className={`h-full rounded-full transition-all duration-300 ${
                              hero.team === 'radiant' ? 'bg-emerald-400' : 'bg-rose-500'
                            }`}
                            style={{ width: `${Math.round((hero.hp / hero.maxHp) * 100)}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </button>
                );
              })
            )}
          </div>

          {/* Floating Damage Popups */}
          {damageFloats.map(item => {
            const topPercent = (item.r + 0.3) * (100 / GRID_SIZE);
            const leftPercent = (item.c + 0.5) * (100 / GRID_SIZE);

            return (
              <div
                key={item.id}
                className={`absolute pointer-events-none font-mono text-xs sm:text-sm animate-bounce z-50 transition-all ${item.color}`}
                style={{
                  top: `${topPercent}%`,
                  left: `${leftPercent}%`,
                  transform: 'translate(-50%, -50%)'
                }}
              >
                {item.text}
              </div>
            );
          })}

          {/* Victory Modal */}
          {isGameOver && (
            <div className="absolute inset-0 bg-black/85 backdrop-blur-md rounded-2xl sm:rounded-3xl flex flex-col items-center justify-center p-6 text-center z-50">
              <span className="text-4xl mb-2">{radiantAlive > 0 ? '🏆' : '💀'}</span>
              <h2 className="text-xl sm:text-2xl font-black text-amber-400 mb-1">
                {radiantAlive > 0 ? 'ПОБЕДА RADIANT!' : 'ПОБЕДА DIRE!'}
              </h2>
              <p className="text-xs text-slate-300 mb-4">Все противники повержены в тактическом бою.</p>
              <button
                onClick={handleRestart}
                className="px-6 py-2 bg-gradient-to-r from-amber-500 to-yellow-600 text-black font-black text-sm rounded-xl cursor-pointer shadow-lg hover:brightness-110 active:scale-95 transition"
              >
                Начать заново
              </button>
            </div>
          )}
        </div>
      </main>

      {/* ===================================================================== */}
      {/* 4. BOTTOM DECK — КОМАНДНЫЙ ПУЛЬТ                                      */}
      {/* ===================================================================== */}
      <footer className="fixed bottom-2 sm:bottom-3 left-1/2 -translate-x-1/2 z-40 w-[96vw] max-w-4xl pb-[env(safe-area-inset-bottom)]">
        <div className="bg-[#121622]/95 backdrop-blur-2xl border border-slate-700/80 rounded-2xl p-3 sm:p-4 shadow-[0_8px_32px_rgba(0,0,0,0.85)] flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          
          {/* HERO VITALS BLOCK */}
          <div className="flex items-center gap-3 min-w-[240px] sm:min-w-[280px]">
            {/* 48x48 Avatar with Gold Frame */}
            <div className="relative w-12 h-12 rounded-full overflow-hidden shrink-0 border-2 border-amber-400 shadow-[0_0_10px_#f59e0b] bg-slate-800 flex items-center justify-center text-xl">
              <span>{activeHero?.avatar}</span>
            </div>

            {/* Name, Steps/Armor, HP & Mana Bars */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <h2 className="text-sm sm:text-base font-black text-white truncate">
                  {activeHero?.name}
                </h2>
                <div className="flex items-center gap-2 text-[10px] sm:text-xs font-mono text-slate-300">
                  <span title="Оставшиеся шаги">🦶 Ход: {movesLeft}/{activeHero?.speed || 3}</span>
                  <span className="text-slate-600">|</span>
                  <span title="Броня">🛡️ Броня: {activeHero?.armor || 0}</span>
                </div>
              </div>

              {/* Green HP Bar */}
              <div className="mt-1">
                <div className="flex items-center justify-between text-[10px] font-mono font-bold text-emerald-400 mb-0.5">
                  <span>HP</span>
                  <span>{activeHero?.hp} / {activeHero?.maxHp}</span>
                </div>
                <div className="h-2.5 w-full bg-slate-900/90 rounded-full overflow-hidden border border-emerald-950">
                  <div
                    className="h-full rounded-full transition-all duration-300 shadow-[0_0_8px_#10b981]"
                    style={{
                      width: `${Math.round(((activeHero?.hp || 0) / (activeHero?.maxHp || 100)) * 100)}%`,
                      background: 'linear-gradient(90deg, #059669, #10b981)'
                    }}
                  />
                </div>
              </div>

              {/* Blue Mana Bar */}
              <div className="mt-1">
                <div className="flex items-center justify-between text-[10px] font-mono font-bold text-sky-400 mb-0.5">
                  <span>MP</span>
                  <span>{activeHero?.mana} / {activeHero?.maxMana}</span>
                </div>
                <div className="h-2 w-full bg-slate-900/90 rounded-full overflow-hidden border border-sky-950">
                  <div
                    className="h-full rounded-full transition-all duration-300 shadow-[0_0_6px_#38bdf8]"
                    style={{
                      width: `${Math.round(((activeHero?.mana || 0) / (activeHero?.maxMana || 100)) * 100)}%`,
                      background: 'linear-gradient(90deg, #2563eb, #3b82f6)'
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="hidden md:block h-12 w-px bg-slate-700/60" />

          {/* 4 ACTION BUTTONS + END TURN (HEIGHT >= 46px) */}
          <div className="flex items-center justify-between sm:justify-end gap-1.5 sm:gap-2 flex-wrap sm:flex-nowrap">
            {/* Button 1: [ 🦶 Ход ] */}
            <button
              onClick={() => {
                setActionMode(actionMode === 'MOVE' ? 'NONE' : 'MOVE');
                setShowSkillDrawer(false);
                setShowShopModal(false);
              }}
              className={`flex-1 sm:flex-initial min-h-[46px] px-2.5 sm:px-4 py-2 rounded-xl font-sans font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all cursor-pointer border ${
                actionMode === 'MOVE'
                  ? 'bg-cyan-950/80 text-[#00f0ff] border-[#00f0ff] shadow-[0_0_14px_rgba(0,240,255,0.45)]'
                  : 'bg-slate-800/90 hover:bg-slate-700 text-slate-200 border-slate-700'
              }`}
            >
              <Footprints className="w-4 h-4 shrink-0" />
              <span>Ход</span>
            </button>

            {/* Button 2: [ ⚔️ Удар ] */}
            <button
              disabled={hasAttacked}
              onClick={() => {
                setActionMode(actionMode === 'ATTACK' ? 'NONE' : 'ATTACK');
                setShowSkillDrawer(false);
                setShowShopModal(false);
              }}
              className={`flex-1 sm:flex-initial min-h-[46px] px-2.5 sm:px-4 py-2 rounded-xl font-sans font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all cursor-pointer border ${
                hasAttacked
                  ? 'opacity-40 bg-zinc-900 border-zinc-800 cursor-not-allowed text-zinc-500'
                  : actionMode === 'ATTACK'
                  ? 'bg-rose-950/80 text-[#ef4444] border-[#ef4444] shadow-[0_0_14px_rgba(239,68,68,0.45)]'
                  : 'bg-slate-800/90 hover:bg-slate-700 text-slate-200 border-slate-700'
              }`}
            >
              <Swords className="w-4 h-4 shrink-0" />
              <span>Удар</span>
            </button>

            {/* Button 3: [ 🔮 Скиллы ] */}
            <button
              onClick={() => {
                setShowShopModal(false);
                setShowSkillDrawer(!showSkillDrawer);
              }}
              className={`flex-1 sm:flex-initial min-h-[46px] px-2.5 sm:px-4 py-2 rounded-xl font-sans font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all cursor-pointer border ${
                showSkillDrawer
                  ? 'bg-purple-950/80 text-purple-300 border-purple-500 shadow-[0_0_14px_rgba(168,85,247,0.4)]'
                  : 'bg-slate-800/90 hover:bg-slate-700 text-slate-200 border-slate-700'
              }`}
            >
              <Sparkles className="w-4 h-4 text-purple-400 shrink-0" />
              <span>Скиллы</span>
            </button>

            {/* Button 4: [ 🎒 Лавка ] */}
            <button
              onClick={() => {
                setShowSkillDrawer(false);
                setShowShopModal(!showShopModal);
              }}
              className={`flex-1 sm:flex-initial min-h-[46px] px-2.5 sm:px-4 py-2 rounded-xl font-sans font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all cursor-pointer border ${
                showShopModal
                  ? 'bg-amber-950/80 text-amber-300 border-amber-500 shadow-[0_0_14px_rgba(245,158,11,0.4)]'
                  : 'bg-slate-800/90 hover:bg-slate-700 text-slate-200 border-slate-700'
              }`}
            >
              <ShoppingBag className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Лавка</span>
            </button>

            {/* Button 5: [ КОНЕЦ ХОДА ➔ ] */}
            <button
              onClick={handleEndTurn}
              style={{ background: 'linear-gradient(to right, #d97706, #f59e0b)' }}
              className="flex-1 sm:flex-initial min-h-[46px] px-4 sm:px-6 py-2 rounded-xl font-sans font-black text-xs sm:text-sm tracking-wider uppercase text-black shadow-[0_0_16px_rgba(245,158,11,0.5)] active:scale-95 transition flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap"
            >
              <span>Конец хода</span>
              <ArrowRight className="w-4 h-4 stroke-[3] shrink-0" />
            </button>
          </div>
        </div>
      </footer>

      {/* ===================================================================== */}
      {/* 5. SKILLS SHEET DRAWER (SLIDE-UP)                                     */}
      {/* ===================================================================== */}
      {showSkillDrawer && activeHero?.skill && (
        <div className="fixed bottom-24 sm:bottom-28 left-1/2 -translate-x-1/2 w-[95vw] max-w-lg z-50 bg-[#121622]/98 backdrop-blur-2xl border border-slate-700/90 rounded-2xl p-4 shadow-2xl animate-in slide-in-from-bottom-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-400" />
              <h3 className="font-bold text-white text-sm sm:text-base">
                Способность — {activeHero.name}
              </h3>
            </div>
            <button
              onClick={() => setShowSkillDrawer(false)}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="mt-3 p-3 bg-slate-900/80 border border-slate-800 rounded-xl flex items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-bold text-white text-sm">{activeHero.skill.name}</h4>
                <span className="text-[10px] font-mono text-sky-400 bg-sky-950/60 px-1.5 py-0.5 rounded border border-sky-800">
                  💧 {activeHero.skill.cost} MP
                </span>
                <span className="text-[10px] font-mono text-rose-400 bg-rose-950/60 px-1.5 py-0.5 rounded border border-rose-800">
                  ⚔️ {activeHero.skill.damage} урона
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1">{activeHero.skill.desc}</p>
            </div>

            <button
              disabled={activeHero.mana < activeHero.skill.cost}
              onClick={() => {
                setShowSkillDrawer(false);
                setActionMode('SKILL');
                notify(`🔮 Выберите вражескую цель для «${activeHero.skill.name}»!`);
              }}
              className={`min-h-[40px] px-4 py-1.5 rounded-lg text-xs font-bold shrink-0 transition cursor-pointer ${
                activeHero.mana >= activeHero.skill.cost
                  ? 'bg-purple-600 hover:bg-purple-500 text-white shadow-lg'
                  : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
              }`}
            >
              {activeHero.mana >= activeHero.skill.cost ? 'Применить' : 'Мало MP'}
            </button>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* 6. SHOP MODAL (TACTICAL ARTIFACTS)                                    */}
      {/* ===================================================================== */}
      {showShopModal && (
        <div className="fixed bottom-24 sm:bottom-28 left-1/2 -translate-x-1/2 w-[95vw] max-w-lg z-50 bg-[#121622]/98 backdrop-blur-2xl border border-slate-700/90 rounded-2xl p-4 shadow-2xl animate-in slide-in-from-bottom-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-amber-400" />
              <h3 className="font-bold text-white text-sm sm:text-base">
                Лавка тактических предметов
              </h3>
            </div>
            <button
              onClick={() => setShowShopModal(false)}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="mt-3 space-y-2 max-h-[50vh] overflow-y-auto pr-1">
            {SHOP_ITEMS.map((item) => (
              <div
                key={item.id}
                className="p-3 bg-slate-900/80 hover:bg-slate-800/90 border border-slate-800 rounded-xl flex items-center justify-between gap-3 transition"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-amber-950/70 border border-amber-500/40 flex items-center justify-center text-lg shrink-0">
                    {item.icon}
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-xs sm:text-sm">{item.name}</h4>
                    <p className="text-[11px] text-slate-300 mt-0.5">{item.desc}</p>
                  </div>
                </div>

                <button
                  onClick={() => handleBuyItem(item)}
                  className="min-h-[38px] px-3.5 py-1.5 rounded-lg text-xs font-bold bg-amber-500 hover:bg-amber-400 text-black shadow-md shrink-0 transition cursor-pointer"
                >
                  Купить
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
