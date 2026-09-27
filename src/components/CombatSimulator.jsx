import React, { useState, useEffect, useRef } from 'react';
import { 
  Swords, Shield, Heart, Zap, RotateCcw, Play, CheckCircle2, 
  AlertCircle, Sparkles, ChevronRight, User, Skull, Trophy
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { 
  playAttackSound, playCritSound, playSpellSound, 
  playDiceSound, playClickSound 
} from '../utils/sound';

export default function CombatSimulator({ heroes, preselectedHero }) {
  // Select hero 1 and hero 2
  const [hero1Id, setHero1Id] = useState(preselectedHero?.id || 'axe');
  const [hero2Id, setHero2Id] = useState(hero1Id === 'pudge' ? 'monesy' : 'pudge');

  const hero1Base = heroes.find(h => h.id === hero1Id) || heroes[0];
  const hero2Base = heroes.find(h => h.id === hero2Id) || heroes[1];

  // Battle State
  const [round, setRound] = useState(1);
  const [activeFighter, setActiveFighter] = useState(1); // 1 or 2
  const [winner, setWinner] = useState(null);

  // Fighter 1 runtime stats
  const [f1, setF1] = useState({
    hp: hero1Base.stats.hp,
    maxHp: hero1Base.stats.hp,
    mana: typeof hero1Base.stats.mana === 'number' ? hero1Base.stats.mana : 8,
    maxMana: typeof hero1Base.stats.mana === 'number' ? hero1Base.stats.mana : 8,
    armor: hero1Base.stats.armor,
    rotActive: false,
    invulnerable: false,
    stunned: false,
    taunted: false,
    noScope: false,
    fullFocus: false
  });

  // Fighter 2 runtime stats
  const [f2, setF2] = useState({
    hp: hero2Base.stats.hp,
    maxHp: hero2Base.stats.hp,
    mana: typeof hero2Base.stats.mana === 'number' ? hero2Base.stats.mana : 8,
    maxMana: typeof hero2Base.stats.mana === 'number' ? hero2Base.stats.mana : 8,
    armor: hero2Base.stats.armor,
    rotActive: false,
    invulnerable: false,
    stunned: false,
    taunted: false,
    noScope: false,
    fullFocus: false
  });

  const [combatLog, setCombatLog] = useState([
    { id: 1, text: `⚔️ Бой начинается! Раунд 1: ${hero1Base.name} против ${hero2Base.name}.`, type: 'info' }
  ]);

  const logEndRef = useRef(null);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [combatLog]);

  // Reset Battle when fighters change
  const resetBattle = (newH1 = hero1Base, newH2 = hero2Base) => {
    setRound(1);
    setActiveFighter(1);
    setWinner(null);
    setF1({
      hp: newH1.stats.hp,
      maxHp: newH1.stats.hp,
      mana: typeof newH1.stats.mana === 'number' ? newH1.stats.mana : 8,
      maxMana: typeof newH1.stats.mana === 'number' ? newH1.stats.mana : 8,
      armor: newH1.stats.armor,
      rotActive: false,
      invulnerable: false,
      stunned: false,
      taunted: false,
      noScope: false,
      fullFocus: false
    });
    setF2({
      hp: newH2.stats.hp,
      maxHp: newH2.stats.hp,
      mana: typeof newH2.stats.mana === 'number' ? newH2.stats.mana : 8,
      maxMana: typeof newH2.stats.mana === 'number' ? newH2.stats.mana : 8,
      armor: newH2.stats.armor,
      rotActive: false,
      invulnerable: false,
      stunned: false,
      taunted: false,
      noScope: false,
      fullFocus: false
    });
    setCombatLog([
      { id: Date.now(), text: `🔄 Поединок перезапущен: ${newH1.name} против ${newH2.name}. Время: 8 секунд на ход.`, type: 'info' }
    ]);
  };

  const addLog = (text, type = 'normal') => {
    setCombatLog(prev => [...prev, { id: Date.now() + Math.random(), text, type }]);
  };

  // Helper for dealing damage with armor & penetration
  const applyDamage = (attackerHero, attackerState, defenderState, setDefenderState, baseDamage, penetration, isCrit = false) => {
    if (defenderState.invulnerable) {
      addLog(`🛡️ Защитник неуязвим благодаря Mastermind! Урон полностью поглощен.`, 'info');
      return 0;
    }

    const effectiveArmor = Math.max(0, defenderState.armor - penetration);
    const finalDamage = Math.max(1, baseDamage - effectiveArmor);
    const newHp = Math.max(0, defenderState.hp - finalDamage);

    setDefenderState(prev => ({ ...prev, hp: newHp }));

    if (isCrit) {
      playCritSound();
      addLog(`💥 КРИТИЧЕСКИЙ УДАР! Нанесено ${finalDamage} урона (Броня цели поглотила: ${effectiveArmor}). У цели осталось ${newHp} HP.`, 'crit');
    } else {
      playAttackSound();
      addLog(`🗡️ Удар нанес ${finalDamage} урона (Поглощено броней: ${effectiveArmor}). У цели осталось ${newHp} HP.`, 'damage');
    }

    if (newHp === 0) {
      handleVictory(attackerHero);
    }

    return finalDamage;
  };

  const handleVictory = (victor) => {
    setWinner(victor.name);
    addLog(`🏆 ${victor.name} ОДЕРЖИВАЕТ ПОБЕДУ В ПОЕДИНКЕ!`, 'victory');
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
  };

  // End current fighter's turn (recovers mana/hp, ticks effects)
  const endTurn = () => {
    playClickSound();
    
    // Process passives/regens
    if (activeFighter === 1) {
      // Switch to 2
      setActiveFighter(2);
      addLog(`⏳ Ход переходит к ${hero2Base.name} (секундомер: ход ${round}).`, 'info');
    } else {
      // End round (8 seconds passed)
      setRound(r => r + 1);
      setActiveFighter(1);
      
      // Rot damage tick if active
      if (f1.rotActive) {
        setF1(prev => ({ ...prev, hp: Math.max(0, prev.hp - 10) }));
        setF2(prev => ({ ...prev, hp: Math.max(0, prev.hp - 30) }));
        addLog(`☣️ Аура Rot отнимает 10 HP у Пуджа и 30 HP у противника!`, 'damage');
      }
      if (f2.rotActive) {
        setF2(prev => ({ ...prev, hp: Math.max(0, prev.hp - 10) }));
        setF1(prev => ({ ...prev, hp: Math.max(0, prev.hp - 30) }));
        addLog(`☣️ Аура Rot отнимает 10 HP у Пуджа и 30 HP у противника!`, 'damage');
      }

      // Regen
      setF1(prev => ({
        ...prev,
        hp: Math.min(prev.maxHp, prev.hp + (hero1Base.id === 'pudge' || hero1Base.id === 'wesker' ? 5 : 1)),
        mana: Math.min(prev.maxMana, prev.mana + (typeof hero1Base.stats.mana === 'number' ? 10 : 1))
      }));

      setF2(prev => ({
        ...prev,
        hp: Math.min(prev.maxHp, prev.hp + (hero2Base.id === 'pudge' || hero2Base.id === 'wesker' ? 5 : 1)),
        mana: Math.min(prev.maxMana, prev.mana + (typeof hero2Base.stats.mana === 'number' ? 10 : 1))
      }));

      addLog(`⏱️ Прошло 8 секунд (1 полный ход). Сработала регенерация HP и маны. Начинается Раунд ${round + 1}.`, 'info');
    }
  };

  // Basic Attack Action
  const performBasicAttack = () => {
    const isP1 = activeFighter === 1;
    const attackerHero = isP1 ? hero1Base : hero2Base;
    const attackerState = isP1 ? f1 : f2;
    const defenderHero = isP1 ? hero2Base : hero1Base;
    const defenderState = isP1 ? f2 : f1;
    const setDefenderState = isP1 ? setF2 : setF1;

    playDiceSound();

    // Roll d100
    const roll = Math.floor(Math.random() * 100) + 1;
    let accuracy = attackerHero.stats.accuracy || (attackerHero.stats.melee ? attackerHero.stats.melee.accuracy : 50);
    
    // M0nesy scope adjustments
    if (attackerHero.id === 'monesy' && attackerState.noScope) {
      accuracy = 10;
    }
    if (attackerHero.id === 'monesy' && attackerState.fullFocus) {
      accuracy += 20;
    }

    addLog(`🎲 ${attackerHero.name} бросает d100 на попадание: выпало ${roll} (Требуется ≤ ${accuracy}).`, 'roll');

    if (roll <= accuracy) {
      // Hit! Check crit
      let critChance = 10;
      if (attackerHero.id === 'monesy') critChance = 35; // Headshot passive
      const critRoll = Math.floor(Math.random() * 100) + 1;
      const isCrit = critRoll <= critChance;

      let damage = isCrit 
        ? (attackerHero.stats.crit || (attackerHero.stats.melee ? attackerHero.stats.melee.crit : 90))
        : (attackerHero.stats.damage || (attackerHero.stats.melee ? attackerHero.stats.melee.damage : 50));

      if (attackerHero.id === 'monesy' && attackerState.noScope) {
        damage *= 2; // No-scope doubles damage!
      }

      const pen = attackerHero.stats.penetration || (attackerHero.stats.melee ? attackerHero.stats.melee.penetration : 10);
      applyDamage(attackerHero, attackerState, defenderState, setDefenderState, damage, pen, isCrit);

      // Check Axe Counter Helix passive
      if (defenderHero.id === 'axe' && !defenderState.invulnerable) {
        addLog(`🪓 Counter Helix: Акс контратакует круговым ударом секиры на 100 урона!`, 'crit');
        applyDamage(defenderHero, defenderState, attackerState, isP1 ? setF1 : setF2, 100, 15);
      }
    } else {
      addLog(`💨 Промах! Атака ${attackerHero.name} рассекла воздух.`, 'info');
    }

    // Auto end turn after action
    setTimeout(() => {
      endTurn();
    }, 600);
  };

  // Perform Special Skill
  const castSkill = (skillIndex) => {
    const isP1 = activeFighter === 1;
    const attackerHero = isP1 ? hero1Base : hero2Base;
    const attackerState = isP1 ? f1 : f2;
    const setAttackerState = isP1 ? setF1 : setF2;
    const defenderHero = isP1 ? hero2Base : hero1Base;
    const defenderState = isP1 ? f2 : f1;
    const setDefenderState = isP1 ? setF2 : setF1;

    playSpellSound();

    if (attackerHero.id === 'axe') {
      if (skillIndex === 0) {
        // Berserks call
        setDefenderState(p => ({ ...p, taunted: true }));
        addLog(`📢 Акс издает Berserks Call! Противник спровоцирован и атакует только его!`, 'skill');
      } else if (skillIndex === 1) {
        // Battle hunger
        applyDamage(attackerHero, attackerState, defenderState, setDefenderState, 25, 5);
        addLog(`🔥 Акс накладывает метку Battle Hunger (25 периодического урона + замедление)!`, 'skill');
      } else if (skillIndex === 3) {
        // Culling blade
        if (defenderState.hp <= 150) {
          addLog(`🪓 КАЗНЬ! Calling Blade наносит 150 чистейшего летального урона!`, 'crit');
          setDefenderState(p => ({ ...p, hp: 0 }));
          handleVictory(attackerHero);
        } else {
          applyDamage(attackerHero, attackerState, defenderState, setDefenderState, 150, 99);
          addLog(`🪓 Calling Blade наносит 150 чистого урона цели!`, 'skill');
        }
      }
    } else if (attackerHero.id === 'pudge') {
      if (skillIndex === 0) {
        // Meat hook
        playDiceSound();
        const roll = Math.floor(Math.random() * 100) + 1;
        if (roll <= 50) {
          applyDamage(attackerHero, attackerState, defenderState, setDefenderState, 100, 15);
          addLog(`🪝 ТОЧНЫЙ ХУК! Пудж притягивает соперника крюком и наносит 100 урона!`, 'crit');
        } else {
          addLog(`🪝 Хук Пуджа пролетел мимо цели!`, 'info');
        }
      } else if (skillIndex === 1) {
        // Rot toggle
        setAttackerState(p => ({ ...p, rotActive: !p.rotActive }));
        addLog(`☣️ Пудж переключил ауру Rot (${!attackerState.rotActive ? 'ВКЛ' : 'ВЫКЛ'})!`, 'skill');
      } else if (skillIndex === 4) {
        // Dismember
        applyDamage(attackerHero, attackerState, defenderState, setDefenderState, 150, 15);
        const heal = Math.round(150 * 0.75);
        setAttackerState(p => ({ ...p, hp: Math.min(p.maxHp, p.hp + heal) }));
        addLog(`🥩 DISMEMBER! Пудж пожирает врага, нанося 150 урона и исцеляя себе ${heal} HP! Противник парализован!`, 'crit');
      }
    } else if (attackerHero.id === 'wesker') {
      if (skillIndex === 3) {
        // Mastermind
        setAttackerState(p => ({ ...p, invulnerable: true }));
        addLog(`🕶️ Вескер активирует Mastermind! Полная неуязвимость на 8 секунд и двойная скорость!`, 'crit');
      } else {
        applyDamage(attackerHero, attackerState, defenderState, setDefenderState, 60, 15);
        addLog(`☣️ Вескер наносит удар Уробороса на 60 урона!`, 'skill');
      }
    } else if (attackerHero.id === 'monesy') {
      if (skillIndex === 0) {
        // Scope toggle
        setAttackerState(p => ({ ...p, noScope: !p.noScope }));
        addLog(`🎯 Монеси переключил режим: ${!attackerState.noScope ? 'No-Scope (х2 урон, 10% меткость)' : 'Зум (стандарт)'}!`, 'skill');
      } else if (skillIndex === 5) {
        // One Way ult
        applyDamage(attackerHero, attackerState, defenderState, setDefenderState, 315, 30, true);
        addLog(`💨 ONE WAY! Монеси гарантированно ваншотит через дым: 315 КРИТИЧЕСКОГО УРОНА!`, 'crit');
      } else {
        setAttackerState(p => ({ ...p, fullFocus: true }));
        addLog(`🎯 Монеси активирует Full Focus (+20 к попаданию)!`, 'skill');
      }
    } else if (attackerHero.id === 'minos') {
      if (skillIndex === 6) {
        // Judgement
        applyDamage(attackerHero, attackerState, defenderState, setDefenderState, 130, 20, true);
        addLog(`⚡ JUDGEMENT! Минос Прайм влетает в противника на 130 сокрушительного урона!`, 'crit');
      } else {
        applyDamage(attackerHero, attackerState, defenderState, setDefenderState, 70, 10);
        addLog(`👊 Минос проводит комбо Prepare Thyself на 70 урона!`, 'skill');
      }
    }

    setTimeout(() => {
      endTurn();
    }, 700);
  };

  return (
    <div className="space-y-6">
      
      {/* Title & Fighters Selector */}
      <div className="p-5 rounded-2xl bg-[#121722] border border-amber-900/30 flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="font-fantasy text-xl sm:text-2xl font-black text-amber-200 flex items-center gap-2">
            <Swords className="w-6 h-6 text-red-500" />
            Боевая Арена & Тактический Симулятор
          </h2>
          <p className="text-xs text-slate-400">
            Тестирование механик настольной игры: бросок d100 на меткость, расчет брони, криты и способности!
          </p>
        </div>

        {/* Fighter Selectors */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Боец 1:</span>
            <select
              value={hero1Id}
              onChange={(e) => {
                const id = e.target.value;
                setHero1Id(id);
                const h1 = heroes.find(h => h.id === id);
                resetBattle(h1, hero2Base);
              }}
              className="bg-slate-900 border border-slate-700 text-xs text-slate-200 px-3 py-1.5 rounded-lg font-medium"
            >
              {heroes.map(h => (
                <option key={h.id} value={h.id} disabled={h.id === hero2Id}>
                  {h.name}
                </option>
              ))}
            </select>
          </div>

          <span className="text-sm font-bold text-red-500 font-mono">VS</span>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Боец 2:</span>
            <select
              value={hero2Id}
              onChange={(e) => {
                const id = e.target.value;
                setHero2Id(id);
                const h2 = heroes.find(h => h.id === id);
                resetBattle(hero1Base, h2);
              }}
              className="bg-slate-900 border border-slate-700 text-xs text-slate-200 px-3 py-1.5 rounded-lg font-medium"
            >
              {heroes.map(h => (
                <option key={h.id} value={h.id} disabled={h.id === hero1Id}>
                  {h.name}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => resetBattle()}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
            title="Сбросить бой"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Сброс</span>
          </button>
        </div>
      </div>

      {/* Duel Arena Arena Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Fighter 1 Card & Controls */}
        <div className={`lg:col-span-4 p-5 rounded-2xl border transition-all ${
          activeFighter === 1 
            ? 'bg-gradient-to-b from-[#181f2c] to-[#121620] border-amber-500/70 shadow-xl shadow-amber-900/20 ring-2 ring-amber-500/30' 
            : 'bg-[#10141d] border-slate-800 opacity-80'
        }`}>
          <div className="flex items-center gap-3 mb-4">
            <img 
              src={hero1Base.avatar} 
              alt={hero1Base.name} 
              className="w-16 h-16 rounded-xl object-cover border-2 border-amber-500/40"
            />
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] uppercase font-bold text-amber-400">
                  {hero1Base.universe}
                </span>
                {activeFighter === 1 && (
                  <span className="text-[9px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-1.5 py-0.5 rounded font-mono animate-pulse">
                    ХОДИТ СЕЙЧАС
                  </span>
                )}
              </div>
              <h3 className="font-fantasy text-xl font-bold text-white">
                {hero1Base.name}
              </h3>
              <p className="text-xs text-slate-400">{hero1Base.dndRole}</p>
            </div>
          </div>

          {/* Health & Mana Bars */}
          <div className="space-y-2 mb-4 font-mono text-xs">
            <div>
              <div className="flex justify-between text-slate-300 mb-1">
                <span className="flex items-center gap-1 text-emerald-400">
                  <Heart className="w-3.5 h-3.5" /> HP
                </span>
                <span className="font-bold">{f1.hp} / {f1.maxHp}</span>
              </div>
              <div className="w-full h-3 bg-slate-900 rounded-full overflow-hidden border border-slate-700">
                <div 
                  className="h-full bg-gradient-to-r from-emerald-600 to-green-400 transition-all duration-300"
                  style={{ width: `${(f1.hp / f1.maxHp) * 100}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-slate-300 mb-1">
                <span className="flex items-center gap-1 text-blue-400">
                  <Zap className="w-3.5 h-3.5" /> Мана
                </span>
                <span className="font-bold">{f1.mana} / {f1.maxMana}</span>
              </div>
              <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-700">
                <div 
                  className="h-full bg-gradient-to-r from-blue-600 to-cyan-400 transition-all duration-300"
                  style={{ width: `${(f1.mana / f1.maxMana) * 100}%` }}
                />
              </div>
            </div>
          </div>

          {/* Stats Badges */}
          <div className="grid grid-cols-3 gap-2 text-center text-xs font-mono bg-black/40 p-2.5 rounded-xl border border-slate-800 mb-4">
            <div>
              <div className="text-[10px] text-slate-400">Броня</div>
              <div className="font-bold text-purple-300">{f1.armor}</div>
            </div>
            <div>
              <div className="text-[10px] text-slate-400">Урон</div>
              <div className="font-bold text-rose-300">
                {hero1Base.stats.damage || hero1Base.stats.melee?.damage}
              </div>
            </div>
            <div>
              <div className="text-[10px] text-slate-400">Меткость</div>
              <div className="font-bold text-cyan-300">
                {hero1Base.stats.accuracy || hero1Base.stats.melee?.accuracy}%
              </div>
            </div>
          </div>

          {/* Turn Actions (Enabled only when active) */}
          <div className="space-y-2">
            <button
              disabled={activeFighter !== 1 || winner}
              onClick={performBasicAttack}
              className={`w-full py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all ${
                activeFighter === 1 && !winner
                  ? 'bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white shadow-lg shadow-rose-900/40 cursor-pointer'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed'
              }`}
            >
              <Swords className="w-4 h-4" />
              <span>Базовый Удар (d100 меткость)</span>
            </button>

            {/* Quick Skills */}
            <div className="grid grid-cols-2 gap-2">
              {hero1Base.skills.slice(0, 2).map((s, idx) => (
                <button
                  key={s.id}
                  disabled={activeFighter !== 1 || winner}
                  onClick={() => castSkill(idx)}
                  className={`p-2 rounded-lg text-xs font-semibold truncate transition-all ${
                    activeFighter === 1 && !winner
                      ? 'bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700'
                      : 'bg-slate-900 text-slate-600 border border-slate-800 cursor-not-allowed'
                  }`}
                  title={s.description}
                >
                  ⚡ {s.name}
                </button>
              ))}
            </div>

            {/* Ultimate */}
            {hero1Base.skills.find(s => s.isUltimate) && (
              <button
                disabled={activeFighter !== 1 || winner}
                onClick={() => castSkill(hero1Base.skills.length - 1)}
                className={`w-full py-2 px-3 rounded-lg text-xs font-bold transition-all border ${
                  activeFighter === 1 && !winner
                    ? 'bg-amber-950/60 hover:bg-amber-900/70 text-amber-200 border-amber-500/50 shadow-sm'
                    : 'bg-slate-900 text-slate-600 border-slate-800 cursor-not-allowed'
                }`}
              >
                ★ УЛЬТИМЕЙТ: {hero1Base.skills.find(s => s.isUltimate)?.name}
              </button>
            )}

            <button
              disabled={activeFighter !== 1 || winner}
              onClick={endTurn}
              className={`w-full py-1.5 px-3 rounded-lg text-xs font-medium transition-all ${
                activeFighter === 1 && !winner
                  ? 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                  : 'bg-slate-900 text-slate-600 cursor-not-allowed'
              }`}
            >
              Пропустить / Завершить ход
            </button>
          </div>
        </div>

        {/* Center: Battle Monitor & Log */}
        <div className="lg:col-span-4 space-y-4">
          
          {/* Round Indicator */}
          <div className="p-4 rounded-2xl bg-[#0c1017] border border-amber-950/60 text-center">
            <span className="text-[10px] uppercase tracking-widest text-slate-400 font-mono">
              ВРЕМЯ БОЯ (8 СЕК = 1 ХОД)
            </span>
            <div className="font-fantasy text-2xl font-black text-amber-400 mt-0.5">
              РАУНД {round}
            </div>
            <div className="text-xs text-slate-400 font-mono">
              Суммарно прошло: {(round - 1) * 8} секунд
            </div>
          </div>

          {/* Winner Banner */}
          {winner && (
            <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-600 to-red-600 text-white text-center shadow-xl animate-bounce">
              <Trophy className="w-8 h-8 mx-auto mb-1 text-amber-200" />
              <div className="font-fantasy font-black text-lg">ПОБЕДИТЕЛЬ: {winner}!</div>
              <p className="text-xs opacity-90">Славная битва на просторах настольной арены!</p>
              <button
                onClick={() => resetBattle()}
                className="mt-2 px-4 py-1.5 rounded-lg bg-black/40 hover:bg-black/60 text-xs font-bold transition-colors"
              >
                Начать новую дуэль
              </button>
            </div>
          )}

          {/* Tabletop Combat Log */}
          <div className="p-4 rounded-2xl bg-[#0a0e14] border border-slate-800 flex flex-col h-[320px]">
            <div className="text-xs uppercase font-mono text-slate-400 pb-2 border-b border-slate-800/80 flex items-center justify-between">
              <span>Лог сражения:</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            </div>
            <div className="flex-1 overflow-y-auto space-y-2 pt-2 text-xs font-mono pr-1">
              {combatLog.map((log) => (
                <div 
                  key={log.id} 
                  className={`p-2 rounded-lg leading-relaxed ${
                    log.type === 'crit' 
                      ? 'bg-amber-950/60 text-amber-300 border border-amber-700/50 font-bold'
                      : log.type === 'damage'
                      ? 'bg-red-950/40 text-red-300 border border-red-900/30'
                      : log.type === 'skill'
                      ? 'bg-blue-950/40 text-blue-300 border border-blue-900/30'
                      : log.type === 'victory'
                      ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-700/50 font-bold'
                      : 'bg-slate-900/60 text-slate-300'
                  }`}
                >
                  {log.text}
                </div>
              ))}
              <div ref={logEndRef} />
            </div>
          </div>
        </div>

        {/* Fighter 2 Card & Controls */}
        <div className={`lg:col-span-4 p-5 rounded-2xl border transition-all ${
          activeFighter === 2 
            ? 'bg-gradient-to-b from-[#181f2c] to-[#121620] border-amber-500/70 shadow-xl shadow-amber-900/20 ring-2 ring-amber-500/30' 
            : 'bg-[#10141d] border-slate-800 opacity-80'
        }`}>
          <div className="flex items-center gap-3 mb-4">
            <img 
              src={hero2Base.avatar} 
              alt={hero2Base.name} 
              className="w-16 h-16 rounded-xl object-cover border-2 border-amber-500/40"
            />
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] uppercase font-bold text-amber-400">
                  {hero2Base.universe}
                </span>
                {activeFighter === 2 && (
                  <span className="text-[9px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-1.5 py-0.5 rounded font-mono animate-pulse">
                    ХОДИТ СЕЙЧАС
                  </span>
                )}
              </div>
              <h3 className="font-fantasy text-xl font-bold text-white">
                {hero2Base.name}
              </h3>
              <p className="text-xs text-slate-400">{hero2Base.dndRole}</p>
            </div>
          </div>

          {/* Health & Mana Bars */}
          <div className="space-y-2 mb-4 font-mono text-xs">
            <div>
              <div className="flex justify-between text-slate-300 mb-1">
                <span className="flex items-center gap-1 text-emerald-400">
                  <Heart className="w-3.5 h-3.5" /> HP
                </span>
                <span className="font-bold">{f2.hp} / {f2.maxHp}</span>
              </div>
              <div className="w-full h-3 bg-slate-900 rounded-full overflow-hidden border border-slate-700">
                <div 
                  className="h-full bg-gradient-to-r from-emerald-600 to-green-400 transition-all duration-300"
                  style={{ width: `${(f2.hp / f2.maxHp) * 100}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-slate-300 mb-1">
                <span className="flex items-center gap-1 text-blue-400">
                  <Zap className="w-3.5 h-3.5" /> Мана
                </span>
                <span className="font-bold">{f2.mana} / {f2.maxMana}</span>
              </div>
              <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-700">
                <div 
                  className="h-full bg-gradient-to-r from-blue-600 to-cyan-400 transition-all duration-300"
                  style={{ width: `${(f2.mana / f2.maxMana) * 100}%` }}
                />
              </div>
            </div>
          </div>

          {/* Stats Badges */}
          <div className="grid grid-cols-3 gap-2 text-center text-xs font-mono bg-black/40 p-2.5 rounded-xl border border-slate-800 mb-4">
            <div>
              <div className="text-[10px] text-slate-400">Броня</div>
              <div className="font-bold text-purple-300">{f2.armor}</div>
            </div>
            <div>
              <div className="text-[10px] text-slate-400">Урон</div>
              <div className="font-bold text-rose-300">
                {hero2Base.stats.damage || hero2Base.stats.melee?.damage}
              </div>
            </div>
            <div>
              <div className="text-[10px] text-slate-400">Меткость</div>
              <div className="font-bold text-cyan-300">
                {hero2Base.stats.accuracy || hero2Base.stats.melee?.accuracy}%
              </div>
            </div>
          </div>

          {/* Turn Actions (Enabled only when active) */}
          <div className="space-y-2">
            <button
              disabled={activeFighter !== 2 || winner}
              onClick={performBasicAttack}
              className={`w-full py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all ${
                activeFighter === 2 && !winner
                  ? 'bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white shadow-lg shadow-rose-900/40 cursor-pointer'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed'
              }`}
            >
              <Swords className="w-4 h-4" />
              <span>Базовый Удар (d100 меткость)</span>
            </button>

            {/* Quick Skills */}
            <div className="grid grid-cols-2 gap-2">
              {hero2Base.skills.slice(0, 2).map((s, idx) => (
                <button
                  key={s.id}
                  disabled={activeFighter !== 2 || winner}
                  onClick={() => castSkill(idx)}
                  className={`p-2 rounded-lg text-xs font-semibold truncate transition-all ${
                    activeFighter === 2 && !winner
                      ? 'bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700'
                      : 'bg-slate-900 text-slate-600 border border-slate-800 cursor-not-allowed'
                  }`}
                  title={s.description}
                >
                  ⚡ {s.name}
                </button>
              ))}
            </div>

            {/* Ultimate */}
            {hero2Base.skills.find(s => s.isUltimate) && (
              <button
                disabled={activeFighter !== 2 || winner}
                onClick={() => castSkill(hero2Base.skills.length - 1)}
                className={`w-full py-2 px-3 rounded-lg text-xs font-bold transition-all border ${
                  activeFighter === 2 && !winner
                    ? 'bg-amber-950/60 hover:bg-amber-900/70 text-amber-200 border-amber-500/50 shadow-sm'
                    : 'bg-slate-900 text-slate-600 border-slate-800 cursor-not-allowed'
                }`}
              >
                ★ УЛЬТИМЕЙТ: {hero2Base.skills.find(s => s.isUltimate)?.name}
              </button>
            )}

            <button
              disabled={activeFighter !== 2 || winner}
              onClick={endTurn}
              className={`w-full py-1.5 px-3 rounded-lg text-xs font-medium transition-all ${
                activeFighter === 2 && !winner
                  ? 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                  : 'bg-slate-900 text-slate-600 cursor-not-allowed'
              }`}
            >
              Пропустить / Завершить ход
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
