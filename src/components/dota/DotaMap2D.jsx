import React, { useState, useEffect, useRef } from 'react';
import { 
  MAP_SIZE, generateDotaMap, INITIAL_HERO_POSITIONS 
} from '../../data/dotaMapData';
import { 
  playAttackSound, playCritSound, playSpellSound, playDiceSound, playClickSound 
} from '../../utils/sound';
import confetti from 'canvas-confetti';
import { 
  ZoomIn, ZoomOut, RefreshCw, Crosshair, Play, 
  HelpCircle, Swords, Shield, Skull, CheckCircle2, Sparkles, Flame, Move, Eye
} from 'lucide-react';

const CELL_SIZE = 50; // Base size in px per grid cell
const MAP_TOTAL_SIZE = MAP_SIZE * CELL_SIZE; // 20 * 50 = 1000px

export default function DotaMap2D({
  heroes,
  activeHeroId,
  onSelectHero,
  heroPositions,
  setHeroPositions,
  activeTargetingSkill,
  onCompleteSkillTargeting,
  turn,
  onNextTurn,
  combatEvents,
  addCombatEvent,
  centerTrigger
}) {
  const [grid, setGrid] = useState(() => generateDotaMap());
  
  // Camera transform: zoom + pan (drag)
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [hasMovedDuringDrag, setHasMovedDuringDrag] = useState(false);

  // Settings
  const [showCoordinates, setShowCoordinates] = useState(true);
  const [showRangeAuras, setShowRangeAuras] = useState(true);

  // Hover and combat state
  const [hoveredCell, setHoveredCell] = useState(null);
  const [projectiles, setProjectiles] = useState([]); 
  const [floatingTexts, setFloatingTexts] = useState([]);
  
  // Active Domain Expansions (Unlimited Void / Malevolent Shrine)
  const [activeDomain, setActiveDomain] = useState(null); 
  // { type: 'unlimited_void' | 'malevolent_shrine', centerR, centerC, radius, remainingTurns, casterId }

  const viewportRef = useRef(null);

  const activeHero = heroes.find(h => h.id === activeHeroId) || heroes[0];
  const activePos = heroPositions.find(p => p.heroId === activeHeroId);

  // Chebyshev distance
  const getDistance = (r1, c1, r2, c2) => {
    return Math.max(Math.abs(r1 - r2), Math.abs(c1 - c2));
  };

  // Center camera on active hero
  const centerCameraOnHero = (heroId = activeHeroId) => {
    const pos = heroPositions.find(p => p.heroId === heroId);
    if (!pos || !viewportRef.current) return;

    const vpWidth = viewportRef.current.clientWidth;
    const vpHeight = viewportRef.current.clientHeight;

    const heroPixelX = (pos.c + 0.5) * CELL_SIZE;
    const heroPixelY = (pos.r + 0.5) * CELL_SIZE;

    // Pan so heroPixel is at center of viewport
    const newPanX = (vpWidth / 2) - (heroPixelX * zoom);
    const newPanY = (vpHeight / 2) - (heroPixelY * zoom);

    setPan({ x: Math.round(newPanX), y: Math.round(newPanY) });
  };

  // Initial center on active hero
  useEffect(() => {
    const timer = setTimeout(() => {
      centerCameraOnHero();
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  // Listen to external centerTrigger
  useEffect(() => {
    if (centerTrigger) {
      centerCameraOnHero();
    }
  }, [centerTrigger, activeHeroId]);

  // Floating text spawner
  const spawnFloatingText = (r, c, text, color = '#f87171') => {
    const id = Date.now() + Math.random();
    setFloatingTexts(prev => [...prev, { id, r, c, text, color }]);
    setTimeout(() => {
      setFloatingTexts(prev => prev.filter(t => t.id !== id));
    }, 1900);
  };

  // Projectile animation spawner
  const spawnProjectile = (fromR, fromC, toR, toC, color = '#fbbf24', type = 'line') => {
    const id = Date.now() + Math.random();
    setProjectiles(prev => [...prev, { id, fromR, fromC, toR, toC, color, type }]);
    setTimeout(() => {
      setProjectiles(prev => prev.filter(p => p.id !== id));
    }, 600);
  };

  // Turn tick for domains
  useEffect(() => {
    if (!activeDomain) return;

    if (activeDomain.type === 'malevolent_shrine') {
      playCritSound();
      setHeroPositions(prev => prev.map(p => {
        if (p.team === 'radiant') {
          const d = getDistance(p.r, p.c, activeDomain.centerR, activeDomain.centerC);
          if (d <= activeDomain.radius) {
            spawnFloatingText(p.r, p.c, 'ГРОБНИЦА! -60 HP', '#ef4444');
            return { ...p, hpRatio: Math.max(0.05, (p.hpRatio || 1) - 0.2) };
          }
        }
        return p;
      }));
      addCombatEvent(`⛩️ Зловещая Гробница Сукуны нанесла шквал ударов по всем героям Radiant в радиусе!`);
    } else if (activeDomain.type === 'unlimited_void') {
      addCombatEvent(`🌌 Необъятная Пустота Годжо: враги внутри парализованы бесконечной информацией!`);
    }

    if (activeDomain.remainingTurns <= 1) {
      addCombatEvent(`✨ Территория рассеялась!`);
      setActiveDomain(null);
    } else {
      setActiveDomain(prev => ({ ...prev, remainingTurns: prev.remainingTurns - 1 }));
    }
  }, [turn]);

  // Pan / Drag Handlers
  const handleMouseDown = (e) => {
    if (e.button === 0 || e.button === 1) { // Left or middle click
      setIsDragging(true);
      setHasMovedDuringDrag(false);
      setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  };

  const handleMouseMove = (e) => {
    if (isDragging) {
      const dx = Math.abs(e.clientX - (dragStart.x + pan.x));
      const dy = Math.abs(e.clientY - (dragStart.y + pan.y));
      if (dx > 4 || dy > 4) {
        setHasMovedDuringDrag(true);
      }
      setPan({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 1.1 : 0.9;
    setZoom(z => Math.max(0.55, Math.min(2.4, z * zoomFactor)));
  };

  // Cell Click (Move, Attack, Cast)
  const handleCellClick = (r, c) => {
    if (hasMovedDuringDrag) return; // Ignore if user was just panning
    if (!activePos) return;

    const targetHeroPos = heroPositions.find(p => p.r === r && p.c === c);

    // 1. In skill targeting mode
    if (activeTargetingSkill) {
      handleSkillTarget(r, c, targetHeroPos);
      return;
    }

    // 2. Click on another hero -> select them
    if (targetHeroPos) {
      playClickSound();
      onSelectHero(targetHeroPos.heroId);
      return;
    }

    // 3. Move Hero
    const cell = grid[r][c];
    if (cell.type === 'tree' || cell.type === 'roshan') {
      spawnFloatingText(r, c, 'Препятствие!', '#ef4444');
      return;
    }

    const dist = getDistance(activePos.r, activePos.c, r, c);
    const speed = activeHero.stats.speed || 6;

    if (dist <= speed) {
      playClickSound();
      setHeroPositions(prev => prev.map(p => {
        if (p.heroId === activeHeroId) {
          return { ...p, r, c };
        }
        return p;
      }));
      addCombatEvent(`🏃 ${activeHero.name} переместился на клетку [${String.fromCharCode(65 + c)}${r + 1}] (${dist} кл).`);
    } else {
      spawnFloatingText(r, c, 'Слишком далеко!', '#94a3b8');
    }
  };

  // Execute Skill Targeting
  const handleSkillTarget = (r, c, targetHeroPos) => {
    const skill = activeTargetingSkill;
    const fromR = activePos.r;
    const fromC = activePos.c;
    const dist = getDistance(fromR, fromC, r, c);

    // BLINK DAGGER ITEM
    if (skill.id === 'blink_dagger') {
      if (dist <= 10) {
        playSpellSound();
        spawnFloatingText(fromR, fromC, 'BLINK!', '#38bdf8');
        setHeroPositions(prev => prev.map(p => p.heroId === activeHeroId ? { ...p, r, c } : p));
        addCombatEvent(`⚡ ${activeHero.name} телепортировался с Blink Dagger на [${String.fromCharCode(65 + c)}${r + 1}]!`);
        onCompleteSkillTargeting && onCompleteSkillTargeting();
      } else {
        spawnFloatingText(r, c, 'Дальность до 10 кл!', '#94a3b8');
      }
      return;
    }

    // ==========================================
    // 1. SATORU GOJO (JUJUTSU KAISEN)
    // ==========================================
    if (activeHero.id === 'gojo') {
      if (skill.id === 'lapse-blue') {
        playSpellSound();
        spawnProjectile(fromR, fromC, r, c, '#0284c7', 'singularity');
        spawnFloatingText(r, c, 'СИНИЙ: СХОЖДЕНИЕ! -60 HP', '#38bdf8');
        addCombatEvent(`🌀 Годжо создал точку сжатия «Lapse: Blue» в [${String.fromCharCode(65 + c)}${r + 1}]! Враги в 2 кл притянуты к центру.`);
        
        setHeroPositions(prev => prev.map(p => {
          if (p.heroId !== activeHero.id && getDistance(p.r, p.c, r, c) <= 2) {
            const pullR = p.r > r ? Math.max(r, p.r - 1) : (p.r < r ? Math.min(r, p.r + 1) : r);
            const pullC = p.c > c ? Math.max(c, p.c - 1) : (p.c < c ? Math.min(c, p.c + 1) : c);
            spawnFloatingText(p.r, p.c, '-60 HP (Сжатие)', '#38bdf8');
            return { ...p, r: pullR, c: pullC, hpRatio: Math.max(0.1, (p.hpRatio || 1) - 0.15) };
          }
          return p;
        }));
      } else if (skill.id === 'reversal-red') {
        playCritSound();
        spawnProjectile(fromR, fromC, r, c, '#ef4444', 'repulsion');
        if (targetHeroPos) {
          spawnFloatingText(r, c, 'КРАСНЫЙ: РАСХОЖДЕНИЕ! -75 HP', '#ef4444');
          addCombatEvent(`🔴 Годжо выстрелил «Reversal: Red» в ${targetHeroPos.heroId}: цель отброшена на 3 клетки назад!`);
          const knockR = Math.max(0, Math.min(MAP_SIZE - 1, targetHeroPos.r + (targetHeroPos.r - fromR >= 0 ? 3 : -3)));
          const knockC = Math.max(0, Math.min(MAP_SIZE - 1, targetHeroPos.c + (targetHeroPos.c - fromC >= 0 ? 3 : -3)));
          setHeroPositions(prev => prev.map(p => {
            if (p.heroId === targetHeroPos.heroId) {
              return { ...p, r: knockR, c: knockC, hpRatio: Math.max(0.1, (p.hpRatio || 1) - 0.2) };
            }
            return p;
          }));
        } else {
          spawnFloatingText(r, c, 'RED REVERSAL!', '#ef4444');
        }
      } else if (skill.id === 'hollow-purple') {
        playCritSound();
        confetti({ particleCount: 75, spread: 80, origin: { y: 0.6 } });
        spawnProjectile(fromR, fromC, r, c, '#a855f7', 'purple');
        spawnFloatingText(r, c, 'HOLLOW PURPLE! -140 ЧИСТЫЙ УРОН', '#c084fc');
        addCombatEvent(`🟣 МНИМАЯ МАССА: HOLLOW PURPLE! Годжо выпустил заряд на 140 чистого урона сквозь любые укрытия!`, 'crit');
        
        setHeroPositions(prev => prev.map(p => {
          if (p.heroId !== activeHero.id && (p.r === r && p.c === c || getDistance(p.r, p.c, r, c) <= 1)) {
            spawnFloatingText(p.r, p.c, 'АННИГИЛЯЦИЯ -140 HP', '#a855f7');
            return { ...p, hpRatio: Math.max(0.05, (p.hpRatio || 1) - 0.35) };
          }
          return p;
        }));
      } else if (skill.id === 'unlimited-void') {
        playSpellSound();
        confetti({ particleCount: 90, spread: 90, colors: ['#06b6d4', '#3b82f6', '#8b5cf6'] });
        setActiveDomain({
          type: 'unlimited_void',
          centerR: r,
          centerC: c,
          radius: 1,
          remainingTurns: 1,
          casterId: 'gojo'
        });
        spawnFloatingText(r, c, 'НЕОБЪЯТНАЯ ПУСТОТА! ПАРАЛИЧ', '#38bdf8');
        addCombatEvent(`🌌 РАСШИРЕНИЕ ТЕРРИТОРИИ: НЕОБЪЯТНАЯ ПУСТОТА! Годжо раскрыл Домен 3x3. Полный паралич врагов внутри на 1 ход!`, 'crit');
      } else {
        playSpellSound();
        spawnFloatingText(fromR, fromC, 'БЕСКОНЕЧНОСТЬ (Барьер)', '#38bdf8');
        addCombatEvent(`🛡️ Годжо активировал защитный барьер Бесконечности.`);
      }

    // ==========================================
    // 2. RYOMEN SUKUNA (JUJUTSU KAISEN)
    // ==========================================
    } else if (activeHero.id === 'sukuna') {
      if (skill.id === 'dismantle') {
        playAttackSound();
        spawnProjectile(fromR, fromC, r, c, '#ef4444', 'slash');
        spawnFloatingText(r, c, 'DISMANTLE! -70 HP', '#ef4444');
        addCombatEvent(`🩸 DISMANTLE: Невидимый разрез рассек цель на расстоянии: 70 урона с 15 пробития!`);
        if (targetHeroPos) {
          setHeroPositions(prev => prev.map(p => p.heroId === targetHeroPos.heroId ? { ...p, hpRatio: Math.max(0.1, (p.hpRatio || 1) - 0.2) } : p));
        }
      } else if (skill.id === 'cleave') {
        playCritSound();
        spawnFloatingText(r, c, 'CLEAVE! -75 ЧИСТЫЙ УРОН', '#b91c1c');
        addCombatEvent(`🩸 CLEAVE: Разрез Сукуны проигнорировал 100% брони и нанес 75 чистого урона!`);
        if (targetHeroPos) {
          setHeroPositions(prev => prev.map(p => p.heroId === targetHeroPos.heroId ? { ...p, hpRatio: Math.max(0.1, (p.hpRatio || 1) - 0.22) } : p));
        }
      } else if (skill.id === 'furnace-open') {
        playCritSound();
        confetti({ particleCount: 70, spread: 70, colors: ['#ea580c', '#f97316', '#eab308'] });
        spawnProjectile(fromR, fromC, r, c, '#f97316', 'fire-arrow');
        spawnFloatingText(r, c, 'FUUGA: «OPEN»! -110 УРОН', '#f97316');
        addCombatEvent(`🔥 Сукуна произнес «Откройся» (Fuuga) и поразил область 3x3 пламенем на 110 урона!`, 'crit');
        
        setHeroPositions(prev => prev.map(p => {
          if (p.heroId !== activeHero.id && getDistance(p.r, p.c, r, c) <= 1) {
            spawnFloatingText(p.r, p.c, 'ВЗРЫВ ПЛАМЕНИ -110 HP', '#ea580c');
            return { ...p, hpRatio: Math.max(0.05, (p.hpRatio || 1) - 0.28) };
          }
          return p;
        }));
      } else if (skill.id === 'malevolent-shrine') {
        playCritSound();
        confetti({ particleCount: 90, spread: 90, colors: ['#dc2626', '#7f1d1d', '#000000'] });
        setActiveDomain({
          type: 'malevolent_shrine',
          centerR: r,
          centerC: c,
          radius: 2,
          remainingTurns: 1,
          casterId: 'sukuna'
        });
        spawnFloatingText(r, c, 'ЗЛОВЕЩАЯ ГРОБНИЦА! ШКВАЛ РАЗРЕЗОВ', '#ef4444');
        addCombatEvent(`⛩️ ОТКРЫТАЯ ТЕРРИТОРИЯ: ЗЛОВЕЩАЯ ГРОБНИЦА! Буря разрезов Dismantle и Cleave на 1 ход!`, 'crit');
      } else {
        playSpellSound();
        spawnFloatingText(fromR, fromC, 'КОРОЛЬ ПРОКЛЯТИЙ (Пассивно)', '#ef4444');
        addCombatEvent(`👑 Пассивная способность Сукуны: иммунитет к ядам.`);
      }

    // ==========================================
    // 3. INVOKER (10 SPELLS)
    // ==========================================
    } else if (activeHero.id === 'invoker') {
      if (skill.id === 'sun-strike') {
        playCritSound();
        confetti({ particleCount: 50, spread: 60, colors: ['#facc15', '#fef08a'] });
        spawnProjectile(0, c, r, c, '#facc15', 'beam');
        spawnFloatingText(r, c, 'SUN STRIKE! -120 ЧИСТЫЙ УРОН', '#facc15');
        addCombatEvent(`☀️ SUN STRIKE! Инвокер обрушил солнечный луч на [${String.fromCharCode(65 + c)}${r + 1}]: 120 чистого урона!`, 'crit');
        if (targetHeroPos) {
          setHeroPositions(prev => prev.map(p => p.heroId === targetHeroPos.heroId ? { ...p, hpRatio: Math.max(0.05, (p.hpRatio || 1) - 0.3) } : p));
        }
      } else if (skill.id === 'chaos-meteor') {
        playCritSound();
        spawnProjectile(fromR, fromC, r, c, '#f97316', 'meteor');
        spawnFloatingText(r, c, 'CHAOS METEOR! -100 УРОН', '#f97316');
        addCombatEvent(`☄️ CHAOS METEOR! Пылающий метеорит прокатился по земле, нанеся 100 урона!`, 'crit');
        if (targetHeroPos) {
          setHeroPositions(prev => prev.map(p => p.heroId === targetHeroPos.heroId ? { ...p, hpRatio: Math.max(0.05, (p.hpRatio || 1) - 0.25) } : p));
        }
      } else if (skill.id === 'deafening-blast') {
        playSpellSound();
        spawnProjectile(fromR, fromC, r, c, '#93c5fd', 'wave');
        spawnFloatingText(r, c, 'DEAFENING BLAST! (Отброс + Обезоруживание)', '#38bdf8');
        addCombatEvent(`🔊 DEAFENING BLAST! Звуковая волна оглушила и обезоружила врагов.`);
        if (targetHeroPos) {
          setHeroPositions(prev => prev.map(p => p.heroId === targetHeroPos.heroId ? { ...p, hpRatio: Math.max(0.05, (p.hpRatio || 1) - 0.2) } : p));
        }
      } else {
        playSpellSound();
        spawnFloatingText(r, c, `${skill.name.toUpperCase()}!`, '#facc15');
        addCombatEvent(`🔮 Инвокер применил «${skill.name}» на клетку [${String.fromCharCode(65 + c)}${r + 1}]!`);
        if (targetHeroPos) {
          setHeroPositions(prev => prev.map(p => p.heroId === targetHeroPos.heroId ? { ...p, hpRatio: Math.max(0.05, (p.hpRatio || 1) - 0.15) } : p));
        }
      }

    // ==========================================
    // 4. AXE / PUDGE / OTHER HEROES
    // ==========================================
    } else if (activeHero.id === 'axe') {
      if (skill.id === 'culling-blade') {
        playCritSound();
        confetti({ particleCount: 80, spread: 70, colors: ['#dc2626', '#ef4444', '#b91c1c'] });
        spawnFloatingText(r, c, 'CULLING BLADE! -100 ЧИСТЫЙ УРОН', '#ef4444');
        addCombatEvent(`🪓 CULLING BLADE! Акс разрубил цель сокрушительным добивающим ударом!`, 'crit');
        if (targetHeroPos) {
          setHeroPositions(prev => prev.map(p => p.heroId === targetHeroPos.heroId ? { ...p, hpRatio: Math.max(0, (p.hpRatio || 1) - 0.4) } : p));
        }
      } else {
        playSpellSound();
        spawnFloatingText(r, c, `${skill.name.toUpperCase()}!`, '#ef4444');
        addCombatEvent(`🪓 Акс применил «${skill.name}»!`);
      }
    } else if (activeHero.id === 'pudge') {
      if (skill.id === 'meat-hook') {
        playSpellSound();
        spawnProjectile(fromR, fromC, r, c, '#78350f', 'hook');
        spawnFloatingText(r, c, 'MEAT HOOK! -80 HP', '#a8a29e');
        addCombatEvent(`🪝 MEAT HOOK! Пудж запустил цепь с крюком!`);
        if (targetHeroPos) {
          // Pull target to Pudge
          setHeroPositions(prev => prev.map(p => {
            if (p.heroId === targetHeroPos.heroId) {
              return { ...p, r: fromR, c: fromC > c ? fromC - 1 : fromC + 1, hpRatio: Math.max(0.05, (p.hpRatio || 1) - 0.25) };
            }
            return p;
          }));
        }
      } else {
        playSpellSound();
        spawnFloatingText(r, c, `${skill.name.toUpperCase()}!`, '#84cc16');
        addCombatEvent(`🥩 Пудж применил «${skill.name}»!`);
      }
    } else {
      // Generic skill
      playSpellSound();
      spawnProjectile(fromR, fromC, r, c, '#38bdf8', 'bolt');
      spawnFloatingText(r, c, `${skill.name.toUpperCase()}! -60 HP`, '#38bdf8');
      addCombatEvent(`✨ ${activeHero.name} применил «${skill.name}» на [${String.fromCharCode(65 + c)}${r + 1}]!`);
      if (targetHeroPos) {
        setHeroPositions(prev => prev.map(p => p.heroId === targetHeroPos.heroId ? { ...p, hpRatio: Math.max(0.05, (p.hpRatio || 1) - 0.2) } : p));
      }
    }

    onCompleteSkillTargeting && onCompleteSkillTargeting();
  };

  return (
    <div 
      ref={viewportRef}
      className="w-full h-full relative overflow-hidden bg-[#06080d] select-none cursor-grab active:cursor-grabbing"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onWheel={handleWheel}
    >
      
      {/* 1. FLOATING CAMERA CONTROLS (Top-Left overlay) */}
      <div className="absolute top-3 left-3 z-30 flex items-center gap-1.5 bg-[#0e131d]/90 backdrop-blur-md p-1.5 rounded-xl border border-slate-700/80 shadow-2xl">
        <button
          onClick={() => setZoom(z => Math.max(0.55, z - 0.15))}
          className="p-1.5 rounded-lg bg-[#161c28] hover:bg-[#20293a] text-slate-300 hover:text-white transition-all cursor-pointer"
          title="Отдалить карту"
        >
          <ZoomOut className="w-3.5 h-3.5" />
        </button>

        <span className="text-[11px] font-mono font-bold text-slate-300 px-1 min-w-[42px] text-center">
          {Math.round(zoom * 100)}%
        </span>

        <button
          onClick={() => setZoom(z => Math.min(2.4, z + 0.15))}
          className="p-1.5 rounded-lg bg-[#161c28] hover:bg-[#20293a] text-slate-300 hover:text-white transition-all cursor-pointer"
          title="Приблизить карту"
        >
          <ZoomIn className="w-3.5 h-3.5" />
        </button>

        <div className="h-4 w-px bg-slate-700 mx-0.5"></div>

        {/* Reset View */}
        <button
          onClick={() => { setZoom(1); centerCameraOnHero(); }}
          className="px-2 py-1 rounded-lg bg-[#161c28] hover:bg-[#20293a] text-[10px] font-mono text-slate-300 hover:text-white transition-all cursor-pointer"
          title="Сбросить масштаб на 100% и центрировать"
        >
          100%
        </button>

        {/* Center on Hero */}
        <button
          onClick={() => centerCameraOnHero()}
          className="p-1.5 rounded-lg bg-[#161c28] hover:bg-[#20293a] text-amber-400 hover:text-amber-300 transition-all cursor-pointer"
          title="Центрировать на выбранном герое"
        >
          <Crosshair className="w-3.5 h-3.5" />
        </button>

        {/* Toggle Coordinates */}
        <button
          onClick={() => setShowCoordinates(!showCoordinates)}
          className={`px-2 py-1 rounded-lg text-[10px] font-mono transition-all cursor-pointer ${
            showCoordinates ? 'bg-amber-500 text-black font-bold' : 'bg-[#161c28] text-slate-400'
          }`}
          title="Показать / скрыть координаты клеток (A-T, 1-20)"
        >
          A-T
        </button>

        {/* Toggle Range Auras */}
        <button
          onClick={() => setShowRangeAuras(!showRangeAuras)}
          className={`p-1.5 rounded-lg transition-all cursor-pointer ${
            showRangeAuras ? 'bg-cyan-600 text-white' : 'bg-[#161c28] text-slate-400'
          }`}
          title="Показать / скрыть радиусы башен и дальности атак"
        >
          <Eye className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* 2. THE DOTA MAP CANVAS (Panned & Scaled) */}
      <div 
        className="absolute transition-transform duration-75 origin-top-left"
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          width: `${MAP_TOTAL_SIZE}px`,
          height: `${MAP_TOTAL_SIZE}px`,
        }}
      >
        
        {/* Coordinate letters across Top */}
        {showCoordinates && (
          <div 
            className="absolute -top-6 left-0 right-0 flex pointer-events-none"
            style={{ width: `${MAP_TOTAL_SIZE}px` }}
          >
            {Array.from({ length: MAP_SIZE }).map((_, c) => (
              <div 
                key={c} 
                className="text-center font-mono font-bold text-[11px] text-slate-400/80"
                style={{ width: `${CELL_SIZE}px` }}
              >
                {String.fromCharCode(65 + c)}
              </div>
            ))}
          </div>
        )}

        {/* Coordinate numbers along Left */}
        {showCoordinates && (
          <div 
            className="absolute top-0 -left-6 bottom-0 flex flex-col pointer-events-none"
            style={{ height: `${MAP_TOTAL_SIZE}px` }}
          >
            {Array.from({ length: MAP_SIZE }).map((_, r) => (
              <div 
                key={r} 
                className="flex items-center justify-center font-mono font-bold text-[11px] text-slate-400/80"
                style={{ height: `${CELL_SIZE}px` }}
              >
                {r + 1}
              </div>
            ))}
          </div>
        )}

        {/* 20x20 Grid Body */}
        <div 
          className="relative grid grid-cols-20 border-2 border-[#20293a] shadow-2xl rounded-sm overflow-hidden"
          style={{ width: `${MAP_TOTAL_SIZE}px`, height: `${MAP_TOTAL_SIZE}px` }}
        >
          {grid.map((row, r) => 
            row.map((cell, c) => {
              const heroOnCell = heroPositions.find(p => p.r === r && p.c === c);
              const isSelectedHero = heroOnCell?.heroId === activeHeroId;
              
              const distToActive = activePos ? getDistance(activePos.r, activePos.c, r, c) : 999;
              const isReachable = distToActive <= (activeHero?.stats?.speed || 6);

              // Domain Expansion check
              let isInDomain = false;
              let domainType = null;
              if (activeDomain) {
                const distToDomainCenter = getDistance(r, c, activeDomain.centerR, activeDomain.centerC);
                if (distToDomainCenter <= activeDomain.radius) {
                  isInDomain = true;
                  domainType = activeDomain.type;
                }
              }

              // Tile visual theme
              let tileBg = 'bg-[#15241b]'; // Radiant Grass
              let tileBorder = 'border-[#22352a]/40';

              if (cell.type === 'dire') {
                tileBg = 'bg-[#26171e]'; // Dire scorched land
                tileBorder = 'border-[#3d2732]/40';
              } else if (cell.type === 'lane') {
                tileBg = cell.r + cell.c < 18 ? 'bg-[#3b2b35]' : 'bg-[#2b3544]'; // Lane pavers
                tileBorder = 'border-slate-600/40';
              } else if (cell.type === 'river') {
                tileBg = 'bg-[#172554]'; // Deep River
                tileBorder = 'border-blue-500/30';
              } else if (cell.type === 'tree') {
                tileBg = cell.r + cell.c < 18 ? 'bg-[#1b1218]' : 'bg-[#0f1d14]';
              } else if (cell.type === 'roshan') {
                tileBg = 'bg-[#3b0707]';
              }

              return (
                <div
                  key={`${r}-${c}`}
                  onClick={() => handleCellClick(r, c)}
                  onMouseEnter={() => setHoveredCell({ r, c })}
                  className={`relative flex items-center justify-center border ${tileBorder} ${tileBg} transition-colors ${
                    activeTargetingSkill && isReachable
                      ? 'hover:ring-2 hover:ring-amber-400 hover:bg-amber-500/20'
                      : isReachable && !heroOnCell
                      ? 'hover:bg-emerald-500/20'
                      : 'hover:bg-white/5'
                  }`}
                  style={{ width: `${CELL_SIZE}px`, height: `${CELL_SIZE}px` }}
                >
                  
                  {/* Subtle Grid Tile coordinate text */}
                  <div className="absolute top-0.5 left-1 text-[8px] font-mono text-white/10 pointer-events-none select-none">
                    {String.fromCharCode(65 + c)}{r + 1}
                  </div>

                  {/* Reachable movement area highlight */}
                  {isReachable && !heroOnCell && !activeTargetingSkill && (
                    <div className="absolute inset-0 bg-emerald-500/10 border border-emerald-400/30 pointer-events-none"></div>
                  )}

                  {/* Domain Expansion Visual Overlay */}
                  {isInDomain && domainType === 'unlimited_void' && (
                    <div className="absolute inset-0 bg-cyan-950/75 border border-cyan-400 animate-pulse pointer-events-none flex items-center justify-center">
                      <span className="text-cyan-200 text-xs">✦</span>
                    </div>
                  )}

                  {isInDomain && domainType === 'malevolent_shrine' && (
                    <div className="absolute inset-0 bg-red-950/80 border border-red-600 animate-pulse pointer-events-none flex items-center justify-center">
                      <span className="text-red-400 text-xs">🩸</span>
                    </div>
                  )}

                  {/* River water shimmer */}
                  {cell.type === 'river' && (
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-cyan-400/10 pointer-events-none animate-pulse"></div>
                  )}

                  {/* Trees */}
                  {cell.type === 'tree' && (
                    <div 
                      className={`w-7 h-7 rounded-full flex items-center justify-center pointer-events-none shadow-md ${
                        r + c < 18 ? 'bg-purple-950 border border-purple-800' : 'bg-emerald-950 border border-emerald-700'
                      }`}
                    >
                      <span className="text-sm">🌲</span>
                    </div>
                  )}

                  {/* Roshan Pit */}
                  {cell.type === 'roshan' && (
                    <div 
                      className="w-9 h-9 rounded-full bg-red-950 border-2 border-red-600 flex items-center justify-center shadow-lg shadow-red-900/60 pointer-events-none animate-pulse"
                      title="Логово Рошана (Aegis of the Immortal)"
                    >
                      <span className="text-base">👹</span>
                    </div>
                  )}

                  {/* River Runes */}
                  {cell.type === 'rune' && (
                    <div 
                      className="w-6 h-6 rounded-full bg-amber-400 border-2 border-yellow-200 animate-bounce flex items-center justify-center pointer-events-none shadow-lg shadow-amber-400/80"
                      title="Руна Реки (Двойной урон / Хаст / Реген)"
                    >
                      <span className="text-[10px] font-black text-black">◆</span>
                    </div>
                  )}

                  {/* Towers */}
                  {cell.type === 'tower_radiant' && (
                    <div 
                      className="relative w-8 h-8 rounded bg-emerald-900 border-2 border-emerald-400 flex items-center justify-center pointer-events-none shadow-xl shadow-emerald-500/50"
                      title="Башня Radiant (T1) — Дальность атаки 3 кл"
                    >
                      <span className="text-base">🗼</span>
                      {showRangeAuras && (
                        <div className="absolute w-[300px] h-[300px] rounded-full border border-emerald-500/20 bg-emerald-500/5 pointer-events-none"></div>
                      )}
                    </div>
                  )}

                  {cell.type === 'tower_dire' && (
                    <div 
                      className="relative w-8 h-8 rounded bg-rose-950 border-2 border-rose-500 flex items-center justify-center pointer-events-none shadow-xl shadow-rose-600/50"
                      title="Башня Dire (T1) — Дальность атаки 3 кл"
                    >
                      <span className="text-base">🗼</span>
                      {showRangeAuras && (
                        <div className="absolute w-[300px] h-[300px] rounded-full border border-rose-500/20 bg-rose-500/5 pointer-events-none"></div>
                      )}
                    </div>
                  )}

                  {/* Ancients */}
                  {cell.type === 'ancient_radiant' && (
                    <div 
                      className="w-10 h-10 rounded-lg bg-emerald-950 border-2 border-emerald-300 flex items-center justify-center pointer-events-none shadow-2xl"
                      title="Radiant Ancient (Древо Жизни)"
                    >
                      <span className="text-xl">💎</span>
                    </div>
                  )}

                  {cell.type === 'ancient_dire' && (
                    <div 
                      className="w-10 h-10 rounded-lg bg-red-950 border-2 border-red-500 flex items-center justify-center pointer-events-none shadow-2xl"
                      title="Dire Ancient (Ледяной Трон)"
                    >
                      <span className="text-xl">🌋</span>
                    </div>
                  )}

                  {/* HERO TOKEN ON CELL */}
                  {heroOnCell && (
                    <div 
                      className={`relative z-20 w-10 h-10 rounded-full overflow-visible transition-transform duration-150 flex items-center justify-center ${
                        isSelectedHero ? 'scale-115' : 'hover:scale-110'
                      }`}
                    >
                      {/* Active selected hero golden aura ring */}
                      {isSelectedHero && (
                        <div className="absolute -inset-1 rounded-full border-2 border-amber-400 shadow-xl shadow-amber-400/80 animate-ping opacity-60 pointer-events-none"></div>
                      )}

                      {/* Overhead indicator arrow for selected hero */}
                      {isSelectedHero && (
                        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 text-amber-400 text-[10px] font-bold pointer-events-none animate-bounce">
                          ▼
                        </div>
                      )}

                      {/* Avatar Image Frame */}
                      <div className={`w-9 h-9 rounded-full overflow-hidden border-2 bg-black shadow-md ${
                        isSelectedHero 
                          ? 'border-amber-400 ring-2 ring-amber-400/50' 
                          : heroOnCell.team === 'radiant' 
                          ? 'border-emerald-500' 
                          : 'border-red-600'
                      }`}>
                        <img 
                          src={heroes.find(h => h.id === heroOnCell.heroId)?.avatar || ''} 
                          alt={heroOnCell.heroId}
                          className="w-full h-full object-cover object-top"
                        />
                      </div>

                      {/* Overhead Health Bar */}
                      <div className="absolute -top-1 left-0 right-0 h-1 bg-black/90 rounded-full overflow-hidden border border-black/40 pointer-events-none">
                        <div 
                          className={`h-full ${
                            (heroOnCell.hpRatio || 1) > 0.5 ? 'bg-emerald-400' : (heroOnCell.hpRatio || 1) > 0.25 ? 'bg-amber-400' : 'bg-red-500'
                          }`}
                          style={{ width: `${Math.round((heroOnCell.hpRatio || 1) * 100)}%` }}
                        ></div>
                      </div>

                      {/* Team badge dot */}
                      <div className={`absolute -bottom-0.5 right-0 w-2.5 h-2.5 rounded-full border border-black shadow ${
                        heroOnCell.team === 'radiant' ? 'bg-emerald-500' : 'bg-red-600'
                      }`}></div>
                    </div>
                  )}

                </div>
              );
            })
          )}
        </div>

        {/* 3. VISUAL FLYING PROJECTILES LAYER */}
        {projectiles.map(p => {
          const fromX = (p.fromC + 0.5) * CELL_SIZE;
          const fromY = (p.fromR + 0.5) * CELL_SIZE;
          const toX = (p.toC + 0.5) * CELL_SIZE;
          const toY = (p.toR + 0.5) * CELL_SIZE;

          return (
            <svg 
              key={p.id}
              className="absolute inset-0 pointer-events-none z-30 overflow-visible"
              style={{ width: `${MAP_TOTAL_SIZE}px`, height: `${MAP_TOTAL_SIZE}px` }}
            >
              <defs>
                <linearGradient id={`grad-${p.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor={p.color} stopOpacity="0.2" />
                  <stop offset="100%" stopColor={p.color} stopOpacity="1" />
                </linearGradient>
              </defs>
              <line 
                x1={fromX} 
                y1={fromY} 
                x2={toX} 
                y2={toY} 
                stroke={`url(#grad-${p.id})`}
                strokeWidth={p.type === 'purple' ? "8" : "4"}
                strokeDasharray={p.type === 'hook' ? "6,4" : "none"}
                className="animate-pulse"
              />
              <circle cx={toX} cy={toY} r="9" fill={p.color} className="animate-ping" />
            </svg>
          );
        })}

        {/* 4. FLOATING COMBAT TEXTS LAYER */}
        {floatingTexts.map(f => {
          const fx = (f.c + 0.5) * CELL_SIZE;
          const fy = (f.r + 0.2) * CELL_SIZE;

          return (
            <div 
              key={f.id}
              className="absolute z-40 font-mono font-black text-xs sm:text-sm whitespace-nowrap pointer-events-none drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] animate-bounce"
              style={{
                left: `${fx}px`,
                top: `${fy}px`,
                transform: 'translate(-50%, -100%)',
                color: f.color
              }}
            >
              {f.text}
            </div>
          );
        })}

      </div>

      {/* 5. ACTIVE TARGETING CURSOR OVERLAY BANNER */}
      {activeTargetingSkill && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-40 bg-amber-500/90 text-black px-4 py-1.5 rounded-full font-mono text-xs font-bold shadow-2xl flex items-center gap-2 animate-pulse pointer-events-none">
          <Crosshair className="w-4 h-4" />
          <span>Кликните на цель или клетку для «{activeTargetingSkill.name}» (Дальность: {activeTargetingSkill.range || 10})</span>
        </div>
      )}

    </div>
  );
}
